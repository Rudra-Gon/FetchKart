// js/seller.js

document.addEventListener("DOMContentLoaded", () => {
  loadInventory();
  loadOrders();
  loadSellerPrefs();
  loadReviews();
  populateGodownSelect();
});

async function loadReviews() {
  const container = document.getElementById("seller-reviews-list");
  if (!container) return;

  try {
    const response = await fetch("api/reviews.php?action=get_seller_reviews");
    const data = await response.json();

    if (data.success && data.reviews.length > 0) {
      let html = `
                <table class="dashboard-table">
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>Rating</th>
                            <th>Reviewer</th>
                            <th>Comment</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody>
            `;

      data.reviews.forEach((r) => {
        const date = new Date(r.created_at).toLocaleDateString();
        const stars = Array(5)
          .fill(0)
          .map(
            (_, i) =>
              `<i class="${i < r.rating ? "fas" : "far"} fa-star" style="color: #f59e0b; font-size: 0.8rem;"></i>`,
          )
          .join("");

        html += `
                    <tr>
                        <td>
                            <div style="display: flex; align-items: center; gap: 10px;">
                                <img src="${r.image_url}" style="width: 30px; height: 30px; border-radius: 4px; object-fit: cover;">
                                <span>${r.product_name}</span>
                            </div>
                        </td>
                        <td>${stars}</td>
                        <td>${r.reviewer_name}</td>
                        <td style="max-width: 300px; white-space: normal; font-size: 0.85rem;">${r.review_text}</td>
                        <td>${date}</td>
                    </tr>
                `;
      });

      html += "</tbody></table>";
      container.innerHTML = html;
    } else {
      container.innerHTML =
        '<p class="text-muted">No reviews received yet for your products.</p>';
    }
  } catch (error) {
    console.error("Error loading reviews:", error);
    container.innerHTML = '<p class="text-muted">Error loading feedback.</p>';
  }
}

async function loadSellerPrefs() {
  try {
    const response = await fetch("api/auth.php?action=check");
    const data = await response.json();
    if (data.logged_in && data.user.role === "seller") {
      document.getElementById("storage-type-display").textContent =
        data.user.storage_option || "N/A";
      document.getElementById("warehouse-option-display").textContent =
        data.user.warehouse_option || "N/A";
    }
  } catch (error) {
    console.error("Error loading seller prefs:", error);
  }
}

async function loadInventory() {
  try {
    const response = await fetch("api/get_seller_data.php?action=inventory");
    const products = await response.json();

    const container = document.getElementById("inventory-list");
    if (products.length === 0) {
      container.innerHTML = "<p>You haven't listed any products yet.</p>";
      return;
    }

    let html = `
            <table class="dashboard-table">
                <thead>
                    <tr>
                        <th>Image</th>
                        <th>Name</th>
                        <th>Price</th>
                        <th>Stock</th>
                        <th>Godown</th>
                        <th>Category</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
        `;

    products.forEach((p) => {
      html += `
                <tr>
                    <td><div class="thumb-container"><img src="${p.image_url}" class="thumb-mini"></div></td>
                    <td>${p.name}</td>
                    <td>₹${parseFloat(p.price).toFixed(2)}</td>
                    <td>
                        <strong>${p.stock_quantity}</strong>
                        <button class="btn-secondary-sm" style="padding: 2px 6px; margin-left: 8px; font-size: 0.7rem;" onclick="updateStock(${p.id}, ${p.stock_quantity})">Edit</button>
                    </td>
                    <td>
                        ${p.godown_name || '<span class="text-muted">None</span>'}
                        <button class="btn-secondary-sm" style="padding: 2px 6px; margin-left: 8px; font-size: 0.7rem;" onclick="assignGodown(${p.id})">Assign</button>
                    </td>
                    <td>${p.category}</td>
                    <td><button class="btn btn-danger btn-sm" onclick="deleteProduct(${p.id})">Delete</button></td>
                </tr>
            `;
    });

    html += "</tbody></table>";
    container.innerHTML = html;
  } catch (error) {
    console.error("Error loading inventory:", error);
  }
}

async function loadOrders() {
  try {
    const response = await fetch("api/get_seller_data.php?action=orders");
    const orders = await response.json();

    const container = document.getElementById("orders-list");
    if (orders.length === 0) {
      container.innerHTML = "<p>No orders received yet.</p>";
      return;
    }

    let html = `
            <table class="dashboard-table">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Customer</th>
                        <th>Product</th>
                        <th>Qty</th>
                        <th>Payment</th>
                    </tr>
                </thead>
                <tbody>
        `;

    orders.forEach((o) => {
      const date = new Date(o.order_date).toLocaleDateString();
      html += `
                <tr>
                    <td>${date}</td>
                    <td><strong>${o.customer_name}</strong></td>
                    <td>${o.product_name}</td>
                    <td>${o.quantity}</td>
                    <td><span class="badge">${o.payment_method}</span></td>
                </tr>
            `;
    });

    html += "</tbody></table>";
    container.innerHTML = html;
  } catch (error) {
    console.error("Error loading orders:", error);
  }
}

async function handleAddProduct(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const msgBox = document.getElementById("seller-message");
  msgBox.textContent = "Uploading...";

  try {
    const response = await fetch("api/add_product.php", {
      method: "POST",
      body: formData,
    });
    const data = await response.json();

    if (data.success) {
      msgBox.innerHTML = `<span style="color: green;">${data.message}</span>`;
      event.target.reset();
      loadInventory(); // Refresh list
    } else {
      msgBox.innerHTML = `<span style="color: red;">${data.message}</span>`;
    }
  } catch (error) {
    msgBox.innerHTML = `<span style="color: red;">Error uploading product.</span>`;
  }
}

async function deleteProduct(id) {
  if (!confirm("Are you sure you want to delete this product?")) return;

  try {
    const formData = new FormData();
    formData.append("product_id", id);
    const response = await fetch(
      "api/get_seller_data.php?action=delete_product",
      {
        method: "POST",
        body: formData,
      },
    );
    const data = await response.json();
    if (data.success) {
      loadInventory();
    }
  } catch (error) {
    console.error("Error deleting product:", error);
  }
}
async function updateStock(productId, currentStock) {
  const newStock = prompt("Enter new stock quantity:", currentStock);
  if (newStock !== null && !isNaN(newStock)) {
    try {
      const formData = new FormData();
      formData.append("product_id", productId);
      formData.append("stock", newStock);

      const response = await fetch(
        "api/get_seller_data.php?action=update_stock",
        {
          method: "POST",
          body: formData,
        },
      );
      const data = await response.json();
      if (data.success) {
        loadInventory(); // Refresh list
      } else {
        alert("Failed to update stock: " + (data.message || "Unknown error"));
      }
    } catch (error) {
      console.error("Error updating stock:", error);
    }
  }
}

// --- Godown Management ---

async function assignGodown(productId) {
  try {
    const response = await fetch("api/godown_actions.php?action=view");
    const godowns = await response.json();

    let promptText =
      "Enter Godown ID from the list below to assign (or 0 for None):\n\n";
    promptText += "0: -- None --\n";
    if (Array.isArray(godowns)) {
      godowns.forEach((g) => {
        promptText += `${g.id}: ${g.name}\n`;
      });
    } else {
      alert("No godowns available. Please create a godown first.");
      return;
    }

    const newGodownId = prompt(promptText);
    if (newGodownId !== null) {
      const formData = new FormData();
      formData.append("product_id", productId);
      formData.append("godown_id", newGodownId === "0" ? "" : newGodownId);

      const assignResp = await fetch(
        "api/get_seller_data.php?action=assign_godown",
        {
          method: "POST",
          body: formData,
        },
      );
      const data = await assignResp.json();
      if (data.success) {
        loadInventory(); // Refresh list
      } else {
        alert("Failed to assign godown: " + (data.message || "Unknown error"));
      }
    }
  } catch (error) {
    console.error("Error assigning godown:", error);
  }
}

function openGodownModal() {
  document.getElementById("godown-modal").style.display = "flex";
  loadGodowns();
}

function closeGodownModal() {
  document.getElementById("godown-modal").style.display = "none";
}

async function loadGodowns() {
  const container = document.getElementById("godown-list");
  try {
    const response = await fetch("api/godown_actions.php?action=view");
    const godowns = await response.json();

    if (!Array.isArray(godowns) || godowns.length === 0) {
      container.innerHTML = "<p>No godowns found.</p>";
      return;
    }

    let html = `
            <table class="dashboard-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Location</th>
                        <th>Capacity</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
        `;

    godowns.forEach((g) => {
      html += `
                <tr>
                    <td>${g.name}</td>
                    <td>${g.location || "-"}</td>
                    <td>${g.capacity || "-"}</td>
                    <td><button class="btn btn-danger btn-sm" onclick="deleteGodown(${g.id})">Delete</button></td>
                </tr>
            `;
    });

    html += "</tbody></table>";
    container.innerHTML = html;
  } catch (error) {
    console.error("Error loading godowns:", error);
    container.innerHTML = "<p>Error loading godowns.</p>";
  }

  // Refresh dropdown whenever godowns are loaded/changed
  populateGodownSelect();
}

async function handleAddGodown(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const msgBox = document.getElementById("godown-message");
  msgBox.textContent = "Adding...";

  formData.append("action", "add");

  try {
    const response = await fetch("api/godown_actions.php", {
      method: "POST",
      body: formData,
    });
    const data = await response.json();

    if (data.success) {
      msgBox.innerHTML = `<span style="color: var(--success-color, green);">${data.message}</span>`;
      event.target.reset();
      loadGodowns();
    } else {
      msgBox.innerHTML = `<span style="color: var(--danger-color, red);">${data.message}</span>`;
    }
  } catch (error) {
    msgBox.innerHTML = `<span style="color: var(--danger-color, red);">Error adding godown.</span>`;
  }
}

async function deleteGodown(id) {
  if (!confirm("Are you sure you want to delete this godown?")) return;

  try {
    const formData = new FormData();
    formData.append("action", "delete");
    formData.append("id", id);

    const response = await fetch("api/godown_actions.php", {
      method: "POST",
      body: formData,
    });
    const data = await response.json();

    if (data.success) {
      loadGodowns();
    } else {
      alert("Failed to delete: " + data.message);
    }
  } catch (error) {
    console.error("Error deleting godown:", error);
  }
}

async function populateGodownSelect() {
  const select = document.getElementById("godown-select");
  if (!select) return;

  try {
    const response = await fetch("api/godown_actions.php?action=view");
    const godowns = await response.json();

    let html = '<option value="">-- No Godown --</option>';
    if (Array.isArray(godowns)) {
      godowns.forEach((g) => {
        html += `<option value="${g.id}">${g.name}</option>`;
      });
    }
    select.innerHTML = html;
  } catch (error) {
    console.error("Error populating godowns:", error);
  }
}

// Developed by Rudra-Gon for Microtech Internship Evaluation
