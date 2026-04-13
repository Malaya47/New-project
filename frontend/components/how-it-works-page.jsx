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

const services = [
  {
    icon: "/images/service_icons/washing_machine.png",
    alt: "Washing machine",
    title: "Washing",
    description: "Thorough cleaning of your everyday clothes.",
  },
  {
    icon: "/images/service_icons/drying.png",
    alt: "Dryer",
    title: "Drying",
    description: "Gentle and clean, ready for the day.",
  },
  {
    icon: "/images/service_icons/iron.png",
    alt: "Iron",
    title: "Ironing",
    description: "Neatly pressed for a well-kept result.",
  },
  {
    icon: "/images/service_icons/fold.png",
    alt: "Folded laundry",
    title: "Folding",
    description: "Neatly laid out and ready to put away.",
  },
];

const clothingItems = [
  { icon: "/images/clothes/shirt.png", alt: "Shirt", label: "Shirts" },
  { icon: "/images/clothes/pant.png", alt: "Pants", label: "Pants" },
  {
    icon: "/images/clothes/underwear.png",
    alt: "Underwear",
    label: "Underwear",
  },
  {
    icon: "/images/clothes/jersey.png",
    alt: "Sportswear",
    label: "Sportswear",
  },
  { icon: "/images/clothes/folding_cloth.png", alt: "Towels", label: "Towels" },
];

const rules = [
  {
    title: "Prepare your laundry",
    icon: (
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </svg>
    ),
    items: [
      "Sort light, dark and coloured separately",
      "Normal everyday laundry only",
      "Do not overfill the bag",
    ],
  },
  {
    title: "Important to know",
    icon: (
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="8" strokeWidth="2.5" />
        <line x1="12" y1="12" x2="12" y2="16" />
      </svg>
    ),
    items: [
      "We wash as handed in",
      "No sorting of individual items",
      "Mixed laundry is washed together",
    ],
  },
  {
    title: "Not suitable",
    icon: (
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
      </svg>
    ),
    items: [
      "Silk, wool, leather",
      "Duvets, pillows, curtains",
      "Heavily soiled clothing",
    ],
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
      <div className="md:hidden bg-hero-wash px-4 py-12">
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

        {/* ── Services section ── */}
        <section className="mt-10 border-t border-sand-200 pt-8">
          <div className="mb-6 text-center">
            <div className="mb-3 flex items-center justify-center gap-3">
              <div className="h-px w-8 bg-sand-400" />
              <span className="font-display text-xs italic font-semibold tracking-widest text-sand-500">
                Our Service
              </span>
              <div className="h-px w-8 bg-sand-400" />
            </div>
            <h2 className="font-display text-3xl font-bold leading-tight text-sand-900">
              We take care of
              <br />
              the hard part
            </h2>
            <p className="mt-3 max-w-xs mx-auto text-sm leading-relaxed text-sand-600">
              Washing, Drying, Ironing and Folding – so your laundry comes back
              clean and neat.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {services.map((service) => (
              <article
                key={service.title}
                className="flex flex-col items-center gap-3 rounded-3xl border border-sand-200 bg-white/90 p-5 shadow-soft text-center"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-sand-50 shadow-soft">
                  <Image
                    src={service.icon}
                    alt={service.alt}
                    width={48}
                    height={48}
                    className="object-contain"
                  />
                </div>
                <div>
                  <h3 className="font-display text-sm font-bold text-sand-900">
                    {service.title}
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-sand-600">
                    {service.description}
                  </p>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-6 overflow-hidden rounded-3xl shadow-soft">
            <Image
              src="/images/laundry-bag.png"
              alt="laundry.li bag with clean, folded clothes"
              width={800}
              height={520}
              className="w-full object-cover"
            />
          </div>

          <div className="mt-6 rounded-3xl border border-sand-200 bg-white/90 p-6 shadow-soft">
            <h2 className="mb-5 font-display text-center text-base font-bold text-sand-900">
              Suitable for everyday laundry
            </h2>
            <div className="flex flex-col items-center gap-3">
              <div className="flex flex-wrap justify-center gap-3">
                {clothingItems.slice(0, 3).map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center gap-2 rounded-full bg-sand-100 px-4 py-2"
                  >
                    <Image
                      src={item.icon}
                      alt={item.alt}
                      width={22}
                      height={22}
                      className="object-contain"
                    />
                    <span className="text-xs font-semibold text-sand-800">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap justify-center gap-3">
                {clothingItems.slice(3).map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center gap-2 rounded-full bg-sand-100 px-4 py-2"
                  >
                    <Image
                      src={item.icon}
                      alt={item.alt}
                      width={22}
                      height={22}
                      className="object-contain"
                    />
                    <span className="text-xs font-semibold text-sand-800">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Pricing section ── */}
        <section className="mt-10 border-t border-sand-200 pt-8">
          <div className="mb-6 text-center">
            <p className="mb-2 font-display text-sm font-semibold italic tracking-wide text-sand-500">
              Prices &amp; Billing
            </p>
            <h2 className="font-display text-3xl font-bold leading-tight text-sand-900">
              Simple. Transparent. Convenient.
            </h2>
            <p className="mt-3 mx-auto max-w-xs text-sm leading-relaxed text-sand-600">
              Clear prices per bag – no complicated rates or online payment.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col rounded-3xl border border-sand-200 bg-white/90 p-4 shadow-soft">
              <p className="text-xs font-semibold italic text-sand-500">
                Single order
              </p>
              <div className="mt-3">
                <span className="text-xs font-semibold text-sand-700">CHF</span>
                <span className="ml-1 font-display text-5xl font-bold leading-none text-sand-900">
                  55
                </span>
              </div>
              <p className="mt-1 text-xs text-sand-600">per Laundry Bag</p>
              <span className="mt-1 text-[11px] leading-snug text-sand-400">
                approx. 5–6 kg everyday
              </span>
              <div className="my-4 flex justify-center">
                <Image
                  src="/images/pricing/bag.png"
                  alt="Laundry bag"
                  width={56}
                  height={56}
                  className="object-contain"
                />
              </div>
              <p className="text-center text-[11px] leading-snug text-sand-600">
                Washing, Drying, Ironing and Folding included
              </p>
            </div>

            <div className="relative flex flex-col rounded-3xl border border-sand-300 bg-white/90 p-4 shadow-soft">
              <span className="absolute right-0 top-0 rounded-bl-2xl rounded-tr-3xl bg-gold-pill px-3 py-1 text-[10px] font-bold text-white shadow-sm">
                Popular
              </span>
              <p className="text-xs font-semibold text-sand-700">
                Subscription
              </p>
              <div className="mt-3">
                <span className="text-xs font-semibold text-sand-700">CHF</span>
                <span className="ml-1 font-display text-5xl font-bold leading-none text-sand-900">
                  50
                </span>
              </div>
              <p className="mt-1 text-xs text-sand-600">per Bag</p>
              <span className="mt-1 text-[11px] leading-snug text-sand-400">
                with fixed weekly pickup
              </span>
              <div className="my-4 flex justify-center">
                <Image
                  src="/images/pricing/calendar.png"
                  alt="Calendar"
                  width={56}
                  height={56}
                  className="object-contain"
                />
              </div>
              <p className="text-center text-[11px] leading-snug text-sand-600">
                More convenience at a better price
              </p>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between rounded-3xl border border-sand-200 bg-white/90 px-5 py-4 shadow-soft">
            <div className="flex items-center gap-3">
              <Image
                src="/images/pricing/hanger.png"
                alt="Hanger"
                width={40}
                height={40}
                className="object-contain"
              />
              <div>
                <p className="text-sm font-bold text-sand-800">
                  Shirts &amp; Blouses
                </p>
                <p className="text-xs text-sand-500">billed separately</p>
              </div>
            </div>
            <p className="text-sm font-bold text-sand-800">+ CHF 4 / piece</p>
          </div>

          <div className="mt-4 rounded-3xl border border-sand-200 bg-white/90 px-5 py-6 shadow-soft">
            <div className="mb-4 flex items-center justify-center gap-3">
              <div className="h-px flex-1 bg-sand-200" />
              <Image
                src="/images/clothes/pricing_below/Group 29.png"
                alt="Invoice"
                width={40}
                height={40}
                className="object-contain"
              />
              <div className="h-px flex-1 bg-sand-200" />
            </div>
            <h2 className="font-display text-center text-xl font-bold text-sand-900">
              End of month instead of checkout stress
            </h2>
            <p className="mt-2 text-center text-xs leading-relaxed text-sand-600">
              All orders are collected and you conveniently receive one invoice
              by email.
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <div className="flex items-center gap-2 rounded-full bg-sand-50 border border-sand-200 px-3 py-2">
                <Image
                  src="/images/clothes/pricing_below/pricing_below.png"
                  alt="No online payment"
                  width={22}
                  height={22}
                  className="object-contain"
                />
                <span className="text-[11px] font-semibold leading-tight text-sand-700">
                  No online
                  <br />
                  payment needed
                </span>
              </div>
              <div className="flex items-center gap-2 rounded-full bg-sand-50 border border-sand-200 px-3 py-2">
                <Image
                  src="/images/clothes/pricing_below/Vector.png"
                  alt="Conveniently collected"
                  width={22}
                  height={22}
                  className="object-contain"
                />
                <span className="text-[11px] font-semibold leading-tight text-sand-700">
                  Conveniently
                  <br />
                  collected
                </span>
              </div>
              <div className="flex items-center gap-2 rounded-full bg-sand-50 border border-sand-200 px-3 py-2">
                <Image
                  src="/images/clothes/pricing_below/Group 27.png"
                  alt="Transparent billing"
                  width={22}
                  height={22}
                  className="object-contain"
                />
                <span className="text-[11px] font-semibold leading-tight text-sand-700">
                  Transparent
                  <br />
                  billing
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ── Preparation section ── */}
        <section className="mt-10 border-t border-sand-200 pt-8 pb-8">
          <div className="mb-6 text-center">
            <div className="mb-3 flex items-center justify-center gap-3">
              <div className="h-px w-8 bg-sand-400" />
              <span className="font-display text-xs italic font-semibold tracking-widest text-sand-500">
                Preparation &amp; Guidelines
              </span>
              <div className="h-px w-8 bg-sand-400" />
            </div>
            <h2 className="font-display text-3xl font-bold leading-tight text-sand-900">
              Simply prepare –<br />
              we handle the rest
            </h2>
            <p className="mt-3 mx-auto max-w-xs text-sm leading-relaxed text-sand-600">
              With a few simple rules we make sure your laundry comes back
              perfectly.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {rules.map((rule) => (
              <article
                key={rule.title}
                className="rounded-3xl border border-sand-200 bg-white/90 px-5 py-4 shadow-soft"
              >
                <div className="flex items-center gap-3 border-b border-sand-100 pb-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sand-50 text-sand-500 shadow-soft">
                    {rule.icon}
                  </div>
                  <h3 className="font-display text-base font-bold text-sand-900">
                    {rule.title}
                  </h3>
                </div>
                <ul className="mt-3 flex flex-col gap-2">
                  {rule.items.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2 text-sm leading-snug text-sand-700"
                    >
                      <span className="mt-0.5 shrink-0 text-sand-500 font-bold">
                        ✓
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>

          <div className="mt-5 flex items-start gap-3 rounded-2xl px-2 py-1">
            <svg
              className="mt-0.5 shrink-0 text-sand-400"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <p className="text-xs italic leading-relaxed text-sand-500">
              If in doubt: just ask us quickly — we are happy to help.
            </p>
          </div>

          <div className="mt-6 overflow-hidden rounded-3xl bg-[linear-gradient(135deg,#c89761,#7a5030)] px-6 py-8 text-center shadow-glow">
            <h2 className="font-display text-2xl font-bold leading-tight text-white">
              Ready for less effort?
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-white/80">
              Start now and leave your laundry to us.
            </p>
            <Link
              href="/book"
              className="mt-5 inline-flex w-full max-w-xs items-center justify-center rounded-full bg-[linear-gradient(135deg,#f5e6cc,#e8c98a)] px-6 py-3.5 font-display text-base font-bold text-sand-900 shadow-soft transition hover:-translate-y-0.5"
            >
              Book now
            </Link>
          </div>
        </section>
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
