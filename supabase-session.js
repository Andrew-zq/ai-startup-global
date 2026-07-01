(function () {
  const client = window.supabaseClient;
  if (!client) return;
  const logout = document.querySelector('[data-portal-logout]');
  if (logout) {
    logout.onclick = async () => {
      await client.auth.signOut();
      localStorage.removeItem('asglobal-session');
      location.replace('index.html');
    };
  }
  client.auth.getUser().then(async ({ data }) => {
    if (!data.user) return;
    const { data: profile } = await client.from('profiles').select('*').eq('id', data.user.id).maybeSingle();
    if (!profile) return;
    const zh = document.documentElement.lang === 'zh-CN';
    const badge = document.querySelector('[data-membership-badge]');
    const plan = document.querySelector('[data-current-plan]');
    const paidCard = document.querySelector('[data-paid-card]');
    if (badge) {
      badge.textContent = profile.membership_level === 'paid' ? (zh ? 'GLOBAL+ 付费会员' : 'GLOBAL+ MEMBER') : (zh ? '普通用户' : 'FREE MEMBER');
      badge.classList.toggle('paid', profile.membership_level === 'paid');
    }
    if (plan) plan.textContent = profile.membership_level === 'paid' ? 'Global+' : (zh ? '普通用户' : 'Free');
    paidCard?.classList.toggle('active', profile.membership_level === 'paid');
    const cached = { id: profile.id, email: profile.email, name: profile.full_name, membership: profile.membership_level, attendedEvents: profile.attended_events, role: profile.role };
    localStorage.setItem('asglobal-session', JSON.stringify(cached));
  });
})();
