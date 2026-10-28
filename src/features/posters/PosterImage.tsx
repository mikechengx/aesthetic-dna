import { useState } from 'react';
import { useI18n } from '../../i18n/index.tsx';
import type { PosterReference } from '../../posters.ts';
/** Remote publisher artwork is referenced, never bundled or recolored. */
export function PosterImage({
  poster,
  eager = false,
}: {
  poster: PosterReference;
  eager?: boolean;
}) {
  const { locale } = useI18n();
  const [failed, setFailed] = useState(false);
  return failed ? (
    <span className="poster-fallback">
      <b>{locale === 'en' ? poster.titleEn : poster.title}</b>
      <small>
        {locale === 'en'
          ? 'Preview unavailable · open official source below'
          : '预览暂不可用 · 可打开下方官方来源'}
      </small>
    </span>
  ) : (
    <img
      src={poster.image}
      alt={
        (locale === 'en' ? poster.titleEn : poster.title) +
        (locale === 'en' ? ' — official movie poster' : ' · 官方电影海报')
      }
      loading={eager ? 'eager' : 'lazy'}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
    />
  );
}
