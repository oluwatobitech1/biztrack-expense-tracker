let clearModal = null;

function renderPremiumStatus() {
  const statusLabel = document.getElementById('premium-status-label');
  const noteBox = document.getElementById('premium-note-box');
  const upgradeBtn = document.getElementById('upgrade-premium-btn');
  const exportBtn = document.getElementById('export-csv-settings-btn');

  if (isPremium()) {
    statusLabel.textContent = 'Premium plan — active';
    noteBox.textContent = 'Thanks for upgrading! All premium features are unlocked on this device.';
    upgradeBtn.style.display = 'none';
    if (exportBtn) exportBtn.textContent = 'Export CSV';
  } else {
    statusLabel.textContent = 'Free plan';
    noteBox.textContent = 'Upgrade to unlock Reports, CSV export, unlimited transactions, and full branding.';
    upgradeBtn.style.display = '';
    upgradeBtn.textContent = 'Upgrade';
    if (exportBtn) exportBtn.textContent = 'Export CSV 🔒';
  }
}

function renderLogoUpsell() {
  const note = document.getElementById('logo-upsell-note');
  if (!note) return;
  note.style.display = isPremium() ? 'none' : 'block';
}

document.addEventListener('DOMContentLoaded', () => {
  if (!requireLogin()) return;

  // Handle return from Stripe payment link
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('premium') === 'success') {
    setPremium(true);
    showToast('Payment successful — Premium unlocked!', 'success');
    // Clean the URL so refreshing doesn't re-trigger this
    window.history.replaceState({}, document.title, window.location.pathname);
  }

  renderPremiumStatus();
  renderLogoUpsell();

  document.getElementById('upgrade-premium-btn').addEventListener('click', goToUpgrade);

  const business = getBusiness();
  document.getElementById('settings-business-name').value = business.name;
  document.getElementById('settings-business-type').value = business.type;

  const currencySelect = document.getElementById('settings-currency');
  const seenCodes = new Set();
  CURRENCIES.forEach((c) => {
    if (seenCodes.has(c.code)) return; // avoid duplicate options for shared currencies (e.g. EUR)
    seenCodes.add(c.code);
    const opt = document.createElement('option');
    opt.value = c.code;
    opt.textContent = c.label;
    currencySelect.appendChild(opt);
  });
  currencySelect.value = business.currency || 'USD';

  const account = getAccount();
  document.getElementById('account-username-label').textContent = account.username || '';

  document.getElementById('save-business-btn').addEventListener('click', () => {
    const name = document.getElementById('settings-business-name').value.trim();
    const type = document.getElementById('settings-business-type').value.trim();
    const currency = document.getElementById('settings-currency').value;
    if (!name) {
      showToast('Business name cannot be empty.', 'error');
      return;
    }
    saveBusiness({ name, type, currency });
    renderBusinessBadge();
    showToast('Business info updated.', 'success');
  });

  const settings = getSettings();
  setActiveTheme(settings.theme || 'light');

  document.querySelectorAll('[data-theme-option]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const theme = btn.getAttribute('data-theme-option');
      saveSettings({ theme });
      document.documentElement.setAttribute('data-theme', theme);
      setActiveTheme(theme);
    });
  });

  document.getElementById('export-csv-settings-btn').addEventListener('click', () => {
    if (!isPremium()) {
      showToast('CSV export is a Premium feature. Upgrade to unlock it.', 'error');
      return;
    }
    if (getTransactions().length === 0) {
      showToast('No transactions to export yet.', 'error');
      return;
    }
    exportTransactionsToCSV();
    showToast('CSV exported.', 'success');
  });

  clearModal = createConfirmModal({
    modalEl: document.getElementById('clear-data-modal'),
    confirmBtn: document.getElementById('confirm-clear-btn'),
    cancelBtn: document.getElementById('cancel-clear-btn'),
    onConfirm: () => {
      clearAllData();
      window.location.href = 'signup.html';
    }
  });

  document.getElementById('clear-data-btn').addEventListener('click', () => clearModal.open());

  document.getElementById('data-count-label').textContent =
    `${getTransactions().length} transaction${getTransactions().length === 1 ? '' : 's'} stored on this device.`;

  document.getElementById('send-feedback-btn').addEventListener('click', () => {
    const subject = document.getElementById('feedback-subject').value;
    const message = document.getElementById('feedback-message').value.trim();

    if (!message) {
      showToast('Please write a message before sending.', 'error');
      return;
    }

    const FEEDBACK_EMAIL = 'biztrack8@gmail.com';

    const mailSubject = `BizTrack Feedback: ${subject}`;
    const mailBody = `${message}\n\n---\nSent from BizTrack Settings`;

    const mailtoLink = `mailto:${FEEDBACK_EMAIL}?subject=${encodeURIComponent(mailSubject)}&body=${encodeURIComponent(mailBody)}`;
    window.location.href = mailtoLink;

    document.getElementById('feedback-message').value = '';
    showToast('Opening your email app...', 'success');
  });
});

function setActiveTheme(theme) {
  document.querySelectorAll('[data-theme-option]').forEach((btn) => {
    btn.classList.toggle('is-active', btn.getAttribute('data-theme-option') === theme);
  });
}
