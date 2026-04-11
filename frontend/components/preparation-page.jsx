import Link from "next/link";
import { Footer, PageGlow, TopNav } from "./shared-ui";

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

export default function PreparationPage() {
  return (
    <div className="relative overflow-x-hidden min-h-screen bg-hero-wash">
      <PageGlow />
      <TopNav ctaHref="/book" ctaLabel="Book now" />

      <main className="mx-auto max-w-2xl px-4 pb-16 pt-10">
        {/* ── Header ─────────────────────────────────────── */}
        <div className="mb-8 text-center">
          <div className="mb-3 flex items-center justify-center gap-3">
            <div className="h-px w-8 bg-sand-400" />
            <span className="font-display text-xs italic font-semibold tracking-widest text-sand-500">
              Preparation &amp; Guidelines
            </span>
            <div className="h-px w-8 bg-sand-400" />
          </div>
          <h1 className="font-display text-3xl font-bold leading-tight text-sand-900 sm:text-4xl">
            Simply prepare –<br />
            we handle the rest
          </h1>
          <p className="mt-3 mx-auto max-w-xs text-sm leading-relaxed text-sand-600 sm:max-w-md sm:text-base">
            With a few simple rules we make sure your laundry comes back
            perfectly.
          </p>
        </div>

        {/* ── Rule cards ─────────────────────────────────── */}
        <div className="flex flex-col gap-3">
          {rules.map((rule) => (
            <article
              key={rule.title}
              className="rounded-3xl border border-sand-200 bg-white/90 px-5 py-4 shadow-soft"
            >
              {/* Title row */}
              <div className="flex items-center gap-3 border-b border-sand-100 pb-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sand-50 text-sand-500 shadow-soft">
                  {rule.icon}
                </div>
                <h3 className="font-display text-base font-bold text-sand-900">
                  {rule.title}
                </h3>
              </div>
              {/* Items */}
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

        {/* ── Info note ──────────────────────────────────── */}
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
          <p className="text-xs italic leading-relaxed text-sand-500 sm:text-sm">
            If in doubt: just ask us quickly — we are happy to help.
          </p>
        </div>

        {/* ── CTA card ───────────────────────────────────── */}
        <div className="mt-6 overflow-hidden rounded-3xl bg-[linear-gradient(135deg,#c89761,#7a5030)] px-6 py-8 text-center shadow-glow">
          <h2 className="font-display text-2xl font-bold leading-tight text-white sm:text-3xl">
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
          <div className="mt-4">
            <Link
              href="/how-it-works"
              className="text-xs text-white/70 underline underline-offset-2 transition hover:text-white"
            >
              View how it works again
            </Link>
          </div>
        </div>
      </main>

      <div className="hidden sm:block">
        <Footer />
      </div>
    </div>
  );
}
