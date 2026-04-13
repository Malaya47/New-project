"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  ActionButton,
  apiFetch,
  Footer,
  Input,
  PageGlow,
  SectionHeading,
  Toast,
  TopNav,
} from "./shared-ui";
import { t } from "../lib/translations";

// ─── 6-digit OTP input ────────────────────────────────────────────────────────
function OtpInput({ value, onChange }) {
  const inputs = useRef([]);
  const digits = Array.from({ length: 6 }, (_, i) => value[i] || "");

  function handleChange(index, raw) {
    const char = raw.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = char;
    onChange(next.join(""));
    if (char && index < 5) inputs.current[index + 1]?.focus();
  }

  function handleKeyDown(index, e) {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e) {
    e.preventDefault();
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    onChange(text.padEnd(6, "").slice(0, 6));
    const nextFocus = Math.min(text.length, 5);
    inputs.current[nextFocus]?.focus();
  }

  return (
    <div className="flex justify-center gap-2">
      {digits.map((digit, i) => (
        <input
          key={i}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          ref={(el) => {
            inputs.current[i] = el;
          }}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={i === 0 ? handlePaste : undefined}
          className="h-14 w-11 rounded-xl border-2 border-sand-200 bg-white text-center text-xl font-extrabold text-sand-900 outline-none transition focus:border-sand-500 focus:ring-2 focus:ring-sand-100"
        />
      ))}
    </div>
  );
}

// ─── Step pill ────────────────────────────────────────────────────────────────
function StepPill({ number, label, active, complete }) {
  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 ${
        active
          ? "border-sand-500 bg-white text-sand-900 shadow-soft"
          : complete
            ? "border-sand-300 bg-sand-50 text-sand-700"
            : "border-sand-200 bg-white/70 text-sand-400"
      }`}
    >
      <span
        className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-extrabold ${
          active || complete
            ? "bg-sand-100 text-sand-900"
            : "bg-sand-50 text-sand-400"
        }`}
      >
        {complete ? "\u2713" : number}
      </span>
      <span className="text-xs font-extrabold uppercase tracking-[0.15em]">
        {label}
      </span>
    </div>
  );
}

// ─── Card shell ───────────────────────────────────────────────────────────────
function CardShell({ eyebrow, title, description, children }) {
  return (
    <div className="rounded-[2rem] border border-sand-200 bg-white/90 p-6 shadow-soft md:p-8">
      {eyebrow ? (
        <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-sand-700">
          {eyebrow}
        </p>
      ) : null}
      <h3 className="mt-2 font-display text-4xl leading-none md:text-5xl">
        {title}
      </h3>
      {description ? (
        <p className="mt-3 max-w-xl text-sm leading-7 text-sand-700">
          {description}
        </p>
      ) : null}
      <div className="mt-6">{children}</div>
    </div>
  );
}

// ─── Right sidebar feature panel ──────────────────────────────────────────────
function SidePanel() {
  return (
    <div className="space-y-5">
      <div className="overflow-hidden rounded-[2rem] border border-sand-200 bg-white/90 shadow-soft">
        <div className="overflow-hidden rounded-t-[2rem] bg-[linear-gradient(180deg,#f6ecdf_0%,#efe0c5_100%)] p-4">
          <div className="overflow-hidden rounded-[1.7rem]">
            <Image
              src="/images/hero-bag.png"
              alt="Laundry bag"
              width={960}
              height={960}
              className="w-full object-cover"
            />
          </div>
        </div>

        <div className="p-6">
          <h3 className="font-display text-3xl leading-none text-sand-900">
            {t("How it works")}
          </h3>
          <div className="mt-4 space-y-4">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-sand-200 bg-sand-50 text-sm font-extrabold text-sand-700">
                1
              </span>
              <p className="text-sm leading-6 text-sand-700">
                {t(
                  "Register with your email. We\u2019ll send you a verification code \u2014 no password needed.",
                )}
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-sand-200 bg-sand-50 text-sm font-extrabold text-sand-700">
                2
              </span>
              <p className="text-sm leading-6 text-sand-700">
                {t(
                  "We ship you a laundry bag with a QR code. Fill it and scan the QR when you\u2019re ready.",
                )}
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-sand-200 bg-sand-50 text-sm font-extrabold text-sand-700">
                3
              </span>
              <p className="text-sm leading-6 text-sand-700">
                {t(
                  "Scan the QR on your bag, enter your email, and your details are pre-filled. Choose a pickup slot and confirm.",
                )}
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-sand-200 bg-sand-50 text-sm font-extrabold text-sand-700">
                4
              </span>
              <p className="text-sm leading-6 text-sand-700">
                {t("We wash, fold, and return your laundry within 48 hours.")}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-[1.6rem] border border-sand-200 bg-sand-50 p-5 text-sm leading-7 text-sand-700">
        <span className="font-extrabold text-sand-900">
          {t("No passwords.")}
        </span>{" "}
        {t(
          "Your identity is always verified via a fresh code straight to your inbox. Fast, secure, and hassle-free.",
        )}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function BookingPage() {
  const [step, setStep] = useState("email"); // email | otp | profile | done
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    address: "",
    postalCode: "",
    city: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(null), 3600);
    return () => clearTimeout(t);
  }, [toast]);

  function notify(message, type = "success") {
    setToast({ message, type });
  }

  // ── Live location autofill ────────────────────────────────────────────────
  function detectLocation() {
    if (!navigator.geolocation) {
      notify(t("Live location is not supported in this browser."), "error");
      return;
    }
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${coords.latitude}&lon=${coords.longitude}`,
          );
          const data = await res.json();
          const addr = data.address || {};
          setProfile((p) => ({
            ...p,
            address:
              [addr.house_number, addr.road].filter(Boolean).join(" ") ||
              data.display_name ||
              `${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)}`,
            city:
              addr.city || addr.town || addr.village || addr.county || p.city,
            postalCode: addr.postcode || p.postalCode,
          }));
          notify(t("Location detected and filled in."));
        } catch {
          setProfile((p) => ({
            ...p,
            address: `${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)}`,
          }));
          notify(
            t("Coordinates added \u2014 address lookup unavailable."),
            "error",
          );
        } finally {
          setLocationLoading(false);
        }
      },
      () => {
        setLocationLoading(false);
        notify(t("Unable to access your location."), "error");
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  // ── Step 1: Send OTP ────────────────────────────────────────────────────────
  async function handleSendOtp(e) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) {
      notify(t("Enter your email address."), "error");
      return;
    }
    setLoading(true);
    try {
      const res = await apiFetch("/api/auth/otp/send", {
        method: "POST",
        body: JSON.stringify({ email: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t("Failed to send code."));
      setStep("otp");
      notify(t("Check your email for the 6-digit code."));
    } catch (err) {
      notify(err.message, "error");
    } finally {
      setLoading(false);
    }
  }

  // ── Step 2: Verify OTP ──────────────────────────────────────────────────────
  async function handleVerifyOtp(e) {
    e.preventDefault();
    if (otp.replace(/\D/g, "").length !== 6) {
      notify(t("Enter the complete 6-digit code."), "error");
      return;
    }
    setLoading(true);
    try {
      const res = await apiFetch("/api/auth/otp/verify", {
        method: "POST",
        body: JSON.stringify({ email: email.trim(), otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t("Verification failed."));
      setStep("profile");
      notify(t("Email verified. Fill in your details."));
    } catch (err) {
      notify(err.message, "error");
    } finally {
      setLoading(false);
    }
  }

  // ── Step 3: Save profile ────────────────────────────────────────────────────
  async function handleRegister(e) {
    e.preventDefault();
    if (!profile.firstName || !profile.lastName || !profile.address) {
      notify(t("Please fill in all required fields."), "error");
      return;
    }
    setLoading(true);
    try {
      const res = await apiFetch("/api/auth/otp/register", {
        method: "POST",
        body: JSON.stringify({ email: email.trim(), ...profile }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t("Registration failed."));
      setStep("done");
    } catch (err) {
      notify(err.message, "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleResendOtp() {
    setOtp("");
    setLoading(true);
    try {
      const res = await apiFetch("/api/auth/otp/send", {
        method: "POST",
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t("Failed to resend code."));
      notify(t("A new code has been sent to your email."));
    } catch (err) {
      notify(err.message, "error");
    } finally {
      setLoading(false);
    }
  }

  // ── Step index for pills ────────────────────────────────────────────────────
  const stepIndex =
    step === "email" ? 0 : step === "otp" ? 1 : step === "profile" ? 2 : 3;

  // ── Step renderers ──────────────────────────────────────────────────────────
  function renderEmailStep() {
    return (
      <div className="grid gap-8 xl:grid-cols-[1fr_0.9fr]">
        <CardShell
          eyebrow={t("Step 1 of 3")}
          title={t("Enter your email")}
          description={t(
            "We\u2019ll send a one-time verification code to your inbox. No password needed.",
          )}
        >
          <form onSubmit={handleSendOtp} className="space-y-5">
            <Input
              label={t("Email address")}
              type="email"
              value={email}
              autoComplete="email"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <ActionButton type="submit" disabled={loading}>
              {loading ? t("Sending code\u2026") : t("Send verification code")}
            </ActionButton>
          </form>
        </CardShell>

        <SidePanel />
      </div>
    );
  }

  function renderOtpStep() {
    return (
      <div className="grid gap-8 xl:grid-cols-[1fr_0.9fr]">
        <CardShell
          eyebrow={t("Step 2 of 3")}
          title={t("Enter your code")}
          description={`${t("We sent a 6-digit code to")} ${email}. ${t("It expires in 10 minutes.")}`}
        >
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <OtpInput value={otp} onChange={setOtp} />
            <ActionButton type="submit" disabled={loading || otp.length < 6}>
              {loading ? t("Verifying\u2026") : t("Verify code")}
            </ActionButton>
            <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
              <button
                type="button"
                onClick={() => setStep("email")}
                className="font-semibold text-sand-600"
              >
                \u2190 {t("Change email")}
              </button>
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={loading}
                className="font-semibold text-sand-600"
              >
                {t("Resend code")}
              </button>
            </div>
          </form>
        </CardShell>

        <SidePanel />
      </div>
    );
  }

  function renderProfileStep() {
    return (
      <div className="grid gap-8 xl:grid-cols-[1fr_0.9fr]">
        <CardShell
          eyebrow={t("Step 3 of 3")}
          title={t("Your details")}
          description={t(
            "We need these to deliver your bag and schedule pickups.",
          )}
        >
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label={t("First name *")}
                value={profile.firstName}
                autoComplete="given-name"
                onChange={(e) =>
                  setProfile({ ...profile, firstName: e.target.value })
                }
                required
              />
              <Input
                label={t("Last name *")}
                value={profile.lastName}
                autoComplete="family-name"
                onChange={(e) =>
                  setProfile({ ...profile, lastName: e.target.value })
                }
                required
              />
            </div>

            <div className="flex flex-wrap items-end gap-3">
              <Input
                label={t("Street address *")}
                className="min-w-[220px] flex-1"
                value={profile.address}
                autoComplete="street-address"
                onChange={(e) =>
                  setProfile({ ...profile, address: e.target.value })
                }
                required
              />
              <button
                type="button"
                onClick={detectLocation}
                disabled={locationLoading}
                className="rounded-full border border-sand-200 bg-sand-50 px-4 py-3 text-sm font-extrabold text-sand-800 transition hover:-translate-y-0.5 disabled:opacity-60"
              >
                {locationLoading ? t("Locating\u2026") : t("Detect location")}
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label={t("Postal code")}
                value={profile.postalCode}
                autoComplete="postal-code"
                onChange={(e) =>
                  setProfile({ ...profile, postalCode: e.target.value })
                }
              />
              <Input
                label={t("City")}
                value={profile.city}
                autoComplete="address-level2"
                onChange={(e) =>
                  setProfile({ ...profile, city: e.target.value })
                }
              />
            </div>

            <Input
              label={t("Phone number")}
              type="tel"
              value={profile.phone}
              autoComplete="tel"
              onChange={(e) =>
                setProfile({ ...profile, phone: e.target.value })
              }
            />

            <ActionButton type="submit" disabled={loading}>
              {loading ? t("Saving\u2026") : t("Complete registration")}
            </ActionButton>
          </form>
        </CardShell>

        <SidePanel />
      </div>
    );
  }

  function renderDoneStep() {
    return (
      <div className="mx-auto max-w-xl">
        <div className="rounded-[2.4rem] border border-sand-200 bg-white/92 px-6 py-12 text-center shadow-glow">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[linear-gradient(135deg,#e6d1ac,#d8b06f)]">
            <span className="font-display text-4xl text-sand-900">\u2713</span>
          </div>

          <p className="mt-6 text-xs font-extrabold uppercase tracking-[0.24em] text-sand-700">
            laundry.li
          </p>
          <h2 className="mt-3 font-display text-5xl leading-none">
            {t("You'll receive your bag!")}
          </h2>
          <p className="mt-4 text-base leading-8 text-sand-700">
            {t(
              "We've registered your details. Your laundry bag is on its way. It will have a QR code — scan it when you're ready to schedule your first pickup.",
            )}
          </p>

          <div className="mt-8 rounded-[1.5rem] border border-sand-200 bg-sand-50 p-5 text-left">
            <h3 className="font-display text-2xl leading-none text-sand-900">
              {t("What happens next?")}
            </h3>
            <ul className="mt-4 space-y-3 text-sm leading-7 text-sand-700">
              <li className="flex items-start gap-3">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sand-200 text-xs font-extrabold text-sand-900">
                  1
                </span>
                {t("We send you a laundry bag with a QR code.")}
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sand-200 text-xs font-extrabold text-sand-900">
                  2
                </span>
                {t("Fill the bag with your laundry.")}
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sand-200 text-xs font-extrabold text-sand-900">
                  3
                </span>
                {t(
                  "Scan the QR code on the bag \u2014 enter your email and your details will be pre-filled. Choose your pickup time and confirm.",
                )}
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sand-200 text-xs font-extrabold text-sand-900">
                  4
                </span>
                {t("Place the bag outside your door. We handle the rest.")}
              </li>
            </ul>
          </div>

          <div className="mt-6">
            <Link href="/">
              <ActionButton asChild>{t("Back to home")}</ActionButton>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-x-hidden">
      <PageGlow />
      <TopNav compact ctaHref="/" ctaLabel={t("Back home")} />

      <main className="mx-auto max-w-5xl px-4 py-14">
        <SectionHeading
          eyebrow={t("Get started")}
          title={
            step === "done"
              ? t("You're all set!")
              : t("Start your laundry service")
          }
          description={
            step === "email"
              ? t(
                  "Register in minutes \u2014 no password required. Just your email and a quick verification code.",
                )
              : step === "otp"
                ? t("Enter the 6-digit code we sent to your email.")
                : step === "profile"
                  ? t("Just a few more details so we can deliver to you.")
                  : t("Your laundry bag is on its way.")
          }
          centered
        />

        {step !== "done" ? (
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <StepPill
              number="1"
              label={t("Email")}
              active={step === "email"}
              complete={stepIndex > 0}
            />
            <StepPill
              number="2"
              label={t("Verify")}
              active={step === "otp"}
              complete={stepIndex > 1}
            />
            <StepPill
              number="3"
              label={t("Details")}
              active={step === "profile"}
              complete={stepIndex > 2}
            />
          </div>
        ) : null}

        <div className="mt-10">
          {step === "email" && renderEmailStep()}
          {step === "otp" && renderOtpStep()}
          {step === "profile" && renderProfileStep()}
          {step === "done" && renderDoneStep()}
        </div>
      </main>

      <Footer />
      <Toast toast={toast} />
    </div>
  );
}
