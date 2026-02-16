/* ============================================
   LAPIROS KITCHEN — Main Script
   ============================================ */

// ---- NAVBAR SCROLL EFFECT ----
const navbar = document.getElementById('navbar');
if (navbar) {
    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 20);
    });
}

// ---- MOBILE MENU ----
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('navMenu');

if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        hamburger.setAttribute('aria-expanded', navMenu.classList.contains('active'));
    });

    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
        });
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
        if (!navbar.contains(e.target)) {
            navMenu.classList.remove('active');
        }
    });
}

// ---- SCROLL REVEAL ANIMATION ----
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

// ---- SMOOTH SCROLL FOR ANCHOR LINKS ----
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

// ---- MENU SEARCH ----
const menuSearch = document.getElementById('menuSearch');
if (menuSearch) {
    menuSearch.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase().trim();
        const items = document.querySelectorAll('.menu-item');

        items.forEach(item => {
            const name = item.querySelector('h4')?.textContent.toLowerCase() || '';
            const desc = item.querySelector('p')?.textContent.toLowerCase() || '';
            item.style.display = (name.includes(term) || desc.includes(term)) ? '' : 'none';
        });

        document.querySelectorAll('.menu-category').forEach(cat => {
            const visible = [...cat.querySelectorAll('.menu-item')].some(i => i.style.display !== 'none');
            cat.style.display = visible ? '' : 'none';
        });
    });
}

// ---- ORDER PAGE: CART LOGIC ----
const orderItems = document.querySelectorAll('.order-item[data-price]');
const cartItemsEl  = document.getElementById('cartItems');
const cartEmptyEl  = document.getElementById('cartEmpty');
const cartTotalsEl = document.getElementById('cartTotals');
const cartCountEl  = document.getElementById('cartCount');
const cartSubtotalEl = document.getElementById('cartSubtotal');
const cartTotalEl    = document.getElementById('cartTotal');
const placeOrderBtn  = document.getElementById('placeOrderBtn');
const pickupSummaryEl = document.getElementById('pickupSummary');

let cart = {}; // { "Dish Name": { price, qty } }

if (orderItems.length) {
    // Initialise qty buttons
    orderItems.forEach(item => {
        const name  = item.dataset.name;
        const price = parseFloat(item.dataset.price);
        const minusBtn = item.querySelector('.qty-btn.minus');
        const plusBtn  = item.querySelector('.qty-btn.plus');
        const qtyVal   = item.querySelector('.qty-val');

        plusBtn.addEventListener('click', () => {
            if (!cart[name]) cart[name] = { price, qty: 0 };
            cart[name].qty++;
            qtyVal.textContent = cart[name].qty;
            item.classList.add('has-quantity');
            updateCart();
        });

        minusBtn.addEventListener('click', () => {
            if (!cart[name] || cart[name].qty === 0) return;
            cart[name].qty--;
            qtyVal.textContent = cart[name].qty;
            if (cart[name].qty === 0) {
                delete cart[name];
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

    const keys = Object.keys(cart);
    const totalItems = keys.reduce((acc, k) => acc + cart[k].qty, 0);
    const subtotal   = keys.reduce((acc, k) => acc + cart[k].price * cart[k].qty, 0);

    // Update count badge
    if (cartCountEl) cartCountEl.textContent = `${totalItems} item${totalItems !== 1 ? 's' : ''}`;

    // Toggle empty state
    if (cartEmptyEl)  cartEmptyEl.style.display  = keys.length === 0 ? '' : 'none';
    if (cartTotalsEl) cartTotalsEl.style.display  = keys.length === 0 ? 'none' : '';

    // Render lines
    cartItemsEl.innerHTML = keys.map(name => `
        <div class="cart-line">
            <span class="cart-line-name">${name}</span>
            <span class="cart-line-qty">×${cart[name].qty}</span>
            <span class="cart-line-price">$${(cart[name].price * cart[name].qty).toFixed(2)}</span>
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
        const d = new Date(date + 'T00:00:00');
        const formatted = d.toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric' });
        document.getElementById('summaryPickup').textContent = `${formatted} at ${time}`;
        pickupSummaryEl.style.display = '';
    }
}

function checkOrderReady() {
    if (!placeOrderBtn) return;
    const hasItems  = Object.keys(cart).length > 0;
    const hasDate   = pickupDateInput?.value;
    const hasTime   = pickupTimeInput?.value;
    const hasName   = document.getElementById('custName')?.value.trim();
    const hasPhone  = document.getElementById('custPhone')?.value.trim();
    const hasEmail  = document.getElementById('custEmail')?.value.trim();
    placeOrderBtn.disabled = !(hasItems && hasDate && hasTime && hasName && hasPhone && hasEmail);
}

// Listen for form input changes too
['custName','custPhone','custEmail'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', checkOrderReady);
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
        const d = new Date(date + 'T00:00:00');
        const dateFormatted = d.toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric' });

        const itemLines = Object.keys(cart).map(n =>
            `${n} ×${cart[n].qty} — $${(cart[n].price * cart[n].qty).toFixed(2)}`
        ).join('\n');

        const total = Object.values(cart).reduce((a,i) => a + i.price * i.qty, 0);

        // Populate modal
        document.getElementById('modalName').textContent  = name;
        document.getElementById('modalPhone').textContent = phone;
        document.getElementById('modalDetails').innerHTML = `
            <strong>📋 Order Summary</strong><br>
            ${Object.keys(cart).map(n =>
                `${n} ×${cart[n].qty} — $${(cart[n].price * cart[n].qty).toFixed(2)}`
            ).join('<br>')}
            <br><strong>Estimated Total:</strong> $${total.toFixed(2)}<br>
            <strong>Pickup:</strong> ${dateFormatted} at ${time}<br>
            <strong>Payment:</strong> ${pay.charAt(0).toUpperCase() + pay.slice(1)}
            ${notes ? `<br><strong>Notes:</strong> ${notes}` : ''}
        `;

        // Show modal
        document.getElementById('successModal').classList.add('active');

        // In production: send to backend / email service here
        console.log('ORDER PLACED:', { name, phone, email, date, time, pay, cart, notes });
    });
}

// Close modal on overlay click
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
        const s = document.createElement('style');
        s.id = 'toast-style';
        s.textContent = `
            @keyframes toastIn  { from { opacity:0; transform: translateY(16px); } to { opacity:1; transform:translateY(0); } }
            @keyframes toastOut { from { opacity:1; } to { opacity:0; transform: translateY(16px); } }
        `;
        document.head.appendChild(s);
    }

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'toastOut 0.35s ease forwards';
        setTimeout(() => toast.remove(), 350);
    }, 3800);
}
