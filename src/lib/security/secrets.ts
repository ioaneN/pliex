import "server-only";
import crypto from "crypto";
import { serverEnv } from "@/lib/utils/env";

const PREFIX = "v1";

function key(): Buffer {
  if (!serverEnv.appEncryptionKey) {
    throw new Error("APP_ENCRYPTION_KEY is required to store integration tokens.");
  }
  return crypto.createHash("sha256").update(serverEnv.appEncryptionKey).digest();
}

export function encryptSecret(plain: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key(), iv);
  const encrypted = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [PREFIX, iv.toString("base64url"), tag.toString("base64url"), encrypted.toString("base64url")].join(":");
}

export function decryptSecret(value: string): string {
  const [prefix, ivRaw, tagRaw, encryptedRaw] = value.split(":");
  if (prefix !== PREFIX || !ivRaw || !tagRaw || !encryptedRaw) {
    throw new Error("Stored secret is not in a supported encrypted format.");
  }
  const decipher = crypto.createDecipheriv("aes-256-gcm", key(), Buffer.from(ivRaw, "base64url"));
  decipher.setAuthTag(Buffer.from(tagRaw, "base64url"));
  return Buffer.concat([
    decipher.update(Buffer.from(encryptedRaw, "base64url")),
    decipher.final()
  ]).toString("utf8");
}

export function redact(value: unknown): string {
  if (typeof value !== "string" || value.length < 8) return "[redacted]";
  return `${value.slice(0, 4)}…${value.slice(-4)}`;
}
