// js/orders.js

document.addEventListener("DOMContentLoaded", () => {
  loadCustomerOrders();
});

async function loadCustomerOrders() {
  try {
    const response = await fetch("api/get_customer_orders.php");
    const orders = await response.json();

    const container = document.getElementById("orders-container");

    if (orders.success === false) {
      container.innerHTML = `<p style="text-align: center; color: #ef4444; padding: 3rem;">Error: ${orders.message}</p>`;
      return;
    }

    if (!Array.isArray(orders) || orders.length === 0) {
      container.innerHTML =
        '<p style="text-align: center; padding: 3rem;">You haven\'t placed any orders yet.</p>';
      return;
    }

    let html = "";
    orders.forEach((order) => {
      const orderDate = new Date(order.order_date).toLocaleDateString();
      const rawExpected = order.expected_delivery_date;
      const expectedDate = rawExpected
        ? new Date(rawExpected).toLocaleDateString()
        : "TBD";
      const status = order.status || "Pending";

      // Tracking logic
      const progress = getIntercityProgress(status);
      const trackingHtml = `
                    <div class="tracking-section intercity">
                        <h4>Intercity Tracking</h4>
                        <div class="progress-wrapper">
                            <div class="progress-bar-bg">
                                <div class="progress-bar-fill" style="width: ${progress}%"></div>
                            </div>
                            <div class="progress-steps">
                                <div class="step ${progress >= 10 ? "completed" : ""}">Ordered</div>
                                <div class="step ${progress >= 40 ? "completed" : ""}">Shipped</div>
                                <div class="step ${progress >= 80 ? "completed" : ""}">Out for Delivery</div>
                                <div class="step ${progress >= 100 ? "completed" : ""}">Delivered</div>
                            </div>
                            <p class="tracking-status-msg" style="font-size: 0.8rem; margin-top: 10px; color: var(--accent);">
                                <i class="fas fa-location-dot"></i> Current Status: <strong>${order.current_location || "Processing"}</strong>
                            </p>
                        </div>
                    </div>
                `;

      const totalPrice = (parseFloat(order.price || 0) * parseInt(order.quantity || 1)).toFixed(2);

      html += `
                <div class="order-card">
                    <div class="order-card-header">
                        <div class="order-header-main">
                            <div class="header-item">
                                <label>ORDER PLACED</label>
                                <span>${orderDate}</span>
                            </div>
                            <div class="header-item">
                                <label>TOTAL PAYMENT</label>
                                <span>₹${totalPrice} <small style="color: var(--text-muted); font-size: 0.75rem;">(${order.payment_method})</small></span>
                            </div>
                            <div class="header-item">
                                <label>SHIP TO</label>
                                <span class="address-hint" title="${order.address || "No Address"}">${(order.address || "No Address").substring(0, 15)}...</span>
                            </div>
                        </div>
                        <div class="order-header-id">
                            <label>ORDER # ${order.id}</label>
                            <a href="#" class="view-details">Order Details</a>
                        </div>
                    </div>
                    
                    <div class="order-card-body">
                        <div class="item-status-row">
                            <h2 class="status-text">${status === "Delivered" ? "Delivered " + expectedDate : "Expected Delivery: " + expectedDate}</h2>
                        </div>
                        
                        <div class="item-info-row">
                            <div class="item-thumbnail">
                                <img src="${order.image_url}" alt="${order.product_name}">
                            </div>
                            <div class="item-meta">
                                <h3 class="item-name">${order.product_name}</h3>
                                <p class="item-desc">${order.description ? order.description.substring(0, 100) + "..." : ""}</p>
                                <div class="item-actions">
                                    <button class="btn btn-secondary-sm" onclick="openComingSoonModal()">Return or replace items</button>
                                    <button class="btn btn-secondary-sm" onclick="openReviewModal(${order.product_id})">Write a product review</button>
                                </div>
                            </div>
                        </div>
                        
                        ${trackingHtml}
                    </div>
                </div>
            `;
    });

    container.innerHTML = html;
    setupStarRating();
  } catch (error) {
    console.error("Error loading orders:", error);
    document.getElementById("orders-container").innerHTML =
      "<p>Error loading orders.</p>";
  }
}

function setupStarRating() {
  const stars = document.querySelectorAll(".rating-stars i");
  stars.forEach((star) => {
    star.addEventListener("click", () => {
      const rating = star.getAttribute("data-rating");
      document.getElementById("review-rating").value = rating;

      // Update UI
      stars.forEach((s) => {
        const r = s.getAttribute("data-rating");
        if (r <= rating) {
          s.classList.remove("far");
          s.classList.add("fas");
        } else {
          s.classList.remove("fas");
          s.classList.add("far");
        }
      });
    });
  });
}

function openReviewModal(productId) {
  document.getElementById("review-product-id").value = productId;
  document.getElementById("review-modal").style.display = "flex";
  document.body.classList.add("modal-open");
}

function closeReviewModal() {
  document.getElementById("review-modal").style.display = "none";
  document.body.classList.remove("modal-open");
  document.getElementById("review-form").reset();
  document.querySelectorAll(".rating-stars i").forEach((s) => {
    s.classList.remove("fas");
    s.classList.add("far");
  });
}

function openComingSoonModal() {
  document.getElementById("coming-soon-modal").style.display = "flex";
  document.body.classList.add("modal-open");
}

function closeComingSoonModal() {
  document.getElementById("coming-soon-modal").style.display = "none";
  document.body.classList.remove("modal-open");
}

async function submitReview(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  formData.append("action", "add");

  if (formData.get("rating") == "0") {
    alert("Please select a rating.");
    return;
  }

  try {
    const res = await fetch("api/reviews.php", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();

    if (data.success) {
      alert(data.message);
      closeReviewModal();
    } else {
      alert(data.message);
    }
  } catch (e) {
    alert("Failed to submit review. Please try again.");
  }
}

function getIntercityProgress(status) {
  switch (status) {
    case "Pending":
      return 25;
    case "Shipped":
      return 50;
    case "Out for Delivery":
      return 75;
    case "Delivered":
      return 100;
    default:
      return 10;
  }
}

// Developed by Rudra-Gon for Microtech Internship Evaluation
