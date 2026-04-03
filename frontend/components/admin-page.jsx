"use client";

import { useEffect, useState } from "react";
import {
  ActionButton,
  apiFetch,
  Footer,
  formatCurrency,
  formatPickupDate,
  Input,
  PageGlow,
  QrCard,
  SectionHeading,
  Toast,
  TopNav,
} from "./shared-ui";

const emptyAdminLogin = { email: "", password: "" };

const STATUS_COLORS = {
  scheduled: "bg-blue-50 text-blue-700 border-blue-200",
  picked_up: "bg-yellow-50 text-yellow-700 border-yellow-200",
  processing: "bg-orange-50 text-orange-700 border-orange-200",
  returning: "bg-purple-50 text-purple-700 border-purple-200",
  completed: "bg-green-50 text-green-700 border-green-200",
};

function StatusBadge({ status }) {
  const cls =
    STATUS_COLORS[status] || "bg-sand-50 text-sand-700 border-sand-200";
  return (
    <span
      className={`inline-block rounded-full border px-3 py-0.5 text-xs font-semibold capitalize ${cls}`}
    >
      {String(status || "").replaceAll("_", " ")}
    </span>
  );
}

export default function AdminPage() {
  const [login, setLogin] = useState(emptyAdminLogin);
  const [admin, setAdmin] = useState(null);
  const [overview, setOverview] = useState(null);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("customers");
  const [allCustomers, setAllCustomers] = useState(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [customerDetail, setCustomerDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

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
      const response = await fetch("/api/auth/session", {
        credentials: "same-origin",
      });
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
      if (!response.ok)
        throw new Error(data.error || "Unable to sign in as admin");
      setAdmin(data.admin);
      setOverview(data.overview);
      setToast({
        type: "success",
        message: `Welcome, ${data.admin.name}.`,
      });
    } catch (error) {
      setToast({ type: "error", message: error.message });
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "same-origin",
    });
    setAdmin(null);
    setOverview(null);
    setAllCustomers(null);
    setSelectedCustomerId(null);
    setCustomerDetail(null);
    setToast({ type: "success", message: "Signed out." });
  }

  async function fetchAllCustomers() {
    try {
      const res = await apiFetch("/api/admin/customers");
      const data = await res.json();
      if (res.ok) {
        setAllCustomers(data);
      } else {
        throw new Error(data.error || "Failed to load customers");
      }
    } catch (err) {
      setToast({ type: "error", message: err.message });
    }
  }

  async function openCustomer(customerId) {
    setSelectedCustomerId(customerId);
    setDetailLoading(true);
    setCustomerDetail(null);
    try {
      const res = await apiFetch(`/api/admin/customers/${customerId}/orders`);
      const data = await res.json();
      if (res.ok) {
        setCustomerDetail(data);
      } else {
        throw new Error(data.error || "Unable to load customer");
      }
    } catch (err) {
      setToast({ type: "error", message: err.message });
    } finally {
      setDetailLoading(false);
    }
  }

  async function updateStatus(orderId, status) {
    try {
      const response = await apiFetch(`/api/admin/orders/${orderId}`, {
        method: "POST",
        body: JSON.stringify({ status }),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Unable to update status");
      setOverview(data.overview);
      setToast({ type: "success", message: "Order status updated." });
      if (selectedCustomerId) {
        openCustomer(selectedCustomerId);
      }
    } catch (error) {
      setToast({ type: "error", message: error.message });
    }
  }

  function switchTab(tab) {
    setActiveTab(tab);
    setSelectedCustomerId(null);
    setCustomerDetail(null);
    if (tab === "customers" && !allCustomers) {
      fetchAllCustomers();
    }
  }

  useEffect(() => {
    if (admin && activeTab === "customers" && !allCustomers) {
      fetchAllCustomers();
    }
  }, [admin]);

  return (
    <div className="relative overflow-x-hidden">
      <PageGlow />
      <TopNav compact ctaHref="/book" ctaLabel="Book pickup" />

      <main className="mx-auto max-w-7xl px-4 py-14">
        <SectionHeading
          eyebrow="Admin portal"
          title="Manage customers, orders, invoices, and status changes in one place."
          description="Sign in to view all customer records, browse orders, update status, and open invoices."
        />

        {!admin || !overview ? (
          /* ── Login screen ── */
          <div className="mt-10 grid gap-8 xl:grid-cols-[0.75fr_1.25fr]">
            <form
              onSubmit={handleLogin}
              className="rounded-[2rem] border border-sand-200 bg-white/85 p-7 shadow-soft"
            >
              <p className="text-xs font-extrabold uppercase tracking-[0.28em] text-sand-700">
                Admin sign in
              </p>
              <div className="mt-6 grid gap-4">
                <Input
                  label="Email"
                  type="email"
                  value={login.email}
                  onChange={(e) =>
                    setLogin({ ...login, email: e.target.value })
                  }
                />
                <Input
                  label="Password"
                  type="password"
                  value={login.password}
                  onChange={(e) =>
                    setLogin({ ...login, password: e.target.value })
                  }
                />
              </div>
              <div className="mt-6">
                <ActionButton type="submit" disabled={loading}>
                  {loading ? "Opening..." : "Open dashboard"}
                </ActionButton>
              </div>
            </form>

            <div className="rounded-[2rem] border border-sand-200 bg-white/85 p-7 shadow-soft">
              <h3 className="font-display text-4xl leading-none">
                What you can do here
              </h3>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <article className="rounded-[1.5rem] border border-sand-200 bg-sand-50 p-5">
                  <strong className="block text-sand-900">View orders</strong>
                  <p className="mt-2 text-sm leading-7 text-sand-700">
                    See invoice number, pickup slot, customer name, bag code,
                    and current status.
                  </p>
                </article>
                <article className="rounded-[1.5rem] border border-sand-200 bg-sand-50 p-5">
                  <strong className="block text-sand-900">
                    View customers
                  </strong>
                  <p className="mt-2 text-sm leading-7 text-sand-700">
                    Browse all customer records and click any row to see their
                    full order history.
                  </p>
                </article>
                <article className="rounded-[1.5rem] border border-sand-200 bg-sand-50 p-5">
                  <strong className="block text-sand-900">Change status</strong>
                  <p className="mt-2 text-sm leading-7 text-sand-700">
                    Move orders from scheduled to picked up, processing,
                    returning, and completed.
                  </p>
                </article>
                <article className="rounded-[1.5rem] border border-sand-200 bg-sand-50 p-5">
                  <strong className="block text-sand-900">Open invoices</strong>
                  <p className="mt-2 text-sm leading-7 text-sand-700">
                    Open invoice pages directly and download them from the
                    browser.
                  </p>
                </article>
              </div>
            </div>
          </div>
        ) : (
          /* ── Dashboard ── */
          <div className="mt-10 space-y-6">
            {/* Top bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-[2rem] border border-sand-200 bg-white/85 p-5 shadow-soft">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.28em] text-sand-500">
                  Signed in as admin
                </p>
                <p className="mt-1 font-semibold text-sand-900">
                  {admin.name} <span className="text-sand-400">&middot;</span>{" "}
                  {admin.email}
                </p>
              </div>
              <ActionButton variant="secondary" onClick={handleLogout}>
                Sign out
              </ActionButton>
            </div>

            {/* Stat cards */}
            <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
              {[
                { label: "Total customers", value: overview.stats.customers },
                { label: "Total orders", value: overview.stats.orders },
                { label: "Revenue", value: overview.stats.revenue },
                { label: "Active orders", value: overview.stats.activeOrders },
              ].map(({ label, value }) => (
                <article
                  key={label}
                  className="rounded-[1.5rem] border border-sand-200 bg-white/85 p-5 shadow-soft"
                >
                  <p className="text-xs text-sand-500">{label}</p>
                  <p className="mt-1 text-3xl font-bold text-sand-900">
                    {value}
                  </p>
                </article>
              ))}
            </div>

            {/* Tabs */}
            <div className="flex gap-1 border-b border-sand-200">
              {["customers", "orders"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => switchTab(tab)}
                  className={`-mb-px rounded-t-xl border px-5 py-2.5 text-sm font-semibold transition-colors ${
                    activeTab === tab
                      ? "border-sand-200 border-b-white bg-white text-sand-900"
                      : "border-transparent text-sand-400 hover:text-sand-700"
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {/* ── Customers tab – list ── */}
            {activeTab === "customers" && !selectedCustomerId && (
              <section className="overflow-hidden rounded-[2rem] border border-sand-200 bg-white/85 shadow-soft">
                <div className="flex items-center justify-between border-b border-sand-100 px-6 py-4">
                  <h3 className="font-semibold text-sand-900">
                    All Customers
                    {allCustomers && (
                      <span className="ml-2 rounded-full bg-sand-100 px-2 py-0.5 text-xs font-semibold text-sand-500">
                        {allCustomers.length}
                      </span>
                    )}
                  </h3>
                  <button
                    onClick={fetchAllCustomers}
                    className="text-xs font-semibold text-sand-500 underline hover:text-sand-800"
                  >
                    Refresh
                  </button>
                </div>

                {!allCustomers ? (
                  <div className="p-10 text-center text-sm text-sand-400">
                    Loading…
                  </div>
                ) : allCustomers.length === 0 ? (
                  <div className="p-10 text-center text-sm text-sand-400">
                    No customers yet.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-sand-100 bg-sand-50 text-left text-xs font-bold uppercase tracking-wider text-sand-400">
                          <th className="px-6 py-3">Name</th>
                          <th className="px-6 py-3">Email</th>
                          <th className="px-6 py-3">City</th>
                          <th className="px-6 py-3">Bag code</th>
                          <th className="px-6 py-3 text-center">Orders</th>
                          <th className="px-6 py-3">Spent</th>
                          <th className="px-6 py-3">Status</th>
                          <th className="px-6 py-3">Joined</th>
                          <th className="px-6 py-3"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {allCustomers.map((c, i) => (
                          <tr
                            key={c.id}
                            onClick={() => openCustomer(c.id)}
                            className={`cursor-pointer border-b border-sand-100 transition-colors hover:bg-sand-50 ${
                              i % 2 !== 0 ? "bg-sand-50/30" : ""
                            }`}
                          >
                            <td className="px-6 py-4 font-semibold text-sand-900">
                              {c.first_name} {c.last_name}
                            </td>
                            <td className="px-6 py-4 text-sand-500">
                              {c.email}
                            </td>
                            <td className="px-6 py-4 text-sand-600">
                              {c.city || "—"}
                            </td>
                            <td className="px-6 py-4">
                              <code className="rounded bg-sand-100 px-2 py-0.5 font-mono text-xs text-sand-800">
                                {c.bag_code}
                              </code>
                            </td>
                            <td className="px-6 py-4 text-center font-semibold text-sand-800">
                              {c.order_count}
                            </td>
                            <td className="px-6 py-4 text-sand-800">
                              {formatCurrency(c.total_spent)}
                            </td>
                            <td className="px-6 py-4">
                              <StatusBadge status={c.status || "active"} />
                            </td>
                            <td className="px-6 py-4 text-xs text-sand-400">
                              {c.created_at
                                ? new Date(c.created_at).toLocaleDateString(
                                    "en-IN",
                                    {
                                      day: "2-digit",
                                      month: "short",
                                      year: "numeric",
                                    },
                                  )
                                : "—"}
                            </td>
                            <td className="px-6 py-4 text-xs font-semibold text-sand-400 hover:text-sand-700">
                              View →
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            )}

            {/* ── Customers tab – detail ── */}
            {activeTab === "customers" && selectedCustomerId && (
              <section className="space-y-6">
                <button
                  onClick={() => {
                    setSelectedCustomerId(null);
                    setCustomerDetail(null);
                  }}
                  className="flex items-center gap-1.5 text-sm font-semibold text-sand-500 hover:text-sand-900"
                >
                  ← Back to all customers
                </button>

                {detailLoading && (
                  <div className="p-10 text-center text-sm text-sand-400">
                    Loading…
                  </div>
                )}

                {customerDetail && (
                  <>
                    {/* Customer info */}
                    <div className="overflow-hidden rounded-[2rem] border border-sand-200 bg-white/85 p-6 shadow-soft">
                      <div className="flex flex-wrap items-start gap-6">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-sand-100 text-2xl font-bold text-sand-700">
                          {customerDetail.customer.firstName?.[0]?.toUpperCase() ||
                            "?"}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-sand-900">
                            {customerDetail.customer.firstName}{" "}
                            {customerDetail.customer.lastName}
                          </h3>
                          <p className="mt-0.5 text-sm text-sand-400">
                            {customerDetail.customer.email}
                          </p>
                          <div className="mt-4 grid gap-4 text-sm sm:grid-cols-2 xl:grid-cols-4">
                            <div>
                              <p className="text-xs text-sand-400">Address</p>
                              <p className="font-medium text-sand-800">
                                {customerDetail.customer.address || "—"},{" "}
                                {customerDetail.customer.city}{" "}
                                {customerDetail.customer.postalCode}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-sand-400">Phone</p>
                              <p className="font-medium text-sand-800">
                                {customerDetail.customer.phone || "—"}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-sand-400">Bag code</p>
                              <code className="rounded bg-sand-100 px-2 py-0.5 font-mono text-xs text-sand-800">
                                {customerDetail.customer.bagCode}
                              </code>
                            </div>
                            <div>
                              <p className="text-xs text-sand-400">
                                Member since
                              </p>
                              <p className="font-medium text-sand-800">
                                {customerDetail.customer.createdAt
                                  ? new Date(
                                      customerDetail.customer.createdAt,
                                    ).toLocaleDateString("en-IN", {
                                      day: "2-digit",
                                      month: "short",
                                      year: "numeric",
                                    })
                                  : "—"}
                              </p>
                            </div>
                          </div>
                        </div>
                        {customerDetail.customer.qrSvg && (
                          <div className="shrink-0">
                            <QrCard
                              title="Bag QR"
                              subtitle="Scan to re-book"
                              bagCode={customerDetail.customer.bagCode}
                              qrSvg={customerDetail.customer.qrSvg}
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Orders table */}
                    <div className="overflow-hidden rounded-[2rem] border border-sand-200 bg-white/85 shadow-soft">
                      <div className="border-b border-sand-100 px-6 py-4">
                        <h4 className="font-semibold text-sand-900">
                          Orders
                          <span className="ml-2 rounded-full bg-sand-100 px-2 py-0.5 text-xs font-semibold text-sand-500">
                            {customerDetail.orders.length}
                          </span>
                        </h4>
                      </div>

                      {customerDetail.orders.length === 0 ? (
                        <div className="p-8 text-center text-sm text-sand-400">
                          No orders yet.
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-sand-100 bg-sand-50 text-left text-xs font-bold uppercase tracking-wider text-sand-400">
                                <th className="px-6 py-3">Invoice</th>
                                <th className="px-6 py-3">Pickup</th>
                                <th className="px-6 py-3">Slot</th>
                                <th className="px-6 py-3">Type</th>
                                <th className="px-6 py-3">Shirts</th>
                                <th className="px-6 py-3">Amount</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3">Update status</th>
                                <th className="px-6 py-3">Invoice</th>
                              </tr>
                            </thead>
                            <tbody>
                              {customerDetail.orders.map((order, i) => (
                                <tr
                                  key={order.id}
                                  className={`border-b border-sand-100 ${
                                    i % 2 !== 0 ? "bg-sand-50/30" : ""
                                  }`}
                                >
                                  <td className="px-6 py-4">
                                    <code className="font-mono text-xs text-sand-600">
                                      {order.invoice_number}
                                    </code>
                                  </td>
                                  <td className="px-6 py-4 text-sand-700">
                                    {formatPickupDate(order.pickup_date)}
                                  </td>
                                  <td className="px-6 py-4 text-xs text-sand-500">
                                    {order.pickup_slot}
                                  </td>
                                  <td className="px-6 py-4 capitalize text-sand-700">
                                    {String(
                                      order.laundry_type || "",
                                    ).replaceAll("_", " ")}
                                  </td>
                                  <td className="px-6 py-4 text-center text-sand-700">
                                    {order.shirts_count || 0}
                                  </td>
                                  <td className="px-6 py-4 font-semibold text-sand-900">
                                    {formatCurrency(order.amount)}
                                  </td>
                                  <td className="px-6 py-4">
                                    <StatusBadge status={order.status} />
                                  </td>
                                  <td className="px-6 py-4">
                                    <select
                                      value={order.status}
                                      onChange={(e) =>
                                        updateStatus(order.id, e.target.value)
                                      }
                                      className="rounded-xl border border-sand-200 bg-white px-3 py-1.5 text-xs font-semibold text-sand-800 outline-none focus:ring-2 focus:ring-sand-300"
                                    >
                                      {customerDetail.statusOptions.map((s) => (
                                        <option key={s} value={s}>
                                          {s.replaceAll("_", " ")}
                                        </option>
                                      ))}
                                    </select>
                                  </td>
                                  <td className="px-6 py-4">
                                    <a
                                      href={`/invoice/${order.id}`}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-xs font-semibold text-sand-500 underline hover:text-sand-900"
                                    >
                                      Open
                                    </a>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </section>
            )}

            {/* ── Orders tab ── */}
            {activeTab === "orders" && (
              <section className="overflow-hidden rounded-[2rem] border border-sand-200 bg-white/85 shadow-soft">
                <div className="border-b border-sand-100 px-6 py-4">
                  <h3 className="font-semibold text-sand-900">
                    Recent Orders
                    {overview.recentOrders?.length > 0 && (
                      <span className="ml-2 rounded-full bg-sand-100 px-2 py-0.5 text-xs font-semibold text-sand-500">
                        {overview.recentOrders.length}
                      </span>
                    )}
                  </h3>
                </div>

                {!overview.recentOrders?.length ? (
                  <div className="p-10 text-center text-sm text-sand-400">
                    No orders yet.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-sand-100 bg-sand-50 text-left text-xs font-bold uppercase tracking-wider text-sand-400">
                          <th className="px-6 py-3">Invoice</th>
                          <th className="px-6 py-3">Customer</th>
                          <th className="px-6 py-3">Pickup</th>
                          <th className="px-6 py-3">Slot</th>
                          <th className="px-6 py-3">Bag code</th>
                          <th className="px-6 py-3">Amount</th>
                          <th className="px-6 py-3">Status</th>
                          <th className="px-6 py-3">Update</th>
                          <th className="px-6 py-3">Invoice</th>
                        </tr>
                      </thead>
                      <tbody>
                        {overview.recentOrders.map((order, i) => (
                          <tr
                            key={order.id}
                            className={`border-b border-sand-100 ${
                              i % 2 !== 0 ? "bg-sand-50/30" : ""
                            }`}
                          >
                            <td className="px-6 py-4">
                              <code className="font-mono text-xs text-sand-600">
                                {order.invoice_number}
                              </code>
                            </td>
                            <td className="px-6 py-4">
                              <p className="font-semibold text-sand-900">
                                {order.first_name} {order.last_name}
                              </p>
                              <p className="text-xs text-sand-400">
                                {order.email}
                              </p>
                            </td>
                            <td className="px-6 py-4 text-sand-700">
                              {formatPickupDate(order.pickup_date)}
                            </td>
                            <td className="px-6 py-4 text-xs text-sand-500">
                              {order.pickup_slot}
                            </td>
                            <td className="px-6 py-4">
                              <code className="rounded bg-sand-100 px-2 py-0.5 font-mono text-xs text-sand-800">
                                {order.bag_code}
                              </code>
                            </td>
                            <td className="px-6 py-4 font-semibold text-sand-900">
                              {formatCurrency(order.amount)}
                            </td>
                            <td className="px-6 py-4">
                              <StatusBadge status={order.status} />
                            </td>
                            <td className="px-6 py-4">
                              <select
                                value={order.status}
                                onChange={(e) =>
                                  updateStatus(order.id, e.target.value)
                                }
                                className="rounded-xl border border-sand-200 bg-white px-3 py-1.5 text-xs font-semibold text-sand-800 outline-none focus:ring-2 focus:ring-sand-300"
                              >
                                {overview.statusOptions.map((s) => (
                                  <option key={s} value={s}>
                                    {s.replaceAll("_", " ")}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td className="px-6 py-4">
                              <a
                                href={`/invoice/${order.id}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs font-semibold text-sand-500 underline hover:text-sand-900"
                              >
                                Open
                              </a>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            )}
          </div>
        )}
      </main>
      <Footer />

      <Toast toast={toast} />
    </div>
  );
}
