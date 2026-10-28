import { EN } from './en.ts';
export type Locale = 'en' | 'zh';
const phrases = Object.keys(EN)
  .filter((k) => k.length > 1)
  .sort((a, b) => b.length - a.length);
export function translate(locale: Locale, source: string): string {
  if (locale === 'zh' || !/[\u3400-\u9fff]/.test(source)) return source;
  if (Object.hasOwn(EN, source)) return EN[source];
  let result = source;
  // Longest phrases first allows dynamic report copy to retain its evidence numbers.
  for (const key of phrases) if (result.includes(key)) result = result.replaceAll(key, EN[key]);
  return result;
}
export function localize<T>(locale: Locale, value: T): T {
  if (typeof value === 'string') return translate(locale, value) as T;
  if (Array.isArray(value)) return value.map((v) => localize(locale, v)) as T;
  return value;
}

const xmlEscape = (s: string) =>
  s.replace(
    /[<>&"']/g,
    (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' })[c]!,
  );
/** Translate generated SVG labels while preserving geometry and XML escaping. */
export function translateSVG(source: string, locale: Locale = 'zh') {
  if (locale === 'zh') return source;
  return source.replace(/<text\b([^>]*)>([^<]*)<\/text>/g, (_all, attrs: string, raw: string) => {
    const plain = raw
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'");
    const label = translate(locale, plain);
    if (label === plain) return '<text' + attrs + '>' + raw + '</text>';
    attrs = attrs.replace(/letter-spacing="-\d+(?:\.\d+)?"/, 'letter-spacing="-1"');
    const size = Number(attrs.match(/font-size="([^"]+)"/)?.[1] ?? 20),
      x = Number(attrs.match(/(?:^| )x="([^"]+)"/)?.[1] ?? 0);
    const estimated = label.length * size * 0.54,
      previous = Math.max(1, Array.from(plain).length) * size;
    const max = Math.max(80, Math.min(previous * 1.05, 1080 - x - 45));
    if (estimated > max)
      attrs = attrs.replace(
        /font-size="[^"]+"/,
        'font-size="' + Math.max(9, (size * max) / estimated).toFixed(1) + '"',
      );
    return '<text' + attrs + '>' + xmlEscape(label) + '</text>';
  });
}
