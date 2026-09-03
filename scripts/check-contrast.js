#!/usr/bin/env node
/**
 * Automated WCAG contrast checks for GrowthBridge semantic theme tokens.
 *
 * Resolves CSS custom properties from:
 *   - src/styles/foundations/tokens.css  (primitives)
 *   - src/styles/themes/light.css
 *   - src/styles/themes/dark.css
 *
 * Exit 1 if any required pair fails the configured threshold.
 *
 * Usage:
 *   node scripts/check-contrast.js
 *   node scripts/check-contrast.js --json
 *   node scripts/check-contrast.js --min-aa 4.5
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const args = process.argv.slice(2);
const asJson = args.includes('--json');
const minAaIdx = args.indexOf('--min-aa');
const MIN_AA = minAaIdx >= 0 ? Number(args[minAaIdx + 1]) : 4.5;
const MIN_AA_LARGE = 3.0; // large text / UI components (WCAG 1.4.3 / 1.4.11-ish)

function read(rel) {
  return fs.readFileSync(path.join(root, rel), 'utf8');
}

/** Parse `--name: value;` declarations (ignores comments roughly). */
function parseVars(css) {
  const map = {};
  const cleaned = css.replace(/\/\*[\s\S]*?\*\//g, '');
  const re = /--([a-zA-Z0-9-]+)\s*:\s*([^;]+);/g;
  let m;
  while ((m = re.exec(cleaned))) {
    map[`--${m[1]}`] = m[2].trim();
  }
  return map;
}

function clamp01(n) {
  return Math.min(1, Math.max(0, n));
}

function parseHex(hex) {
  let h = hex.replace('#', '').trim();
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  if (h.length !== 6) return null;
  const n = parseInt(h, 16);
  if (Number.isNaN(n)) return null;
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255, a: 1 };
}

function parseRgb(str) {
  const m = str.match(
    /rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)/i
  );
  if (!m) return null;
  return {
    r: Number(m[1]),
    g: Number(m[2]),
    b: Number(m[3]),
    a: m[4] !== undefined ? Number(m[4]) : 1,
  };
}

function channelToLinear(c) {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

function relativeLuminance({ r, g, b }) {
  const R = channelToLinear(r);
  const G = channelToLinear(g);
  const B = channelToLinear(b);
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

function contrastRatio(fg, bg) {
  const L1 = relativeLuminance(fg);
  const L2 = relativeLuminance(bg);
  const lighter = Math.max(L1, L2);
  const darker = Math.min(L1, L2);
  return (lighter + 0.05) / (darker + 0.05);
}

/** Composite semi-transparent fg over opaque bg (simple alpha blend). */
function composite(fg, bg) {
  const a = clamp01(fg.a);
  if (a >= 1) return { r: fg.r, g: fg.g, b: fg.b, a: 1 };
  return {
    r: Math.round(fg.r * a + bg.r * (1 - a)),
    g: Math.round(fg.g * a + bg.g * (1 - a)),
    b: Math.round(fg.b * a + bg.b * (1 - a)),
    a: 1,
  };
}

/**
 * Resolve a CSS value to an opaque RGB color using a variable map.
 * Supports: #hex, rgb/rgba, var(--x), and simple alpha rgba over a fallback bg.
 */
function resolveColor(value, vars, depth = 0, fallbackBg = null) {
  if (!value || depth > 12) return null;
  let v = value.trim();

  // var(--name) or var(--name, fallback)
  const varMatch = v.match(/^var\(\s*(--[a-zA-Z0-9-]+)\s*(?:,\s*(.+))?\s*\)$/);
  if (varMatch) {
    const key = varMatch[1];
    const fallback = varMatch[2];
    if (vars[key] !== undefined) return resolveColor(vars[key], vars, depth + 1, fallbackBg);
    if (fallback) return resolveColor(fallback, vars, depth + 1, fallbackBg);
    return null;
  }

  if (v.startsWith('#')) {
    return parseHex(v);
  }

  const rgb = parseRgb(v);
  if (rgb) {
    if (rgb.a < 1) {
      const base = fallbackBg || { r: 255, g: 255, b: 255, a: 1 };
      return composite(rgb, base);
    }
    return rgb;
  }

  // Unsupported (gradients, etc.)
  return null;
}

function mergeVars(...maps) {
  return Object.assign({}, ...maps);
}

/** Pairs to check: [fgVar, bgVar, level, label] */
const PAIRS = [
  // Body text
  ['--text-primary', '--surface-page', 'aa', 'Body primary on page'],
  ['--text-secondary', '--surface-page', 'aa', 'Body secondary on page'],
  ['--text-primary', '--surface-soft', 'aa', 'Primary on soft surface'],
  ['--text-secondary', '--surface-soft', 'aa', 'Secondary on soft surface'],
  ['--text-primary', '--card-surface', 'aa', 'Primary on card'],
  ['--text-secondary', '--card-surface', 'aa', 'Secondary on card'],
  ['--text-tertiary', '--surface-page', 'aa-large', 'Tertiary on page (large/UI)'],
  // Links / accent
  ['--text-link', '--surface-page', 'aa', 'Link on page'],
  ['--text-link', '--card-surface', 'aa', 'Link on card'],
  ['--text-accent', '--surface-page', 'aa', 'Accent on page'],
  // Forms
  ['--form-text', '--form-bg', 'aa', 'Form input text'],
  ['--form-label', '--surface-page', 'aa', 'Form label on page'],
  // Actions
  ['--action-primary-text', '--action-primary', 'aa', 'Primary button label'],
  ['--action-secondary-text', '--action-secondary', 'aa', 'Secondary button label'],
  // On dark / brand bands
  ['--text-on-dark', '--surface-inverse', 'aa', 'Text on inverse/dark band'],
  ['--text-on-brand', '--gb-navy-800', 'aa', 'Text on navy brand'],
  ['--text-on-brand-green', '--action-primary', 'aa', 'Text on primary green'],
  // Chips (large text / UI component threshold)
  ['--chip-green-text', '--chip-green-bg', 'aa-large', 'Green chip text'],
  ['--chip-orange-text', '--chip-orange-bg', 'aa-large', 'Orange chip text'],
  ['--chip-blue-text', '--chip-blue-bg', 'aa-large', 'Blue chip text'],
];

function thresholdFor(level) {
  return level === 'aa-large' ? MIN_AA_LARGE : MIN_AA;
}

function checkTheme(name, themeVars, primitives) {
  const vars = mergeVars(primitives, themeVars);
  const results = [];

  // Page canvas used when compositing translucent surfaces (cards, chips, forms)
  const pageBase =
    resolveColor(vars['--surface-page'], vars) ||
    (name === 'dark' ? { r: 7, g: 15, b: 27, a: 1 } : { r: 255, g: 255, b: 255, a: 1 });

  for (const [fgVar, bgVar, level, label] of PAIRS) {
    // Skip pairs that are meaningless for a theme (e.g. "on inverse" when inverse is light)
    if (name === 'dark' && bgVar === '--surface-inverse') {
      // In dark theme inverse is light; check text-on-dark against page instead
      const altBg = pageBase;
      let fg = resolveColor(vars['--text-primary'] || vars[fgVar], vars, 0, altBg);
      if (fg && fg.a < 1) fg = composite(fg, altBg);
      if (fg) {
        const ratio = contrastRatio(fg, altBg);
        const min = thresholdFor(level);
        results.push({
          theme: name,
          label: 'Primary text on dark page (inverse pair remapped)',
          fgVar: '--text-primary',
          bgVar: '--surface-page',
          level,
          min,
          ratio: Math.round(ratio * 100) / 100,
          status: ratio >= min ? 'pass' : 'fail',
        });
      }
      continue;
    }

    const bg = resolveColor(vars[bgVar] || bgVar, vars, 0, pageBase);
    if (!bg) {
      results.push({
        theme: name,
        label,
        fgVar,
        bgVar,
        level,
        status: 'skip',
        reason: `Could not resolve background ${bgVar}`,
      });
      continue;
    }
    let fg = resolveColor(vars[fgVar] || fgVar, vars, 0, bg);
    if (!fg) {
      results.push({
        theme: name,
        label,
        fgVar,
        bgVar,
        level,
        status: 'skip',
        reason: `Could not resolve foreground ${fgVar}`,
      });
      continue;
    }
    if (fg.a < 1) fg = composite(fg, bg);

    const ratio = contrastRatio(fg, bg);
    const min = thresholdFor(level);
    const pass = ratio >= min;
    results.push({
      theme: name,
      label,
      fgVar,
      bgVar,
      level,
      min,
      ratio: Math.round(ratio * 100) / 100,
      status: pass ? 'pass' : 'fail',
    });
  }
  return results;
}

function main() {
  const primitives = parseVars(read('src/styles/foundations/tokens.css'));
  const light = parseVars(read('src/styles/themes/light.css'));
  const dark = parseVars(read('src/styles/themes/dark.css'));

  // dark.css is scoped under .dark { } but parseVars still picks declarations
  const all = [
    ...checkTheme('light', light, primitives),
    ...checkTheme('dark', dark, primitives),
  ];

  const fails = all.filter((r) => r.status === 'fail');
  const skips = all.filter((r) => r.status === 'skip');
  const passes = all.filter((r) => r.status === 'pass');

  if (asJson) {
    console.log(JSON.stringify({ passes: passes.length, fails, skips, all }, null, 2));
  } else {
    console.log(`GrowthBridge contrast check (AA normal ≥ ${MIN_AA}:1, large/UI ≥ ${MIN_AA_LARGE}:1)`);
    console.log(`Checked ${all.length} pairs (${passes.length} pass, ${fails.length} fail, ${skips.length} skip)\n`);

    for (const r of all) {
      if (r.status === 'pass') {
        console.log(`  ✓ [${r.theme}] ${r.label}: ${r.ratio}:1`);
      } else if (r.status === 'fail') {
        console.error(
          `  ✗ [${r.theme}] ${r.label}: ${r.ratio}:1 (need ≥ ${r.min}:1)  ${r.fgVar} on ${r.bgVar}`
        );
      } else {
        console.warn(`  · [${r.theme}] ${r.label}: skipped — ${r.reason}`);
      }
    }

    if (fails.length) {
      console.error(`\nContrast check FAILED: ${fails.length} pair(s) below threshold.`);
    } else {
      console.log('\nContrast check passed.');
    }
  }

  process.exit(fails.length ? 1 : 0);
}

main();
