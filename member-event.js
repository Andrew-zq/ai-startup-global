let memberEventLang=localStorage.getItem('asglobal-language')||'en';
let currentEvent=null;
let currentProfile=null;
let currentRegistration=null;

const memberEventCopy={
  en:{
    pageTitle:'Member Event — AI Startup Global',
    back:'← Events',
    center:'Member center',
    kicker:'GLOBAL+ MEMBER EVENT',
    loading:'Loading member event.',
    loadingCopy:'Preparing the event experience…',
    memberAccess:'MEMBER ACCESS',
    guest:'SIGN IN REQUIRED',
    free:'GLOBAL+ REQUIRED',
    eligible:'READY TO REGISTER',
    registered:'REGISTERED',
    guestCopy:'Sign in with a Global+ account to register and unlock the session entrance.',
    freeCopy:'This event is visible to everyone, but registration is available to Global+ members.',
    eligibleCopy:'You are eligible to register for this member event.',
    registeredCopy:'You are registered. The session entrance and materials are available below.',
    signIn:'Sign in on homepage →',
    upgrade:'Join Global+ →',
    register:'Register for this event →',
    entrance:'Join session →',
    entranceMissing:'Session link not configured',
    cancel:'Cancel registration',
    cancelLocked:'Cancellation closed',
    cancelHint:'You can cancel before the event starts.',
    cancelLockedHint:'The event has already started, so registration can no longer be cancelled.',
    cancelConfirm:'Cancel your registration for this event?',
    cancelError:'Cancellation failed',
    details:'EVENT DETAILS',
    date:'Date',
    location:'Location',
    type:'Type',
    channel:'Channel',
    summaryLabel:'EVENT SUMMARY',
    summaryTitle:'Session insight',
    summaryPending:'Event summary will appear here after the session.',
    materialLabel:'MEETING MATERIAL',
    materialTitle:'Slides and resources',
    materialPending:'Materials will be available after the organizer uploads them.',
    openMaterial:'Open material →',
    error:'Unable to load this event.',
    registerError:'Registration failed'
  },
  zh:{
    pageTitle:'会员活动 — AI Startup Global',
    back:'← 返回活动',
    center:'会员中心',
    kicker:'GLOBAL+ 会员活动',
    loading:'正在载入会员活动。',
    loadingCopy:'正在准备活动详情…',
    memberAccess:'会员权限',
    guest:'需要登录',
    free:'需要 GLOBAL+',
    eligible:'可以报名',
    registered:'已报名',
    guestCopy:'请使用 Global+ 账户登录后报名并解锁参加入口。',
    freeCopy:'所有人都可以查看活动内容，但只有 Global+ 会员可以报名。',
    eligibleCopy:'你已满足报名资格，可以报名本场会员活动。',
    registeredCopy:'你已报名。本页会显示参加入口、活动总结和会议资料。',
    signIn:'前往首页登录 →',
    upgrade:'加入 Global+ →',
    register:'报名本场活动 →',
    entrance:'参加入口 →',
    entranceMissing:'会议链接未配置',
    cancel:'退出活动',
    cancelLocked:'已不可退出',
    cancelHint:'活动开始前可以自主退出。',
    cancelLockedHint:'活动已经开始，不能再取消报名。',
    cancelConfirm:'确定要退出这场活动吗？',
    cancelError:'退出失败',
    details:'活动信息',
    date:'时间',
    location:'地点',
    type:'类型',
    channel:'渠道',
    summaryLabel:'活动总结',
    summaryTitle:'课程重点',
    summaryPending:'活动结束后将在这里显示专业总结。',
    materialLabel:'会议资料',
    materialTitle:'课件与资料',
    materialPending:'组织者上传后会在这里开放会议资料。',
    openMaterial:'打开资料 →',
    error:'无法载入这个活动。',
    registerError:'报名失败'
  }
};

const q=new URLSearchParams(location.search);
const eventId=q.get('id');

function c(){
  return memberEventLang==='zh-CN'?memberEventCopy.zh:memberEventCopy.en;
}

function materialKindFromUrl(url){
  const clean=(url||'').split('?')[0].toLowerCase();
  if(/\.(ppt|pptx)$/.test(clean))return 'PPT';
  if(/\.pdf$/.test(clean))return 'PDF';
  if(/\.(doc|docx)$/.test(clean))return 'WORD';
  if(/\.(md|markdown)$/.test(clean))return 'MD';
  return 'FILE';
}

function isMeetingUrl(url){
  if(!url)return false;
  try{
    const host=new URL(url).hostname.toLowerCase();
    return [
      'zoom.us',
      'webex.com',
      'meet.google.com',
      'teams.microsoft.com',
      'whereby.com',
      'gotomeeting.com',
      'bluejeans.com'
    ].some(domain=>host===domain||host.endsWith('.'+domain));
  }catch{
    return false;
  }
}

function isMaterialFileUrl(url){
  const clean=(url||'').split('?')[0].split('#')[0].toLowerCase();
  return /\.(ppt|pptx|pdf|doc|docx|md|markdown)$/.test(clean);
}

function isSessionEntranceUrl(url){
  return !!url&&(isMeetingUrl(url)||!isMaterialFileUrl(url));
}

function materialUrl(){
  return isSessionEntranceUrl(currentEvent?.pptUrl)?null:currentEvent?.pptUrl;
}

function sessionUrl(){
  return currentEvent?.url||(isSessionEntranceUrl(currentEvent?.pptUrl)?currentEvent.pptUrl:null);
}

function canCancelRegistration(){
  return !!currentEvent?.date&&new Date(currentEvent.date)>new Date();
}

function formatEventRange(event){
  if(!event?.date)return '—';
  const chinese=memberEventLang==='zh-CN';
  const start=new Date(event.date);
  const end=event.endDate?new Date(event.endDate):null;
  const date=new Intl.DateTimeFormat(chinese?'zh-CN':'en-CA',{timeZone:'America/Vancouver',year:'numeric',month:'short',day:'2-digit'}).format(start);
  const time=new Intl.DateTimeFormat(chinese?'zh-CN':'en-US',{timeZone:'America/Vancouver',hour:'numeric',minute:'2-digit',hour12:true});
  return date+' · '+time.format(start)+(end?'–'+time.format(end):'');
}

function setText(selector,value,html=false){
  const node=document.querySelector(selector);
  if(!node)return;
  if(html)node.innerHTML=value;
  else node.textContent=value;
}

function renderAction(){
  const copy=c();
  const root=document.querySelector('[data-primary-action]');
  root.textContent='';
  const registered=!!currentRegistration;
  const paid=currentProfile?.membership_level==='paid';
  const joinUrl=sessionUrl();

  if(registered){
    const actionStack=document.createElement('div');
    actionStack.className='member-action-stack';
    if(joinUrl){
      const link=document.createElement('a');
      link.className='btn white';
      link.href=joinUrl;
      link.target=joinUrl.startsWith('http')?'_blank':'_self';
      link.rel='noreferrer';
      link.textContent=copy.entrance;
      actionStack.append(link);
    }else{
      const button=document.createElement('button');
      button.className='btn ghost';
      button.disabled=true;
      button.textContent=copy.entranceMissing;
      actionStack.append(button);
    }
    const cancel=document.createElement('button');
    cancel.className='btn ghost compact member-cancel';
    cancel.type='button';
    cancel.disabled=!canCancelRegistration();
    cancel.textContent=canCancelRegistration()?copy.cancel:copy.cancelLocked;
    cancel.onclick=async()=>{
      if(cancel.disabled||!confirm(copy.cancelConfirm))return;
      try{
        cancel.disabled=true;
        await window.AISGData.unregister(currentEvent.id);
        currentRegistration=null;
        render();
      }catch(error){
        cancel.disabled=false;
        alert(copy.cancelError+': '+error.message);
      }
    };
    const hint=document.createElement('small');
    hint.className='member-cancel-hint';
    hint.textContent=canCancelRegistration()?copy.cancelHint:copy.cancelLockedHint;
    actionStack.append(cancel,hint);
    root.append(actionStack);
    setText('[data-pass-status]',copy.registered);
    setText('[data-pass-copy]',copy.registeredCopy);
    return;
  }

  if(!currentProfile){
    const link=document.createElement('a');
    link.className='btn white';
    link.href='index.html';
    link.textContent=copy.signIn;
    root.append(link);
    setText('[data-pass-status]',copy.guest);
    setText('[data-pass-copy]',copy.guestCopy);
    return;
  }

  if(!paid){
    const link=document.createElement('a');
    link.className='btn white';
    link.href='join.html';
    link.textContent=copy.upgrade;
    root.append(link);
    setText('[data-pass-status]',copy.free);
    setText('[data-pass-copy]',copy.freeCopy);
    return;
  }

  const button=document.createElement('button');
  button.className='btn white';
  button.type='button';
  button.textContent=copy.register;
  button.onclick=async()=>{
    try{
      button.disabled=true;
      await window.AISGData.register(currentEvent.id);
      currentRegistration=await window.AISGData.registrationFor(currentEvent.id);
      render();
    }catch(error){
      button.disabled=false;
      alert(copy.registerError+': '+error.message);
    }
  };
  root.append(button);
  setText('[data-pass-status]',copy.eligible);
  setText('[data-pass-copy]',copy.eligibleCopy);
}

function renderMaterial(){
  const copy=c();
  const url=materialUrl();
  setText('[data-material-label]',copy.materialLabel);
  setText('[data-material-title]',copy.materialTitle);
  setText('[data-material-kind]',materialKindFromUrl(url));
  const root=document.querySelector('[data-material-action]');
  root.textContent='';
  if(url){
    setText('[data-material-copy]',currentRegistration?copy.registeredCopy:copy.materialPending);
    const link=document.createElement('a');
    link.className='btn dark compact';
    link.href=url;
    link.target='_blank';
    link.rel='noreferrer';
    link.textContent=copy.openMaterial;
    root.append(link);
  }else{
    setText('[data-material-copy]',copy.materialPending);
  }
}

function render(){
  const copy=c();
  const chinese=memberEventLang==='zh-CN';
  document.documentElement.lang=memberEventLang;
  document.title=copy.pageTitle;
  setText('[data-member-event-lang]',chinese?'EN':'中文');
  setText('[data-back-events]',copy.back);
  setText('[data-member-center]',copy.center);
  setText('[data-kicker]',copy.kicker);
  setText('[data-pass-label]',copy.memberAccess);
  setText('[data-detail-label]',copy.details);
  setText('[data-date-label]',copy.date);
  setText('[data-location-label]',copy.location);
  setText('[data-type-label]',copy.type);
  setText('[data-channel-label]',copy.channel);
  setText('[data-summary-label]',copy.summaryLabel);
  setText('[data-summary-title]',copy.summaryTitle);

  if(!currentEvent){
    setText('[data-title]',copy.error);
    setText('[data-description]','');
    return;
  }

  setText('[data-title]',chinese?(currentEvent.titleZh||currentEvent.title):currentEvent.title);
  setText('[data-description]',chinese?(currentEvent.descriptionZh||currentEvent.description||''):(currentEvent.description||''));
  setText('[data-date]',formatEventRange(currentEvent));
  setText('[data-location]',chinese?(currentEvent.locationZh||currentEvent.location||'Online'):(currentEvent.location||'Online'));
  setText('[data-type]',chinese?(currentEvent.typeZh||currentEvent.type||'Member event'):(currentEvent.type||'Member event'));
  setText('[data-summary]',(chinese?(currentEvent.summaryZh||currentEvent.summary):(currentEvent.summary||currentEvent.summaryZh))||copy.summaryPending);
  renderAction();
  renderMaterial();
}

async function loadMemberEvent(){
  try{
    if(!eventId)throw new Error('Missing event id');
    const [event,profile]=await Promise.all([
      window.AISGData.event(eventId),
      window.AISGData.profile().catch(()=>null)
    ]);
    currentEvent=event;
    currentProfile=profile;
    currentRegistration=await window.AISGData.registrationFor(eventId).catch(()=>null);
  }catch(error){
    console.warn('Member event:',error.message);
    currentEvent=null;
  }
  render();
}

document.querySelector('[data-member-event-lang]').onclick=()=>{
  memberEventLang=memberEventLang==='zh-CN'?'en':'zh-CN';
  localStorage.setItem('asglobal-language',memberEventLang);
  render();
};

render();
loadMemberEvent();
