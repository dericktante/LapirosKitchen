const API = 'https://lapiros-backend.onrender.com';
const HEART = '\u2665\uFE0E';

function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function safeNumber(value) {
    const num = Number(value);
    return Number.isFinite(num) ? num : 0;
}

/* ============================================
   SITE STATUS — announcement & closed banner
   ============================================ */
async function checkSiteStatus() {
    try {
        const res = await fetch(`${API}/settings`);
        const { settings } = await res.json();
        if (!settings) return;

        if (settings.announcement) {
            const banner = document.createElement('div');
            banner.style.cssText = `background:#1a2e0f;color:white;text-align:center;padding:10px 20px;font-size:0.88rem;font-weight:500;position:relative;z-index:999;`;
            const text = document.createElement('span');
            text.textContent = `📢 ${settings.announcement}`;
            const dismissBtn = document.createElement('button');
            dismissBtn.type = 'button';
            dismissBtn.textContent = '✕';
            dismissBtn.style.cssText = 'background:none;border:none;color:rgba(255,255,255,0.6);cursor:pointer;margin-left:12px;font-size:1rem;';
            dismissBtn.addEventListener('click', () => banner.remove());
            banner.append(text, dismissBtn);
            document.body.insertBefore(banner, document.body.firstChild);
        }

        if (settings.closed) {
            const banner = document.createElement('div');
            banner.style.cssText = `background:#e53e3e;color:white;text-align:center;padding:12px 20px;font-size:0.92rem;font-weight:600;position:relative;z-index:999;`;
            banner.textContent = `🔴 We're not taking orders right now — check back soon!`;
            document.body.insertBefore(banner, document.body.firstChild);
            document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
                btn.disabled = true;
                btn.style.cssText += 'opacity:0.5;cursor:not-allowed;';
                btn.textContent = 'Unavailable';
            });
        }
    } catch (err) {}
}
checkSiteStatus();

/* ============================================
   NAVBAR
   ============================================ */
const navBar = document.getElementById('navBar');
if (navBar) {
    window.addEventListener('scroll', () => navBar.classList.toggle('scrolled', window.scrollY > 20));
}

const navToggleBtn = document.getElementById('navToggleBtn');
const navMenuList  = document.getElementById('navMenuList');
if (navToggleBtn && navMenuList) {
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
    document.addEventListener('click', (e) => {
        if (navMenuList.classList.contains('active') && !navBar.contains(e.target)) {
            navMenuList.classList.remove('active');
            navToggleBtn.setAttribute('aria-expanded', 'false');
        }
    });
}

/* ============================================
   SMOOTH SCROLL
   ============================================ */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            e.preventDefault();
            window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 90, behavior: 'smooth' });
        }
    });
});

/* ============================================
   TOAST
   ============================================ */
function showToast(msg, type = 'success') {
    document.querySelector('.toast')?.remove();
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    const icon = document.createElement('span');
    icon.textContent = type === 'success' ? '✅' : '⚠️';
    const text = document.createElement('span');
    text.textContent = msg;
    toast.append(icon, text);
    Object.assign(toast.style, {
        position: 'fixed', bottom: '28px', right: '24px',
        background: type === 'success' ? '#2d5016' : '#b8860b',
        color: '#fff', padding: '14px 20px', borderRadius: '10px',
        display: 'flex', alignItems: 'center', gap: '10px',
        fontSize: '0.9rem', fontFamily: "'DM Sans', sans-serif",
        fontWeight: '500', boxShadow: '0 8px 30px rgba(0,0,0,0.25)',
        zIndex: '99999', maxWidth: '380px', animation: 'toastIn 0.4s ease'
    });
    if (!document.getElementById('toast-style')) {
        const s = document.createElement('style');
        s.id = 'toast-style';
        s.textContent = `@keyframes toastIn{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}@keyframes toastOut{from{opacity:1}to{opacity:0;transform:translateY(16px)}}`;
        document.head.appendChild(s);
    }
    document.body.appendChild(toast);
    setTimeout(() => { toast.style.animation = 'toastOut 0.35s ease forwards'; setTimeout(() => toast.remove(), 350); }, 3800);
}

/* ============================================
   CONTACT FORM
   ============================================ */
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const { name, phone, email, message } = Object.fromEntries(
            ['name','phone','email','message'].map(id => [id, document.getElementById(id).value.trim()])
        );

        if (!name || !message) {
            showToast('Please enter your name and message.', 'warning');
            return;
        }

        if (!phone && !email) {
            showToast('Please provide either a phone number or an email.', 'warning');
            return;
        }

        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            showToast('Please enter a valid email address.', 'warning');
            return;
        }

        try {
            const res = await fetch(`${API}/contact`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, phone, email, message })
            });
            const data = await res.json();
            if (data.message === 'Message received!') {
                showToast(`Thank you, ${name}! We'll get back to you shortly.`);
                contactForm.reset();
            } else {
                showToast('Something went wrong. Please try again.', 'warning');
            }
        } catch { showToast('Could not connect to server.', 'warning'); }
    });
}

/* ============================================
   REVIEW FORM
   ============================================ */
const reviewForm = document.getElementById('reviewForm');
if (reviewForm) {
    reviewForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name    = document.getElementById('reviewName').value.trim();
        const email   = document.getElementById('reviewEmail').value.trim();
        const rating  = document.getElementById('rating').value;
        const review  = document.getElementById('reviewMessage').value.trim();

        if (!name || !rating || !review) {
            showToast('Please complete name, rating, and review message.', 'warning');
            return;
        }

        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            showToast('Please enter a valid email address.', 'warning');
            return;
        }

        try {
            const res = await fetch(`${API}/review`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, rating, review })
            });
            const data = await res.json();
            if (data.message === 'Review submitted!') {
                showToast(`Thank you, ${name}! Your ${rating}★ review has been submitted.`);
                reviewForm.reset();
            } else {
                showToast('Something went wrong. Please try again.', 'warning');
            }
        } catch { showToast('Could not connect to server.', 'warning'); }
    });
}

/* ============================================
   MENU — load dishes
   ============================================ */
const menuItemsEl = document.getElementById('menuItems');
if (menuItemsEl) {
    fetch(`${API}/dishes`)
        .then(res => res.json())
        .then(({ dishes = [] }) => {
            if (!dishes.length) {
                menuItemsEl.innerHTML = `<p style="text-align:center;color:var(--text-muted);">No dishes available right now.</p>`;
                return;
            }
            menuItemsEl.innerHTML = dishes.map(dish => `
                <div class="menu-item" data-name="${escapeHtml(dish.name)}" data-price="${safeNumber(dish.price)}">
                    <button class="wishlist-btn" type="button" aria-label="Add to Wishlist">${HEART}</button>
                    ${dish.image_url
                        ? `<div class="menu-item-image"><img src="${dish.image_url.startsWith('http') ? dish.image_url : 'https://lapiros-kitchen.vercel.app/' + dish.image_url}" alt="${escapeHtml(dish.name)}" loading="lazy"></div>`
                        : `<div class="menu-item-image menu-item-no-image">🍽️</div>`}
                    <h4 class="item-name">${escapeHtml(dish.name)}</h4>
                    <div class="item-price">$${safeNumber(dish.price)}</div>
                    <div class="item-controls">
                        <div class="qty-control">
                            <button class="qty-btn minus" type="button">−</button>
                            <span class="qty-val">1</span>
                            <button class="qty-btn plus" type="button">+</button>
                        </div>
                        <button class="add-to-cart-btn" type="button">Add to Cart</button>
                    </div>
                </div>
            `).join('');
            initCart();
            initWishlist();
        })
        .catch(() => {
            menuItemsEl.innerHTML = `<p style="text-align:center;color:var(--text-muted);">Could not load dishes right now.</p>`;
        });
}

/* ============================================
   MENU SEARCH
   ============================================ */
const menuSearch = document.getElementById('menuSearch');
if (menuSearch) {
    menuSearch.addEventListener('input', () => {
        const term = menuSearch.value.toLowerCase();
        document.querySelectorAll('.menu-item').forEach(item => {
            item.style.display = item.textContent.toLowerCase().includes(term) ? 'flex' : 'none';
        });
    });
}

/* ============================================
   CART
   ============================================ */
let cart = {};
const CART_STORAGE_KEY = 'cart';

const cartBtn       = document.getElementById('cartBtn');
const cartSidebar   = document.getElementById('cartSidebar');
const cartOverlay   = document.getElementById('cartOverlay');
const cartClose     = document.getElementById('cartClose');
const cartEmpty     = document.getElementById('cartEmpty');
const cartFooter    = document.getElementById('cartFooter');
const cartItemsEl   = document.getElementById('cartItems');
const cartCountEl   = document.getElementById('cartCount');
const cartSubtotalEl = document.getElementById('cartSubtotal');
const placeOrderBtn = document.getElementById('placeOrderBtn');
const wishlistBtn   = document.getElementById('wishlistBtn');
const wishlistSidebar = document.getElementById('wishlistSidebar');
const wishlistClose = document.getElementById('wishlistClose');
const wishlistItemsEl = document.getElementById('wishlistItems');
const wishlistCountEl = document.getElementById('wishlistCount');
const custPickupInput = document.getElementById('custPickup');
let wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');

try {
    const savedCart = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || '{}');
    if (savedCart && typeof savedCart === 'object') {
        cart = savedCart;
    }
} catch {
    cart = {};
}

// Pickup datetime input
if (custPickupInput) {
    const showPicker = () => {
        custPickupInput.type = 'datetime-local';
        try { custPickupInput.showPicker?.(); } catch {}
    };
    const restorePlaceholder = () => { if (!custPickupInput.value) custPickupInput.type = 'text'; };
    custPickupInput.addEventListener('focus', showPicker);
    custPickupInput.addEventListener('blur', restorePlaceholder);
    restorePlaceholder();
}

// Open/close cart
if (cartBtn) {
    cartBtn.addEventListener('click', () => {
        if (cartSidebar?.classList.contains('active')) { closeCart(); return; }
        wishlistSidebar?.classList.remove('active');
        cartSidebar?.classList.add('active');
        cartOverlay?.classList.add('active');
    });
}

if (wishlistBtn) {
    wishlistBtn.addEventListener('click', () => {
        if (wishlistSidebar?.classList.contains('active')) { closeWishlist(); return; }
        cartSidebar?.classList.remove('active');
        wishlistSidebar?.classList.add('active');
        cartOverlay?.classList.add('active');
    });
}

cartClose?.addEventListener('click', closeCart);
wishlistClose?.addEventListener('click', closeWishlist);
cartOverlay?.addEventListener('click', closePanels);
document.addEventListener('keydown', e => { if (e.key === 'Escape') closePanels(); });

function closeCart() {
    cartSidebar?.classList.remove('active');
    if (!wishlistSidebar?.classList.contains('active')) cartOverlay?.classList.remove('active');
}
function closeWishlist() {
    wishlistSidebar?.classList.remove('active');
    if (!cartSidebar?.classList.contains('active')) cartOverlay?.classList.remove('active');
}
function closePanels() { closeCart(); closeWishlist(); }

function initCart() {
    document.querySelectorAll('.menu-item').forEach(item => {
        const name  = item.dataset.name;
        const price = parseFloat(item.dataset.price);
        const addBtn  = item.querySelector('.add-to-cart-btn');
        const minus   = item.querySelector('.qty-btn.minus');
        const plus    = item.querySelector('.qty-btn.plus');
        const qtyVal  = item.querySelector('.qty-val');
        let qty = 1;

        minus?.addEventListener('click', () => { if (qty > 1) { qty--; qtyVal.textContent = qty; } });
        plus?.addEventListener('click',  () => { qty++; qtyVal.textContent = qty; });
        addBtn?.addEventListener('click', () => {
            const isFirst = Object.keys(cart).length === 0;
            cart[name] ? cart[name].qty += qty : (cart[name] = { price, qty });
            updateCart();
            if (isFirst) { cartSidebar?.classList.add('active'); cartOverlay?.classList.add('active'); }
            qty = 1; qtyVal.textContent = 1;
        });
    });
}

function updateCart() {
    if (!cartItemsEl) return;
    const keys     = Object.keys(cart);
    const total    = keys.reduce((a, k) => a + cart[k].price * cart[k].qty, 0);
    const totalQty = keys.reduce((a, k) => a + cart[k].qty, 0);

    if (cartCountEl)    cartCountEl.textContent    = totalQty;
    if (cartEmpty)      cartEmpty.style.display     = keys.length ? 'none' : '';
    if (cartFooter)     cartFooter.classList.toggle('hidden-initial', !keys.length);
    if (cartSubtotalEl) cartSubtotalEl.textContent  = `$${total.toFixed(2)}`;

    cartItemsEl.innerHTML = keys.length === 0
        ? `<div class="cart-empty"><p>🛒 Your cart is empty</p><p>Add some dishes to get started!</p></div>`
        : keys.map(name => `
            <div class="cart-line">
                <span class="cart-line-name">${escapeHtml(name)}</span>
                <span class="cart-line-qty">×${cart[name].qty}</span>
                <span class="cart-line-price">$${(cart[name].price * cart[name].qty).toFixed(2)}</span>
                <button class="cart-line-remove" type="button" data-name="${escapeHtml(name)}">✕</button>
            </div>
        `).join('');

    cartItemsEl.querySelectorAll('.cart-line-remove').forEach(btn => {
        btn.addEventListener('click', () => { delete cart[btn.dataset.name]; updateCart(); });
    });

    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
}

updateCart();

/* ============================================
   WISHLIST
   ============================================ */
function initWishlist() {
    wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    renderWishlist();
    document.querySelectorAll('.wishlist-btn').forEach(btn => {
        const name = btn.closest('.menu-item').dataset.name;
        btn.classList.toggle('active', wishlist.includes(name));
        btn.addEventListener('click', () => {
            if (wishlist.includes(name)) {
                wishlist = wishlist.filter(n => n !== name);
                btn.classList.remove('active');
                showToast('Removed from Wishlist', 'warning');
            } else {
                wishlist.push(name);
                btn.classList.add('active');
                showToast('Added to Wishlist');
            }
            localStorage.setItem('wishlist', JSON.stringify(wishlist));
            renderWishlist();
        });
    });
}

function renderWishlist() {
    if (!wishlistItemsEl) return;
    if (wishlistCountEl) wishlistCountEl.textContent = wishlist.length;
    if (!wishlist.length) {
        wishlistItemsEl.innerHTML = `<div class="wishlist-empty"><p>♥ Your wishlist is empty</p><p>Tap the heart on dishes you love.</p></div>`;
        return;
    }
    wishlistItemsEl.innerHTML = wishlist.map(name => {
        const card  = document.querySelector(`.menu-item[data-name="${CSS.escape(name)}"]`);
        const price = card ? parseFloat(card.dataset.price) : null;
        return `
            <div class="wishlist-line" data-name="${escapeHtml(name)}">
                <div class="wishlist-line-meta">
                    <span class="wishlist-line-name">${escapeHtml(name)}</span>
                    <span class="wishlist-line-price">${price !== null ? `$${price.toFixed(2)}` : 'See menu'}</span>
                </div>
                <div class="wishlist-line-actions">
                    <button class="wishlist-line-add" data-name="${escapeHtml(name)}">Add to Cart</button>
                    <button class="wishlist-line-remove" data-name="${escapeHtml(name)}">✕</button>
                </div>
            </div>`;
    }).join('');

    wishlistItemsEl.querySelectorAll('.wishlist-line-remove').forEach(btn => {
        btn.addEventListener('click', () => {
            wishlist = wishlist.filter(n => n !== btn.dataset.name);
            localStorage.setItem('wishlist', JSON.stringify(wishlist));
            document.querySelector(`.menu-item[data-name="${CSS.escape(btn.dataset.name)}"] .wishlist-btn`)?.classList.remove('active');
            showToast('Removed from Wishlist', 'warning');
            renderWishlist();
        });
    });
    wishlistItemsEl.querySelectorAll('.wishlist-line-add').forEach(btn => {
        btn.addEventListener('click', () => {
            const card = document.querySelector(`.menu-item[data-name="${CSS.escape(btn.dataset.name)}"]`);
            if (!card) { showToast('Dish not found in menu.', 'warning'); return; }
            const price = parseFloat(card.dataset.price);
            cart[btn.dataset.name] ? cart[btn.dataset.name].qty++ : (cart[btn.dataset.name] = { price, qty: 1 });
            updateCart();
            showToast('Added to Cart from Wishlist');
        });
    });
}

/* ============================================
   PLACE ORDER
   ============================================ */
if (placeOrderBtn) {
    placeOrderBtn.addEventListener('click', async () => {
        const name    = document.getElementById('custName').value.trim();
        const phone   = document.getElementById('custPhone').value.trim();
        const email   = document.getElementById('custEmail').value.trim();
        const pickup  = document.getElementById('custPickup').value.trim();
        const message = document.getElementById('custMessage').value.trim();

        if (!name || !phone || !email) {
            showToast('Please enter your name, phone, and email.', 'warning'); return;
        }
        if (!Object.keys(cart).length) {
            showToast('Your cart is empty!', 'warning'); return;
        }

        try {
            const res = await fetch(`${API}/order`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customerName: name, phone, email, pickup, message,
                    items: Object.keys(cart).map(n => ({ dish: n, quantity: cart[n].qty, price: cart[n].price })),
                    total: Object.keys(cart).reduce((a, n) => a + cart[n].price * cart[n].qty, 0)
                })
            });
            const data = await res.json();
            if (data.message === 'Order placed successfully!') {
                cart = {}; updateCart(); closeCart();
                showToast('Order placed! We will contact you shortly.');
            } else {
                showToast('Something went wrong. Please try again.', 'warning');
            }
        } catch { showToast('Could not connect to server.', 'warning'); }
    });
}

/* ============================================
   HOMEPAGE — today's menu
   ============================================ */
const todayMenuGrid = document.getElementById('todayMenuGrid');
if (todayMenuGrid) {
    fetch(`${API}/today`)
        .then(res => res.json())
        .then(({ dishes = [] }) => {
            if (!dishes.length) {
                todayMenuGrid.innerHTML = `
                    <div style="grid-column:1/-1;text-align:center;padding:48px 20px;color:var(--text-muted);">
                        <div style="font-size:2.5rem;margin-bottom:12px;">🌅</div>
                        <p style="font-size:1rem;">Nothing cooking today yet — check back soon!</p>
                        <p style="font-size:0.88rem;margin-top:8px;">Follow us on WhatsApp or Snapchat for daily updates.</p>
                    </div>`;
                return;
            }
            todayMenuGrid.innerHTML = dishes.map(dish => `
                <div class="menu-item ${dish.sold_out ? 'menu-item-sold-out' : ''}" data-name="${escapeHtml(dish.name)}" data-price="${safeNumber(dish.price)}">
                    <div style="position:relative; width:100%;">
                        ${dish.image_url
                            ? `<div class="menu-item-image"><img src="${dish.image_url.startsWith('http') ? dish.image_url : 'https://lapiros-kitchen.vercel.app/' + dish.image_url}" alt="${escapeHtml(dish.name)}" loading="lazy"></div>`
                            : `<div class="menu-item-image menu-item-no-image">🍽️</div>`}
                        ${dish.sold_out ? `<div style="position:absolute;top:8px;left:8px;background:rgba(229,62,62,0.9);color:white;font-size:0.72rem;font-weight:700;padding:3px 10px;border-radius:20px;">Sold Out</div>` : ''}
                    </div>
                    <h4 class="item-name">${escapeHtml(dish.name)}</h4>
                    <div class="item-price">$${safeNumber(dish.price)}</div>
                    ${dish.sold_out
                        ? `<a href="menu.html#full" class="btn btn-outline-dark today-menu-cta" style="margin-top:8px;font-size:0.85rem;">See Full Menu</a>`
                        : `<a href="menu.html#today" class="btn btn-green today-menu-cta" style="margin-top:8px;font-size:0.85rem;">Order Now</a>`}
                </div>
            `).join('');
        })
        .catch(() => {
            todayMenuGrid.innerHTML = `<div style="grid-column:1/-1;text-align:center;color:var(--text-muted);padding:40px;">Could not load today's menu.</div>`;
        });
}

/* ============================================
   MENU PAGE — tabs
   ============================================ */
function switchMenuTab(tab, updateHash = true) {
    const tabTodayEl = document.getElementById('tabToday');
    const tabFullEl = document.getElementById('tabFull');
    const todayContentEl = document.getElementById('todayTabContent');
    const fullContentEl = document.getElementById('fullTabContent');
    if (!tabTodayEl || !tabFullEl || !todayContentEl || !fullContentEl) return;

    const safeTab = tab === 'full' ? 'full' : 'today';
    tabTodayEl.classList.toggle('active', safeTab === 'today');
    tabFullEl.classList.toggle('active', safeTab === 'full');
    todayContentEl.classList.toggle('hidden-initial', safeTab !== 'today');
    fullContentEl.classList.toggle('hidden-initial', safeTab !== 'full');
    todayContentEl.style.display = safeTab === 'today' ? '' : 'none';
    fullContentEl.style.display  = safeTab === 'full'  ? '' : 'none';

    if (updateHash) {
        const newHash = safeTab === 'full' ? '#full' : '#today';
        if (window.location.hash !== newHash) {
            history.replaceState(null, '', `${window.location.pathname}${window.location.search}${newHash}`);
        }
    }
}

const tabTodayBtn = document.getElementById('tabToday');
const tabFullBtn = document.getElementById('tabFull');
if (tabTodayBtn && tabFullBtn) {
    switchMenuTab(window.location.hash === '#today' ? 'today' : 'full', false);

    window.addEventListener('hashchange', () => {
        switchMenuTab(window.location.hash === '#today' ? 'today' : 'full', false);
    });
}

const todayItemsEl = document.getElementById('todayItems');
if (todayItemsEl) {
    fetch(`${API}/today`)
        .then(res => res.json())
        .then(({ dishes = [] }) => {
            if (!dishes.length) {
                todayItemsEl.innerHTML = `
                    <div class="menu-empty-state" style="padding:60px 20px;color:var(--text-muted);">
                        <div style="font-size:3rem;margin-bottom:16px;">🌅</div>
                        <p style="font-size:1rem;">Nothing on today's menu yet.</p>
                        <p style="font-size:0.88rem;margin-top:8px;">Check the Full Menu tab to browse everything we offer.</p>
                    </div>`;
                return;
            }
            todayItemsEl.innerHTML = dishes.map(dish => `
                <div class="menu-item ${dish.sold_out ? 'menu-item-sold-out' : ''}" data-name="${escapeHtml(dish.name)}" data-price="${safeNumber(dish.price)}">
                    ${dish.sold_out ? '' : `<button class="wishlist-btn" type="button" aria-label="Add to Wishlist">${HEART}</button>`}
                    <div style="position:relative; width:100%;">
                        ${dish.image_url
                            ? `<div class="menu-item-image"><img src="${dish.image_url.startsWith('http') ? dish.image_url : 'https://lapiros-kitchen.vercel.app/' + dish.image_url}" alt="${escapeHtml(dish.name)}" loading="lazy"></div>`
                            : `<div class="menu-item-image menu-item-no-image">🍽️</div>`}
                        ${dish.sold_out ? `<div style="position:absolute;top:8px;left:8px;background:rgba(229,62,62,0.9);color:white;font-size:0.72rem;font-weight:700;padding:3px 10px;border-radius:20px;">Sold Out</div>` : ''}
                    </div>
                    <h4 class="item-name">${escapeHtml(dish.name)}</h4>
                    <div class="item-price">$${safeNumber(dish.price)}</div>
                    ${dish.sold_out ? '' : `
                    <div class="item-controls">
                        <div class="qty-control">
                            <button class="qty-btn minus" type="button">−</button>
                            <span class="qty-val">1</span>
                            <button class="qty-btn plus" type="button">+</button>
                        </div>
                        <button class="add-to-cart-btn" type="button">Add to Cart</button>
                    </div>`}
                </div>
            `).join('');
            initCart();
            initWishlist();
        })
        .catch(() => {
            todayItemsEl.innerHTML = `<p class="menu-empty-state" style="color:var(--text-muted);padding:40px 20px;">Could not load today's menu.</p>`;
        });
}


const reviewsGrid = document.getElementById('reviewsGrid');
if (reviewsGrid) {
    fetch(`${API}/reviews`)
        .then(res => res.json())
        .then(({ reviews = [] }) => {
            reviewsGrid.innerHTML = reviews.length
                ? reviews.map(rev => `
                    <div class="review-card">
                        <div class="review-stars">${safeNumber(rev.rating)} out of 5 stars</div>
                        <p class="review-text">"${escapeHtml(rev.review)}"</p>
                        <div class="review-author">— ${escapeHtml(rev.name)}</div>
                        <div class="review-date">${new Date(rev.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</div>
                    </div>`).join('')
                : `<div class="reviews-empty">No reviews yet — be the first to leave one!</div>`;
        })
        .catch(() => {
            reviewsGrid.innerHTML = `<div class="reviews-empty">Could not load reviews right now.</div>`;
        });
}