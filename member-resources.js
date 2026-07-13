const resourceCopy={
  en:{events:'Events',nav:'My events',kicker:'MY LEARNING',title:'Events, insights<br>and materials.',joined:'Joined events',summaries:'Event summaries',decks:'Materials',count:'JOINED',empty:'You have not joined any member events yet.',explore:'Explore member events →',upcoming:'UPCOMING',completed:'COMPLETED',summaryLabel:'EVENT SUMMARY',deckLabel:'MEETING MATERIAL',summaryPending:'The event summary will be published after the session.',deckPending:'Meeting materials will be available after the event.',openDeck:'Open material →',openEvent:'Open event →',noEventLink:'Event link not available yet.',registered:'Registered'},
  zh:{events:'活动',nav:'我的活动',kicker:'我的学习',title:'活动、总结<br>与学习资料。',joined:'已加入的活动',summaries:'活动总结',decks:'会议资料',count:'已加入',empty:'你还没有加入任何会员活动。',explore:'浏览会员活动 →',upcoming:'即将开始',completed:'已结束',summaryLabel:'活动总结',deckLabel:'会议资料',summaryPending:'活动结束后将在这里发布专业总结。',deckPending:'活动结束并整理完成后开放会议资料。',openDeck:'打开资料 →',openEvent:'查看活动 →',noEventLink:'活动链接暂未开放。',registered:'已报名'}
};

let joinedEvents=[];

function materialKindFromUrl(url){
  const clean=(url||'').split('?')[0].toLowerCase();
  if(/\.(ppt|pptx)$/.test(clean))return 'PPT';
  if(/\.pdf$/.test(clean))return 'PDF';
  if(/\.(doc|docx)$/.test(clean))return 'WORD';
  if(/\.(md|markdown)$/.test(clean))return 'MD';
  return 'FILE';
}

async function loadMemberResources(){
  try{
    const rows=await window.AISGData.myRegistrations();
    joinedEvents=rows.map(row=>({...row.event,registration:{registeredAt:row.registered_at},attended:row.attended}));
  }catch(error){
    console.warn('Supabase resources:',error.message);
    joinedEvents=[];
  }
  renderMemberResources();
}

function renderMemberResources(){
  const chinese=document.documentElement.lang==='zh-CN';
  const c=chinese?resourceCopy.zh:resourceCopy.en;
  document.querySelector('[data-events-nav]').textContent=c.events;
  document.querySelector('[data-my-events-nav]').textContent=c.nav;
  document.querySelector('[data-learning-kicker]').textContent=c.kicker;
  document.querySelector('[data-learning-title]').innerHTML=c.title;
  document.querySelector('[data-learning-count]').textContent=joinedEvents.length+' '+c.count;
  const buttons=document.querySelectorAll('[data-learning-tab]');
  buttons[0].textContent=c.joined;
  buttons[1].textContent=c.summaries;
  buttons[2].textContent=c.decks;
  renderLearningPanel('joined',joinedEvents,c,chinese);
  renderLearningPanel('summaries',joinedEvents,c,chinese);
  renderLearningPanel('decks',joinedEvents,c,chinese);
}

function renderLearningPanel(type,events,c,chinese){
  const root=document.querySelector(`[data-learning-panel="${type}"]`);
  root.textContent='';
  if(!events.length){
    const empty=document.createElement('div');
    empty.className='learning-empty';
    empty.innerHTML='<span>◆</span><p></p><a class="btn ghost compact" href="apply.html"></a>';
    empty.querySelector('p').textContent=c.empty;
    empty.querySelector('a').textContent=c.explore;
    root.append(empty);
    return;
  }
  events.forEach(event=>{
    const card=document.createElement('article');
    const title=chinese?(event.titleZh||event.title):event.title;
    const date=new Date(event.date);
    const finished=date<Date.now();
    const dateText=new Intl.DateTimeFormat(chinese?'zh-CN':'en-CA',{year:'numeric',month:'short',day:'2-digit'}).format(date);
    card.className='learning-resource-card';
    if(type==='joined'){
      card.innerHTML='<div class="resource-meta"><span></span><time></time></div><h3></h3><p></p><small></small>';
      card.querySelector('.resource-meta span').textContent=finished?c.completed:c.upcoming;
      card.querySelector('time').textContent=dateText;
      card.querySelector('h3').textContent=title;
      card.querySelector('p').textContent=chinese?(event.descriptionZh||event.description||''):(event.description||'');
      card.querySelector('small').textContent=c.registered+' · '+new Intl.DateTimeFormat(chinese?'zh-CN':'en-CA',{month:'short',day:'2-digit'}).format(new Date(event.registration.registeredAt));
      const link=document.createElement('a');
      link.className='btn dark compact learning-action';
      link.href=event.url||'apply.html#member-events';
      link.target=event.url&&event.url.startsWith('http')?'_blank':'_self';
      link.rel='noreferrer';
      link.textContent=c.openEvent;
      card.append(link);
    }
    if(type==='summaries'){
      card.innerHTML='<div class="resource-meta"><span></span><time></time></div><h3></h3><p></p>';
      card.querySelector('.resource-meta span').textContent=c.summaryLabel;
      card.querySelector('time').textContent=dateText;
      card.querySelector('h3').textContent=title;
      card.querySelector('p').textContent=(chinese?(event.summaryZh||event.summary):(event.summary||event.summaryZh))||c.summaryPending;
    }
    if(type==='decks'){
      card.innerHTML='<div class="deck-icon"></div><div><small></small><h3></h3><p></p></div>';
      card.querySelector('.deck-icon').textContent=materialKindFromUrl(event.pptUrl);
      card.querySelector('small').textContent=c.deckLabel;
      card.querySelector('h3').textContent=title;
      if(event.pptUrl){
        const link=document.createElement('a');
        link.className='btn dark compact';
        link.href=event.pptUrl;
        link.target='_blank';
        link.rel='noreferrer';
        link.textContent=c.openDeck;
        card.append(link);
      }else card.querySelector('p').textContent=c.deckPending;
    }
    root.append(card);
  });
}

document.querySelectorAll('[data-learning-tab]').forEach(button=>button.addEventListener('click',()=>{
  document.querySelectorAll('[data-learning-tab]').forEach(item=>item.classList.toggle('active',item===button));
  document.querySelectorAll('[data-learning-panel]').forEach(panel=>panel.hidden=panel.dataset.learningPanel!==button.dataset.learningTab);
}));
document.addEventListener('portal-language-change',renderMemberResources);
loadMemberResources();
