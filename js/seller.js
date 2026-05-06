// js/seller.js

document.addEventListener('DOMContentLoaded', () => {
    loadInventory();
    loadOrders();
    loadSellerPrefs();
});

async function loadSellerPrefs() {
    try {
        const response = await fetch('api/auth.php?action=check');
        const data = await response.json();
        if (data.logged_in && data.user.role === 'seller') {
            document.getElementById('storage-type-display').textContent = data.user.storage_option || 'N/A';
            document.getElementById('warehouse-option-display').textContent = data.user.warehouse_option || 'N/A';
        }
    } catch (error) {
        console.error('Error loading seller prefs:', error);
    }
}

async function loadInventory() {
    try {
        const response = await fetch('api/get_seller_data.php?action=inventory');
        const products = await response.json();
        
        const container = document.getElementById('inventory-list');
        if (products.length === 0) {
            container.innerHTML = '<p>You haven\'t listed any products yet.</p>';
            return;
        }

        let html = `
            <table class="dashboard-table">
                <thead>
                    <tr>
                        <th>Image</th>
                        <th>Name</th>
                        <th>Price</th>
                        <th>Category</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
        `;

        products.forEach(p => {
            html += `
                <tr>
                    <td><div class="thumb-container"><img src="${p.image_url}" class="thumb-mini"></div></td>
                    <td>${p.name}</td>
                    <td>₹${parseFloat(p.price).toFixed(2)}</td>
                    <td>${p.category}</td>
                    <td><button class="btn btn-danger btn-sm" onclick="deleteProduct(${p.id})">Delete</button></td>
                </tr>
            `;
        });

        html += '</tbody></table>';
        container.innerHTML = html;
    } catch (error) {
        console.error('Error loading inventory:', error);
    }
}

async function loadOrders() {
    try {
        const response = await fetch('api/get_seller_data.php?action=orders');
        const orders = await response.json();
        
        const container = document.getElementById('orders-list');
        if (orders.length === 0) {
            container.innerHTML = '<p>No orders received yet.</p>';
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

        orders.forEach(o => {
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

        html += '</tbody></table>';
        container.innerHTML = html;
    } catch (error) {
        console.error('Error loading orders:', error);
    }
}

async function handleAddProduct(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const msgBox = document.getElementById('seller-message');
    msgBox.textContent = 'Uploading...';

    try {
        const response = await fetch('api/add_product.php', {
            method: 'POST',
            body: formData
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
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
        const formData = new FormData();
        formData.append('product_id', id);
        const response = await fetch('api/get_seller_data.php?action=delete_product', {
            method: 'POST',
            body: formData
        });
        const data = await response.json();
        if (data.success) {
            loadInventory();
        }
    } catch (error) {
        console.error('Error deleting product:', error);
    }
}
