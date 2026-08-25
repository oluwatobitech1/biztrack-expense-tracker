document.addEventListener('DOMContentLoaded', () => {
  if (isLoggedIn()) {
    window.location.href = isSetupComplete() ? 'dashboard.html' : 'setup.html';
    return;
  }

  if (!isAccountCreated()) {
    // Nobody has signed up on this device yet — send them to create an account.
    window.location.href = 'signup.html';
    return;
  }

  const pinInput = document.getElementById('login-pin-input');
  pinInput.addEventListener('input', () => {
    pinInput.value = pinInput.value.replace(/\D/g, '').slice(0, 4);
  });

  document.getElementById('login-form').addEventListener('submit', handleLogin);
});

function handleLogin(e) {
  e.preventDefault();

  const usernameInput = document.getElementById('login-username-input');
  const pinInput = document.getElementById('login-pin-input');
  const errorBanner = document.getElementById('login-error-banner');
  const submitBtn = document.getElementById('login-submit-btn');

  [usernameInput, pinInput].forEach((el) => el.classList.remove('is-invalid'));
  errorBanner.classList.remove('is-visible');

  const username = usernameInput.value.trim();
  const pin = pinInput.value;

  if (!username || !pin) {
    errorBanner.textContent = 'Please enter your username and PIN.';
    errorBanner.classList.add('is-visible');
    return;
  }

  setButtonLoading(submitBtn, true);

  const success = login(username, pin);

  if (!success) {
    setButtonLoading(submitBtn, false);
    errorBanner.textContent = 'Incorrect username or PIN.';
    errorBanner.classList.add('is-visible');
    usernameInput.classList.add('is-invalid');
    pinInput.classList.add('is-invalid');
    return;
  }

  window.location.href = isSetupComplete() ? 'dashboard.html' : 'setup.html';
}
