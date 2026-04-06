"use client";

import { useEffect, useState } from "react";
import {
  apiFetch,
  formatCurrency,
  formatPickupDate,
  QrCard,
  Toast,
} from "./shared-ui";

const emptyAdminLogin = { email: "", password: "" };

const STATUS_META = {
  scheduled: { bg: "#dbeafe", color: "#1d4ed8", dot: "#3b82f6" },
  picked_up: { bg: "#fef9c3", color: "#854d0e", dot: "#ca8a04" },
  processing: { bg: "#ffedd5", color: "#9a3412", dot: "#ea580c" },
  returning: { bg: "#f3e8ff", color: "#6b21a8", dot: "#9333ea" },
  completed: { bg: "#dcfce7", color: "#166534", dot: "#16a34a" },
};

function StatusBadge({ status }) {
  const m = STATUS_META[status] || {
    bg: "#f3f4f6",
    color: "#6b7280",
    dot: "#9ca3af",
  };
  return (
    <span
      style={{ backgroundColor: m.bg, color: m.color }}
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize"
    >
      <span
        style={{ backgroundColor: m.dot }}
        className="h-1.5 w-1.5 rounded-full inline-block"
      />
      {String(status || "").replaceAll("_", " ")}
    </span>
  );
}

/* ── Sidebar nav item ── */
function NavItem({ icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
        active
          ? "bg-white/10 text-white"
          : "text-gray-400 hover:bg-white/5 hover:text-white"
      }`}
    >
      <span className="text-lg leading-none">{icon}</span>
      {label}
    </button>
  );
}

/* ── Stat card ── */
function StatCard({ label, value, icon, accent }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            {label}
          </p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div
          style={{ backgroundColor: accent + "22", color: accent }}
          className="flex h-11 w-11 items-center justify-center rounded-xl text-xl"
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

/* ── Simple SVG donut ── */
function DonutChart({ data }) {
  const size = 160;
  const r = 60;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  let offset = 0;
  return (
    <div className="relative flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        {data.map((d, i) => {
          const dash = (d.value / total) * circumference;
          const gap = circumference - dash;
          const seg = (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke={d.color}
              strokeWidth={22}
              strokeDasharray={`${dash} ${gap}`}
              strokeDashoffset={-offset}
            />
          );
          offset += dash;
          return seg;
        })}
      </svg>
      <div className="absolute text-center">
        <p className="text-2xl font-bold text-gray-900">{total}</p>
        <p className="text-xs text-gray-400">Orders</p>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const [login, setLogin] = useState(emptyAdminLogin);
  const [admin, setAdmin] = useState(null);
  const [overview, setOverview] = useState(null);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [allCustomers, setAllCustomers] = useState(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [customerDetail, setCustomerDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
      const res = await fetch("/api/auth/session", {
        credentials: "same-origin",
      });
      const data = await res.json();
      if (data.authenticated && data.role === "admin") {
        setAdmin(data.admin);
        setOverview(data.overview);
      }
    } catch {
      setToast({ type: "error", message: "Unable to restore admin session." });
    }
  }

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await apiFetch("/api/admin/login", {
        method: "POST",
        body: JSON.stringify(login),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unable to sign in as admin");
      setAdmin(data.admin);
      setOverview(data.overview);
      setToast({ type: "success", message: `Welcome, ${data.admin.name}.` });
    } catch (err) {
      setToast({ type: "error", message: err.message });
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
      if (res.ok) setAllCustomers(data);
      else throw new Error(data.error || "Failed to load customers");
    } catch (err) {
      setToast({ type: "error", message: err.message });
    }
  }

  async function openCustomer(id) {
    setSelectedCustomerId(id);
    setDetailLoading(true);
    setCustomerDetail(null);
    try {
      const res = await apiFetch(`/api/admin/customers/${id}/orders`);
      const data = await res.json();
      if (res.ok) setCustomerDetail(data);
      else throw new Error(data.error || "Unable to load customer");
    } catch (err) {
      setToast({ type: "error", message: err.message });
    } finally {
      setDetailLoading(false);
    }
  }

  async function updateStatus(orderId, status) {
    try {
      const res = await apiFetch(`/api/admin/orders/${orderId}`, {
        method: "POST",
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unable to update status");
      setOverview(data.overview);
      setToast({ type: "success", message: "Order status updated." });
      if (selectedCustomerId) openCustomer(selectedCustomerId);
    } catch (err) {
      setToast({ type: "error", message: err.message });
    }
  }

  function switchTab(tab) {
    setActiveTab(tab);
    setSelectedCustomerId(null);
    setCustomerDetail(null);
    if (tab === "customers" && !allCustomers) fetchAllCustomers();
  }

  useEffect(() => {
    if (admin && activeTab === "customers" && !allCustomers)
      fetchAllCustomers();
  }, [admin]);

  /* ───────────────────────────── LOGIN ───────────────────────────── */
  if (!admin || !overview) {
    return (
      <div className="flex min-h-screen">
        {/* Left dark panel */}
        <div className="hidden w-1/2 flex-col justify-between bg-gray-950 p-12 lg:flex">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-gray-500">
              laundry.li
            </p>
          </div>
          <div>
            <h1 className="text-5xl font-bold leading-tight text-white">
              Admin
              <br />
              Dashboard
            </h1>
            <p className="mt-4 text-base text-gray-400 leading-relaxed">
              Manage customers, orders,
              <br />
              invoices and status updates.
            </p>
          </div>
          <div className="space-y-3">
            {[
              "Customers & orders",
              "Invoice management",
              "Status tracking",
              "Real-time overview",
            ].map((f) => (
              <div
                key={f}
                className="flex items-center gap-3 text-sm text-gray-400"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-white text-xs">
                  ✓
                </span>
                {f}
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-600">
            © {new Date().getFullYear()} laundry.li · Admin Portal
          </p>
        </div>

        {/* Right white panel */}
        <div className="flex flex-1 items-center justify-center bg-white px-8">
          <div className="w-full max-w-md">
            <div className="mb-10">
              <h2 className="text-4xl font-bold text-gray-900">Sign In</h2>
              <p className="mt-2 text-sm text-gray-400">
                Sign in using your admin email address
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                    Your email
                  </label>
                  <input
                    type="email"
                    value={login.email}
                    onChange={(e) =>
                      setLogin({ ...login, email: e.target.value })
                    }
                    placeholder="admin@laundry.li"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-gray-400 focus:ring-0"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={login.password}
                      onChange={(e) =>
                        setLogin({ ...login, password: e.target.value })
                      }
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 pr-10 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-gray-400 focus:ring-0"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((p) => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                    >
                      {showPassword ? "🙈" : "👁"}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-gray-500 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 accent-gray-900"
                  />
                  Remember me
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-full bg-gray-900 py-3.5 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {loading ? "Signing in…" : "Sign in"}
              </button>
            </form>

            {/* <p className="mt-8 text-center text-xs text-gray-300">
              Design &amp; Developer by Applie AG
            </p> */}
          </div>
        </div>

        <Toast toast={toast} />
      </div>
    );
  }

  /* ───────────────────────────── DASHBOARD ───────────────────────────── */
  const statusCounts = (overview.recentOrders || []).reduce((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {});
  const donutData = Object.entries(STATUS_META)
    .map(([key, m]) => ({
      label: key.replaceAll("_", " "),
      value: statusCounts[key] || 0,
      color: m.dot,
    }))
    .filter((d) => d.value > 0);

  const NAV = [
    { id: "dashboard", label: "Dashboard", icon: "⊞" },
    { id: "orders", label: "Orders", icon: "≡" },
    { id: "customers", label: "Customers", icon: "◎" },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* ── Sidebar ── */}
      <aside className="fixed left-0 top-0 flex h-full w-56 flex-col bg-gray-950 px-4 py-6 z-20">
        <div className="mb-8 px-2">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-gray-500">
            laundry.li
          </p>
        </div>

        <nav className="flex-1 space-y-1">
          <p className="px-3 pb-2 pt-1 text-[10px] font-bold uppercase tracking-widest text-gray-600">
            Menu
          </p>
          {NAV.map((item) => (
            <NavItem
              key={item.id}
              icon={item.icon}
              label={item.label}
              active={activeTab === item.id}
              onClick={() => switchTab(item.id)}
            />
          ))}
        </nav>

        <div className="border-t border-white/5 pt-4">
          <div className="mb-3 flex items-center gap-3 px-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-sm font-bold text-white">
              {admin.name?.[0]?.toUpperCase() || "A"}
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-white">
                {admin.name}
              </p>
              <p className="truncate text-[10px] text-gray-500">
                {admin.email}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-400 transition-colors hover:bg-white/5 hover:text-white"
          >
            <span className="text-lg">⇠</span> Logout
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <div className="ml-56 flex-1 overflow-auto">
        {/* Top bar */}
        <header className="flex items-center justify-between border-b border-gray-200 bg-white px-8 py-4 sticky top-0 z-10">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
            </h1>
            <p className="text-sm text-gray-400">
              Hello {admin.name?.split(" ")[0]}, welcome back
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-900 text-sm font-bold text-white">
              {admin.name?.[0]?.toUpperCase() || "A"}
            </div>
          </div>
        </header>

        <main className="p-8">
          {/* ── DASHBOARD TAB ── */}
          {activeTab === "dashboard" && (
            <div className="space-y-8">
              {/* Stat cards */}
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                  label="Total Customers"
                  value={overview.stats.customers}
                  icon="◎"
                  accent="#6366f1"
                />
                <StatCard
                  label="Total Orders"
                  value={overview.stats.orders}
                  icon="≡"
                  accent="#ec4899"
                />
                <StatCard
                  label="Revenue"
                  value={overview.stats.revenue}
                  icon="₣"
                  accent="#f59e0b"
                />
                <StatCard
                  label="Active Orders"
                  value={overview.stats.activeOrders}
                  icon="◷"
                  accent="#10b981"
                />
              </div>

              <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
                {/* Recent orders table */}
                <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                  <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                    <h3 className="font-semibold text-gray-900">
                      Recent Orders
                    </h3>
                    <button
                      onClick={() => switchTab("orders")}
                      className="text-xs font-semibold text-gray-400 hover:text-gray-700"
                    >
                      View all →
                    </button>
                  </div>
                  {!overview.recentOrders?.length ? (
                    <div className="p-10 text-center text-sm text-gray-400">
                      No orders yet.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-bold uppercase tracking-wider text-gray-400">
                            <th className="px-6 py-3">Customer</th>
                            <th className="px-6 py-3">Pickup</th>
                            <th className="px-6 py-3">Amount</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3">Update</th>
                          </tr>
                        </thead>
                        <tbody>
                          {overview.recentOrders.slice(0, 8).map((order, i) => (
                            <tr
                              key={order.id}
                              className={`border-b border-gray-50 ${i % 2 !== 0 ? "bg-gray-50/50" : ""}`}
                            >
                              <td className="px-6 py-3.5">
                                <p className="font-semibold text-gray-900">
                                  {order.first_name} {order.last_name}
                                </p>
                                <p className="text-xs text-gray-400">
                                  {order.invoice_number}
                                </p>
                              </td>
                              <td className="px-6 py-3.5 text-gray-600 text-xs">
                                <p>{formatPickupDate(order.pickup_date)}</p>
                                <p className="text-gray-400">
                                  {order.pickup_slot}
                                </p>
                              </td>
                              <td className="px-6 py-3.5 font-semibold text-gray-900">
                                {formatCurrency(order.amount)}
                              </td>
                              <td className="px-6 py-3.5">
                                <StatusBadge status={order.status} />
                              </td>
                              <td className="px-6 py-3.5">
                                <select
                                  value={order.status}
                                  onChange={(e) =>
                                    updateStatus(order.id, e.target.value)
                                  }
                                  className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs font-semibold text-gray-700 outline-none focus:ring-1 focus:ring-gray-300"
                                >
                                  {overview.statusOptions.map((s) => (
                                    <option key={s} value={s}>
                                      {s.replaceAll("_", " ")}
                                    </option>
                                  ))}
                                </select>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Right column */}
                <div className="space-y-6">
                  {/* Orders donut */}
                  <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                    <h3 className="mb-4 font-semibold text-gray-900">
                      Orders by Status
                    </h3>
                    {donutData.length > 0 ? (
                      <>
                        <div className="flex justify-center">
                          <DonutChart data={donutData} />
                        </div>
                        <div className="mt-4 space-y-2">
                          {donutData.map((d) => (
                            <div
                              key={d.label}
                              className="flex items-center justify-between text-xs"
                            >
                              <div className="flex items-center gap-2">
                                <span
                                  style={{ backgroundColor: d.color }}
                                  className="h-2 w-2 rounded-full inline-block"
                                />
                                <span className="capitalize text-gray-600">
                                  {d.label}
                                </span>
                              </div>
                              <span className="font-semibold text-gray-900">
                                {d.value}
                              </span>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <p className="text-center text-sm text-gray-400 py-6">
                        No data
                      </p>
                    )}
                  </div>

                  {/* Recent customers */}
                  <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900">
                        Recent Customers
                      </h3>
                      <button
                        onClick={() => switchTab("customers")}
                        className="text-xs font-semibold text-gray-400 hover:text-gray-700"
                      >
                        View all →
                      </button>
                    </div>
                    <div className="space-y-3">
                      {(overview.customers || []).slice(0, 5).map((c) => (
                        <div key={c.id} className="flex items-center gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-600">
                            {c.first_name?.[0]?.toUpperCase() || "?"}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-gray-900">
                              {c.first_name} {c.last_name}
                            </p>
                            <p className="truncate text-xs text-gray-400">
                              {c.email}
                            </p>
                          </div>
                          <code className="shrink-0 rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-mono text-gray-600">
                            {c.bag_code}
                          </code>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── ORDERS TAB ── */}
          {activeTab === "orders" && (
            <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                <h3 className="font-semibold text-gray-900">
                  All Orders
                  {overview.recentOrders?.length > 0 && (
                    <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-500">
                      {overview.recentOrders.length}
                    </span>
                  )}
                </h3>
              </div>
              {!overview.recentOrders?.length ? (
                <div className="p-10 text-center text-sm text-gray-400">
                  No orders yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-bold uppercase tracking-wider text-gray-400">
                        <th className="px-6 py-3">Invoice</th>
                        <th className="px-6 py-3">Customer</th>
                        <th className="px-6 py-3">Pickup</th>
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
                          className={`border-b border-gray-50 ${i % 2 !== 0 ? "bg-gray-50/50" : ""}`}
                        >
                          <td className="px-6 py-4">
                            <code className="font-mono text-xs text-gray-500">
                              {order.invoice_number}
                            </code>
                          </td>
                          <td className="px-6 py-4">
                            <p className="font-semibold text-gray-900">
                              {order.first_name} {order.last_name}
                            </p>
                            <p className="text-xs text-gray-400">
                              {order.email}
                            </p>
                          </td>
                          <td className="px-6 py-4 text-gray-600 text-xs">
                            <p className="font-medium text-gray-800">
                              {formatPickupDate(order.pickup_date)}
                            </p>
                            <p className="text-gray-400">{order.pickup_slot}</p>
                          </td>
                          <td className="px-6 py-4">
                            <code className="rounded bg-gray-100 px-2 py-0.5 font-mono text-xs text-gray-700">
                              {order.bag_code}
                            </code>
                          </td>
                          <td className="px-6 py-4 font-semibold text-gray-900">
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
                              className="rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-xs font-semibold text-gray-700 outline-none focus:ring-1 focus:ring-gray-300"
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
                              className="text-xs font-semibold text-gray-400 underline hover:text-gray-900"
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
          )}

          {/* ── CUSTOMERS TAB ── */}
          {activeTab === "customers" && !selectedCustomerId && (
            <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                <h3 className="font-semibold text-gray-900">
                  All Customers
                  {allCustomers && (
                    <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-500">
                      {allCustomers.length}
                    </span>
                  )}
                </h3>
                <button
                  onClick={fetchAllCustomers}
                  className="text-xs font-semibold text-gray-400 hover:text-gray-700 underline"
                >
                  Refresh
                </button>
              </div>
              {!allCustomers ? (
                <div className="p-10 text-center text-sm text-gray-400">
                  Loading…
                </div>
              ) : allCustomers.length === 0 ? (
                <div className="p-10 text-center text-sm text-gray-400">
                  No customers yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-bold uppercase tracking-wider text-gray-400">
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
                          className={`cursor-pointer border-b border-gray-50 transition-colors hover:bg-gray-50 ${i % 2 !== 0 ? "bg-gray-50/50" : ""}`}
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-600">
                                {c.first_name?.[0]?.toUpperCase() || "?"}
                              </div>
                              <span className="font-semibold text-gray-900">
                                {c.first_name} {c.last_name}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-gray-500">{c.email}</td>
                          <td className="px-6 py-4 text-gray-600">
                            {c.city || "—"}
                          </td>
                          <td className="px-6 py-4">
                            <code className="rounded bg-gray-100 px-2 py-0.5 font-mono text-xs text-gray-700">
                              {c.bag_code}
                            </code>
                          </td>
                          <td className="px-6 py-4 text-center font-semibold text-gray-800">
                            {c.order_count}
                          </td>
                          <td className="px-6 py-4 font-semibold text-gray-800">
                            {formatCurrency(c.total_spent)}
                          </td>
                          <td className="px-6 py-4">
                            <StatusBadge status={c.status || "active"} />
                          </td>
                          <td className="px-6 py-4 text-xs text-gray-400">
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
                          <td className="px-6 py-4 text-xs font-semibold text-gray-400 hover:text-gray-700">
                            View →
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── CUSTOMER DETAIL ── */}
          {activeTab === "customers" && selectedCustomerId && (
            <div className="space-y-6">
              <button
                onClick={() => {
                  setSelectedCustomerId(null);
                  setCustomerDetail(null);
                }}
                className="flex items-center gap-1.5 text-sm font-semibold text-gray-400 hover:text-gray-900"
              >
                ← Back to customers
              </button>

              {detailLoading && (
                <div className="p-10 text-center text-sm text-gray-400">
                  Loading…
                </div>
              )}

              {customerDetail && (
                <>
                  <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                    <div className="flex flex-wrap items-start gap-6">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gray-100 text-2xl font-bold text-gray-700">
                        {customerDetail.customer.firstName?.[0]?.toUpperCase() ||
                          "?"}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900">
                          {customerDetail.customer.firstName}{" "}
                          {customerDetail.customer.lastName}
                        </h3>
                        <p className="mt-0.5 text-sm text-gray-400">
                          {customerDetail.customer.email}
                        </p>
                        <div className="mt-4 grid gap-4 text-sm sm:grid-cols-2 xl:grid-cols-4">
                          {[
                            {
                              label: "Address",
                              value: `${customerDetail.customer.address || "—"}, ${customerDetail.customer.city} ${customerDetail.customer.postalCode}`,
                            },
                            {
                              label: "Phone",
                              value: customerDetail.customer.phone || "—",
                            },
                            {
                              label: "Bag code",
                              value: customerDetail.customer.bagCode,
                            },
                            {
                              label: "Member since",
                              value: customerDetail.customer.createdAt
                                ? new Date(
                                    customerDetail.customer.createdAt,
                                  ).toLocaleDateString("en-IN", {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                  })
                                : "—",
                            },
                          ].map(({ label, value }) => (
                            <div key={label}>
                              <p className="text-xs text-gray-400">{label}</p>
                              <p className="font-medium text-gray-800">
                                {value}
                              </p>
                            </div>
                          ))}
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

                  <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                    <div className="border-b border-gray-100 px-6 py-4">
                      <h4 className="font-semibold text-gray-900">
                        Orders
                        <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-500">
                          {customerDetail.orders.length}
                        </span>
                      </h4>
                    </div>
                    {customerDetail.orders.length === 0 ? (
                      <div className="p-8 text-center text-sm text-gray-400">
                        No orders yet.
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-bold uppercase tracking-wider text-gray-400">
                              <th className="px-6 py-3">Invoice</th>
                              <th className="px-6 py-3">Pickup</th>
                              <th className="px-6 py-3">Slot</th>
                              <th className="px-6 py-3">Type</th>
                              <th className="px-6 py-3">Shirts</th>
                              <th className="px-6 py-3">Amount</th>
                              <th className="px-6 py-3">Status</th>
                              <th className="px-6 py-3">Update</th>
                              <th className="px-6 py-3">Invoice</th>
                            </tr>
                          </thead>
                          <tbody>
                            {customerDetail.orders.map((order, i) => (
                              <tr
                                key={order.id}
                                className={`border-b border-gray-50 ${i % 2 !== 0 ? "bg-gray-50/50" : ""}`}
                              >
                                <td className="px-6 py-4">
                                  <code className="font-mono text-xs text-gray-500">
                                    {order.invoice_number}
                                  </code>
                                </td>
                                <td className="px-6 py-4 text-gray-700">
                                  {formatPickupDate(order.pickup_date)}
                                </td>
                                <td className="px-6 py-4 text-xs text-gray-500">
                                  {order.pickup_slot}
                                </td>
                                <td className="px-6 py-4 capitalize text-gray-700">
                                  {String(order.laundry_type || "").replaceAll(
                                    "_",
                                    " ",
                                  )}
                                </td>
                                <td className="px-6 py-4 text-center text-gray-700">
                                  {order.shirts_count || 0}
                                </td>
                                <td className="px-6 py-4 font-semibold text-gray-900">
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
                                    className="rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-xs font-semibold text-gray-700 outline-none focus:ring-1 focus:ring-gray-300"
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
                                    className="text-xs font-semibold text-gray-400 underline hover:text-gray-900"
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
            </div>
          )}
        </main>
      </div>

      <Toast toast={toast} />
    </div>
  );
}
