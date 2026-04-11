import Image from "next/image";
import Link from "next/link";
import { processSteps } from "../lib/site-data";
import {
  ActionButton,
  Footer,
  PageGlow,
  SectionHeading,
  TopNav,
} from "./shared-ui";

// Image icons used on both desktop (replacing SVGs) and mobile
const stepImages = [
  { src: "/images/QR.png", alt: "QR code" },
  { src: "/images/location.png", alt: "Location" },
  { src: "/images/pick-up.png", alt: "Pick-up" },
  { src: "/images/laundry.png", alt: "Laundry" },
];

// Mobile-specific step content (English, matching reference design)
const mobileSteps = [
  {
    img: "/images/QR.png",
    alt: "QR code",
    title: "Scan the QR code",
    description: "Scan the code on your laundry bag directly with your phone.",
  },
  {
    img: "/images/location.png",
    alt: "Location",
    title: "Choose a time window",
    description:
      "Your address is recognised and you choose an available time slot.",
  },
  {
    img: "/images/pick-up.png",
    alt: "Pick-up",
    title: "Place it by the door",
    description:
      "Put your bag outside in the morning for scheduled collection.",
  },
  {
    img: "/images/laundry.png",
    alt: "Laundry",
    title: "Receive it back clean",
    description:
      "In the evening you get your laundry back clean, ironed and folded.",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="relative overflow-x-hidden">
      <PageGlow />
      <TopNav ctaHref="/book" ctaLabel="Start booking" />

      {/* ─────────────────────────────────────────────────────
          MOBILE layout  (< md)  — matches reference design
      ───────────────────────────────────────────────────── */}
      <div className="md:hidden min-h-screen bg-hero-wash px-4 py-12">
        {/* Header */}
        <div className="mb-10 text-center">
          <div className="mb-4 flex items-center justify-center gap-3">
            <div className="h-px w-10 bg-sand-400" />
            <span className="font-display text-xs italic font-semibold tracking-widest text-sand-500">
              Smart Pickup System
            </span>
            <div className="h-px w-10 bg-sand-400" />
          </div>
          <h1 className="font-display text-3xl font-bold leading-tight text-sand-900">
            Scan. Choose a time.
            <br />
            Place it by the door.
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-sand-600">
            The QR code on your bag makes
            <br />
            ordering even easier.
          </p>
        </div>

        {/* Steps */}
        <div className="flex flex-col items-center">
          {mobileSteps.map((step, index) => (
            <div key={step.title} className="flex w-full flex-col items-center">
              <article className="w-full rounded-3xl border border-sand-200 bg-white/90 p-5 shadow-soft">
                <div className="flex items-center gap-4">
                  <div className="flex h-[4.5rem] w-[4.5rem] shrink-0 items-center justify-center rounded-2xl bg-sand-50 shadow-soft">
                    <Image
                      src={step.img}
                      alt={step.alt}
                      width={52}
                      height={52}
                      className="object-contain"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-display text-base font-bold text-sand-900">
                      {step.title}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-sand-600">
                      {step.description}
                    </p>
                  </div>
                </div>
              </article>

              {/* Connector: line → gold dot → line */}
              {index < mobileSteps.length - 1 && (
                <div className="flex flex-col items-center">
                  <div className="h-4 w-px bg-sand-300" />
                  <div className="h-3 w-3 rounded-full bg-sand-400 shadow-sm" />
                  <div className="h-4 w-px bg-sand-300" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Bottom invoice note */}
        <div className="mt-8 border-t border-sand-200 pt-5 text-center">
          <p className="text-sm italic leading-relaxed text-sand-500">
            End of month: You conveniently receive a<br />
            consolidated invoice by email.
          </p>

          {/* Two benefit icons */}
          <div className="mt-5 flex items-center justify-center divide-x divide-sand-200">
            <div className="flex items-center gap-2 pr-6">
              <Image
                src="/images/Map-pin.png"
                alt="Map pin"
                width={32}
                height={32}
                className="object-contain"
              />
              <span className="text-xs font-semibold leading-tight text-sand-700">
                No address
                <br />
                re-entry
              </span>
            </div>
            <div className="flex items-center gap-2 pl-6">
              <Image
                src="/images/credit-card.png"
                alt="Credit card"
                width={32}
                height={32}
                className="object-contain"
              />
              <span className="text-xs font-semibold leading-tight text-sand-700">
                No online
                <br />
                payment needed
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────
          DESKTOP layout  (md+)  — original layout, image icons
      ───────────────────────────────────────────────────── */}
      <main className="hidden md:block mx-auto max-w-2xl px-4 py-14">
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
                  {/* Icon box — image instead of SVG */}
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-white shadow-soft">
                    <Image
                      src={stepImages[index].src}
                      alt={stepImages[index].alt}
                      width={48}
                      height={48}
                      className="object-contain"
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <h3 className="font-display text-xl font-bold text-sand-900">
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

        {/* Bottom invoice note + benefit icons */}
        <div className="mt-8 border-t border-sand-200 pt-5 text-center">
          <p className="text-sm italic leading-relaxed text-sand-500">
            End of month: You conveniently receive a consolidated invoice by
            email.
          </p>
          <div className="mt-5 flex items-center justify-center divide-x divide-sand-200">
            <div className="flex items-center gap-2 pr-6">
              <Image
                src="/images/Map-pin.png"
                alt="Map pin"
                width={32}
                height={32}
                className="object-contain"
              />
              <span className="text-xs font-semibold leading-tight text-sand-700">
                No address
                <br />
                re-entry
              </span>
            </div>
            <div className="flex items-center gap-2 pl-6">
              <Image
                src="/images/credit-card.png"
                alt="Credit card"
                width={32}
                height={32}
                className="object-contain"
              />
              <span className="text-xs font-semibold leading-tight text-sand-700">
                No online
                <br />
                payment needed
              </span>
            </div>
          </div>
        </div>
      </main>
      <div className="hidden md:block">
        <Footer />
      </div>
    </div>
  );
}
