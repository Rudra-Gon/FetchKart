// js/mobile.js

document.addEventListener("DOMContentLoaded", () => {
  initMobileNav();
  setupTouchTargets();
  initStickyAddToCart();
});

function initMobileNav() {
  const bottomNav = document.getElementById("mobile-bottom-nav");
  if (!bottomNav) return;

  // Highlight active link based on current page
  const currentPath = window.location.pathname;
  const navLinks = bottomNav.querySelectorAll("a");

  navLinks.forEach((link) => {
    if (currentPath.includes(link.getAttribute("href"))) {
      link.classList.add("active");
    }
  });
}

function setupTouchTargets() {
  // Touch target sizing is handled via CSS (min-height: 48px on interactive elements).
  // This function is reserved for any future dynamic touch target adjustments.
}

function initStickyAddToCart() {
  const productDetailLayout = document.querySelector(".product-detail-layout");
  if (!productDetailLayout) return;

  const stickyBar = document.createElement("div");
  stickyBar.className = "mobile-sticky-action-bar";

  // Extract info from page (assuming loadProductDetails has run)
  // We wait a bit for dynamic content
  setTimeout(() => {
    const price = document.querySelector(".detail-price")?.textContent || "";
    const name = document.querySelector(".detail-title")?.textContent || "";
    const idMatch = window.location.search.match(/id=(\d+)/);
    const id = idMatch ? idMatch[1] : null;

    if (id) {
      stickyBar.innerHTML = `
                <div class="sticky-info">
                    <span class="sticky-price">${price}</span>
                </div>
                <button class="btn btn-primary" onclick="addToCart(${id}, '${name}')">Add to Cart</button>
            `;
      document.body.appendChild(stickyBar);
    }
  }, 1000);
}

// Swipe gesture detection — reserved for future modal/drawer dismiss support
let touchstartX = 0;
let touchendX = 0;

document.addEventListener("touchstart", (e) => {
  touchstartX = e.changedTouches[0].screenX;
}, { passive: true });

document.addEventListener("touchend", (e) => {
  touchendX = e.changedTouches[0].screenX;
}, { passive: true });

// Developed by Rudra-Gon for Microtech Internship Evaluation
