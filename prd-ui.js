(function () {
  const form = document.querySelector('[data-auth-form]');
  if (!form) return;
  const passwordLabel = form.elements.password?.closest('label');
  const consent = document.createElement('label');
  consent.className = 'auth-consent';
  consent.hidden = true;
  consent.innerHTML = '<input name="consent" type="checkbox"><span>I agree to the <a href="terms.html" target="_blank" rel="noreferrer">Terms</a> and <a href="privacy.html" target="_blank" rel="noreferrer">Privacy Policy</a>.</span>';
  passwordLabel?.insertAdjacentElement('afterend', consent);

  function syncConsent() {
    const register = typeof authMode !== 'undefined' && authMode === 'register';
    const zh = document.documentElement.lang === 'zh-CN';
    consent.hidden = !register;
    consent.querySelector('input').required = register;
    consent.querySelector('span').innerHTML = zh
      ? '我已阅读并同意<a href="terms.html" target="_blank">服务条款</a>和<a href="privacy.html" target="_blank">隐私政策</a>。'
      : 'I agree to the <a href="terms.html" target="_blank">Terms</a> and <a href="privacy.html" target="_blank">Privacy Policy</a>.';
  }

  form.addEventListener('submit', event => {
    if (typeof authMode !== 'undefined' && authMode === 'register' && !form.elements.consent.checked) {
      event.preventDefault();
      event.stopImmediatePropagation();
      const message = document.querySelector('[data-auth-message]');
      message.textContent = document.documentElement.lang === 'zh-CN' ? '请先同意服务条款和隐私政策。' : 'Please agree to the Terms and Privacy Policy.';
    }
  }, true);
  document.querySelectorAll('[data-auth-tab], [data-lang-toggle], [data-auth-open]').forEach(el => el.addEventListener('click', () => setTimeout(syncConsent)));
  const note = document.querySelector('.auth-note');
  if (note) note.textContent = 'Accounts are securely managed by Supabase.';
  syncConsent();
})();
