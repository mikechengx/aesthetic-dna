import type { Crop } from './core.ts';
export type CameraRig = { x: number; z: number; height: number; yaw: number; pitch: number };
export const CAMERA_POSITIONS = [
  {
    id: 'eye',
    zh: '正面平视',
    en: 'Front · eye level',
    x: 0,
    z: -7,
    height: 1.6,
    yaw: 0,
    pitch: 0,
  },
  {
    id: 'low',
    zh: '蹲下仰拍',
    en: 'Crouch · look up',
    x: 0,
    z: -6,
    height: 0.65,
    yaw: 0,
    pitch: 0.1,
  },
  {
    id: 'ground',
    zh: '贴地低拍',
    en: 'Ground level',
    x: -1,
    z: -6,
    height: 0.22,
    yaw: 0.12,
    pitch: 0.18,
  },
  {
    id: 'high',
    zh: '高处俯拍',
    en: 'Raised · look down',
    x: 0,
    z: -7,
    height: 4,
    yaw: 0,
    pitch: -0.25,
  },
  { id: 'left', zh: '走到左侧', en: 'Walk left', x: -4, z: -5, height: 1.6, yaw: 0.55, pitch: 0 },
  { id: 'right', zh: '走到右侧', en: 'Walk right', x: 4, z: -5, height: 1.6, yaw: -0.55, pitch: 0 },
  {
    id: 'near',
    zh: '靠近人物',
    en: 'Step closer',
    x: -0.6,
    z: -3,
    height: 1.5,
    yaw: 0.15,
    pitch: 0,
  },
  { id: 'far', zh: '后退看全景', en: 'Step back', x: 0, z: -12, height: 1.6, yaw: 0, pitch: 0.05 },
] as const;
export function cameraRig(id = 'eye'): CameraRig {
  const p = CAMERA_POSITIONS.find((p) => p.id === id) ?? CAMERA_POSITIONS[0];
  return { x: p.x, z: p.z, height: p.height, yaw: p.yaw, pitch: p.pitch };
}
type V = [number, number, number];
type Face = { points: V[]; color: string };
function world(scene: Crop['scene']): Face[] {
  const faces: Face[] = [];
  const face = (points: V[], color: string) => faces.push({ points, color });
  const box = (x: number, y: number, z: number, w: number, h: number, d: number, color: string) => {
    const a: V = [x - w / 2, y, z - d / 2],
      b: V = [x + w / 2, y, z - d / 2],
      c: V = [x + w / 2, y, z + d / 2],
      e: V = [x - w / 2, y, z + d / 2];
    const up = (v: V): V => [v[0], v[1] + h, v[2]];
    face([a, b, up(b), up(a)], color);
    face([b, c, up(c), up(b)], shade(color, 0.76));
    face([c, e, up(e), up(c)], shade(color, 0.88));
    face([e, a, up(a), up(e)], shade(color, 1.1));
    face([up(a), up(b), up(c), up(e)], shade(color, 1.2));
  };
  const sphere = (
    x: number,
    y: number,
    z: number,
    rx: number,
    ry: number,
    rz: number,
    color: string,
  ) => {
    const p = (i: number, j: number): V => {
      const t = (i * Math.PI) / 8,
        a = (j * Math.PI) / 6;
      return [
        x + Math.sin(t) * Math.cos(a) * rx,
        y + Math.cos(t) * ry,
        z + Math.sin(t) * Math.sin(a) * rz,
      ];
    };
    for (let i = 0; i < 8; i++)
      for (let j = 0; j < 12; j++)
        face(
          [p(i, j), p(i + 1, j), p(i + 1, j + 1), p(i, j + 1)],
          shade(
            color,
            0.72 + 0.32 * Math.cos((j * Math.PI) / 6 - 2) + 0.12 * Math.cos((i * Math.PI) / 8),
          ),
        );
  };
  const rod = (x: number, y: number, z: number, r: number, h: number, color: string) => {
    for (let j = 0; j < 12; j++) {
      const a = (j * Math.PI) / 6,
        b = ((j + 1) * Math.PI) / 6;
      face(
        [
          [x + r * Math.cos(a), y, z + r * Math.sin(a)],
          [x + r * Math.cos(b), y, z + r * Math.sin(b)],
          [x + r * Math.cos(b), y + h, z + r * Math.sin(b)],
          [x + r * Math.cos(a), y + h, z + r * Math.sin(a)],
        ],
        shade(color, 0.8 + 0.2 * Math.cos(a - 2)),
      );
    }
  };
  face(
    [
      [-100, -0.04, -40],
      [100, -0.04, -40],
      [100, -0.04, 120],
      [-100, -0.04, 120],
    ],
    scene === 'shanghai' ? '#d2bda5' : '#c1b49a',
  );
  if (scene === 'shanghai') {
    face(
      [
        [-100, 0, 6],
        [100, 0, 6],
        [100, 0, 110],
        [-100, 0, 110],
      ],
      '#83b7be',
    );
    for (let i = -10; i < 13; i++) {
      const h = 1.8 + (Math.sin(i * 34.4) + 1) * 2.7;
      box(i * 2.1, 0, 23 + Math.cos(i) * 3, 1.3, h, 1.7, i % 3 === 0 ? '#97a7ba' : '#668b9d');
    }
    // Tower, spheres and antenna share world coordinates across all viewpoints.
    rod(3, 0, 17, 0.24, 12, '#c5bac2');
    sphere(3, 3.7, 17, 1.05, 0.8, 1.05, '#d8819d');
    sphere(3, 8.3, 17, 0.72, 0.6, 0.72, '#dc99ad');
    rod(3, 11, 17, 0.055, 2, '#b5bdc9');
    for (let i = -9; i <= 9; i++) {
      rod(i * 1.5, 0, 5, 0.035, 1.05, '#526b75');
      box(i * 1.5, 0.95, 5, 1.6, 0.06, 0.06, '#6c7d84');
    }
    for (let i = -12; i < 13; i++)
      face(
        [
          [i * 1.2, 0, -20],
          [i * 1.2 + 0.025, 0, -20],
          [i * 1.2 + 0.025, 0, 5],
          [i * 1.2, 0, 5],
        ],
        '#b4a28f',
      );
    box(-3.2, 0, 2, 1.8, 0.45, 0.6, '#876d5e');
  } else {
    face(
      [
        [-100, 0.01, 4],
        [100, 0.01, 4],
        [100, 0.01, 110],
        [-100, 0.01, 110],
      ],
      scene === 'coast' ? '#70b9bd' : '#7caeab',
    );
    for (let i = -5; i < 7; i++) {
      const x = i * 6;
      const h = scene === 'coast' ? 1.4 + (i % 3) * 0.3 : 6 + Math.abs(Math.sin(i * 7)) * 9;
      face(
        [
          [x - 5, 0, 25],
          [x, h, 28],
          [x + 6, 0, 27],
        ],
        i % 2 ? '#6c8a8f' : '#91a5a3',
      );
      if (scene === 'mountains')
        face(
          [
            [x - 1.3, h * 0.78, 27.6],
            [x, h, 28],
            [x + 1.7, h * 0.73, 27.7],
          ],
          '#ecf0df',
        );
    }
    for (let i = 0; i < 13; i++) {
      const x = Math.sin(i * 13) * 5,
        z = 1 + i * 0.4;
      sphere(x, 0.15, z, 0.5, 0.35, 0.45, '#8a9789');
    }
    if (scene === 'mountains')
      for (let i = -12; i < 5; i++) box(0, 0.06, i * 0.55, 1.8, 0.09, 0.5, '#b6997c');
  }
  // A complete volumetric subject: walking legs, coat, arms, head and hair.
  box(-0.17, 0, 0, 0.19, 0.88, 0.22, '#36475e');
  box(0.16, 0.06, 0.05, 0.18, 0.82, 0.22, '#40556c');
  box(-0.17, 0.02, -0.1, 0.24, 0.11, 0.4, '#ece5d5');
  box(0.16, 0.02, 0, 0.24, 0.11, 0.4, '#ece5d5');
  sphere(0, 1.16, 0, 0.34, 0.49, 0.22, '#e3a363');
  sphere(-0.38, 1.12, 0, 0.1, 0.36, 0.11, '#d5955e');
  sphere(0.38, 1.12, 0.04, 0.1, 0.36, 0.11, '#eab06f');
  sphere(0, 1.79, 0, 0.195, 0.25, 0.18, '#433a3d');
  sphere(0, 1.79, -0.105, 0.15, 0.19, 0.13, '#e9bc9a');
  sphere(0, 1.96, -0.035, 0.18, 0.085, 0.17, '#433a3d');
  sphere(-0.055, 1.82, -0.23, 0.012, 0.015, 0.01, '#403937');
  sphere(0.055, 1.82, -0.23, 0.012, 0.015, 0.01, '#403937');
  return faces;
}
function shade(hex: string, f: number) {
  return (
    '#' +
    hex
      .slice(1)
      .match(/../g)!
      .map((c) =>
        Math.min(255, Math.max(0, Math.round(parseInt(c, 16) * f)))
          .toString(16)
          .padStart(2, '0'),
      )
      .join('')
  );
}
const scenes = new Map<string, Face[]>();
export function renderPhotoWorld(c: Crop): string {
  const rig = c.rig ?? cameraRig(c.camera);
  const [rw, rh] = c.ratio.split(':').map(Number);
  const h = 720,
    w = Math.round((h * rw) / rh),
    f = h * 0.9 * c.zoom;
  let mesh = scenes.get(c.scene ?? 'shanghai');
  if (!mesh) {
    mesh = world(c.scene);
    scenes.set(c.scene ?? 'shanghai', mesh);
  }
  const cy = Math.cos(rig.yaw),
    sy = Math.sin(rig.yaw),
    cp = Math.cos(rig.pitch),
    sp = Math.sin(rig.pitch);
  const cameraPoint = (p: V): V => {
    const x = p[0] - rig.x,
      y = p[1] - rig.height,
      z = p[2] - rig.z;
    const a = x * cy - z * sy,
      b = x * sy + z * cy;
    const py = y * cp - b * sp,
      pz = y * sp + b * cp;
    return [a, py, pz];
  };
  const clip = (points: V[]): V[] => {
    const out: V[] = [];
    for (let i = 0; i < points.length; i++) {
      const a = points[i],
        b = points[(i + 1) % points.length],
        inside = a[2] >= 0.1,
        next = b[2] >= 0.1;
      if (inside) out.push(a);
      if (inside !== next) {
        const t = (0.1 - a[2]) / (b[2] - a[2]);
        out.push([a[0] + t * (b[0] - a[0]), a[1] + t * (b[1] - a[1]), 0.1]);
      }
    }
    return out;
  };
  const project = (p: V): V => [w / 2 + (p[0] * f) / p[2], h / 2 - (p[1] * f) / p[2], p[2]];
  const polygons = mesh
    .map((face) => ({ color: face.color, points: clip(face.points.map(cameraPoint)).map(project) }))
    .filter((p) => p.points.length >= 3)
    .sort(
      (a, b) =>
        b.points.reduce((s, p) => s + p[2], 0) / b.points.length -
        a.points.reduce((s, p) => s + p[2], 0) / a.points.length,
    )
    .map(
      (face) =>
        `<polygon points="${face.points.map((p) => `${p[0].toFixed(2)},${p[1].toFixed(2)}`).join(' ')}" fill="${face.color}" stroke="${face.color}" stroke-width=".4"/>`,
    )
    .join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" data-renderer="camera-world"><defs><linearGradient id="sky" x2="0" y2="1"><stop stop-color="#8fbdd5"/><stop offset=".65" stop-color="#f6d5ae"/><stop offset="1" stop-color="#f8e8c7"/></linearGradient></defs><path fill="url(#sky)" d="M0 0H${w}V${h}H0Z"/>${polygons}</svg>`;
}
