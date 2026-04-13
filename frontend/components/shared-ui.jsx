"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { t } from "../lib/translations";

export function formatCurrency(value) {
  return new Intl.NumberFormat("de-CH", {
    style: "currency",
    currency: "CHF",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

export function formatPickupDate(value) {
  if (!value) return t("Not selected");
  const [year, month, day] = value.split("-");
  return new Date(year, Number(month) - 1, day).toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function capitalize(value) {
  if (!value) return t("Not selected");
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
      <div className="pointer-events-none fixed left-[-8rem] top-24 h-80 w-80 rounded-full bg-sand-300/50 blur-3xl hidden lg:block" />
      <div className="pointer-events-none fixed right-[-10rem] top-[28rem] h-96 w-96 rounded-full bg-amber-100/70 blur-3xl hidden lg:block" />
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
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40">
      {/* ── Desktop pill nav (lg+) ──────────────────────────── */}
      <div className="hidden lg:block px-4 pt-5">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 rounded-full border border-sand-200 bg-white/75 px-5 py-4 shadow-glow backdrop-blur">
          <Link href="/" className="font-display text-4xl font-bold">
            laundry.li
          </Link>
          <nav className="hidden flex-wrap gap-5 text-sm font-semibold text-sand-700 xl:flex">
            <Link href="/">{t("Home")}</Link>
            <Link href="/services">{t("Services")}</Link>
            <Link href="/pricing">{t("Pricing")}</Link>
            <Link href="/preparation">{t("Preparation")}</Link>
            <Link href="/how-it-works">{t("How it works")}</Link>
            <Link href="/book">{t("Book pickup")}</Link>
            {!compact ? <Link href="/admin">Admin</Link> : null}
          </nav>
          <div className="flex flex-wrap items-center justify-end gap-3">
            {userName ? (
              <>
                <span className="rounded-full border border-sand-200 bg-white px-4 py-2 text-sm font-extrabold text-sand-700">
                  {userName}
                </span>
                {onSignout ? (
                  <button
                    type="button"
                    onClick={onSignout}
                    className="text-sm font-extrabold text-sand-700"
                  >
                    Sign out
                  </button>
                ) : null}
              </>
            ) : null}
            {!compact ? (
              <Link
                href="/admin"
                className="text-sm font-extrabold text-sand-700"
              >
                {t("Admin")}
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
      </div>

      {/* ── Mobile nav (below lg) ────────────────────────────── */}
      <div className="lg:hidden px-5 bg-[#fbf4ea]/90 backdrop-blur">
        <div className="flex items-center justify-between py-4">
          <Link href="/" className="font-display text-3xl font-bold">
            laundry.li
          </Link>
          <button
            type="button"
            aria-label={t("Toggle menu")}
            onClick={() => setMenuOpen((o) => !o)}
            className="text-sand-900 p-1"
          >
            {menuOpen ? (
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            )}
          </button>
        </div>

        {menuOpen && (
          <div className="pb-4 border-t border-sand-200">
            <nav className="flex flex-col gap-5 pt-4 text-base font-semibold text-sand-700">
              <Link href="/" onClick={() => setMenuOpen(false)}>
                {t("Home")}
              </Link>
              <Link href="/services" onClick={() => setMenuOpen(false)}>
                {t("Services")}
              </Link>
              <Link href="/pricing" onClick={() => setMenuOpen(false)}>
                {t("Pricing")}
              </Link>
              <Link href="/preparation" onClick={() => setMenuOpen(false)}>
                {t("Preparation")}
              </Link>
              <Link href="/how-it-works" onClick={() => setMenuOpen(false)}>
                {t("How it works")}
              </Link>
              <Link href="/book" onClick={() => setMenuOpen(false)}>
                {t("Book pickup")}
              </Link>
              {!compact ? (
                <Link href="/admin" onClick={() => setMenuOpen(false)}>
                  Admin
                </Link>
              ) : null}
            </nav>
            <div className="mt-5">
              <Link
                href={ctaHref}
                onClick={() => setMenuOpen(false)}
                className="inline-flex w-full items-center justify-center rounded-full bg-gold-pill px-5 py-3 text-sm font-extrabold text-white shadow-glow"
              >
                {ctaLabel}
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

export function QrCard({
  title = t("Your bag QR"),
  subtitle = t("Scan this code on your bag for future pickups."),
  bagCode,
  qrSvg,
  className = "",
}) {
  return (
    <div
      className={`rounded-[1.6rem] border border-sand-200 bg-white/88 p-5 shadow-soft ${className}`}
    >
      <small className="block text-sand-600">{title}</small>
      <strong className="mt-2 block text-lg text-sand-900">
        {bagCode || t("Bag code pending")}
      </strong>
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

export function SectionHeading({
  eyebrow,
  title,
  description,
  centered = false,
}) {
  return (
    <div className={centered ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
      <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.28em] text-sand-700">
        {eyebrow}
      </p>
      <h2 className="font-display text-4xl leading-none text-sand-900 md:text-5xl">
        {title}
      </h2>
      <p className="mt-4 text-base leading-8 text-sand-700">{description}</p>
    </div>
  );
}

export function ActionButton({
  variant = "primary",
  className = "",
  asChild = false,
  children,
  ...props
}) {
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
        <p
          className={`mt-2 text-sm ${active ? "text-white/85" : "text-sand-600"}`}
        >
          {description}
        </p>
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
            <span>{t("Wash")}</span>
            <span>{t("Dry & Iron")}</span>
            <span>{t("Fold")}</span>
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

export function Footer() {
  return (
    <footer className="mt-16 border-t border-sand-200 bg-sand-50">
      <div className="mx-auto max-w-7xl px-4 py-16">
        <div className="grid gap-12 md:grid-cols-2 xl:grid-cols-4">
          {/* Brand */}
          <div>
            <Link
              href="/"
              className="font-display text-3xl font-bold text-sand-900"
            >
              laundry.li
            </Link>
            <p className="mt-4 text-sm leading-7 text-sand-600">
              {t(
                "Premium laundry and dry cleaning delivered to your door. Modernizing fabric care for the busy professional.",
              )}
            </p>
            <div className="mt-5 flex gap-3">
              <a
                href="#"
                aria-label="Twitter"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-sand-200 bg-white text-sand-600 transition hover:border-sand-400 hover:text-sand-900"
              >
                <svg
                  width="15"
                  height="15"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.742l7.726-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622Zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href="#"
                aria-label="Instagram"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-sand-200 bg-white text-sand-600 transition hover:border-sand-400 hover:text-sand-900"
              >
                <svg
                  width="15"
                  height="15"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
              <a
                href="#"
                aria-label="Facebook"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-sand-200 bg-white text-sand-600 transition hover:border-sand-400 hover:text-sand-900"
              >
                <svg
                  width="15"
                  height="15"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-sm font-extrabold uppercase tracking-[0.2em] text-sand-900">
              {t("Services")}
            </h4>
            <ul className="mt-5 space-y-4 text-sm text-sand-600">
              <li>
                <a href="#" className="transition hover:text-sand-900">
                  {t("Wash & Fold")}
                </a>
              </li>
              <li>
                <a href="#" className="transition hover:text-sand-900">
                  {t("Dry Cleaning")}
                </a>
              </li>
              <li>
                <a href="#" className="transition hover:text-sand-900">
                  {t("Iron & Press")}
                </a>
              </li>
              <li>
                <a href="#" className="transition hover:text-sand-900">
                  {t("Commercial Laundry")}
                </a>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-sm font-extrabold uppercase tracking-[0.2em] text-sand-900">
              {t("Company")}
            </h4>
            <ul className="mt-5 space-y-4 text-sm text-sand-600">
              <li>
                <Link href="/" className="transition hover:text-sand-900">
                  {t("About Us")}
                </Link>
              </li>
              <li>
                <Link
                  href="/how-it-works"
                  className="transition hover:text-sand-900"
                >
                  {t("How it Works")}
                </Link>
              </li>
              <li>
                <Link href="/book" className="transition hover:text-sand-900">
                  {t("Pricing")}
                </Link>
              </li>
              <li>
                <a href="#" className="transition hover:text-sand-900">
                  {t("Careers")}
                </a>
              </li>
            </ul>
          </div>

          {/* Stay Updated */}
          <div>
            <h4 className="text-sm font-extrabold uppercase tracking-[0.2em] text-sand-900">
              {t("Stay Updated")}
            </h4>
            <p className="mt-4 text-sm leading-7 text-sand-600">
              {t(
                "Subscribe to our newsletter for tips on fabric care and exclusive offers.",
              )}
            </p>
            <div className="mt-5 space-y-3">
              <input
                type="email"
                placeholder={t("Email address")}
                className="w-full rounded-[1.25rem] bg-gold-pill px-4 py-3 text-sm font-semibold text-white placeholder-white/70 outline-none"
              />
              <button
                type="button"
                className="w-full rounded-[1.25rem] border border-sand-200 bg-white px-4 py-3 text-sm font-extrabold text-sand-900 shadow-soft transition hover:border-sand-400"
              >
                {t("Subscribe")}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-sand-200">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-6 text-sm text-sand-600">
          <p>{t("© 2026 laundry.li. All rights reserved.")}</p>
          <div className="flex gap-6">
            <a href="#" className="transition hover:text-sand-900">
              {t("Privacy Policy")}
            </a>
            <a href="#" className="transition hover:text-sand-900">
              {t("Terms of Service")}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
