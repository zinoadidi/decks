/* Theme handling for the index and collection pages. The deck has its own copy inside deck.js. */
(function(){
  const THEMES = [
    { id:'dark',  name:'Dark',  icon:'◐' },
    { id:'light', name:'Light', icon:'☀' },
    { id:'ember', name:'Ember', icon:'◑' }
  ];
  const at = id => Math.max(0, THEMES.findIndex(t => t.id === id));

  function apply(id){
    const t = THEMES[at(id)];
    document.documentElement.setAttribute('data-theme', t.id);
    const b = document.getElementById('theme-btn');
    if(b){ b.textContent = t.icon; b.title = t.name; }
    try{ localStorage.setItem('deck-theme', t.id); }catch(_){}
  }

  let saved = 'dark';
  try{ saved = localStorage.getItem('deck-theme') || 'dark'; }catch(_){}
  document.documentElement.setAttribute('data-theme', saved);

  document.addEventListener('DOMContentLoaded', ()=>{
    const b = document.createElement('button');
    b.id = 'theme-btn';
    b.onclick = () => apply(THEMES[(at(document.documentElement.getAttribute('data-theme')) + 1) % THEMES.length].id);
    document.body.appendChild(b);
    apply(saved);
  });

  document.addEventListener('keydown', e=>{
    if((e.key === 'd' || e.key === 'D') && !e.metaKey && !e.ctrlKey && !e.altKey){
      apply(THEMES[(at(document.documentElement.getAttribute('data-theme')) + 1) % THEMES.length].id);
    }
  });
})();
