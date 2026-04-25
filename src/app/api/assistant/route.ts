import { NextResponse } from "next/server";
import { assistantQuestionSchema } from "@/lib/validation/schemas";
import { getCurrentUser } from "@/lib/supabase/get-current-user";
import { getOwnedBusiness } from "@/lib/services/businesses";
import { buildBusinessSnapshot } from "@/lib/services/business-snapshot";
import { appendMessage, listRecentConversation } from "@/lib/services/conversation";
import { answerBusinessQuestion } from "@/lib/ai/assistant";
import { OpenAiRouteError } from "@/lib/ai/openai-error-map";

export const runtime = "nodejs";

/** Recent chat messages for bootstrapping the assistant UI (e.g. mobile slide-over). */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const business = await getOwnedBusiness();
  if (!business) return NextResponse.json({ error: "No business" }, { status: 400 });

  const rows = await listRecentConversation(business.id, 20);
  const messages = rows.map((m) => ({ role: m.role, content: m.message }));
  return NextResponse.json({ messages });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const business = await getOwnedBusiness();
  if (!business) return NextResponse.json({ error: "No business" }, { status: 400 });

  const body = await request.json().catch(() => null);
  const parsed = assistantQuestionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid question" }, { status: 422 });
  }

  const [snapshot, history] = await Promise.all([
    buildBusinessSnapshot(business.id),
    listRecentConversation(business.id, 10)
  ]);

  await appendMessage(business.id, user.id, "user", parsed.data.question);

  let answer: string;
  try {
    answer = await answerBusinessQuestion({
      business,
      snapshot,
      conversation: history.map((m) => ({ role: m.role, content: m.message })),
      question: parsed.data.question
    });
  } catch (err) {
    if (err instanceof OpenAiRouteError) {
      return NextResponse.json({ error: err.message }, { status: err.httpStatus });
    }
    console.error("[api/assistant] unexpected error", err);
    return NextResponse.json({ error: "Could not get an answer. Please try again." }, { status: 500 });
  }

  await appendMessage(business.id, user.id, "assistant", answer);

  return NextResponse.json({ answer });
}
