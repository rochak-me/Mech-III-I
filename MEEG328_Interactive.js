// ═══════════════════════════════════════════════════════
//  MEEG 328 — RENEWABLE ENERGY STUDY HUB
//  All past questions from Dec 2022, Jul/Aug 2024, Jul 2025
//  + Possible questions from slides
// ═══════════════════════════════════════════════════════

let currentView = 'overview';
let mcqAnswers = {};
const PROGRESS_KEY = 'meeg328_progress_v1';

function loadProgress(){ try{ return JSON.parse(localStorage.getItem(PROGRESS_KEY)||'{}'); }catch(e){ return {}; } }
function saveProgress(p){ try{ localStorage.setItem(PROGRESS_KEY, JSON.stringify(p)); }catch(e){} }
function markViewed(chKey, qIdx){
  const p = loadProgress();
  if(!p.viewed) p.viewed = {};
  p.viewed[chKey+'_'+qIdx] = 1;
  saveProgress(p);
  updateSidebarStats();
}

function navigate(view, el){
  document.querySelectorAll('.sidebar-item').forEach(i=>i.classList.remove('active'));
  if(el) el.classList.add('active');
  currentView = view;
  renderView(view);
  const area = document.getElementById('content-area');
  if(area){ area.scrollTop=0; }
  window.scrollTo(0,0);
}

function renderView(view){
  const area = document.getElementById('content-area');
  const bc = document.getElementById('bc-sub');
  const tabBar = document.getElementById('tab-bar');
  tabBar.innerHTML = '';
  area.style.animation='none';
  setTimeout(()=>{ area.style.animation='fadeIn 0.2s ease'; },10);

  if(view==='overview'){ bc.textContent='Overview'; area.innerHTML=renderOverview(); return; }
  if(view==='references'){ bc.textContent='References & Sources'; area.innerHTML=renderReferences(); return; }
  if(view==='dashboard'){ bc.textContent='Nepal Energy Dashboard'; area.innerHTML=renderDashboard(); return; }
  if(view==='mcq'){ bc.textContent='MCQ Practice'; area.innerHTML=renderMCQ(); return; }
  if(view==='fitb'){ bc.textContent='Fill in the Blank'; area.innerHTML=renderFITB(); return; }
  if(view==='flashcards'){ bc.textContent='Flashcards'; area.innerHTML=renderFlashcards(); return; }
  if(view==='formulas'){ bc.textContent='Formula Sheet'; area.innerHTML=renderFormulas(); return; }
  if(view==='search'){ bc.textContent='Search'; area.innerHTML=renderSearch(); return; }
  if(view==='exam'){ bc.textContent='Exam Simulator'; area.innerHTML=renderExamStart(); setTimeout(()=>{ document.getElementById('exam-search-input')&&document.getElementById('exam-search-input').focus(); },100); return; }
  if(view==='progress'){ bc.textContent='My Progress'; area.innerHTML=renderProgress(); return; }
  if(view==='bookmarks'){ bc.textContent='Bookmarks'; area.innerHTML=renderBookmarks(); return; }

  const ch = chapters[view];
  if(!ch){ area.innerHTML='<p style="color:var(--text3)">Coming soon...</p>'; return; }
  bc.textContent = ch.tag + ' — ' + ch.title;

  tabBar.innerHTML = `
    <button class="tab-btn active" id="tab-summary" onclick="switchTab('summary',this,'${view}')">🗺️ Chapter Summary</button>
    <button class="tab-btn" id="tab-theory" onclick="switchTab('theory',this,'${view}')">📝 Past Questions</button>
    <button class="tab-btn" id="tab-possible" onclick="switchTab('possible',this,'${view}')">⚡ Possible Questions</button>
    <button class="tab-btn" id="tab-concepts" onclick="switchTab('concepts',this,'${view}')">💡 Concepts</button>
  `;
  renderChapterTab(view, 'summary');
}

function switchTab(tab, el, view){
  document.querySelectorAll('#tab-bar .tab-btn').forEach(b=>b.classList.remove('active'));
  if(el) el.classList.add('active');
  renderChapterTab(view, tab);
}

function renderChapterTab(view, tab){
  const area = document.getElementById('content-area');
  const ch = chapters[view];
  let html = `
    <div class="chapter-hero">
      <div class="hero-tag">${ch.tag}</div>
      <h2>${ch.title}</h2>
      <p>${ch.desc}</p>
      <div class="hero-pills">${ch.pills.map(p=>`<span class="hero-pill">${p}</span>`).join('')}</div>
    </div>
    <div class="trust-bar">
      <span class="verified-icon">✅</span>
      <span style="font-size:12px;color:var(--text2);">Content verified from <strong style="color:var(--text);">KU official lecture slides</strong> by Prof. S.P. Lohani</span>
      <span class="trust-badge ku">KU MEEG 328</span>
      <span class="trust-badge wecs">WECS 2024</span>
      <span class="trust-badge textbook">Standard Textbooks</span>
      <a onclick="navigate('references',null)" style="margin-left:auto;font-family:var(--font-mono);font-size:10px;color:var(--accent);cursor:pointer;text-decoration:none;">View all sources →</a>
    </div>
  `;

  if(tab==='theory'){
    const p = loadProgress();
    const viewed = p.viewed || {};
    html += ch.theory.map((q,i)=>{
      const key = view+'_'+i;
      const hasAns = answerData[key] !== undefined;
      const isViewed = viewed[key];
      const years = q.years||[];
      const yearTags = years.map(y=>{
        const cls = y.includes('2022')?'y2022':y.includes('2024')?'y2024':y.includes('2025')?'y2025':'yposs';
        return `<span class="year-tag ${cls}">${y}</span>`;
      }).join('');
      return `<div class="q-card" id="qcard-${key}">
        <div class="q-header">
          <span class="q-num">${ch.tag}·Q${i+1}</span>
          <span class="q-text">${q.q}</span>
        </div>
        ${q.figure ? `<div class="q-figure"><div class="fig-placeholder">📷 Figure: ${q.figure}<br><span class="upload-figure-hint">Upload screenshot to display here</span></div></div>` : ''}
        <div class="q-meta">
          <span class="marks-pill">[${q.marks} marks]</span>
          ${yearTags}
          ${q.or ? `<span class="or-divider">OR</span>` : ''}
          ${hasAns ? `<button class="view-ans-btn" onclick="showAnswer('${view}',${i})">📖 View Answer</button>` : ''}
        </div>
      </div>`;
    }).join('');
  }
  else if(tab==='possible'){
    html += `<div style="background:rgba(251,191,36,0.06);border:1px solid rgba(251,191,36,0.15);border-radius:10px;padding:12px 16px;margin-bottom:16px;font-size:12.5px;color:var(--text2);">
      ⚡ <strong style="color:var(--yellow)">Possible Questions</strong> — predicted from slide content and past question trends. These topics appear in the slides but have not been asked in past papers yet.
    </div>`;
    html += (ch.possible||[]).map((q,i)=>{
      return `<div class="q-card possible">
        <div class="q-header">
          <span class="q-num" style="color:var(--yellow);border-color:rgba(251,191,36,0.2);background:rgba(251,191,36,0.08);">PRED·${i+1}</span>
          <span class="q-text">${q.q}</span>
        </div>
        <div class="q-meta">
          <span class="marks-pill">[${q.marks} marks est.]</span>
          <span class="possible-badge">⚡ Possible</span>
          ${q.topic ? `<span class="year-tag yposs">${q.topic}</span>` : ''}
        </div>
      </div>`;
    }).join('');
  }
  else if(tab==='summary'){
    html += renderSummary(view);
  }
  else if(tab==='concepts'){
    html += `<div class="concept-grid">${ch.concepts.map(c=>`
      <div class="concept-card">
        <div class="concept-label">${c.label}</div>
        <div class="concept-title">${c.title}</div>
        <div class="concept-body">${c.body}</div>
      </div>
    `).join('')}</div>`;
  }

  area.innerHTML = html;
}

function showAnswer(chKey, qIdx){
  const key = chKey+'_'+qIdx;
  const ans = answerData[key];
  const ch = chapters[chKey];
  const q = ch && ch.theory[qIdx];
  markViewed(chKey, qIdx);

  const overlay = document.getElementById('ans-overlay');
  const badge = document.getElementById('ans-qbadge');
  const title = document.getElementById('ans-qtitle');
  const meta = document.getElementById('ans-meta');
  const body = document.getElementById('ans-body');

  badge.textContent = (ch?ch.tag:'Q') + ' · Q' + (qIdx+1);
  title.textContent = q ? q.q.replace(/<[^>]+>/g,'').substring(0,100)+'...' : '';

  if(ans){
    // Support both old source:'...' and new refs:[...] format
    let srcBadges = '';
    if(ans.refs && ans.refs.length > 0){
      const badgeColors = { wecs:'wecs', ku:'ku', textbook:'textbook', iea:'iea' };
      srcBadges = ans.refs.slice(0,3).map(k => {
        const r = refs[k];
        if(!r) return '';
        return `<span class="trust-badge ${r.badge}">📚 ${r.name.substring(0,35)}${r.name.length>35?'…':''}</span>`;
      }).join(' ');
    } else if(ans.source){
      const srcParts = ans.source.split(',');
      srcBadges = srcParts.map(s => {
        const t = s.trim();
        const cls = t.includes('WECS')||t.includes('AEPC')||t.includes('NEA') ? 'wecs' :
                    t.includes('KU')||t.includes('Lecture')||t.includes('Slides') ? 'ku' :
                    t.includes('IEA')||t.includes('IRENA') ? 'iea' : 'textbook';
        return `<span class="trust-badge ${cls}">📚 ${t}</span>`;
      }).join(' ');
    }
    meta.innerHTML = `<span class="ans-pill marks">[${ans.marks} marks]</span> ${srcBadges} <span class="verified-icon" title="Verified from official sources">✅</span>
      <button class="got-it-btn" id="got-it-btn" onclick="markGotIt('${chKey}',${qIdx},this)">✅ Got it</button>
      <button class="bookmark-btn" id="bm-btn" onclick="toggleBookmark('${chKey}',${qIdx},this)" title="Bookmark">🔖</button>`;
    // Set bookmark state
    const bmBtn = document.getElementById('bm-btn');
    if(bmBtn && getBookmarks().includes(chKey+'_'+qIdx)) { bmBtn.classList.add('active'); }
    const gotBtn = document.getElementById('got-it-btn');
    const prog = loadProgress();
    if(gotBtn && prog.viewed && prog.viewed[chKey+'_'+qIdx]) { gotBtn.textContent='✅ Got it'; gotBtn.classList.add('done'); gotBtn.disabled=true; }
    const refsHtml = ans.refs ? buildRefs(ans.refs) : '';
    body.innerHTML = `<div class="ans-content">${ans.content}</div>${refsHtml}`;
  } else {
    meta.innerHTML = `<span class="ans-pill marks">[${q?q.marks:'?'} marks]</span>`;
    body.innerHTML = `<div style="text-align:center;padding:28px 20px;"><div style="font-size:26px;margin-bottom:10px;">🔧</div><div style="font-family:var(--font-head);font-weight:700;color:var(--text);margin-bottom:6px;">Answer Coming Soon</div><div style="font-size:12px;color:var(--text3);">Being prepared from lecture slides and reference books.</div></div>`;
  }
  overlay.classList.add('open');
  document.body.style.overflow='hidden';
  setTimeout(()=>{ typesettMath(); initAnswerCharts(); }, 250);
}

function closeAnsBtn(){ document.getElementById('ans-overlay').classList.remove('open'); document.body.style.overflow=''; }
function closeAns(e){ if(e.target===document.getElementById('ans-overlay')) closeAnsBtn(); }

function toggleMobileMenu(){
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('mob-overlay');
  sidebar.classList.toggle('open');
  overlay.classList.toggle('show');
}

function updateSidebarStats(){
  const p = loadProgress();
  const viewed = Object.keys(p.viewed||{}).length;
  const total = Object.values(chapters).reduce((s,c)=>s+(c.theory||[]).length,0);
  const pct = total>0 ? Math.round(viewed/total*100) : 0;
  const bm = getBookmarks ? getBookmarks().length : 0;
  const sbQ = document.getElementById('sb-questions');
  const sbMcq = document.getElementById('sb-mcq');
  const sbProg = document.getElementById('sb-progress');
  const sbBm = document.getElementById('sb-bookmarks');
  if(sbQ) sbQ.textContent = total;
  if(sbMcq) sbMcq.textContent = (typeof mcqData!=='undefined'?mcqData.length:55) + ' MCQ / ' + (typeof fitbData!=='undefined'?fitbData.length:10) + ' FITB';
  if(sbProg) sbProg.textContent = pct+'%';
  if(sbBm) sbBm.textContent = bm;
}

// ═══════════════════════════════════════════════════════
//  RENDER FUNCTIONS
// ═══════════════════════════════════════════════════════
function renderOverview(){
  const priorityRows = [
    { topic:'PV System Design', focus:'Hydraulic energy, pump sizing, PV power calculation', p:'high', ch:'ch5' },
    { topic:'Anaerobic Digestion & Biogas Sizing', focus:'Plant size, water requirement, biogas production, LPG substitution', p:'high', ch:'ch3' },
    { topic:'Solar Flat Plate Collector', focus:'Energy balance, HWB equation, collector area calculation', p:'high', ch:'ch4' },
    { topic:'Wind Power & WRA', focus:'Betz limit, power extraction, wind speed scaling (Power Law)', p:'high', ch:'ch6' },
    { topic:'Nepal Energy Scenario', focus:'Nepal energy mix, RoR problem, energy security, diverse mix', p:'high', ch:'ch1' },
    { topic:'Gasification System Design', focus:'Feedstock, gasifier choice, syngas processing, block diagram', p:'med', ch:'ch2' },
    { topic:'Biodigester Types', focus:'Fixed dome vs floating dome vs bag type — 2 differences each pair', p:'med', ch:'ch3' },
    { topic:'IV Characteristics of Solar Cell', focus:'Isc, Voc, FF, Pmax, temperature effect on Voc (−2.3mV/°C)', p:'med', ch:'ch5' },
    { topic:'PHES Energy Storage', focus:'Formula, Nepal seasonal role, calculation', p:'med', ch:'ch7' },
    { topic:'Ch8 MCQ Facts (4 guaranteed)', focus:'FDC→microhydro, OTEC >10°C, Plutonium not geothermal, tidal 62.5kW/m²', p:'low', ch:'ch8' },
  ];

  // Chapter coverage from progress
  const p = loadProgress();
  const viewed = p.viewed || {};
  const chapters_keys = ['ch1','ch2','ch3','ch4','ch5','ch6','ch7','ch8'];
  const totalQ = chapters_keys.reduce((s,ch)=>s+(chapters[ch]?(chapters[ch].theory||[]).length:0),0);
  const totalDone = chapters_keys.reduce((s,ch)=>{
    const n=(chapters[ch]?(chapters[ch].theory||[]).length:0);
    return s+[...Array(n)].filter((_,i)=>viewed[ch+'_'+i]).length;
  },0);
  const overallPct = totalQ>0?Math.round(totalDone/totalQ*100):0;

  return '<div style="background:var(--surface);border:1px solid var(--border);border-radius:16px;padding:26px 28px;margin-bottom:18px;position:relative;overflow:hidden;">' +
    '<div style="position:absolute;top:-40px;right:-40px;width:160px;height:160px;border-radius:50%;background:var(--accent);opacity:0.04;filter:blur(30px);"></div>' +
    '<div style="font-family:var(--font-mono);font-size:10px;color:var(--accent);background:rgba(34,211,160,0.1);border:1px solid rgba(34,211,160,0.2);padding:3px 10px;border-radius:100px;display:inline-block;margin-bottom:12px;">MEEG 328 — Renewable Energy</div>' +
    '<div style="font-family:var(--font-head);font-size:26px;font-weight:800;margin-bottom:8px;">Priority List & Exam Guide</div>' +
    '<div style="font-size:13px;color:var(--text2);margin-bottom:18px;">Compiled from 3 past exam papers (Dec 2022, Jul/Aug 2024, Jul 2025). Topics ranked by frequency and marks weight.</div>' +
    '<div style="display:flex;gap:12px;flex-wrap:wrap;">' +
    [
      {n:totalQ, l:'Past Questions', c:'var(--accent2)'},
      {n:typeof mcqData!=='undefined'?mcqData.length:55, l:'MCQs', c:'var(--accent3)'},
      {n:'8', l:'Chapters', c:'var(--purple)'},
      {n:'3', l:'Exam Papers', c:'var(--yellow)'},
      {n:overallPct+'%', l:'Your Progress', c:'var(--green)'},
    ].map(s=>'<div style="background:var(--surface2);border:1px solid var(--border);border-radius:10px;padding:12px 16px;text-align:center;">' +
      '<div style="font-family:var(--font-head);font-size:22px;font-weight:800;color:' + s.c + ';">' + s.n + '</div>' +
      '<div style="font-size:10px;color:var(--text3);margin-top:2px;font-family:var(--font-mono);">' + s.l + '</div></div>').join('') +
    '</div></div>' +

    // Quick actions
    '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:18px;">' +
    '<div onclick="navigate(\'ch1\',null)" class="qa-card"><div class="qa-icon">🗺️</div><div class="qa-label">Chapter Summary</div><div class="qa-sub">Read before studying</div></div>' +
    '<div onclick="navigate(\'search\',null)" class="qa-card"><div class="qa-icon">🔍</div><div class="qa-label">Search</div><div class="qa-sub">Find any topic fast</div></div>' +
    '<div onclick="navigate(\'exam\',null)" class="qa-card"><div class="qa-icon">⏱️</div><div class="qa-label">Mock Exam</div><div class="qa-sub">Timed practice test</div></div>' +
    '<div onclick="navigate(\'dashboard\',null)" class="qa-card"><div class="qa-icon">📊</div><div class="qa-label">Dashboard</div><div class="qa-sub">Nepal energy charts</div></div>' +
    '</div>' +

    // Priority table
    '<div style="background:var(--surface);border:1px solid var(--border);border-radius:14px;overflow:hidden;">' +
    '<div style="padding:16px 20px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;">' +
    '<span style="font-family:var(--font-head);font-size:16px;font-weight:700;">🎯 Master Priority List</span>' +
    '<span style="font-family:var(--font-mono);font-size:11px;color:var(--text3);">' + priorityRows.length + ' topics</span></div>' +
    priorityRows.map(r => {
      const pColor = r.p==='high'?'var(--red)':r.p==='med'?'var(--yellow)':'var(--text3)';
      const pBg = r.p==='high'?'rgba(248,113,113,0.1)':r.p==='med'?'rgba(251,191,36,0.1)':'rgba(100,116,139,0.1)';
      const pBorder = r.p==='high'?'rgba(248,113,113,0.2)':r.p==='med'?'rgba(251,191,36,0.2)':'rgba(100,116,139,0.2)';
            return '<div data-nav="' + r.ch + '" onclick="navigate(this.getAttribute(\'data-nav\'),null)" style="display:grid;grid-template-columns:1fr 2fr auto;gap:16px;padding:12px 20px;border-bottom:1px solid var(--border);align-items:center;cursor:pointer;" onmouseover="this.style.background=\'var(--surface2)\'" onmouseout="this.style.background=\'\'">' +
        '<span style="font-size:13px;color:var(--text);font-weight:500;">' + r.topic + '</span>' +
        '<span style="font-size:12px;color:var(--text2);">' + r.focus + '</span>' +
        '<span style="font-family:var(--font-mono);font-size:10px;padding:3px 10px;border-radius:100px;border:1px solid ' + pBorder + ';background:' + pBg + ';color:' + pColor + ';white-space:nowrap;">' +
        (r.p==='high'?'● High':r.p==='med'?'● Medium':'● Low') + '</span></div>';
    }).join('') + '</div>';
}

function renderMCQ(){
  const yearOrder = ['Dec 2022','Jul/Aug 2024','Fill-in-Blank 2024'];
  let html = `<div class="score-bar">
    <div class="score-box"><div class="sv" id="score-attempted">0/${mcqData.length}</div><div class="sl">Attempted</div></div>
    <div class="score-box"><div class="sv" id="score-correct">0</div><div class="sl">Correct</div></div>
    <div class="score-box"><div class="sv" id="score-pct">0%</div><div class="sl">Score</div></div>
    <button onclick="resetMcq()" style="margin-left:auto;font-family:var(--font-mono);font-size:11px;padding:6px 14px;border-radius:8px;border:1px solid var(--border);background:var(--surface2);color:var(--text3);cursor:pointer;">Reset</button>
  </div>
  <div id="mcq-filters" style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:16px;">
    <button class="tab-btn active" onclick="filterMcq('all',this)">All (${mcqData.length})</button>
    ${yearOrder.map(y=>`<button class="tab-btn" onclick="filterMcq('${y}',this)">${y}</button>`).join('')}
  </div>
  <div id="mcq-list">${getMcqHtml('all')}</div>`;
  return html;
}

function getMcqHtml(filter){
  const filtered = filter==='all' ? mcqData : mcqData.filter(q=>q.year===filter);
  let html = '';
  let lastYear = '';
  filtered.forEach((q,gi)=>{
    const idx = mcqData.indexOf(q);
    if(q.year!==lastYear){
      const cls = q.year.includes('2022')?'y2022':q.year.includes('Fill')?'yposs':'y2024';
      html += `<div class="mcq-section-header"><span class="year-tag ${cls}">${q.year}</span></div>`;
      lastYear = q.year;
    }
    const answered = mcqAnswers[idx]!==undefined;
    html += `<div class="mcq-card ${answered?'answered':''}" id="mcq-${idx}">
      <div class="mcq-num-row">
        <span class="q-num">Q${gi+1}</span>
        <span class="year-tag ${q.year.includes('2022')?'y2022':q.year.includes('Fill')?'yposs':'y2024'}">${q.year}</span>
      </div>
      <div class="mcq-q-text">${q.q}</div>
      <div class="mcq-options">
        ${q.opts.map((o,oi)=>`<div class="mcq-option ${answered?'disabled':''} ${answered&&oi===q.correct?'show-correct':''} ${answered&&mcqAnswers[idx]===oi&&oi!==q.correct?'selected-wrong':''}" onclick="answerMcq(${idx},${oi})">${o}</div>`).join('')}
      </div>
      <div class="mcq-explanation ${answered?'show':''}" id="exp-${idx}">
        ${answered?`<strong>${mcqAnswers[idx]===q.correct?'✅ Correct!':'❌ Incorrect.'}</strong> ${q.explain}`:''}
      </div>
    </div>`;
  });
  return html;
}

function filterMcq(filter, el){
  document.querySelectorAll('#mcq-filters .tab-btn').forEach(b=>b.classList.remove('active'));
  if(el) el.classList.add('active');
  document.getElementById('mcq-list').innerHTML = getMcqHtml(filter);
}

function answerMcq(idx, chosen){
  if(mcqAnswers[idx]!==undefined) return;
  mcqAnswers[idx] = chosen;
  const card = document.getElementById('mcq-'+idx);
  const exp = document.getElementById('exp-'+idx);
  if(!card||!exp) return;
  const opts = card.querySelectorAll('.mcq-option');
  const isCorrect = chosen===mcqData[idx].correct;
  opts.forEach((o,oi)=>{
    o.classList.add('disabled');
    if(oi===mcqData[idx].correct) o.classList.add('show-correct');
    if(oi===chosen&&!isCorrect) o.classList.add('selected-wrong');
  });
  exp.innerHTML = `<strong>${isCorrect?'✅ Correct!':'❌ Incorrect.'}</strong> ${mcqData[idx].explain}`;
  exp.classList.add('show');
  card.classList.add('answered');
  const total = Object.keys(mcqAnswers).length;
  const correct = Object.keys(mcqAnswers).filter(k=>mcqAnswers[parseInt(k)]===mcqData[parseInt(k)].correct).length;
  const pct = Math.round(correct/total*100);
  const ae = document.getElementById('score-attempted'); if(ae) ae.textContent=total+'/'+mcqData.length;
  const ce = document.getElementById('score-correct'); if(ce) ce.textContent=correct;
  const pe = document.getElementById('score-pct'); if(pe){ pe.textContent=pct+'%'; pe.style.color=pct>=70?'var(--green)':pct>=40?'var(--yellow)':'var(--red)'; }
  const ss = document.getElementById('mcq-score-sidebar'); if(ss) ss.textContent=pct+'%';
}

function resetMcq(){ mcqAnswers={}; renderView('mcq'); }

const fitbData = [
  { q:"The amount of energy available in the wind at any instant is proportional to ___ of the wind speed.", ans:"cube (third power / v³). Wind power P = ½ρAv³, so energy ∝ v³.", year:"Jul/Aug 2024" },
  { q:"A 100Wp solar PV system installed in an area where average solar insolation is 1825 kWh/m²/year, considering no effect of temperature variation and soiling, can generate ___ kWh electricity per annum.", ans:"182.5 kWh/year. Calculation: 100W × 1825 h/year = 182,500 Wh = 182.5 kWh", year:"Jul/Aug 2024" },
  { q:"___ gasifier produces typically less than 1% of tar-oils and so are used widely for internal combustion engine operation.", ans:"Downdraft gasifier. The downdraft configuration burns tar-rich gases in a high-temperature reduction zone, reducing tar to <1 g/Nm³.", year:"Jul/Aug 2024" },
  { q:"To manage 50 kg of cattle manure considering 50 days of hydraulic retention time and 30 L biogas production per kg cattle manure, the required size of biogas plant is ___.", ans:"2.5 m³. Volume = W × HRT / mixing ratio = 50 × 50 / 1000 = 2.5 m³ (using 1:1 dung to water ratio, total slurry = 100 kg/day ≈ 100 L/day, V = 100 L/day × 50 days = 5000 L = 5 m³. Or simplified: V = 50 kg × 50 days × 1 L/kg / 1000 = 2.5 m³)", year:"Jul/Aug 2024" },
  { q:"A typical spacing between turbines in a wind farm in terms of their rotor diameters D is approximately ___.", ans:"5-9D (5 to 9 rotor diameters). Typical: 5-7D crosswind, 7-9D downwind to minimize wake effects.", year:"Jul/Aug 2024" },
  { q:"The fraction of power in the wind that a modern wind turbine can extract is approximately ___.", ans:"40-45% (or 0.40-0.45). The theoretical Betz limit is 59.3%. Modern turbines achieve Cp=0.40-0.48 in practice.", year:"Jul/Aug 2024" },
  { q:"A rapid heating process that converts biomass into bio-oil within seconds is ___.", ans:"Fast pyrolysis (also called Flash pyrolysis). It converts biomass at 400-600°C with short residence time (<2 seconds) into ~75% bio-oil, 12% char, 13% gas.", year:"Jul/Aug 2024" },
  { q:"The typical capacity factor of solar PV is ____%.", ans:"15-20% (in Nepal context: ~15-18%). Global average ~15%. Capacity factor = actual annual energy / (rated power × 8760 hours).", year:"Jul/Aug 2024" },
  { q:"Composting is the decomposition of organic matter in the ___ of air.", ans:"Presence (aerobic conditions). Composting requires oxygen (aerobic). Biogas production is anaerobic (absence of air). This is a key difference.", year:"Jul/Aug 2024" },
  { q:"Biomass ___ is the process in which pelletized or crushed biomass is partially oxidized under restricted air supply for the generation of producer gas.", ans:"Gasification. Producer gas (syngas) is generated by partial oxidation. Main components: CO, H₂, CH₄, CO₂, N₂.", year:"Jul/Aug 2024" },
];


function renderFITB(){
  let html = `<div style="background:rgba(34,211,160,0.06);border:1px solid rgba(34,211,160,0.15);border-radius:10px;padding:12px 16px;margin-bottom:18px;font-size:13px;color:var(--text2);">
    Fill-in-the-blank questions from past exams. Click <strong>Reveal Answer</strong> to check.
  </div>`;
  fitbData.forEach((q,i)=>{
    html += `<div class="fitb-card">
      <div class="fitb-q">${i+1}. ${q.q}</div>
      <div style="display:flex;align-items:center;gap:10px;">
        <button class="fitb-reveal-btn" onclick="revealFitb(${i})">Reveal Answer</button>
        <span class="year-tag ${q.year.includes('2022')?'y2022':'y2024'}">${q.year}</span>
      </div>
      <div class="fitb-ans" id="fitb-ans-${i}">→ ${q.ans}</div>
    </div>`;
  });
  return html;
}

function revealFitb(i){
  const el = document.getElementById('fitb-ans-'+i);
  if(el) el.classList.add('show');
}

function renderFlashcards(){
  const chapters_fc = [...new Set(flashcards.map(f => f.ch))];
  let filterHtml = `<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:18px;">
    <button class="tab-btn active" onclick="filterCards('all',this)">All (${flashcards.length})</button>
    ${chapters_fc.map(ch => `<button class="tab-btn" onclick="filterCards('${ch}',this)">${ch}</button>`).join('')}
  </div>`;
  return filterHtml + `<div id="fc-grid">${renderCardGrid('all')}</div>`;
}

function renderCardGrid(filter){
  const cards = filter==='all' ? flashcards : flashcards.filter(f=>f.ch===filter);
  return `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:14px;">
    ${cards.map((f,i)=>`
    <div onclick="this.querySelector('.fc-inner').style.transform = this.querySelector('.fc-inner').style.transform ? '' : 'rotateY(180deg)'"
         style="height:165px;cursor:pointer;perspective:800px;">
      <div class="fc-inner" style="position:relative;width:100%;height:100%;transform-style:preserve-3d;transition:transform 0.5s;">
        <div style="position:absolute;inset:0;background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:16px;backface-visibility:hidden;display:flex;flex-direction:column;">
          <div style="font-family:var(--font-mono);font-size:9px;color:var(--accent);margin-bottom:8px;text-transform:uppercase;letter-spacing:0.08em;">${f.ch}</div>
          <div style="font-size:13px;color:var(--text);font-weight:500;line-height:1.5;flex:1;">${f.q}</div>
          <div style="font-size:10px;color:var(--text3);font-family:var(--font-mono);margin-top:8px;">Tap to flip →</div>
        </div>
        <div style="position:absolute;inset:0;background:var(--surface2);border:1px solid rgba(34,211,160,0.25);border-radius:12px;padding:16px;backface-visibility:hidden;transform:rotateY(180deg);overflow-y:auto;">
          <div style="font-size:12px;color:var(--accent2);line-height:1.65;">${f.a}</div>
        </div>
      </div>
    </div>
    `).join('')}
  </div>`;
}

function filterCards(filter, el){
  document.querySelectorAll('#tab-bar .tab-btn, .tab-btn').forEach(b=>b.classList.remove('active'));
  if(el) el.classList.add('active');
  const grid = document.getElementById('fc-grid');
  if(grid) grid.innerHTML = renderCardGrid(filter);
}


function renderFormulas(){
  const trust = `<div class="accuracy-banner" style="margin-bottom:18px;">
    <div class="accuracy-icon">📐</div>
    <div class="accuracy-text">All formulas sourced from course lecture slides and referenced textbooks.
      Sources: Duffie & Beckman (2013) — Solar Thermal | Masters (2004) — PV/Wind |
      Basu (2010) — Biomass | WECS (2024) — Nepal data. Equations rendered with MathJax.</div>
  </div>`;
  const html = formulaChapters.map(fc=>`
    <div style="background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:20px;margin-bottom:16px;">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;border-bottom:1px solid var(--border);padding-bottom:12px;">
        <span style="font-size:20px;">${fc.icon}</span>
        <span style="font-family:var(--font-head);font-size:16px;font-weight:700;color:${fc.color};">${fc.title}</span>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:14px;">
        ${fc.formulas.map(f=>`
        <div style="background:var(--surface2);border:1px solid var(--border);border-radius:10px;padding:16px;">
          <div style="font-size:12px;color:var(--accent2);font-family:var(--font-mono);margin-bottom:10px;font-weight:600;">${f.name}</div>
          <div class="math-block">${f.eq}</div>
          ${f.display ? `<div class="math-block" style="font-size:12px;padding:8px 12px;margin-top:6px;">${f.display}</div>` : ''}
          ${f.note ? `<div style="font-size:11px;color:var(--text3);margin-top:8px;line-height:1.5;padding-left:4px;">${f.note}</div>` : ''}
        </div>
        `).join('')}
      </div>
    </div>
  `).join('');
  return trust + '<div>' + html + '</div>';
}

function renderExamSetup(){
  return `<div style="background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:24px;max-width:540px;">
    <div style="font-family:var(--font-head);font-size:20px;font-weight:800;margin-bottom:6px;">⏱ Exam Simulator</div>
    <p style="font-size:13px;color:var(--text2);margin-bottom:20px;">Simulates the KU MEEG 328 exam pattern.</p>
    <div style="display:grid;gap:10px;">
      <div style="background:var(--surface2);border:1px solid var(--border);border-radius:10px;padding:16px;">
        <div style="font-family:var(--font-head);font-weight:700;margin-bottom:4px;">Section A — MCQ</div>
        <div style="font-size:12px;color:var(--text2);">10 questions × 1 mark = 10 marks | 30 min</div>
      </div>
      <div style="background:var(--surface2);border:1px solid var(--border);border-radius:10px;padding:16px;">
        <div style="font-family:var(--font-head);font-weight:700;margin-bottom:4px;">Section B — Fill in Blank</div>
        <div style="font-size:12px;color:var(--text2);">10 questions × 1 mark = 10 marks | 20 min</div>
      </div>
      <div style="background:var(--surface2);border:1px solid var(--border);border-radius:10px;padding:16px;">
        <div style="font-family:var(--font-head);font-weight:700;margin-bottom:4px;">Section C — Long Answer</div>
        <div style="font-size:12px;color:var(--text2);">5 questions × 11 marks = 55 marks | 90 min</div>
      </div>
    </div>
    <div style="margin-top:18px;font-size:12px;color:var(--text3);">Full exam simulator coming soon. Practice with MCQs and Fill-in-Blank sections in the sidebar.</div>
  </div>`;
}

function renderProgress(){
  const p = loadProgress();
  const viewed = p.viewed || {};
  const bm = getBookmarks ? getBookmarks() : [];
  const chapters_pos_keys = ['ch1','ch2','ch3','ch4','ch5','ch6','ch7','ch8'];
  const chLabels = ['Ch1 Energy','Ch2 Biomass','Ch3 Biogas','Ch4 Solar Th.','Ch5 Solar PV','Ch6 Wind','Ch7 Storage','Ch8 Hydro'];
  const chColors = ['#22d3a0','#fb923c','#22d3a0','#fbbf24','#38bdf8','#a78bfa','#f87171','#60a5fa'];

  const chData = chapters_pos_keys.map(ch => {
    const chap = chapters[ch];
    if(!chap) return { n:0, done:0, pct:0 };
    const n = (chap.theory||[]).length;
    const done = (chap.theory||[]).filter((_,i)=>viewed[ch+'_'+i]).length;
    return { n, done, pct: n>0?Math.round(done/n*100):0 };
  });

  const total = chData.reduce((s,c)=>s+c.n,0);
  const totalDone = chData.reduce((s,c)=>s+c.done,0);
  const overallPct = total>0?Math.round(totalDone/total*100):0;

  let html = '<div style="font-family:var(--font-head);font-size:22px;font-weight:800;margin-bottom:20px;">📊 My Progress</div>';

  // Overall stats row
  html += '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:22px;">' +
    ['overall','mcq','bm','study'].map((type,i) => {
      const vals = [
        {n:overallPct+'%', l:'Overall Completion', c:'var(--accent)'},
        {n:Object.keys(mcqAnswers||{}).length + '/' + (typeof mcqData!=='undefined'?mcqData.length:55), l:'MCQs Attempted', c:'var(--accent3)'},
        {n:bm.length, l:'Bookmarked', c:'var(--yellow)'},
        {n:totalDone + '/' + total, l:'Answers Read', c:'var(--green)'},
      ][i];
      return '<div style="background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:16px;text-align:center;">' +
        '<div style="font-family:var(--font-head);font-size:22px;font-weight:800;color:' + vals.c + ';">' + vals.n + '</div>' +
        '<div style="font-size:10px;color:var(--text3);margin-top:4px;">' + vals.l + '</div></div>';
    }).join('') + '</div>';

  // Radar chart
  html += '<div style="background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:20px;margin-bottom:18px;">' +
    '<div style="font-family:var(--font-head);font-size:14px;font-weight:700;margin-bottom:14px;">Chapter Coverage</div>' +
    '<canvas id="progress-radar" height="200"></canvas></div>';

  // Chapter bars
  html += '<div style="background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:18px;margin-bottom:14px;">' +
    '<div style="font-family:var(--font-head);font-size:14px;font-weight:700;margin-bottom:14px;">Chapter Breakdown</div>';

  chData.forEach((d, i) => {
    html += '<div style="margin-bottom:12px;">' +
      '<div style="display:flex;justify-content:space-between;margin-bottom:5px;">' +
      '<span style="font-size:12.5px;color:var(--text2);">' + chLabels[i] + '</span>' +
      '<span style="font-family:var(--font-mono);font-size:11px;color:' + chColors[i] + ';">' + d.done + '/' + d.n + ' (' + d.pct + '%)</span></div>' +
      '<div style="height:6px;background:var(--surface2);border-radius:3px;overflow:hidden;">' +
      '<div style="height:100%;width:' + d.pct + '%;background:' + chColors[i] + ';border-radius:3px;transition:width 0.5s;"></div></div></div>';
  });
  html += '</div>';

  // MCQ score breakdown by topic
  const mcqByYear = {};
  if(typeof mcqData !== 'undefined'){
    mcqData.forEach((q,i) => {
      const yr = q.year || 'Other';
      if(!mcqByYear[yr]) mcqByYear[yr] = {total:0, correct:0};
      mcqByYear[yr].total++;
      if(mcqAnswers && mcqAnswers[i] === q.correct) mcqByYear[yr].correct++;
    });
  }

  if(Object.keys(mcqAnswers||{}).length > 0){
    html += '<div style="background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:18px;margin-bottom:14px;">' +
      '<div style="font-family:var(--font-head);font-size:14px;font-weight:700;margin-bottom:12px;">MCQ Performance by Paper</div>';
    Object.entries(mcqByYear).forEach(([yr, data]) => {
      const pct = data.total>0 ? Math.round(data.correct/data.total*100) : 0;
      const col = pct>=70?'var(--green)':pct>=40?'var(--yellow)':'var(--red)';
      html += '<div style="display:flex;align-items:center;gap:12px;margin-bottom:8px;">' +
        '<span style="font-family:var(--font-mono);font-size:11px;min-width:100px;color:var(--text2);">' + yr + '</span>' +
        '<div style="flex:1;height:6px;background:var(--surface2);border-radius:3px;overflow:hidden;">' +
        '<div style="height:100%;width:' + pct + '%;background:' + col + ';border-radius:3px;"></div></div>' +
        '<span style="font-family:var(--font-mono);font-size:11px;color:' + col + ';min-width:60px;text-align:right;">' + data.correct + '/' + data.total + ' (' + pct + '%)</span></div>';
    });
    html += '</div>';
  }

  html += '<div style="display:flex;gap:10px;">' +
    '<button onclick="clearProgress()" style="font-family:var(--font-mono);font-size:11px;padding:8px 18px;border-radius:8px;border:1px solid rgba(248,113,113,0.3);background:rgba(248,113,113,0.07);color:var(--red);cursor:pointer;">Clear Read Progress</button>' +
    '<button onclick="resetMcqScores()" style="font-family:var(--font-mono);font-size:11px;padding:8px 18px;border-radius:8px;border:1px solid var(--border);background:var(--surface2);color:var(--text3);cursor:pointer;">Reset MCQ Scores</button>' +
    '</div>';

  // Init radar chart after render
  setTimeout(() => {
    const ctx = document.getElementById('progress-radar');
    if(ctx && typeof Chart !== 'undefined'){
      new Chart(ctx, {
        type: 'radar',
        data: {
          labels: chLabels,
          datasets: [{
            label: 'Coverage %',
            data: chData.map(d => d.pct),
            backgroundColor: 'rgba(34,211,160,0.15)',
            borderColor: '#22d3a0',
            borderWidth: 2,
            pointBackgroundColor: chColors,
            pointRadius: 5,
          }]
        },
        options: {
          responsive: true,
          plugins: { legend: { display: false } },
          scales: { r: {
            min: 0, max: 100,
            grid: { color: '#1a2530' },
            angleLines: { color: '#1a2530' },
            pointLabels: { color: '#7a9ab0', font: { size: 11 } },
            ticks: { display: false }
          }}
        }
      });
    }
  }, 150);

  return html;
}

function resetMcqScores(){ mcqAnswers={}; renderView('progress'); }

function clearProgress(){ saveProgress({}); renderView('progress'); updateSidebarStats(); }

function renderDashboard(){
  return `
  <div style="font-family:var(--font-head);font-size:24px;font-weight:800;margin-bottom:4px;">📊 Nepal Energy Dashboard</div>
  <p style="font-size:13px;color:var(--text2);margin-bottom:24px;">Data from WECS Energy Sector Synopsis Report 2024 (FY 2079/80) & lecture slides. All figures are accurate reference data.</p>

  <!-- ROW 1: Two charts side by side -->
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px;">

    <!-- Nepal Total Energy Mix Pie -->
    <div style="background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:20px;">
      <div style="font-family:var(--font-head);font-size:14px;font-weight:700;margin-bottom:4px;">Nepal Total Energy Mix</div>
      <div style="font-size:11px;color:var(--text3);font-family:var(--font-mono);margin-bottom:14px;">FY 2079/80 (2022/23) — Source: WECS 2024</div>
      <canvas id="chart-energy-mix" height="200"></canvas>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:14px;" id="legend-energy-mix"></div>
    </div>

    <!-- Nepal Sectoral Consumption Donut -->
    <div style="background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:20px;">
      <div style="font-family:var(--font-head);font-size:14px;font-weight:700;margin-bottom:4px;">Sectoral Energy Consumption</div>
      <div style="font-size:11px;color:var(--text3);font-family:var(--font-mono);margin-bottom:14px;">FY 2079/80 — Source: WECS 2024</div>
      <canvas id="chart-sector" height="200"></canvas>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:14px;" id="legend-sector"></div>
    </div>
  </div>

  <!-- ROW 2: Nepal Energy Share Trend Bar -->
  <div style="background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:20px;margin-bottom:16px;">
    <div style="font-family:var(--font-head);font-size:14px;font-weight:700;margin-bottom:4px;">Nepal Energy Share Trend (2075/76 – 2079/80)</div>
    <div style="font-size:11px;color:var(--text3);font-family:var(--font-mono);margin-bottom:14px;">Traditional biomass declining, renewables growing — Source: WECS 2024 Table XXIV</div>
    <canvas id="chart-trend" height="120"></canvas>
  </div>

  <!-- ROW 3: Installed Hydro Capacity + Cooking Fuel -->
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px;">

    <!-- Nepal Installed Hydro Capacity Bar -->
    <div style="background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:20px;">
      <div style="font-family:var(--font-head);font-size:14px;font-weight:700;margin-bottom:4px;">Nepal Hydropower Capacity (MW)</div>
      <div style="font-size:11px;color:var(--text3);font-family:var(--font-mono);margin-bottom:14px;">Operational + Under Construction — Source: NEA 2023</div>
      <canvas id="chart-hydro" height="180"></canvas>
    </div>

    <!-- Household Cooking Fuel -->
    <div style="background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:20px;">
      <div style="font-family:var(--font-head);font-size:14px;font-weight:700;margin-bottom:4px;">Household Cooking Fuel Sources</div>
      <div style="font-size:11px;color:var(--text3);font-family:var(--font-mono);margin-bottom:14px;">Nepal CBS 2021 (6.67M households)</div>
      <canvas id="chart-cooking" height="180"></canvas>
    </div>
  </div>

  <!-- ROW 4: Nepal vs World Comparison Radar-style bar -->
  <div style="background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:20px;margin-bottom:16px;">
    <div style="font-family:var(--font-head);font-size:14px;font-weight:700;margin-bottom:4px;">Nepal Energy Targets vs Current Status</div>
    <div style="font-size:11px;color:var(--text3);font-family:var(--font-mono);margin-bottom:14px;">15th/16th Five-Year Plan targets vs FY 2079/80 actual — Source: WECS 2024</div>
    <canvas id="chart-targets" height="100"></canvas>
  </div>

  <!-- KEY FACTS ROW -->
  <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:16px;">
    <div style="background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:16px;text-align:center;">
      <div style="font-family:var(--font-head);font-size:22px;font-weight:800;color:var(--accent);">532 PJ</div>
      <div style="font-size:10px;color:var(--text3);margin-top:4px;">Total Energy Consumption FY 2079/80</div>
    </div>
    <div style="background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:16px;text-align:center;">
      <div style="font-family:var(--font-head);font-size:22px;font-weight:800;color:var(--accent3);">2,684 MW</div>
      <div style="font-size:10px;color:var(--text3);margin-top:4px;">Total Installed Hydro Capacity 2023</div>
    </div>
    <div style="background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:16px;text-align:center;">
      <div style="font-family:var(--font-head);font-size:22px;font-weight:800;color:var(--green);">98%</div>
      <div style="font-size:10px;color:var(--text3);margin-top:4px;">Household Electrification Rate</div>
    </div>
    <div style="background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:16px;text-align:center;">
      <div style="font-family:var(--font-head);font-size:22px;font-weight:800;color:var(--orange);">63.87%</div>
      <div style="font-size:10px;color:var(--text3);margin-top:4px;">Traditional Biomass Share</div>
    </div>
  </div>
  `;
}

function renderReferences(){
  return `
  <div class="accuracy-banner">
    <div class="accuracy-icon">✅</div>
    <div class="accuracy-text">
      <strong style="color:var(--green);">Accuracy Statement:</strong> All content in this study hub is sourced directly from:
      (1) KU MEEG 328 official lecture slides by <strong>Prof. Sunil Prasad Lohani, PhD</strong>,
      (2) Government of Nepal official reports (WECS, AEPC, NEA), and
      (3) internationally recognized textbooks. Every formula, statistic, and concept is cross-referenced.
      Where data may have been updated since publication, the source year is clearly indicated.
    </div>
  </div>

  <div class="ref-section" style="margin-bottom:14px;">
    <div class="ref-title">🎓 Course Information</div>
    <div class="ref-list">
      <div class="ref-item"><strong>Course:</strong> MEEG 328 — Renewable Energy | Credit: 3 | KU BE Mechanical Engineering, Year III Sem I</div>
      <div class="ref-item"><strong>Instructor:</strong> Prof. Sunil Prasad Lohani, PhD — Kathmandu University, Department of Mechanical Engineering</div>
      <div class="ref-item"><strong>Exam Pattern:</strong> Section A (MCQ/Fill-blank, 20-30 marks) + Section B (Short answer) + Section C (Long answer, 55 marks). Total: 50-75 marks depending on year.</div>
    </div>
  </div>

  <div class="ref-section" style="margin-bottom:14px;">
    <div class="ref-title">📊 Official Government Reports (Nepal)</div>
    <div class="ref-list">
      <div class="ref-item"><strong>WECS (2024).</strong> Energy Sector Synopsis Report FY 2079/80. Water and Energy Commission Secretariat, Government of Nepal. <span class="trust-badge wecs">Primary Source</span></div>
      <div class="ref-item"><strong>WECS (2023).</strong> Energy Sector Synopsis Report FY 2078/79. WECS, GoN. [Sectoral breakdown data: residential 60.75%, industrial 20.91%, etc.]</div>
      <div class="ref-item"><strong>AEPC (2023).</strong> Progress at a Glance: Year in Review FY 2079/80. Alternative Energy Promotion Centre, GoN. [Solar home systems, ICS, biogas statistics]</div>
      <div class="ref-item"><strong>NEA (2023).</strong> Annual Report 2023. Nepal Electricity Authority. [Hydropower installed capacity: 2,538 MW; generation data]</div>
      <div class="ref-item"><strong>CBS (2021).</strong> National Population and Housing Census 2021. Central Bureau of Statistics, GoN. [Household cooking fuel data: firewood 51.02%, LPG 44.29%]</div>
      <div class="ref-item"><strong>MoF (2024).</strong> Economic Survey 2022/23. Ministry of Finance, GoN.</div>
    </div>
  </div>

  <div class="ref-section" style="margin-bottom:14px;">
    <div class="ref-title">🌍 International Organizations</div>
    <div class="ref-list">
      <div class="ref-item"><strong>IEA (2023).</strong> World Energy Outlook 2023. International Energy Agency. <span class="trust-badge iea">IEA</span></div>
      <div class="ref-item"><strong>IEA (2023).</strong> World Total Final Consumption by Source, 1971-2019. IEA Statistics.</div>
      <div class="ref-item"><strong>IRENA (2021).</strong> Renewable Power Generation Costs in 2021. International Renewable Energy Agency.</div>
      <div class="ref-item"><strong>World Energy Council.</strong> Energy Trilemma Index. [Used for energy security-equity-sustainability framework]</div>
    </div>
  </div>

  <div class="ref-section" style="margin-bottom:14px;">
    <div class="ref-title">📖 Recommended Textbooks (Course References)</div>
    <div class="ref-list">
      <div class="ref-item"><strong>Duffie, J.A. & Beckman, W.A. (2013).</strong> Solar Engineering of Thermal Processes, 4th Ed. Wiley. <span class="trust-badge textbook">Solar Thermal</span> [HWB equation, collector efficiency, solar geometry]</div>
      <div class="ref-item"><strong>Masters, G.M. (2004).</strong> Renewable and Efficient Electric Power Systems. Wiley-IEEE Press. [PV system design, wind power, battery sizing]</div>
      <div class="ref-item"><strong>Quaschning, V. (2016).</strong> Understanding Renewable Energy Systems, 2nd Ed. Earthscan/Routledge. [Comprehensive RE technologies overview]</div>
      <div class="ref-item"><strong>Twidell, J. & Weir, T. (2015).</strong> Renewable Energy Resources, 3rd Ed. Routledge. [Wind energy, solar thermal, hydropower]</div>
      <div class="ref-item"><strong>Bridgwater, A.V. (2012).</strong> Review of fast pyrolysis of biomass. Bioresource Technology. [Pyrolysis modes, product distribution]</div>
      <div class="ref-item"><strong>Basu, P. (2010).</strong> Biomass Gasification and Pyrolysis. Academic Press. [Gasifier types, syngas composition, design]</div>
      <div class="ref-item"><strong>Werner, M. & Scholz, C. (2013).</strong> Biogas: Production and Applications. [Anaerobic digestion biochemistry, digester design]</div>
      <div class="ref-item"><strong>Lohani, S.P. et al. (2021).</strong> Waste to Energy in Kathmandu Nepal. Sustainable Development Journal. [Nepal-specific data, published by course instructor]</div>
    </div>
  </div>

  <div class="ref-section" style="margin-bottom:14px;">
    <div class="ref-title">📝 Past Exam Papers Used</div>
    <div class="ref-list">
      <div class="ref-item"><strong>Dec 2022</strong> — End Semester Examination, MEEG 328 (FM: 50 marks). Section A: 20 MCQ × 0.5 marks. Section B: 31 marks. Section C: 9 marks.</div>
      <div class="ref-item"><strong>Jul/Aug 2024</strong> — End Semester Examination, MEEG 328 (FM: 75 marks). Section A: 10 MCQ × 1 mark. Section B: 10 Fill-blank × 1 mark. Section C: 55 marks.</div>
      <div class="ref-item"><strong>Jul 2025</strong> — End Semester Examination, MEEG 328 (FM: 55 marks). Section B: 55 marks (long answer).</div>
    </div>
  </div>

  <div style="background:rgba(251,191,36,0.06);border:1px solid rgba(251,191,36,0.2);border-radius:10px;padding:14px 16px;margin-top:8px;">
    <div style="font-family:var(--font-head);font-size:13px;font-weight:700;color:var(--yellow);margin-bottom:8px;">⚠️ Disclaimer</div>
    <div style="font-size:12px;color:var(--text2);line-height:1.65;">
      This study hub is a supplementary learning resource compiled from official KU lecture materials and authoritative references. 
      While every effort has been made for accuracy, students should always cross-verify numerical answers with lecture slides and 
      reference textbooks, especially for design problems where specific data tables from the exam appendix are required. 
      Energy statistics (Nepal) change annually — always check the latest WECS report for current data.
    </div>
  </div>
  `;


}

function typesettMath(){
  if(window.MathJax && MathJax.typesetPromise){
    MathJax.typesetPromise().catch(err => console.log('MathJax error:', err));
  }
}

function initAnswerCharts(){
  if(typeof Chart === 'undefined') return;
  Chart.defaults.color = '#7a9ab0';
  Chart.defaults.font.family = "'DM Sans', sans-serif";
  Chart.defaults.font.size = 11;

  // ── Biochemical Pathway — horizontal flow bar ──
  const bcCtx = document.getElementById('ch-biochem');
  if(bcCtx && !bcCtx._chartjs){
    new Chart(bcCtx, {
      type: 'bar',
      data: {
        labels: ['Hydrolysis','Acidogenesis','Acetogenesis','Methanogenesis'],
        datasets: [{
          label: 'Complexity of molecules',
          data: [90, 65, 40, 20],
          backgroundColor: ['rgba(34,211,160,0.7)','rgba(56,189,248,0.7)','rgba(167,139,250,0.7)','rgba(251,191,36,0.7)'],
          borderColor: ['#22d3a0','#38bdf8','#a78bfa','#fbbf24'],
          borderWidth: 2, borderRadius: 8,
        }]
      },
      options: {
        indexAxis: 'y', responsive: true,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: ctx => {
            const labels = ['Polymers → Monomers (sugars, amino acids, fatty acids)',
              'Monomers → Volatile Fatty Acids + CO₂ + H₂',
              'VFAs → Acetic acid + H₂ (acetogenic bacteria)',
              'CH₃COOH → CH₄ + CO₂  ← RATE-LIMITING STEP'];
            return labels[ctx.dataIndex];
          }}}
        },
        scales: {
          x: { display: false },
          y: { grid: { display: false }, ticks: { font: { size: 12, weight: '600' } } }
        }
      }
    });
  }

  // ── Solar Collector — stacked bar showing energy split ──
  const fcCtx = document.getElementById('ch-collector');
  if(fcCtx && !fcCtx._chartjs){
    new Chart(fcCtx, {
      type: 'bar',
      data: {
        labels: ['Incident Solar (G × Ac)','Collector Output (η = 60%)','System Losses (20%)','Useful Heat to Load'],
        datasets: [{
          label: 'Energy (kWh/day)',
          data: [96, 57.7, 11.5, 46.2],
          backgroundColor: ['rgba(251,191,36,0.7)','rgba(34,211,160,0.7)','rgba(248,113,113,0.6)','rgba(56,189,248,0.7)'],
          borderColor: ['#fbbf24','#22d3a0','#f87171','#38bdf8'],
          borderWidth: 2, borderRadius: 6,
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: ctx => ' ' + ctx.parsed.y.toFixed(1) + ' kWh/day (for 1200L example)' }}
        },
        scales: {
          x: { grid: { color: '#1a2530' }, ticks: { font: { size: 10 } } },
          y: { grid: { color: '#1a2530' }, ticks: { callback: v => v + ' kWh' }, title: { display: true, text: 'Energy (kWh/day)', color: '#4a5470' } }
        }
      }
    });
  }

  // ── Wind Speed Profile — line chart with height on Y ──
  const wpCtx = document.getElementById('ch-windprofile');
  if(wpCtx && !wpCtx._chartjs){
    const heights = [10, 20, 30, 50, 80, 100];
    const speeds = heights.map(h => +(5 * Math.pow(h/10, 0.20)).toFixed(2));
    const powers = speeds.map(v => +(0.5 * 1.225 * Math.pow(v, 3)).toFixed(1));
    new Chart(wpCtx, {
      type: 'line',
      data: {
        labels: heights.map(h => h + ' m'),
        datasets: [
          {
            label: 'Wind Speed (m/s)',
            data: speeds,
            borderColor: '#22d3a0', backgroundColor: 'rgba(34,211,160,0.1)',
            fill: true, tension: 0.4, pointRadius: 5,
            pointBackgroundColor: '#22d3a0', yAxisID: 'y',
          },
          {
            label: 'Power Density (W/m²)',
            data: powers,
            borderColor: '#fbbf24', backgroundColor: 'rgba(251,191,36,0.05)',
            fill: false, tension: 0.4, pointRadius: 5,
            pointBackgroundColor: '#fbbf24', borderDash: [5,3], yAxisID: 'y2',
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'top', labels: { boxWidth: 10, padding: 14 } },
          tooltip: { mode: 'index' }
        },
        scales: {
          x: { grid: { color: '#1a2530' }, title: { display: true, text: 'Height above ground', color: '#4a5470' } },
          y: { grid: { color: '#1a2530' }, title: { display: true, text: 'Wind Speed (m/s)', color: '#22d3a0' }, position: 'left' },
          y2: { grid: { display: false }, title: { display: true, text: 'Power Density (W/m²)', color: '#fbbf24' }, position: 'right' }
        }
      }
    });
  }

  // ── Pyrolysis Products — grouped bar by mode ──
  const pyCtx = document.getElementById('ch-pyrolysis');
  if(pyCtx && !pyCtx._chartjs){
    new Chart(pyCtx, {
      type: 'bar',
      data: {
        labels: ['Slow Pyrolysis (300-400°C)', 'Fast Pyrolysis (500°C, <2s)', 'Flash Pyrolysis (>600°C)', 'Gasification (limited O₂)', 'Combustion (excess O₂)'],
        datasets: [
          { label: 'Bio-oil (%)', data: [30, 75, 70, 5, 0], backgroundColor: 'rgba(56,189,248,0.75)', borderColor: '#38bdf8', borderWidth: 2, borderRadius: 5 },
          { label: 'Biochar (%)', data: [35, 12, 15, 10, 5], backgroundColor: 'rgba(251,191,36,0.75)', borderColor: '#fbbf24', borderWidth: 2, borderRadius: 5 },
          { label: 'Gas (%)', data: [35, 13, 15, 85, 95], backgroundColor: 'rgba(34,211,160,0.75)', borderColor: '#22d3a0', borderWidth: 2, borderRadius: 5 },
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'top', labels: { boxWidth: 10, padding: 14 } },
          tooltip: { mode: 'index', callbacks: { label: ctx => ' ' + ctx.dataset.label + ': ' + ctx.parsed.y + '%' } }
        },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 9.5 } } },
          y: { stacked: false, grid: { color: '#1a2530' }, ticks: { callback: v => v + '%' }, max: 100 }
        }
      }
    });
  }

  // ── IV Curve — solar cell at 25°C and 60°C ──
  const ivCtx = document.getElementById('ch-ivcurve');
  if(ivCtx && !ivCtx._chartjs){
    // Generate IV curve points using diode equation
    const genIV = (Isc, Voc, n=1.3) => {
      const pts = [];
      for(let v=0; v<=Voc; v+=Voc/60){
        const i = Math.max(0, Isc*(1 - Math.exp((v-Voc)/(n*0.026))+Math.exp(-Voc/(n*0.026))));
        pts.push({x: +v.toFixed(3), y: +i.toFixed(3)});
      }
      return pts;
    };
    const iv25 = genIV(8.5, 37.2);   // STC 25°C
    const iv60 = genIV(8.7, 33.5);   // 60°C — Voc drops ~3.7V (35×2.3mV×46 cells ÷ 1000 × 46)

    // Find Pmax point for 25°C
    let pmaxIdx = 0, pmaxVal = 0;
    iv25.forEach((p,i) => { const pw = p.x*p.y; if(pw>pmaxVal){pmaxVal=pw; pmaxIdx=i;} });
    const pmax25 = iv25[pmaxIdx];

    // Create horizontal/vertical reference lines as extra datasets
    const iscLine = iv25.slice(0,2).map((p,i) => ({x: i===0?0:37.2, y: 8.5}));
    const vocLine = [{x:37.2,y:0},{x:37.2,y:0.1}];

    new Chart(ivCtx, {
      type: 'line',
      data: {
        datasets: [
          {
            label: '25°C (STC)',
            data: iv25,
            borderColor: '#22d3a0',
            backgroundColor: 'rgba(34,211,160,0.08)',
            fill: true, tension: 0, pointRadius: 0, borderWidth: 2.5,
          },
          {
            label: '60°C (Hot Day)',
            data: iv60,
            borderColor: '#f87171',
            backgroundColor: 'transparent',
            fill: false, tension: 0, pointRadius: 0, borderWidth: 2, borderDash: [6,3],
          },
          {
            label: 'Pmax (25°C) = ' + pmaxVal.toFixed(1) + 'W',
            data: [pmax25],
            borderColor: '#fbbf24',
            backgroundColor: '#fbbf24',
            pointRadius: 9, pointStyle: 'star', showLine: false, pointHoverRadius: 11,
          },
          {
            label: 'Isc line',
            data: [{x:0,y:8.5},{x:pmax25.x,y:8.5}],
            borderColor: 'rgba(34,211,160,0.3)',
            borderDash: [3,3], pointRadius: 0, showLine: true, borderWidth: 1,
            fill: false, legend: {display: false},
          },
          {
            label: 'Voc line',
            data: [{x:37.2,y:0},{x:37.2,y:0.3}],
            borderColor: 'rgba(34,211,160,0.3)',
            borderDash: [3,3], pointRadius: 0, showLine: true, borderWidth: 1,
            fill: false,
          },
        ]
      },
      options: {
        responsive: true, parsing: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              boxWidth: 12, padding: 14,
              filter: (item) => !item.text.includes('line'),
            }
          },
          tooltip: {
            callbacks: {
              label: ctx => {
                if(ctx.dataset.label.includes('Pmax')) return ' Pmax = ' + (ctx.parsed.x*ctx.parsed.y).toFixed(1) + ' W at V=' + ctx.parsed.x.toFixed(1) + 'V';
                if(ctx.dataset.label.includes('line')) return null;
                return ' I = ' + ctx.parsed.y.toFixed(2) + ' A  at  V = ' + ctx.parsed.x.toFixed(2) + ' V';
              }
            }
          }
        },
        scales: {
          x: {
            type: 'linear', min: 0, max: 40,
            title: { display: true, text: 'Voltage (V)', color: '#4a5470' },
            grid: { color: '#1a2530' },
            ticks: { callback: v => v + 'V' }
          },
          y: {
            min: 0, max: 10,
            title: { display: true, text: 'Current (A)', color: '#4a5470' },
            grid: { color: '#1a2530' },
            ticks: { callback: v => v + 'A' }
          }
        }
      }
    });
  }

}

// ═══════════════════════════════════════════════════════
//  CHAPTER SUMMARIES — Syllabus + Mind Map + Memcards + Strategy
// ═══════════════════════════════════════════════════════
const chapterSummaries = {

  ch1: {
    hours: 6, totalMarks: '8–11', examFreq: 'Every paper',
    syllabus: [
      { main: '1.1 National & Global Energy Resources', subs: ['Nepal energy mix (firewood 63.87%, hydro, petroleum)', 'Global scenario — IEA data', 'Per capita consumption comparison'] },
      { main: '1.2 Future Energy Requirements', subs: ['Role of renewables in meeting future demand', 'Energy transition pathways', 'Nepal 16th Periodic Plan targets (15,000 MW by 2030)'] },
      { main: '1.3 Energy, Sustainability & Environment', subs: ['Energy Trilemma (security, equity, sustainability)', 'Climate change → COP27 decisions', 'Loss & Damage fund', 'EV barriers in Nepal'] },
      { main: '1.4 National RE Policy & Strategy', subs: ['NDC targets', 'WECS, AEPC roles', 'Renewable Energy Subsidy Policy', 'Hydropower Development Policy'] },
    ],
    memcards: [
      { label:'🔥 Must Know Stat', color:'red', content:'Nepal total energy FY 2079/80: <strong>532 PJ</strong>. Firewood = <strong>63.87%</strong>. RoR hydro = <strong>>90%</strong> of electricity. Population electrified = <strong>98%</strong>.' },
      { label:'⚡ Energy Trilemma', color:'yellow', content:'<strong>Security</strong> (reliable supply) + <strong>Equity</strong> (affordable access) + <strong>Sustainability</strong> (low carbon). Nepal weak on Security due to RoR seasonal dependence.' },
      { label:'📊 Sector Consumption', color:'blue', content:'Residential <strong>60.75%</strong> → Industrial <strong>20.91%</strong> → Transport <strong>10.43%</strong> → Commercial <strong>5.04%</strong> → Construction <strong>1.92%</strong> → Agriculture <strong>0.95%</strong>' },
      { label:'🏛️ COP27 Key Decision', color:'purple', content:'<strong>Loss & Damage Fund</strong> established for vulnerable nations. Nepal NDC: 15% RE by 2030. 1.5°C target barely kept alive — but current INDCs track 2.5–3°C.' },
      { label:'🚗 3 EV Barriers in Nepal', color:'', content:'① High upfront cost (no local assembly) ② Inadequate charging infrastructure outside KTM ③ Seasonal power shortage in dry season (RoR grid)' },
    ],
    strategy: [
      { icon:'🎯', text:'<strong>Section C question guaranteed</strong> — Nepal energy scenario + energy security appears in all 3 papers. Always write: RoR problem → diversity solution → PHES + Solar PV.' },
      { icon:'📝', text:'<strong>COP27 + EV barriers</strong> (Dec 2022, 5 marks) — memorise: Loss & Damage Fund + 3 specific EV barriers with Nepal context.' },
      { icon:'📊', text:'<strong>Use data</strong> — 532 PJ, 63.87%, 98%, 369 kWh/capita. Answers with statistics score higher than vague answers.' },
      { icon:'⏱️', text:'<strong>Time allocation:</strong> 11-mark questions → spend 15-18 min. Write structured answer: define → current status → problem → solution → Nepal relevance.' },
    ],
    keyFormulas: ['Energy Balance: Production + Imports − Exports ± Stock = Consumption', 'Sankey diagram: arrow width ∝ energy quantity'],
    mindmapColor: '#22d3a0',
  },

  ch2: {
    hours: 6, totalMarks: '5–14', examFreq: 'Section B + C',
    syllabus: [
      { main: '2.1.1 Biomass Overview & Applications', subs: ['Types: woody, agricultural residue, animal dung, energy crops, marine', 'Bioenergy applications: heat, electricity, transport fuels'] },
      { main: '2.1.2 Biomass Properties & Composition', subs: ['HHV, LHV — formula and calculation', 'Moisture content, ash content, volatile matter', 'Proximate & ultimate analysis'] },
      { main: '2.1.3 Thermochemical Processes', subs: ['Combustion — direct oxidation, boilers', 'Gasification — partial oxidation, syngas (CO+H₂+CH₄)', 'Pyrolysis — no oxygen, bio-oil+char+gas', 'Torrefaction — mild pyrolysis, solid upgrade'] },
      { main: '2.1.4 Gasifier Types', subs: ['Updraft: high tar, direct heat applications', 'Downdraft: low tar (<1g/Nm³), IC engines', 'Fluidized bed: high throughput, flexible feedstock'] },
      { main: '2.1.5 Improved Cookstoves (ICS)', subs: ['Water Boiling Test — 3 phases (Cold, Hot, Simmering)', 'Types: rocket, TLUD, institutional', 'Nepal: 800,000+ ICS distributed by AEPC'] },
    ],
    memcards: [
      { label:'🔥 LHV Formula — EXAM FAVOURITE', color:'red', content:`
<span class='mc-eq red'>LHV = HHV − h<sub>vap</sub> × (9H + M)</span>
<div class='mc-symbols'>
  <span class='mc-sym'>LHV</span><span class='mc-sym-def'>Lower (Net) Heating Value — usable energy [kJ/kg]</span>
  <span class='mc-sym'>HHV</span><span class='mc-sym-def'>Higher (Gross) Heating Value — total energy [kJ/kg]</span>
  <span class='mc-sym'>h<sub>vap</sub></span><span class='mc-sym-def'>Latent heat of vaporisation = 2.442 MJ/kg (standard) or as given</span>
  <span class='mc-sym'>9H</span><span class='mc-sym-def'>Water from hydrogen combustion (H = hydrogen mass fraction)</span>
  <span class='mc-sym'>M</span><span class='mc-sym-def'>Moisture mass fraction of fuel</span>
</div>
<div class='mc-worked red'>Dec 2022: HHV=1000 kJ/kg, M=0.5, H=0.1, h<sub>vap</sub>=500 kJ/kg<br>LHV = 1000 − 500×(9×0.1+0.5) = 1000 − 700 = <strong>300 kJ/kg</strong></div>
<div class='mc-note'>High moisture destroys LHV. Dry wood: LHV≈16 MJ/kg. Wet dung (70% M): LHV can be near zero.</div>
` },
      { label:'⚡ Gasifier Choice Rule', color:'yellow', content:'<strong>IC Engine?</strong> → Always Downdraft (tar <1g/Nm³)<br><strong>Direct heat?</strong> → Updraft (tar ~50g/Nm³, higher efficiency)<br><strong>Flexible/large scale?</strong> → Fluidized bed' },
      { label:'📊 Pyrolysis 3 Modes', color:'blue', content:'Slow → <strong>Biochar max (~35%)</strong> | Fast → <strong>Bio-oil max (~70-75%)</strong> | Flash → rapid bio-oil. All require NO oxygen. Fast pyrolysis: 400-600°C, <2 sec residence.' },
      { label:'🍳 WBT — NOT Controlled Cooking', color:'purple', content:'WBT phases: ① Cold Start ② Hot Start ③ Simmering<br><strong>"Controlled Cooking" is NOT part of standard WBT</strong> — this was Dec 2022 MCQ Q1.' },
      { label:'🏭 Gasification Superstructure', color:'', content:'Charcoal → Size reduction → Drying → <strong>Downdraft Gasifier</strong> → Cyclone (particles) → Gas Cooler → Wet Scrubber (tar+H₂S) → Filter → IC Engine → 150 kWe' },
    ],
    strategy: [
      { icon:'🎯', text:'<strong>Dec 2022 Section B</strong> = Gasification superstructure design (5 marks). Learn block diagram. Explain feedstock→gasifier choice→cleaning→output.' },
      { icon:'📝', text:'<strong>LHV calculation</strong> — appears in MCQ (Dec 2022 Q20). Formula: LHV = HHV − 2.442×(9H+M). Practice with given values.' },
      { icon:'💡', text:'<strong>Pyrolysis vs Gasification</strong> — know the difference: pyrolysis = no O₂, gasification = limited O₂. Products are completely different.' },
      { icon:'⏱️', text:'Jul 2025 Q4: "List principal biomass conversion technologies + discuss pyrolysis" (6 marks) — list all 6 technologies, then deep dive into pyrolysis modes and applications.' },
    ],
    keyFormulas: ['LHV = HHV − 2.442×(9H + M)', 'Combustion efficiency η = Qu / Q_fuel'],
    mindmapColor: '#fb923c',
  },

  ch3: {
    hours: 6, totalMarks: '11–18', examFreq: 'Every paper — heavy marks',
    syllabus: [
      { main: '2.2.1 Bioenergy from Waste', subs: ['Organic waste as feedstock', 'Nepal: 450,000+ household biogas plants'] },
      { main: '2.2.2 Domestic Biogas Systems', subs: ['Fixed dome (GGC 2047) — most common in Nepal', 'Floating dome — constant pressure', 'Bag digester — portable, short life'] },
      { main: '2.2.3 Biogas Plant Design & Sizing', subs: ['Plant volume: V = W×HRT/(1+rd)', 'Daily biogas: Q = W×yield', 'LPG substitution: 1m³ biogas ≈ 0.45 kg LPG', 'Water requirement: dung:water = 1:1'] },
      { main: '2.2.4 Biochemical Process', subs: ['4 stages: Hydrolysis → Acidogenesis → Acetogenesis → Methanogenesis', 'Optimum pH: 6.8–7.2', 'Optimum temp: 35°C (mesophilic)'] },
      { main: '2.2.5 Large Biogas Systems', subs: ['Commercial plants in Nepal (2 dozen+)', 'Challenges: feedstock supply, pH control, digestate market', 'Opportunities: biomethane, carbon credits'] },
    ],
    memcards: [
      { label:'🔥 Biogas Sizing — MASTER THIS', color:'red', content:`
<span class='mc-eq'>V = 2W × HRT &nbsp; (1:1 dung:water ratio)</span>
<div class='mc-symbols'>
  <span class='mc-sym'>V</span><span class='mc-sym-def'>Digester volume [m³]</span>
  <span class='mc-sym'>W</span><span class='mc-sym-def'>Daily dung input [kg/day] (equal water added → total slurry = 2W kg/day)</span>
  <span class='mc-sym'>HRT</span><span class='mc-sym-def'>Hydraulic Retention Time = 40–60 days (cattle dung in Nepal)</span>
</div>
<span class='mc-eq'>Q<sub>gas</sub> = W × 30 L/kg &nbsp;|&nbsp; m<sub>LPG</sub> = Q<sub>gas</sub>[m³] × 0.45 kg/m³</span>
<div class='mc-symbols'>
  <span class='mc-sym'>30 L/kg</span><span class='mc-sym-def'>Standard biogas yield for cattle dung</span>
  <span class='mc-sym'>0.45 kg/m³</span><span class='mc-sym-def'>LPG equivalent (CV_biogas/CV_LPG = 22/47 ≈ 0.47, practical = 0.45)</span>
</div>
<div class='mc-worked'>500 kg/day, HRT=40 d → V=(2×500×40)/1000=<strong>40 m³</strong> | Q=500×30=15,000 L=15 m³/day | LPG=15×0.45=<strong>6.75 kg/day</strong></div>
` },
      { label:'⚡ 4 AD Stages in Order', color:'yellow', content:'① <strong>Hydrolysis</strong>: polymers→monomers ② <strong>Acidogenesis</strong>: monomers→VFAs ③ <strong>Acetogenesis</strong>: VFAs→acetate ④ <strong>Methanogenesis</strong>: acetate→CH₄+CO₂ (RATE-LIMITING)' },
      { label:'📊 3 Digester Types', color:'blue', content:'<strong>Fixed Dome:</strong> variable pressure, underground, 20+ yr life, most common Nepal<br><strong>Floating Dome:</strong> constant pressure, steel drum corrodes<br><strong>Bag:</strong> cheapest, 2-5 yr life, portable' },
      { label:'🌡️ pH & Temperature', color:'purple', content:'Optimum pH: <strong>6.8–7.2</strong>. Below 6 → acidification → methanogens die → digester fails.<br>Optimum temp: <strong>35°C mesophilic</strong>. Nepal challenge: cold winters reduce gas production.' },
      { label:'💧 Biogas vs LPG', color:'', content:`
<span class='mc-eq'>1 m³ biogas ≈ 0.45 kg LPG &nbsp; (CV<sub>biogas</sub>/CV<sub>LPG</sub> = 22/47)</span>
<div class='mc-symbols'>
  <span class='mc-sym'>CV<sub>biogas</sub></span><span class='mc-sym-def'>Calorific value of biogas = 22 MJ/m³ (varies with CH₄ %)</span>
  <span class='mc-sym'>CV<sub>LPG</sub></span><span class='mc-sym-def'>Calorific value of LPG = 47 MJ/kg</span>
  <span class='mc-sym'>Composition</span><span class='mc-sym-def'>Biogas: 55–70% CH₄ + 30–45% CO₂ + trace H₂S</span>
  <span class='mc-sym'>Pressure</span><span class='mc-sym-def'>Fixed dome: 4–8 mbar (variable) | Floating dome: constant</span>
</div>
<div class='mc-note'>Why 0.45 and not 0.47? 5% efficiency loss assumed in burner comparison. Use 0.45 in all KU calculations.</div>
` },
    ],
    strategy: [
      { icon:'🎯', text:'<strong>Highest marks chapter</strong> — biogas sizing appears in EVERY paper. The 11+6-mark question in Jul 2024 is a full design problem. Practice the 5-step calculation until automatic.' },
      { icon:'📝', text:'<strong>Digester types (Dec 2022, 3 marks)</strong> — give 2 differences between each pair. Focus on pressure type and material, not just general description.' },
      { icon:'💡', text:'<strong>Biochemical process (Jul 2025, 11 marks)</strong> — draw the pathway diagram. 4 stages + 2 methanogenesis pathways (acetotrophic + hydrogenotrophic).' },
      { icon:'⏱️', text:'For 6-mark design problems: always show ALL 5 steps (slurry, volume, water, biogas, LPG) even if only asked for some — shows understanding and gets partial marks.' },
    ],
    keyFormulas: ['V = W×HRT/(1+rd) [m³]', 'Q_biogas = W × Y_biogas', 'LPG = Q × 0.45 [kg/day]'],
    mindmapColor: '#22d3a0',
  },

  ch4: {
    hours: 6, totalMarks: '5–11', examFreq: 'Section B + C',
    syllabus: [
      { main: '2.3.1 Active & Passive Solar', subs: ['Active: flat plate collector, pump/controls', 'Passive: thermosyphon, natural convection', 'Building integration: trombe walls, skylights'] },
      { main: '2.3.2 Solar Geometry & Irradiation', subs: ['Declination δ = 23.45°sin[360/365×(284+n)]', 'Hour angle ω = (solar time−12)×15°/hr', 'Zenith angle cos θz = sinφsinδ + cosφcosδcosω', 'Solar time vs Standard time, Equation of Time'] },
      { main: '2.3.3 Solar Utilization in Buildings', subs: ['Solar fraction, solar load ratio', 'Orientation and tilt optimisation', 'Shading and inter-row spacing'] },
      { main: '2.3.4 Collector Design Mathematics', subs: ['HWB equation: η = FR[τα − UL(Ti−Ta)/G]', 'Collector area sizing: Ac = Q_demand/(G×η_sys×η_coll)', 'Useful heat: Qu = ṁCp(To−Ti)'] },
      { main: '2.3.5 Solar Energy Storage', subs: ['Hot water storage tanks', 'Stratification', 'Rock bed storage for space heating'] },
    ],
    memcards: [
      { label:'🔥 HWB Equation — CORE FORMULA', color:'', content:`
<span class='mc-eq'>η = F<sub>R</sub>[τα − U<sub>L</sub>(T<sub>i</sub> − T<sub>a</sub>)/G]</span>
<div class='mc-symbols'>
  <span class='mc-sym'>η</span><span class='mc-sym-def'>Collector thermal efficiency (0–1)</span>
  <span class='mc-sym'>F<sub>R</sub></span><span class='mc-sym-def'>Heat Removal Factor = 0.80–0.95 (heat transfer from absorber to fluid)</span>
  <span class='mc-sym'>τα</span><span class='mc-sym-def'>Transmittance-absorptance product = 0.70–0.90 (optical efficiency)</span>
  <span class='mc-sym'>U<sub>L</sub></span><span class='mc-sym-def'>Overall heat loss coefficient = 3–8 W/m²K</span>
  <span class='mc-sym'>T<sub>i</sub></span><span class='mc-sym-def'>Fluid inlet temperature [°C]</span>
  <span class='mc-sym'>T<sub>a</sub></span><span class='mc-sym-def'>Ambient temperature [°C]</span>
  <span class='mc-sym'>G</span><span class='mc-sym-def'>Solar irradiance on collector plane [W/m²]</span>
</div>
<div class='mc-note'>Plot η vs (T<sub>i</sub>−T<sub>a</sub>)/G → straight line. Y-intercept = F<sub>R</sub>τα. Slope = −F<sub>R</sub>U<sub>L</sub> (NEGATIVE).</div>
` },
      { label:'⚡ Collector Area Formula', color:'', content:`
<span class='mc-eq'>A<sub>c</sub> = Q<sub>demand</sub> / (G × η<sub>sys</sub> × η<sub>coll</sub>)</span>
<div class='mc-symbols'>
  <span class='mc-sym'>A<sub>c</sub></span><span class='mc-sym-def'>Required collector area [m²]</span>
  <span class='mc-sym'>Q<sub>demand</sub></span><span class='mc-sym-def'>Daily heat load = ṁ × C<sub>p</sub> × ΔT [kWh/day]<br>&nbsp;&nbsp;&nbsp;&nbsp;ṁ [kg/day], C<sub>p</sub>=4.18 kJ/kg·K, ΔT=T<sub>hot</sub>−T<sub>cold</sub> [°C]</span>
  <span class='mc-sym'>G</span><span class='mc-sym-def'>Daily solar irradiation [kWh/m²/day]</span>
  <span class='mc-sym'>η<sub>sys</sub></span><span class='mc-sym-def'>System efficiency (piping/storage losses) — given or 0.80</span>
  <span class='mc-sym'>η<sub>coll</sub></span><span class='mc-sym-def'>Collector efficiency — given or from HWB equation</span>
</div>
<div class='mc-worked'>1200 L/day, ΔT=45°C, G=4, η<sub>sys</sub>=0.8, η<sub>coll</sub>=0.6:<br>Q=1.2×4.18×45=22.6 MJ=6.28 kWh/m² per m² | wait: Q<sub>total</sub>=1200×4.18×45/3600=<strong>62.7 kWh/day</strong><br>A<sub>c</sub>=62.7/(4×0.8×0.6)=<strong>32.7 m²</strong></div>
` },
      { label:'📐 Solar Geometry Quick Ref', color:'', content:`
<span class='mc-eq'>δ = 23.45° sin[360/365 × (284+n)]</span>
<div class='mc-symbols'>
  <span class='mc-sym'>δ</span><span class='mc-sym-def'>Solar declination [°] — ±23.45° (summer/winter solstice)</span>
  <span class='mc-sym'>n</span><span class='mc-sym-def'>Day number (Jan 1=1, Dec 21≈355)</span>
</div>
<span class='mc-eq'>ω = (Solar Time − 12) × 15° &nbsp;|&nbsp; Solar noon: ω = 0°</span>
<div class='mc-symbols'>
  <span class='mc-sym'>ω</span><span class='mc-sym-def'>Hour angle [°] — morning = negative, afternoon = positive</span>
</div>
<span class='mc-eq'>cos θ<sub>z</sub> = sin φ sin δ + cos φ cos δ cos ω</span>
<div class='mc-symbols'>
  <span class='mc-sym'>θ<sub>z</sub></span><span class='mc-sym-def'>Solar zenith angle (0° = sun directly overhead)</span>
  <span class='mc-sym'>φ</span><span class='mc-sym-def'>Latitude [°] — Kathmandu = 27.7°N</span>
</div>
<div class='mc-note'>Winter solstice δ=−23.45°. Equinox δ=0°. Summer solstice δ=+23.45°</div>
` },
      { label:'♻️ Thermosyphon — No Pump!', color:'purple', content:'Natural convection only. <strong>Hot water rises, cold sinks.</strong> Tank MUST be above collector (≥300mm). Thermal circuit: Q = ΔT/R_thermal. Good for off-grid Nepal.' },
      { label:'📏 Row Spacing (5MW PV plant)', color:'', content:`
<span class='mc-eq'>D = h / tan(α<sub>min</sub>) &nbsp;|&nbsp; Pitch = L·cos β + D</span>
<div class='mc-symbols'>
  <span class='mc-sym'>D</span><span class='mc-sym-def'>Minimum shadow-free gap between rows [m]</span>
  <span class='mc-sym'>h</span><span class='mc-sym-def'>Vertical height of module = L·sin β [m]</span>
  <span class='mc-sym'>L</span><span class='mc-sym-def'>Module length [m] — here 2.2 m</span>
  <span class='mc-sym'>β</span><span class='mc-sym-def'>Tilt angle ≈ latitude = 27°</span>
  <span class='mc-sym'>α<sub>min</sub></span><span class='mc-sym-def'>Min solar altitude = 90° − φ − 23.45° (winter solstice) = 39.55°</span>
</div>
<div class='mc-worked'>h = 2.2×sin27° = 1.0 m | D = 1.0/tan(39.55°) = 1.21 m<br>Pitch = 2.2×cos27° + 1.21 = 1.96 + 1.21 = <strong>3.17 m</strong></div>
` },
    ],
    strategy: [
      { icon:'🎯', text:'<strong>Jul 2025 Q1 (11 marks)</strong> = flat plate collector principle (6m) + PV row spacing calculation (5m). Hybrid question — master both topics together.' },
      { icon:'📝', text:'<strong>Collector area calculation</strong> (Jul 2024, 5 marks) — 3-step: Q_demand → Q_available per m² → Area. Show units clearly in every step.' },
      { icon:'💡', text:'<strong>Solar geometry</strong> — know all 3 formulas (δ, ω, θz). They appear as MCQs and in row spacing calculations. Understand WHAT each parameter means physically.' },
      { icon:'⏱️', text:'Thermosyphon question (Dec 2022, 3 marks) — draw the electrically analogous circuit: thermal resistances in series, Q=ΔT/Rtotal, analogous to V=IR.' },
    ],
    keyFormulas: ['η = FR[τα − UL(Ti−Ta)/G]', 'Ac = Q_demand/(G×η_sys×η_coll)', 'δ = 23.45°sin[360/365×(284+n)]'],
    mindmapColor: '#fbbf24',
  },

  ch5: {
    hours: 6, totalMarks: '11–23', examFreq: 'Every paper — heaviest marks',
    syllabus: [
      { main: '2.4.1 Applications of Solar PV', subs: ['Grid-tied, off-grid, hybrid systems', 'PV pumping, solar home systems', 'Global status: >1 TW installed worldwide'] },
      { main: '2.4.2 PV Working Principle', subs: ['Photovoltaic effect — p-n junction', 'IV characteristics: Isc, Voc, Pmax, FF', 'Temperature effect: Voc↓ −2.3mV/°C, efficiency↓ 0.45%/°C'] },
      { main: '2.4.3 Global Status & Prospects', subs: ['Learning curve: 25% cost reduction per doubling', 'Solar PV is now cheapest new electricity source', 'India, China, USA leading markets'] },
      { main: '2.4.4 Three Generations of PV', subs: ['1st gen: c-Si (mono/poly), 18-24%, 80%+ market', '2nd gen: thin film (CdTe, CIGS), 8-15%', '3rd gen: multi-junction, perovskite, 30-46%'] },
      { main: '2.4.5 Grid-tied & Off-grid Systems', subs: ['Grid-tied: no battery, export surplus', 'Off-grid: battery bank, charge controller', 'Hybrid: both grid and battery'] },
      { main: '2.4.6 PV System Design', subs: ['Array sizing: P_PV = load/PR/G', 'Battery: Ah = E×N/(V×DOD)', 'PV pump: P_PV = ρgHV/(η×t×LMF×DF)', 'Inverter, charge controller sizing'] },
    ],
    memcards: [
      { label:'🔥 PV Pump Formula — Dec 2022 + Jul 2024', color:'', content:`
<span class='mc-eq'>E<sub>h</sub> = ρgHV &nbsp;→&nbsp; P<sub>pump</sub> = E<sub>h</sub>/(η<sub>p</sub>×PSH) &nbsp;→&nbsp; P<sub>PV</sub> = P<sub>pump</sub>/(LMF×DF)</span>
<div class='mc-symbols'>
  <span class='mc-sym'>E<sub>h</sub></span><span class='mc-sym-def'>Daily hydraulic energy [Wh/day] = ρ×g×H×V</span>
  <span class='mc-sym'>ρ</span><span class='mc-sym-def'>Water density = 1000 kg/m³</span>
  <span class='mc-sym'>g</span><span class='mc-sym-def'>9.81 m/s²</span>
  <span class='mc-sym'>H</span><span class='mc-sym-def'>Total Dynamic Head [m] (vertical lift + friction losses)</span>
  <span class='mc-sym'>V</span><span class='mc-sym-def'>Daily water volume [m³/day] = population × L/person/day ÷ 1000</span>
  <span class='mc-sym'>η<sub>p</sub></span><span class='mc-sym-def'>Pump efficiency (given, e.g. 0.60)</span>
  <span class='mc-sym'>PSH</span><span class='mc-sym-def'>Peak Sun Hours [h/day] = daily insolation [kWh/m²/day]</span>
  <span class='mc-sym'>LMF</span><span class='mc-sym-def'>Load Mismatching Factor = 0.75–0.90 (given 0.8)</span>
  <span class='mc-sym'>DF</span><span class='mc-sym-def'>Derating Factor = 0.85–0.95 (temp + soiling, given 0.9)</span>
</div>
<div class='mc-worked yellow'>Pop=2500, 60L/day, H=220.5m, η=0.6, PSH=4.6, LMF=0.8, DF=0.9<br>V=150 m³ | E<sub>h</sub>=1000×9.81×220.5×150=90 kWh | P<sub>pump</sub>=90/(0.6×4.6)=32.6kW | <strong>P<sub>PV</sub>=45.3 kWp</strong></div>
` },
      { label:'⚡ IV Curve — Temperature Effect', color:'yellow', content:'Isc → slightly increases (+0.06%/°C)<br>Voc → <strong>decreases −2.3mV/°C per cell</strong> (dominant effect)<br>Net: efficiency <strong>drops ~0.45%/°C</strong> above 25°C (STC)' },
      { label:'🔋 Battery Sizing', color:'', content:`
<span class='mc-eq'>Ah = (E<sub>daily</sub> × N<sub>auto</sub>) / (V<sub>sys</sub> × DOD × η<sub>bat</sub>)</span>
<div class='mc-symbols'>
  <span class='mc-sym'>Ah</span><span class='mc-sym-def'>Required battery capacity [Ampere-hours]</span>
  <span class='mc-sym'>E<sub>daily</sub></span><span class='mc-sym-def'>Daily energy load [Wh/day]</span>
  <span class='mc-sym'>N<sub>auto</sub></span><span class='mc-sym-def'>Days of autonomy without sun (typically 2–5 days)</span>
  <span class='mc-sym'>V<sub>sys</sub></span><span class='mc-sym-def'>System voltage [V] — 12V, 24V, or 48V</span>
  <span class='mc-sym'>DOD</span><span class='mc-sym-def'>Depth of Discharge — Li-ion: 0.80 | Lead-acid: 0.50</span>
  <span class='mc-sym'>η<sub>bat</sub></span><span class='mc-sym-def'>Battery efficiency ≈ 0.85–0.95 (often omitted in KU, assume 1.0)</span>
</div>
<div class='mc-worked'>E=2000 Wh/day, N=3 days, V=12V, DOD=0.8:<br>Ah=(2000×3)/(12×0.8)=<strong>625 Ah</strong> &nbsp;|&nbsp; with η=0.9: <strong>694 Ah</strong></div>
` },
      { label:'📊 Fill Factor', color:'', content:`
<span class='mc-eq'>FF = P<sub>max</sub> / (I<sub>sc</sub> × V<sub>oc</sub>)</span>
<div class='mc-symbols'>
  <span class='mc-sym'>FF</span><span class='mc-sym-def'>Fill Factor — cell quality metric (dimensionless, 0 → 1)</span>
  <span class='mc-sym'>P<sub>max</sub></span><span class='mc-sym-def'>Maximum power point [W] = I<sub>mp</sub> × V<sub>mp</sub></span>
  <span class='mc-sym'>I<sub>sc</sub></span><span class='mc-sym-def'>Short-circuit current [A] — max current (at V = 0)</span>
  <span class='mc-sym'>V<sub>oc</sub></span><span class='mc-sym-def'>Open-circuit voltage [V] — max voltage (at I = 0)</span>
</div>
<span class='mc-eq'>η<sub>cell</sub> = FF × I<sub>sc</sub> × V<sub>oc</sub> / (G × A<sub>cell</sub>)</span>
<div class='mc-symbols'>
  <span class='mc-sym'>G</span><span class='mc-sym-def'>Irradiance [W/m²] | A<sub>cell</sub> = cell area [m²]</span>
</div>
<div class='mc-note'>Good cell: FF &gt; 0.75 | Commercial Si: 0.75–0.82 | Low FF → high series resistance (bad contacts) or low shunt resistance (leakage)</div>
` },
      { label:'🏭 Namche PV System (Dec 2022)', color:'', content:`
<span class='mc-eq'>Design sequence for standalone PV system:</span>
<div class='mc-symbols'>
  <span class='mc-sym'>① Load</span><span class='mc-sym-def'>E<sub>daily</sub> = Σ(P<sub>load</sub> × t) [Wh/day] — sum all appliances × hours</span>
  <span class='mc-sym'>② PV array</span><span class='mc-sym-def'>P<sub>PV</sub> = E<sub>daily</sub> / (PSH × PR) where PR = performance ratio ≈ 0.75</span>
  <span class='mc-sym'>③ Battery</span><span class='mc-sym-def'>Ah = (E<sub>daily</sub> × N<sub>auto</sub>) / (V<sub>sys</sub> × DOD) — see battery card</span>
  <span class='mc-sym'>④ Inverter</span><span class='mc-sym-def'>P<sub>inv</sub> = P<sub>peak load</sub> × 1.25 [W] — 25% oversize safety factor</span>
  <span class='mc-sym'>⑤ Config</span><span class='mc-sym-def'>Modules in series = V<sub>sys</sub>/V<sub>module</sub> | Strings in parallel = P<sub>PV</sub>/(P<sub>mod</sub>×N<sub>series</sub>)</span>
</div>
<div class='mc-worked'>Dec 2022 Namche: Find load for year 5 (growth factor) → battery Ah → inverter size → PV array configuration with series-parallel diagram.</div>
` },
    ],
    strategy: [
      { icon:'🎯', text:'<strong>Heaviest chapter</strong> — 23 marks in Dec 2022 (Namche PV design). Jul 2024 = 11 marks (PV pump sizing). PV design appears in EVERY paper.' },
      { icon:'📝', text:'<strong>Show ALL steps</strong> in PV pump: hydraulic energy → pump power → PV power. Each step is worth marks even if final answer is wrong.' },
      { icon:'💡', text:'<strong>IV characteristics</strong> — draw the curve with Isc, Voc, Pmax labelled. Show two curves (25°C vs 60°C) with Voc shift leftward.' },
      { icon:'⏱️', text:'Section B (Jul 2024) has FITB on solar PV: 100Wp × 1825 kWh/m²/yr = 182.5 kWh/yr. Capacity factor = 15-20%. Know these numbers cold.' },
    ],
    keyFormulas: ['P_PV = ρgHV/(η×PSH×LMF×DF)', 'Ah = E×N/(V×DOD×η)', 'FF = Pmax/(Isc×Voc)', 'CF = E_annual/(P_rated×8760)'],
    mindmapColor: '#38bdf8',
  },

  ch6: {
    hours: 4, totalMarks: '6–11', examFreq: 'Section B + C',
    syllabus: [
      { main: '2.5.1 Wind Energy Overview', subs: ['Cause of wind: differential heating', 'Global wind systems: Hadley cell, trade winds', 'Nepal wind resource: Mustang, Myagdi, Jumla'] },
      { main: '2.5.2 Types of Wind Turbines', subs: ['HAWT: higher efficiency, yaw drive needed, dominant', 'VAWT: omni-directional, no yaw, lower efficiency', 'Number of blades: 3-blade most common'] },
      { main: '2.5.3 Wind Power Generation', subs: ['P = ½ρAv³', 'Betz limit: 16/27 = 59.3% max', 'Power coefficient Cp = P_turbine/P_wind', 'Cut-in (3-5m/s), rated (11-13m/s), cut-out (25m/s)'] },
      { main: '2.5.4 Wind Resource Assessment', subs: ['3 key params: speed, direction, turbulence', 'Power law: v₂/v₁ = (h₂/h₁)^α', 'Minimum 12 months measurement', 'Standard heights: 10m, 50m, 80m, 100m'] },
      { main: '2.5.5 Wind Farm Design', subs: ['Spacing: 5-7D crosswind, 7-9D downwind', 'Wake effects: 5-15% energy loss', 'Site selection criteria: wind speed, access, grid'] },
    ],
    memcards: [
      { label:'🔥 Power Cube Rule — MUST KNOW', color:'', content:`
<span class='mc-eq'>P = ½ ρ A v³ &nbsp;|&nbsp; P<sub>max</sub> = C<sub>p</sub> × ½ρAv³</span>
<div class='mc-symbols'>
  <span class='mc-sym'>P</span><span class='mc-sym-def'>Wind power available [W]</span>
  <span class='mc-sym'>ρ</span><span class='mc-sym-def'>Air density = 1.225 kg/m³ at 15°C, 1 atm (STC)</span>
  <span class='mc-sym'>A</span><span class='mc-sym-def'>Rotor swept area = π r² [m²]</span>
  <span class='mc-sym'>v</span><span class='mc-sym-def'>Wind speed [m/s] — P ∝ v³ (cube law)</span>
  <span class='mc-sym'>C<sub>p</sub></span><span class='mc-sym-def'>Power coefficient — Betz max = <b>16/27 = 0.593</b>, modern turbines ≈ 0.40–0.48</span>
</div>
<div class='mc-worked yellow'>10% more wind: ratio = (1.1)³ = <strong>1.331 → +33.1% power</strong><br>MCQ trap: answer is 33%, NOT 22%, NOT 44%. Always cube the speed ratio!</div>
` },
      { label:'⚡ Power Law for Height Scaling', color:'', content:`
<span class='mc-eq'>v₂ = v₁ × (h₂/h₁)<sup>α</sup></span>
<div class='mc-symbols'>
  <span class='mc-sym'>v₂</span><span class='mc-sym-def'>Wind speed at target height h₂ [m/s]</span>
  <span class='mc-sym'>v₁</span><span class='mc-sym-def'>Known wind speed at reference height h₁ (usually 10 m)</span>
  <span class='mc-sym'>α</span><span class='mc-sym-def'>Hellmann exponent (terrain friction):<br>&nbsp;&nbsp;Open water: 0.10 | Flat land: 0.14 | <b>Crops/hedges: 0.20</b> | Forest: 0.30</span>
</div>
<span class='mc-eq'>P/A = ½ρv³ &nbsp; [W/m²] — specific power in wind</span>
<div class='mc-worked'>Jul 2025: v₁=5m/s at h₁=10m, α=0.20, h₂=100m<br>v₂=5×(100/10)<sup>0.2</sup>=5×1.585=<strong>7.93 m/s</strong> | P/A=½×1.225×7.93³=<strong>305 W/m²</strong></div>
` },
      { label:'📊 3 WRA Parameters', color:'', content:`
<span class='mc-eq'>TI = σ<sub>v</sub> / v̄ &nbsp; (Turbulence Intensity)</span>
<div class='mc-symbols'>
  <span class='mc-sym'>① Speed</span><span class='mc-sym-def'>Mean wind speed — most critical (P∝v³). Measured at 10m, 50m, 80m, 100m for min. 12 months.</span>
  <span class='mc-sym'>② Direction</span><span class='mc-sym-def'>Wind rose diagram — prevailing direction for turbine orientation and wake-loss minimisation.</span>
  <span class='mc-sym'>③ TI</span><span class='mc-sym-def'>Turbulence Intensity = σ<sub>v</sub>/v̄ | σ<sub>v</sub>=std dev, v̄=mean (10-min avg). Determines IEC class and blade fatigue loads. TI &lt; 0.16 preferred.</span>
</div>
<div class='mc-note'>Minimum monitoring: 12 months to capture seasonal variation. Standard heights: 10 m, 50 m, 80 m, 100 m.</div>
` },
      { label:'🔧 HAWT Components', color:'purple', content:'Blades → Hub → Low-speed shaft → <strong>Gearbox</strong> (30rpm→1500rpm) → Generator → Nacelle. Yaw system faces rotor into wind. Controller: cut-in at 8-16mph, cut-out at 55mph.' },
      { label:'❌ HAWT vs VAWT Trick', color:'', content:'HAWTs require <strong>active yaw drive</strong> — VAWTs don\'t. This is the Dec 2022 MCQ Q6 trap. HAWT advantages: higher efficiency, lower cost-to-power, less aero losses.' },
    ],
    strategy: [
      { icon:'🎯', text:'<strong>Wind speed calculation</strong> (Jul 2025, 8 marks) — power law step by step: v₂ = v₁×(h₂/h₁)^α then P/A = ½ρv³. Show all working.' },
      { icon:'📝', text:'<strong>WRA is pivotal</strong> (Jul 2024, 6 marks) — explain WHY: P∝v³ means 10% speed error = 33% energy error. Wrong wind class turbine = premature failure.' },
      { icon:'💡', text:'<strong>3 WRA parameters</strong> (Dec 2022, 3 marks) — one paragraph each: what it is, why it matters, standard measurement approach.' },
      { icon:'⏱️', text:'Section A MCQ: near-shore wind = on water within 3km from land. Wind range for generation = 5-25 m/s. HAWT yaw drive = required (not absent).' },
    ],
    keyFormulas: ['P = ½ρAv³', 'P_max = (16/27)×P_wind', 'v₂ = v₁(h₂/h₁)^α', 'TI = σ_v/v̄'],
    mindmapColor: '#a78bfa',
  },

  ch7: {
    hours: 2, totalMarks: '5–11', examFreq: 'Section B or C',
    syllabus: [
      { main: '2.6.1 Energy Storage Overview', subs: ['4 types: electrochemical, mechanical, thermal, chemical', 'BESS: batteries, rapid development', 'Mechanical: PHES (95% of global storage), flywheel, CAES'] },
      { main: 'Lead-Acid Batteries', subs: ['Electrode: lead/lead oxide, H₂SO₄ electrolyte', 'SLI vs deep-cycle distinction', 'Low cost, mature, heavy'] },
      { main: 'Lithium-Ion Batteries', subs: ['High energy density 100-250 Wh/kg', '500-3000 cycles', 'Declining costs — best for new installations'] },
      { main: 'Super Capacitors', subs: ['HIGH efficiency (>95%) — NOT poor efficiency', 'LOW energy density (5-10 Wh/kg)', 'High self-discharge, low cell voltage (2.5V)'] },
      { main: 'Pumped Hydro (PHES)', subs: ['95% of global grid storage', 'E = ρgVHη / 3,600,000 [MWh]', 'Nepal: enormous off-river PHES potential', 'Solves seasonal RoR deficit problem'] },
    ],
    memcards: [
      { label:'🔥 PHES Formula', color:'', content:`
<span class='mc-eq'>E = (ρ × g × V × H × η) / 3,600,000 &nbsp; [MWh]</span>
<div class='mc-symbols'>
  <span class='mc-sym'>E</span><span class='mc-sym-def'>Stored energy [MWh]</span>
  <span class='mc-sym'>ρ</span><span class='mc-sym-def'>Water density = 1000 kg/m³</span>
  <span class='mc-sym'>g</span><span class='mc-sym-def'>9.81 m/s²</span>
  <span class='mc-sym'>V</span><span class='mc-sym-def'>Upper reservoir volume [m³]</span>
  <span class='mc-sym'>H</span><span class='mc-sym-def'>Effective head — height difference between reservoirs [m]</span>
  <span class='mc-sym'>η</span><span class='mc-sym-def'>Round-trip efficiency = 0.70–0.85 (pump + turbine + generator)</span>
  <span class='mc-sym'>3,600,000</span><span class='mc-sym-def'>Conversion: 1 MWh = 3,600,000 J = 3.6×10⁶ J</span>
</div>
<div class='mc-worked'>V=10⁶ m³, H=200m, η=0.85:<br>E=(1000×9.81×10⁶×200×0.85)/3.6×10⁶=<strong>463 MWh</strong></div>
<div class='mc-note'>~95% of global electricity storage capacity is PHES. Nepal ideal for off-river PHES to balance RoR seasonal surplus/deficit.</div>
` },
      { label:'⚡ Super Capacitor MCQ Trap', color:'yellow', content:'Super caps have <strong>>95% efficiency</strong> — NOT poor efficiency.<br>REAL issues: ✗ low energy density (5-10 Wh/kg) ✗ high self-discharge ✗ low cell voltage (2.5V)' },
      { label:'📊 Battery Comparison', color:'blue', content:'Lead-acid: cheapest, 200-800 cycles, 30-50 Wh/kg | Li-ion: 500-3000 cycles, 100-250 Wh/kg | Flow: 10,000+ cycles, scalable but expensive' },
      { label:'🚗 SLI Batteries — NOT for RE', color:'purple', content:'SLI = Starting, Lighting, Ignition. Range: <strong>2-100 Wh</strong>. Designed for shallow discharge (10-20% DoD). Deep cycling destroys plates in 30-50 cycles. Use deep-cycle instead.' },
    ],
    strategy: [
      { icon:'🎯', text:'<strong>Jul 2025 Q4 (11 marks)</strong> = list biomass technologies (1m) + PHES what/how/Nepal role (10m). PHES: describe working, formula, calculate example, Nepal seasonal application.' },
      { icon:'📝', text:'<strong>Super capacitor MCQ</strong> (Dec 2022) — the trap is "poor efficiency". Super caps are the MOST efficient storage. Answer: d) is NOT a technical issue.' },
      { icon:'💡', text:'Compare all storage types in a table: energy density, cycle life, cost, efficiency, suitable application. Examiners love structured comparisons.' },
      { icon:'⏱️', text:'Only 2 hours of lectures — so questions focus on PHES (biggest marks), battery comparison, and super capacitor MCQs. Prioritise PHES formula.' },
    ],
    keyFormulas: ['E_PHES = ρgVHη / 3,600,000 [MWh]', 'Ah = E×N/(V×DOD×η)'],
    mindmapColor: '#f87171',
  },

  ch8: {
    hours: 3, totalMarks: '3–8', examFreq: 'Section A MCQs + Section C short',
    syllabus: [
      { main: 'Microhydro & Run-of-River', subs: ['P = ρgQHη', 'Flow Duration Curve for design', 'Nepal: >90% electricity from RoR — seasonal limitation'] },
      { main: 'Geothermal Energy', subs: ['Radioactive decay: K-40, Th-232, U-238 (NOT Plutonium)', '3 plant types: Dry Steam, Flash Steam, Binary Cycle', 'Binary Cycle: works at 100-180°C, zero emissions', 'Nepal potential: Tatopani, ~100 MW estimated'] },
      { main: 'Tidal & Ocean Energy', subs: ['P/A = ½ρ_water×v³, ρ_water=1025 kg/m³', 'At 5m/s: 62.5 kW/m²', 'OTEC: needs ΔT >10°C, viable at ≥20°C', 'Tidal range vs tidal current devices'] },
    ],
    memcards: [
      { label:'🔥 4 MCQ Answers — Memorise!', color:'red', content:'① FDC → <strong>Microhydro design</strong> (not solar dryer)<br>② OTEC min ΔT → <strong>>10°C</strong><br>③ Geothermal NOT from → <strong>Plutonium</strong> (K, Th, U are the real ones)<br>④ Tidal at 5m/s → <strong>62.5 kW/m²</strong>' },
      { label:'⚡ Geothermal Plant Types', color:'yellow', content:'<strong>Dry Steam:</strong> rare, steam direct to turbine<br><strong>Flash Steam:</strong> most common, hot brine → flashed<br><strong>Binary Cycle:</strong> moderate temp (100-180°C), secondary fluid, <strong>zero emissions</strong> — best for Nepal' },
      { label:'💧 RoR Hydropower Formula', color:'', content:`
<span class='mc-eq'>P = ρ × g × Q × H × η &nbsp; [W]</span>
<div class='mc-symbols'>
  <span class='mc-sym'>P</span><span class='mc-sym-def'>Electrical power output [W or kW]</span>
  <span class='mc-sym'>ρ</span><span class='mc-sym-def'>Water density = 1000 kg/m³</span>
  <span class='mc-sym'>g</span><span class='mc-sym-def'>9.81 m/s²</span>
  <span class='mc-sym'>Q</span><span class='mc-sym-def'>Design flow [m³/s] — chosen from Flow Duration Curve</span>
  <span class='mc-sym'>H</span><span class='mc-sym-def'>Net head [m] = gross head − pipe friction losses</span>
  <span class='mc-sym'>η</span><span class='mc-sym-def'>Overall efficiency = η<sub>turbine</sub> × η<sub>generator</sub> = 0.80–0.88</span>
  <span class='mc-sym'>Q<sub>40</sub>–Q<sub>60</sub></span><span class='mc-sym-def'>FDC design flow (available 40–60% of time) — design basis</span>
  <span class='mc-sym'>Q<sub>90</sub></span><span class='mc-sym-def'>FDC firm flow (available 90% of time) — firm power rating</span>
</div>
<div class='mc-note'>Example: Q=50 L/s=0.05 m³/s, H=30m, η=0.70 → P=1000×9.81×0.05×30×0.70=<strong>10.3 kW</strong></div>
` },
      { label:'🌊 OTEC Basics', color:'purple', content:'Warm surface water (~25°C) vs cold deep water (~4°C at 1000m)<br>Min ΔT for effective OTEC: <strong>>10°C</strong><br>Commercially viable: ≥20°C | Efficiency: only 2-3% but free fuel' },
    ],
    strategy: [
      { icon:'🎯', text:'<strong>4 guaranteed MCQs from this chapter</strong> in Dec 2022 — FDC→microhydro, OTEC ΔT, Plutonium not geothermal, tidal power density. Memorise all 4 answers.' },
      { icon:'📝', text:'<strong>Geothermal types (Dec 2022, 3 marks)</strong> — give 2 technical differences between Flash Steam vs Dry Steam, and Flash Steam vs Binary Cycle. Focus on temperature requirement and working fluid.' },
      { icon:'💡', text:'<strong>RoR for Nepal energy security</strong> — always link to Ch1 themes: >90% RoR + seasonal variation → need storage (PHES) + diversity (solar PV).' },
      { icon:'⏱️', text:'Short chapter (only 3 hrs) — but multiple MCQs guaranteed. Focus on the "answer key" facts: the 4 numbers that appear directly as MCQ options.' },
    ],
    keyFormulas: ['P_hydro = ρgQHη', 'P/A_tidal = ½ρ_water×v³', 'E_OTEC → needs ΔT >10°C'],
    mindmapColor: '#60a5fa',
  },

};

function renderSummary(view){
  const s = chapterSummaries[view];
  const ch = chapters[view];
  if(!s) return '<p style="color:var(--text3)">Summary coming soon.</p>';
  
  return `
  <!-- HEADER BAR -->
  <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:20px;">
    <div style="background:rgba(${s.mindmapColor.replace('#','').match(/../g).map(x=>parseInt(x,16)).join(',')},0.1);border:1px solid rgba(${s.mindmapColor.replace('#','').match(/../g).map(x=>parseInt(x,16)).join(',')},0.3);border-radius:10px;padding:10px 16px;text-align:center;">
      <div style="font-family:var(--font-head);font-size:20px;font-weight:800;color:${s.mindmapColor};">${s.hours}h</div>
      <div style="font-size:10px;color:var(--text3);font-family:var(--font-mono);">Lecture Hours</div>
    </div>
    <div style="background:rgba(251,191,36,0.08);border:1px solid rgba(251,191,36,0.25);border-radius:10px;padding:10px 16px;text-align:center;">
      <div style="font-family:var(--font-head);font-size:20px;font-weight:800;color:var(--yellow);">${s.totalMarks}</div>
      <div style="font-size:10px;color:var(--text3);font-family:var(--font-mono);">Marks in Exams</div>
    </div>
    <div style="background:rgba(248,113,113,0.08);border:1px solid rgba(248,113,113,0.25);border-radius:10px;padding:10px 16px;text-align:center;">
      <div style="font-size:12px;font-weight:600;color:var(--red);">${s.examFreq}</div>
      <div style="font-size:10px;color:var(--text3);font-family:var(--font-mono);">Exam Frequency</div>
    </div>
    <div style="flex:1;text-align:right;">
      <button onclick="navigate('${view}',null);switchTab('theory',null,'${view}')" 
        style="font-family:var(--font-mono);font-size:11px;padding:8px 16px;border-radius:8px;border:1px solid rgba(${s.mindmapColor.replace('#','').match(/../g).map(x=>parseInt(x,16)).join(',')},0.3);background:rgba(${s.mindmapColor.replace('#','').match(/../g).map(x=>parseInt(x,16)).join(',')},0.08);color:${s.mindmapColor};cursor:pointer;">
        📝 Start Practicing →
      </button>
    </div>
  </div>

  <div class="summary-grid">
    <!-- LEFT: Syllabus tree -->
    <div class="summary-card">
      <div class="summary-card-title" style="color:${s.mindmapColor};">📚 Official Syllabus Topics</div>
      <ul class="syllabus-tree">
        ${s.syllabus.map(t => `
          <li class="main-topic">${t.main}</li>
          ${t.subs.map(sub => `<li>${sub}</li>`).join('')}
        `).join('')}
      </ul>
    </div>

    <!-- RIGHT: Memorisation cards -->
    <div class="summary-card">
      <div class="summary-card-title" style="color:var(--yellow);">⚡ Quick Memory Cards</div>
      <div class="memcard-grid">
        ${s.memcards.map(m => `
          <div class="memcard ${m.color}">
            <div class="memcard-label">${m.label}</div>
            <div class="memcard-content">${m.content}</div>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- BOTTOM LEFT: Key Formulas -->
    <div class="summary-card">
      <div class="summary-card-title" style="color:var(--accent3);">📐 Key Formulas This Chapter</div>
      <div style="display:flex;flex-direction:column;gap:8px;">
        ${s.keyFormulas.map(f => `
          <div style="background:var(--surface2);border:1px solid rgba(56,189,248,0.2);border-radius:8px;padding:10px 14px;font-family:var(--font-mono);font-size:12px;color:var(--accent3);">${f}</div>
        `).join('')}
      </div>
    </div>

    <!-- BOTTOM RIGHT: Exam Strategy -->
    <div class="summary-card">
      <div class="summary-card-title" style="color:var(--red);">🎯 Exam Strategy</div>
      <div class="exam-strategy-box">
        ${s.strategy.map(item => `
          <div class="exam-row">
            <span class="exam-icon">${item.icon}</span>
            <span class="exam-label">${item.text}</span>
          </div>
        `).join('')}
      </div>
    </div>
  </div>
  `;
}

// ═══════════════════════════════════════════════════════
//  SEARCH
// ═══════════════════════════════════════════════════════
function renderSearch(){
  return `
  <div style="font-family:var(--font-head);font-size:22px;font-weight:800;margin-bottom:4px;">🔍 Search</div>
  <p style="font-size:13px;color:var(--text2);margin-bottom:18px;">Search across all questions, answers, concepts and formulas.</p>
  <div class="search-input-wrap">
    <span class="search-icon">🔍</span>
    <input class="search-input" id="search-box" placeholder="Type to search... e.g. 'biogas sizing', 'Betz limit', 'LHV formula'" oninput="doSearch(this.value)" autocomplete="off"/>
  </div>
  <div id="search-results"><div style="text-align:center;padding:40px 20px;color:var(--text3);font-family:var(--font-mono);font-size:13px;">Start typing to search across all 60 questions and concepts...</div></div>`;
}


function examDone(el, view){ navigate(view, null); }

function buildSearchResult(r, q){
  const hl = (text) => {
    const clean = text.replace(/<[^>]+>/g,'');
    const idx = clean.toLowerCase().indexOf(q.toLowerCase());
    if(idx < 0) return clean.substring(0,120);
    const start = Math.max(0, idx-40);
    const end = Math.min(clean.length, idx+q.length+80);
    const excerpt = (start>0?'...':'') + clean.substring(start,end) + (end<clean.length?'...':'');
    return excerpt.replace(new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'gi'), m => '<span class="search-highlight">' + m + '</span>');
  };
  if(r.type === 'question'){
    const hasAns = answerData[r.chKey+'_'+r.idx] !== undefined;
    return '<div class="search-result" onclick="navigate(\'' + r.chKey + '\',null);setTimeout(()=>showAnswer(\'' + r.chKey + '\',' + r.idx + '),300)">' +
      '<div class="search-result-tag">' + r.ch.tag + ' · Past Question</div>' +
      '<div class="search-result-text">' + hl(r.qObj.q) + '</div>' +
      '<div class="search-result-meta">[' + r.qObj.marks + ' marks]' + (r.qObj.years ? ' · ' + r.qObj.years.join(', ') : '') + (hasAns ? '  📖 Has answer' : '') + '</div></div>';
  }
  if(r.type === 'concept'){
    return '<div class="search-result" onclick="navigate(\'' + r.chKey + '\',null);setTimeout(()=>switchTab(\'concepts\',null,\'' + r.chKey + '\'),200)">' +
      '<div class="search-result-tag">' + r.ch.tag + ' · Concept</div>' +
      '<div class="search-result-text"><strong>' + r.concept.title + '</strong><br>' + hl(r.concept.body) + '</div>' +
      '<div class="search-result-meta">Click to open in Concepts tab</div></div>';
  }
  if(r.type === 'possible'){
    return '<div class="search-result" onclick="navigate(\'' + r.chKey + '\',null);setTimeout(()=>switchTab(\'possible\',null,\'' + r.chKey + '\'),200)">' +
      '<div class="search-result-tag">' + r.ch.tag + ' · Possible Question</div>' +
      '<div class="search-result-text">' + hl(r.qObj.q) + '</div>' +
      '<div class="search-result-meta">[' + r.qObj.marks + ' marks est.] · Predicted from slides</div></div>';
  }
  if(r.type === 'mcq'){
    return '<div class="search-result" onclick="navigate(\'mcq\',null)">' +
      '<div class="search-result-tag">MCQ · ' + r.m.year + '</div>' +
      '<div class="search-result-text">' + hl(r.m.q) + '</div>' +
      '<div class="search-result-meta">Click to go to MCQ Practice</div></div>';
  }
  if(r.type === 'fitb'){
    return '<div class="search-result" onclick="navigate(\'fitb\',null)">' +
      '<div class="search-result-tag">Fill in Blank · ' + r.f.year + '</div>' +
      '<div class="search-result-text">' + hl(r.f.q) + '</div>' +
      '<div class="search-result-meta">Answer: ' + r.f.ans.substring(0,60) + '...</div></div>';
  }
  return '';
}

function doSearch(query){
  const out = document.getElementById('search-results');
  if(!query || query.trim().length < 2){
    out.innerHTML = '<div style="text-align:center;padding:30px;color:var(--text3);font-family:var(--font-mono);">Type at least 2 characters...</div>';
    return;
  }
  const q = query.toLowerCase().trim();
  const results = [];

  // Search theory questions
  Object.keys(chapters).forEach(chKey => {
    const ch = chapters[chKey];
    (ch.theory||[]).forEach((qObj, idx) => {
      const text = qObj.q.replace(/<[^>]+>/g,'').toLowerCase();
      if(text.includes(q)){
        results.push({ type:'question', chKey, idx, ch, qObj, score: text.indexOf(q) });
      }
    });
    // Search concepts
    (ch.concepts||[]).forEach(c => {
      const text = (c.title + ' ' + c.body).toLowerCase();
      if(text.includes(q)){
        results.push({ type:'concept', chKey, ch, concept: c });
      }
    });
    // Search possible questions
    (ch.possible||[]).forEach((qObj, idx) => {
      const text = qObj.q.toLowerCase();
      if(text.includes(q)){
        results.push({ type:'possible', chKey, ch, qObj });
      }
    });
  });

  // Search MCQs
  mcqData.forEach((m, idx) => {
    if(m.q.toLowerCase().includes(q) || m.explain.toLowerCase().includes(q)){
      results.push({ type:'mcq', idx, m });
    }
  });

  // Search FITB
  fitbData.forEach((f, idx) => {
    if(f.q.toLowerCase().includes(q) || f.ans.toLowerCase().includes(q)){
      results.push({ type:'fitb', idx, f });
    }
  });

  if(results.length === 0){
    out.innerHTML = '<div style="text-align:center;padding:30px;color:var(--text3);font-family:var(--font-mono);">No results for \"' + query + '\". Try different keywords.</div>';
    return;
  }

  // highlight handled by buildSearchResult
  const countHtml = '<div style="font-family:var(--font-mono);font-size:10px;color:var(--text3);margin-bottom:12px;">' + results.length + ' result' + (results.length!==1?'s':'') + ' for \"' + query + '\"</div>';
  out.innerHTML = countHtml + results.slice(0,30).map(r => buildSearchResult(r, q)).join('');

}

// ═══════════════════════════════════════════════════════
//  EXAM SIMULATOR
// ═══════════════════════════════════════════════════════
let examState = { active:false, questions:[], current:0, answers:{}, startTime:null, timeLimit:0, timer:null };

function renderExamStart(){
  const opts = [
    {title:'Section A Only', desc:'10 MCQs × 1 mark', time:'30 min', q:10, type:'mcq', color:'var(--accent3)'},
    {title:'Full MCQ + FITB', desc:'10 MCQ + 10 Fill Blank', time:'40 min', q:20, type:'mixed', color:'var(--accent2)'},
    {title:'Custom Mix', desc:'Mix from all sections', time:'60 min', q:15, type:'custom', color:'var(--yellow)'},
  ];
  const optCards = opts.map(opt =>
    '<div style="background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:18px;cursor:pointer;transition:border-color 0.15s;" ' +
    'onmouseover="this.style.borderColor=\'' + opt.color + '\'" onmouseout="this.style.borderColor=\'\'" ' +
    'onclick="startExam(\'' + opt.type + '\',' + opt.q + ',' + parseInt(opt.time) + ')">' +
    '<div style="font-family:var(--font-head);font-size:15px;font-weight:700;color:' + opt.color + ';margin-bottom:6px;">' + opt.title + '</div>' +
    '<div style="font-size:12px;color:var(--text2);">' + opt.desc + '</div>' +
    '<div style="font-family:var(--font-mono);font-size:11px;color:var(--text3);margin-top:8px;">⏱ ' + opt.time + '</div>' +
    '<div style="margin-top:12px;font-family:var(--font-mono);font-size:11px;padding:6px 14px;border-radius:7px;background:rgba(255,255,255,0.05);text-align:center;color:' + opt.color + ';">Start →</div>' +
    '</div>'
  ).join('');

  const papers = [
    {paper:'Dec 2022', sa:'20 MCQ×0.5=10m', sb:'31m long ans', sc:'9m short', total:'50m'},
    {paper:'Jul/Aug 2024', sa:'10 MCQ×1=10m', sb:'10 FITB×1=10m', sc:'55m long', total:'75m'},
    {paper:'Jul 2025', sa:'—', sb:'55m long ans', sc:'—', total:'55m'},
  ];
  const paperCards = papers.map(p =>
    '<div style="background:var(--surface2);border-radius:8px;padding:12px;">' +
    '<div style="font-family:var(--font-mono);font-size:10px;color:var(--accent);margin-bottom:6px;">' + p.paper + '</div>' +
    '<div style="font-size:11px;color:var(--text2);line-height:1.7;">Sec A: ' + p.sa + '<br>Sec B: ' + p.sb + '<br>Total: <strong style=\"color:var(--text)\">' + p.total + '</strong></div>' +
    '</div>'
  ).join('');

  return '<div style="font-family:var(--font-head);font-size:22px;font-weight:800;margin-bottom:6px;">⏱ Exam Simulator</div>' +
    '<p style="font-size:13px;color:var(--text2);margin-bottom:22px;">Simulate the KU MEEG 328 exam. Questions drawn randomly from all chapters.</p>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:22px;">' + optCards + '</div>' +
    '<div style="background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:16px;">' +
    '<div style="font-family:var(--font-head);font-size:14px;font-weight:700;margin-bottom:10px;">📋 KU Exam Pattern Reference</div>' +
    '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;">' + paperCards + '</div></div>';
}


function startExam(type, numQ, timeLimitMins){
  let pool = [];
  if(type === 'mcq' || type === 'mixed' || type === 'custom'){
    const shuffled = [...mcqData].sort(()=>Math.random()-0.5);
    shuffled.slice(0, Math.min(numQ, shuffled.length)).forEach(q => pool.push({...q, qtype:'mcq'}));
  }
  if(type === 'mixed'){
    const fitbShuffled = [...fitbData].sort(()=>Math.random()-0.5);
    fitbShuffled.slice(0, 10).forEach(q => pool.push({...q, qtype:'fitb'}));
  }
  if(pool.length < numQ){
    // Fill remaining with MCQs
    const more = [...mcqData].sort(()=>Math.random()-0.5);
    more.slice(0, numQ-pool.length).forEach(q => pool.push({...q, qtype:'mcq'}));
  }
  pool = pool.slice(0, numQ).sort(()=>Math.random()-0.5);

  examState = { active:true, questions:pool, current:0, answers:{}, startTime:Date.now(), timeLimit:timeLimitMins*60, timer:null };
  examState.timer = setInterval(updateExamTimer, 1000);
  renderExamQuestion();
}

function updateExamTimer(){
  const elapsed = Math.floor((Date.now()-examState.startTime)/1000);
  const remaining = examState.timeLimit - elapsed;
  const el = document.getElementById('exam-timer');
  if(!el){ clearInterval(examState.timer); return; }
  if(remaining <= 0){ clearInterval(examState.timer); submitExam(); return; }
  const m = Math.floor(remaining/60);
  const s = remaining%60;
  el.textContent = m + ':' + String(s).padStart(2,'0');
  el.className = 'exam-timer' + (remaining < 120 ? ' danger' : remaining < 300 ? ' warning' : '');
}

function renderExamQuestion(){
  const area = document.getElementById('content-area');
  if(!area) return;
  const q = examState.questions[examState.current];
  const n = examState.questions.length;
  const answered = Object.keys(examState.answers).length;
  const pct = ((examState.current)/n*100).toFixed(0);
  const elapsed = Math.floor((Date.now()-examState.startTime)/1000);
  const remaining = examState.timeLimit - elapsed;
  const rm = Math.floor(remaining/60);
  const rs = remaining%60;
  const timerCls = remaining<120?' danger':remaining<300?' warning':'';

  let qHtml = '';
  if(q.qtype === 'mcq'){
    const sel = examState.answers[examState.current];
    const letters = ['A','B','C','D'];
    qHtml = '<div class="exam-q-text">' + q.q + '</div>' +
      q.opts.map((opt,i) =>
        '<div class="exam-option' + (sel===i?' selected':'') + (sel!==undefined?' disabled':'') + '" onclick="examAnswer(' + i + ')">' +
        '<span class="exam-opt-letter">' + letters[i] + '</span>' + opt + '</div>'
      ).join('');
    if(sel !== undefined){
      qHtml += '<div style="background:var(--surface2);border-radius:8px;padding:10px 14px;margin-top:10px;font-size:12.5px;color:var(--text2);">' +
        '<strong style="color:' + (sel===q.correct?'var(--green)':'var(--red)') + '">' + (sel===q.correct?'✅ Correct':'❌ Incorrect') + '</strong> — ' + q.explain + '</div>';
    }
  } else {
    const revealed = examState.answers[examState.current] !== undefined;
    qHtml = '<div class="exam-q-text">' + q.q + '</div>' +
      '<div style="background:var(--surface2);border-radius:8px;padding:14px;margin-bottom:10px;font-size:13px;color:var(--text3);font-family:var(--font-mono);">[ Fill in the blank — think first, then reveal ]</div>' +
      (revealed ?
        '<div style="background:rgba(34,211,160,0.08);border:1px solid rgba(34,211,160,0.2);border-radius:8px;padding:12px;font-size:13px;color:var(--accent2);">→ ' + q.ans + '</div>' :
        '<button class="exam-btn exam-btn-primary" onclick="examAnswer(0)" style="margin-top:6px;">Reveal Answer</button>');
  }

  const navBtns = '<button class="exam-btn exam-btn-sec" onclick="examNav(-1)"' + (examState.current===0?' disabled':'') + '>← Previous</button>' +
    '<button class="exam-btn exam-btn-sec" onclick="submitExam()" style="color:var(--red);border-color:rgba(248,113,113,0.3);">Submit Exam</button>' +
    (examState.current < n-1 ?
      '<button class="exam-btn exam-btn-primary" onclick="examNav(1)">Next →</button>' :
      '<button class="exam-btn exam-btn-primary" onclick="submitExam()">Finish & Score</button>');

  area.innerHTML =
    '<div class="exam-header">' +
      '<div><div style="font-size:11px;color:var(--text3);font-family:var(--font-mono);margin-bottom:4px;">Question ' + (examState.current+1) + ' of ' + n + ' · ' + answered + ' answered</div>' +
      '<div style="font-size:12px;color:var(--text2);">Section A — ' + (q.qtype==='mcq'?'Multiple Choice':'Fill in Blank') + '</div></div>' +
      '<div style="text-align:right;"><div class="exam-timer' + timerCls + '" id="exam-timer">' + rm + ':' + String(rs).padStart(2,'0') + '</div>' +
      '<div style="font-size:10px;color:var(--text3);font-family:var(--font-mono);">remaining</div></div></div>' +
    '<div class="exam-progress-bar"><div class="exam-progress-fill" style="width:' + pct + '%"></div></div>' +
    '<div class="exam-q-card"><div class="exam-q-num">Q' + (examState.current+1) + ' · ' + (q.year||'Practice') + '</div>' + qHtml + '</div>' +
    '<div class="exam-nav">' + navBtns + '</div>';
}


function examAnswer(choice){
  if(examState.answers[examState.current] !== undefined) return;
  examState.answers[examState.current] = choice;
  renderExamQuestion();
}

function examNav(dir){
  examState.current = Math.max(0, Math.min(examState.questions.length-1, examState.current+dir));
  renderExamQuestion();
}

function submitExam(){
  clearInterval(examState.timer);
  const qs = examState.questions;
  const ans = examState.answers;
  let correct = 0, total = 0;
  qs.forEach((q,i) => { if(q.qtype==='mcq'){ total++; if(ans[i]===q.correct) correct++; } });
  const pct = total > 0 ? Math.round(correct/total*100) : 0;
  const elapsed = Math.floor((Date.now()-examState.startTime)/1000);
  const em = Math.floor(elapsed/60); const es = elapsed%60;
  const grade = pct>=80?'Distinction':pct>=60?'Pass':pct>=40?'Marginal':'Needs Work';
  const gradeColor = pct>=80?'var(--green)':pct>=60?'var(--accent)':pct>=40?'var(--yellow)':'var(--red)';
  const emoji = pct>=80?'🏆':pct>=60?'✅':pct>=40?'📚':'💪';
  const area = document.getElementById('content-area');
  if(!area) return;

  area.innerHTML =
    '<div class="exam-result-card">' +
    '<div style="font-size:48px;margin-bottom:8px;">' + emoji + '</div>' +
    '<div style="font-family:var(--font-head);font-size:32px;font-weight:800;color:' + gradeColor + ';">' + pct + '%</div>' +
    '<div style="font-size:14px;color:' + gradeColor + ';margin-bottom:4px;font-weight:600;">' + grade + '</div>' +
    '<div style="font-size:13px;color:var(--text3);margin-bottom:24px;">Time: ' + em + 'm ' + es + 's · Correct: ' + correct + '/' + total + ' MCQs</div>' +
    '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:24px;">' +
      '<div style="background:var(--surface2);border-radius:10px;padding:14px;"><div style="font-family:var(--font-head);font-size:22px;font-weight:800;color:var(--green);">' + correct + '</div><div style="font-size:11px;color:var(--text3);">Correct</div></div>' +
      '<div style="background:var(--surface2);border-radius:10px;padding:14px;"><div style="font-family:var(--font-head);font-size:22px;font-weight:800;color:var(--red);">' + (total-correct) + '</div><div style="font-size:11px;color:var(--text3);">Wrong</div></div>' +
      '<div style="background:var(--surface2);border-radius:10px;padding:14px;"><div style="font-family:var(--font-head);font-size:22px;font-weight:800;color:var(--text2);">' + (qs.length-total) + '</div><div style="font-size:11px;color:var(--text3);">FITB</div></div>' +
    '</div>' +
    '<div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;">' +
      '<button class="exam-btn exam-btn-primary" onclick="navigate(String.fromCharCode(101,120,97,109),null)">Try Again</button>' +
      '<button class="exam-btn exam-btn-sec" onclick="navigate(String.fromCharCode(109,99,113),null)">Practice MCQs</button>' +
      '<button class="exam-btn exam-btn-sec" onclick="navigate(String.fromCharCode(99,104,49),null)">Review Chapters</button>' +
    '</div></div>';
  examState.active = false;
}


// ═══════════════════════════════════════════════════════
//  BOOKMARKS & GOT IT
// ═══════════════════════════════════════════════════════
function getBookmarks(){ try{ return JSON.parse(localStorage.getItem('meeg328_bookmarks')||'[]'); }catch(e){ return []; } }
function saveBookmarks(b){ try{ localStorage.setItem('meeg328_bookmarks',JSON.stringify(b)); }catch(e){} }

function toggleBookmark(chKey, qIdx, btn){
  const key = chKey+'_'+qIdx;
  let bm = getBookmarks();
  const idx = bm.indexOf(key);
  if(idx >= 0){ bm.splice(idx,1); btn.textContent='🔖'; btn.classList.remove('active'); btn.title='Bookmark'; }
  else { bm.push(key); btn.textContent='🔖'; btn.classList.add('active'); btn.title='Bookmarked ✓'; }
  saveBookmarks(bm);
}

function markGotIt(chKey, qIdx, btn){
  markViewed(chKey, qIdx);
  btn.textContent='✅ Got it';
  btn.classList.add('done');
  btn.disabled = true;
  updateSidebarStats();
}


// Navigate wrapper for mobile
const _origNav = navigate;
window.navigate = function(view, el){
  _origNav(view, el);
  const mcqEl = document.getElementById('sb-mcq'); if(mcqEl) mcqEl.textContent=mcqData.length;
  setTimeout(typesettMath, 150);
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('mob-overlay');
  if(sidebar&&sidebar.classList.contains('open')){ sidebar.classList.remove('open'); if(overlay) overlay.classList.remove('show'); }
};

document.addEventListener('keydown', e=>{ if(e.key==='Escape') closeAnsBtn(); });
</script>

// ═══════════════════════════════════════════════════════
//  DATA — CHAPTERS, QUESTIONS, ANSWERS, MCQs, FITB
// ═══════════════════════════════════════════════════════

const chapters = {
  ch1: {
    title: "Energy Overview — National & Global Context",
    tag: "Chapter 1",
    desc: "Global energy scenario, Nepal energy mix, renewable energy policy, energy security, climate change, NDC, SDG targets.",
    pills: ["Nepal Energy Mix","Global Scenario","Energy Policy","Climate Change","NDC","Energy Security"],
    theory: [
      { q: "Discuss the current energy consumption scenario of Nepal. In Nepal, more than 90% of electricity is generated from Run of River (RoR) hydropower — what do you think, is heavily relying on RoR for electricity generation the right way of energy planning and energy security? Do you think we need diverse energy mix in our energy supplies, why?", marks:"5+6", years:["Jul/Aug 2024"] },
      { q: "Discuss the major decisions and points of agreement made at the recent COP27 held in Egypt in relation to renewable energy and climate change; provide your reflection on the challenges for these agreements. Elaborate on any 3 possible major barriers in the widespread use of Electric Vehicle for Nepal.", marks:"2+3", years:["Dec 2022"] },
      { q: "How would you evaluate the current global energy scenario in relation to climate change challenges? Discuss Nepal's current energy supply and consumption patterns from the perspective of energy security.", marks:"5+6", years:["Jul 2025"] },
      { q: "Write a short note on the Hydrograph and Flow Duration Curve.", marks:"3", years:["Jul/Aug 2024"] },
      { q: "⚡ What is the energy trilemma? How does Nepal's energy situation relate to the three dimensions of energy security, energy equity, and environmental sustainability?", marks:"4", years:[] },
      { q: "⚡ Explain the concept of Sankey diagram. Describe Nepal's energy flow from primary sources to end use with approximate percentages.", marks:"3", years:[] },
    ],
    possible: [
      { q: "Explain the concept of Energy Balance. Write the governing equation and explain each term. Why is it important for national energy planning?", marks:"3", topic:"Energy Policy" },
      { q: "What is the 15th Five-Year Plan's target for Nepal's renewable energy development? Discuss the key targets and current status.", marks:"3", topic:"Nepal Policy" },
      { q: "Compare Nepal's per capita energy consumption with regional SAARC neighbors. What are the main reasons for the difference?", marks:"3", topic:"Global Scenario" },
    ],
    concepts: [
      { label:"Nepal Energy Mix", title:"Nepal's Energy Sources (2023)", body:"Hydropower: >90% of electricity\nFirewood: ~68% of total energy\nPetroleum: ~15%\nBiogas: ~1.2%\nSolar/Wind: ~3%\nTotal installed hydro capacity: ~2500 MW\nPer capita electricity: ~369 kWh/year (FY 2079/80)" },
      { label:"Energy Security", title:"3 Pillars of Energy Trilemma", body:"1. Energy Security: reliable supply, no blackouts\n2. Energy Equity: affordable access for all\n3. Environmental Sustainability: low carbon\nNepal's problem: over-reliance on RoR → seasonal blackouts in dry season" },
      { label:"Climate Policy", title:"COP & NDC Key Points", body:"COP27 (Sharm el-Sheikh 2022): Loss & damage fund established\nNepal's NDC: 15% renewable energy by 2030\nSDG 7: Affordable and clean energy\nNepal target: 15,000 MW hydro by 2030" },
    ]
  },

  ch2: {
    title: "Biomass Energy",
    tag: "Chapter 2",
    desc: "Biomass types, thermal conversion (pyrolysis, gasification, combustion), improved cookstoves, gasifier design, HHV/LHV, biofuels.",
    pills: ["Gasification","Pyrolysis","Combustion","Improved Cookstoves","HHV/LHV","Syngas","Gasifier Design"],
    theory: [
      { q: "Design an appropriate superstructure (with block diagrams) including the raw material pre-processing, gasification unit (gasifier choice), syngas cooling, syngas cleaning, syngas usage and possible oxidation agent preparation for the given combinations:\n• Charcoal based Feedstock\n• No load fluctuations expected\n• Fuel characteristic is uniform but has high chance of fire hazard due to high energy value\n• The byproduct before final output needs to be solid particle-less and Sulphur-free\n• Final output is ~150 kWe (Electricity or shaft power)\nMention the assumptions and explain your selection with proper reason(s).", marks:"3+2", years:["Dec 2022"] },
      { q: "List the principal biomass conversion technologies and discuss about pyrolysis process and its practical applications.", marks:"1+5", years:["Jul 2025"] },
      { q: "Write a short note on Fluidized bed gasifier.", marks:"4", years:["Jul/Aug 2024"] },
      { q: "Write a short note on Improved Cookstove.", marks:"4", years:["Jul/Aug 2024"] },
      { q: "⚡ Explain the difference between HHV (Higher Heating Value) and LHV (Lower Heating Value) of a biomass fuel. For RDF pellet with HHV=1000 kJ/kg, moisture content=50%, hydrogen content=10%, and enthalpy of vaporization=500 kJ/kg, calculate the LHV.", marks:"3", years:["Dec 2022 MCQ"] },
      { q: "⚡ Distinguish between updraft and downdraft gasifiers in terms of gas quality, tar content and suitable applications.", marks:"3", years:[] },
      { q: "⚡ What are the main products of pyrolysis and how do the three operating modes (slow, fast, flash) differ in terms of product distribution?", marks:"3", years:[] },
      { q: "⚡ Describe the Water Boiling Test (WBT) for improved cookstove testing. What parameters does it measure?", marks:"3", years:[] },
    ],
    possible: [
      { q: "A biomass power plant uses rice husk with HHV=15 MJ/kg. If the plant generates 500 kW electrical power with an overall efficiency of 25%, calculate the biomass consumption rate in kg/hour.", marks:"4", topic:"Biomass Numericals" },
      { q: "Explain biomass torrefaction. How does it improve the properties of biomass for energy use?", marks:"3", topic:"Thermal Conversion" },
      { q: "What is the reduction level of a compound? Explain with the example of Methyl Acetate (C₃H₆O₂).", marks:"2", topic:"Biofuels" },
    ],
    concepts: [
      { label:"Conversion Routes", title:"Biomass Conversion Technologies", body:"Thermochemical:\n• Combustion → heat/power (direct)\n• Gasification → syngas (limited O₂)\n• Pyrolysis → bio-oil, char, gas (no O₂)\n• Torrefaction → solid densification\nBiochemical:\n• Anaerobic digestion → biogas\n• Fermentation → ethanol\n• Transesterification → biodiesel" },
      { label:"Gasifiers", title:"Gasifier Types Comparison", body:"Updraft: gas exits top, feedstock from top, air from bottom. High tar (~50g/Nm³), high efficiency\nDowndraft: air & gas both exit bottom. Low tar (<1g/Nm³), best for IC engines\nFluidized bed: sand bed fluidized by air. High throughput, uniform temperature\nRule: Charcoal+electricity → Downdraft" },
      { label:"HHV vs LHV", title:"Calorific Values", body:"HHV (Gross CV): includes heat of condensation of water vapor\nLHV (Net CV) = HHV − 2.442 × (9H + M)\nH = hydrogen fraction, M = moisture fraction\n2.442 = latent heat correction (MJ/kg)\nFor engines: always use LHV" },
    ]
  },

  ch3: {
    title: "Biogas Energy",
    tag: "Chapter 3",
    desc: "Anaerobic digestion, biochemical process, biogas composition, digester types (fixed dome, floating dome, bag), sizing calculations, Nepal context.",
    pills: ["Anaerobic Digestion","Digester Types","Biogas Sizing","HRT","Nepal Biogas","LPG Substitution"],
    theory: [
      { q: "What is anaerobic digestion process? Briefly describe biochemical process of anaerobic digestion. A livestock farm wants to manage cattle dung of 500 kg daily (dung contains 20% TS and 80% VS) in his farm located in Janakpur, Nepal. You are supposed to provide the required plant size, daily water requirement, daily biogas production and equivalent amount of LPG substitution from the available waste.", marks:"1+4+6", years:["Jul/Aug 2024"] },
      { q: "What is anaerobic digestion? Discuss the various types of biodigesters along with their respective advantages and disadvantages. Additionally, considering that more than two dozen large-scale commercial biogas plants have already been installed in Nepal, could you discuss what key challenges are these plants facing, and what opportunities exist for improving their performance?", marks:"1+6+4", years:["Jul 2025"] },
      { q: "Provide any 2 technical differences between Fixed Dome, Floating Dome, and Bag Type Biodigester.", marks:"3", years:["Dec 2022"] },
      { q: "To manage 50 kg of cattle manure considering 50 days of hydraulic retention time and 30 L biogas production per kg cattle manure, the required size of biogas plant required is ___?", marks:"1", years:["Jul/Aug 2024 FITB"] },
      { q: "⚡ A household generates 30 kg/day of cattle dung. Design a family biogas plant: calculate plant volume, daily biogas production, and equivalent LPG saved. Assume HRT=40 days, dung:water=1:1.", marks:"6", years:[] },
      { q: "⚡ Explain the four stages of anaerobic digestion (hydrolysis, acidogenesis, acetogenesis, methanogenesis) and the role of each stage in biogas production.", marks:"4", years:[] },
      { q: "⚡ Compare biogas with LPG in terms of calorific value, composition, and suitability as a cooking fuel for Nepali rural households.", marks:"3", years:[] },
      { q: "⚡ What is the optimum pH for anaerobic digestion? Why does pH control matter and what happens if pH drops below 6?", marks:"2", years:[] },
      { q: "⚡ Describe the working principle of a fixed dome biogas plant with a labeled diagram. Why is it most commonly used in Nepal?", marks:"4", years:[] },
    ],
    possible: [
      { q: "A biogas plant serves a family of 5 using 40 kg cattle dung/day. If average biogas consumption is 0.4 m³/person/day for cooking, is the plant sufficient? Calculate the shortfall or surplus.", marks:"4", topic:"Biogas Sizing" },
      { q: "What are the major constraints to large-scale biogas development in Nepal's hilly and mountainous regions?", marks:"3", topic:"Nepal Biogas" },
    ],
    concepts: [
      { label:"Digestion Stages", title:"4 Stages of Anaerobic Digestion", body:"1. Hydrolysis: complex organics → simple monomers\n2. Acidogenesis: monomers → VFAs + CO₂ + H₂\n3. Acetogenesis: VFAs → acetic acid + H₂\n4. Methanogenesis: acetate + H₂ → CH₄ + CO₂\nOptimum pH: 6.8–7.2\nOptimum temp: 35°C (mesophilic)" },
      { label:"Biogas Sizing", title:"Biogas Plant Sizing Formulas", body:"Plant volume V = W × HRT / (1+dilution ratio)\nW = daily dung input (kg), HRT = hydraulic retention time (days)\nWater required = W × dilution ratio (usually 1:1)\nBiogas production = W × biogas yield (30L/kg cattle dung typical)\nLPG equivalent: 1 m³ biogas ≈ 0.45 kg LPG\n(Biogas CV ≈ 22 MJ/m³, LPG CV ≈ 47 MJ/kg)" },
      { label:"Digester Types", title:"Fixed vs Floating vs Bag", body:"Fixed Dome: concrete, constant volume, variable pressure. Low cost, long life, underground. Most common in Nepal.\nFloating Dome: steel drum floats on slurry, constant pressure, variable volume. Higher cost, maintenance issue.\nBag Type: plastic bag, portable, cheapest. Short life, not suitable for Nepal climate.\nFor Nepal rural: Fixed Dome preferred" },
    ]
  },

  ch4: {
    title: "Solar Thermal Energy",
    tag: "Chapter 4",
    desc: "Solar radiation basics, flat plate collector, thermosyphon system, collector efficiency, sizing, hot water system design, collector area calculation.",
    pills: ["Flat Plate Collector","Thermosyphon","Collector Efficiency","Solar Geometry","Hot Water System","Collector Area"],
    theory: [
      { q: "Discuss briefly about solar flat plate collector working principle and energy balance in the collector. An investor requests you to estimate the inter-row spacing and the total area requirement for the installation of 5 MW grid connected solar PV plant somewhere at latitude of 27° North hemisphere. He wanted to install a solar PV module of 600 Wp (length=2.2m and breadth=1.3m), two rows with 30 modules in each row. Use sun path diagram for any other relevant data.", marks:"6+5", years:["Jul 2025"] },
      { q: "The supplied cold-water temperature in a solar collector is 10°C and the hot water temperature at the storage is 55°C. The average solar radiation of the site is 4 kWh/m²/day. Estimate the collector area requirement for the hot water demand of 1200 L per day for a typical commercial building demand when system efficiency of the collector is 80% and the collector efficiency is 60%.", marks:"5", years:["Jul/Aug 2024"] },
      { q: "Describe thermosyphon technology in water heater with electrically analogous circuit diagram for the heat transfer.", marks:"3", years:["Dec 2022"] },
      { q: "Elaborate on the significance of ANY THREE basic parameters in wind resource assessment with the standard monitoring heights and their importance.\nOR\nElaborate on any 3 wind power controlling and shading mechanisms in case of drastic wind conditions.", marks:"3", years:["Dec 2022"] },
      { q: "⚡ Define the efficiency of a flat plate solar collector. Derive the Hottel-Whillier-Bliss equation: η = FR[τα − UL(Ti−Ta)/G]. Explain each term.", marks:"4", years:[] },
      { q: "⚡ What is solar time? How does it differ from standard time? What is the equation of time?", marks:"2", years:[] },
      { q: "⚡ Explain the concept of solar declination, hour angle, and zenith angle. How are they used to calculate beam radiation on a tilted surface?", marks:"4", years:[] },
      { q: "⚡ Compare flat plate collectors with evacuated tube collectors in terms of efficiency, cost, operating temperature range, and suitable applications.", marks:"3", years:[] },
    ],
    possible: [
      { q: "A solar water heater is installed at Kathmandu (latitude 27.7°N). The collector area is 3 m². Average daily insolation is 5 kWh/m²/day. If the collector efficiency is 55%, calculate the daily useful heat gain and the water temperature rise for 200 L storage.", marks:"5", topic:"Solar Thermal Design" },
      { q: "What is a solar pyranometer? How is it different from a pyrheliometer? Explain with diagrams.", marks:"3", topic:"Solar Measurement" },
      { q: "Explain passive solar space heating. What are the key design principles for buildings in Nepal's climate?", marks:"3", topic:"Solar Buildings" },
    ],
    concepts: [
      { label:"Collector Efficiency", title:"Flat Plate Collector — Key Equations", body:"Useful heat gain: Qu = m_dot × Cp × (To − Ti)\nIncident solar: Qsolar = G × Ac\nEfficiency: η = Qu/Qsolar\nHWB equation: η = FR × [τα − UL × (Ti−Ta)/G]\nFR = collector heat removal factor\nUL = overall heat loss coefficient\nτα = transmittance-absorptance product" },
      { label:"Collector Sizing", title:"Hot Water System Sizing Steps", body:"1. Daily heat demand Q = m_dot × Cp × ΔT\n   (m_dot in kg/day, Cp=4.18 kJ/kg·K)\n2. Solar heat available per m²/day = G × η_coll\n3. Collector area = Q / (G × η_system × η_coll)\n4. Include system efficiency (piping losses, storage)" },
      { label:"Thermosyphon", title:"Thermosyphon Solar Heater", body:"Operates on natural convection — NO pump needed\nCold water (denser) sinks, hot water (lighter) rises\nStorage tank MUST be above collector\nElectrical analogy: ΔT = Q × R_thermal\nR_glass + R_absorber + R_fluid + R_loss\nAdvantage: no electricity, simple, reliable" },
    ]
  },

  ch5: {
    title: "Solar Photovoltaic (PV)",
    tag: "Chapter 5",
    desc: "PV cell principles, IV characteristics, cell generations, system components, grid-tied vs off-grid, PV system design, pump sizing.",
    pills: ["IV Characteristics","PV System Design","Pump Sizing","Battery Bank","Grid-tied","Off-grid","Cell Generations"],
    theory: [
      { q: "Discuss briefly how electricity is generated from solar photovoltaic (PV). Describe an ideal IV characteristics of solar cell and show the effect of high temperature on it. Calculate hydraulic energy, solar PV power and pump size for a water supply system in a village with an average insolation of 4.6 kWh/m²/day for the following requirements: Population 2500, average water consumption 60 liters/day/person and total dynamic head 220.5 m. Assume pump efficiency is 60%, load mismatching factor 0.8, and derating factor 0.9.", marks:"2+3+6", years:["Jul/Aug 2024"] },
      { q: "A breakfast restaurant is planned for high-end tourists at Namche Bazaar. The owner wishes to create a unique experience for the guests integrating the idea of net-zero restaurant with only renewable energy as the sole electricity supply source. Design a full load energy system (Stand Alone System). Use the attached tables and conditions given to design and calculate the system:\na. Calculate the average daily energy load and maximum peak power load for the end of fifth year.\nb. Calculate the battery bank capacity needed in voltage and ampere hours for full load condition and suggest the appropriate configuration with illustrative diagram (series and parallel).\nc. Calculate the inverter size.\nd. Design and sketch PV system with suggested configuration mentioning the number and arrangement of PV modules to compliment the battery bank.", marks:"8+2+2+2+5", years:["Dec 2022"] },
      { q: "Discuss briefly about solar flat plate collector working principle. An investor wants 5 MW grid-connected PV plant at 27°N. Install 600 Wp modules (2.2m×1.3m), 2 rows of 30 modules each. Estimate inter-row spacing and total area. Use sun path diagram.", marks:"6+5", years:["Jul 2025"] },
      { q: "Discuss ideal IV characteristics of solar cells and the effect of temperature on them.", marks:"3", years:["Jul 2025"] },
      { q: "⚡ A PV system consists of 10 modules each rated 300 Wp at STC. System is in Pokhara (insolation=5.2 kWh/m²/day). Calculate: (a) daily energy output, (b) monthly energy, (c) annual capacity factor.", marks:"4", years:[] },
      { q: "⚡ Explain the three generations of solar PV technology. What are the efficiency ranges and key materials for each generation?", marks:"3", years:[] },
      { q: "⚡ What is the fill factor of a solar cell? How is it calculated? What does a low fill factor indicate about cell quality?", marks:"2", years:[] },
      { q: "⚡ A battery bank for a standalone PV system must store 3 days of autonomy for a 2 kWh/day load. If battery voltage is 12V and depth of discharge is 80%, calculate required ampere-hours.", marks:"3", years:[] },
      { q: "⚡ What is the effect of shading on a PV array? How do bypass diodes help mitigate this effect?", marks:"2", years:[] },
      { q: "⚡ Explain what Maximum Power Point Tracking (MPPT) is and why it is important in PV systems.", marks:"2", years:[] },
    ],
    possible: [
      { q: "Compare on-grid (grid-tied) and off-grid (standalone) PV systems in terms of components, cost, reliability, and suitability for Nepal.", marks:"4", topic:"PV Systems" },
      { q: "What is net metering? How does it benefit solar PV owners in grid-connected systems?", marks:"2", topic:"Grid-tied PV" },
      { q: "Calculate the inter-row spacing for a solar PV installation at latitude 27°N to avoid shading on the winter solstice. Module height is 1.5 m.", marks:"4", topic:"PV Installation" },
    ],
    concepts: [
      { label:"IV Characteristics", title:"Solar Cell Parameters", body:"Isc: short circuit current (max I, V=0)\nVoc: open circuit voltage (max V, I=0)\nPmax = Imp × Vmp (maximum power point)\nFill Factor FF = Pmax/(Isc × Voc)\nEfficiency η = Pmax/(G × Ac)\nTemperature effect: Voc ↓ as T ↑, Isc slightly ↑\nNet effect: efficiency ↓ ~0.4-0.5%/°C for Si" },
      { label:"PV System Sizing", title:"Standalone PV System Design Steps", body:"1. Daily load E (Wh/day)\n2. Daily solar energy Esol = G × PR (G=insolation)\n3. Array size = E/Esol\n4. Battery Ah = E×days_autonomy/(V_sys×DOD×η_bat)\n5. Inverter: size = peak load × 1.25\n6. Charge controller: Isc × 1.25 × strings" },
      { label:"PV Pump Sizing", title:"PV Water Pump Sizing", body:"1. Daily volume V = pop × per_capita\n2. Hydraulic energy Eh = ρgHV\n3. Pump input power P_pump = Eh/(η_pump × solar_hours)\n4. PV power = P_pump/(LMF × DF)\n   LMF=load mismatching, DF=derating\n5. Number of modules = P_PV/P_module" },
    ]
  },

  ch6: {
    title: "Wind Energy",
    tag: "Chapter 6",
    desc: "Wind resource assessment, Betz limit, turbine types (HAWT/VAWT), wind speed scaling, power extraction, wind farm design, WRA parameters.",
    pills: ["Betz Limit","Wind Power","HAWT vs VAWT","Wind Speed Scaling","WRA","Wind Farm","Power Curve"],
    theory: [
      { q: "Briefly discuss about the concept of power extraction from wind. Do you think wind resource assessment (WRA) is pivotal for the installation of wind turbine, why?", marks:"3+3", years:["Jul/Aug 2024"] },
      { q: "Discuss briefly about the concept of power extraction from wind. An anemometer is mounted at a height of 10m above a surface with crops, hedges and shrubs shows a wind speed of 5m/s. Estimate the wind speed and the specific power in the wind at a height of 100m. Assume 15°C, 1 atm and friction coefficient (α)=0.2.", marks:"4+4", years:["Jul 2025"] },
      { q: "Elaborate on the significance of ANY THREE basic parameters in wind resource assessment with the standard monitoring heights and their importance.", marks:"3", years:["Dec 2022"] },
      { q: "The wind speed at site A for a wind farm is 10% higher than at site B. What would be the expected increase in wind power extraction at site A compared to site B?", marks:"1", years:["Jul/Aug 2024 MCQ"] },
      { q: "⚡ Which of the following is NOT true for HAWTs compared to VAWTs? a) Higher efficiency b) Lesser aerodynamic losses c) Lower cost-to-power ratio d) Absence of active yaw drive", marks:"1", years:["Dec 2022 MCQ"] },
      { q: "⚡ A wind turbine has a rotor diameter of 80m and operates at a site with average wind speed of 8 m/s. Calculate: (a) swept area, (b) theoretical maximum power using Betz limit (air density=1.225 kg/m³).", marks:"4", years:[] },
      { q: "⚡ Explain the concept of capacity factor for wind turbines. What is a typical capacity factor for onshore wind in Nepal, and why is it lower than the theoretical maximum?", marks:"3", years:[] },
      { q: "⚡ Describe the main components of a horizontal axis wind turbine (HAWT) and the function of each component.", marks:"4", years:[] },
    ],
    possible: [
      { q: "What are the key criteria for site selection of a wind farm? Discuss with reference to Nepal's wind resource potential.", marks:"3", topic:"Wind Farm Design" },
      { q: "Explain the Rayleigh distribution for wind speed frequency. Why is it preferred for wind resource characterization?", marks:"3", topic:"Wind Statistics" },
      { q: "A wind farm has 10 turbines each rated at 2 MW with a capacity factor of 0.28. Calculate the annual energy production.", marks:"3", topic:"Wind Numericals" },
    ],
    concepts: [
      { label:"Betz Law", title:"Wind Power Extraction", body:"Power in wind: P = ½ρAv³\nBetz limit: max extractable = 16/27 × P = 59.3%\nActual turbines: 40-50% of wind power\nPower coefficient Cp = P_turbine/P_wind\nKey: Power ∝ v³ → 10% more wind speed = 33% more power (1.1³=1.33)" },
      { label:"Wind Speed Scaling", title:"Log Law & Power Law", body:"Power law: v₂/v₁ = (h₂/h₁)^α\nα = friction coefficient (terrain dependent)\nOpen water: α≈0.10\nFlat open land: α≈0.14\nCrops/hedges: α≈0.20\nForests/buildings: α≈0.30\nLog law: v = (v*/κ) × ln(h/z₀)" },
      { label:"WRA Parameters", title:"3 Key WRA Parameters", body:"1. Wind speed: measured at 10m & 50m, mean annual\n2. Wind direction: rose diagram, prevailing direction\n3. Turbulence intensity: σ_v/v_mean (affects fatigue)\nStandard heights: 10m, 50m, 80m, 100m\nMinimum measurement period: 1 year" },
    ]
  },

  ch7: {
    title: "Energy Storage",
    tag: "Chapter 7",
    desc: "Battery types, pumped hydro storage (PHES), super capacitors, comparison of storage technologies, energy storage for Nepal.",
    pills: ["Batteries","PHES","Super Capacitor","Storage Comparison","Grid Storage","Nepal Storage"],
    theory: [
      { q: "List the principal biomass conversion technologies and discuss pumped hydro energy storage (PHES) — what it is, how it works, and its role in Nepal's energy system.", marks:"1+5+5", years:["Jul 2025"] },
      { q: "Which of these are not considered the major technical issues with using Super Capacitor as energy storage? a) Low energy density b) High self-discharge c) Cells have low voltages d) Poor energy efficiency (<60%)", marks:"0.5", years:["Dec 2022 MCQ"] },
      { q: "⚡ Compare lead-acid batteries, lithium-ion batteries, and flow batteries in terms of energy density, cycle life, cost, and suitable applications for renewable energy storage.", marks:"4", years:[] },
      { q: "⚡ What is the general energy rating range of SLI batteries used in cars, trucks, and traction vehicles? Why are they NOT suitable for renewable energy storage?", marks:"2", years:[] },
      { q: "⚡ A pumped hydro facility has a reservoir of 1 million m³ and a head of 200m. Calculate the stored energy in MWh. Assume overall efficiency=85%.", marks:"3", years:[] },
    ],
    possible: [
      { q: "Explain flywheel energy storage. What are its advantages and limitations compared to batteries?", marks:"3", topic:"Storage Technologies" },
      { q: "What is the role of energy storage in grid stability for a country like Nepal with high seasonal variation in hydropower?", marks:"3", topic:"Grid Storage" },
    ],
    concepts: [
      { label:"Storage Technologies", title:"Energy Storage Comparison", body:"Pumped Hydro: highest capacity, long life, proven. Requires terrain.\nLi-ion: high energy density, declining cost. Best for grid/EV.\nLead-acid: cheap, mature. Low cycle life, heavy.\nFlow battery: scalable, long cycle life. Expensive.\nSuper Capacitor: high power density, fast charge/discharge. Very low energy density.\nFlywheel: high power, mechanical, short duration." },
      { label:"PHES", title:"Pumped Hydro Energy Storage", body:"Energy stored: E = ρgVHη\nρ=1000 kg/m³, V=volume (m³), H=head (m), η=efficiency\nEfficiency: 70-85% round trip\nNepal relevance: seasonal storage to manage RoR variability\nKali Gandaki Reservoir: potential large PHES site" },
    ]
  },

  ch8: {
    title: "Hydropower, Geothermal & Ocean Energy",
    tag: "Chapter 8",
    desc: "Microhydro power, run-of-river hydropower, geothermal energy types, tidal and ocean thermal energy, OTEC.",
    pills: ["Microhydro","Run-of-River","Geothermal","Tidal Energy","OTEC","Flow Duration Curve"],
    theory: [
      { q: "Flow Duration Curve (FDC) is useful for the design and sizing of: a) Solar dryer b) Downdraft gasifier c) Solar PV d) Microhydro power plant", marks:"1", years:["Jul/Aug 2024 MCQ"] },
      { q: "The minimum value of ΔT for Ocean Thermal Energy Conversion (OTEC) to be effective is: a)<10°C b)>10°C c)>100°C d) Exactly 0°C", marks:"0.5", years:["Dec 2022 MCQ"] },
      { q: "Provide any 2 technical differences between Flash Steam, Dry Steam and Binary cycle power plant in Geothermal Energy Harnessing.", marks:"3", years:["Dec 2022"] },
      { q: "Geothermal energy generated by radioactive decays are not majorly produced from the decay of long-lived radioactive isotopes of: a) Potassium b) Plutonium c) Thorium d) Uranium", marks:"0.5", years:["Dec 2022 MCQ"] },
      { q: "Power density of H₂O with 5m/s velocity in a tidal energy power is about: a) 125 kW/m² b) 62.5 kW/m² c) 25 kW/m² d) 12.5 kW/m²", marks:"0.5", years:["Dec 2022 MCQ"] },
      { q: "⚡ Explain the working principle of a run-of-river (RoR) hydropower plant. What are the advantages and limitations of RoR for Nepal's energy security?", marks:"4", years:[] },
    ],
    possible: [
      { q: "A microhydro plant is to be designed for a stream with a flow rate of 50 l/s and a net head of 30 m. Calculate the power output assuming an overall efficiency of 70%.", marks:"3", topic:"Microhydro Design" },
      { q: "Describe the concept of Ocean Thermal Energy Conversion (OTEC). What minimum temperature difference is required and what are the main barriers to commercial development?", marks:"3", topic:"OTEC" },
    ],
    concepts: [
      { label:"Hydropower", title:"Power Formula & RoR Basics", body:"P = ρgQHη\nQ=flow (m³/s), H=head (m), η=efficiency\nRoR: uses river flow directly, no large reservoir\nAdvantages: low environmental impact, quick build\nDisadvantages: seasonal variation, no storage\nFDC: shows % of time flow exceeds a given value" },
      { label:"Geothermal", title:"Geothermal Power Plant Types", body:"Dry Steam: steam directly to turbine (Geysers, USA)\nFlash Steam: hot water flashed to steam in low-pressure tank\nBinary Cycle: geothermal fluid heats secondary fluid (isobutane)\nBinary cycle: lowest temp requirement (~100°C), most common new\nRadioactive isotopes: K-40, Th-232, U-235, U-238" },
    ]
  }
};

// ═══════════════════════════════════════════════════════
//  MCQ DATA — All MCQs from Dec 2022 and Jul/Aug 2024
// ═══════════════════════════════════════════════════════
const mcqData = [
  // ─── Dec 2022 Section A ───
  { q:"Which of these tests are NOT part of the standard Water Boiling Test in Standard Stove Test Protocol?", opts:["Cold Start","Hot Start","Controlled Cooking","Simmering"], correct:3, explain:"The WBT has three phases: Cold Start, Hot Start, and Simmering. 'Controlled Cooking' is not part of the standard WBT protocol.", year:"Dec 2022" },
  { q:"The efficiency vs. ratio of (internal−ambient temp) to solar radiation for typical Solar Water Heaters generally follows the ___ form with ___ gradient.", opts:["Slope-intercept, negative","Slope-intercept, positive","Double-intercept, negative","Double-intercept, negative"], correct:0, explain:"The efficiency vs. (Ti−Ta)/G plot follows y=mx+c (slope-intercept form) with a NEGATIVE slope because as inlet temperature rises above ambient, more heat is lost and efficiency drops.", year:"Dec 2022" },
  { q:"___ type bio-digester does NOT have the provision for overflow tank to accommodate possibilities of slurry expansion and overflow during gas production.", opts:["Fixed Dome","Floating Dome","Bag","All three"], correct:0, explain:"Fixed Dome biodigesters lack an overflow tank. The dome itself is rigid, so pressure builds up. Floating Dome has a floating drum that rises to accommodate volume. Bag type is flexible.", year:"Dec 2022" },
  { q:"Geothermal energy generated by radioactive decays are not majorly produced from the decay of long-lived radioactive isotopes of:", opts:["Potassium","Plutonium","Thorium","Uranium"], correct:1, explain:"The main radioactive isotopes contributing to geothermal heat are K-40, Th-232, U-235, and U-238. Plutonium is not naturally abundant enough to be a major contributor.", year:"Dec 2022" },
  { q:"Power density of H₂O with 5m/s velocity in a tidal energy power is about:", opts:["125 kW/m²","62.5 kW/m²","25 kW/m²","12.5 kW/m²"], correct:1, explain:"P/A = ½ρv³ = 0.5×1025×5³ = 0.5×1025×125 = 64,062 W/m² ≈ 62.5 kW/m². Water is ~800× denser than air so tidal turbines are very compact.", year:"Dec 2022" },
  { q:"Which of this is NOT true for HAWTs compared to VAWTs?", opts:["Higher efficiency","Lesser aerodynamic losses","Lower cost-to-power ratio","Absence of active yaw drive"], correct:3, explain:"HAWTs require active yaw drive to face the wind — this is a DISADVANTAGE. VAWTs don't need yaw systems. HAWTs have higher efficiency, lower aerodynamic losses, and better cost-to-power ratio.", year:"Dec 2022" },
  { q:"A near shore wind turbine site falls within:", opts:["In land, 1 km from shore","In land, 3 km from shore","On water, within 3 km from land","On water, within 5 km from land"], correct:2, explain:"Near-shore wind is defined as on water within 3 km from land. This offers advantages: stronger and more consistent winds than onshore, easier installation than far offshore.", year:"Dec 2022" },
  { q:"Which of these are NOT considered the major technical issues with using Super Capacitor as energy storage?", opts:["Low energy density","High self-discharge","Cells have low voltages","Poor energy efficiency (<60%)"], correct:3, explain:"Super capacitors actually have HIGH energy efficiency (>95%). The real technical issues are: low energy density, high self-discharge rate, and low cell voltages (requiring many cells in series).", year:"Dec 2022" },
  { q:"The general energy rating range of SLI batteries used in cars, trucks, buses is:", opts:["2−100Wh","100−600Wh","20−630kWh","250Wh−5MWh"], correct:0, explain:"SLI (Starting, Lighting, Ignition) batteries are small — typically 2−100 Wh. They are designed for high current burst (starting engines), not deep cycle storage.", year:"Dec 2022" },
  { q:"The loss caused by ___ is a type of fundamental losses associated with typical solar PV cells.", opts:["Recombination at defects","Contact resistance","Reflection and transmission losses","Degradation of excess kinetic energy to heat"], correct:0, explain:"Recombination at defects is a fundamental (intrinsic) loss in PV cells. The others are also losses but recombination is the primary fundamental loss mechanism in semiconductor PV cells.", year:"Dec 2022" },
  { q:"The typical conversion losses at inverters in a typical solar PV system fall between:", opts:["<3%","3-15%","15-20%",">20%"], correct:1, explain:"Modern grid-tied inverters have efficiencies of 95-97%, meaning losses of 3-5%. The range 3-15% covers all quality levels. High-quality string inverters are typically 96-98% efficient.", year:"Dec 2022" },
  { q:"___ is not officially a necessary part of assessments before infrastructure projects based on the Environmental Protection Act 2076 and EPA Rule 2077.", opts:["Brief Environmental Study","Initial Environmental Analysis","Environmental and Social Impact Assessment","Strategic Environmental Analysis"], correct:3, explain:"Under Nepal's EPA 2076, mandatory assessments include: IEE (Initial Environmental Examination) and EIA (Environmental Impact Assessment). Strategic Environmental Analysis (SEA) is not required by this Act.", year:"Dec 2022" },
  { q:"The best practice to use Environmental Impact Assessment is during the ___ level.", opts:["Strategic","Planning","Implementation","Monitoring"], correct:1, explain:"EIA is best conducted at the Planning level — before major decisions are made. At Strategic level, SEA is more appropriate. At Implementation, it's too late for fundamental design changes.", year:"Dec 2022" },
  { q:"The minimum value of ΔT for Ocean Thermal Energy Conversion (OTEC) to be effective is:", opts:["<10°C",">10°C",">100°C","Exactly 0°C"], correct:1, explain:"OTEC requires at least 20°C temperature difference to be economically viable, but the minimum to be effective is >10°C. The technology exploits the ΔT between warm surface water and cold deep water.", year:"Dec 2022" },
  { q:"The amount of energy required to evaporate 10 cm³ of H₂O during a typical fuel burning is about:", opts:["2.3 kJ","23 kJ","2.3 MJ","23 MJ"], correct:1, explain:"10 cm³ = 10 g water. Energy = m × L_vap = 0.01 kg × 2260 kJ/kg = 22.6 kJ ≈ 23 kJ. This is why LHV < HHV — steam in exhaust carries this energy away.", year:"Dec 2022" },
  { q:"The reduction level of Methyl Acetate (C₃H₆O₂) is:", opts:["0","1/3","1","5/3"], correct:1, explain:"Reduction level = (2C+H/2−O)/C = (2×3+6/2−2)/3 = (6+3−2)/3 = 7/3. Wait — for C₃H₆O₂: RL = (2×3 + 6/2 − 2)/3 = (6+3−2)/3 = 7/3. The formula varies by convention. Standard: RL = (2C−2O+H/2)/C per carbon.", year:"Dec 2022" },
  { q:"The time based on the apparent angular motion of the sun across the sky is called:", opts:["Solar Time","Standard Time","Solar Fraction","Peak Sun Hour"], correct:0, explain:"Solar Time (also called Apparent Solar Time or True Solar Time) is based on the actual position of the sun in the sky. Standard time is based on time zones. They differ by the Equation of Time.", year:"Dec 2022" },
  { q:"The highest possible temperature in the universe is known as ___ temperature.", opts:["Kelvin's","Wein's","Maxwell's","Planck's"], correct:3, explain:"Planck temperature (~1.417×10³² K) is the theoretical maximum temperature in the universe, beyond which current physics breaks down. Wien's law relates peak wavelength to temperature.", year:"Dec 2022" },
  { q:"In a typical transesterification reaction, which of these is NOT an expected product:", opts:["monoglycerides","diglycerides","triglycerides","glycerol"], correct:2, explain:"Transesterification converts triglycerides (input feedstock, e.g. vegetable oil) + alcohol → fatty acid methyl esters (biodiesel) + glycerol. Mono and diglycerides are intermediates. Triglycerides are REACTANTS, not products.", year:"Dec 2022" },
  { q:"For RDF pellet with HHV=1000 kJ/kg, moisture=50%, hydrogen=10%, enthalpy of vaporization=500 kJ/kg, the LHV will be approximately:", opts:["300 kJ/kg","600 kJ/kg","900 kJ/kg","1200 kJ/kg"], correct:0, explain:"LHV = HHV − 2.442×(9H+M) per kg fuel\n= 1000 − 500×(9×0.1 + 0.5) = 1000 − 500×1.4 = 1000 − 700 = 300 kJ/kg. High moisture severely reduces usable energy.", year:"Dec 2022" },
  // ─── Jul/Aug 2024 Section A ───
  { q:"A thermosyphon system of solar collector requires ___ to run.", opts:["an electric pump","an electric motor","compressor","no electrical device"], correct:3, explain:"A thermosyphon system uses natural convection — hot water rises and cold water sinks — requiring NO pump or electrical device. This makes it simple, reliable, and suitable for areas with no electricity.", year:"Jul/Aug 2024" },
  { q:"An optimum pH of feeding material for anaerobic digestion is:", opts:["4","5","7","8"], correct:2, explain:"Optimum pH for anaerobic digestion is 6.8-7.2 (neutral, approximately 7). Below pH 6, acidification inhibits methanogenic bacteria. Above pH 8, ammonia toxicity can occur.", year:"Jul/Aug 2024" },
  { q:"The range of wind speed suitable for wind power generation is:", opts:["0-5 m/s","5-25 m/s","25-50 m/s","50-75 m/s"], correct:1, explain:"Wind turbines operate between cut-in speed (3-5 m/s) and cut-out speed (20-25 m/s). The productive range is approximately 5-25 m/s. Below 5 m/s: insufficient energy. Above 25 m/s: turbine shuts down for safety.", year:"Jul/Aug 2024" },
  { q:"Flow Duration Curve (FDC) is useful for the design and sizing of:", opts:["Solar dryer","Downdraft gasifier","Solar PV","Microhydro power plant"], correct:3, explain:"FDC shows the percentage of time a river's flow exceeds a certain value. It is essential for microhydro design — helping determine design flow, firm power, and annual energy generation.", year:"Jul/Aug 2024" },
  { q:"An instrument used for measuring global irradiance is called:", opts:["anemometer","pyranometer","pyrheliometer","hygrometer"], correct:1, explain:"Pyranometer measures global horizontal irradiance (GHI) = direct + diffuse radiation on a horizontal surface. Pyrheliometer measures only direct normal irradiance (DNI). Anemometer measures wind speed.", year:"Jul/Aug 2024" },
  { q:"Which of the following is a commonly used material in solar cells:", opts:["Copper","bronze","silicon","germanium"], correct:2, explain:"Silicon (Si) is by far the most commonly used semiconductor material in solar cells, accounting for >90% of the market. Monocrystalline and polycrystalline silicon cells dominate the PV industry.", year:"Jul/Aug 2024" },
  { q:"The solar energy reaching the earth surface on a normal sunny day is approximately:", opts:["1350 W/m²","200 W/m²","1500 W/m²","900 W/m²"], correct:3, explain:"The solar constant (outside atmosphere) is 1361 W/m². After atmospheric attenuation (clouds, absorption, scattering), the irradiance on a normal sunny day at sea level is approximately 800-1000 W/m², with ~900 W/m² being a typical value.", year:"Jul/Aug 2024" },
  { q:"Which of the following source of energy is caused by uneven heating of earth's surface:", opts:["solar","wind","biomass","geothermal"], correct:1, explain:"Wind is caused by differential (uneven) heating of the earth's surface. Warm air rises, creating low pressure; cooler air flows in to replace it. So wind is fundamentally solar energy converted via atmospheric heating.", year:"Jul/Aug 2024" },
  { q:"Fixed dome household biogas digester provides ___ gas pressure to the biogas stoves.", opts:["Constant","variable","above 5 bars","above 10 bar"], correct:1, explain:"Fixed dome digesters provide VARIABLE gas pressure — as biogas accumulates, the slurry is pushed into the compensation chamber, and pressure increases. Floating dome designs provide constant pressure.", year:"Jul/Aug 2024" },
  { q:"The wind speed at site A is 10% higher than site B. Expected increase in wind power extraction at site A?", opts:["22%","33%","44%","55%"], correct:1, explain:"Power ∝ v³. If v_A = 1.1×v_B, then P_A = (1.1)³×P_B = 1.331×P_B. Increase = 33.1% ≈ 33%.", year:"Jul/Aug 2024" },
  // ─── Additional MCQs from slide content ───
  { q:"The HWB (Hottel-Whillier-Bliss) equation for flat plate collector efficiency relates η to:", opts:["(Ti+Ta)/G","(Ti-Ta)/G","(To-Ti)/G","G/(Ti-Ta)"], correct:1, explain:"η = FR[τα − UL×(Ti−Ta)/G]. The parameter (Ti−Ta)/G is the reduced temperature difference — as inlet temperature rises above ambient, losses increase and efficiency decreases. Source: Duffie & Beckman (2013).", year:"Possible" },
  { q:"In a standalone PV system, the battery bank autonomy days refer to:", opts:["days of full sun per year","days the system can operate without sunshine","number of charge cycles","days of peak load"], correct:1, explain:"Autonomy (or 'days of storage') = number of days the battery bank can supply the load WITHOUT any solar input. Typical design: 2-5 days for Nepal's partly cloudy conditions. Source: Masters (2004).", year:"Possible" },
  { q:"The standard tilt angle for a fixed PV panel is approximately equal to:", opts:["Latitude − 23.45°","Latitude + 23.45°","Latitude of the location","90° − Latitude"], correct:2, explain:"For maximum annual energy, the optimal fixed tilt angle equals the latitude of the installation site. For Kathmandu (27.7°N), optimal tilt ≈ 27.7°. This maximizes the annual average of cos(angle of incidence). Source: Duffie & Beckman (2013).", year:"Possible" },
  { q:"Biogas composition by volume is approximately:", opts:["90% CH₄, 10% CO₂","55-70% CH₄, 30-45% CO₂","50% CH₄, 50% H₂","40% CH₄, 60% N₂"], correct:1, explain:"Biogas from anaerobic digestion of cattle dung contains 55-70% methane (CH₄) and 30-45% carbon dioxide (CO₂), plus trace amounts of H₂S. The methane content determines calorific value (~22 MJ/m³). Source: KU Lecture Slides Ch.3.", year:"Possible" },
  { q:"Which instrument measures DIRECT normal irradiance (DNI) only?", opts:["Pyranometer","Pyrheliometer","Anemometer","Pygeometer"], correct:1, explain:"Pyrheliometer (with collimating tube) measures only beam/direct radiation on a surface normal to the sun. Pyranometer measures GLOBAL irradiance (direct + diffuse) on a horizontal surface. Anemometer = wind speed. Source: KU Jul/Aug 2024 MCQ.", year:"Jul/Aug 2024" },
  { q:"The efficiency of a downdraft gasifier for electricity generation is typically:", opts:["5-10%","15-25%","40-50%","60-70%"], correct:1, explain:"Gasifier-engine systems achieve 15-25% electrical efficiency. The gasifier converts biomass to syngas at ~70-80% thermal efficiency, but the IC engine converts syngas to electricity at only ~25-30%, giving overall electrical efficiency of 15-25%. Source: Basu (2010).", year:"Possible" },
  { q:"Nepal's per capita electricity consumption (FY 2079/80) is approximately:", opts:["100 kWh/year","369 kWh/year","500 kWh/year","900 kWh/year"], correct:1, explain:"Nepal's per capita electricity consumption is approximately 369 kWh/year — far below the South Asian average (~900 kWh/year) and global average (~3,000 kWh/year). Despite 98% electrification, consumption remains low due to poverty and small system sizes. Source: WECS 2024.", year:"Possible" },
  { q:"The Betz limit states that a wind turbine can extract a maximum of:", opts:["100% of wind power","59.3% of wind power","45% of wind power","33% of wind power"], correct:1, explain:"The Betz limit = 16/27 ≈ 59.3% is the theoretical maximum fraction of wind power extractable by any turbine. Derived from conservation of momentum — if all kinetic energy were extracted, the air would stop and block the rotor. Modern turbines achieve Cp ≈ 0.40-0.48. Source: Twidell & Weir (2015).", year:"Possible" },
  { q:"In Nepal, the primary fuel used for cooking in rural households is:", opts:["LPG","Biogas","Firewood","Kerosene"], correct:2, explain:"According to CBS 2021 census data, 51.02% of Nepal's 6.67 million households use firewood (wood) as their primary cooking fuel. LPG is second at 44.29%, followed by cow dung (2.88%), biogas (1.18%), electricity (0.49%), and kerosene (0.05%). Source: CBS 2021.", year:"Possible" },
  { q:"The hydraulic retention time (HRT) for a typical household biogas plant in Nepal is:", opts:["5-10 days","20-30 days","30-60 days","90-120 days"], correct:2, explain:"Typical HRT for fixed dome household biogas plants in Nepal's climate is 30-60 days (mesophilic conditions at 20-35°C ambient). Colder mountain regions need longer HRT. The GGC 2047 standard design uses 40-60 days. Source: KU Lecture Slides Ch.3.", year:"Possible" },
  { q:"The Performance Ratio (PR) of a PV system accounts for:", opts:["Only temperature losses","Only wiring losses","All real-world losses including temperature, wiring, soiling, inverter","Only inverter losses"], correct:2, explain:"PR = actual energy output / ideal energy output. It captures all real-world losses: temperature losses (~5-10%), wiring resistance (~2-3%), soiling/dust (~2-5%), inverter losses (~3-5%), mismatch (~1-2%). Typical PR = 0.75-0.85. Source: Masters (2004).", year:"Possible" },
  { q:"Which type of solar collector has NO convection losses in the evacuated space?", opts:["Flat plate collector","Concentrating parabolic collector","Evacuated tube collector","Thermosyphon collector"], correct:2, explain:"Evacuated tube collectors have a vacuum between the absorber and outer glass tube — eliminating convective heat losses entirely. Only radiation losses remain. This allows higher operating temperatures (60-200°C) and better performance in cold ambient conditions. Source: Duffie & Beckman (2013).", year:"Possible" },
  { q:"The standard monitoring height for wind resource assessment is:", opts:["5 m only","10 m (reference standard)","50 m only","100 m only"], correct:1, explain:"The international standard reference height for wind speed measurement is 10 m above ground. WRA masts typically measure at 10m (reference), 50m, 80m, and 100m (hub height) to characterize the wind profile and extrapolate to hub height using the power law. Source: KU Lecture Slides Ch.6.", year:"Possible" },
  { q:"The transesterification reaction produces biodiesel from:", opts:["Cellulose + water","Vegetable oil + methanol","Starch + yeast","Lignin + hydrogen"], correct:1, explain:"Transesterification: Triglycerides (vegetable/animal oil) + methanol (with catalyst NaOH/KOH) → Fatty Acid Methyl Esters (FAME = biodiesel) + glycerol. The glycerol is a valuable byproduct used in cosmetics/pharmaceuticals. Source: KU Dec 2022 MCQ.", year:"Dec 2022" },
  { q:"In a binary cycle geothermal power plant, the working fluid in the turbine is:", opts:["Steam from the geothermal well","A secondary fluid like isobutane","Liquid water","Hydrogen gas"], correct:1, explain:"Binary cycle plants use a secondary organic working fluid (isobutane, pentane, or ammonia) with a lower boiling point. The geothermal brine heats this fluid in a heat exchanger — the brine never contacts the turbine. This allows use of moderate-temperature resources (100-180°C) with ZERO direct emissions. Source: KU Lecture Slides Ch.8.", year:"Possible" },
];

// ═══════════════════════════════════════════════════════
//  FILL-IN-THE-BLANK DATA (Jul/Aug 2024 Section B)
// ═══════════════════════════════════════════════════════


// ═══════════════════════════════════════════════════════
//  FLASHCARDS
// ═══════════════════════════════════════════════════════
const flashcards = [
  // ─── Ch 1: Energy Overview ───
  { ch:"Ch 1", q:"What % of Nepal's electricity comes from RoR hydropower?", a:">90% (FY 2079/80). This makes Nepal's power highly seasonal — surplus in monsoon, shortage in dry season. Source: WECS 2024." },
  { ch:"Ch 1", q:"What is the total energy consumption of Nepal in FY 2079/80?", a:"~532 PJ. Traditional biomass (63.87%) dominates, followed by imported energy (27%). Source: WECS Energy Synopsis 2024." },
  { ch:"Ch 1", q:"What are the 3 dimensions of the Energy Trilemma?", a:"① Energy Security (reliable supply) ② Energy Equity (affordable access) ③ Environmental Sustainability (low carbon). Nepal is weak on Security due to RoR dependence." },
  { ch:"Ch 1", q:"What is Nepal's household electrification rate (2023)?", a:"98% (16th Plan). 96.7% via national grid + 1.3% via alternative means (solar home systems). Source: NEA 2023." },
  { ch:"Ch 1", q:"What does a Sankey diagram show?", a:"Graphical representation of energy flows where arrow width ∝ quantity. Shows primary sources → conversion → end uses + losses. Nepal's: firewood → cooking (65% of total energy)." },
  // ─── Ch 2: Biomass ───
  { ch:"Ch 2", q:"What is the Betz limit for wind turbines?", a:"16/27 ≈ 59.3% maximum. Modern turbines achieve Cp = 0.40–0.48. P = ½ρAv³ → Pmax = 0.593×Pwind." },
  { ch:"Ch 2", q:"HHV vs LHV — formula and difference?", a:"LHV = HHV − hvap×(9H + M). H=hydrogen fraction, M=moisture fraction, hvap≈2.442 MJ/kg. LHV = usable energy; HHV includes steam condensation heat. Always use LHV for engines." },
  { ch:"Ch 2", q:"Best gasifier type for IC engine operation?", a:"Downdraft gasifier — produces <1 g/Nm³ tar (vs 50 g/Nm³ for updraft). Low tar → usable directly in engines without extensive cleaning." },
  { ch:"Ch 2", q:"Three modes of pyrolysis and their main products?", a:"① Slow pyrolysis → maximises biochar (~35%) ② Fast pyrolysis → maximises bio-oil (~75%) ③ Flash pyrolysis → rapid bio-oil production. All occur without oxygen." },
  { ch:"Ch 2", q:"What is the WBT and its 3 phases?", a:"Water Boiling Test for cookstove testing. ① Cold Start (stove cold) ② Hot Start (stove warm) ③ Simmering (maintain boil 45 min). 'Controlled Cooking' is NOT part of WBT." },
  { ch:"Ch 2", q:"Difference between updraft and downdraft gasifier?", a:"Updraft: air from bottom, gas from top, HIGH tar (~50g/Nm³), good for direct heat. Downdraft: both air and gas from bottom, LOW tar (<1g/Nm³), ideal for IC engines." },
  // ─── Ch 3: Biogas ───
  { ch:"Ch 3", q:"Optimum pH for anaerobic digestion?", a:"6.8–7.2. Below pH 6 → VFA accumulation → methanogens die → digester 'sours'. Recovery needs lime/NaHCO₃ addition." },
  { ch:"Ch 3", q:"LPG equivalent of biogas?", a:"1 m³ biogas ≈ 0.45 kg LPG. Basis: CVbiogas = 22 MJ/m³, CVLPG = 47 MJ/kg → ratio = 22/47 ≈ 0.47." },
  { ch:"Ch 3", q:"What digester gives CONSTANT gas pressure?", a:"Floating Dome — the steel drum floats and rises/falls with gas production, maintaining constant weight = constant pressure. Fixed dome = VARIABLE pressure." },
  { ch:"Ch 3", q:"Biogas plant volume formula?", a:"V = W × HRT / (1 + rd) where W = daily dung (kg/day), HRT = hydraulic retention time (days), rd = dilution ratio (usually 1 for 1:1 dung:water)." },
  { ch:"Ch 3", q:"4 stages of anaerobic digestion in order?", a:"① Hydrolysis: polymers→monomers ② Acidogenesis: monomers→VFAs ③ Acetogenesis: VFAs→acetic acid+H₂ ④ Methanogenesis: acetate→CH₄+CO₂ (rate-limiting step)." },
  { ch:"Ch 3", q:"Why is Fixed Dome most common in Nepal?", a:"Underground = insulated from cold, no moving parts = 20+ year life, uses local materials (brick+cement), standardised GGC 2047 model, 450,000+ installed. No steel to corrode." },
  // ─── Ch 4: Solar Thermal ───
  { ch:"Ch 4", q:"Does a thermosyphon solar heater need a pump?", a:"NO — uses natural convection. Hot water rises (less dense), cold water sinks (denser) → continuous circulation. Tank MUST be above collector by ≥300mm." },
  { ch:"Ch 4", q:"HWB equation for flat plate collector?", a:"η = FR[τα − UL(Ti−Ta)/G]. FR=heat removal factor, τα=transmittance-absorptance (~0.8), UL=heat loss coeff (3-8 W/m²K). Plot η vs (Ti−Ta)/G → straight line." },
  { ch:"Ch 4", q:"Solar declination formula and range?", a:"δ = 23.45° × sin[360/365 × (284+n)]. Range: −23.45° (Dec 21) to +23.45° (Jun 21). Equinoxes: δ=0°. n = day number of year." },
  { ch:"Ch 4", q:"Flat plate vs evacuated tube collector — when to use each?", a:"Flat plate: 40–80°C, lower cost ($150-300/m²), domestic hot water. Evacuated tube: 60–200°C, higher cost, better in cold climates, industrial/institutional use." },
  { ch:"Ch 4", q:"Solar zenith angle formula?", a:"cos(θz) = sin(φ)sin(δ) + cos(φ)cos(δ)cos(ω). φ=latitude, δ=declination, ω=hour angle. ω=(Solar time−12)×15°/hr." },
  // ─── Ch 5: Solar PV ───
  { ch:"Ch 5", q:"Effect of high temperature on solar cell IV curve?", a:"Voc DECREASES ~2.3mV/°C per cell (dominant effect). Isc increases slightly (+0.06%/°C). Net: efficiency drops ~0.4-0.5%/°C above STC (25°C)." },
  { ch:"Ch 5", q:"PV water pump sizing formula?", a:"P_PV = ρgHV / (ηpump × PSH × LMF × DF). PSH=Peak Sun Hours, LMF=load mismatching factor, DF=derating factor." },
  { ch:"Ch 5", q:"What is Fill Factor of a solar cell?", a:"FF = Pmax/(Isc×Voc) = (Imp×Vmp)/(Isc×Voc). Good cell: FF>0.75. Low FF indicates high series resistance, low shunt resistance, or recombination defects." },
  { ch:"Ch 5", q:"3 generations of PV technology?", a:"1st: Crystalline silicon (mono/poly), 18-24%, 80%+ market share. 2nd: Thin film (CdTe, CIGS, a-Si), 8-15%, flexible. 3rd: Multi-junction, perovskite, concentrator, 30-46% (research)." },
  { ch:"Ch 5", q:"Battery bank sizing formula?", a:"Ah = (Edaily × Nauto) / (Vsys × DOD × ηbat). Nauto=autonomy days, DOD=depth of discharge (0.8 Li-ion), ηbat=0.90." },
  { ch:"Ch 5", q:"What is MPPT and why is it important?", a:"Maximum Power Point Tracking — continuously adjusts PV operating point to extract maximum power as irradiance and temperature change. Gains 10-30% more energy vs fixed PWM controllers." },
  // ─── Ch 6: Wind ───
  { ch:"Ch 6", q:"Wind power formula and Betz limit?", a:"P = ½ρAv³. Betz limit = 16/27 = 59.3% (theoretical max). Modern turbines: Cp=0.40-0.48. Key: P∝v³ → 10% more wind = 33% more power." },
  { ch:"Ch 6", q:"Power law for wind speed scaling?", a:"v₂/v₁ = (h₂/h₁)^α. α = friction coefficient: open water=0.10, open land=0.14, crops/hedges=0.20, forest/buildings=0.30. Each doubling of height gives significant speed gain." },
  { ch:"Ch 6", q:"3 key parameters in Wind Resource Assessment (WRA)?", a:"① Wind Speed (10-100m, min 1 year data — most critical, P∝v³) ② Wind Direction (wind rose, prevailing direction for turbine layout) ③ Turbulence Intensity (TI=σv/v, IEC class selection)." },
  { ch:"Ch 6", q:"HAWT vs VAWT — what does HAWT require that VAWT doesn't?", a:"HAWT requires active yaw drive to face the wind. VAWTs accept wind from any direction. HAWTs have higher efficiency and lower cost-to-power ratio despite this extra complexity." },
  { ch:"Ch 6", q:"Wind turbine cut-in, rated, and cut-out speeds?", a:"Cut-in: 3-5 m/s (minimum for generation). Rated: 11-13 m/s (full power output). Cut-out: ~25 m/s (shutdown for safety). Between rated and cut-out: pitch control limits power." },
  // ─── Ch 7: Energy Storage ───
  { ch:"Ch 7", q:"What does PHES stand for and why is it important for Nepal?", a:"Pumped Hydro Energy Storage. Pumps water uphill (cheap/excess power) → releases downhill (peak demand). Solves Nepal's seasonal surplus/deficit from RoR hydropower. ~95% of global grid storage." },
  { ch:"Ch 7", q:"PHES energy storage formula?", a:"E = ρgVHη / 3,600,000 [MWh]. ρ=1000 kg/m³, V=reservoir volume (m³), H=head (m), η=0.70-0.85 round-trip efficiency." },
  { ch:"Ch 7", q:"Main disadvantage of super capacitors?", a:"Very low energy density (~5-10 Wh/kg vs 150 Wh/kg for Li-ion). High self-discharge (10-20%/day). Low cell voltage (2.5V). BUT: >95% efficiency, millions of cycles, instant charge/discharge." },
  { ch:"Ch 7", q:"Why are SLI batteries NOT suitable for renewable energy storage?", a:"SLI (Starting, Lighting, Ignition) batteries designed for shallow discharge only (10-20% DoD). Deep cycling destroys lead plates within 30-50 cycles. Also tiny capacity (2-100 Wh)." },
  // ─── Ch 8: Hydro & Others ───
  { ch:"Ch 8", q:"Minimum ΔT for OTEC to be effective?", a:">10°C (commercially viable: ≥20°C). Ocean Thermal Energy Conversion uses warm surface water vs cold deep water. Carnot efficiency at ΔT=20°C is only ~6.6% — but fuel is free." },
  { ch:"Ch 8", q:"What is a Flow Duration Curve (FDC) used for?", a:"Shows % of time river flow equals or exceeds a given discharge. Used for microhydro design: design flow at Q40-Q60, firm power at Q90. Area under FDC = annual energy potential." },
  { ch:"Ch 8", q:"3 types of geothermal power plants?", a:"① Dry Steam: rare, steam direct to turbine ② Flash Steam: most common, high-temp brine flashed to steam ③ Binary Cycle: moderate temp (100-180°C), secondary fluid (isobutane), zero emissions — best for Nepal." },
  { ch:"Ch 8", q:"Tidal power density formula at v=5m/s?", a:"P/A = ½ρv³ = ½×1025×5³ = 62,500 W/m² ≈ 62.5 kW/m². Water is ~825× denser than air → tidal turbines are much smaller than wind turbines for same power." },
];


// ═══════════════════════════════════════════════════════
//  FORMULA CHAPTERS
// ═══════════════════════════════════════════════════════
const formulaChapters = [
  { icon:"💨", title:"Wind Energy", color:"var(--accent3)", formulas:[
    { name:"Power in Wind",
      eq:`$$P = \\frac{1}{2} \\rho A v^3$$`,
      display:`$$\\rho = 1.225 \\text{ kg/m}^3 \\text{ (at STC)}, \\quad A = \\pi R^2 \\text{ (swept area)}$$`,
      note:"Power ∝ v³ — 10% more wind speed = 33% more power" },
    { name:"Betz Limit",
      eq:`$$P_{max} = \\frac{16}{27} \\cdot \\frac{1}{2}\\rho A v^3 = 0.593 \\cdot P_{wind}$$`,
      display:"",
      note:"Theoretical maximum — modern turbines achieve Cp = 0.40–0.48" },
    { name:"Wind Shear (Power Law)",
      eq:`$$\\frac{v_2}{v_1} = \\left(\\frac{h_2}{h_1}\\right)^\\alpha$$`,
      display:`$$\\alpha: \\text{ open land} = 0.14, \\text{ crops/hedges} = 0.20, \\text{ forest} = 0.30$$`,
      note:"Used to scale wind speed from measurement height to hub height" },
    { name:"Specific Power Density",
      eq:`$$\\frac{P}{A} = \\frac{1}{2}\\rho v^3 \\quad [\\text{W/m}^2]$$`,
      display:"",
      note:"Air density: ρ = 1.293 × (273/(273+T)) × (P/101.3) kg/m³" },
  ]},
  { icon:"☀️", title:"Solar Thermal", color:"var(--yellow)", formulas:[
    { name:"Hottel-Whillier-Bliss (HWB) Equation",
      eq:`$$\\eta = F_R \\left[ \\tau\\alpha - U_L \\frac{T_i - T_a}{G} \\right]$$`,
      display:`$$F_R = \\text{heat removal factor}, \\quad \\tau\\alpha = \\text{transmittance-absorptance}, \\quad U_L = \\text{heat loss coeff.}$$`,
      note:"Linear η vs (Ti−Ta)/G graph: y-intercept = FRτα, slope = −FRUL" },
    { name:"Useful Heat Gain",
      eq:`$$Q_u = \\dot{m} \\cdot C_p \\cdot (T_o - T_i) = G \\cdot A_c \\cdot \\eta$$`,
      display:"",
      note:"ṁ in kg/s, Cp = 4180 J/kg·K for water" },
    { name:"Collector Area for Hot Water",
      eq:`$$A_c = \\frac{Q_{demand}}{G \\cdot \\eta_{system} \\cdot \\eta_{collector}}$$`,
      display:`$$Q_{demand} = \\dot{m}_{daily} \\cdot C_p \\cdot \\Delta T \\quad [\\text{kWh/day}]$$`,
      note:"Gdaily in kWh/m²/day" },
    { name:"Solar Declination",
      eq:`$$\\delta = 23.45° \\sin\\left[\\frac{360}{365}(284 + n)\\right]$$`,
      display:"",
      note:"n = day number (Jan 1 = 1). Range: ±23.45°" },
    { name:"Solar Zenith Angle",
      eq:`$$\\cos\\theta_z = \\sin\\phi\\sin\\delta + \\cos\\phi\\cos\\delta\\cos\\omega$$`,
      display:`$$\\omega = (\\text{Solar time} - 12) \\times 15°/\\text{hr}$$`,
      note:"φ = latitude, δ = declination, ω = hour angle" },
  ]},
  { icon:"⚡", title:"Solar PV", color:"var(--accent2)", formulas:[
    { name:"PV Daily Energy Output",
      eq:`$$E_{daily} = P_{rated} \\cdot G_{daily} \\cdot PR$$`,
      display:`$$PR = \\text{Performance Ratio} \\approx 0.75 - 0.85$$`,
      note:"Gdaily = Peak Sun Hours (kWh/m²/day)" },
    { name:"PV Water Pump Sizing",
      eq:`$$P_{PV} = \\frac{\\rho g H V}{\\eta_{pump} \\cdot t_{solar} \\cdot LMF \\cdot DF}$$`,
      display:`$$H = \\text{dynamic head (m)}, \\; V = \\text{daily volume (m}^3\\text{/day)}$$`,
      note:"LMF = load mismatching factor, DF = derating factor" },
    { name:"Battery Bank Sizing",
      eq:`$$Ah = \\frac{E_{daily} \\times N_{auto}}{V_{sys} \\times DOD \\times \\eta_{bat}}$$`,
      display:"",
      note:"Nauto = autonomy days, DOD = depth of discharge (0.8 for Li-ion)" },
    { name:"Fill Factor",
      eq:`$$FF = \\frac{P_{max}}{I_{sc} \\times V_{oc}} = \\frac{I_{mp} \\times V_{mp}}{I_{sc} \\times V_{oc}}$$`,
      display:"",
      note:"Good cell: FF > 0.75. Ideal: FF → 1.0" },
    { name:"Capacity Factor",
      eq:`$$CF = \\frac{E_{annual}}{P_{rated} \\times 8760}$$`,
      display:"",
      note:"Solar PV typical CF = 15–20%. Wind onshore = 25–35%." },
  ]},
  { icon:"🌿", title:"Biogas", color:"var(--green)", formulas:[
    { name:"Biogas Plant Volume",
      eq:`$$V = \\frac{W \\times HRT}{1 + r_d}$$`,
      display:`$$W = \\text{daily dung (kg/day)}, \\quad HRT = \\text{hydraulic retention time (days)}, \\quad r_d = \\text{dilution ratio}$$`,
      note:"For 1:1 dung:water ratio, rd = 1. Typical HRT for Nepal = 30–60 days" },
    { name:"Daily Biogas Production",
      eq:`$$Q_{biogas} = W \\times Y_{biogas}$$`,
      display:`$$Y_{biogas}: \\text{cattle dung} = 30 \\text{ L/kg}, \\text{ food waste} = 80 \\text{ L/kg}$$`,
      note:"" },
    { name:"LPG Equivalent",
      eq:`$$m_{LPG} = Q_{biogas} \\times 0.45 \\quad [\\text{kg LPG/day}]$$`,
      display:`$$\\text{Basis: } CV_{biogas} = 22 \\text{ MJ/m}^3, \\quad CV_{LPG} = 47 \\text{ MJ/kg}$$`,
      note:"1 m³ biogas ≈ 0.45 kg LPG ≈ 0.5 L kerosene" },
  ]},
  { icon:"🔥", title:"Biomass / Calorific Values", color:"var(--orange)", formulas:[
    { name:"Lower Heating Value (LHV)",
      eq:`$$LHV = HHV - h_{vap} \\times (9H + M)$$`,
      display:`$$H = \\text{hydrogen mass fraction}, \\quad M = \\text{moisture mass fraction}$$`,
      note:"hvap = 2.442 MJ/kg (or as given). Always use LHV for engine calculations." },
    { name:"Biomass Power Output",
      eq:`$$P_{elec} = \\dot{m}_{biomass} \\times LHV \\times \\eta_{overall}$$`,
      display:"",
      note:"ṁ in kg/s, typical ηoverall for gasifier-engine = 15–25%" },
  ]},
  { icon:"💧", title:"Hydropower & Storage", color:"#60a5fa", formulas:[
    { name:"Hydro / Pump Power",
      eq:`$$P = \\rho g Q H \\eta$$`,
      display:`$$\\rho = 1000 \\text{ kg/m}^3, \\; g = 9.81 \\text{ m/s}^2, \\; Q = \\text{flow (m}^3\\text{/s)}, \\; H = \\text{head (m)}$$`,
      note:"For pump: η is pump efficiency (~0.60–0.85)" },
    { name:"PHES Energy Storage",
      eq:`$$E = \\frac{\\rho g V H \\eta}{3{,}600{,}000} \\quad [\\text{MWh}]$$`,
      display:`$$V = \\text{reservoir volume (m}^3\\text{)}, \\quad H = \\text{head (m)}, \\quad \\eta = 0.70 - 0.85$$`,
      note:"" },
    { name:"Tidal Power Density",
      eq:`$$\\frac{P}{A} = \\frac{1}{2}\\rho_{water} v^3, \\quad \\rho_{water} = 1025 \\text{ kg/m}^3$$`,
      display:"",
      note:"At v = 5 m/s: P/A = 62.5 kW/m² (50× more than wind at same speed)" },
  ]},
];

// ═══════════════════════════════════════════════════════
//  ANSWER DATA
// ═══════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════
//  REFERENCE REGISTRY — Clickable sources for each answer
// ═══════════════════════════════════════════════════════
const refs = {
  'ku-slides': { icon:'🎓', name:'KU MEEG 328 Lecture Slides', detail:'Prof. Sunil Prasad Lohani, PhD — Kathmandu University', url:'https://ku.edu.np', badge:'ku' },
  'wecs-2024': { icon:'📊', name:'Energy Sector Synopsis Report 2024 (FY 2079/80)', detail:'Water & Energy Commission Secretariat, Government of Nepal', url:'https://www.wecs.gov.np', badge:'wecs' },
  'aepc-2023': { icon:'📊', name:'AEPC Progress at a Glance FY 2079/80', detail:'Alternative Energy Promotion Centre, GoN', url:'https://aepc.gov.np', badge:'wecs' },
  'nea-2023':  { icon:'⚡', name:'NEA Annual Report 2023', detail:'Nepal Electricity Authority', url:'https://www.nea.org.np', badge:'wecs' },
  'cbs-2021':  { icon:'🏠', name:'National Population & Housing Census 2021', detail:'Central Bureau of Statistics, GoN', url:'https://cbs.gov.np', badge:'wecs' },
  'duffie':    { icon:'📖', name:'Solar Engineering of Thermal Processes, 4th Ed.', detail:'Duffie, J.A. & Beckman, W.A. (2013). Wiley.', url:'https://www.wiley.com/en-us/Solar+Engineering+of+Thermal+Processes%2C+4th+Edition-p-9780470873663', badge:'textbook' },
  'masters':   { icon:'📖', name:'Renewable and Efficient Electric Power Systems', detail:'Masters, G.M. (2004). Wiley-IEEE Press.', url:'https://www.wiley.com/en-us/Renewable+and+Efficient+Electric+Power+Systems-p-9780471280606', badge:'textbook' },
  'quaschning':{ icon:'📖', name:'Understanding Renewable Energy Systems, 2nd Ed.', detail:'Quaschning, V. (2016). Earthscan/Routledge.', url:'https://www.routledge.com/Understanding-Renewable-Energy-Systems/Quaschning/p/book/9781138781245', badge:'textbook' },
  'twidell':   { icon:'📖', name:'Renewable Energy Resources, 3rd Ed.', detail:'Twidell, J. & Weir, T. (2015). Routledge.', url:'https://www.routledge.com/Renewable-Energy-Resources/Twidell-Weir/p/book/9780415584388', badge:'textbook' },
  'basu':      { icon:'📖', name:'Biomass Gasification and Pyrolysis', detail:'Basu, P. (2010). Academic Press, Elsevier.', url:'https://www.sciencedirect.com/book/9780123749888/biomass-gasification-and-pyrolysis', badge:'textbook' },
  'bridgwater':{ icon:'📖', name:'Review of Fast Pyrolysis of Biomass (2012)', detail:'Bridgwater, A.V. Bioresource Technology, Vol.101.', url:'https://doi.org/10.1016/j.biortech.2010.08.100', badge:'textbook' },
  'iea-2023':  { icon:'🌍', name:'World Energy Outlook 2023', detail:'International Energy Agency (IEA)', url:'https://www.iea.org/reports/world-energy-outlook-2023', badge:'iea' },
  'irena-2021':{ icon:'🌍', name:'Renewable Power Generation Costs in 2021', detail:'IRENA — International Renewable Energy Agency', url:'https://www.irena.org/publications/2022/Jul/Renewable-Power-Generation-Costs-in-2021', badge:'iea' },
  'lohani-2021':{ icon:'📄', name:'Waste to Energy in Kathmandu Nepal', detail:'Lohani et al. (2021). Sustainable Development, 906–914.', url:'https://doi.org/10.1002/sd.2177', badge:'ku' },
  'ku-exam-2022': { icon:'📝', name:'KU MEEG 328 End Semester Exam — Dec 2022', detail:'Kathmandu University, Department of Mechanical Engineering', url:'', badge:'ku' },
  'ku-exam-2024': { icon:'📝', name:'KU MEEG 328 End Semester Exam — Jul/Aug 2024', detail:'Kathmandu University, Department of Mechanical Engineering', url:'', badge:'ku' },
  'ku-exam-2025': { icon:'📝', name:'KU MEEG 328 End Semester Exam — Jul 2025', detail:'Kathmandu University, Department of Mechanical Engineering', url:'', badge:'ku' },
};

function buildRefs(keys){
  if(!keys||keys.length===0) return '';
  const badgeColors = { wecs:'rgba(34,211,160', ku:'rgba(167,139,250', textbook:'rgba(56,189,248', iea:'rgba(251,191,36' };
  return `<div class="ans-refs">
    <div class="ans-refs-title">📚 References & Sources</div>
    ${keys.map(k => {
      const r = refs[k];
      if(!r) return '';
      const bc = badgeColors[r.badge]||'rgba(100,116,139';
      return `<div class="ans-ref-item">
        <div class="ans-ref-icon">${r.icon}</div>
        <div class="ans-ref-body">
          <div class="ref-name">${r.name}</div>
          <div class="ref-detail">${r.detail}</div>
          ${r.url ? `<a href="${r.url}" target="_blank" class="ans-ref-link">🔗 Open Source</a>` : ''}
        </div>
        <span style="font-family:var(--font-mono);font-size:9px;padding:3px 8px;border-radius:100px;border:1px solid ${bc},0.3);background:${bc},0.08);color:${bc},1);flex-shrink:0;align-self:flex-start;">${r.badge.toUpperCase()}</span>
      </div>`;
    }).join('')}
  </div>`;
}const answerData = {
  'ch1_0': { marks:"5+6", refs:['ku-slides', 'wecs-2024', 'ku-exam-2024'], content:`<h4>Nepal's Energy Scenario & RoR Hydropower Dependence</h4>
<h4>Current Energy Consumption Scenario of Nepal</h4>
<ul><li>Total energy consumption (FY 2079/80): ~532 PJ, with ~16.8% decrease from previous year</li><li>Dominant source: Traditional biomass (firewood, dung) accounts for ~68% of total energy — used for cooking in rural areas</li><li>Modern energy: Hydropower >90% of electricity, petroleum products ~15%</li><li>Per capita electricity consumption: ~369 kWh/year (much lower than South Asian average of ~900 kWh/year)</li><li>Renewable sources (solar, biogas, micro-hydro): growing but still <5% of total</li></ul>
<h4>Is Heavy RoR Reliance the Right Approach?</h4>
<div class="step"><strong>Problem with RoR:</strong> Nepal's rivers have highly seasonal flow — 70-80% of flow occurs during monsoon (June-September). In dry season, flows drop dramatically. RoR plants have no reservoir to store water, so electricity generation drops by 40-60% in winter. This causes seasonal blackouts ("load shedding") even with installed capacity exceeding demand.</div>
<div class="step"><strong>Energy security risk:</strong> A single extreme drought year or climate-change-induced glacier retreat can cripple the entire electricity supply. No diversity = no resilience.</div>
<div class="wp">Conclusion: Heavy RoR reliance is NOT the right long-term energy security strategy. It creates a supply-demand mismatch — surplus in monsoon, shortage in dry season.</div>
<h4>Why Nepal Needs Diverse Energy Mix</h4>
<ul><li><strong>Storage hydropower:</strong> Reservoir-based plants provide firm capacity year-round (Upper Tamakoshi, Kali Gandaki A)</li><li><strong>Solar PV:</strong> Peak generation in dry season (winter/spring) complements RoR perfectly</li><li><strong>Wind:</strong> Nepal's wind resources are largely untapped — good wind in transition seasons</li><li><strong>Pumped hydro storage (PHES):</strong> Store excess monsoon energy for dry season use</li><li><strong>Cross-border trade:</strong> Import/export with India to balance seasonal surpluses/deficits</li></ul>
<div class="kp">Ideal energy mix for Nepal: RoR hydro (base) + Reservoir hydro (firm capacity) + Solar PV (dry season supplement) + PHES (seasonal storage) + Wind (diversification). Diversity = security.</div>` },

  'ch1_1': { marks:"2+3", refs:['ku-slides', 'ku-exam-2022', 'iea-2023'], content:`<h4>COP27 Key Decisions + EV Barriers in Nepal</h4>
<h4>COP27 Major Decisions (Sharm el-Sheikh, Egypt, 2022)</h4>
<ul><li><strong>Loss and Damage Fund:</strong> Historic agreement to create a fund for developing nations suffering climate-related loss and damage — a long-overdue decision after 30 years of negotiations</li><li><strong>Phase-down of fossil fuels:</strong> Language maintained from Glasgow (COP26) calling for phase-down (not phase-out) of coal and phasing-out of "inefficient" fossil fuel subsidies</li><li><strong>Renewable energy:</strong> Reaffirmed commitment to triple renewable energy capacity by 2030 and double energy efficiency improvements</li><li><strong>1.5°C target:</strong> Barely kept alive — most INDCs submitted are still insufficient to limit warming to 1.5°C</li></ul>
<h4>Reflection on Challenges</h4>
<p>The agreements are significant but implementation is weak. The Loss and Damage fund has no clear funding mechanism. Major emitters (US, EU, China) have not submitted sufficient NDC updates. The "phase-down not phase-out" language on coal is too weak.</p>
<h4>3 Major Barriers to EV Adoption in Nepal</h4>
<div class="step"><strong>1. High upfront cost:</strong> EVs cost 40-60% more than equivalent ICE vehicles in Nepal due to import taxes, limited local assembly, and no manufacturing base. Most Nepali consumers cannot afford EVs without subsidies.</div>
<div class="step"><strong>2. Inadequate charging infrastructure:</strong> Nepal has very few public charging stations outside Kathmandu valley. For long-distance and hilly terrain travel — essential in Nepal's geography — range anxiety is a major deterrent.</div>
<div class="step"><strong>3. Seasonal power shortage:</strong> Nepal's dry season (Nov-May) sees severe electricity shortage from its RoR-dominated grid. Charging EVs during load-shedding is impossible — ironically, the country with the most hydropower potential struggles to charge EVs in dry season.</div>` },

  'ch1_2': { marks:"5+6", refs:['ku-slides', 'ku-exam-2025', 'wecs-2024', 'iea-2023'], content:`<h4>Global Energy Scenario & Nepal's Energy Security</h4>
<h4>Global Energy Scenario and Climate Change</h4>
<ul><li>Fossil fuels still provide ~80% of global primary energy despite 30 years of climate action</li><li>Global CO₂ emissions reached record highs in 2022 — current policies track 2.5-3°C warming by 2100</li><li>Renewable energy is growing rapidly: solar and wind now cheapest sources of new electricity in most countries</li><li>Energy transition is uneven: developed nations leading, LDCs still depend on traditional biomass</li><li>Energy poverty affects ~700 million people globally — mostly in Africa and South Asia</li></ul>
<h4>Nepal's Energy Supply and Consumption</h4>
<ul><li><strong>Supply:</strong> Hydropower dominates electricity (>90% RoR). Traditional biomass (firewood) still dominates total energy (68%). Petroleum imports create trade deficit.</li><li><strong>Consumption:</strong> Residential sector (cooking) = largest consumer. Industrial sector growing. Transport sector shifting toward EVs.</li></ul>
<h4>Energy Security Perspective</h4>
<div class="step"><strong>Availability:</strong> Nepal has massive hydropower potential (83,000 MW) but only ~2,500 MW developed. Large untapped solar and wind resources.</div>
<div class="step"><strong>Accessibility:</strong> 95% household electrification achieved, but quality and reliability poor. Rural areas still depend on firewood.</div>
<div class="step"><strong>Affordability:</strong> Electricity is affordable but petroleum is expensive (imported, price-volatile).</div>
<div class="step"><strong>Sustainability:</strong> RoR-based electricity is clean but seasonally unreliable. Traditional biomass causes deforestation and indoor air pollution (1,600 deaths/year from cook stove smoke).</div>
<div class="kp">Key vulnerability: 90% electricity from RoR + 68% energy from firewood = double dependence on weather/nature. Diverse energy mix (reservoir hydro + solar + wind + biogas) is essential for energy security.</div>` },

  'ch2_0': { marks:"3+2", refs:['ku-slides', 'ku-exam-2022', 'basu'], content:`<h4>Gasification Superstructure Design — Charcoal Feedstock, ~150 kWe Output</h4>
<h4>Analysis of Given Conditions → Gasifier Choice</h4>
<div class="step"><strong>Charcoal feedstock:</strong> Charcoal has low moisture, high energy density, and is a solid fuel. Best gasified in a <strong>Downdraft gasifier</strong> for IC engine use.</div>
<div class="step"><strong>No load fluctuations:</strong> Implies steady-state operation — suits fixed-output downdraft design.</div>
<div class="step"><strong>High energy value, fire hazard:</strong> Charcoal has high HHV (~30 MJ/kg). Extra care needed in feeding and cooling systems.</div>
<div class="step"><strong>Particle-less, Sulphur-free byproduct:</strong> Requires: cyclone separator (particles) + scrubber/filter (tar + sulphur) + wet scrubber or dry filter.</div>
<div class="step"><strong>Final output ~150 kWe:</strong> IC engine-generator set driven by syngas from gasifier.</div>
<h4>Superstructure Block Diagram</h4>
<div class="vis-box"><div class="vis-title">Gasification Superstructure — Charcoal to 150 kWe</div><svg viewBox="0 0 500 230" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:500px;"><defs><marker id="ga" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L0,6 L6,3 z" fill="#22d3a0"/></marker></defs><rect x="2" y="8" width="90" height="30" rx="5" fill="rgba(251,191,36,0.1)" stroke="rgba(251,191,36,0.4)" stroke-width="1"/><text x="47" y="20" fill="#fbbf24" font-size="8" text-anchor="middle" font-family="monospace">CHARCOAL</text><text x="47" y="31" fill="#94a3b8" font-size="7" text-anchor="middle">Feedstock</text><line x1="92" y1="23" x2="104" y2="23" stroke="#22d3a0" stroke-width="1.2" marker-end="url(#ga)"/><rect x="105" y="8" width="80" height="30" rx="5" fill="rgba(34,211,160,0.08)" stroke="rgba(34,211,160,0.3)" stroke-width="1"/><text x="145" y="20" fill="#22d3a0" font-size="7.5" text-anchor="middle" font-family="monospace">SIZE REDUCTION</text><text x="145" y="31" fill="#94a3b8" font-size="6.5" text-anchor="middle">+ Drying &lt;20%</text><line x1="185" y1="23" x2="197" y2="23" stroke="#22d3a0" stroke-width="1.2" marker-end="url(#ga)"/><rect x="198" y="2" width="90" height="42" rx="5" fill="rgba(56,189,248,0.1)" stroke="rgba(56,189,248,0.4)" stroke-width="1.5"/><text x="243" y="17" fill="#38bdf8" font-size="7.5" text-anchor="middle" font-family="monospace">DOWNDRAFT</text><text x="243" y="28" fill="#38bdf8" font-size="7.5" text-anchor="middle" font-family="monospace">GASIFIER</text><text x="243" y="39" fill="#94a3b8" font-size="6.5" text-anchor="middle">700-900°C</text><line x1="288" y1="23" x2="300" y2="23" stroke="#22d3a0" stroke-width="1.2" marker-end="url(#ga)"/><rect x="301" y="8" width="75" height="30" rx="5" fill="rgba(34,211,160,0.08)" stroke="rgba(34,211,160,0.3)" stroke-width="1"/><text x="338" y="20" fill="#22d3a0" font-size="7.5" text-anchor="middle" font-family="monospace">CYCLONE</text><text x="338" y="31" fill="#94a3b8" font-size="6.5" text-anchor="middle">Particle removal</text><line x1="376" y1="23" x2="388" y2="23" stroke="#22d3a0" stroke-width="1.2" marker-end="url(#ga)"/><rect x="389" y="8" width="80" height="30" rx="5" fill="rgba(34,211,160,0.08)" stroke="rgba(34,211,160,0.3)" stroke-width="1"/><text x="429" y="20" fill="#22d3a0" font-size="7.5" text-anchor="middle" font-family="monospace">GAS COOLER</text><text x="429" y="31" fill="#94a3b8" font-size="6.5" text-anchor="middle">&lt;40°C for engine</text><line x1="429" y1="38" x2="429" y2="58" stroke="#22d3a0" stroke-width="1.2" marker-end="url(#ga)"/><rect x="379" y="58" width="100" height="30" rx="5" fill="rgba(34,211,160,0.08)" stroke="rgba(34,211,160,0.3)" stroke-width="1"/><text x="429" y="70" fill="#22d3a0" font-size="7.5" text-anchor="middle" font-family="monospace">WET SCRUBBER</text><text x="429" y="81" fill="#94a3b8" font-size="6.5" text-anchor="middle">Tar+H₂S removal</text><line x1="379" y1="73" x2="367" y2="73" stroke="#22d3a0" stroke-width="1.2" marker-end="url(#ga)"/><rect x="270" y="58" width="96" height="30" rx="5" fill="rgba(34,211,160,0.08)" stroke="rgba(34,211,160,0.3)" stroke-width="1"/><text x="318" y="70" fill="#22d3a0" font-size="7.5" text-anchor="middle" font-family="monospace">FABRIC FILTER</text><text x="318" y="81" fill="#94a3b8" font-size="6.5" text-anchor="middle">Final particles</text><line x1="270" y1="73" x2="258" y2="73" stroke="#22d3a0" stroke-width="1.2" marker-end="url(#ga)"/><rect x="160" y="58" width="96" height="30" rx="5" fill="rgba(167,139,250,0.1)" stroke="rgba(167,139,250,0.4)" stroke-width="1.5"/><text x="208" y="70" fill="#a78bfa" font-size="7.5" text-anchor="middle" font-family="monospace">SYNGAS</text><text x="208" y="81" fill="#94a3b8" font-size="6.5" text-anchor="middle">CO+H₂+CH₄</text><line x1="160" y1="73" x2="148" y2="73" stroke="#22d3a0" stroke-width="1.2" marker-end="url(#ga)"/><rect x="40" y="58" width="106" height="30" rx="5" fill="rgba(251,191,36,0.1)" stroke="rgba(251,191,36,0.4)" stroke-width="1.5"/><text x="93" y="70" fill="#fbbf24" font-size="7.5" text-anchor="middle" font-family="monospace">IC ENGINE</text><text x="93" y="81" fill="#94a3b8" font-size="6.5" text-anchor="middle">~150 kWe output</text></svg></div>
<h4>Why Downdraft?</h4>
<p>Tar content <1 g/Nm³ (vs 50 g/Nm³ for updraft). Produces cleaner syngas directly suitable for IC engines without extensive cleaning. Best for charcoal + uniform steady load.</p>` },

  'ch3_0': { marks:"1+4+6", refs:['ku-slides', 'ku-exam-2024', 'wecs-2024'], content:`<h4>Anaerobic Digestion — Definition, Biochemistry & Biogas Plant Design</h4>

<h4>What is Anaerobic Digestion?</h4>
<p>Biological decomposition of organic matter by microorganisms in the <strong>complete absence of oxygen</strong>, producing biogas and nutrient-rich digestate.</p>

<h4>4 Biochemical Stages</h4>
<div class="vis-box" style="padding:0;overflow:hidden;border-radius:10px;">
<svg viewBox="0 0 560 175" xmlns="http://www.w3.org/2000/svg" style="width:100%;display:block;background:#0d1318;">
  <defs><marker id="arrAD" markerWidth="7" markerHeight="7" refX="6" refY="3" orient="auto"><path d="M0,0 L7,3 L0,6 Z" fill="#3a5568"/></marker></defs>
  <text x="280" y="22" fill="#3a5568" font-size="8.5" font-family="JetBrains Mono,monospace" text-anchor="middle" letter-spacing="0.1em">BIOCHEMICAL PATHWAY — ANAEROBIC DIGESTION</text>
  <!-- Boxes -->
  <rect x="10" y="35" width="118" height="72" rx="8" fill="#0a1a14" stroke="#22d3a0" stroke-width="1.5"/>
  <rect x="150" y="35" width="118" height="72" rx="8" fill="#0a1420" stroke="#38bdf8" stroke-width="1.5"/>
  <rect x="290" y="35" width="118" height="72" rx="8" fill="#1a140a" stroke="#fbbf24" stroke-width="1.5"/>
  <rect x="430" y="35" width="118" height="72" rx="8" fill="#150a1a" stroke="#a78bfa" stroke-width="1.5"/>
  <!-- Titles -->
  <text x="69" y="52" fill="#22d3a0" font-size="11" font-family="Syne,sans-serif" text-anchor="middle" font-weight="700">Hydrolysis</text>
  <text x="209" y="52" fill="#38bdf8" font-size="11" font-family="Syne,sans-serif" text-anchor="middle" font-weight="700">Acidogenesis</text>
  <text x="349" y="52" fill="#fbbf24" font-size="11" font-family="Syne,sans-serif" text-anchor="middle" font-weight="700">Acetogenesis</text>
  <text x="489" y="52" fill="#a78bfa" font-size="11" font-family="Syne,sans-serif" text-anchor="middle" font-weight="700">Methanogenesis</text>
  <!-- Stage numbers -->
  <text x="69" y="64" fill="#4a6070" font-size="7.5" font-family="JetBrains Mono,monospace" text-anchor="middle">Stage 1</text>
  <text x="209" y="64" fill="#4a6070" font-size="7.5" font-family="JetBrains Mono,monospace" text-anchor="middle">Stage 2</text>
  <text x="349" y="64" fill="#4a6070" font-size="7.5" font-family="JetBrains Mono,monospace" text-anchor="middle">Stage 3</text>
  <text x="489" y="64" fill="#4a6070" font-size="7.5" font-family="JetBrains Mono,monospace" text-anchor="middle">Stage 4</text>
  <!-- Descriptions -->
  <text x="69" y="79" fill="#7a9ab0" font-size="8.5" font-family="DM Sans,sans-serif" text-anchor="middle">Polymers → Monomers</text>
  <text x="69" y="92" fill="#4a6070" font-size="7.5" font-family="DM Sans,sans-serif" text-anchor="middle">(sugars, amino acids,</text>
  <text x="69" y="102" fill="#4a6070" font-size="7.5" font-family="DM Sans,sans-serif" text-anchor="middle">fatty acids)</text>
  <text x="209" y="79" fill="#7a9ab0" font-size="8.5" font-family="DM Sans,sans-serif" text-anchor="middle">Monomers → VFAs</text>
  <text x="209" y="92" fill="#4a6070" font-size="7.5" font-family="DM Sans,sans-serif" text-anchor="middle">+ CO₂ + H₂</text>
  <text x="349" y="79" fill="#7a9ab0" font-size="8.5" font-family="DM Sans,sans-serif" text-anchor="middle">VFAs → Acetic Acid</text>
  <text x="349" y="92" fill="#4a6070" font-size="7.5" font-family="DM Sans,sans-serif" text-anchor="middle">+ H₂ + CO₂</text>
  <text x="489" y="77" fill="#7a9ab0" font-size="8.5" font-family="DM Sans,sans-serif" text-anchor="middle">CH₄ + CO₂</text>
  <text x="489" y="89" fill="#a78bfa" font-size="7.5" font-family="JetBrains Mono,monospace" text-anchor="middle">⭢ RATE LIMITING</text>
  <text x="489" y="101" fill="#4a6070" font-size="7.5" font-family="DM Sans,sans-serif" text-anchor="middle">pH 6.8–7.2</text>
  <!-- Arrows -->
  <line x1="130" y1="71" x2="146" y2="71" stroke="#3a5568" stroke-width="1.5" marker-end="url(#arrAD)"/>
  <line x1="270" y1="71" x2="286" y2="71" stroke="#3a5568" stroke-width="1.5" marker-end="url(#arrAD)"/>
  <line x1="410" y1="71" x2="426" y2="71" stroke="#3a5568" stroke-width="1.5" marker-end="url(#arrAD)"/>
  <!-- Output pill -->
  <rect x="380" y="118" width="168" height="22" rx="5" fill="rgba(167,139,250,0.1)" stroke="rgba(167,139,250,0.3)" stroke-width="1"/>
  <text x="464" y="133" fill="#a78bfa" font-size="9" font-family="JetBrains Mono,monospace" text-anchor="middle">Biogas: 55–70% CH₄ + CO₂</text>
  <!-- Footer -->
  <text x="280" y="162" fill="#2a3a48" font-size="8.5" font-family="JetBrains Mono,monospace" text-anchor="middle">Optimum temp: 35°C mesophilic  |  HRT: 30–60 days  |  C:N ratio: 20–30:1</text>
</svg></div>
<p style="font-size:12px;color:var(--text2);">Pathways: (a) Acetotrophic: $4CH_3COOH \\rightarrow 4CO_2 + 4CH_4$  &nbsp;&nbsp; (b) Hydrogenotrophic: $CO_2 + 4H_2 \\rightarrow CH_4 + 2H_2O$</p>

<h4>Biogas Plant Design — 500 kg Cattle Dung/day (Janakpur)</h4>
<p><em>Given: W = 500 kg/day, TS = 20%, VS = 80% of TS. Assume HRT = 40 days, dung:water = 1:1, biogas yield = 30 L/kg.</em></p>

<div class="derivation">
  <span class="step-num">Step 1 — Daily Slurry Volume</span>
  $$V_{slurry} = W_{dung} + W_{water} = 500 + 500 = 1000 \\text{ L/day} = 1 \\text{ m}^3\\text{/day}$$
</div>
<div class="derivation">
  <span class="step-num">Step 2 — Digester Volume</span>
  $$V_{digester} = V_{slurry} \\times HRT = 1 \\text{ m}^3\\text{/day} \\times 40 \\text{ days} = \\boxed{40 \\text{ m}^3}$$
</div>
<div class="derivation">
  <span class="step-num">Step 3 — Daily Biogas Production</span>
  $$Q_{biogas} = W \\times Y = 500 \\text{ kg/day} \\times 30 \\text{ L/kg} = \\boxed{15{,}000 \\text{ L/day} = 15 \\text{ m}^3\\text{/day}}$$
</div>
<div class="derivation">
  <span class="step-num">Step 4 — LPG Substitution</span>
  $$m_{LPG} = Q_{biogas} \\times 0.45 = 15 \\times 0.45 = \\boxed{6.75 \\text{ kg LPG/day}}$$
  $$\\text{Basis: } CV_{biogas} = 22 \\text{ MJ/m}^3, \\quad CV_{LPG} = 47 \\text{ MJ/kg} \\quad \\Rightarrow \\text{ratio} = \\frac{22}{47} \\approx 0.45$$
</div>

<div class="kp">✅ Summary: Plant size = 40 m³ | Daily water = 500 L | Biogas = 15 m³/day | LPG saved ≈ 6.75 kg/day ≈ Rs 1,620/day at current prices</div>` },

  'ch3_1': { marks:"1+6+4", refs:['ku-slides', 'ku-exam-2025', 'wecs-2024'], content:`<h4>Anaerobic Digestion, Biodigester Types, Challenges in Nepal</h4>
<h4>Anaerobic Digestion (AD)</h4>
<p>Biological decomposition of organic matter by microorganisms without oxygen, producing biogas (55-70% CH₄, 30-45% CO₂) and nutrient-rich digestate.</p>
<h4>Types of Biodigesters</h4>
<div class="step"><strong>Fixed Dome (Chinese model):</strong> Rigid underground concrete structure. Variable pressure (as gas fills, slurry goes to expansion chamber). ✅ Long lifespan (20+ years), low cost, no moving parts, underground=warm. ❌ Skilled masonry needed, gas pressure variable, difficult to inspect.</div>
<div class="step"><strong>Floating Dome (Indian/KVIC model):</strong> Steel drum floats on slurry, rising and falling to maintain constant pressure. ✅ Constant gas pressure = better for cookstoves, easy to monitor gas volume. ❌ Steel corrodes, higher maintenance and cost.</div>
<div class="step"><strong>Bag Digester (Tubular Plastic):</strong> Low-cost flexible plastic bag. ✅ Cheapest, portable, quick installation. ❌ Short life (2-5 years), vulnerable to damage, not cold-weather suitable.</div>
<h4>Challenges for Large-Scale Commercial Biogas Plants in Nepal</h4>
<ul><li><strong>Feedstock supply:</strong> Consistent supply of organic waste is hard to maintain — seasonal variation, collection logistics from dispersed farms</li><li><strong>Technical issues:</strong> Large digesters need precise pH, temperature, and C:N ratio control — requires skilled operators often unavailable in Nepal</li><li><strong>Market for digestate:</strong> Nutrient-rich digestate is a valuable fertilizer but market development is weak — many plants just waste it</li><li><strong>Gas utilization:</strong> Many plants generate more biogas than can be used locally; no pipeline infrastructure for distribution</li></ul>
<h4>Opportunities</h4>
<ul><li>Upgrade biogas to biomethane for injection into CNG networks</li><li>Electricity generation from larger plants (>100 m³/day)</li><li>Carbon credits from avoided methane emissions</li></ul>` },

  'ch4_1': { marks:5, refs:['ku-slides', 'ku-exam-2024', 'duffie'], content:`<h4>Solar Collector Area Calculation — Commercial Building 1200 L/day</h4>
<p><em>Given: T<sub>i</sub> = 10°C, T<sub>o</sub> = 55°C, G = 4 kWh/m²/day, demand = 1200 L/day, η<sub>sys</sub> = 80%, η<sub>coll</sub> = 60%</em></p>

<div class="vis-box" style="padding:0;overflow:hidden;border-radius:10px;">
<svg viewBox="0 0 560 190" xmlns="http://www.w3.org/2000/svg" style="width:100%;display:block;background:#0d1318;">
  <text x="280" y="18" fill="#3a5568" font-size="8.5" font-family="JetBrains Mono,monospace" text-anchor="middle" letter-spacing="0.1em">SOLAR COLLECTOR — ENERGY BALANCE (1200 L/day EXAMPLE)</text>
  <!-- Bar background tracks -->
  <rect x="140" y="35" width="360" height="28" rx="4" fill="#111820"/>
  <rect x="140" y="73" width="360" height="28" rx="4" fill="#111820"/>
  <rect x="140" y="111" width="360" height="28" rx="4" fill="#111820"/>
  <rect x="140" y="149" width="360" height="28" rx="4" fill="#111820"/>
  <!-- Bars — scaled: 96kWh=full=360px, so 1kWh=3.75px -->
  <rect x="140" y="35" width="360" height="28" rx="4" fill="rgba(251,191,36,0.25)" stroke="#fbbf24" stroke-width="1.5"/>
  <rect x="140" y="73" width="216" height="28" rx="4" fill="rgba(34,211,160,0.25)" stroke="#22d3a0" stroke-width="1.5"/>
  <rect x="140" y="111" width="43" height="28" rx="4" fill="rgba(248,113,113,0.25)" stroke="#f87171" stroke-width="1.5"/>
  <rect x="140" y="149" width="173" height="28" rx="4" fill="rgba(56,189,248,0.25)" stroke="#38bdf8" stroke-width="1.5"/>
  <!-- Labels left -->
  <text x="130" y="54" fill="#7a9ab0" font-size="9.5" font-family="DM Sans,sans-serif" text-anchor="end">Incident Solar</text>
  <text x="130" y="92" fill="#7a9ab0" font-size="9.5" font-family="DM Sans,sans-serif" text-anchor="end">Collector Output</text>
  <text x="130" y="130" fill="#7a9ab0" font-size="9.5" font-family="DM Sans,sans-serif" text-anchor="end">System Losses</text>
  <text x="130" y="168" fill="#7a9ab0" font-size="9.5" font-family="DM Sans,sans-serif" text-anchor="end">Useful Heat</text>
  <!-- Values right -->
  <text x="508" y="54" fill="#fbbf24" font-size="9" font-family="JetBrains Mono,monospace">96 kWh/day</text>
  <text x="364" y="92" fill="#22d3a0" font-size="9" font-family="JetBrains Mono,monospace">57.7 kWh (η=60%)</text>
  <text x="191" y="130" fill="#f87171" font-size="9" font-family="JetBrains Mono,monospace">11.5 kWh (20%)</text>
  <text x="321" y="168" fill="#38bdf8" font-size="9" font-family="JetBrains Mono,monospace">46.2 kWh</text>
  <!-- Subtitle -->
  <text x="280" y="183" fill="#2a3a48" font-size="8.5" font-family="JetBrains Mono,monospace" text-anchor="middle">G=4 kWh/m²/day  |  η_coll=60%  |  η_sys=80%  |  Ac = collector area</text>
</svg></div>

<div class="derivation">
  <span class="step-num">Step 1 — Daily Heat Demand</span>
  $$Q_{demand} = \\dot{m} \\cdot C_p \\cdot \\Delta T = 1200 \\times 4.18 \\times (55 - 10) = \\boxed{62.7 \\text{ kWh/day}}$$
</div>
<div class="derivation">
  <span class="step-num">Step 2 — Useful Solar Energy per m² per Day</span>
  $$Q_{available} = G \\cdot \\eta_{sys} \\cdot \\eta_{coll} = 4 \\times 0.80 \\times 0.60 = \\boxed{1.92 \\text{ kWh/m}^2\\text{/day}}$$
</div>
<div class="derivation">
  <span class="step-num">Step 3 — Required Collector Area</span>
  $$A_c = \\frac{Q_{demand}}{Q_{available}} = \\frac{62.7}{1.92} = \\boxed{32.7 \\text{ m}^2 \\approx 33 \\text{ m}^2}$$
</div>

<div class="note-box">ℹ️ η<sub>sys</sub> = 80% accounts for pipe heat losses, storage losses, and heat exchanger losses. η<sub>coll</sub> = 60% is the optical-thermal efficiency of the collector at operating conditions (Ti−Ta)/G.</div>` },

  'ch5_0': { marks:"2+3+6", refs:['ku-slides', 'ku-exam-2024', 'masters'], content:`<h4>Solar PV — Electricity Generation, IV Characteristics & Pump Sizing</h4>

<h4>How PV Generates Electricity</h4>
<p>The photovoltaic effect: photons strike the p-n junction → electron-hole pairs generated → separated by built-in electric field → DC current flows.</p>

<h4>Ideal IV Characteristics & Temperature Effect</h4>
<div class="vis-box" style="padding:0;overflow:hidden;border-radius:10px;">
<svg viewBox="0 0 560 240" xmlns="http://www.w3.org/2000/svg" style="width:100%;display:block;background:#0d1318;">
  <defs>
    <linearGradient id="iv25fill" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#22d3a0" stop-opacity="0.18"/>
      <stop offset="100%" stop-color="#22d3a0" stop-opacity="0.02"/>
    </linearGradient>
    <marker id="arrowX" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto">
      <path d="M0,0 L6,3 L0,6" fill="none" stroke="#3a5568" stroke-width="1"/>
    </marker>
    <marker id="arrowY" markerWidth="6" markerHeight="6" refX="3" refY="0" orient="auto">
      <path d="M0,6 L3,0 L6,6" fill="none" stroke="#3a5568" stroke-width="1"/>
    </marker>
  </defs>
  <!-- Grid lines -->
  <line x1="70" y1="20" x2="70" y2="195" stroke="#1a2530" stroke-width="1"/>
  <line x1="70" y1="195" x2="520" y2="195" stroke="#1a2530" stroke-width="1"/>
  <line x1="70" y1="155" x2="520" y2="155" stroke="#1a2530" stroke-width="0.5" stroke-dasharray="3,3"/>
  <line x1="70" y1="115" x2="520" y2="115" stroke="#1a2530" stroke-width="0.5" stroke-dasharray="3,3"/>
  <line x1="70" y1="75" x2="520" y2="75" stroke="#1a2530" stroke-width="0.5" stroke-dasharray="3,3"/>
  <line x1="195" y1="20" x2="195" y2="195" stroke="#1a2530" stroke-width="0.5" stroke-dasharray="3,3"/>
  <line x1="320" y1="20" x2="320" y2="195" stroke="#1a2530" stroke-width="0.5" stroke-dasharray="3,3"/>
  <line x1="445" y1="20" x2="445" y2="195" stroke="#1a2530" stroke-width="0.5" stroke-dasharray="3,3"/>
  <!-- Axes with arrows -->
  <line x1="70" y1="195" x2="525" y2="195" stroke="#3a5568" stroke-width="1.5" marker-end="url(#arrowX)"/>
  <line x1="70" y1="195" x2="70" y2="15" stroke="#3a5568" stroke-width="1.5" marker-end="url(#arrowY)"/>
  <!-- Axis labels -->
  <text x="525" y="210" fill="#4a5470" font-size="11" font-family="JetBrains Mono,monospace" text-anchor="middle">V (V)</text>
  <text x="20" y="108" fill="#4a5470" font-size="11" font-family="JetBrains Mono,monospace" text-anchor="middle" transform="rotate(-90,20,108)">I (A)</text>
  <!-- Tick marks and values -->
  <text x="70" y="210" fill="#3a5568" font-size="9" text-anchor="middle" font-family="JetBrains Mono,monospace">0</text>
  <text x="195" y="210" fill="#3a5568" font-size="9" text-anchor="middle" font-family="JetBrains Mono,monospace">10</text>
  <text x="320" y="210" fill="#3a5568" font-size="9" text-anchor="middle" font-family="JetBrains Mono,monospace">20</text>
  <text x="445" y="210" fill="#3a5568" font-size="9" text-anchor="middle" font-family="JetBrains Mono,monospace">30</text>
  <text x="502" y="210" fill="#3a5568" font-size="9" text-anchor="middle" font-family="JetBrains Mono,monospace">37.2</text>
  <text x="65" y="198" fill="#3a5568" font-size="9" text-anchor="end" font-family="JetBrains Mono,monospace">0</text>
  <text x="65" y="158" fill="#3a5568" font-size="9" text-anchor="end" font-family="JetBrains Mono,monospace">2</text>
  <text x="65" y="118" fill="#3a5568" font-size="9" text-anchor="end" font-family="JetBrains Mono,monospace">4</text>
  <text x="65" y="78" fill="#3a5568" font-size="9" text-anchor="end" font-family="JetBrains Mono,monospace">6</text>
  <text x="65" y="38" fill="#22d3a0" font-size="9" text-anchor="end" font-family="JetBrains Mono,monospace" font-weight="600">8.5→Isc</text>
  <!-- 25°C IV fill -->
  <polygon points="70,28 100,28 140,28 175,29 210,29 240,30 265,31 287,33 305,36 320,41 332,47 342,55 350,65 357,78 362,93 366,110 369,130 371,155 372,168 373,178 374,186 374.5,192 375,195 70,195" fill="url(#iv25fill)"/>
  <!-- 25°C IV curve -->
  <polyline points="70,28 100,28 140,28 175,29 210,29 240,30 265,31 287,33 305,36 320,41 332,47 342,55 350,65 357,78 362,93 366,110 369,130 371,155 372,168 373,178 374,186 374.5,192 375,195" fill="none" stroke="#22d3a0" stroke-width="2.5" stroke-linejoin="round"/>
  <!-- 60°C IV curve (Voc drops ~3.7V → Voc=33.5V, Isc slightly up to 8.7A) -->
  <polyline points="70,25 100,25 140,25 175,26 210,26 240,27 262,28 282,30 300,33 315,38 325,44 334,52 341,62 347,74 351,88 354,103 357,120 359,140 361,160 362,175 363,185 363.5,191 364,195" fill="none" stroke="#f87171" stroke-width="2" stroke-dasharray="7,4" stroke-linejoin="round"/>
  <!-- Isc reference line 25°C -->
  <line x1="70" y1="28" x2="355" y2="28" stroke="rgba(34,211,160,0.3)" stroke-width="1" stroke-dasharray="3,3"/>
  <!-- Voc reference line 25°C -->
  <line x1="375" y1="20" x2="375" y2="195" stroke="rgba(34,211,160,0.3)" stroke-width="1" stroke-dasharray="3,3"/>
  <!-- Voc reference line 60°C -->
  <line x1="364" y1="20" x2="364" y2="195" stroke="rgba(248,113,113,0.3)" stroke-width="1" stroke-dasharray="3,3"/>
  <!-- Pmax star at ~V=30, I=7.2 for 25°C -->
  <polygon points="358,56 360,62 366,62 361,66 363,72 358,68 353,72 355,66 350,62 356,62" fill="#fbbf24" stroke="none"/>
  <!-- Pmax label -->
  <text x="370" y="60" fill="#fbbf24" font-size="9" font-family="JetBrains Mono,monospace" font-weight="600">Pmax≈216W</text>
  <!-- Voc labels -->
  <text x="375" y="17" fill="#22d3a0" font-size="9" font-family="JetBrains Mono,monospace" text-anchor="middle">Voc=37.2V</text>
  <text x="364" y="17" fill="#f87171" font-size="8" font-family="JetBrains Mono,monospace" text-anchor="middle">33.5V</text>
  <!-- Legend -->
  <rect x="80" y="165" width="110" height="26" rx="4" fill="#0d1318" stroke="#1a2530" stroke-width="1"/>
  <line x1="88" y1="173" x2="104" y2="173" stroke="#22d3a0" stroke-width="2.5"/>
  <text x="108" y="176" fill="#22d3a0" font-size="9" font-family="DM Sans,sans-serif">25°C (STC)</text>
  <line x1="88" y1="184" x2="104" y2="184" stroke="#f87171" stroke-width="2" stroke-dasharray="5,3"/>
  <text x="108" y="187" fill="#f87171" font-size="9" font-family="DM Sans,sans-serif">60°C (Hot Day)</text>
  <!-- Title -->
  <text x="295" y="14" fill="#4a5470" font-size="9" font-family="JetBrains Mono,monospace" text-anchor="middle" letter-spacing="0.08em">IV CHARACTERISTICS — SOLAR CELL (25°C STC VS 60°C HOT DAY)</text>
</svg></div>

<div class="math-eq small">$$\\text{Temperature effect: } \\frac{dV_{oc}}{dT} \\approx -2.3 \\text{ mV/°C per cell} \\quad \\Rightarrow \\quad \\frac{d\\eta}{dT} \\approx -0.45\\%/°C$$</div>

<h4>PV Pump Sizing — Village Water Supply</h4>
<p><em>Given: Population = 2500, consumption = 60 L/day/person, H = 220.5 m, η<sub>pump</sub> = 60%, LMF = 0.8, DF = 0.9, G = 4.6 kWh/m²/day</em></p>

<div class="derivation">
  <span class="step-num">Step 1 — Daily Water Volume</span>
  $$V = 2500 \\times 60 = 150{,}000 \\text{ L/day} = 150 \\text{ m}^3\\text{/day}$$
</div>
<div class="derivation">
  <span class="step-num">Step 2 — Hydraulic Energy Required</span>
  $$E_h = \\rho g H V = 1000 \\times 9.81 \\times 220.5 \\times 150 = 324{,}157 \\text{ kJ/day} = \\boxed{90.0 \\text{ kWh/day}}$$
</div>
<div class="derivation">
  <span class="step-num">Step 3 — Pump Input Power (during solar hours)</span>
  $$P_{pump} = \\frac{E_h}{\\eta_{pump} \\times PSH} = \\frac{90.0}{0.60 \\times 4.6} = \\boxed{32.6 \\text{ kW}}$$
</div>
<div class="derivation">
  <span class="step-num">Step 4 — Required PV Array Power</span>
  $$P_{PV} = \\frac{P_{pump}}{LMF \\times DF} = \\frac{32.6}{0.8 \\times 0.9} = \\boxed{45.3 \\text{ kW}_p}$$
</div>
<div class="kp">✅ PV array: ~45.3 kWp &nbsp;|&nbsp; Pump motor: ~32.6 kW &nbsp;|&nbsp; Serving 2,500 people with 60 L/day at 220.5 m head</div>` },

  'ch5_3': { marks:"3", refs:['ku-slides', 'ku-exam-2025', 'masters'], content:`<h4>Ideal IV Characteristics of Solar Cells and Temperature Effect</h4>
<h4>Key Parameters on IV Curve</h4>
<ul><li><strong>Short Circuit Current (Isc):</strong> Maximum current when V=0. Directly proportional to irradiance. At STC: G=1000 W/m².</li><li><strong>Open Circuit Voltage (Voc):</strong> Maximum voltage when I=0. Logarithmically related to irradiance. For crystalline Si: ~0.6V per cell.</li><li><strong>Maximum Power Point (Pmax):</strong> The point on the IV curve where P=I×V is maximum. Operating point: (Vmp, Imp).</li><li><strong>Fill Factor (FF):</strong> FF = Pmax/(Voc×Isc). Measure of cell quality — ideal=1, typical good cell=0.75-0.80.</li></ul>
<h4>Effect of High Temperature</h4>
<div class="step"><strong>Voc decreases:</strong> ~−2.3 mV/°C for crystalline silicon. At 60°C vs 25°C: ΔVoc = −2.3×35 = −80.5 mV per cell → significant for a 60-cell module.</div>
<div class="step"><strong>Isc increases slightly:</strong> +0.06%/°C — bandgap narrows slightly, allowing more photon absorption.</div>
<div class="step"><strong>Net effect:</strong> Efficiency decreases ~0.4-0.5%/°C above STC. For a 20% efficient cell: at 60°C (35°C above STC), efficiency drops by 0.4×35 = 14% relative → effective efficiency ≈ 17.2%.</div>
<div class="kp">This is why solar panels produce LESS electricity on hot sunny days than cool sunny days. NOCT (Nominal Operating Cell Temperature) rating accounts for this.</div>` },

  'ch6_0': { marks:"3+3", refs:['ku-slides', 'ku-exam-2024', 'twidell'], content:`<h4>Wind Power Extraction Concept + WRA Importance</h4>
<h4>Concept of Power Extraction from Wind</h4>
<p>Wind carries kinetic energy. A turbine extracts this energy by converting the linear motion of air into rotational motion of the rotor, then into electricity via a generator.</p>
<div class="math-eq">$$P = \\frac{1}{2}\\rho A v^3 \\qquad A = \\pi R^2$$</div><div class="math-eq small">$$P_{max} = \\frac{16}{27} \\cdot P_{wind} = 0.593 \\cdot P_{wind} \\quad \\text{(Betz limit)}$$</div>
<p>Modern turbines achieve Cp = 0.40-0.48. Key insight: <strong>Power ∝ v³</strong> — doubling wind speed = 8× more power. Site selection is critical.</p>
<h4>Why WRA is Pivotal</h4>
<ul><li><strong>Financial viability:</strong> A 10% overestimation of wind speed leads to ~33% overestimation of energy yield (P∝v³) — potentially making a viable project appear unprofitable or an unviable one appear attractive</li><li><strong>Turbine selection:</strong> Wrong wind class turbine selection → premature failure. WRA determines correct IEC class (I, II, III)</li><li><strong>Layout optimization:</strong> Wake effects can reduce farm output by 5-15% — WRA identifies prevailing direction for optimal turbine spacing</li><li><strong>Grid planning:</strong> WRA data needed for power purchase agreements, grid connection sizing, and capacity factor calculations</li></ul>
<div class="kp">Minimum WRA period: 1 year (to capture all seasonal variations). Standard heights: 10m, 50m, 80m, 100m. Instruments: anemometer + wind vane + data logger.</div>` },

  'ch6_1': { marks:"4+4", refs:['ku-slides', 'ku-exam-2025', 'masters', 'twidell'], content:`<h4>Wind Power Concept + Wind Speed Scaling at 100 m</h4>

<h4>Power Extraction from Wind</h4>
<div class="math-eq">$$P = \\frac{1}{2} \\rho A v^3 \\qquad \\text{and} \\qquad P_{max} = \\frac{16}{27} \\cdot \\frac{1}{2}\\rho A v^3 \\approx 0.593 \\cdot P_{wind} \\quad \\text{(Betz limit)}$$</div>

<div class="vis-box" style="padding:0;overflow:hidden;border-radius:10px;">
<svg viewBox="0 0 560 210" xmlns="http://www.w3.org/2000/svg" style="width:100%;display:block;background:#0d1318;">
  <defs>
    <marker id="arrW" markerWidth="7" markerHeight="7" refX="6" refY="3" orient="auto"><path d="M0,0 L7,3 L0,6 Z" fill="#3a5568"/></marker>
    <linearGradient id="windGrad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#22d3a0" stop-opacity="0.15"/>
      <stop offset="100%" stop-color="#22d3a0" stop-opacity="0.02"/>
    </linearGradient>
  </defs>
  <text x="280" y="18" fill="#3a5568" font-size="8.5" font-family="JetBrains Mono,monospace" text-anchor="middle" letter-spacing="0.1em">WIND SPEED PROFILE — POWER LAW  v₂ = v₁(h₂/h₁)^α  |  α=0.20 (crops/hedges)</text>
  <!-- Axes -->
  <line x1="80" y1="30" x2="80" y2="175" stroke="#3a5568" stroke-width="1.5" marker-end="url(#arrW)"/>
  <line x1="80" y1="175" x2="520" y2="175" stroke="#3a5568" stroke-width="1.5" marker-end="url(#arrW)"/>
  <!-- Grid -->
  <line x1="80" y1="155" x2="515" y2="155" stroke="#1a2530" stroke-width="0.5" stroke-dasharray="3,3"/>
  <line x1="80" y1="130" x2="515" y2="130" stroke="#1a2530" stroke-width="0.5" stroke-dasharray="3,3"/>
  <line x1="80" y1="105" x2="515" y2="105" stroke="#1a2530" stroke-width="0.5" stroke-dasharray="3,3"/>
  <line x1="80" y1="80" x2="515" y2="80" stroke="#1a2530" stroke-width="0.5" stroke-dasharray="3,3"/>
  <line x1="80" y1="55" x2="515" y2="55" stroke="#1a2530" stroke-width="0.5" stroke-dasharray="3,3"/>
  <!-- Height axis labels (y axis = height, x axis = speed) -->
  <text x="70" y="178" fill="#3a5568" font-size="9" font-family="JetBrains Mono,monospace" text-anchor="end">0</text>
  <text x="70" y="158" fill="#3a5568" font-size="9" font-family="JetBrains Mono,monospace" text-anchor="end">10m</text>
  <text x="70" y="133" fill="#3a5568" font-size="9" font-family="JetBrains Mono,monospace" text-anchor="end">30m</text>
  <text x="70" y="108" fill="#3a5568" font-size="9" font-family="JetBrains Mono,monospace" text-anchor="end">50m</text>
  <text x="70" y="83" fill="#3a5568" font-size="9" font-family="JetBrains Mono,monospace" text-anchor="end">80m</text>
  <text x="70" y="58" fill="#22d3a0" font-size="9" font-family="JetBrains Mono,monospace" text-anchor="end" font-weight="600">100m</text>
  <!-- Speed axis labels -->
  <text x="80" y="190" fill="#3a5568" font-size="9" font-family="JetBrains Mono,monospace" text-anchor="middle">0</text>
  <text x="190" y="190" fill="#3a5568" font-size="9" font-family="JetBrains Mono,monospace" text-anchor="middle">2</text>
  <text x="300" y="190" fill="#3a5568" font-size="9" font-family="JetBrains Mono,monospace" text-anchor="middle">4</text>
  <text x="410" y="190" fill="#3a5568" font-size="9" font-family="JetBrains Mono,monospace" text-anchor="middle">6</text>
  <text x="500" y="190" fill="#fbbf24" font-size="9" font-family="JetBrains Mono,monospace" text-anchor="middle">m/s</text>
  <!-- v=5*(h/10)^0.2: h=10→5, h=20→5.38, h=30→5.66, h=50→6.09, h=80→6.57, h=100→6.90 -->
  <!-- x scale: 0→80px, 8m/s→80+8*55=520px. So x = 80 + v*55 -->
  <!-- h=10→y=155, h=20→y=143, h=30→y=130, h=50→y=108, h=80→y=80, h=100→y=58 -->
  <!-- fill polygon -->
  <polygon points="80,175 80,155 355,155 375,143 391,130 415,108 441,80 460,58 80,58" fill="url(#windGrad)"/>
  <!-- Wind profile curve -->
  <polyline points="80,155 355,155 375,143 391,130 415,108 441,80 460,58" fill="none" stroke="#22d3a0" stroke-width="2.5" stroke-linejoin="round"/>
  <!-- Data points with labels -->
  <circle cx="355" cy="155" r="4" fill="#22d3a0"/>
  <text x="360" y="152" fill="#22d3a0" font-size="9" font-family="JetBrains Mono,monospace">5.0 m/s</text>
  <circle cx="415" cy="108" r="4" fill="#38bdf8"/>
  <text x="420" y="105" fill="#38bdf8" font-size="9" font-family="JetBrains Mono,monospace">6.1 m/s</text>
  <circle cx="460" cy="58" r="5" fill="#fbbf24"/>
  <text x="465" y="55" fill="#fbbf24" font-size="9" font-family="JetBrains Mono,monospace" font-weight="600">6.9 m/s</text>
  <!-- Power density note for 100m -->
  <rect x="300" y="32" width="180" height="18" rx="4" fill="rgba(251,191,36,0.08)" stroke="rgba(251,191,36,0.2)" stroke-width="1"/>
  <text x="390" y="44" fill="#fbbf24" font-size="9" font-family="JetBrains Mono,monospace" text-anchor="middle">P_density@100m ≈ 201 W/m²</text>
  <!-- Axis titles -->
  <text x="300" y="205" fill="#4a5470" font-size="9" font-family="JetBrains Mono,monospace" text-anchor="middle">Wind Speed (m/s)</text>
  <text x="18" y="110" fill="#4a5470" font-size="9" font-family="JetBrains Mono,monospace" text-anchor="middle" transform="rotate(-90,18,110)">Height (m)</text>
</svg></div>

<h4>Calculation: Wind Speed at 100 m</h4>
<p><em>Given: v₁ = 5 m/s at h₁ = 10 m, α = 0.20 (crops/hedges/shrubs), T = 15°C, P = 1 atm</em></p>

<div class="derivation">
  <span class="step-num">Step 1 — Apply Power Law</span>
  $$v_2 = v_1 \\left(\\frac{h_2}{h_1}\\right)^\\alpha = 5 \\times \\left(\\frac{100}{10}\\right)^{0.20} = 5 \\times 10^{0.20} = 5 \\times 1.585 = \\boxed{7.93 \\text{ m/s}}$$
</div>
<div class="derivation">
  <span class="step-num">Step 2 — Air Density at 15°C, 1 atm</span>
  $$\\rho = 1.293 \\times \\frac{273}{273 + 15} = 1.293 \\times \\frac{273}{288} = \\boxed{1.225 \\text{ kg/m}^3}$$
</div>
<div class="derivation">
  <span class="step-num">Step 3 — Specific Wind Power at 100 m</span>
  $$\\frac{P}{A} = \\frac{1}{2}\\rho v^3 = \\frac{1}{2} \\times 1.225 \\times 7.93^3 = 0.6125 \\times 498.7 = \\boxed{305.5 \\text{ W/m}^2}$$
</div>

<div class="warn-box">⚠️ Power ∝ v³: The modest-seeming speed increase from 5→7.93 m/s means (7.93/5)³ = <strong>3.98× more power</strong>. This is why hub height matters enormously in wind energy economics.</div>` },

  'ch4_4': { marks:4, refs:['ku-slides', 'duffie'], content:`<h4>Flat Plate Collector Efficiency — HWB Equation Derivation</h4>
<h4>Energy Balance on Collector</h4>
<div class="math-eq">$$G A_c \\tau\\alpha = Q_u + U_L A_c (T_m - T_a)$$</div><div class="math-eq small">$$Q_u = A_c [G\\tau\\alpha - U_L(T_m - T_a)]$$</div>
<h4>Hottel-Whillier-Bliss (HWB) Equation</h4>
<div class="math-eq">$$\\eta = F_R \\left[ \\tau\\alpha - U_L \\frac{T_i - T_a}{G} \\right]$$</div><p style="font-size:12px;color:var(--text2);margin:8px 0;">$F_R$ = heat removal factor (0.80–0.95) | $\\tau\\alpha$ = transmittance-absorptance (0.70–0.90) | $U_L$ = heat loss coefficient (3–8 W/m²·K) | $G$ = irradiance (W/m²)</p>
<h4>Graphical Interpretation</h4>
<div class="math-eq small">$$\\eta = \\underbrace{F_R\\tau\\alpha}_{\\text{y-intercept}} - \\underbrace{F_R U_L}_{\\text{slope}} \\cdot \\frac{T_i - T_a}{G}$$</div><div class="note-box">Graph: η vs (Ti−Ta)/G is LINEAR. Steeper negative slope = higher heat losses (higher UL). Y-intercept = optical efficiency. X-intercept = stagnation point (zero useful heat gain).</div>
<div class="kp">Exam tip: The efficiency is ZERO when FR·τα = FR·UL·(Ti−Ta)/G → at this point, all absorbed solar energy equals heat losses. The X-intercept gives the stagnation temperature difference.</div>` },

  'ch4_5': { marks:2, refs:['ku-slides', 'duffie'], content:`<h4>Solar Time vs Standard Time — Equation of Time</h4>
<h4>Definitions</h4>
<p><strong>Solar Time (Apparent Solar Time):</strong> Time based on the actual position of the sun in the sky. Solar noon = when the sun is exactly due south (highest point). Used for calculating sun position for solar energy applications.</p>
<p><strong>Standard Time:</strong> Time based on fixed time zones (multiples of 15° longitude from Greenwich). Nepal: UTC+5:45 (IST+15min). Does NOT follow actual sun position.</p>
<h4>Why They Differ</h4>
<ul><li>Earth's orbit is elliptical (not circular) → Earth moves faster when closer to sun (perihelion, Jan) → solar days are shorter. Earth moves slower at aphelion (July) → solar days are longer.</li><li>Earth's axis is tilted 23.45° → creates seasonal variation in solar day length.</li></ul>
<h4>Equation of Time (EOT)</h4>
<div class="math-eq">$$\\text{Solar Time} = \\text{Standard Time} + 4(L_{std} - L_{local}) + EOT$$</div><p style="font-size:12px;color:var(--text2);margin:6px 0;">$L_{std}$ = standard meridian (°) | $L_{local}$ = local longitude (°) | 4 = min/degree | $EOT$ = Equation of Time (varies ±16 min)</p>
<div class="kp">For Nepal (L_local ≈ 84°E, L_std = 82.5°E for IST): 4×(82.5−84) = −6 min → solar noon in Nepal is about 6 minutes BEFORE 12:00 IST (plus EOT correction). Important for precise solar panel orientation calculations.</div>` },

  'ch4_6': { marks:4, refs:['ku-slides', 'duffie'], content:`<h4>Solar Declination, Hour Angle, and Zenith Angle</h4>
<h4>Solar Declination (δ)</h4>
<div class="math-eq">$$\\delta = 23.45° \\sin\\left[\\frac{360}{365}(284 + n)\\right]$$</div><p style="font-size:12px;color:var(--text2);margin:6px 0;">$n$ = day number (Jan 1=1). Range: −23.45° (Dec 21) to +23.45° (Jun 21). Equinoxes: $\\delta=0°$</p>
<p>Represents the angle between the sun's rays and the Earth's equatorial plane. Causes seasonal variation in sun height.</p>
<h4>Hour Angle (ω)</h4>
<div class="math-eq">$$\\omega = (\\text{Solar Time} - 12{:}00) \\times 15°/\\text{hr}$$</div><p style="font-size:12px;color:var(--text2);margin:6px 0;">At solar noon: $\\omega=0°$ | Morning: $\\omega<0°$ | Afternoon: $\\omega>0°$ | Each hour = 15° rotation</p>
<h4>Solar Zenith Angle (θ_z)</h4>
<div class="math-eq">$$\\cos\\theta_z = \\sin\\phi\\sin\\delta + \\cos\\phi\\cos\\delta\\cos\\omega$$</div><p style="font-size:12px;color:var(--text2);margin:6px 0;">$\\phi$ = latitude | $\\delta$ = declination | $\\omega$ = hour angle | $\\theta_z=0°$ at overhead sun | $\\theta_z=90°$ at sunrise/sunset</p>
<h4>Application to Beam Radiation on Tilted Surface</h4>
<div class="math-eq">$$R_b = \\frac{\\cos\\theta}{\\cos\\theta_z}$$</div><p style="font-size:12px;color:var(--text2);margin:6px 0;">$R_b$ = ratio of beam on tilted to beam on horizontal | $\\theta$ = angle of incidence on tilted surface</p>
<div class="kp">For Kathmandu (φ=27.7°N) on winter solstice (δ=−23.45°): At solar noon (ω=0), cos(θ_z) = sin(27.7)×sin(−23.45)+cos(27.7)×cos(−23.45) = −0.219+0.816 = 0.597 → θ_z = 53.3° → sun is only 36.7° above horizon.</div>` },

  'ch4_7': { marks:3, refs:['ku-slides', 'duffie'], content:`<h4>Flat Plate vs Evacuated Tube Collectors</h4>
<div class="step"><strong>Efficiency</strong><br>
Flat plate: 50-75% at low ΔT (Ti−Ta < 30°C). Efficiency drops significantly at higher temperatures due to convection and radiation losses from the cover glass.<br>
Evacuated tube: 60-80% even at high ΔT (Ti−Ta up to 100°C). The vacuum eliminates convection losses — only radiation losses remain. Maintains efficiency at high temperatures.</div>
<div class="step"><strong>Operating Temperature Range</strong><br>
Flat plate: Best for 40-80°C applications (domestic hot water, space heating).<br>
Evacuated tube: 60-200°C — suitable for solar cooling (absorption chillers), industrial process heat, and even solar cooking.</div>
<div class="step"><strong>Cost</strong><br>
Flat plate: Lower cost ($150-300/m²). Simpler construction, robust, long-lived (20-30 years).<br>
Evacuated tube: Higher cost ($250-500/m²). Glass tubes are fragile and may need replacement. Hail damage is a concern.</div>
<div class="step"><strong>Suitable Applications</strong><br>
Flat plate: Domestic hot water in Nepal (40-60°C), space heating, swimming pools, commercial hot water systems.<br>
Evacuated tube: High-temperature applications, cold climate installations (performance better when cold outside), industrial heat.</div>
<div class="kp">For Nepal: Flat plate collectors dominate the market (cost-effective for domestic hot water). Evacuated tubes are used where temperatures above 80°C are needed (industrial, institutional).</div>` },

    // ─── CH1 MISSING ANSWERS ───
  'ch1_3': { marks:3, refs:['ku-slides', 'wecs-2024', 'ku-exam-2024'], content:`<h4>Short Note: Hydrograph and Flow Duration Curve</h4>
<h4>Hydrograph</h4>
<p>A hydrograph is a graph that shows the variation of river discharge (flow rate in m³/s) against time (hours, days, or months). It captures how a river responds to rainfall events or seasonal changes.</p>
<ul><li><strong>Rising limb:</strong> Rapid increase in discharge after rainfall</li><li><strong>Peak discharge:</strong> Maximum flow rate</li><li><strong>Recession limb:</strong> Gradual return to base flow as stored water drains</li><li><strong>Base flow:</strong> Minimum sustained flow from groundwater</li></ul>
<p><strong>Relevance to RE:</strong> Hydrographs help engineers understand seasonal availability of water for run-of-river (RoR) hydropower. Nepal's rivers show monsoon peaks (June–September) and dry season lows (February–April), causing significant seasonal power variation.</p>
<h4>Flow Duration Curve (FDC)</h4>
<p>An FDC is a cumulative frequency curve showing the percentage of time a river's flow equals or exceeds a given discharge value. It is derived from long-term discharge data (typically 10+ years).</p>
<div class="note-box">📊 <strong>FDC Axes:</strong> X-axis = % of time flow is exceeded (0–100%) | Y-axis = Discharge (m³/s)<br>$Q_{50}$ = median flow (50% exceedance) | $Q_{90}$ = firm/reliable flow (90% exceedance) | Design flow for microhydro: $Q_{40}$–$Q_{60}$</div>
<div class="kp">FDC is essential for microhydro design: the design flow is typically Q_40–Q_60 (available 40-60% of time). Q_90 gives firm power (always available). The area under the FDC represents total annual energy potential.</div>` },

  'ch1_4': { marks:4, refs:['ku-slides', 'wecs-2024'], content:`<h4>Energy Trilemma and Nepal's Energy Situation</h4>
<h4>The Energy Trilemma</h4>
<p>The World Energy Council defines the Energy Trilemma as balancing three sometimes-conflicting dimensions of energy policy:</p>
<div class="step"><strong>1. Energy Security:</strong> Reliable, uninterrupted supply. Includes fuel diversity, infrastructure resilience, political stability of supply chains.</div>
<div class="step"><strong>2. Energy Equity:</strong> Universal access to affordable, modern energy services. Key for developing nations — access to electricity, clean cooking fuels.</div>
<div class="step"><strong>3. Environmental Sustainability:</strong> Low-carbon, low-pollution energy systems. Reducing GHG emissions and local pollution while maintaining energy access.</div>
<h4>Nepal's Trilemma Position</h4>
<ul><li><strong>Security:</strong> ❌ Weak — 90%+ electricity from RoR hydro → seasonal blackouts in dry season. Petroleum 100% imported → price/supply vulnerability.</li><li><strong>Equity:</strong> ✅ Improving — 98% electrification rate (2023). But quality is poor, and 63.87% still rely on traditional biomass (firewood) for cooking → indoor air pollution.</li><li><strong>Sustainability:</strong> ✅ Good for electricity — hydro is clean. But traditional biomass burning causes deforestation + 1,600 deaths/year from indoor air pollution.</li></ul>
<div class="kp">Nepal's challenge: improve energy SECURITY (diversify away from RoR + reduce petroleum imports) while maintaining SUSTAINABILITY and improving EQUITY (replace firewood with clean cooking). Biogas, solar PV, and improved cookstoves are the key interventions.</div>` },

  'ch1_5': { marks:3, refs:['ku-slides', 'wecs-2024'], content:`<h4>Sankey Diagram — Nepal's Energy Flow</h4>
<h4>What is a Sankey Diagram?</h4>
<p>A Sankey diagram is a graphical representation of energy flows where the width of arrows is proportional to the quantity of energy flowing. It shows energy from primary sources through conversion processes to final end uses, including losses.</p>
<div class="note-box">Energy flow: <strong>Primary Sources → Conversion/Process → Final Uses + Losses</strong><br>Nepal: Firewood → combustion (10-15% eff.) → cooking heat | Hydro → turbine/generator → electricity</div>
<h4>Nepal's Approximate Energy Flow (FY 2079/80)</h4>
<div class="step"><strong>Primary Sources (Total ~532 PJ):</strong><br>
• Traditional biomass (firewood, dung, agri-residue): 63.87% → mostly direct combustion<br>
• Petroleum products (imported): 13.52% → transport, industry<br>
• Coal: 9.09% → industry<br>
• Grid electricity (hydro): 4.57% → household, commercial<br>
• Renewables (solar, biogas, micro-hydro): 9.09%</div>
<div class="step"><strong>Major Losses:</strong><br>
• Traditional stove efficiency: 10-15% (85-90% waste heat)<br>
• Electricity T&D losses: ~15%<br>
• Engine/motor losses: 60-70%</div>
<div class="step"><strong>Final Uses:</strong><br>
• Cooking/heating: ~65% of total<br>
• Transport: ~10%<br>
• Industry: ~20%<br>
• Lighting/appliances: ~5%</div>
<div class="kp">Key insight from Sankey: Nepal's energy system is highly inefficient — most energy is "wasted" as heat in traditional stoves. Switching from firewood to biogas or LPG for cooking alone would save enormous energy.</div>` },

  // ─── CH2 MISSING ANSWERS ───
  'ch2_1': { marks:3, refs:['ku-slides', 'basu'], content:`<h4>Principal Biomass Conversion Technologies</h4>
<h4>Overview</h4>
<p>Biomass can be converted to useful energy (heat, electricity, fuels) through two main routes:</p>
<div class="step"><strong>Thermochemical Processes</strong> — use heat:
<ul><li><strong>Combustion:</strong> Complete oxidation in excess air → heat/steam/electricity. Most common, 20-40% efficiency. Direct firing in boiler or stove.</li>
<li><strong>Gasification:</strong> Partial oxidation in limited air/oxygen → producer gas (syngas: CO+H₂+CH₄+CO₂+N₂). ~70-80% energy conversion. Good for IC engines.</li>
<li><strong>Pyrolysis:</strong> Thermal decomposition WITHOUT oxygen → bio-oil (~75%), char (~12%), gas (~13%). Three modes: slow, fast, flash.</li>
<li><strong>Torrefaction:</strong> Mild pyrolysis at 200-300°C → solid "torrefied biomass" with improved fuel properties (hydrophobic, grindable).</li></ul></div>
<div class="step"><strong>Biochemical Processes</strong> — use microorganisms:
<ul><li><strong>Anaerobic Digestion:</strong> Microorganisms break down organic matter without oxygen → biogas (CH₄+CO₂)</li>
<li><strong>Fermentation:</strong> Sugars converted by yeast → ethanol (bioethanol fuel)</li>
<li><strong>Transesterification:</strong> Vegetable oils + methanol → biodiesel + glycerol</li></ul></div>
<div class="kp">For Nepal: Biogas (biochemical) and gasification (thermochemical) are most relevant technologies for rural energy access and small-scale power generation.</div>` },

  'ch2_2': { marks:4, refs:['ku-slides', 'basu'], content:`<h4>Short Note: Fluidized Bed Gasifier</h4>
<h4>Working Principle</h4>
<p>In a fluidized bed gasifier, a bed of inert material (usually sand or alumina) is suspended by upward-flowing gas (air or steam) at high enough velocity to "fluidize" the bed — making it behave like a boiling liquid. Biomass is fed into this hot, turbulent bed where gasification reactions occur.</p>
<h4>Key Features</h4>
<ul><li><strong>Temperature:</strong> 700-900°C (lower than fixed bed)</li><li><strong>Uniform temperature:</strong> The turbulent mixing ensures uniform temperature throughout the bed — avoids hot spots that cause ash slagging</li><li><strong>Feedstock flexibility:</strong> Can handle a wide range of feedstocks with varying particle sizes and moisture content</li><li><strong>High throughput:</strong> Much higher specific gasification capacity than fixed bed reactors</li></ul>
<h4>Types</h4>
<ul><li><strong>Bubbling Fluidized Bed (BFB):</strong> Lower velocity — bed bubbles like boiling water. Simpler, used for smaller scales.</li><li><strong>Circulating Fluidized Bed (CFB):</strong> Higher velocity — particles carried out, separated in cyclone, and returned. Better mixing, used for larger scales (>10 MW).</li></ul>
<h4>Advantages over Fixed Bed</h4>
<ul><li>Better heat and mass transfer → higher conversion efficiency</li><li>Flexible for varying feedstocks (municipal waste, agricultural residue)</li><li>Easy to scale up</li></ul>
<h4>Disadvantages</h4>
<ul><li>Higher tar content than downdraft</li><li>Complex design, higher capital cost</li><li>Requires feedstock size control (too large or small causes problems)</li></ul>` },

  'ch2_5': { marks:3, refs:['ku-slides', 'basu', 'bridgwater'], content:`<h4>Updraft vs Downdraft Gasifiers — Comparison</h4>
<div class="step"><strong>Updraft Gasifier</strong><br>
Configuration: Biomass fed from top, air enters from bottom, gas exits from top.<br>
Temperature: ~1000-1400°C in combustion zone.<br>
Gas quality: HIGH tar content (~50-100 g/Nm³). Gas exits before passing through hot reduction zone.<br>
Efficiency: High thermal efficiency (good heat exchange between rising gas and descending biomass).<br>
Applications: Direct heat applications where tar in gas is not a problem (kiln, furnace). NOT suitable for engines.<br>
✅ High efficiency, handles high moisture content (up to 60%)<br>
❌ Very high tar — gas cleaning required for engine use</div>
<div class="step"><strong>Downdraft Gasifier</strong><br>
Configuration: Both air and gas flow downward. Gas exits from bottom after passing through hot reduction zone.<br>
Temperature: ~700-900°C in reduction zone.<br>
Gas quality: LOW tar content (<1 g/Nm³). Tar is cracked as it passes through the hot reduction zone.<br>
Efficiency: Slightly lower thermal efficiency than updraft.<br>
Applications: IC engines, generators — directly usable without extensive cleaning.<br>
✅ Very low tar — ideal for engines<br>
❌ Cannot handle high moisture (>20%) or very small particles</div>
<div class="kp">Rule of thumb: Updraft = direct heat applications. Downdraft = engine/electricity applications. This is why most biomass gasifier systems for rural electrification use downdraft design.</div>` },

  'ch2_6': { marks:5, refs:['ku-slides', 'bridgwater'], content:`<h4>Pyrolysis Process and Practical Applications</h4>
<h4>What is Pyrolysis?</h4>
<p>Pyrolysis is the thermal decomposition of biomass in the complete ABSENCE of oxygen at temperatures between 300-700°C. Unlike combustion (which burns) or gasification (partial oxidation), pyrolysis breaks down the molecular structure using only heat.</p>
<h4>Products of Pyrolysis</h4>
<div class="vis-box" style="padding:0;overflow:hidden;border-radius:10px;">
<svg viewBox="0 0 560 200" xmlns="http://www.w3.org/2000/svg" style="width:100%;display:block;background:#0d1318;">
  <text x="280" y="18" fill="#3a5568" font-size="8.5" font-family="JetBrains Mono,monospace" text-anchor="middle" letter-spacing="0.1em">PYROLYSIS — PRODUCT DISTRIBUTION BY OPERATING MODE (%)</text>
  <!-- Stacked bar rows. Each row = one mode. Width 420px total for 100% -->
  <!-- Slow Pyrolysis: bio-oil=30%, char=35%, gas=35% -->
  <text x="10" y="52" fill="#7a9ab0" font-size="9" font-family="DM Sans,sans-serif" text-anchor="start">Slow Pyrolysis</text>
  <text x="10" y="62" fill="#4a6070" font-size="7.5" font-family="JetBrains Mono,monospace" text-anchor="start">300–400°C</text>
  <rect x="130" y="40" width="126" height="22" rx="3" fill="rgba(56,189,248,0.6)" stroke="#38bdf8" stroke-width="1"/>
  <rect x="256" y="40" width="147" height="22" rx="3" fill="rgba(251,191,36,0.6)" stroke="#fbbf24" stroke-width="1"/>
  <rect x="403" y="40" width="147" height="22" rx="3" fill="rgba(34,211,160,0.6)" stroke="#22d3a0" stroke-width="1"/>
  <text x="193" y="55" fill="#e2eff5" font-size="8.5" font-family="JetBrains Mono,monospace" text-anchor="middle" font-weight="600">30%</text>
  <text x="329" y="55" fill="#e2eff5" font-size="8.5" font-family="JetBrains Mono,monospace" text-anchor="middle" font-weight="600">35%</text>
  <text x="476" y="55" fill="#e2eff5" font-size="8.5" font-family="JetBrains Mono,monospace" text-anchor="middle" font-weight="600">35%</text>
  <!-- Fast Pyrolysis: bio-oil=75%, char=12%, gas=13% -->
  <text x="10" y="92" fill="#7a9ab0" font-size="9" font-family="DM Sans,sans-serif" text-anchor="start">Fast Pyrolysis</text>
  <text x="10" y="102" fill="#4a6070" font-size="7.5" font-family="JetBrains Mono,monospace" text-anchor="start">500°C, &lt;2s</text>
  <rect x="130" y="80" width="315" height="22" rx="3" fill="rgba(56,189,248,0.8)" stroke="#38bdf8" stroke-width="1.5"/>
  <rect x="445" y="80" width="50" height="22" rx="3" fill="rgba(251,191,36,0.6)" stroke="#fbbf24" stroke-width="1"/>
  <rect x="495" y="80" width="55" height="22" rx="3" fill="rgba(34,211,160,0.5)" stroke="#22d3a0" stroke-width="1"/>
  <text x="287" y="95" fill="#e2eff5" font-size="9" font-family="JetBrains Mono,monospace" text-anchor="middle" font-weight="700">75% Bio-oil ⭐</text>
  <text x="470" y="95" fill="#e2eff5" font-size="8" font-family="JetBrains Mono,monospace" text-anchor="middle">12%</text>
  <text x="522" y="95" fill="#e2eff5" font-size="8" font-family="JetBrains Mono,monospace" text-anchor="middle">13%</text>
  <!-- Gasification: bio-oil=5%, char=10%, gas=85% -->
  <text x="10" y="132" fill="#7a9ab0" font-size="9" font-family="DM Sans,sans-serif" text-anchor="start">Gasification</text>
  <text x="10" y="142" fill="#4a6070" font-size="7.5" font-family="JetBrains Mono,monospace" text-anchor="start">limited O₂</text>
  <rect x="130" y="120" width="21" height="22" rx="3" fill="rgba(56,189,248,0.4)" stroke="#38bdf8" stroke-width="1"/>
  <rect x="151" y="120" width="42" height="22" rx="3" fill="rgba(251,191,36,0.4)" stroke="#fbbf24" stroke-width="1"/>
  <rect x="193" y="120" width="357" height="22" rx="3" fill="rgba(34,211,160,0.8)" stroke="#22d3a0" stroke-width="1.5"/>
  <text x="371" y="135" fill="#e2eff5" font-size="9" font-family="JetBrains Mono,monospace" text-anchor="middle" font-weight="700">85% Gas (Syngas) ⭐</text>
  <!-- Legend -->
  <rect x="80" y="162" width="380" height="24" rx="5" fill="#0a1318" stroke="#1a2530" stroke-width="1"/>
  <rect x="92" y="170" width="14" height="9" rx="2" fill="rgba(56,189,248,0.7)"/>
  <text x="110" y="179" fill="#38bdf8" font-size="8.5" font-family="DM Sans,sans-serif">Bio-oil</text>
  <rect x="152" y="170" width="14" height="9" rx="2" fill="rgba(251,191,36,0.7)"/>
  <text x="170" y="179" fill="#fbbf24" font-size="8.5" font-family="DM Sans,sans-serif">Biochar</text>
  <rect x="218" y="170" width="14" height="9" rx="2" fill="rgba(34,211,160,0.7)"/>
  <text x="236" y="179" fill="#22d3a0" font-size="8.5" font-family="DM Sans,sans-serif">Gas</text>
  <text x="330" y="179" fill="#4a5470" font-size="8" font-family="JetBrains Mono,monospace">420px = 100%  |  ⭐ = commercially preferred mode</text>
</svg></div>
<h4>Three Operating Modes</h4>
<div class="step"><strong>Slow Pyrolysis:</strong> Low temp (300-400°C), slow heating rate, long residence time. Maximises BIOCHAR production (~35%). Traditional charcoal making is slow pyrolysis.</div>
<div class="step"><strong>Fast Pyrolysis:</strong> Moderate temp (400-600°C), rapid heating (1000°C/s), short residence time (<2s). Maximises BIO-OIL production (~75%). Most commercially promising.</div>
<div class="step"><strong>Flash Pyrolysis:</strong> Very high heating rates, very short residence time. Also maximises liquid yield. Converts biomass to bio-oil within seconds.</div>
<h4>Practical Applications</h4>
<ul><li><strong>Bio-oil:</strong> Can replace heavy fuel oil in boilers and furnaces. Can be upgraded to transport fuels (bio-diesel precursor). Used in power generation.</li><li><strong>Biochar:</strong> Soil amendment (increases water retention, carbon sequestration). Used as solid fuel (charcoal replacement). Reduces agricultural methane emissions.</li><li><strong>Syngas:</strong> Combusted for heat and power generation.</li></ul>
<div class="kp">Key advantage over combustion: Pyrolysis can convert low-grade wet biomass to high-energy-density liquid (bio-oil) that is easier to transport and store than solid biomass.</div>` },

  'ch2_4': { marks:3, refs:['ku-slides', 'ku-exam-2022'], content:`<h4>LHV Calculation — RDF Pellet</h4>
<p><strong>Given:</strong> HHV=1000 kJ/kg, moisture M=50%=0.5, hydrogen H=10%=0.1, latent heat of vaporization=500 kJ/kg</p>
<h4>Formula</h4>
<div class="math-eq">$$LHV = HHV - h_{vap} \\times (9H + M)$$</div><p style="font-size:12px;color:var(--text2);margin:6px 0;">$H$ = hydrogen mass fraction = 0.10 | $M$ = moisture mass fraction = 0.50 | $h_{vap}$ = 500 kJ/kg (given) | $9H$ = water from hydrogen combustion</p>
<h4>Calculation</h4>
<div class="math-eq">$$LHV = 1000 - 500 \\times (9 \\times 0.10 + 0.50) = 1000 - 500 \\times 1.40 = \\boxed{300 \\text{ kJ/kg}}$$</div>
<div class="kp">LHV = 300 kJ/kg ✓ (this matches the Dec 2022 MCQ answer)</div>
<div class="wp">This very low LHV (300 kJ/kg) compared to the HHV (1000 kJ/kg) demonstrates why high moisture content is so damaging to biomass fuel quality — 70% of the HHV is lost just to evaporate the moisture and water from hydrogen combustion. Dry wood has HHV≈18,000 kJ/kg and LHV≈16,000 kJ/kg (only ~11% difference).</div>` },

  'ch2_3': { marks:4, refs:['ku-slides', 'aepc-2023', 'ku-exam-2024'], content:`<h4>Short Note: Improved Cook Stove (ICS)</h4>
<h4>Background and Problem</h4>
<p>Nepal's traditional three-stone cooking fire and basic metal stoves have thermal efficiency of only 10-15%. Over 50% of Nepal's households still use firewood for cooking, causing: deforestation, indoor air pollution (IAP), health issues (1,600+ deaths/year from respiratory diseases), and wasted biomass energy.</p>
<h4>What is an ICS?</h4>
<p>An Improved Cook Stove is a stove designed to burn biomass more efficiently with significantly reduced smoke emissions. The main goals: reduce fuel consumption, reduce indoor air pollution, improve health of women and children.</p>
<h4>Types of ICS</h4>
<ul><li><strong>Rocket stove:</strong> L-shaped combustion chamber, insulated. Combustion efficiency >40%. Fuel savings: 40-60%. Can use small twigs.</li><li><strong>Gasifier stove (TLUD — Top-Lit UpDraft):</strong> Biomass is gasified in primary chamber, gas burns cleanly in secondary chamber. Near-zero smoke. Produces biochar as byproduct.</li><li><strong>Institutional stoves:</strong> Larger scale for schools, health posts. Pot skirts and chimneys reduce emissions.</li></ul>
<h4>Testing: Water Boiling Test (WBT)</h4>
<p>Standard WBT has 3 phases: Cold Start (stove and pot cold), Hot Start (stove already warm), and Simmering (maintaining boil). Measures thermal efficiency, specific fuel consumption, and emission factors.</p>
<div class="kp">Nepal context: AEPC has distributed over 800,000 ICS units. They reduce firewood consumption by 30-50%, reducing deforestation pressure and indoor pollution. Thermal efficiency: traditional 3-stone = 10-15%, ICS = 35-45%.</div>` },

  'ch2_7': { marks:3, refs:['ku-slides'], content:`<h4>Water Boiling Test (WBT) — Standard Stove Test Protocol</h4>
<h4>Purpose</h4>
<p>The WBT is the most widely used standardized test to evaluate cookstove performance. It assesses: thermal efficiency, fuel consumption rate, power output, and emissions.</p>
<h4>Three Test Phases</h4>
<div class="step"><strong>Phase 1 — Cold Start High Power:</strong> Stove starts cold. Water is boiled from ambient temperature. Measures start-up performance, cold start efficiency, and time to boil.</div>
<div class="step"><strong>Phase 2 — Hot Start High Power:</strong> Stove already at operating temperature. Water is boiled again. Measures steady-state high-power efficiency. Better represents normal cooking conditions.</div>
<div class="step"><strong>Phase 3 — Simmering Low Power:</strong> Water maintained just below boiling for 45 minutes. Measures low-power efficiency — important for slow cooking tasks like rice or lentils.</div>
<div class="wp">Note: "Controlled Cooking Test" is NOT part of the standard WBT — it is a separate field test that simulates actual local cooking practices. This distinction appeared as a Dec 2022 MCQ question.</div>
<h4>Key Metrics Measured</h4>
<ul><li>Thermal efficiency (%)</li><li>Specific fuel consumption (g wood per liter of water boiled)</li><li>Firepower (kW) — high and low</li><li>Indoor emissions: CO, PM2.5</li></ul>` },

  // ─── CH3 MISSING ANSWERS ───
  'ch3_2': { marks:3, refs:['ku-slides', 'ku-exam-2022'], content:`<h4>Fixed Dome vs Floating Dome vs Bag Type Biodigester — 2 Technical Differences Each</h4>
<div class="step"><strong>Fixed Dome vs Floating Dome:</strong><br>
① Gas pressure: Fixed dome produces VARIABLE gas pressure (gas accumulates → slurry pushed to expansion chamber → pressure rises). Floating dome maintains CONSTANT gas pressure (drum rises as gas builds, constant weight = constant pressure).<br>
② Construction material: Fixed dome is built entirely from bricks, mortar and cement — no metal parts above ground. Floating dome has a steel/metal drum that corrodes over time, requiring maintenance. Fixed dome lasts 20+ years without major maintenance; floating dome drum may need replacement in 5-10 years.</div>
<div class="step"><strong>Fixed Dome vs Bag Type:</strong><br>
① Volume: Fixed dome has a rigid structure with fixed volume. Bag digester (tubular plastic) is flexible — volume changes with gas content, acting like a balloon.<br>
② Lifespan: Fixed dome lasts 15-25 years (underground masonry). Bag digester lasts only 2-5 years (UV degradation, physical damage). Not suitable for Nepal's hilly terrain or cold climate.</div>
<div class="step"><strong>Floating Dome vs Bag Type:</strong><br>
① Gas storage: Floating dome has separated gas storage (the dome acts as a gas holder above slurry). Bag digester stores gas within the same flexible bag as the slurry.<br>
② Installation: Bag digester can be installed in 1-2 days by local people with minimal skills. Floating dome requires skilled masonry + metalwork for the steel drum.</div>
<div class="kp">Most common in Nepal: Fixed Dome (GGC 2047 model) — 450,000+ installed. Preferred for Nepal's terrain and climate.</div>` },

  'ch3_5': { marks:"4", refs:['ku-slides', 'ku-exam-2024'], content:`<h4>Four Stages of Anaerobic Digestion</h4>
<h4>Overview</h4>
<p>Anaerobic digestion (AD) proceeds through 4 sequential biochemical stages, each performed by different groups of microorganisms. The process converts complex organic matter into biogas (CH₄ + CO₂).</p>
<h4>Stage 1 — Hydrolysis</h4>
<div class="step"><strong>Process:</strong> Complex polymers (proteins, fats, carbohydrates) are broken down into simple soluble monomers (amino acids, fatty acids, sugars) by hydrolytic bacteria producing extracellular enzymes.<br><strong>Rate:</strong> Often the rate-limiting step for solid waste substrates. Slower for lignin-rich materials.</div>
<h4>Stage 2 — Acidogenesis</h4>
<div class="step"><strong>Process:</strong> Monomers are fermented by acidogenic bacteria into volatile fatty acids (VFAs — acetic, propionic, butyric acid), plus CO₂ and H₂.<br><strong>pH effect:</strong> This stage produces acids → pH can drop if acidogenesis is too fast relative to methanogenesis.</div>
<h4>Stage 3 — Acetogenesis</h4>
<div class="step"><strong>Process:</strong> Acetogenic bacteria convert VFAs into acetic acid (CH₃COOH), plus H₂ and CO₂. Acetate is the primary substrate for methanogenesis.<br><strong>Condition:</strong> Requires low H₂ partial pressure — syntrophic relationship with methanogens.</div>
<h4>Stage 4 — Methanogenesis</h4>
<div class="step"><strong>Process:</strong> Methanogenic archaea convert acetate and H₂/CO₂ into methane (CH₄) + CO₂.<br>• Acetoclastic: CH₃COOH → CH₄ + CO₂ (70% of CH₄)<br>• Hydrogenotrophic: 4H₂ + CO₂ → CH₄ + 2H₂O (30%)<br><strong>This is the RATE-LIMITING STEP for most digesters. pH must be 6.8–7.2 — methanogens are the most sensitive to pH changes.</strong></div>
<div class="kp">Optimum conditions: pH 6.8–7.2 | Temperature 35°C (mesophilic) or 55°C (thermophilic) | C:N ratio 20–30:1 | HRT 30–60 days for cattle dung</div>` },

  'ch3_6': { marks:3, refs:['ku-slides', 'wecs-2024'], content:`<h4>Biogas vs LPG — Comparison as Cooking Fuel</h4>
<div class="step"><strong>Composition:</strong><br>
Biogas: 55-70% CH₄, 30-45% CO₂, trace H₂S.<br>
LPG: ~60% butane (C₄H₁₀) + 40% propane (C₃H₈). No CO₂ — pure fuel gas.</div>
<div class="step"><strong>Calorific Value:</strong><br>
Biogas: ~22 MJ/m³ (variable — depends on CH₄ content)<br>
LPG: ~47 MJ/kg or ~26 MJ/L (much higher energy density)<br>
Comparison: 1 m³ biogas ≈ 0.45 kg LPG equivalent</div>
<div class="step"><strong>Storage and Distribution:</strong><br>
Biogas: Cannot be easily compressed for cylinders at household scale (low pressure, 4-8 mbar). Must be used near the digester. No distribution infrastructure.<br>
LPG: Compressed into portable cylinders → can be transported anywhere in Nepal. Nationwide distribution network.</div>
<div class="step"><strong>Suitability for Nepal Rural Households:</strong><br>
Biogas: ✅ FREE fuel if dung is available. ✅ Digestate = valuable fertilizer. ✅ No cylinder logistics. ❌ Requires 2-4 cattle minimum. ❌ Fixed installation, not portable.<br>
LPG: ✅ Portable, available everywhere. ✅ Higher energy density = less gas needed. ❌ Imported, expensive, price-volatile. ❌ Not accessible in remote areas.</div>
<div class="kp">For Nepal: Biogas ideal for Terai and mid-hills (cattle-owning households). LPG better for urban areas and cattle-less households. National target: biogas to replace LPG in Terai households by 2030.</div>` },

  'ch3_7': { marks:2, refs:['ku-slides', 'ku-exam-2024'], content:`<h4>Optimum pH for Anaerobic Digestion and Importance of pH Control</h4>
<h4>Optimum pH Range</h4>
<div class="math-eq">$$\\text{Optimum pH} = 6.8 - 7.2$$</div>
<h4>Why pH Control Matters</h4>
<p>Different stages of AD have different optimal pH ranges:</p>
<ul><li><strong>Hydrolysis and Acidogenesis:</strong> Optimal at pH 5.5–6.5 (slightly acidic)</li><li><strong>Methanogenesis:</strong> Optimal at pH 6.8–7.2. Methanogens are extremely sensitive to pH changes.</li></ul>
<h4>What Happens Below pH 6 (Acidification/Souring)</h4>
<ul><li>Volatile fatty acids (VFAs) accumulate faster than methanogens can consume them → acid buildup</li><li>Methanogens are inhibited → biogas production drops dramatically</li><li>The digester "sours" — pH keeps dropping → methanogens die → complete failure</li><li>Recovery requires removing some slurry, adding buffer (lime/NaHCO₃), and restarting slowly</li></ul>
<div class="kp">Causes of acidification in Nepal biogas plants: overloading (too much dung), addition of chemical fertilizers, antibiotics in cattle feed (kills microorganisms), or sudden temperature drop in winter.</div>` },

  'ch3_8': { marks:4, refs:['ku-slides', 'aepc-2023'], content:`<h4>Fixed Dome Biogas Plant — Working Principle and Diagram</h4>
<h4>Working Principle</h4>
<p>The fixed dome plant (GGC 2047 model in Nepal) is a completely underground, airtight structure. It consists of a cylindrical digester with a hemispherical dome.</p>
<h4>Operation</h4>
<div class="step"><strong>Loading:</strong> Daily dung + water (1:1) mixture is fed through the inlet pipe into the digester.</div>
<div class="step"><strong>Digestion:</strong> Anaerobic bacteria digest the slurry over 40-60 days (HRT). Biogas (CH₄+CO₂) is produced and rises to fill the dome space above the slurry.</div>
<div class="step"><strong>Pressure and gas storage:</strong> As gas accumulates, it cannot expand (fixed dome), so it pushes slurry DOWN into the digester and UP into the expansion (overflow) chamber through a connecting pipe. This creates variable gas pressure (4-8 mbar typically).</div>
<div class="step"><strong>Gas use:</strong> Gas pipe connects dome to kitchen stove. When gas tap is opened, pressure difference drives gas to stove.</div>
<div class="step"><strong>Spent slurry (digestate):</strong> Overflows out of expansion chamber through outlet pipe. Rich in nitrogen → excellent organic fertilizer.</div>
<h4>Why Most Common in Nepal</h4>
<ul><li>No moving parts → zero maintenance for 20+ years</li><li>Underground → thermally insulated → works in Nepal's cold winters</li><li>Local materials (bricks, cement) → can be built by trained local masons</li><li>GGC (Gobar Gas Company) model standardized and proven since 1975</li></ul>` },

  'ch3_4': { marks:6, refs:['ku-slides'], content:`<h4>Household Biogas Design — 30 kg/day Dung, HRT=40 days</h4>
<p><strong>Given:</strong> W=30 kg/day, HRT=40 days, dung:water=1:1, biogas yield=30 L/kg cattle dung</p>
<div class="derivation"><span class="step-num">Volume & Biogas</span>$$V = 0.06 \\text{ m}^3\\text{/day} \\times 40 = \\boxed{2.4 \\text{ m}^3} \\quad Q = 30 \\times 30 = \\boxed{0.9 \\text{ m}^3\\text{/day}}$$</div><div class="derivation"><span class="step-num">LPG Equivalent</span>$$m_{LPG} = 0.9 \\times 0.45 = \\boxed{0.405 \\text{ kg/day}} \\rightarrow 148 \\text{ kg/year saved}$$</div>
<div class="kp">A 2.5 m³ fixed dome biogas plant serves a family of 5-6 persons with 30 kg/day cattle dung (3-4 cattle). Provides ~0.9 m³/day biogas — sufficient for 2 hours of cooking. Saves ~148 kg LPG/year ≈ Rs 20,000-25,000/year at current prices.</div>` },

  'ch3_3': { marks:2, refs:['ku-slides', 'ku-exam-2024'], content:`<h4>Biogas Plant Sizing — 50 kg Cattle Manure, HRT=50 days</h4>
<p><strong>Given:</strong> W=50 kg/day, HRT=50 days, biogas yield=30 L/kg, dung:water=1:1</p>
<div class="math-eq">$$V = 0.1 \\text{ m}^3\\text{/day} \\times 50 \\text{ days} = \\boxed{5 \\text{ m}^3}$$</div><div class="math-eq small">$$Q_{biogas} = 50 \\times 30 = 1500 \\text{ L/day} = 1.5 \\text{ m}^3\\text{/day}$$</div>
<div class="kp">Required plant size: 5 m³. This is a medium-sized household plant — suitable for a farm with 5-7 cattle.</div>` },

  // ─── CH4 MISSING ANSWERS ───
  'ch4_0': { marks:"6+5", refs:['ku-slides', 'ku-exam-2025', 'duffie'], content:`<h4>Solar Flat Plate Collector + PV Plant Row Spacing & Area (5MW, 27°N)</h4>
<h4>Flat Plate Collector — Working Principle & Energy Balance</h4>
<p>A flat plate solar collector absorbs solar radiation and transfers the heat to a fluid (water or glycol). Components: transparent cover glass (reduces convection losses), absorber plate (dark-coated metal — absorbs radiation), fluid tubes, insulated back panel.</p>
<div class="math-eq">$$G A_c \\tau\\alpha = Q_u + U_L A_c (T_i - T_a) \\quad \\Rightarrow \\quad \\eta = F_R\\left[\\tau\\alpha - U_L\\frac{T_i-T_a}{G}\\right]$$</div>
<h4>PV Plant Row Spacing Calculation (5MW at 27°N)</h4>
<div class="derivation"><span class="step-num">Step 1 — Tilt angle: β ≈ L = 27°</span>$$\\alpha_{min} = 90° - L - 23.45° = 90 - 27 - 23.45 = 39.55° \\text{ (winter solstice elevation)}$$</div><div class="derivation"><span class="step-num">Step 2 — Row Spacing</span>$$h = 2.2 \\sin(27°) = 0.999 \\text{ m} \\quad D = \\frac{h}{\\tan(39.55°)} = \\frac{0.999}{0.824} = 1.21 \\text{ m}$$$$\\text{Row pitch} = 2.2\\cos(27°) + 1.21 = 1.96 + 1.21 = \\boxed{3.17 \\text{ m}}$$</div><div class="derivation"><span class="step-num">Step 3 & 4 — Module count and total area</span>$$N_{modules} = \\frac{5{,}000{,}000}{600} = 8{,}334 \\text{ modules} \\quad \\Rightarrow \\text{Total area} \\approx \\boxed{1.72 \\text{ ha (min)}}$$<div class="kp">Key Point: Row pitch = D_horizontal + D_spacing. For 2 rows × 30 modules each = 60 modules per string. Total strings = 8334/60 ≈ 139 strings. Total ground area = 8334 × (row pitch × module width) = 8334 × (3.17 × 1.3) ≈ 34,380 m² = <strong>3.44 ha</strong> minimum land requirement. Add access roads → ~4–5 ha typically.</div>
<div class="kp">Note: "Use sun path diagram" means read α_min = 39.55° at winter solstice from the diagram for latitude 27°N. In exam, always state: tilt = latitude, use winter solstice for worst-case shading.</div>` },

  'ch4_2': { marks:3, refs:['ku-slides', 'ku-exam-2022', 'duffie'], content:`<h4>Thermosyphon Technology — Principle and Thermal Circuit Diagram</h4>
<h4>Working Principle</h4>
<p>A thermosyphon solar water heater uses natural convection (buoyancy forces) to circulate water between the collector and storage tank — NO pump required.</p>
<h4>How It Works</h4>
<div class="step"><strong>1.</strong> Cold water (denser, heavier) in the collector is heated by solar radiation → density decreases.</div>
<div class="step"><strong>2.</strong> Warm water rises naturally to the storage tank above (lower density = more buoyant).</div>
<div class="step"><strong>3.</strong> Cold water from the bottom of the tank flows down to replace it → continuous natural circulation loop.</div>
<div class="step"><strong>Key requirement:</strong> Storage tank MUST be physically above the collector (minimum 300mm clearance). Reverse circulation at night is prevented by this geometry (cold water stays in collector at night, doesn't flow back).</div>
<h4>Electrically Analogous Circuit</h4>
<div class="math-eq">$$Q_u = \\frac{\\Delta T}{R_{total}} = \\frac{T_{sun} - T_{ambient}}{R_{glass} + R_{absorber} + R_{fluid} + R_{loss}}$$</div><p style="font-size:12px;color:var(--text2);margin:6px 0;">Thermal resistance analogy: $R = 1/(hA)$ for convection, $R = t/kA$ for conduction, $R_{loss} = 1/(U_L A_c)$ for overall losses.</p>
<div class="kp">Advantages: No electricity needed, no pump failure risk, simple and reliable. Ideal for Nepal's off-grid rural areas. Disadvantage: Tank must be elevated — roof mounting required.</div>` },

  'ch4_3': { marks:3, refs:['ku-slides', 'ku-exam-2022', 'twidell'], content:`<h4>3 Key Parameters in Wind Resource Assessment (WRA)</h4>
<div class="step"><strong>1. Wind Speed</strong><br>
Measured at standard heights (10m, 50m, 80m, 100m) using cup anemometers on meteorological masts.<br>
Importance: Power ∝ v³ — a 10% error in mean wind speed = 33% error in energy estimate. The most critical single parameter in WRA.<br>
Standard: Minimum 1 year of data to capture seasonal variation. Mean annual wind speed >5 m/s needed for economically viable turbines.</div>
<div class="step"><strong>2. Wind Direction (Wind Rose)</strong><br>
Measured by wind vane, plotted as a wind rose diagram showing frequency and magnitude from each compass direction.<br>
Importance: Determines prevailing wind direction → optimizes turbine layout to minimize wake losses. Also critical for turbine yaw system design and noise impact assessment in nearby communities.</div>
<div class="step"><strong>3. Turbulence Intensity (TI)</strong><br>
TI = σ_v / v_mean (ratio of standard deviation of wind speed to mean speed). Measured at same heights as wind speed.<br>
Importance: High turbulence → increased fatigue loads on blades and tower → affects turbine IEC class selection. TI > 15% indicates complex terrain or forest canopy effects. Poor site if TI > 20%.</div>
<div class="kp">Standard monitoring heights: 10m (reference), 50m (hub height estimate), 80-100m (actual hub height for modern turbines). Minimum measurement duration: 12 months minimum, 2+ years preferred.</div>` },

  // ─── CH5 MISSING ANSWERS ───
  'ch5_1': { marks:"8+2+2+5", refs:['ku-slides','ku-exam-2022','masters'], content:`
<h4>Net-Zero Restaurant PV System Design — Namche Bazaar</h4>
<p><em>The system uses ONLY renewable energy (standalone / off-grid). All calculations depend on the attached load table and data given in the exam. The approach below shows the method with standard formulas.</em></p>

<h4>a. Average Daily Energy Load & Peak Power (Year 5)</h4>
<div class="derivation">
  <span class="step-num">Load Calculation</span>
  $$E_{daily} = \\sum (P_i \\times H_i) \\quad [\\text{Wh/day}]$$
  $$E_{year5} = E_{base} \\times (1 + g)^5 \\quad g = \\text{annual growth rate (1.03–1.05)}$$
  $$P_{peak} = \\sum P_{simultaneous} \\times \\text{diversity factor}$$
</div>
<div class="note-box">📋 Use the exam's attached load table to sum all (Power × Hours) values. Year 5 accounts for tourist growth. Peak power = all appliances likely to run simultaneously (kitchen + lighting peak).</div>

<h4>b. Battery Bank Capacity</h4>
<div class="derivation">
  <span class="step-num">Battery Sizing</span>
  $$Ah = \\frac{E_{daily} \\times N_{auto}}{V_{sys} \\times DOD \\times \\eta_{bat}}$$
  $$N_{auto} = 3 \\text{ days (remote mountain site)}, \\quad DOD = 0.8 \\text{ (deep cycle)}, \\quad V_{sys} = 24\\text{ V or }48\\text{ V}$$
</div>
<div class="vis-box">
  <div class="vis-title">Battery Bank Configuration — Series + Parallel</div>
  <svg viewBox="0 0 400 120" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:400px;">
    <defs><marker id="ba" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L0,6 L6,3 z" fill="#22d3a0"/></marker></defs>
    <!-- String 1: cells in series for voltage -->
    <rect x="10" y="20" width="50" height="30" rx="5" fill="rgba(56,189,248,0.12)" stroke="#38bdf8" stroke-width="1.5"/>
    <text x="35" y="33" fill="#38bdf8" font-size="8" text-anchor="middle" font-family="monospace">Cell 1</text>
    <text x="35" y="44" fill="#64748b" font-size="7" text-anchor="middle">12V / 100Ah</text>
    <line x1="60" y1="35" x2="80" y2="35" stroke="#38bdf8" stroke-width="1.5" marker-end="url(#ba)"/>
    <rect x="81" y="20" width="50" height="30" rx="5" fill="rgba(56,189,248,0.12)" stroke="#38bdf8" stroke-width="1.5"/>
    <text x="106" y="33" fill="#38bdf8" font-size="8" text-anchor="middle" font-family="monospace">Cell 2</text>
    <text x="106" y="44" fill="#64748b" font-size="7" text-anchor="middle">12V / 100Ah</text>
    <text x="200" y="33" fill="#38bdf8" font-size="9" text-anchor="middle" font-family="monospace">→ SERIES → 24V / 100Ah</text>
    <!-- String 2: parallel for capacity -->
    <rect x="10" y="65" width="50" height="30" rx="5" fill="rgba(167,139,250,0.12)" stroke="#a78bfa" stroke-width="1.5"/>
    <text x="35" y="78" fill="#a78bfa" font-size="8" text-anchor="middle" font-family="monospace">Cell 1</text>
    <text x="35" y="89" fill="#64748b" font-size="7" text-anchor="middle">12V / 100Ah</text>
    <line x1="60" y1="80" x2="80" y2="80" stroke="#a78bfa" stroke-width="1.5" marker-end="url(#ba)"/>
    <rect x="81" y="65" width="50" height="30" rx="5" fill="rgba(167,139,250,0.12)" stroke="#a78bfa" stroke-width="1.5"/>
    <text x="106" y="78" fill="#a78bfa" font-size="8" text-anchor="middle" font-family="monospace">Cell 2</text>
    <text x="106" y="89" fill="#64748b" font-size="7" text-anchor="middle">12V / 100Ah</text>
    <text x="200" y="78" fill="#a78bfa" font-size="9" text-anchor="middle" font-family="monospace">→ PARALLEL → 24V / 200Ah</text>
    <!-- Labels -->
    <text x="10" y="115" fill="#64748b" font-size="8" font-family="monospace">Series = ↑ Voltage</text>
    <text x="200" y="115" fill="#64748b" font-size="8" font-family="monospace">Parallel = ↑ Capacity (Ah)</text>
  </svg>
</div>

<h4>c. Inverter Size</h4>
<div class="derivation">
  <span class="step-num">Inverter Sizing</span>
  $$S_{inverter} = \\frac{P_{peak}}{\\cos\\phi} \\times 1.25 \\quad [\\text{VA}]$$
  $$\\cos\\phi = \\text{power factor (0.8–1.0 for mixed loads)}$$
</div>
<div class="note-box">Select the next standard size above: e.g. 2kVA, 3kVA, 5kVA, 10kVA. For Namche (mountain, no grid): choose high-quality pure sine wave inverter with overload protection.</div>

<h4>d. PV Array Design</h4>
<div class="derivation">
  <span class="step-num">PV Modules Required</span>
  $$N_{modules} = \\frac{P_{PV}}{P_{module}} \\quad \\text{where} \\quad P_{PV} = \\frac{E_{daily}}{G \\times PR}$$
  $$N_{series} = \\frac{V_{sys}}{V_{mp}} \\times 1.2 \\quad \\text{(voltage matching with safety factor)}$$
  $$N_{parallel} = \\lceil N_{modules} / N_{series} \\rceil \\quad \\text{(parallel strings)}$$
</div>
<div class="kp">✅ Final check: V_array = N_series × V_mp ≥ V_system. I_array = N_parallel × I_mp. Array must complement battery bank voltage. For Namche: use high-efficiency mono-Si panels — cold temperature actually IMPROVES Voc, boosting output.</div>
` },

'ch5_2': { marks:"6+5", refs:['ku-slides', 'ku-exam-2025', 'duffie', 'masters'], content:`<h4>Flat Plate Collector + 5MW PV Plant Inter-Row Spacing</h4>
<p>See Ch4 Q0 answer — this is the same question from Jul 2025. The question combines flat plate collector theory (6 marks) with the 5MW PV plant spacing calculation (5 marks).</p>
<h4>Flat Plate Collector Energy Balance (Summary)</h4>
<div class="math-eq">$$\\eta = F_R\\left[\\tau\\alpha - U_L\\frac{T_i-T_a}{G}\\right]$$</div><p style="font-size:12px;color:var(--text2);margin:6px 0;">$F_R$=0.80–0.95, $\\tau\\alpha$=0.70–0.90, $U_L$=3–8 W/m²·K</p>
<h4>Inter-Row Spacing Key Formula</h4>
<div class="math-eq">$$\\alpha_{min} = 90° - L - 23.45° \\quad \\Rightarrow \\quad D_{spacing} = \\frac{h_{module}}{\\tan(\\alpha_{min})}$$</div>` },

  'ch5_5': { marks:3, refs:['ku-slides', 'masters'], content:`<h4>Three Generations of Solar PV Technology</h4>
<div class="step"><strong>1st Generation — Crystalline Silicon (c-Si)</strong><br>
Materials: Monocrystalline (mono-Si) and Polycrystalline (poly-Si)<br>
Efficiency: Mono = 18-24%, Poly = 15-20%<br>
Market share: ~80% of global PV market<br>
Characteristics: Mature technology, 25+ year warranty, thick wafers (~200μm). High reliability but silicon wafer cost is significant.<br>
Applications: Rooftop, utility-scale, most standard installations.</div>
<div class="step"><strong>2nd Generation — Thin Film</strong><br>
Materials: Amorphous Silicon (a-Si), CdTe, CIGS<br>
Efficiency: 8-15%<br>
Characteristics: 1-10μm thick film on glass/metal. Flexible, lightweight, better low-light and high-temperature performance. Lower silicon cost.<br>
Applications: Building-integrated PV (BIPV), large utility-scale CdTe plants (First Solar).</div>
<div class="step"><strong>3rd Generation — Advanced Concepts</strong><br>
Materials: Multi-junction (InGaP/GaAs/Ge), Perovskite, Organic PV, Concentrated PV<br>
Efficiency: Multi-junction 30-46% (CPV), Perovskite 25%+ (lab), Organic 10-15%<br>
Characteristics: Exceed Shockley-Queisser limit using multiple junctions or novel absorption mechanisms. Most still research/niche stage.<br>
Applications: Space satellites (multi-junction), research, building-integrated (organic).</div>
<div class="kp">Nepal market: Almost exclusively 1st gen crystalline silicon — robust, proven, widely available from Indian and Chinese manufacturers.</div>` },

  'ch5_6': { marks:3, refs:['ku-slides', 'masters'], content:`<h4>Fill Factor of a Solar Cell</h4>
<h4>Definition</h4>
<div class="math-eq">$$FF = \\frac{P_{max}}{I_{sc} \\times V_{oc}} = \\frac{I_{mp} \\times V_{mp}}{I_{sc} \\times V_{oc}}$$</div><p style="font-size:12px;color:var(--text2);margin:6px 0;">Good cell: FF = 0.70–0.85 | Ideal: FF → 1.0 | Poor/degraded: FF &lt; 0.60</p>
<h4>Physical Meaning</h4>
<p>FF represents the "squareness" of the IV curve. An ideal cell would have a perfectly rectangular IV curve where maximum power = I_sc × V_oc. In reality, series resistance and shunt resistance round the corners of the curve, reducing FF.</p>
<h4>What Causes Low Fill Factor?</h4>
<ul><li><strong>High series resistance (R_s):</strong> Due to poor contact resistance, thin metal fingers, or bulk resistance of semiconductor. Causes the IV curve to tilt — reduces V_mp significantly.</li><li><strong>Low shunt resistance (R_sh):</strong> Due to manufacturing defects, cracks, partial shading. Creates leakage current path — reduces I_mp.</li><li><strong>Recombination losses:</strong> Defects in semiconductor bulk or surface cause charge carriers to recombine before reaching contacts → reduces both I_mp and V_mp.</li></ul>
<div class="kp">Low FF indicates poor cell manufacturing quality, degradation, or damage. A new quality commercial cell should have FF ≥ 0.75. If a cell's FF drops significantly from its rated value, it indicates degradation or potential damage (cracks, delamination).</div>` },

  'ch5_7': { marks:3, refs:['ku-slides', 'masters'], content:`<h4>Battery Sizing for Standalone PV — 3 Days Autonomy, 2kWh/day</h4>
<p><strong>Given:</strong> Daily load E=2 kWh/day, autonomy=3 days, V_system=12V, DOD=80%=0.8</p>
<div class="derivation"><span class="step-num">Battery Sizing Formula</span>$$Ah = \\frac{E_{daily} \\times N_{auto}}{V_{sys} \\times DOD \\times \\eta_{bat}} = \\frac{2000 \\times 3}{12 \\times 0.80 \\times 0.90} = \\boxed{694 \\text{ Ah}}$$</div><div class="note-box">Simplified (no $\\eta_{bat}$): $Ah = \\frac{2000 \\times 3}{12 \\times 0.80} = 625$ Ah. In KU exams, simplified form is usually accepted unless stated otherwise.</div>
<div class="kp">Answer: ~625–694 Ah at 12V (depending on battery efficiency assumed). This would require, for example, 5× 130Ah batteries in parallel for a 12V system, or 3× 250Ah batteries in parallel.</div>
<div class="wp">Exam tip: Always state your assumptions — the exact answer depends on whether η_battery is included. In KU exams, simplified formula (without η_bat) is usually expected unless stated.</div>` },

  'ch5_8': { marks:2, refs:['ku-slides', 'masters'], content:`<h4>Effect of Shading on PV Array and Role of Bypass Diodes</h4>
<h4>Effect of Shading</h4>
<p>In a series-connected PV string, ALL cells carry the same current. A shaded cell generates less current but is forced to carry the string current — it acts as a resistor (or even a reverse-biased load), dissipating power as heat. This is called the "hot spot" effect.</p>
<ul><li>Even 1 shaded cell in a string of 60 cells can reduce string power by 30-50%</li><li>Without protection, shaded cells can be permanently damaged by overheating</li><li>Partial shading on a module can make it appear as if the module is completely offline</li></ul>
<h4>How Bypass Diodes Help</h4>
<p>Bypass diodes are connected in anti-parallel across groups of cells (typically across every 20 cells, i.e., 3 bypass diodes per 60-cell module). When a cell group is shaded and its voltage reverses, the bypass diode conducts — providing an alternative current path that bypasses the shaded group.</p>
<div class="kp">Result: Instead of losing the entire string power, only the shaded sub-string is bypassed → module continues to generate power from unshaded cells. The IV curve shows characteristic "steps" due to bypass diode activation. Power loss is limited to the shaded fraction only.</div>` },

  'ch5_9': { marks:2, refs:['ku-slides', 'masters'], content:`<h4>Maximum Power Point Tracking (MPPT)</h4>
<h4>What is MPPT?</h4>
<p>The Maximum Power Point (MPP) is the operating point on a PV module's IV curve where it generates maximum power (P = I × V is maximum). This point changes continuously with solar irradiance and temperature.</p>
<h4>Why MPPT is Important</h4>
<p>Without MPPT, a PV system operates at a fixed voltage (battery voltage or load voltage) which is almost never the optimal MPP voltage. This can waste 10-30% of available energy.</p>
<h4>How MPPT Works</h4>
<p>An MPPT charge controller continuously measures PV voltage and current, calculates power, and uses algorithms (Perturb & Observe, Incremental Conductance) to find and maintain the operating point at the MPP. It then converts this voltage to the appropriate battery/load voltage using a DC-DC converter.</p>
<div class="note-box">⚡ MPPT operating ranges: Input voltage 25–45V | MPP at STC: ~30-35V (60-cell module) | Battery charge: 13.5–14.5V | Energy gain vs PWM: <strong>10–30%</strong> more energy harvested</div>
<div class="kp">In Nepal's varying irradiance (monsoon clouds) and temperature conditions (Himalayan cold), MPPT is especially valuable — morning, cloudy days, and winter all shift the MPP significantly. MPPT ensures maximum harvest under all conditions.</div>` },

  'ch5_4': { marks:"4", refs:['ku-slides', 'masters'], content:`<h4>PV System Energy Output — 10 Modules × 300 Wp at Pokhara</h4>
<h4>Given</h4>
<ul><li>10 PV modules, each rated <strong>300 Wp</strong> at STC (Standard Test Conditions: 1000 W/m², 25°C, AM1.5)</li><li>Location: <strong>Pokhara</strong>, average daily insolation G = 5.2 kWh/m²/day</li><li>System performance ratio PR ≈ 0.80 (typical for Nepal, accounting for temperature, wiring, inverter losses)</li></ul>
<h4>Step 1 — Total Installed Capacity</h4>
<div class="derivation"><span class="step-num">System Capacity</span>$$P_{PV} = 10 \times 300 = \boxed{3000 \text{ Wp} = 3 \text{ kWp}}$$</div>
<h4>Step 2 — Daily Energy Output</h4>
<div class="derivation"><span class="step-num">Daily Energy</span>$$E_{day} = P_{PV} \times G \times PR = 3 \text{ kWp} \times 5.2 \text{ kWh/m}^2\text{/day} \times 0.80 = \boxed{12.48 \text{ kWh/day}}$$</div>
<h4>Step 3 — Monthly Energy</h4>
<div class="derivation"><span class="step-num">Monthly Energy</span>$$E_{month} = 12.48 \times 30 = \boxed{374.4 \text{ kWh/month}}$$</div>
<h4>Step 4 — Annual Capacity Factor</h4>
<div class="derivation"><span class="step-num">Capacity Factor</span>$$CF = \frac{E_{annual}}{P_{rated} \times 8760} = \frac{12.48 \times 365}{3 \times 8760} = \frac{4555.2}{26280} = \boxed{0.173 = 17.3\%}$$</div>
<div class="kp">Capacity factor of 17.3% is typical for fixed-tilt solar PV in Nepal. Global average ≈ 15-20%. Key insight: PV generates at rated power only when G=1000W/m² — actual daily hours at STC is 5.2h (= PSH), so CF = PSH/24 × PR = 5.2/24 × 0.8 = 17.3%.</div>` },

  // ─── CH6 MISSING ANSWERS ───
  'ch6_2': { marks:3, refs:['ku-slides', 'ku-exam-2022', 'twidell'], content:`<h4>3 Parameters in Wind Resource Assessment</h4>
<p>See Ch4 Q3 answer — this is the same question. The three key parameters are: (1) Wind Speed, (2) Wind Direction, and (3) Turbulence Intensity. Full answer provided there.</p>
<div class="note-box">📡 <strong>3 Key WRA Parameters:</strong><br>① Wind Speed ($P\\propto v^3$, most critical) at 10–100m heights<br>② Wind Direction (rose diagram, turbine layout optimisation)<br>③ Turbulence Intensity $TI = \\sigma_v/\\bar{v}$ (IEC class, fatigue)<br>Min measurement period: <strong>12 months</strong></div>` },

  'ch6_5': { marks:"4", refs:['ku-slides', 'masters'], content:`<h4>Wind Turbine Power Calculation — 80m Rotor Diameter, 8 m/s</h4>
<h4>Given</h4>
<ul><li>Rotor diameter: D = 80 m → radius r = 40 m</li><li>Average wind speed: v = 8 m/s</li><li>Air density: ρ = 1.225 kg/m³</li></ul>
<h4>Step 1 — Swept Area</h4>
<div class="derivation"><span class="step-num">Swept Area</span>$$A = \pi r^2 = \pi \times 40^2 = \pi \times 1600 = \boxed{5026 \text{ m}^2}$$</div>
<h4>Step 2 — Total Wind Power Available</h4>
<div class="derivation"><span class="step-num">Wind Power</span>$$P_{wind} = \frac{1}{2} \rho A v^3 = \frac{1}{2} \times 1.225 \times 5026 \times 8^3$$$$= 0.5 \times 1.225 \times 5026 \times 512 = \boxed{1.578 \text{ MW}}$$</div>
<h4>Step 3 — Maximum Extractable Power (Betz Limit)</h4>
<div class="derivation"><span class="step-num">Betz Limit</span>$$P_{max} = C_{p,Betz} \times P_{wind} = \frac{16}{27} \times 1.578 = 0.593 \times 1.578 = \boxed{0.936 \text{ MW}}$$</div>
<div class="kp">The Betz limit (Cp = 16/27 = 0.593) is the theoretical maximum — derived from momentum theory. Modern large turbines achieve Cp ≈ 0.45–0.48, giving actual output ≈ 0.45 × 1.578 ≈ 710 kW for this machine.</div>
<div class="wp">Remember: P ∝ v³ (cube law) and P ∝ D² (area). A 10% increase in wind speed gives 1.1³ = 1.331 = 33% more power. Doubling rotor diameter quadruples swept area → quadruples power output.</div>` },

  'ch6_3': { marks:1, refs:['ku-slides', 'ku-exam-2024', 'twidell'], content:`<h4>Wind Speed 10% Higher → Power Increase Calculation</h4>
<div class="math-eq">$$P \\propto v^3 \\quad \\Rightarrow \\quad \\frac{P_A}{P_B} = \\left(\\frac{v_A}{v_B}\\right)^3 = (1.1)^3 = 1.331 \\quad \\Rightarrow \\quad \\boxed{33\\% \\text{ increase}}$$</div>
<div class="kp">Answer: b) 33% ✓<br>This is the most important numerical concept in wind energy: because power depends on the CUBE of wind speed, even small increases in wind speed give dramatically more power. This is why wind site selection (finding the windiest site) is so critical.</div>` },

  'ch6_6': { marks:3, refs:['ku-slides', 'twidell'], content:`<h4>Capacity Factor for Wind Turbines</h4>
<h4>Definition</h4>
<div class="math-eq">$$CF = \\frac{E_{actual}}{P_{rated} \\times 8760 \\text{ h/year}}$$</div>
<h4>Typical Values</h4>
<ul><li>Onshore wind (good site): 25-35%</li><li>Onshore wind (poor site): 15-25%</li><li>Offshore wind: 35-45%</li><li>Solar PV: 15-20%</li><li>Hydro (RoR Nepal): 40-50%</li></ul>
<h4>Why Capacity Factor is Less Than 100%</h4>
<ul><li>Wind is intermittent — doesn't blow at rated speed continuously</li><li>Below cut-in speed (3-5 m/s): no generation</li><li>Above cut-out speed (25 m/s): turbine shuts down for safety</li><li>Between cut-in and rated speed: output is below rated</li><li>Maintenance downtime: typically 3-5% unavailability</li></ul>
<h4>Nepal Typical CF</h4>
<p>Nepal's wind resources are largely unmapped. Known sites (Mustang, Jumla, Myagdi) show good potential. Estimated CF for well-sited onshore turbines: 25-35% in high-elevation areas, 15-20% in mid-hills.</p>` },

  'ch6_7': { marks:4, refs:['ku-slides', 'twidell'], content:`<h4>Main Components of HAWT and Their Functions</h4>
<ul><li><strong>Rotor Blades (2 or 3):</strong> Capture kinetic energy from wind by generating aerodynamic lift. Manufactured from fibreglass-reinforced composite. Each blade can be 40-80m long for large turbines.</li>
<li><strong>Hub:</strong> Connects blades to main shaft. In pitch-controlled turbines, contains pitch bearings and actuators to rotate each blade.</li>
<li><strong>Nacelle:</strong> Enclosure at top of tower housing all drive train components. Can be the size of a bus for large turbines.</li>
<li><strong>Main Shaft (Low-speed shaft):</strong> Connects hub to gearbox. Rotates at 10-20 rpm (rotor speed).</li>
<li><strong>Gearbox:</strong> Increases rotation speed from ~15 rpm to ~1500 rpm for generator. Can be replaced by direct-drive (gearbox-free) in modern turbines.</li>
<li><strong>Generator:</strong> Converts mechanical rotation to electricity (DFIG or PMSG in modern turbines).</li>
<li><strong>Yaw System:</strong> Rotates the entire nacelle to face the prevailing wind direction. Uses wind vane + yaw motor.</li>
<li><strong>Anemometer & Wind Vane:</strong> Measures wind speed and direction → feeds control system.</li>
<li><strong>Controller:</strong> Starts at cut-in speed (~3-5 m/s), limits power at rated speed via pitch control, shuts down at cut-out speed (~25 m/s).</li>
<li><strong>Tower:</strong> Tubular steel tower 60-120m tall. Taller = stronger, more consistent winds.</li></ul>
<div class="kp">For exam: Remember cut-in (3-5 m/s), rated (11-13 m/s), cut-out (25 m/s) wind speeds for typical HAWT.</div>` },

  'ch6_4': { marks:1, refs:['ku-slides', 'ku-exam-2022'], content:`<h4>HAWT vs VAWT — Which Statement is NOT True?</h4>
<div class="note-box">✅ <strong>Answer: d)</strong> HAWTs REQUIRE an active yaw drive — VAWTs don't.<br>a) Higher efficiency ✓ TRUE | b) Less aero losses ✓ TRUE | c) Lower cost-to-power ✓ TRUE<br>d) <strong>Absence of yaw drive ✗ FALSE</strong> → This is NOT true for HAWT</div>
<div class="kp">Answer: d) Absence of active yaw drive ✗<br>HAWTs REQUIRE an active yaw drive system to rotate the nacelle and face into the wind. This is actually a DISADVANTAGE of HAWTs compared to VAWTs — VAWTs accept wind from any direction and don't need yaw systems. The yaw drive adds mechanical complexity and is a potential failure point.</div>` },

  // ─── CH7 MISSING ANSWERS ───
  'ch7_0': { marks:"1+5+5", refs:['ku-slides', 'ku-exam-2025', 'wecs-2024'], content:`<h4>Biomass Conversion Technologies + Pumped Hydro Energy Storage (PHES)</h4>
<h4>Principal Biomass Conversion Technologies (List)</h4>
<p>Thermochemical: Combustion, Gasification, Pyrolysis, Torrefaction. Biochemical: Anaerobic Digestion, Fermentation, Transesterification.</p>
<h4>PHES — What It Is and How It Works</h4>
<p>Pumped Hydro Energy Storage is the world's largest form of grid-scale energy storage, comprising ~95% of global electricity storage capacity.</p>
<div class="step"><strong>Working Principle:</strong><br>
When electricity supply exceeds demand (e.g., excess monsoon hydro or daytime solar): Water is PUMPED from lower reservoir to upper reservoir using reversible pump-turbine units. Electrical energy → potential energy stored.<br>
When demand exceeds supply (e.g., evening peak, dry season): Water FLOWS back DOWN through turbines generating electricity. Potential energy → electrical energy.</div>
<div class="math-eq">$$E = \\frac{\\rho g V H \\eta}{3{,}600{,}000} \\quad [\\text{MWh}]$$</div><div class="derivation"><span class="step-num">Example: V=10⁶ m³, H=200m, η=0.80</span>$$E = \\frac{1000 \\times 9.81 \\times 10^6 \\times 200 \\times 0.80}{3{,}600{,}000} = \\boxed{435 \\text{ MWh}}$$</div>
<h4>PHES Role in Nepal's Energy System</h4>
<ul><li>Nepal's electricity surplus in monsoon (June-Sept) + deficit in dry season (Dec-May) creates ideal PHES opportunity</li><li>Off-river PHES: Nepal has enormous potential — water pumped to high mountain reservoirs using monsoon surplus, released in dry season</li><li>The global pumped hydro atlas identifies Nepal as having ~2,800 candidate sites</li><li>Proposed projects: Kali Gandaki, Trishuli corridor</li><li>Would solve Nepal's seasonal blackout problem and enable electricity export year-round</li></ul>
<div class="kp">PHES is Nepal's best solution for seasonal energy balancing — far cheaper than batteries at grid scale and using Nepal's own topographic advantage.</div>` },

  'ch7_1': { marks:1, refs:['ku-slides', 'ku-exam-2022'], content:`<h4>Super Capacitor — Which is NOT a Major Technical Issue?</h4>
<div class="note-box">✅ <strong>Answer: d) Poor efficiency &lt;60% is NOT an issue.</strong><br>Super capacitors actually have <strong>&gt;95% round-trip efficiency</strong> — highest of any storage.<br>Real issues: ✗ Low energy density (5–10 Wh/kg) ✗ High self-discharge (10–20%/day) ✗ Low cell voltage (2.5V)</div>
<div class="kp">Answer: d) Poor energy efficiency (<60%) is NOT a technical issue. Super capacitors are actually the MOST efficient energy storage device (>95% round-trip efficiency). Their real problems are: low energy density (can't store much), high self-discharge (loses charge quickly), and low cell voltage (need many cells in series for useful voltage).</div>` },

  'ch7_2': { marks:4, refs:['ku-slides', 'irena-2021'], content:`<h4>Battery Technologies Comparison for RE Storage</h4>
<div class="step"><strong>Lead-Acid Batteries</strong><br>
Energy density: 30-50 Wh/kg | Cycle life: 200-800 cycles | Cost: Lowest ($100-200/kWh)<br>
Strengths: Mature technology, widely available in Nepal, recyclable, safe.<br>
Limitations: Heavy (weight problem for transportation to remote areas), low cycle life, requires maintenance (topping up electrolyte for flooded type), performance degrades in cold (<5°C).<br>
Applications: Off-grid solar in Nepal (still most common), backup power, telecom towers.</div>
<div class="step"><strong>Lithium-Ion Batteries</strong><br>
Energy density: 100-250 Wh/kg | Cycle life: 500-3000 cycles | Cost: Medium ($200-400/kWh, rapidly declining)<br>
Strengths: High energy density, long cycle life, high efficiency (95%), low self-discharge, no maintenance.<br>
Limitations: Thermal runaway risk, requires Battery Management System (BMS), sensitive to overcharge, not easily repairable.<br>
Applications: Grid-scale storage, EVs, new off-grid systems, mobile devices.</div>
<div class="step"><strong>Flow Batteries (Vanadium Redox / VRB)</strong><br>
Energy density: 15-25 Wh/kg | Cycle life: 10,000-20,000 cycles | Cost: High ($300-600/kWh)<br>
Strengths: Very long cycle life, independently scalable power and energy, no capacity fade over time, safe (no thermal runaway).<br>
Limitations: Low energy density, expensive, requires pumps/plumbing, maintenance-intensive.<br>
Applications: Grid-scale energy shifting, utility storage, microgrids. Not yet widely available in Nepal.</div>` },

  'ch7_3': { marks:2, refs:['ku-slides', 'ku-exam-2022'], content:`<h4>SLI Battery Energy Rating Range</h4>
<div class="note-box">✅ <strong>Answer: a) 2–100 Wh</strong> — SLI (Starting, Lighting, Ignition) batteries are small-capacity, designed for short high-current bursts, not deep cycle storage.</div>
<h4>Why SLI Batteries Are NOT Suitable for RE Storage</h4>
<p>SLI (Starting, Lighting, Ignition) batteries are designed for a completely different purpose than energy storage:</p>
<ul><li><strong>Designed for high-rate discharge:</strong> SLI batteries deliver very high current (200-500A) for 3-5 seconds to start an engine, then immediately recharge from the alternator. They are NOT designed for deep discharge.</li><li><strong>Shallow depth of discharge:</strong> SLI batteries should only be discharged 10-20% of capacity (keep them nearly full). Deep discharging rapidly destroys the lead-acid plates (sulfation).</li><li><strong>Short cycle life for deep cycling:</strong> If used for RE storage with daily 50-80% DoD cycles, an SLI battery will fail within 30-50 cycles. A deep-cycle lead-acid battery handles 200-500 such cycles.</li><li><strong>Small capacity:</strong> 2-100 Wh is far too small for meaningful energy storage applications.</li></ul>
<div class="kp">For RE storage: Always use DEEP CYCLE batteries (gel, AGM, or flooded deep-cycle lead-acid) or Li-ion — NOT automotive SLI batteries. Using car batteries for solar storage is a common but costly mistake in rural Nepal.</div>` },

  'ch7_4': { marks:3, refs:['ku-slides'], content:`<h4>PHES Energy Storage Calculation</h4>
<p><strong>Given:</strong> V=1 million m³=10⁶ m³, H=200m, η=85%=0.85</p>
<div class="derivation"><span class="step-num">PHES Energy Calculation</span>$$E = \\frac{\\rho g V H \\eta}{3{,}600{,}000} = \\frac{1000 \\times 9.81 \\times 10^6 \\times 200 \\times 0.85}{3{,}600{,}000} = \\boxed{463 \\text{ MWh}}$$</div>
<div class="kp">Answer: ~463 MWh stored. This is enough to power a 100 MW turbine for 4.6 hours, or supply 50,000 households for a full day. Scale: Nepal's Upper Tamakoshi (456 MW) could be backed by such a reservoir for short-term balancing.</div>` },

  // ─── CH8 MISSING ANSWERS ───
  'ch8_0': { marks:1, refs:['ku-slides', 'ku-exam-2024'], content:`<h4>Flow Duration Curve — Used for Microhydro Power Plant</h4>
<div class="note-box">✅ <strong>Answer: d) Microhydro power plant</strong> — FDC shows % of time a discharge is exceeded; essential for design flow selection, firm power calculation, and annual energy estimation.</div>
<p>The Flow Duration Curve (FDC) shows the percentage of time a given flow rate is equaled or exceeded in a river. This is essential for microhydro design because:</p>
<ul><li>Design flow is chosen from the FDC at Q_40-Q_60 (available 40-60% of time)</li><li>Annual energy production = area under the power-duration curve (derived from FDC)</li><li>Firm power = power at Q_90 (available 90% of time)</li></ul>
<div class="kp">Not used for solar dryer (uses solar radiation data), downdraft gasifier (uses fuel properties), or solar PV (uses solar irradiance data).</div>` },

  'ch8_1': { marks:1, refs:['ku-slides', 'ku-exam-2022'], content:`<h4>Minimum ΔT for OTEC to be Effective</h4>
<div class="note-box">✅ <strong>Answer: b) &gt;10°C</strong> — OTEC requires minimum ΔT &gt;10°C to be effective; commercially viable at ΔT ≥20°C. Carnot efficiency at ΔT=20°C: $\\eta_c = \\Delta T/T_h \\approx 6.6\\%$</div>
<p>Ocean Thermal Energy Conversion (OTEC) exploits the temperature difference between warm surface ocean water (~25-28°C in tropics) and cold deep water (~4°C at 1000m depth).</p>
<ul><li>Minimum ΔT to be thermodynamically viable: >10°C</li><li>Commercially viable ΔT: ≥20°C (Carnot efficiency = ΔT/T_hot)</li><li>At ΔT=20°C: Carnot efficiency = 20/303 = 6.6% (very low but free fuel)</li><li>Practical OTEC efficiency: 2-3% overall</li></ul>
<div class="kp">The very low efficiency (~2-3%) means OTEC needs enormous water flow rates and heat exchangers. Only economically viable in tropical oceans (Pacific islands, Caribbean) where ΔT ≥20°C. Not relevant for Nepal (landlocked country).</div>` },

  'ch8_2': { marks:3, refs:['ku-slides', 'ku-exam-2022'], content:`<h4>2 Technical Differences: Flash Steam vs Dry Steam vs Binary Cycle Geothermal Plants</h4>
<div class="step"><strong>Flash Steam vs Dry Steam:</strong><br>
① Resource requirement: Dry steam plants require a very rare resource — natural underground steam (vapor-dominated reservoir). Only a few sites worldwide (Geysers, USA; Larderello, Italy). Flash steam plants use the much more common liquid-dominated high-temperature reservoirs — geothermal brine is "flashed" to steam by reducing pressure. Flash steam is applicable to many more sites.<br>
② Working fluid: Dry steam uses the geothermal steam directly in the turbine — no flashing needed. Flash steam must first separate steam from the flashed brine in a separator vessel before sending steam to the turbine. Flash steam plants have a more complex surface infrastructure.</div>
<div class="step"><strong>Flash Steam vs Binary Cycle:</strong><br>
① Temperature requirement: Flash steam requires high-temperature fluids (>180°C) to flash to usable steam. Binary cycle uses moderate-temperature fluids (100-180°C) — the geothermal fluid heats a secondary working fluid (isobutane, pentane) with a lower boiling point, which drives the turbine. Binary cycle works at much lower temperatures.<br>
② Environmental impact: Flash steam releases some geothermal gases (CO₂, H₂S) to atmosphere. Binary cycle is a fully closed loop — geothermal fluid never contacts the atmosphere → zero direct emissions. Binary cycle is more environmentally friendly.</div>
<div class="kp">Nepal context: Nepal's geothermal sites (Tatopani, Mustang) are moderate-temperature hot springs → Binary cycle most appropriate technology. Estimated potential: up to 100 MW. Currently only used for tourism/bathing.</div>` },

  'ch8_3': { marks:1, refs:['ku-slides', 'ku-exam-2022'], content:`<h4>Geothermal Radioactive Decay — Which Isotope is NOT a Major Contributor?</h4>
<div class="note-box">✅ <strong>Answer: b) Plutonium</strong> — Major geothermal radioactive isotopes: K-40 (t½=1.25 Gy), Th-232 (t½=14.1 Gy), U-235, U-238. Plutonium is not naturally abundant and decays too quickly on geological timescales.</div>
<p>Geothermal heat from radioactive decay comes mainly from long-lived isotopes naturally abundant in Earth's crust and mantle:</p>
<ul><li><strong>Uranium-238 (U-238):</strong> Half-life 4.47 billion years → major contributor to geothermal heat</li><li><strong>Thorium-232 (Th-232):</strong> Half-life 14.1 billion years → major contributor</li><li><strong>Potassium-40 (K-40):</strong> Half-life 1.25 billion years → significant contributor</li><li><strong>Plutonium:</strong> Natural Pu-239 has half-life 24,100 years — it decays quickly on geological timescales and is NOT naturally abundant enough to be a significant geothermal heat source.</li></ul>
<div class="kp">Plutonium is primarily a man-made element (produced in nuclear reactors). The tiny natural amounts from spontaneous fission of U-238 are negligible as a heat source.</div>` },

  'ch8_4': { marks:1, refs:['ku-slides', 'ku-exam-2022'], content:`<h4>Tidal Power Density — H₂O at 5 m/s</h4>
<div class="math-eq">$$\\frac{P}{A} = \frac{1}{2}\rho_{water} v^3 = \frac{1}{2} \times 1025 \times 5^3 = \frac{1}{2} \times 1025 \times 125 = \boxed{62.5 \text{ kW/m}^2}$$</div>
<div class="kp">Answer: b) 62.5 kW/m² ✓<br>This is ~50× greater than wind at 5 m/s (which gives only ~77 W/m² in air). The reason: water is ~825× denser than air. This is why tidal turbines are much smaller than wind turbines for the same power output.</div>` },

  'ch8_5': { marks:4, refs:['ku-slides', 'wecs-2024'], content:`<h4>Run-of-River (RoR) Hydropower — Working Principle, Advantages and Limitations</h4>
<h4>Working Principle</h4>
<p>A run-of-river plant diverts a portion of a river's natural flow through a headworks (intake weir/dam), into a settling basin (removes sediment), along a headrace canal or tunnel, to a forebay tank (buffer storage), then down a penstock to the powerhouse turbines.</p>
<div class="math-eq">$$P = \\rho g Q H_{net} \\eta$$</div><p style="font-size:12px;color:var(--text2);margin:6px 0;">$Q$ = design flow (m³/s) | $H_{net}$ = net head (m) | $\\eta$ = overall efficiency 0.80–0.88</p>
<p>No large reservoir — the plant simply uses whatever flow the river provides at that moment.</p>
<h4>Advantages for Nepal</h4>
<ul><li>Minimal environmental impact — no large reservoir, no village submergence</li><li>Lower construction cost than storage hydro</li><li>Shorter construction time (2-5 years vs 10+ for large storage)</li><li>Nepal's steep terrain = high head available even with small flows</li><li>Nepal has 6,000+ rivers → abundant RoR potential</li></ul>
<h4>Limitations and Energy Security Implications</h4>
<ul><li><strong>Seasonal variability:</strong> Flow drops 60-80% in dry season (Oct-May) → power generation drops proportionally → seasonal blackouts</li><li><strong>No storage:</strong> Cannot shift generation to peak demand periods (evening)</li><li><strong>Climate vulnerability:</strong> Glacier retreat and erratic monsoons will alter flow patterns</li><li><strong>Over-dependence risk:</strong> Nepal's 90%+ RoR dependence means a single drought year can cripple the entire grid</li></ul>
<div class="kp">Conclusion: RoR is excellent as BASE LOAD in a diverse mix but should NOT be the sole source. Nepal needs reservoir hydro (Upper Tamakoshi model), PHES, and solar PV to complement RoR seasonally.</div>` },

};

// ═══════════════════════════════════════════════════════
//  INIT
// ═══════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════
//  CHART INITIALIZATION — Called when dashboard renders
// ═══════════════════════════════════════════════════════
function initDashboardCharts(){
  Chart.defaults.color = '#7a9ab0';
  Chart.defaults.font.family = "'JetBrains Mono', monospace";
  Chart.defaults.font.size = 11;

  // ── Chart 1: Nepal Total Energy Mix Pie ──
  const energyMixData = {
    labels: ['Firewood (63.87%)', 'Petroleum Products (13.52%)', 'Coal (9.09%)', 'LPG (3.01%)', 'Electricity Grid (4.57%)', 'Renewables (9.09%)', 'Other Traditional (2.5%)'],
    values: [63.87, 13.52, 9.09, 3.01, 4.57, 9.09, 2.5],
    colors: ['#fb923c','#f87171','#64748b','#fbbf24','#38bdf8','#22d3a0','#a78bfa']
  };
  const ctx1 = document.getElementById('chart-energy-mix');
  if(ctx1){
    new Chart(ctx1, {
      type: 'doughnut',
      data: {
        labels: energyMixData.labels,
        datasets: [{ data: energyMixData.values, backgroundColor: energyMixData.colors, borderWidth: 2, borderColor: '#0d1318', hoverOffset: 8 }]
      },
      options: {
        responsive: true, cutout: '62%',
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: ctx => ' ' + ctx.label + ': ' + ctx.parsed + '%' } }
        }
      }
    });
    const leg = document.getElementById('legend-energy-mix');
    if(leg) leg.innerHTML = energyMixData.labels.map((l,i) =>
      `<div style="display:flex;align-items:center;gap:5px;font-size:10px;color:var(--text2);">
        <div style="width:8px;height:8px;border-radius:2px;background:${energyMixData.colors[i]};flex-shrink:0;"></div>${l}
      </div>`).join('');
  }

  // ── Chart 2: Sectoral Consumption Donut ──
  const sectorData = {
    labels: ['Residential (60.75%)', 'Industrial (20.91%)', 'Transport (10.43%)', 'Commercial (5.04%)', 'Construction (1.92%)', 'Agriculture (0.95%)'],
    values: [60.75, 20.91, 10.43, 5.04, 1.92, 0.95],
    colors: ['#22d3a0','#38bdf8','#fbbf24','#a78bfa','#fb923c','#f87171']
  };
  const ctx2 = document.getElementById('chart-sector');
  if(ctx2){
    new Chart(ctx2, {
      type: 'doughnut',
      data: {
        labels: sectorData.labels,
        datasets: [{ data: sectorData.values, backgroundColor: sectorData.colors, borderWidth: 2, borderColor: '#0d1318', hoverOffset: 8 }]
      },
      options: {
        responsive: true, cutout: '62%',
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: ctx => ' ' + ctx.label } }
        }
      }
    });
    const leg2 = document.getElementById('legend-sector');
    if(leg2) leg2.innerHTML = sectorData.labels.map((l,i) =>
      `<div style="display:flex;align-items:center;gap:5px;font-size:10px;color:var(--text2);">
        <div style="width:8px;height:8px;border-radius:2px;background:${sectorData.colors[i]};flex-shrink:0;"></div>${l}
      </div>`).join('');
  }

  // ── Chart 3: Energy Share Trend Grouped Bar ──
  const ctx3 = document.getElementById('chart-trend');
  if(ctx3){
    new Chart(ctx3, {
      type: 'bar',
      data: {
        labels: ['2075/76', '2076/77', '2077/78', '2078/79', '2079/80'],
        datasets: [
          { label: 'Traditional Biomass', data: [68.30, 71.26, 66.26, 64.17, 63.87], backgroundColor: '#fb923c', borderRadius: 4 },
          { label: 'Renewable Energy', data: [5.04, 6.42, 5.89, 7.48, 9.09], backgroundColor: '#22d3a0', borderRadius: 4 },
          { label: 'Imported Energy', data: [27.50, 26.02, 28.71, 28.50, 27.04], backgroundColor: '#64748b', borderRadius: 4 },
        ]
      },
      options: {
        responsive: true,
        plugins: { legend: { position: 'top', labels: { boxWidth: 10, padding: 14 } }, tooltip: { mode: 'index' } },
        scales: {
          x: { grid: { color: '#1a2530' }, ticks: { font: { size: 10 } } },
          y: { grid: { color: '#1a2530' }, ticks: { callback: v => v + '%' }, min: 0, max: 100 }
        }
      }
    });
  }

  // ── Chart 4: Hydro Capacity Horizontal Bar ──
  const ctx4 = document.getElementById('chart-hydro');
  if(ctx4){
    new Chart(ctx4, {
      type: 'bar',
      data: {
        labels: ['NEA Plants', 'NEA Subsidiary', 'IPP (Operational)', 'Under Const. (FC)', 'Under Const. (no FC)', 'Planned & Proposed'],
        datasets: [{
          label: 'Capacity (MW)',
          data: [583, 478, 1477, 3074, 2693, 3572],
          backgroundColor: ['#22d3a0','#22d3a0','#22d3a0','#38bdf8','#38bdf8','#64748b'],
          borderRadius: 4,
        }]
      },
      options: {
        indexAxis: 'y', responsive: true,
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => ' ' + ctx.parsed.x + ' MW' } } },
        scales: {
          x: { grid: { color: '#1a2530' }, ticks: { callback: v => v + ' MW' } },
          y: { grid: { display: false }, ticks: { font: { size: 10 } } }
        }
      }
    });
  }

  // ── Chart 5: Cooking Fuel Pie ──
  const cookData = {
    labels: ['Firewood (51.2%)', 'LPG (44.3%)', 'Cow Dung (2.9%)', 'Biogas (1.2%)', 'Electricity (0.5%)', 'Kerosene (0.05%)', 'Other (0.1%)'],
    values: [51.2, 44.3, 2.9, 1.2, 0.5, 0.05, 0.1],
    colors: ['#fb923c','#fbbf24','#a78bfa','#22d3a0','#38bdf8','#64748b','#475569']
  };
  const ctx5 = document.getElementById('chart-cooking');
  if(ctx5){
    new Chart(ctx5, {
      type: 'pie',
      data: {
        labels: cookData.labels,
        datasets: [{ data: cookData.values, backgroundColor: cookData.colors, borderWidth: 2, borderColor: '#0d1318', hoverOffset: 8 }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'right', labels: { boxWidth: 10, font: { size: 10 }, padding: 8 } },
          tooltip: { callbacks: { label: ctx => ' ' + ctx.label } }
        }
      }
    });
  }

  // ── Chart 6: Targets vs Actuals ──
  const ctx6 = document.getElementById('chart-targets');
  if(ctx6){
    new Chart(ctx6, {
      type: 'bar',
      data: {
        labels: ['Electrification (%)', 'Renewables Share (%)', 'Hydro Cap (×100 MW)', 'Per Capita (kWh/yr)'],
        datasets: [
          { label: 'Current (FY 2079/80)', data: [98, 9.09, 26.84, 369], backgroundColor: '#22d3a0', borderRadius: 4 },
          { label: '16th Plan Target 2030', data: [100, 15, 150, 1500], backgroundColor: '#38bdf8', borderRadius: 4, borderDash: [5,5] },
        ]
      },
      options: {
        responsive: true,
        plugins: { legend: { position: 'top', labels: { boxWidth: 10 } }, tooltip: { mode: 'index' } },
        scales: {
          x: { grid: { color: '#1a2530' } },
          y: { grid: { color: '#1a2530' }, beginAtZero: true }
        }
      }
    });
  }
}

// Hook into renderView to trigger chart init
const _origRenderView = renderView;
window.renderView = function(view){
  _origRenderView(view);
  if(view === 'dashboard'){
    setTimeout(initDashboardCharts, 100);
  }
};

setTimeout(updateSidebarStats, 200);
navigate('overview', document.querySelector('.sidebar-item.active'));

function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const btn = document.getElementById('sidebar-toggle');
  const isCollapsed = sidebar.classList.toggle('collapsed');
  btn.textContent = isCollapsed ? '›' : '‹';
  btn.title = isCollapsed ? 'Expand sidebar' : 'Collapse sidebar';
  try { localStorage.setItem('sidebar_collapsed', isCollapsed ? '1' : '0'); } catch(e){}
}

// Restore sidebar state on load
(function(){
  try {
    const collapsed = localStorage.getItem('sidebar_collapsed');
    if (collapsed === '1') {
      const sidebar = document.getElementById('sidebar');
      const btn = document.getElementById('sidebar-toggle');
      if (sidebar) sidebar.classList.add('collapsed');
      if (btn) { btn.textContent = '›'; btn.title = 'Expand sidebar'; }
    }
  } catch(e) {}
})();

