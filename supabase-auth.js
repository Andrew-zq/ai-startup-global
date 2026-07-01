(function () {
  const client = window.supabaseClient;
  const form = document.querySelector('[data-auth-form]');
  if (!client || !form) return;

  const message = document.querySelector('[data-auth-message]');
  const isChinese = () => document.documentElement.lang === 'zh-CN';

  async function cacheUser(user) {
    if (!user) return;
    const { data: profile } = await client.from('profiles').select('*').eq('id', user.id).maybeSingle();
    const localUser = {
      id: user.id,
      email: user.email,
      name: profile?.full_name || user.user_metadata?.full_name || user.email?.split('@')[0],
      membership: profile?.membership_level || 'free',
      attendedEvents: profile?.attended_events || 0,
      role: profile?.role || 'user',
      provider: user.app_metadata?.provider || 'email'
    };
    localStorage.setItem('asglobal-session', JSON.stringify(localUser));
    const users = JSON.parse(localStorage.getItem('asglobal-users') || '[]');
    const index = users.findIndex(item => item.id === user.id || item.email === user.email);
    if (index >= 0) users[index] = { ...users[index], ...localUser };
    else users.push(localUser);
    localStorage.setItem('asglobal-users', JSON.stringify(users));
    return localUser;
  }

  form.addEventListener('submit', async event => {
    event.preventDefault();
    event.stopImmediatePropagation();
    const register = typeof authMode !== 'undefined' && authMode === 'register';
    const email = form.email.value.trim().toLowerCase();
    const password = form.password.value;
    const name = form.name?.value?.trim() || '';
    message.className = 'auth-message';
    message.textContent = isChinese() ? '正在连接安全账户服务…' : 'Connecting securely…';

    try {
      let result;
      if (register) {
        result = await client.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: name },
            emailRedirectTo: `${location.origin}${location.pathname}`
          }
        });
      } else {
        result = await client.auth.signInWithPassword({ email, password });
      }
      if (result.error) throw result.error;
      if (result.data.session?.user) await cacheUser(result.data.session.user);
      message.classList.add('success');
      message.textContent = register
        ? (isChinese() ? '注册成功，请检查邮箱完成验证。' : 'Account created. Check your email to confirm it.')
        : (isChinese() ? '登录成功。' : 'Signed in successfully.');
      if (result.data.session) setTimeout(() => location.href = 'dashboard.html', 500);
    } catch (error) {
      message.textContent = error.message || (isChinese() ? '登录失败，请重试。' : 'Authentication failed.');
    }
  }, true);

  client.auth.getSession().then(async ({ data }) => {
    if (data.session?.user) await cacheUser(data.session.user);
  });

  client.auth.onAuthStateChange(async (event, session) => {
    if (session?.user) await cacheUser(session.user);
    if (event === 'SIGNED_OUT') {
      localStorage.removeItem('asglobal-session');
    }
  });

  window.handleGoogleCredential = async response => {
    try {
      const { data, error } = await client.auth.signInWithIdToken({
        provider: 'google',
        token: response.credential,
        nonce: window.googleAuthNonce
      });
      if (error) throw error;
      if (data.user) await cacheUser(data.user);
      message.className = 'auth-message success';
      message.textContent = isChinese() ? 'Google 登录成功。' : 'Signed in with Google.';
      setTimeout(() => location.href = 'dashboard.html', 400);
    } catch (error) {
      message.className = 'auth-message';
      message.textContent = error.message || (isChinese() ? 'Google 登录失败。' : 'Google sign-in failed.');
    }
  };
})();
