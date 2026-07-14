let adminLang=localStorage.getItem('asglobal-language')||'en';
let adminProfile=null;
let adminEvents=[];
let adminUsers=[];
let adminRequests=[];

const sb=window.supabaseClient;
const editorForm=document.querySelector('.event-editor');
const editorGrid=editorForm.querySelector('.editor-grid');
const MATERIAL_BUCKET='event-materials';
const MATERIAL_EXTENSIONS=['ppt','pptx','pdf','doc','docx','md','markdown'];
const MATERIAL_MAX_BYTES=25*1024*1024;

function installEditorFields(){
  if(editorForm.elements.channel)return;
  const channel=document.createElement('label');
  channel.innerHTML='<span>Registration channel</span><select name="channel"><option value="luma">Luma public event</option><option value="member">Website member event</option></select>';
  editorGrid.insertBefore(channel,editorGrid.firstChild);

  const resources=document.createElement('div');
  resources.className='editor-resource-fields';
  resources.innerHTML=[
    '<label class="wide"><span>English event summary</span><textarea name="summary"></textarea></label>',
    '<label class="wide"><span>中文活动总结</span><textarea name="summaryZh"></textarea></label>',
    '<fieldset class="wide material-fieldset">',
    '<legend>Optional meeting material</legend>',
    '<p>Upload a PPT, PDF, Word, or Markdown file to Supabase Storage. Do not put Zoom/meeting links here; use the registration/session URL field above for the session entrance.</p>',
    '<label><span>Upload material / 上传资料</span><input name="materialFile" type="file" accept=".ppt,.pptx,.pdf,.doc,.docx,.md,.markdown,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,text/markdown,text/plain"></label>',
    '<label><span>Material URL / 资料链接</span><input name="pptUrl" type="url" placeholder="Auto-filled after upload, or paste https://..."></label>',
    '<small data-material-status>Optional · max 25MB · bucket: event-materials</small>',
    '</fieldset>'
  ].join('');
  editorGrid.append(...resources.children);
}

installEditorFields();
editorForm.elements.url.required=false;

function isMeetingUrl(url){
  if(!url)return false;
  try{
    const host=new URL(url).hostname.toLowerCase();
    return ['zoom.us','webex.com','meet.google.com','teams.microsoft.com','whereby.com','gotomeeting.com','bluejeans.com'].some(domain=>host===domain||host.endsWith('.'+domain));
  }catch{
    return false;
  }
}

function mapEvent(row){
  const materialIsMeeting=isMeetingUrl(row.ppt_url);
  return {
    id:row.id,
    channel:row.channel,
    title:row.title,
    titleZh:row.title_zh,
    description:row.description,
    descriptionZh:row.description_zh,
    type:row.event_type,
    typeZh:row.event_type_zh,
    location:row.location,
    locationZh:row.location_zh,
    date:row.starts_at,
    url:row.registration_url||(materialIsMeeting?row.ppt_url:null),
    summary:row.summary,
    summaryZh:row.summary_zh,
    pptUrl:materialIsMeeting?null:row.ppt_url,
    published:row.published
  };
}

function getMaterialStatus(){
  return editorForm.querySelector('[data-material-status]');
}

function setEditorMessage(message,success=false){
  const target=document.querySelector('[data-editor-message]');
  target.textContent=message||'';
  target.classList.toggle('success',success);
}

function setMaterialStatus(message,success=false){
  const target=getMaterialStatus();
  if(!target)return;
  target.textContent=message||'Optional · max 25MB · bucket: event-materials';
  target.classList.toggle('success',success);
}

function safeFilePart(value){
  return String(value||'file')
    .normalize('NFKD')
    .replace(/[^\w.-]+/g,'-')
    .replace(/-+/g,'-')
    .replace(/^-|-$/g,'')
    .slice(0,90)||'file';
}

function fileExtension(file){
  return (file.name.split('.').pop()||'').toLowerCase();
}

function validateMaterialFile(file){
  if(!file)return;
  const ext=fileExtension(file);
  if(!MATERIAL_EXTENSIONS.includes(ext)){
    throw new Error('Unsupported material type. Please upload PPT, PDF, Word, or Markdown.');
  }
  if(file.size>MATERIAL_MAX_BYTES){
    throw new Error('File is too large. Please upload a file under 25MB.');
  }
}

async function uploadMaterialFile(eventId,file){
  if(!file)return null;
  validateMaterialFile(file);
  if(!sb?.storage)throw new Error('Supabase Storage client is unavailable.');
  const ext=fileExtension(file);
  const base=safeFilePart(file.name.replace(/\.[^.]+$/,''));
  const path=`events/${safeFilePart(eventId)}/${Date.now()}-${base}.${ext}`;
  setMaterialStatus('Uploading material to Supabase Storage…');
  const {error}=await sb.storage.from(MATERIAL_BUCKET).upload(path,file,{
    cacheControl:'3600',
    upsert:false,
    contentType:file.type||undefined
  });
  if(error)throw new Error(`Storage upload failed: ${error.message}`);
  const {data}=sb.storage.from(MATERIAL_BUCKET).getPublicUrl(path);
  if(!data?.publicUrl)throw new Error('Upload finished, but no public URL was returned.');
  setMaterialStatus('Uploaded to Supabase Storage ✓',true);
  return data.publicUrl;
}

async function loadAdminData(){
  try{
    if(!sb||!window.AISGData)throw new Error('Admin data service is unavailable');
    const authUser=await window.AISGData.currentUser();
    adminProfile=await window.AISGData.profile();
    const configuredAdmins=(window.AUTH_CONFIG?.adminEmails||[]).map(email=>email.toLowerCase());
    const isConfiguredAdmin=configuredAdmins.includes((authUser?.email||'').toLowerCase());
    if(!authUser||!adminProfile||(adminProfile.role!=='admin'&&!isConfiguredAdmin))throw new Error('Admin access required');

    const [events,users,requests]=await Promise.all([
      sb.from('events').select('*').order('starts_at',{ascending:false}),
      sb.from('profiles').select('*').order('created_at',{ascending:false}),
      sb.from('membership_requests').select('*').eq('status','pending').order('requested_at',{ascending:false})
    ]);
    if(events.error)throw events.error;
    if(users.error)throw users.error;
    if(requests.error)throw requests.error;
    adminEvents=events.data.map(mapEvent);
    adminUsers=users.data;
    adminRequests=requests.data;
    renderAdmin();
  }catch(error){
    console.error(error);
    sessionStorage.setItem('asglobal-admin-error',error.message||'Admin console unavailable');
    location.replace('dashboard.html');
  }
}

function renderAdmin(){
  const zh=adminLang==='zh-CN';
  document.documentElement.lang=adminLang;
  document.querySelector('[data-admin-lang]').textContent=zh?'EN':'中文';
  document.querySelector('[data-admin-event-count]').textContent=adminEvents.length+(zh?' 场活动':' events');
  document.querySelector('[data-admin-user-count]').textContent=adminUsers.length+(zh?' 位用户':' users');
  renderAdminEvents();
  renderAdminUsers();
}

function renderAdminEvents(){
  const zh=adminLang==='zh-CN';
  const root=document.querySelector('[data-admin-events]');
  root.textContent='';
  adminEvents.forEach(event=>{
    const row=document.createElement('article');
    row.className='admin-event-row';
    row.innerHTML='<div><div class="admin-event-labels"><small></small><b></b></div><h3></h3><p></p></div><span></span><div><button type="button" data-edit></button><button type="button" data-delete></button></div>';
    row.querySelector('small').textContent=new Intl.DateTimeFormat(zh?'zh-CN':'en-CA',{year:'numeric',month:'short',day:'2-digit'}).format(new Date(event.date));
    const badge=row.querySelector('.admin-event-labels b');
    badge.textContent=event.channel==='luma'?'LUMA':(zh?'本网站会员':'MEMBER WEBSITE');
    badge.className=event.channel;
    row.querySelector('h3').textContent=zh?(event.titleZh||event.title):event.title;
    row.querySelector('p').textContent=zh?(event.descriptionZh||event.description):event.description;
    row.querySelector(':scope>span').textContent=zh?(event.locationZh||event.location):event.location;
    row.querySelector('[data-edit]').textContent=zh?'编辑':'Edit';
    row.querySelector('[data-delete]').textContent=zh?'删除':'Delete';
    row.querySelector('[data-edit]').onclick=()=>openEditor(event);
    row.querySelector('[data-delete]').onclick=async()=>{
      if(confirm(zh?'确定删除这场活动吗？':'Delete this event?')){
        const {error}=await sb.from('events').delete().eq('id',event.id);
        if(error)alert(error.message);
        else loadAdminData();
      }
    };
    root.append(row);
  });
}

function renderAdminUsers(){
  const zh=adminLang==='zh-CN';
  const root=document.querySelector('[data-admin-users]');
  root.textContent='';
  adminUsers.forEach(user=>{
    const request=adminRequests.find(item=>item.user_id===user.id);
    const row=document.createElement('article');
    row.className='admin-user-row review-user-row';
    row.innerHTML='<span class="portal-avatar"></span><div class="admin-user-copy"><h3></h3><p></p><div class="attendance-control"><label></label><select data-attendance></select></div><div class="review-request" data-review-request hidden><b></b><span></span><div><button type="button" data-approve></button><button type="button" data-reject></button></div></div></div><select data-membership><option value="free"></option><option value="paid"></option></select>';
    row.querySelector('.portal-avatar').textContent=(user.full_name||user.email).charAt(0).toUpperCase();
    row.querySelector('h3').textContent=user.full_name||user.email.split('@')[0];
    row.querySelector('.admin-user-copy>p').textContent=user.email+(user.role==='admin'?(zh?' · 管理员':' · Admin'):'');

    const attendance=row.querySelector('[data-attendance]');
    for(let count=0;count<=10;count++){
      const option=document.createElement('option');
      option.value=count;
      option.textContent=count+(zh?' 场':' events');
      attendance.append(option);
    }
    attendance.value=user.attended_events;
    row.querySelector('.attendance-control label').textContent=zh?'已确认参加活动':'Verified event attendance';
    attendance.onchange=()=>updateProfile(user.id,{attended_events:Number(attendance.value)});

    const membership=row.querySelector('[data-membership]');
    membership.options[0].textContent=zh?'普通用户':'Free user';
    membership.options[1].textContent=zh?'付费会员':'Paid member';
    membership.value=user.membership_level;
    membership.onchange=()=>updateProfile(user.id,{membership_level:membership.value});

    if(request){
      const review=row.querySelector('[data-review-request]');
      review.hidden=false;
      review.querySelector('b').textContent=zh?'付费会员申请待审核':'Paid membership review';
      review.querySelector('span').textContent=new Intl.DateTimeFormat(zh?'zh-CN':'en-CA',{year:'numeric',month:'short',day:'2-digit'}).format(new Date(request.requested_at));
      const approve=review.querySelector('[data-approve]');
      const reject=review.querySelector('[data-reject]');
      approve.textContent=zh?'批准':'Approve';
      reject.textContent=zh?'拒绝':'Reject';
      approve.disabled=user.attended_events<1;
      approve.onclick=()=>resolveRequest(request,user,'approved');
      reject.onclick=()=>resolveRequest(request,user,'rejected');
    }
    root.append(row);
  });
}

async function updateProfile(id,values){
  const {error}=await sb.from('profiles').update({...values,updated_at:new Date().toISOString()}).eq('id',id);
  if(error)alert(error.message);
  else loadAdminData();
}

async function resolveRequest(request,user,status){
  if(status==='approved'&&user.attended_events<1)return;
  const update={status,reviewed_by:adminProfile.id,reviewed_at:new Date().toISOString()};
  const {error}=await sb.from('membership_requests').update(update).eq('id',request.id);
  if(error){
    alert(error.message);
    return;
  }
  if(status==='approved')await sb.from('profiles').update({membership_level:'paid',updated_at:new Date().toISOString()}).eq('id',user.id);
  loadAdminData();
}

function openEditor(event={channel:'luma'}){
  editorForm.reset();
  setEditorMessage('');
  setMaterialStatus();
  ['id','title','titleZh','location','locationZh','type','typeZh','description','descriptionZh','url','summary','summaryZh','pptUrl','channel'].forEach(key=>{
    if(editorForm.elements[key])editorForm.elements[key].value=event[key]||((key==='channel')?'luma':'');
  });
  editorForm.elements.date.value=event.date?event.date.slice(0,16):'';
  if(event.pptUrl)setMaterialStatus('Current material link is saved. Upload a new file to replace it.',true);
  document.querySelector('[data-event-editor]').hidden=false;
  document.body.classList.add('modal-open');
}

function closeEditor(){
  document.querySelector('[data-event-editor]').hidden=true;
  document.body.classList.remove('modal-open');
}

document.querySelectorAll('[data-editor-close]').forEach(item=>item.onclick=closeEditor);
document.querySelector('[data-new-event]').onclick=()=>openEditor();
editorForm.elements.materialFile.onchange=()=>{
  const file=editorForm.elements.materialFile.files?.[0];
  if(!file){
    setMaterialStatus();
    return;
  }
  try{
    validateMaterialFile(file);
    setMaterialStatus(`${file.name} ready to upload`,true);
  }catch(error){
    setMaterialStatus(error.message);
    editorForm.elements.materialFile.value='';
  }
};

editorForm.onsubmit=async event=>{
  event.preventDefault();
  setEditorMessage('');
  const submit=editorForm.querySelector('button[type="submit"]');
  submit.disabled=true;
  try{
    const form=Object.fromEntries(new FormData(editorForm));
    const id=form.id||'event-'+Date.now().toString(36);
    const uploadedUrl=await uploadMaterialFile(id,editorForm.elements.materialFile.files?.[0]);
    if(uploadedUrl)editorForm.elements.pptUrl.value=uploadedUrl;
    let sessionUrl=form.url||'';
    let materialUrl=editorForm.elements.pptUrl.value||form.pptUrl||'';
    if(isMeetingUrl(materialUrl)){
      if(!sessionUrl)sessionUrl=materialUrl;
      materialUrl='';
      editorForm.elements.url.value=sessionUrl;
      editorForm.elements.pptUrl.value='';
      setMaterialStatus('Zoom/meeting link moved to Registration / session URL. Material link cleared.',true);
    }
    const row={
      id,
      channel:form.channel,
      title:form.title,
      title_zh:form.titleZh||null,
      description:form.description||null,
      description_zh:form.descriptionZh||null,
      event_type:form.type||null,
      event_type_zh:form.typeZh||null,
      location:form.location||null,
      location_zh:form.locationZh||null,
      starts_at:new Date(form.date).toISOString(),
      registration_url:sessionUrl||null,
      summary:form.summary||null,
      summary_zh:form.summaryZh||null,
      ppt_url:materialUrl||null,
      published:true,
      updated_at:new Date().toISOString()
    };
    const {error}=await sb.from('events').upsert(row);
    if(error)throw error;
    closeEditor();
    loadAdminData();
  }catch(error){
    console.error(error);
    setEditorMessage(error.message||'Unable to save event.');
  }finally{
    submit.disabled=false;
  }
};

document.querySelectorAll('[data-admin-tab]').forEach(button=>button.onclick=()=>{
  document.querySelectorAll('[data-admin-tab]').forEach(item=>item.classList.toggle('active',item===button));
  document.querySelectorAll('[data-admin-panel]').forEach(panel=>panel.hidden=panel.dataset.adminPanel!==button.dataset.adminTab);
});

document.querySelector('[data-admin-lang]').onclick=()=>{
  adminLang=adminLang==='zh-CN'?'en':'zh-CN';
  localStorage.setItem('asglobal-language',adminLang);
  renderAdmin();
};

loadAdminData();
