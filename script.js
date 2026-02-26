/* ============================================
   LAPIROS KITCHEN — Main Script
   ============================================
   
   SHARED (loaded on all pages):
     - Navbar Scroll Effect       → all pages
     - Mobile Menu                → all pages
     - Scroll Reveal Animation    → index.html, menu.html
     - Smooth Scroll              → all pages
     - Toast Notification         → contact.html, order.html

   PAGE-SPECIFIC (only runs when element exists):
     - Contact Form               → contact.html
     - Review Form                → contact.html
     - Menu Search                → menu.html
     - Cart Logic                 → order.html
     - Date Picker                → order.html
     - Place Order / Modal        → order.html
     - Payment Option Cards       → order.html

   ============================================ */


/* ============================================
   SHARED — all pages
   ============================================ */

// ---- NAVBAR SCROLL EFFECT ----
const navBar = document.getElementById('navBar');
if (navBar) {
    window.addEventListener('scroll', () => {
        navBar.classList.toggle('scrolled', window.scrollY > 20);
    });
}

// ---- MOBILE MENU ----
const navToggleBtn = document.getElementById('navToggleBtn');
const navMenuList = document.getElementById('navMenuList');

if (navToggleBtn && navMenuList) {
    navToggleBtn.addEventListener('click', () => {
        navMenuList.classList.toggle('active');
        navToggleBtn.setAttribute('aria-expanded', navMenuList.classList.contains('active'));
    });

    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.addEventListener('click', () => {
            navMenuList.classList.remove('active');
        });
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
        if (!navBar.contains(e.target)) {
            navMenuList.classList.remove('active');
        }
    });
}

// ---- SCROLL REVEAL ANIMATION — index.html, menu.html ----
const revealElements = document.querySelectorAll('.reveal');

if (revealElements.length) {
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    revealElements.forEach(el => revealObserver.observe(el));
}

// ---- SMOOTH SCROLL FOR ANCHOR LINKS — all pages ----
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            e.preventDefault();
            const offset = 90;
            const top = target.getBoundingClientRect().top + window.scrollY - offset;
            window.scrollTo({ top, behavior: 'smooth' });
        }
    });
});


/* ============================================
   contact.html
   ============================================ */

// ---- CONTACT FORM ----
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name  = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        showToast(`Thank you, ${name}! We'll reply to ${email} shortly.`, 'success');
        contactForm.reset();
    });
}

// ---- REVIEW FORM ----
const reviewForm = document.getElementById('reviewForm');
if (reviewForm) {
    reviewForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name   = document.getElementById('reviewName').value;
        const rating = document.getElementById('rating').value;
        showToast(`Thank you, ${name}! Your ${rating}★ review has been submitted.`, 'success');
        reviewForm.reset();
    });
}


/* ============================================
   menu.html
   ============================================ */

// ---- MENU SEARCH ----
const menuSearch = document.getElementById('menuSearch');
if (menuSearch) {
    menuSearch.addEventListener("input", () => {
        const searchTerm = menuSearch.value.toLowerCase(); // NOTE: was 'searchTerms' (typo fixed)
        const menuItems = document.querySelectorAll(".menu-item");

        menuItems.forEach(item => {
            const text = item.textContent.toLowerCase();
            item.style.display = text.includes(searchTerm) ? "flex" : "none";
        });
    });
}


/* ============================================
   order.html
   ============================================ */

// ---- CART LOGIC ----
const orderItems = document.querySelectorAll('.order-item[data-price]');
const cartItemsEl  = document.getElementById('cartItems');
const cartEmptyEl  = document.getElementById('cartEmpty');
const cartTotalsEl = document.getElementById('cartTotals');
const cartCountEl  = document.getElementById('cartCount');
const cartSubtotalEl = document.getElementById('cartSubtotal');
const cartTotalEl    = document.getElementById('cartTotal');
const placeOrderBtn  = document.getElementById('placeOrderBtn');
const pickupSummaryEl = document.getElementById('pickupSummary');

let orderCart = {}; // { "Dish Name": { price, qty } }

if (orderItems.length) {
    // Initialise qty buttons
    orderItems.forEach(item => {
        const name  = item.dataset.name;
        const price = parseFloat(item.dataset.price);
        const minusBtn = item.querySelector('.qty-btn.minus');
        const plusBtn  = item.querySelector('.qty-btn.plus');
        const qtyVal   = item.querySelector('.qty-val');

        plusBtn.addEventListener('click', () => {
            if (!orderCart[name]) orderCart[name] = { price, qty: 0 };
            orderCart[name].qty++;
            qtyVal.textContent = orderCart[name].qty;
            item.classList.add('has-quantity');
            updateCart();
        });

        minusBtn.addEventListener('click', () => {
            if (!orderCart[name] || orderCart[name].qty === 0) return;
            orderCart[name].qty--;
            qtyVal.textContent = orderCart[name].qty;
            if (orderCart[name].qty === 0) {
                delete orderCart[name];
                item.classList.remove('has-quantity');
            }
            updateCart();
        });
    });

    // Pre-select from URL param (e.g. order.html?dish=Ndole)
    const urlParams = new URLSearchParams(window.location.search);
    const preselect = urlParams.get('dish');
    if (preselect) {
        orderItems.forEach(item => {
            if (item.dataset.name === preselect) {
                const plusBtn = item.querySelector('.qty-btn.plus');
                plusBtn.click();
                item.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        });
    }
}

function updateCart() {
    if (!cartItemsEl) return;

    const cartKeys = Object.cartKeys(orderCart);
    const totalItems = cartKeys.reduce((acc, k) => acc + orderCart[k].qty, 0);
    const subtotal   = cartKeys.reduce((acc, k) => acc + orderCart[k].price * orderCart[k].qty, 0);

    // Update count badge
    if (cartCountEl) cartCountEl.textContent = `${totalItems} item${totalItems !== 1 ? 's' : ''}`;

    // Toggle empty state
    if (cartEmptyEl)  cartEmptyEl.style.display  = cartKeys.length === 0 ? '' : 'none';
    if (cartTotalsEl) cartTotalsEl.style.display  = cartKeys.length === 0 ? 'none' : '';

    // Render lines
    cartItemsEl.innerHTML = cartKeys.map(name => `
        <div class="cart-line">
            <span class="cart-line-name">${name}</span>
            <span class="cart-line-qty">×${orderCart[name].qty}</span>
            <span class="cart-line-price">$${(orderCart[name].price * orderCart[name].qty).toFixed(2)}</span>
        </div>
    `).join('');

    // Totals
    if (cartSubtotalEl) cartSubtotalEl.textContent = `$${subtotal.toFixed(2)}`;
    if (cartTotalEl)    cartTotalEl.textContent    = `$${subtotal.toFixed(2)}`;

    // Enable/disable order button
    checkOrderReady();
}

// ---- DATE PICKER: disable Sundays & past dates ----
const pickupDateInput = document.getElementById('pickupDate');
const pickupTimeInput = document.getElementById('pickupTime');

if (pickupDateInput) {
    const today = new Date();
    const yyyy  = today.getFullYear();
    const mm    = String(today.getMonth() + 1).padStart(2, '0');
    const dd    = String(today.getDate()).padStart(2, '0');
    pickupDateInput.min = `${yyyy}-${mm}-${dd}`;

    pickupDateInput.addEventListener('change', () => {
        const selected = new Date(pickupDateInput.value + 'T00:00:00');
        const dayOfWeek = selected.getDay(); // 0=Sun

        if (dayOfWeek === 0) {
            showToast('We are closed on Sundays. Please select another day.', 'warning');
            pickupDateInput.value = '';
            return;
        }

        updatePickupSummary();
        checkOrderReady();
    });
}

if (pickupTimeInput) {
    pickupTimeInput.addEventListener('change', () => {
        updatePickupSummary();
        checkOrderReady();
    });
}

function updatePickupSummary() {
    if (!pickupSummaryEl) return;
    const date = pickupDateInput?.value;
    const time = pickupTimeInput?.value;
    if (date && time) {
        const pickupDateObj = new Date(date + 'T00:00:00');
        const formatted = pickupDateObj.toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric' });
        document.getElementById('summaryPickup').textContent = `${formatted} at ${time}`;
        pickupSummaryEl.style.display = '';
    }
}

function checkOrderReady() {
    if (!placeOrderBtn) return;
    const hasItems  = Object.cartKeys(orderCart).length > 0;
    const hasDate   = pickupDateInput?.value;
    const hasTime   = pickupTimeInput?.value;
    const hasName   = document.getElementById('custName')?.value.trim();
    const hasPhone  = document.getElementById('custPhone')?.value.trim();
    const hasEmail  = document.getElementById('custEmail')?.value.trim();
    placeOrderBtn.disabled = !(hasItems && hasDate && hasTime && hasName && hasPhone && hasEmail);
}

// Listen for form input changes too
['custName','custPhone','custEmail'].forEach(id => {
    const inputEl = document.getElementById(id);
    if (inputEl) inputEl.addEventListener('input', checkOrderReady);
});

// ---- PLACE ORDER ----
if (placeOrderBtn) {
    placeOrderBtn.addEventListener('click', () => {
        if (placeOrderBtn.disabled) return;

        const name   = document.getElementById('custName').value.trim();
        const phone  = document.getElementById('custPhone').value.trim();
        const email  = document.getElementById('custEmail').value.trim();
        const date   = pickupDateInput.value;
        const time   = pickupTimeInput.value;
        const pay    = document.querySelector('input[name="payMethod"]:checked')?.value || 'Not specified';
        const notes  = document.getElementById('specialNotes').value.trim();

        // Format order summary for modal
        const orderDateObj = new Date(date + 'T00:00:00');
        const dateFormatted = orderDateObj.toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric' });

        const itemLines = Object.cartKeys(orderCart).map(itemName =>
            `${itemName} ×${orderCart[itemName].qty} — $${(orderCart[itemName].price * orderCart[itemName].qty).toFixed(2)}`
        ).join('\n');

        const total = Object.values(orderCart).reduce((acc, item) => acc + item.price * i.qty, 0);

        // Populate modal
        document.getElementById('modalName').textContent  = name;
        document.getElementById('modalPhone').textContent = phone;
        document.getElementById('modalDetails').innerHTML = `
            <strong>📋 Order Summary</strong><br>
            ${Object.cartKeys(orderCart).map(itemName =>
                `${itemName} ×${orderCart[itemName].qty} — $${(orderCart[itemName].price * orderCart[itemName].qty).toFixed(2)}`
            ).join('<br>')}
            <br><strong>Estimated Total:</strong> $${total.toFixed(2)}<br>
            <strong>Pickup:</strong> ${dateFormatted} at ${time}<br>
            <strong>Payment:</strong> ${pay.charAt(0).toUpperCase() + pay.slice(1)}
            ${notes ? `<br><strong>Notes:</strong> ${notes}` : ''}
        `;

        // Show modal
        document.getElementById('successModal').classList.add('active');

        // In production: send to backend / email service here
        console.log('ORDER PLACED:', { name, phone, email, date, time, pay, orderCart, notes });
    });
}

// ---- CLOSE MODAL ON OVERLAY CLICK ----
const successModal = document.getElementById('successModal');
if (successModal) {
    successModal.addEventListener('click', (e) => {
        if (e.target === successModal) {
            successModal.classList.remove('active');
        }
    });
}

// ---- PAYMENT OPTION CARDS ----
document.querySelectorAll('.payment-option-card input[type="radio"]').forEach(radio => {
    radio.addEventListener('change', checkOrderReady);
});


/* ============================================
   SHARED — contact.html, order.html
   ============================================ */

// ---- TOAST NOTIFICATION ----
function showToast(msg, type = 'success') {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <span>${type === 'success' ? '✅' : type === 'warning' ? '⚠️' : 'ℹ️'}</span>
        <span>${msg}</span>
    `;

    Object.assign(toast.style, {
        position: 'fixed',
        bottom: '28px',
        right: '24px',
        background: type === 'success' ? '#2d5016' : type === 'warning' ? '#b8860b' : '#1a1a1a',
        color: '#fff',
        padding: '14px 20px',
        borderRadius: '10px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        fontSize: '0.9rem',
        fontFamily: "'DM Sans', sans-serif",
        fontWeight: '500',
        boxShadow: '0 8px 30px rgba(0,0,0,0.25)',
        zIndex: '99999',
        maxWidth: '380px',
        animation: 'toastIn 0.4s ease',
    });

    // inject keyframe if not yet present
    if (!document.getElementById('toast-style')) {
        const toastStyleEl = document.createElement('style');
        toastStyleEl.id = 'toast-style';
        toastStyleEl.textContent = `
            @keyframes toastIn  { from { opacity:0; transform: translateY(16px); } to { opacity:1; transform:translateY(0); } }
            @keyframes toastOut { from { opacity:1; } to { opacity:0; transform: translateY(16px); } }
        `;
        document.head.appendChild(toastStyleEl);
    }

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'toastOut 0.35s ease forwards';
        setTimeout(() => toast.remove(), 350);
    }, 3800);
}