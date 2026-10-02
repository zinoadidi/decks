/* Deck engine. No dependencies. Started by boot.js once the content is loaded. */
window.startDeck = function(){
  /* build the slides from this deck's content file, then run the engine */
  if(window.DECK && window.RENDER) window.RENDER.render(window.DECK, 'stage');

  const IMG = {
    u: 'https://docs.unity3d.com/2022.3/Documentation/uploads/Main/',
    g: 'https://docs.godotengine.org/en/stable/_images/',
    e: 'https://dev.epicgames.com/community/api/documentation/image/'
  };

  /* expand data-img="u:file.png" into a vendor source; anything else (a relative
     or absolute path) is used as-is, so a collection's own project art works too */
  document.querySelectorAll('img[data-img]').forEach(img=>{
    const raw = img.dataset.img;
    const m = /^([a-z]):(.+)$/.exec(raw);
    const k = m && IMG[m[1]] ? m[1] : null;
    const v = k ? m[2] : raw;
    img.src = !k ? v : k === 'e' ? IMG.e + v + '?resizing_type=fit&width=1400' : IMG[k] + v;
    const fail = ()=> img.closest('figure')?.classList.add('failed');
    img.addEventListener('error', fail);
    img.addEventListener('load', ()=>{ if(!img.naturalWidth) fail(); });
    setTimeout(()=>{ if(img.complete && !img.naturalWidth) fail(); }, 8000);
  });

  const slides = [...document.querySelectorAll('.slide')];
  const stage  = document.getElementById('stage');
  const bar    = document.getElementById('bar');
  const counter= document.getElementById('counter');
  const crumb  = document.getElementById('crumb');
  const notes  = document.getElementById('notes');
  const overview = document.getElementById('overview');
  const clockEl  = document.getElementById('clock');

  let i = 0, notesOn = false;

  /* ---------- reveals (flashcards) ---------- */
  function reveals(s){ return [...s.querySelectorAll('.reveal[hidden], .seq[hidden]')]; }
  function nextReveal(s){
    const r = reveals(s)[0];
    if(!r) return false;
    r.hidden = false;
    r.classList.add('shown');
    if(r.dataset.mark){
      s.querySelectorAll('.opt').forEach(o=>{
        o.classList.add(o.dataset.k === r.dataset.mark ? 'right' : 'wrong');
      });
    }
    if(!reveals(s).length) s.querySelector('.prompt')?.classList.add('done');
    paintPips(s);
    r.scrollIntoView({block:'nearest', behavior:'smooth'});
    return true;
  }

  function paintPips(s){
    const pips = s.querySelector('.pips');
    if(!pips) return;
    const all = [...s.querySelectorAll('.reveal, .seq')];
    const done = all.filter(e=>!e.hasAttribute('hidden')).length;
    pips.innerHTML = all.map((_,k)=>'<i class="pip'+(k<done?' on':'')+'"></i>').join('');
  }

  /* ---------- navigation ---------- */
  function show(n, back){
    n = Math.max(0, Math.min(slides.length-1, n));
    slides.forEach(s=>s.classList.remove('live','enter','enter-back'));
    const s = slides[n];
    s.classList.add('live', back ? 'enter-back' : 'enter');
    s.scrollTop = 0;
    i = n;

    bar.style.width = ((n)/(slides.length-1)*100) + '%';
    counter.textContent = (n+1) + ' / ' + slides.length;
    crumb.textContent = ((window.DECK&&window.DECK.meta.label)?window.DECK.meta.label+' · ':'') + (s.dataset.sec || '');
    history.replaceState(null,'', '#/' + (n+1));

    const nt = s.querySelector('.pnote');
    notes.innerHTML = '<span class="tag">Presenter notes</span>' +
      (nt ? nt.innerHTML : '<p style="color:var(--ink-faint)">No notes for this slide.</p>');

    paintClock();
    paintPips(s);
    document.querySelectorAll('.ov').forEach((o,k)=>o.classList.toggle('cur', k===n));
  }
  const next = () => { if(nextReveal(slides[i])) return; show(i+1); };
  const prev = () => show(i-1, true);

  /* ---------- schedule clock ---------- */
  let t0 = null;
  function fmt(ms){
    const m = Math.floor(ms/60000), sec = Math.floor(ms/1000)%60;
    return m + ':' + String(sec).padStart(2,'0');
  }
  function paintClock(){
    const target = slides[i].dataset.clock;
    let html = target ? 'target <b>' + target + '</b>' : '<b>—</b>';
    if(t0 !== null){
      const el = Date.now() - t0;
      const cls = slides[i].dataset.budget && el > (+slides[i].dataset.budget*60000) ? 'over' : 'run';
      html += ' &nbsp;·&nbsp; <span class="'+cls+'">' + fmt(el) + '</span>';
    }
    clockEl.innerHTML = html;
  }
  setInterval(()=>{ if(t0 !== null) paintClock(); }, 1000);

  /* ---------- cross-deck navigation ---------- */
  const C  = window.COLLECTION || {decks:[]};
  const CL = C.decks || [];
  const qs = new URLSearchParams(location.search);
  const idx = Math.max(0, (+qs.get('deck') || 1) - 1);
  const deckUrl = n => 'deck.html?collection=' + encodeURIComponent(C.id) + '&deck=' + (n+1);
  const collectionUrl = 'collection.html?collection=' + encodeURIComponent(C.id);
  const goDeck = n => { if(CL[n]) location.href = deckUrl(n); };

  const ovPanel = document.getElementById('overview');
  if(CL.length){
    const sw = document.createElement('div');
    sw.className = 'ov-switch';
    sw.innerHTML =
      '<a class="ov-home" href="index.html">All collections</a>' +
      '<a class="ov-home" href="' + collectionUrl + '">' + (C.name||'This collection') + '</a>' +
      CL.map((c,n)=>'<a class="ov-cls'+(n===idx?' cur':'')+'" href="'+deckUrl(n)+'">'+
        c.label+'<b>'+c.title+'</b></a>').join('');
    ovPanel.insertBefore(sw, ovPanel.firstChild);
  }

  /* ---------- overview ---------- */
  const grid = document.querySelector('.ov-grid');
  slides.forEach((s,n)=>{
    const d = document.createElement('div');
    d.className = 'ov';
    const t = s.dataset.title || s.querySelector('h1,h2,.q,.brk-time')?.textContent || 'Slide';
    d.innerHTML = '<div class="i">'+String(n+1).padStart(2,'0') +
      (s.dataset.clock ? ' · '+s.dataset.clock : '') + '</div><div class="t">'+t+'</div>';
    d.onclick = ()=>{ overview.classList.remove('on'); show(n); };
    grid.appendChild(d);
  });

  /* ---------- lightbox ---------- */
  const lb = document.getElementById('lightbox');
  document.addEventListener('click', e=>{
    const img = e.target.closest('figure.zoomable img');
    if(img){ lb.querySelector('img').src = img.src; lb.classList.add('on'); }
    else if(e.target.closest('#lightbox')) lb.classList.remove('on');
  });

  /* ---------- keys ---------- */
  document.addEventListener('keydown', e=>{
    if(e.metaKey || e.ctrlKey || e.altKey) return;
    const k = e.key;
    const isSpace = (k === ' ' || e.code === 'Space');
    if(lb.classList.contains('on') && (k==='Escape'||isSpace)){ lb.classList.remove('on'); e.preventDefault(); return; }
    if(k==='ArrowRight'||isSpace||k==='PageDown'){ e.preventDefault(); next(); }
    else if(k==='ArrowLeft'||k==='PageUp'){ e.preventDefault(); prev(); }
    else if(k==='r'||k==='R'){ e.preventDefault(); nextReveal(slides[i]); }
    else if(k==='Home'){ show(0); }
    else if(k==='End'){ show(slides.length-1); }
    else if(k==='o'||k==='O'){ overview.classList.toggle('on'); }
    else if(k==='h'||k==='H'){ location.href = collectionUrl; }
    else if(k==='['){ goDeck(idx-1); }
    else if(k===']'){ goDeck(idx+1); }
    else if(k==='n'||k==='N'){ notesOn=!notesOn; notes.classList.toggle('on', notesOn); }
    else if(k==='t'||k==='T'){ t0 = (t0===null) ? Date.now() : null; paintClock(); }
    else if(k==='d'||k==='D'){ nextTheme(); }
    else if(k==='g'||k==='G'){ nextFont(); }
    else if(k==='f'||k==='F'){ document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen(); }
    else if(k==='?'){ document.getElementById('help').classList.toggle('on'); }
    else if(k==='Escape'){ overview.classList.remove('on'); document.getElementById('help').classList.remove('on'); }
  });

  /* ---------- touch ---------- */
  let sx=0, sy=0;
  stage.addEventListener('touchstart', e=>{ sx=e.touches[0].clientX; sy=e.touches[0].clientY; }, {passive:true});
  stage.addEventListener('touchend', e=>{
    const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
    if(Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy)) dx < 0 ? next() : prev();
  }, {passive:true});

  /* ---------- theme ---------- */
  const THEMES = [
    { id:'dark',  name:'Dark',  icon:'◐' },
    { id:'light', name:'Light', icon:'☀' },
    { id:'ember', name:'Ember', icon:'◑' }
  ];
  const themeIndex = id => Math.max(0, THEMES.findIndex(t => t.id === id));

  function applyTheme(id, announce){
    const t = THEMES[themeIndex(id)];
    document.documentElement.setAttribute('data-theme', t.id);
    const btn = document.getElementById('b-theme');
    if(btn){ btn.textContent = t.icon; btn.title = t.name + ' (D)'; }
    try{ localStorage.setItem('deck-theme', t.id); }catch(_){}
    if(announce) toast(t.name);
  }

  function nextTheme(){
    const cur = document.documentElement.getAttribute('data-theme') || 'dark';
    applyTheme(THEMES[(themeIndex(cur) + 1) % THEMES.length].id, true);
  }

  let toastEl, toastTimer;
  function toast(msg){
    if(!toastEl){
      toastEl = document.createElement('div');
      toastEl.id = 'toast';
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = msg;
    toastEl.classList.add('on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(()=> toastEl.classList.remove('on'), 1100);
  }

  let savedTheme = 'dark';
  try{ savedTheme = localStorage.getItem('deck-theme') || 'dark'; }catch(_){}
  applyTheme(savedTheme, false);

  /* ---------- font ---------- */
  const FONTS = [
    { id:'sans',    name:'Sans',    icon:'A' },
    { id:'serif',   name:'Serif',   icon:'S' },
    { id:'display', name:'Display', icon:'D' }
  ];
  const fontIndex = id => Math.max(0, FONTS.findIndex(f => f.id === id));

  function applyFont(id, announce){
    const f = FONTS[fontIndex(id)];
    document.documentElement.setAttribute('data-font', f.id);
    const btn = document.getElementById('b-font');
    if(btn){ btn.textContent = f.icon; btn.title = f.name + ' (G)'; }
    try{ localStorage.setItem('deck-font', f.id); }catch(_){}
    if(announce) toast(f.name);
  }

  function nextFont(){
    const cur = document.documentElement.getAttribute('data-font') || 'sans';
    applyFont(FONTS[(fontIndex(cur) + 1) % FONTS.length].id, true);
  }

  /* a deck can set a default font (meta.font) for first-time visitors; an explicit
     choice already saved in localStorage always wins */
  let savedFont = null;
  try{ savedFont = localStorage.getItem('deck-font'); }catch(_){}
  applyFont(savedFont || (window.DECK && window.DECK.meta && window.DECK.meta.font) || 'sans', false);

  /* ---------- hud buttons ---------- */
  const bh = document.getElementById('b-home');
  if(bh) bh.onclick = ()=> location.href = collectionUrl;
  document.getElementById('b-prev').onclick = prev;
  document.getElementById('b-next').onclick = next;
  document.getElementById('b-ov').onclick   = ()=> overview.classList.toggle('on');
  document.getElementById('b-notes').onclick= ()=>{ notesOn=!notesOn; notes.classList.toggle('on', notesOn); };
  document.getElementById('b-theme').onclick= nextTheme;
  const bf = document.getElementById('b-font');
  if(bf) bf.onclick = nextFont;
  document.getElementById('b-help').onclick = ()=> document.getElementById('help').classList.toggle('on');

  /* ---------- boot ---------- */
  const fromHash = () => {
    const m = location.hash.match(/#\/(\d+)/);
    return m ? (+m[1]-1) : 0;
  };
  window.addEventListener('hashchange', ()=>{
    const n = fromHash();
    if(n !== i) show(n, n < i);
  });
  show(fromHash());
};
