import { personalReport } from '../reportInsights.ts';
import { choiceReason } from '../questionDetails.ts';
import { photoScene, photoView } from '../photoScenarios.ts';
import { COLOR_VARIANTS, QUESTIONS } from '../content.ts';
import { analyze, cropRect, type Evidence, type Session } from '../core.ts';
import { POSTERS } from '../posters.ts';
import { translate, type Locale } from './translate.ts';
/** Localized presentation model; canonical evidence, IDs and scores are unchanged. */
function baseLocalizedReport(
  s: Session,
  locale: Locale = 'zh',
): Omit<ReturnType<typeof analyze>, 'keywords'> & { keywords: string[] } {
  const r = analyze(s);
  if (locale === 'zh') return r;
  const t = (v: string) => translate(locale, v);
  const evidence: Evidence[] = r.evidence.map((e) => {
    const a = s.answers[e.questionId],
      q = QUESTIONS.find((q) => q.id === e.questionId)!;
    let fact = '';
    if (a.type === 'pair') {
      const variant = COLOR_VARIANTS.find((v) => v.id === a.value);
      const axis = r.axes.find((ax) => ax.id === q.axis)!;
      if (e.id.endsWith('-reason')) {
        const reason = choiceReason(q.id, a.reason);
        fact = `You said this choice works because “${reason?.english ?? ''}”. This explanation does not add another preference-axis vote.`;
      } else
        fact = `For “${t(q.title)}” you chose ${q.colorVariants ? t(variant!.label) : t((e.value ?? 0) < 0 ? axis.left : axis.right).toLowerCase()}.`;
    }
    if (a.type === 'archive')
      fact = `You would hang ${a.value.ids.map((id) => POSTERS.find((p) => p.id === id)?.titleEn ?? id).join(', ')}.${a.value.why ? ` What caught your eye: ${t(a.value.why)}.` : ''} This records whole-poster preference, not a single color or composition skill.`;
    if (a.type === 'crop') {
      const rect = cropRect(a.value);
      fact = `${photoScene(a.value) ? `Scene: ${photoScene(a.value)!.english}. Viewpoint: ${photoView(a.value)!.english}. ` : ''}You used a ${a.value.ratio} frame, keeping about ${Math.round(((rect.w * rect.h) / 1080000) * 100)}% of the scene.${a.value.intent ? ` Your intention: ${t(a.value.intent)}.` : ''}`;
    }
    if (a.type === 'palette')
      fact = `For “quiet, never boring,” you assigned your three colors ${a.value.areas.join(' / ')} percent of the space.`;
    if (a.type === 'poster')
      fact = e.axis
        ? `You chose ${t(['规则网格', '偏心排版', '自由叠放'][a.value.layout]).toLowerCase()} as the poster structure.`
        : `Your poster retains the event, date and venue. The title uses ${a.value.serif ? 'serif' : 'sans-serif'} type, aligned ${a.value.align === 'start' ? 'left' : a.value.align === 'end' ? 'right' : 'center'}.`;
    if (a.type === 'outfit')
      fact = `You ${['kept the original outfit', 'added a warm scarf', 'chose a blue shoulder bag', 'chose brown shoes'][a.value.item]}. Your reason: ${t(a.value.reason)}.`;
    if (a.type === 'observe')
      fact = `You ${a.value === q.correct ? 'identified the main change' : a.value === 3 ? 'were unsure' : 'chose another explanation'}. ${q.id === 'q14' ? 'Only the subject’s position changed.' : 'Only the hierarchy of type sizes changed.'}`;
    return { ...e, domain: e.domain ? t(e.domain) : undefined, fact };
  });
  const axes = r.axes.map((a) => ({
    ...a,
    name: t(a.name),
    left: t(a.left),
    right: t(a.right),
    label:
      a.count === 0
        ? 'To explore'
        : a.mixed
          ? 'Both ends appeal'
          : `${a.count === 1 ? 'This time' : a.count < 3 ? 'Early lean' : 'Leaning'}: ${t(a.score < 0 ? a.left : a.right).toLowerCase()}`,
    evidence: evidence.filter((e) => e.axis === a.id),
  }));
  const trClaim = (c: (typeof r.focus)[number]) => ({ ...c, title: t(c.title), text: t(c.text) });
  const claims = axes
    .slice(0, 3)
    .filter((a) => a.count >= 2)
    .map((a) => ({
      title: a.mixed
        ? `${a.name} changes with context`
        : `${a.name}: ${a.score < 0 ? a.left : a.right}`,
      text: a.mixed
        ? `You chose different directions across ${a.evidence.map((e) => e.domain).join(', ')}. Both ends appeal to you; the context deserves a closer look.`
        : `Across ${a.count} independent questions, you chose the ${a.score < 0 ? a.left : a.right} expression. ${a.count < 3 ? 'This is an early clue.' : 'This pattern repeated throughout this experiment.'}`,
      evidenceIds: a.evidence.map((e) => e.id),
    }));
  const thinking = r.thinking.map((c) => {
    const result = trClaim(c);
    if (c.evidenceIds.includes('q10-layout')) {
      const p = s.answers.q10;
      if (p.type === 'poster')
        result.text = `You chose ${t(['规则网格', '偏心排版', '自由叠放'][p.value.layout]).toLowerCase()}. ${p.value.layout === 2 ? 'Find a rhythm in the collision between elements.' : 'Set a structure, then adjust the title and color.'}`;
    }
    if (c.evidenceIds.includes('q01-archive')) {
      const a = s.answers.q01;
      if (a.type === 'archive') result.title = `What caught your eye: ${t(a.value.why)}`;
    }
    return result;
  });
  return {
    ...r,
    title: t(r.title),
    signature: t(r.signature),
    quote: t(r.quote),
    keywords: r.keywords.map(t),
    exercises: r.exercises.map(t),
    evidence,
    axes,
    claims,
    focus: r.focus.map(trClaim),
    thinking,
    temperament: {
      ...r.temperament,
      title: t(r.temperament.title),
      tagline: t(r.temperament.tagline),
      text: t(r.temperament.text),
    },
  };
}

export function localizedReport(s: Session, locale: Locale = 'zh') {
  const base = baseLocalizedReport(s, locale),
    personal = personalReport(s, analyze(s), locale);
  const exercises = [...personal.nextSteps.map((p) => p.text), ...base.exercises].slice(0, 3);
  return {
    ...base,
    personal,
    title: personal.headline ?? base.title,
    titleEvidenceIds: personal.headline ? personal.headlineEvidenceIds : base.titleEvidenceIds,
    exercises,
  };
}
