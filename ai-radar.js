const radarCopy={
  en:{home:'← Home',eyebrow:'DAILY AI INTELLIGENCE',title:'What matters<br><em>today.</em>',intro:'A living dashboard for open-source AI signals. Updated every day from GitHub Trending and the GitHub API.',consoleTitle:'AI RADAR / DAILY SIGNAL',live:'LIVE DATA',channels:'CHANNELS',github:'GitHub Top 10',news:'AI News',papers:'Papers',tools:'Tools',soon:'SOON',refresh:'DAILY REFRESH',projects:'AI PROJECTS',ticker:'TODAY’S OPEN-SOURCE SIGNALS',rankingTitle:'Today’s AI<br>Top 10.',rankingCopy:'The first five receive the full signal treatment. The next five stay compact for fast scanning.',moreSignals:'Five more signals',moreCopy:'Smaller cards, same direct path to the source.',nextTitle:'One radar.<br>More signals next.',newsDesc:'Product releases, funding and company moves.',papersDesc:'Research worth understanding, without the noise.',toolsDesc:'Useful AI products with clear founder applications.',methodLabel:'HOW IT UPDATES',method:'Every day, an automated GitHub Action reads GitHub Daily Trending, filters for AI-related repositories, enriches each result with public GitHub API data, and publishes the new Top 10.',sourceLink:'View GitHub Trending ↗',footer:'Signals for people building what comes next.',rank:'DAILY RANK',today:'TODAY',totalStars:'TOTAL STARS',forks:'FORKS',details:'Project profile →',githubButton:'Open GitHub ↗',language:'LANGUAGE',updated:'UPDATED',noDescription:'No GitHub description is available yet.',loadError:'Daily GitHub data is temporarily unavailable.'},
  zh:{home:'← 返回首页',eyebrow:'每日 AI 情报',title:'今天，什么<br><em>值得关注。</em>',intro:'持续更新的开源 AI 信号看板。每天从 GitHub Trending 与 GitHub API 自动获取数据。',consoleTitle:'AI 雷达 / 每日信号',live:'实时数据',channels:'信息频道',github:'GitHub Top 10',news:'AI 新闻',papers:'研究论文',tools:'AI 工具',soon:'即将上线',refresh:'每日更新',projects:'个 AI 项目',ticker:'今日开源 AI 信号',rankingTitle:'今日 AI<br>Top 10。',rankingCopy:'前五名使用大卡片重点展示，后五名使用紧凑列表快速浏览。',moreSignals:'另外五个热门项目',moreCopy:'展示更紧凑，但仍可直达项目介绍与 GitHub。',nextTitle:'一个雷达，<br>更多信号正在加入。',newsDesc:'产品发布、融资和 AI 公司动态。',papersDesc:'值得理解的研究成果，过滤无效噪音。',toolsDesc:'对创始人真正有用的 AI 产品。',methodLabel:'更新方式',method:'每天，GitHub Actions 会读取 GitHub Daily Trending，筛选 AI 相关仓库，再通过公开 GitHub API 补充资料，并发布新的 Top 10。',sourceLink:'查看 GitHub Trending ↗',footer:'为正在创造未来的人提供有效信号。',rank:'今日排名',today:'今日新增',totalStars:'总 Stars',forks:'Forks',details:'项目介绍 →',githubButton:'前往 GitHub ↗',language:'开发语言',updated:'更新时间',noDescription:'GitHub 暂未提供项目简介。',loadError:'每日 GitHub 数据暂时无法获取。'}
};
let radarLanguage=localStorage.getItem('asglobal-language')==='zh-CN'?'zh':'en';
let radarData=null,featureIndex=0,featureTimer=null;
const escapeHtml=value=>String(value??'').replace(/[&<>'"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
const formatCount=value=>new Intl.NumberFormat(radarLanguage==='zh'?'zh-CN':'en-US',{notation:Number(value)>=10000?'compact':'standard',maximumFractionDigits:1}).format(Number(value)||0);
const detailUrl=repo=>`github-project.html?repo=${encodeURIComponent(repo)}`;

function applyRadarCopy(){
  const c=radarCopy[radarLanguage];
  document.documentElement.lang=radarLanguage==='zh'?'zh-CN':'en';
  document.title=radarLanguage==='zh'?'AI 雷达 — AI Startup Global':'AI Radar — AI Startup Global';
  document.querySelector('[data-radar-lang]').textContent=radarLanguage==='zh'?'EN':'中文';
  document.querySelectorAll('[data-copy]').forEach(node=>{const value=c[node.dataset.copy];if(value===undefined)return;if(value.includes('<'))node.innerHTML=value;else node.textContent=value});
}
function renderFeature(){
  if(!radarData?.projects?.length)return;
  const c=radarCopy[radarLanguage],project=radarData.projects[featureIndex],root=document.querySelector('[data-radar-feature]');
  root.classList.remove('is-changing');void root.offsetWidth;root.classList.add('is-changing');
  root.innerHTML=`<div class="feature-head"><span>${escapeHtml(c.rank)} / ${String(project.rank).padStart(2,'0')}</span><div class="feature-nav"><button type="button" data-feature-prev aria-label="Previous">←</button><button type="button" data-feature-next aria-label="Next">→</button></div></div><div class="feature-rank">${escapeHtml(project.owner)} / ${escapeHtml(project.language||'Open source')}</div><h2>${escapeHtml(project.name)}</h2><p>${escapeHtml(project.description||c.noDescription)}</p><div class="feature-stats"><div><span>${escapeHtml(c.today)}</span><b class="hot">+${formatCount(project.starsToday)} ★</b></div><div><span>${escapeHtml(c.totalStars)}</span><b>${formatCount(project.stars)}</b></div><div><span>${escapeHtml(c.forks)}</span><b>${formatCount(project.forks)}</b></div></div><div class="feature-actions"><a class="btn white" href="${detailUrl(project.repo)}">${escapeHtml(c.details)}</a><a class="btn ghost" href="${escapeHtml(project.githubUrl)}" target="_blank" rel="noreferrer">${escapeHtml(c.githubButton)}</a></div><div class="feature-progress"><i class="running"></i></div>`;
  root.querySelector('[data-feature-prev]').onclick=()=>changeFeature(-1);
  root.querySelector('[data-feature-next]').onclick=()=>changeFeature(1);
  restartFeatureTimer();
}
function changeFeature(direction){featureIndex=(featureIndex+direction+radarData.projects.length)%radarData.projects.length;renderFeature()}
function restartFeatureTimer(){clearInterval(featureTimer);if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;featureTimer=setInterval(()=>changeFeature(1),6000)}
function renderTicker(){
  const projects=radarData.projects,items=[...projects,...projects].map(project=>`<span><b>#${String(project.rank).padStart(2,'0')}</b>${escapeHtml(project.repo)} · +${formatCount(project.starsToday)} ★</span>`).join('');
  document.querySelector('[data-radar-ticker-track]').className='radar-ticker-track';document.querySelector('[data-radar-ticker-track]').innerHTML=items;
}
function rankCard(project){
  const c=radarCopy[radarLanguage];
  return `<article class="rank-card"><div class="rank-card-top"><span>#${String(project.rank).padStart(2,'0')} / ${escapeHtml(project.source.toUpperCase())}</span><div><span>+${formatCount(project.starsToday)} ★ ${escapeHtml(c.today)}</span><span>${escapeHtml(project.language||'—')}</span></div></div><div class="rank-card-number">${String(project.rank).padStart(2,'0')}</div><h3>${escapeHtml(project.repo)}</h3><p>${escapeHtml(project.description||c.noDescription)}</p><div class="rank-card-footer"><span>★ ${formatCount(project.stars)} · ⑂ ${formatCount(project.forks)}</span><div><a class="mini-link" href="${detailUrl(project.repo)}">${escapeHtml(c.details)}</a><a class="mini-link github" href="${escapeHtml(project.githubUrl)}" target="_blank" rel="noreferrer">GitHub ↗</a></div></div></article>`;
}
function compactCard(project){
  const c=radarCopy[radarLanguage];
  return `<article class="compact-rank"><span>${String(project.rank).padStart(2,'0')}</span><div><h3>${escapeHtml(project.repo)}</h3><p>${escapeHtml((project.description||c.noDescription).slice(0,120))}</p></div><div>${escapeHtml(project.language||'Open source')}</div><strong>+${formatCount(project.starsToday)} ★</strong><div><a class="mini-link" href="${detailUrl(project.repo)}">${escapeHtml(c.details)}</a><a class="mini-link github" href="${escapeHtml(project.githubUrl)}" target="_blank" rel="noreferrer">GitHub ↗</a></div></article>`;
}
function renderRanking(){document.querySelector('[data-top-five]').innerHTML=radarData.projects.slice(0,5).map(rankCard).join('');document.querySelector('[data-next-five]').innerHTML=radarData.projects.slice(5,10).map(compactCard).join('')}
function renderRadarData(){
  const date=new Date(radarData.generatedAt),locale=radarLanguage==='zh'?'zh-CN':'en-CA';
  document.querySelector('[data-radar-date]').textContent=new Intl.DateTimeFormat(locale,{year:'numeric',month:'short',day:'2-digit',timeZone:'Asia/Shanghai'}).format(date);
  document.querySelector('[data-radar-source]').textContent=`GITHUB TRENDING · ${radarData.projects.length} PROJECTS`;
  renderFeature();renderTicker();renderRanking();
}
async function loadRadar(){
  try{const response=await fetch(`data/github-trending.json?v=${Date.now()}`,{cache:'no-store'});if(!response.ok)throw new Error(`HTTP ${response.status}`);radarData=await response.json();renderRadarData()}catch(error){console.error(error);document.querySelector('[data-radar-feature]').innerHTML=`<div class="project-error"><p>${escapeHtml(radarCopy[radarLanguage].loadError)}</p></div>`}
}
document.querySelector('[data-radar-lang]').onclick=()=>{radarLanguage=radarLanguage==='zh'?'en':'zh';localStorage.setItem('asglobal-language',radarLanguage==='zh'?'zh-CN':'en');applyRadarCopy();if(radarData)renderRadarData()};
document.querySelector('[data-radar-console]').addEventListener('mouseenter',()=>clearInterval(featureTimer));document.querySelector('[data-radar-console]').addEventListener('mouseleave',restartFeatureTimer);
document.addEventListener('visibilitychange',()=>document.hidden?clearInterval(featureTimer):restartFeatureTimer());
document.querySelector('[data-radar-year]').textContent=new Date().getFullYear();applyRadarCopy();loadRadar();
