import { analyze, defaultCrop, defaultPalette, defaultPoster, type Session } from './core.ts';

export const CARD_PALETTES = {
  mist: {
    name: '雾灰',
    paper: '#e5e7e3',
    ink: '#303d3a',
    mid: '#8b9d94',
    light: '#f3f5f1',
    accent: '#bac8bf',
    rgb: [0.19, 0.24, 0.23],
  },
  moss: {
    name: '苔绿旧纸',
    paper: '#f3eee1',
    ink: '#233e32',
    mid: '#7e9274',
    light: '#fffaf0',
    accent: '#b37c50',
    rgb: [0.14, 0.24, 0.2],
  },
  slate: {
    name: '雾蓝砂岩',
    paper: '#f2efe8',
    ink: '#263f56',
    mid: '#839eac',
    light: '#fffcf5',
    accent: '#ae6e51',
    rgb: [0.15, 0.25, 0.34],
  },
  kinetic: {
    name: '亮粉',
    paper: '#ff70b4',
    ink: '#451537',
    mid: '#e93d91',
    light: '#ffd4e8',
    accent: '#eaff45',
    rgb: [0.27, 0.08, 0.22],
  },
  volt: {
    name: '荧光青柠',
    paper: '#deff4b',
    ink: '#234032',
    mid: '#8bb631',
    light: '#f2ffb4',
    accent: '#ff51a3',
    rgb: [0.14, 0.25, 0.2],
  },
} as const;
export type CardPalette = keyof typeof CARD_PALETTES;
export type CardProfile = {
  palette: CardPalette;
  dynamic: boolean;
  label: string;
  english: string;
  headline: [string, string];
  description: string;
  keywords: string[];
  reasons: string[];
  evidenceIds: string[];
  authored: number;
};

function hue(hex: string) {
  const [r, g, b] = hex
      .slice(1)
      .match(/../g)!
      .map((x) => parseInt(x, 16) / 255),
    max = Math.max(r, g, b),
    min = Math.min(r, g, b),
    d = max - min;
  return {
    h:
      d === 0
        ? 0
        : max === r
          ? 60 * (((g - b) / d) % 6)
          : max === g
            ? 60 * ((b - r) / d + 2)
            : 60 * ((r - g) / d + 4),
    s: max === 0 ? 0 : d / max,
  };
}

/** A visual expression rule, not a creativity or personality score. */
export function getCardProfile(s: Session): CardProfile {
  const r = analyze(s),
    a = r.axes[0],
    color = r.axes[1],
    density = r.axes[2];
  const c = s.answers.q05,
    p = s.answers.q08,
    poster = s.answers.q10;
  const authored: { fact: string; id: string }[] = [];
  if (c?.type === 'crop') {
    const d = defaultCrop(),
      v = c.value;
    if (
      v.frozen &&
      v.intent &&
      v.intent !== '凭感觉' &&
      (v.scene !== d.scene ||
        v.camera !== d.camera ||
        v.ratio !== d.ratio ||
        Math.abs(v.zoom - d.zoom) > 0.2 ||
        Math.abs(v.panX - d.panX) > 0.1 ||
        Math.abs(v.panY - d.panY) > 0.1)
    )
      authored.push({ fact: `你调整了取景，并明确想要「${v.intent}」。`, id: 'q05-crop' });
  }
  if (p?.type === 'palette') {
    const d = defaultPalette(),
      v = p.value;
    if (
      v.colors.some((v, i) => v.toLowerCase() !== d.colors[i]) ||
      v.areas.some((v, i) => Math.abs(v - d.areas[i]) >= 10)
    )
      authored.push({ fact: '你改动了配色或颜色面积，而不只保留起始方案。', id: 'q08-palette' });
  }
  if (poster?.type === 'poster') {
    const d = defaultPoster(),
      v = poster.value;
    if (
      (v.custom && v.layout !== 0) ||
      Math.abs(v.x - d.x) > 0.08 ||
      Math.abs(v.y - d.y) > 0.08 ||
      Math.abs(v.size - d.size) > 15 ||
      v.align !== d.align ||
      v.serif !== d.serif
    )
      authored.push({ fact: '你主动改动了海报的布局、标题位置或字体关系。', id: 'q10-poster' });
  }
  const directions = r.axes.slice(0, 3).filter((x) => x.count >= 2),
    choiceIds = directions.flatMap((x) => x.evidence.map((e) => e.id));
  const repeatedQuiet = color.count >= 2 && !color.mixed && color.score < 0;
  const repeatedVivid = color.count >= 2 && !color.mixed && color.score > 0;
  const concentrated = directions.length >= 2 && directions.every((x) => !x.mixed);
  const customColors =
    p?.type === 'palette' && authored.some((a) => a.id === 'q08-palette') ? p.value.colors : [];
  const authoredVivid = customColors.filter((c) => hue(c).s > 0.55).length >= 2;
  const dynamic =
    authored.length >= 2 &&
    (repeatedVivid || authoredVivid || (a.count >= 2 && !a.mixed && a.score > 0));
  const hasCreativeContext = [c, p, poster].filter((a) => a && a.type !== 'skip').length >= 2;
  let palette: CardPalette = 'mist';
  if (dynamic) {
    const lead = customColors[0],
      h = lead ? hue(lead).h : 330;
    palette = h >= 45 && h < 170 ? 'volt' : 'kinetic';
  } else if (customColors.length) {
    const h = hue(customColors[0]),
      d = h.h < 0 ? h.h + 360 : h.h;
    palette =
      h.s < 0.14 ? 'mist' : d >= 175 && d < 275 ? 'slate' : d >= 55 && d < 175 ? 'moss' : 'mist';
  } else if (color.evidence.filter((e) => e.fact.includes('清透冷调')).length >= 2)
    palette = 'slate';
  else if (repeatedQuiet) palette = 'moss';
  const base: CardProfile = {
    palette,
    dynamic,
    label: '线索待展开',
    english: 'STILL UNFOLDING',
    headline: ['还没看够。', '再给点线索。'],
    description: '暂时不替你下定义。让更多选择，慢慢组成你的表达。',
    keywords: ['继续看', '慢慢选'],
    reasons: [],
    evidenceIds: [],
    authored: authored.length,
  };
  if (choiceIds.length < 3)
    return {
      ...base,
      palette: 'mist',
      dynamic: false,
      reasons: ['目前跨题方向线索较少，先用中性雾灰呈现，不推断探索程度。'],
    };
  let result: CardProfile;
  if (dynamic)
    result = {
      ...base,
      label: '主动实验型',
      english: 'MAKE SOME NOISE',
      headline: ['不必收敛。', '让偏心发光。'],
      description: '你没有停在选喜欢的画面，也主动改变了自己的作品。表达，开始有了你的动作。',
      keywords: ['主动改造', palette === 'volt' ? '高能荧光' : '亮粉出场', '表达有动作'],
    };
  else if (concentrated && authored.length === 0 && hasCreativeContext)
    result = {
      ...base,
      label: '偏好集中型',
      english: 'THE COMFORT ZONE',
      headline: ['偏爱熟悉。', '暂不冒险。'],
      description:
        '这次的选择很集中，创作也较多保留起始方案。你的舒适区清楚，下一步可以试一次越界。',
      keywords: ['偏好集中', '稳定取舍', '探索待展开'],
    };
  else if (repeatedQuiet && authored.length >= 2)
    result = {
      ...base,
      label: '安静的编排者',
      english: 'QUIETLY, ON PURPOSE',
      headline: ['看起来安静。', '想法在越界。'],
      description: '你偏爱克制的颜色，却也主动调整了作品。低声量是一种表达，不等于没有自己的想法。',
      keywords: ['克制用色', '主动取舍', '安静有主张'],
    };
  else if (a.count >= 2 && !a.mixed && a.score < 0)
    result = {
      ...base,
      label: '克制的秩序派',
      english: 'LESS, WITH INTENT',
      headline: ['不声张。', '也有立场。'],
      description: '你让结构先站稳，再决定什么值得留下。清楚的重点，比把画面填满更能说服你。',
      keywords: [
        '秩序感',
        density.score < 0 ? '留白意识' : '关系优先',
        authored.length ? '主动取舍' : '偏好清楚',
      ],
    };
  else
    result = {
      ...base,
      label: '有弹性的观察者',
      english: 'A TASTE OF YOUR OWN',
      headline: ['不急着定型。', '先按自己的来。'],
      description: '你的偏爱会随场景变化。保留一些弹性，再让下一件作品说得更明确。',
      keywords: ['情境切换', '保持弹性', '表达待展开'],
    };
  const reasons = [...authored.map((a) => a.fact)];
  if (repeatedQuiet)
    reasons.unshift(
      '多道色彩题中，你都选择了较克制的方向，因此以低饱和主色为核心，加入纸白和少量暖色。',
    );
  else if (repeatedVivid) reasons.unshift('多道色彩题中，你都选择了较鲜明的方向。');
  if (dynamic)
    reasons.push('至少两项创作发生主动改动，并结合鲜明用色或自由编排，采用更有张力的视觉。');
  else if (concentrated && authored.length === 0 && hasCreativeContext)
    reasons.push(
      '方向选择较集中，已提交的创作中尚未观察到明显改动；这描述本次行为，不判断创造力。',
    );
  else reasons.push('目前用较安静的统一色系呈现，保持明确重点，不把色彩声量当作能力等级。');
  return { ...result, reasons, evidenceIds: [...choiceIds, ...authored.map((a) => a.id)] };
}
