import { type Session } from '../../core.ts';
import { useI18n } from '../../i18n/index.tsx';
import { localizedReport } from '../../i18n/report.ts';
import { POSTERS } from '../../posters.ts';
import { PosterImage } from '../posters/PosterImage.tsx';

export function Portrait({ s, edit }: { s: Session; edit: (n: number) => void }) {
  const { tr, locale } = useI18n();

  const r = localizedReport(s, locale),
    t = r.temperament,
    archive = s.answers.q01;
  const picked =
    archive?.type === 'archive' ? POSTERS.filter((p) => archive.value.ids.includes(p.id)) : [];
  return (
    <section className="report-section portrait-section">
      <div className="section-title">
        <span>YOUR TASTE, YOUR MIND</span>
        <h2>
          {tr('你的侧重，你的想法，')}
          <br />
          <em>{tr('还有一点性格感。')}</em>
        </h2>
        <p>{tr('从“喜欢什么”，到“为什么这样安排”。')}</p>
      </div>
      <div className="temperament-card">
        <div className="temperament-overline">
          <span>{tr('创作性格 / A CREATIVE PORTRAIT')}</span>
          <span>✳</span>
        </div>
        <h3>{tr(t.title)}</h3>
        <p className="temperament-tagline">{tr(t.tagline)}</p>
        <p>{tr(t.text)}</p>
        <div className="portrait-keywords">
          {r.keywords.map((k, i) => (
            <span key={i}>{tr(k)}</span>
          ))}
        </div>
        <details>
          <summary>{tr('这份性格感，从哪里来？ ＋')}</summary>
          {t.evidenceIds.map((id) => (
            <p key={id}>{tr(r.evidence.find((e) => e.id === id)?.fact)}</p>
          ))}
          {!t.available && <p>{tr('当前还没有足够的跨题方向证据。')}</p>}
        </details>
        <small>{tr('基于本次视觉选择的趣味解读，不是人格测评。')}</small>
      </div>
      <div className="portrait-columns">
        <div>
          <span className="portrait-column-label">{tr('01 / 你的侧重')}</span>
          {r.focus.length ? (
            r.focus.map((c) => (
              <article key={c.title}>
                <h3>{tr(c.title)}</h3>
                <p>{tr(c.text)}</p>
                <details>
                  <summary>{tr('回到选择 ＋')}</summary>
                  {c.evidenceIds.map((id) => {
                    const e = r.evidence.find((e) => e.id === id)!;
                    return (
                      <button
                        className="text-button"
                        key={id}
                        onClick={() => edit(+e.questionId.slice(1) - 1)}
                      >
                        {tr(e.fact)} ↗
                      </button>
                    );
                  })}
                </details>
              </article>
            ))
          ) : (
            <p className="portrait-empty">{tr('多完成几道偏好题，让线索自己浮现。')}</p>
          )}
        </div>
        <div>
          <span className="portrait-column-label">{tr('02 / 你的创作思路')}</span>
          {r.thinking.length ? (
            r.thinking.map((c) => (
              <article key={c.title}>
                <h3>{tr(c.title)}</h3>
                <p>{tr(c.text)}</p>
                <details>
                  <summary>{tr('这条观察的依据 ＋')}</summary>
                  {c.evidenceIds.map((id) => (
                    <p key={id}>{tr(r.evidence.find((e) => e.id === id)?.fact)}</p>
                  ))}
                </details>
              </article>
            ))
          ) : (
            <p className="portrait-empty">
              {tr('完成取景、主动排版或海报理由后，这里会留下你的工作方法。')}
            </p>
          )}
        </div>
      </div>
      {picked.length > 0 && (
        <div className="picked-posters">
          <div>
            <span className="eyebrow">YOUR POSTER CRUSH</span>
            <h3>{tr('这几张，先叫住了你。')}</h3>
            <p>
              {tr(
                archive?.type === 'archive' && archive.value.why
                  ? locale === 'en'
                    ? `What caught your eye: ${tr(archive.value.why)}.`
                    : `你说最吸引你的是「${archive.value.why}」。`
                  : '你没有解释理由，也没关系。先把喜欢留下来。',
              )}
            </p>
            <button className="text-button" onClick={() => edit(0)}>
              {tr('回到海报墙 ↗')}
            </button>
          </div>
          {picked.map((p) => (
            <a href={p.source} target="_blank" rel="noopener noreferrer" key={p.id}>
              <PosterImage poster={p} />
              <span>
                {tr(p.title)} · {tr(p.region)} ↗
              </span>
              <small>{tr(p.credit)}</small>
            </a>
          ))}
        </div>
      )}
    </section>
  );
}
