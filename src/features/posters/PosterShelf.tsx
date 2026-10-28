import { useI18n } from '../../i18n/index.tsx';
import { POSTERS } from '../../posters.ts';
import { PosterImage } from './PosterImage.tsx';

export function WorldPosterShelf() {
  const { tr } = useI18n();

  return (
    <section className="world-shelf">
      <div className="world-heading">
        <div>
          <span className="eyebrow">THE WORLD IS YOUR MOODBOARD</span>
          <h2>{tr('眼光，从来不只一种语言。')}</h2>
        </div>
        <p>
          {tr('从人物目光，到超现实拼贴；从叙事空间，到构图悬念。')}
          <br />
          {tr('16 张真实海报，从极繁冲击到干净留白，也有日式美学。')}
        </p>
      </div>
      <div className="shelf-posters">
        {['eeaao', 'kaguyahime', 'perfect-days', 'parasite']
          .map((id) => POSTERS.find((p) => p.id === id)!)
          .map((p, i) => (
            <a href={p.source} key={p.id} target="_blank" rel="noopener noreferrer">
              <div>
                <PosterImage poster={p} />
                <span>0{tr(i + 1)}</span>
              </div>
              <span>
                {tr(p.region)}
                <span>{tr(p.year)}</span>
              </span>
              <h3>
                {tr(p.title)}
                <span>↗</span>
              </h3>
              <small>{tr(p.credit)}</small>
            </a>
          ))}
      </div>
    </section>
  );
}
