import Link from "next/link";
import { rules, services } from "../lib/site-data";
import { ActionButton, HeroVisual, PageGlow, SectionHeading, TopNav } from "./shared-ui";

export default function HomePage() {
  return (
    <div className="relative overflow-x-hidden">
      <PageGlow />
      <TopNav ctaHref="/book" ctaLabel="Book pickup" />

      <main>
        <section className="mx-auto grid max-w-7xl gap-10 px-4 pb-20 pt-12 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
          <div>
            <h1 className="max-w-[10ch] font-display text-6xl leading-none md:text-8xl">
              We pick up your laundry.
            </h1>
            <p className="mt-6 text-sm font-extrabold uppercase tracking-[0.3em] text-sand-700">
              Clean. Ironed. Folded back.
            </p>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-sand-700">
              A warmer, simpler laundry experience for the web. Register once, use your QR-linked bag, and schedule pickups in a few clear steps.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/book">
                <ActionButton asChild>Book now</ActionButton>
              </Link>
              <Link href="/how-it-works">
                <ActionButton asChild variant="secondary">
                  How it works
                </ActionButton>
              </Link>
            </div>
            <p className="mt-6 text-base leading-8 text-sand-700">
              Returned within 48 hours with monthly billing in CHF and no online checkout at pickup time.
            </p>
          </div>

          <HeroVisual />
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16">
          <SectionHeading
            eyebrow="Pricing & billing"
            title="Simple. Transparent. Convenient."
            description="Clear pricing per bag, no complicated tariffs, and one monthly invoice by email."
            centered
          />
          <div className="mx-auto mt-10 grid max-w-4xl gap-5 md:grid-cols-2">
            <article className="rounded-[2rem] border border-sand-200 bg-white/80 p-8 shadow-soft">
              <p className="text-lg font-semibold text-sand-700">One-time order</p>
              <div className="mt-6 font-display text-6xl leading-none">CHF 55</div>
              <p className="mt-3 text-sand-700">per laundry bag</p>
              <p className="mt-5 text-sm leading-7 text-sand-700">
                Approx. 5 to 6 kg of everyday laundry. Washing, drying, ironing, and folding included.
              </p>
            </article>
            <article className="relative rounded-[2rem] border border-sand-200 bg-white/90 p-8 shadow-glow">
              <span className="absolute right-5 top-5 rounded-full bg-gold-pill px-4 py-2 text-xs font-extrabold uppercase tracking-[0.2em] text-white">
                Popular
              </span>
              <p className="text-lg font-semibold text-sand-700">Subscription</p>
              <div className="mt-6 font-display text-6xl leading-none">CHF 50</div>
              <p className="mt-3 text-sand-700">per bag</p>
              <p className="mt-5 text-sm leading-7 text-sand-700">
                Best for fixed weekly pickups with the same premium wash, dry, iron, and fold flow.
              </p>
            </article>
          </div>
          <div className="mx-auto mt-5 max-w-4xl rounded-[2rem] border border-sand-200 bg-white/80 p-6 shadow-soft">
            <div className="flex flex-wrap items-center justify-between gap-3 text-lg font-semibold">
              <span>Shirts & blouses</span>
              <span className="font-display text-3xl">+ CHF 4 / piece</span>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-20">
          <SectionHeading
            eyebrow="Our service"
            title="We handle the part that takes time."
            description="Inspired by the mobile references, the homepage now stays clean: service quality, bag-based convenience, and clear reasons to book."
          />
          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {services.map((service) => (
              <article key={service.title} className="rounded-[2rem] border border-sand-200 bg-white/80 p-6 shadow-soft">
                <h3 className="font-display text-3xl leading-none">{service.title}</h3>
                <p className="mt-4 text-sm leading-7 text-sand-700">{service.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-10">
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
                <p className="text-xs font-extrabold uppercase tracking-[0.28em] text-sand-700">Everyday laundry</p>
                <h2 className="mt-3 font-display text-5xl leading-none">Designed for repeat use, not one-off friction.</h2>
                <div className="mt-6 flex flex-wrap gap-3 text-sm font-semibold text-sand-700">
                  <span className="rounded-full border border-sand-200 bg-sand-50 px-4 py-3">Shirts</span>
                  <span className="rounded-full border border-sand-200 bg-sand-50 px-4 py-3">Trousers</span>
                  <span className="rounded-full border border-sand-200 bg-sand-50 px-4 py-3">Underwear</span>
                  <span className="rounded-full border border-sand-200 bg-sand-50 px-4 py-3">Sportswear</span>
                  <span className="rounded-full border border-sand-200 bg-sand-50 px-4 py-3">Towels</span>
                </div>
                <div className="mt-8">
                  <Link href="/book">
                    <ActionButton asChild>Start your booking</ActionButton>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-20">
          <SectionHeading
            eyebrow="Preparation"
            title="Prepare it simply. We handle the rest."
            description="The detailed process is now on its own page, while the homepage keeps only the most important preparation guidance."
          />
          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            {rules.map((rule) => (
              <article key={rule.title} className="rounded-[2rem] border border-sand-200 bg-white/80 p-6 shadow-soft">
                <h3 className="font-display text-3xl leading-none">{rule.title}</h3>
                <ul className="mt-4 space-y-3 text-sm leading-7 text-sand-700">
                  {rule.items.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
          <div className="mt-10 rounded-[2rem] bg-[linear-gradient(135deg,#b88749,#8c6338)] p-8 text-white shadow-glow">
            <h3 className="font-display text-4xl leading-none">Ready for less laundry effort?</h3>
            <p className="mt-4 max-w-2xl text-base leading-8 text-white/85">
              Keep the homepage simple and go straight into a separate booking flow when you are ready.
            </p>
            <div className="mt-6 flex flex-wrap gap-4">
              <Link href="/book">
                <ActionButton asChild variant="secondary">
                  Book now
                </ActionButton>
              </Link>
              <Link href="/how-it-works">
                <ActionButton asChild variant="secondary">
                  View the full process
                </ActionButton>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
