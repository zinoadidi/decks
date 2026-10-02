/* Loads a course definition and one class's content, then starts the engine.
   Everything is driven by the URL: deck.html?course=<id>&class=<n>
   Adding a class means adding a data file and a line in that course's course.js. */
(function(){
  const qs     = new URLSearchParams(location.search);
  const course = qs.get('course');
  const n      = Math.max(1, +qs.get('class') || 1);

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
      '<p class="lead"><a href="index.html">Back to all courses</a></p></section>';
  };

  if(!course) return fail('No course was given in the address.');

  const base = 'courses/' + course + '/';

  load(base + 'course.js')
    .then(() => {
      const C = window.COURSE;
      if(!C || !C.classes || !C.classes[n-1]) throw new Error('Class ' + n + ' is not listed in ' + course);
      return load(base + 'content/' + C.classes[n-1].data);
    })
    .then(() => {
      if(!window.DECK) throw new Error('That class file did not define any slides.');
      window.startDeck();
    })
    .catch(e => fail(e.message));
})();
