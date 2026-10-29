import PHOTOS from './assets/photos.json' with { type: 'json' };
import type { Crop } from './core.ts';
export type SceneId = 'shanghai' | 'coast' | 'mountains';
export type CameraId = 'eye' | 'low';
export const PHOTO_SCENES = [
  {
    id: 'shanghai',
    name: '东方明珠 · 城市人像',
    english: 'Shanghai · Person & landmark',
    brief: '朋友想和东方明珠合影。你会让人物先被看见，还是让城市一起说话？',
    briefEn:
      'A friend wants a portrait with the Oriental Pearl Tower. Who speaks first: the person or the city?',
    viewpoints: [
      {
        id: 'eye',
        name: '平视 · 人与城市',
        english: 'Eye level · Person & city',
        note: '视线接近人物，观察人与地标之间的间隔。',
        noteEn:
          'A view near the person’s eye level. Watch the separation between person and landmark.',
      },
      {
        id: 'low',
        name: '低机位 · 向上看',
        english: 'Low angle · Look upward',
        note: '从低处向上看，比较人物尺度、地平线与建筑的关系。',
        noteEn: 'From a lower viewpoint, compare human scale, the horizon and the architecture.',
      },
    ],
  },
  {
    id: 'coast',
    name: '海岸 · 旅行人物',
    english: 'Coast · A traveler in the scene',
    brief: '海风、人物和海岸线，你想让朋友记住哪一种关系？',
    briefEn: 'Sea breeze, a traveler and the coast. What relationship should the memory hold?',
    viewpoints: [
      {
        id: 'eye',
        name: '平视 · 沿海岸展开',
        english: 'Eye level · Follow the coast',
        note: '留意海平线的位置，给人物的行进方向一点空间。',
        noteEn: 'Watch the horizon and leave room in the direction the traveler is moving.',
      },
    ],
  },
  {
    id: 'mountains',
    name: '山湖 · 风景与尺度',
    english: 'Alpine lake · Landscape & scale',
    brief: '同一片山湖，你会让人变小，还是跟着前景走进去？',
    briefEn: 'A mountain lake. Will you make the person small, or let the foreground draw you in?',
    viewpoints: [
      {
        id: 'eye',
        name: '远景 · 前中后层次',
        english: 'Wide view · Layers of depth',
        note: '前景木道、中景人物和远处山峰，都可以成为取舍的线索。',
        noteEn:
          'The foreground path, middle-ground hiker and distant mountains offer different ways into the frame.',
      },
    ],
  },
] as const;
export function photoScene(c: Pick<Crop, 'scene'>) {
  return PHOTO_SCENES.find((s) => s.id === c.scene);
}
export function photoView(c: Pick<Crop, 'scene' | 'camera'>) {
  const scene = photoScene(c);
  return scene?.viewpoints.find((v) => v.id === c.camera) ?? scene?.viewpoints[0];
}
export function photoSource(c: Pick<Crop, 'scene' | 'camera'>): string | undefined {
  if (!photoScene(c)) return;
  const key = c.scene === 'shanghai' && c.camera === 'low' ? 'shanghai-low' : c.scene!;
  return PHOTOS[key];
}
export function framingPresets(c: Crop) {
  const personX = c.scene === 'mountains' ? 0.36 : c.scene === 'coast' ? 0.25 : 0.2;
  return [
    {
      id: 'person',
      name: '让人物先被看见',
      english: 'Let the person speak first',
      crop: {
        ratio: '9:16',
        zoom: c.scene === 'mountains' ? 1.8 : 1.05,
        panX: personX,
        panY: c.scene === 'mountains' ? 0.3 : 1,
        intent: '让主体更突出',
      },
    },
    {
      id: 'story',
      name: c.scene === 'shanghai' ? '人物与地标同框' : '把环境放进故事',
      english: c.scene === 'shanghai' ? 'Keep person & landmark' : 'Keep the environmental story',
      crop: { ratio: '4:3', zoom: 1, panX: 0.5, panY: 0.5, intent: '保留现场故事' },
    },
    {
      id: 'landscape',
      name: c.scene === 'mountains' ? '突出山湖与层次' : '让风景成为主角',
      english: c.scene === 'mountains' ? 'Emphasize the lake & layers' : 'Let the landscape lead',
      crop: { ratio: '16:9', zoom: 1, panX: 0.5, panY: 0, intent: '给画面留点空' },
    },
  ];
}
export function referenceCrop(c: Crop): Crop {
  return c.scene
    ? { ...c, ...framingPresets(c)[0].crop, frozen: true }
    : { ratio: '4:3', zoom: 1.9, panX: 0.17, panY: 0.58, intent: '让主体更突出', frozen: true };
}
