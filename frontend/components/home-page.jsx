import Image from "next/image";
import Link from "next/link";
import { rules, services } from "../lib/site-data";
import { t } from "../lib/translations";
import {
  ActionButton,
  Footer,
  HeroVisual,
  PageGlow,
  SectionHeading,
  TopNav,
} from "./shared-ui";

const ruleIcons = [
  <svg
    key="basket"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </svg>,
  <svg
    key="info"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="8" strokeWidth="2.5" />
    <line x1="12" y1="12" x2="12" y2="16" />
  </svg>,
  <svg
    key="ban"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
  </svg>,
];

const serviceIcons = [
  <svg
    key="wash"
    width="26"
    height="26"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M4 3h16v4H4z" />
    <path d="M4 7v13a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V7" />
    <circle cx="12" cy="14" r="3" />
    <path d="M9 10h1" />
  </svg>,
  <svg
    key="dry"
    width="26"
    height="26"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2" />
    <path d="M9.6 4.6A2 2 0 1 1 11 8H2" />
    <path d="M12.6 19.4A2 2 0 1 0 14 16H2" />
  </svg>,
  <svg
    key="iron"
    width="26"
    height="26"
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
  <svg
    key="fold"
    width="26"
    height="26"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="m12 2 10 6.5-10 6.5L2 8.5 12 2z" />
    <path d="m20 13 2 1.5-10 6.5L2 14.5l2-1.5" />
    <path d="m20 18 2 1.5-10 6.5L2 19.5l2-1.5" />
  </svg>,
];

export default function HomePage() {
  return (
    <div className="relative bg-hero-wash h-[100dvh] flex flex-col overflow-hidden lg:h-auto lg:block lg:overflow-x-hidden">
      <PageGlow />
      <TopNav ctaHref="/book" ctaLabel="Book pickup" />

      <main className="flex-1 flex flex-col min-h-0 overflow-hidden lg:block lg:overflow-visible">
        {/* ── MOBILE hero text (hidden on desktop) ─────────── */}
        <section className="lg:hidden flex-shrink-0 px-6 pt-7 pb-4 text-center">
          <h1 className="font-display text-4xl leading-tight">
            {t("We pick up")}{" "}
            <span className="whitespace-nowrap">{t("your laundry.")}</span>
          </h1>
          <p className="mt-2 text-base font-medium text-sand-700">
            {t("Clean. Ironed. Folded back.")}
          </p>
          <hr className="my-3 border-sand-200" />
          <p className="text-sm leading-5 text-sand-600">
            {t("Back clean in 48h — no effort for you.")}
          </p>
          <div className="mt-4 flex justify-center gap-3">
            <Link href="/book">
              <ActionButton asChild>{t("Book now")}</ActionButton>
            </Link>
            <Link href="/how-it-works">
              <ActionButton asChild variant="secondary">
                {t("How it works")}
              </ActionButton>
            </Link>
          </div>
          <p className="mt-2 text-xs text-sand-500">
            {t("Order once — everything runs automatically.")}
          </p>
        </section>

        {/* ── MOBILE bag image edge-to-edge (hidden on desktop) */}
        <div className="lg:hidden flex-1 min-h-0 overflow-hidden relative">
          <Image
            src="/images/bag.png"
            alt="Premium black laundry bag filled with folded clothes"
            fill
            priority
            className="object-cover object-center"
          />
        </div>

        {/* ── MOBILE service strip (hidden on desktop) ─────── */}
        <div className="lg:hidden flex-shrink-0 grid grid-cols-3 divide-x divide-sand-200 border-t border-sand-200 bg-[#fbf4ea] py-5">
          <div className="flex flex-col items-center gap-3">
            <Image
              src="/images/Group 11.png"
              alt="Washing"
              width={56}
              height={56}
              className="object-contain"
            />
            <span className="text-xs font-semibold tracking-wide text-sand-800">
              {t("Washing")}
            </span>
          </div>
          <div className="flex flex-col items-center gap-3">
            <Image
              src="/images/Group 10.png"
              alt="Ironing"
              width={56}
              height={56}
              className="object-contain"
            />
            <span className="text-xs font-semibold tracking-wide text-sand-800">
              {t("Ironing")}
            </span>
          </div>
          <div className="flex flex-col items-center gap-3">
            <Image
              src="/images/Group 12.png"
              alt="Folding"
              width={56}
              height={56}
              className="object-contain"
            />
            <span className="text-xs font-semibold tracking-wide text-sand-800">
              {t("Folding")}
            </span>
          </div>
        </div>

        {/* ── DESKTOP hero (hidden on mobile) ──────────────── */}
        <section className="hidden lg:grid mx-auto max-w-7xl gap-10 px-4 pb-20 pt-12 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
          <div>
            <h1 className="font-display text-6xl leading-none md:text-8xl">
              {t("We pick up")}{" "}
              <span className="whitespace-nowrap">{t("your laundry.")}</span>
            </h1>
            <p className="mt-6 text-sm font-extrabold uppercase tracking-[0.3em] text-sand-700">
              {t("Clean. Ironed. Folded back.")}
            </p>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-sand-700">
              {t(
                "A warmer, simpler laundry experience for the web. Register once, use your QR-linked bag, and schedule pickups in a few clear steps.",
              )}
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/book">
                <ActionButton asChild>{t("Book now")}</ActionButton>
              </Link>
              <Link href="/how-it-works">
                <ActionButton asChild variant="secondary">
                  {t("How it works")}
                </ActionButton>
              </Link>
            </div>
            <p className="mt-6 text-base leading-8 text-sand-700">
              {t(
                "Returned within 48 hours with monthly billing in CHF and no online checkout at pickup time.",
              )}
            </p>
          </div>
          <HeroVisual />
        </section>

        {/* ── DESKTOP-only sections ─────────────────────────── */}
        <section className="hidden lg:block mx-auto max-w-7xl px-4 py-16">
          <SectionHeading
            eyebrow={t("Pricing & billing")}
            title={t("Simple. Transparent. Convenient.")}
            description={t(
              "Clear pricing per bag, no complicated tariffs, and one monthly invoice by email.",
            )}
            centered
          />
          <div className="mx-auto mt-10 grid max-w-4xl gap-5 md:grid-cols-2">
            <article className="rounded-[2rem] border border-sand-200 bg-white/80 p-8 shadow-soft">
              <p className="text-lg font-semibold text-sand-700">
                {t("One-time order")}
              </p>
              <div className="mt-6 font-display text-6xl leading-none">
                CHF 55
              </div>
              <p className="mt-3 text-sand-700">{t("per laundry bag")}</p>
              <p className="mt-5 text-sm leading-7 text-sand-700">
                {t(
                  "Approx. 5 to 6 kg of everyday laundry. Washing, drying, ironing, and folding included.",
                )}
              </p>
            </article>
            <article className="relative rounded-[2rem] border border-sand-200 bg-white/90 p-8 shadow-glow">
              <span className="absolute right-5 top-5 rounded-full bg-gold-pill px-4 py-2 text-xs font-extrabold uppercase tracking-[0.2em] text-white">
                {t("Popular")}
              </span>
              <p className="text-lg font-semibold text-sand-700">
                {t("Subscription")}
              </p>
              <div className="mt-6 font-display text-6xl leading-none">
                CHF 50
              </div>
              <p className="mt-3 text-sand-700">{t("per bag")}</p>
              <p className="mt-5 text-sm leading-7 text-sand-700">
                {t(
                  "Best for fixed weekly pickups with the same premium wash, dry, iron, and fold flow.",
                )}
              </p>
            </article>
          </div>
          <div className="mx-auto mt-5 max-w-4xl rounded-[2rem] border border-sand-200 bg-white/80 p-6 shadow-soft">
            <div className="flex flex-wrap items-center justify-between gap-3 text-lg font-semibold">
              <span>{t("Shirts & blouses")}</span>
              <span className="font-display text-3xl">+ CHF 4 / piece</span>
            </div>
          </div>
        </section>

        <section className="hidden lg:block mx-auto max-w-7xl px-4 py-20">
          <SectionHeading
            eyebrow={t("Our service")}
            title={t("We handle the part that takes time.")}
            description={t(
              "Service quality, bag-based convenience, and clear reasons to book — all in one place.",
            )}
            centered
          />
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {services.map((service, index) => (
              <article
                key={service.title}
                className="rounded-[2rem] bg-sand-100 border border-sand-200 p-7 shadow-soft"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-sand-500 shadow-soft">
                  {serviceIcons[index]}
                </div>
                <h3 className="mt-5 font-display text-2xl font-bold text-sand-900">
                  {service.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-sand-700">
                  {service.description}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="hidden lg:block mx-auto max-w-7xl px-4 py-10">
          <div className="overflow-hidden rounded-[2.4rem] border border-sand-200 bg-white/85 p-5 shadow-glow">
            <div className="grid gap-10 lg:grid-cols-[1.12fr_0.88fr] lg:items-center">
              <div className="rounded-[2rem] bg-[linear-gradient(180deg,#f6ecdf_0%,#f3e1c5_100%)] p-5">
                <img
                  src="/images/hero-bag.png"
                  alt="Laundry bag prepared for pickup"
                  className="mx-auto w-full max-w-md drop-shadow-[0_24px_60px_rgba(34,24,15,0.18)]"
                />
              </div>
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.28em] text-sand-700">
                  {t("Everyday laundry")}
                </p>
                <h2 className="mt-3 font-display text-5xl leading-none">
                  {t("Designed for repeat use, not one-off friction.")}
                </h2>
                <div className="mt-6 flex flex-wrap gap-3 text-sm font-semibold text-sand-700">
                  {[
                    t("Shirts"),
                    t("Trousers"),
                    t("Underwear"),
                    t("Sportswear"),
                    t("Towels"),
                  ].map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-sand-200 bg-sand-50 px-4 py-3"
                    >
                      {item}
                    </span>
                  ))}
                </div>
                <div className="mt-8">
                  <Link href="/book">
                    <ActionButton asChild>
                      {t("Start your booking")}
                    </ActionButton>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="hidden lg:block mx-auto max-w-7xl px-4 py-20">
          <SectionHeading
            eyebrow={t("Preparation")}
            title={t("Prepare it simply. We handle the rest.")}
            description={t(
              "The detailed process is now on its own page, while the homepage keeps only the most important preparation guidance.",
            )}
            centered
          />
          <div className="mt-8 mx-auto max-w-2xl space-y-4">
            {rules.map((rule, index) => (
              <article
                key={rule.title}
                className="flex gap-5 border border-sand-200 rounded-[2rem] bg-sand-100 p-6"
              >
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white text-sand-500 shadow-soft">
                  {ruleIcons[index]}
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold text-sand-900">
                    {rule.title}
                  </h3>
                  <ul className="mt-3 space-y-2">
                    {rule.items.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-2 text-sm leading-6 text-sand-700"
                      >
                        {rule.type === "cross" ? (
                          <span className="mt-0.5 shrink-0 text-red-400 font-bold">
                            ✕
                          </span>
                        ) : (
                          <span className="mt-0.5 shrink-0 text-green-600 font-bold">
                            ✓
                          </span>
                        )}
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>
          <div className="mt-10 rounded-[2rem] bg-[linear-gradient(135deg,#b88749,#8c6338)] p-8 text-white shadow-glow">
            <h3 className="font-display text-4xl leading-none">
              {t("Ready for less laundry effort?")}
            </h3>
            <p className="mt-4 max-w-2xl text-base leading-8 text-white/85">
              {t(
                "Keep the homepage simple and go straight into a separate booking flow when you are ready.",
              )}
            </p>
            <div className="mt-6 flex flex-wrap gap-4">
              <Link href="/book">
                <ActionButton asChild variant="secondary">
                  {t("Book now")}
                </ActionButton>
              </Link>
              <Link href="/how-it-works">
                <ActionButton asChild variant="secondary">
                  {t("View the full process")}
                </ActionButton>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer — desktop only */}
      <div className="hidden lg:block">
        <Footer />
      </div>
    </div>
  );
}
