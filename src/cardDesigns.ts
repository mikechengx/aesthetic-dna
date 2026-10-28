import { CARD_PALETTES, getCardProfile, type CardPalette } from './cardProfile.ts';
import { type Session } from './core.ts';
import { localizedReport } from './i18n/report.ts';
import { translate, translateSVG, type Locale } from './i18n/translate.ts';

export const CARD_SERIES = {
  moss: { name: '植物档案', english: 'HERBARIUM OF TASTE' },
  slate: { name: '摄影刊物', english: 'A PRIVATE VIEW' },
  mist: { name: '观察手记', english: 'NOTES ON SEEING' },
  kinetic: { name: '实验海报', english: 'A TASTE MANIFESTO' },
  volt: { name: '实验海报', english: 'A TASTE MANIFESTO' },
} as const;

const escape = (s: string) =>
  s.replace(
    /[<>&"']/g,
    (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' })[c]!,
  );
const serif = `font-family="'Noto Serif CJK SC','Noto Serif CJK TC',serif"`;
const sans = `font-family="'Noto Sans CJK SC','Noto Sans CJK TC',sans-serif"`;
const txt = (x: number, y: number, s: string, size: number, color: string, attrs = '') =>
  `<text x="${x}" y="${y}" font-size="${size}" fill="${color}" ${attrs}>${escape(s)}</text>`;
const box = (x: number, y: number, w: number, h: number, c: string, attrs = '') =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}" ${attrs}/>`;
const rule = (x: number, y: number, x2: number, y2: number, c: string, opacity = 0.3) =>
  `<path d="M${x} ${y}L${x2} ${y2}" stroke="${c}" stroke-opacity="${opacity}"/>`;
function wrap(s: string, n: number) {
  if (!/[\u3400-\u9fff]/.test(s)) {
    const lines: string[] = [];
    let line = '';
    for (const word of s.split(/\s+/)) {
      if ((line + ' ' + word).trim().length > n * 1.85 && line) {
        lines.push(line);
        line = word;
      } else line += (line ? ' ' : '') + word;
    }
    if (line) lines.push(line);
    return lines;
  }
  const chars = Array.from(s),
    result: string[] = [];
  let start = 0;
  const closing = '，。！？：；、）》】”’％…,.!?;:%)]}',
    opening = '（《【“‘([{';
  while (start < chars.length) {
    let end = Math.min(start + n, chars.length);
    while (end < chars.length && closing.includes(chars[end])) end++;
    if (end < chars.length && end > start + 1 && opening.includes(chars[end - 1])) end--;
    result.push(chars.slice(start, end).join(''));
    start = end;
  }
  return result;
}
function paragraph(
  s: string,
  x: number,
  y: number,
  n: number,
  size: number,
  leading: number,
  c: string,
  attrs = '',
  max = 4,
) {
  return wrap(s, n)
    .slice(0, max)
    .map((v, i) => txt(x, y + i * leading, v, size, c, attrs))
    .join('');
}
function fitArt(source: string, x: number, y: number, w: number, h: number) {
  const v = source
      .match(/viewBox="([^"]+)"/)?.[1]
      .split(' ')
      .map(Number),
    ratio = v ? v[2] / v[3] : 1;
  const dw = Math.min(w, h * ratio),
    dh = dw / ratio;
  return source
    .replace(/ width="[^"]*"/, '')
    .replace(/ height="[^"]*"/, '')
    .replace(
      '<svg ',
      `<svg x="${x + (w - dw) / 2}" y="${y + (h - dh) / 2}" width="${dw}" height="${dh}" `,
    );
}
function matrix(a: string, b: string) {
  const rgb = (s: string) =>
      s
        .slice(1)
        .match(/../g)!
        .map((v) => parseInt(v, 16) / 255),
    ink = rgb(a),
    light = rgb(b);
  return (
    ink
      .map((v, i) => {
        const d = light[i] - v;
        return `${d * 0.2126} ${d * 0.7152} ${d * 0.0722} 0 ${v}`;
      })
      .join(' ') + ' 0 0 0 1 0'
  );
}
type Assets = { crop?: string; poster?: string };
type Context = {
  locale: Locale;
  s: Session;
  p: ReturnType<typeof getCardProfile>;
  r: ReturnType<typeof localizedReport>;
  assets: Assets;
  palette: CardPalette;
  t: (typeof CARD_PALETTES)[CardPalette];
};
function definitions(c: Context) {
  return `<defs><filter id="unified-tone" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="${matrix(c.t.ink, c.t.light)}"/></filter><pattern id="stock" patternUnits="userSpaceOnUse" width="113" height="97"><path d="M6 19l3 .6M59 71l4-.8M88 39l2 .5" stroke="#746752" stroke-width=".55"/><circle cx="33" cy="47" r=".5" fill="#746752"/></pattern></defs>`;
}
function renderPhoto(source: string, x: number, y: number, w: number, h: number, natural = 0.35) {
  return `<g filter="url(#unified-tone)">${fitArt(source, x, y, w, h)}</g><g opacity="${natural}">${fitArt(source, x, y, w, h)}</g>`;
}

/** An original engraving-style botanical graphic, used as the editorial motif. */
function leaf(
  ax: number,
  ay: number,
  bx: number,
  by: number,
  width: number,
  ink: string,
  fill: string,
) {
  const dx = bx - ax,
    dy = by - ay,
    len = Math.hypot(dx, dy),
    nx = -dy / len,
    ny = dx / len;
  const point = (f: number, d: number) => `${ax + dx * f + nx * d} ${ay + dy * f + ny * d}`;
  let b = `<path d="M${ax} ${ay}C${point(0.27, width)} ${point(0.72, width * 0.72)} ${bx} ${by}C${point(0.73, -width * 0.48)} ${point(0.31, -width * 0.69)} ${ax} ${ay}Z" fill="${fill}" fill-opacity=".45" stroke="${ink}" stroke-width="1.65"/>`;
  b += `<path d="M${ax} ${ay}Q${point(0.5, width * 0.08)} ${bx} ${by}" fill="none" stroke="${ink}" stroke-width="1.5"/>`;
  for (let i = 1; i < 12; i++) {
    const f = i / 13,
      d = width * Math.sin(Math.PI * f) * 0.64;
    b += `<path d="M${point(f, 0)}Q${point(f + 0.04, d * 0.6)} ${point(Math.min(0.96, f + 0.12), d)}M${point(f, 0)}Q${point(f + 0.03, -d * 0.47)} ${point(Math.min(0.96, f + 0.11), -d * 0.7)}" stroke="${ink}" stroke-width=".75" fill="none" opacity=".75"/>`;
  }
  return b;
}
function botanical(ink: string) {
  let b = `<path d="M518 1115C584 1005 707 849 766 650Q805 504 835 450" stroke="${ink}" stroke-width="2.8" fill="none"/>`;
  b += leaf(630, 953, 461, 689, 79, ink, '#b7bb91');
  b += leaf(691, 861, 1003, 651, 119, ink, '#b8bf98');
  b += leaf(737, 746, 599, 518, 77, ink, '#ccd0ad');
  b += leaf(776, 608, 987, 433, 77, ink, '#c9c9a1');
  b += leaf(804, 523, 846, 377, 42, ink, '#dad6b5');
  b += `<path d="M632 958Q535 921 445 950M706 829Q903 924 981 860" fill="none" stroke="${ink}" stroke-width="1.3"/>`;
  return b;
}
function herbarium(c: Context) {
  const { p, r, s, assets, t, palette } = c,
    ink = t.ink,
    ochre = '#ad6846',
    paper = palette === 'mist' ? '#eeece5' : '#efe9d8';
  let b = box(0, 0, 1080, 1440, paper) + box(0, 0, 1080, 1440, 'url(#stock)', 'opacity=".17"');
  b +=
    box(1027, 0, 53, 1440, ink) +
    txt(
      1062,
      1240,
      '审美 DNA / THE QUIET EDITION',
      12,
      paper,
      `letter-spacing="4" transform="rotate(-90 1062 1240)"`,
    );
  b +=
    txt(64, 74, '审美 DNA', 25, ink, 'font-weight="600"') +
    txt(966, 75, 'I.', 35, ochre, 'font-family="Georgia,serif" text-anchor="end"');
  b +=
    rule(64, 108, 965, 108, ink, 0.45) +
    txt(65, 159, CARD_SERIES[palette].english, 12, ochre, 'letter-spacing="3.8"');
  const title =
    getCardProfile(s).label === '偏好集中型'
      ? ['熟悉之中，', '自有秩序。']
      : p.label === '安静的编排者'
        ? ['安静的表面，', '生长着想法。']
        : p.label === '线索待展开'
          ? ['目光所至，', '仍有余地。']
          : ['少一点声量，', '多一点分寸。'];
  const size = Math.max(...title.map((x) => x.length)) > 6 ? 88 : 104;
  b += title
    .map((v, i) =>
      txt(58, 297 + i * 137, v, size, ink, `${serif} font-weight="600" letter-spacing="-5"`),
    )
    .join('');
  b += `<g opacity=".96">${botanical(ink)}</g>`;
  b += txt(67, 565, '01 / ' + p.label, 17, ochre, 'letter-spacing="1"');
  b += paragraph(p.description, 67, 610, 13, 23, 38, ink, 'opacity=".8"', 6);
  b += rule(67, 850, 315, 850, ochre, 0.65) + txt(67, 887, '偏好，并非偶然。', 24, ink, serif);
  r.axes.slice(0, 3).forEach((a, i) => {
    b +=
      txt(67, (c.locale === 'en' ? 916 : 942) + i * 51, a.name, 12, ochre, 'letter-spacing="2"') +
      txt(c.locale === 'en' ? 67 : 171, (c.locale === 'en' ? 938 : 942) + i * 51, a.label, 17, ink);
  });
  b +=
    rule(855, 1017, 954, 1070, ochre, 0.75) +
    txt(954, 1092, '叶脉习作 / 图形设计', 10, ochre, 'text-anchor="end" letter-spacing="1"');
  b +=
    rule(64, 1130, 966, 1130, ink, 0.35) +
    txt(65, 1166, '02 / 本次创作标本', 12, ochre, 'letter-spacing="2"');
  if (assets.crop)
    b += box(64, 1188, 516, 164, '#fcf9f0') + renderPhoto(assets.crop, 71, 1195, 502, 150, 0.48);
  else b += txt(67, 1274, '取景尚未提交', 18, t.mid, serif);
  if (assets.poster)
    b += `<g transform="rotate(-3 688 1270)">${box(602, 1178, 168, 186, '#fcf9f0')}${renderPhoto(assets.poster, 608, 1184, 156, 174, 0.15)}</g>`;
  p.keywords.forEach((keyword, i) => {
    b += txt(807, 1220 + i * 31, keyword, 16, ink);
  });
  b +=
    rule(64, 1381, 966, 1381, ink, 0.35) +
    txt(65, 1410, '视觉气质为趣味解读 · 原作与原色见报告', 10, ink, 'opacity=".6"') +
    txt(
      964,
      1410,
      'DNA ' + s.id.slice(0, 6).toUpperCase(),
      11,
      ochre,
      'text-anchor="end" letter-spacing="1"',
    );
  return b;
}
function photobook(c: Context) {
  const { s, p, r, assets } = c,
    navy = '#192f3d',
    cream = '#f1eadc',
    red = '#bc654c',
    blue = '#aabfca';
  let b = box(0, 0, 1080, 1440, navy);
  b +=
    txt(62, 75, '审美 DNA', 25, cream, 'font-weight="600"') +
    txt(1019, 74, 'II. / A PRIVATE VIEW', 13, cream, 'text-anchor="end" letter-spacing="2"');
  b +=
    rule(62, 110, 1019, 110, cream, 0.35) +
    txt(64, 161, 'THE PHOTOGRAPHIC ISSUE', 11, blue, 'letter-spacing="4"');
  const title =
    p.label === '偏好集中型'
      ? ['熟悉的世界，', '再看深一点。']
      : p.label === '安静的编排者'
        ? ['安静地看，', '认真地改变。']
        : ['把世界，', '看慢一点。'];
  b += title
    .map((v, i) =>
      txt(54, 280 + i * 119, v, 94, cream, `${serif} font-weight="500" letter-spacing="-4"`),
    )
    .join('');
  b +=
    box(65, 452, 102, 6, red) +
    txt(1018, 462, 'TAKE YOUR OWN VIEW', 10, blue, 'text-anchor="end" letter-spacing="2"');
  b += txt(
    66,
    986,
    'FRAME / ' + (s.answers.q05?.type === 'crop' ? s.answers.q05.value.ratio : '待探索'),
    11,
    blue,
    'transform="rotate(-90 66 986)" letter-spacing="3"',
  );
  b += `<g transform="rotate(-1.5 600 759)">${box(128, 498, 902, 552, cream)}`;
  if (assets.crop) b += renderPhoto(assets.crop, 145, 515, 868, 496, 0.62);
  else b += txt(580, 789, '这一帧，还在等待你的目光。', 27, navy, `${serif} text-anchor="middle"`);
  b += txt(153, 1033, '01 / YOUR FRAME, YOUR POINT OF VIEW', 11, navy, 'letter-spacing="2"');
  b += '</g>';
  b += txt(1014, 1090, p.english, 11, blue, 'text-anchor="end" letter-spacing="2"');
  b += box(0, 1121, 1080, 319, cream) + box(0, 1121, 1080, 5, red);
  if (assets.poster)
    b += `<g transform="rotate(3 134 1272)">${box(61, 1161, 148, 197, '#fffdf6')}${renderPhoto(assets.poster, 68, 1168, 134, 183, 0.3)}</g>`;
  b +=
    txt(249, 1185, p.label, 22, navy, `${serif} font-weight="600"`) +
    paragraph(p.description, 249, 1228, 28, 20, 33, navy, 'opacity=".8"', 3);
  r.axes.slice(0, 3).forEach((a, i) => {
    const x = 249 + i * 255;
    b += txt(x, 1348, a.name, 10, red, 'letter-spacing="1"') + txt(x, 1375, a.label, 15, navy);
  });
  b +=
    rule(61, 1400, 1019, 1400, navy, 0.2) +
    txt(62, 1424, '视觉气质为趣味解读 / 原作与原色见报告', 10, navy, 'opacity=".6"') +
    txt(1018, 1424, 'DNA ' + s.id.slice(0, 6).toUpperCase(), 10, red, 'text-anchor="end"');
  return b;
}
function burst(cx: number, cy: number, outer: number, inner: number, color: string) {
  const points = Array.from({ length: 32 }, (_, i) => {
    const a = (i * Math.PI) / 16,
      r = i % 2 ? inner : outer;
    return `${cx + Math.cos(a) * r},${cy + Math.sin(a) * r}`;
  }).join(' ');
  return `<polygon points="${points}" fill="${color}"/>`;
}
function manifesto(c: Context) {
  const { s, p, r, t, assets, palette } = c,
    ink = t.ink,
    paper = t.paper,
    signal = t.accent;
  let b = box(0, 0, 1080, 1440, paper);
  b +=
    txt(59, 70, '审美 DNA', 26, ink, 'font-weight="700"') +
    txt(1020, 69, 'III. / EXPERIMENTAL EDITION', 12, ink, 'text-anchor="end" letter-spacing="1.6"');
  b +=
    rule(59, 108, 1020, 108, ink, 0.5) +
    txt(61, 155, 'MAKE ROOM FOR YOUR OWN IDEAS.', 12, ink, 'letter-spacing="3"');
  b +=
    burst(868, 315, 164, 130, signal) +
    txt(
      868,
      313,
      '偏心，',
      27,
      ink,
      `${serif} text-anchor="middle" font-weight="600" transform="rotate(10 868 315)"`,
    ) +
    txt(
      864,
      355,
      '出界。',
      27,
      ink,
      `${serif} text-anchor="middle" font-weight="600" transform="rotate(10 864 355)"`,
    );
  const word = c.locale === 'en' ? [] : ['想法', '不排队'];
  if (c.locale === 'en')
    b +=
      txt(
        46,
        375,
        'IDEAS',
        204,
        ink,
        `${sans} font-weight="900" letter-spacing="-10" transform="rotate(-3 400 300)"`,
      ) +
      txt(
        47,
        603,
        'OFF SCRIPT',
        143,
        ink,
        `${sans} font-weight="900" letter-spacing="-7" transform="rotate(2 500 500)"`,
      );
  word.forEach((line, row) => {
    Array.from(line).forEach((ch, i) => {
      const x = 48 + i * (row ? 188 : 230),
        y = 368 + row * 241;
      const rotation = [-3, 5, -4][i];
      b += txt(
        x,
        y,
        ch,
        row ? 206 : 232,
        ink,
        `${sans} font-weight="900" letter-spacing="-10" transform="rotate(${rotation} ${x + 100} ${y - 100})"`,
      );
    });
  });
  b +=
    rule(62, 675, 1018, 675, ink, 0.5) +
    txt(63, 713, p.label, 19, ink, 'font-weight="700" letter-spacing="2"');
  b += paragraph(p.description, c.locale === 'en' ? 400 : 300, 710, 27, 19, 31, ink, '', 3);
  b += `<g transform="rotate(-4 390 1000)">${box(48, 806, 700, 350, signal)}`;
  if (assets.crop) b += renderPhoto(assets.crop, 61, 819, 674, 324, 0.5);
  else b += txt(390, 1000, '你的目光，还在路上。', 28, ink, `${serif} text-anchor="middle"`);
  b += '</g>';
  b += `<g transform="rotate(7 880 982)">${box(753, 795, 276, 367, t.light)}`;
  if (assets.poster) b += renderPhoto(assets.poster, 765, 807, 252, 343, 0.58);
  else b += txt(890, 990, '表达待展开', 23, ink, `${serif} text-anchor="middle"`);
  b += '</g>';
  b +=
    txt(65, 1214, 'EXPRESS. EXPERIMENT. REPEAT.', 15, ink, 'letter-spacing="3"') +
    txt(
      1018,
      1214,
      palette === 'volt' ? 'HIGH VOLTAGE.' : 'FULL COLOUR.',
      12,
      ink,
      'text-anchor="end"',
    );
  r.axes.slice(0, 3).forEach((a, i) => {
    const x = 65 + i * 325;
    b +=
      rule(x, 1240, x + 283, 1240, ink, 0.5) +
      txt(x, 1275, a.name, 12, ink) +
      txt(x, 1311, a.label, 20, ink, 'font-weight="600"');
  });
  b +=
    rule(61, 1360, 1018, 1360, ink, 0.5) +
    txt(63, 1392, p.keywords.join(' / '), 14, ink, 'font-weight="600"') +
    txt(1018, 1392, 'DNA ' + s.id.slice(0, 6).toUpperCase(), 11, ink, 'text-anchor="end"');
  b += txt(
    63,
    1420,
    '视觉气质为趣味解读 · 图像为统一主调的演绎，原作原色见报告',
    10,
    ink,
    'opacity=".65"',
  );
  return b;
}
export function editorialCard(
  s: Session,
  assets: Assets,
  forced?: CardPalette,
  locale: Locale = 'zh',
) {
  const canonical = getCardProfile(s),
    p = {
      ...canonical,
      label: translate(locale, canonical.label),
      description:
        locale === 'en'
          ? ({
              偏好集中型:
                'Your choices share a clear rhythm. Your creations stayed close to their starting points. Try one step beyond the familiar.',
              主动实验型:
                'You changed your own work, not just your favorites. Your point of view is taking shape through action.',
              安静的编排者:
                'Restrained colors. Deliberate changes. Your quiet palette carries a point of view.',
              克制的秩序派:
                'Structure first. A few things worth keeping. Clear focus carries your expression.',
              有弹性的观察者:
                'Your preferences change with the scene. Stay flexible. Let the next creation make its own statement.',
              线索待展开:
                'There is more to discover. Let a few more choices shape your point of view.',
            }[canonical.label] ?? translate(locale, canonical.description))
          : canonical.description,
      keywords: canonical.keywords.map((k) => translate(locale, k)),
    },
    palette = forced ?? p.palette,
    c: Context = {
      locale,
      s,
      p,
      palette,
      t: CARD_PALETTES[palette],
      r: localizedReport(s, locale),
      assets,
    };
  const design =
    palette === 'slate'
      ? 'photobook'
      : palette === 'kinetic' || palette === 'volt'
        ? 'manifesto'
        : 'herbarium';
  const body =
    design === 'photobook' ? photobook(c) : design === 'manifesto' ? manifesto(c) : herbarium(c);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1440" viewBox="0 0 1080 1440" ${sans} data-design="${design}">${definitions(c)}${translateSVG(body, locale)}</svg>`;
}
