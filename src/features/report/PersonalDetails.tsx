import { pairSVG, uri } from '../../art.ts';
import { QUESTIONS } from '../../content.ts';
import { useI18n } from '../../i18n/index.tsx';
import type { VisualChoice } from '../../content.ts';
import type { PersonalReport } from '../../reportInsights.ts';
export function PersonalDetails({
  report,
  edit,
}: {
  report: PersonalReport;
  edit: (index: number) => void;
}) {
  const { locale } = useI18n();
  const l = (zh: string, en: string) => (locale === 'zh' ? zh : en);
  const names = {
    comparison: l('场景之间', 'CROSS-CONTEXT'),
    'self-report': l('你自己说的', 'YOUR OWN WORDS'),
    creation: l('你实际做的', 'YOUR CREATION'),
  };
  return (
    <section className="personal-report" data-personal-report>
      <div className="personal-heading">
        <div>
          <span className="eyebrow">THE PARTICULARS / YOUR POINT OF VIEW</span>
          <h2>{l('只属于这次的细节。', 'The details that make it yours.')}</h2>
          <p>
            {l(
              '把“喜欢什么”和“为什么这样做”放在一起，看看你的取舍发生在哪里。',
              'Put what you like beside why you chose it. See where your point of view takes shape.',
            )}
          </p>
        </div>
        <div className="personal-count">
          {l(
            `记录了 ${report.contexts.length} 个色彩场景、${report.reasonCount} 条选择理由。每条观察都能回到原题。`,
            `Recorded ${report.contexts.length} color settings and ${report.reasonCount} choice explanations. Every observation traces back to its question.`,
          )}
        </div>
      </div>
      {report.contexts.length > 0 && (
        <div className="context-strip">
          {report.contexts.map((c) => (
            <button
              className="context-item"
              key={c.questionId}
              onClick={() => edit(+c.questionId.slice(1) - 1)}
              aria-label={l(`回看${c.label}`, `Revisit ${c.label.toLowerCase()}`)}
            >
              <img
                src={uri(
                  pairSVG(
                    QUESTIONS.find((q) => q.id === c.questionId)!.art!,
                    c.choice as VisualChoice,
                    locale,
                  ),
                )}
                alt=""
              />
              <div>
                <span>{c.label}</span>
                <b>{c.variant} ↗</b>
              </div>
            </button>
          ))}
        </div>
      )}
      {report.insights.length ? (
        <div className="personal-insights">
          {report.insights.map((c, i) => (
            <article className="personal-insight" key={c.id} data-insight={c.id}>
              <span className="insight-kind">
                {String(i + 1).padStart(2, '0')} / {names[c.kind]}
              </span>
              <h3>{c.title}</h3>
              {c.metric && (
                <div className="insight-metric">
                  {c.metric}
                  <small>{c.metricLabel}</small>
                </div>
              )}
              <p>{c.text}</p>
              <div className="personal-traces">
                {c.questionIds.map((id) => (
                  <button key={id} className="text-button" onClick={() => edit(+id.slice(1) - 1)}>
                    {l('回看第 ' + id.slice(1) + ' 题', 'Revisit step ' + id.slice(1))} ↗
                  </button>
                ))}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="personal-empty">
          {l(
            '目前还没有足够的具体线索。完成两种场景的选择，或确认一件作品，再来看看。',
            'There are not enough details yet. Choose across two settings or confirm a creation, then come back.',
          )}
        </div>
      )}
    </section>
  );
}
