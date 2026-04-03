"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { bookingSlots, laundryTypes } from "../lib/site-data";
import {
  ActionButton,
  apiFetch,
  Footer,
  formatPickupDate,
  Input,
  PageGlow,
  RadioPill,
  Toast,
  TopNav,
} from "./shared-ui";

const tomorrow = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
};

export default function BagScanPage({ code }) {
  const [customer, setCustomer] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(null);
  const [toast, setToast] = useState(null);

  const [form, setForm] = useState({
    pickupDate: tomorrow(),
    pickupSlot: bookingSlots[0],
    laundryType: "dark",
    notes: "",
  });

  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(null), 3600);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
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
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }
    lookup();
  }, [code]);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.pickupDate) {
      setToast({ type: "error", message: "Please select a pickup date." });
      return;
    }

    setSubmitting(true);
    try {
      const res = await apiFetch("/api/repeat-pickup", {
        method: "POST",
        body: JSON.stringify({ bagCode: code, ...form }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unable to book pickup.");
      setConfirmed(data.order);
      setToast({ type: "success", message: "Pickup confirmed!" });
    } catch (err) {
      setToast({ type: "error", message: err.message });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="relative overflow-x-hidden">
      <PageGlow />
      <TopNav ctaHref="/book" ctaLabel="Book now" compact />

      <main className="mx-auto max-w-xl px-4 py-14">
        {loading && (
          <p className="text-center text-sand-600">Looking up your bag…</p>
        )}

        {notFound && !loading && (
          <div className="rounded-[2rem] border border-sand-200 bg-white/85 p-8 text-center shadow-soft">
            <p className="font-display text-4xl text-sand-900">Bag not found</p>
            <p className="mt-4 text-sm text-sand-700">
              The code <span className="font-extrabold">{code}</span> is not linked to any account.
              Please check your bag or register a new order.
            </p>
            <div className="mt-6">
              <Link href="/book">
                <ActionButton asChild>Register &amp; book</ActionButton>
              </Link>
            </div>
          </div>
        )}

        {customer && !loading && !confirmed && (
          <div className="space-y-5">
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
              <span className="mt-3 inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-extrabold">
                {customer.bagCode}
              </span>
            </div>

            {/* Booking form */}
            <form
              onSubmit={handleSubmit}
              className="space-y-5 rounded-[2rem] border border-sand-200 bg-white/90 p-6 shadow-soft"
            >
              <h2 className="font-display text-3xl leading-none text-sand-900">
                Schedule pickup
              </h2>

              <Input
                label="Pickup date"
                type="date"
                value={form.pickupDate}
                min={tomorrow()}
                onChange={(e) => set("pickupDate", e.target.value)}
                required
              />

              <div className="flex flex-col gap-2">
                <span className="text-sm font-semibold text-sand-700">Time slot</span>
                <div className="flex flex-wrap gap-2">
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

              <div className="flex flex-col gap-2">
                <span className="text-sm font-semibold text-sand-700">Laundry type</span>
                <div className="flex flex-wrap gap-2">
                  {laundryTypes.map((t) => (
                    <RadioPill
                      key={t.value}
                      active={form.laundryType === t.value}
                      onClick={() => set("laundryType", t.value)}
                    >
                      {t.label}
                    </RadioPill>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-semibold text-sand-700">Notes (optional)</span>
                  <textarea
                    value={form.notes}
                    onChange={(e) => set("notes", e.target.value)}
                    placeholder="Any special instructions…"
                    className="min-h-20 rounded-[1.25rem] border border-sand-200 bg-white/90 px-4 py-3 text-sm text-sand-900 outline-none transition focus:border-sand-400 focus:ring-2 focus:ring-sand-200"
                  />
                </label>
              </div>

              <ActionButton type="submit" disabled={submitting}>
                {submitting ? "Booking…" : "Confirm pickup"}
              </ActionButton>
            </form>
          </div>
        )}

        {confirmed && (
          <div className="rounded-[2rem] border border-sand-200 bg-white/90 p-8 shadow-soft">
            <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-sand-500">
              Confirmed
            </p>
            <h2 className="mt-3 font-display text-5xl leading-none text-sand-900">
              Pickup booked!
            </h2>
            <p className="mt-4 text-sm leading-7 text-sand-700">
              Place your bag outside the door in the morning. We will collect it
              and return it clean within 48 hours.
            </p>

            <div className="mt-6 space-y-3 rounded-[1.6rem] bg-sand-50 p-5 text-sm text-sand-700">
              <div className="flex justify-between">
                <span>Invoice</span>
                <span className="font-extrabold text-sand-900">{confirmed.invoiceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>Pickup date</span>
                <span className="font-semibold text-sand-900">{formatPickupDate(confirmed.pickupDate)}</span>
              </div>
              <div className="flex justify-between">
                <span>Time slot</span>
                <span className="font-semibold text-sand-900">{confirmed.pickupSlot}</span>
              </div>
              <div className="flex justify-between">
                <span>Return</span>
                <span className="font-semibold text-sand-900">{confirmed.returnWindow}</span>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/">
                <ActionButton asChild variant="secondary">Back to home</ActionButton>
              </Link>
              <button
                type="button"
                onClick={() => { setConfirmed(null); setForm({ pickupDate: tomorrow(), pickupSlot: bookingSlots[0], laundryType: "dark", notes: "" }); }}
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
