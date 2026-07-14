const joinCopy={
  en:{
    kicker:'GLOBAL+ MEMBERSHIP',
    title:'Start Global+<br><em>in one click.</em>',
    intro:'Join Vancouver’s AI builder community with a 30-day free trial.',
    trial:'FIRST 30 DAYS FREE',
    perMonth:'per month after trial · cancel anytime',
    events:'All events included',
    eventsCopy:'Member admission is free, including events normally priced at CA$29.99.',
    library:'Learning library',
    libraryCopy:'Member decks, exercises and edited event replays.',
    people:'Members and WeChat',
    peopleCopy:'Access the opt-in member directory and the verified member WeChat group.',
    ruleTitle:'MEMBERSHIP FLOW',
    rule:'Log in, start checkout, and activate your trial.',
    ruleCopy:'No attendance requirement. After Stripe Checkout, your Global+ trial starts immediately and renews at CA$29.99/month after 30 days.',
    browse:'Explore events →'
  },
  zh:{
    kicker:'GLOBAL+ 付费会员',
    title:'一键开通<br><em>Global+。</em>',
    intro:'加入温哥华 AI 创业者与学习者社区，首月免费试用。',
    trial:'前 30 天免费',
    perMonth:'试用后每月 CA$29.99 · 可随时取消',
    events:'全部活动免费参加',
    eventsCopy:'会员免费参加全部活动，包括单场票价 CA$29.99 的收费活动。',
    library:'会员学习资料库',
    libraryCopy:'解锁会员 PPT、练习题和活动回放。',
    people:'会员目录与微信群',
    peopleCopy:'进入自愿展示的会员目录及经过身份验证的会员微信群。',
    ruleTitle:'会员开通流程',
    rule:'登录后即可进入 Stripe Checkout。',
    ruleCopy:'不再需要先参加活动。Stripe Checkout 完成后，立即开始 30 天免费试用，之后每月 CA$29.99。',
    browse:'查看会员活动 →'
  }
};

let joinLang=localStorage.getItem('asglobal-language')==='zh-CN'?'zh':'en';

function renderJoin(){
  document.documentElement.lang=joinLang==='zh'?'zh-CN':'en';
  document.querySelector('[data-join-lang]').textContent=joinLang==='zh'?'EN':'中文';
  document.querySelectorAll('[data-copy]').forEach(el=>{
    const value=joinCopy[joinLang][el.dataset.copy];
    if(value)el.innerHTML=value;
  });
}

document.querySelector('[data-join-lang]').onclick=()=>{
  joinLang=joinLang==='zh'?'en':'zh';
  localStorage.setItem('asglobal-language',joinLang==='zh'?'zh-CN':'en');
  renderJoin();
};

document.querySelector('[data-start-trial]').onclick=async()=>{
  const button=document.querySelector('[data-start-trial]');
  try{
    const {data}=await window.supabaseClient.auth.getUser();
    if(!data.user){
      location.href='index.html#login';
      return;
    }

    const {data:profile,error}=await window.supabaseClient
      .from('profiles')
      .select('membership_level,trial_used')
      .eq('id',data.user.id)
      .single();
    if(error)throw error;

    if(profile.membership_level==='paid'){
      location.href='dashboard.html';
      return;
    }
    if(profile.trial_used){
      alert(joinLang==='zh'?'此账户已使用过免费试用。':'This account has already used its free trial.');
      return;
    }

    const endpoint=window.SUBSCRIPTION_CONFIG.checkoutEndpoint;
    if(!endpoint){
      alert(joinLang==='zh'?'Stripe 安全支付正在配置中，请稍后再试。':'Stripe checkout is being configured. Please try again later.');
      return;
    }

    button.disabled=true;
    const session=(await window.supabaseClient.auth.getSession()).data.session;
    const response=await fetch(endpoint,{
      method:'POST',
      headers:{Authorization:`Bearer ${session.access_token}`}
    });
    const payload=await response.json();
    if(!response.ok||!payload.url)throw new Error(payload.error||'Checkout unavailable');
    location.href=payload.url;
  }catch(error){
    button.disabled=false;
    alert(error.message);
  }
};

renderJoin();
