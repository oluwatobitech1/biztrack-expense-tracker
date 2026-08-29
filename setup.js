document.addEventListener('DOMContentLoaded', () => {
  const step1 = document.getElementById('setup-step-1');
  const step2 = document.getElementById('setup-step-2');
  const dot1 = document.getElementById('progress-dot-1');
  const dot2 = document.getElementById('progress-dot-2');

  const nameInput = document.getElementById('business-name-input');
  const nameError = document.getElementById('business-name-error');
  const continueBtn = document.getElementById('setup-continue-btn');
  const backBtn = document.getElementById('setup-back-btn');
  const finishBtn = document.getElementById('setup-finish-btn');

  let selectedType = '';

  // If a name was already saved (user hit back from elsewhere), prefill it.
  const existing = getBusiness();
  if (existing.name) nameInput.value = existing.name;

  continueBtn.addEventListener('click', () => {
    const name = nameInput.value.trim();
    if (!name) {
      nameError.textContent = 'Please enter your business name.';
      nameError.classList.add('is-visible');
      nameInput.classList.add('is-invalid');
      return;
    }
    nameError.classList.remove('is-visible');
    nameInput.classList.remove('is-invalid');
    const saved = saveBusiness({ name });

    if (!saved) {
      if (typeof showToast === 'function') {
        showToast("Couldn't save your business name. Check your browser's storage settings and try again.", 'error');
      }
      return;
    }

    step1.classList.remove('is-active');
    step2.classList.add('is-active');
    dot1.classList.add('is-complete');
  });

  backBtn.addEventListener('click', () => {
    step2.classList.remove('is-active');
    step1.classList.add('is-active');
    dot1.classList.remove('is-complete');
  });

  document.querySelectorAll('.business-type-option').forEach((option) => {
    option.addEventListener('click', () => {
      document.querySelectorAll('.business-type-option').forEach((o) => o.classList.remove('is-selected'));
      option.classList.add('is-selected');
      selectedType = option.getAttribute('data-type');
      finishBtn.disabled = false;
    });
  });

  finishBtn.addEventListener('click', () => {
    if (!selectedType) return;

    const saved = saveBusiness({ type: selectedType, currency: 'NGN' });

    if (!saved || !isSetupComplete()) {
      // Save failed or didn't stick (e.g. private browsing / storage blocked) —
      // tell the user instead of silently bouncing them back to this page.
      if (typeof showToast === 'function') {
        showToast("Couldn't save your business info. Check your browser's storage settings and try again.", 'error');
      }
      return;
    }

    dot2.classList.add('is-complete');
    window.location.href = 'dashboard.html';
  });

  nameInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') continueBtn.click();
  });
});
