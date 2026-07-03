let portalLang=localStorage.getItem('asglobal-language')||'en';
const session=(()=>{try{return JSON.parse(localStorage.getItem('asglobal-session'))}catch{return null}})();
if(!session)location.replace('index.html');

const users=(()=>{try{return JSON.parse(localStorage.getItem('asglobal-users'))||[]}catch{return[]}})();
const user=users.find(item=>item.email===session?.email)||session||{};
const membership=user.membership||'free';
const isAdmin=(window.AUTH_CONFIG?.adminEmails||[]).map(x=>x.toLowerCase()).includes((session?.email||'').toLowerCase());

const portalCopy={
  en:{
    pageTitle:'Member Dashboard — AI Startup Global',home:'← Home',overview:'Overview',benefits:'Benefits',events:'Events',myEvents:'My events',accountNav:'Account',admin:'Open admin console →',
    kicker:'MEMBER HOME',title:'Good to see you, {name}.',copy:'Your account is ready. Explore community events and build your global founder network.',
    freeLabel:'FREE',paidLabel:'GLOBAL+',freeBadge:'FREE MEMBER',paidBadge:'GLOBAL+ MEMBER',freeTitle:'Community Member',paidTitle:'Paid Membership',
    free:['Public event access','AI daily brief','ShouldWeTV channel'],paid:['Priority event registration','Private founder sessions','Member-only resources','Partner introductions'],
    upgrade:'Request upgrade →',upgraded:'Global+ membership active',account:'Account',plan:'Current plan',freePlan:'Free',paidPlan:'Global+',logout:'Log out',requested:'Upgrade request received'
  },
  zh:{
    pageTitle:'会员中心 — AI Startup Global',home:'← 返回首页',overview:'概览',benefits:'会员权益',events:'活动',myEvents:'我的活动',accountNav:'账户',admin:'打开管理员后台 →',
    kicker:'会员中心',title:'欢迎回来，{name}。',copy:'你的账户已经就绪。探索社区活动，建立全球创始人网络。',
    freeLabel:'免费版',paidLabel:'GLOBAL+',freeBadge:'普通用户',paidBadge:'GLOBAL+ 付费会员',freeTitle:'普通社区用户',paidTitle:'付费会员',
    free:['公开活动报名','AI 每日简报','ShouldWeTV 频道'],paid:['活动优先报名','私享创始人活动','会员专属资源','合作伙伴引荐'],
    upgrade:'申请升级 →',upgraded:'GLOBAL+ 会员已生效',account:'账户信息',plan:'当前方案',freePlan:'普通用户',paidPlan:'GLOBAL+',logout:'退出登录',requested:'升级申请已收到'
  }
};

function currentPortalCopy(){return portalLang==='zh-CN'?portalCopy.zh:portalCopy.en}

function renderPortal(){
  const c=currentPortalCopy();
  const name=user.name||session.email.split('@')[0];
  document.documentElement.lang=portalLang;
  document.title=c.pageTitle;
  document.querySelector('[data-portal-lang]').textContent=portalLang==='zh-CN'?'EN':'中文';
  document.querySelector('.portal-nav .btn').textContent=c.home;
  document.querySelector('[data-nav-overview]').textContent=c.overview;
  document.querySelector('[data-nav-benefits]').textContent=c.benefits;
  document.querySelector('[data-events-nav]').textContent=c.events;
  document.querySelector('[data-my-events-nav]').textContent=c.myEvents;
  document.querySelector('[data-nav-account]').textContent=c.accountNav;
  document.querySelector('[data-admin-entry]').textContent=c.admin;
  document.querySelector('[data-portal-name]').textContent=name;
  document.querySelector('[data-portal-email]').textContent=session.email;
  document.querySelector('[data-portal-avatar]').textContent=name.charAt(0).toUpperCase();
  document.querySelector('[data-membership-badge]').textContent=membership==='paid'?c.paidBadge:c.freeBadge;
  document.querySelector('[data-membership-badge]').classList.toggle('paid',membership==='paid');
  document.querySelector('[data-welcome-kicker]').textContent=c.kicker;
  document.querySelector('[data-welcome-title]').textContent=c.title.replace('{name}',name.split(' ')[0]);
  document.querySelector('[data-welcome-copy]').textContent=c.copy;
  document.querySelector('[data-free-label]').textContent=c.freeLabel;
  document.querySelector('[data-paid-label]').textContent=c.paidLabel;
  document.querySelector('[data-free-title]').textContent=c.freeTitle;
  document.querySelector('[data-paid-title]').textContent=c.paidTitle;
  c.free.forEach((text,index)=>document.querySelector(`[data-free-${index+1}]`).textContent=text);
  c.paid.forEach((text,index)=>document.querySelector(`[data-paid-${index+1}]`).textContent=text);
  const upgrade=document.querySelector('[data-upgrade]');
  upgrade.textContent=membership==='paid'?c.upgraded:c.upgrade;
  upgrade.disabled=membership==='paid';
  document.querySelector('[data-paid-card]').classList.toggle('active',membership==='paid');
  document.querySelector('[data-account-heading]').textContent=c.account;
  document.querySelector('[data-account-plan]').textContent=c.plan;
  document.querySelector('[data-current-plan]').textContent=membership==='paid'?c.paidPlan:c.freePlan;
  document.querySelector('[data-portal-logout]').textContent=c.logout;
  document.querySelector('[data-admin-entry]').hidden=!isAdmin;
  document.dispatchEvent(new CustomEvent('portal-language-change',{detail:{language:portalLang}}));
}

document.querySelector('[data-portal-lang]').onclick=()=>{
  portalLang=portalLang==='zh-CN'?'en':'zh-CN';
  localStorage.setItem('asglobal-language',portalLang);
  renderPortal();
};
document.querySelector('[data-upgrade]').onclick=()=>{
  if(membership==='paid')return;
  localStorage.setItem('asglobal-upgrade-request',JSON.stringify({email:session.email,requestedAt:new Date().toISOString()}));
  document.querySelector('[data-upgrade]').textContent=currentPortalCopy().requested;
};
document.querySelector('[data-portal-logout]').onclick=()=>{
  localStorage.removeItem('asglobal-session');
  location.replace('index.html');
};
renderPortal();
