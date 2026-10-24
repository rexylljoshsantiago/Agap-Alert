// Show/hide password buttons + demo credential fill (demo box only exists when APP_DEBUG is true)
document.querySelectorAll('.pw-toggle').forEach(function (btn) {
  btn.addEventListener('click', function () {
    var input = document.getElementById(btn.dataset.target);
    var show = input.type === 'password';
    input.type = show ? 'text' : 'password';
    btn.textContent = show ? 'Hide' : 'Show';
    btn.setAttribute('aria-pressed', show ? 'true' : 'false');
  });
});
document.querySelectorAll('[data-demo-email]').forEach(function (btn) {
  btn.addEventListener('click', function () {
    document.getElementById('email').value = btn.dataset.demoEmail;
    document.getElementById('password').value = btn.dataset.demoPassword;
    document.getElementById('password').focus();
  });
});
