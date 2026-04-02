import Link from "next/link";
import { processSteps } from "../lib/site-data";
import { ActionButton, PageGlow, SectionHeading, TopNav } from "./shared-ui";

export default function HowItWorksPage() {
  return (
    <div className="relative overflow-x-hidden">
      <PageGlow />
      <TopNav ctaHref="/book" ctaLabel="Start booking" />

      <main className="mx-auto max-w-5xl px-4 py-14">
        <SectionHeading
          eyebrow="Smart pickup"
          title="Scan. Choose a time. Leave it by the door."
          description="The process is now separate from the homepage so it stays easier to understand. This page explains the simple pickup flow in English."
          centered
        />

        <div className="mt-12 space-y-6">
          {processSteps.map((step, index) => (
            <article key={step.title} className="rounded-[2rem] border border-sand-200 bg-white/85 p-6 shadow-soft">
              <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                <div className="flex gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-sand-100 font-display text-2xl text-sand-800">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="font-display text-4xl leading-none">{step.title}</h3>
                    <p className="mt-3 max-w-2xl text-base leading-8 text-sand-700">{step.description}</p>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-10 rounded-[2rem] border border-sand-200 bg-white/85 p-8 shadow-soft">
          <h3 className="font-display text-4xl leading-none">Why customers like this flow</h3>
          <div className="mt-5 flex flex-wrap gap-3 text-sm font-semibold text-sand-700">
            <span className="rounded-full border border-sand-200 bg-sand-50 px-4 py-3">No address re-entry every time</span>
            <span className="rounded-full border border-sand-200 bg-sand-50 px-4 py-3">No online payment at pickup</span>
            <span className="rounded-full border border-sand-200 bg-sand-50 px-4 py-3">Clear monthly invoicing</span>
          </div>
          <div className="mt-8">
            <Link href="/book">
              <ActionButton asChild>Continue to booking</ActionButton>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

