// js/auth.js

document.addEventListener('DOMContentLoaded', () => {
    checkUserSession();
});

async function checkUserSession() {
    try {
        const response = await fetch('api/auth.php?action=check');
        const data = await response.json();
        
        const headerNav = document.getElementById('main-nav') || document.querySelector('nav');
        if (data.logged_in) {
            let navLinks = `
                <span class="user-greeting">Hi, <strong>${data.user.username}</strong> (${data.user.role})</span>
                <a href="index.html">Home</a>
                <a href="shop.html">Shop</a>
                <a href="cart.html">Cart <span class="cart-count" id="cart-counter">0</span></a>
                <button id="theme-btn" class="theme-toggle" onclick="themeToggle()" title="Toggle Theme">🌙</button>
            `;
            
            if (data.user.role === 'seller') {
                navLinks += `<a href="seller.html">Dashboard</a>`;
            }
            
            navLinks += `<a href="#" onclick="logout(event)">Logout</a>`;
            headerNav.innerHTML = navLinks;
        } else {
            headerNav.innerHTML = `
                <a href="index.html">Home</a>
                <a href="shop.html">Shop</a>
                <a href="cart.html">Cart <span class="cart-count" id="cart-counter">0</span></a>
                <a href="login.html">Login</a>
                <a href="signup.html">Signup</a>
                <button id="theme-btn" class="theme-toggle" onclick="themeToggle()" title="Toggle Theme">🌙</button>
            `;
        }
        
        // Always try to update theme icon if theme.js is present
        if (typeof updateToggleIcon === 'function') {
            const savedTheme = localStorage.getItem('theme') || 'light';
            updateToggleIcon(savedTheme);
        }

        // Always try to update cart counter if it exists
        if (typeof updateCartCounter === 'function') {
            updateCartCounter();
        }
    } catch (error) {
        console.error('Error checking session:', error);
    }
}

async function logout(event) {
    if (event) event.preventDefault();
    try {
        const response = await fetch('api/auth.php?action=logout');
        const data = await response.json();
        if (data.success) {
            window.location.href = 'index.html';
        }
    } catch (error) {
        console.error('Error logging out:', error);
    }
}

async function handleSignup(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    formData.append('action', 'signup');

    const msgBox = document.getElementById('auth-message');
    msgBox.textContent = 'Creating account...';

    try {
        const response = await fetch('api/auth.php', {
            method: 'POST',
            body: formData
        });
        const data = await response.json();
        
        if (data.success) {
            msgBox.innerHTML = `<span style="color: green;">${data.message} Redirecting to login...</span>`;
            setTimeout(() => window.location.href = 'login.html', 2000);
        } else {
            msgBox.innerHTML = `<span style="color: red;">${data.message}</span>`;
        }
    } catch (error) {
        msgBox.innerHTML = `<span style="color: red;">Error during signup.</span>`;
    }
}

async function handleLogin(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    formData.append('action', 'login');

    const msgBox = document.getElementById('auth-message');
    msgBox.textContent = 'Logging in...';

    try {
        const response = await fetch('api/auth.php', {
            method: 'POST',
            body: formData
        });
        const data = await response.json();
        
        if (data.success) {
            msgBox.innerHTML = `<span style="color: green;">Login successful!</span>`;
            window.location.href = 'index.html';
        } else {
            msgBox.innerHTML = `<span style="color: red;">${data.message}</span>`;
        }
    } catch (error) {
        msgBox.innerHTML = `<span style="color: red;">Error during login.</span>`;
    }
}
