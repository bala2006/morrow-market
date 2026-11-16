const products = [
  {
    id: 'halo-headphones', name: 'Halo wireless headphones', category: 'Tech', price: 89, oldPrice: 119,
    rating: 4.9, reviews: 248, badge: 'BESTSELLER', image: 'photo-1505740420928-5e560c06d30e',
    alt: 'Cream over-ear wireless headphones',
    description: 'Your own little quiet place. Halo pairs rich, balanced sound with a light, all-day fit and a battery that keeps up with the long way home.',
    details: ['40-hour listening time', 'Soft-touch memory foam ear cups', 'Simple one-button controls']
  },
  {
    id: 'soft-glow-lamp', name: 'The soft glow lamp', category: 'Home', price: 68, oldPrice: null,
    rating: 4.8, reviews: 186, badge: 'A LITTLE FAVORITE', image: 'photo-1507473885765-e6ed057f782c',
    alt: 'Sculptural warm-glow table lamp',
    description: 'A softer end to the day. This little sculptural lamp brings a warm, easy glow to bedside tables, reading corners, and wherever you need a moment.',
    details: ['Warm dimmable ambient light', 'Thoughtful, compact footprint', 'Made for slow evenings']
  },
  {
    id: 'weekender-tote', name: 'The woven everyday carryall', category: 'Style', price: 42, oldPrice: 55,
    rating: 4.7, reviews: 92, badge: 'GOOD FIND', image: 'photo-1590874103328-eac38a683ce7',
    alt: 'Warm-toned woven everyday carryall',
    description: 'Room for the everyday, with a little extra character. A warm woven texture and an easy shape make this carryall feel right from market mornings to last-minute plans.',
    details: ['Roomy everyday silhouette', 'Warm woven texture', 'Easy shoulder carry']
  },
  {
    id: 'ritual-set', name: 'Sunday reset ritual set', category: 'Wellness', price: 36, oldPrice: null,
    rating: 4.9, reviews: 134, badge: 'GENTLE ON YOU', image: 'photo-1608248543803-ba4f8c70ae0b',
    alt: 'A set of simple skincare essentials',
    description: 'A calm little reset for wherever the week finds you. This simple care set keeps your routine gentle, easy, and nicely unhurried.',
    details: ['A simple three-step ritual', 'Gentle everyday essentials', 'A lovely gift for a fresh start']
  },
  {
    id: 'cloud-speaker', name: 'Cloud nine mini speaker', category: 'Tech', price: 54, oldPrice: 69,
    rating: 4.6, reviews: 76, badge: 'JUST RIGHT', image: 'photo-1608043152269-423dbba4e7e1',
    alt: 'Compact minimal wireless speaker',
    description: 'Small enough to follow the good mood from room to room. Cloud nine keeps playlists clear, calls simple, and your space wonderfully uncluttered.',
    details: ['Pocket-sized wireless sound', 'Clear voice-call microphone', 'A full day of listening']
  },
  {
    id: 'weekend-sneaker', name: 'The weekend sneaker', category: 'Style', price: 74, oldPrice: null,
    rating: 4.8, reviews: 163, badge: 'MOST LOVED', image: 'photo-1542291026-7eec264c27ff',
    alt: 'Bright red everyday sneaker',
    description: 'Made for plans that turn into better plans. A cushioned everyday sneaker brings an easy stride and a pop of color to your favorite off-duty looks.',
    details: ['Cushioned all-day sole', 'Easy everyday lace-up fit', 'A bright little color pop']
  },
  {
    id: 'slow-morning-mug', name: 'Slow morning ceramic mug', category: 'Home', price: 28, oldPrice: 34,
    rating: 4.9, reviews: 205, badge: 'SMALL JOY', image: 'photo-1514228742587-6b1558fcca3d',
    alt: 'Handmade ceramic coffee cup',
    description: 'The first sip deserves a good cup. This tactile ceramic favorite feels lovely in your hands and makes even a regular Tuesday feel like a slower morning.',
    details: ['Comfortable, easy-grip shape', 'Made for coffee or tea', 'A one-cup pause, every day']
  },
  {
    id: 'daily-water-bottle', name: 'Good day water bottle', category: 'Wellness', price: 32, oldPrice: null,
    rating: 4.7, reviews: 118, badge: 'BETTER HABIT', image: 'photo-1602143407151-7111542de6e8',
    alt: 'Reusable bottle for everyday hydration',
    description: 'A little nudge to take care of yourself. This reusable bottle is easy to carry, simple to refill, and ready to make the good habit the easy one.',
    details: ['Refillable, carry-everywhere design', 'Easy-open everyday lid', 'A small step toward less waste']
  }
];

const productsById = new Map(products.map(product => [product.id, product]));
const categoryNames = {All: 'The good stuff', Home: 'Home & living picks', Tech: 'Thoughtful tech', Style: 'Style, made easy', Wellness: 'Feel-good rituals'};
const ORDERS_KEY = 'morrow-demo-orders-v1';
const FREE_SHIPPING_AT = 50;
const STANDARD_SHIPPING = 5.95;
const MAX_QUANTITY = 99;
const imageUrl = (id, width = 700) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=82`;
const money = amount => `$${amount.toFixed(2)}`;
const wait = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));
const randomCode = length => Array.from({length}, () => 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'[Math.floor(Math.random() * 36)]).join('');

function readOrders() {
  try {
    const saved = JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]');
    if (!Array.isArray(saved)) return [];
    return saved.flatMap(order => {
      if (!order || !/^MRW-[A-Z0-9]{8}$/.test(order.id || '') || !/^MOR-[A-Z0-9]{6}$/.test(order.trackingCode || '') || !Array.isArray(order.items)) return [];
      const items = order.items.filter(item => productsById.has(item?.id) && Number.isInteger(item.quantity) && item.quantity > 0 && item.quantity <= MAX_QUANTITY);
      if (!items.length) return [];
      const subtotal = items.reduce((sum, item) => sum + productsById.get(item.id).price * item.quantity, 0);
      const shipping = subtotal >= FREE_SHIPPING_AT ? 0 : STANDARD_SHIPPING;
      const created = new Date(order.createdAt);
      const createdAt = Number.isNaN(created.getTime()) ? new Date().toISOString() : created.toISOString();
      const deliveryStart = new Date(createdAt);
      const deliveryEnd = new Date(createdAt);
      deliveryStart.setDate(deliveryStart.getDate() + 3);
      deliveryEnd.setDate(deliveryEnd.getDate() + 5);
      return [{id: order.id, trackingCode: order.trackingCode, createdAt, estimatedDeliveryStart: deliveryStart.toISOString(), estimatedDeliveryEnd: deliveryEnd.toISOString(), items, subtotal, shipping, total: subtotal + shipping}];
    }).slice(0, 20);
  } catch {
    return [];
  }
}

const state = {
  category: 'All', query: '', sort: 'featured', showAll: false,
  cart: new Map(), favorites: new Set(), drawerOpen: false, toastTimer: null,
  currentPage: 'home', currentId: '', detailQuantity: 1, orders: readOrders(),
  isPaying: false, paymentAttempt: 0
};

const grid = document.querySelector('#product-grid');
const searchInput = document.querySelector('#search-input');
const emptyState = document.querySelector('#empty-state');
const showMoreButton = document.querySelector('#show-more');
const cartDrawer = document.querySelector('#cart-drawer');
const backdrop = document.querySelector('#drawer-backdrop');
const cartContent = document.querySelector('#cart-content');
const cartFooter = document.querySelector('#cart-footer');
const toast = document.querySelector('#toast');
const routeView = document.querySelector('#route-view');
const storefrontSections = [...document.querySelectorAll('.storefront-content')];
const baseTitle = 'Morrow Market — Good things, thoughtfully found';

function matchingProducts() {
  let matches = products.filter(product => {
    const categoryMatch = state.category === 'All' || product.category === state.category;
    const searchable = `${product.name} ${product.category} ${product.badge}`.toLowerCase();
    return categoryMatch && searchable.includes(state.query.trim().toLowerCase());
  });
  if (state.sort === 'price-low') matches.sort((a, b) => a.price - b.price);
  if (state.sort === 'price-high') matches.sort((a, b) => b.price - a.price);
  if (state.sort === 'rating') matches.sort((a, b) => b.rating - a.rating);
  return matches;
}

function productHref(id) {
  return `/?page=product&id=${encodeURIComponent(id)}`;
}

function renderProducts() {
  const matches = matchingProducts();
  const shown = (state.showAll || state.query || state.category !== 'All') ? matches : matches.slice(0, 4);
  grid.setAttribute('aria-busy', 'false');
  grid.innerHTML = shown.map((product, index) => `
    <article class="product-card" data-product-card="${product.id}" style="animation-delay:${Math.min(index * 45, 180)}ms">
      <div class="product-image-wrap">
        <button class="product-image-open" type="button" data-action="detail" data-id="${product.id}" aria-label="View ${product.name}">
          <img class="product-image" src="${imageUrl(product.image)}" alt="${product.alt}" loading="lazy">
        </button>
        <span class="product-badge ${['BESTSELLER', 'MOST LOVED'].includes(product.badge) ? 'bestseller' : ''}">${product.badge}</span>
        <button class="wishlist-button" type="button" data-action="favorite" data-id="${product.id}" aria-label="${state.favorites.has(product.id) ? 'Remove' : 'Add'} ${product.name} ${state.favorites.has(product.id) ? 'from' : 'to'} wishlist" aria-pressed="${state.favorites.has(product.id)}">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 8.8c0 5.1-8.8 10.1-8.8 10.1S3.2 13.9 3.2 8.8a4.6 4.6 0 0 1 8.8-1.7 4.6 4.6 0 0 1 8.8 1.7Z"></path></svg>
        </button>
        <button class="quick-add" type="button" data-action="add" data-id="${product.id}">Add to bag <span aria-hidden="true">＋</span></button>
      </div>
      <div class="product-info">
        <span class="product-category">${product.category === 'Home' ? 'Home & living' : product.category}</span>
        <div class="product-title-row"><h3 class="product-title"><a href="${productHref(product.id)}" data-product-link="${product.id}">${product.name}</a></h3><span class="product-rating"><span aria-hidden="true">★</span> ${product.rating.toFixed(1)}</span></div>
        <div class="product-price"><strong>${money(product.price)}</strong>${product.oldPrice ? `<span class="old-price">${money(product.oldPrice)}</span>` : ''}</div>
      </div>
    </article>`).join('');

  document.querySelector('#products-title').innerHTML = `${state.query ? 'Search results' : categoryNames[state.category]}<span class="heading-period">.</span>`;
  document.querySelector('#product-kicker').textContent = state.query ? `A good search for “${state.query}”` : state.category === 'All' ? 'Picked for your everyday' : 'Find your kind of good';
  document.querySelector('#result-count').textContent = `${matches.length} thoughtful ${matches.length === 1 ? 'find' : 'finds'}`;
  emptyState.hidden = matches.length !== 0;
  grid.hidden = matches.length === 0;
  showMoreButton.hidden = matches.length === 0 || !!state.query || state.category !== 'All' || matches.length <= 4;
  showMoreButton.innerHTML = state.showAll ? 'Show a little less <span aria-hidden="true">↑</span>' : 'See all good things <span aria-hidden="true">↓</span>';

  document.querySelectorAll('[data-filter]').forEach(button => {
    const selected = button.dataset.filter === state.category;
    button.classList.toggle('selected', selected);
    button.setAttribute('aria-pressed', String(selected));
  });
  document.querySelectorAll('[data-nav-category]').forEach(link => {
    const active = state.category === 'All'
      ? link.textContent.trim().startsWith('Discover')
      : link.dataset.navCategory === state.category;
    link.classList.toggle('active', active);
  });
}

function cartTotals() {
  let count = 0;
  let subtotal = 0;
  state.cart.forEach((item, id) => {
    const product = productsById.get(id);
    if (!product) return;
    count += item.quantity;
    subtotal += product.price * item.quantity;
  });
  return {count, subtotal, shipping: subtotal === 0 || subtotal >= FREE_SHIPPING_AT ? 0 : STANDARD_SHIPPING};
}

function renderCart() {
  const {count, subtotal} = cartTotals();
  document.querySelector('#cart-count').textContent = String(count);
  document.querySelector('#drawer-count').textContent = `(${count})`;
  document.querySelector('#cart-button').setAttribute('aria-label', `Open cart, ${count} ${count === 1 ? 'item' : 'items'}`);
  cartFooter.hidden = count === 0;
  if (count === 0) {
    cartContent.innerHTML = '<div class="cart-empty"><span class="cart-empty-icon" aria-hidden="true">⌑</span><h3>Your bag is taking a breather</h3><p>Find something lovely and it will be waiting here.</p></div>';
    return;
  }
  cartContent.innerHTML = [...state.cart.entries()].map(([id, item]) => {
    const product = productsById.get(id);
    if (!product) return '';
    return `<div class="cart-item"><img class="cart-item-image" src="${imageUrl(product.image, 180)}" alt="${product.alt}"><div class="cart-item-info"><span class="cart-item-category">${product.category === 'Home' ? 'Home & living' : product.category}</span><strong class="cart-item-name">${product.name}</strong><span class="cart-item-price">${money(product.price)}</span><div class="quantity-control" aria-label="Quantity for ${product.name}"><button type="button" data-cart-action="decrease" data-id="${id}" aria-label="Decrease quantity">−</button><span>${item.quantity}</span><button type="button" data-cart-action="increase" data-id="${id}" aria-label="Increase quantity">+</button></div></div><div class="cart-item-end"><strong>${money(product.price * item.quantity)}</strong><button class="remove-item" type="button" data-cart-action="remove" data-id="${id}">Remove</button></div></div>`;
  }).join('');
  document.querySelector('#cart-subtotal').textContent = money(subtotal);
  document.querySelector('#shipping-message').textContent = subtotal >= FREE_SHIPPING_AT
    ? 'Lovely — your order ships free!'
    : `You’re ${money(FREE_SHIPPING_AT - subtotal)} away from free shipping.`;
}

function renderRoute() {
  const params = new URLSearchParams(window.location.search);
  const requestedPage = params.get('page') || 'home';
  const validPages = ['home', 'product', 'checkout', 'order', 'tracking'];
  state.currentPage = validPages.includes(requestedPage) ? requestedPage : 'home';
  state.currentId = params.get('id') || '';
  const isHome = state.currentPage === 'home';
  storefrontSections.forEach(section => { section.hidden = !isHome; });
  routeView.hidden = isHome;

  if (isHome) {
    routeView.innerHTML = '';
    document.title = baseTitle;
    renderProducts();
    return;
  }

  if (state.currentPage === 'product') {
    renderProductPage(state.currentId);
  } else if (state.currentPage === 'checkout') {
    renderCheckoutPage();
  } else if (state.currentPage === 'order') {
    renderOrderPage(state.currentId);
  } else {
    renderTrackingPage(state.currentId);
  }
}

function navigate(page, id = '', options = {}) {
  if (state.isPaying && page !== 'checkout') {
    state.isPaying = false;
    state.paymentAttempt++;
  }
  const url = new URL(window.location.href);
  url.search = '';
  url.hash = '';
  if (page !== 'home') url.searchParams.set('page', page);
  if (id) url.searchParams.set('id', id);
  window.history.pushState({}, '', `${url.pathname}${url.search}`);
  renderRoute();
  if (options.scroll !== false) window.scrollTo({top: 0, behavior: 'smooth'});
  if (options.focus !== false && page !== 'home') {
    requestAnimationFrame(() => routeView.querySelector('[data-view-title]')?.focus({preventScroll: true}));
  }
}

function setCategory(category) {
  if (state.currentPage !== 'home') navigate('home', '', {scroll: false, focus: false});
  state.category = category;
  state.query = '';
  state.showAll = false;
  searchInput.value = '';
  renderProducts();
  document.querySelector('#products').scrollIntoView({behavior: 'smooth', block: 'start'});
}

function showHome() {
  state.category = 'All';
  state.query = '';
  state.showAll = false;
  searchInput.value = '';
  navigate('home');
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('visible');
  clearTimeout(state.toastTimer);
  state.toastTimer = setTimeout(() => toast.classList.remove('visible'), 2300);
}

function addToCart(id, quantity = 1) {
  const product = productsById.get(id);
  if (!product) return;
  const currentQuantity = state.cart.get(id)?.quantity || 0;
  const addedQuantity = Math.min(quantity, MAX_QUANTITY - currentQuantity);
  if (addedQuantity <= 0) {
    showToast(`You’ve reached the ${MAX_QUANTITY}-item limit for this find`);
    return;
  }
  state.cart.set(id, {quantity: currentQuantity + addedQuantity});
  renderCart();
  showToast(addedQuantity < quantity
    ? `Added ${addedQuantity}; the ${MAX_QUANTITY}-item limit is reached`
    : `${product.name} added to your bag`);
}

function openCart() {
  if (state.drawerOpen) return;
  state.drawerOpen = true;
  backdrop.hidden = false;
  cartDrawer.inert = false;
  cartDrawer.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  requestAnimationFrame(() => cartDrawer.classList.add('open'));
  document.querySelector('#close-drawer').focus();
}

function closeCart() {
  if (!state.drawerOpen) return;
  state.drawerOpen = false;
  cartDrawer.classList.remove('open');
  cartDrawer.setAttribute('aria-hidden', 'true');
  cartDrawer.inert = true;
  backdrop.hidden = true;
  document.body.style.overflow = '';
  document.querySelector('#cart-button').focus();
}

function shortDate(date) {
  return new Intl.DateTimeFormat('en-US', {month: 'short', day: 'numeric'}).format(date);
}

function orderById(id) {
  return state.orders.find(order => order.id === id);
}

function orderItemsMarkup(order) {
  return order.items.map(item => {
    const product = productsById.get(item.id);
    if (!product) return '';
    return `<div class="order-line"><img src="${imageUrl(product.image, 150)}" alt="${product.alt}" loading="lazy"><div><strong>${product.name}</strong><span>Qty ${item.quantity}</span></div><b>${money(product.price * item.quantity)}</b></div>`;
  }).join('');
}

function renderProductPage(id) {
  const product = productsById.get(id);
  if (!product) {
    document.title = `Find your good thing — Morrow Market`;
    routeView.innerHTML = '<section class="route-not-found"><span class="section-kicker">A little detour</span><h1 class="route-title" data-view-title tabindex="-1">We could not find that find.</h1><p>This product may have wandered off. Browse the latest thoughtful picks instead.</p><button class="button button-dark" type="button" data-action="home">Back to the good stuff <span aria-hidden="true">→</span></button></section>';
    return;
  }
  document.title = `${product.name} — Morrow Market`;
  state.detailQuantity = 1;
  const similar = products.filter(item => item.category === product.category && item.id !== product.id).slice(0, 2);
  routeView.innerHTML = `
    <div class="breadcrumb"><button type="button" data-action="home">Discover</button><span aria-hidden="true">/</span><span>${product.category === 'Home' ? 'Home & living' : product.category}</span></div>
    <section class="product-detail" aria-labelledby="detail-title">
      <div class="detail-gallery"><div class="detail-main-image"><img src="${imageUrl(product.image, 1100)}" alt="${product.alt}" fetchpriority="high"><span class="product-badge">${product.badge}</span><span class="detail-image-caption">A GOOD THING, MADE FOR EVERYDAY</span></div><div class="detail-gallery-note"><span class="promise-icon" aria-hidden="true">✳</span><span>Chosen with care. Ready for real life.</span></div></div>
      <div class="detail-copy"><span class="section-kicker">${product.category === 'Home' ? 'Home & living' : product.category} · MORROW SELECT</span><h1 class="route-title" id="detail-title" data-view-title tabindex="-1">${product.name}<span class="heading-period">.</span></h1><div class="detail-rating"><span aria-hidden="true">★★★★★</span> ${product.rating.toFixed(1)} <span class="detail-reviews">(${product.reviews} thoughtful reviews)</span></div><div class="detail-price"><strong>${money(product.price)}</strong>${product.oldPrice ? `<del>${money(product.oldPrice)}</del><span class="detail-save">A little more lovely for less</span>` : ''}</div><p class="detail-description">${product.description}</p><ul class="detail-features">${product.details.map(item => `<li><span aria-hidden="true">✓</span>${item}</li>`).join('')}</ul><div class="detail-stock"><span></span> A lovely choice, ready to ship</div><div class="detail-purchase"><div class="detail-quantity" aria-label="Choose quantity"><button type="button" data-quantity="minus" aria-label="Remove one">−</button><span id="detail-quantity">1</span><button type="button" data-quantity="plus" aria-label="Add one">+</button></div><button class="button button-dark detail-add" type="button" data-action="detail-add">Add to bag <span aria-hidden="true">＋</span></button></div><button class="button button-lime detail-buy" type="button" data-action="detail-buy">Make it yours — ${money(product.price)} <span aria-hidden="true">→</span></button><p class="detail-shipping"><span aria-hidden="true">↺</span> Easy 30-day returns · Free shipping over $50</p></div>
    </section>
    <section class="detail-story"><div><span class="section-kicker">A little more about it</span><h2>Made for the moments<br>that make a day.</h2></div><p>${product.description} We look for good design that feels natural to live with: thoughtful details, easy everyday use, and a story worth bringing home.</p></section>
    ${similar.length ? `<section class="related-section"><div class="section-heading"><div><span class="section-kicker">More in this mood</span><h2>Good company<span class="heading-period">.</span></h2></div><button class="subtle-link" type="button" data-action="shop-category" data-category="${product.category}">Explore ${product.category} <span aria-hidden="true">→</span></button></div><div class="related-grid">${similar.map(item => `<a class="related-card" href="${productHref(item.id)}" data-route-product="${item.id}"><img src="${imageUrl(item.image, 420)}" alt="${item.alt}" loading="lazy"><span>${item.name}</span><strong>${money(item.price)}</strong></a>`).join('')}</div></section>` : ''}`;
}

function renderCheckoutPage() {
  document.title = `Demo checkout — Morrow Market`;
  const {count, subtotal, shipping} = cartTotals();
  if (count === 0) {
    routeView.innerHTML = '<section class="checkout-empty"><span class="cart-empty-icon" aria-hidden="true">⌑</span><span class="section-kicker">NOTHING TO CHECK OUT YET</span><h1 class="route-title" data-view-title tabindex="-1">Your bag is taking a breather.</h1><p>Pop back to the good stuff and find something lovely first.</p><button class="button button-dark" type="button" data-action="home">Explore the edit <span aria-hidden="true">→</span></button></section>';
    return;
  }
  const total = subtotal + shipping;
  routeView.innerHTML = `
    <div class="breadcrumb"><button type="button" data-action="home">Discover</button><span aria-hidden="true">/</span><span>Secure demo checkout</span></div>
    <div class="checkout-heading"><div><span class="section-kicker">A few little details</span><h1 class="route-title" data-view-title tabindex="-1">Make it a good day<span class="heading-period">.</span></h1></div><span class="checkout-demo-tag"><span aria-hidden="true">✳</span> DEMO CHECKOUT · NO CHARGE</span></div>
    <div class="checkout-layout">
      <form class="checkout-form" id="checkout-form">
        <section class="checkout-panel"><div class="checkout-panel-heading"><span class="checkout-step">01</span><div><h2>Where should we send it?</h2><p>Just the basics for your pretend delivery.</p></div></div><div class="checkout-fields"><label class="field field-wide">Your name<input name="customerName" autocomplete="name" placeholder="Jamie Taylor" required maxlength="80"></label><label class="field">Email address<input name="email" type="email" autocomplete="email" placeholder="you@example.com" required maxlength="120"></label><label class="field">Street address<input name="address" autocomplete="street-address" placeholder="123 Somewhere St" required maxlength="120"></label><label class="field">City<input name="city" autocomplete="address-level2" placeholder="Portland" required maxlength="80"></label><label class="field">ZIP / postal code<input name="postal" autocomplete="postal-code" placeholder="97201" required maxlength="20"></label></div></section>
        <section class="checkout-panel payment-panel"><div class="checkout-panel-heading"><span class="checkout-step">02</span><div><h2>Pick your pretend payment</h2><p>This is a safe little demo. No payment details are collected.</p></div></div><div class="demo-payment-card"><span class="demo-card-icon" aria-hidden="true">▰</span><span><strong>Morrow demo card</strong><small>Test payment · ending in 4242</small></span><span class="demo-card-check" aria-hidden="true">✓</span></div><p class="demo-payment-note">For this prototype, your checkout is simulated. Please do not enter real card details.</p></section>
        <div class="payment-animation" id="payment-animation" hidden><span class="payment-spinner" aria-hidden="true"></span><div><strong id="payment-status-title">Warming up your demo checkout…</strong><span id="payment-status-copy" aria-live="polite">Your pretend payment stays right here in this demo.</span></div></div>
        <button class="button button-dark pay-button" id="pay-button" type="submit">Pay ${money(total)} & place demo order <span aria-hidden="true">→</span></button><p class="checkout-safe-note"><span aria-hidden="true">♧</span> Demo only — no real payment is processed, and your details are not saved.</p>
      </form>
      <aside class="checkout-summary" aria-label="Order summary"><div class="summary-heading"><h2>Your good things</h2><span>${count} ${count === 1 ? 'item' : 'items'}</span></div><div class="summary-items">${[...state.cart.entries()].map(([id, item]) => {const product = productsById.get(id);return product ? `<div class="summary-item"><img src="${imageUrl(product.image, 160)}" alt=""><span>${product.name}<small>Qty ${item.quantity}</small></span><strong>${money(product.price * item.quantity)}</strong></div>` : '';}).join('')}</div><div class="summary-calculation"><div><span>Subtotal</span><strong>${money(subtotal)}</strong></div><div><span>Shipping</span><strong>${shipping === 0 ? 'On us' : money(shipping)}</strong></div><div class="summary-total"><span>Total</span><strong>${money(total)}</strong></div></div><div class="summary-footnote">${shipping === 0 ? 'Your order unlocked free shipping.' : `Add ${money(FREE_SHIPPING_AT - subtotal)} more for free shipping.`}</div><button class="summary-back" type="button" data-action="show-bag">← Make a change to your bag</button></aside>
    </div>`;
}

function renderOrderPage(id) {
  const order = orderById(id);
  document.title = `Order received — Morrow Market`;
  if (!order) {
    routeView.innerHTML = '<section class="route-not-found"><span class="section-kicker">ORDER NOT FOUND</span><h1 class="route-title" data-view-title tabindex="-1">That order took a different route.</h1><p>We could not find that demo order on this device. Head back to the shop to make a fresh one.</p><button class="button button-dark" type="button" data-action="home">Back to Morrow <span aria-hidden="true">→</span></button></section>';
    return;
  }
  routeView.innerHTML = `
    <section class="order-success"><div class="success-orbit"><svg viewBox="0 0 58 58" aria-hidden="true"><circle cx="29" cy="29" r="26"></circle><path d="m17 29 8 8 16-17"></path></svg><span class="success-spark success-spark-one">✳</span><span class="success-spark success-spark-two">✦</span></div><span class="section-kicker">THAT WAS A LOVELY CHOICE</span><h1 class="route-title" data-view-title tabindex="-1">It's official. <em>Your order is in.</em></h1><p class="success-copy">Your pretend payment went through beautifully. We’re getting your good things ready now.</p><div class="order-reference"><span>DEMO ORDER NUMBER</span><strong>${order.id}</strong><small>Placed ${shortDate(new Date(order.createdAt))}</small></div></section>
    <section class="order-details-card"><div class="order-details-heading"><div><span class="section-kicker">A LITTLE UPDATE</span><h2>Your order is on its way to being on its way.</h2></div><span class="order-status-pill"><span></span> Processing</span></div><div class="delivery-estimate"><span class="delivery-estimate-icon" aria-hidden="true">⌂</span><div><small>YOUR DEMO DELIVERY WINDOW</small><strong>${shortDate(new Date(order.estimatedDeliveryStart))} – ${shortDate(new Date(order.estimatedDeliveryEnd))}</strong></div><button class="button button-outline" type="button" data-action="track-order" data-id="${order.id}">Follow the journey <span aria-hidden="true">→</span></button></div><div class="order-lines">${orderItemsMarkup(order)}</div><div class="order-total-line"><span>Total${order.shipping ? ` · includes ${money(order.shipping)} shipping` : ' · shipping is on us'}</span><strong>${money(order.total)}</strong></div></section>
    <div class="order-next-actions"><button class="button button-dark" type="button" data-action="track-order" data-id="${order.id}">Track your order <span aria-hidden="true">→</span></button><button class="text-link" type="button" data-action="home">Find one more good thing <span aria-hidden="true">↗</span></button></div>`;
}

function renderTrackingPage(id) {
  const order = orderById(id);
  document.title = `Delivery journey — Morrow Market`;
  if (!order) {
    routeView.innerHTML = '<section class="route-not-found"><span class="section-kicker">TRACKING NOT FOUND</span><h1 class="route-title" data-view-title tabindex="-1">We could not find that journey.</h1><p>Your demo order may have been placed in another browser session. Start a new order to see the tracking experience.</p><button class="button button-dark" type="button" data-action="home">Back to Morrow <span aria-hidden="true">→</span></button></section>';
    return;
  }
  const etaStart = shortDate(new Date(order.estimatedDeliveryStart));
  const etaEnd = shortDate(new Date(order.estimatedDeliveryEnd));
  routeView.innerHTML = `
    <div class="breadcrumb"><button type="button" data-action="order-page" data-id="${order.id}">Order ${order.id}</button><span aria-hidden="true">/</span><span>Delivery journey</span></div>
    <section class="tracking-hero"><div><span class="section-kicker">A LITTLE UPDATE FROM THE ROAD</span><h1 class="route-title" data-view-title tabindex="-1">It's on <em>the way.</em></h1><p>Your good things are making their way to you. Put the kettle on — they should arrive soon.</p></div><div class="tracking-arrival"><span class="arrival-sun" aria-hidden="true">☼</span><small>EXPECTED TO ARRIVE</small><strong>${etaStart} – ${etaEnd}</strong><span>Give or take a happy delivery day</span></div></section>
    <section class="tracking-card"><div class="tracking-card-heading"><div><span class="section-kicker">YOUR PARCEL'S LITTLE ADVENTURE</span><h2>One step closer to your door<span class="heading-period">.</span></h2></div><span class="tracking-number">DEMO TRACKING <strong>${order.trackingCode}</strong></span></div><div class="journey-route" aria-label="Order is on the way, 2 of 4 delivery steps complete"><div class="route-track"><span class="route-track-fill"></span><span class="route-traveler" aria-hidden="true">✦</span><i class="route-stop stop-one done"></i><i class="route-stop stop-two done"></i><i class="route-stop stop-three active"></i><i class="route-stop stop-four"></i></div><div class="journey-stops"><div class="journey-stop done"><strong>Order received</strong><span>${shortDate(new Date(order.createdAt))}</span></div><div class="journey-stop done"><strong>Packed with care</strong><span>All wrapped up</span></div><div class="journey-stop active"><strong>On the way</strong><span>Moving your way</span></div><div class="journey-stop"><strong>At your door</strong><span>Coming soon</span></div></div></div><div class="tracking-update"><span class="tracking-pulse"></span><div><strong>Good things are in motion</strong><p>Your package is with the demo delivery crew. We’ll have it at your door before you know it.</p></div><span>Just now</span></div></section>
    <section class="tracking-bottom"><div class="tracking-package"><span class="section-kicker">IN THIS PARCEL</span><div class="order-lines">${orderItemsMarkup(order)}</div><div class="order-total-line"><span>Order total</span><strong>${money(order.total)}</strong></div></div><button class="button button-outline" type="button" data-action="home">Back to the good stuff <span aria-hidden="true">↗</span></button></section>`;
}

function saveOrder(order) {
  state.orders.unshift(order);
  state.orders = state.orders.slice(0, 20);
  try {
    localStorage.setItem(ORDERS_KEY, JSON.stringify(state.orders));
  } catch {
    // The current session still has the order in memory if browser storage is unavailable.
  }
}

async function startDemoPayment(form) {
  if (state.isPaying) return;
  if (cartTotals().count === 0) {
    renderCheckoutPage();
    return;
  }
  state.isPaying = true;
  const attempt = ++state.paymentAttempt;
  const button = document.querySelector('#pay-button');
  const animation = document.querySelector('#payment-animation');
  const statusTitle = document.querySelector('#payment-status-title');
  const statusCopy = document.querySelector('#payment-status-copy');
  button.disabled = true;
  animation.hidden = false;
  animation.classList.add('is-running');
  const stages = [
    ['Checking the demo card…', 'All pretend details stay safely in this browser.'],
    ['Wrapping up your order…', 'Getting your good things ready to go.'],
    ['All done — lovely choice!', 'Opening your order confirmation now.']
  ];
  for (const [title, copy] of stages) {
    statusTitle.textContent = title;
    statusCopy.textContent = copy;
    await wait(760);
    if (attempt !== state.paymentAttempt || !state.isPaying || !form.isConnected) return;
  }

  const {subtotal, shipping} = cartTotals();
  const now = new Date();
  const deliveryStart = new Date(now);
  deliveryStart.setDate(deliveryStart.getDate() + 3);
  const deliveryEnd = new Date(now);
  deliveryEnd.setDate(deliveryEnd.getDate() + 5);
  const order = {
    id: `MRW-${randomCode(8)}`,
    trackingCode: `MOR-${randomCode(6)}`,
    createdAt: now.toISOString(),
    estimatedDeliveryStart: deliveryStart.toISOString(),
    estimatedDeliveryEnd: deliveryEnd.toISOString(),
    items: [...state.cart.entries()].map(([id, item]) => ({id, quantity: item.quantity})),
    subtotal,
    shipping,
    total: subtotal + shipping
  };
  saveOrder(order);
  state.cart.clear();
  state.isPaying = false;
  renderCart();
  navigate('order', order.id);
}

// Keep the first paint intentional, then replace the lightweight skeleton cards.
renderCart();
renderRoute();
if (state.currentPage === 'home') setTimeout(renderProducts, 320);

window.addEventListener('popstate', () => {
  if (state.isPaying) {
    state.isPaying = false;
    state.paymentAttempt++;
  }
  renderRoute();
});

document.querySelector('#search-form').addEventListener('submit', event => {
  event.preventDefault();
  if (state.currentPage !== 'home') navigate('home', '', {scroll: false, focus: false});
  state.query = searchInput.value;
  state.category = 'All';
  state.showAll = true;
  renderProducts();
  document.querySelector('#products').scrollIntoView({behavior: 'smooth', block: 'start'});
});
searchInput.addEventListener('input', () => {
  if (state.currentPage !== 'home') navigate('home', '', {scroll: false, focus: false});
  state.query = searchInput.value;
  state.category = 'All';
  state.showAll = true;
  renderProducts();
});
document.querySelector('#sort-select').addEventListener('change', event => {state.sort = event.target.value; renderProducts();});
document.querySelector('#filter-row').addEventListener('click', event => {
  const button = event.target.closest('[data-filter]');
  if (button) setCategory(button.dataset.filter);
});
document.querySelectorAll('.category-card').forEach(button => button.addEventListener('click', () => setCategory(button.dataset.category)));
document.querySelectorAll('[data-nav-category]').forEach(link => link.addEventListener('click', event => {
  event.preventDefault();
  setCategory(link.dataset.navCategory);
}));

grid.addEventListener('click', event => {
  const actionButton = event.target.closest('button[data-action]');
  if (actionButton) {
    const {id, action} = actionButton.dataset;
    if (action === 'add') addToCart(id);
    if (action === 'detail') navigate('product', id);
    if (action === 'favorite') {
      if (state.favorites.has(id)) {state.favorites.delete(id); showToast('Removed from your wishlist');}
      else {state.favorites.add(id); showToast('Saved to your wishlist');}
      renderProducts();
    }
    return;
  }
  const productLink = event.target.closest('[data-product-link]');
  if (productLink) {
    event.preventDefault();
    navigate('product', productLink.dataset.productLink);
  }
});

document.querySelector('#reset-filters').addEventListener('click', () => {
  state.category = 'All'; state.query = ''; state.showAll = false; searchInput.value = ''; renderProducts();
});
showMoreButton.addEventListener('click', () => {state.showAll = !state.showAll; renderProducts();});
document.querySelector('#cart-button').addEventListener('click', openCart);
document.querySelector('#close-drawer').addEventListener('click', closeCart);
document.querySelector('#continue-shopping').addEventListener('click', closeCart);
backdrop.addEventListener('click', closeCart);
cartContent.addEventListener('click', event => {
  const button = event.target.closest('[data-cart-action]');
  if (!button) return;
  const {id, cartAction} = button.dataset;
  const item = state.cart.get(id);
  if (!item) return;
  if (cartAction === 'remove' || (cartAction === 'decrease' && item.quantity === 1)) state.cart.delete(id);
  else if (cartAction === 'decrease') item.quantity--;
  else if (cartAction === 'increase') {
    if (item.quantity >= MAX_QUANTITY) {
      showToast(`You’ve reached the ${MAX_QUANTITY}-item limit for this find`);
      return;
    }
    item.quantity++;
  }
  renderCart();
});
document.querySelector('#checkout-button').addEventListener('click', () => {
  closeCart();
  navigate('checkout');
});
document.querySelector('#account-button').addEventListener('click', () => showToast('Your Morrow account is coming along nicely.'));
document.querySelector('.announcement-close').addEventListener('click', () => document.querySelector('.announcement').remove());

document.querySelectorAll('.brand').forEach(brand => brand.addEventListener('click', event => {
  event.preventDefault();
  showHome();
}));
document.querySelectorAll('.footer-links a').forEach(link => link.addEventListener('click', event => {
  if (state.currentPage === 'home') return;
  event.preventDefault();
  const target = link.getAttribute('href').slice(1);
  navigate('home', '', {scroll: false, focus: false});
  requestAnimationFrame(() => document.getElementById(target)?.scrollIntoView({behavior: 'smooth', block: 'start'}));
}));

routeView.addEventListener('click', event => {
  const productLink = event.target.closest('[data-route-product]');
  if (productLink) {
    event.preventDefault();
    navigate('product', productLink.dataset.routeProduct);
    return;
  }
  const button = event.target.closest('button');
  if (!button) return;
  if (button.dataset.quantity) {
    state.detailQuantity = Math.max(1, Math.min(9, state.detailQuantity + (button.dataset.quantity === 'plus' ? 1 : -1)));
    const value = document.querySelector('#detail-quantity');
    if (value) value.textContent = String(state.detailQuantity);
    const product = productsById.get(state.currentId);
    const buy = document.querySelector('[data-action="detail-buy"]');
    if (buy && product) buy.innerHTML = `Make it yours — ${money(product.price * state.detailQuantity)} <span aria-hidden="true">→</span>`;
    return;
  }
  const {action, id, category} = button.dataset;
  if (action === 'home') showHome();
  if (action === 'detail-add') addToCart(state.currentId, state.detailQuantity);
  if (action === 'detail-buy') {
    addToCart(state.currentId, state.detailQuantity);
    navigate('checkout');
  }
  if (action === 'shop-category') setCategory(category);
  if (action === 'show-bag') openCart();
  if (action === 'track-order') navigate('tracking', id);
  if (action === 'order-page') navigate('order', id);
});
routeView.addEventListener('submit', event => {
  if (event.target.id !== 'checkout-form') return;
  event.preventDefault();
  startDemoPayment(event.target);
});

document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && state.drawerOpen) closeCart();
  if (event.key === 'Tab' && state.drawerOpen) {
    const focusable = [...cartDrawer.querySelectorAll('button:not([disabled]),a[href],select,input')]
      .filter(element => !element.closest('[hidden]') && element.getClientRects().length > 0);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {event.preventDefault(); last.focus();}
    else if (!event.shiftKey && document.activeElement === last) {event.preventDefault(); first.focus();}
  }
});
