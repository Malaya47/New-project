import Link from "next/link";
import { processSteps } from "../lib/site-data";
import {
  ActionButton,
  Footer,
  PageGlow,
  SectionHeading,
  TopNav,
} from "./shared-ui";

const stepIcons = [
  /* 1 – QR code */
  <svg
    key="qr"
    width="36"
    height="36"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="5" y="5" width="3" height="3" fill="currentColor" stroke="none" />
    <rect x="16" y="5" width="3" height="3" fill="currentColor" stroke="none" />
    <rect x="5" y="16" width="3" height="3" fill="currentColor" stroke="none" />
    <path d="M14 14h3v3h-3zM17 17h3v3h-3zM14 17v3" />
  </svg>,
  /* 2 – Clock */
  <svg
    key="clock"
    width="36"
    height="36"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="9" />
    <polyline points="12 7 12 12 15.5 14" />
  </svg>,
  /* 3 – Door */
  <svg
    key="door"
    width="36"
    height="36"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M14 2H6a1 1 0 0 0-1 1v18a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V7z" />
    <path d="M14 2v5h5" />
    <circle cx="15" cy="13" r="1" fill="currentColor" stroke="none" />
  </svg>,
  /* 4 – T-shirt */
  <svg
    key="shirt"
    width="36"
    height="36"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.57a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.57a2 2 0 0 0-1.34-2.23z" />
  </svg>,
];

export default function HowItWorksPage() {
  return (
    <div className="relative overflow-x-hidden">
      <PageGlow />
      <TopNav ctaHref="/book" ctaLabel="Start booking" />

      <main className="mx-auto max-w-2xl px-4 py-14">
        <SectionHeading
          eyebrow="Smart pickup"
          title="Scan. Choose a time. Leave it by the door."
          description="The process is now separate from the homepage so it stays easier to understand. This page explains the simple pickup flow in English."
          centered
        />

        <div className="mt-12">
          {processSteps.map((step, index) => (
            <div key={step.title}>
              <article className="rounded-[2rem] border border-sand-400 bg-sand-50 p-6">
                <div className="flex items-start gap-5">
                  {/* Icon box */}
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-white text-sand-500 shadow-soft">
                    {stepIcons[index]}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-sand-900">
                      {index + 1}. {step.title}
                    </h3>
                    <p className="mt-2 text-sm leading-7 text-sand-700">
                      {step.description}
                    </p>

                    {/* Step 2 inline mockup */}
                    {index === 1 && (
                      <div className="mt-4 max-w-xs rounded-2xl border border-sand-200 bg-white p-4 shadow-soft">
                        <div className="flex items-center gap-2 border-b border-sand-100 pb-3 text-sm text-sand-700">
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                          >
                            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z" />
                            <circle cx="12" cy="10" r="3" />
                          </svg>
                          <span>Musterstraße 12, Berlin</span>
                        </div>
                        <div className="flex items-center justify-between py-3 text-sm text-sand-700">
                          <div className="flex items-center gap-2">
                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              aria-hidden="true"
                            >
                              <rect
                                x="3"
                                y="4"
                                width="18"
                                height="18"
                                rx="2"
                                ry="2"
                              />
                              <line x1="16" y1="2" x2="16" y2="6" />
                              <line x1="8" y1="2" x2="8" y2="6" />
                              <line x1="3" y1="10" x2="21" y2="10" />
                            </svg>
                            <span>Tomorrow 08:00 – 10:00</span>
                          </div>
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                          >
                            <polyline points="9 18 15 12 9 6" />
                          </svg>
                        </div>
                        <div className="inline-flex w-full items-center justify-center rounded-xl bg-gold-pill px-4 py-3 text-sm font-extrabold text-white">
                          Confirm Time Window
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </article>

              {/* Connector line */}
              {index < processSteps.length - 1 && (
                <div className="mx-auto h-8 w-px bg-sand-400" />
              )}
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-[2rem] border border-sand-200 bg-white/85 p-8 shadow-soft">
          <h3 className="font-display text-4xl leading-none">
            Why customers like this flow
          </h3>
          <div className="mt-5 flex flex-wrap gap-3 text-sm font-semibold text-sand-700">
            <span className="rounded-full border border-sand-200 bg-sand-50 px-4 py-3">
              No address re-entry every time
            </span>
            <span className="rounded-full border border-sand-200 bg-sand-50 px-4 py-3">
              No online payment at pickup
            </span>
            <span className="rounded-full border border-sand-200 bg-sand-50 px-4 py-3">
              Clear monthly invoicing
            </span>
          </div>
          <div className="mt-8">
            <Link href="/book">
              <ActionButton asChild>Continue to booking</ActionButton>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
