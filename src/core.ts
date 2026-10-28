import {
  AXES,
  COLOR_STORIES,
  COLOR_VARIANTS,
  QUESTIONS,
  type Axis,
  type VisualChoice,
} from './content.ts';
import { POSTERS } from './posters.ts';
export type Crop = {
  ratio: string;
  zoom: number;
  panX: number;
  panY: number;
  intent: string;
  frozen: boolean;
};
export type Palette = { colors: string[]; areas: number[]; name: string };
export type Poster = {
  layout: number;
  x: number;
  y: number;
  size: number;
  align: 'start' | 'middle' | 'end';
  serif: boolean;
  colors: string[];
  custom: boolean;
};
export type Answer =
  | { type: 'pair'; value: VisualChoice | 'both' | 'neither' }
  | { type: 'archive'; value: { ids: string[]; why: string } }
  | { type: 'crop'; value: Crop }
  | { type: 'palette'; value: Palette }
  | { type: 'poster'; value: Poster }
  | { type: 'outfit'; value: { item: number; reason: string } }
  | { type: 'observe'; value: number }
  | { type: 'skip' };
export interface Session {
  id: string;
  version: 1;
  analysisVersion: number;
  questionSetVersion?: number;
  createdAt: string;
  step: number;
  done: boolean;
  flips: boolean[];
  answers: Record<string, Answer>;
  drafts?: Record<string, Answer>;
  legacyAnswers?: Record<string, Answer>;
  versionNotice?: string;
}
export interface Evidence {
  id: string;
  questionId: string;
  fact: string;
  axis?: Axis;
  value?: number;
  domain?: string;
}
export interface Claim {
  title: string;
  text: string;
  evidenceIds: string[];
}
export const defaultCrop = (): Crop => ({
  ratio: '4:3',
  zoom: 1.2,
  panX: 0.5,
  panY: 0.5,
  intent: '',
  frozen: false,
});
export const defaultPalette = (): Palette => ({
  colors: [...COLOR_STORIES[0].colors],
  areas: [60, 30, 10],
  name: '我的三色片段',
});
export const defaultPoster = (colors = defaultPalette().colors): Poster => ({
  layout: 0,
  x: 0.12,
  y: 0.25,
  size: 98,
  align: 'start',
  serif: true,
  colors: [...colors],
  custom: false,
});
export function newSession(): Session {
  return {
    id: crypto.randomUUID(),
    version: 1,
    analysisVersion: 2,
    questionSetVersion: 2,
    createdAt: new Date().toISOString(),
    step: 0,
    done: false,
    flips: QUESTIONS.map(() => Math.random() > 0.5),
    answers: {},
    drafts: {},
  };
}
export function upgradeSession(s: Session): Session {
  if ((s.questionSetVersion ?? 1) >= 2) return s;
  const map = (a: Record<string, Answer>) =>
    Object.fromEntries(
      Object.entries(a)
        .filter(([id]) => id !== 'q01')
        .map(([id, v]) => [
          id,
          ['q03', 'q07', 'q16'].includes(id) && v.type === 'pair' && v.value === 'b'
            ? { ...v, value: 'd' as const }
            : v,
        ]),
    );
  return {
    ...s,
    analysisVersion: 2,
    questionSetVersion: 2,
    answers: map(s.answers),
    drafts: map(s.drafts ?? {}),
    legacyAnswers: { ...s.answers },
    versionNotice: '你的旧作品已保留。新版加入真实海报与四种色彩选项，可以回看并补做第一题。',
  };
}
export const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));
export function cropRect(c: Crop) {
  const [a, b] = c.ratio.split(':').map(Number),
    ratio = a / b;
  const w = Math.min(1200, 900 * ratio) / clamp(c.zoom, 1, 4),
    h = w / ratio;
  return { x: (1200 - w) * clamp(c.panX, 0, 1), y: (900 - h) * clamp(c.panY, 0, 1), w, h };
}
export function extract(s: Session): Evidence[] {
  const e: Evidence[] = [];
  for (const q of QUESTIONS) {
    const a = s.answers[q.id];
    if (!a || a.type === 'skip') continue;
    if (a.type === 'pair' && q.axis && ['a', 'b', 'c', 'd'].includes(a.value)) {
      const variant = COLOR_VARIANTS.find((v) => v.id === a.value),
        v = q.colorVariants ? (variant?.value ?? 0) : a.value === 'a' ? -1 : 1,
        axis = AXES[q.axis];
      e.push({
        id: q.id + '-choice',
        questionId: q.id,
        axis: q.axis,
        value: v,
        domain: q.domain,
        fact: `你在「${q.title}」中选择了${q.colorVariants ? `「${variant?.label}」` : `更${v < 0 ? axis.left : axis.right}`}的版本。`,
      });
    }
    if (a.type === 'archive')
      e.push({
        id: q.id + '-archive',
        questionId: q.id,
        fact: `你想挂起${a.value.ids.map((id) => `《${POSTERS.find((p) => p.id === id)?.title ?? id}》`).join('、')}${a.value.why ? `，最吸引你的是「${a.value.why}」` : ''}。这只是整张作品的偏好，不计为单一色彩或构图能力。`,
      });
    if (a.type === 'crop') {
      const r = cropRect(a.value);
      e.push({
        id: q.id + '-crop',
        questionId: q.id,
        fact: `你使用 ${a.value.ratio} 画幅，保留原场景约 ${Math.round(((r.w * r.h) / 1080000) * 100)}% 的面积${a.value.intent ? `，想要「${a.value.intent}」` : ''}。`,
      });
    }
    if (a.type === 'palette')
      e.push({
        id: q.id + '-palette',
        questionId: q.id,
        fact: `你为「安静但不无聊」分配了 ${a.value.areas.join(' / ')} 的三色面积。`,
      });
    if (a.type === 'poster') {
      e.push({
        id: q.id + '-poster',
        questionId: q.id,
        fact: `海报保留了活动名、日期与地点；你采用了${a.value.serif ? '衬线' : '无衬线'}标题与${['左', '中', '右'][['start', 'middle', 'end'].indexOf(a.value.align)]}对齐。`,
      });
      if (a.value.custom)
        e.push({
          id: q.id + '-layout',
          questionId: q.id,
          axis: 'order',
          value: a.value.layout === 2 ? 1 : -1,
          domain: '主动排版',
          fact: `你主动选择了${['规则网格', '偏心排版', '自由叠放'][a.value.layout]}作为海报结构。`,
        });
    }
    if (a.type === 'outfit')
      e.push({
        id: q.id + '-outfit',
        questionId: q.id,
        fact: `你${['保留原搭配', '换上了暖色围巾', '换上了蓝色挎包', '换上了棕色鞋履'][a.value.item]}，理由是「${a.value.reason}」。`,
      });
    if (a.type === 'observe')
      e.push({
        id: q.id + '-observe',
        questionId: q.id,
        fact: `本题${a.value === q.correct ? '识别出了主要变化' : a.value === 3 ? '选择了不确定' : '选择了另一种解释'}。${q.id === 'q14' ? '两图只移动了主体的位置。' : '两图只改变了文字字号层级。'}`,
      });
  }
  return e;
}
export function analyze(s: Session) {
  const evidence = extract(s);
  const axes = (Object.keys(AXES) as Axis[]).map((id) => {
    const es = evidence.filter((e) => e.axis === id);
    const negatives = es.filter((e) => (e.value ?? 0) < 0).length,
      positives = es.length - negatives;
    const mixed = negatives > 0 && positives > 0;
    return {
      id,
      ...AXES[id],
      count: es.length,
      score: es.length ? es.reduce((n, e) => n + (e.value ?? 0), 0) / es.length : 0,
      mixed,
      label:
        es.length === 0
          ? '待探索'
          : mixed
            ? '两端都有选择'
            : es.length === 1
              ? `这次选择${negatives ? AXES[id].left : AXES[id].right}`
              : `${es.length < 3 ? '初步' : ''}偏向${negatives ? AXES[id].left : AXES[id].right}`,
      evidence: es,
    };
  });
  const order = axes[0],
    color = axes[1],
    density = axes[2];
  let title = '你的偏好，还在展开。',
    signature = '保持好奇的观察者';
  if (color.mixed && color.count >= 2) {
    title = '你的眼光，会随场景换挡。';
    signature = '随境而变的探索者';
  } else if (color.count >= 2 && color.score > 0.5) {
    title = '你的画面，总有一点不肯安静。';
    signature = '颜色里的冒险家';
  } else if (
    density.count >= 2 &&
    density.score < -0.5 &&
    s.answers.q05?.type === 'crop' &&
    s.answers.q05.value.intent === '保留现场故事'
  ) {
    title = '你把留白，留给了故事。';
    signature = '留白里的叙事者';
  } else if (order.count >= 2 && order.score < -0.5) {
    title = '你看世界，自有一套秩序。';
    signature = '有章法的漫游者';
  } else if (density.count >= 2 && density.score > 0.5) {
    title = '你的眼睛，喜欢多留一点。';
    signature = '细节的收藏家';
  } else if (order.count >= 2 && order.score > 0.5) {
    title = '你喜欢给画面，一点意外。';
    signature = '自由编排的探索者';
  }
  const titleEvidence =
    title.includes('颜色') || title.includes('不肯安静') || title.includes('换挡')
      ? color.evidence
      : title.includes('留白') || title.includes('多留')
        ? density.evidence
        : title.includes('秩序') || title.includes('意外')
          ? order.evidence
          : [];
  const claims: Claim[] = axes
    .slice(0, 3)
    .filter((a) => a.count >= 2)
    .map((a) => ({
      title: a.mixed ? `${a.name}，会随情境变化` : `${a.name}：${a.score < 0 ? a.left : a.right}`,
      text: a.mixed
        ? `在${a.evidence.map((e) => e.domain).join('、')}里，你做出了不同方向的选择。两端都吸引你，可以继续观察具体场景。`
        : `在 ${a.count} 个独立题目中，你都选了更${a.score < 0 ? a.left : a.right}的表达。${a.count < 3 ? '这还是一条初步线索。' : '这是本次实验中反复出现的一条线索。'}`,
      evidenceIds: a.evidence.map((e) => e.id),
    }));
  const answered = Object.values(s.answers).filter((a) => a.type !== 'skip').length;
  const exercises = [
    s.answers.q05?.type === 'crop'
      ? '给同一场景再做一张更紧的裁切。比较两张各自留下了什么、舍弃了什么。'
      : '用手机拍同一个物体的远、中、近三种距离，挑一张最符合表达意图的。',
    s.answers.q08?.type === 'palette'
      ? '保留这三种颜色，只交换主色和点缀色的面积，看看画面的情绪如何变化。'
      : '在街上寻找三种反复出现的颜色，把它们拼成一张色卡。',
    s.answers.q10?.type === 'poster'
      ? '把海报给朋友看两秒，请对方说出第一眼看到的内容，再比较它是否符合你的目标。'
      : '拿一段活动信息，用三档字号试着安排第一眼、第二眼、第三眼。',
  ];
  const repeated = axes.slice(0, 3).filter((a) => a.count >= 2);
  const orderClear = order.count >= 2 && !order.mixed,
    colorClear = color.count >= 2 && !color.mixed,
    densityClear = density.count >= 2 && !density.mixed;
  let temperament = {
    title: '还没亮出全部底牌',
    tagline: '让选择再多说一点。',
    text: '目前的线索还不够描绘创作性格。继续完成选择和作品，再看看你会怎样安排颜色、空间与重点。',
    evidenceIds: [] as string[],
    available: false,
  };
  if (repeated.length) {
    const ids = (...names: Axis[]) =>
      evidence.filter((e) => e.axis && names.includes(e.axis)).map((e) => e.id);
    temperament = {
      title: '随场景变速的观察者',
      tagline: '眼光有弹性，表达有自己的时机。',
      text: '这次选择里，你没有只认一种视觉语言。不同场景会调动不同的偏爱；你似乎更在意画面此刻是否成立，而不是忠于一个风格标签。',
      evidenceIds: repeated.flatMap((a) => a.evidence.map((e) => e.id)),
      available: true,
    };
    if (orderClear && order.score < 0 && colorClear && color.score > 0)
      temperament = {
        title: '热烈的结构控',
        tagline: '骨架要稳，颜色可以放肆。',
        text: '你会给画面安排清楚的秩序，也愿意让颜色先声夺人。这次的创作性格像一位很会控制音量的导演：热烈有位置，个性有出口。',
        evidenceIds: ids('order', 'color'),
        available: true,
      };
    else if (orderClear && order.score < 0 && densityClear && density.score < 0)
      temperament = {
        title: '有边界的浪漫派',
        tagline: '先把世界理顺，再留一点偏心。',
        text: '你喜欢清楚的结构，也会主动给信息留呼吸。在这组画面里，你的表达并不急着全部说完，更愿意让少数重要的东西站住。',
        evidenceIds: ids('order', 'density'),
        available: true,
      };
    else if (orderClear && order.score > 0 && colorClear && color.score > 0)
      temperament = {
        title: '不按套路的造梦者',
        tagline: '画面可以跳拍，想象不必排队。',
        text: '自由布局与鲜明颜色都在这次选择里出现。面对画面，你似乎愿意先尝试一种有冲击力的关系，再寻找它自己的节奏。',
        evidenceIds: ids('order', 'color'),
        available: true,
      };
    else if (densityClear && density.score > 0)
      temperament = {
        title: '细节过载的收藏家',
        tagline: '不是舍不得删，是还有故事想说。',
        text: '你在不同题目里保留了更丰富的信息。这次的视觉性格像一个会收集现场碎片的人：喜欢让视线有地方继续走，也容易被层次吸引。',
        evidenceIds: ids('density'),
        available: true,
      };
    else if (colorClear && color.score > 0)
      temperament = {
        title: '把情绪穿在颜色里的人',
        tagline: '低调可以，但今天想被看见。',
        text: '鲜明的色彩在不同题目里反复吸引你。这里的“性格感”更像一种表达姿态：愿意让作品先有态度，再慢慢讲清细节。',
        evidenceIds: ids('color'),
        available: true,
      };
    else if (colorClear && color.score < 0)
      temperament = {
        title: '安静但有回声的调色师',
        tagline: '不必最大声，也能让人记住。',
        text: '你偏向较克制的色彩表达。这次选择呈现出的气质，是把注意力留给层次与关系：你似乎更愿意让画面慢慢展开，而不是第一秒就把一切推到眼前。',
        evidenceIds: ids('color'),
        available: true,
      };
    else if (orderClear)
      temperament = {
        title: order.score < 0 ? '把感觉安排得很好的导演' : '愿意让意外发生的编排者',
        tagline: order.score < 0 ? '清楚是底色，偏心是签名。' : '先有一点意外，再长出自己的逻辑。',
        text:
          order.score < 0
            ? '你在不同场景中都选择了更清楚的组织关系。你的创作气质像先搭好舞台，再决定让谁发光；重点不一定多，但位置要讲究。'
            : '你在不同场景中都选择了更自由的组织方式。这次的表达气质更愿意让元素发生碰撞，再从碰撞里找出一种自己的平衡。',
        evidenceIds: ids('order'),
        available: true,
      };
  }
  const focus: Claim[] = repeated.map((a) => ({
    title:
      a.id === 'order'
        ? a.mixed
          ? '你在找：合适的秩序'
          : a.score < 0
            ? '你先看：关系有没有站稳'
            : '你先看：画面有没有意外'
        : a.id === 'color'
          ? a.mixed
            ? '你先看：情境需要什么颜色'
            : a.score < 0
              ? '你先看：明暗与层次'
              : '你先看：色彩有没有主张'
          : a.mixed
            ? '你在找：刚好的信息量'
            : a.score < 0
              ? '你先看：哪里可以呼吸'
              : '你先看：细节够不够耐读',
    text:
      a.id === 'order'
        ? a.mixed
          ? '你没有固定选择一种结构，画面本身的关系可能比“整齐 / 自由”的标签更重要。'
          : a.score < 0
            ? '清楚的组织方式反复吸引你。构图、排版和建筑里，元素之间的关系可能是你判断“成立”的起点。'
            : '你愿意让元素错开、碰撞，画面的节奏感可能比统一对齐更让你停留。'
        : a.id === 'color'
          ? a.mixed
            ? '同一条色彩轴上，你做了不同方向的选择。你可能先判断场景气氛，再决定颜色要不要大声。'
            : a.score < 0
              ? '你多次选择较克制的颜色。差异不必都靠饱和度表达，轻重与留白也可能让你觉得耐看。'
              : '你多次选择较鲜明的颜色。作品有没有表达态度、能不能留下第一眼印象，可能是你在意的事。'
          : a.score < 0
            ? '你在封面和庭院里都给信息留出了空间。你可能更愿意让少数元素承担表达。'
            : '你愿意保留更多可看的东西，视线继续游走的过程可能就是乐趣。',
    evidenceIds: a.evidence.map((e) => e.id),
  }));
  const thinking: Claim[] = [];
  const ca = s.answers.q05;
  if (ca?.type === 'crop') {
    const map: Record<string, [string, string]> = {
      让主体更突出: [
        '先决定主角，再安排世界',
        '你主动把“突出主体”设为目标。这次取景更像从一个明确重点出发，再决定周围该留下多少。',
      ],
      给画面留点空: [
        '把没放进去的，也算进表达',
        '你说想给画面留空间。这里的取舍不只在于拍到了什么，也在于没有填满的位置怎样帮助重点被看见。',
      ],
      保留现场故事: [
        '先留住关系，再找到主角',
        '你把现场故事作为取景目标。这次的思路更像先保存场景之间的联系，而不是只留下一个孤立的对象。',
      ],
      只想要线条和形状: [
        '先拆掉故事，再重新组织画面',
        '你把线条与形状设为目标。你试着暂时放下“这是什么”，去看它们怎样组成一个画面。',
      ],
      凭感觉: [
        '先相信直觉，再回头找理由',
        '你把“凭感觉”作为这次的表达意图。直觉是起点，可以再用作品对照看清自己究竟留下了什么。',
      ],
    };
    const t = map[ca.value.intent];
    if (t) thinking.push({ title: t[0], text: t[1], evidenceIds: ['q05-crop'] });
  }
  const pa = s.answers.q10;
  if (pa?.type === 'poster' && pa.value.custom)
    thinking.push({
      title: pa.value.layout === 2 ? '给偶然一点发挥空间' : '先给表达搭一个骨架',
      text: `你主动选了${['规则网格', '偏心排版', '自由叠放'][pa.value.layout]}。这是一条关于本次工作方法的线索：${pa.value.layout === 2 ? '从元素的碰撞里找节奏。' : '先确定结构，再调整标题与颜色。'}`,
      evidenceIds: ['q10-layout'],
    });
  const ar = s.answers.q01;
  if (ar?.type === 'archive' && ar.value.why)
    thinking.push({
      title: `这次先叫住你的是：${ar.value.why}`,
      text: '这是你对真实海报的自述理由。它可以解释为什么这组作品让你停留，但不代表地域偏好或设计水平。',
      evidenceIds: ['q01-archive'],
    });
  const keywords = repeated
    .slice(0, 3)
    .map((a) =>
      a.mixed
        ? '情境切换'
        : a.id === 'order'
          ? a.score < 0
            ? '秩序感'
            : '自由编排'
          : a.id === 'color'
            ? a.score < 0
              ? '克制用色'
              : '鲜明表达'
            : a.score < 0
              ? '让画面呼吸'
              : '细节收藏',
    );
  const quote = temperament.available ? temperament.tagline : '好看这件事，你有自己的偏心。';
  return {
    title,
    signature,
    titleEvidenceIds: titleEvidence.map((e) => e.id),
    axes,
    evidence,
    claims,
    answered,
    exercises,
    temperament,
    focus,
    thinking,
    keywords,
    quote,
  };
}
