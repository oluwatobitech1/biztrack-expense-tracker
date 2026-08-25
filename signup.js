document.addEventListener('DOMContentLoaded', () => {
  // Already signed in? Skip straight past signup.
  if (isLoggedIn()) {
    window.location.href = isSetupComplete() ? 'dashboard.html' : 'setup.html';
    return;
  }

  const countrySelect = document.getElementById('country-select');
  const currencyDisplay = document.getElementById('currency-display');

  const placeholder = document.createElement('option');
  placeholder.value = '';
  placeholder.textContent = 'Select your country';
  placeholder.disabled = true;
  placeholder.selected = true;
  countrySelect.appendChild(placeholder);

  CURRENCIES.forEach((c) => {
    const opt = document.createElement('option');
    opt.value = c.country; // country name is unique; currency code is not (e.g. EUR is shared)
    opt.textContent = c.country;
    countrySelect.appendChild(opt);
  });

  function updateCurrencyDisplay() {
    const match = CURRENCIES.find((c) => c.country === countrySelect.value);
    currencyDisplay.textContent = match ? match.label : 'Select a country first';
  }

  countrySelect.addEventListener('change', updateCurrencyDisplay);
  updateCurrencyDisplay();

  // Only allow digits in the PIN fields, and cap length defensively
  // even though maxlength is already set on the inputs.
  ['pin-input', 'pin-confirm-input'].forEach((id) => {
    const el = document.getElementById(id);
    el.addEventListener('input', () => {
      el.value = el.value.replace(/\D/g, '').slice(0, 4);
    });
  });

  document.getElementById('signup-form').addEventListener('submit', handleSignup);

  // Recovery code screen wiring
  const copyBtn = document.getElementById('copy-recovery-btn');
  const savedCheckbox = document.getElementById('recovery-saved-checkbox');
  const continueBtn = document.getElementById('recovery-continue-btn');
  const codeDisplay = document.getElementById('recovery-code-display');

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
    window.location.href = 'setup.html';
  });
});

function showToastSafe(message, variant) {
  if (typeof showToast === 'function') {
    showToast(message, variant);
  }
}

function handleSignup(e) {
  e.preventDefault();

  const nameInput = document.getElementById('name-input');
  const usernameInput = document.getElementById('username-input');
  const pinInput = document.getElementById('pin-input');
  const pinConfirmInput = document.getElementById('pin-confirm-input');
  const termsCheckbox = document.getElementById('terms-checkbox');
  const countrySelect = document.getElementById('country-select');
  const errorBanner = document.getElementById('auth-error-banner');
  const submitBtn = document.getElementById('signup-submit-btn');

  [nameInput, usernameInput, pinInput, pinConfirmInput, countrySelect].forEach((el) => el.classList.remove('is-invalid'));
  errorBanner.classList.remove('is-visible');

  const name = nameInput.value.trim();
  const username = usernameInput.value.trim();
  const pin = pinInput.value;
  const pinConfirm = pinConfirmInput.value;

  let hasError = false;
  let message = '';

  if (!name) {
    nameInput.classList.add('is-invalid');
    message = 'Please enter your full name.';
    hasError = true;
  } else if (!username || !isValidUsername(username)) {
    usernameInput.classList.add('is-invalid');
    message = 'Username must be at least 3 characters, using only letters, numbers, underscores, or periods.';
    hasError = true;
  } else if (isUsernameTaken(username)) {
    usernameInput.classList.add('is-invalid');
    message = 'That username is already taken. Try another.';
    hasError = true;
  } else if (!countrySelect.value) {
    countrySelect.classList.add('is-invalid');
    message = 'Please select your country.';
    hasError = true;
  } else if (!/^\d{4}$/.test(pin)) {
    pinInput.classList.add('is-invalid');
    message = 'PIN must be exactly 4 digits.';
    hasError = true;
  } else if (pinConfirm !== pin) {
    pinConfirmInput.classList.add('is-invalid');
    message = 'PINs do not match.';
    hasError = true;
  } else if (!termsCheckbox.checked) {
    message = 'Please agree to the Terms of Use and Privacy Policy.';
    hasError = true;
  }

  if (hasError) {
    errorBanner.textContent = message;
    errorBanner.classList.add('is-visible');
    return;
  }

  const match = CURRENCIES.find((c) => c.country === countrySelect.value);

  setButtonLoading(submitBtn, true);

  const recoveryCode = createAccount({
    name,
    username,
    pin,
    country: countrySelect.value,
    currency: match ? match.code : 'USD'
  });

  // Show the recovery code screen instead of redirecting immediately —
  // this is the only time it will ever be shown.
  document.getElementById('signup-panel').style.display = 'none';
  document.getElementById('recovery-panel').style.display = 'block';
  document.getElementById('recovery-code-display').textContent = recoveryCode;
}

function isValidUsername(username) {
  return /^[a-zA-Z0-9_.]{3,}$/.test(username);
}

/**
 * Suggests a language code based on a country name, for auto-switching
 * the UI language when someone picks their country at signup.
 * Falls back to 'en' for any country not explicitly mapped, or if the
 * country isn't recognized. Adjust the codes below to match whatever
 * languages i18n.js actually supports in this app.
 */
function suggestLanguageForCountry(country) {
  const countryToLanguage = {
    'France': 'fr',
    'Germany': 'de',
    'Spain': 'es',
    'Mexico': 'es',
    'Argentina': 'es',
    'Colombia': 'es',
    'Chile': 'es',
    'Italy': 'it',
    'Brazil': 'pt',
    'Netherlands': 'nl',
    'Turkey': 'tr',
    'Saudi Arabia': 'ar',
    'United Arab Emirates': 'ar',
    'Qatar': 'ar',
    'Egypt': 'ar',
    'Morocco': 'ar',
    'China': 'zh',
    'Japan': 'ja',
    'South Korea': 'ko',
    'Vietnam': 'vi',
    'Indonesia': 'id',
    'Poland': 'pl',
    'Sweden': 'sv',
    'Norway': 'no'
  };

  return countryToLanguage[country] || 'en';
}
