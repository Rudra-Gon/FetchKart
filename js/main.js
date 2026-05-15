// Global variable to store cart count
let cartCount = 0;

// Escape HTML utility to prevent XSS
const escapeHTML = (str) =>
  str
    ? String(str).replace(
        /[&<>'"]/g,
        (match) =>
          ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            "'": "&#39;",
            '"': "&quot;",
          })[match],
      )
    : "";

// Check if the user is logged in (returns a promise)
async function isLoggedIn() {
  try {
    const response = await fetch("api/auth.php?action=check");
    const data = await response.json();
    return data.logged_in === true;
  } catch (error) {
    console.error("Error checking login status:", error);
    return false;
  }
}

// Show "not signed in" alert and redirect to login
function redirectToLogin() {
  const alertContainer = document.getElementById("alert-container");
  if (alertContainer) {
    alertContainer.innerHTML = `<div class="alert-error" style="background:#fef2f2; color:#dc2626; padding:1rem; border-radius:8px; text-align:center; font-weight:600; border:1px solid #fecaca;">You aren't signed in! Redirecting to login...</div>`;
  } else {
    alert("You aren't signed in! Redirecting to login...");
  }
  setTimeout(() => {
    window.location.href = "login.html";
  }, 2000);
}

// On page load
document.addEventListener("DOMContentLoaded", () => {
  updateCartCounter();
  initCartDrawer();

  // If we are on index.html, load products
  if (document.getElementById("products-container")) {
    loadProducts();
  }
});

// Global store for products
let allProducts = [];
let currentSort = "default";

// Fetch products from the PHP API
async function loadProducts() {
  const container = document.getElementById("products-container");
  if (container) {
    // Show skeleton loading
    container.innerHTML = Array(8)
      .fill(0)
      .map(
        () => `
            <div class="product-card skeleton-card">
                <div class="product-image skeleton"></div>
                <div class="skeleton skeleton-title"></div>
                <div class="skeleton skeleton-text"></div>
                <div class="product-footer">
                    <div class="skeleton skeleton-price"></div>
                    <div class="skeleton skeleton-btn"></div>
                </div>
            </div>
        `,
      )
      .join("");
  }

  try {
    const response = await fetch("api/get_products.php");
    allProducts = await response.json();

    if (allProducts.error) {
      document.getElementById("products-container").innerHTML =
        `<p>Error loading products: ${allProducts.error}</p>`;
      return;
    }

    renderProducts(allProducts);

    const urlParams = new URLSearchParams(window.location.search);
    const cat = urlParams.get("category");
    if (cat) {
      const select = document.getElementById("category-filter");
      if (select) select.value = cat;
      filterProducts();
    }
  } catch (error) {
    console.error("Error fetching products:", error);
    document.getElementById("products-container").innerHTML =
      "<p>No products found. Sellers can add products from their dashboard.</p>";
  }
}

// Render product cards to the container
function renderProducts(products) {
  const container = document.getElementById("products-container");
  container.innerHTML = "";

  if (products.length === 0) {
    container.innerHTML =
      '<p style="text-align:center; width:100%; padding: 2rem;">No products match your search.</p>';
    return;
  }

  products.forEach((product) => {
    const card = document.createElement("div");
    card.className = "product-card";
    card.style.cursor = "pointer";
    card.onclick = (e) => {
      if (e.target.tagName !== "BUTTON") {
        window.location.href = `product.html?id=${product.id}`;
      }
    };

    const safeName = escapeHTML(product.name);
    const safeSeller = escapeHTML(product.seller_name || "FetchKart");
    const safeDesc = escapeHTML(product.description).substring(0, 60);

    const imageHtml = product.image_url
      ? `<div class="product-image"><img src="${product.image_url}" alt="${safeName}" onerror="this.src='https://placehold.co/300x300?text=📦'"></div>`
      : `<div class="product-image">📦</div>`;

    const stock = parseInt(product.stock_quantity);
    const isOutOfStock = stock <= 0;
    const isLowStock = stock > 0 && stock < 50;

    let stockBadge = "";
    if (isOutOfStock) {
      stockBadge = `<span class="stock-badge-out">Out of Stock</span>`;
    } else if (isLowStock) {
      stockBadge = `<span class="stock-badge-low">⚠️ Only ${stock} left</span>`;
    }

    if (isOutOfStock) {
      card.classList.add("out-of-stock-card");
    }

    card.innerHTML = `
            ${imageHtml}
            ${stockBadge}
            <h3 class="product-title">${safeName}</h3>
            <p class="product-seller-small">By: ${safeSeller}</p>
            <p class="product-desc">${safeDesc}...</p>
            <div class="product-footer">
                <span class="product-price">₹${parseFloat(product.price).toFixed(2)}</span>
                <button class="btn" ${isOutOfStock ? 'disabled style="background: #cbd5e1; color: #64748b; cursor: not-allowed; border: none;"' : ""} onclick="addToCart(${product.id}, '${safeName.replace(/'/g, "\\'")}')">${isOutOfStock ? "Sold Out" : "Add to Cart"}</button>
            </div>
        `;
    container.appendChild(card);
  });
}
// Load Featured Products on Home page
async function loadFeaturedProducts() {
  const container = document.getElementById("featured-container");
  if (container) {
    container.innerHTML = Array(3)
      .fill(0)
      .map(
        () => `
            <div class="product-card skeleton-card">
                <div class="product-image skeleton"></div>
                <div class="skeleton skeleton-title"></div>
                <div class="skeleton skeleton-text"></div>
                <div class="product-footer">
                    <div class="skeleton skeleton-price"></div>
                    <div class="skeleton skeleton-btn"></div>
                </div>
            </div>
        `,
      )
      .join("");
  }
  try {
    const response = await fetch("api/get_products.php");
    const products = await response.json();
    if (Array.isArray(products) && products.length) {
      // Filter out out-of-stock, sort by newest
      const inStock = products.filter((p) => parseInt(p.stock_quantity) > 0);
      const sorted = inStock.sort((a, b) => b.id - a.id);
      const featured = sorted.slice(0, 8);
      renderFeatured(featured);
    }
  } catch (e) {
    console.error("Failed to load featured products", e);
  }
}

function renderFeatured(products) {
  const container = document.getElementById("featured-container");
  if (!container) return;
  container.innerHTML = "";
  products.forEach((product) => {
    const card = document.createElement("div");
    card.className = "product-card";
    card.style.cursor = "pointer";
    card.onclick = (e) => {
      if (e.target.tagName !== "BUTTON") {
        window.location.href = `product.html?id=${product.id}`;
      }
    };
    const safeName = escapeHTML(product.name);
    const safeSeller = escapeHTML(product.seller_name || "FetchKart");
    const safeDesc = escapeHTML(product.description).substring(0, 60);

    const img = product.image_url
      ? `<div class="product-image"><img src="${product.image_url}" alt="${safeName}" onerror="this.src='https://placehold.co/300x300?text=📦'"></div>`
      : `<div class="product-image">📦</div>`;
    const stock = parseInt(product.stock_quantity);
    const isLowStock = stock > 0 && stock < 50;
    const stockBadge = isLowStock
      ? `<span class="stock-badge-low" style="top: 0.5rem; right: 0.5rem;">⚠️ Only ${stock} left</span>`
      : "";

    card.innerHTML = `
            ${img}
            ${stockBadge}
            <h3 class="product-title">${safeName}</h3>
            <p class="product-seller-small">By: ${safeSeller}</p>
            <p class="product-desc">${safeDesc}...</p>
            <div class="product-footer">
                <span class="product-price">₹${parseFloat(product.price).toFixed(2)}</span>
                <button class="btn" onclick="addToCart(${product.id}, '${safeName.replace(/'/g, "\\'")}')">Add to Cart</button>
            </div>
        `;
    container.appendChild(card);
  });
}

// Scroll the featured carousel by direction (-1 = left, 1 = right)
function scrollFeatured(direction) {
  const track = document.getElementById("featured-container");
  if (!track) return;
  const cardWidth = track.querySelector(".product-card")?.offsetWidth || 300;
  track.scrollBy({ left: direction * (cardWidth + 24), behavior: "smooth" });
}

// Auto-load featured products on any page that has the container
loadFeaturedProducts();

function filterProducts() {
  const searchEl = document.getElementById("product-search");
  const categoryEl = document.getElementById("category-filter");
  const priceMinEl = document.getElementById("price-min");
  const priceMaxEl = document.getElementById("price-max");
  if (!searchEl || !categoryEl) return;

  const searchTerm = searchEl.value.toLowerCase();
  const categoryFilter = categoryEl.value;
  const priceMin =
    priceMinEl && priceMinEl.value ? parseFloat(priceMinEl.value) : null;
  const priceMax =
    priceMaxEl && priceMaxEl.value ? parseFloat(priceMaxEl.value) : null;

  let filtered = allProducts.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm) ||
      p.category.toLowerCase().includes(searchTerm) ||
      p.description.toLowerCase().includes(searchTerm);
    const matchesCategory =
      categoryFilter === "all" || p.category === categoryFilter;
    const price = parseFloat(p.price);
    const matchesPrice =
      (priceMin === null || price >= priceMin) &&
      (priceMax === null || price <= priceMax);
    return matchesSearch && matchesCategory && matchesPrice;
  });

  // Apply sorting based on currentSort
  if (currentSort && currentSort !== "default") {
    if (currentSort === "price-asc") {
      filtered.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
    } else if (currentSort === "price-desc") {
      filtered.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
    } else if (currentSort === "newest") {
      filtered.sort((a, b) => b.id - a.id);
    }
  }

  renderProducts(filtered);
}
// Sorting function
function sortProducts() {
  const sortSelect = document.getElementById("sort-select");
  if (!sortSelect) return;
  currentSort = sortSelect.value;
  filterProducts();
}

// Load single product details (Flipkart style)
async function loadProductDetails(productId) {
  try {
    const response = await fetch(`api/get_products.php?id=${productId}`);
    const product = await response.json();

    const container = document.getElementById("product-details-container");

    if (product.error) {
      container.innerHTML = `<p>${product.error}</p>`;
      return;
    }

    const safeName = escapeHTML(product.name);
    const safeSeller = escapeHTML(product.seller_name || "FetchKart");
    const safeDesc = escapeHTML(product.description);

    const imageHtml = product.image_url
      ? `<div class="detail-img"><img src="${product.image_url}" alt="${safeName}" onerror="this.src='https://placehold.co/300x300?text=📦'"></div>`
      : `<div class="detail-img">📦</div>`;

    const stock = parseInt(product.stock_quantity || 0);
    let stockMessage = "";
    let btnDisabled = "";

    if (stock <= 0) {
      stockMessage = `<p class="stock-msg-out">❌ Out of Stock - Check back later!</p>`;
      btnDisabled =
        'disabled style="background: #cbd5e1; color: #64748b; cursor: not-allowed; border: none;"';
    } else if (stock < 50) {
      stockMessage = `<p class="stock-msg-low">⚠️ Hurry! Only ${stock} units left in stock!</p>`;
    }

    container.innerHTML = `
            <div class="product-detail-layout">
                <div class="detail-left">
                    ${imageHtml}
                    <div class="detail-actions">
                        <button class="btn btn-buy" ${btnDisabled} onclick="addToCart(${product.id}, '${safeName.replace(/'/g, "\\'")}').then(() => window.location.href='cart.html')">Buy Now</button>
                        <button class="btn btn-cart" ${btnDisabled} onclick="addToCart(${product.id}, '${safeName.replace(/'/g, "\\'")}')">Add to Cart</button>
                    </div>
                </div>
                <div class="detail-right">
                    <h1 class="detail-title">${safeName}</h1>
                    <p class="detail-seller">Seller: <strong>${safeSeller}</strong></p>
                    <div class="detail-price">₹${parseFloat(product.price).toFixed(2)}</div>
                    ${stockMessage}
                    <div class="detail-description">
                        <h3>Product Description</h3>
                        <p>${safeDesc}</p>
                    </div>
                </div>
            </div>

            <!-- Reviews Section (Moved below layout) -->
            <div id="reviews-section" class="detail-reviews">
                <div style="display: flex; justify-content: space-between; align-items: center; margin: 2rem 0 1rem 0;">
                    <h2 style="font-size: 1.5rem;">Customer Reviews</h2>
                </div>
                <div id="reviews-list">
                    <p class="text-muted">Loading reviews...</p>
                </div>
            </div>
        `;
    loadReviews(productId);
  } catch (error) {
    console.error("Error loading product details:", error);
  }
}

async function loadReviews(productId) {
  const list = document.getElementById("reviews-list");
  if (!list) return;

  try {
    const response = await fetch(
      `api/reviews.php?action=get&product_id=${productId}`,
    );
    const data = await response.json();

    if (data.success && data.reviews.length > 0) {
      list.innerHTML = data.reviews
        .map(
          (r) => `
                <div class="review-item" style="padding: 1.5rem 0; border-top: 1px solid var(--border);">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                        <span style="font-weight: 700;">${escapeHTML(r.username)}</span>
                        <span style="color: #f59e0b;">
                            ${Array(5)
                              .fill(0)
                              .map(
                                (_, i) =>
                                  `<i class="${i < r.rating ? "fas" : "far"} fa-star"></i>`,
                              )
                              .join("")}
                        </span>
                    </div>
                    <p style="color: var(--text-muted); font-size: 0.9375rem;">${escapeHTML(r.review_text)}</p>
                    <small style="color: #94a3b8; display: block; margin-top: 0.5rem;">${new Date(r.created_at).toLocaleDateString()}</small>
                </div>
            `,
        )
        .join("");
    } else {
      list.innerHTML =
        '<p class="text-muted" style="padding: 1rem 0;">No reviews yet. Be the first to review this product!</p>';
    }
  } catch (e) {
    list.innerHTML = '<p class="text-muted">Failed to load reviews.</p>';
  }
}

// Fetch the cart count and update the header
async function updateCartCounter() {
  try {
    const response = await fetch("api/cart_actions.php?action=count");
    const data = await response.json();
    const counter = document.getElementById("cart-counter");
    if (counter) {
      counter.textContent = data.count || 0;
    }
    // Also update drawer if it's open
    if (document.querySelector(".cart-drawer.active")) {
      loadDrawerItems();
    }
  } catch (error) {
    console.error("Error fetching cart count:", error);
  }
}

// Add item to cart
async function addToCart(productId, productName) {
  // Check if user is logged in first
  const loggedIn = await isLoggedIn();
  if (!loggedIn) {
    redirectToLogin();
    return;
  }

  try {
    const response = await fetch("api/cart_actions.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `action=add&product_id=${productId}`,
    });

    const data = await response.json();
    if (data.success) {
      // Update counter and open drawer
      updateCartCounter();
      toggleCartDrawer(true);
    }
  } catch (error) {
    console.error("Error adding to cart:", error);
  }
}

// Load cart page content
async function loadCartPage() {
  try {
    const response = await fetch("api/cart_actions.php?action=view");
    const cartData = await response.json();

    const container = document.getElementById("cart-container");
    container.innerHTML = "";

    if (!cartData.items || cartData.items.length === 0) {
      container.innerHTML = `
                <p style="text-align: center; padding: 20px 0;">Your cart is currently empty.</p>
                <div style="text-align: center;">
                    <a href="index.html" class="btn">Browse Products</a>
                </div>
            `;
      return;
    }

    let tableHTML = `
            <table class="cart-table">
                <thead>
                    <tr>
                        <th>Product</th>
                        <th>Price</th>
                        <th>Quantity</th>
                        <th>Subtotal</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
        `;

    cartData.items.forEach((item) => {
      const subtotal = item.price * item.quantity;
      const safeItemName = escapeHTML(item.name);
      tableHTML += `
                <tr>
                    <td>${safeItemName}</td>
                    <td>₹${parseFloat(item.price).toFixed(2)}</td>
                    <td class="qty-controls">
                        <button class="qty-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                        <span class="qty-val">${item.quantity}</span>
                        <button class="qty-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
                    </td>
                    <td>₹${subtotal.toFixed(2)}</td>
                    <td>
                        <button class="btn btn-secondary" onclick="removeFromCart(${item.id})">Remove</button>
                    </td>
                </tr>
            `;
    });

    tableHTML += `
                </tbody>
            </table>
            <div class="cart-total">Total: ₹${parseFloat(cartData.total).toFixed(2)}</div>
            <div class="cart-actions">
                <div class="left-actions">
                    <button class="btn btn-danger" onclick="clearCart()">Clear Cart</button>
                    <a href="index.html" class="btn btn-secondary">Continue Shopping</a>
                </div>
                <button class="btn" onclick="checkout()">Proceed to Checkout</button>
            </div>
        `;

    container.innerHTML = tableHTML;
  } catch (error) {
    console.error("Error loading cart:", error);
    document.getElementById("cart-container").innerHTML =
      "<p>Error loading cart.</p>";
  }
}

// Update quantity (+/-)
async function updateQuantity(productId, change) {
  try {
    const response = await fetch("api/cart_actions.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `action=update_quantity&product_id=${productId}&change=${change}`,
    });

    const data = await response.json();
    if (data.success) {
      updateCartCounter();
      loadCartPage();
    }
  } catch (error) {
    console.error("Error updating quantity:", error);
  }
}

// Clear entire cart
async function clearCart() {
  if (!confirm("Are you sure you want to empty your cart?")) return;

  try {
    const response = await fetch("api/cart_actions.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `action=clear`,
    });

    const data = await response.json();
    if (data.success) {
      updateCartCounter();
      loadCartPage();
    }
  } catch (error) {
    console.error("Error clearing cart:", error);
  }
}

// Go to checkout page
async function checkout() {
  const loggedIn = await isLoggedIn();
  if (!loggedIn) {
    redirectToLogin();
    return;
  }
  window.location.href = "checkout.html";
}

// Remove item from cart
async function removeFromCart(productId) {
  try {
    const response = await fetch("api/cart_actions.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `action=remove&product_id=${productId}`,
    });

    const data = await response.json();
    if (data.success) {
      updateCartCounter();
      loadCartPage();
    }
  } catch (error) {
    console.error("Error removing from cart:", error);
  }
}

// --- Mini-Cart Drawer Functions ---

function initCartDrawer() {
  // Create Drawer HTML
  const drawerHTML = `
        <div class="cart-drawer-overlay" id="cart-overlay"></div>
        <div class="cart-drawer" id="cart-drawer">
            <div class="cart-drawer-header">
                <h2>Your Shopping Cart</h2>
                <button class="close-drawer" onclick="toggleCartDrawer(false)">&times;</button>
            </div>
            <div class="cart-drawer-content" id="drawer-items">
                <!-- Items injected here -->
            </div>
            <div class="cart-drawer-footer">
                <div class="drawer-total">
                    <span>Total:</span>
                    <span id="drawer-total-amount">₹0.00</span>
                </div>
                <div class="drawer-actions">
                    <button class="btn btn-primary drawer-btn" onclick="window.location.href='checkout.html'">Checkout Now</button>
                    <button class="btn btn-secondary drawer-btn" onclick="window.location.href='cart.html'">View Full Cart</button>
                </div>
            </div>
        </div>
    `;
  document.body.insertAdjacentHTML("beforeend", drawerHTML);

  // Event listener for overlay
  document
    .getElementById("cart-overlay")
    .addEventListener("click", () => toggleCartDrawer(false));

  // Update cart link in header to open drawer
  const cartLink = document.querySelector('nav a[href="cart.html"]');
  if (cartLink) {
    cartLink.addEventListener("click", (e) => {
      if (window.innerWidth > 768) {
        // Only drawer on desktop/tablet
        e.preventDefault();
        toggleCartDrawer(true);
      }
    });
  }
}

async function toggleCartDrawer(show) {
  const drawer = document.getElementById("cart-drawer");
  const overlay = document.getElementById("cart-overlay");
  if (!drawer || !overlay) return;

  if (show) {
    drawer.classList.add("active");
    overlay.classList.add("active");
    loadDrawerItems();
    document.body.style.overflow = "hidden"; // Prevent scroll
  } else {
    drawer.classList.remove("active");
    overlay.classList.remove("active");
    document.body.style.overflow = "";
  }
}

async function loadDrawerItems() {
  const container = document.getElementById("drawer-items");
  const totalEl = document.getElementById("drawer-total-amount");
  if (!container) return;

  try {
    const response = await fetch("api/cart_actions.php?action=view");
    const cartData = await response.json();

    if (!cartData.items || cartData.items.length === 0) {
      container.innerHTML = `<div style="text-align:center; padding:2rem; color:var(--text-muted);">
                <p>Your cart is empty</p>
                <button class="btn btn-secondary-sm" style="margin-top:1rem;" onclick="toggleCartDrawer(false)">Start Shopping</button>
            </div>`;
      totalEl.textContent = "₹0.00";
      return;
    }

    container.innerHTML = cartData.items
      .map((item) => {
        const safeName = escapeHTML(item.name);
        return `
            <div class="drawer-cart-item">
                <img src="${item.image_url || "📦"}" alt="${safeName}" class="drawer-item-img" onerror="this.src='https://placehold.co/70?text=📦'">
                <div class="drawer-item-info">
                    <span class="drawer-item-name">${safeName}</span>
                    <span class="drawer-item-price">₹${parseFloat(item.price).toFixed(2)}</span>
                    <div class="drawer-item-qty">
                        <button class="qty-btn-sm" onclick="updateDrawerQuantity(${item.id}, -1)">-</button>
                        <span>${item.quantity}</span>
                        <button class="qty-btn-sm" onclick="updateDrawerQuantity(${item.id}, 1)">+</button>
                    </div>
                </div>
                <button class="close-drawer" style="font-size:1.2rem;" onclick="updateDrawerQuantity(${item.id}, -${item.quantity})">&times;</button>
            </div>
        `;
      })
      .join("");

    totalEl.textContent = `₹${parseFloat(cartData.total).toFixed(2)}`;
  } catch (error) {
    console.error("Error loading drawer items:", error);
  }
}

async function updateDrawerQuantity(productId, change) {
  try {
    const response = await fetch("api/cart_actions.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `action=update_quantity&product_id=${productId}&change=${change}`,
    });
    const data = await response.json();
    if (data.success) {
      updateCartCounter(); // This will also trigger loadDrawerItems
    }
  } catch (error) {
    console.error("Error updating quantity:", error);
  }
}

// Developed by Rudra-Gon for Microtech Internship Evaluation
