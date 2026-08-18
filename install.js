// Wires up every [data-install-trigger] button to the browser's PWA install prompt.
document.addEventListener('DOMContentLoaded', () => {
  let deferredPrompt = null;
  const triggers = document.querySelectorAll('[data-install-trigger]');

  if (!triggers.length) return;

  // Hide install buttons until the browser tells us installing is actually possible.
  triggers.forEach((btn) => (btn.style.display = 'none'));

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    triggers.forEach((btn) => (btn.style.display = ''));
  });

  triggers.forEach((btn) => {
    btn.addEventListener('click', async () => {
      if (!deferredPrompt) return;
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      deferredPrompt = null;
      triggers.forEach((b) => (b.style.display = 'none'));
    });
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    triggers.forEach((btn) => (btn.style.display = 'none'));
  });
});
