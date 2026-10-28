import { type CSSProperties } from 'react';
import { shareSVG, uri } from '../../art.ts';
import { CARD_SERIES } from '../../cardDesigns.ts';
import { CARD_PALETTES, getCardProfile } from '../../cardProfile.ts';
import { type Session } from '../../core.ts';
import { useI18n } from '../../i18n/index.tsx';

export function ShareCardStudio({
  s,
  onExport,
}: {
  s: Session;
  onExport: (source: string, name: string) => void;
}) {
  const { tr, locale } = useI18n();

  const profile = getCardProfile(s),
    t = CARD_PALETTES[profile.palette],
    series = CARD_SERIES[profile.palette];
  const style = {
    '--result-paper': t.paper,
    '--result-ink': t.ink,
    '--result-mid': t.mid,
    '--result-light': t.light,
    '--result-accent': t.accent,
  } as CSSProperties;
  return (
    <section
      className={`report-section share-studio result-card-studio ${profile.dynamic ? 'is-kinetic' : 'is-quiet'}`}
      style={style}
      data-card-palette={profile.palette}
      data-card-layout={profile.dynamic ? 'kinetic' : 'quiet'}
    >
      <div className="share-studio-copy">
        <span className="eyebrow">A PORTRAIT, WITH A POINT OF VIEW.</span>
        <h2>
          {tr('每一种眼光，')}
          <br />
          {tr('都值得')}
          <span>{tr('被认真设计。')}</span>
        </h2>
        <p className="result-classification">
          {tr(profile.label)}
          <span>
            {tr(series.name)} · {tr(t.name)}
          </span>
        </p>
        <p>{tr(profile.description)}</p>
        <div className="result-color-family" aria-label={tr(`${t.name}主调配色`)}>
          {[t.ink, t.mid, t.paper, t.accent, t.light].map((c) => (
            <i key={c} style={{ background: c }} />
          ))}
        </div>
        <details className="result-card-explanation">
          <summary>{tr('为什么是这个颜色和排版？ ＋')}</summary>
          {profile.reasons.map((f) => (
            <p key={f}>{tr(f)}</p>
          ))}
          <p>{tr('根据本次选择与创作改动确定视觉表达，并匹配不同的图形、字体和版式。')}</p>
        </details>
        <button
          className="primary"
          onClick={() => onExport(shareSVG(s, undefined, locale), tr(`我的审美DNA-${t.name}.png`))}
        >
          {tr('保存我的结果卡 ↓')}
        </button>
        <small>{tr('1080 × 1440 · 结果决定配色与动势 · 原作原色在报告保留')}</small>
      </div>
      <div className="share-card-preview">
        <img
          src={uri(shareSVG(s, undefined, locale))}
          alt={tr(`${t.name}主调配色 · ${profile.label}结果卡预览`)}
        />
        <span>YOUR TASTE. YOUR OWN EDITION.</span>
      </div>
    </section>
  );
}
