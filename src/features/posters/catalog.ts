import { POSTERS, type PosterStyle } from '../../posters.ts';
/** Stable within a session, varied between sessions; independent of preference scoring. */
export function shuffledPosters(seed: string, style: PosterStyle | 'all' = 'all') {
  let state = 2166136261;
  for (const ch of seed) state = Math.imul(state ^ ch.charCodeAt(0), 16777619) >>> 0;
  const list = [...POSTERS];
  for (let i = list.length - 1; i > 0; i--) {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    const j = state % (i + 1);
    [list[i], list[j]] = [list[j], list[i]];
  }
  return list.filter((p) => style === 'all' || p.styles.includes(style));
}
export function togglePoster(ids: string[], id: string) {
  return ids.includes(id) ? ids.filter((x) => x !== id) : [...ids.slice(-2), id];
}
