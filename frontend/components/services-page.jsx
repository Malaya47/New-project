import Image from "next/image";
import { Footer, PageGlow, TopNav } from "./shared-ui";

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

export default function ServicesPage() {
  return (
    <div className="relative overflow-x-hidden min-h-screen bg-hero-wash">
      <PageGlow />
      <TopNav ctaHref="/book" ctaLabel="Book now" />

      <main className="mx-auto max-w-2xl px-4 pb-16 pt-10">
        {/* ── Section header ───────────────────────────── */}
        <div className="mb-8 text-center">
          <div className="mb-3 flex items-center justify-center gap-3">
            <div className="h-px w-8 bg-sand-400" />
            <span className="font-display text-xs italic font-semibold tracking-widest text-sand-500">
              Our Service
            </span>
            <div className="h-px w-8 bg-sand-400" />
          </div>
          <h1 className="font-display text-3xl font-bold leading-tight text-sand-900 sm:text-4xl">
            We take care of
            <br />
            the hard part
          </h1>
          <p className="mt-3 max-w-xs mx-auto text-sm leading-relaxed text-sand-600 sm:max-w-md sm:text-base">
            Washing, Drying, Ironing and Folding – so your laundry comes back
            clean and neat.
          </p>
        </div>

        {/* ── 2×2 service grid ─────────────────────────── */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {services.map((service) => (
            <article
              key={service.title}
              className="flex flex-col items-center gap-3 rounded-3xl border border-sand-200 bg-white/90 p-5 shadow-soft text-center"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-sand-50 shadow-soft sm:h-20 sm:w-20">
                <Image
                  src={service.icon}
                  alt={service.alt}
                  width={48}
                  height={48}
                  className="object-contain"
                />
              </div>
              <div>
                <h3 className="font-display text-sm font-bold text-sand-900 sm:text-base">
                  {service.title}
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-sand-600 sm:text-sm">
                  {service.description}
                </p>
              </div>
            </article>
          ))}
        </div>

        {/* ── Bag hero image ───────────────────────────── */}
        <div className="mt-6 overflow-hidden rounded-3xl shadow-soft">
          <Image
            src="/images/laundry-bag.png"
            alt="laundry.li bag with clean, folded clothes"
            width={800}
            height={520}
            className="w-full object-cover"
            priority
          />
        </div>

        {/* ── Clothing types ───────────────────────────── */}
        <div className="mt-6 rounded-3xl border border-sand-200 bg-white/90 p-6 shadow-soft">
          <h2 className="mb-5 font-display text-center text-base font-bold text-sand-900 sm:text-lg">
            Suitable for everyday laundry
          </h2>
          {/* Row of 3 + row of 2 centered */}
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
                  <span className="text-xs font-semibold text-sand-800 sm:text-sm">
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
                  <span className="text-xs font-semibold text-sand-800 sm:text-sm">
                    {item.label}
                  </span>
                </div>
              ))}
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
