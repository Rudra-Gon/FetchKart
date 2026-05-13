// js/checkout.js

document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get("success") === "1") {
    const modal = document.getElementById("success-modal");
    if (modal) {
      document.body.classList.add("modal-open");
      modal.style.display = "flex";
      setTimeout(() => {
        window.location.href = "index.html";
      }, 5000);
    }
  } else {
    loadCheckoutData();
  }
});

async function loadCheckoutData() {
  try {
    const response = await fetch("api/cart_actions.php?action=view");
    const cartData = await response.json();

    const itemsContainer = document.getElementById("checkout-items-list");
    const summaryItemsTotal = document.getElementById("summary-items-total");
    const summaryGrandTotal = document.getElementById("summary-grand-total");

    if (!cartData.items || cartData.items.length === 0) {
      window.location.href = "shop.html"; // Redirect if cart empty
      return;
    }

    let itemsHtml = "";
    cartData.items.forEach((item) => {
      itemsHtml += `
                <div class="checkout-item">
                    <span class="item-name"><strong>${item.name}</strong></span>
                    <span class="item-qty">Qty: ${item.quantity}</span>
                    <span class="item-price">₹${parseFloat(item.price * item.quantity).toFixed(2)}</span>
                </div>
            `;
    });

    itemsContainer.innerHTML = itemsHtml;
    summaryItemsTotal.textContent = `₹${parseFloat(cartData.total).toFixed(2)}`;

    const discountRow = document.getElementById("discount-row");
    const summaryDiscount = document.getElementById("summary-discount");
    const discountLabel = document.getElementById("discount-label");

    if (cartData.discount > 0) {
      discountRow.style.display = "flex";
      summaryDiscount.textContent = `-₹${parseFloat(cartData.discount).toFixed(2)}`;
      if (cartData.applied_coupon) {
        discountLabel.textContent = `Discount (${cartData.applied_coupon.code}):`;
      }
    } else {
      discountRow.style.display = "none";
    }

    summaryGrandTotal.textContent = `₹${parseFloat(cartData.grand_total).toFixed(2)}`;

    const platformFeeEl = document.getElementById("summary-platform-fee");
    if (platformFeeEl && cartData.platform_fee) {
      platformFeeEl.textContent = `₹${parseFloat(cartData.platform_fee).toFixed(2)}`;
    }
  } catch (error) {
    console.error("Error loading checkout data:", error);
  }
}

async function placeOrder() {
  try {
    // Gather address fields
    const fullname = document.getElementById("ship-fullname").value.trim();
    const addr1 = document.getElementById("ship-address1").value.trim();
    const addr2 = document.getElementById("ship-address2").value.trim();
    const city = document.getElementById("ship-city").value.trim();
    const state = document.getElementById("ship-state").value.trim();
    const zip = document.getElementById("ship-zip").value.trim();

    // Build a single address string (omit optional parts if empty)
    let addressParts = [];
    if (fullname) addressParts.push(fullname);
    if (addr1) addressParts.push(addr1);
    if (addr2) addressParts.push(addr2);
    if (city) addressParts.push(city);
    if (state) addressParts.push(state);
    if (zip) addressParts.push(zip);
    const address = addressParts.join(", ");

    const addressError = document.getElementById("address-error");

    // Validate required fields (fullname, addr1, city, state, zip)
    if (!fullname || !addr1 || !city || !state || !zip) {
      addressError.style.display = "block";
      // Highlight missing fields
      const requiredIds = [
        "ship-fullname",
        "ship-address1",
        "ship-city",
        "ship-state",
        "ship-zip",
      ];
      requiredIds.forEach((id) => {
        const el = document.getElementById(id);
        if (!el.value.trim()) {
          el.style.borderColor = "#b12704";
        } else {
          el.style.borderColor = "#ccc";
        }
      });
      addressError.textContent = "Please fill in all required shipping fields.";
      return;
    } else {
      addressError.style.display = "none";
      // Reset border colors
      [
        "ship-fullname",
        "ship-address1",
        "ship-city",
        "ship-state",
        "ship-zip",
      ].forEach((id) => {
        document.getElementById(id).style.borderColor = "#ccc";
      });
    }

    const paymentMethod = document.querySelector(
      'input[name="payment"]:checked',
    ).value;

    // --- RAZORPAY INTEGRATION ---
    if (paymentMethod !== "Cash on Delivery") {
      const grandTotalText = document.getElementById(
        "summary-grand-total",
      ).textContent;
      const amount =
        parseFloat(grandTotalText.replace("₹", "").replace(",", "")) * 100; // Amount in paise

      const methodConfigs = {
        "Credit/Debit Card": {
          name: "Pay via Card",
          instruments: [{ method: "card" }],
        },
        "Net Banking": {
          name: "Pay via Net Banking",
          instruments: [{ method: "netbanking" }],
        },
        "Digital Wallets": {
          name: "Pay via Wallet",
          instruments: [{ method: "wallet" }],
        },
      };
      const selectedMethodConfig = methodConfigs[paymentMethod];
      const allowFallbackMethods = paymentMethod === "UPI";
      const displayConfig = allowFallbackMethods
        ? {
            sequence: ["upi", "card", "netbanking", "wallet"],
            preferences: {
              show_default_blocks: true,
            },
          }
        : {
            blocks: {
              selected_method: selectedMethodConfig,
            },
            sequence: ["block.selected_method"],
            preferences: {
              show_default_blocks: false,
            },
          };

      const options = {
        key: "rzp_test_SnyMpw9EnZSpCa",
        amount: amount,
        currency: "INR",
        name: "FetchKart",
        description: "Order Payment",
        image: "uploads/logo.png",
        config: {
          display: displayConfig,
        },
        handler: function (response) {
          processFinalOrder(
            paymentMethod,
            address,
            response.razorpay_payment_id,
          );
        },
        prefill: {
          name: fullname,
          contact: "9999999999",
        },
        theme: {
          color: "#2874f0",
        },
      };
      const rzp = new Razorpay(options);
      rzp.open();
      return;
    }

    // For COD, proceed directly
    const btn = document.querySelector(".checkout-container .btn-primary");
    const originalBtnText = btn ? btn.textContent : "";
    if (btn) {
      btn.disabled = true;
      btn.textContent = "Processing...";
    }

    await processFinalOrder(paymentMethod, address);

    if (btn) {
      btn.disabled = false;
      btn.textContent = originalBtnText;
    }
  } catch (error) {
    console.error("Error in placeOrder:", error);
  }
}

async function processFinalOrder(paymentMethod, address, paymentId = "") {
  try {
    const response = await fetch("api/checkout.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `payment_method=${encodeURIComponent(paymentMethod)}&address=${encodeURIComponent(address)}&payment_id=${encodeURIComponent(paymentId)}`,
    });

    const data = await response.json();
    if (data.success) {
      // Show success modal
      document.body.classList.add("modal-open");
      document.getElementById("success-modal").style.display = "flex";

      // Optional: Auto redirect after 5 seconds
      setTimeout(() => {
        window.location.href = "index.html";
      }, 5000);
    } else {
      alert(data.message);
    }
  } catch (error) {
    console.error("Error placing order:", error);
  }
}
async function applyCoupon() {
  const code = document.getElementById("coupon-code").value.trim();
  const messageEl = document.getElementById("coupon-message");

  if (!code) {
    messageEl.textContent = "Please enter a code.";
    messageEl.className = "coupon-msg error";
    return;
  }

  try {
    const response = await fetch("api/cart_actions.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `action=apply_coupon&code=${encodeURIComponent(code)}`,
    });

    const data = await response.json();
    if (data.success) {
      messageEl.textContent = data.message;
      messageEl.className = "coupon-msg success";
      loadCheckoutData(); // Refresh summary
    } else {
      messageEl.textContent = data.message;
      messageEl.className = "coupon-msg error";
    }
  } catch (error) {
    console.error("Error applying coupon:", error);
  }
}
