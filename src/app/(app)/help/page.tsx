import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardBody, CardHeader, CardSubtitle, CardTitle } from "@/components/ui/card";

const HELP_TOPICS = [
  {
    title: "Getting started",
    body: "Complete onboarding, then log your first sale and expense to populate the dashboard and recommendations."
  },
  {
    title: "Assistant answers",
    body: "Assistant replies are grounded in your current Pliex snapshot, so numbers should match dashboard totals."
  },
  {
    title: "Gizmo sync",
    body: "Use Integrations to connect your HTTPS tunnel URL and operator credentials, then run Refresh from Gizmo."
  }
];

export const dynamic = "force-dynamic";

export default function HelpPage() {
  return (
    <>
      <PageHeader
        eyebrow="Support"
        title="Help"
        subtitle="Quick pointers for the most common first-customer questions."
      />

      <section className="grid gap-4 lg:grid-cols-3">
        {HELP_TOPICS.map((topic) => (
          <Card key={topic.title}>
            <CardHeader>
              <div>
                <CardTitle>{topic.title}</CardTitle>
              </div>
            </CardHeader>
            <CardBody>
              <p className="text-sm text-ink-soft">{topic.body}</p>
            </CardBody>
          </Card>
        ))}
      </section>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Need direct support?</CardTitle>
            <CardSubtitle>Fastest routes for troubleshooting during pilot rollout.</CardSubtitle>
          </div>
        </CardHeader>
        <CardBody className="flex flex-wrap gap-3 text-sm">
          <Link
            href="/assistant"
            className="inline-flex items-center rounded-full border border-line bg-white px-4 py-2 font-semibold text-navy-800 transition hover:bg-sky-100"
          >
            Ask Assistant
          </Link>
          <Link
            href="/integrations/gizmo"
            className="inline-flex items-center rounded-full border border-line bg-white px-4 py-2 font-semibold text-navy-800 transition hover:bg-sky-100"
          >
            Open Gizmo setup
          </Link>
        </CardBody>
      </Card>
    </>
  );
}
