/* Loads a collection definition and one deck's content, then starts the engine.
   Everything is driven by the URL: deck.html?collection=<id>&deck=<n>
   Adding a deck means adding a data file and a line in that collection's collection.js.

   If a collection has no local collections/<id>/ folder (not committed to this
   repo, e.g. private client work), the engine falls back to the shared decks
   backend automatically: doc ids "<id>.collection" and "<id>.deck-<n>" in one
   shared app namespace. This is one app for the whole site, not one per
   collection, matching how every other app on this backend works. The URL
   never needs to change between local and backend-hosted collections. */
(function(){
  const qs         = new URLSearchParams(location.search);
  const collection = qs.get('collection');
  const n          = Math.max(1, +qs.get('deck') || 1);
  const BACKEND    = 'https://generic-crud.agreeabledesert-b2caaf68.norwayeast.azurecontainerapps.io/generic-crud';
  const APP_ID     = '7d125c22-d3bf-480f-bc09-af3c16aff513';

  const load = src => new Promise((res, rej) => {
    const el = document.createElement('script');
    el.src = src;
    el.onload = res;
    el.onerror = () => rej(new Error('Could not load ' + src));
    document.head.appendChild(el);
  });

  const fail = msg => {
    document.getElementById('stage').innerHTML =
      '<section class="slide live" style="display:flex"><p class="kicker">Nothing to show</p>' +
      '<h2>' + msg + '</h2>' +
      '<p class="lead"><a href="index.html">Back to all collections</a></p></section>';
  };

  if(!collection) return fail('No collection was given in the address.');

  const getDoc = id => fetch(BACKEND + '/api/store/' + APP_ID + '/' + id)
    .then(r => { if(!r.ok) throw new Error('"' + collection + '" was not found, locally or on the backend.'); return r.json(); })
    .then(r => r.doc);

  const fromBackend = () => getDoc(collection + '.collection')
    .then(C => {
      if(!C || !C.decks || !C.decks[n-1]) throw new Error('Deck ' + n + ' is not listed in ' + collection);
      window.COLLECTION = C;
      return getDoc(collection + '.deck-' + n);
    })
    .then(D => { window.DECK = D; window.startDeck(); })
    .catch(e => fail(e.message));

  const base = 'collections/' + collection + '/';

  load(base + 'collection.js')
    .then(() => {
      const C = window.COLLECTION;
      if(!C || !C.decks || !C.decks[n-1]) throw new Error('Deck ' + n + ' is not listed in ' + collection);
      return load(base + 'content/' + C.decks[n-1].data);
    })
    .then(() => {
      if(!window.DECK) throw new Error('That deck file did not define any slides.');
      window.startDeck();
    })
    .catch(fromBackend);
})();
