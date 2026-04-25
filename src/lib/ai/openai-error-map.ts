import "server-only";
import {
  APIError,
  APIConnectionError,
  APIConnectionTimeoutError,
  AuthenticationError
} from "openai";

/** Thrown from `answerBusinessQuestion`; the assistant route maps this to JSON + HTTP status. */
export class OpenAiRouteError extends Error {
  readonly httpStatus: number;

  constructor(httpStatus: number, message: string, options?: { cause?: unknown }) {
    super(message, options?.cause !== undefined ? { cause: options.cause } : undefined);
    this.name = "OpenAiRouteError";
    this.httpStatus = httpStatus;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

const BY_CODE: Record<string, { status: number; message: string }> = {
  insufficient_quota: {
    status: 402,
    message: "AI credits or quota are exhausted. Add billing or wait for your limit to reset."
  },
  rate_limit_exceeded: {
    status: 429,
    message: "Too many AI requests. Please wait a moment and try again."
  },
  invalid_api_key: {
    status: 502,
    message: "The AI service rejected the server credentials. Check the API key configuration."
  },
  incorrect_api_key: {
    status: 502,
    message: "The AI service rejected the server credentials. Check the API key configuration."
  },
  model_not_found: {
    status: 400,
    message: "The configured AI model is not available for this project. Check OPENAI_MODEL."
  }
};

function resolveErrorIdentifier(err: APIError): string | undefined {
  if (typeof err.code === "string" && err.code.length > 0) return err.code;
  if (typeof err.type === "string" && err.type.length > 0) return err.type;
  const body = err.error;
  if (body && typeof body === "object" && "code" in body) {
    const c = (body as { code?: unknown }).code;
    if (typeof c === "string" && c.length > 0) return c;
  }
  if (body && typeof body === "object" && "type" in body) {
    const t = (body as { type?: unknown }).type;
    if (typeof t === "string" && t.length > 0) return t;
  }
  return undefined;
}

/** Logs full error server-side only (may include upstream details); never send to the client. */
export function logOpenAiSdkError(scope: string, err: unknown): void {
  console.error(`[openai] ${scope}`, err);
}

export function mapOpenAiSdkErrorToRouteError(err: unknown): OpenAiRouteError {
  if (err instanceof APIConnectionError || err instanceof APIConnectionTimeoutError) {
    return new OpenAiRouteError(
      503,
      "Could not reach the AI service. Check your network and try again.",
      { cause: err }
    );
  }

  if (err instanceof AuthenticationError) {
    const byCode = BY_CODE.invalid_api_key;
    return new OpenAiRouteError(byCode.status, byCode.message, { cause: err });
  }

  if (err instanceof APIError) {
    const id = resolveErrorIdentifier(err);
    if (id && BY_CODE[id]) {
      const m = BY_CODE[id];
      return new OpenAiRouteError(m.status, m.message, { cause: err });
    }

    const status = err.status;
    if (status === 401) {
      const m = BY_CODE.invalid_api_key;
      return new OpenAiRouteError(m.status, m.message, { cause: err });
    }
    if (status === 429) {
      const m = BY_CODE.rate_limit_exceeded;
      return new OpenAiRouteError(m.status, m.message, { cause: err });
    }
    if (status === 404) {
      const m = BY_CODE.model_not_found;
      return new OpenAiRouteError(m.status, m.message, { cause: err });
    }
    if (status === 400) {
      const msg = typeof err.message === "string" ? err.message.toLowerCase() : "";
      if (msg.includes("model") && (msg.includes("not found") || msg.includes("does not exist"))) {
        const m = BY_CODE.model_not_found;
        return new OpenAiRouteError(m.status, m.message, { cause: err });
      }
    }

    return new OpenAiRouteError(
      502,
      "The AI service returned an error. Please try again later.",
      { cause: err }
    );
  }

  return new OpenAiRouteError(500, "Could not get an answer. Please try again.", { cause: err });
}
