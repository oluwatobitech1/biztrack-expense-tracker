let clearModal = null;

document.addEventListener('DOMContentLoaded', () => {
  if (!requireLogin()) return;

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
});

function setActiveTheme(theme) {
  document.querySelectorAll('[data-theme-option]').forEach((btn) => {
    btn.classList.toggle('is-active', btn.getAttribute('data-theme-option') === theme);
  });
}
