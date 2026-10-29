import { photoSource } from './photoScenarios.ts';
import { editorialCard } from './cardDesigns.ts';
import { CARD_PALETTES, type CardPalette } from './cardProfile.ts';
import type { VisualChoice } from './content.ts';
import { cropRect, type Crop, type Palette, type Poster, type Session } from './core.ts';
import { translateSVG, type Locale } from './i18n/translate.ts';
export const esc = (s: string) =>
  s.replace(
    /[<>&"']/g,
    (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' })[c]!,
  );
const font = `font-family="'Noto Sans CJK SC','Noto Sans CJK TC',sans-serif"`;
export function svg(w: number, h: number, body: string, viewBox = `0 0 ${w} ${h}`) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="${viewBox}" ${font}>${body}</svg>`;
}
export const uri = (s: string) => 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(s);
const rect = (x: number, y: number, w: number, h: number, fill: string, extra = '') =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" ${extra}/>`;
const text = (x: number, y: number, s: string, size = 20, fill = '#244b3e', extra = '') =>
  `<text x="${x}" y="${y}" font-size="${size}" fill="${fill}" ${extra}>${esc(s)}</text>`;
export function streetBody() {
  return `
<defs><linearGradient id="wall" x2="1" y2="1"><stop stop-color="#e5cfad"/><stop offset="1" stop-color="#ceb690"/></linearGradient><linearGradient id="window" x2="1" y2="1"><stop stop-color="#466458"/><stop offset="1" stop-color="#182f2a"/></linearGradient></defs>
${rect(0, 0, 1200, 900, '#d7ddce')}${rect(0, 120, 1200, 650, 'url(#wall)')}${rect(0, 745, 1200, 155, '#b5b29e')}
<path d="M0 120H1200V250L0 610Z" fill="#f3e3c5" opacity=".62"/>
${rect(0, 120, 1200, 20, '#ddd1b5')}${rect(0, 700, 1200, 45, '#9b9b82')}
${rect(70, 235, 410, 465, '#a5ab92')}${rect(90, 250, 370, 450, 'url(#window)')}
<path d="M90 250H460L90 630Z" fill="#72917a" opacity=".36"/>
${rect(264, 250, 13, 450, '#a5ab92')}${rect(90, 437, 370, 12, '#a5ab92')}
${rect(575, 210, 390, 490, '#506651')}${rect(594, 233, 352, 467, 'url(#window)')}
${rect(763, 233, 14, 467, '#87927a')}${rect(594, 414, 352, 12, '#87927a')}
${rect(1004, 250, 142, 215, '#a5ab92')}${rect(1016, 262, 118, 191, '#4d6657')}
${rect(1016, 350, 118, 8, '#a5ab92')}${rect(1071, 262, 8, 191, '#a5ab92')}
<path d="M540 175H1000L1020 223H520Z" fill="#b66447"/>
${text(770, 206, 'S L O W   C O R N E R', 23, '#fff3d7', 'text-anchor="middle"')}
${rect(650, 465, 235, 53, '#e4d5b2')}${text(767, 498, 'COFFEE & DAYS', 19, '#374f3e', 'text-anchor="middle"')}
<path d="M770 745L1050 900H1190L925 745Z" fill="#858f7b" opacity=".6"/>
<ellipse cx="448" cy="790" rx="138" ry="23" fill="#8e9b83" opacity=".5"/>
<circle cx="438" cy="532" r="30" fill="#c39b76"/><path d="M407 521Q415 479 445 497L467 515L455 520Z" fill="#353d34"/>
<path d="M405 571Q440 549 467 578L484 691L394 691Z" fill="#b66a49"/>
<path d="M410 688L439 688L434 781L408 781ZM448 688L475 688L483 781L458 781Z" fill="#344940"/>
<path d="M405 779H437V794H390ZM458 779H484L497 794H457Z" fill="#3b3c33"/>
<path d="M405 581L382 654M467 582L486 647" stroke="#b66a49" stroke-width="17" stroke-linecap="round"/>
${rect(359, 632, 39, 49, '#e0d7bc', 'rx="4"')}
<ellipse cx="794" cy="678" rx="117" ry="23" fill="#d7c39c"/><path d="M790 695V805M710 805H865" stroke="#4e6151" stroke-width="11"/>
<path d="M925 684V805M908 718H990M988 682V805M920 686H990" stroke="#647360" stroke-width="8" fill="none"/>
${rect(765, 644, 20, 30, '#f0e5ce', 'rx="3"')}<path d="M783 650Q804 649 797 663L784 665" fill="none" stroke="#f0e5ce" stroke-width="4"/>
${rect(111, 668, 60, 99, '#aa7253')}<path d="M141 681V540M142 608Q75 577 83 533Q134 537 143 584M142 639Q206 597 199 559Q150 567 142 615" fill="#627b51" stroke="#627b51" stroke-width="8"/>
<path d="M0 844L1200 810M0 895L1200 862" stroke="#9b9f8c" stroke-width="2"/>
`;
}
export const streetSVG = () => svg(1200, 900, streetBody());
export function cropSVG(c: Crop) {
  const r = cropRect(c);
  const source = photoSource(c);
  const body = source
    ? `<image href="${source}" x="0" y="0" width="1200" height="900" preserveAspectRatio="none"/>`
    : streetBody();
  return svg(Math.round((1000 * r.w) / r.h), 1000, body, `${r.x} ${r.y} ${r.w} ${r.h}`);
}
function room(loud: boolean) {
  const p = loud
    ? ['#e4b281', '#ac4e41', '#5374a0', '#d6a83f']
    : ['#e4decc', '#a3aa91', '#6d8168', '#c2b08a'];
  return `${rect(0, 0, 600, 760, p[0])}${rect(0, 530, 600, 230, p[3])}${rect(70, 70, 280, 330, '#ede8d8')}<path d="M90 90H330V380H90Z" fill="#cbd7c7"/><path d="M210 90V380M90 235H330" stroke="#fcf7e9" stroke-width="12"/><path d="M0 530L600 760H0Z" fill="#efe7cd" opacity=".35"/>${rect(300, 330, 245, 240, p[1], 'rx="30"')}${rect(270, 430, 290, 105, p[1], 'rx="15"')}${rect(300, 540, 15, 70, '#554f40')}${rect(510, 540, 15, 70, '#554f40')}${rect(318, 350, 90, 83, p[2], 'rx="10"')}<ellipse cx="190" cy="580" rx="92" ry="25" fill="#f5e7ca"/>${rect(182, 590, 15, 100, '#7f6e50')}${rect(420, 120, 70, 140, p[2])}${text(50, 712, 'A PLACE TO SLOW DOWN', 16, '#464f42')}`;
}
function building(free: boolean) {
  let s =
    rect(0, 0, 600, 760, '#d9dfd0') +
    `<circle cx="450" cy="140" r="65" fill="#f6e6bd"/>` +
    rect(50, 150, 500, 550, '#d2c3a4');
  for (let r = 0; r < 5; r++)
    for (let c = 0; c < 4; c++)
      s +=
        rect(
          87 + c * 122 + (free ? (r % 2 ? 18 : -12) : 0),
          195 + r * 95 + (free ? (c % 2 ? 12 : -5) : 0),
          65,
          58,
          '#395d50',
        ) +
        rect(
          87 + c * 122 + (free ? (r % 2 ? 18 : -12) : 0),
          243 + r * 95 + (free ? (c % 2 ? 12 : -5) : 0),
          65,
          10,
          '#98a68e',
        );
  return (
    s + rect(0, 700, 600, 60, '#a9b49b') + text(48, 735, 'STUDIES IN ARCHITECTURE', 14, '#355344')
  );
}
function cover(dense: boolean) {
  let s =
    rect(0, 0, 600, 760, '#efe7d5') +
    text(40, 95, 'STILL', 78, '#244b3e', 'font-family="serif"') +
    text(44, 127, 'A JOURNAL OF EVERYDAY THINGS', 13);
  s += `<circle cx="300" cy="365" r="${dense ? 170 : 110}" fill="#9baf91"/><path d="M210 530L300 270L405 530Z" fill="#d8956b"/>`;
  if (dense) {
    for (let i = 0; i < 5; i++)
      s += text(
        35,
        200 + i * 36,
        [
          'Objects, spaces, & quiet moments',
          'THE WAY WE LIVE',
          'A different kind of ordinary',
          'NOTES FROM A SLOW MORNING',
          'Form follows feeling',
        ][i],
        17,
      );
    s += rect(430, 470, 135, 170, '#456350') + text(45, 622, 'COLLECTING THE EVERYDAY', 23);
  }
  return s + text(42, 703, 'ISSUE 07', 15) + text(445, 703, '2026', 15);
}
export function outfitBody(item = 0, loud = false, coat = false) {
  const base = loud ? '#a94942' : '#c5bda5',
    pants = loud ? '#3a68a0' : '#667464';
  return `${rect(0, 0, 600, 760, '#e9e5d9')}<ellipse cx="300" cy="691" rx="207" ry="17" fill="#d2cdbd"/>
<path d="${coat ? 'M196 120L260 96L340 96L402 120L455 372L388 390L365 267L370 442L230 442L235 267L211 390L145 372Z' : 'M200 135L260 105H340L400 135L456 300L400 329L362 239V396H238V239L200 329L144 300Z'}" fill="${base}"/>
<path d="M260 105L300 164L340 105M300 164V395" fill="none" stroke="#f2ead8" stroke-width="5"/>
<path d="M248 424H352L373 659H315L300 495L285 659H227Z" fill="${pants}"/>
<path d="M226 664H284V695H202Q193 679 226 664ZM316 664H373L397 691H315Z" fill="${item === 3 ? '#a56948' : '#444c42'}"/>
${item === 1 ? `<path d="M266 123Q295 184 335 125L352 287L320 302L293 190L265 286L237 267Z" fill="#c37a4b"/>` : ''}
${rect(422, 418, 107, 100, item === 2 ? '#517b9b' : '#b89a6f', 'rx="12"')}<path d="M443 425V393Q477 366 509 393V425" fill="none" stroke="${item === 2 ? '#3c5e78' : '#8c7555'}" stroke-width="10"/>${text(40, 735, 'THE EVERYDAY EDIT', 15)}`;
}
function coatArt(soft: boolean) {
  return (
    rect(0, 0, 600, 760, '#e8e4d8') +
    `<path d="${soft ? 'M211 130Q260 108 300 122Q345 105 389 135Q434 213 463 424L399 437L369 304Q376 458 351 610Q302 627 247 611Q226 465 232 302L203 437L137 418Q163 205 211 130Z' : 'M210 130L267 107H333L390 130L450 420L390 440L360 280V610H240V280L210 440L150 420Z'}" fill="#7a8a70"/><path d="M267 110L300 184L333 110M300 184V605" fill="none" stroke="#b9bda6" stroke-width="6"/><path d="M249 400H281M319 400H351" stroke="#b9bda6" stroke-width="6"/>` +
    text(42, 715, 'A STUDY IN SILHOUETTE', 16)
  );
}
function texture(raw: boolean) {
  let s =
    rect(0, 0, 600, 760, '#e5dfd0') +
    `<ellipse cx="300" cy="638" rx="170" ry="25" fill="#c9c6b5"/><path d="M208 249Q190 190 245 160H355Q413 190 390 249L407 553Q400 645 300 650Q200 644 193 553Z" fill="#c6b59b"/><ellipse cx="300" cy="165" rx="55" ry="17" fill="#8e8069"/>`;
  if (raw)
    for (let i = 0; i < 155; i++) {
      const x = 210 + ((i * 37) % 181),
        y = 200 + ((i * 73) % 410);
      s += `<path d="M${x} ${y}l${6 + (i % 11)} ${(i % 3) - 1}" stroke="${i % 2 ? '#ad9d83' : '#d6c8ae'}" stroke-width="${2 + (i % 3)}"/>`;
    }
  else
    s += `<path d="M250 240Q225 395 251 565" stroke="#ded0b5" stroke-width="20" fill="none" opacity=".7"/>`;
  return s + text(42, 719, 'MATERIAL / OBJECT / FEELING', 15);
}
function courtyard(dense: boolean) {
  let s =
    rect(0, 0, 600, 760, '#dfdccb') +
    rect(65, 70, 470, 570, '#b7bda5') +
    `<path d="M0 760L200 420H400L600 760Z" fill="#d5c5a7"/>` +
    rect(180, 120, 240, 340, '#e7deca') +
    `<path d="M225 460V265A75 75 0 0 1 150 0V460Z" fill="#506951"/>` +
    rect(465, 430, 45, 115, '#b08360') +
    `<path d="M487 436V300M487 355Q436 322 446 284Q478 294 487 337M487 377Q539 345 532 306Q501 321 487 360" fill="#78895d" stroke="#78895d" stroke-width="6"/>`;
  if (dense) {
    for (let i = 0; i < 5; i++)
      s +=
        rect(75 + i * 90, 585 + (i % 2) * 45, 64, 52, '#b7a282') +
        `<path d="M${106 + i * 90} ${585 + (i % 2) * 45}v-90m0 50q-45-55-35-73m35 70q40-60 35-82" fill="none" stroke="#6b835a" stroke-width="11"/>`;
    s += rect(78, 180, 67, 115, '#7c927a') + rect(462, 190, 47, 90, '#7c927a');
  }
  return s + text(43, 725, 'ROOM FOR A MOMENT', 16);
}
function pairSVGCanonical(kind: string, side: VisualChoice) {
  const b = side === 'b';
  let body = '';
  if (kind === 'room') body = room(b);
  else if (kind === 'building') body = building(b);
  else if (kind === 'cover') body = cover(b);
  else if (kind === 'fashion') body = outfitBody(0, b);
  else if (kind === 'coat') body = coatArt(b);
  else if (kind === 'texture') body = texture(b);
  else if (kind === 'courtyard') body = courtyard(b);
  else if (kind === 'warmup') body = b ? cover(false) : room(false);
  else if (kind === 'balance') {
    body =
      rect(0, 0, 600, 760, '#e7e0cd') +
      rect(0, 570, 600, 190, '#bec7ad') +
      `<circle cx="${b ? 430 : 180}" cy="390" r="110" fill="#c17a54"/><path d="M90 120H510M90 650H510" stroke="#536a51" stroke-width="2"/>` +
      text(42, 713, b ? 'AFTER' : 'BEFORE', 15);
  } else if (kind === 'hierarchy')
    body =
      rect(0, 0, 600, 760, '#e6ddc7') +
      text(55, 190, 'SLOW CINEMA', b ? 62 : 34) +
      text(55, 360, '11.14 / 19:30', b ? 25 : 34) +
      text(55, 470, 'CORNER THEATRE', b ? 20 : 34) +
      `<circle cx="435" cy="635" r="60" fill="#a7b193"/>`;
  else if (kind === 'final') {
    const p = b ? ['#f1c348', '#b43c40', '#254db1'] : ['#e2d9c5', '#718371', '#4b6357'];
    body =
      rect(0, 0, 600, 760, p[0]) +
      text(40, 92, 'AFTER HOURS', 55, p[2]) +
      `<circle cx="300" cy="380" r="176" fill="${p[1]}"/>` +
      rect(175, 310, 250, 230, p[2]) +
      text(40, 690, 'A LITTLE MUSIC, A LITTLE LONGER.', 17, p[2]);
  } else {
    body =
      rect(0, 0, 600, 760, '#e7e3d5') +
      text(
        b ? 42 : 48,
        b ? 140 : 110,
        'SLOW',
        90,
        '#244b3e',
        b ? 'transform="rotate(-9 42 140)"' : '',
      ) +
      text(
        b ? 190 : 48,
        b ? 232 : 203,
        'CINEMA',
        76,
        '#244b3e',
        b ? 'transform="rotate(9 190 232)"' : '',
      ) +
      `<circle cx="${b ? 195 : 390}" cy="405" r="143" fill="#b87952"/>` +
      rect(
        b ? 250 : 70,
        b ? 320 : 380,
        230,
        210,
        '#8c9a7b',
        b ? 'transform="rotate(-13 365 425)"' : '',
      ) +
      text(48, 659, '城市短片放映夜', 25) +
      text(48, 709, '11.14 / CORNER THEATRE', 16);
  }
  if (['room', 'fashion', 'final'].includes(kind)) {
    const variants = [
      ['#eee6d6', '#647866', '#b9b58e', '#d1c6b0'],
      ['#e1eaf9', '#718ac0', '#a9c5c7', '#bfcfe4'],
      ['#ffe2a8', '#df6b37', '#8d4166', '#f2b842'],
      ['#ffd94c', '#ff486c', '#3453ef', '#b4dd39'],
    ];
    const index = 'abcd'.indexOf(side),
      p = variants[index];
    if (kind === 'room')
      body = room(false)
        .replaceAll('#e4decc', p[0])
        .replaceAll('#a3aa91', p[1])
        .replaceAll('#6d8168', p[2])
        .replaceAll('#c2b08a', p[3]);
    if (kind === 'fashion')
      body = outfitBody(0, false)
        .replaceAll('#e9e5d9', p[0])
        .replaceAll('#c5bda5', p[1])
        .replaceAll('#667464', p[2]);
    if (kind === 'final')
      body =
        rect(0, 0, 600, 760, p[0]) +
        text(40, 92, 'AFTER HOURS', 55, p[2]) +
        `<circle cx="300" cy="380" r="176" fill="${p[1]}"/>` +
        rect(175, 310, 250, 230, p[2]) +
        text(40, 690, 'A LITTLE MUSIC, A LITTLE LONGER.', 17, p[2]);
  }
  if (kind === 'poster')
    body = body
      .replaceAll('#e7e3d5', '#fff0ce')
      .replaceAll('#244b3e', '#3453ef')
      .replaceAll('#b87952', '#ff6c4d')
      .replaceAll('#8c9a7b', '#d5ea67');
  return svg(600, 760, body);
}
function paletteSVGCanonical(p: Palette) {
  let x = 0;
  const bands = p.colors
    .map((c, i) => {
      const w = (900 * p.areas[i]) / 100;
      const t = rect(x, 0, w, 750, c);
      x += w;
      return t;
    })
    .join('');
  return svg(
    900,
    1100,
    bands +
      rect(0, 750, 900, 350, '#fffdf7') +
      text(56, 810, 'A COLOR NOTE / JUST YOUR TYPE', 15, '#62708a') +
      text(56, 870, (p.name || '我的三色片段').slice(0, 24), 34, '#222a45') +
      p.colors
        .map(
          (c, i) =>
            `<circle cx="${67 + i * 280}" cy="962" r="11" fill="${c}"/>` +
            text(92 + i * 280, 970, c.toUpperCase(), 22, '#222a45') +
            text(56 + i * 280, 1038, p.areas[i] + '%', 34, '#222a45'),
        )
        .join(''),
  );
}
function posterSVGCanonical(p: Poster) {
  const [bg, fg, accent] = p.colors;
  const x = p.x * 600,
    y = p.y * 800;
  const family = p.serif ? 'serif' : 'sans-serif';
  return svg(
    600,
    800,
    rect(0, 0, 600, 800, bg) +
      `<circle cx="${p.layout === 2 ? 260 : 420}" cy="${p.layout === 1 ? 350 : 445}" r="145" fill="${accent}"/><path d="M${p.layout === 2 ? 100 : 210} 410L415 620H115Z" fill="${fg}" opacity=".78"/>` +
      text(45, 57, 'AN EVENING AT THE CORNER', 12, fg) +
      text(
        x,
        y,
        '慢一拍',
        p.size,
        fg,
        `text-anchor="${p.align}" font-family="${family}" font-weight="600"`,
      ) +
      text(45, 685, '城市短片放映夜', 27, fg) +
      text(45, 736, '11.14  19:30', 18, fg) +
      text(555, 736, '转角放映室', 17, fg, 'text-anchor="end"') +
      `<path d="M45 760H555" stroke="${fg}"/>`,
  );
}
export const outfitSVG = (item: number) => svg(600, 760, outfitBody(item));
export function luminance(hex: string) {
  const a = hex
    .replace('#', '')
    .match(/.{2}/g)!
    .map((x) => parseInt(x, 16) / 255)
    .map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
}
export function contrast(a: string, b: string) {
  const x = luminance(a),
    y = luminance(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}
export const CARD_THEMES = CARD_PALETTES;
export type CardTheme = CardPalette;
export function shareSVG(s: Session, theme?: CardTheme, locale: Locale = 'zh') {
  return editorialCard(
    s,
    {
      crop: s.answers.q05?.type === 'crop' ? cropSVG(s.answers.q05.value) : undefined,
      poster: s.answers.q10?.type === 'poster' ? posterSVG(s.answers.q10.value, locale) : undefined,
    },
    theme,
    locale,
  );
}

export function pairSVG(kind: string, side: VisualChoice, locale: Locale = 'zh') {
  return translateSVG(pairSVGCanonical(kind, side), locale);
}
export function paletteSVG(p: Palette, locale: Locale = 'zh') {
  return translateSVG(paletteSVGCanonical(p), locale);
}
export function posterSVG(p: Poster, locale: Locale = 'zh') {
  return translateSVG(posterSVGCanonical(p), locale);
}
