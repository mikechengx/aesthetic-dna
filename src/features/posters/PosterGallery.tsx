import { useState } from 'react';
import type { Answer } from '../../core.ts';
import { useDraft } from '../../draft.ts';
import { useI18n } from '../../i18n/index.tsx';
import { POSTERS, type PosterStyle } from '../../posters.ts';
import { PosterImage } from './PosterImage.tsx';
import { shuffledPosters, togglePoster } from './catalog.ts';
const FILTERS = [
  ['all', '全部', 'All posters'],
  ['expressive', '极繁冲击', 'Bold & maximal'],
  ['minimal', '干净留白', 'Clean & quiet'],
  ['japanese', '日式美学', 'Japanese aesthetics'],
  ['illustrated', '手绘世界', 'Illustrated worlds'],
] as const;
export function ArchiveQuestion({
  initial,
  onChange,
  seed,
}: {
  initial?: Answer;
  onChange: (a: Answer) => void;
  seed: string;
}) {
  const { locale, tr } = useI18n();
  const [filter, setFilter] = useState<PosterStyle | 'all'>('all');
  const [v, setV] = useDraft(
    initial?.type === 'archive' ? initial.value : { ids: [] as string[], why: '' },
    (value) => onChange({ type: 'archive', value }),
  );
  const title = (p: (typeof POSTERS)[number]) => (locale === 'en' ? p.titleEn : p.title);
  const visible = shuffledPosters(seed, filter);
  return (
    <div className="archive-question">
      <div className="poster-gallery-heading">
        <div>
          <span className="eyebrow">THE POSTER EDIT / 16 FILMS</span>
          <h2>{locale === 'en' ? 'A little chaos. A little calm.' : '一点混乱，一点留白。'}</h2>
        </div>
        <p>{tr('按画面选，不必看过电影。')}</p>
      </div>
      <div className="poster-filters" aria-label={locale === 'en' ? 'Poster styles' : '海报风格'}>
        {FILTERS.map(([id, zh, en]) => (
          <button
            key={id}
            onClick={() => setFilter(id)}
            aria-pressed={filter === id}
            className={filter === id ? 'active' : ''}
          >
            {locale === 'en' ? en : zh}
            <span>{shuffledPosters(seed, id).length}</span>
          </button>
        ))}
      </div>
      <div className="archive-toolbar">
        <span>
          {locale === 'en'
            ? `${visible.length} on view · mixed for your session`
            : `展出 ${visible.length} 张 · 为这次实验打散顺序`}
        </span>
        <b>
          {v.ids.length} / 3 <i>{tr('再选一张会替换最早的选择')}</i>
        </b>
      </div>
      <div className="poster-picks" aria-live="polite">
        <small>{locale === 'en' ? 'YOUR WALL' : '你的海报墙'}</small>
        {v.ids.length ? (
          v.ids.map((id) => {
            const p = POSTERS.find((p) => p.id === id);
            return (
              p && (
                <button
                  key={id}
                  onClick={() => setV((o) => ({ ...o, ids: togglePoster(o.ids, id) }))}
                  aria-label={locale === 'en' ? `Remove ${title(p)}` : `移除《${title(p)}》`}
                >
                  {title(p)} <span>×</span>
                </button>
              )
            );
          })
        ) : (
          <span>
            {locale === 'en' ? 'Choose up to three. Start anywhere.' : '最多三张，从喜欢的开始。'}
          </span>
        )}
      </div>
      <div className="archive-grid">
        {visible.map((p, i) => (
          <article
            className={v.ids.includes(p.id) ? 'archive-card selected' : 'archive-card'}
            key={p.id}
          >
            <button
              data-poster={p.id}
              aria-pressed={v.ids.includes(p.id)}
              aria-label={locale === 'en' ? `Choose ${p.titleEn} poster` : `选择《${p.title}》海报`}
              onClick={() => setV((o) => ({ ...o, ids: togglePoster(o.ids, p.id) }))}
            >
              <PosterImage poster={p} eager={i < 4} />
              <span className="archive-check">
                {v.ids.includes(p.id) ? '✓' : String(i + 1).padStart(2, '0')}
              </span>
            </button>
            <div className="archive-caption">
              <span>
                {locale === 'en' ? p.regionEn : p.region}
                <span>{p.year}</span>
              </span>
              <h3>{title(p)}</h3>
              <p>{locale === 'en' ? p.credit : p.original}</p>
              <a href={p.source} target="_blank" rel="noopener noreferrer">
                {tr('官方来源 ↗')}
              </a>
            </div>
          </article>
        ))}
      </div>
      <div className="archive-reason">
        <span>
          {tr('最先叫住你的是什么？')}
          <small>{tr('可选')}</small>
        </span>
        <div className="chips">
          {['色彩冲击', '故事氛围', '构图关系', '字体排版', '人物目光', '直觉'].map((why) => (
            <button
              key={why}
              className={v.why === why ? 'active' : ''}
              onClick={() => setV((o) => ({ ...o, why: o.why === why ? '' : why }))}
            >
              {tr(why)}
            </button>
          ))}
        </div>
      </div>
      <p className="archive-credit">
        {tr('电影海报保留原作，不改图、不以国别计分。作品与海报版权归各自权利人。')}
      </p>
    </div>
  );
}
