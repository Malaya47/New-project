const form = document.querySelector("#registration-form");
const steps = Array.from(document.querySelectorAll(".wizard-step"));
const indicators = Array.from(document.querySelectorAll("[data-step-indicator]"));
const nextButton = document.querySelector("#next-button");
const backButton = document.querySelector("#back-button");
const submitButton = document.querySelector("#submit-button");
const reviewCard = document.querySelector("#review-card");
const resultCard = document.querySelector("#result-card");
const newOrderButton = document.querySelector("#new-order");
const toast = document.querySelector("#toast");
const tabButtons = Array.from(document.querySelectorAll(".tab-button"));
const tabPanels = Array.from(document.querySelectorAll(".tab-panel"));
const loginForm = document.querySelector("#login-form");
const repeatForm = document.querySelector("#repeat-form");
const adminLoginForm = document.querySelector("#admin-login-form");

let currentStep = 1;
let currentCustomer = null;
let currentAdmin = null;

function formatCurrency(value) {
  return new Intl.NumberFormat("de-CH", {
    style: "currency",
    currency: "CHF",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

const formatters = {
  pickupDate(value) {
    if (!value) return "Not selected";
    const [year, month, day] = value.split("-");
    return new Date(year, Number(month) - 1, day).toLocaleDateString("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  },
  laundryType(value) {
    if (!value) return "Not selected";
    return value.charAt(0).toUpperCase() + value.slice(1);
  },
  shirtsCount(value) {
    return value && Number(value) > 0 ? `${value} item(s)` : "None";
  },
  notes(value) {
    return value && value.trim() ? value.trim() : "No notes";
  },
};

function showToast(message, isError = false) {
  toast.hidden = false;
  toast.textContent = message;
  toast.classList.toggle("toast-error", isError);
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => {
    toast.hidden = true;
  }, 3600);
}

function updateStepper() {
  steps.forEach((step) => {
    step.classList.toggle("active", Number(step.dataset.step) === currentStep);
  });

  indicators.forEach((indicator) => {
    indicator.classList.toggle("active", Number(indicator.dataset.stepIndicator) === currentStep);
  });

  backButton.hidden = currentStep === 1;
  nextButton.hidden = currentStep === 3;
  submitButton.hidden = currentStep !== 3;
}

function getFormData(formElement) {
  const formData = new FormData(formElement);
  return Object.fromEntries(formData.entries());
}

function renderReview() {
  const data = getFormData(form);

  const fields = [
    ["Email", data.email || "Not provided"],
    ["Customer", `${data.firstName || ""} ${data.lastName || ""}`.trim() || "Not provided"],
    ["Address", [data.address, data.city, data.postalCode].filter(Boolean).join(", ") || "Not provided"],
    ["Pickup date", formatters.pickupDate(data.pickupDate)],
    ["Time slot", data.pickupSlot || "Not selected"],
    ["Billing plan", data.billingPlan === "subscription" ? "Subscription • CHF 50" : "One-time • CHF 55"],
    ["Laundry type", formatters.laundryType(data.laundryType)],
    ["Shirts / blouses", `${formatters.shirtsCount(data.shirtsCount)} • CHF 4 each`],
    ["Notes", formatters.notes(data.notes)],
  ];

  reviewCard.innerHTML = fields
    .map(
      ([label, value]) => `
        <article class="review-item">
          <small>${label}</small>
          <strong>${value}</strong>
        </article>
      `
    )
    .join("");
}

function validateCurrentStep() {
  const activeStep = steps.find((step) => step.classList.contains("active"));
  const fields = Array.from(activeStep.querySelectorAll("input, textarea, select"));

  for (const field of fields) {
    if (!field.reportValidity()) {
      return false;
    }
  }

  if (currentStep === 2) {
    const hasLaundryType = form.querySelector("input[name='laundryType']:checked");
    if (!hasLaundryType) {
      showToast("Choose a laundry type before continuing.", true);
      return false;
    }
  }

  return true;
}

function setActiveTab(targetId) {
  tabButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.tabTarget === targetId);
  });
  tabPanels.forEach((panel) => {
    panel.classList.toggle("active", panel.id === targetId);
  });
}

tabButtons.forEach((button) => {
  button.addEventListener("click", () => setActiveTab(button.dataset.tabTarget));
});

nextButton.addEventListener("click", () => {
  if (!validateCurrentStep()) return;
  currentStep += 1;
  if (currentStep === 3) {
    renderReview();
  }
  updateStepper();
});

backButton.addEventListener("click", () => {
  currentStep -= 1;
  updateStepper();
});

function renderCustomerHub(customer, orders = []) {
  const profile = document.querySelector("#customer-profile");
  const ordersBox = document.querySelector("#customer-orders");

  if (!customer) {
    profile.innerHTML = `
      <div class="card-title">
        <p class="eyebrow">Session</p>
        <h3>Not signed in</h3>
      </div>
      <p class="muted-copy">Register a first order or sign in to load the saved customer dashboard.</p>
    `;
    ordersBox.innerHTML = `<div class="empty-state">No customer session loaded yet.</div>`;
    return;
  }

  profile.innerHTML = `
    <div class="card-title">
      <p class="eyebrow">Customer profile</p>
      <h3>${customer.firstName} ${customer.lastName}</h3>
    </div>
    <div class="profile-grid">
      <div><small>Email</small><strong>${customer.email}</strong></div>
      <div><small>Bag code</small><strong>${customer.bagCode}</strong></div>
      <div><small>Address</small><strong>${customer.address}, ${customer.city} ${customer.postalCode}</strong></div>
      <div><small>Phone</small><strong>${customer.phone || "Not provided"}</strong></div>
    </div>
    <div class="qr-inline">${customer.qrSvg}</div>
    <div class="panel-actions">
      <button class="button button-secondary" type="button" id="logout-customer">Sign out</button>
    </div>
  `;

  const rows = orders.length
    ? orders
        .map(
          (order) => `
            <article class="mini-order">
              <div>
                <small>${order.invoice_number}</small>
                <strong>${formatters.pickupDate(order.pickup_date)} • ${order.pickup_slot}</strong>
              </div>
              <div>
                <small>${formatters.laundryType(order.laundry_type)}</small>
                <strong>${order.status.replaceAll("_", " ")}</strong>
              </div>
              <div>
                <small>Total</small>
                <strong>${formatCurrency(order.amount)}</strong>
              </div>
              <a class="text-link" href="/invoice/${order.id}" target="_blank" rel="noreferrer">Open invoice</a>
            </article>
          `
        )
        .join("")
    : `<div class="empty-state">No orders yet.</div>`;

  ordersBox.innerHTML = rows;

  document.querySelector("#logout-customer")?.addEventListener("click", async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    currentCustomer = null;
    renderCustomerHub(null);
    showToast("Signed out.");
  });
}

function renderBookingResult(response) {
  form.hidden = true;
  resultCard.hidden = false;
  indicators.forEach((indicator) => {
    indicator.classList.toggle("active", Number(indicator.dataset.stepIndicator) === 4);
  });

  document.querySelector("#bag-code").textContent = response.customer.bagCode;
  document.querySelector("#qr-output").innerHTML = response.customer.qrSvg;
  document.querySelector("#result-pickup").textContent = `${formatters.pickupDate(response.order.pickupDate)} • ${response.order.pickupSlot}`;
  document.querySelector("#result-return").textContent = response.order.returnWindow;
  document.querySelector("#result-invoice").textContent = response.order.invoiceNumber;
  document.querySelector("#result-amount").textContent = response.order.amount;

  const invoiceLink = document.querySelector("#print-invoice");
  invoiceLink.href = response.order.invoiceUrl;

  const invoiceTextLink = document.querySelector("#copy-invoice-text");
  invoiceTextLink.href = `/invoice-text/${response.order.id}`;

  currentCustomer = response.customer;
  loadSession();
  window.open(response.order.invoiceUrl, "_blank", "noopener,noreferrer");
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!validateCurrentStep()) return;

  submitButton.disabled = true;
  submitButton.textContent = "Creating booking...";

  try {
    const payload = getFormData(form);
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await response.json();

    if (!response.ok) throw new Error(result.error || "Unable to complete registration");

    renderBookingResult(result);
    showToast("Registration completed and invoice generated.");
  } catch (error) {
    showToast(error.message, true);
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Confirm Pickup";
  }
});

newOrderButton.addEventListener("click", () => {
  form.reset();
  form.hidden = false;
  resultCard.hidden = true;
  currentStep = 1;
  updateStepper();
});

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const button = loginForm.querySelector("button[type='submit']");
  button.disabled = true;
  button.textContent = "Signing in...";

  try {
    const payload = getFormData(loginForm);
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Unable to sign in");

    currentCustomer = result.customer;
    renderCustomerHub(result.customer, result.orders);
    setActiveTab("repeat-tab");
    showToast("Customer session loaded.");
  } catch (error) {
    showToast(error.message, true);
  } finally {
    button.disabled = false;
    button.textContent = "Sign in";
  }
});

repeatForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const button = repeatForm.querySelector("button[type='submit']");
  button.disabled = true;
  button.textContent = "Booking...";

  try {
    const payload = getFormData(repeatForm);
    if (!repeatForm.querySelector("input[name='laundryType']:checked")) {
      throw new Error("Choose a laundry type for the repeat pickup.");
    }

    const response = await fetch("/api/repeat-pickup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Unable to create repeat pickup");

    document.querySelector("#repeat-result").innerHTML = `
      <div class="card-title">
        <p class="eyebrow">Repeat pickup confirmed</p>
        <h3>${result.customer.bagCode}</h3>
      </div>
      <div class="info-list">
        <div>Pickup: ${formatters.pickupDate(result.order.pickupDate)} • ${result.order.pickupSlot}</div>
        <div>Billing: ${result.order.billingPlan === "subscription" ? "Subscription bag" : "One-time order"}</div>
        <div>Return: ${result.order.returnWindow}</div>
        <div>Invoice: ${result.order.invoiceNumber}</div>
        <div>Total: ${result.order.amount}</div>
      </div>
      <div class="panel-actions">
        <a class="button button-primary" href="${result.order.invoiceUrl}" target="_blank" rel="noreferrer">Print invoice</a>
      </div>
    `;

    if (currentCustomer || payload.bagCode) {
      loadSession();
    }

    showToast("Repeat pickup booked.");
  } catch (error) {
    showToast(error.message, true);
  } finally {
    button.disabled = false;
    button.textContent = "Book repeat pickup";
  }
});

function renderAdminOverview(overview) {
  if (!overview) return;

  const stats = document.querySelector("#admin-stats");
  const ordersBox = document.querySelector("#admin-orders");
  const customersBox = document.querySelector("#admin-customers");

  stats.innerHTML = `
    <div class="stat-card"><small>Customers</small><strong>${overview.stats.customers}</strong></div>
    <div class="stat-card"><small>Orders</small><strong>${overview.stats.orders}</strong></div>
    <div class="stat-card"><small>Revenue</small><strong>${overview.stats.revenue}</strong></div>
    <div class="stat-card"><small>Active orders</small><strong>${overview.stats.activeOrders}</strong></div>
  `;

  ordersBox.innerHTML = overview.recentOrders.length
    ? overview.recentOrders
        .map(
          (order) => `
            <article class="admin-order">
              <div class="admin-row">
                <div>
                  <small>${order.invoice_number}</small>
                  <strong>${order.first_name} ${order.last_name}</strong>
                </div>
                <a class="text-link" href="/invoice/${order.id}" target="_blank" rel="noreferrer">Invoice</a>
              </div>
              <div class="meta-grid">
                <div><small>Pickup</small><strong>${formatters.pickupDate(order.pickup_date)}</strong></div>
                <div><small>Slot</small><strong>${order.pickup_slot}</strong></div>
                <div><small>Bag</small><strong>${order.bag_code}</strong></div>
                <div><small>Amount</small><strong>${formatCurrency(order.amount)}</strong></div>
              </div>
              <div class="status-row">
                <select data-order-id="${order.id}" class="status-select">
                  ${overview.statusOptions
                    .map(
                      (status) => `<option value="${status}" ${status === order.status ? "selected" : ""}>${status.replaceAll("_", " ")}</option>`
                    )
                    .join("")}
                </select>
              </div>
            </article>
          `
        )
        .join("")
    : `<div class="empty-state">No orders available.</div>`;

  customersBox.innerHTML = overview.customers.length
    ? overview.customers
        .map(
          (customer) => `
            <article class="mini-order">
              <div>
                <small>${customer.email}</small>
                <strong>${customer.first_name} ${customer.last_name}</strong>
              </div>
              <div>
                <small>City</small>
                <strong>${customer.city}</strong>
              </div>
              <div>
                <small>Bag code</small>
                <strong>${customer.bag_code}</strong>
              </div>
            </article>
          `
        )
        .join("")
    : `<div class="empty-state">No customer records available.</div>`;

  document.querySelectorAll(".status-select").forEach((select) => {
    select.addEventListener("change", async () => {
      try {
        const response = await fetch(`/api/admin/orders/${select.dataset.orderId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: select.value }),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Unable to update status");
        renderAdminOverview(result.overview);
        showToast("Order status updated.");
      } catch (error) {
        showToast(error.message, true);
      }
    });
  });
}

adminLoginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const button = adminLoginForm.querySelector("button[type='submit']");
  button.disabled = true;
  button.textContent = "Opening...";

  try {
    const payload = getFormData(adminLoginForm);
    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Unable to sign in as admin");

    currentAdmin = result.admin;
    renderAdminOverview(result.overview);
    showToast(`Admin dashboard loaded for ${result.admin.name}.`);
  } catch (error) {
    showToast(error.message, true);
  } finally {
    button.disabled = false;
    button.textContent = "Open dashboard";
  }
});

async function loadSession() {
  try {
    const response = await fetch("/api/auth/session");
    const result = await response.json();

    if (!result.authenticated) {
      renderCustomerHub(null);
      return;
    }

    if (result.role === "customer") {
      currentCustomer = result.customer;
      renderCustomerHub(result.customer, result.orders);
    }

    if (result.role === "admin") {
      currentAdmin = result.admin;
      renderAdminOverview(result.overview);
    }
  } catch (error) {
    showToast("Unable to restore session.", true);
  }
}

updateStepper();
loadSession();
