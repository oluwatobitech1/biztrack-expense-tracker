/**
 * app.js
 * Shared helpers used across every page: currency formatting, theme
 * application, active-nav highlighting, and page guards.
 */

function formatCurrency(amount) {
  const business = getBusiness();
  const currencyCode = business.currency || 'NGN';
  const match = CURRENCIES.find((c) => c.code === currencyCode);
  const symbol = match ? match.symbol : currencyCode + ' ';
  const formatted = new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(Math.abs(Number(amount) || 0));
  return `${symbol}${formatted}`;
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  if (isNaN(date)) return dateStr;
  return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

function applyTheme() {
  const settings = getSettings();
  document.documentElement.setAttribute('data-theme', settings.theme || 'light');
}

function setGreeting(el) {
  if (!el) return;
  const hour = new Date().getHours();
  let greeting = 'Good morning';
  if (hour >= 12 && hour < 17) greeting = 'Good afternoon';
  else if (hour >= 17) greeting = 'Good evening';
  el.textContent = `${greeting} \uD83D\uDC4B`;
}

/** Redirect to login if no session, or to setup if the business profile is incomplete. Call on every app page. */
function requireSetup() {
  if (!isLoggedIn()) {
    window.location.href = 'login.html';
    return;
  }
  if (!isSetupComplete()) {
    window.location.href = 'setup.html';
  }
}

/** Highlight the current page in sidebar + mobile nav based on body[data-page]. */
function highlightActiveNav() {
  const page = document.body.getAttribute('data-page');
  if (!page) return;
  document.querySelectorAll('[data-nav-link]').forEach((link) => {
    if (link.getAttribute('data-nav-link') === page) {
      link.classList.add('is-active');
    } else {
      link.classList.remove('is-active');
    }
  });
}

/** Fill in the business name badge shown in the sidebar, if present. Shows the business logo instead of initials once one is set. */
function renderBusinessBadge() {
  const nameEl = document.querySelector('[data-business-name]');
  if (!nameEl) return;
  const business = getBusiness();
  nameEl.textContent = business.name || 'Your Business';
  const typeEl = document.querySelector('[data-business-type]');
  if (typeEl) typeEl.textContent = business.type || '';

  const initialEl = document.querySelector('[data-business-initial]');
  if (!initialEl) return;

  if (business.logo) {
    initialEl.textContent = '';
    initialEl.style.background = 'transparent';
    let img = initialEl.querySelector('img');
    if (!img) {
      img = document.createElement('img');
      img.style.width = '100%';
      img.style.height = '100%';
      img.style.objectFit = 'cover';
      img.style.borderRadius = '50%';
      initialEl.appendChild(img);
    }
    img.src = business.logo;
    img.alt = business.name || 'Business logo';
  } else {
    initialEl.innerHTML = '';
    initialEl.style.background = '';
    initialEl.textContent = (business.name || 'B').charAt(0).toUpperCase();
  }
}

/**
 * Reads an image file, downsizes it to fit within maxDim x maxDim
 * (keeping aspect ratio), and hands back a PNG data URL via callback.
 * Keeps logos small so they don't bloat localStorage.
 */
function resizeImageFile(file, maxDim, callback) {
  const reader = new FileReader();
  reader.onload = function (e) {
    const img = new Image();
    img.onload = function () {
      let width = img.width;
      let height = img.height;
      if (width > height && width > maxDim) {
        height = Math.round(height * (maxDim / width));
        width = maxDim;
      } else if (height >= width && height > maxDim) {
        width = Math.round(width * (maxDim / height));
        height = maxDim;
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      callback(canvas.toDataURL('image/png'));
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

/** Lightweight toast notification. Requires a #toast-root element on the page. */
function showToast(message, variant = 'success') {
  let root = document.getElementById('toast-root');
  if (!root) {
    root = document.createElement('div');
    root.id = 'toast-root';
    root.className = 'toast-root';
    document.body.appendChild(root);
  }
  const toast = document.createElement('div');
  toast.className = `toast toast--${variant}`;
  toast.setAttribute('role', 'status');
  toast.textContent = message;
  root.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add('is-visible'));

  setTimeout(() => {
    toast.classList.remove('is-visible');
    setTimeout(() => toast.remove(), 250);
  }, 3000);
}

/** Wire up a confirm modal. Returns a function you can call to open it. */
function createConfirmModal({ modalEl, confirmBtn, cancelBtn, onConfirm }) {
  function open() {
    modalEl.classList.add('is-open');
    document.body.classList.add('modal-open');
  }
  function close() {
    modalEl.classList.remove('is-open');
    document.body.classList.remove('modal-open');
  }
  cancelBtn.addEventListener('click', close);
  modalEl.addEventListener('click', (e) => {
    if (e.target === modalEl) close();
  });
  confirmBtn.addEventListener('click', () => {
    onConfirm();
    close();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalEl.classList.contains('is-open')) close();
  });
  return { open, close };
}

// Apply theme as early as possible on every page to avoid a flash.
applyTheme();

function wireLogoutButtons() {
  document.querySelectorAll('[data-logout]').forEach((btn) => {
    btn.addEventListener('click', () => {
      logout();
      window.location.href = 'login.html';
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  highlightActiveNav();
  renderBusinessBadge();
  wireLogoutButtons();
});
