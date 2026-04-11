import Image from "next/image";
import { Footer, PageGlow, TopNav } from "./shared-ui";

export default function PricingPage() {
  return (
    <div className="relative overflow-x-hidden min-h-screen bg-hero-wash">
      <PageGlow />
      <TopNav ctaHref="/book" ctaLabel="Book now" />

      <main className="mx-auto max-w-2xl px-4 pb-16 pt-10">
        {/* ── Section header ─────────────────────────────── */}
        <div className="mb-8 text-center">
          <p className="mb-2 font-display text-sm font-semibold italic tracking-wide text-sand-500">
            Prices &amp; Billing
          </p>
          <h1 className="font-display text-4xl font-bold leading-tight text-sand-900 sm:text-5xl">
            Simple. Transparent. Convenient.
          </h1>
          <p className="mt-3 mx-auto max-w-xs text-sm leading-relaxed text-sand-600 sm:max-w-md sm:text-base">
            Clear prices per bag – no complicated rates or online payment.
          </p>
        </div>

        {/* ── Two pricing cards ──────────────────────────── */}
        <div className="grid grid-cols-2 gap-3">
          {/* Single order */}
          <div className="flex flex-col rounded-3xl border border-sand-200 bg-white/90 p-4 shadow-soft sm:p-5">
            <p className="text-xs font-semibold italic text-sand-500 sm:text-sm">
              Single order
            </p>
            <div className="mt-3">
              <span className="text-xs font-semibold text-sand-700">CHF</span>
              <span className="ml-1 font-display text-5xl font-bold leading-none text-sand-900 sm:text-6xl">
                55
              </span>
            </div>
            <p className="mt-1 text-xs text-sand-600">per Laundry Bag</p>
            <span className="mt-1 text-[11px] leading-snug text-sand-400 sm:text-xs">
              approx.5–6 kg everyday
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
            <p className="text-center text-[11px] leading-snug text-sand-600 sm:text-xs">
              Washing, Drying, Ironing and Folding included
            </p>
          </div>

          {/* Subscription */}
          <div className="relative flex flex-col rounded-3xl border border-sand-300 bg-white/90 p-4 shadow-soft sm:p-5">
            {/* Popular badge */}
            <span className="absolute right-0 top-0 rounded-bl-2xl rounded-tr-3xl bg-gold-pill px-3 py-1 text-[10px] font-bold text-white shadow-sm sm:text-xs">
              Popular
            </span>
            <p className="text-xs font-semibold text-sand-700 sm:text-sm">
              Subscription
            </p>
            <div className="mt-3">
              <span className="text-xs font-semibold text-sand-700">CHF</span>
              <span className="ml-1 font-display text-5xl font-bold leading-none text-sand-900 sm:text-6xl">
                50
              </span>
            </div>
            <p className="mt-1 text-xs text-sand-600">per Bag</p>
            <span className="mt-1 text-[11px] leading-snug text-sand-400 sm:text-xs">
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
            <p className="text-center text-[11px] leading-snug text-sand-600 sm:text-xs">
              More convenience at a better price
            </p>
          </div>
        </div>

        {/* ── Add-on row ─────────────────────────────────── */}
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

        {/* ── Bottom billing card ────────────────────────── */}
        <div className="mt-4 rounded-3xl border border-sand-200 bg-white/90 px-5 py-6 shadow-soft">
          {/* Divider + icon */}
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

          <h2 className="font-display text-center text-xl font-bold text-sand-900 sm:text-2xl">
            End of month instead of checkout stress
          </h2>
          <p className="mt-2 text-center text-xs leading-relaxed text-sand-600 sm:text-sm">
            All orders are collected and you conveniently receive one invoice by
            email.
          </p>

          {/* Three benefit chips */}
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <div className="flex items-center gap-2 rounded-full bg-sand-50 border border-sand-200 px-3 py-2">
              <Image
                src="/images/clothes/pricing_below/pricing_below.png"
                alt="No online payment"
                width={22}
                height={22}
                className="object-contain"
              />
              <span className="text-[11px] font-semibold leading-tight text-sand-700 sm:text-xs">
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
              <span className="text-[11px] font-semibold leading-tight text-sand-700 sm:text-xs">
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
              <span className="text-[11px] font-semibold leading-tight text-sand-700 sm:text-xs">
                Transparent
                <br />
                billing
              </span>
            </div>
          </div>
        </div>
      </main>

      <div className="hidden sm:block">
        <Footer />
      </div>
    </div>
  );
}
