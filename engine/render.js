/* AD-051 deck renderer: turns a content JSON into slide markup.
   The template never changes. Each class supplies its own JSON. */
window.AD051 = (function(){

  const esc = t => String(t==null?'':t);
  const attr = t => esc(t).replace(/"/g,'&quot;');
  /* {highlight} in a heading becomes gradient text */
  const grad = t => esc(t).replace(/\{([^}]+)\}/g,'<span class="grad">$1</span>');

  const shapeSets = {
    a:`<div class="sh blob" style="width:460px;height:460px;background:var(--a2);left:-90px;top:-90px"></div>
       <div class="sh blob" style="width:380px;height:380px;background:var(--a1);right:-70px;bottom:-90px"></div>
       <div class="sh ring float" style="width:280px;height:280px;right:14%;top:14%;color:var(--a1)"></div>
       <div class="sh sq float2" style="width:150px;height:150px;left:9%;bottom:16%;color:var(--a3);transform:rotate(18deg)"></div>`,
    b:`<div class="sh blob" style="width:480px;height:480px;background:var(--a2);right:-120px;top:-100px"></div>
       <div class="sh ring float" style="width:320px;height:320px;left:6%;bottom:-8%;color:var(--a1)"></div>`,
    c:`<div class="sh blob" style="width:500px;height:500px;background:var(--a3);left:-130px;bottom:-140px"></div>
       <div class="sh ring float" style="width:300px;height:300px;right:10%;top:12%;color:var(--a5)"></div>
       <div class="sh dots" style="width:240px;height:180px;right:30%;bottom:14%;color:var(--a1)"></div>`,
    break:`<div class="sh blob" style="width:520px;height:520px;background:var(--a4);left:-140px;top:-120px"></div>
       <div class="sh blob" style="width:420px;height:420px;background:var(--a1);right:-110px;bottom:-110px"></div>
       <div class="sh ring float" style="width:300px;height:300px;right:16%;top:12%;color:var(--a2)"></div>`,
    fc:`<div class="sh blob" style="width:400px;height:400px;background:var(--a5);right:-100px;top:-90px"></div>
       <div class="sh ring float" style="width:240px;height:240px;left:8%;bottom:8%;color:var(--a3)"></div>`
  };
  let START = 0;                       /* minutes past midnight, from meta.start */
  const hhmm = mins => {
    const t = ((START + mins) % 1440 + 1440) % 1440;
    return String(Math.floor(t/60)).padStart(2,'0') + ':' + String(t%60).padStart(2,'0');
  };

  const shapes = k => k ? `<div class="shapes">${shapeSets[k]||''}</div>` : '';

  /* ---------- block renderers ---------- */
  const B = {
    p: b => `<p class="${b.big?'bigp':''}${b.full?' full':b.wide?' wide':''}${b.justify?' justify':''}${b.seq?' seq':''}"${b.seq?' hidden':''}>${b.html}</p>`,

    lead: b => `<p class="lead${b.full?' full':b.wide?' wide':''}${b.justify?' justify':''}${b.seq?' seq':''}"${b.seq?' hidden':''}>${b.html}</p>`,

    cards: b => `<div class="${b.cols===3?'cols-3':'cols'}${b.lead?' lead-one':''}">` +
      b.items.map(i=>`<div class="card ${i.hero?'hero ':''}c${i.c||1}${b.seq?' seq':''}"${b.seq?' hidden':''}>` +
        (i.ic?`<div class="ic">${i.ic}</div>`:'') +
        (i.h?`<h3>${i.h}</h3>`:'') +
        (i.p?`<p>${i.p}</p>`:'') +
        (i.code?`<pre><code>${i.code}</code></pre>`:'') +
        (i.list?`<ul>${i.list.map(x=>`<li>${x}</li>`).join('')}</ul>`:'') +
      `</div>`).join('') + `</div>`,

    hero: b => `<div class="card hero c${b.c||1}${b.seq?' seq':''}"${b.seq?' hidden':''}>` +
      (b.ic?`<div class="ic">${b.ic}</div>`:'') +
      `<h3>${b.h}</h3>` + (b.p?`<p>${b.p}</p>`:'') +
      (b.code?`<pre><code>${b.code}</code></pre>`:'') + `</div>`,

    flow: b => `<div class="flow${b.tight?' tight':''}${b.vertical?' vertical':''}">` +
      b.items.map(i=>`<div class="step${b.seq?' seq':''}"${b.seq?' hidden':''}>` +
        `<div class="s">${i.s||''}</div><div class="b">${i.b}</div>` +
        (i.d?`<div class="d">${i.d}</div>`:'') + `</div>`).join('') + `</div>`,

    table: b => `<table>` +
      (b.head?`<thead><tr>${b.head.map(h=>`<th>${h}</th>`).join('')}</tr></thead>`:'') +
      `<tbody>${b.rows.map(r=>`<tr>${r.map(c=>`<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table>`,

    stats: b => `<div class="stats">` +
      b.items.map(i=>`<div class="stat${b.seq?' seq':''}"${b.seq?' hidden':''}><div class="n">${i.n}</div><div class="l">${i.l}</div></div>`).join('') +
      `</div>`,

    bignum: b => `<div class="bignum ${b.tone||''}${b.seq?' seq':''}"${b.seq?' hidden':''}>${b.v}</div>` +
      (b.sub?`<p class="bigsub${b.seq?' seq':''}"${b.seq?' hidden':''}>${b.sub}</p>`:''),

    note: b => `<div class="note ${b.tone||''}${b.seq?' seq':''}"${b.seq?' hidden':''}>` +
      `<span class="tag">${b.tag}</span><p>${b.p}</p></div>`,

    code: b => `<pre class="${b.seq?'seq':''}"${b.seq?' hidden':''}><code>${b.html}</code></pre>`,

    chips: b => `<div class="chips${b.seq?' seq':''}"${b.seq?' hidden':''}>` +
      b.items.map(([k,t])=>`<span class="chip ${k}">${t}</span>`).join('') + `</div>`,

    shots: b => `<div class="shotgrid">` + b.items.map(i=>
      `<figure class="zoomable"><img data-img="${attr(i.img)}" alt="${attr(i.alt||'')}">` +
      `<div class="shot-fallback">${i.fallback||''}</div>` +
      `<figcaption>${i.cap||''}</figcaption></figure>`).join('') + `</div>`,

    /* an image beside a column of other blocks, side by side instead of stacked;
       use this instead of a shots figure followed by a p when a slide is one image
       plus a few lines of text, so the two share the width instead of the text
       sitting under the image using a fraction of the slide */
    media: b => `<div class="split${b.reverse?' reverse':''}">` +
      `<figure><img data-img="${attr(b.img)}" alt="${attr(b.alt||'')}">` +
      (b.cap?`<figcaption>${b.cap}</figcaption>`:'') + `</figure>` +
      `<div>${blocks(b.blocks)}</div></div>`,

    opts: b => `<div class="opts">` + b.items.map(i=>
      `<div class="opt" data-k="${attr(i.k)}"><span class="k">${i.k.toUpperCase()}</span><span>${i.t}</span></div>`
      ).join('') + `</div>`,

    prompt: b => `<span class="prompt"><kbd>R</kbd> ${b.t||'reveal'}</span>`,

    reveal: b => `<div class="reveal ${b.kind||'ans'}" hidden${b.mark?` data-mark="${attr(b.mark)}"`:''}>` +
      `<span class="rl">${b.label}</span>${b.html}</div>`
  };

  const blocks = list => (list||[]).map(b=>{
    const fn = B[b.b];
    return fn ? fn(b) : '';
  }).join('\n');

  /* ---------- slide renderers ---------- */
  function slideAttrs(s){
    return `data-sec="${attr(s.sec||'')}" data-title="${attr(s.title||s.h2||'Slide')}"` +
           (s.m!=null?` data-clock="${hhmm(s.m)}"`:(s.clock?` data-clock="${attr(s.clock)}"`:'')) +
           (s.budget?` data-budget="${attr(s.budget)}"`:'');
  }
  const track = s => s.track ? `<span class="track t${s.track.replace('+','')}">${s.track}</span>` : '';
  const notes = s => s.notes ? `<div class="pnote">${s.notes.map(n=>`<p>${n}</p>`).join('')}</div>` : '';
  const pips  = s => JSON.stringify(s).includes('"seq":true') ? '<div class="pips"></div>' : '';

  const T = {
    title: s => `<section class="slide title${s.img?' with-img':''}" ${slideAttrs(s)}>${shapes('a')}
      <div class="title-row">
        <div class="title-wrap">
          ${s.kicker?`<p class="kicker">${s.kicker}</p>`:''}
          <h1>${grad(s.h1)}</h1><div class="rule"></div>
          ${s.lead?`<p class="lead">${s.lead}</p>`:''}
        </div>
        ${s.img?`<img class="title-img" src="${attr(s.img)}" alt="${attr(s.imgAlt||'')}">`:''}
      </div>${notes(s)}</section>`,

    section: s => `<section class="slide section" ${slideAttrs(s)}>${shapes(s.shapes||'b')}
      <div><div class="num">${s.num}</div><h2>${grad(s.h2)}</h2>
      ${s.lead?`<p class="lead">${s.lead}</p>`:''}</div>${notes(s)}</section>`,

    content: s => `<section class="slide" ${slideAttrs(s)}>${shapes(s.shapes)}
      ${(s.kicker||s.track)?`<p class="kicker">${s.kicker||''}${track(s)}</p>`:''}
      ${s.h2?`<h2>${grad(s.h2)}</h2>`:''}
      ${blocks(s.blocks)}
      ${pips(s)}${notes(s)}</section>`,

    break: s => `<section class="slide brk" ${slideAttrs(s)}>${shapes('break')}
      <div class="brk-box">
        <p class="kicker" style="color:var(--a4)">Break</p>
        <div class="brk-time">${s.duration}</div>
        <p class="brk-sub"><strong>${s.range}</strong></p>
        ${s.text?`<p style="margin-top:22px;color:var(--ink-dim)">${s.text}</p>`:''}
      </div>${notes(s)}</section>`,

    fcintro: s => `<section class="slide" ${slideAttrs(s)}>${shapes('fc')}
      <p class="kicker">${s.kicker||'Five minutes'}</p><h2>${grad(s.h2||'Flashcards')}</h2>
      <p class="lead">${s.lead}</p>
      <span class="prompt"><kbd>R</kbd> or <kbd>Space</kbd> reveals</span>${notes(s)}</section>`,

    flashcard: s => `<section class="slide" ${slideAttrs(s)}>
      <div class="fc-head"><span class="fc-badge${s.situation?' sit':''}">${s.badge}</span>
        ${s.min?`<span class="fc-min">${s.min}</span>`:''}</div>
      <p class="q${s.wide!==false?' wide':''}">${s.q}</p>
      ${blocks(s.blocks)}
      <span class="prompt"><kbd>R</kbd> ${s.situation?'step through':'reveal'}</span>
      ${(s.reveals||[]).map(B.reveal).join('')}
      <div class="pips"></div>${notes(s)}</section>`
  };

  function render(data, mountId){
    const [h,mi] = (data.meta.start||'00:00').split(':');
    START = (+h)*60 + (+mi);
    document.title = `${data.meta.label}: ${data.meta.title}`;
    const html = data.slides.map(s => (T[s.type]||T.content)(s)).join('\n')
      .replace(/\{\{(-?\d+)\}\}/g, (_,n) => hhmm(+n));
    document.getElementById(mountId).innerHTML = html;
  }

  return { render };
})();
