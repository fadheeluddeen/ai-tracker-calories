// Usage: node validate.js <bodyFile> [bodyFile2 ...]
// Executes prelude + each body against the mock Figma API, then reports geometry.
const fs = require('fs');
const path = require('path');
const { figma, PAGE } = require('./mockfigma.js');

const DIR = __dirname;
const bodies = process.argv.slice(2);
if (!bodies.length) { console.error('usage: node validate.js <bodyFile> [...]'); process.exit(1); }

const prelude = fs.readFileSync(path.join(DIR, 'prelude.js'), 'utf8');

(async () => {
  let hardFail = false;
  for (const b of bodies) {
    const p = path.isAbsolute(b) ? b : path.join(DIR, b);
    const name = path.basename(p);
    if (!fs.existsSync(p)) { console.log('MISSING  ' + name); hardFail = true; continue; }
    const body = fs.readFileSync(p, 'utf8');

    // fresh page per body
    PAGE.children.length = 0;

    const src = [
      "await figma.loadFontAsync({family:'Inter',style:'Regular'});",
      "await figma.loadFontAsync({family:'Inter',style:'Medium'});",
      "await figma.loadFontAsync({family:'Inter',style:'Semi Bold'});",
      "await figma.loadFontAsync({family:'Inter',style:'Bold'});",
      'const page = __PAGE__;',
      prelude,
      body,
    ].join('\n');

    if (/\breturn\b/.test(body.split('\n').filter(l => !/^\s*(\/\/|\*)/.test(l)).join('\n').replace(/function[^]*?\n\}/g, ''))) {
      // soft note only — helper-local returns are fine
    }

    try {
      const fn = new Function('figma', '__PAGE__', '"use strict";return (async () => {\n' + src + '\n})();');
      await fn(figma, PAGE);
      console.log('\n=== OK  ' + name + ' ===');
    } catch (e) {
      hardFail = true;
      console.log('\n=== FAIL ' + name + ' ===');
      console.log('  ' + e.message);
      if (e.stack) {
        const line = (e.stack.split('\n')[1] || '').trim();
        if (line) console.log('  at ' + line);
      }
      continue;
    }

    // ---- geometry report
    for (const root of PAGE.children) {
      console.log('  [' + root.name + '] ' + Math.round(root.width) + 'x' + Math.round(root.height) + ' @ (' + Math.round(root.x) + ',' + Math.round(root.y) + ')');
      const isPhone = Math.round(root.width) === 393 && Math.round(root.height) === 852;
      const hasTabBar = root.children.some(c => c.name === 'Tab Bar');
      const budget = isPhone ? (hasTabBar ? 748 : 826) : root.height;

      const blocks = root.children
        .filter(c => ['Backdrop', 'Home Indicator', 'Tab Bar', 'Orb'].indexOf(c.name) === -1)
        .map(c => ({ name: c.name, y0: c.y, y1: c.y + c.height, x0: c.x, x1: c.x + c.width, h: c.height, w: c.width }))
        .sort((a, b) => a.y0 - b.y0);

      for (const bl of blocks) {
        const flags = [];
        if (isPhone && bl.y1 > budget) flags.push('OVERFLOWS budget ' + budget + ' by ' + Math.round(bl.y1 - budget));
        if (bl.x1 > root.width + 0.5) flags.push('past right edge by ' + Math.round(bl.x1 - root.width));
        if (bl.x0 < -0.5) flags.push('past left edge');
        if (bl.h <= 1) flags.push('COLLAPSED height ' + bl.h);
        if (bl.w <= 1) flags.push('COLLAPSED width ' + bl.w);
        console.log('    ' + (flags.length ? '!! ' : '   ') +
          String(Math.round(bl.y0)).padStart(4) + '..' + String(Math.round(bl.y1)).padEnd(4) +
          '  x ' + String(Math.round(bl.x0)).padStart(4) + '..' + String(Math.round(bl.x1)).padEnd(4) +
          '  ' + bl.name + (flags.length ? '   <-- ' + flags.join('; ') : ''));
        if (flags.length) hardFail = true;
      }

      for (let i = 0; i < blocks.length; i++) {
        for (let j = i + 1; j < blocks.length; j++) {
          const a = blocks[i], b2 = blocks[j];
          const vOverlap = a.y1 > b2.y0 + 0.5 && b2.y1 > a.y0 + 0.5;
          const hOverlap = a.x1 > b2.x0 + 0.5 && b2.x1 > a.x0 + 0.5;
          if (vOverlap && hOverlap) {
            console.log('    !! OVERLAP: "' + a.name + '" (' + Math.round(a.y0) + '..' + Math.round(a.y1) + ') vs "' + b2.name + '" (' + Math.round(b2.y0) + '..' + Math.round(b2.y1) + ')');
            hardFail = true;
          }
        }
      }

      // deep scan for collapsed / zero-size nodes
      const bad = [];
      (function walk(n, depth) {
        if (depth > 0 && (n.width < 0.6 || n.height < 0.6)) bad.push(n.name + ' ' + Math.round(n.width) + 'x' + Math.round(n.height));
        n.children.forEach(c => walk(c, depth + 1));
      })(root, 0);
      if (bad.length) {
        console.log('    !! ' + bad.length + ' collapsed node(s): ' + bad.slice(0, 12).join(', ') + (bad.length > 12 ? ' …' : ''));
        hardFail = true;
      }
    }
  }
  console.log('\n' + (hardFail ? 'RESULT: PROBLEMS FOUND' : 'RESULT: all clean'));
  process.exit(hardFail ? 1 : 0);
})();
