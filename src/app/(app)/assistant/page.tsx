import { redirect } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { AssistantChat } from "@/components/assistant/assistant-chat";
import { getOwnedBusiness } from "@/lib/services/businesses";
import { listRecentConversation } from "@/lib/services/conversation";

export const dynamic = "force-dynamic";

export default async function AssistantPage() {
  const business = await getOwnedBusiness();
  if (!business) redirect("/onboarding");

  const history = await listRecentConversation(business.id, 20);

  return (
    <>
      <PageHeader
        eyebrow="Your AI advisor"
        title="Pliex Assistant"
        subtitle="Ask plain-language questions about your numbers, stock, and what to do next."
      />

      <AssistantChat
        initialHistory={history.map((m) => ({ role: m.role, content: m.message }))}
      />
    </>
  );
}
