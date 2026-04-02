"use client";

import Image from "next/image";
import Link from "next/link";

export function formatCurrency(value) {
  return new Intl.NumberFormat("de-CH", {
    style: "currency",
    currency: "CHF",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

export function formatPickupDate(value) {
  if (!value) return "Not selected";
  const [year, month, day] = value.split("-");
  return new Date(year, Number(month) - 1, day).toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function capitalize(value) {
  if (!value) return "Not selected";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function apiFetch(pathname, options = {}) {
  return fetch(pathname, {
    credentials: "same-origin",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
}

export function PageGlow() {
  return (
    <>
      <div className="pointer-events-none fixed left-[-8rem] top-24 h-80 w-80 rounded-full bg-sand-300/50 blur-3xl" />
      <div className="pointer-events-none fixed right-[-10rem] top-[28rem] h-96 w-96 rounded-full bg-amber-100/70 blur-3xl" />
    </>
  );
}

export function TopNav({
  compact = false,
  ctaHref = "/book",
  ctaLabel = "Book now",
  userName = "",
  onSignout,
}) {
  return (
    <header className="sticky top-0 z-40 px-4 pt-5">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 rounded-full border border-sand-200 bg-white/75 px-5 py-4 shadow-glow backdrop-blur">
        <Link href="/" className="font-display text-4xl font-bold">
          laundry.li
        </Link>
        <nav className="hidden flex-wrap gap-5 text-sm font-semibold text-sand-700 xl:flex">
          <Link href="/">Home</Link>
          <Link href="/how-it-works">How it works</Link>
          <Link href="/book">Book pickup</Link>
          {!compact ? <Link href="/admin">Admin</Link> : null}
        </nav>
        <div className="flex flex-wrap items-center justify-end gap-3">
          {userName ? (
            <>
              <span className="rounded-full border border-sand-200 bg-white px-4 py-2 text-sm font-extrabold text-sand-700">
                {userName}
              </span>
              {onSignout ? (
                <button type="button" onClick={onSignout} className="text-sm font-extrabold text-sand-700">
                  Sign out
                </button>
              ) : null}
            </>
          ) : null}
          {!compact ? (
            <Link href="/admin" className="text-sm font-extrabold text-sand-700">
              Admin
            </Link>
          ) : null}
          <Link
            href={ctaHref}
            className="inline-flex items-center justify-center rounded-full bg-gold-pill px-5 py-3 text-sm font-extrabold text-white shadow-glow transition hover:-translate-y-0.5"
          >
            {ctaLabel}
          </Link>
        </div>
      </div>
    </header>
  );
}

export function QrCard({
  title = "Your bag QR",
  subtitle = "Scan this code on your bag for future pickups.",
  bagCode,
  qrSvg,
  className = "",
}) {
  return (
    <div className={`rounded-[1.6rem] border border-sand-200 bg-white/88 p-5 shadow-soft ${className}`}>
      <small className="block text-sand-600">{title}</small>
      <strong className="mt-2 block text-lg text-sand-900">{bagCode || "Bag code pending"}</strong>
      <p className="mt-2 text-sm leading-6 text-sand-700">{subtitle}</p>
      {qrSvg ? (
        <div className="mt-5 flex items-center justify-center rounded-[1.4rem] border border-sand-200 bg-sand-50 p-4">
          <div
            className="h-36 w-36 text-sand-700 [&_svg]:h-full [&_svg]:w-full"
            dangerouslySetInnerHTML={{ __html: qrSvg }}
          />
        </div>
      ) : null}
    </div>
  );
}

export function SectionHeading({ eyebrow, title, description, centered = false }) {
  return (
    <div className={centered ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
      <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.28em] text-sand-700">{eyebrow}</p>
      <h2 className="font-display text-4xl leading-none text-sand-900 md:text-5xl">{title}</h2>
      <p className="mt-4 text-base leading-8 text-sand-700">{description}</p>
    </div>
  );
}

export function ActionButton({ variant = "primary", className = "", asChild = false, children, ...props }) {
  const styles =
    variant === "primary"
      ? "bg-gold-pill text-white shadow-glow"
      : "border border-sand-200 bg-white/85 text-sand-900";

  if (asChild) {
    return (
      <span
        className={`inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-extrabold transition hover:-translate-y-0.5 ${styles} ${className}`}
      >
        {children}
      </span>
    );
  }

  return (
    <button
      className={`inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-extrabold transition hover:-translate-y-0.5 ${styles} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function Input({ label, className = "", ...props }) {
  return (
    <label className={`flex flex-col gap-2 ${className}`}>
      <span className="text-sm font-semibold text-sand-700">{label}</span>
      <input
        className="rounded-[1.25rem] border border-sand-200 bg-white/90 px-4 py-3 text-sm text-sand-900 outline-none transition focus:border-sand-400 focus:ring-2 focus:ring-sand-200"
        {...props}
      />
    </label>
  );
}

export function Textarea({ label, className = "", ...props }) {
  return (
    <label className={`flex flex-col gap-2 ${className}`}>
      <span className="text-sm font-semibold text-sand-700">{label}</span>
      <textarea
        className="min-h-28 rounded-[1.25rem] border border-sand-200 bg-white/90 px-4 py-3 text-sm text-sand-900 outline-none transition focus:border-sand-400 focus:ring-2 focus:ring-sand-200"
        {...props}
      />
    </label>
  );
}

export function RadioPill({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-4 py-3 text-sm font-extrabold transition ${
        active
          ? "border-sand-600 bg-gold-pill text-white shadow-soft"
          : "border-sand-200 bg-white/85 text-sand-800"
      }`}
    >
      {children}
    </button>
  );
}

export function LaundryTypeCard({ active, label, description, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-[1.6rem] border p-5 text-left transition ${
        active
          ? "border-sand-600 bg-gradient-to-br from-sand-500 to-sand-700 text-white shadow-soft"
          : "border-sand-200 bg-white/80 text-sand-800"
      }`}
    >
      <div className="font-display text-3xl">{label}</div>
      {description ? (
        <p className={`mt-2 text-sm ${active ? "text-white/85" : "text-sand-600"}`}>{description}</p>
      ) : null}
    </button>
  );
}

export function HeroVisual() {
  return (
    <div className="mx-auto w-full max-w-xl">
      <div className="relative overflow-hidden rounded-[2.8rem] border border-white/70 bg-[linear-gradient(180deg,rgba(255,249,240,0.96),rgba(248,233,212,0.9))] p-4 shadow-glow">
        <div className="pointer-events-none absolute left-[-8%] top-[-8%] h-44 w-44 rounded-full bg-white/60 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 right-0 h-52 w-52 rounded-full bg-sand-300/35 blur-3xl" />

        <div className="relative overflow-hidden rounded-[2.2rem] border border-white/60 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.95),transparent_35%),linear-gradient(180deg,#f7ebdc_0%,#f2debf_100%)] px-6 pb-6 pt-8">
          <div className="relative mx-auto max-w-md">
            <Image
              src="/images/hero-bag.png"
              alt="Premium black laundry bag filled with folded clothes"
              width={720}
              height={720}
              priority
              className="relative z-10 mx-auto w-full drop-shadow-[0_28px_60px_rgba(34,24,15,0.28)]"
            />

            <div className="absolute bottom-[20%] left-1/2 z-20 w-16 -translate-x-1/2 rounded-[0.65rem] bg-white/92 p-1.5 shadow-[0_10px_30px_rgba(0,0,0,0.18)] sm:w-20">
              <Image
                src="/images/hero-qr-overlay.png"
                alt="QR code attached to the laundry bag"
                width={88}
                height={88}
                priority
                className="w-full rounded-[0.45rem]"
              />
            </div>

            <div className="absolute right-[-2%] top-[9%] z-20 w-40 sm:w-48">
              <Image
                src="/images/hero-status-card.png"
                alt="Bag scanned status card"
                width={244}
                height={92}
                priority
                className="w-full drop-shadow-[0_18px_45px_rgba(60,72,170,0.22)]"
              />
            </div>

            <div className="absolute inset-x-8 bottom-2 z-0 h-14 rounded-full bg-black/15 blur-2xl" />
          </div>

          <div className="mt-4 grid grid-cols-3 divide-x divide-sand-200 rounded-[1.6rem] border border-sand-200/80 bg-white/80 py-4 text-center text-sm font-semibold text-sand-700 backdrop-blur">
            <span>Wash</span>
            <span>Dry & Iron</span>
            <span>Fold</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div
      className={`fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full px-5 py-3 text-sm font-extrabold text-white shadow-glow ${
        toast.type === "error" ? "bg-red-600" : "bg-sand-900"
      }`}
    >
      {toast.message}
    </div>
  );
}
