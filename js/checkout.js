// js/checkout.js

document.addEventListener('DOMContentLoaded', () => {
    loadCheckoutData();
});

async function loadCheckoutData() {
    try {
        const response = await fetch('api/cart_actions.php?action=view');
        const cartData = await response.json();
        
        const itemsContainer = document.getElementById('checkout-items-list');
        const summaryItemsTotal = document.getElementById('summary-items-total');
        const summaryGrandTotal = document.getElementById('summary-grand-total');

        if (!cartData.items || cartData.items.length === 0) {
            window.location.href = 'shop.html'; // Redirect if cart empty
            return;
        }

        let itemsHtml = '';
        cartData.items.forEach(item => {
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
        summaryGrandTotal.textContent = `₹${parseFloat(cartData.total).toFixed(2)}`;

    } catch (error) {
        console.error('Error loading checkout data:', error);
    }
}

async function placeOrder() {
// Gather address fields
const fullname = document.getElementById('ship-fullname').value.trim();
const addr1 = document.getElementById('ship-address1').value.trim();
const addr2 = document.getElementById('ship-address2').value.trim();
const city = document.getElementById('ship-city').value.trim();
const state = document.getElementById('ship-state').value.trim();
const zip = document.getElementById('ship-zip').value.trim();

// Build a single address string (omit optional parts if empty)
let addressParts = [];
if (fullname) addressParts.push(fullname);
if (addr1) addressParts.push(addr1);
if (addr2) addressParts.push(addr2);
if (city) addressParts.push(city);
if (state) addressParts.push(state);
if (zip) addressParts.push(zip);
const address = addressParts.join(', ');

// Validate required fields (fullname, addr1, city, state, zip)
if (!fullname || !addr1 || !city || !state || !zip) {
    addressError.style.display = 'block';
    // Highlight missing fields (simple approach: set red border on each empty required input)
    const requiredIds = ['ship-fullname', 'ship-address1', 'ship-city', 'ship-state', 'ship-zip'];
    requiredIds.forEach(id => {
        const el = document.getElementById(id);
        if (!el.value.trim()) {
            el.style.borderColor = '#b12704';
        } else {
            el.style.borderColor = '#ccc';
        }
    });
    addressError.textContent = 'Please fill in all required shipping fields.';
    return;
} else {
    addressError.style.display = 'none';
    // Reset border colors
    ['ship-fullname', 'ship-address1', 'ship-city', 'ship-state', 'ship-zip'].forEach(id => {
        document.getElementById(id).style.borderColor = '#ccc';
    });
}

    const paymentMethod = document.querySelector('input[name="payment"]:checked').value;
    
    try {
        const response = await fetch('api/checkout.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `payment_method=${encodeURIComponent(paymentMethod)}&address=${encodeURIComponent(address)}`
        });
        
        const data = await response.json();
        if (data.success) {
            // Show success modal
            document.getElementById('success-modal').style.display = 'flex';
            
            // Optional: Auto redirect after 3 seconds
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 3000);
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error('Error placing order:', error);
    }
}
