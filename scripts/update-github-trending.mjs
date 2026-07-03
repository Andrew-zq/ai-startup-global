import fs from 'node:fs/promises';
import path from 'node:path';

const root=path.resolve(import.meta.dirname,'..');
const outputPath=path.join(root,'data','github-trending.json');
const token=process.env.GITHUB_TOKEN||process.env.GH_TOKEN||'';
const headers={Accept:'application/vnd.github+json','User-Agent':'ai-startup-global-radar','X-GitHub-Api-Version':'2022-11-28'};
if(token)headers.Authorization=`Bearer ${token}`;

const aiKeywords=[' ai ','artificial intelligence','machine learning','deep learning','llm','large language model','agent','agentic','claude','gpt','gemini','codex','mcp','rag','inference','transformer','diffusion','computer vision','multimodal','generative','prompt','copilot','voice','speech','embedding','vibe coding'];

function decodeHtml(value=''){
  return value.replace(/<[^>]+>/g,' ').replace(/&#(\d+);/g,(_,n)=>String.fromCodePoint(Number(n))).replace(/&#x([\da-f]+);/gi,(_,n)=>String.fromCodePoint(parseInt(n,16))).replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;|&apos;/g,"'").replace(/\s+/g,' ').trim();
}
function numberFrom(value=''){return Number(value.replace(/[^\d]/g,''))||0}
function isAiProject(repo){
  const haystack=` ${repo.full_name||''} ${repo.description||''} ${(repo.topics||[]).join(' ')} `.toLowerCase().replace(/[-_/]/g,' ');
  return aiKeywords.some(keyword=>haystack.includes(keyword));
}
async function github(url){
  const response=await fetch(url,{headers});
  if(!response.ok)throw new Error(`GitHub ${response.status}: ${url}`);
  return response.json();
}
async function fetchTrending(){
  const response=await fetch('https://github.com/trending?since=daily',{headers:{'User-Agent':headers['User-Agent'],'Accept':'text/html'}});
  if(!response.ok)throw new Error(`Trending page ${response.status}`);
  const html=await response.text();
  const articles=[...html.matchAll(/<article class="Box-row">([\s\S]*?)<\/article>/g)].map(match=>match[1]);
  return articles.map((article,index)=>{
    const repoPath=article.match(/<h2[^>]*>[\s\S]*?href="\/([^"?#]+\/[^"?#]+)"/)?.[1];
    if(!repoPath)return null;
    const description=decodeHtml(article.match(/<p class="col-9[^>]*>([\s\S]*?)<\/p>/)?.[1]||'');
    const language=decodeHtml(article.match(/itemprop="programmingLanguage">([^<]+)</)?.[1]||'');
    const starsText=article.match(new RegExp(`href="\\/${repoPath.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}\\/stargazers"[\\s\\S]*?<\\/svg>\\s*([\\d,]+)`))?.[1]||'';
    const forksText=article.match(new RegExp(`href="\\/${repoPath.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}\\/forks"[\\s\\S]*?<\\/svg>\\s*([\\d,]+)`))?.[1]||'';
    const daily=article.match(/([\d,]+)\s+stars today/i)?.[1]||'';
    return{full_name:repoPath,description,language,stargazers_count:numberFrom(starsText),forks_count:numberFrom(forksText),starsToday:numberFrom(daily),trendingRank:index+1};
  }).filter(Boolean);
}
async function enrich(candidate){
  try{
    const repo=await github(`https://api.github.com/repos/${candidate.full_name}`);
    return{...candidate,...repo,starsToday:candidate.starsToday||0,trendingRank:candidate.trendingRank||999};
  }catch(error){
    console.warn(error.message);
    return candidate;
  }
}
async function fallbackSearch(existing){
  const since=new Date(Date.now()-14*86400000).toISOString().slice(0,10);
  const topics=['artificial-intelligence','llm','ai-agents','generative-ai'];
  const found=[];
  for(const topic of topics){
    try{
      const result=await github(`https://api.github.com/search/repositories?q=topic:${topic}+pushed:%3E=${since}&sort=stars&order=desc&per_page=20`);
      found.push(...(result.items||[]));
    }catch(error){console.warn(error.message)}
  }
  const seen=new Set(existing.map(item=>item.full_name.toLowerCase()));
  return found.filter(item=>{const key=item.full_name.toLowerCase();if(seen.has(key))return false;seen.add(key);return true}).sort((a,b)=>b.stargazers_count-a.stargazers_count);
}
function stripMarkdown(text=''){
  return text.replace(/```[\s\S]*?```/g,' ').replace(/<[^>]+>/g,' ').replace(/!\[[^\]]*\]\([^)]*\)/g,' ').replace(/\[([^\]]+)\]\([^)]*\)/g,'$1').replace(/^#{1,6}\s+/gm,'').replace(/[*_`>|~-]/g,' ').replace(/\s+/g,' ').trim().slice(0,900);
}
async function readmeExcerpt(fullName){
  try{
    const readme=await github(`https://api.github.com/repos/${fullName}/readme`);
    if(!readme.content)return'';
    return stripMarkdown(Buffer.from(readme.content.replace(/\n/g,''),'base64').toString('utf8'));
  }catch{return''}
}

async function main(){
  const trending=await fetchTrending();
  const enriched=[];
  for(const candidate of trending)enriched.push(await enrich(candidate));
  let selected=enriched.filter(isAiProject).sort((a,b)=>(a.trendingRank-b.trendingRank)||(b.starsToday-a.starsToday));
  if(selected.length<10)selected.push(...(await fallbackSearch(selected)).filter(isAiProject));
  selected=selected.slice(0,10);
  const projects=[];
  for(let index=0;index<selected.length;index++){
    const repo=selected[index];
    projects.push({
      rank:index+1,repo:repo.full_name,owner:repo.owner?.login||repo.full_name.split('/')[0],name:repo.name||repo.full_name.split('/')[1],description:repo.description||'',githubUrl:repo.html_url||`https://github.com/${repo.full_name}`,homepage:repo.homepage||'',language:repo.language||'',topics:repo.topics||[],stars:repo.stargazers_count||0,forks:repo.forks_count||0,openIssues:repo.open_issues_count||0,license:repo.license?.spdx_id||'',starsToday:repo.starsToday||0,updatedAt:repo.updated_at||'',avatarUrl:repo.owner?.avatar_url||'',readmeExcerpt:await readmeExcerpt(repo.full_name),source:repo.trendingRank<999?'GitHub Trending':'GitHub Search'
    });
  }
  await fs.mkdir(path.dirname(outputPath),{recursive:true});
  await fs.writeFile(outputPath,JSON.stringify({generatedAt:new Date().toISOString(),sourceUrl:'https://github.com/trending?since=daily',method:'GitHub daily trending filtered for AI; GitHub Search fills remaining positions.',projects},null,2)+'\n','utf8');
  console.log(`Wrote ${projects.length} projects to ${outputPath}`);
}

main().catch(error=>{console.error(error);process.exitCode=1});
