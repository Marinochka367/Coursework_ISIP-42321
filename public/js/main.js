document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.flash').forEach((flash) => {
    setTimeout(() => {
      flash.style.transition = 'opacity 0.3s ease';
      flash.style.opacity = '0';
      setTimeout(() => flash.remove(), 300);
    }, 3500);
  });
});
