document.addEventListener('DOMContentLoaded', () => {
  if (isLoggedIn()) {
    window.location.href = isSetupComplete() ? 'dashboard.html' : 'setup.html';
    return;
  }

  if (!isAccountCreated()) {
    window.location.href = 'signup.html';
    return;
  }

  ['new-pin-input', 'new-pin-confirm-input'].forEach((id) => {
    const el = document.getElementById(id);
    el.addEventListener('input', () => {
      el.value = el.value.replace(/\D/g, '').slice(0, 4);
    });
  });

  const codeInput = document.getElementById('recover-code-input');
  codeInput.addEventListener('input', () => {
    codeInput.value = codeInput.value.toUpperCase();
  });

  document.getElementById('recover-form').addEventListener('submit', handleRecover);

  // New recovery code screen wiring
  const copyBtn = document.getElementById('copy-new-recovery-btn');
  const savedCheckbox = document.getElementById('new-recovery-saved-checkbox');
  const continueBtn = document.getElementById('new-recovery-continue-btn');
  const codeDisplay = document.getElementById('new-recovery-code-display');

  copyBtn.addEventListener('click', () => {
    const code = codeDisplay.textContent;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(code).then(() => {
        showToastSafe('Recovery code copied.');
      }).catch(() => {
        showToastSafe('Could not copy automatically — please copy it manually.', 'error');
      });
    } else {
      showToastSafe('Please select and copy the code manually.', 'error');
    }
  });

  savedCheckbox.addEventListener('change', () => {
    continueBtn.disabled = !savedCheckbox.checked;
  });

  continueBtn.addEventListener('click', () => {
    window.location.href = 'login.html';
  });
});

function showToastSafe(message, variant) {
  if (typeof showToast === 'function') {
    showToast(message, variant);
  }
}

function handleRecover(e) {
  e.preventDefault();

  const usernameInput = document.getElementById('recover-username-input');
  const codeInput = document.getElementById('recover-code-input');
  const newPinInput = document.getElementById('new-pin-input');
  const newPinConfirmInput = document.getElementById('new-pin-confirm-input');
  const errorBanner = document.getElementById('recover-error-banner');
  const submitBtn = document.getElementById('recover-submit-btn');

  [usernameInput, codeInput, newPinInput, newPinConfirmInput].forEach((el) => el.classList.remove('is-invalid'));
  errorBanner.classList.remove('is-visible');

  const username = usernameInput.value.trim();
  const code = codeInput.value.trim();
  const newPin = newPinInput.value;
  const newPinConfirm = newPinConfirmInput.value;

  let hasError = false;
  let message = '';

  if (!username) {
    usernameInput.classList.add('is-invalid');
    message = 'Please enter your username.';
    hasError = true;
  } else if (!code) {
    codeInput.classList.add('is-invalid');
    message = 'Please enter your recovery code.';
    hasError = true;
  } else if (!/^\d{4}$/.test(newPin)) {
    newPinInput.classList.add('is-invalid');
    message = 'New PIN must be exactly 4 digits.';
    hasError = true;
  } else if (newPinConfirm !== newPin) {
    newPinConfirmInput.classList.add('is-invalid');
    message = 'PINs do not match.';
    hasError = true;
  }

  if (hasError) {
    errorBanner.textContent = message;
    errorBanner.classList.add('is-visible');
    return;
  }

  setButtonLoading(submitBtn, true);

  const newRecoveryCode = resetPinWithRecoveryCode(username, code, newPin);

  if (!newRecoveryCode) {
    setButtonLoading(submitBtn, false);
    errorBanner.textContent = 'That username and recovery code don\u2019t match. Double-check and try again.';
    errorBanner.classList.add('is-visible');
    usernameInput.classList.add('is-invalid');
    codeInput.classList.add('is-invalid');
    return;
  }

  // Show the new (rotated) recovery code — the old one is now dead.
  document.getElementById('recover-panel').style.display = 'none';
  document.getElementById('new-recovery-panel').style.display = 'block';
  document.getElementById('new-recovery-code-display').textContent = newRecoveryCode;
}
