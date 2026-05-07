// js/auth.js

document.addEventListener('DOMContentLoaded', () => {
    checkUserSession();
    initAnimations();
});

function initAnimations() {
    // Page Loader
    const loader = document.createElement('div');
    loader.className = 'page-loader';
    loader.innerHTML = '<div class="loader-spinner"></div>';
    document.body.appendChild(loader);

    window.addEventListener('load', () => {
        setTimeout(() => {
            loader.classList.add('fade-out');
            document.body.classList.add('loaded');
        }, 500);
    });

    // Intersection Observer for Scroll Animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, observerOptions);

    // Auto-reveal sections and cards
    const revealElements = document.querySelectorAll('section, .product-card, .category-card, .feature-item, .hero-content');
    revealElements.forEach((el, index) => {
        el.classList.add('reveal');
        // Set index for staggering if in a grid
        el.style.setProperty('--i', (index % 4) + 1); 
        observer.observe(el);
    });
}

async function checkUserSession() {
    try {
        const response = await fetch('api/auth.php?action=check');
        const data = await response.json();
        
        const desktopNav = document.getElementById('main-nav');
        const mobileNavLinks = document.querySelector('.mobile-nav-links');
        
        const getNavContent = (isMobile = false) => {
            let links = '';
            if (data.logged_in) {
                if (!isMobile) links += `<span class="user-greeting">Hi, <strong>${data.user.username}</strong></span>`;
                links += `<a href="index.html">${isMobile ? '🏠 ' : ''}Home</a>`;
                links += `<a href="shop.html">${isMobile ? '🛍️ ' : ''}Shop</a>`;
                links += `<a href="cart.html">${isMobile ? '🛒 ' : ''}Cart <span class="cart-count" id="cart-counter">0</span></a>`;
                links += `<a href="orders.html">${isMobile ? '📦 ' : ''}Orders</a>`;
                if (data.user.role === 'seller') {
                    links += `<a href="seller.html">${isMobile ? '📊 ' : ''}Dashboard</a>`;
                }
                links += `<a href="#" onclick="logout(event)">${isMobile ? '🚪 ' : ''}Logout</a>`;
            } else {
                links += `<a href="index.html">${isMobile ? '🏠 ' : ''}Home</a>`;
                links += `<a href="shop.html">${isMobile ? '🛍️ ' : ''}Shop</a>`;
                links += `<a href="cart.html">${isMobile ? '🛒 ' : ''}Cart <span class="cart-count" id="cart-counter">0</span></a>`;
                links += `<a href="login.html">${isMobile ? '👤 ' : ''}Login</a>`;
                links += `<a href="signup.html">${isMobile ? '📝 ' : ''}Signup</a>`;
            }
            if (!isMobile) {
                links += `<button id="theme-btn" class="theme-toggle" onclick="themeToggle()" title="Toggle Theme"></button>`;
            }
            return links;
        };

        if (desktopNav) {
            // Check if we need to preserve the hamburger
            const toggle = desktopNav.querySelector('.mobile-nav-toggle');
            desktopNav.innerHTML = getNavContent(false);
            if (toggle) desktopNav.appendChild(toggle);
        }

        if (mobileNavLinks) {
            mobileNavLinks.innerHTML = getNavContent(true);
        }
        
        // Always try to update theme icon if theme.js is present
        if (typeof updateToggleIcon === 'function') {
            const savedTheme = localStorage.getItem('theme') || 'dark';
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
