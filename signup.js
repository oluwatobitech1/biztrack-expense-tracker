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
  const usernameInput = document.getElementById('username-input');
  const emailInput = document.getElementById('email-input');
  const passwordInput = document.getElementById('password-input');
  const termsCheckbox = document.getElementById('terms-checkbox');
  const countrySelect = document.getElementById('country-select');
  const errorBanner = document.getElementById('auth-error-banner');
  const submitBtn = document.getElementById('signup-submit-btn');

  [nameInput, usernameInput, emailInput, passwordInput, countrySelect].forEach((el) => el.classList.remove('is-invalid'));
  errorBanner.classList.remove('is-visible');

  const name = nameInput.value.trim();
  const username = usernameInput.value.trim();
  const email = emailInput.value.trim();
  const password = passwordInput.value;

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

  setButtonLoading(submitBtn, true);

  createAccount({
    name,
    username,
    email,
    password,
    country: countrySelect.value,
    currency: match ? match.code : 'USD'
  });

  window.location.href = 'setup.html';
}

function isValidUsername(username) {
  return /^[a-zA-Z0-9_.]{3,}$/.test(username);
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * BizTrack currently stores only a single local account per browser
 * (see storage.js: createAccount() saves name/email/passwordHash/country,
 * with no username field and no list of other accounts to check against).
 * There is no real multi-user store yet, so nothing can actually be
 * "taken" — this keeps the validation flow working without blocking
 * real signups until a proper backend/user list exists.
 */
function isUsernameTaken(username) {
  return false;
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
