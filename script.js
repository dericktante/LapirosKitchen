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
    navToggleBtn.setAttribute('aria-controls', 'navMenuList');
    navToggleBtn.setAttribute('aria-expanded', 'false');

    navToggleBtn.addEventListener('click', () => {
        navMenuList.classList.toggle('active');
        navToggleBtn.setAttribute('aria-expanded', navMenuList.classList.contains('active'));
    });

    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.addEventListener('click', () => {
            navMenuList.classList.remove('active');
            navToggleBtn.setAttribute('aria-expanded', 'false');
        });
    });
    // Only close menu on outside click if menu is open
    document.addEventListener('click', (e) => {
        if (navMenuList.classList.contains('active') && !navBar.contains(e.target)) {
            navMenuList.classList.remove('active');
            navToggleBtn.setAttribute('aria-expanded', 'false');
        }
    });
}

// ---- SCROLL REVEAL ANIMATION — index.html, menu.html ----
// Scroll reveal animation removed as requested.

// ---- SMOOTH SCROLL FOR ANCHOR LINKS — all pages ----
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
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
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('name').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const email = document.getElementById('email').value.trim();
        const message = document.getElementById('message').value.trim();

        try {
            const response = await fetch('https://lapiros-backend.onrender.com/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, phone, email, message })
            });

            const data = await response.json();

            if (data.message === 'Message received!') {
                showToast(`Thank you, ${name}! We'll get back to you shortly.`, 'success');
                contactForm.reset();
            } else {
                showToast('Something went wrong. Please try again.', 'warning');
            }
        } catch (err) {
            console.error('Contact form error:', err);
            showToast('Could not connect to server. Please try again.', 'warning');
        }
    });
}

// ---- REVIEW FORM ----
const reviewForm = document.getElementById('reviewForm');
if (reviewForm) {
    reviewForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('reviewName').value.trim();
        const email = document.getElementById('reviewEmail').value.trim();
        const rating = document.getElementById('rating').value;
        const review = document.getElementById('reviewMessage').value.trim();

        try {
            const response = await fetch('https://lapiros-backend.onrender.com/review', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, rating, review })
            });

            const data = await response.json();

            if (data.message === 'Review submitted!') {
                showToast(`Thank you, ${name}! Your ${rating}★ review has been submitted.`, 'success');
                reviewForm.reset();
            } else {
                showToast('Something went wrong. Please try again.', 'warning');
            }
        } catch (err) {
            console.error('Review form error:', err);
            showToast('Could not connect to server. Please try again.', 'warning');
        }
    });
}


/* ============================================
   menu.html
   ============================================ */

// ---- LOAD DISHES FROM DATABASE ----
const menuItemsEl = document.getElementById('menuItems');
const HEART_SYMBOL = '\u2665\uFE0E';

if (menuItemsEl) {
    fetch('https://lapiros-backend.onrender.com/dishes')
        .then(res => res.json())
        .then(data => {
            const dishes = data.dishes || [];

            if (dishes.length === 0) {
                menuItemsEl.innerHTML = `<p style="text-align:center;color:var(--text-muted);">No dishes available right now.</p>`;
                return;
            }

            menuItemsEl.innerHTML = dishes.map(dish => `
                <div class="menu-item" data-name="${dish.name}" data-price="${dish.price}">
                    <button class="wishlist-btn" type="button" aria-label="Add to wishlist">${HEART_SYMBOL}</button>
                    ${dish.image_url ? `<div class="menu-item-image"><img src="${dish.image_url.startsWith('http') ? dish.image_url : 'https://lapiros-kitchen.vercel.app/' + dish.image_url}" alt="${dish.name}" loading="lazy"></div>` : `<div class="menu-item-image menu-item-no-image">🍽️</div>`}
                    <h4 class="item-name">${dish.name}</h4>
                    <div class="item-price">$${dish.price}</div>
                    <div class="item-controls">
                        <div class="qty-control">
                            <button class="qty-btn minus" type="button" aria-label="Decrease quantity">−</button>
                            <span class="qty-val">1</span>
                            <button class="qty-btn plus" type="button" aria-label="Increase quantity">+</button>
                        </div>
                        <button class="add-to-cart-btn" type="button">Add to Cart</button>
                    </div>
                </div>
            `).join('');

            // Reinitialise cart buttons and wishlist after dynamic render
            initCart();
            initWishlist();
        })
        .catch(err => {
            console.error('Error loading dishes:', err);
            menuItemsEl.innerHTML = `<p style="text-align:center;color:var(--text-muted);">Could not load dishes right now.</p>`;
        });
}

// ---- MENU SEARCH ----
const menuSearch = document.getElementById('menuSearch');
if (menuSearch) {
    menuSearch.addEventListener("input", () => {
        const searchTerm = menuSearch.value.toLowerCase();
        const menuItems = document.querySelectorAll(".menu-item");
        menuItems.forEach(item => {
            const text = item.textContent.toLowerCase();
            item.style.display = text.includes(searchTerm) ? "flex" : "none";
        });
    });
}

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

/* ============================================
   menu.html — CART & WISHLIST
   ============================================ */

// ---- CART STATE ----
let cart = {}; // { "Dish Name": { price, qty } }

// ---- CART ELEMENTS ----
const cartBtn = document.getElementById('cartBtn');
const cartSidebar = document.getElementById('cartSidebar');
const cartOverlay = document.getElementById('cartOverlay');
const cartClose = document.getElementById('cartClose');
const cartEmpty = document.getElementById('cartEmpty');
const cartFooter = document.getElementById('cartFooter');
const cartItemsEl = document.getElementById('cartItems');
const cartCountEl = document.getElementById('cartCount');
const cartSubtotalEl = document.getElementById('cartSubtotal');
const placeOrderBtn = document.getElementById('placeOrderBtn');
const wishlistBtn = document.getElementById('wishlistBtn');
const wishlistSidebar = document.getElementById('wishlistSidebar');
const wishlistClose = document.getElementById('wishlistClose');
const wishlistItemsEl = document.getElementById('wishlistItems');
const wishlistCountEl = document.getElementById('wishlistCount');
const custPickupInput = document.getElementById('custPickup');
let wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');

if (custPickupInput) {
    const showDateTimePicker = () => {
        if (custPickupInput.type !== 'datetime-local') {
            custPickupInput.type = 'datetime-local';
        }

        if (typeof custPickupInput.showPicker === 'function') {
            try {
                custPickupInput.showPicker();
            } catch (_error) {
                // showPicker may throw when not triggered by a trusted user interaction.
            }
        }
    };

    const restorePlaceholderIfEmpty = () => {
        if (!custPickupInput.value) {
            custPickupInput.type = 'text';
        }
    };

    custPickupInput.addEventListener('focus', showDateTimePicker);
    custPickupInput.addEventListener('blur', restorePlaceholderIfEmpty);

    // Keep a native date input only when a value exists.
    restorePlaceholderIfEmpty();
}

// ---- OPEN/CLOSE CART ----
if (cartBtn) {
    cartBtn.setAttribute('aria-expanded', 'false');

    cartBtn.addEventListener('click', () => {
        if (cartSidebar && cartSidebar.classList.contains('active')) {
            closeCart();
            return;
        }

        if (wishlistSidebar) wishlistSidebar.classList.remove('active');
        if (wishlistBtn) wishlistBtn.setAttribute('aria-expanded', 'false');
        if (cartSidebar) cartSidebar.classList.add('active');
        if (cartBtn) cartBtn.setAttribute('aria-expanded', 'true');
        if (cartOverlay) cartOverlay.classList.add('active');
    });
}

if (wishlistBtn) {
    wishlistBtn.setAttribute('aria-expanded', 'false');

    wishlistBtn.addEventListener('click', () => {
        if (wishlistSidebar && wishlistSidebar.classList.contains('active')) {
            closeWishlist();
            return;
        }

        if (cartSidebar) cartSidebar.classList.remove('active');
        if (cartBtn) cartBtn.setAttribute('aria-expanded', 'false');
        if (wishlistSidebar) wishlistSidebar.classList.add('active');
        if (wishlistBtn) wishlistBtn.setAttribute('aria-expanded', 'true');
        if (cartOverlay) cartOverlay.classList.add('active');
    });
}

if (cartClose) {
    cartClose.addEventListener('click', closeCart);
}

if (wishlistClose) {
    wishlistClose.addEventListener('click', closeWishlist);
}

if (cartOverlay) {
    cartOverlay.addEventListener('click', closePanels);
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closePanels();
    }
});

function closeCart() {
    cartSidebar.classList.remove('active');
    if (cartBtn) cartBtn.setAttribute('aria-expanded', 'false');
    if (!wishlistSidebar || !wishlistSidebar.classList.contains('active')) {
        cartOverlay.classList.remove('active');
    }
}

function closeWishlist() {
    if (wishlistSidebar) wishlistSidebar.classList.remove('active');
    if (wishlistBtn) wishlistBtn.setAttribute('aria-expanded', 'false');
    if (!cartSidebar || !cartSidebar.classList.contains('active')) {
        cartOverlay.classList.remove('active');
    }
}

function closePanels() {
    closeCart();
    closeWishlist();
}

// ---- ADD TO CART ----
function initCart() {
    document.querySelectorAll('.menu-item').forEach(item => {
        const name = item.dataset.name;
        const price = parseFloat(item.dataset.price);
        const addBtn = item.querySelector('.add-to-cart-btn');
        const minusBtn = item.querySelector('.qty-btn.minus');
        const plusBtn = item.querySelector('.qty-btn.plus');
        const qtyVal = item.querySelector('.qty-val');

        let qty = 1;

        if (minusBtn) {
            minusBtn.addEventListener('click', () => {
                if (qty > 1) {
                    qty--;
                    qtyVal.textContent = qty;
                }
            });
        }

        if (plusBtn) {
            plusBtn.addEventListener('click', () => {
                qty++;
                qtyVal.textContent = qty;
            });
        }

        if (addBtn) {
            addBtn.addEventListener('click', () => {
                const isFirstItem = Object.keys(cart).length === 0;
                if (cart[name]) {
                    cart[name].qty += qty;
                } else {
                    cart[name] = { price, qty };
                }
                updateCart();
                // Only open cart on first item added
                if (isFirstItem) {
                    cartSidebar.classList.add('active');
                    cartOverlay.classList.add('active');
                }
                // Reset qty
                qty = 1;
                qtyVal.textContent = 1;
            });
        }
    })
};

// ---- UPDATE CART UI ----
function updateCart() {
    if (!cartItemsEl) return;

    const cartKeys = Object.keys(cart);
    const totalItems = cartKeys.reduce((acc, k) => acc + cart[k].qty, 0);
    const subtotal = cartKeys.reduce((acc, k) => acc + cart[k].price * cart[k].qty, 0);

    // Update count badge
    if (cartCountEl) cartCountEl.textContent = totalItems;

    // Toggle empty/footer
    if (cartEmpty) cartEmpty.style.display = cartKeys.length === 0 ? '' : 'none';
    if (cartFooter) cartFooter.style.display = cartKeys.length === 0 ? 'none' : '';

    // Render cart lines
    const linesHTML = cartKeys.map(name => `
        <div class="cart-line">
            <span class="cart-line-name">${name}</span>
            <span class="cart-line-qty">×${cart[name].qty}</span>
            <span class="cart-line-price">$${(cart[name].price * cart[name].qty).toFixed(2)}</span>
            <button class="cart-line-remove" type="button" data-name="${name}" aria-label="Remove ${name} from cart">✕</button>
        </div>
    `).join('');

    cartItemsEl.innerHTML = cartKeys.length === 0
        ? `<div class="cart-empty"><p>🛒 Your cart is empty</p><p>Add some dishes to get started!</p></div>`
        : linesHTML;

    // Remove item buttons
    cartItemsEl.querySelectorAll('.cart-line-remove').forEach(btn => {
        btn.addEventListener('click', () => {
            delete cart[btn.dataset.name];
            updateCart();
        });
    });

    // Subtotal
    if (cartSubtotalEl) cartSubtotalEl.textContent = `$${subtotal.toFixed(2)}`;
}

// ---- WISHLIST ----
function initWishlist() {
    wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    renderWishlist();

    document.querySelectorAll('.wishlist-btn').forEach(btn => {
        const name = btn.closest('.menu-item').dataset.name;

        // Set initial state
        if (wishlist.includes(name)) {
            btn.textContent = HEART_SYMBOL;
            btn.classList.add('active');
        } else {
            btn.textContent = HEART_SYMBOL;
        }

        btn.addEventListener('click', () => {
            if (wishlist.includes(name)) {
                wishlist = wishlist.filter(n => n !== name);
                btn.textContent = HEART_SYMBOL;
                btn.classList.remove('active');
                showToast('Removed from Wishlist', 'warning');
            } else {
                wishlist.push(name);
                btn.textContent = HEART_SYMBOL;
                btn.classList.add('active');
                showToast('Added to Wishlist', 'success');
            }
            localStorage.setItem('wishlist', JSON.stringify(wishlist));
            renderWishlist();
        });
    })
};

function renderWishlist() {
    if (!wishlistItemsEl) return;

    if (wishlistCountEl) wishlistCountEl.textContent = wishlist.length;

    if (wishlist.length === 0) {
        wishlistItemsEl.innerHTML = `
            <div class="wishlist-empty">
                <p><span class="wishlist-empty-heart" aria-hidden="true">&#9829;&#65038;</span> Your wishlist is empty</p>
                <p>Tap the heart on dishes you love.</p>
            </div>
        `;
        return;
    }

    wishlistItemsEl.innerHTML = wishlist.map(name => {
        const dishCard = document.querySelector(`.menu-item[data-name="${CSS.escape(name)}"]`);
        const price = dishCard ? parseFloat(dishCard.dataset.price) : null;

        return `
            <div class="wishlist-line" data-name="${name}">
                <div class="wishlist-line-meta">
                    <span class="wishlist-line-name">${name}</span>
                    <span class="wishlist-line-price">${price !== null ? `$${price.toFixed(2)}` : 'Price available on menu'}</span>
                </div>
                <div class="wishlist-line-actions">
                    <button class="wishlist-line-add" type="button" data-name="${name}" aria-label="Add ${name} to cart">Add to cart</button>
                    <button class="wishlist-line-remove" type="button" data-name="${name}" aria-label="Remove ${name} from wishlist">✕</button>
                </div>
            </div>
        `;
    }).join('');

    wishlistItemsEl.querySelectorAll('.wishlist-line-remove').forEach(btn => {
        btn.addEventListener('click', () => {
            const name = btn.dataset.name;
            wishlist = wishlist.filter(item => item !== name);
            localStorage.setItem('wishlist', JSON.stringify(wishlist));

            const dishButton = document.querySelector(`.menu-item[data-name="${CSS.escape(name)}"] .wishlist-btn`);
            if (dishButton) {
                dishButton.textContent = HEART_SYMBOL;
                dishButton.classList.remove('active');
            }

            showToast('Removed from Wishlist', 'warning');
            renderWishlist();
        });
    });

    wishlistItemsEl.querySelectorAll('.wishlist-line-add').forEach(btn => {
        btn.addEventListener('click', () => {
            const name = btn.dataset.name;
            const dishCard = document.querySelector(`.menu-item[data-name="${CSS.escape(name)}"]`);
            if (!dishCard) {
                showToast('Dish not found in menu right now.', 'warning');
                return;
            }

            const price = parseFloat(dishCard.dataset.price);
            if (cart[name]) {
                cart[name].qty += 1;
            } else {
                cart[name] = { price, qty: 1 };
            }
            updateCart();
            showToast('Added to cart from Wishlist', 'success');
        });
    });
}

// ---- PLACE ORDER ----
if (placeOrderBtn) {
    placeOrderBtn.addEventListener('click', async () => {
        const name = document.getElementById('custName').value.trim();
        const phone = document.getElementById('custPhone').value.trim();
        const email = document.getElementById('custEmail').value.trim();
        const pickup = document.getElementById('custPickup').value.trim();
        const message = document.getElementById('custMessage').value.trim();

        if (!name || !phone || !email) {
            showToast('Please enter your name, phone number, and email address.', 'warning');
            return;
        }

        const cartKeys = Object.keys(cart);
        if (cartKeys.length === 0) {
            showToast('Your cart is empty!', 'warning');
            return;
        }

        const orderData = {
            customerName: name,
            phone: phone,
            email: email,
            pickup: pickup,
            message: message,
            items: cartKeys.map(n => ({
                dish: n,
                quantity: cart[n].qty,
                price: cart[n].price
            })),
            total: cartKeys.reduce((acc, n) => acc + cart[n].price * cart[n].qty, 0)
        }

        try {
            const response = await fetch('https://lapiros-backend.onrender.com/order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData)
            });

            const data = await response.json();

            if (data.message === 'Order placed successfully!') {
                cart = {};
                updateCart();
                closeCart();
                showToast('Order placed! We will contact you shortly.', 'success');
            } else {
                showToast('Something went wrong. Please try again.', 'warning');
            }

        } catch (err) {
            console.error('Order error:', err);
            showToast('Could not connect to server. Please try again.', 'warning');
        }
    });
}

/* ============================================
   index.html — REVIEWS
   ============================================ */

const reviewsGrid = document.getElementById('reviewsGrid');

if (reviewsGrid) {
    fetch('https://lapiros-backend.onrender.com/reviews')
        .then(res => res.json())
        .then(data => {
            const reviews = data.reviews || [];

            if (reviews.length === 0) {
                reviewsGrid.innerHTML = `<div class="reviews-empty">No reviews yet — be the first to leave one!</div>`;
                return;
            }

            reviewsGrid.innerHTML = reviews.map(rev => `
                <div class="review-card">
                    <div class="review-stars">${'⭐'.repeat(rev.rating)}</div>
                    <p class="review-text">"${rev.review}"</p>
                    <div class="review-author">— ${rev.name}</div>
                    <div class="review-date">${new Date(rev.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</div>
                </div>
            `).join('');
        })
        .catch(err => {
            console.error('Error loading reviews:', err);
            reviewsGrid.innerHTML = `<div class="reviews-empty">Could not load reviews right now.</div>`;
        });
}