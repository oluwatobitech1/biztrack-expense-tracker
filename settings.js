let clearModal = null;

document.addEventListener('DOMContentLoaded', () => {
  requireSetup();

  const business = getBusiness();
  document.getElementById('settings-business-name').value = business.name;
  document.getElementById('settings-business-type').value = business.type;

  const account = getAccount();
  document.getElementById('account-email-label').textContent = account.email || '';

  document.getElementById('save-business-btn').addEventListener('click', () => {
    const name = document.getElementById('settings-business-name').value.trim();
    const type = document.getElementById('settings-business-type').value.trim();
    if (!name) {
      showToast('Business name cannot be empty.', 'error');
      return;
    }
    saveBusiness({ name, type });
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
