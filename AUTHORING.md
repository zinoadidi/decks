# Authoring reference

Everything the deck engine can do. Load this file when adding a collection or a deck.

The engine is data-driven: three generic HTML pages render every collection from JavaScript
data files. **You never write HTML for a collection.**

- [Adding a collection](#adding-a-collection)
- [Adding a deck](#adding-a-deck)
- [Slide types](#slide-types)
- [Blocks](#blocks)
- [Build-in reveals](#build-in-reveals)
- [Timing](#timing)
- [Text formatting](#text-formatting)
- [Screenshots](#screenshots)
- [2D and 3D tracks](#2d-and-3d-tracks)
- [Themes](#themes)
- [Navigation and keys](#navigation-and-keys)
- [Testing a deck](#testing-a-deck)
- [Writing guidance](#writing-guidance)

---

## Adding a collection

Three steps. No HTML.

**1. Make the folders**

```bash
mkdir -p collections/<id>/content collections/<id>/notes
```

**2. Write `collections/<id>/collection.js`**

```js
window.COLLECTION = {
  id:"<id>",
  name:"XX-000 Collection Name",
  subtitle:"One line describing the collection",
  year:"2026/27",
  instructor:"Name",
  decks:[
    { file:"deck-1.html", data:"deck-1.js", label:"Deck 1", title:"Deck title",
      blurb:"One or two lines shown on the collection page tile." }
  ]
};
```

`file` is legacy and unused by the loader; keep it for readability. `data` is the filename
inside `content/` and is what actually gets loaded.

**3. Add one line to `collections.js`**

```js
{ id:"<id>", name:"XX-000 Collection Name", subtitle:"...", year:"2026/27", decks:1, accent:2 }
```

`accent` is 1, 2 or 3 and only picks the colour stripe on the tile.

---

## Adding a deck

1. Write `collections/<id>/content/deck-N.js`
2. Add an entry to the `decks` array in that collection's `collection.js`

A content file sets one global:

```js
window.DECK = {
  meta:{ collection:"XX-000 Collection Name", label:"Deck 2", title:"Deck title", start:"17:45" },
  slides:[ /* ... */ ]
};
```

| meta key | Purpose |
|---|---|
| `collection` | Full collection name, used in the deck's own header text |
| `label` | Short name, shown in the breadcrumb and overview switcher |
| `title` | Deck title, becomes the browser tab title |
| `start` | Wall-clock start time. Every slide's clock is computed from it |

Open it at `deck.html?collection=<id>&deck=N`.

---

## Slide types

Every slide is an object with a `type`. These keys work on all types:

| Key | Purpose |
|---|---|
| `type` | One of the six below |
| `sec` | Breadcrumb text, bottom left |
| `title` | Label in the overview grid. Keep it short and distinct |
| `m` | Minutes after `meta.start`, used for the target clock |
| `notes` | Array of strings, shown as presenter notes with `N` |
| `shapes` | Decorative background set: `"a"`, `"b"`, `"c"`, `"break"`, `"fc"` |

### `title`

Opens the deck.

```js
{type:"title", sec:"XX-000", title:"Title", m:0,
 kicker:"XX-000 Collection Name",
 h1:"First line<br>and the {Highlighted}", lead:"Deck 1 of 3",
 notes:["Press T to start the timer."]}
```

Add `img` (and optional `imgAlt`) for a portrait beside the title text, good for a closing
slide: `{type:"title", h1:"...", img:"path/to/art.png"}`. Pick a single clean pose, not a
multi-angle reference sheet, the same rule as a `shots` item.

### `section`

A divider between blocks of a deck.

```js
{type:"section", sec:"Block A", title:"1. Section name", m:2, num:"01", shapes:"c",
 h2:"Section name", lead:"One line on what this section covers."}
```

### `content`

The workhorse. Everything else is blocks.

```js
{type:"content", sec:"Block A", title:"Overview label", m:5,
 kicker:"Small label above the heading",
 h2:"The heading",
 track:"2D",
 blocks:[ /* ... */ ],
 notes:["..."]}
```

### `break`

```js
{type:"break", sec:"Break", title:"BREAK 15 minutes", m:30,
 duration:"15:00", range:"{{30}} to {{45}}",
 text:"What happens after the break.",
 notes:["Hard stop."]}
```

### `fcintro`

Opens a flashcard slot.

```js
{type:"fcintro", sec:"Flashcards A", title:"Flashcards A intro", m:25, budget:5,
 kicker:"Five minutes", h2:"Flashcards",
 lead:"Three questions and one situation."}
```

`budget` is the minutes the slot should take; the timer turns red past it.

### `flashcard`

```js
{type:"flashcard", sec:"Flashcards A", title:"FC1 short label", m:25,
 badge:"Card 1 · Spot the bug", min:"~1 min",
 situation:false,
 q:"The question.",
 blocks:[ /* optional: code, opts */ ],
 reveals:[
   {kind:"ans", label:"Answer", html:"<p>...</p>"},
   {kind:"why", label:"Why it matters", html:"<p>...</p>"}
 ]}
```

Set `situation:true` for a multi-step scenario. It recolours the badge and changes the prompt
to "step through".

**Reveal kinds:**

| `kind` | Colour | Use |
|---|---|---|
| `ans` | Green | The answer, or the fix |
| `why` | Cyan | The reasoning behind it |
| `stp` | Violet | An intermediate step in a situation |
| `lsn` | Amber | The closing takeaway |

Add `mark:"b"` to a reveal to highlight option `b` in an `opts` block and dim the others.

---

## Blocks

Blocks go in a slide's `blocks` array. Each has a `b` naming its type.

### `hero`

The one that dominates the slide. Use it when the slide has a single point.

```js
{b:"hero", c:1, ic:"★", h:"The one idea", p:"Supporting sentence.", code:"optional"}
```

`c` is 1 to 5 and picks the accent colour: 1 cyan, 2 violet, 3 rose, 4 green, 5 amber.

### `cards`

```js
{b:"cards", cols:3, seq:true, lead:false, items:[
  {c:1, ic:"↻", h:"Heading", p:"Body text."},
  {c:2, ic:"⌗", h:"Heading", list:["bullet","bullet"]},
  {c:4, ic:"▦", h:"Heading", code:"some code", hero:true}
]}
```

- `cols:3` gives three across; omit it for two.
- `lead:true` shrinks non-hero cards so a `hero:true` card leads.
- Each item takes any of `ic`, `h`, `p`, `code`, `list`.

Two or three cards per slide reads well. Six is a wall.

### `flow`

A left-to-right process with arrows.

```js
{b:"flow", seq:true, tight:false, vertical:false, items:[
  {s:"01", b:"Step name", d:"Short description"}
]}
```

`vertical:true` stacks them, full width, with a downward arrow between steps instead of the
horizontal layout's sideways one. `tight:true` reduces padding when there are five or more.

### `table`

```js
{b:"table", head:["Column","Column"], rows:[
  ["<code>cell</code>","Cell text"],
  ["<strong>cell</strong>","Cell text"]
]}
```

`head` is optional. Cells accept HTML. Four or five rows is the comfortable maximum.

### `stats`

Three or four numbers side by side.

```js
{b:"stats", seq:true, items:[{n:"30", l:"Label under the number"}]}
```

### `bignum`

One number, as large as the slide allows.

```js
{b:"bignum", v:"40 → 1", sub:"Sentence under it.", tone:"warn"}
```

`tone` is omitted, `"warn"` (red/amber) or `"good"` (green/cyan).

### `note`

A callout with a small label.

```js
{b:"note", tone:"key", tag:"Short label", p:"The callout text.", seq:true}
```

`tone` is omitted (amber), `"key"` (green) or `"warn"` (red).

### `code`

```js
{b:"code", html:"<span class=\"c-kw\">void</span> <span class=\"c-fn\">Start</span>() { }"}
```

Syntax colour is manual. No highlighter is loaded. Classes:

| Class | For |
|---|---|
| `c-kw` | Keywords |
| `c-ty` | Types |
| `c-fn` | Function names |
| `c-st` | Strings |
| `c-nu` | Numbers |
| `c-cm` | Comments |

Escape `<` as `&lt;` inside code. Use `\n` for line breaks, not `<br>`.

### `chips`

```js
{b:"chips", items:[["unity","Unity"],["godot","Godot"],["unreal","Unreal"]]}
```

The first value is a CSS class. `unity`, `godot` and `unreal` are pre-styled.

### `media`

One image beside a column of other blocks, instead of stacked above them. Use this for a
slide that is one picture plus a few lines of text; a `shots` figure followed by a `p` stacks
the two vertically and leaves the text using only a fraction of the slide's width.

```js
{b:"media", reverse:false, img:"path/to/art.png", alt:"Alt text", cap:"Optional caption.",
 blocks:[ {b:"p", html:"..."} ]}
```

`reverse:true` puts the image on the right instead of the left. Stacks to one column under
860px wide.

### `shots`

Screenshots, or a grid of several images at once. See [Screenshots](#screenshots).

```js
{b:"shots", items:[
  {img:"u:file.png", alt:"Alt text",
   fallback:"TEXT SHOWN<br>IF THE IMAGE FAILS",
   cap:"Caption under the image."}
]}
```

### `opts`

Multiple-choice options, for flashcards.

```js
{b:"opts", items:[{k:"a", t:"First option"}, {k:"b", t:"Second option"}]}
```

### `p` and `lead`

```js
{b:"p", html:"Body text with <strong>markup</strong>.", big:true, wide:true, seq:true}
{b:"lead", html:"Larger intro text.", wide:true, justify:true}
```

`big:true` makes it a bold follow-up line, which works well as the payoff after a `hero`.
`wide:true` widens the measure (58ch to 84ch for `p`, 48ch to 74ch for `lead`) for a slide
that is mostly one block of text with nothing beside it, so it doesn't look stranded in a
third of the slide. `justify:true` sets `text-align:justify` with hyphenation; left-aligned
is the default and reads better at the normal measure, so reach for `justify` only on wide,
dense paragraphs where ragged-right looks noticeably uneven.

---

## Build-in reveals

Add `seq:true` to a block and its items appear one at a time as you press `→`, `Space` or `R`.
A progress bar of pips appears automatically on any slide that has them.

This is the main pacing tool. Use it when you want the room to consider each item before the
next appears, and skip it when the slide is a single thought.

`→` advances the build-in first; only once every item is showing does it move to the next
slide. Pressing `←` always goes back a whole slide.

---

## Timing

Slides store an **offset in minutes**, not a fixed time. The engine computes wall-clock times
from `meta.start`, so moving a deck is a one-line change.

```js
meta:{ ..., start:"17:45" }   // slide with m:25 shows a target of 18:10
```

`{{N}}` anywhere in any text resolves to the wall-clock time N minutes after the start:

```js
h:"{{0}} to {{25}}"        // renders as "17:45 to 18:10"
range:"{{30}} to {{45}}"   // renders as "18:15 to 18:30"
```

Use tokens rather than typing times, so the agenda and break cards follow the start time.

The toolbar shows the current slide's target time. Press `T` to start a live timer beside it,
which turns red once a slide's `budget` is exceeded.

**The shape used for AD-051:** 25 minutes of talk, 5 minutes of flashcards, a 15 minute break,
then the same again. Roughly 20 to 25 slides per 25-minute block, because slides are light.

---

## Text formatting

- Any text field accepts **HTML**: `<strong>`, `<em>`, `<code>`, `<br>`, `<b>`.
- `<em>` renders as a coloured highlight, not italics.
- `{braces}` in an `h1` or `h2` render as gradient text: `h1:"The Engine and the {Picture}"`.
- Quotes inside JS strings need escaping: `\"like this\"`.

---

## Screenshots

Images are hotlinked from official vendor documentation using a prefix:

| Prefix | Resolves to |
|---|---|
| `u:` | `https://docs.unity3d.com/2022.3/Documentation/uploads/Main/` |
| `g:` | `https://docs.godotengine.org/en/stable/_images/` |
| `e:` | `https://dev.epicgames.com/community/api/documentation/image/` (Unreal, use the image UUID) |

Nothing is committed to the repo, so it stays small and carries no vendor images. The cost is
that a clone needs a network connection for images to appear.

**Always write a `fallback`.** If the image fails to load, or there is no network in the
lecture room, the slide shows the fallback text instead and the deck still works. Put the
menu path in it:

```js
fallback:"UNITY<br>Edit → Project Settings → Player<br><br>Other Settings → Optimization"
```

Keep a catalogue of verified image paths in your own `collections/<id>/notes/engine-screenshots.md` as you confirm them, so the next deck in the same collection doesn't repeat the search.

To find new ones: open the vendor doc page in a browser and read the image URLs out of the
DOM. Epic's server returns 403 to non-browser requests, so `curl` will not work for Unreal.

**A collection's own art** (not a vendor screenshot) also works in `shots.items[].img`. Any
`img` value that is not one of the `u:`/`g:`/`e:` prefixes is used as a path or URL as-is,
relative to the site root (where `deck.html` is served from). If the art lives in a sibling
project folder rather than under `decks/`, symlink it in rather than committing large binaries
into this repo, e.g. `ln -s ../../../other-project/assets collections/<id>/assets`.

---

## 2D and 3D tracks

When a cohort builds in both 2D and 3D, tag slides that only apply to one:

```js
{type:"content", ..., track:"2D"}
{type:"content", ..., track:"3D"}
```

A badge appears beside the kicker. Leave it off when the slide applies to both, which should
be most of them. The overview grid lets a presenter skip the track that does not apply.

---

## Themes

Three themes, cycled with `D` or the toolbar button, remembered in `localStorage` and shared
across every page and collection.

| Theme | Look | For |
|---|---|---|
| `dark` | Cool indigo | A dimmed room. The default |
| `light` | White, navy ink | A bright room or a handout |
| `ember` | Warm near-black, amber accents | Projectors that wash the cool theme out |

Every colour is a CSS custom property, defined in three blocks at the top of
`engine/deck.css`. To add a fourth: copy one block, change the values, and add an entry to
`THEMES` in both `engine/deck.js` and `engine/theme.js`.

**Never hardcode a colour** in a block's HTML. It will break in at least one theme. Use the
accent slots (`c:1` to `c:5`, `tone`) instead.

---

## Fonts

Three font presets, cycled with `G` or the toolbar button, remembered in `localStorage` the
same way the theme is:

| Preset | Headline | Body | For |
|---|---|---|---|
| `sans` | Inter | Inter | The default. Works in all three themes |
| `serif` | Source Serif 4 | Source Serif 4 | An editorial, less "tech deck" feel |
| `display` | Bebas Neue | Inter | Condensed, high-impact headlines over a plain readable body. Fits a game/esports brand better than an all-serif or all-sans deck; used by the `gliderverse` collection |

`display` is the only preset where headline and body differ; it sets `--font-head`
separately from `--font` rather than swapping both, which is the standard pitch-deck
pairing (punchy display face for titles, a plain face for everything that needs to be read
quickly).

A deck can set its own starting preset with `meta.font`, which only applies the first time
someone opens that deck on a given browser; an explicit `G` press always wins after that:

```js
meta:{ ..., font:"serif" }
```

Monospace text (`code`, the clock, kbd hints) always uses `--mono` regardless of this
setting; the font picker only affects body and heading text. To add a fourth preset: add its
family to the Google Fonts link in `index.html`, `collection.html` and `deck.html`, add a
`--font-<id>` variable and a `:root[data-font="<id>"]` rule in `engine/deck.css`, and add
`{id, name, icon}` to the `FONTS` array in `engine/deck.js`.

`localStorage` is one key for the whole site, not scoped per collection. Once `G` has been
pressed anywhere, that preset follows the visitor into every other collection until they
press `G` again. `meta.font` only sets what a brand-new visitor sees on their very first deck.

---

## Exporting

`deck.html`'s print stylesheet turns the deck into one slide per printed page: open the
deck, trigger the browser's print dialog, and save as PDF. The toolbar, clock, overview, and
notes panel are hidden automatically, build-in (`seq`) content is forced visible so the
printed page is not missing anything that was still waiting on a `→` press, and the
background shapes are hidden. This is the supported path to a PDF.

Flashcard answers (`reveal` blocks) stay hidden in the printed output, since they're meant
to be hidden until asked for; print a deck using flashcards only after reading through it if
you want the answers included too.

There's no in-browser export straight to `.pptx`. If a `.pptx` is genuinely needed rather
than a PDF, the practical route is to export the PDF as above, then convert pages to images
and place one per slide (`pdftoppm` to rasterize, `python-pptx` or PowerPoint's own "Insert
> Photo Album" to assemble) — this loses no visual fidelity but turns every slide into a
flat image, no longer editable as text. Most investors and collaborators accept a PDF
directly, so confirm a `.pptx` is actually required before doing the conversion.

---

## Navigation and keys

| Key | Action |
|---|---|
| `→` / `Space` | Next build-in step, then next slide |
| `←` | Previous slide |
| `R` | Reveal the next step |
| `O` | Overview grid, plus the collection and deck switcher |
| `H` | Back to this collection |
| `[` / `]` | Previous / next deck |
| `N` | Presenter notes |
| `T` | Start / stop the timer |
| `D` | Cycle theme |
| `G` | Cycle font |
| `F` | Fullscreen |
| `?` | Shortcuts |
| `Esc` | Close a panel |

Addresses:

| Page | URL |
|---|---|
| All collections | `index.html` |
| One collection | `collection.html?collection=<id>` |
| One deck | `deck.html?collection=<id>&deck=<n>` |
| One slide | `deck.html?collection=<id>&deck=<n>#/18` |

Slides are deep-linkable and the hash updates live as you navigate.

---

## Testing a deck

Serve the folder and check the deck in a browser. Do not trust it unseen: the commonest
failure is a slide with too much on it, which only shows up when rendered.

```bash
python3 -m http.server 8778 --directory /path/to/decks
```

**Validate the data file first**, which catches syntax errors fast:

```bash
node -e "global.window={};require('./collections/<id>/content/deck-1.js');
const d=window.DECK; console.log('slides:', d.slides.length);"
```

**Then check every slide for overflow in the browser.** This script walks the deck, forces
every build-in and reveal open (the worst case), and reports any slide whose content does not
fit:

```js
const sl=[...document.querySelectorAll('.slide')]; const bad=[];
for(let n=0;n<sl.length;n++){
  sl.forEach(x=>x.classList.remove('live'));
  const s=sl[n]; s.classList.add('live');
  s.querySelectorAll('.seq[hidden],.reveal[hidden]').forEach(e=>{e.hidden=false;e.classList.add('shown')});
  await new Promise(r=>setTimeout(r,120));
  const oy=s.scrollHeight-s.clientHeight, ox=s.scrollWidth-s.clientWidth;
  if(oy>14||ox>4) bad.push(n+1+': '+s.dataset.title+' y'+oy+' x'+ox);
}
bad
```

Run it at 1920x1080, which is the projector case. A vertical overflow means the slide needs
splitting in two; that is a content fix, not a CSS fix.

Also worth checking: no `{{` left unresolved in `document.body.innerText`, and
`document.querySelectorAll('figure.failed').length` is 0.

**Caching:** shared assets carry a version query such as `deck.js?v=7`. If you edit anything
in `engine/` and the change does not appear, bump that number in `index.html`,
`collection.html` and `deck.html`.

---

## Speaker notes page

Every deck gets a standalone speaker notes page the presenter opens on a second screen or
prints. It is separate from the deck's own `notes` array, which stays short.

**File:** `collections/<id>/notes/deck-N-speaker-notes.html`, served at
`localhost:8778/collections/<id>/notes/deck-N-speaker-notes.html`.

**Template:** build the page using the parts table below; once you've written the first one
for a collection, copy that file and keep its CSS and structure for the rest of that
collection's decks, replacing the header, the nav anchors (one per section) and the cards.

**One card per slide**, numbered to match the deck counter (1-based), grouped under an
`h2.block` per section. The number links to `../../../deck.html?collection=<id>&deck=N#/<n>`.
The time on the right is the slide's `m:` offset.

Each card uses these parts, all optional except the heading:

| Part | Class | Holds |
|---|---|---|
| Context | `p.ctx` | One line on what the slide is for. On flashcards: the answer, bold |
| Terms | `div.terms` | Every term on the slide, explained in plain words: `<b>Term</b>: meaning.` |
| Say | `div.say` | Two or three short sentences the presenter can say out loud, in quotes |
| Tip | `p.tip` | `Do:` actions and `If asked:` extras, taken from the slide's `notes` |

Writing rules for the notes:

- **Simple words.** Explain every technical term on the slide as if to someone new to it.
  Use an everyday comparison when it helps ("a suitcase of everything packed together").
- **Say lines are speech.** Short, spoken, contractions fine. Not the slide text read back.
- **Carry every presenter cue** from the slide's `notes` array into a `tip`.
- Same voice rules as the deck: no em dashes, none of the banned phrases.

Check: the card count equals `window.DECK.slides.length`, and every link opens the right
slide.

---

## Writing guidance

These decks are projected to a room, so they follow different rules from a document.

**One idea per slide.** If a slide has a heading and three separate points, it is three
slides. Splitting is almost always the right fix for a crowded slide.

**Lead with the thing that matters.** A `hero` block plus a `seq` follow-up line reads far
better than four equal cards, because the eye knows where to start.

**Write for a projector.** Short lines, concrete nouns, real numbers. A number on a slide
("150 to 250k tris per frame") is worth a paragraph of description.

**Avoid marketing voice.** "You are buying the pipeline" is a sales pitch. "The engine
converts your textures at build time" is teaching. Say what the thing does.

**Avoid tells of generated text.** No em dashes: use a comma, a colon, or a full stop. Avoid
"not just X but Y", "it's worth noting", "the key takeaway", triads of adjectives, and
sentences that restate the heading.

**Notes carry the detail.** Anything the presenter says but the room should not read goes in
`notes`, not on the slide.

**The written source lives in `notes/`.** Markdown files there can be fuller than the deck.
The deck carries the spine; the notes carry the depth.
