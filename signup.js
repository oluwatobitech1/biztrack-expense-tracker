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

  [nameInput, emailInput, passwordInput, countrySelect].forEach((el) => el.classList.remove('is-invalid'));
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
  } else if (!countrySelect.value) {
    countrySelect.classList.add('is-invalid');
    message = 'Please select your country.';
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

  const match = CURRENCIES.find((c) => c.country === countrySelect.value);

  createAccount({
    name,
    email,
    password,
    country: countrySelect.value,
    currency: match ? match.code : 'USD'
  });

  window.location.href = 'setup.html';
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
