// js/admin.js

document.addEventListener("DOMContentLoaded", () => {
  checkAdminAuth();
  loadDashboardStats();
  loadRecentActivity();
});

async function checkAdminAuth() {
  try {
    const response = await fetch("api/auth.php?action=check");
    const data = await response.json();

    if (!data.logged_in || data.user.role !== "admin") {
      window.location.href = "login.html";
    }
  } catch (e) {
    window.location.href = "login.html";
  }
}

function showSection(sectionId) {
  // Update nav buttons
  document.querySelectorAll(".admin-nav-item").forEach((btn) => {
    btn.classList.remove("active");
    if (btn.getAttribute("onclick")?.includes(sectionId)) {
      btn.classList.add("active");
    }
  });

  // Update sections
  document.querySelectorAll(".admin-section").forEach((sec) => {
    sec.classList.remove("active");
  });
  document.getElementById(sectionId).classList.add("active");

  // Load specific data if needed
  if (sectionId === "products") loadAllProducts();
  if (sectionId === "users") loadAllUsers();
  if (sectionId === "orders") loadAllOrders();
  if (sectionId === "coupons") loadAllCoupons();
  if (sectionId === "godowns") loadAllGodowns();
}

async function loadDashboardStats() {
  try {
    const res = await fetch("api/admin.php?action=stats");
    const data = await res.json();
    if (data.success) {
      document.getElementById("stat-users").textContent =
        data.stats.total_users;
      document.getElementById("stat-products").textContent =
        data.stats.total_products;
      document.getElementById("stat-orders").textContent =
        data.stats.total_orders;
      document.getElementById("stat-pending").textContent =
        data.stats.pending_orders;
    }
  } catch (e) {
    console.error("Stats error:", e);
  }
}

async function loadRecentActivity() {
  try {
    // Load recent orders
    const res = await fetch("api/admin.php?action=orders");
    const data = await res.json();
    if (data.success) {
      const tbody = document.querySelector("#recent-orders-table tbody");
      tbody.innerHTML = data.orders
        .slice(0, 5)
        .map(
          (o) => `
                <tr>
                    <td>#${o.id}</td>
                    <td>${o.customer_name}</td>
                    <td><span class="badge badge-warning">${o.status}</span></td>
                    <td>${new Date(o.order_date).toLocaleDateString()}</td>
                </tr>
            `,
        )
        .join("");
    }
  } catch (e) {}
}

async function loadAllProducts() {
  const tbody = document.querySelector("#all-products-table tbody");
  tbody.innerHTML = '<tr><td colspan="6">Loading products...</td></tr>';

  try {
    const res = await fetch("api/admin.php?action=products");
    const data = await res.json();
    if (data.success) {
      tbody.innerHTML = data.products
        .map(
          (p) => `
                <tr>
                    <td>${p.id}</td>
                    <td>${p.name}</td>
                    <td>${p.seller_name || "System"}</td>
                    <td>₹${p.price}</td>
                    <td>${p.stock_quantity}</td>
                    <td>
                        <button class="btn-action" onclick="deleteProduct(${p.id})" title="Delete Product">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `,
        )
        .join("");
    }
  } catch (e) {}
}

async function loadAllUsers() {
  const tbody = document.querySelector("#all-users-table tbody");
  tbody.innerHTML = '<tr><td colspan="4">Loading users...</td></tr>';

  try {
    const res = await fetch("api/admin.php?action=users");
    const data = await res.json();
    if (data.success) {
      tbody.innerHTML = data.users
        .map(
          (u) => `
                <tr>
                    <td>${u.id}</td>
                    <td>${u.username}</td>
                    <td><span class="user-badge role-${u.role}">${u.role}</span></td>
                    <td>
                        ${
                          u.role !== "admin"
                            ? `
                            <button class="btn-action" onclick="deleteUser(${u.id})" title="Delete User">
                                <i class="fas fa-user-minus"></i>
                            </button>
                        `
                            : "--"
                        }
                    </td>
                </tr>
            `,
        )
        .join("");
    }
  } catch (e) {}
}

async function loadAllOrders() {
  const tbody = document.querySelector("#all-orders-table tbody");
  tbody.innerHTML = '<tr><td colspan="6">Loading orders...</td></tr>';
  try {
    const res = await fetch("api/admin.php?action=orders");
    const data = await res.json();
    if (data.success) {
      tbody.innerHTML = data.orders
        .map(
          (o) => `
                <tr>
                    <td>#${o.id}</td>
                    <td>${o.customer_name}</td>
                    <td>${o.product_name}</td>
                    <td><span class="badge badge-success">${o.status}</span></td>
                    <td>${new Date(o.order_date).toLocaleDateString()}</td>
                    <td style="display: flex; gap: 5px;">
                        <button class="btn-action" onclick="openTrackingModal(${o.id}, '${o.status}', '${o.current_location || ""}')" title="Update Tracking">
                            <i class="fas fa-truck-fast"></i>
                        </button>
                        <button class="btn-action" onclick="deleteOrder(${o.id})" title="Delete Order">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `,
        )
        .join("");
    }
  } catch (e) {}
}

function openTrackingModal(id, status, location) {
  document.getElementById("tracking-order-id").value = id;
  document.getElementById("tracking-status").value = status;
  document.getElementById("tracking-location").value =
    location || "At Warehouse";
  document.getElementById("tracking-modal").style.display = "flex";
}

function closeTrackingModal() {
  document.getElementById("tracking-modal").style.display = "none";
}

async function saveTracking(event) {
  event.preventDefault();
  const formData = new FormData(event.target);

  try {
    const res = await fetch("api/admin.php?action=update_order_tracking", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    if (data.success) {
      alert(data.message);
      closeTrackingModal();
      loadAllOrders();
    }
  } catch (e) {
    alert("Update failed");
  }
}

async function deleteOrder(id) {
  if (!confirm("Are you sure you want to delete this order record?")) return;
  const res = await fetch(`api/admin.php?action=delete_order&id=${id}`);
  const data = await res.json();
  if (data.success) {
    alert(data.message);
    loadAllOrders();
    loadDashboardStats();
  }
}

async function deleteProduct(id) {
  if (!confirm("Are you sure you want to delete this product?")) return;
  const res = await fetch(`api/admin.php?action=delete_product&id=${id}`);
  const data = await res.json();
  if (data.success) {
    alert(data.message);
    loadAllProducts();
    loadDashboardStats();
  }
}

async function deleteUser(id) {
  if (
    !confirm(
      "Are you sure you want to delete this user? This will remove all their associated data.",
    )
  )
    return;
  const res = await fetch(`api/admin.php?action=delete_user&id=${id}`);
  const data = await res.json();
  if (data.success) {
    alert(data.message);
    loadAllUsers();
    loadDashboardStats();
  }
}

async function loadAllCoupons() {
  const tbody = document.querySelector("#all-coupons-table tbody");
  tbody.innerHTML = '<tr><td colspan="6">Loading coupons...</td></tr>';

  try {
    const res = await fetch("api/admin.php?action=coupons");
    const data = await res.json();

    if (data.success) {
      tbody.innerHTML = data.coupons
        .map(
          (c) => `
                <tr>
                    <td><strong>${c.code}</strong></td>

                    <td>
                        ${
                          c.discount_type === "percentage"
                            ? c.discount_value + "%"
                            : "₹" + c.discount_value
                        }
                    </td>

                    <td>${c.discount_type}</td>

                    <td>₹${c.min_order_amount}</td>

                    <td>
                        ${
                          c.expiry_date
                            ? new Date(c.expiry_date).toLocaleDateString()
                            : "No Expiry"
                        }
                    </td>

                    <td>
                        <button class="btn-action"
                            onclick="deleteCoupon(${c.id})"
                            title="Delete Coupon">
                            <i class="fas fa-trash-can"></i>
                        </button>
                    </td>
                </tr>
            `,
        )
        .join("");
    }
  } catch (e) {
    console.error("Coupon loading error:", e);
  }
}

async function deleteCoupon(id) {
  if (!confirm("Are you sure you want to delete this coupon?")) return;
  const res = await fetch(`api/admin.php?action=delete_coupon&id=${id}`);
  const data = await res.json();
  if (data.success) {
    alert(data.message);
    loadAllCoupons();
  }
}

function toggleCouponForm() {
  const form = document.getElementById("add-coupon-form");
  form.style.display = form.style.display === "none" ? "block" : "none";
}

async function createNewCoupon(event) {
  event.preventDefault();
  const formData = new FormData(event.target);

  try {
    const res = await fetch("api/admin.php?action=add_coupon", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();

    if (data.success) {
      alert(data.message);
      event.target.reset();
      toggleCouponForm();
      loadAllCoupons();
    } else {
      alert(data.message);
    }
  } catch (e) {
    alert("Failed to add coupon. Please try again.");
  }
}

async function logoutAdmin() {
  await fetch("api/auth.php?action=logout");
  window.location.href = "login.html";
}

async function loadAllGodowns() {
  const tbody = document.querySelector("#all-godowns-table tbody");
  tbody.innerHTML = '<tr><td colspan="6">Loading godowns...</td></tr>';

  try {
    const res = await fetch("api/admin.php?action=godowns");
    const data = await res.json();
    if (data.success) {
      tbody.innerHTML = data.godowns
        .map(
          (g) => `
                <tr>
                    <td>${g.id}</td>
                    <td><strong>${g.name}</strong></td>
                    <td>${g.location || "-"}</td>
                    <td>${g.capacity || "-"}</td>
                    <td>${g.seller_name || "System"}</td>
                    <td>
                        <button class="btn-action" onclick="deleteAdminGodown(${g.id})" title="Delete Godown">
                            <i class="fas fa-trash-can"></i>
                        </button>
                    </td>
                </tr>
            `,
        )
        .join("");
    }
  } catch (e) {
    console.error("Error loading godowns", e);
  }
}

async function deleteAdminGodown(id) {
  if (!confirm("Are you sure you want to delete this godown?")) return;
  const res = await fetch(`api/admin.php?action=delete_godown&id=${id}`);
  const data = await res.json();
  if (data.success) {
    alert(data.message);
    loadAllGodowns();
  } else {
    alert("Failed to delete godown: " + data.message);
  }
}

// Developed by Rudra-Gon for Microtech Internship Evaluation
