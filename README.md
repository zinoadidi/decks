# Decks

A small slide engine driven entirely by data. Adding a collection or a deck means writing a
content file, not writing HTML.

Live: https://zinoadidi.github.io/teaching-decks/ (served directly from `main` via GitHub
Pages, pure static files, no build step).

## Run it locally

```bash
python3 -m http.server 8778 --directory /Users/zinoadidi/Documents/GitLab/zinospot/decks
```

Then open `http://localhost:8778`.

## Structure

```
decks/
  index.html              all collections           (generic, never edited)
  collection.html         decks in a collection      (generic, never edited)
  deck.html               the deck itself            (generic, never edited)
  collections.js          one line per collection

  engine/
    render.js             turns slide data into markup
    deck.js               navigation, build-in, reveals, timer
    boot.js               loads the right collection and deck from the URL
    deck.css              deck styling
    pages.css             index and collection page styling

  collections/
    demo101/
      collection.js
      content/deck-1.js   a worked example of every block type
```

Three generic HTML pages serve every collection. Nothing under `collections/` is HTML.

## Addresses

| Page | URL |
|---|---|
| All collections | `index.html` |
| One collection | `collection.html?collection=demo101` |
| One deck | `deck.html?collection=demo101&deck=1` |
| One slide | `deck.html?collection=demo101&deck=1#/5` |

`index.html` also has a text field: type a collection id and press Open to jump straight to
`collection.html?collection=<id>`, no need to edit the URL by hand.

## Adding a collection

1. `mkdir -p collections/<id>/content`
2. Write `collections/<id>/collection.js`:

```js
window.COLLECTION = {
  id:"<id>", name:"...", subtitle:"...", year:"...", instructor:"...",
  decks:[
    { file:"deck-1.html", data:"deck-1.js", label:"Deck 1", title:"...", blurb:"..." }
  ]
};
```

3. Write `collections/<id>/content/deck-1.js`, which sets `window.DECK = { meta, slides }`.
4. Add one line to `collections.js`.

Adding a deck to an existing collection is steps 3 and the `decks` array only.

## Writing a deck

```js
window.DECK = {
  meta:{ collection:"...", label:"Deck 1", title:"...", start:"17:45" },
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
| `O` | Overview grid, and the collection switcher |
| `H` | Back to this collection |
| `[` / `]` | Previous / next deck |
| `N` | Presenter notes |
| `T` | Start / stop timer |
| `D` | Cycle theme: dark, light, ember |
| `G` | Cycle font: sans, serif, display |
| `F` | Fullscreen |
| `?` | Shortcuts |

## Schedule

Slides store an offset in minutes, so a deck moves with one line:

```js
meta:{ ..., start:"17:45" }
```

## Themes

Three themes, cycled with `D` or the toolbar button. The choice is remembered in
`localStorage` and follows you across every page and collection.

| Theme | Use |
|---|---|
| **Dark** | The default. Cool indigo, for a dimmed room. |
| **Light** | For a bright room or a printed handout. |
| **Ember** | Warm dark, for projectors that wash out the cool theme. |

Every colour comes from CSS custom properties defined in three blocks at the top of
`engine/deck.css`. To add a fourth theme, copy one block, change the values, and add an entry
to `THEMES` in `engine/deck.js` and `engine/theme.js`.

## Fonts

Three presets, cycled with `G` or the toolbar button, same `localStorage` persistence as the
theme: `sans` (Inter throughout), `serif` (Source Serif 4 throughout), `display` (a condensed
Bebas Neue headline over an Inter body). See "Fonts" in `AUTHORING.md` to add a fourth.

## Screenshots

Engine screenshots are hotlinked from official Unity, Godot and Unreal documentation, using
the prefixes `u:`, `g:` and `e:`. If an image fails to load, the slide falls back to a
captioned card showing the menu path in text, so the lecture still works offline.

## Cache

Shared assets carry a version query (`deck.js?v=9`). If you edit a file in `engine/` and the
change does not appear, bump that number in the three HTML pages.

## Authoring

`AUTHORING.md` is the full feature reference: every slide type, every block, timing, themes, keys and the test script. Read it before adding a collection or a deck.

A Claude skill lives in `.claude/skills/teaching-decks/` and is also installed at `~/.claude/skills/teaching-decks/`, so it is available in any session.
