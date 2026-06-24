function luminance(hex) {
  const rgb = hex.replace('#', '').match(/.{2}/g).map(c => {
    const v = parseInt(c, 16) / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
}

function contrast(hex1, hex2) {
  const l1 = luminance(hex1);
  const l2 = luminance(hex2);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

function grade(ratio) {
  if (ratio >= 7) return 'AAA';
  if (ratio >= 4.5) return 'AA';
  if (ratio >= 3) return 'AA-large';
  return 'FAIL';
}

const palette = {
  bg:       '#100d0a',
  surface:  '#1c1714',
  raised:   '#251f1a',
  overlay:  '#2e2722',
  fg:       '#ede6dd',
  fg2:      '#b5a99c',
  fg3:      '#8a7e74',
  fg4:      '#605850',
  primary:  '#c4885a',
  priHover: '#d49a6c',
  secondary:'#8a7e74',
  tertiary: '#7a9e82',
  accent:   '#e8d8c4',
  highlight: '#a8b89c',
  success:  '#7a9e82',
  error:    '#c46a6a',
  warning:  '#c4a45a',
  info:     '#7a9ab0',
};

console.log('=== CONTRAST RATIOS ===\n');

const pairs = [
  ['Primary text on bg',        palette.fg, palette.bg],
  ['Secondary text on bg',      palette.fg2, palette.bg],
  ['Muted text on bg',          palette.fg3, palette.bg],
  ['Primary text on surface',   palette.fg, palette.surface],
  ['Secondary text on surface', palette.fg2, palette.surface],
  ['Muted text on surface',     palette.fg3, palette.surface],
  ['Primary text on raised',    palette.fg, palette.raised],
  ['Secondary text on raised',  palette.fg2, palette.raised],
  ['Muted text on raised',      palette.fg3, palette.raised],
  ['Primary on bg',             palette.primary, palette.bg],
  ['Primary on surface',        palette.primary, palette.surface],
  ['Primary on raised',         palette.primary, palette.raised],
  ['Parchment on bg',           palette.accent, palette.bg],
  ['Parchment on surface',      palette.accent, palette.surface],
  ['Sage on bg',                palette.tertiary, palette.bg],
  ['Sage on surface',           palette.tertiary, palette.surface],
  ['Error on bg',               palette.error, palette.bg],
  ['Error on surface',          palette.error, palette.surface],
  ['Warning on bg',             palette.warning, palette.bg],
  ['Info on bg',                palette.info, palette.bg],
  ['Fg on primary (buttons)',   palette.fg, palette.primary],
  ['Dark on primary (btn)',     palette.bg, palette.primary],
];

let allPass = true;
for (const [label, fg, bg] of pairs) {
  const ratio = contrast(fg, bg);
  const g = grade(ratio);
  const pass = g !== 'FAIL';
  if (!pass) allPass = false;
  const status = pass ? '  ' : 'X ';
  console.log(status + ratio.toFixed(1).padStart(5) + ' ' + g.padEnd(10) + '  ' + label);
}

console.log('\n' + (allPass ? 'ALL PAIRS PASS' : 'SOME PAIRS FAIL'));
