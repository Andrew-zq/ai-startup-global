const reviewSession=(()=>{try{return JSON.parse(localStorage.getItem('asglobal-session'))}catch{return null}})();
const reviewUsers=()=>{try{return JSON.parse(localStorage.getItem('asglobal-users'))||[]}catch{return[]}};
const reviewRequests=()=>{try{return JSON.parse(localStorage.getItem('asglobal-membership-requests'))||[]}catch{return[]}};
function currentReviewUser(){return reviewUsers().find(user=>user.email===reviewSession?.email)}
function currentRequest(){return reviewRequests().find(request=>request.email===reviewSession?.email&&request.status==='pending')}
function reviewLanguage(){return document.documentElement.lang==='zh-CN'}

function renderUpgradeReview(){
  const button=document.querySelector('[data-upgrade]'),card=document.querySelector('[data-paid-card]'),user=currentReviewUser();
  if(!button||!user)return;
  let note=card.querySelector('[data-upgrade-rule]');
  if(!note){note=document.createElement('p');note.className='upgrade-rule';note.dataset.upgradeRule='';button.before(note)}
  const attended=Number(user.attendedEvents||0),paid=user.membership==='paid',pending=currentRequest(),zh=reviewLanguage();
  button.classList.remove('eligibility-locked');
  if(paid){note.textContent=zh?'你的付费会员资格已生效。':'Your paid membership is active.';button.disabled=true;return}
  if(attended<1){note.textContent=zh?'升级条件：需要由管理员确认至少参加过 1 场线上或线下活动。':'Eligibility: an admin must verify attendance at least one online or in-person event.';button.textContent=zh?'申请升级 →':'Request upgrade →';button.disabled=false;button.classList.add('eligibility-locked');button.onclick=showEligibilityNotice;return}
  if(pending){note.textContent=zh?'申请已提交，正在等待管理员审核。':'Application submitted and awaiting admin review.';button.textContent=zh?'审核中':'Under review';button.disabled=true;return}
  note.textContent=zh?'你已满足活动参与条件，可以提交付费会员申请。':'You meet the attendance requirement and can apply for paid membership.';button.textContent=zh?'提交升级申请 →':'Submit upgrade request →';button.disabled=false;button.onclick=submitMembershipRequest;
}

function showEligibilityNotice(){
  let modal=document.querySelector('[data-eligibility-modal]');
  if(!modal){modal=document.createElement('div');modal.className='eligibility-modal';modal.dataset.eligibilityModal='';modal.innerHTML='<div class="auth-backdrop" data-eligibility-close></div><section class="eligibility-dialog" role="dialog" aria-modal="true"><button class="auth-close" type="button" data-eligibility-close>×</button><span class="eligibility-icon">01</span><p data-eligibility-kicker>MEMBERSHIP REQUIREMENT</p><h2 data-eligibility-title></h2><p data-eligibility-copy></p><div><a class="btn dark" href="apply.html" data-eligibility-events></a><button class="btn ghost" type="button" data-eligibility-close data-eligibility-later></button></div></section>';document.body.append(modal);modal.querySelectorAll('[data-eligibility-close]').forEach(item=>item.addEventListener('click',closeEligibilityNotice))}
  const zh=reviewLanguage();
  modal.querySelector('[data-eligibility-kicker]').textContent=zh?'会员升级条件':'MEMBERSHIP REQUIREMENT';
  modal.querySelector('[data-eligibility-title]').textContent=zh?'需要先参加一次活动':'Join one event first';
  modal.querySelector('[data-eligibility-copy]').textContent=zh?'参加至少一次线上或线下活动，并由管理员确认后，才可以申请升级为付费会员。':'Attend at least one online or in-person event and have it verified by an admin before applying for paid membership.';
  modal.querySelector('[data-eligibility-events]').textContent=zh?'查看可参加的活动 →':'Explore events →';
  modal.querySelector('[data-eligibility-later]').textContent=zh?'稍后再说':'Maybe later';
  modal.classList.add('open');document.body.classList.add('modal-open');modal.querySelector('.eligibility-dialog').focus();
}
function closeEligibilityNotice(){document.querySelector('[data-eligibility-modal]')?.classList.remove('open');document.body.classList.remove('modal-open')}

async function submitMembershipRequest(){const user=currentReviewUser();if(!user||Number(user.attendedEvents||0)<1){showEligibilityNotice();return}const requests=reviewRequests(),request={id:'membership-'+Date.now().toString(36),userId:user.id,email:user.email,name:user.name||user.email.split('@')[0],attendedEvents:Number(user.attendedEvents),status:'pending',requestedAt:new Date().toISOString()};requests.push(request);localStorage.setItem('asglobal-membership-requests',JSON.stringify(requests));const endpoint=window.NOTIFICATION_CONFIG?.membershipReviewEndpoint;if(endpoint){try{await fetch(endpoint,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({...request,adminEmail:window.NOTIFICATION_CONFIG.adminEmail,siteUrl:location.origin+'/admin.html'})});request.notification='sent'}catch{request.notification='failed'}localStorage.setItem('asglobal-membership-requests',JSON.stringify(requests))}renderUpgradeReview()}
document.querySelector('[data-portal-lang]')?.addEventListener('click',()=>setTimeout(renderUpgradeReview,0));renderUpgradeReview();
