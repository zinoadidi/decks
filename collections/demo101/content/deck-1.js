/* DEMO-101 Deck 1: every block type the engine supports, with the data that produced it. */
window.DECK = {
meta:{ collection:"DEMO-101 Deck Template", label:"Deck 1", title:"Every Block Type", start:"10:00" },
slides:[

{type:"title", sec:"DEMO-101", title:"Title slide", m:0,
 kicker:"DEMO-101 Deck Template",
 h1:"Every<br>{Block Type}", lead:"A worked example of the deck engine",
 notes:["Presenter notes look like this. Press N to show or hide them."]},

{type:"content", sec:"Basics", title:"How a slide is written", m:1, kicker:"Authoring",
 h2:"A slide is just data",
 blocks:[
  {b:"code", html:"{type:<span class=\"c-st\">\"content\"</span>, kicker:<span class=\"c-st\">\"Authoring\"</span>, h2:<span class=\"c-st\">\"A slide is just data\"</span>,\n blocks:[ ... ],\n notes:[<span class=\"c-st\">\"shown with N\"</span>]}"},
  {b:"p", seq:true, big:true, html:"No HTML is written by hand. Add a data file, add one line to the collection, and the deck exists."}]},

{type:"section", sec:"Blocks", title:"Section divider", m:2, num:"01",
 h2:"The blocks", lead:"One slide each, in the order you are most likely to need them."},

{type:"content", sec:"Blocks", title:"hero", m:3, kicker:"b: hero", h2:"hero",
 blocks:[
  {b:"hero", c:1, ic:"★", h:"One idea, full width, impossible to miss",
   p:"Use it when the slide has a single point. Set c:1 to 5 to change the colour."},
  {b:"code", seq:true, html:"{b:<span class=\"c-st\">\"hero\"</span>, c:<span class=\"c-nu\">1</span>, ic:<span class=\"c-st\">\"★\"</span>, h:<span class=\"c-st\">\"...\"</span>, p:<span class=\"c-st\">\"...\"</span>}"}]},

{type:"content", sec:"Blocks", title:"cards", m:5, kicker:"b: cards", h2:"cards",
 blocks:[
  {b:"cards", cols:3, seq:true, items:[
   {c:1, ic:"1", h:"First", p:"With seq:true these appear one at a time."},
   {c:2, ic:"2", h:"Second", p:"The bar underneath tracks how many are left."},
   {c:4, ic:"3", h:"Third", p:"Use cols:3 for three across, or leave it out for two."}]},
  {b:"code", seq:true, html:"{b:<span class=\"c-st\">\"cards\"</span>, cols:<span class=\"c-nu\">3</span>, seq:<span class=\"c-kw\">true</span>, items:[ ... ]}"}]},

{type:"content", sec:"Blocks", title:"flow", m:7, kicker:"b: flow", h2:"flow",
 blocks:[
  {b:"flow", seq:true, items:[
   {s:"STEP", b:"A process", d:"Left to right by default"},
   {s:"STEP", b:"With arrows", d:"Drawn between the boxes"},
   {s:"STEP", b:"Or vertical", d:"Add vertical:true"}]},
  {b:"code", seq:true, html:"{b:<span class=\"c-st\">\"flow\"</span>, seq:<span class=\"c-kw\">true</span>, items:[{s:<span class=\"c-st\">\"STEP\"</span>, b:<span class=\"c-st\">\"...\"</span>, d:<span class=\"c-st\">\"...\"</span>}]}"}]},

{type:"content", sec:"Blocks", title:"table", m:9, kicker:"b: table", h2:"table",
 blocks:[
  {b:"table", head:["Block","Use it for"], rows:[
   ["<code>table</code>","Comparisons and lookups"],
   ["<code>stats</code>","Three or four numbers"],
   ["<code>bignum</code>","One number that matters"]]},
  {b:"code", seq:true, html:"{b:<span class=\"c-st\">\"table\"</span>, head:[...], rows:[[...],[...]]}"}]},

{type:"content", sec:"Blocks", title:"stats", m:11, kicker:"b: stats", h2:"stats",
 blocks:[
  {b:"stats", seq:true, items:[
   {n:"30", l:"Target frames per second"},
   {n:"16 MB", l:"One 2048 texture, uncompressed"},
   {n:"≤150", l:"MB base install"}]},
  {b:"code", seq:true, html:"{b:<span class=\"c-st\">\"stats\"</span>, seq:<span class=\"c-kw\">true</span>, items:[{n:<span class=\"c-st\">\"30\"</span>, l:<span class=\"c-st\">\"...\"</span>}]}"}]},

{type:"content", sec:"Blocks", title:"bignum", m:13, kicker:"b: bignum", h2:"bignum",
 blocks:[
  {b:"bignum", v:"40 → 1", sub:"One number, as large as the slide allows. Add tone:\"warn\" or tone:\"good\" to recolour it."},
  {b:"code", seq:true, html:"{b:<span class=\"c-st\">\"bignum\"</span>, v:<span class=\"c-st\">\"40 → 1\"</span>, sub:<span class=\"c-st\">\"...\"</span>, tone:<span class=\"c-st\">\"good\"</span>}"}]},

{type:"content", sec:"Blocks", title:"note", m:15, kicker:"b: note", h2:"note",
 blocks:[
  {b:"note", tag:"Plain", p:"A callout with a small label. This is the default."},
  {b:"note", seq:true, tone:"key", tag:"tone: key", p:"Green. Use it for the thing you want them to remember."},
  {b:"note", seq:true, tone:"warn", tag:"tone: warn", p:"Red. Use it for the mistake they are about to make."}]},

{type:"content", sec:"Blocks", title:"chips and code", m:17, kicker:"b: chips, code", h2:"chips and code",
 blocks:[
  {b:"chips", items:[["unity","Unity"],["godot","Godot"],["unreal","Unreal"]]},
  {b:"code", html:"<span class=\"c-kw\">void</span> <span class=\"c-fn\">Start</span>() {\n    Application.targetFrameRate = <span class=\"c-nu\">30</span>;   <span class=\"c-cm\">// c-kw c-fn c-nu c-st c-cm</span>\n}"},
  {b:"p", seq:true, big:true, html:"Syntax colour is manual, using the <code>c-</code> classes. No highlighter is loaded."}]},

{type:"content", sec:"Blocks", title:"shots", track:"2D", m:19, kicker:"b: shots", h2:"shots",
 blocks:[
  {b:"shots", items:[
   {img:"u:class-TextureImporter.png", alt:"Unity Texture Import Settings",
    fallback:"UNITY<br>Inspector → Import Settings<br><br>This text shows if the image<br>cannot be loaded",
    cap:"Images are hotlinked from vendor documentation. If one fails, the fallback text shows instead, so the slide still works offline."}]},
  {b:"p", seq:true, big:true, html:"Prefixes: <code>u:</code> Unity docs, <code>g:</code> Godot docs, <code>e:</code> Unreal docs. Click a shot to enlarge."}]},

{type:"content", sec:"Blocks", title:"media", m:20, kicker:"b: media", h2:"media",
 blocks:[
  {b:"media", img:"u:class-TextureImporter.png", alt:"Unity Texture Import Settings",
   cap:"Any local or hotlinked image works here, same as shots.",
   blocks:[
    {b:"hero", c:3, h:"An image beside a column of other blocks",
     p:"Use it instead of a shots figure followed by a paragraph, when a slide is one image plus a few lines of text. Add reverse:true to put the image on the right."}]},
  {b:"code", seq:true, html:"{b:<span class=\"c-st\">\"media\"</span>, img:<span class=\"c-st\">\"...\"</span>, blocks:[ ... ]}"}]},

{type:"content", sec:"Blocks", title:"Track badges", track:"3D", m:21, kicker:"Slide option", h2:"Track badges",
 blocks:[
  {b:"hero", c:5, ic:"◐", h:"Add track:\"2D\" or track:\"3D\" to a slide",
   p:"It appears next to the kicker, so a mixed cohort knows which slides apply to them. This slide is tagged 3D."}]},

{type:"content", sec:"Text width", title:"Wide and justified text", m:22, kicker:"p / lead option", h2:"wide, full, justify",
 blocks:[
  {b:"lead", wide:true, html:"A <code>lead</code> or <code>p</code> block defaults to a readable column width. Add <code>wide:true</code> for more of it, or <code>full:true</code> to use the whole slide."},
  {b:"p", full:true, justify:true, html:"Add <code>justify:true</code> on a wide or full block to align both edges instead of just the left, which some people prefer for dense paragraphs. This paragraph is set to full:true and justify:true, so it stretches the entire width of the slide and both its edges line up, the same way a printed column does."}]},

{type:"content", sec:"Timing", title:"Timing", m:23, kicker:"Slide option", h2:"Timing is computed",
 blocks:[
  {b:"table", head:["In the data","On screen"], rows:[
   ["<code>start:\"10:00\"</code> in meta","The clock starts there"],
   ["<code>m:23</code> on a slide","Target time of {{23}}"],
   ["<code>{{45}}</code> in any text","Resolves to {{45}}"]]},
  {b:"p", seq:true, big:true, html:"Change <code>meta.start</code> and every slide, the agenda and the break card move together."}]},

{type:"break", sec:"Break", title:"break", m:30,
 duration:"15:00", range:"{{30}} to {{45}}",
 text:"The break slide takes a duration and a range. The range can use time tokens."},

{type:"fcintro", sec:"Flashcards", title:"fcintro", m:45,
 lead:"The flashcard opener. Takes a lead line."},

{type:"flashcard", sec:"Flashcards", title:"flashcard: multiple choice", m:46,
 badge:"Card 1 · Multiple choice", min:"~45 s",
 q:"Which block would you use for a single number you want people to remember?",
 blocks:[{b:"opts", items:[
   {k:"a", t:"stats"},
   {k:"b", t:"bignum"},
   {k:"c", t:"table"}]}],
 reveals:[
  {kind:"ans", label:"Answer: B", mark:"b", html:"<p><code>bignum</code>. Setting <code>mark:\"b\"</code> on the reveal highlights the right option and dims the rest.</p>"},
  {kind:"why", label:"Why", html:"<p><code>stats</code> is for three or four numbers side by side. <code>bignum</code> is for one number filling the slide.</p>"}]},

{type:"flashcard", sec:"Flashcards", title:"flashcard: situation", m:48, situation:true,
 badge:"Situation · Multi-step", min:"~2 min",
 q:"A situation card reveals one step at a time, so the room can answer before each one.",
 reveals:[
  {kind:"stp", label:"Step 1. Purple", html:"<p>Use <code>kind:\"stp\"</code> for the intermediate steps.</p>"},
  {kind:"stp", label:"Step 2. Purple again", html:"<p>As many as the problem needs. Four is usually the limit before it gets long.</p>"},
  {kind:"ans", label:"Step 3. Green", html:"<p><code>kind:\"ans\"</code> for the answer or the fix.</p>"},
  {kind:"lsn", label:"Takeaway", html:"<p><code>kind:\"lsn\"</code> for the closing principle, in amber.</p>"}]},

{type:"content", sec:"Wrap", title:"Fonts and export", m:49, kicker:"Presentation", h2:"Fonts and export",
 blocks:[
  {b:"table", head:["Thing","How"], rows:[
   ["Font preset","Press G, or set meta.font to \"sans\", \"serif\", or \"display\""],
   ["Theme","Press D to cycle dark, light, ember"],
   ["PDF export","Open the deck, print, save as PDF. Build-ins print fully open."]]},
  {b:"p", seq:true, big:true, html:"display pairs a condensed headline face over the regular body font, for a punchier title than sans or serif alone."}]},

{type:"content", sec:"Wrap", title:"Adding a collection", m:50, kicker:"How to reuse this", h2:"Adding a collection takes three steps",
 blocks:[{b:"flow", seq:true, items:[
   {s:"01", b:"Make a folder", d:"collections/&lt;id&gt;/ with a content/ folder inside"},
   {s:"02", b:"Write collection.js", d:"Name, and one entry per deck"},
   {s:"03", b:"Add one line", d:"To collections.js at the root"}]},
  {b:"p", seq:true, big:true, html:"No HTML is written. The pages are generic and read everything from the data."}]}

]};
