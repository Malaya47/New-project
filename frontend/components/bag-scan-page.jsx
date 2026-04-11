"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { bookingSlots } from "../lib/site-data";
import { apiFetch, PageGlow, Toast, TopNav } from "./shared-ui";

const tomorrow = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
};

function formatShortDate(dateStr) {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function MobileHeader({ step, totalSteps, onBack, onClose }) {
  return (
    <div className="sticky top-0 z-30 flex items-center justify-between bg-[#fbf4ea]/95 px-5 py-4 backdrop-blur lg:hidden">
      {onBack ? (
        <button
          type="button"
          onClick={onBack}
          className="flex items-center text-sand-700"
          aria-label="Back"
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
      ) : (
        <div className="w-6" />
      )}
      <span className="font-display text-2xl text-sand-900">laundry.li</span>
      {step && totalSteps ? (
        <span className="text-xs font-semibold text-sand-500">
          Step {step} of {totalSteps}
        </span>
      ) : onClose ? (
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="text-sand-700"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      ) : (
        <div className="w-6" />
      )}
    </div>
  );
}

function DetailRow({ icon, label, value }) {
  return (
    <div className="flex items-center gap-3 border-b border-sand-100 py-3 last:border-0">
      <span className="flex-shrink-0 text-sand-500">{icon}</span>
      <span className="w-20 flex-shrink-0 text-xs text-sand-500">{label}</span>
      <span className="text-sm font-semibold text-sand-900">{value}</span>
    </div>
  );
}

function TshirtWhite() {
  return (
    <svg viewBox="0 0 64 64" fill="none" className="h-12 w-12">
      <path
        d="M16 16L8 28l12 5V52h24V33l12-5-8-12-10 7c-1-3-4-5-6-5s-5 2-6 5L16 16z"
        fill="#f5f0eb"
        stroke="#c8a97a"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TshirtDark() {
  return (
    <svg viewBox="0 0 64 64" fill="none" className="h-12 w-12">
      <path
        d="M16 16L8 28l12 5V52h24V33l12-5-8-12-10 7c-1-3-4-5-6-5s-5 2-6 5L16 16z"
        fill="#2a1c12"
        stroke="#c8a97a"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TshirtColor() {
  return (
    <svg viewBox="0 0 64 64" fill="none" className="h-12 w-12">
      <defs>
        <linearGradient id="cg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#e96c7a" />
          <stop offset="50%" stopColor="#f9a03f" />
          <stop offset="100%" stopColor="#5cb8e4" />
        </linearGradient>
      </defs>
      <path
        d="M16 16L8 28l12 5V52h24V33l12-5-8-12-10 7c-1-3-4-5-6-5s-5 2-6 5L16 16z"
        fill="url(#cg)"
        stroke="#c8a97a"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const LAUNDRY_TYPES = [
  { value: "white", label: "White", Icon: TshirtWhite },
  { value: "dark", label: "Dark", Icon: TshirtDark },
  { value: "color", label: "Color", Icon: TshirtColor },
];

const LAUNDRY_LABEL = { white: "White", dark: "Dark", color: "Color" };

export default function BagScanPage({ code }) {
  const isScanMode = !code || code === "scan";

  // step: 0 = email (scan mode only), 1 = booking form, 2 = review, 3 = confirmed
  const [step, setStep] = useState(isScanMode ? 0 : 1);

  const [scanEmail, setScanEmail] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailNotFound, setEmailNotFound] = useState(false);

  const [customer, setCustomer] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(!isScanMode);

  const defaultForm = {
    pickupDate: tomorrow(),
    pickupSlot: bookingSlots[0],
    billingPlan: "single",
    laundryType: "dark",
    shirtsCount: "0",
    notes: "",
    firstName: "",
    lastName: "",
    address: "",
    postalCode: "",
    city: "",
    phone: "",
  };

  const [form, setForm] = useState(defaultForm);
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(null);
  const [toast, setToast] = useState(null);
  const [checks, setChecks] = useState({
    sorted: false,
    noSpecial: false,
    understand: false,
  });

  const allChecked = checks.sorted && checks.noSpecial && checks.understand;

  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(null), 3600);
    return () => clearTimeout(t);
  }, [toast]);

  // bagcode mode: auto-lookup
  useEffect(() => {
    if (isScanMode) return;
    async function lookup() {
      try {
        const res = await fetch(`/api/bag/${encodeURIComponent(code)}`, {
          credentials: "same-origin",
        });
        if (res.status === 404) {
          setNotFound(true);
          return;
        }
        const data = await res.json();
        setCustomer(data);
        setForm((f) => ({
          ...f,
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          address: data.address || "",
          postalCode: data.postalCode || "",
          city: data.city || "",
          phone: data.phone || "",
        }));
        setStep(1);
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }
    lookup();
  }, [code, isScanMode]);

  async function handleEmailLookup(e) {
    e.preventDefault();
    const email = scanEmail.trim().toLowerCase();
    if (!email) return;
    setEmailLoading(true);
    setEmailNotFound(false);
    try {
      const res = await fetch(
        `/api/bag/email?email=${encodeURIComponent(email)}`,
        { credentials: "same-origin" },
      );
      if (res.status === 404) {
        setEmailNotFound(true);
        return;
      }
      const data = await res.json();
      setCustomer(data);
      setForm((f) => ({
        ...f,
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        address: data.address || "",
        postalCode: data.postalCode || "",
        city: data.city || "",
        phone: data.phone || "",
      }));
      setStep(1);
    } catch {
      setEmailNotFound(true);
    } finally {
      setEmailLoading(false);
    }
  }

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!allChecked) {
      setToast({
        type: "error",
        message: "Please confirm all checkboxes to continue.",
      });
      return;
    }
    setSubmitting(true);
    try {
      const body = isScanMode
        ? { email: scanEmail.trim().toLowerCase(), ...form }
        : { bagCode: code, ...form };
      const res = await apiFetch("/api/repeat-pickup", {
        method: "POST",
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unable to book pickup.");
      setConfirmed(data.order);
      setStep(3);
    } catch (err) {
      setToast({ type: "error", message: err.message });
    } finally {
      setSubmitting(false);
    }
  }

  function resetForm() {
    setConfirmed(null);
    setForm(defaultForm);
    setChecks({ sorted: false, noSpecial: false, understand: false });
    if (isScanMode) {
      setCustomer(null);
      setScanEmail("");
      setEmailNotFound(false);
      setStep(0);
    } else {
      setStep(1);
    }
  }

  const addressString = [
    form.address,
    [form.postalCode, form.city].filter(Boolean).join(" "),
  ]
    .filter(Boolean)
    .join(", ");

  // ── STEP 0: email entry ──────────────────────────────────────────────────────
  if (isScanMode && step === 0) {
    return (
      <div className="min-h-screen bg-[#fbf4ea]">
        <PageGlow />
        <TopNav ctaHref="/book" ctaLabel="Book now" compact />
        <MobileHeader onClose={() => {}} />
        <main className="mx-auto max-w-md px-5 pb-16 lg:pt-8">
          <div className="pb-6 pt-4">
            <p className="text-xs font-extrabold uppercase tracking-widest text-sand-500">
              Bag Scan
            </p>
            <h1 className="mt-2 font-display text-[2rem] leading-tight text-sand-900">
              Welcome back
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-sand-600">
              Enter your email to load your details and schedule a pickup.
            </p>
          </div>
          <form onSubmit={handleEmailLookup} className="space-y-4">
            <div className="rounded-2xl border border-sand-200 bg-white px-4 py-5 shadow-soft">
              <label className="flex flex-col gap-2">
                <span className="text-xs font-semibold text-sand-500">
                  Email address
                </span>
                <input
                  type="email"
                  value={scanEmail}
                  onChange={(e) => setScanEmail(e.target.value)}
                  required
                  className="bg-transparent text-sm text-sand-900 outline-none placeholder:text-sand-300"
                  placeholder="you@example.com"
                />
              </label>
            </div>
            {emailNotFound && (
              <p className="text-sm text-red-600">
                No account found.{" "}
                <Link href="/book" className="font-extrabold underline">
                  Register here
                </Link>
              </p>
            )}
            <button
              type="submit"
              disabled={emailLoading}
              className="w-full rounded-full bg-gold-pill py-4 text-sm font-extrabold text-white shadow-glow disabled:opacity-60"
            >
              {emailLoading ? "Looking up…" : "Continue"}
            </button>
          </form>
        </main>
        <Toast toast={toast} />
      </div>
    );
  }

  // ── LOADING / NOT FOUND (bagcode mode) ──────────────────────────────────────
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fbf4ea]">
        <p className="text-sm text-sand-600">Looking up your bag…</p>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-[#fbf4ea]">
        <PageGlow />
        <TopNav ctaHref="/book" ctaLabel="Book now" compact />
        <MobileHeader />
        <main className="mx-auto max-w-md px-5 py-12 text-center">
          <p className="font-display text-4xl text-sand-900">Bag not found</p>
          <p className="mt-4 text-sm text-sand-700">
            The code <span className="font-extrabold">{code}</span> is not
            linked to any account.
          </p>
          <Link
            href="/book"
            className="mt-6 inline-flex rounded-full bg-gold-pill px-6 py-3 text-sm font-extrabold text-white shadow-glow"
          >
            Register &amp; book
          </Link>
        </main>
      </div>
    );
  }

  // ── STEP 1: booking form ─────────────────────────────────────────────────────
  if (step === 1 && customer) {
    const addressCard = (
      <div className="mb-6 flex items-center gap-3 rounded-2xl border border-sand-200 bg-white px-4 py-4 shadow-soft">
        <span className="flex-shrink-0 text-sand-500">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
            <circle cx="12" cy="9" r="2.5" />
          </svg>
        </span>
        <div>
          <p className="text-sm font-semibold text-sand-900">
            {addressString || `${customer.firstName} ${customer.lastName}`}
          </p>
          <p className="mt-0.5 text-xs text-sand-400">Automatically detected</p>
        </div>
      </div>
    );

    const pickupSection = (
      <>
        <p className="mb-3 text-sm font-extrabold text-sand-800">
          Next available pickup
        </p>
        <div className="mb-4 rounded-2xl border border-sand-200 bg-white px-4 py-4 shadow-soft">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-display text-xl text-sand-900">
                {formatShortDate(form.pickupDate)}
              </p>
              <p className="mt-1 text-xs text-sand-400">Pickup until 13:00</p>
            </div>
            <span className="rounded-full bg-sand-100 px-3 py-1 text-xs font-extrabold text-sand-600">
              Available
            </span>
          </div>
        </div>
        <div className="mb-6 flex gap-2">
          {bookingSlots.map((slot) => (
            <button
              key={slot}
              type="button"
              onClick={() => set("pickupSlot", slot)}
              className={`flex-1 rounded-2xl border py-3 text-xs font-semibold transition ${
                form.pickupSlot === slot
                  ? "border-sand-600 bg-gold-pill text-white shadow-soft"
                  : "border-sand-200 bg-white text-sand-700"
              }`}
            >
              {form.pickupSlot === slot && "✓ "}
              {slot}
            </button>
          ))}
        </div>
      </>
    );

    const laundrySection = (
      <>
        <p className="mb-3 text-sm font-extrabold text-sand-800">
          Choose laundry type
        </p>
        <div className="mb-6 grid grid-cols-3 gap-3">
          {LAUNDRY_TYPES.map(({ value, label, Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => set("laundryType", value)}
              className={`flex flex-col items-center gap-2 rounded-2xl border-2 p-4 transition ${
                form.laundryType === value
                  ? "border-sand-600 bg-gradient-to-br from-sand-600 to-sand-800 text-white shadow-soft"
                  : "border-sand-200 bg-white text-sand-800"
              }`}
            >
              <Icon />
              <span className="text-xs font-extrabold">{label}</span>
            </button>
          ))}
        </div>
      </>
    );

    return (
      <div className="min-h-screen bg-[#fbf4ea]">
        <PageGlow />
        <TopNav ctaHref="/book" ctaLabel="Book now" compact />
        <MobileHeader
          onBack={
            isScanMode
              ? () => {
                  setCustomer(null);
                  setStep(0);
                }
              : undefined
          }
        />
        <main className="mx-auto max-w-5xl px-5 pb-16 lg:pt-8">
          <div className="pb-5 pt-2">
            <p className="text-xs font-extrabold uppercase tracking-widest text-sand-500">
              Bag detected
            </p>
            <h1 className="mt-2 font-display text-[2rem] leading-tight text-sand-900 lg:text-5xl">
              Have your laundry picked up
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-sand-600">
              Address automatically detected – just choose the time.
            </p>
          </div>

          {/* ── Mobile layout ── */}
          <div className="lg:hidden">
            {addressCard}
            {pickupSection}
            {laundrySection}
            <input
              type="text"
              placeholder="Note (optional)"
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              className="mb-5 w-full rounded-2xl border border-sand-200 bg-white px-4 py-3 text-sm text-sand-700 outline-none placeholder:text-sand-300 focus:border-sand-400"
            />
            <div className="mb-8 flex items-center gap-2 text-xs text-sand-500">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
              Return within 48h between 18:00–21:00
            </div>
            <button
              type="button"
              onClick={() => setStep(2)}
              className="mb-3 w-full rounded-full bg-gold-pill py-4 text-sm font-extrabold text-white shadow-glow"
            >
              Pick up laundry
            </button>
            <p className="text-center text-xs text-sand-400">
              No re-entry of address required
            </p>
          </div>

          {/* ── Desktop layout ── */}
          <div className="hidden lg:grid lg:grid-cols-[1fr_380px] lg:gap-8">
            {/* Left col */}
            <div>
              {addressCard}
              {pickupSection}
              {laundrySection}
              <input
                type="text"
                placeholder="Note (optional)"
                value={form.notes}
                onChange={(e) => set("notes", e.target.value)}
                className="w-full rounded-2xl border border-sand-200 bg-white px-4 py-3 text-sm text-sand-700 outline-none placeholder:text-sand-300 focus:border-sand-400"
              />
            </div>

            {/* Right col — sticky summary */}
            <div className="space-y-4">
              <div className="rounded-2xl border border-sand-200 bg-white p-6 shadow-soft">
                <p className="text-xs font-extrabold uppercase tracking-widest text-sand-500">
                  Order summary
                </p>
                <div className="mt-4 space-y-3 border-t border-sand-100 pt-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-sand-500">Address</span>
                    <span className="max-w-[160px] text-right font-semibold text-sand-900">
                      {addressString}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sand-500">Pickup</span>
                    <span className="font-semibold text-sand-900">
                      {formatShortDate(form.pickupDate)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sand-500">Time</span>
                    <span className="font-semibold text-sand-900">
                      {form.pickupSlot}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sand-500">Laundry</span>
                    <span className="font-semibold text-sand-900">
                      {LAUNDRY_LABEL[form.laundryType]}
                    </span>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2 rounded-xl bg-sand-50 px-3 py-2 text-xs text-sand-500">
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 6v6l4 2" />
                  </svg>
                  Return within 48h between 18:00–21:00
                </div>
              </div>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-full rounded-full bg-gold-pill py-4 text-sm font-extrabold text-white shadow-glow transition hover:-translate-y-0.5"
              >
                Pick up laundry
              </button>
              <p className="text-center text-xs text-sand-400">
                No re-entry of address required
              </p>
            </div>
          </div>
        </main>
        <Toast toast={toast} />
      </div>
    );
  }

  // ── STEP 2: review ───────────────────────────────────────────────────────────
  if (step === 2 && customer) {
    const summaryCard = (
      <div className="rounded-2xl border border-sand-200 bg-white px-5 shadow-soft">
        <DetailRow
          icon={
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
              <circle cx="12" cy="9" r="2" />
            </svg>
          }
          label="Address"
          value={addressString}
        />
        <DetailRow
          icon={
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          }
          label="Pickup"
          value={formatShortDate(form.pickupDate)}
        />
        <DetailRow
          icon={
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
          }
          label="Time"
          value={form.pickupSlot}
        />
        <DetailRow
          icon={
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="M20.38 3.46L16 2a4 4 0 01-8 0L3.62 3.46a2 2 0 00-1.34 2.23l.58 3.57a1 1 0 00.99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 002-2V10h2.15a1 1 0 00.99-.84l.58-3.57a2 2 0 00-1.34-2.23z" />
            </svg>
          }
          label="Laundry type"
          value={LAUNDRY_LABEL[form.laundryType] || form.laundryType}
        />
        <DetailRow
          icon={
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <rect x="2" y="7" width="20" height="14" rx="2" />
              <path d="M16 7V5a2 2 0 00-4 0v2" />
            </svg>
          }
          label="Return"
          value="In 48h between 18:00–21:00"
        />
      </div>
    );

    const shirtsCard = (
      <div className="flex items-center justify-between rounded-2xl border border-sand-200 bg-white px-5 py-4 shadow-soft">
        <div className="flex items-center gap-3">
          <span className="text-sand-500">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="M20.38 3.46L16 2a4 4 0 01-8 0L3.62 3.46a2 2 0 00-1.34 2.23l.58 3.57a1 1 0 00.99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 002-2V10h2.15a1 1 0 00.99-.84l.58-3.57a2 2 0 00-1.34-2.23z" />
            </svg>
          </span>
          <span className="text-sm font-semibold text-sand-900">
            Shirts / Blouses
          </span>
        </div>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() =>
              set(
                "shirtsCount",
                String(Math.max(0, Number(form.shirtsCount) - 1)),
              )
            }
            className="flex h-8 w-8 items-center justify-center rounded-full border border-sand-200 font-bold text-sand-700"
          >
            −
          </button>
          <span className="w-5 text-center text-sm font-extrabold text-sand-900">
            {form.shirtsCount}
          </span>
          <button
            type="button"
            onClick={() =>
              set("shirtsCount", String(Number(form.shirtsCount) + 1))
            }
            className="flex h-8 w-8 items-center justify-center rounded-full border border-sand-200 font-bold text-sand-700"
          >
            +
          </button>
        </div>
      </div>
    );

    const notesCard = (
      <div className="rounded-2xl border border-sand-200 bg-white px-5 py-4 shadow-soft">
        <div className="mb-3 flex items-center gap-2">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="text-sand-500"
          >
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
          </svg>
          <span className="text-xs font-semibold text-sand-500">Note</span>
        </div>
        <input
          type="text"
          placeholder="Optional note"
          value={form.notes}
          onChange={(e) => set("notes", e.target.value)}
          className="w-full rounded-xl border border-sand-100 bg-sand-50 px-3 py-2 text-sm text-sand-700 outline-none placeholder:text-sand-300"
        />
      </div>
    );

    const billingCard = (
      <div className="flex items-start gap-3 rounded-2xl bg-sand-200/40 px-5 py-4">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          className="mt-0.5 flex-shrink-0 text-sand-600"
        >
          <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
        <div>
          <p className="text-sm font-extrabold text-sand-800">Billing</p>
          <p className="mt-1 text-xs leading-relaxed text-sand-600">
            Your order is collected and conveniently billed at the end of the
            month by email.
          </p>
        </div>
      </div>
    );

    const checkboxes = (
      <div className="divide-y divide-sand-100 border-t border-sand-100">
        {[
          { key: "sorted", label: "My laundry is pre-sorted." },
          {
            key: "noSpecial",
            label: "There are no special care items in the bag.",
          },
          {
            key: "understand",
            label:
              "I understand that Laundry.li washes the items as submitted.",
          },
        ].map(({ key, label }) => (
          <label
            key={key}
            className="flex cursor-pointer items-start gap-3 py-4"
          >
            <input
              type="checkbox"
              checked={checks[key]}
              onChange={(e) =>
                setChecks((c) => ({ ...c, [key]: e.target.checked }))
              }
              className="mt-0.5 h-4 w-4 flex-shrink-0 accent-sand-700"
            />
            <span className="text-sm text-sand-700">{label}</span>
          </label>
        ))}
      </div>
    );

    const submitBtn = (
      <form onSubmit={handleSubmit}>
        <button
          type="submit"
          disabled={submitting || !allChecked}
          className={`w-full rounded-full py-4 text-sm font-extrabold text-white shadow-glow transition ${allChecked && !submitting ? "bg-gold-pill hover:-translate-y-0.5" : "cursor-not-allowed bg-sand-300"}`}
        >
          {submitting ? "Booking…" : "Pick up laundry"}
        </button>
      </form>
    );

    return (
      <div className="min-h-screen bg-[#fbf4ea]">
        <PageGlow />
        <TopNav ctaHref="/book" ctaLabel="Book now" compact />
        <MobileHeader step={2} totalSteps={2} onBack={() => setStep(1)} />
        <main className="mx-auto max-w-5xl px-5 pb-16 lg:pt-8">
          <div className="pb-6 pt-2">
            <p className="text-xs font-extrabold uppercase tracking-widest text-sand-500">
              Review order
            </p>
            <h1 className="mt-2 font-display text-[2rem] leading-tight text-sand-900 lg:text-5xl">
              Almost done!
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-sand-600">
              Please check your details – then we'll pick up your laundry bag.
            </p>
          </div>

          {/* ── Mobile layout ── */}
          <div className="space-y-4 lg:hidden">
            {summaryCard}
            {shirtsCard}
            {notesCard}
            {billingCard}
            <div className="mb-2">{checkboxes}</div>
            {submitBtn}
            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full text-center text-sm text-sand-500 underline underline-offset-2"
            >
              Edit details
            </button>
          </div>

          {/* ── Desktop layout ── */}
          <div className="hidden lg:grid lg:grid-cols-[1fr_380px] lg:gap-8">
            {/* Left col */}
            <div className="space-y-4">
              {summaryCard}
              {shirtsCard}
              {notesCard}
            </div>
            {/* Right col */}
            <div className="space-y-4">
              {billingCard}
              {checkboxes}
              {submitBtn}
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full text-center text-sm text-sand-500 underline underline-offset-2"
              >
                Edit details
              </button>
            </div>
          </div>
        </main>
        <Toast toast={toast} />
      </div>
    );
  }

  // ── STEP 3: confirmed ────────────────────────────────────────────────────────
  if (step === 3 && confirmed) {
    return (
      <div className="min-h-screen bg-[#fbf4ea]">
        <PageGlow />
        <TopNav ctaHref="/book" ctaLabel="Book now" compact />
        <MobileHeader />
        <main className="mx-auto max-w-5xl px-5 pb-16 lg:pt-8">
          {/* Desktop: two columns. Mobile: single centered column */}
          <div className="lg:grid lg:grid-cols-2 lg:gap-12 lg:items-start">
            {/* Left (or full-width on mobile) — hero section */}
            <div className="flex flex-col items-center lg:items-start">
              <div className="mb-5 mt-8 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-sand-300 to-sand-500 shadow-glow lg:mt-0">
                <svg
                  width="34"
                  height="34"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h1 className="text-center font-display text-[2.2rem] text-sand-900 lg:text-left lg:text-5xl">
                Pickup confirmed
              </h1>
              <p className="mt-2 text-center text-sm text-sand-500 lg:text-left">
                Your Laundry Bag will be collected as planned.
              </p>

              {/* Summary card */}
              <div className="mt-6 w-full rounded-2xl border border-sand-200 bg-white px-5 shadow-soft">
                <DetailRow
                  icon={
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <rect x="3" y="4" width="18" height="18" rx="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                  }
                  label="Pickup"
                  value={
                    <strong>{formatShortDate(confirmed.pickupDate)}</strong>
                  }
                />
                <DetailRow
                  icon={
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 6v6l4 2" />
                    </svg>
                  }
                  label="Time"
                  value={<strong>{confirmed.pickupSlot}</strong>}
                />
                <DetailRow
                  icon={
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <rect x="2" y="7" width="20" height="14" rx="2" />
                      <path d="M16 7V5a2 2 0 00-4 0v2" />
                    </svg>
                  }
                  label="Return"
                  value={
                    <strong>
                      {confirmed.returnWindow || "In 48h between 18:00–21:00"}
                    </strong>
                  }
                />
              </div>
            </div>

            {/* Right (or bottom on mobile) — next steps */}
            <div className="mt-8 lg:mt-0">
              <p className="text-center font-display text-xl text-sand-900 lg:text-left lg:text-2xl">
                What you need to do now
              </p>
              <div className="mt-4 w-full divide-y divide-sand-100">
                {[
                  { emoji: "🛍️", text: "Fill your Laundry Bag" },
                  { emoji: "🚪", text: "Put it outside in the morning" },
                  { emoji: "✨", text: "We take care of the rest" },
                ].map(({ emoji, text }) => (
                  <div key={text} className="flex items-center gap-4 py-4">
                    <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-sand-100 text-xl">
                      {emoji}
                    </span>
                    <span className="text-sm font-semibold text-sand-800">
                      {text}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex items-center gap-3 rounded-2xl bg-sand-400/20 px-5 py-4">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="flex-shrink-0 text-sand-600"
                >
                  <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                <p className="text-sm font-semibold text-sand-800">
                  No further action needed – we take care of everything for you.
                </p>
              </div>

              <button
                type="button"
                onClick={resetForm}
                className="mt-8 w-full rounded-full border-2 border-sand-200 bg-white py-4 text-sm font-extrabold text-sand-900 transition hover:-translate-y-0.5"
              >
                Plan new pickup
              </button>
              <div className="mt-3 text-center lg:text-left">
                <Link
                  href="/"
                  className="text-sm text-sand-500 underline underline-offset-2"
                >
                  To homepage
                </Link>
              </div>
            </div>
          </div>
        </main>
        <Toast toast={toast} />
      </div>
    );
  }

  return null;
}
