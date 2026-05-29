// ===== CART STATE =====
const UPI_ID = 'moonitakash@okicici';
let cart = JSON.parse(localStorage.getItem('msc_cart')) || [];
let selectedPayment = '';

// ===== NAVBAR SCROLL =====
window.addEventListener('scroll', () => {
  const nav = document.getElementById('navbar');
  nav.classList.toggle('scrolled', window.scrollY > 50);
});

// ===== MOBILE MENU =====
function toggleMobileMenu() {
  document.getElementById('mobileMenu').classList.toggle('open');
}

// ===== MENU TABS =====
function switchTab(index) {
  document.querySelectorAll('.tab-btn').forEach((btn, i) => btn.classList.toggle('active', i === index));
  document.querySelectorAll('.tab-content').forEach((tab, i) => tab.classList.toggle('active', i === index));
}

// ===== CART FUNCTIONS =====
function saveCart() {
  localStorage.setItem('msc_cart', JSON.stringify(cart));
  updateCartUI();
}

function addToCart(id, name, price, image) {
  if (price === 0) {
    alert('Please contact us on WhatsApp for thali/puri bhaji pricing and availability.');
    window.open('https://wa.me/919909052121?text=Hi, I want to enquire about ' + name, '_blank');
    return;
  }
  const existing = cart.find(item => item.id === id);
  if (existing) {
    existing.quantity++;
  } else {
    cart.push({ id, name, price, image, quantity: 1 });
  }
  saveCart();
  toggleCart();
}

function enquireThali() {
  alert('Please contact us on WhatsApp for Thali/Puri Bhaji pricing and availability.');
  window.open('https://wa.me/919909052121?text=Hi, I want to enquire about Thali / Puri Bhaji menu', '_blank');
}

function updateQuantity(id, delta) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.quantity += delta;
  if (item.quantity <= 0) {
    cart = cart.filter(i => i.id !== id);
  }
  saveCart();
}

function removeFromCart(id) {
  cart = cart.filter(i => i.id !== id);
  saveCart();
}

function toggleCart() {
  document.getElementById('cartDrawer').classList.toggle('open');
  document.getElementById('cartOverlay').classList.toggle('open');
  document.body.style.overflow = document.getElementById('cartDrawer').classList.contains('open') ? 'hidden' : '';
}

function proceedToCheckout() {
  toggleCart();
  document.getElementById('checkout').scrollIntoView({ behavior: 'smooth' });
}

function updateCartUI() {
  const totalItems = cart.reduce((s, i) => s + i.quantity, 0);
  const totalPrice = cart.reduce((s, i) => s + i.price * i.quantity, 0);

  document.getElementById('cartBadge').textContent = totalItems;
  document.getElementById('cartBadgeMobile').textContent = totalItems;
  document.getElementById('cartCount').textContent = totalItems;

  const cartItemsEl = document.getElementById('cartItems');
  if (cart.length === 0) {
    cartItemsEl.innerHTML = '<div class="empty-cart"><span>&#128722;</span><p>Your cart is empty</p><p class="sub">Add some delicious items!</p><button class="btn-primary" onclick="toggleCart()">Browse Menu</button></div>';
    document.getElementById('cartFooter').style.display = 'none';
  } else {
    cartItemsEl.innerHTML = cart.map(item => `
      <div class="cart-item">
        <img src="${item.image}" alt="${item.name}">
        <div class="info">
          <h4>${item.name}</h4>
          <span class="price">Rs. ${item.price}</span>
        </div>
        <div class="qty-controls">
          <button onclick="updateQuantity('${item.id}', -1)">-</button>
          <span>${item.quantity}</span>
          <button onclick="updateQuantity('${item.id}', 1)">+</button>
        </div>
        <button class="remove-btn" onclick="removeFromCart('${item.id}')">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
        </button>
      </div>
    `).join('');
    document.getElementById('cartFooter').style.display = 'block';
    document.getElementById('cartTotal').textContent = 'Rs. ' + totalPrice;
  }

  updateCheckoutSummary();
}

// ===== CHECKOUT =====
function updateCheckoutSummary() {
  const summaryEl = document.getElementById('checkoutSummary');
  const totalPrice = cart.reduce((s, i) => s + i.price * i.quantity, 0);

  if (cart.length === 0) {
    summaryEl.innerHTML = '<p style="color:var(--muted);font-size:0.85rem;padding:2rem 0;text-align:center;">Your cart is empty. Add items from the menu.</p>';
  } else {
    summaryEl.innerHTML = cart.map(item => `
      <div class="checkout-item">
        <img src="${item.image}" alt="${item.name}">
        <p>${item.name}</p>
        <span style="color:var(--muted);font-size:0.75rem;">x${item.quantity}</span>
        <span class="price">Rs. ${item.price * item.quantity}</span>
      </div>
    `).join('');
  }
  document.getElementById('checkoutTotal').textContent = 'Rs. ' + totalPrice;

  const btn = document.getElementById('placeOrderBtn');
  if (btn) {
    const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);
    if (total === 0) btn.textContent = 'Add Items to Place Order';
    else if (selectedPayment === 'cod') btn.textContent = `Place Order - Rs. ${total}`;
    else if (selectedPayment === 'card') btn.textContent = `Pay Rs. ${total} with Card`;
    else btn.textContent = `Pay Rs. ${total} via UPI`;
  }
}

function selectPayment(method) {
  selectedPayment = method;
  document.querySelectorAll('.pay-opt').forEach(btn => btn.classList.remove('selected'));
  document.getElementById('pay-' + method).classList.add('selected');

  const upiInfo = document.getElementById('upiInfo');
  if (method === 'gpay' || method === 'phonepe' || method === 'upi') {
    upiInfo.style.display = 'block';
  } else {
    upiInfo.style.display = 'none';
  }
  updateCheckoutSummary();
}

function placeOrder() {
  const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  if (total === 0) {
    document.getElementById('menu').scrollIntoView({ behavior: 'smooth' });
    return;
  }

  const name = document.getElementById('cName').value.trim();
  const phone = document.getElementById('cPhone').value.trim();
  const address = document.getElementById('cAddress').value.trim();

  if (!name || !phone || !address) {
    alert('Please fill all delivery details.');
    return;
  }
  if (!selectedPayment) {
    alert('Please select a payment method.');
    return;
  }

  const orderMsg = `*New Order - Mini Samosa Center*%0A%0A*Name:* ${name}%0A*Phone:* ${phone}%0A*Address:* ${address}%0A%0A*Items:*%0A${cart.map(i => `- ${i.name} x${i.quantity} = Rs. ${i.price * i.quantity}`).join('%0A')}%0A%0A*Total:* Rs. ${total}%0A*Payment:* ${selectedPayment.toUpperCase()}`;

  if (selectedPayment === 'gpay') {
    const gpayUrl = `tez://upi/pay?pa=${UPI_ID}&pn=Mini+Samosa+Center&am=${total}&cu=INR&tn=Order+Payment`;
    window.location.href = gpayUrl;
    setTimeout(() => {
      const upiFallback = `upi://pay?pa=${UPI_ID}&pn=Mini+Samosa+Center&am=${total}&cu=INR&tn=Order+Payment`;
      window.location.href = upiFallback;
    }, 500);
    window.open(`https://wa.me/919909052121?text=${orderMsg}`, '_blank');
  }
  else if (selectedPayment === 'phonepe') {
    const phonepeUrl = `phonepe://pay?pa=${UPI_ID}&pn=Mini+Samosa+Center&am=${total}&cu=INR&tn=Order+Payment`;
    window.location.href = phonepeUrl;
    setTimeout(() => {
      const upiFallback = `upi://pay?pa=${UPI_ID}&pn=Mini+Samosa+Center&am=${total}&cu=INR&tn=Order+Payment`;
      window.location.href = upiFallback;
    }, 500);
    window.open(`https://wa.me/919909052121?text=${orderMsg}`, '_blank');
  }
  else if (selectedPayment === 'upi') {
    const upiUrl = `upi://pay?pa=${UPI_ID}&pn=Mini+Samosa+Center&am=${total}&cu=INR&tn=Order+Payment`;
    window.location.href = upiUrl;
    window.open(`https://wa.me/919909052121?text=${orderMsg}`, '_blank');
  }
  else if (selectedPayment === 'card') {
    alert(`Card Payment of Rs. ${total}\n\nPlease pay Rs. ${total} using any card app to UPI ID: ${UPI_ID}\n\nAfter payment, send screenshot on WhatsApp: +91 99090 52121`);
    window.open(`https://wa.me/919909052121?text=${orderMsg}`, '_blank');
  }
  else if (selectedPayment === 'cod') {
    window.open(`https://wa.me/919909052121?text=${orderMsg}`, '_blank');
  }

  // Show success
  cart = [];
  saveCart();
  document.getElementById('checkout').innerHTML = `
    <div class="container" style="max-width:600px;">
      <div class="order-success">
        <span class="success-icon">&#127881;</span>
        <h2>Order Placed!</h2>
        <p>Thank you ${name}! Your order has been sent. We will confirm shortly on WhatsApp.</p>
        <button class="btn-primary" onclick="location.reload()">Order More</button>
      </div>
    </div>
  `;
}

// ===== SCROLL REVEAL =====
const revealElements = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.1 });
revealElements.forEach(el => revealObserver.observe(el));

// ===== SMOOTH SCROLL FOR ANCHOR LINKS =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const href = this.getAttribute('href');
    if (href === '#') return;
    e.preventDefault();
    const target = document.querySelector(href);
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

// ===== INIT =====
updateCartUI();
