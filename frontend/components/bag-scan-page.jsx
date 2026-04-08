"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { bookingSlots, laundryTypes } from "../lib/site-data";
import {
  ActionButton,
  apiFetch,
  capitalize,
  Footer,
  formatCurrency,
  formatPickupDate,
  Input,
  LaundryTypeCard,
  PageGlow,
  RadioPill,
  SectionHeading,
  Textarea,
  Toast,
  TopNav,
} from "./shared-ui";

const tomorrow = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
};

function SummaryRow({ label, value, strong = false }) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="text-sand-600">{label}</span>
      <span className={strong ? "font-extrabold text-sand-900" : "font-semibold text-sand-800"}>
        {value}
      </span>
    </div>
  );
}

function CounterCard({ title, subtitle, price, count, active = false, onDecrease, onIncrease }) {
  return (
    <article
      className={`rounded-[1.8rem] border p-5 transition ${
        active ? "border-sand-500 bg-white shadow-soft" : "border-sand-200 bg-white/80"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h4 className="font-display text-3xl leading-none">{title}</h4>
          <p className="mt-2 text-sm text-sand-600">{subtitle}</p>
        </div>
        <div className="rounded-full bg-sand-50 px-3 py-2 text-sm font-bold text-sand-700">
          {price}
        </div>
      </div>
      <div className="mt-6 flex items-center justify-between gap-4">
        <span className="text-sm font-semibold text-sand-700">Quantity</span>
        <div className="inline-flex items-center gap-4 rounded-full border border-sand-200 bg-sand-50 px-4 py-2">
          <button type="button" onClick={onDecrease} className="text-lg font-bold text-sand-600">-</button>
          <span className="min-w-6 text-center text-sm font-extrabold text-sand-900">{count}</span>
          <button type="button" onClick={onIncrease} className="text-lg font-bold text-sand-600">+</button>
        </div>
      </div>
    </article>
  );
}

function CardShell({ eyebrow, title, description, children }) {
  return (
    <div className="rounded-[2rem] border border-sand-200 bg-white/90 p-6 shadow-soft md:p-7">
      {eyebrow ? (
        <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-sand-700">{eyebrow}</p>
      ) : null}
      <h3 className="mt-3 font-display text-4xl leading-none md:text-5xl">{title}</h3>
      {description ? (
        <p className="mt-3 max-w-2xl text-sm leading-7 text-sand-700">{description}</p>
      ) : null}
      <div className="mt-6">{children}</div>
    </div>
  );
}

export default function BagScanPage({ code }) {
  const isScanMode = !code || code === "scan";

  // ── email lookup state (scan mode) ──────────────────────────────────────────
  const [scanEmail, setScanEmail] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailNotFound, setEmailNotFound] = useState(false);

  // ── bag/customer state ───────────────────────────────────────────────────────
  const [customer, setCustomer] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(!isScanMode);

  // ── order state ──────────────────────────────────────────────────────────────
  const defaultForm = {
    pickupDate: tomorrow(),
    pickupSlot: bookingSlots[0],
    billingPlan: "single",
    laundryType: "dark",
    shirtsCount: "0",
    notes: "",
    // editable address fields (pre-filled from customer)
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
  const [locationLoading, setLocationLoading] = useState(false);

  // ── live bill summary ────────────────────────────────────────────────────────
  const summary = useMemo(() => {
    const base = form.billingPlan === "subscription" ? 50 : 55;
    const shirts = Number(form.shirtsCount || 0) * 4;
    return { base, shirts, total: base + shirts };
  }, [form.billingPlan, form.shirtsCount]);

  // ── toast auto-dismiss ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(null), 3600);
    return () => clearTimeout(t);
  }, [toast]);

  // ── bag-code mode: lookup via code ───────────────────────────────────────────
  useEffect(() => {
    if (isScanMode) return;
    async function lookup() {
      try {
        const res = await fetch(`/api/bag/${encodeURIComponent(code)}`, {
          credentials: "same-origin",
        });
        if (res.status === 404) { setNotFound(true); return; }
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
      } catch { setNotFound(true); }
      finally { setLoading(false); }
    }
    lookup();
  }, [code, isScanMode]);

  // ── scan mode: email lookup ──────────────────────────────────────────────────
  async function handleEmailLookup(e) {
    e.preventDefault();
    const email = scanEmail.trim().toLowerCase();
    if (!email) return;
    setEmailLoading(true);
    setEmailNotFound(false);
    try {
      const res = await fetch(`/api/bag/email?email=${encodeURIComponent(email)}`, {
        credentials: "same-origin",
      });
      if (res.status === 404) { setEmailNotFound(true); return; }
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
    } catch { setEmailNotFound(true); }
    finally { setEmailLoading(false); }
  }

  // ── live location autofill ───────────────────────────────────────────────────
  function useLiveLocation() {
    if (!navigator.geolocation) {
      setToast({ type: "error", message: "Live location is not supported in this browser." });
      return;
    }
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${coords.latitude}&lon=${coords.longitude}`,
          );
          const data = await response.json();
          const addr = data.address || {};
          setForm((f) => ({
            ...f,
            address:
              [addr.house_number, addr.road].filter(Boolean).join(" ") ||
              data.display_name ||
              `${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)}`,
            city: addr.city || addr.town || addr.village || addr.county || "",
            postalCode: addr.postcode || "",
          }));
          setToast({ type: "success", message: "Live location loaded." });
        } catch {
          setForm((f) => ({
            ...f,
            address: `${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)}`,
          }));
        } finally { setLocationLoading(false); }
      },
      () => {
        setLocationLoading(false);
        setToast({ type: "error", message: "Unable to access your live location." });
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  // ── submit ───────────────────────────────────────────────────────────────────
  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.pickupDate) {
      setToast({ type: "error", message: "Please select a pickup date." });
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
      setToast({ type: "success", message: "Pickup confirmed!" });
    } catch (err) {
      setToast({ type: "error", message: err.message });
    } finally { setSubmitting(false); }
  }

  function resetForm() {
    setConfirmed(null);
    setForm(defaultForm);
    if (isScanMode) {
      setCustomer(null);
      setScanEmail("");
      setEmailNotFound(false);
    }
  }

  return (
    <div className="relative overflow-x-hidden">
      <PageGlow />
      <TopNav ctaHref="/book" ctaLabel="Book now" compact />

      <main className="mx-auto max-w-5xl px-4 py-14">

        {/* ── SCAN MODE: email step ─────────────────────────────────────────── */}
        {isScanMode && !customer && !confirmed && (
          <div className="mx-auto max-w-md">
            <CardShell
              eyebrow="Bag Scan"
              title="Welcome back"
              description="Enter the email you registered with to load your details and schedule a pickup."
            >
              <form onSubmit={handleEmailLookup} className="space-y-4">
                <Input
                  label="Email address"
                  type="email"
                  value={scanEmail}
                  onChange={(e) => setScanEmail(e.target.value)}
                  required
                />
                {emailNotFound && (
                  <p className="text-sm text-red-600">
                    No account found.{" "}
                    <Link href="/book" className="font-extrabold underline">
                      Register here
                    </Link>
                  </p>
                )}
                <ActionButton type="submit" disabled={emailLoading}>
                  {emailLoading ? "Looking up…" : "Continue"}
                </ActionButton>
              </form>
            </CardShell>
          </div>
        )}

        {/* ── BAGCODE MODE: loading ─────────────────────────────────────────── */}
        {loading && (
          <p className="text-center text-sand-600">Looking up your bag…</p>
        )}

        {/* ── BAGCODE MODE: not found ───────────────────────────────────────── */}
        {notFound && !loading && !isScanMode && (
          <div className="mx-auto max-w-md rounded-[2rem] border border-sand-200 bg-white/85 p-8 text-center shadow-soft">
            <p className="font-display text-4xl text-sand-900">Bag not found</p>
            <p className="mt-4 text-sm text-sand-700">
              The code <span className="font-extrabold">{code}</span> is not linked to any account.
            </p>
            <div className="mt-6">
              <Link href="/book">
                <ActionButton asChild>Register &amp; book</ActionButton>
              </Link>
            </div>
          </div>
        )}

        {/* ── BOOKING FORM ──────────────────────────────────────────────────── */}
        {customer && !loading && !confirmed && (
          <form onSubmit={handleSubmit}>
            <div className="grid gap-8 xl:grid-cols-[1.16fr_0.84fr]">

              {/* LEFT COLUMN */}
              <div className="space-y-6">

                {/* Welcome banner */}
                <div className="rounded-[2rem] bg-gold-pill p-6 text-white shadow-glow">
                  <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-white/75">
                    Bag detected
                  </p>
                  <p className="mt-2 font-display text-4xl leading-none">
                    Hi, {customer.firstName}!
                  </p>
                  <p className="mt-2 text-sm text-white/80">
                    {customer.address}, {customer.postalCode} {customer.city}
                  </p>
                </div>

                {/* Customize order */}
                <CardShell
                  eyebrow="Customize order"
                  title="Customize Your Laundry Order"
                  description="Choose the pieces and pickup details that need attention. The order summary updates live as you go."
                >
                  <div className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                      <Input
                        label="Pickup date"
                        type="date"
                        value={form.pickupDate}
                        min={tomorrow()}
                        onChange={(e) => set("pickupDate", e.target.value)}
                        required
                      />
                      <div className="space-y-2">
                        <span className="text-sm font-semibold text-sand-700">Time window</span>
                        <div className="flex flex-wrap gap-3">
                          {bookingSlots.map((slot) => (
                            <RadioPill
                              key={slot}
                              active={form.pickupSlot === slot}
                              onClick={() => set("pickupSlot", slot)}
                            >
                              {slot}
                            </RadioPill>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <span className="text-sm font-semibold text-sand-700">Laundry type</span>
                      <div className="grid gap-4 md:grid-cols-3">
                        {laundryTypes.map((type) => (
                          <LaundryTypeCard
                            key={type.value}
                            active={form.laundryType === type.value}
                            label={type.label}
                            description="Standard wash & fold"
                            onClick={() => set("laundryType", type.value)}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <span className="text-sm font-semibold text-sand-700">Billing plan</span>
                      <div className="flex flex-wrap gap-3">
                        <RadioPill
                          active={form.billingPlan === "single"}
                          onClick={() => set("billingPlan", "single")}
                        >
                          Standard laundry bag • CHF 55
                        </RadioPill>
                        <RadioPill
                          active={form.billingPlan === "subscription"}
                          onClick={() => set("billingPlan", "subscription")}
                        >
                          Premium plan • CHF 50
                        </RadioPill>
                      </div>
                    </div>

                    <div className="grid gap-5 md:grid-cols-2">
                      <CounterCard
                        title="Shirts / Blouses"
                        subtitle="Washed & finished"
                        price="+ CHF 4 / piece"
                        count={form.shirtsCount}
                        active={Number(form.shirtsCount) > 0}
                        onDecrease={() =>
                          set("shirtsCount", String(Math.max(0, Number(form.shirtsCount) - 1)))
                        }
                        onIncrease={() =>
                          set("shirtsCount", String(Number(form.shirtsCount) + 1))
                        }
                      />
                      <article className="rounded-[1.8rem] border border-sand-200 bg-white/80 p-5">
                        <div className="flex items-start gap-3">
                          <span className="mt-1 text-sand-600">⌁</span>
                          <div>
                            <h4 className="font-display text-3xl leading-none">Smart Pickup</h4>
                            <p className="mt-2 text-sm leading-7 text-sand-600">
                              Your bag is automatically recognised. No repeated address entry
                              is needed for future pickups.
                            </p>
                          </div>
                        </div>
                        <div className="mt-6 rounded-[1.2rem] bg-sand-50 px-4 py-4 text-sm text-sand-700">
                          Clean repeat UX with one bag identity, one account, and one
                          monthly billing flow.
                        </div>
                      </article>
                    </div>

                    <Textarea
                      label="Additional instructions"
                      value={form.notes}
                      onChange={(e) => set("notes", e.target.value)}
                      placeholder="Optional notes for the driver or cleaning team…"
                    />
                  </div>
                </CardShell>
              </div>

              {/* RIGHT COLUMN */}
              <div className="space-y-6">

                {/* Editable address / profile */}
                <CardShell
                  eyebrow="Collection details"
                  title="Tell us where to collect"
                  description="Your saved details are pre-filled. Update them if anything has changed."
                >
                  <div className="grid gap-4 md:grid-cols-2">
                    <Input
                      label="First name"
                      value={form.firstName}
                      onChange={(e) => set("firstName", e.target.value)}
                    />
                    <Input
                      label="Last name"
                      value={form.lastName}
                      onChange={(e) => set("lastName", e.target.value)}
                    />
                    <div className="md:col-span-2 flex flex-wrap items-end gap-3">
                      <Input
                        label="Address"
                        className="min-w-[220px] flex-1"
                        value={form.address}
                        onChange={(e) => set("address", e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={useLiveLocation}
                        disabled={locationLoading}
                        className="rounded-full border border-sand-200 bg-sand-50 px-4 py-3 text-sm font-extrabold text-sand-800"
                      >
                        {locationLoading ? "Locating…" : "Use live location"}
                      </button>
                    </div>
                    <Input
                      label="Postal code"
                      value={form.postalCode}
                      onChange={(e) => set("postalCode", e.target.value)}
                    />
                    <Input
                      label="City"
                      value={form.city}
                      onChange={(e) => set("city", e.target.value)}
                    />
                    <Input
                      label="Phone"
                      className="md:col-span-2"
                      value={form.phone}
                      onChange={(e) => set("phone", e.target.value)}
                    />
                  </div>
                </CardShell>

                {/* Order summary */}
                <div className="rounded-[2rem] border border-sand-200 bg-white/92 p-6 shadow-glow">
                  <h3 className="font-display text-4xl leading-none">Your Order Summary</h3>
                  <div className="mt-5 space-y-4 border-t border-sand-100 pt-5">
                    <SummaryRow
                      label={
                        form.billingPlan === "subscription"
                          ? "Premium laundry plan"
                          : "Standard laundry bag"
                      }
                      value={formatCurrency(summary.base)}
                    />
                    <SummaryRow
                      label={`Shirts / Blouses x ${form.shirtsCount || 0}`}
                      value={formatCurrency(summary.shirts)}
                    />
                  </div>
                  <div className="mt-8 border-t border-sand-100 pt-5">
                    <SummaryRow label="Total" value={formatCurrency(summary.total)} strong />
                  </div>
                  <div className="mt-6">
                    <ActionButton type="submit" disabled={submitting}>
                      {submitting ? "Booking…" : "Confirm pickup"}
                    </ActionButton>
                  </div>
                </div>

              </div>
            </div>
          </form>
        )}

        {/* ── CONFIRMATION ──────────────────────────────────────────────────── */}
        {confirmed && (
          <div className="mx-auto max-w-lg rounded-[2rem] border border-sand-200 bg-white/90 p-8 shadow-soft">
            <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-sand-500">
              Confirmed
            </p>
            <h2 className="mt-3 font-display text-5xl leading-none text-sand-900">
              Pickup booked!
            </h2>
            <p className="mt-4 text-sm leading-7 text-sand-700">
              Place your bag outside the door in the morning. We will collect it and return
              it clean within 48 hours.
            </p>

            <div className="mt-6 space-y-3 rounded-[1.6rem] bg-sand-50 p-5">
              <SummaryRow label="Invoice" value={confirmed.invoiceNumber} strong />
              <SummaryRow label="Pickup date" value={formatPickupDate(confirmed.pickupDate)} />
              <SummaryRow label="Time window" value={confirmed.pickupSlot} />
              <SummaryRow label="Laundry type" value={capitalize(confirmed.laundryType || "")} />
              {Number(confirmed.shirtsCount) > 0 && (
                <SummaryRow label="Shirts / Blouses" value={`x ${confirmed.shirtsCount}`} />
              )}
              <SummaryRow label="Amount" value={confirmed.amount} strong />
              <SummaryRow label="Return" value={confirmed.returnWindow} />
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/">
                <ActionButton asChild variant="secondary">Back to home</ActionButton>
              </Link>
              {confirmed.invoiceUrl && (
                <a
                  href={confirmed.invoiceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-full bg-sand-900 px-5 py-3 text-sm font-extrabold text-white transition hover:-translate-y-0.5"
                >
                  Print invoice
                </a>
              )}
              <button
                type="button"
                onClick={resetForm}
                className="inline-flex items-center justify-center rounded-full border border-sand-200 bg-white/85 px-5 py-3 text-sm font-extrabold text-sand-900 transition hover:-translate-y-0.5"
              >
                Book another
              </button>
            </div>
          </div>
        )}
      </main>

      <Footer />
      <Toast toast={toast} />
    </div>
  );
}
