// js/auth.js

document.addEventListener('DOMContentLoaded', () => {
    checkUserSession();
    initAnimations();
    injectMobileBottomNav();
    registerPWA();
});

function registerPWA() {
    // Add manifest link
    if (!document.querySelector('link[rel="manifest"]')) {
        const link = document.createElement('link');
        link.rel = 'manifest';
        link.href = 'manifest.json';
        document.head.appendChild(link);
    }

    // Register Service Worker
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('sw.js')
                .then(reg => console.log('SW Registered'))
                .catch(err => console.log('SW Reg Failed', err));
        });
    }
}
// Inject mobile bottom navigation bar on vertical screens
function injectMobileBottomNav() {
    if (document.getElementById('mobile-bottom-nav')) return;
    
    const nav = document.createElement('nav');
    nav.id = 'mobile-bottom-nav';
    nav.className = 'mobile-bottom-nav';
    // Initial static icons while loading session
    nav.innerHTML = `
        <a href="index.html" class="nav-item">
            <i class="fas fa-home"></i>
            <span>Home</span>
        </a>
        <a href="shop.html" class="nav-item">
            <i class="fas fa-search"></i>
            <span>Shop</span>
        </a>
        <a href="cart.html" class="nav-item">
            <i class="fas fa-shopping-cart"></i>
            <span>Cart</span>
        </a>
        <a href="orders.html" class="nav-item">
            <i class="fas fa-box"></i>
            <span>Orders</span>
        </a>
        <a href="login.html" class="nav-item" id="mobile-nav-auth">
            <i class="fas fa-user"></i>
            <span>Login</span>
        </a>
    `;
    document.body.appendChild(nav);

    // Load mobile.js dynamically
    const script = document.createElement('script');
    script.src = 'js/mobile.js';
    document.body.appendChild(script);
}

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
                if (!isMobile) {
                    links += `
                        <a href="account.html" class="nav-profile">
                            <img src="${data.user.profile_pic || 'assets/default-avatar.png'}" alt="Avatar">
                            <span>${data.user.display_name || data.user.username}</span>
                        </a>
                    `;
                }
                links += `<a href="index.html">${isMobile ? '🏠 ' : ''}Home</a>`;
                links += `<a href="shop.html">${isMobile ? '🛍️ ' : ''}Shop</a>`;
                links += `<a href="cart.html">${isMobile ? '🛒 ' : ''}Cart <span class="cart-count" id="cart-counter">0</span></a>`;
                links += `<a href="orders.html">${isMobile ? '📦 ' : ''}Orders</a>`;
                if (isMobile) {
                    links += `<a href="account.html">👤 Account</a>`;
                }
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

        // Update mobile bottom nav auth link
        const mobileAuthLink = document.getElementById('mobile-nav-auth');
        if (mobileAuthLink) {
            if (data.logged_in) {
                mobileAuthLink.href = '#';
                mobileAuthLink.onclick = (e) => logout(e);
                mobileAuthLink.innerHTML = `
                    <i class="fas fa-sign-out-alt"></i>
                    <span>Logout</span>
                `;
            } else {
                mobileAuthLink.href = 'login.html';
                mobileAuthLink.onclick = null;
                mobileAuthLink.innerHTML = `
                    <i class="fas fa-user"></i>
                    <span>Login</span>
                `;
            }
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
            msgBox.innerHTML = `<span style="color: green;">Account created successfully! Redirecting...</span>`;
            setTimeout(() => window.location.href = 'index.html', 1500);
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
