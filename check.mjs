// Self-check: Tab/Space keys, mouse and touch halves add the right indent, Tab keeps focus, a repeat or a timeout
// triggers the linter, restart works, no horizontal scroll, no errors. Needs @playwright/test and a local server.
// usage: node check.mjs http://127.0.0.1:<port>/<path>/ [shots-dir]   (PW_FROM=<a package.json beside @playwright/test>)
import { createRequire } from 'node:module';
import assert from 'node:assert/strict';
const require = createRequire(process.env.PW_FROM || import.meta.url);
const { chromium } = require('@playwright/test');
const [url, shots] = process.argv.slice(2), errors = [];
const b = await chromium.launch({ args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist'] });
const open = async (opt) => {
  const c = await b.newContext(opt), p = await c.newPage();
  p.on('pageerror', e => errors.push(e.message)); p.on('console', m => m.type() === 'error' && errors.push(m.text()));
  await p.goto(url); await p.waitForFunction('window.__ready===true');
  return p;
};
const peek = (p) => p.evaluate('window.__peek()');
const shot = async (p, name) => shots && p.screenshot({ path: `${shots}/${name}.png` });

let p = await open({ viewport: { width: 1280, height: 800 } });
await shot(p, 'desk-ready');
let s = await peek(p); assert.equal(s.state, 'ready'); assert.equal(s.last, 1, 'pre-filled file ends on a space');
await p.keyboard.press('Tab'); s = await peek(p);
assert.equal(s.last, 0, 'Tab adds a tab'); assert.equal(s.n, 7); assert(s.focus, 'Tab does not move focus');
await p.keyboard.press(' '); s = await peek(p); assert.equal(s.last, 1, 'Space adds a space');
await p.mouse.click(200, 400); s = await peek(p); assert.equal(s.last, 0, 'left half click adds a tab');
await p.mouse.click(1100, 400); s = await peek(p); assert.equal(s.last, 1, 'right half click adds a space');
for (let i = 0; i < 14; i++) await p.keyboard.press(i % 2 ? ' ' : 'Tab');
s = await peek(p); assert.equal(s.n, 24); assert.equal(s.state, 'run'); assert(s.focus);
await shot(p, 'desk-run');
await p.keyboard.press(' '); s = await peek(p); assert.equal(s.state, 'miss', 'two spaces in a row is a mistake');
await p.waitForTimeout(1750); await shot(p, 'desk-slap');
await p.waitForFunction('window.__peek().state==="over"'); await p.waitForTimeout(1200); await shot(p, 'desk-over');
await p.keyboard.press('Enter'); s = await peek(p); assert.equal(s.state, 'ready', 'Enter restarts'); assert.equal(s.n, 6);
console.log('ok keyboard, mouse, miss, restart');

// too slow: the editor auto-indents with the line above, which is a mistake
await p.keyboard.press('Tab'); await p.waitForFunction('window.__peek().state!=="run"', null, { timeout: 4000 });
s = await peek(p); assert.equal(s.state, 'miss'); assert.equal(s.last, 0, 'auto-indent copied the tab');
await p.waitForTimeout(800); await shot(p, 'desk-auto');
console.log('ok auto-indent timeout');

p = await open({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 3 });
await shot(p, 'phone-ready');
const cdp = await p.context().newCDPSession(p);
const tap = async (x) => { await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y: 500 }] }); await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); };
await tap(80); s = await peek(p); assert.equal(s.last, 0, 'left half touch adds a tab');
await tap(320); s = await peek(p); assert.equal(s.last, 1, 'right half touch adds a space');
for (let i = 0; i < 10; i++) { await tap(i % 2 ? 320 : 80); await p.waitForTimeout(60); }
s = await peek(p); assert.equal(s.n, 18); await shot(p, 'phone-run');
assert.equal(await p.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, 'no horizontal scroll');
console.log('ok touch');
assert.deepEqual(errors, []);
await b.close(); console.log('all ok');
