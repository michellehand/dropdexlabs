"use strict";
const $=id=>document.getElementById(id);
const search=$("archive-search"),rarity=$("rarity-filter"),klass=$("class-filter"),sort=$("sort-select"),count=$("archive-count"),grid=$("archive-grid"),more=$("load-more");
let archive=[],filtered=[],shown=0;const PAGE=24;
const text=v=>v===null||v===undefined||String(v).trim()===""?"—":String(v).trim();
const score=v=>v===null||v===undefined||String(v).trim()===""||!Number.isFinite(Number(v))?"—":Number(v).toFixed(1);
const rank=v=>v===null||v===undefined||String(v).trim()===""||!Number.isFinite(Number(v))?"—":"#"+Math.round(Number(v));
const node=(tag,cls,value)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(value!==undefined)e.textContent=value;return e};
const a=(label,url,cls)=>{const el=node('a',cls,label);el.href=url;return el};
const metric=(label,value)=>{const el=node('div');el.append(node('span','',label),node('b','',score(value)));return el};
function renderCard(d){
 const card=node('article','record');const top=node('div','record-top');top.append(node('span','rarity',text(d.rarity)),node('span','',text(d.dropdex_id)));card.append(top);
 const body=node('div','record-body');body.append(node('div','record-rank',rank(d.dropdex_rank_global)));
 const artist=a(text(d.artist),'artist.html?artist='+encodeURIComponent(d.artist??''),'record-artist');body.append(artist);
 const h=node('h3');h.append(a(text(d.track),'drop.html?id='+encodeURIComponent(d.dropdex_id??'')));body.append(h);
 body.append(node('p','record-meta','DROP '+text(d.drop_no)+' / '+text(d.release_year)+' / '+text(d.genre)));
 const sc=node('div','record-score'),cl=node('div');cl.append(node('small','','CLASSIFICATION'),node('div','class-name',text(d.drop_class)));if(d.secondary_class)cl.append(node('small','',text(d.secondary_class)));const num=node('div');num.append(node('small','','DROPDEX SCORE'),node('div','score',score(d.dropdex_score_abs)));sc.append(cl,num);body.append(sc);card.append(body);
 // Restore the original per-drop spectrogram fingerprint in archive previews.
 const rawPath=typeof d.spectrogram_path==='string'?d.spectrogram_path.trim():'';
 if(rawPath){
  const visual=node('div','record-fingerprint');
  const heading=node('div','record-fingerprint-heading');
  heading.append(node('span','','AUDIO FINGERPRINT'),node('span','','SIGNAL / DROP '+text(d.drop_no)));
  const img=document.createElement('img');
  img.src=rawPath.replace(/^\.\//,'').replace(/^\//,'');
  img.alt=text(d.artist)+' — '+text(d.track)+' audio spectrogram';
  img.loading='lazy';img.decoding='async';
  img.addEventListener('error',()=>{visual.hidden=true});
  visual.append(heading,img);card.append(visual);
 }
 const metrics=node('div','record-metrics');[['POWER',d.power_score_abs],['BUILD',d.build_score_abs],['PROD.',d.production_score_abs],['TONALITY',d.tonality_score_abs]].forEach(([k,v])=>metrics.append(metric(k,v)));card.append(metrics);
 const actions=node('div','record-actions');actions.append(a('VIEW FULL RECORD ↗','drop.html?id='+encodeURIComponent(d.dropdex_id??'')));
 const toggle=node('button','details','MORE METRICS +');toggle.type='button';toggle.setAttribute('aria-expanded','false');const extra=node('div','record-extra');extra.hidden=true;const exgrid=node('div','extra-grid');[['BATTLE RANK',rank(d.battle_rank)],['BATTLE SCORE',score(d.battle_score_abs)],['WEIGHT',score(d.weight_score_abs)],['SHOCK',score(d.shock_score_abs)],['AGGRESSION',score(d.aggression_score_abs)],['TENSION',score(d.tension_score_abs)],['BRIGHTNESS',score(d.brightness_score_abs)],['BADGES',text(d.badges)],['SECONDARY',text(d.secondary_class)]].forEach(([k,v])=>{const item=node('div');item.append(node('span','',k),node('strong','',v));exgrid.append(item)});extra.append(exgrid);
 toggle.addEventListener('click',()=>{extra.hidden=!extra.hidden;toggle.textContent=extra.hidden?'MORE METRICS +':'FEWER METRICS −';toggle.setAttribute('aria-expanded',String(!extra.hidden))});actions.append(toggle);card.append(actions,extra);return card;
}
function appendPage(){const slice=filtered.slice(shown,shown+PAGE);const frag=document.createDocumentFragment();slice.forEach(d=>frag.append(renderCard(d)));grid.append(frag);shown+=slice.length;more.hidden=shown>=filtered.length;more.textContent='LOAD MORE RECORDS ↓ ('+shown+' / '+filtered.length+')'}
function refresh(){const q=search.value.trim().toLowerCase();filtered=archive.filter(d=>(!q||[d.artist,d.track,d.dropdex_id].some(x=>String(x??'').toLowerCase().includes(q)))&&(!rarity.value||d.rarity===rarity.value)&&(!klass.value||d.drop_class===klass.value));const field=sort.value;filtered.sort((a,b)=>{const x=Number(a[field]),y=Number(b[field]);const xv=a[field]!==null&&a[field]!==undefined&&a[field]!==''&&Number.isFinite(x),yv=b[field]!==null&&b[field]!==undefined&&b[field]!==''&&Number.isFinite(y);if(!xv)return yv?1:0;if(!yv)return -1;return field.includes('rank')?x-y:y-x});shown=0;grid.replaceChildren();count.textContent=filtered.length+' OF '+archive.length+' RECORDS';if(!filtered.length){grid.append(node('div','empty','NO RECORDS MATCH YOUR FILTERS.'));more.hidden=true;return}appendPage()}
function populate(select,vals){[...new Set(vals.filter(Boolean))].sort((a,b)=>String(a).localeCompare(String(b))).forEach(v=>{const opt=document.createElement('option');opt.value=v;opt.textContent=String(v).toUpperCase();select.append(opt)})}
const menu=document.querySelector('.menu-toggle'),nav=document.querySelector('.nav');menu.addEventListener('click',()=>{const open=nav.classList.toggle('open');menu.setAttribute('aria-expanded',String(open))});
more.addEventListener('click',appendPage);[search,rarity,klass,sort].forEach(el=>el.addEventListener(el===search?'input':'change',refresh));$('reset-filters').addEventListener('click',()=>{search.value='';rarity.value='';klass.value='';sort.value='dropdex_rank_global';refresh()});
fetch('data/archive.json').then(r=>{if(!r.ok)throw Error('Archive data unavailable');return r.json()}).then(data=>{if(!Array.isArray(data))throw Error('Unexpected archive format');archive=data;$('hero-count').textContent=archive.length.toLocaleString();$('hero-artists').textContent=new Set(archive.map(d=>d.artist).filter(Boolean)).size;$('hero-tracks').textContent=new Set(archive.map(d=>String(d.artist??'')+'|'+String(d.track??''))).size;populate(rarity,archive.map(d=>d.rarity));populate(klass,archive.map(d=>d.drop_class));refresh()}).catch(err=>{count.textContent='ARCHIVE UNAVAILABLE';grid.replaceChildren(node('div','empty','COULD NOT LOAD data/archive.json. PREVIEW USING A LOCAL WEB SERVER OR CHECK YOUR GITHUB FILE PATH.'));console.error(err)});
