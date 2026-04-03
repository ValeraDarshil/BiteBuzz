// // ================= BACKEND CONFIG =================
// const API = "http://localhost:5000/api";

// function getToken() {
//   return localStorage.getItem("token");
// }

// async function apiRequest(url, method="GET", body=null) {

//   const headers = {
//     "Content-Type": "application/json"
//   };

//   const token = getToken();

//   // ⭐ SEND TOKEN BOTH WAYS (very important)
//   if (token) {
//     headers["Authorization"] = "Bearer " + token;
//     headers["x-auth-token"] = token;
//   }

//   try {
//     const res = await fetch(API + url, {
//       method,
//       headers,
//       body: body ? JSON.stringify(body) : null
//     });

//     const data = await res.json();

//     if (res.status === 401) {
//       console.log("Auth failed:", data);
//       return { error: "Login expired" };
//     }

//     return data;

//   } catch (err) {
//     console.log(err);
//     return { error: "Server not reachable" };
//   }
// }

// /* =============================================
//    SMART CANTEEN — app.js  (complete rewrite)
//    ============================================= */
// 'use strict';

// // ═══════════════════════════════════════════════
// // CANCELLATION SYSTEM
// // ═══════════════════════════════════════════════
// const CANCEL_LIMIT       = 5;
// const CANCEL_WINDOW_DAYS = 30;
// const SUSPEND_DAYS       = 21;
// const MS_DAY             = 86400000;

// function loadCancelData() {
//   try {
//     const raw = localStorage.getItem('canteen_cancel');
//     return raw ? JSON.parse(raw) : { cancellations: [], suspendedUntil: null };
//   } catch (e) {
//     return { cancellations: [], suspendedUntil: null };
//   }
// }
// function saveCancelData(data) {
//   localStorage.setItem('canteen_cancel', JSON.stringify(data));
// }
// function cleanCancelData() {
//   const data   = loadCancelData();
//   const cutoff = Date.now() - CANCEL_WINDOW_DAYS * MS_DAY;
//   data.cancellations = data.cancellations.filter(c => c.ts > cutoff);
//   if (data.suspendedUntil && Date.now() > data.suspendedUntil && data.cancellations.length <= CANCEL_LIMIT) {
//     data.suspendedUntil = null;
//   }
//   saveCancelData(data);
//   return data;
// }
// function isSuspended() {
//   const data = cleanCancelData();
//   return !!(data.suspendedUntil && Date.now() < data.suspendedUntil);
// }
// function suspensionDaysLeft() {
//   const data = loadCancelData();
//   if (!data.suspendedUntil) return 0;
//   return Math.ceil((data.suspendedUntil - Date.now()) / MS_DAY);
// }
// function recentCancelCount() {
//   return cleanCancelData().cancellations.length;
// }
// function recordCancellation() {
//   const data = cleanCancelData();
//   data.cancellations.push({ ts: Date.now() });
//   if (data.cancellations.length > CANCEL_LIMIT) {
//     data.suspendedUntil = Date.now() + SUSPEND_DAYS * MS_DAY;
//     saveCancelData(data);
//     return { suspended: true, count: data.cancellations.length };
//   }
//   saveCancelData(data);
//   return { suspended: false, count: data.cancellations.length };
// }

// // ═══════════════════════════════════════════════
// // STATE
// // ═══════════════════════════════════════════════
// const STATE = {
//   cart:          [],
//   orders:        JSON.parse(localStorage.getItem('canteen_orders') || '[]'),
//   currentPage:   'home',
//   darkMode:      localStorage.getItem('canteen_dark') === 'true',
//   currentFilter: 'all',
//   adminLoggedIn: false,
// };

// // ═══════════════════════════════════════════════
// // MENU DATA
// // ═══════════════════════════════════════════════
// const MENU = {
//   snacks: [
//     { id:1,  name:'Samosa (2pcs)',  desc:'Crispy fried pastry stuffed with spiced potatoes',   price:20,  veg:true,  img:'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&q=80' },
//     { id:2,  name:'Veg Puff',       desc:'Flaky pastry with savory vegetable filling',          price:25,  veg:true,  img:'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&q=80' },
//     { id:3,  name:'French Fries',   desc:'Golden crispy fries with ketchup & mayo',             price:60,  veg:true,  img:'https://images.unsplash.com/photo-1576107232684-1279f390859f?w=400&q=80' },
//     { id:4,  name:'Veg Burger',     desc:'Soft bun with crispy patty, lettuce & sauce',         price:75,  veg:true,  img:'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80' },
//     { id:5,  name:'Chicken Roll',   desc:'Tasty chicken with veggies wrapped in paratha',       price:90,  veg:false, img:'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400&q=80' },
//     { id:6,  name:'Paneer Tikka',   desc:'Spiced cottage cheese grilled to perfection',         price:110, veg:true,  img:'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=400&q=80' },
//   ],
//   meals: [
//     { id:7,  name:'Veg Thali',       desc:'Dal, rice, 2 sabzi, roti, pickle & papad',           price:80,  veg:true,  img:'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&q=80' },
//     { id:8,  name:'Chicken Biryani', desc:'Aromatic basmati rice with tender chicken',           price:130, veg:false, img:'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&q=80' },
//     { id:9,  name:'Rajma Chawal',    desc:'Red kidney beans curry with steamed rice',            price:70,  veg:true,  img:'https://images.unsplash.com/photo-1631452180539-96aca7d48617?w=400&q=80' },
//     { id:10, name:'Pasta (Veg)',     desc:'Penne pasta in rich tomato-based sauce',              price:95,  veg:true,  img:'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&q=80' },
//     { id:11, name:'Egg Fried Rice',  desc:'Wok-tossed rice with scrambled eggs & veggies',      price:85,  veg:false, img:'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&q=80' },
//     { id:12, name:'Chole Bhature',   desc:'Spicy chickpeas with deep-fried fluffy bread',       price:90,  veg:true,  img:'https://images.unsplash.com/photo-1626130640464-c72e1a5bd5f2?w=400&q=80' },
//   ],
//   drinks: [
//     { id:13, name:'Masala Chai',     desc:'Aromatic spiced Indian tea with milk',               price:15,  veg:true,  img:'https://images.unsplash.com/photo-1524678714210-9917a6c619c2?w=400&q=80' },
//     { id:14, name:'Cold Coffee',     desc:'Chilled coffee blended with ice cream & milk',       price:65,  veg:true,  img:'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&q=80' },
//     { id:15, name:'Lassi (Sweet)',   desc:'Thick creamy yogurt-based sweet drink',              price:40,  veg:true,  img:'https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?w=400&q=80' },
//     { id:16, name:'Fresh Lime Soda', desc:'Refreshing chilled lime with soda water',            price:30,  veg:true,  img:'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&q=80' },
//     { id:17, name:'Mango Shake',     desc:'Thick real mango blended with cold milk',            price:70,  veg:true,  img:'https://images.unsplash.com/photo-1546039907-9291c0890434?w=400&q=80' },
//     { id:18, name:'Mineral Water',   desc:'Cool chilled packaged drinking water',               price:20,  veg:true,  img:'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&q=80' },
//   ],
// };

// const ORDER_STATUSES = ['Pending','Preparing','Ready','Out for Delivery','Delivered'];
// const STATUS_EMOJIS  = ['⏳','👨‍🍳','✅','🛵','🎉'];
// const STATUS_KEYS    = ['pending','preparing','ready','outfor','delivered'];

// // ═══════════════════════════════════════════════
// // UTILS
// // ═══════════════════════════════════════════════
// const $        = (sel, ctx = document) => ctx.querySelector(sel);
// const $$       = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
// const mkEl     = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html) e.innerHTML = html; return e; };
// const fmt      = n  => `₹${n}`;
// const saveOrders = () => localStorage.setItem('canteen_orders', JSON.stringify(STATE.orders));
// const genToken   = () => 'C' + Math.floor(1000 + Math.random() * 9000);
// const nowStr     = () => new Date().toLocaleString('en-IN', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit', hour12:true });
// const ordinal    = n  => { const v = n % 100; const s = ['th','st','nd','rd']; return s[(v-20)%10] || s[v] || s[0]; };

// function findItem(id) {
//   for (const cat of Object.values(MENU)) {
//     const f = cat.find(i => i.id === id);
//     if (f) return f;
//   }
//   return null;
// }

// // ═══════════════════════════════════════════════
// // TOAST
// // ═══════════════════════════════════════════════
// function showToast(msg, type, duration) {
//   type     = type     || 'info';
//   duration = duration || 2800;
//   const icons = { success:'✅', error:'❌', info:'🍽️' };
//   const t = mkEl('div', 'toast ' + type, '<span>' + (icons[type] || '📢') + '</span><span>' + msg + '</span>');
//   $('.toast-container').appendChild(t);
//   setTimeout(function() { t.classList.add('out'); setTimeout(function() { t.remove(); }, 300); }, duration);
// }

// // ═══════════════════════════════════════════════
// // DARK MODE
// // ═══════════════════════════════════════════════
// function applyDarkMode() {
//   document.body.classList.toggle('dark', STATE.darkMode);
//   localStorage.setItem('canteen_dark', STATE.darkMode);
// }

// // ═══════════════════════════════════════════════
// // NAVIGATION
// // ═══════════════════════════════════════════════
// function navigate(page) {
//   $$('.page').forEach(function(p) { p.classList.remove('active'); });
//   var target = $('#page-' + page);
//   if (target) { target.classList.add('active'); window.scrollTo({ top:0, behavior:'smooth' }); }
//   STATE.currentPage = page;
//   $$('.nav-links a, .mobile-nav a').forEach(function(a) { a.classList.toggle('active', a.dataset.page === page); });
//   $('.mobile-nav').classList.remove('open');
//   if (page === 'menu')   renderMenu('all');
//   if (page === 'cart')   renderCart();
//   if (page === 'status') renderStatusPage();
//   if (page === 'admin')  renderAdmin();
// }

// // ═══════════════════════════════════════════════
// // CART HELPERS
// // ═══════════════════════════════════════════════
// function getCartTotal() { return STATE.cart.reduce(function(s, i) { return s + i.price * i.qty; }, 0); }
// function getCartCount() { return STATE.cart.reduce(function(s, i) { return s + i.qty; }, 0); }

// function updateCartUI() {
//   var count = getCartCount();
//   var badge = $('.cart-count');
//   badge.textContent = count;
//   if (count > 0) { badge.classList.add('pop'); setTimeout(function() { badge.classList.remove('pop'); }, 200); }
//   var bar = $('.cart-bar');
//   if (count > 0 && STATE.currentPage === 'menu') {
//     bar.classList.add('visible');
//     bar.querySelector('.cart-bar-count').textContent = count + ' item' + (count !== 1 ? 's' : '') + ' in cart';
//     bar.querySelector('.cart-bar-total').textContent = fmt(getCartTotal());
//   } else {
//     bar.classList.remove('visible');
//   }
// }

// function addToCart(item) {
//   var ex = STATE.cart.find(function(i) { return i.id === item.id; });
//   if (ex) { ex.qty++; } else { STATE.cart.push(Object.assign({}, item, { qty: 1 })); }
//   updateCartUI();
//   showToast(item.name + ' added!', 'success', 1800);
// }

// function removeFromCart(id) {
//   var idx = STATE.cart.findIndex(function(i) { return i.id === id; });
//   if (idx === -1) return;
//   if (STATE.cart[idx].qty > 1) { STATE.cart[idx].qty--; } else { STATE.cart.splice(idx, 1); }
//   updateCartUI();
// }

// function removeItemCompletely(id) {
//   STATE.cart = STATE.cart.filter(function(i) { return i.id !== id; });
//   updateCartUI();
//   renderCart();
// }

// // ═══════════════════════════════════════════════
// // MENU RENDER
// // ═══════════════════════════════════════════════
// function renderMenu(filter) {
//   var container = $('#menu-grid-container');
//   container.innerHTML = '';
//   var cats = filter === 'all' ? Object.entries(MENU) : [[filter, MENU[filter]]];
//   var catLabels = { snacks:'🍿 Snacks', meals:'🍱 Meals', drinks:'🥤 Drinks' };

//   cats.forEach(function(entry) {
//     var catKey = entry[0];
//     var items  = entry[1];
//     var sec = mkEl('div', 'menu-category');
//     sec.innerHTML = '<div class="category-label"><span class="cat-dot"></span><h2>' + catLabels[catKey] + '</h2><span class="cat-count">' + items.length + ' items</span></div>';
//     var grid = mkEl('div', 'menu-grid');

//     items.forEach(function(item) {
//       var cartItem = STATE.cart.find(function(i) { return i.id === item.id; });
//       var qty = cartItem ? cartItem.qty : 0;
//       var card = mkEl('div', 'food-card');
//       var qtyHTML = qty === 0
//         ? '<button class="add-btn" data-id="' + item.id + '">Add +</button>'
//         : '<div class="qty-control"><button class="qty-btn minus" data-id="' + item.id + '">−</button><span class="qty-num">' + qty + '</span><button class="qty-btn plus" data-id="' + item.id + '">+</button></div>';
//       card.innerHTML =
//         '<div class="food-card-img">' +
//           '<img src="' + item.img + '" alt="' + item.name + '" loading="lazy" onerror="this.style.background=\'linear-gradient(135deg,#FF6B35,#FFB300)\';this.style.opacity=\'0.6\'">' +
//           '<div class="food-veg-badge ' + (item.veg ? 'veg' : 'non-veg') + '"></div>' +
//         '</div>' +
//         '<div class="food-card-body">' +
//           '<div class="food-card-name">' + item.name + '</div>' +
//           '<div class="food-card-desc">' + item.desc + '</div>' +
//           '<div class="food-card-footer"><div class="food-price">' + fmt(item.price) + '</div>' + qtyHTML + '</div>' +
//         '</div>';
//       grid.appendChild(card);
//     });

//     sec.appendChild(grid);
//     container.appendChild(sec);
//   });

//   $$('.add-btn').forEach(function(btn) {
//     btn.addEventListener('click', function() { addToCart(findItem(+btn.dataset.id)); renderMenu(filter); });
//   });
//   $$('.qty-btn.plus').forEach(function(btn) {
//     btn.addEventListener('click', function() { addToCart(findItem(+btn.dataset.id)); renderMenu(filter); });
//   });
//   $$('.qty-btn.minus').forEach(function(btn) {
//     btn.addEventListener('click', function() { removeFromCart(+btn.dataset.id); renderMenu(filter); });
//   });
// }

// // ═══════════════════════════════════════════════
// // CART RENDER
// // ═══════════════════════════════════════════════
// function renderCart() {
//   var cartPage  = $('#page-cart');
//   var itemsEl   = $('#cart-items');
//   var emptyEl   = $('#cart-empty');
//   var summaryEl = $('#order-summary');

//   // 1. Remove old dynamic injections
//   var old;
//   old = document.getElementById('suspension-banner');   if (old) old.remove();
//   old = document.getElementById('cancel-warning-bar');  if (old) old.remove();
//   old = document.getElementById('recent-orders-panel'); if (old) old.remove();

//   var suspended    = isSuspended();
//   var cancelCount  = recentCancelCount();
//   var cartHeader   = cartPage.querySelector('.cart-page-header');

//   // 2. Suspension / warning banner after header
//   if (suspended) {
//     var daysLeft = suspensionDaysLeft();
//     var banner = mkEl('div', 'suspension-banner');
//     banner.id = 'suspension-banner';
//     banner.innerHTML =
//       '<div class="sb-icon">🚫</div>' +
//       '<div class="sb-body">' +
//         '<div class="sb-title">Account Suspended</div>' +
//         '<div class="sb-desc">You cancelled more than <strong>' + CANCEL_LIMIT + '</strong> orders in 30 days. ' +
//         'Ordering is disabled for <strong>' + daysLeft + ' more day' + (daysLeft !== 1 ? 's' : '') + '</strong>.</div>' +
//         '<div class="sb-meta">Suspension lifts automatically. Please plan your orders carefully.</div>' +
//       '</div>' +
//       '<div class="sb-days"><div class="sb-days-num">' + daysLeft + '</div><div class="sb-days-label">day' + (daysLeft !== 1 ? 's' : '') + ' left</div></div>';
//     cartHeader.insertAdjacentElement('afterend', banner);

//   } else if (cancelCount > 0) {
//     var warnBar = mkEl('div', 'cancel-warning-bar');
//     warnBar.id = 'cancel-warning-bar';
//     warnBar.innerHTML =
//       '<span class="cw-icon">⚠️</span>' +
//       '<span class="cw-text">You have cancelled <strong>' + cancelCount + '/' + CANCEL_LIMIT + '</strong> orders in the last 30 days. ' +
//       'Exceeding <strong>' + CANCEL_LIMIT + '</strong> will suspend your account for ' + SUSPEND_DAYS + ' days.</span>';
//     cartHeader.insertAdjacentElement('afterend', warnBar);
//   }

//   // 3. Cart items
//   if (STATE.cart.length === 0) {
//     emptyEl.style.display   = 'block';
//     itemsEl.innerHTML       = '';
//     summaryEl.style.display = 'none';
//   } else {
//     emptyEl.style.display   = 'none';
//     summaryEl.style.display = 'block';
//     itemsEl.innerHTML       = '';

//     STATE.cart.forEach(function(item) {
//       var div = mkEl('div', 'cart-item');
//       div.innerHTML =
//         '<div class="cart-item-img"><img src="' + item.img + '" alt="' + item.name + '" onerror="this.style.background=\'linear-gradient(135deg,#FF6B35,#FFB300)\'"></div>' +
//         '<div class="cart-item-info">' +
//           '<div class="cart-item-name">' + item.name + '</div>' +
//           '<div class="cart-item-cat">' + (item.veg ? '🟢 Veg' : '🔴 Non-Veg') + '</div>' +
//           '<div class="cart-item-price">' + fmt(item.price) + ' × ' + item.qty + ' = ' + fmt(item.price * item.qty) + '</div>' +
//         '</div>' +
//         '<div class="cart-item-actions">' +
//           '<button class="remove-btn" data-id="' + item.id + '">🗑</button>' +
//           '<div class="qty-control">' +
//             '<button class="qty-btn minus" data-id="' + item.id + '">−</button>' +
//             '<span class="qty-num">' + item.qty + '</span>' +
//             '<button class="qty-btn plus" data-id="' + item.id + '">+</button>' +
//           '</div>' +
//         '</div>';
//       itemsEl.appendChild(div);
//     });

//     var subtotal = getCartTotal();
//     var tax      = Math.round(subtotal * 0.05);
//     $('#summary-subtotal').textContent = fmt(subtotal);
//     $('#summary-tax').textContent      = fmt(tax);
//     $('#summary-total').textContent    = fmt(subtotal + tax);

//     $$('#cart-items .qty-btn.plus').forEach(function(b)  { b.addEventListener('click', function() { addToCart(findItem(+b.dataset.id)); renderCart(); }); });
//     $$('#cart-items .qty-btn.minus').forEach(function(b) { b.addEventListener('click', function() { removeFromCart(+b.dataset.id); renderCart(); }); });
//     $$('#cart-items .remove-btn').forEach(function(b)    { b.addEventListener('click', function() { removeItemCompletely(+b.dataset.id); }); });

//     // Disable checkout if suspended
//     var checkoutBtn = $('#checkout-btn');
//     if (checkoutBtn) checkoutBtn.disabled = suspended;
//   }

//   // 4. Pending orders cancel panel
//   var pendingOrders = STATE.orders.filter(function(o) { return !o.cancelled && o.statusIdx === 0; }).slice(0, 5);
//   if (pendingOrders.length > 0) {
//     var panel = mkEl('div', 'recent-orders-panel');
//     panel.id = 'recent-orders-panel';

//     var rowsHTML = pendingOrders.map(function(order) {
//       var btnClass = suspended ? 'cancel-order-btn btn-suspended' : 'cancel-order-btn';
//       var btnAttrs = suspended ? 'disabled' : '';
//       var btnLabel = suspended ? '🚫 Suspended' : '✕ Cancel';
//       return '<div class="rop-item">' +
//         '<div class="rop-info">' +
//           '<span class="rop-token">#' + order.token + '</span>' +
//           '<span class="rop-time">' + order.time + '</span>' +
//           '<span class="status-badge pending" style="font-size:0.7rem;padding:3px 9px">⏳ Pending</span>' +
//         '</div>' +
//         '<div class="rop-right">' +
//           '<span class="rop-total">' + fmt(order.total) + '</span>' +
//           '<button class="' + btnClass + '" data-token="' + order.token + '" ' + btnAttrs + '>' + btnLabel + '</button>' +
//         '</div>' +
//       '</div>';
//     }).join('');

//     panel.innerHTML =
//       '<div class="rop-header"><span class="rop-title">🗂️ Pending Orders</span><span class="rop-sub">You can cancel a pending order below</span></div>' +
//       '<div class="rop-list">' + rowsHTML + '</div>' +
//       '<p class="rop-note">ℹ️ Only <strong>Pending</strong> orders can be cancelled. ' +
//       'More than <strong>' + CANCEL_LIMIT + '</strong> cancellations in 30 days triggers a <strong>' + SUSPEND_DAYS + '-day suspension</strong>.</p>';

//     var layout = cartPage.querySelector('.cart-layout');
//     if (layout) {
//       layout.insertAdjacentElement('afterend', panel);
//     } else {
//       cartPage.appendChild(panel);
//     }

//     panel.querySelectorAll('.cancel-order-btn:not([disabled])').forEach(function(btn) {
//       btn.addEventListener('click', function() { showCancelConfirm(btn.dataset.token); });
//     });
//   }
// }

// // ═══════════════════════════════════════════════
// // CANCEL CONFIRM MODAL
// // ═══════════════════════════════════════════════
// function showCancelConfirm(token) {
//   var old = document.getElementById('cancel-confirm-overlay');
//   if (old) old.remove();

//   var count   = recentCancelCount();
//   var willHit = (count + 1) > CANCEL_LIMIT;

//   var warnHTML = willHit
//     ? '<div class="cancel-warn-box"><span>🚨</span><span>This is your <strong>' + (count + 1) + ordinal(count + 1) + '</strong> cancellation — account will be <strong>suspended for ' + SUSPEND_DAYS + ' days</strong> immediately!</span></div>'
//     : '<div class="cancel-info-box"><span>⚠️</span><span>After this: <strong>' + (count + 1) + '/' + CANCEL_LIMIT + '</strong> cancellations in 30 days.</span></div>';

//   var overlay = mkEl('div', 'modal-overlay');
//   overlay.id  = 'cancel-confirm-overlay';
//   overlay.innerHTML =
//     '<div class="confirm-modal" style="max-width:420px">' +
//       '<div class="confirm-animation" style="background:linear-gradient(135deg,#f44336,#b71c1c)">✕</div>' +
//       '<h2 class="confirm-title">Cancel Order?</h2>' +
//       '<p class="confirm-sub">You are about to cancel order <strong>#' + token + '</strong>.<br>This cannot be undone.</p>' +
//       warnHTML +
//       '<div class="confirm-actions" style="margin-top:20px">' +
//         '<button class="btn-outline" id="cancel-dismiss-btn">Keep Order</button>' +
//         '<button class="btn-primary" id="cancel-confirm-btn" style="background:linear-gradient(135deg,#f44336,#b71c1c);box-shadow:0 6px 20px rgba(244,67,54,0.4)">Yes, Cancel</button>' +
//       '</div>' +
//     '</div>';

//   document.body.appendChild(overlay);
//   requestAnimationFrame(function() { overlay.classList.add('show'); });

//   function closeModal() { overlay.classList.remove('show'); setTimeout(function() { overlay.remove(); }, 300); }

//   document.getElementById('cancel-dismiss-btn').addEventListener('click', closeModal);
//   overlay.addEventListener('click', function(e) { if (e.target === overlay) closeModal(); });
//   document.getElementById('cancel-confirm-btn').addEventListener('click', function() {
//     closeModal();
//     doCancelOrder(token);
//   });
// }

// function doCancelOrder(token) {
//   if (isSuspended()) {
//     showToast('🚫 Account suspended. You cannot cancel orders.', 'error', 4000);
//     return;
//   }
//   var order = STATE.orders.find(function(o) { return o.token === token; });
//   if (!order)                { showToast('Order not found.', 'error'); return; }
//   if (order.statusIdx !== 0) { showToast('Only Pending orders can be cancelled.', 'error', 3000); return; }
//   if (order.cancelled)       { showToast('Already cancelled.', 'error'); return; }

//   order.cancelled = true;
//   order.status    = 'cancelled';
//   saveOrders();

//   var result = recordCancellation();
//   if (result.suspended) {
//     showToast('Order #' + token + ' cancelled. ⚠️ Account suspended for ' + SUSPEND_DAYS + ' days — limit exceeded!', 'error', 6000);
//   } else {
//     var rem = CANCEL_LIMIT - result.count;
//     showToast('Order #' + token + ' cancelled. ' + rem + ' cancellation' + (rem !== 1 ? 's' : '') + ' remaining before suspension.', 'info', 3500);
//   }

//   renderCart();
//   if (STATE.adminLoggedIn) { renderAdminOrders(STATE.currentFilter); updateAdminStats(); }
// }

// // ═══════════════════════════════════════════════
// // PAYMENT OPTIONS
// // ═══════════════════════════════════════════════
// var selectedPayment = 'cash';

// function initPaymentOpts() {
//   $$('.pay-opt').forEach(function(opt) {
//     opt.addEventListener('click', function() {
//       $$('.pay-opt').forEach(function(o) { o.classList.remove('selected'); });
//       opt.classList.add('selected');
//       selectedPayment = opt.dataset.value;
//     });
//   });
//   var first = $('.pay-opt');
//   if (first) first.classList.add('selected');
// }

// // ═══════════════════════════════════════════════
// // PLACE ORDER
// // ═══════════════════════════════════════════════
// async function placeOrder() {

//   if (!getToken()) {
//     showToast("Login first!", "error");
//     return;
//   }

//   if (STATE.cart.length === 0) {
//     showToast("Cart empty", "error");
//     return;
//   }

//   const items = STATE.cart.map(i => ({
//     name: i.name,
//     price: i.price,
//     quantity: i.qty
//   }));

//   const total = items.reduce((s, i) => s + i.price * i.quantity, 0);

//   const res = await apiRequest("/orders/create", "POST", { items, total });

//   if (res.error) {
//     showToast(res.error, "error");
//     return;
//   }

//   // ⭐ SAVE TOKEN FOR STATUS PAGE
//   localStorage.setItem("lastOrderId", res.orderId);

//   alert(`🎉 Order Placed!\n\nToken No: ${res.orderId}\nStatus: ${res.status}`);

//   STATE.cart = [];
//   updateCartUI();
// }

// // ═══════════════════════════════════════════════
// // CONFETTI
// // ═══════════════════════════════════════════════
// (function() {
//   var s = document.createElement('style');
//   s.textContent = '@keyframes confettiFall { from { transform:translateY(0) rotate(0deg); opacity:1; } to { transform:translateY(100vh) rotate(720deg); opacity:0; } }';
//   document.head.appendChild(s);
// })();

// function spawnConfetti() {
//   var colors = ['#FF5722','#FFB300','#4CAF50','#2196F3','#9C27B0'];
//   for (var i = 0; i < 60; i++) {
//     var c = document.createElement('div');
//     c.style.cssText = 'position:fixed;pointer-events:none;z-index:99999;top:' + (Math.random()*30) + '%;left:' + (Math.random()*100) + '%;width:' + (6+Math.random()*8) + 'px;height:' + (6+Math.random()*8) + 'px;background:' + colors[Math.floor(Math.random()*colors.length)] + ';border-radius:' + (Math.random()>0.5?'50%':'2px') + ';animation:confettiFall ' + (1.5+Math.random()*2) + 's ease forwards;';
//     document.body.appendChild(c);
//     setTimeout(function() { c.remove(); }, 4000);
//   }
// }

// // ═══════════════════════════════════════════════
// // ORDER STATUS PAGE
// // ═══════════════════════════════════════════════
// function renderStatusPage() {
//   document.getElementById('status-result').style.display = 'none';
//   document.getElementById('token-input').value = '';
// }

// async function loadMyOrders() {

//   const orderId = localStorage.getItem("lastOrderId");

//   if (!orderId) {
//     document.getElementById("status-result").innerHTML =
//       "<p>No recent order found</p>";
//     return;
//   }

//   const res = await apiRequest(`/orders/${orderId}`);
//   console.log("MY ORDERS:", res);
//   if (res.error) {
//     document.getElementById("status-result").innerHTML =
//       "<p>Order not found</p>";
//     return;
//   }

//   document.getElementById("status-result").innerHTML = `
//     <div class="status-card">
//       <h3>Token: ${res._id}</h3>
//       <p>Status: <b>${res.status}</b></p>
//       <p>Total: ₹${res.total}</p>
//       <p>Items: ${res.items.map(i=>i.name+" x"+i.quantity).join(", ")}</p>
//     </div>
//   `;
// }

// function renderOrderStatus(order) {
//   var result     = document.getElementById('status-result');
//   var isCancelled = !!order.cancelled;
//   result.style.display = 'block';

//   var stepperHTML = isCancelled
//     ? '<div style="text-align:center;padding:32px 0;color:var(--text-mid)"><div style="font-size:3rem;margin-bottom:12px">❌</div><div style="font-weight:700;font-size:1.1rem">This order was cancelled by the user.</div></div>'
//     : '<div class="stepper"><div class="stepper-track"><div class="stepper-progress" style="width:' + (order.statusIdx/4*100) + '%"></div></div><div class="stepper-steps">' +
//       ORDER_STATUSES.map(function(s, i) {
//         var cls = i < order.statusIdx ? 'done' : i === order.statusIdx ? 'active' : '';
//         return '<div class="step ' + cls + '"><div class="step-circle">' + (i < order.statusIdx ? '✓' : STATUS_EMOJIS[i]) + '</div><div class="step-label">' + s + '</div></div>';
//       }).join('') + '</div></div>';

//   var statusBadgeHTML = isCancelled
//     ? '<span class="status-badge" style="background:#fce4ec;color:#b71c1c">✕ Cancelled</span>'
//     : '<span class="status-badge ' + STATUS_KEYS[order.statusIdx] + '">' + STATUS_EMOJIS[order.statusIdx] + ' ' + ORDER_STATUSES[order.statusIdx] + '</span>';

//   var itemsHTML = order.items.map(function(i) {
//     return '<div class="preview-item"><span class="preview-item-name">' + i.name + ' × ' + i.qty + '</span><span class="preview-item-price">' + fmt(i.price * i.qty) + '</span></div>';
//   }).join('');

//   result.innerHTML =
//     '<div class="status-card">' +
//       '<div class="status-order-info"><div><div class="order-token-display">#' + order.token + '</div><div class="order-date">' + order.time + '</div></div>' + statusBadgeHTML + '</div>' +
//       stepperHTML +
//       '<div class="status-items-preview"><h4>Your Order</h4><div class="preview-items">' + itemsHTML +
//         '<div class="preview-item" style="margin-top:8px;padding-top:8px;border-top:1px solid var(--border)"><span style="font-weight:700">Total</span><span class="preview-item-price" style="font-size:1.05rem">' + fmt(order.total) + '</span></div>' +
//       '</div></div>' +
//     '</div>';
// }

// // ═══════════════════════════════════════════════
// // ADMIN
// // ═══════════════════════════════════════════════
// function renderAdmin() {
//   if (!STATE.adminLoggedIn) {
//     document.getElementById('admin-login-panel').style.display    = 'flex';
//     document.getElementById('admin-dashboard-panel').style.display = 'none';
//   } else {
//     document.getElementById('admin-login-panel').style.display    = 'none';
//     document.getElementById('admin-dashboard-panel').style.display = 'block';
//     renderAdminOrders(STATE.currentFilter);
//     updateAdminStats();
//   }
// }

// function updateAdminStats() {
//   var els       = $$('.admin-stat .stat-val');
//   var total     = STATE.orders.length;
//   var active    = STATE.orders.filter(function(o) { return !o.cancelled && o.statusIdx < 4; }).length;
//   var revenue   = STATE.orders.filter(function(o) { return !o.cancelled; }).reduce(function(s, o) { return s + o.total; }, 0);
//   var delivered = STATE.orders.filter(function(o) { return o.statusIdx === 4; }).length;
//   var cancelled = STATE.orders.filter(function(o) { return o.cancelled; }).length;
//   if (els[0]) els[0].textContent = total;
//   if (els[1]) els[1].textContent = active;
//   if (els[2]) els[2].textContent = fmt(revenue);
//   if (els[3]) els[3].textContent = delivered;
//   if (els[4]) els[4].textContent = cancelled;
// }

// async function renderAdminOrders() {

//   const res = await apiRequest("/orders/all");
//   console.log("ADMIN ORDERS:", res);
//   const list = document.getElementById("admin-orders-list");

//   if(!Array.isArray(res)){
//     list.innerHTML="<p>No orders</p>";
//     return;
//   }

//   list.innerHTML = res.map(o=>`
//     <div class="admin-order-card">
//       <h3>${o._id}</h3>
//       <p><b>${o.status}</b></p>
//       <p>${o.items.map(i=>i.name+" x"+i.quantity).join(", ")}</p>

//       <button onclick="updateStatus('${o._id}','Preparing')">Preparing</button>
//       <button onclick="updateStatus('${o._id}','Ready')">Ready</button>
//       <button onclick="updateStatus('${o._id}','Out for Delivery')">Out</button>
//       <button onclick="updateStatus('${o._id}','Delivered')">Delivered</button>
//     </div>
//   `).join("");
// }

// async function updateStatus(id,status) {

//   const res = await apiRequest(`/orders/update/${id}`,"PUT",{status});

//   if(res.error){
//     showToast(res.error,"error");
//     return;
//   }

//   showToast("Status Updated","success");
//   renderAdminOrders();
// }

// function advanceOrderStatus(token) {
//   var order = STATE.orders.find(function(o) { return o.token === token; });
//   if (!order || order.cancelled || order.statusIdx >= 4) return;
//   order.statusIdx++;
//   order.status = STATUS_KEYS[order.statusIdx];
//   saveOrders();
//   renderAdminOrders(STATE.currentFilter);
//   updateAdminStats();
//   showToast('Order #' + token + ' → ' + ORDER_STATUSES[order.statusIdx], 'success');
// }

// // ═══════════════════════════════════════════════
// // INIT
// // ═══════════════════════════════════════════════
// document.addEventListener('DOMContentLoaded', function() {

//   // Clean stale cancellation data on every load
//   cleanCancelData();

//   // Loading screen
//   var loader = document.querySelector('.loading-screen');
//   setTimeout(function() { loader.classList.add('hidden'); navigate('home'); }, 2000);

//   // Dark mode
//   applyDarkMode();
//   document.querySelector('.dark-toggle').addEventListener('click', function() { STATE.darkMode = !STATE.darkMode; applyDarkMode(); });

//   // Nav links
//   $$('.nav-links a, .mobile-nav a').forEach(function(a) {
//     a.addEventListener('click', function(e) { e.preventDefault(); navigate(a.dataset.page); });
//   });

//   // Cart nav button
//   document.querySelector('.cart-btn').addEventListener('click', function() { navigate('cart'); });

//   // Hamburger
//   document.querySelector('.hamburger').addEventListener('click', function() { document.querySelector('.mobile-nav').classList.toggle('open'); });

//   // Menu tabs
//   $$('.cat-tab').forEach(function(tab) {
//     tab.addEventListener('click', function() {
//       $$('.cat-tab').forEach(function(t) { t.classList.remove('active'); });
//       tab.classList.add('active');
//       renderMenu(tab.dataset.cat);
//     });
//   });

//   // Cart bar
//   document.querySelector('.cart-bar-btn').addEventListener('click', function() { navigate('cart'); });

//   // Payment options
//   initPaymentOpts();

//   // Place Order
//   document.getElementById('checkout-btn').addEventListener('click', function() {
//     if (STATE.cart.length === 0) { showToast('Your cart is empty!', 'error'); return; }
//     if (isSuspended()) {
//       var d = suspensionDaysLeft();
//       showToast('🚫 Account suspended. ' + d + ' day' + (d !== 1 ? 's' : '') + ' remaining.', 'error', 4500);
//       return;
//     }
//     placeOrder();
//   });

//   // Order confirm modal
//   document.getElementById('view-status-btn').addEventListener('click', function() {
//     document.getElementById('confirm-modal-overlay').classList.remove('show');
//     navigate('status');
//   });
//   document.getElementById('close-modal-btn').addEventListener('click', function() {
//     document.getElementById('confirm-modal-overlay').classList.remove('show');
//     navigate('home');
//   });

//   // Status lookup
//   document.getElementById('lookup-btn').addEventListener('click', loadMyOrders, function() {
//     var val = document.getElementById('token-input').value.trim();
//     if (!val) { showToast('Enter your token number!', 'error'); return; }
//     var order = lookupOrder(val);
//     if (!order) { showToast('Order not found. Check your token!', 'error'); document.getElementById('status-result').style.display = 'none'; return; }
//     renderOrderStatus(order);
//   });
//   document.getElementById('token-input').addEventListener('keydown', function(e) { if (e.key === 'Enter') document.getElementById('lookup-btn').click(); });

//   // Admin login
//   document.getElementById('admin-login-btn').addEventListener('click', async function() {

//   const studentId = document.getElementById('admin-user').value;
//   const password = document.getElementById('admin-pass').value;

//   const res = await apiRequest("/auth/login","POST",{ studentId, password });

//   if (res.token && res.user.role === "admin") {
//     localStorage.setItem("token", res.token);
//     STATE.adminLoggedIn = true;
//     renderAdmin();
//     showToast("Admin Logged In", "success");
//   } else {
//     showToast("Invalid admin login", "error");
//   }
// });
//   document.getElementById('admin-pass').addEventListener('keydown', function(e) { if (e.key === 'Enter') document.getElementById('admin-login-btn').click(); });
//   document.getElementById('admin-logout-btn').addEventListener('click', function() {
//   STATE.adminLoggedIn = false;
//   localStorage.removeItem("token");
//   renderAdmin();
// });

//   // Admin filters
//   $$('.filter-btn').forEach(function(btn) { btn.addEventListener('click', function() { renderAdminOrders(btn.dataset.filter); }); });

//   // Hero CTAs
//   document.getElementById('hero-menu-btn').addEventListener('click',    function() { navigate('menu'); });
//   document.getElementById('hero-status-btn').addEventListener('click',  function() { navigate('status'); });
//   document.getElementById('special-order-btn').addEventListener('click', function() { navigate('menu'); });

//   // Footer links
//   $$('.footer-link').forEach(function(a) { a.addEventListener('click', function(e) { e.preventDefault(); navigate(a.dataset.page); }); });

//   updateCartUI();
// });

// // ================= STUDENT AUTH =================

// // LOGIN
// document.getElementById("student-login-btn")?.addEventListener("click", async () => {

//   const studentId = document.getElementById("login-id").value;
//   const password = document.getElementById("login-pass").value;

//   const res = await apiRequest("/auth/login","POST",{ studentId, password });

//   if(res.token){
//     localStorage.setItem("token",res.token);
//     showToast("Login successful","success");
//     navigate("menu");
//   }else{
//     showToast(res.msg || "Login failed","error");
//   }
// });


// // REGISTER
// document.getElementById("student-register-btn")?.addEventListener("click", async () => {

//   const name = document.getElementById("reg-name").value;
//   const department = document.getElementById("reg-dept").value;
//   const studentId = document.getElementById("reg-id").value;
//   const password = document.getElementById("reg-pass").value;

//   const res = await apiRequest("/auth/register","POST",{ name, department, studentId, password });

//   if(res.msg){
//     showToast("Registered! Now login","success");
//   }else{
//     showToast(res.error || "Register failed","error");
//   }
// });




// ---------- calude ai ---------- //



// ================= BACKEND CONFIG =================
// const API = "http://localhost:5000/api";

// function getToken() {
//   return localStorage.getItem("token");
// }

// async function apiRequest(url, method, body) {
//   method = method || "GET";
//   body   = body   || null;

//   const headers = { "Content-Type": "application/json" };
//   const token = getToken();
//   if (token) {
//     headers["Authorization"] = "Bearer " + token;
//   }

//   try {
//     const res = await fetch(API + url, {
//       method,
//       headers,
//       body: body ? JSON.stringify(body) : null
//     });
//     const data = await res.json();
//     if (res.status === 401) {
//       localStorage.removeItem("token");
//       return { error: "Session expired. Please login again." };
//     }
//     return data;
//   } catch (err) {
//     console.error("API error:", err);
//     return { error: "Cannot connect to server. Is the backend running?" };
//   }
// }

// /* =============================================
//    BiteBuzz — app.js (fully fixed & professional)
//    ============================================= */
// 'use strict';

// // ═══════════════════════════════════════════════
// // CONSTANTS
// // ═══════════════════════════════════════════════
// const CANCEL_LIMIT       = 5;
// const CANCEL_WINDOW_DAYS = 30;
// const SUSPEND_DAYS       = 21;
// const MS_DAY             = 86400000;

// // ═══════════════════════════════════════════════
// // STATE
// // ═══════════════════════════════════════════════
// const STATE = {
//   cart:          [],
//   currentPage:   'home',
//   darkMode:      localStorage.getItem('canteen_dark') === 'true',
//   currentFilter: 'all',
//   adminLoggedIn: false,
//   adminOrders:   [],
// };

// // ═══════════════════════════════════════════════
// // MENU DATA
// // ═══════════════════════════════════════════════
// const MENU = {
//   snacks: [
//     { id:1,  name:'Samosa (2pcs)',  desc:'Crispy fried pastry stuffed with spiced potatoes',   price:20,  veg:true,  img:'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&q=80' },
//     { id:2,  name:'Veg Puff',       desc:'Flaky pastry with savory vegetable filling',          price:25,  veg:true,  img:'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&q=80' },
//     { id:3,  name:'French Fries',   desc:'Golden crispy fries with ketchup & mayo',             price:60,  veg:true,  img:'https://images.unsplash.com/photo-1576107232684-1279f390859f?w=400&q=80' },
//     { id:4,  name:'Veg Burger',     desc:'Soft bun with crispy patty, lettuce & sauce',         price:75,  veg:true,  img:'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80' },
//     { id:5,  name:'Chicken Roll',   desc:'Tasty chicken with veggies wrapped in paratha',       price:90,  veg:false, img:'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400&q=80' },
//     { id:6,  name:'Paneer Tikka',   desc:'Spiced cottage cheese grilled to perfection',         price:110, veg:true,  img:'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=400&q=80' },
//   ],
//   meals: [
//     { id:7,  name:'Veg Thali',       desc:'Dal, rice, 2 sabzi, roti, pickle & papad',           price:80,  veg:true,  img:'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&q=80' },
//     { id:8,  name:'Chicken Biryani', desc:'Aromatic basmati rice with tender chicken',           price:130, veg:false, img:'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&q=80' },
//     { id:9,  name:'Rajma Chawal',    desc:'Red kidney beans curry with steamed rice',            price:70,  veg:true,  img:'https://images.unsplash.com/photo-1631452180539-96aca7d48617?w=400&q=80' },
//     { id:10, name:'Pasta (Veg)',     desc:'Penne pasta in rich tomato-based sauce',              price:95,  veg:true,  img:'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&q=80' },
//     { id:11, name:'Egg Fried Rice',  desc:'Wok-tossed rice with scrambled eggs & veggies',      price:85,  veg:false, img:'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&q=80' },
//     { id:12, name:'Chole Bhature',   desc:'Spicy chickpeas with deep-fried fluffy bread',       price:90,  veg:true,  img:'https://images.unsplash.com/photo-1626130640464-c72e1a5bd5f2?w=400&q=80' },
//   ],
//   drinks: [
//     { id:13, name:'Masala Chai',     desc:'Aromatic spiced Indian tea with milk',               price:15,  veg:true,  img:'https://images.unsplash.com/photo-1524678714210-9917a6c619c2?w=400&q=80' },
//     { id:14, name:'Cold Coffee',     desc:'Chilled coffee blended with ice cream & milk',       price:65,  veg:true,  img:'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&q=80' },
//     { id:15, name:'Lassi (Sweet)',   desc:'Thick creamy yogurt-based sweet drink',              price:40,  veg:true,  img:'https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?w=400&q=80' },
//     { id:16, name:'Fresh Lime Soda', desc:'Refreshing chilled lime with soda water',            price:30,  veg:true,  img:'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&q=80' },
//     { id:17, name:'Mango Shake',     desc:'Thick real mango blended with cold milk',            price:70,  veg:true,  img:'https://images.unsplash.com/photo-1546039907-9291c0890434?w=400&q=80' },
//     { id:18, name:'Mineral Water',   desc:'Cool chilled packaged drinking water',               price:20,  veg:true,  img:'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&q=80' },
//   ],
// };

// const ORDER_STATUSES = ['Pending','Preparing','Ready','Out for Delivery','Delivered'];
// const STATUS_EMOJIS  = ['⏳','👨‍🍳','✅','🛵','🎉'];
// const STATUS_KEYS    = ['pending','preparing','ready','outfor','delivered'];

// // ═══════════════════════════════════════════════
// // UTILS
// // ═══════════════════════════════════════════════
// const $    = (sel, ctx) => (ctx || document).querySelector(sel);
// const $$   = (sel, ctx) => [...(ctx || document).querySelectorAll(sel)];
// const mkEl = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html !== undefined) e.innerHTML = html; return e; };
// const fmt  = n => '₹' + n;

// function findItem(id) {
//   for (const cat of Object.values(MENU)) {
//     const f = cat.find(i => i.id === id);
//     if (f) return f;
//   }
//   return null;
// }

// function getLoggedInUser() {
//   const raw = localStorage.getItem("user");
//   try { return raw ? JSON.parse(raw) : null; } catch { return null; }
// }

// // ═══════════════════════════════════════════════
// // TOAST
// // ═══════════════════════════════════════════════
// function showToast(msg, type, duration) {
//   type     = type     || 'info';
//   duration = duration || 2800;
//   const icons = { success:'✅', error:'❌', info:'🍽️' };
//   const t = mkEl('div', 'toast ' + type, '<span>' + (icons[type] || '📢') + '</span><span>' + msg + '</span>');
//   $('.toast-container').appendChild(t);
//   setTimeout(function() { t.classList.add('out'); setTimeout(function() { t.remove(); }, 300); }, duration);
// }

// // ═══════════════════════════════════════════════
// // DARK MODE
// // ═══════════════════════════════════════════════
// function applyDarkMode() {
//   document.body.classList.toggle('dark', STATE.darkMode);
//   localStorage.setItem('canteen_dark', STATE.darkMode);
// }

// // ═══════════════════════════════════════════════
// // NAVIGATION
// // ═══════════════════════════════════════════════
// function navigate(page) {
//   $$('.page').forEach(p => p.classList.remove('active'));
//   const target = $('#page-' + page);
//   if (target) { target.classList.add('active'); window.scrollTo({ top:0, behavior:'smooth' }); }
//   STATE.currentPage = page;
//   $$('.nav-links a, .mobile-nav a').forEach(a => a.classList.toggle('active', a.dataset.page === page));
//   $('.mobile-nav').classList.remove('open');

//   if (page === 'menu')   renderMenu('all');
//   if (page === 'cart')   renderCart();
//   if (page === 'status') renderStatusPage();
//   if (page === 'admin')  renderAdmin();
//   if (page === 'login')  renderLoginPage();

//   updateNavUI();
// }

// function updateNavUI() {
//   const user    = getLoggedInUser();
//   const loginEl = document.querySelector('.nav-links a[data-page="login"]');
//   if (!loginEl) return;
//   loginEl.textContent = user ? ('👤 ' + (user.name || user.studentId)) : 'Login';
// }

// // ═══════════════════════════════════════════════
// // CART HELPERS
// // ═══════════════════════════════════════════════
// function getCartTotal() { return STATE.cart.reduce((s, i) => s + i.price * i.qty, 0); }
// function getCartCount() { return STATE.cart.reduce((s, i) => s + i.qty, 0); }

// function updateCartUI() {
//   const count = getCartCount();
//   const badge = $('.cart-count');
//   if (!badge) return;
//   badge.textContent = count;
//   if (count > 0) { badge.classList.add('pop'); setTimeout(() => badge.classList.remove('pop'), 200); }

//   const bar = $('.cart-bar');
//   if (!bar) return;
//   if (count > 0 && STATE.currentPage === 'menu') {
//     bar.classList.add('visible');
//     bar.querySelector('.cart-bar-count').textContent = count + ' item' + (count !== 1 ? 's' : '') + ' in cart';
//     bar.querySelector('.cart-bar-total').textContent = fmt(getCartTotal());
//   } else {
//     bar.classList.remove('visible');
//   }
// }

// function addToCart(item) {
//   if (!item) return;
//   const ex = STATE.cart.find(i => i.id === item.id);
//   if (ex) { ex.qty++; } else { STATE.cart.push(Object.assign({}, item, { qty: 1 })); }
//   updateCartUI();
//   showToast(item.name + ' added!', 'success', 1800);
// }

// function removeFromCart(id) {
//   const idx = STATE.cart.findIndex(i => i.id === id);
//   if (idx === -1) return;
//   if (STATE.cart[idx].qty > 1) { STATE.cart[idx].qty--; } else { STATE.cart.splice(idx, 1); }
//   updateCartUI();
// }

// function removeItemCompletely(id) {
//   STATE.cart = STATE.cart.filter(i => i.id !== id);
//   updateCartUI();
//   renderCart();
// }

// // ═══════════════════════════════════════════════
// // MENU RENDER
// // ═══════════════════════════════════════════════
// function renderMenu(filter) {
//   const container = $('#menu-grid-container');
//   if (!container) return;
//   container.innerHTML = '';

//   const cats = filter === 'all' ? Object.entries(MENU) : [[filter, MENU[filter] || []]];
//   const catLabels = { snacks:'🍿 Snacks', meals:'🍱 Meals', drinks:'🥤 Drinks' };

//   cats.forEach(([catKey, items]) => {
//     if (!items || items.length === 0) return;
//     const sec = mkEl('div', 'menu-category');
//     sec.innerHTML = '<div class="category-label"><span class="cat-dot"></span><h2>' + catLabels[catKey] + '</h2><span class="cat-count">' + items.length + ' items</span></div>';
//     const grid = mkEl('div', 'menu-grid');

//     items.forEach(item => {
//       const cartItem = STATE.cart.find(i => i.id === item.id);
//       const qty      = cartItem ? cartItem.qty : 0;
//       const card     = mkEl('div', 'food-card');
//       const qtyHTML  = qty === 0
//         ? '<button class="add-btn" data-id="' + item.id + '">Add +</button>'
//         : '<div class="qty-control"><button class="qty-btn minus" data-id="' + item.id + '">−</button><span class="qty-num">' + qty + '</span><button class="qty-btn plus" data-id="' + item.id + '">+</button></div>';

//       card.innerHTML =
//         '<div class="food-card-img">' +
//           '<img src="' + item.img + '" alt="' + item.name + '" loading="lazy" onerror="this.style.background=\'linear-gradient(135deg,#FF6B35,#FFB300)\';this.style.opacity=\'0.6\'">' +
//           '<div class="food-veg-badge ' + (item.veg ? 'veg' : 'non-veg') + '"></div>' +
//         '</div>' +
//         '<div class="food-card-body">' +
//           '<div class="food-card-name">' + item.name + '</div>' +
//           '<div class="food-card-desc">' + item.desc + '</div>' +
//           '<div class="food-card-footer"><div class="food-price">' + fmt(item.price) + '</div>' + qtyHTML + '</div>' +
//         '</div>';
//       grid.appendChild(card);
//     });

//     sec.appendChild(grid);
//     container.appendChild(sec);
//   });

//   $$('.add-btn', container).forEach(btn => {
//     btn.addEventListener('click', () => { addToCart(findItem(+btn.dataset.id)); renderMenu(filter); });
//   });
//   $$('.qty-btn.plus', container).forEach(btn => {
//     btn.addEventListener('click', () => { addToCart(findItem(+btn.dataset.id)); renderMenu(filter); });
//   });
//   $$('.qty-btn.minus', container).forEach(btn => {
//     btn.addEventListener('click', () => { removeFromCart(+btn.dataset.id); renderMenu(filter); });
//   });
// }

// // ═══════════════════════════════════════════════
// // CART RENDER
// // ═══════════════════════════════════════════════
// function renderCart() {
//   const cartPage  = $('#page-cart');
//   const itemsEl   = $('#cart-items');
//   const emptyEl   = $('#cart-empty');
//   const summaryEl = $('#order-summary');
//   if (!cartPage || !itemsEl) return;

//   ['suspension-banner','cancel-warning-bar','recent-orders-panel'].forEach(id => {
//     const old = document.getElementById(id); if (old) old.remove();
//   });

//   const cartHeader   = cartPage.querySelector('.cart-page-header');
//   const suspInfo     = getSuspensionInfo();
//   const suspended    = suspInfo.suspended;
//   const cancelCount  = suspInfo.cancelCount;

//   if (suspended) {
//     const daysLeft = suspInfo.daysLeft;
//     const banner   = mkEl('div', 'suspension-banner');
//     banner.id = 'suspension-banner';
//     banner.innerHTML =
//       '<div class="sb-icon">🚫</div>' +
//       '<div class="sb-body">' +
//         '<div class="sb-title">Account Suspended</div>' +
//         '<div class="sb-desc">You cancelled more than <strong>' + CANCEL_LIMIT + '</strong> orders in 30 days. ' +
//         'Ordering is disabled for <strong>' + daysLeft + ' more day' + (daysLeft !== 1 ? 's' : '') + '</strong>.</div>' +
//         '<div class="sb-meta">Suspension lifts automatically. Please plan your orders carefully.</div>' +
//       '</div>' +
//       '<div class="sb-days"><div class="sb-days-num">' + daysLeft + '</div><div class="sb-days-label">day' + (daysLeft !== 1 ? 's' : '') + ' left</div></div>';
//     if (cartHeader) cartHeader.insertAdjacentElement('afterend', banner);

//   } else if (cancelCount > 0) {
//     const warnBar = mkEl('div', 'cancel-warning-bar');
//     warnBar.id = 'cancel-warning-bar';
//     warnBar.innerHTML =
//       '<span class="cw-icon">⚠️</span>' +
//       '<span class="cw-text">You have cancelled <strong>' + cancelCount + '/' + CANCEL_LIMIT + '</strong> orders in the last 30 days. ' +
//       'Exceeding <strong>' + CANCEL_LIMIT + '</strong> will suspend your account for ' + SUSPEND_DAYS + ' days.</span>';
//     if (cartHeader) cartHeader.insertAdjacentElement('afterend', warnBar);
//   }

//   if (STATE.cart.length === 0) {
//     emptyEl.style.display   = 'block';
//     itemsEl.innerHTML       = '';
//     summaryEl.style.display = 'none';
//   } else {
//     emptyEl.style.display   = 'none';
//     summaryEl.style.display = 'block';
//     itemsEl.innerHTML       = '';

//     STATE.cart.forEach(item => {
//       const div = mkEl('div', 'cart-item');
//       div.innerHTML =
//         '<div class="cart-item-img"><img src="' + item.img + '" alt="' + item.name + '" onerror="this.style.background=\'linear-gradient(135deg,#FF6B35,#FFB300)\'"></div>' +
//         '<div class="cart-item-info">' +
//           '<div class="cart-item-name">' + item.name + '</div>' +
//           '<div class="cart-item-cat">' + (item.veg ? '🟢 Veg' : '🔴 Non-Veg') + '</div>' +
//           '<div class="cart-item-price">' + fmt(item.price) + ' × ' + item.qty + ' = ' + fmt(item.price * item.qty) + '</div>' +
//         '</div>' +
//         '<div class="cart-item-actions">' +
//           '<button class="remove-btn" data-id="' + item.id + '">🗑</button>' +
//           '<div class="qty-control">' +
//             '<button class="qty-btn minus" data-id="' + item.id + '">−</button>' +
//             '<span class="qty-num">' + item.qty + '</span>' +
//             '<button class="qty-btn plus" data-id="' + item.id + '">+</button>' +
//           '</div>' +
//         '</div>';
//       itemsEl.appendChild(div);
//     });

//     const subtotal = getCartTotal();
//     const tax      = Math.round(subtotal * 0.05);
//     $('#summary-subtotal').textContent = fmt(subtotal);
//     $('#summary-tax').textContent      = fmt(tax);
//     $('#summary-total').textContent    = fmt(subtotal + tax);

//     $$('#cart-items .qty-btn.plus').forEach(b  => b.addEventListener('click', () => { addToCart(findItem(+b.dataset.id)); renderCart(); }));
//     $$('#cart-items .qty-btn.minus').forEach(b => b.addEventListener('click', () => { removeFromCart(+b.dataset.id); renderCart(); }));
//     $$('#cart-items .remove-btn').forEach(b    => b.addEventListener('click', () => { removeItemCompletely(+b.dataset.id); }));

//     const checkoutBtn = $('#checkout-btn');
//     if (checkoutBtn) checkoutBtn.disabled = suspended;
//   }
// }

// // ═══════════════════════════════════════════════
// // SUSPENSION INFO (synced from backend responses)
// // ═══════════════════════════════════════════════
// function getSuspensionInfo() {
//   try {
//     const raw = localStorage.getItem('suspension_info');
//     if (!raw) return { suspended: false, cancelCount: 0, daysLeft: 0 };
//     const info = JSON.parse(raw);
//     if (info.suspendedUntil) {
//       const now   = new Date();
//       const until = new Date(info.suspendedUntil);
//       if (now < until) {
//         const daysLeft = Math.ceil((until - now) / MS_DAY);
//         return { suspended: true, cancelCount: info.cancelCount || 0, daysLeft };
//       } else {
//         localStorage.removeItem('suspension_info');
//         return { suspended: false, cancelCount: 0, daysLeft: 0 };
//       }
//     }
//     return { suspended: false, cancelCount: info.cancelCount || 0, daysLeft: 0 };
//   } catch {
//     return { suspended: false, cancelCount: 0, daysLeft: 0 };
//   }
// }

// function saveSuspensionInfo(suspendedUntil, cancellations) {
//   localStorage.setItem('suspension_info', JSON.stringify({
//     suspendedUntil: suspendedUntil || null,
//     cancelCount: cancellations || 0
//   }));
// }

// // ═══════════════════════════════════════════════
// // CANCEL CONFIRM MODAL
// // ═══════════════════════════════════════════════
// function showCancelConfirm(orderId) {
//   const old = document.getElementById('cancel-confirm-overlay');
//   if (old) old.remove();

//   const suspInfo  = getSuspensionInfo();
//   const count     = suspInfo.cancelCount;
//   const willHit   = (count + 1) >= CANCEL_LIMIT;

//   const warnHTML = willHit
//     ? '<div class="cancel-warn-box"><span>🚨</span><span>This cancellation may <strong>suspend your account for ' + SUSPEND_DAYS + ' days</strong>!</span></div>'
//     : '<div class="cancel-info-box"><span>⚠️</span><span>After this: <strong>' + (count + 1) + '/' + CANCEL_LIMIT + '</strong> cancellations in 30 days.</span></div>';

//   const overlay = mkEl('div', 'modal-overlay');
//   overlay.id    = 'cancel-confirm-overlay';
//   overlay.innerHTML =
//     '<div class="confirm-modal" style="max-width:420px">' +
//       '<div class="confirm-animation" style="background:linear-gradient(135deg,#f44336,#b71c1c)">✕</div>' +
//       '<h2 class="confirm-title">Cancel Order?</h2>' +
//       '<p class="confirm-sub">This action cannot be undone.</p>' +
//       warnHTML +
//       '<div class="confirm-actions" style="margin-top:20px">' +
//         '<button class="btn-outline" id="cancel-dismiss-btn">Keep Order</button>' +
//         '<button class="btn-primary" id="cancel-confirm-btn" style="background:linear-gradient(135deg,#f44336,#b71c1c);box-shadow:0 6px 20px rgba(244,67,54,0.4)">Yes, Cancel</button>' +
//       '</div>' +
//     '</div>';

//   document.body.appendChild(overlay);
//   requestAnimationFrame(() => overlay.classList.add('show'));

//   const closeModal = () => { overlay.classList.remove('show'); setTimeout(() => overlay.remove(), 300); };

//   document.getElementById('cancel-dismiss-btn').addEventListener('click', closeModal);
//   overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
//   document.getElementById('cancel-confirm-btn').addEventListener('click', () => {
//     closeModal();
//     doCancelOrder(orderId);
//   });
// }

// async function doCancelOrder(orderId) {
//   if (!getToken()) {
//     showToast('Please login first!', 'error');
//     navigate('login');
//     return;
//   }

//   const suspInfo = getSuspensionInfo();
//   if (suspInfo.suspended) {
//     showToast('🚫 Account suspended. You cannot cancel orders.', 'error', 4000);
//     return;
//   }

//   const res = await apiRequest('/orders/cancel/' + orderId, 'POST');

//   if (res.error) {
//     showToast(res.error, 'error');
//     return;
//   }
//   if (res.msg && res.msg !== 'Order cancelled') {
//     showToast(res.msg, 'error');
//     return;
//   }

//   // Update suspension info from backend response
//   saveSuspensionInfo(res.suspendedUntil, res.cancellations);

//   if (res.suspendedUntil) {
//     showToast('Order cancelled. ⚠️ Account suspended for ' + SUSPEND_DAYS + ' days!', 'error', 6000);
//   } else {
//     const rem = CANCEL_LIMIT - (res.cancellations || 0);
//     showToast('Order cancelled. ' + rem + ' cancellation' + (rem !== 1 ? 's' : '') + ' remaining before suspension.', 'info', 3500);
//   }

//   renderCart();
//   renderStatusPage();
// }

// // ═══════════════════════════════════════════════
// // PAYMENT OPTIONS
// // ═══════════════════════════════════════════════
// var selectedPayment = 'cash';

// function initPaymentOpts() {
//   $$('.pay-opt').forEach(opt => {
//     opt.addEventListener('click', () => {
//       $$('.pay-opt').forEach(o => o.classList.remove('selected'));
//       opt.classList.add('selected');
//       selectedPayment = opt.dataset.value;
//     });
//   });
//   const first = $('.pay-opt');
//   if (first) first.classList.add('selected');
// }

// // ═══════════════════════════════════════════════
// // PLACE ORDER
// // ═══════════════════════════════════════════════
// async function placeOrder() {
//   if (!getToken()) {
//     showToast('Please login first to place an order!', 'error');
//     setTimeout(() => navigate('login'), 1200);
//     return;
//   }

//   if (STATE.cart.length === 0) {
//     showToast('Your cart is empty!', 'error');
//     return;
//   }

//   const suspInfo = getSuspensionInfo();
//   if (suspInfo.suspended) {
//     showToast('🚫 Account suspended. ' + suspInfo.daysLeft + ' day' + (suspInfo.daysLeft !== 1 ? 's' : '') + ' remaining.', 'error', 4500);
//     return;
//   }

//   const checkoutBtn = document.getElementById('checkout-btn');
//   if (checkoutBtn) { checkoutBtn.disabled = true; checkoutBtn.textContent = 'Placing order...'; }

//   const items    = STATE.cart.map(i => ({ name: i.name, price: i.price, quantity: i.qty }));
//   const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
//   const tax      = Math.round(subtotal * 0.05);
//   const total    = subtotal + tax;

//   const res = await apiRequest('/orders/create', 'POST', { items, total });

//   if (checkoutBtn) { checkoutBtn.disabled = false; checkoutBtn.textContent = 'Place Order 🚀'; }

//   if (res.error) {
//     showToast(res.error, 'error');
//     return;
//   }

//   // Save for status tracking
//   localStorage.setItem('lastOrderId', res.orderId);

//   // Show the confirmation modal with the real token
//   const tokenEl = document.getElementById('confirm-token');
//   if (tokenEl) tokenEl.textContent = res.orderId ? '#' + res.orderId.slice(-6).toUpperCase() : '—';

//   const overlay = document.getElementById('confirm-modal-overlay');
//   if (overlay) overlay.classList.add('show');

//   spawnConfetti();

//   STATE.cart = [];
//   updateCartUI();
// }

// // ═══════════════════════════════════════════════
// // CONFETTI
// // ═══════════════════════════════════════════════
// (function() {
//   const s = document.createElement('style');
//   s.textContent = '@keyframes confettiFall { from { transform:translateY(0) rotate(0deg); opacity:1; } to { transform:translateY(100vh) rotate(720deg); opacity:0; } }';
//   document.head.appendChild(s);
// })();

// function spawnConfetti() {
//   const colors = ['#FF5722','#FFB300','#4CAF50','#2196F3','#9C27B0'];
//   for (let i = 0; i < 60; i++) {
//     const c = document.createElement('div');
//     c.style.cssText = 'position:fixed;pointer-events:none;z-index:99999;top:' + (Math.random()*30) + '%;left:' + (Math.random()*100) + '%;width:' + (6+Math.random()*8) + 'px;height:' + (6+Math.random()*8) + 'px;background:' + colors[Math.floor(Math.random()*colors.length)] + ';border-radius:' + (Math.random()>0.5?'50%':'2px') + ';animation:confettiFall ' + (1.5+Math.random()*2) + 's ease forwards;';
//     document.body.appendChild(c);
//     setTimeout(() => c.remove(), 4000);
//   }
// }

// // ═══════════════════════════════════════════════
// // ORDER STATUS PAGE
// // ═══════════════════════════════════════════════
// function renderStatusPage() {
//   const resultEl  = document.getElementById('status-result');
//   const tokenInput = document.getElementById('token-input');
//   if (!resultEl) return;
//   resultEl.style.display = 'none';
//   resultEl.innerHTML = '';
//   if (tokenInput) tokenInput.value = '';

//   // Auto-load last order
//   const lastOrderId = localStorage.getItem('lastOrderId');
//   if (lastOrderId && getToken()) {
//     loadOrderById(lastOrderId);
//   }
// }

// async function loadOrderById(orderId) {
//   if (!orderId) return;
//   const resultEl = document.getElementById('status-result');
//   if (!resultEl) return;

//   resultEl.style.display = 'block';
//   resultEl.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-mid)">⏳ Loading order...</div>';

//   const res = await apiRequest('/orders/' + orderId);
//   if (res.error || !res._id) {
//     resultEl.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-mid)"><div style="font-size:3rem">❓</div><p>' + (res.error || 'Order not found') + '</p></div>';
//     return;
//   }
//   renderOrderStatus(res);
// }

// async function loadMyOrders() {
//   const tokenInput = document.getElementById('token-input');
//   const val = tokenInput ? tokenInput.value.trim() : '';

//   if (val) {
//     await loadOrderById(val);
//     return;
//   }

//   const lastOrderId = localStorage.getItem('lastOrderId');
//   if (!lastOrderId) {
//     showToast('Enter your Order ID!', 'error');
//     return;
//   }
//   await loadOrderById(lastOrderId);
// }

// function renderOrderStatus(order) {
//   const resultEl = document.getElementById('status-result');
//   if (!resultEl) return;

//   const isCancelled = order.status === 'Cancelled';
//   const statusIdx   = ORDER_STATUSES.findIndex(s => s === order.status);
//   const safeIdx     = statusIdx >= 0 ? statusIdx : 0;

//   resultEl.style.display = 'block';

//   const stepperHTML = isCancelled
//     ? '<div style="text-align:center;padding:32px 0;color:var(--text-mid)"><div style="font-size:3rem;margin-bottom:12px">❌</div><div style="font-weight:700;font-size:1.1rem">This order was cancelled.</div></div>'
//     : '<div class="stepper">' +
//         '<div class="stepper-track"><div class="stepper-progress" style="width:' + (safeIdx / (ORDER_STATUSES.length - 1) * 100) + '%"></div></div>' +
//         '<div class="stepper-steps">' +
//           ORDER_STATUSES.map((s, i) => {
//             const cls = i < safeIdx ? 'done' : i === safeIdx ? 'active' : '';
//             return '<div class="step ' + cls + '"><div class="step-circle">' + (i < safeIdx ? '✓' : STATUS_EMOJIS[i]) + '</div><div class="step-label">' + s + '</div></div>';
//           }).join('') +
//         '</div>' +
//       '</div>';

//   const statusBadgeHTML = isCancelled
//     ? '<span class="status-badge" style="background:#fce4ec;color:#b71c1c">✕ Cancelled</span>'
//     : '<span class="status-badge ' + STATUS_KEYS[safeIdx] + '">' + STATUS_EMOJIS[safeIdx] + ' ' + ORDER_STATUSES[safeIdx] + '</span>';

//   const itemsHTML = (order.items || []).map(i =>
//     '<div class="preview-item">' +
//       '<span class="preview-item-name">' + i.name + ' × ' + i.quantity + '</span>' +
//       '<span class="preview-item-price">' + fmt(i.price * i.quantity) + '</span>' +
//     '</div>'
//   ).join('');

//   let cancelBtnHTML = '';
//   if (!isCancelled && order.status === 'Pending' && getToken()) {
//     cancelBtnHTML = '<button class="btn-secondary cancel-order-link" onclick="showCancelConfirm(\'' + order._id + '\')">✕ Cancel This Order</button>';
//   }

//   const orderDate = order.createdAt
//     ? new Date(order.createdAt).toLocaleString('en-IN', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit', hour12:true })
//     : 'N/A';

//   resultEl.innerHTML =
//     '<div class="status-card">' +
//       '<div class="status-order-info">' +
//         '<div>' +
//           '<div class="order-token-display">#' + (order._id ? order._id.slice(-6).toUpperCase() : 'N/A') + '</div>' +
//           '<div class="order-date">' + orderDate + '</div>' +
//         '</div>' +
//         statusBadgeHTML +
//       '</div>' +
//       stepperHTML +
//       '<div class="status-items-preview">' +
//         '<h4>Your Order</h4>' +
//         '<div class="preview-items">' +
//           itemsHTML +
//           '<div class="preview-item" style="margin-top:8px;padding-top:8px;border-top:1px solid var(--border)">' +
//             '<span style="font-weight:700">Total (incl. GST)</span>' +
//             '<span class="preview-item-price" style="font-size:1.05rem">' + fmt(order.total) + '</span>' +
//           '</div>' +
//         '</div>' +
//       '</div>' +
//       cancelBtnHTML +
//     '</div>';
// }

// // ═══════════════════════════════════════════════
// // ADMIN PANEL
// // ═══════════════════════════════════════════════
// function renderAdmin() {
//   if (!STATE.adminLoggedIn) {
//     document.getElementById('admin-login-panel').style.display    = 'flex';
//     document.getElementById('admin-dashboard-panel').style.display = 'none';
//   } else {
//     document.getElementById('admin-login-panel').style.display    = 'none';
//     document.getElementById('admin-dashboard-panel').style.display = 'block';
//     renderAdminOrders(STATE.currentFilter);
//   }
// }

// async function renderAdminOrders(filter) {
//   filter = filter || 'all';
//   STATE.currentFilter = filter;

//   $$('.filter-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.filter === filter));

//   const list = document.getElementById('admin-orders-list');
//   if (!list) return;

//   list.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-mid)">⏳ Loading orders...</div>';

//   // BUG FIX: use /admin/all which is before /:id in the route file
//   const res = await apiRequest('/orders/admin/all');

//   if (res.error) {
//     list.innerHTML = '<div class="no-orders"><div class="empty-icon">⚠️</div><p>' + res.error + '</p></div>';
//     return;
//   }

//   if (!Array.isArray(res) || res.length === 0) {
//     list.innerHTML = '<div class="no-orders"><div class="empty-icon">📭</div><p>No orders yet. Orders placed by students will appear here.</p></div>';
//     if (Array.isArray(res)) updateAdminStats([]);
//     return;
//   }

//   STATE.adminOrders = res;
//   updateAdminStats(res);

//   let orders = res;
//   if (filter !== 'all') {
//     const filterMap = {
//       pending: 'Pending', preparing: 'Preparing', ready: 'Ready',
//       outfor:  'Out for Delivery', delivered: 'Delivered', cancelled: 'Cancelled'
//     };
//     const target = filterMap[filter];
//     if (target) orders = res.filter(o => o.status === target);
//   }

//   if (orders.length === 0) {
//     list.innerHTML = '<div class="no-orders"><div class="empty-icon">📭</div><p>No orders in this category.</p></div>';
//     return;
//   }

//   list.innerHTML = orders.map(o => {
//     const studentName = (o.userId && o.userId.name) ? o.userId.name : 'Unknown';
//     const studentId   = (o.userId && o.userId.studentId) ? o.userId.studentId : '—';
//     const orderDate   = o.createdAt ? new Date(o.createdAt).toLocaleString('en-IN', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit', hour12:true }) : 'N/A';
//     const statusIdx   = ORDER_STATUSES.findIndex(s => s === o.status);
//     const safeIdx     = statusIdx >= 0 ? statusIdx : 0;
//     const isCancelled = o.status === 'Cancelled';
//     const isDelivered = o.status === 'Delivered';

//     const nextStatuses = { 'Pending':'Preparing', 'Preparing':'Ready', 'Ready':'Out for Delivery', 'Out for Delivery':'Delivered' };
//     const nextStatus   = nextStatuses[o.status];
//     const actionBtn    = (!isCancelled && !isDelivered && nextStatus)
//       ? '<button class="btn-primary" style="padding:8px 16px;font-size:0.85rem" onclick="updateOrderStatus(\'' + o._id + '\',\'' + nextStatus + '\')">→ ' + nextStatus + '</button>'
//       : '';

//     const statusColors = {
//       'Pending': ['#fff3e0','#e65100'], 'Preparing': ['#e3f2fd','#1565c0'],
//       'Ready':   ['#e8f5e9','#2e7d32'], 'Out for Delivery': ['#f3e5f5','#6a1b9a'],
//       'Delivered': ['#e8f5e9','#1b5e20'], 'Cancelled': ['#fce4ec','#b71c1c']
//     };
//     const [bg, fg] = statusColors[o.status] || ['#f5f5f5','#333'];

//     return '<div class="admin-order-card">' +
//       '<div class="aoc-header">' +
//         '<div class="aoc-token">#' + o._id.slice(-6).toUpperCase() + '</div>' +
//         '<span class="aoc-status-badge" style="background:' + bg + ';color:' + fg + '">' + STATUS_EMOJIS[safeIdx] + ' ' + o.status + '</span>' +
//       '</div>' +
//       '<div class="aoc-student">👤 ' + studentName + ' <span style="color:var(--text-mid);font-size:0.85rem">(' + studentId + ')</span></div>' +
//       '<div class="aoc-items">' + (o.items || []).map(i => i.name + ' ×' + i.quantity).join(' · ') + '</div>' +
//       '<div class="aoc-footer">' +
//         '<div class="aoc-meta">' +
//           '<span class="aoc-total">' + fmt(o.total) + '</span>' +
//           '<span class="aoc-date">' + orderDate + '</span>' +
//         '</div>' +
//         actionBtn +
//       '</div>' +
//     '</div>';
//   }).join('');
// }

// function updateAdminStats(orders) {
//   if (!orders) orders = STATE.adminOrders;
//   const els = $$('.admin-stat .stat-val');
//   if (els[0]) els[0].textContent = orders.length;
//   if (els[1]) els[1].textContent = orders.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled').length;
//   if (els[2]) els[2].textContent = fmt(orders.filter(o => o.status !== 'Cancelled').reduce((s, o) => s + (o.total || 0), 0));
//   if (els[3]) els[3].textContent = orders.filter(o => o.status === 'Delivered').length;
//   if (els[4]) els[4].textContent = orders.filter(o => o.status === 'Cancelled').length;
// }

// // Globally exposed for inline onclick handlers
// window.updateOrderStatus = async function(id, status) {
//   const res = await apiRequest('/orders/update/' + id, 'PUT', { status });
//   if (res.msg === 'Order status updated') {
//     showToast('Status updated → ' + status, 'success');
//   } else {
//     showToast(res.msg || res.error || 'Update failed', 'error');
//   }
//   renderAdminOrders(STATE.currentFilter);
// };

// window.showCancelConfirm = showCancelConfirm;

// // ═══════════════════════════════════════════════
// // LOGIN PAGE
// // ═══════════════════════════════════════════════
// function renderLoginPage() {
//   const user      = getLoggedInUser();
//   const loginCard = document.querySelector('#page-login .auth-card');
//   if (!loginCard) return;

//   if (user) {
//     loginCard.innerHTML =
//       '<div class="auth-title">👤 ' + (user.name || user.studentId) + '</div>' +
//       '<div class="auth-sub" style="margin-bottom:24px">You are logged in as <strong>' + (user.role || 'student') + '</strong></div>' +
//       '<button id="student-logout-btn" class="auth-btn" style="background:linear-gradient(135deg,#f44336,#b71c1c)">Logout</button>';

//     document.getElementById('student-logout-btn').addEventListener('click', () => {
//       localStorage.removeItem('token');
//       localStorage.removeItem('user');
//       localStorage.removeItem('lastOrderId');
//       localStorage.removeItem('suspension_info');
//       STATE.adminLoggedIn = false;
//       showToast('Logged out successfully', 'success');
//       renderLoginPage();
//       updateNavUI();
//     });
//   }
// }

// // ═══════════════════════════════════════════════
// // AUTH TAB SWITCHER (global for inline onclick)
// // ═══════════════════════════════════════════════
// window.switchAuthTab = function(tab) {
//   const loginForm    = document.getElementById('auth-login-form');
//   const registerForm = document.getElementById('auth-register-form');
//   const tabLogin     = document.getElementById('tab-login');
//   const tabRegister  = document.getElementById('tab-register');
//   if (!loginForm || !registerForm) return;

//   if (tab === 'login') {
//     loginForm.style.display    = 'block';
//     registerForm.style.display = 'none';
//     if (tabLogin)    tabLogin.classList.add('active');
//     if (tabRegister) tabRegister.classList.remove('active');
//   } else {
//     loginForm.style.display    = 'none';
//     registerForm.style.display = 'block';
//     if (tabLogin)    tabLogin.classList.remove('active');
//     if (tabRegister) tabRegister.classList.add('active');
//   }
// };

// // ═══════════════════════════════════════════════
// // INIT
// // ═══════════════════════════════════════════════
// document.addEventListener('DOMContentLoaded', function() {

//   // Loading screen
//   const loader = document.querySelector('.loading-screen');
//   setTimeout(() => { if (loader) loader.classList.add('hidden'); navigate('home'); }, 2000);

//   // Dark mode
//   applyDarkMode();
//   const darkToggle = document.querySelector('.dark-toggle');
//   if (darkToggle) darkToggle.addEventListener('click', () => { STATE.darkMode = !STATE.darkMode; applyDarkMode(); });

//   // Nav links
//   $$('.nav-links a, .mobile-nav a').forEach(a => {
//     a.addEventListener('click', e => { e.preventDefault(); if (a.dataset.page) navigate(a.dataset.page); });
//   });

//   // Cart button
//   const cartBtn = document.querySelector('.cart-btn');
//   if (cartBtn) cartBtn.addEventListener('click', () => navigate('cart'));

//   // Hamburger
//   const hamburger = document.querySelector('.hamburger');
//   if (hamburger) hamburger.addEventListener('click', () => document.querySelector('.mobile-nav').classList.toggle('open'));

//   // Menu tabs
//   $$('.cat-tab').forEach(tab => {
//     tab.addEventListener('click', () => {
//       $$('.cat-tab').forEach(t => t.classList.remove('active'));
//       tab.classList.add('active');
//       renderMenu(tab.dataset.cat);
//     });
//   });

//   // Cart bar
//   const cartBarBtn = document.querySelector('.cart-bar-btn');
//   if (cartBarBtn) cartBarBtn.addEventListener('click', () => navigate('cart'));

//   // Payment options
//   initPaymentOpts();

//   // Checkout button
//   const checkoutBtn = document.getElementById('checkout-btn');
//   if (checkoutBtn) {
//     checkoutBtn.addEventListener('click', () => {
//       if (STATE.cart.length === 0) { showToast('Your cart is empty!', 'error'); return; }
//       placeOrder();
//     });
//   }

//   // Order confirm modal
//   const viewStatusBtn = document.getElementById('view-status-btn');
//   if (viewStatusBtn) {
//     viewStatusBtn.addEventListener('click', () => {
//       document.getElementById('confirm-modal-overlay').classList.remove('show');
//       navigate('status');
//     });
//   }
//   const closeModalBtn = document.getElementById('close-modal-btn');
//   if (closeModalBtn) {
//     closeModalBtn.addEventListener('click', () => {
//       document.getElementById('confirm-modal-overlay').classList.remove('show');
//       navigate('home');
//     });
//   }

//   // Status lookup — single clean handler (BUG FIX: was two handlers before)
//   const lookupBtn  = document.getElementById('lookup-btn');
//   const tokenInput = document.getElementById('token-input');
//   if (lookupBtn)  lookupBtn.addEventListener('click', loadMyOrders);
//   if (tokenInput) tokenInput.addEventListener('keydown', e => { if (e.key === 'Enter') loadMyOrders(); });

//   // Admin login (BUG FIX: now uses /admin/login endpoint correctly)
//   const adminLoginBtn = document.getElementById('admin-login-btn');
//   if (adminLoginBtn) {
//     adminLoginBtn.addEventListener('click', async () => {
//       const studentId = document.getElementById('admin-user').value.trim();
//       const password  = document.getElementById('admin-pass').value;
//       if (!studentId || !password) { showToast('Enter credentials', 'error'); return; }

//       adminLoginBtn.disabled    = true;
//       adminLoginBtn.textContent = 'Logging in...';

//       const res = await apiRequest('/admin/login', 'POST', { studentId, password });

//       adminLoginBtn.disabled    = false;
//       adminLoginBtn.textContent = 'Login →';

//       if (res.token && res.user && res.user.role === 'admin') {
//         localStorage.setItem('token', res.token);
//         localStorage.setItem('user', JSON.stringify(res.user));
//         STATE.adminLoggedIn = true;
//         renderAdmin();
//         showToast('Welcome, ' + (res.user.name || 'Admin') + '!', 'success');
//         updateNavUI();
//       } else {
//         showToast(res.msg || 'Invalid admin credentials', 'error');
//       }
//     });
//   }

//   const adminPassEl = document.getElementById('admin-pass');
//   if (adminPassEl) adminPassEl.addEventListener('keydown', e => { if (e.key === 'Enter') document.getElementById('admin-login-btn').click(); });

//   const adminLogoutBtn = document.getElementById('admin-logout-btn');
//   if (adminLogoutBtn) {
//     adminLogoutBtn.addEventListener('click', () => {
//       STATE.adminLoggedIn = false;
//       localStorage.removeItem('token');
//       localStorage.removeItem('user');
//       renderAdmin();
//       showToast('Admin logged out', 'info');
//       updateNavUI();
//     });
//   }

//   // Admin filters
//   $$('.filter-btn').forEach(btn => btn.addEventListener('click', () => renderAdminOrders(btn.dataset.filter)));

//   // Hero CTAs
//   const heroMenuBtn     = document.getElementById('hero-menu-btn');
//   const heroStatusBtn   = document.getElementById('hero-status-btn');
//   const specialOrderBtn = document.getElementById('special-order-btn');
//   if (heroMenuBtn)     heroMenuBtn.addEventListener('click',    () => navigate('menu'));
//   if (heroStatusBtn)   heroStatusBtn.addEventListener('click',  () => navigate('status'));
//   if (specialOrderBtn) specialOrderBtn.addEventListener('click', () => navigate('menu'));

//   // Footer links
//   $$('.footer-link').forEach(a => a.addEventListener('click', e => { e.preventDefault(); navigate(a.dataset.page); }));

//   // Student Login
//   const studentLoginBtn = document.getElementById('student-login-btn');
//   if (studentLoginBtn) {
//     studentLoginBtn.addEventListener('click', async () => {
//       const studentId = document.getElementById('login-id').value.trim();
//       const password  = document.getElementById('login-pass').value;
//       if (!studentId || !password) { showToast('Enter Student ID and password', 'error'); return; }

//       studentLoginBtn.disabled    = true;
//       studentLoginBtn.textContent = 'Logging in...';

//       const res = await apiRequest('/auth/login', 'POST', { studentId, password });

//       studentLoginBtn.disabled    = false;
//       studentLoginBtn.textContent = 'Login';

//       if (res.token) {
//         localStorage.setItem('token', res.token);
//         localStorage.setItem('user', JSON.stringify(res.user));
//         showToast('Welcome back, ' + (res.user.name || studentId) + '!', 'success');
//         updateNavUI();
//         navigate('menu');
//       } else {
//         showToast(res.msg || 'Login failed', 'error');
//       }
//     });
//   }

//   // Student Register (if register form is present)
//   const studentRegBtn = document.getElementById('student-register-btn');
//   if (studentRegBtn) {
//     studentRegBtn.addEventListener('click', async () => {
//       const name       = document.getElementById('reg-name')?.value.trim();
//       const department = document.getElementById('reg-dept')?.value.trim();
//       const studentId  = document.getElementById('reg-id')?.value.trim();
//       const password   = document.getElementById('reg-pass')?.value;
//       if (!name || !studentId || !password) { showToast('Fill in all required fields', 'error'); return; }

//       const res = await apiRequest('/auth/register', 'POST', { name, department, studentId, password });
//       if (res.msg === 'Registration successful') {
//         showToast('Registered! Please login.', 'success');
//       } else {
//         showToast(res.error || res.msg || 'Registration failed', 'error');
//       }
//     });
//   }

//   // Restore admin login state if token present
//   const savedUser = getLoggedInUser();
//   if (savedUser && savedUser.role === 'admin' && getToken()) {
//     STATE.adminLoggedIn = true;
//   }

//   updateCartUI();
//   updateNavUI();
// });





// testing //

// ================= BACKEND CONFIG =================


const API = "https://bitebuzz-5ekc.onrender.com/api";

function getToken() {
  return localStorage.getItem("token");
}

async function apiRequest(url, method, body) {
  method = method || "GET";
  body   = body   || null;

  const headers = { "Content-Type": "application/json" };
  const token = getToken();
  if (token) {
    headers["Authorization"] = "Bearer " + token;
  }

  try {
    const res = await fetch(API + url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : null
    });
    const data = await res.json();
    if (res.status === 401) {
      localStorage.removeItem("token");
      return { error: "Session expired. Please login again." };
    }
    return data;
  } catch (err) {
    console.error("API error:", err);
    return { error: "Cannot connect to server. Is the backend running?" };
  }
}

/* =============================================
   BiteBuzz — app.js (fully fixed & professional)
   ============================================= */
'use strict';

// ═══════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════
const CANCEL_LIMIT       = 5;
const CANCEL_WINDOW_DAYS = 30;
const SUSPEND_DAYS       = 21;
const MS_DAY             = 86400000;

// ═══════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════
const STATE = {
  cart:          [],
  currentPage:   'home',
  darkMode:      localStorage.getItem('canteen_dark') === 'true',
  currentFilter: 'all',
  adminLoggedIn: false,
  adminOrders:   [],
};

// ═══════════════════════════════════════════════
// MENU DATA
// ═══════════════════════════════════════════════
const MENU = {
  snacks: [
    { id:1,  name:'Samosa (2pcs)',  desc:'Crispy fried pastry stuffed with spiced potatoes',   price:20,  veg:true,  img:'images/food/samosa.jpeg' },
    { id:2,  name:'Veg Puff',       desc:'Flaky pastry with savory vegetable filling',          price:25,  veg:true,  img:'images/food/veg puff.jpeg' },
    { id:3,  name:'French Fries',   desc:'Golden crispy fries with ketchup & mayo',             price:60,  veg:true,  img:'images/food/french fries.jpeg' },
    { id:4,  name:'Veg Burger',     desc:'Soft bun with crispy patty, lettuce & sauce',         price:75,  veg:true,  img:'images/food/veg burgur.jpeg' },
    { id:5,  name:'Chicken Roll',   desc:'Tasty chicken with veggies wrapped in paratha',       price:90,  veg:false, img:'images/food/Chicken Roll.jpeg' },
    { id:6,  name:'Paneer Tikka',   desc:'Spiced cottage cheese grilled to perfection',         price:110, veg:true,  img:'images/food/Paneer Tikka.jpeg' },
  ],
  meals: [
    { id:7,  name:'Veg Thali',       desc:'Dal, rice, 2 sabzi, roti, pickle & papad',           price:80,  veg:true,  img:'images/food/Veg Thali.jpeg' },
    { id:8,  name:'Chicken Biryani', desc:'Aromatic basmati rice with tender chicken',           price:130, veg:false, img:'images/food/Chicken Biryani.jpeg' },
    { id:9,  name:'Rajma Chawal',    desc:'Red kidney beans curry with steamed rice',            price:70,  veg:true,  img:'images/food/Rajma Chawal.jpeg' },
    { id:10, name:'Pasta (Veg)',     desc:'Penne pasta in rich tomato-based sauce',              price:95,  veg:true,  img:'images/food/veg Pasta.jpeg' },
    { id:11, name:'Egg Fried Rice',  desc:'Wok-tossed rice with scrambled eggs & veggies',      price:85,  veg:false, img:'images/food/Egg Fried Rice.jpeg' },
    { id:12, name:'Chole Bhature',   desc:'Spicy chickpeas with deep-fried fluffy bread',       price:90,  veg:true,  img:'images/food/Chole Bhature.jpeg' },
  ],
  drinks: [
    { id:13, name:'Masala Chai',     desc:'Aromatic spiced Indian tea with milk',               price:15,  veg:true,  img:'images/food/Masala Chai.jpeg' },
    { id:14, name:'Cold Coffee',     desc:'Chilled coffee blended with ice cream & milk',       price:65,  veg:true,  img:'images/food/Cold Coffee.jpeg' },
    { id:15, name:'Lassi (Sweet)',   desc:'Thick creamy yogurt-based sweet drink',              price:40,  veg:true,  img:'images/food/Lassi.jpeg' },
    { id:16, name:'Fresh Lime Soda', desc:'Refreshing chilled lime with soda water',            price:30,  veg:true,  img:'images/food/Fresh Lime Soda.jpeg' },
    { id:17, name:'Mango Shake',     desc:'Thick real mango blended with cold milk',            price:70,  veg:true,  img:'images/food/Mango Shake.jpeg' },
    { id:18, name:'Mineral Water',   desc:'Cool chilled packaged drinking water',               price:20,  veg:true,  img:'images/food/water.jpeg' },
  ],
};

const ORDER_STATUSES = ['Pending','Preparing','Ready','Out for Delivery','Delivered'];
const STATUS_EMOJIS  = ['⏳','👨‍🍳','✅','🛵','🎉'];
const STATUS_KEYS    = ['pending','preparing','ready','outfor','delivered'];

// ═══════════════════════════════════════════════
// UTILS
// ═══════════════════════════════════════════════
const $    = (sel, ctx) => (ctx || document).querySelector(sel);
const $$   = (sel, ctx) => [...(ctx || document).querySelectorAll(sel)];
const mkEl = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html !== undefined) e.innerHTML = html; return e; };
const fmt  = n => '₹' + n;

function findItem(id) {
  for (const cat of Object.values(MENU)) {
    const f = cat.find(i => i.id === id);
    if (f) return f;
  }
  return null;
}

function getLoggedInUser() {
  const raw = localStorage.getItem("user");
  try { return raw ? JSON.parse(raw) : null; } catch { return null; }
}

// ═══════════════════════════════════════════════
// ITEM AVAILABILITY MANAGEMENT
// ═══════════════════════════════════════════════
function getItemAvailability(itemId) {
  const availability = JSON.parse(localStorage.getItem('itemAvailability') || '{}');
  return availability[itemId] !== false; // default: available
}

function setItemAvailability(itemId, available) {
  const availability = JSON.parse(localStorage.getItem('itemAvailability') || '{}');
  availability[itemId] = available;
  localStorage.setItem('itemAvailability', JSON.stringify(availability));
  showToast(available ? '✅ Item marked available' : '❌ Item marked unavailable', 'success');
}

// ═══════════════════════════════════════════════
// TOAST
// ═══════════════════════════════════════════════
function showToast(msg, type, duration) {
  type     = type     || 'info';
  duration = duration || 2800;
  const icons = { success:'✅', error:'❌', info:'🍽️' };
  const t = mkEl('div', 'toast ' + type, '<span>' + (icons[type] || '📢') + '</span><span>' + msg + '</span>');
  $('.toast-container').appendChild(t);
  setTimeout(function() { t.classList.add('out'); setTimeout(function() { t.remove(); }, 300); }, duration);
}

// ═══════════════════════════════════════════════
// DARK MODE
// ═══════════════════════════════════════════════
function applyDarkMode() {
  document.body.classList.toggle('dark', STATE.darkMode);
  localStorage.setItem('canteen_dark', STATE.darkMode);
}

// ═══════════════════════════════════════════════
// NAVIGATION
// ═══════════════════════════════════════════════
// Auto-refresh interval handles
var _autoRefreshInterval = null;
var AUTO_REFRESH_MS = 30000; // 30 seconds

function startAutoRefresh(page) {
  stopAutoRefresh(); // clear any existing
  if (page === 'status') {
    _autoRefreshInterval = setInterval(function() {
      if (STATE.currentPage !== 'status') { stopAutoRefresh(); return; }
      if (STATE.adminLoggedIn) return;
      loadAllActiveOrders(true); // silent=true — no flicker
    }, AUTO_REFRESH_MS);
  } else if (page === 'admin') {
    _autoRefreshInterval = setInterval(function() {
      if (STATE.currentPage !== 'admin') { stopAutoRefresh(); return; }
      var dash = document.getElementById('admin-dashboard-panel');
      if (dash && dash.style.display !== 'none') {
        renderAdminOrders(STATE.currentFilter, true); // silent=true — no flicker
      }
    }, AUTO_REFRESH_MS);
  }
}

function stopAutoRefresh() {
  if (_autoRefreshInterval) {
    clearInterval(_autoRefreshInterval);
    _autoRefreshInterval = null;
  }
}

function navigate(page) {
  $$('.page').forEach(p => p.classList.remove('active'));
  const target = $('#page-' + page);
  if (target) { target.classList.add('active'); window.scrollTo({ top:0, behavior:'smooth' }); }
  STATE.currentPage = page;
  $$('.nav-links a, .mobile-nav a').forEach(a => a.classList.toggle('active', a.dataset.page === page));
  $('.mobile-nav').classList.remove('open');

  if (page === 'menu')   renderMenu('all');
  if (page === 'cart')   renderCart();
  if (page === 'status') renderStatusPage();
  if (page === 'admin')  renderAdmin();
  if (page === 'login')  renderLoginPage();

  // Start auto-refresh for status/admin pages, stop for all others
  if (page === 'status' || page === 'admin') {
    startAutoRefresh(page);
  } else {
    stopAutoRefresh();
  }

  updateNavUI();
}

function updateNavUI() {
  const user   = getLoggedInUser();
  const btn    = document.getElementById('nav-login-btn');
  if (!btn) return;

  const textEl = btn.querySelector('.nav-login-text');
  const iconEl = btn.querySelector('.nav-login-icon');

  if (user) {
    if (textEl) textEl.textContent = user.name || user.studentId;
    if (iconEl) iconEl.textContent = '👤';
    btn.style.borderColor = 'var(--orange)';
    btn.style.color       = 'var(--orange)';
  } else {
    if (textEl) textEl.textContent = 'Login';
    if (iconEl) iconEl.textContent = '👤';
    btn.style.borderColor = '';
    btn.style.color       = '';
  }

  // Mobile nav
  const mobileBtn = document.getElementById('mobile-login-btn');
  if (mobileBtn) {
    mobileBtn.textContent = user ? ('👤 ' + (user.name || user.studentId)) : '👤 Login';
  }

  // Toggle Order Status / Menu Management nav links based on user role
  const statusLinks = $$('[data-page="status"]');
  const adminLinks  = $$('[data-page="admin"]');

  if (STATE.adminLoggedIn) {
    // Admin logged in → Change to "Menu Management", Hide Admin link
    statusLinks.forEach(link => {
      link.style.display = '';
      // Check current text to determine format (desktop vs mobile with emoji)
      const currentText = link.textContent.trim();
      if (currentText.startsWith('📦') || currentText.startsWith('📋')) {
        link.textContent = '📋 Menu Management';
      } else {
        link.textContent = 'Menu Management';
      }
    });
    adminLinks.forEach(link => link.style.display = 'none');
  } else if (user) {
    // Student logged in → Show Order Status, Hide Admin
    statusLinks.forEach(link => {
      link.style.display = '';
      const currentText = link.textContent.trim();
      if (currentText.startsWith('📦') || currentText.startsWith('📋')) {
        link.textContent = '📦 Order Status';
      } else {
        link.textContent = 'Order Status';
      }
    });
    adminLinks.forEach(link => link.style.display = 'none');
  } else {
    // Not logged in → Show both with default text
    statusLinks.forEach(link => {
      link.style.display = '';
      const currentText = link.textContent.trim();
      if (currentText.startsWith('📦') || currentText.startsWith('📋')) {
        link.textContent = '📦 Order Status';
      } else {
        link.textContent = 'Order Status';
      }
    });
    adminLinks.forEach(link => link.style.display = '');
  }

  // Re-render student panel inside dropdown only if it's open
  const dd = document.getElementById('login-dropdown');
  if (dd && dd.classList.contains('open')) {
    renderStudentDropdownPanel();
  }
}

// ─── DROPDOWN TOGGLE ───
function toggleLoginDropdown(e) {
  if (e) e.stopPropagation();
  const dd  = document.getElementById('login-dropdown');
  const btn = document.getElementById('nav-login-btn');
  if (!dd) return;
  const isOpen = dd.classList.contains('open');
  closeLoginDropdown();
  if (!isOpen) {
    dd.classList.add('open');
    if (btn) btn.classList.add('active');
    renderStudentDropdownPanel(); // Always re-render fresh on open
  }
}

function closeLoginDropdown() {
  const dd  = document.getElementById('login-dropdown');
  const btn = document.getElementById('nav-login-btn');
  if (dd)  dd.classList.remove('open');
  if (btn) btn.classList.remove('active');
}

// Close on outside click
document.addEventListener('click', e => {
  const wrap = document.querySelector('.nav-login-wrap');
  if (wrap && !wrap.contains(e.target)) closeLoginDropdown();
});

// ─── TAB SWITCHER ───
window.switchLoginDropdownTab = function(tab) {
  const sp = document.getElementById('ld-student-panel');
  const ap = document.getElementById('ld-admin-panel');
  const ts = document.getElementById('ld-tab-student');
  const ta = document.getElementById('ld-tab-admin');
  if (!sp || !ap) return;
  if (tab === 'student') {
    sp.style.display = 'block'; ap.style.display = 'none';
    if (ts) ts.classList.add('active');    if (ta) ta.classList.remove('active');
  } else {
    sp.style.display = 'none';  ap.style.display = 'block';
    if (ta) ta.classList.add('active');    if (ts) ts.classList.remove('active');
  }
};

// ─── STUDENT PANEL RENDERER ───
function renderStudentDropdownPanel() {
  const sp = document.getElementById('ld-student-panel');
  if (!sp) return;
  const user = getLoggedInUser();

  if (user && user.role !== 'admin') {
    // ── Logged-in: Profile + My Orders tabs ──
    sp.innerHTML =
      '<div class="ld-profile-box">' +
        '<div class="ld-profile-name">👤 ' + (user.name || user.studentId) + '</div>' +
        '<div class="ld-profile-id">' + (user.studentId || '') + (user.department ? ' · ' + user.department : '') + '</div>' +
        '<span class="ld-profile-role">🎓 Student</span>' +
      '</div>' +
      '<div class="ld-inner-tabs">' +
        '<button class="ld-inner-tab active" id="ld-itab-profile" onclick="switchStudentTab(&quot;profile&quot;)">Profile</button>' +
        '<button class="ld-inner-tab" id="ld-itab-orders" onclick="switchStudentTab(&quot;orders&quot;)">My Orders</button>' +
      '</div>' +
      '<div id="ld-profile-content">' +
        '<div class="ld-info-row"><span class="ld-info-label">Student ID</span><span class="ld-info-val">' + (user.studentId || '—') + '</span></div>' +
        (user.name ? '<div class="ld-info-row"><span class="ld-info-label">Name</span><span class="ld-info-val">' + user.name + '</span></div>' : '') +
        (user.department ? '<div class="ld-info-row"><span class="ld-info-label">Dept.</span><span class="ld-info-val">' + user.department + '</span></div>' : '') +
        '<button class="ld-btn-danger" id="ld-student-logout-btn" style="margin-top:12px">Logout</button>' +
      '</div>' +
      '<div id="ld-orders-content" style="display:none">' +
        '<div class="ld-oh-loading">⏳ Loading...</div>' +
      '</div>';

    document.getElementById('ld-student-logout-btn').addEventListener('click', () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('lastOrderId');
      localStorage.removeItem('suspension_info');
      localStorage.removeItem('knownOrderIds');
      STATE.adminLoggedIn = false;
      showToast('Logged out', 'success');
      closeLoginDropdown();
      updateNavUI();
      navigate('home');
    });

  } else {
    // Login / Register form
    sp.innerHTML =
      '<div class="ld-auth-tabs">' +
        '<button class="ld-auth-tab active" id="ld-auth-tab-login" onclick="switchDropdownAuthTab(\'login\')">Login</button>' +
        '<button class="ld-auth-tab" id="ld-auth-tab-register" onclick="switchDropdownAuthTab(\'register\')">Register</button>' +
      '</div>' +
      '<div id="ld-login-form">' +
        '<div class="ld-group"><label>Student ID</label><input id="ld-login-id" class="ld-input" type="text" placeholder="e.g. STU2024001"></div>' +
        '<div class="ld-group"><label>Password</label><input id="ld-login-pass" class="ld-input" type="password" placeholder="••••••••"></div>' +
        '<button class="ld-btn-primary" id="ld-login-btn">Login</button>' +
        '<div class="ld-switch">New here? <span onclick="switchDropdownAuthTab(\'register\')">Register</span></div>' +
      '</div>' +
      '<div id="ld-register-form" style="display:none">' +
        '<div class="ld-group"><label>Full Name</label><input id="ld-reg-name" class="ld-input" type="text" placeholder="Your full name"></div>' +
        '<div class="ld-group"><label>Student ID</label><input id="ld-reg-id" class="ld-input" type="text" placeholder="e.g. STU2024001"></div>' +
        '<div class="ld-group"><label>Department <span style="font-size:10px;color:#282f45">(optional)</span></label><input id="ld-reg-dept" class="ld-input" type="text" placeholder="e.g. Computer Science"></div>' +
        '<div class="ld-group"><label>Password</label><input id="ld-reg-pass" class="ld-input" type="password" placeholder="Min. 6 characters"></div>' +
        '<button class="ld-btn-primary" id="ld-register-btn">Register</button>' +
        '<div class="ld-switch">Have an account? <span onclick="switchDropdownAuthTab(\'login\')">Login</span></div>' +
      '</div>';

    attachDropdownAuthListeners();
  }
}

window.switchDropdownAuthTab = function(tab) {
  const lf = document.getElementById('ld-login-form');
  const rf = document.getElementById('ld-register-form');
  const tl = document.getElementById('ld-auth-tab-login');
  const tr = document.getElementById('ld-auth-tab-register');
  if (!lf || !rf) return;
  if (tab === 'login') {
    lf.style.display = 'block'; rf.style.display = 'none';
    if (tl) tl.classList.add('active');   if (tr) tr.classList.remove('active');
  } else {
    lf.style.display = 'none';  rf.style.display = 'block';
    if (tl) tl.classList.remove('active'); if (tr) tr.classList.add('active');
  }
};

function attachDropdownAuthListeners() {
  // Login
  const loginBtn = document.getElementById('ld-login-btn');
  if (loginBtn) {
    loginBtn.addEventListener('click', async () => {
      const studentId = document.getElementById('ld-login-id').value.trim();
      const password  = document.getElementById('ld-login-pass').value;
      if (!studentId || !password) { showToast('Enter Student ID and password', 'error'); return; }
      loginBtn.disabled = true; loginBtn.textContent = 'Logging in...';
      const res = await apiRequest('/auth/login', 'POST', { studentId, password });
      loginBtn.disabled = false; loginBtn.textContent = 'Login';
      if (res.token) {
        localStorage.setItem('token', res.token);
        localStorage.setItem('user', JSON.stringify(res.user));
        showToast('Welcome, ' + (res.user.name || studentId) + '!', 'success');
        closeLoginDropdown();
        updateNavUI();
        navigate('menu');
      } else {
        showToast(res.msg || 'Login failed', 'error');
      }
    });
    const passEl = document.getElementById('ld-login-pass');
    if (passEl) passEl.addEventListener('keydown', e => { if (e.key === 'Enter') loginBtn.click(); });
  }

  // Register
  const regBtn = document.getElementById('ld-register-btn');
  if (regBtn) {
    regBtn.addEventListener('click', async () => {
      const name       = document.getElementById('ld-reg-name').value.trim();
      const studentId  = document.getElementById('ld-reg-id').value.trim();
      const department = document.getElementById('ld-reg-dept').value.trim();
      const password   = document.getElementById('ld-reg-pass').value;
      if (!name || !studentId || !password) { showToast('Fill all required fields', 'error'); return; }
      regBtn.disabled = true; regBtn.textContent = 'Registering...';
      const res = await apiRequest('/auth/register', 'POST', { name, department, studentId, password });
      regBtn.disabled = false; regBtn.textContent = 'Register';
      if (res.msg === 'Registration successful') {
        showToast('Registered! Please login.', 'success');
        switchDropdownAuthTab('login');
      } else {
        showToast(res.error || res.msg || 'Registration failed', 'error');
      }
    });
  }
}

// ═══════════════════════════════════════════════
// STUDENT DROPDOWN — My Orders Tab
// ═══════════════════════════════════════════════
window.switchStudentTab = function(tab) {
  const profileContent = document.getElementById('ld-profile-content');
  const ordersContent  = document.getElementById('ld-orders-content');
  const itabProfile    = document.getElementById('ld-itab-profile');
  const itabOrders     = document.getElementById('ld-itab-orders');
  if (!profileContent || !ordersContent) return;

  if (tab === 'profile') {
    profileContent.style.display = 'block';
    ordersContent.style.display  = 'none';
    if (itabProfile) itabProfile.classList.add('active');
    if (itabOrders)  itabOrders.classList.remove('active');
  } else {
    profileContent.style.display = 'none';
    ordersContent.style.display  = 'block';
    if (itabProfile) itabProfile.classList.remove('active');
    if (itabOrders)  itabOrders.classList.add('active');
    loadDropdownOrderHistory(ordersContent);
  }
};

async function loadDropdownOrderHistory(containerEl) {
  if (!containerEl) return;
  containerEl.innerHTML = '<div class="ld-oh-loading">⏳ Loading...</div>';

  let orders = [];
  const res = await apiRequest('/orders/my');
  if (!res.error && Array.isArray(res)) {
    orders = res;
  } else {
    // Fallback: fetch from knownOrderIds
    const knownIds = JSON.parse(localStorage.getItem('knownOrderIds') || '[]');
    const lastId   = localStorage.getItem('lastOrderId');
    if (lastId && !knownIds.includes(lastId)) knownIds.push(lastId);
    if (knownIds.length > 0) {
      const results = await Promise.all(knownIds.map(id => apiRequest('/orders/' + id)));
      orders = results.filter(r => r && r._id);
    }
  }

  if (orders.length === 0) {
    containerEl.innerHTML =
      '<div class="ld-oh-empty">🍽️<p>No orders yet!</p></div>';
    return;
  }

  orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const statusColors = {
    'Pending':          ['rgba(255,152,0,0.15)',  '#ffb300'],
    'Preparing':        ['rgba(33,150,243,0.12)', '#64b5f6'],
    'Ready':            ['rgba(76,175,80,0.15)',  '#81c784'],
    'Out for Delivery': ['rgba(156,39,176,0.12)', '#ce93d8'],
    'Delivered':        ['rgba(76,175,80,0.12)',  '#66bb6a'],
    'Cancelled':        ['rgba(244,67,54,0.12)',  '#ef9a9a'],
  };

  const totalSpent = orders.filter(o => o.status !== 'Cancelled').reduce((s, o) => s + (o.total || 0), 0);
  const delivered  = orders.filter(o => o.status === 'Delivered').length;

  containerEl.innerHTML =
    '<div class="ld-oh-stats">' +
      '<div class="ld-oh-stat"><span class="ld-oh-num">' + orders.length + '</span><span class="ld-oh-lbl">Total</span></div>' +
      '<div class="ld-oh-stat"><span class="ld-oh-num">' + delivered + '</span><span class="ld-oh-lbl">Done</span></div>' +
      '<div class="ld-oh-stat"><span class="ld-oh-num">' + fmt(totalSpent) + '</span><span class="ld-oh-lbl">Spent</span></div>' +
    '</div>' +
    '<div class="ld-oh-list">' +
    orders.map(o => {
      const date  = o.createdAt ? new Date(o.createdAt).toLocaleString('en-IN', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit', hour12:true }) : 'N/A';
      const items = (o.items || []).map(i => i.name + (i.quantity > 1 ? ' ×' + i.quantity : '')).join(', ');
      const statusIdx = ORDER_STATUSES.findIndex(s => s === o.status);
      const emoji = STATUS_EMOJIS[statusIdx >= 0 ? statusIdx : 0] || '📦';
      const [sbg, sfg] = statusColors[o.status] || ['rgba(150,150,150,0.1)', '#888'];
      return '<div class="ld-oh-card">' +
        '<div class="ld-oh-card-top">' +
          '<span class="ld-oh-token">#' + o._id.slice(-6).toUpperCase() + '</span>' +
          '<span class="ld-oh-badge" style="background:' + sbg + ';color:' + sfg + '">' + emoji + ' ' + o.status + '</span>' +
        '</div>' +
        '<div class="ld-oh-items">' + items + '</div>' +
        '<div class="ld-oh-card-bot">' +
          '<span class="ld-oh-date">' + date + '</span>' +
          '<span class="ld-oh-total">' + fmt(o.total) + '</span>' +
        '</div>' +
      '</div>';
    }).join('') +
    '</div>';
}

// ═══════════════════════════════════════════════
// CART HELPERS
// ═══════════════════════════════════════════════
function getCartTotal() { return STATE.cart.reduce((s, i) => s + i.price * i.qty, 0); }
function getCartCount() { return STATE.cart.reduce((s, i) => s + i.qty, 0); }

function updateCartUI() {
  const count = getCartCount();
  const badge = $('.cart-count');
  if (!badge) return;
  badge.textContent = count;
  if (count > 0) { badge.classList.add('pop'); setTimeout(() => badge.classList.remove('pop'), 200); }

  const bar = $('.cart-bar');
  if (!bar) return;
  if (count > 0 && STATE.currentPage === 'menu') {
    bar.classList.add('visible');
    bar.querySelector('.cart-bar-count').textContent = count + ' item' + (count !== 1 ? 's' : '') + ' in cart';
    bar.querySelector('.cart-bar-total').textContent = fmt(getCartTotal());
  } else {
    bar.classList.remove('visible');
  }
}

function addToCart(item) {
  if (!item) return;
  const ex = STATE.cart.find(i => i.id === item.id);
  if (ex) { ex.qty++; } else { STATE.cart.push(Object.assign({}, item, { qty: 1 })); }
  updateCartUI();
  showToast(item.name + ' added!', 'success', 1800);
}

function removeFromCart(id) {
  const idx = STATE.cart.findIndex(i => i.id === id);
  if (idx === -1) return;
  if (STATE.cart[idx].qty > 1) { STATE.cart[idx].qty--; } else { STATE.cart.splice(idx, 1); }
  updateCartUI();
}

function removeItemCompletely(id) {
  STATE.cart = STATE.cart.filter(i => i.id !== id);
  updateCartUI();
  renderCart();
}

function removeUnavailableItems() {
  STATE.cart = STATE.cart.filter(cartItem => getItemAvailability(cartItem.id));
  updateCartUI();
  renderCart();
  showToast('Unavailable items removed from cart', 'success');
}

window.removeUnavailableItems = removeUnavailableItems;

// ═══════════════════════════════════════════════
// MENU RENDER
// ═══════════════════════════════════════════════
function renderMenu(filter) {
  const container = $('#menu-grid-container');
  if (!container) return;
  container.innerHTML = '';

  const cats = filter === 'all' ? Object.entries(MENU) : [[filter, MENU[filter] || []]];
  const catLabels = { snacks:'🍿 Snacks', meals:'🍱 Meals', drinks:'🥤 Drinks' };

  cats.forEach(([catKey, items]) => {
    if (!items || items.length === 0) return;
    const sec = mkEl('div', 'menu-category');
    sec.innerHTML = '<div class="category-label"><span class="cat-dot"></span><h2>' + catLabels[catKey] + '</h2><span class="cat-count">' + items.length + ' items</span></div>';
    const grid = mkEl('div', 'menu-grid');

    items.forEach(item => {
      const isAvailable = getItemAvailability(item.id);
      const cartItem = STATE.cart.find(i => i.id === item.id);
      const qty      = cartItem ? cartItem.qty : 0;
      
      // Show "Out of Stock" badge if unavailable, else show normal add/qty controls
      const qtyHTML  = !isAvailable
        ? '<div class="out-of-stock-badge">Out of Stock</div>'
        : qty === 0
          ? '<button class="add-btn" data-id="' + item.id + '">Add +</button>'
          : '<div class="qty-control"><button class="qty-btn minus" data-id="' + item.id + '">−</button><span class="qty-num">' + qty + '</span><button class="qty-btn plus" data-id="' + item.id + '">+</button></div>';

      const cardClass = 'food-card' + (!isAvailable ? ' unavailable' : '');
      const card     = mkEl('div', cardClass);

      card.innerHTML =
        '<div class="food-card-img">' +
          '<img src="' + item.img + '" alt="' + item.name + '" loading="lazy" onerror="this.style.background=\'linear-gradient(135deg,#FF6B35,#FFB300)\';this.style.opacity=\'0.6\'">' +
          '<div class="food-veg-badge ' + (item.veg ? 'veg' : 'non-veg') + '"></div>' +
          (!isAvailable ? '<div class="unavailable-overlay">UNAVAILABLE</div>' : '') +
        '</div>' +
        '<div class="food-card-body">' +
          '<div class="food-card-name">' + item.name + '</div>' +
          '<div class="food-card-desc">' + item.desc + '</div>' +
          '<div class="food-card-footer"><div class="food-price">' + fmt(item.price) + '</div>' + qtyHTML + '</div>' +
        '</div>';
      grid.appendChild(card);
    });

    sec.appendChild(grid);
    container.appendChild(sec);
  });

  $$('.add-btn', container).forEach(btn => {
    btn.addEventListener('click', () => { addToCart(findItem(+btn.dataset.id)); renderMenu(filter); });
  });
  $$('.qty-btn.plus', container).forEach(btn => {
    btn.addEventListener('click', () => { addToCart(findItem(+btn.dataset.id)); renderMenu(filter); });
  });
  $$('.qty-btn.minus', container).forEach(btn => {
    btn.addEventListener('click', () => { removeFromCart(+btn.dataset.id); renderMenu(filter); });
  });
}

// ═══════════════════════════════════════════════
// CART RENDER
// ═══════════════════════════════════════════════
function renderCart() {
  const cartPage  = $('#page-cart');
  const itemsEl   = $('#cart-items');
  const emptyEl   = $('#cart-empty');
  const summaryEl = $('#order-summary');
  if (!cartPage || !itemsEl) return;

  ['suspension-banner','cancel-warning-bar','recent-orders-panel'].forEach(id => {
    const old = document.getElementById(id); if (old) old.remove();
  });

  const cartHeader   = cartPage.querySelector('.cart-page-header');
  const suspInfo     = getSuspensionInfo();
  const suspended    = suspInfo.suspended;
  const cancelCount  = suspInfo.cancelCount;

  if (suspended) {
    const daysLeft = suspInfo.daysLeft;
    const banner   = mkEl('div', 'suspension-banner');
    banner.id = 'suspension-banner';
    banner.innerHTML =
      '<div class="sb-icon">🚫</div>' +
      '<div class="sb-body">' +
        '<div class="sb-title">Account Suspended</div>' +
        '<div class="sb-desc">You cancelled more than <strong>' + CANCEL_LIMIT + '</strong> orders in 30 days. ' +
        'Ordering is disabled for <strong>' + daysLeft + ' more day' + (daysLeft !== 1 ? 's' : '') + '</strong>.</div>' +
        '<div class="sb-meta">Suspension lifts automatically. Please plan your orders carefully.</div>' +
      '</div>' +
      '<div class="sb-days"><div class="sb-days-num">' + daysLeft + '</div><div class="sb-days-label">day' + (daysLeft !== 1 ? 's' : '') + ' left</div></div>';
    if (cartHeader) cartHeader.insertAdjacentElement('afterend', banner);

  } else if (cancelCount > 0) {
    const warnBar = mkEl('div', 'cancel-warning-bar');
    warnBar.id = 'cancel-warning-bar';
    warnBar.innerHTML =
      '<span class="cw-icon">⚠️</span>' +
      '<span class="cw-text">You have cancelled <strong>' + cancelCount + '/' + CANCEL_LIMIT + '</strong> orders in the last 30 days. ' +
      'Exceeding <strong>' + CANCEL_LIMIT + '</strong> will suspend your account for ' + SUSPEND_DAYS + ' days.</span>';
    if (cartHeader) cartHeader.insertAdjacentElement('afterend', warnBar);
  }

  if (STATE.cart.length === 0) {
    emptyEl.style.display   = 'block';
    itemsEl.innerHTML       = '';
    summaryEl.style.display = 'none';
  } else {
    emptyEl.style.display   = 'none';
    summaryEl.style.display = 'block';
    itemsEl.innerHTML       = '';

    // Check for unavailable items in cart
    const unavailableItems = STATE.cart.filter(cartItem => !getItemAvailability(cartItem.id));
    if (unavailableItems.length > 0) {
      const unavailBanner = mkEl('div', 'cart-unavail-banner');
      unavailBanner.innerHTML =
        '<div class="cub-icon">⚠️</div>' +
        '<div class="cub-body">' +
          '<div class="cub-title">Items No Longer Available</div>' +
          '<div class="cub-desc">Some items in your cart are now out of stock. Please remove them before placing order.</div>' +
        '</div>' +
        '<button class="cub-btn" onclick="removeUnavailableItems()">Remove All</button>';
      itemsEl.appendChild(unavailBanner);
    }

    STATE.cart.forEach(item => {
      const isAvailable = getItemAvailability(item.id);
      const div = mkEl('div', 'cart-item' + (!isAvailable ? ' cart-item-unavailable' : ''));
      div.innerHTML =
        '<div class="cart-item-img"><img src="' + item.img + '" alt="' + item.name + '" onerror="this.style.background=\'linear-gradient(135deg,#FF6B35,#FFB300)\'"></div>' +
        '<div class="cart-item-info">' +
          '<div class="cart-item-name">' + item.name + (!isAvailable ? ' <span class="unavail-tag">Out of Stock</span>' : '') + '</div>' +
          '<div class="cart-item-cat">' + (item.veg ? '🟢 Veg' : '🔴 Non-Veg') + '</div>' +
          '<div class="cart-item-price">' + fmt(item.price) + ' × ' + item.qty + ' = ' + fmt(item.price * item.qty) + '</div>' +
        '</div>' +
        '<div class="cart-item-actions">' +
          '<button class="remove-btn" data-id="' + item.id + '">🗑</button>' +
          '<div class="qty-control">' +
            '<button class="qty-btn minus" data-id="' + item.id + '">−</button>' +
            '<span class="qty-num">' + item.qty + '</span>' +
            '<button class="qty-btn plus" data-id="' + item.id + '">+</button>' +
          '</div>' +
        '</div>';
      itemsEl.appendChild(div);
    });

    const subtotal = getCartTotal();
    const tax      = Math.round(subtotal * 0.05);
    $('#summary-subtotal').textContent = fmt(subtotal);
    $('#summary-tax').textContent      = fmt(tax);
    $('#summary-total').textContent    = fmt(subtotal + tax);

    $$('#cart-items .qty-btn.plus').forEach(b  => b.addEventListener('click', () => { addToCart(findItem(+b.dataset.id)); renderCart(); }));
    $$('#cart-items .qty-btn.minus').forEach(b => b.addEventListener('click', () => { removeFromCart(+b.dataset.id); renderCart(); }));
    $$('#cart-items .remove-btn').forEach(b    => b.addEventListener('click', () => { removeItemCompletely(+b.dataset.id); }));

    const checkoutBtn = $('#checkout-btn');
    if (checkoutBtn) checkoutBtn.disabled = suspended || unavailableItems.length > 0;
  }
}

// ═══════════════════════════════════════════════
// SUSPENSION INFO (synced from backend responses)
// ═══════════════════════════════════════════════
function getSuspensionInfo() {
  try {
    const raw = localStorage.getItem('suspension_info');
    if (!raw) return { suspended: false, cancelCount: 0, daysLeft: 0 };
    const info = JSON.parse(raw);
    if (info.suspendedUntil) {
      const now   = new Date();
      const until = new Date(info.suspendedUntil);
      if (now < until) {
        const daysLeft = Math.ceil((until - now) / MS_DAY);
        return { suspended: true, cancelCount: info.cancelCount || 0, daysLeft };
      } else {
        localStorage.removeItem('suspension_info');
        return { suspended: false, cancelCount: 0, daysLeft: 0 };
      }
    }
    return { suspended: false, cancelCount: info.cancelCount || 0, daysLeft: 0 };
  } catch {
    return { suspended: false, cancelCount: 0, daysLeft: 0 };
  }
}

function saveSuspensionInfo(suspendedUntil, cancellations) {
  localStorage.setItem('suspension_info', JSON.stringify({
    suspendedUntil: suspendedUntil || null,
    cancelCount: cancellations || 0
  }));
}

// ═══════════════════════════════════════════════
// CANCEL CONFIRM MODAL
// ═══════════════════════════════════════════════
function showCancelConfirm(orderId) {
  const old = document.getElementById('cancel-confirm-overlay');
  if (old) old.remove();

  const suspInfo  = getSuspensionInfo();
  const count     = suspInfo.cancelCount;
  const willHit   = (count + 1) >= CANCEL_LIMIT;

  const warnHTML = willHit
    ? '<div class="cancel-warn-box"><span>🚨</span><span>This cancellation may <strong>suspend your account for ' + SUSPEND_DAYS + ' days</strong>!</span></div>'
    : '<div class="cancel-info-box"><span>⚠️</span><span>After this: <strong>' + (count + 1) + '/' + CANCEL_LIMIT + '</strong> cancellations in 30 days.</span></div>';

  const overlay = mkEl('div', 'modal-overlay');
  overlay.id    = 'cancel-confirm-overlay';
  overlay.innerHTML =
    '<div class="confirm-modal" style="max-width:420px">' +
      '<div class="confirm-animation" style="background:linear-gradient(135deg,#f44336,#b71c1c)">✕</div>' +
      '<h2 class="confirm-title">Cancel Order?</h2>' +
      '<p class="confirm-sub">This action cannot be undone.</p>' +
      warnHTML +
      '<div class="confirm-actions" style="margin-top:20px">' +
        '<button class="btn-outline" id="cancel-dismiss-btn">Keep Order</button>' +
        '<button class="btn-primary" id="cancel-confirm-btn" style="background:linear-gradient(135deg,#f44336,#b71c1c);box-shadow:0 6px 20px rgba(244,67,54,0.4)">Yes, Cancel</button>' +
      '</div>' +
    '</div>';

  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add('show'));

  const closeModal = () => { overlay.classList.remove('show'); setTimeout(() => overlay.remove(), 300); };

  document.getElementById('cancel-dismiss-btn').addEventListener('click', closeModal);
  overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
  document.getElementById('cancel-confirm-btn').addEventListener('click', () => {
    closeModal();
    doCancelOrder(orderId);
  });
}

async function doCancelOrder(orderId) {
  if (!getToken()) {
    showToast('Please login first!', 'error');
    toggleLoginDropdown(null);
    return;
  }

  const suspInfo = getSuspensionInfo();
  if (suspInfo.suspended) {
    showToast('🚫 Account suspended. You cannot cancel orders.', 'error', 4000);
    return;
  }

  const res = await apiRequest('/orders/cancel/' + orderId, 'POST');

  if (res.error) {
    showToast(res.error, 'error');
    return;
  }
  if (res.msg && res.msg !== 'Order cancelled') {
    showToast(res.msg, 'error');
    return;
  }

  // Update suspension info from backend response
  saveSuspensionInfo(res.suspendedUntil, res.cancellations);

  if (res.suspendedUntil) {
    showToast('Order cancelled. ⚠️ Account suspended for ' + SUSPEND_DAYS + ' days!', 'error', 6000);
  } else {
    const rem = CANCEL_LIMIT - (res.cancellations || 0);
    showToast('Order cancelled. ' + rem + ' cancellation' + (rem !== 1 ? 's' : '') + ' remaining before suspension.', 'info', 3500);
  }

  renderCart();
  renderStatusPage();
}

// ═══════════════════════════════════════════════
// PAYMENT OPTIONS
// ═══════════════════════════════════════════════
var selectedPayment = 'cash';

function initPaymentOpts() {
  $$('.pay-opt').forEach(opt => {
    opt.addEventListener('click', () => {
      $$('.pay-opt').forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
      selectedPayment = opt.dataset.value;
    });
  });
  const first = $('.pay-opt');
  if (first) first.classList.add('selected');
}

// ═══════════════════════════════════════════════
// PLACE ORDER
// ═══════════════════════════════════════════════
async function placeOrder() {
  if (!getToken()) {
    showToast('Please login first to place an order!', 'error');
    setTimeout(() => toggleLoginDropdown(null), 1200);
    return;
  }

  if (STATE.cart.length === 0) {
    showToast('Your cart is empty!', 'error');
    return;
  }

  // CHECK: Validate all items are still available
  const unavailableItems = STATE.cart.filter(cartItem => !getItemAvailability(cartItem.id));
  if (unavailableItems.length > 0) {
    const itemNames = unavailableItems.map(i => i.name).join(', ');
    showToast('⚠️ Some items are now unavailable: ' + itemNames + '. Please remove them from cart.', 'error', 5000);
    
    // Auto-remove unavailable items and refresh cart
    STATE.cart = STATE.cart.filter(cartItem => getItemAvailability(cartItem.id));
    updateCartUI();
    renderCart();
    return;
  }

  const suspInfo = getSuspensionInfo();
  if (suspInfo.suspended) {
    showToast('🚫 Account suspended. ' + suspInfo.daysLeft + ' day' + (suspInfo.daysLeft !== 1 ? 's' : '') + ' remaining.', 'error', 4500);
    return;
  }

  const checkoutBtn = document.getElementById('checkout-btn');
  if (checkoutBtn) { checkoutBtn.disabled = true; checkoutBtn.textContent = 'Placing order...'; }

  const items    = STATE.cart.map(i => ({ name: i.name, price: i.price, quantity: i.qty }));
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const tax      = Math.round(subtotal * 0.05);
  const total    = subtotal + tax;

  const res = await apiRequest('/orders/create', 'POST', { items, total });

  if (checkoutBtn) { checkoutBtn.disabled = false; checkoutBtn.textContent = 'Place Order 🚀'; }

  if (res.error) {
    showToast(res.error, 'error');
    return;
  }

  // Save for status tracking
  localStorage.setItem('lastOrderId', res.orderId);
  // Also push to knownOrderIds array for short-token resolution
  const knownIds = JSON.parse(localStorage.getItem('knownOrderIds') || '[]');
  if (res.orderId && !knownIds.includes(res.orderId)) {
    knownIds.push(res.orderId);
    localStorage.setItem('knownOrderIds', JSON.stringify(knownIds));
  }

  // Show the confirmation modal with the real token
  const tokenEl = document.getElementById('confirm-token');
  if (tokenEl) tokenEl.textContent = res.orderId ? '#' + res.orderId.slice(-6).toUpperCase() : '—';

  const overlay = document.getElementById('confirm-modal-overlay');
  if (overlay) overlay.classList.add('show');

  spawnConfetti();

  STATE.cart = [];
  updateCartUI();
}

// ═══════════════════════════════════════════════
// CONFETTI
// ═══════════════════════════════════════════════
(function() {
  const s = document.createElement('style');
  s.textContent = '@keyframes confettiFall { from { transform:translateY(0) rotate(0deg); opacity:1; } to { transform:translateY(100vh) rotate(720deg); opacity:0; } }';
  document.head.appendChild(s);
})();

function spawnConfetti() {
  const colors = ['#FF5722','#FFB300','#4CAF50','#2196F3','#9C27B0'];
  for (let i = 0; i < 60; i++) {
    const c = document.createElement('div');
    c.style.cssText = 'position:fixed;pointer-events:none;z-index:99999;top:' + (Math.random()*30) + '%;left:' + (Math.random()*100) + '%;width:' + (6+Math.random()*8) + 'px;height:' + (6+Math.random()*8) + 'px;background:' + colors[Math.floor(Math.random()*colors.length)] + ';border-radius:' + (Math.random()>0.5?'50%':'2px') + ';animation:confettiFall ' + (1.5+Math.random()*2) + 's ease forwards;';
    document.body.appendChild(c);
    setTimeout(() => c.remove(), 4000);
  }
}

// ═══════════════════════════════════════════════
// ORDER STATUS PAGE
// ═══════════════════════════════════════════════
function renderStatusPage() {
  const studentView = document.getElementById('status-student-view');
  const adminView = document.getElementById('status-admin-view');
  const resultEl   = document.getElementById('status-result');
  const tokenInput = document.getElementById('token-input');
  
  if (!studentView || !adminView) return;
  
  // Admin: Show Menu Management
  if (STATE.adminLoggedIn) {
    studentView.style.display = 'none';
    adminView.style.display = 'block';
    renderAdminMenuPage();
    return;
  }
  
  // Student: Show Order Tracking
  studentView.style.display = 'block';
  adminView.style.display = 'none';
  
  if (tokenInput) tokenInput.value = '';
  if (resultEl) {
    resultEl.style.display = 'none';
    resultEl.innerHTML = '';
  }

  // Auto-load ALL undelivered orders for logged-in student
  if (getToken()) {
    loadAllActiveOrders();
  }
}

// Load all active orders for the currently logged-in student from backend
async function loadAllActiveOrders(silent) {
  const resultEl = document.getElementById('status-result');
  if (!resultEl) return;
  if (STATE.adminLoggedIn) return;

  // Show loader only on first/manual load
  if (!silent) {
    resultEl.style.display = 'block';
    resultEl.innerHTML = '<div style="text-align:center;padding:30px;color:var(--text-mid)">⏳ Loading your orders...</div>';
  }

  const res = await apiRequest('/orders/my');

  if (res.error || !Array.isArray(res)) {
    if (!silent) resultEl.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-mid)"><div style="font-size:2.5rem;margin-bottom:12px">📭</div><p>No orders found.</p></div>';
    return;
  }

  const toShow = res.filter(r => r && r._id && r.status !== 'Delivered' && r.status !== 'Cancelled');
  toShow.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  if (toShow.length === 0) {
    if (!silent) resultEl.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-mid)"><div style="font-size:2.5rem;margin-bottom:12px">📭</div><p>No active orders found.</p></div>';
    return;
  }

  // Silent mode: re-render without loader — fast, no visible flash
  resultEl.style.display = 'block';
  resultEl.innerHTML = '';
  toShow.forEach(order => {
    const wrapper = document.createElement('div');
    wrapper.style.marginBottom = '20px';
    resultEl.appendChild(wrapper);
    renderOrderStatusInto(order, wrapper);
  });
}

async function loadOrderById(orderId) {
  if (!orderId) return;
  const resultEl = document.getElementById('status-result');
  if (!resultEl) return;

  resultEl.style.display = 'block';
  resultEl.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-mid)">⏳ Loading order...</div>';

  const res = await apiRequest('/orders/' + orderId);
  if (res.error || !res._id) {
    resultEl.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-mid)"><div style="font-size:3rem">❓</div><p>' + (res.error || 'Order not found') + '</p></div>';
    return;
  }
  resultEl.innerHTML = '';
  const wrapper = document.createElement('div');
  resultEl.appendChild(wrapper);
  renderOrderStatusInto(res, wrapper);
}

async function refreshOrderStatus() {
  const btn = document.getElementById('refresh-status-btn');
  if (btn) btn.classList.add('spinning');

  const tokenInput = document.getElementById('token-input');
  const val = tokenInput ? tokenInput.value.trim().toUpperCase().replace('#', '') : '';

  if (val) {
    await loadMyOrders();
  } else {
    await loadAllActiveOrders();
  }

  if (btn) {
    setTimeout(() => btn.classList.remove('spinning'), 600);
  }
}

async function loadMyOrders() {
  const tokenInput = document.getElementById('token-input');
  const val = tokenInput ? tokenInput.value.trim().toUpperCase().replace('#','') : '';

  if (val) {
    // User typed a token — search for it in their orders
    const resultEl = document.getElementById('status-result');
    if (!resultEl) return;
    
    resultEl.style.display = 'block';
    resultEl.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-mid)">⏳ Searching...</div>';

    // Fetch all user's orders from backend
    const res = await apiRequest('/orders/my');
    
    if (!res.error && Array.isArray(res)) {
      // Find order matching the short token
      const order = res.find(o => o._id && o._id.slice(-6).toUpperCase() === val);
      
      if (order) {
        resultEl.innerHTML = '';
        const wrapper = document.createElement('div');
        resultEl.appendChild(wrapper);
        renderOrderStatusInto(order, wrapper);
      } else {
        resultEl.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-mid)"><div style="font-size:3rem">❓</div><p>Order not found</p><p style="font-size:0.85rem;color:var(--text-light);margin-top:8px">Token: ' + val + '</p></div>';
      }
    } else {
      resultEl.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-mid)"><div style="font-size:3rem">❓</div><p>Unable to load orders</p></div>';
    }
    return;
  }

  // No token typed — show all active orders
  await loadAllActiveOrders();
}

function resolveOrderId(input) {
  // Full MongoDB ObjectId (24 hex chars) - use as-is
  if (/^[a-fA-F0-9]{24}$/.test(input)) return input;

  // Collect all known full order IDs from localStorage
  const allIds = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key === 'lastOrderId') allIds.push(localStorage.getItem(key));
  }
  const extra = JSON.parse(localStorage.getItem('knownOrderIds') || '[]');
  extra.forEach(id => allIds.push(id));

  // Match last 6 chars of full ID against the short token user typed
  const match = allIds.filter(Boolean).find(id => id.slice(-6).toUpperCase() === input.toUpperCase());
  return match || input;
}

// Keep old name as alias for backwards compat (cancel modal etc.)
function renderOrderStatus(order) {
  const resultEl = document.getElementById('status-result');
  if (!resultEl) return;
  resultEl.style.display = 'block';
  resultEl.innerHTML = '';
  const wrapper = document.createElement('div');
  resultEl.appendChild(wrapper);
  renderOrderStatusInto(order, wrapper);
}

function renderOrderStatusInto(order, targetEl) {
  if (!targetEl) return;

  const isCancelled = order.status === 'Cancelled';
  const statusIdx   = ORDER_STATUSES.findIndex(s => s === order.status);
  const safeIdx     = statusIdx >= 0 ? statusIdx : 0;

  const stepperHTML = isCancelled
    ? '<div style="text-align:center;padding:32px 0;color:var(--text-mid)"><div style="font-size:3rem;margin-bottom:12px">❌</div><div style="font-weight:700;font-size:1.1rem">This order was cancelled.</div></div>'
    : '<div class="stepper">' +
        '<div class="stepper-track"><div class="stepper-progress" style="width:' + (safeIdx / (ORDER_STATUSES.length - 1) * 100) + '%"></div></div>' +
        '<div class="stepper-steps">' +
          ORDER_STATUSES.map((s, i) => {
            const cls = i < safeIdx ? 'done' : i === safeIdx ? 'active' : '';
            return '<div class="step ' + cls + '"><div class="step-circle">' + (i < safeIdx ? '✓' : STATUS_EMOJIS[i]) + '</div><div class="step-label">' + s + '</div></div>';
          }).join('') +
        '</div>' +
      '</div>';

  const statusBadgeHTML = isCancelled
    ? '<span class="status-badge" style="background:#fce4ec;color:#b71c1c">✕ Cancelled</span>'
    : '<span class="status-badge ' + STATUS_KEYS[safeIdx] + '">' + STATUS_EMOJIS[safeIdx] + ' ' + ORDER_STATUSES[safeIdx] + '</span>';

  const itemsHTML = (order.items || []).map(i =>
    '<div class="preview-item">' +
      '<span class="preview-item-name">' + i.name + ' × ' + i.quantity + '</span>' +
      '<span class="preview-item-price">' + fmt(i.price * i.quantity) + '</span>' +
    '</div>'
  ).join('');

  let cancelBtnHTML = '';
  if (!isCancelled && order.status === 'Pending' && getToken()) {
    cancelBtnHTML = '<button class="btn-secondary cancel-order-link" onclick="showCancelConfirm(\'' + order._id + '\')">✕ Cancel This Order</button>';
  }

  const orderDate = order.createdAt
    ? new Date(order.createdAt).toLocaleString('en-IN', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit', hour12:true })
    : 'N/A';

  targetEl.innerHTML =
    '<div class="status-card">' +
      '<div class="status-order-info">' +
        '<div>' +
          '<div class="order-token-display">#' + (order._id ? order._id.slice(-6).toUpperCase() : 'N/A') + '</div>' +
          '<div class="order-date">' + orderDate + '</div>' +
        '</div>' +
        statusBadgeHTML +
      '</div>' +
      stepperHTML +
      '<div class="status-items-preview">' +
        '<h4>Your Order</h4>' +
        '<div class="preview-items">' +
          itemsHTML +
          '<div class="preview-item" style="margin-top:8px;padding-top:8px;border-top:1px solid var(--border)">' +
            '<span style="font-weight:700">Total (incl. GST)</span>' +
            '<span class="preview-item-price" style="font-size:1.05rem">' + fmt(order.total) + '</span>' +
          '</div>' +
        '</div>' +
      '</div>' +
      cancelBtnHTML +
    '</div>';
}

// ═══════════════════════════════════════════════
// ADMIN PANEL
// ═══════════════════════════════════════════════
function renderAdmin() {
  const loginPanel = document.getElementById('admin-login-panel');
  const dashboard = document.getElementById('admin-dashboard-panel');
  if (!loginPanel || !dashboard) return;

  // Check if admin token is already in localStorage (page refresh case)
  if (!STATE.adminLoggedIn) {
    const storedUser = getLoggedInUser();
    if (storedUser && storedUser.role === 'admin') {
      STATE.adminLoggedIn = true;
      updateNavUI(); // Update nav to show Menu Management
    }
  }

  if (!STATE.adminLoggedIn) {
    // Show login panel, hide dashboard
    loginPanel.style.display = 'flex';
    dashboard.style.display = 'none';

    // Attach login handler to existing button (only once)
    const btn = document.getElementById('admin-login-btn');
    if (btn && !btn.dataset.listenerAttached) {
      btn.dataset.listenerAttached = 'true';
      
      const doLogin = async () => {
        const username = document.getElementById('admin-user').value.trim();
        const password = document.getElementById('admin-pass').value;
        if (!username || !password) { showToast('Enter credentials', 'error'); return; }
        btn.disabled = true; btn.textContent = 'Logging in...';
        const res = await apiRequest('/admin/login', 'POST', { studentId: username, password });
        btn.disabled = false; btn.textContent = 'Login →';
        if (res.token && res.user && res.user.role === 'admin') {
          localStorage.setItem('token', res.token);
          localStorage.setItem('user', JSON.stringify(res.user));
          STATE.adminLoggedIn = true;
          showToast('Welcome, ' + (res.user.name || 'Admin') + '!', 'success');
          updateNavUI();
          renderAdmin();
          startAutoRefresh('admin');
        } else {
          showToast(res.msg || 'Invalid credentials', 'error');
        }
      };

      btn.addEventListener('click', doLogin);
      const passEl = document.getElementById('admin-pass');
      if (passEl) passEl.addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); });
    }
  } else {
    // Hide login panel, show dashboard
    loginPanel.style.display = 'none';
    dashboard.style.display = 'block';
    renderAdminOrders(STATE.currentFilter);
    startAutoRefresh('admin');
  }
}

async function refreshAdminDashboard() {
  const btn = document.getElementById('refresh-admin-btn');
  if (btn) btn.classList.add('spinning');

  await renderAdminOrders(STATE.currentFilter);

  if (btn) {
    setTimeout(() => btn.classList.remove('spinning'), 600);
  }
}

async function renderAdminOrders(filter, silent) {
  filter = filter || 'all';
  STATE.currentFilter = filter;

  $$('.filter-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.filter === filter));

  const list = document.getElementById('admin-orders-list');
  if (!list) return;

  // Show loader only on first/manual load
  if (!silent) {
    list.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-mid)">⏳ Loading orders...</div>';
  }

  // BUG FIX: use /admin/all which is before /:id in the route file
  const res = await apiRequest('/orders/admin/all');

  if (res.error) {
    list.innerHTML = '<div class="no-orders"><div class="empty-icon">⚠️</div><p>' + res.error + '</p></div>';
    return;
  }

  if (!Array.isArray(res) || res.length === 0) {
    list.innerHTML = '<div class="no-orders"><div class="empty-icon">📭</div><p>No orders yet. Orders placed by students will appear here.</p></div>';
    if (Array.isArray(res)) updateAdminStats([]);
    return;
  }

  STATE.adminOrders = res;
  updateAdminStats(res);

  let orders = res;
  if (filter !== 'all') {
    const filterMap = {
      pending: 'Pending', preparing: 'Preparing', ready: 'Ready',
      outfor:  'Out for Delivery', delivered: 'Delivered', cancelled: 'Cancelled'
    };
    const target = filterMap[filter];
    if (target) orders = res.filter(o => o.status === target);
  }

  if (orders.length === 0) {
    list.innerHTML = '<div class="no-orders"><div class="empty-icon">📭</div><p>No orders in this category.</p></div>';
    return;
  }

  list.innerHTML = orders.map(o => {
    const studentName = (o.userId && o.userId.name) ? o.userId.name : 'Unknown';
    const studentId   = (o.userId && o.userId.studentId) ? o.userId.studentId : '—';
    const orderDate   = o.createdAt ? new Date(o.createdAt).toLocaleString('en-IN', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit', hour12:true }) : 'N/A';
    const statusIdx   = ORDER_STATUSES.findIndex(s => s === o.status);
    const safeIdx     = statusIdx >= 0 ? statusIdx : 0;
    const isCancelled = o.status === 'Cancelled';
    const isDelivered = o.status === 'Delivered';

    const nextStatuses = { 'Pending':'Preparing', 'Preparing':'Ready', 'Ready':'Out for Delivery', 'Out for Delivery':'Delivered' };
    const nextStatus   = nextStatuses[o.status];
    const actionBtn    = (!isCancelled && !isDelivered && nextStatus)
      ? '<button class="btn-primary" style="padding:8px 16px;font-size:0.85rem" onclick="updateOrderStatus(\'' + o._id + '\',\'' + nextStatus + '\')">→ ' + nextStatus + '</button>'
      : '';

    const statusColors = {
      'Pending': ['#fff3e0','#e65100'], 'Preparing': ['#e3f2fd','#1565c0'],
      'Ready':   ['#e8f5e9','#2e7d32'], 'Out for Delivery': ['#f3e5f5','#6a1b9a'],
      'Delivered': ['#e8f5e9','#1b5e20'], 'Cancelled': ['#fce4ec','#b71c1c']
    };
    const [bg, fg] = statusColors[o.status] || ['#f5f5f5','#333'];

    return '<div class="admin-order-card">' +
      '<div class="aoc-header">' +
        '<div class="aoc-token">#' + o._id.slice(-6).toUpperCase() + '</div>' +
        '<span class="aoc-status-badge" style="background:' + bg + ';color:' + fg + '">' + STATUS_EMOJIS[safeIdx] + ' ' + o.status + '</span>' +
      '</div>' +
      '<div class="aoc-student">👤 ' + studentName + ' <span style="color:var(--text-mid);font-size:0.85rem">(' + studentId + ')</span></div>' +
      '<div class="aoc-items">' + (o.items || []).map(i => i.name + ' ×' + i.quantity).join(' · ') + '</div>' +
      '<div class="aoc-footer">' +
        '<div class="aoc-meta">' +
          '<span class="aoc-total">' + fmt(o.total) + '</span>' +
          '<span class="aoc-date">' + orderDate + '</span>' +
        '</div>' +
        actionBtn +
      '</div>' +
    '</div>';
  }).join('');
}

function updateAdminStats(orders) {
  if (!orders) orders = STATE.adminOrders;
  const els = $$('.admin-stat .stat-val');
  if (els[0]) els[0].textContent = orders.length;
  if (els[1]) els[1].textContent = orders.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled').length;
  if (els[2]) els[2].textContent = fmt(orders.filter(o => o.status !== 'Cancelled').reduce((s, o) => s + (o.total || 0), 0));
  if (els[3]) els[3].textContent = orders.filter(o => o.status === 'Delivered').length;
  if (els[4]) els[4].textContent = orders.filter(o => o.status === 'Cancelled').length;
}

// Globally exposed for inline onclick handlers
window.updateOrderStatus = async function(id, status) {
  const res = await apiRequest('/orders/update/' + id, 'PUT', { status });
  if (res.msg === 'Order status updated') {
    showToast('Status updated → ' + status, 'success');
  } else {
    showToast(res.msg || res.error || 'Update failed', 'error');
  }
  renderAdminOrders(STATE.currentFilter);
};

window.showCancelConfirm = showCancelConfirm;

// ═══════════════════════════════════════════════
// ADMIN MENU AVAILABILITY MANAGEMENT
// ═══════════════════════════════════════════════
// Render menu availability in dedicated page (for admin in Menu Management)
function renderAdminMenuPage() {
  const container = document.getElementById('admin-menu-list-page');
  if (!container) return;
  
  const allItems = [...MENU.snacks, ...MENU.meals, ...MENU.drinks];
  
  container.innerHTML = allItems.map(item => {
    const isAvailable = getItemAvailability(item.id);
    return '<div class="admin-menu-item">' +
      '<div class="ami-info">' +
        '<img src="' + item.img + '" alt="' + item.name + '" onerror="this.style.background=\'linear-gradient(135deg,#ff6b35,#ffb300)\'">' +
        '<div>' +
          '<div class="ami-name">' + item.name + '</div>' +
          '<div class="ami-price">' + fmt(item.price) + '</div>' +
        '</div>' +
      '</div>' +
      '<button class="availability-toggle ' + (isAvailable ? 'available' : 'unavailable') + '" onclick="toggleAvailability(' + item.id + ')">' +
        (isAvailable ? '✓ Available' : '✕ Unavailable') +
      '</button>' +
    '</div>';
  }).join('');
}

function toggleAvailability(itemId) {
  const current = getItemAvailability(itemId);
  setItemAvailability(itemId, !current);
  renderAdminMenuPage();
}

window.toggleAvailability = toggleAvailability;

// ═══════════════════════════════════════════════
// LOGIN PAGE
// ═══════════════════════════════════════════════
function renderLoginPage(activeTab) {
  activeTab = activeTab || 'profile';
  const user      = getLoggedInUser();
  const loginCard = document.querySelector('#page-login .auth-card');
  if (!loginCard) return;

  if (user) {
    // ── LOGGED IN: Profile + My Orders tabs ──
    loginCard.innerHTML =
      '<div class="auth-icon-wrap">🎓</div>' +
      '<div class="profile-name">' + (user.name || user.studentId) + '</div>' +
      '<div class="profile-role">' + (user.role === 'admin' ? '⚙️ Admin' : '🎓 Student') + '</div>' +
      '<div class="auth-tabs" style="margin-top:20px">' +
        '<button class="auth-tab ' + (activeTab==='profile'?'active':'') + '" id="ptab-profile" onclick="renderLoginPage(&quot;profile&quot;)">Profile</button>' +
        '<button class="auth-tab ' + (activeTab==='orders'?'active':'') + '" id="ptab-orders" onclick="renderLoginPage(&quot;orders&quot;)">My Orders</button>' +
      '</div>' +
      '<div id="profile-tab-content"></div>';

    const content = document.getElementById('profile-tab-content');
    // Toggle wide card for orders tab
    loginCard.classList.toggle('wide', activeTab === 'orders');

    if (activeTab === 'profile') {
      content.innerHTML =
        '<div class="auth-group"><label>Student ID</label><input type="text" disabled value="' + (user.studentId || '—') + '"></div>' +
        (user.name ? '<div class="auth-group"><label>Full Name</label><input type="text" disabled value="' + user.name + '"></div>' : '') +
        (user.department ? '<div class="auth-group"><label>Department</label><input type="text" disabled value="' + user.department + '"></div>' : '') +
        '<button id="student-logout-btn" class="auth-btn" style="background:linear-gradient(135deg,#f44336,#b71c1c);margin-top:8px">Logout</button>';

      document.getElementById('student-logout-btn').addEventListener('click', () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('lastOrderId');
        localStorage.removeItem('suspension_info');
        localStorage.removeItem('knownOrderIds');
        STATE.adminLoggedIn = false;
        showToast('Logged out successfully', 'success');
        renderLoginPage();
        updateNavUI();
      });

    } else {
      // My Orders tab
      content.innerHTML = '<div class="oh-loading">⏳ Loading order history...</div>';
      loadOrderHistory(content);
    }

  } else {
    // Always rebuild the login/register form (covers logout case too)
    loginCard.innerHTML =
      '<div class="auth-icon-wrap">🎓</div>' +
      '<div class="auth-tabs">' +
        '<button class="auth-tab active" id="tab-login" onclick="switchAuthTab(\'login\')">Login</button>' +
        '<button class="auth-tab" id="tab-register" onclick="switchAuthTab(\'register\')">Register</button>' +
      '</div>' +
      '<div id="auth-login-form">' +
        '<div class="auth-title">Student Login</div>' +
        '<div class="auth-sub">Access your canteen account</div>' +
        '<div class="auth-group"><label>Student ID</label><input id="login-id" type="text" placeholder="e.g. STU2024001"></div>' +
        '<div class="auth-group"><label>Password</label><input id="login-pass" type="password" placeholder="••••••••"></div>' +
        '<button id="student-login-btn" class="auth-btn">Login</button>' +
        '<div class="auth-switch">Don\'t have an account? <span onclick="switchAuthTab(\'register\')">Register here</span></div>' +
      '</div>' +
      '<div id="auth-register-form" style="display:none">' +
        '<div class="auth-title">Create Account</div>' +
        '<div class="auth-sub">Register as a new student</div>' +
        '<div class="auth-group"><label>Full Name</label><input id="reg-name" type="text" placeholder="Your full name"></div>' +
        '<div class="auth-group"><label>Student ID</label><input id="reg-id" type="text" placeholder="e.g. STU2024001"></div>' +
        '<div class="auth-group"><label>Department <span style="color:#9aa4c7;font-size:11px">(optional)</span></label><input id="reg-dept" type="text" placeholder="e.g. Computer Science"></div>' +
        '<div class="auth-group"><label>Password</label><input id="reg-pass" type="password" placeholder="Min. 6 characters"></div>' +
        '<button id="student-register-btn" class="auth-btn">Register</button>' +
        '<div class="auth-switch">Already have an account? <span onclick="switchAuthTab(\'login\')">Login here</span></div>' +
      '</div>';

    reAttachAuthListeners();
  }
}

function reAttachAuthListeners() {
  const studentLoginBtn = document.getElementById('student-login-btn');
  if (studentLoginBtn) {
    studentLoginBtn.addEventListener('click', async () => {
      const studentId = document.getElementById('login-id').value.trim();
      const password  = document.getElementById('login-pass').value;
      if (!studentId || !password) { showToast('Enter Student ID and password', 'error'); return; }
      studentLoginBtn.disabled    = true;
      studentLoginBtn.textContent = 'Logging in...';
      const res = await apiRequest('/auth/login', 'POST', { studentId, password });
      studentLoginBtn.disabled    = false;
      studentLoginBtn.textContent = 'Login';
      if (res.token) {
        localStorage.setItem('token', res.token);
        localStorage.setItem('user', JSON.stringify(res.user));
        showToast('Welcome back, ' + (res.user.name || studentId) + '!', 'success');
        updateNavUI();
        navigate('menu');
      } else {
        showToast(res.msg || 'Login failed', 'error');
      }
    });

    // Enter key on password field
    const passEl = document.getElementById('login-pass');
    if (passEl) passEl.addEventListener('keydown', e => { if (e.key === 'Enter') studentLoginBtn.click(); });
  }

  const studentRegBtn = document.getElementById('student-register-btn');
  if (studentRegBtn) {
    studentRegBtn.addEventListener('click', async () => {
      const name       = document.getElementById('reg-name')?.value.trim();
      const department = document.getElementById('reg-dept')?.value.trim();
      const studentId  = document.getElementById('reg-id')?.value.trim();
      const password   = document.getElementById('reg-pass')?.value;
      if (!name || !studentId || !password) { showToast('Fill in all required fields', 'error'); return; }
      studentRegBtn.disabled    = true;
      studentRegBtn.textContent = 'Registering...';
      const res = await apiRequest('/auth/register', 'POST', { name, department, studentId, password });
      studentRegBtn.disabled    = false;
      studentRegBtn.textContent = 'Register';
      if (res.msg === 'Registration successful') {
        showToast('Registered! Please login.', 'success');
        switchAuthTab('login');
      } else {
        showToast(res.error || res.msg || 'Registration failed', 'error');
      }
    });
  }
}

// ═══════════════════════════════════════════════
// AUTH TAB SWITCHER (global for inline onclick)
// ═══════════════════════════════════════════════
// ═══════════════════════════════════════════════
// ORDER HISTORY (My Orders tab)
// ═══════════════════════════════════════════════
async function loadOrderHistory(containerEl) {
  if (!containerEl) return;

  // Try backend /orders/my endpoint first
  let orders = [];
  const res = await apiRequest('/orders/my');

  if (!res.error && Array.isArray(res)) {
    orders = res;
  } else {
    // Fallback: fetch all known order IDs individually
    const knownIds = JSON.parse(localStorage.getItem('knownOrderIds') || '[]');
    const lastId   = localStorage.getItem('lastOrderId');
    if (lastId && !knownIds.includes(lastId)) knownIds.push(lastId);
    if (knownIds.length === 0) {
      containerEl.innerHTML =
        '<div class="oh-empty"><div class="oh-empty-icon">🍽️</div><p>No orders yet!</p></div>';
      return;
    }
    const results = await Promise.all(knownIds.map(id => apiRequest('/orders/' + id)));
    orders = results.filter(r => r && r._id);
  }

  if (orders.length === 0) {
    containerEl.innerHTML =
      '<div class="oh-empty">' +
        '<div class="oh-empty-icon">🍽️</div>' +
        '<p>No orders yet!</p>' +
        '<p style="font-size:12px;color:#4e5878;margin-top:6px">Your order history will appear here</p>' +
      '</div>';
    return;
  }

  // Sort newest first
  orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const statusColors = {
    'Pending':         ['rgba(255,152,0,0.15)',  '#ffb300'],
    'Preparing':       ['rgba(33,150,243,0.12)', '#42a5f5'],
    'Ready':           ['rgba(76,175,80,0.15)',  '#66bb6a'],
    'Out for Delivery':['rgba(156,39,176,0.12)', '#ba68c8'],
    'Delivered':       ['rgba(76,175,80,0.12)',  '#43a047'],
    'Cancelled':       ['rgba(244,67,54,0.12)',  '#ef5350'],
  };

  containerEl.innerHTML =
    '<div class="oh-summary">' +
      '<div class="oh-stat"><span class="oh-stat-num">' + orders.length + '</span><span class="oh-stat-lbl">Total</span></div>' +
      '<div class="oh-stat"><span class="oh-stat-num">' + orders.filter(o => o.status === 'Delivered').length + '</span><span class="oh-stat-lbl">Delivered</span></div>' +
      '<div class="oh-stat"><span class="oh-stat-num">' + fmt(orders.filter(o=>o.status!=='Cancelled').reduce((s,o)=>s+(o.total||0),0)) + '</span><span class="oh-stat-lbl">Spent</span></div>' +
    '</div>' +
    '<div class="oh-list">' +
      orders.map(o => {
        const date   = o.createdAt ? new Date(o.createdAt).toLocaleString('en-IN', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit', hour12:true }) : 'N/A';
        const items  = (o.items || []).map(i => i.name + (i.quantity > 1 ? ' ×' + i.quantity : '')).join(', ');
        const [sbg, sfg] = statusColors[o.status] || ['rgba(150,150,150,0.1)','#888'];
        const emoji  = STATUS_EMOJIS[ORDER_STATUSES.indexOf(o.status)] || '📦';
        return '<div class="oh-card">' +
          '<div class="oh-card-header">' +
            '<div class="oh-token">#' + o._id.slice(-6).toUpperCase() + '</div>' +
            '<span class="oh-badge" style="background:' + sbg + ';color:' + sfg + '">' + emoji + ' ' + o.status + '</span>' +
          '</div>' +
          '<div class="oh-items">' + items + '</div>' +
          '<div class="oh-card-footer">' +
            '<span class="oh-date">📅 ' + date + '</span>' +
            '<span class="oh-total">' + fmt(o.total) + '</span>' +
          '</div>' +
        '</div>';
      }).join('') +
    '</div>';
}

// Make renderLoginPage global so inline onclick="renderLoginPage(...)" works
window.renderLoginPage = renderLoginPage;

window.switchAuthTab = function(tab) {
  const loginForm    = document.getElementById('auth-login-form');
  const registerForm = document.getElementById('auth-register-form');
  const tabLogin     = document.getElementById('tab-login');
  const tabRegister  = document.getElementById('tab-register');
  if (!loginForm || !registerForm) return;

  if (tab === 'login') {
    loginForm.style.display    = 'block';
    registerForm.style.display = 'none';
    if (tabLogin)    tabLogin.classList.add('active');
    if (tabRegister) tabRegister.classList.remove('active');
  } else {
    loginForm.style.display    = 'none';
    registerForm.style.display = 'block';
    if (tabLogin)    tabLogin.classList.remove('active');
    if (tabRegister) tabRegister.classList.add('active');
  }
};

// ═══════════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', function() {

  // Loading screen
  const loader = document.querySelector('.loading-screen');
  setTimeout(() => { if (loader) loader.classList.add('hidden'); navigate('home'); }, 2000);

  // Dark mode
  applyDarkMode();
  const darkToggle = document.querySelector('.dark-toggle');
  if (darkToggle) darkToggle.addEventListener('click', () => { STATE.darkMode = !STATE.darkMode; applyDarkMode(); });

  // Nav links (only anchors, not the login button)
  $$('.nav-links a, .mobile-nav a').forEach(a => {
    a.addEventListener('click', e => { e.preventDefault(); if (a.dataset.page) navigate(a.dataset.page); });
  });

  // Nav login dropdown button
  const navLoginBtn = document.getElementById('nav-login-btn');
  if (navLoginBtn) navLoginBtn.addEventListener('click', e => toggleLoginDropdown(e));

  // Cart button
  const cartBtn = document.querySelector('.cart-btn');
  if (cartBtn) cartBtn.addEventListener('click', () => navigate('cart'));

  // Hamburger
  const hamburger = document.querySelector('.hamburger');
  if (hamburger) hamburger.addEventListener('click', () => document.querySelector('.mobile-nav').classList.toggle('open'));

  // Menu tabs
  $$('.cat-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      $$('.cat-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      renderMenu(tab.dataset.cat);
    });
  });

  // Cart bar
  const cartBarBtn = document.querySelector('.cart-bar-btn');
  if (cartBarBtn) cartBarBtn.addEventListener('click', () => navigate('cart'));

  // Payment options
  initPaymentOpts();

  // Checkout button
  const checkoutBtn = document.getElementById('checkout-btn');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
      if (STATE.cart.length === 0) { showToast('Your cart is empty!', 'error'); return; }
      placeOrder();
    });
  }

  // Order confirm modal
  const viewStatusBtn = document.getElementById('view-status-btn');
  if (viewStatusBtn) {
    viewStatusBtn.addEventListener('click', () => {
      document.getElementById('confirm-modal-overlay').classList.remove('show');
      navigate('status');
    });
  }
  const closeModalBtn = document.getElementById('close-modal-btn');
  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', () => {
      document.getElementById('confirm-modal-overlay').classList.remove('show');
      navigate('home');
    });
  }

  // Status lookup — single clean handler (BUG FIX: was two handlers before)
  const lookupBtn  = document.getElementById('lookup-btn');
  const tokenInput = document.getElementById('token-input');
  if (lookupBtn)  lookupBtn.addEventListener('click', loadMyOrders);
  if (tokenInput) tokenInput.addEventListener('keydown', e => { if (e.key === 'Enter') loadMyOrders(); });

  // Admin login — button is inside the dropdown (dynamically present), use delegation
  document.addEventListener('click', async function(e) {
    if (e.target && e.target.id === 'admin-login-btn') {
      const btn      = e.target;
      const userEl   = document.getElementById('admin-user');
      const passEl   = document.getElementById('admin-pass');
      const studentId = userEl ? userEl.value.trim() : '';
      const password  = passEl ? passEl.value       : '';
      if (!studentId || !password) { showToast('Enter credentials', 'error'); return; }

      btn.disabled    = true;
      btn.textContent = 'Logging in...';

      const res = await apiRequest('/admin/login', 'POST', { studentId, password });

      btn.disabled    = false;
      btn.textContent = 'Login →';

      if (res.token && res.user && res.user.role === 'admin') {
        localStorage.setItem('token', res.token);
        localStorage.setItem('user', JSON.stringify(res.user));
        STATE.adminLoggedIn = true;
        closeLoginDropdown();
        navigate('admin');
        showToast('Welcome, ' + (res.user.name || 'Admin') + '!', 'success');
        updateNavUI();
      } else {
        showToast(res.msg || 'Invalid admin credentials', 'error');
      }
    }
  });

  // Admin pass Enter key — delegation
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && e.target && e.target.id === 'admin-pass') {
      const btn = document.getElementById('admin-login-btn');
      if (btn) btn.click();
    }
  });

  // Admin logout
  const adminLogoutBtn = document.getElementById('admin-logout-btn');
  if (adminLogoutBtn) {
    adminLogoutBtn.addEventListener('click', () => {
      STATE.adminLoggedIn = false;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      showToast('Admin logged out', 'info');
      updateNavUI();
      navigate('home');
    });
  }

  // Admin filters
  $$('.filter-btn').forEach(btn => btn.addEventListener('click', () => renderAdminOrders(btn.dataset.filter)));

  // Hero CTAs
  const heroMenuBtn     = document.getElementById('hero-menu-btn');
  const heroStatusBtn   = document.getElementById('hero-status-btn');
  const specialOrderBtn = document.getElementById('special-order-btn');
  if (heroMenuBtn)     heroMenuBtn.addEventListener('click',    () => navigate('menu'));
  if (heroStatusBtn)   heroStatusBtn.addEventListener('click',  () => navigate('status'));
  if (specialOrderBtn) specialOrderBtn.addEventListener('click', () => navigate('menu'));

  // Footer links
  $$('.footer-link').forEach(a => a.addEventListener('click', e => { e.preventDefault(); navigate(a.dataset.page); }));

  // Student Login
  const studentLoginBtn = document.getElementById('student-login-btn');
  if (studentLoginBtn) {
    studentLoginBtn.addEventListener('click', async () => {
      const studentId = document.getElementById('login-id').value.trim();
      const password  = document.getElementById('login-pass').value;
      if (!studentId || !password) { showToast('Enter Student ID and password', 'error'); return; }

      studentLoginBtn.disabled    = true;
      studentLoginBtn.textContent = 'Logging in...';

      const res = await apiRequest('/auth/login', 'POST', { studentId, password });

      studentLoginBtn.disabled    = false;
      studentLoginBtn.textContent = 'Login';

      if (res.token) {
        localStorage.setItem('token', res.token);
        localStorage.setItem('user', JSON.stringify(res.user));
        showToast('Welcome back, ' + (res.user.name || studentId) + '!', 'success');
        updateNavUI();
        navigate('menu');
      } else {
        showToast(res.msg || 'Login failed', 'error');
      }
    });
  }

  // Enter key on login password field
  const loginPassEl = document.getElementById('login-pass');
  if (loginPassEl) loginPassEl.addEventListener('keydown', e => { if (e.key === 'Enter') document.getElementById('student-login-btn')?.click(); });

  // Student Register (if register form is present)
  const studentRegBtn = document.getElementById('student-register-btn');
  if (studentRegBtn) {
    studentRegBtn.addEventListener('click', async () => {
      const name       = document.getElementById('reg-name')?.value.trim();
      const department = document.getElementById('reg-dept')?.value.trim();
      const studentId  = document.getElementById('reg-id')?.value.trim();
      const password   = document.getElementById('reg-pass')?.value;
      if (!name || !studentId || !password) { showToast('Fill in all required fields', 'error'); return; }

      studentRegBtn.disabled    = true;
      studentRegBtn.textContent = 'Registering...';

      const res = await apiRequest('/auth/register', 'POST', { name, department, studentId, password });

      studentRegBtn.disabled    = false;
      studentRegBtn.textContent = 'Register';

      if (res.msg === 'Registration successful') {
        showToast('Registered! Please login.', 'success');
        switchAuthTab('login');
      } else {
        showToast(res.error || res.msg || 'Registration failed', 'error');
      }
    });
  }

  // Restore admin login state if token present
  const savedUser = getLoggedInUser();
  if (savedUser && savedUser.role === 'admin' && getToken()) {
    STATE.adminLoggedIn = true;
  }

  updateCartUI();
  updateNavUI();
});