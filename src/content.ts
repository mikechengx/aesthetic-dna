export type Axis = 'order' | 'color' | 'density' | 'shape' | 'texture';
export type Kind = 'pair' | 'archive' | 'crop' | 'palette' | 'poster' | 'outfit' | 'observe';
export type VisualChoice = 'a' | 'b' | 'c' | 'd';
export interface Question {
  id: string;
  kind: Kind;
  title: string;
  subtitle: string;
  label: string;
  art?: string;
  axis?: Axis;
  domain?: string;
  warmup?: boolean;
  options?: string[];
  correct?: number;
  colorVariants?: boolean;
}
export const AXES: Record<Axis, { name: string; left: string; right: string }> = {
  order: { name: '组织方式', left: '秩序', right: '自由' },
  color: { name: '色彩能量', left: '克制', right: '浓烈' },
  density: { name: '表达密度', left: '疏朗', right: '丰富' },
  shape: { name: '形态探索', left: '几何', right: '有机' },
  texture: { name: '质感探索', left: '精修', right: '原生' },
};
export const QUESTIONS: Question[] = [
  {
    id: 'q01',
    kind: 'archive',
    title: '如果你的房间只能挂三张。',
    subtitle: '从 16 张真实电影海报里，留下最想多看两眼的 1–3 张。',
    label: '世界海报 · 你的偏心',
    warmup: true,
  },
  {
    id: 'q02',
    kind: 'pair',
    title: '同一场放映，你会带走哪张海报？',
    subtitle: '内容一样，表达各有主张。',
    label: '海报 · 直觉选择',
    art: 'poster',
    axis: 'order',
    domain: '海报',
  },
  {
    id: 'q03',
    kind: 'pair',
    title: '你想把周末，放在哪种颜色里？',
    subtitle: '四种颜色性格，同一间房。选你最想住进去的一种。',
    label: '空间 · 直觉选择',
    art: 'room',
    axis: 'color',
    domain: '室内',
    colorVariants: true,
  },
  {
    id: 'q04',
    kind: 'pair',
    title: '这本杂志，该留多少呼吸？',
    subtitle: '如果只能带走一本，你会选……',
    label: '封面 · 直觉选择',
    art: 'cover',
    axis: 'density',
    domain: '封面',
  },
  {
    id: 'q05',
    kind: 'crop',
    title: '这一张，你会怎样拍？',
    subtitle: '东方明珠人像、海岸旅行、山湖风景。选择场景与机位，再留下你的那一帧。',
    label: '摄影 · 换你出手',
  },
  {
    id: 'q06',
    kind: 'pair',
    title: '建筑的秩序，哪一种让你舒服？',
    subtitle: '同样的窗与墙，不同的排列。',
    label: '建筑 · 直觉选择',
    art: 'building',
    axis: 'order',
    domain: '建筑',
  },
  {
    id: 'q07',
    kind: 'pair',
    title: '让今天的颜色，响一点吗？',
    subtitle: '同样的轮廓，四种出场方式。',
    label: '穿搭 · 直觉选择',
    art: 'fashion',
    axis: 'color',
    domain: '服装',
    colorVariants: true,
  },
  {
    id: 'q08',
    kind: 'palette',
    title: '给「安静但不无聊」，配三种颜色。',
    subtitle: '选择背景、主体和点缀，再给它们分一点位置。',
    label: '配色 · 换你出手',
  },
  {
    id: 'q09',
    kind: 'pair',
    title: '这件外套，你更想穿哪种轮廓？',
    subtitle: '看结构和线条，暂时忘掉流行。',
    label: '服装 · 直觉选择',
    art: 'coat',
    axis: 'shape',
    domain: '服装',
  },
  {
    id: 'q10',
    kind: 'poster',
    title: '慢一拍，也可以很有主张。',
    subtitle: '用一张海报，邀请朋友来城市短片放映夜。',
    label: '海报 · 换你出手',
  },
  {
    id: 'q11',
    kind: 'pair',
    title: '哪一种表面，让你想伸手摸摸？',
    subtitle: '同样的颜色，不同的触感。',
    label: '材质 · 直觉选择',
    art: 'texture',
    axis: 'texture',
    domain: '材质',
  },
  {
    id: 'q12',
    kind: 'outfit',
    title: '下班去看展，只换一件。',
    subtitle: '也可以保留原样。说说这次选择的理由。',
    label: '搭配 · 换你出手',
  },
  {
    id: 'q13',
    kind: 'pair',
    title: '同一座庭院，你想保留多少东西？',
    subtitle: '看看你更愿意在哪一边停下来。',
    label: '建筑 · 直觉选择',
    art: 'courtyard',
    axis: 'density',
    domain: '庭院',
  },
  {
    id: 'q14',
    kind: 'observe',
    title: '这次，画面的重心为什么变了？',
    subtitle: '比较前后两个版本，找出主要变化。',
    label: '观察 · 你的看法',
    art: 'balance',
    options: ['主体的位置改变了', '画面的色彩改变了', '画面的比例改变了', '不确定'],
    correct: 0,
  },
  {
    id: 'q15',
    kind: 'observe',
    title: '两版海报，主要改变了什么？',
    subtitle: '不用知道设计术语，也可以观察到区别。',
    label: '观察 · 你的看法',
    art: 'hierarchy',
    options: ['信息的内容', '文字的字号层级', '画面的背景颜色', '不确定'],
    correct: 1,
  },
  {
    id: 'q16',
    kind: 'pair',
    title: '最后，再凭直觉带走一张。',
    subtitle: '同样的构图，四种色彩表达。你的偏心会停在哪？',
    label: '色彩 · 再看一眼',
    art: 'final',
    axis: 'color',
    domain: '海报',
    colorVariants: true,
  },
];
export const COLORS = [
  '#efe5cd',
  '#c8ccad',
  '#657b63',
  '#244b3e',
  '#c6d9e2',
  '#456c8c',
  '#e6b77b',
  '#cc704e',
  '#a93942',
  '#c3a3bb',
  '#333a38',
  '#faf8f2',
  '#3355ff',
  '#152caa',
  '#6b81ff',
  '#9cb5ff',
  '#d9f963',
  '#b9db2c',
  '#19a876',
  '#0b7262',
  '#ff684b',
  '#fa9d76',
  '#ffd145',
  '#ffe787',
  '#ff3d7f',
  '#af2766',
  '#ffa4c4',
  '#f8d8e9',
  '#a785ff',
  '#6040bf',
  '#d6c8ff',
  '#f0e8ff',
  '#73d9ed',
  '#11aab8',
  '#d6f3ed',
  '#803d31',
  '#b48a69',
  '#171c2e',
];
export const COLOR_STORIES = [
  { name: '电光偏心', note: '电光蓝 × 青柠绿', colors: ['#3355ff', '#fffdf7', '#d9f963'] },
  { name: '橙色星期天', note: '珊瑚橙 × 奶油白', colors: ['#ff684b', '#171c2e', '#ffe787'] },
  { name: '紫色夜游', note: '薄紫 × 深紫 × 粉红', colors: ['#d6c8ff', '#302052', '#ff3d7f'] },
  { name: '海盐汽水', note: '浅蓝 × 湖蓝 × 柠檬', colors: ['#c6d9e2', '#152caa', '#ffd145'] },
  { name: '草地放映', note: '森林绿 × 奶油 × 荧光', colors: ['#244b3e', '#faf8f2', '#d9f963'] },
  { name: '复古片场', note: '奶油 × 酒红 × 焦糖', colors: ['#efe5cd', '#a93942', '#b48a69'] },
  { name: '樱桃汽泡', note: '粉白 × 樱桃 × 蓝', colors: ['#f8d8e9', '#af2766', '#3355ff'] },
  { name: '雨后青绿', note: '浅青 × 墨绿 × 橙', colors: ['#d6f3ed', '#0b7262', '#ff684b'] },
];
export const COLOR_VARIANTS = [
  { id: 'a', label: '柔雾中性色', value: -1 },
  { id: 'b', label: '清透冷调', value: -0.35 },
  { id: 'c', label: '暖调有主张', value: 0.35 },
  { id: 'd', label: '高能撞色', value: 1 },
] as const;
export const INTENTS = [
  '让主体更突出',
  '给画面留点空',
  '保留现场故事',
  '只想要线条和形状',
  '凭感觉',
];
export const REASONS = ['颜色呼应', '轮廓变化', '材质对比', '场景需要', '直觉'];
export const SOURCE_NOTE =
  '本版收录 16 部电影的官方海报链接，保留作品署名与来源；海报从发行方加载，版权归原权利人。摄影练习使用 AI 生成的写实场景与虚构人物，其余为项目原创插画与排版。未经测评常模验证，结果描述本次选择与创作，性格感为趣味解读。';
