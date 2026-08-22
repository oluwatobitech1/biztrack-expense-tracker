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

  document.getElementById('login-form').addEventListener('submit', handleLogin);
});

function handleLogin(e) {
  e.preventDefault();

  const usernameInput = document.getElementById('login-username-input');
  const passwordInput = document.getElementById('login-password-input');
  const errorBanner = document.getElementById('login-error-banner');
  const submitBtn = document.getElementById('login-submit-btn');

  [usernameInput, passwordInput].forEach((el) => el.classList.remove('is-invalid'));
  errorBanner.classList.remove('is-visible');

  const username = usernameInput.value.trim();
  const password = passwordInput.value;

  if (!username || !password) {
    errorBanner.textContent = 'Please enter your username and password.';
    errorBanner.classList.add('is-visible');
    return;
  }

  setButtonLoading(submitBtn, true);

  const success = login(username, password);

  if (!success) {
    setButtonLoading(submitBtn, false);
    errorBanner.textContent = 'Incorrect username or password.';
    errorBanner.classList.add('is-visible');
    usernameInput.classList.add('is-invalid');
    passwordInput.classList.add('is-invalid');
    return;
  }

  window.location.href = isSetupComplete() ? 'dashboard.html' : 'setup.html';
}
