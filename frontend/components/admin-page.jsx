"use client";

import { useEffect, useState } from "react";
import {
  ActionButton,
  apiFetch,
  formatCurrency,
  formatPickupDate,
  Input,
  PageGlow,
  QrCard,
  SectionHeading,
  Toast,
  TopNav,
} from "./shared-ui";

const emptyAdminLogin = {
  email: "",
  password: "",
};

export default function AdminPage() {
  const [login, setLogin] = useState(emptyAdminLogin);
  const [admin, setAdmin] = useState(null);
  const [overview, setOverview] = useState(null);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(null), 3600);
    return () => clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    restoreAdmin();
  }, []);

  async function restoreAdmin() {
    try {
      const response = await fetch("/api/auth/session", { credentials: "same-origin" });
      const data = await response.json();
      if (data.authenticated && data.role === "admin") {
        setAdmin(data.admin);
        setOverview(data.overview);
      }
    } catch {
      setToast({ type: "error", message: "Unable to restore admin session." });
    }
  }

  async function handleLogin(event) {
    event.preventDefault();
    setLoading(true);
    try {
      const response = await apiFetch("/api/admin/login", {
        method: "POST",
        body: JSON.stringify(login),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to sign in as admin");

      setAdmin(data.admin);
      setOverview(data.overview);
      setToast({ type: "success", message: `Admin dashboard loaded for ${data.admin.name}.` });
    } catch (error) {
      setToast({ type: "error", message: error.message });
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" });
    setAdmin(null);
    setOverview(null);
    setToast({ type: "success", message: "Signed out." });
  }

  async function updateStatus(orderId, status) {
    try {
      const response = await apiFetch(`/api/admin/orders/${orderId}`, {
        method: "POST",
        body: JSON.stringify({ status }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to update status");
      setOverview(data.overview);
      setToast({ type: "success", message: "Order status updated." });
    } catch (error) {
      setToast({ type: "error", message: error.message });
    }
  }

  return (
    <div className="relative overflow-x-hidden">
      <PageGlow />
      <TopNav compact ctaHref="/book" ctaLabel="Book pickup" />

      <main className="mx-auto max-w-7xl px-4 py-14">
        <SectionHeading
          eyebrow="Admin portal"
          title="Manage customers, orders, invoices, and status changes in one route."
          description="This admin frontend is now separate and clearer. Sign in here to view operational data, update order progress, and open or download invoices."
        />

        {!admin || !overview ? (
          <div className="mt-10 grid gap-8 xl:grid-cols-[0.75fr_1.25fr]">
            <form onSubmit={handleLogin} className="rounded-[2rem] border border-sand-200 bg-white/85 p-7 shadow-soft">
              <p className="text-xs font-extrabold uppercase tracking-[0.28em] text-sand-700">Admin sign in</p>
              <div className="mt-6 grid gap-4">
                <Input label="Email" type="email" value={login.email} onChange={(e) => setLogin({ ...login, email: e.target.value })} />
                <Input label="Password" type="password" value={login.password} onChange={(e) => setLogin({ ...login, password: e.target.value })} />
              </div>
              <div className="mt-6">
                <ActionButton type="submit" disabled={loading}>
                  {loading ? "Opening..." : "Open dashboard"}
                </ActionButton>
              </div>
            </form>

            <div className="rounded-[2rem] border border-sand-200 bg-white/85 p-7 shadow-soft">
              <h3 className="font-display text-4xl leading-none">What you can do here</h3>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <article className="rounded-[1.5rem] border border-sand-200 bg-sand-50 p-5">
                  <strong className="block text-sand-900">View orders</strong>
                  <p className="mt-2 text-sm leading-7 text-sand-700">See invoice number, pickup slot, customer name, bag code, and current status.</p>
                </article>
                <article className="rounded-[1.5rem] border border-sand-200 bg-sand-50 p-5">
                  <strong className="block text-sand-900">View customers</strong>
                  <p className="mt-2 text-sm leading-7 text-sand-700">Browse the latest customer records and connected bag codes.</p>
                </article>
                <article className="rounded-[1.5rem] border border-sand-200 bg-sand-50 p-5">
                  <strong className="block text-sand-900">Change status</strong>
                  <p className="mt-2 text-sm leading-7 text-sand-700">Move orders from scheduled to picked up, processing, returning, and completed.</p>
                </article>
                <article className="rounded-[1.5rem] border border-sand-200 bg-sand-50 p-5">
                  <strong className="block text-sand-900">Download invoices</strong>
                  <p className="mt-2 text-sm leading-7 text-sand-700">Open invoice pages directly and download them from the browser.</p>
                </article>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-10 space-y-8">
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-[2rem] border border-sand-200 bg-white/85 p-6 shadow-soft">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.28em] text-sand-700">Signed in</p>
                <h3 className="mt-2 font-display text-4xl leading-none">{admin.name}</h3>
                <p className="mt-2 text-sm text-sand-700">{admin.email}</p>
              </div>
              <ActionButton variant="secondary" onClick={handleLogout}>
                Sign out
              </ActionButton>
            </div>

            <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
              <article className="rounded-[1.5rem] border border-sand-200 bg-white/85 p-5 shadow-soft">
                <small className="block text-sand-600">Customers</small>
                <strong className="mt-2 block text-3xl">{overview.stats.customers}</strong>
              </article>
              <article className="rounded-[1.5rem] border border-sand-200 bg-white/85 p-5 shadow-soft">
                <small className="block text-sand-600">Orders</small>
                <strong className="mt-2 block text-3xl">{overview.stats.orders}</strong>
              </article>
              <article className="rounded-[1.5rem] border border-sand-200 bg-white/85 p-5 shadow-soft">
                <small className="block text-sand-600">Revenue</small>
                <strong className="mt-2 block text-3xl">{overview.stats.revenue}</strong>
              </article>
              <article className="rounded-[1.5rem] border border-sand-200 bg-white/85 p-5 shadow-soft">
                <small className="block text-sand-600">Active orders</small>
                <strong className="mt-2 block text-3xl">{overview.stats.activeOrders}</strong>
              </article>
            </div>

            <div className="grid gap-8 xl:grid-cols-[1.18fr_0.82fr]">
              <section className="rounded-[2rem] border border-sand-200 bg-white/85 p-7 shadow-soft">
                <h3 className="font-display text-4xl leading-none">Orders</h3>
                <div className="mt-6 space-y-4">
                  {overview.recentOrders?.length ? (
                    overview.recentOrders.map((order) => (
                      <article key={order.id} className="rounded-[1.6rem] border border-sand-200 bg-sand-50 p-5">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                          <div>
                            <small className="block text-sand-600">{order.invoice_number}</small>
                            <strong className="mt-2 block text-lg">
                              {order.first_name} {order.last_name}
                            </strong>
                          </div>
                          <div className="flex flex-wrap gap-3">
                            <a
                              href={`/invoice/${order.id}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-sm font-extrabold text-sand-700 underline"
                            >
                              Open invoice
                            </a>
                            <a
                              href={`/invoice/${order.id}`}
                              download
                              className="text-sm font-extrabold text-sand-700 underline"
                            >
                              Download invoice
                            </a>
                          </div>
                        </div>

                        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4 text-sm">
                          <div><small className="block text-sand-600">Pickup</small><strong>{formatPickupDate(order.pickup_date)}</strong></div>
                          <div><small className="block text-sand-600">Slot</small><strong>{order.pickup_slot}</strong></div>
                          <div><small className="block text-sand-600">Bag code</small><strong>{order.bag_code}</strong></div>
                          <div><small className="block text-sand-600">Total</small><strong>{formatCurrency(order.amount)}</strong></div>
                        </div>

                        <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_240px]">
                          <div className="rounded-[1.2rem] border border-sand-200 bg-white px-4 py-3 text-sm text-sand-700">
                            <strong className="block text-sand-900">Customer</strong>
                            <span>{order.email}</span>
                            <div className="mt-4">
                              <select
                                value={order.status}
                                onChange={(e) => updateStatus(order.id, e.target.value)}
                                className="w-full rounded-[1.2rem] border border-sand-200 bg-white px-4 py-3 text-sm font-semibold text-sand-800 outline-none"
                              >
                                {overview.statusOptions.map((status) => (
                                  <option key={status} value={status}>
                                    {status.replaceAll("_", " ")}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                          <QrCard
                            title="Bag QR"
                            subtitle="Admin can verify the QR linked to this order."
                            bagCode={order.bag_code}
                            qrSvg={order.qr_svg}
                          />
                        </div>
                      </article>
                    ))
                  ) : (
                    <div className="rounded-[1.5rem] border border-dashed border-sand-300 bg-white/70 p-5 text-sm text-sand-700">
                      No orders available.
                    </div>
                  )}
                </div>
              </section>

              <section className="rounded-[2rem] border border-sand-200 bg-white/85 p-7 shadow-soft">
                <h3 className="font-display text-4xl leading-none">Customers</h3>
                <div className="mt-6 space-y-4">
                  {overview.customers?.length ? (
                    overview.customers.map((customer) => (
                      <article key={customer.id} className="rounded-[1.6rem] border border-sand-200 bg-sand-50 p-5">
                        <small className="block text-sand-600">{customer.email}</small>
                        <strong className="mt-2 block text-lg">
                          {customer.first_name} {customer.last_name}
                        </strong>
                        <div className="mt-4 grid gap-3 text-sm">
                          <div><small className="block text-sand-600">City</small><strong>{customer.city}</strong></div>
                          <div><small className="block text-sand-600">Bag code</small><strong>{customer.bag_code}</strong></div>
                          <div><small className="block text-sand-600">Status</small><strong>{customer.status}</strong></div>
                        </div>
                        <QrCard
                          className="mt-4"
                          title="Customer QR"
                          subtitle="This QR is attached to the customer's laundry bag."
                          bagCode={customer.bag_code}
                          qrSvg={customer.qr_svg}
                        />
                      </article>
                    ))
                  ) : (
                    <div className="rounded-[1.5rem] border border-dashed border-sand-300 bg-white/70 p-5 text-sm text-sand-700">
                      No customer records available.
                    </div>
                  )}
                </div>
              </section>
            </div>
          </div>
        )}
      </main>

      <Toast toast={toast} />
    </div>
  );
}
