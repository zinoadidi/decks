/* Export one deck to PDF, waiting for web fonts to finish loading first.
   Usage: node tools/export-pdf.mjs "http://localhost:8778/deck.html?collection=<id>&deck=1" out.pdf

   Why this exists instead of `chrome --headless --print-to-pdf`: a plain headless print
   can capture the page before Google Fonts has finished loading a weight, silently
   falling back to the OS system font for whatever hasn't resolved yet (invisible on
   screen in a normal browser session, embedded permanently once it's in a PDF). This
   drives Chrome over the DevTools protocol instead, so it can explicitly await
   `document.fonts.ready` before calling Page.printToPDF. See "Exporting" in
   AUTHORING.md for the full writeup, including the two content-level fixes (CSS
   triangles instead of arrow glyphs, ASCII icon characters) that remove the risk
   entirely rather than just racing it. */
import { spawn } from 'node:child_process';
import { writeFileSync } from 'node:fs';

const url = process.argv[2];
const outPath = process.argv[3];
if (!url || !outPath) {
  console.error('Usage: node tools/export-pdf.mjs <deck-url> <output.pdf>');
  process.exit(1);
}

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PORT = 9333;

const chrome = spawn(CHROME, [
  '--headless', '--disable-gpu', '--no-sandbox',
  `--remote-debugging-port=${PORT}`,
  '--remote-allow-origins=*',
], { stdio: 'ignore' });

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function waitForEndpoint() {
  for (let i = 0; i < 50; i++) {
    try {
      const res = await fetch(`http://localhost:${PORT}/json/version`);
      if (res.ok) return;
    } catch {}
    await sleep(200);
  }
  throw new Error('Chrome debug endpoint never came up');
}

async function main() {
  await waitForEndpoint();
  const newTab = await fetch(`http://localhost:${PORT}/json/new?${encodeURIComponent(url)}`, { method: 'PUT' }).then(r => r.json());
  const ws = new WebSocket(newTab.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = reject; });

  let id = 0;
  const pending = new Map();
  ws.onmessage = (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id && pending.has(msg.id)) {
      pending.get(msg.id)(msg);
      pending.delete(msg.id);
    }
  };
  function send(method, params = {}) {
    const thisId = ++id;
    return new Promise((resolve) => {
      pending.set(thisId, resolve);
      ws.send(JSON.stringify({ id: thisId, method, params }));
    });
  }

  await send('Page.enable');
  const navPromise = new Promise((resolve) => {
    const orig = ws.onmessage;
    ws.onmessage = (ev) => {
      orig(ev);
      const msg = JSON.parse(ev.data);
      if (msg.method === 'Page.loadEventFired') resolve();
    };
  });
  await send('Page.navigate', { url });
  await navPromise;

  // The actual fix: wait for every @font-face the page needs to finish loading,
  // then settle one more frame, before telling Chrome to paint the print snapshot.
  const fontResult = await send('Runtime.evaluate', {
    expression: 'document.fonts.ready.then(() => document.fonts.size)',
    awaitPromise: true,
  });
  console.error('fonts ready, face count:', fontResult.result?.result?.value);
  await sleep(400);

  const pdf = await send('Page.printToPDF', {
    printBackground: true,
    preferCSSPageSize: true, // honours engine/deck.css's @page size (the deck's own 1920x1080px)
    displayHeaderFooter: false,
    marginTop: 0, marginBottom: 0, marginLeft: 0, marginRight: 0,
  });

  if (!pdf.result?.data) {
    console.error('printToPDF failed:', JSON.stringify(pdf).slice(0, 500));
    process.exit(1);
  }
  writeFileSync(outPath, Buffer.from(pdf.result.data, 'base64'));
  console.error('wrote', outPath);

  ws.close();
  chrome.kill();
}

main().catch((e) => { console.error(e); chrome.kill(); process.exit(1); });
