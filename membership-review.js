let membershipProfile=null;
const isZh=()=>document.documentElement.lang==='zh-CN';

async function loadMembershipState(){
  try{
    membershipProfile=await window.AISGData.profile();
  }catch(error){
    console.warn('Membership:',error.message);
  }
  renderMembershipState();
}

function renderMembershipState(){
  const button=document.querySelector('[data-upgrade]');
  const card=document.querySelector('[data-paid-card]');
  if(!button||!membershipProfile)return;

  let note=card.querySelector('[data-upgrade-rule]');
  if(!note){
    note=document.createElement('p');
    note.className='upgrade-rule';
    note.dataset.upgradeRule='';
    button.before(note);
  }

  const zh=isZh();
  const paid=membershipProfile.membership_level==='paid';

  if(paid){
    note.textContent=zh?'你的 Global+ 会员权益已生效。':'Your Global+ membership is active.';
    button.textContent=zh?'管理订阅 →':'Manage subscription →';
    button.disabled=false;
    button.onclick=()=>location.href='join.html';
    return;
  }

  note.textContent=zh
    ?'登录后即可开通 30 天免费试用，之后每月 CA$29.99。'
    :'Start a 30-day free trial after sign-in, then CA$29.99 monthly.';
  button.textContent=zh?'开通会员试用 →':'Start membership trial →';
  button.disabled=false;
  button.onclick=()=>location.href='join.html';
}

document.querySelector('[data-portal-lang]')?.addEventListener('click',()=>setTimeout(renderMembershipState));
loadMembershipState();
