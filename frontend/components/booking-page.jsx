"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
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
  QrCard,
  RadioPill,
  SectionHeading,
  Textarea,
  Toast,
  TopNav,
} from "./shared-ui";

const emptyFirstOrder = {
  email: "",
  password: "",
  firstName: "",
  lastName: "",
  address: "",
  postalCode: "",
  city: "",
  phone: "",
  pickupDate: "",
  pickupSlot: "12:00 - 13:00",
  billingPlan: "single",
  laundryType: "dark",
  shirtsCount: "0",
  notes: "",
};

const emptyRepeatOrder = {
  bagCode: "",
  pickupDate: "",
  pickupSlot: "12:00 - 13:00",
  billingPlan: "single",
  laundryType: "dark",
  shirtsCount: "0",
  notes: "",
};

const emptySignin = { email: "", password: "" };

function StepPill({ number, label, active, complete }) {
  return (
    <div
      className={`inline-flex items-center gap-3 rounded-full border px-4 py-3 ${
        active
          ? "border-sand-500 bg-white text-sand-900 shadow-soft"
          : complete
            ? "border-sand-300 bg-sand-50 text-sand-800"
            : "border-sand-200 bg-white/70 text-sand-500"
      }`}
    >
      <span
        className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-extrabold ${
          active || complete
            ? "bg-sand-100 text-sand-900"
            : "bg-sand-50 text-sand-500"
        }`}
      >
        {complete ? "✓" : number}
      </span>
      <span className="text-xs font-extrabold uppercase tracking-[0.18em]">
        {label}
      </span>
    </div>
  );
}

function SummaryRow({ label, value, strong = false }) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="text-sand-600">{label}</span>
      <span
        className={
          strong
            ? "font-extrabold text-sand-900"
            : "font-semibold text-sand-800"
        }
      >
        {value}
      </span>
    </div>
  );
}

function CounterCard({
  title,
  subtitle,
  price,
  count,
  active = false,
  onDecrease,
  onIncrease,
}) {
  return (
    <article
      className={`rounded-[1.8rem] border p-5 transition ${
        active
          ? "border-sand-500 bg-white shadow-soft"
          : "border-sand-200 bg-white/80"
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
          <button
            type="button"
            onClick={onDecrease}
            className="text-lg font-bold text-sand-600"
          >
            -
          </button>
          <span className="min-w-6 text-center text-sm font-extrabold text-sand-900">
            {count}
          </span>
          <button
            type="button"
            onClick={onIncrease}
            className="text-lg font-bold text-sand-600"
          >
            +
          </button>
        </div>
      </div>
    </article>
  );
}

function CardShell({ eyebrow, title, description, children }) {
  return (
    <div className="rounded-[2rem] border border-sand-200 bg-white/90 p-6 shadow-soft md:p-7">
      {eyebrow ? (
        <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-sand-700">
          {eyebrow}
        </p>
      ) : null}
      <h3 className="mt-3 font-display text-4xl leading-none md:text-5xl">
        {title}
      </h3>
      {description ? (
        <p className="mt-3 max-w-2xl text-sm leading-7 text-sand-700">
          {description}
        </p>
      ) : null}
      <div className="mt-6">{children}</div>
    </div>
  );
}

export default function BookingPage() {
  const [mode, setMode] = useState("first");
  const [step, setStep] = useState("auth");
  const [showEmailSignin, setShowEmailSignin] = useState(false);
  const [signin, setSignin] = useState(emptySignin);
  const [firstOrder, setFirstOrder] = useState(emptyFirstOrder);
  const [repeatOrder, setRepeatOrder] = useState(emptyRepeatOrder);
  const [customer, setCustomer] = useState(null);
  const [orders, setOrders] = useState([]);
  const [result, setResult] = useState(null);
  const [toast, setToast] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [loading, setLoading] = useState({
    signin: false,
    start: false,
    first: false,
    repeat: false,
  });

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(null), 3600);
    return () => clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    loadSession();
  }, []);

  useEffect(() => {
    setStep("auth");
    setResult(null);
  }, [mode]);

  async function loadSession() {
    try {
      const response = await fetch("/api/auth/session", {
        credentials: "same-origin",
      });
      const data = await response.json();

      if (data.authenticated && data.role === "customer") {
        setCustomer(data.customer);
        setOrders(data.orders || []);
        setRepeatOrder((current) => ({
          ...current,
          bagCode: data.customer.bagCode || current.bagCode,
        }));
        setFirstOrder((current) => ({
          ...current,
          email: data.customer.email || current.email,
          firstName: data.customer.firstName || current.firstName,
          lastName: data.customer.lastName || current.lastName,
          address: data.customer.address || current.address,
          postalCode: data.customer.postalCode || current.postalCode,
          city: data.customer.city || current.city,
          phone: data.customer.phone || current.phone,
        }));
      }
    } catch {
      setToast({ type: "error", message: "Unable to restore session." });
    }
  }

  function notify(message, type = "success") {
    setToast({ message, type });
  }

  function setLoadingState(key, value) {
    setLoading((current) => ({ ...current, [key]: value }));
  }

  function incrementCount(setter, source) {
    setter({
      ...source,
      shirtsCount: String(Number(source.shirtsCount || 0) + 1),
    });
  }

  function decrementCount(setter, source) {
    setter({
      ...source,
      shirtsCount: String(Math.max(0, Number(source.shirtsCount || 0) - 1)),
    });
  }

  function validateFirstOrder() {
    const required = [
      "email",
      "password",
      "firstName",
      "lastName",
      "address",
      "postalCode",
      "city",
      "pickupDate",
      "pickupSlot",
      "laundryType",
    ];
    const missing = required.find(
      (field) => !String(firstOrder[field] || "").trim(),
    );
    if (missing) {
      notify("Please complete the required booking details.", "error");
      return false;
    }
    return true;
  }

  function validateRepeatOrder() {
    const required = ["bagCode", "pickupDate", "pickupSlot", "laundryType"];
    const missing = required.find(
      (field) => !String(repeatOrder[field] || "").trim(),
    );
    if (missing) {
      notify("Please complete the repeat pickup details.", "error");
      return false;
    }
    return true;
  }

  async function handleSignin(event) {
    event.preventDefault();
    setLoadingState("signin", true);

    try {
      const response = await apiFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(signin),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to sign in");

      setCustomer(data.customer);
      setOrders(data.orders || []);
      setRepeatOrder((current) => ({
        ...current,
        bagCode: data.customer.bagCode || current.bagCode,
      }));
      notify("Signed in. Your saved bag details are ready.");
      setStep("customize");
    } catch (error) {
      notify(error.message, "error");
    } finally {
      setLoadingState("signin", false);
    }
  }

  async function handleAccountStart() {
    if (customer) {
      setStep("customize");
      return;
    }

    if (!signin.email.trim() || !signin.password.trim()) {
      notify("Enter your email and password to continue.", "error");
      return;
    }

    setLoadingState("start", true);

    try {
      const response = await apiFetch("/api/auth/start", {
        method: "POST",
        body: JSON.stringify(signin),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to continue");

      if (data.mode === "login") {
        setCustomer(data.customer);
        setOrders(data.orders || []);
        setRepeatOrder((current) => ({
          ...current,
          bagCode: data.customer.bagCode || current.bagCode,
        }));
        setFirstOrder((current) => ({
          ...current,
          email: data.customer.email || current.email,
          password: signin.password,
          firstName: data.customer.firstName || current.firstName,
          lastName: data.customer.lastName || current.lastName,
          address: data.customer.address || current.address,
          postalCode: data.customer.postalCode || current.postalCode,
          city: data.customer.city || current.city,
          phone: data.customer.phone || current.phone,
        }));
        notify("Welcome back. Your saved profile is ready.");
      } else {
        setCustomer(data.customer);
        setOrders(data.orders || []);
        setRepeatOrder((current) => ({
          ...current,
          bagCode: data.customer.bagCode || current.bagCode,
        }));
        setFirstOrder((current) => ({
          ...current,
          email: data.customer.email || signin.email.trim(),
          password: signin.password,
        }));
        notify("Your account was created and your bag QR is ready.");
      }

      setStep("customize");
    } catch (error) {
      notify(error.message, "error");
    } finally {
      setLoadingState("start", false);
    }
  }

  async function handleFirstOrder(event) {
    event.preventDefault();
    if (!validateFirstOrder()) return;
    setLoadingState("first", true);

    try {
      const response = await apiFetch("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(firstOrder),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Unable to create booking");

      setResult({ type: "first", ...data });
      setCustomer(data.customer);
      setRepeatOrder((current) => ({
        ...current,
        bagCode: data.customer.bagCode || current.bagCode,
      }));
      setStep("confirmed");
      await loadSession();
      notify("Pickup booked and invoice created.");
    } catch (error) {
      notify(error.message, "error");
    } finally {
      setLoadingState("first", false);
    }
  }

  async function handleRepeatOrder(event) {
    event.preventDefault();
    if (!validateRepeatOrder()) return;
    setLoadingState("repeat", true);

    try {
      const response = await apiFetch("/api/repeat-pickup", {
        method: "POST",
        body: JSON.stringify(repeatOrder),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Unable to create repeat pickup");

      setResult({ type: "repeat", ...data });
      setStep("confirmed");
      await loadSession();
      notify("Repeat pickup confirmed.");
    } catch (error) {
      notify(error.message, "error");
    } finally {
      setLoadingState("repeat", false);
    }
  }

  async function handleSignout() {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "same-origin",
    });
    setCustomer(null);
    setOrders([]);
    setResult(null);
    setSignin(emptySignin);
    setStep("auth");
    notify("Signed out.");
  }

  async function useLiveLocation() {
    if (!navigator.geolocation) {
      notify("Live location is not supported in this browser.", "error");
      return;
    }

    setLocationLoading(true);

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${coords.latitude}&lon=${coords.longitude}`,
          );
          if (!response.ok) throw new Error("Reverse geocoding unavailable");

          const data = await response.json();
          const address = data.address || {};
          setFirstOrder((current) => ({
            ...current,
            address:
              [address.house_number, address.road].filter(Boolean).join(" ") ||
              data.display_name ||
              `${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)}`,
            city:
              address.city ||
              address.town ||
              address.village ||
              address.county ||
              "",
            postalCode: address.postcode || "",
          }));
          notify("Live location loaded into your address fields.");
        } catch {
          setFirstOrder((current) => ({
            ...current,
            address: `${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)}`,
          }));
          notify(
            "Location found. Coordinates were added because address lookup was unavailable.",
          );
        } finally {
          setLocationLoading(false);
        }
      },
      () => {
        setLocationLoading(false);
        notify("Unable to access your live location.", "error");
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  const activeOrder = mode === "first" ? firstOrder : repeatOrder;
  const customerDisplayName = customer
    ? `${customer.firstName || ""} ${customer.lastName || ""}`.trim() ||
      customer.email
    : "";

  const summary = useMemo(() => {
    const source = mode === "first" ? firstOrder : repeatOrder;
    const base = source.billingPlan === "subscription" ? 50 : 55;
    const shirts = Number(source.shirtsCount || 0) * 4;
    return {
      base,
      shirts,
      total: base + shirts,
    };
  }, [mode, firstOrder, repeatOrder]);

  function renderAuthStep() {
    return (
      <div className="grid gap-8 xl:grid-cols-[1fr_0.95fr]">
        <CardShell
          title={
            mode === "first"
              ? "Start Your Laundry Service"
              : "Continue Your Laundry Service"
          }
          description={
            mode === "first"
              ? "Create your account and everything will run automatically over your laundry bag. Fast. Simple. No effort."
              : "Sign in or use your saved bag code so your next pickup takes only a few moments."
          }
        >
          <div className="space-y-5">
            <div className="rounded-[1.5rem] bg-gold-pill p-1">
              <button
                type="button"
                onClick={() =>
                  notify(
                    "Google sign-in is not connected yet. Please continue with email.",
                    "error",
                  )
                }
                className="flex w-full items-center justify-center gap-3 rounded-[1.2rem] bg-transparent px-5 py-4 text-base font-extrabold text-white"
              >
                <span className="text-2xl">G</span>
                Continue with Google
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowEmailSignin((current) => !current)}
              className="flex w-full items-center justify-center gap-3 rounded-[1.2rem] border border-sand-200 bg-white px-5 py-4 text-base font-extrabold text-sand-900"
            >
              <span>✉</span>
              Continue with Email
            </button>

            <div className="flex items-center gap-4 py-1">
              <div className="h-px flex-1 bg-sand-200" />
              <span className="text-sm font-semibold text-sand-500">OR</span>
              <div className="h-px flex-1 bg-sand-200" />
            </div>

            {showEmailSignin ? (
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  handleAccountStart();
                }}
                className="space-y-4 rounded-[1.6rem] border border-sand-200 bg-sand-50 p-5"
              >
                <Input
                  label="Email"
                  type="email"
                  value={signin.email}
                  onChange={(e) =>
                    setSignin({ ...signin, email: e.target.value })
                  }
                />
                <Input
                  label="Password"
                  type="password"
                  value={signin.password}
                  onChange={(e) =>
                    setSignin({ ...signin, password: e.target.value })
                  }
                />
                <ActionButton
                  type="submit"
                  variant="secondary"
                  disabled={loading.start}
                >
                  {loading.start ? "Checking account..." : "Continue"}
                </ActionButton>
              </form>
            ) : null}

            {mode === "repeat" ? (
              <div className="rounded-[1.6rem] border border-sand-200 bg-sand-50 p-5">
                <h4 className="font-display text-3xl leading-none">
                  Use your bag code
                </h4>
                <p className="mt-3 text-sm leading-7 text-sand-700">
                  If you prefer not to sign in, continue with your QR-linked bag
                  code in the next step.
                </p>
              </div>
            ) : (
              <div className="rounded-[1.6rem] border border-sand-200 bg-sand-50 p-5">
                <div className="flex items-start gap-3">
                  <span className="mt-1 text-sand-600">⌘</span>
                  <div>
                    <h4 className="text-lg font-extrabold text-sand-900">
                      How it works
                    </h4>
                    <p className="mt-2 text-sm leading-7 text-sand-700">
                      Your personalised QR code links your bag to your account.
                      Just scan, fill, and we handle the rest seamlessly.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="pt-2">
              {mode === "first" ? (
                <ActionButton
                  onClick={handleAccountStart}
                  disabled={loading.start}
                >
                  {loading.start
                    ? "Checking account..."
                    : customer
                      ? "Continue with saved profile"
                      : "Continue to next step"}
                </ActionButton>
              ) : (
                <ActionButton onClick={() => setStep("customize")}>
                  {customer
                    ? "Continue with saved profile"
                    : "Continue to next step"}
                </ActionButton>
              )}
            </div>
          </div>
        </CardShell>

        <div className="rounded-[2rem] border border-sand-200 bg-white/90 p-6 shadow-soft">
          <div className="overflow-hidden rounded-[1.8rem] bg-[linear-gradient(180deg,#f6ecdf_0%,#efe0c5_100%)] p-4">
            <div className="overflow-hidden rounded-[1.7rem]">
              <Image
                src="/images/hero-bag.png"
                alt="Laundry bag ready for service"
                width={960}
                height={960}
                className="w-full object-cover"
              />
            </div>
          </div>

          <div className="mt-6 grid gap-5 sm:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-sand-200 bg-sand-50 text-sand-700">
                ≋
              </div>
              <p className="mt-3 text-sm font-semibold text-sand-800">
                No pre-sorting required
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-sand-200 bg-sand-50 text-sand-700">
                ☐
              </div>
              <p className="mt-3 text-sm font-semibold text-sand-800">
                Convenient monthly billing
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-sand-200 bg-sand-50 text-sand-700">
                ⇢
              </div>
              <p className="mt-3 text-sm font-semibold text-sand-800">
                Pickup directly from your door
              </p>
            </div>
          </div>

          {customer ? (
            <div className="mt-6 rounded-[1.6rem] border border-sand-200 bg-sand-50 p-5">
              <small className="block text-sand-600">Active customer</small>
              <strong className="mt-2 block text-lg text-sand-900">
                {customerDisplayName}
              </strong>
              <p className="mt-2 text-sm text-sand-700">
                Bag code: {customer.bagCode}
              </p>
              <button
                type="button"
                onClick={handleSignout}
                className="mt-4 text-sm font-extrabold text-sand-700 underline"
              >
                Sign out
              </button>
            </div>
          ) : null}

          {customer?.qrSvg ? (
            <QrCard
              className="mt-6"
              title="Bag QR ready"
              subtitle="Your bag identity is created immediately. Keep this QR linked to your account for future pickups."
              bagCode={customer.bagCode}
              qrSvg={customer.qrSvg}
            />
          ) : null}
        </div>
      </div>
    );
  }

  function renderCustomizeStep() {
    return (
      <div className="grid gap-8 xl:grid-cols-[1.16fr_0.84fr]">
        <div className="space-y-6">
          {mode === "repeat" ? (
            <CardShell
              eyebrow="Bag recognised"
              title="Continue with your saved bag"
              description="Use your bag code if you are not signed in. If you are already signed in, we will use your saved bag automatically."
            >
              <Input
                label="Bag code"
                value={repeatOrder.bagCode}
                onChange={(e) =>
                  setRepeatOrder({ ...repeatOrder, bagCode: e.target.value })
                }
              />
            </CardShell>
          ) : null}

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
                  value={activeOrder.pickupDate}
                  onChange={(e) =>
                    mode === "first"
                      ? setFirstOrder({
                          ...firstOrder,
                          pickupDate: e.target.value,
                        })
                      : setRepeatOrder({
                          ...repeatOrder,
                          pickupDate: e.target.value,
                        })
                  }
                />
                <div className="space-y-2">
                  <span className="text-sm font-semibold text-sand-700">
                    Time window
                  </span>
                  <div className="flex flex-wrap gap-3">
                    {bookingSlots.map((slot) => (
                      <RadioPill
                        key={slot}
                        active={activeOrder.pickupSlot === slot}
                        onClick={() =>
                          mode === "first"
                            ? setFirstOrder({ ...firstOrder, pickupSlot: slot })
                            : setRepeatOrder({
                                ...repeatOrder,
                                pickupSlot: slot,
                              })
                        }
                      >
                        {slot}
                      </RadioPill>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-sm font-semibold text-sand-700">
                  Laundry type
                </span>
                <div className="grid gap-4 md:grid-cols-3">
                  {laundryTypes.map((type) => (
                    <LaundryTypeCard
                      key={type.value}
                      active={activeOrder.laundryType === type.value}
                      label={type.label}
                      description="Standard wash & fold"
                      onClick={() =>
                        mode === "first"
                          ? setFirstOrder({
                              ...firstOrder,
                              laundryType: type.value,
                            })
                          : setRepeatOrder({
                              ...repeatOrder,
                              laundryType: type.value,
                            })
                      }
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-sm font-semibold text-sand-700">
                  Billing plan
                </span>
                <div className="flex flex-wrap gap-3">
                  <RadioPill
                    active={activeOrder.billingPlan === "single"}
                    onClick={() =>
                      mode === "first"
                        ? setFirstOrder({
                            ...firstOrder,
                            billingPlan: "single",
                          })
                        : setRepeatOrder({
                            ...repeatOrder,
                            billingPlan: "single",
                          })
                    }
                  >
                    Standard laundry bag • CHF 55
                  </RadioPill>
                  <RadioPill
                    active={activeOrder.billingPlan === "subscription"}
                    onClick={() =>
                      mode === "first"
                        ? setFirstOrder({
                            ...firstOrder,
                            billingPlan: "subscription",
                          })
                        : setRepeatOrder({
                            ...repeatOrder,
                            billingPlan: "subscription",
                          })
                    }
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
                  count={activeOrder.shirtsCount}
                  active={Number(activeOrder.shirtsCount || 0) > 0}
                  onDecrease={() =>
                    mode === "first"
                      ? decrementCount(setFirstOrder, firstOrder)
                      : decrementCount(setRepeatOrder, repeatOrder)
                  }
                  onIncrease={() =>
                    mode === "first"
                      ? incrementCount(setFirstOrder, firstOrder)
                      : incrementCount(setRepeatOrder, repeatOrder)
                  }
                />

                <article className="rounded-[1.8rem] border border-sand-200 bg-white/80 p-5">
                  <div className="flex items-start gap-3">
                    <span className="mt-1 text-sand-600">⌁</span>
                    <div>
                      <h4 className="font-display text-3xl leading-none">
                        Smart Pickup
                      </h4>
                      <p className="mt-2 text-sm leading-7 text-sand-600">
                        Your bag is automatically recognised. No repeated
                        address entry is needed for future pickups.
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
                value={activeOrder.notes}
                onChange={(e) =>
                  mode === "first"
                    ? setFirstOrder({ ...firstOrder, notes: e.target.value })
                    : setRepeatOrder({ ...repeatOrder, notes: e.target.value })
                }
                placeholder="Optional notes for the driver or cleaning team..."
              />
            </div>
          </CardShell>

          {mode === "first" ? (
            <CardShell
              eyebrow="Collection details"
              title="Tell us where to collect"
              description="Now that the order is customized, finish the collection profile and address details."
            >
              <div className="grid gap-4 md:grid-cols-2">
                <Input
                  label="First name"
                  value={firstOrder.firstName}
                  onChange={(e) =>
                    setFirstOrder({ ...firstOrder, firstName: e.target.value })
                  }
                />
                <Input
                  label="Last name"
                  value={firstOrder.lastName}
                  onChange={(e) =>
                    setFirstOrder({ ...firstOrder, lastName: e.target.value })
                  }
                />
                <div className="md:col-span-2 flex flex-wrap items-end gap-3">
                  <Input
                    label="Address"
                    className="min-w-[260px] flex-1"
                    value={firstOrder.address}
                    onChange={(e) =>
                      setFirstOrder({ ...firstOrder, address: e.target.value })
                    }
                  />
                  <button
                    type="button"
                    onClick={useLiveLocation}
                    disabled={locationLoading}
                    className="rounded-full border border-sand-200 bg-sand-50 px-4 py-3 text-sm font-extrabold text-sand-800"
                  >
                    {locationLoading ? "Locating..." : "Use live location"}
                  </button>
                </div>
                <Input
                  label="Postal code"
                  value={firstOrder.postalCode}
                  onChange={(e) =>
                    setFirstOrder({ ...firstOrder, postalCode: e.target.value })
                  }
                />
                <Input
                  label="City"
                  value={firstOrder.city}
                  onChange={(e) =>
                    setFirstOrder({ ...firstOrder, city: e.target.value })
                  }
                />
                <Input
                  label="Phone"
                  className="md:col-span-2"
                  value={firstOrder.phone}
                  onChange={(e) =>
                    setFirstOrder({ ...firstOrder, phone: e.target.value })
                  }
                />
              </div>
            </CardShell>
          ) : null}
        </div>

        <div className="space-y-6">
          <div className="rounded-[2rem] border border-sand-200 bg-white/92 p-6 shadow-glow">
            <h3 className="font-display text-4xl leading-none">
              Your Order Summary
            </h3>
            <div className="mt-5 space-y-4 border-t border-sand-100 pt-5">
              <SummaryRow
                label={
                  activeOrder.billingPlan === "subscription"
                    ? "Premium laundry plan"
                    : "Standard laundry bag"
                }
                value={formatCurrency(summary.base)}
              />
              <SummaryRow
                label={`Shirts / Blouses x ${activeOrder.shirtsCount || 0}`}
                value={formatCurrency(summary.shirts)}
              />
            </div>
            <div className="mt-8 border-t border-sand-100 pt-5">
              <SummaryRow
                label="Total"
                value={formatCurrency(summary.total)}
                strong
              />
            </div>
            <div className="mt-6 flex flex-col gap-3">
              <ActionButton onClick={() => setStep("review")}>
                Continue to Next Step
              </ActionButton>
              <button
                type="button"
                onClick={() => setStep("auth")}
                className="text-sm font-semibold text-sand-500"
              >
                Back
              </button>
            </div>
          </div>

          {customer?.qrSvg ? (
            <QrCard
              title="Your bag QR"
              subtitle="This bag QR is already linked to your account and will be used for repeat pickups."
              bagCode={customer.bagCode}
              qrSvg={customer.qrSvg}
            />
          ) : null}

          <div className="rounded-[2rem] border border-sand-200 bg-white/88 p-6 shadow-soft">
            <div className="flex items-start gap-3">
              <span className="mt-1 text-sand-600">⌘</span>
              <div>
                <h4 className="font-display text-3xl leading-none">
                  Smart Pickup
                </h4>
                <p className="mt-2 text-sm leading-7 text-sand-700">
                  Your bag is automatically recognised. No repeated address
                  entry is needed.
                </p>
              </div>
            </div>
          </div>

          {orders.length ? (
            <div className="rounded-[2rem] border border-sand-200 bg-white/88 p-6 shadow-soft">
              <h4 className="font-display text-3xl leading-none">
                Recent orders
              </h4>
              <div className="mt-5 space-y-3">
                {orders.slice(0, 3).map((order) => (
                  <article
                    key={order.id}
                    className="rounded-[1.4rem] border border-sand-200 bg-sand-50 p-4 text-sm"
                  >
                    <small className="block text-sand-600">
                      {order.invoice_number}
                    </small>
                    <strong className="mt-2 block text-sand-900">
                      {formatPickupDate(order.pickup_date)} •{" "}
                      {order.pickup_slot}
                    </strong>
                  </article>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  function renderReviewStep() {
    return (
      <div className="grid gap-8 xl:grid-cols-[1.14fr_0.86fr]">
        <div className="space-y-6">
          <CardShell
            eyebrow="Review order"
            title="Almost Done!"
            description="Please review your details below before scheduling your pickup. We will take care of the rest."
          >
            <div className="grid gap-4 md:grid-cols-2">
              <article className="rounded-[1.6rem] border border-sand-200 bg-sand-50 p-5">
                <small className="block text-sand-600">Address</small>
                <strong className="mt-2 block text-sand-900">
                  {mode === "first"
                    ? `${firstOrder.address}, ${firstOrder.city} ${firstOrder.postalCode}`
                    : customer
                      ? `${customer.address}, ${customer.city} ${customer.postalCode}`
                      : "Address from saved bag"}
                </strong>
              </article>
              <article className="rounded-[1.6rem] border border-sand-200 bg-sand-50 p-5">
                <small className="block text-sand-600">Pickup date</small>
                <strong className="mt-2 block text-sand-900">
                  {formatPickupDate(activeOrder.pickupDate)}
                </strong>
              </article>
              <article className="rounded-[1.6rem] border border-sand-200 bg-sand-50 p-5">
                <small className="block text-sand-600">Time window</small>
                <strong className="mt-2 block text-sand-900">
                  {activeOrder.pickupSlot}
                </strong>
              </article>
              <article className="rounded-[1.6rem] border border-sand-200 bg-sand-50 p-5">
                <small className="block text-sand-600">Laundry type</small>
                <strong className="mt-2 block text-sand-900">
                  {capitalize(activeOrder.laundryType)}
                </strong>
              </article>
              <article className="rounded-[1.6rem] border border-sand-200 bg-sand-50 p-5 md:col-span-2">
                <small className="block text-sand-600">Return delivery</small>
                <strong className="mt-2 block text-sand-900">
                  Friday between 6:00 PM and 9:00 PM
                </strong>
              </article>
            </div>
          </CardShell>

          <CardShell
            eyebrow="Items"
            title="Selected items"
            description="Adjust anything one last time before confirming."
          >
            <div className="grid gap-4 md:grid-cols-2">
              <CounterCard
                title="Shirts / Blouses"
                subtitle="CHF 4 each"
                price="Add-on"
                count={activeOrder.shirtsCount}
                active={Number(activeOrder.shirtsCount || 0) > 0}
                onDecrease={() =>
                  mode === "first"
                    ? decrementCount(setFirstOrder, firstOrder)
                    : decrementCount(setRepeatOrder, repeatOrder)
                }
                onIncrease={() =>
                  mode === "first"
                    ? incrementCount(setFirstOrder, firstOrder)
                    : incrementCount(setRepeatOrder, repeatOrder)
                }
              />
              <article className="overflow-hidden rounded-[1.8rem] border border-sand-200 bg-white">
                <Image
                  src="/images/hero-bag.png"
                  alt="Laundry ready to be picked up"
                  width={960}
                  height={960}
                  className="h-full w-full object-cover"
                />
              </article>
            </div>
          </CardShell>

          <CardShell title="Confirmation">
            <div className="space-y-3 text-sm text-sand-700">
              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  defaultChecked
                  readOnly
                  className="mt-1"
                />{" "}
                I accept the pickup details and billing flow.
              </label>
              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  defaultChecked
                  readOnly
                  className="mt-1"
                />{" "}
                I confirm the bag contains standard machine-washable laundry.
              </label>
              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  defaultChecked
                  readOnly
                  className="mt-1"
                />{" "}
                I understand return will happen within the announced window.
              </label>
            </div>
          </CardShell>
        </div>

        <div className="space-y-6">
          <div className="overflow-hidden rounded-[2rem] border border-sand-200 bg-white shadow-soft">
            <Image
              src="/images/hero-bag.png"
              alt="Folded laundry visual"
              width={960}
              height={960}
              className="h-72 w-full object-cover"
            />
          </div>

          <CardShell title="Billing Info">
            <div className="space-y-4">
              <SummaryRow
                label={
                  activeOrder.billingPlan === "subscription"
                    ? "Premium plan"
                    : "Standard laundry bag"
                }
                value={formatCurrency(summary.base)}
              />
              <SummaryRow
                label={`Shirts / Blouses x ${activeOrder.shirtsCount || 0}`}
                value={formatCurrency(summary.shirts)}
              />
              <SummaryRow
                label="Estimated total"
                value={formatCurrency(summary.total)}
                strong
              />
            </div>
            <p className="mt-5 text-sm leading-7 text-sand-600">
              Billing will be calculated in CHF and sent via email after pickup.
            </p>
          </CardShell>

          <CardShell title="Additional Instructions">
            <Textarea
              label="Notes"
              value={activeOrder.notes}
              onChange={(e) =>
                mode === "first"
                  ? setFirstOrder({ ...firstOrder, notes: e.target.value })
                  : setRepeatOrder({ ...repeatOrder, notes: e.target.value })
              }
              placeholder="Optional notes for the driver or cleaning staff..."
            />
          </CardShell>

          <div className="flex flex-col gap-3">
            <ActionButton
              onClick={(event) => {
                if (mode === "first") {
                  handleFirstOrder(event);
                } else {
                  handleRepeatOrder(event);
                }
              }}
              disabled={mode === "first" ? loading.first : loading.repeat}
            >
              {mode === "first"
                ? loading.first
                  ? "Schedule pickup"
                  : "Schedule Pickup"
                : loading.repeat
                  ? "Schedule pickup"
                  : "Schedule Pickup"}
            </ActionButton>
            <button
              type="button"
              onClick={() => setStep("customize")}
              className="text-sm font-semibold text-sand-500"
            >
              Edit details
            </button>
          </div>
        </div>
      </div>
    );
  }

  function renderConfirmedStep() {
    if (!result) return null;

    return (
      <div className="mx-auto max-w-4xl">
        <div className="rounded-[2.4rem] border border-sand-200 bg-white/92 px-6 py-10 shadow-glow md:px-10">
          <div className="flex flex-col items-center text-center">
            <div className="rounded-full border border-sand-200 bg-sand-50 p-6">
              <span className="font-display text-5xl text-sand-600">✓</span>
            </div>
            <p className="mt-6 text-xs font-extrabold uppercase tracking-[0.24em] text-sand-700">
              laundry.li
            </p>
            <h2 className="mt-3 font-display text-5xl leading-none md:text-6xl">
              Pickup Confirmed
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-8 text-sand-700">
              Your laundry bag will be picked up as scheduled.
            </p>
          </div>

          <div className="mx-auto mt-10 max-w-2xl rounded-[1.8rem] border border-sand-200 bg-sand-50 p-5">
            <div className="space-y-4">
              <SummaryRow
                label="Pickup Date"
                value={formatPickupDate(result.order.pickupDate)}
              />
              <SummaryRow label="Time Window" value={result.order.pickupSlot} />
              <SummaryRow
                label="Return Info"
                value={result.order.returnWindow}
              />
            </div>
          </div>

          {customer?.qrSvg ? (
            <div className="mx-auto mt-6 max-w-2xl">
              <QrCard
                title="Your laundry bag QR"
                subtitle="Your account and bag are now connected. Save this code or keep it attached to your bag for future bookings."
                bagCode={customer.bagCode}
                qrSvg={customer.qrSvg}
              />
            </div>
          ) : null}

          <div className="mx-auto mt-10 max-w-2xl">
            <h3 className="text-center font-display text-4xl leading-none">
              What You Need To Do Next
            </h3>
            <div className="mt-6 space-y-4">
              <div className="flex items-center gap-4 border-b border-sand-100 pb-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-full border border-sand-200 bg-sand-50 text-sand-700">
                  1
                </span>
                <span className="text-base text-sand-800">
                  Fill your laundry bag
                </span>
              </div>
              <div className="flex items-center gap-4 border-b border-sand-100 pb-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-full border border-sand-200 bg-sand-50 text-sand-700">
                  2
                </span>
                <span className="text-base text-sand-800">
                  Place it outside your door tomorrow
                </span>
              </div>
              <div className="flex items-center gap-4 pb-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-full border border-sand-200 bg-sand-50 text-sand-700">
                  3
                </span>
                <span className="text-base text-sand-800">
                  We will take care of the rest
                </span>
              </div>
            </div>

            <div className="mt-5 rounded-[1.5rem] bg-[linear-gradient(135deg,#e6d1ac,#d8b06f)] px-5 py-4 text-sm font-semibold text-sand-900">
              No further action required. We handle everything for you.
            </div>
          </div>

          <div className="mx-auto mt-8 flex max-w-2xl flex-col gap-4">
            <a href={result.order.invoiceUrl} target="_blank" rel="noreferrer">
              <ActionButton asChild>Open invoice</ActionButton>
            </a>
            <button
              type="button"
              onClick={() => {
                setResult(null);
                setStep("customize");
              }}
              className="rounded-full border border-sand-200 bg-sand-50 px-5 py-4 text-sm font-extrabold text-sand-800"
            >
              Schedule Another Pickup
            </button>
            <Link
              href="/"
              className="text-center text-sm font-semibold text-sand-600"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const stepIndex =
    step === "auth" ? 0 : step === "customize" ? 1 : step === "review" ? 2 : 3;

  return (
    <div className="relative overflow-x-hidden">
      <PageGlow />
      <TopNav
        compact
        ctaHref="/"
        ctaLabel="Back home"
        userName={customerDisplayName}
        onSignout={customer ? handleSignout : undefined}
      />

      <main className="mx-auto max-w-7xl px-4 py-14">
        <SectionHeading
          eyebrow="Book pickup"
          title={
            step === "auth"
              ? mode === "first"
                ? "Start your laundry service"
                : "Continue your laundry service"
              : step === "customize"
                ? "Customize Your Laundry Order"
                : step === "review"
                  ? "Almost Done!"
                  : "Pickup Confirmed"
          }
          description={
            step === "auth"
              ? "A cleaner onboarding step first, then customization, then review, then confirmation."
              : step === "customize"
                ? "Choose the pieces, pickup timing, and any notes. The layout is now split into clearer stages."
                : step === "review"
                  ? "Please review your details below before scheduling your pickup. We will take care of the rest."
                  : "Your booking is complete and the next actions are clearly laid out."
          }
          centered
        />

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <RadioPill active={mode === "first"} onClick={() => setMode("first")}>
            First order
          </RadioPill>
          <RadioPill
            active={mode === "repeat"}
            onClick={() => setMode("repeat")}
          >
            Repeat pickup
          </RadioPill>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <StepPill
            number="1"
            label="Account"
            active={step === "auth"}
            complete={stepIndex > 0}
          />
          <StepPill
            number="2"
            label="Customize"
            active={step === "customize"}
            complete={stepIndex > 1}
          />
          <StepPill
            number="3"
            label="Review"
            active={step === "review"}
            complete={stepIndex > 2}
          />
          <StepPill
            number="4"
            label="Confirmed"
            active={step === "confirmed"}
            complete={stepIndex > 3}
          />
        </div>

        <div className="mt-10">
          {step === "auth" ? renderAuthStep() : null}
          {step === "customize" ? renderCustomizeStep() : null}
          {step === "review" ? renderReviewStep() : null}
          {step === "confirmed" ? renderConfirmedStep() : null}
        </div>
      </main>
      <Footer />

      <Toast toast={toast} />
    </div>
  );
}
