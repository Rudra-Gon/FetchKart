// Global variable to store cart count
let cartCount = 0;

// Check if the user is logged in (returns a promise)
async function isLoggedIn() {
    try {
        const response = await fetch('api/auth.php?action=check');
        const data = await response.json();
        return data.logged_in === true;
    } catch (error) {
        console.error('Error checking login status:', error);
        return false;
    }
}

// Show "not signed in" alert and redirect to login
function redirectToLogin() {
    const alertContainer = document.getElementById('alert-container');
    if (alertContainer) {
        alertContainer.innerHTML = `<div class="alert-error" style="background:#fef2f2; color:#dc2626; padding:1rem; border-radius:8px; text-align:center; font-weight:600; border:1px solid #fecaca;">You aren't signed in! Redirecting to login...</div>`;
    } else {
        alert("You aren't signed in! Redirecting to login...");
    }
    setTimeout(() => { window.location.href = 'login.html'; }, 2000);
}

// On page load
document.addEventListener('DOMContentLoaded', () => {
    updateCartCounter();
    
    // If we are on index.html, load products
    if (document.getElementById('products-container')) {
        loadProducts();
    }
});

// Global store for products
let allProducts = [];

// Fetch products from the PHP API
async function loadProducts() {
    try {
        const response = await fetch('api/get_products.php');
        allProducts = await response.json();
        
        if (allProducts.error) {
            document.getElementById('products-container').innerHTML = `<p>Error loading products: ${allProducts.error}</p>`;
            return;
        }

        renderProducts(allProducts);
        // After loading products and handling URL param, add active class handling for category cards
    const categoryCards = document.querySelectorAll('.category-card');
    if (categoryCards.length) {
        // Set active class based on current selection
        categoryCards.forEach(card => {
            const url = new URL(card.href);
            const catParam = url.searchParams.get('category');
            if (catParam && catParam === cat) {
                card.classList.add('active');
            } else {
                card.classList.remove('active');
            }
            // Click handler to update filter and active state
            card.addEventListener('click', e => {
                e.preventDefault();
                // Update dropdown
                const select = document.getElementById('category-filter');
                if (select) select.value = catParam || 'all';
                // Update active classes
                categoryCards.forEach(c => c.classList.remove('active'));
                card.classList.add('active');
                filterProducts();
            });
        });
    }
        const urlParams = new URLSearchParams(window.location.search);
        const cat = urlParams.get('category');
        if (cat) {
            const select = document.getElementById('category-filter');
            if (select) select.value = cat;
            filterProducts();
        }
    } catch (error) {
        console.error('Error fetching products:', error);
        document.getElementById('products-container').innerHTML = '<p>No products found. Sellers can add products from their dashboard.</p>';
    }
}

// Render product cards to the container
function renderProducts(products) {
    const container = document.getElementById('products-container');
    container.innerHTML = '';

    if (products.length === 0) {
        container.innerHTML = '<p style="text-align:center; width:100%; padding: 2rem;">No products match your search.</p>';
        return;
    }

    products.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.style.cursor = 'pointer';
        card.onclick = (e) => {
            if (e.target.tagName !== 'BUTTON') {
                window.location.href = `product.html?id=${product.id}`;
            }
        };
        
        const imageHtml = product.image_url 
            ? `<div class="product-image"><img src="${product.image_url}" alt="${product.name}"></div>`
            : `<div class="product-image">📦</div>`;

        const isOutOfStock = parseInt(product.stock_quantity) <= 0;
        const stockBadge = isOutOfStock ? `<span class="stock-badge-out">Out of Stock</span>` : '';
        
        if (isOutOfStock) {
            card.classList.add('out-of-stock-card');
        }
        
        card.innerHTML = `
            ${imageHtml}
            ${stockBadge}
            <h3 class="product-title">${product.name}</h3>
            <p class="product-seller-small">By: ${product.seller_name || 'FetchKart'}</p>
            <p class="product-desc">${product.description.substring(0, 60)}...</p>
            <div class="product-footer">
                <span class="product-price">₹${parseFloat(product.price).toFixed(2)}</span>
                <button class="btn" ${isOutOfStock ? 'disabled style="background: #cbd5e1; color: #64748b; cursor: not-allowed; border: none;"' : ''} onclick="addToCart(${product.id}, '${product.name}')">${isOutOfStock ? 'Sold Out' : 'Add to Cart'}</button>
            </div>
        `;
        container.appendChild(card);
    });
}

// Filter products based on search input and category select
function filterProducts() {
    const searchTerm = document.getElementById('product-search').value.toLowerCase();
    const categoryFilter = document.getElementById('category-filter').value;
    
    const filtered = allProducts.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm) || 
                              p.category.toLowerCase().includes(searchTerm);
        const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });
    
    renderProducts(filtered);
}

// Load single product details (Flipkart style)
async function loadProductDetails(productId) {
    try {
        const response = await fetch(`api/get_products.php?id=${productId}`);
        const product = await response.json();
        
        const container = document.getElementById('product-details-container');
        
        if (product.error) {
            container.innerHTML = `<p>${product.error}</p>`;
            return;
        }

        const imageHtml = product.image_url 
            ? `<div class="detail-img"><img src="${product.image_url}" alt="${product.name}"></div>`
            : `<div class="detail-img">📦</div>`;

        const stock = parseInt(product.stock_quantity || 0);
        let stockMessage = '';
        let btnDisabled = '';
        
        if (stock <= 0) {
            stockMessage = `<p class="stock-msg-out">❌ Out of Stock - Check back later!</p>`;
            btnDisabled = 'disabled style="background: #cbd5e1; color: #64748b; cursor: not-allowed; border: none;"';
        } else if (stock < 50) {
            stockMessage = `<p class="stock-msg-low">⚠️ Hurry! Only ${stock} units left in stock!</p>`;
        }

        container.innerHTML = `
            <div class="product-detail-layout">
                <div class="detail-left">
                    ${imageHtml}
                    <div class="detail-actions">
                        <button class="btn btn-buy" ${btnDisabled} onclick="addToCart(${product.id}, '${product.name}').then(() => window.location.href='cart.html')">Buy Now</button>
                        <button class="btn btn-cart" ${btnDisabled} onclick="addToCart(${product.id}, '${product.name}')">Add to Cart</button>
                    </div>
                </div>
                <div class="detail-right">
                    <h1 class="detail-title">${product.name}</h1>
                    <p class="detail-seller">Seller: <strong>${product.seller_name || 'FetchKart'}</strong></p>
                    <div class="detail-price">₹${parseFloat(product.price).toFixed(2)}</div>
                    ${stockMessage}
                    <div class="detail-description">
                        <h3>Product Description</h3>
                        <p>${product.description}</p>
                    </div>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Error loading product details:', error);
    }
}

// Fetch the cart count and update the header
async function updateCartCounter() {
    try {
        const response = await fetch('api/cart_actions.php?action=count');
        const data = await response.json();
        const counter = document.getElementById('cart-counter');
        if (counter) {
            counter.textContent = data.count || 0;
        }
    } catch (error) {
        console.error('Error fetching cart count:', error);
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
        const response = await fetch('api/cart_actions.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `action=add&product_id=${productId}`
        });
        
        const data = await response.json();
        if (data.success) {
            // Show alert
            const alertContainer = document.getElementById('alert-container');
            if (alertContainer) {
                alertContainer.innerHTML = `<div class="alert-success">Added ${productName} to cart!</div>`;
                setTimeout(() => { alertContainer.innerHTML = ''; }, 3000);
            }
            updateCartCounter();
        }
    } catch (error) {
        console.error('Error adding to cart:', error);
    }
}

// Load cart page content
async function loadCartPage() {
    try {
        const response = await fetch('api/cart_actions.php?action=view');
        const cartData = await response.json();
        
        const container = document.getElementById('cart-container');
        container.innerHTML = '';
        
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

        cartData.items.forEach(item => {
            const subtotal = item.price * item.quantity;
            tableHTML += `
                <tr>
                    <td>${item.name}</td>
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
        console.error('Error loading cart:', error);
        document.getElementById('cart-container').innerHTML = '<p>Error loading cart.</p>';
    }
}

// Update quantity (+/-)
async function updateQuantity(productId, change) {
    try {
        const response = await fetch('api/cart_actions.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `action=update_quantity&product_id=${productId}&change=${change}`
        });
        
        const data = await response.json();
        if (data.success) {
            updateCartCounter();
            loadCartPage();
        }
    } catch (error) {
        console.error('Error updating quantity:', error);
    }
}

// Clear entire cart
async function clearCart() {
    if (!confirm('Are you sure you want to empty your cart?')) return;
    
    try {
        const response = await fetch('api/cart_actions.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `action=clear`
        });
        
        const data = await response.json();
        if (data.success) {
            updateCartCounter();
            loadCartPage();
        }
    } catch (error) {
        console.error('Error clearing cart:', error);
    }
}

// Go to checkout page
async function checkout() {
    const loggedIn = await isLoggedIn();
    if (!loggedIn) {
        redirectToLogin();
        return;
    }
    window.location.href = 'checkout.html';
}

// Remove item from cart
async function removeFromCart(productId) {
    try {
        const response = await fetch('api/cart_actions.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `action=remove&product_id=${productId}`
        });
        
        const data = await response.json();
        if (data.success) {
            updateCartCounter();
            loadCartPage();
        }
    } catch (error) {
        console.error('Error removing from cart:', error);
    }
}

