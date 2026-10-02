# Teaching decks

A small slide engine driven entirely by data. Adding a course or a class means writing a
content file, not writing HTML.

## Run it

```bash
python3 -m http.server 8778 --directory /Users/zinoadidi/Documents/GitLab/zinospot/decks
```

Then open `http://localhost:8778`.

## Structure

```
decks/
  index.html              all courses          (generic, never edited)
  course.html             classes in a course  (generic, never edited)
  deck.html               the deck itself      (generic, never edited)
  courses.js              one line per course

  engine/
    render.js             turns slide data into markup
    deck.js               navigation, build-in, reveals, timer
    boot.js               loads the right course and class from the URL
    deck.css              deck styling
    pages.css             index and course page styling

  courses/
    demo101/
      course.js
      content/class-1.js  a worked example of every block type
```

Three generic HTML pages serve every course. Nothing under `courses/` is HTML.

## Addresses

| Page | URL |
|---|---|
| All courses | `index.html` |
| One course | `course.html?course=demo101` |
| One class | `deck.html?course=demo101&class=1` |
| One slide | `deck.html?course=demo101&class=1#/5` |

## Adding a course

1. `mkdir -p courses/<id>/content`
2. Write `courses/<id>/course.js`:

```js
window.COURSE = {
  id:"<id>", name:"...", subtitle:"...", year:"...", instructor:"...",
  classes:[
    { file:"class-1.html", data:"class-1.js", label:"Class 1", title:"...", blurb:"..." }
  ]
};
```

3. Write `courses/<id>/content/class-1.js`, which sets `window.DECK = { meta, slides }`.
4. Add one line to `courses.js`.

Adding a class to an existing course is steps 3 and the `classes` array only.

## Writing a class

```js
window.DECK = {
  meta:{ course:"...", label:"Class 1", title:"...", start:"17:45" },
  slides:[ ... ]
};
```

**Slide types:** `title`, `section`, `content`, `break`, `fcintro`, `flashcard`.

**Slide keys:** `sec` (breadcrumb), `title` (overview grid), `m` (minutes from `meta.start`),
`kicker`, `h2`, `track` (`"2D"` or `"3D"`), `blocks`, `notes`.

**Blocks:** `hero`, `cards`, `flow`, `table`, `stats`, `bignum`, `note`, `code`, `chips`,
`shots`, `media`, `opts`, `p`, `lead`.

- `seq:true` on a block makes its items appear one at a time.
- `{{45}}` anywhere in text resolves to a wall-clock time 45 minutes after `meta.start`.
- `{braces}` in an `h1` or `h2` render as gradient text.

`DEMO-101` is a live reference: one slide per block type, showing the data that produced it.

## Keyboard

| Key | Action |
|---|---|
| `→` / `Space` | Next build-in step, then next slide |
| `←` | Previous slide |
| `R` | Reveal |
| `O` | Overview grid, and the course switcher |
| `H` | Back to this course |
| `[` / `]` | Previous / next class |
| `N` | Presenter notes |
| `T` | Start / stop timer |
| `D` | Cycle theme: dark, light, ember |
| `F` | Fullscreen |
| `?` | Shortcuts |

## Schedule

Slides store an offset in minutes, so a class moves with one line:

```js
meta:{ ..., start:"17:45" }
```

## Themes

Three themes, cycled with `D` or the toolbar button. The choice is remembered in
`localStorage` and follows you across every page and course.

| Theme | Use |
|---|---|
| **Dark** | The default. Cool indigo, for a dimmed room. |
| **Light** | For a bright room or a printed handout. |
| **Ember** | Warm dark, for projectors that wash out the cool theme. |

Every colour comes from CSS custom properties defined in three blocks at the top of
`engine/deck.css`. To add a fourth theme, copy one block, change the values, and add an entry
to `THEMES` in `engine/deck.js` and `engine/theme.js`.

## Screenshots

Engine screenshots are hotlinked from official Unity, Godot and Unreal documentation, using
the prefixes `u:`, `g:` and `e:`. If an image fails to load, the slide falls back to a
captioned card showing the menu path in text, so the lecture still works offline.

## Cache

Shared assets carry a version query (`deck.js?v=9`). If you edit a file in `engine/` and the
change does not appear, bump that number in the three HTML pages.

## Authoring

`AUTHORING.md` is the full feature reference: every slide type, every block, timing, themes, keys and the test script. Read it before adding a course or a class.

A Claude skill lives in `.claude/skills/teaching-decks/` and is also installed at `~/.claude/skills/teaching-decks/`, so it is available in any session.
