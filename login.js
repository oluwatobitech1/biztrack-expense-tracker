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

  const emailInput = document.getElementById('login-email-input');
  const passwordInput = document.getElementById('login-password-input');
  const errorBanner = document.getElementById('login-error-banner');

  [emailInput, passwordInput].forEach((el) => el.classList.remove('is-invalid'));
  errorBanner.classList.remove('is-visible');

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  if (!email || !password) {
    errorBanner.textContent = 'Please enter your email and password.';
    errorBanner.classList.add('is-visible');
    return;
  }

  const success = login(email, password);

  if (!success) {
    errorBanner.textContent = 'Incorrect email or password.';
    errorBanner.classList.add('is-visible');
    emailInput.classList.add('is-invalid');
    passwordInput.classList.add('is-invalid');
    return;
  }

  window.location.href = isSetupComplete() ? 'dashboard.html' : 'setup.html';
}
