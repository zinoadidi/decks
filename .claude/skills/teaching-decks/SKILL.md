---
name: teaching-decks
description: Author lecture slide decks in the data-driven teaching-decks engine, where courses and classes are plain JavaScript data files rendered by three generic HTML pages. Use this skill whenever the user wants to add a course, add or edit a class, write or restructure slides, add flashcards, adjust class timing, add engine screenshots, change themes, or asks anything about the decks repo at Documents/GitLab/zinospot/decks. Use it even when the user only says something like "add a new class", "make slides for X", "the deck is too crowded" or "add another course" without naming the engine, because writing HTML by hand or inventing a new structure breaks the whole point of this setup.
---

# Teaching decks

A deck engine where **all content is data**. Three generic HTML pages (`index.html`,
`course.html`, `deck.html`) render every course from JavaScript files under `courses/`.

**The one rule: never write HTML for a course.** If a slide cannot be expressed with the
existing blocks, add a block renderer to `engine/render.js` so every course gets it, rather
than hand-rolling markup in a content file.

Repo: `/Users/zinoadidi/Documents/GitLab/zinospot/decks`

## Read the reference first

`AUTHORING.md` in the repo root is the complete feature reference: every slide type, every
block with its exact option keys, timing tokens, themes, keys, and the test script. Read it
before writing content. This file is the workflow; that file is the API.

## Layout

```
decks/
  index.html course.html deck.html   generic, never edited per course
  courses.js                         one line per course
  AUTHORING.md                       the reference
  engine/  render.js boot.js deck.js theme.js deck.css pages.css
  courses/<id>/
    course.js                        window.COURSE, lists the classes
    content/class-N.js               window.DECK, the slides
    notes/*.md                       the written source behind the deck
```

## Adding a course

1. `mkdir -p courses/<id>/content courses/<id>/notes`
2. Write `courses/<id>/course.js` with `window.COURSE = {id, name, subtitle, year, instructor, classes:[...]}`
3. Add one line to `courses.js`
4. Write each `courses/<id>/content/class-N.js`

`courses/demo101/content/class-1.js` is a living example: one slide per block type, each
showing the data that produced it. Read it when you need to see a block in use.

## Writing a class

Work from the notes, not from scratch. If the user has source material (a PDF, a prior
course, their own notes), put the prose in `courses/<id>/notes/` first and derive the deck
from it. The notes can be fuller than the deck; the deck carries the spine.

Then plan the shape before writing slide objects:

- How long is the slot, and what is the start time? Set `meta.start` and give every slide an
  `m:` offset. Use `{{N}}` tokens for any time that appears in text.
- What are the sections? One `section` slide each.
- Where do the flashcards go? An `fcintro` then the `flashcard` slides.

Then write the slides. The judgement that matters most:

**One idea per slide.** A crowded slide is a content problem. Split it. More slides is the
right answer, not smaller text, because the room reads this off a projector.

**Lead with the point.** A `hero` block plus a `seq` follow-up line beats four equal cards.
Use `cards` when items are genuinely parallel, and set `hero:true` plus `lead:true` when one
of them is the point and the rest are context.

**Reveal progressively.** `seq:true` on a block makes its items appear one at a time. Use it
when you want the room to sit with each item. Skip it when the slide is a single thought.

**Real numbers beat description.** "150 to 250k tris per frame" teaches more than a
paragraph about polygon budgets.

**Detail goes in `notes`.** Anything the presenter says but the room should not read.

## Speaker notes page

Once a class deck is written and tested, also write its speaker notes page:
`courses/<id>/notes/class-N-speaker-notes.html`. Follow "Speaker notes page" in AUTHORING.md
for the structure; once you've written the first one for a course, copy that file as the
template for the rest of that course's classes. One card per slide, numbered like the deck,
each with plain-word
explanations of the slide's terms, two or three lines the presenter can say, and every cue
from the slide's `notes`. The presenter asked for simple words and easy reading during the
talk, so keep terms short and say lines conversational. Confirm the card count matches the
slide count.

## Voice

The user is sharp about text that reads as generated, and has corrected this repeatedly.

- **No em dashes anywhere.** Use a comma, a colon, or a full stop.
- **No marketing voice.** "You are buying the pipeline" was a real complaint. Say what the
  thing does: "the engine converts your textures at build time".
- **No meta-commentary.** Do not explain the format on a slide. The room can see the format.
- Avoid "not just X but Y", "it's worth noting", "the key takeaway", "rule of thumb",
  "actually", and sentences that restate the heading.
- Short lines. Concrete nouns.

Before finishing, grep the new files for `—` and for those phrases.

## Test before saying it works

Two checks, both cheap. Do not skip the browser one: the commonest failure is a slide that
overflows, and that is invisible in the data.

**Syntax and structure:**

```bash
node -e "global.window={};require('./courses/<id>/content/class-1.js');
console.log('slides:', window.DECK.slides.length);"
```

**Overflow**, at 1920x1080, with every reveal forced open. The script is in AUTHORING.md
under "Testing a deck". Serve the folder with `python3 -m http.server`, open
`deck.html?course=<id>&class=1`, run it, and fix any slide it reports by splitting it.

Also confirm: no `{{` left in `document.body.innerText`, and no `figure.failed` if the deck
uses screenshots.

If you edited anything in `engine/`, bump the `?v=N` on the shared assets in all three HTML
pages, or the browser will serve the old file and your change will look like a no-op.

## Screenshots

Vendor images are hotlinked with a prefix (`u:` Unity, `g:` Godot, `e:` Unreal) so nothing
is committed. **Every `shots` item needs a `fallback`** with the menu path in it, because the
lecture room may have no network. Keep a `courses/<id>/notes/engine-screenshots.md`
catalogue of verified paths as you confirm them.

## Themes

Three themes: `dark`, `light`, `ember`, cycled with `D`. Colours are CSS custom properties in
`engine/deck.css`. **Never hardcode a colour** in content; use the accent slots (`c:1` to
`c:5`, `tone:"warn"|"good"|"key"`) so slides work in all three.
