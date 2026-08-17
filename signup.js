document.addEventListener('DOMContentLoaded', () => {
  // Already signed in? Skip straight past signup.
  if (isLoggedIn()) {
    window.location.href = isSetupComplete() ? 'dashboard.html' : 'setup.html';
    return;
  }

  const countrySelect = document.getElementById('country-select');
  const currencyDisplay = document.getElementById('currency-display');

  CURRENCIES.forEach((c) => {
    const opt = document.createElement('option');
    opt.value = c.code;
    opt.textContent = c.country;
    countrySelect.appendChild(opt);
  });

  function updateCurrencyDisplay() {
    const match = CURRENCIES.find((c) => c.code === countrySelect.value);
    currencyDisplay.textContent = match ? match.label : 'Select a country';
  }

  countrySelect.addEventListener('change', updateCurrencyDisplay);
  countrySelect.value = 'NGN';
  updateCurrencyDisplay();

  document.getElementById('signup-form').addEventListener('submit', handleSignup);
});

function handleSignup(e) {
  e.preventDefault();

  const nameInput = document.getElementById('name-input');
  const emailInput = document.getElementById('email-input');
  const passwordInput = document.getElementById('password-input');
  const termsCheckbox = document.getElementById('terms-checkbox');
  const countrySelect = document.getElementById('country-select');
  const errorBanner = document.getElementById('auth-error-banner');

  [nameInput, emailInput, passwordInput].forEach((el) => el.classList.remove('is-invalid'));
  errorBanner.classList.remove('is-visible');

  const name = nameInput.value.trim();
  const email = emailInput.value.trim();
  const password = passwordInput.value;

  let hasError = false;
  let message = '';

  if (!name) {
    nameInput.classList.add('is-invalid');
    message = 'Please enter your full name.';
    hasError = true;
  } else if (!email || !isValidEmail(email)) {
    emailInput.classList.add('is-invalid');
    message = 'Please enter a valid email address.';
    hasError = true;
  } else if (!password || password.length < 6) {
    passwordInput.classList.add('is-invalid');
    message = 'Password must be at least 6 characters.';
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

  const currencyCode = countrySelect.value;
  const match = CURRENCIES.find((c) => c.code === currencyCode);

  createAccount({
    name,
    email,
    password,
    country: match ? match.country : '',
    currency: currencyCode
  });

  window.location.href = 'setup.html';
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
