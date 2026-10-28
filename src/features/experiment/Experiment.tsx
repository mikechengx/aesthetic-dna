import { useState } from 'react';
import { pairSVG } from '../../art.ts';
import { Arrow, Art } from '../../components/ui.tsx';
import { COLOR_VARIANTS, QUESTIONS, type Question, type VisualChoice } from '../../content.ts';
import { type Answer, type Session } from '../../core.ts';
import { useI18n } from '../../i18n/index.tsx';
import { ArchiveQuestion } from '../posters/PosterGallery.tsx';
import { CropEditor } from './CropStudio.tsx';
import { OutfitEditor } from './OutfitStudio.tsx';
import { PaletteEditor } from './PaletteStudio.tsx';
import { PosterEditor } from './PosterStudio.tsx';

export function PairQuestion({
  q,
  answer,
  flip,
  onChange,
}: {
  q: Question;
  answer?: Answer;
  flip: boolean;
  onChange: (a: Answer) => void;
}) {
  const { tr, locale } = useI18n();

  const value = answer?.type === 'pair' ? answer.value : '';
  const base: VisualChoice[] = q.colorVariants ? ['a', 'b', 'c', 'd'] : ['a', 'b'];
  const choices = flip ? [...base].reverse() : base;
  return (
    <>
      <div className={`pair-grid ${q.colorVariants ? 'four-choices' : ''}`}>
        {choices.map((side, i) => (
          <button
            key={side}
            className={`visual-choice ${value === side ? 'selected' : ''}`}
            onClick={() => onChange({ type: 'pair', value: side })}
            data-choice={side}
            aria-pressed={value === side}
          >
            <Art
              source={pairSVG(q.art!, side, locale)}
              alt={tr(
                q.colorVariants
                  ? COLOR_VARIANTS.find((v) => v.id === side)!.label
                  : `画面 ${i + 1}：${side === 'a' ? '第一种表达' : '第二种表达'}`,
              )}
            />
            <span className="choice-caption">
              <span>{tr(String.fromCharCode(65 + i))}</span>
              <span>
                {tr(
                  q.colorVariants
                    ? COLOR_VARIANTS.find((v) => v.id === side)!.label
                    : value === side
                      ? '就是这一张'
                      : '这一张',
                )}
                {tr(' ')}
                {value === side ? '✓' : <Arrow />}
              </span>
            </span>
          </button>
        ))}
      </div>
      <div className="neutral-choices">
        {(['both', 'neither'] as const).map((v, i) => (
          <button
            key={v}
            aria-pressed={value === v}
            className={value === v ? 'active' : ''}
            onClick={() => onChange({ type: 'pair', value: v })}
          >
            {tr(i ? '都不太喜欢' : q.colorVariants ? '这些都喜欢' : '两张都喜欢')}
          </button>
        ))}
      </div>
    </>
  );
}

export function Observe({
  q,
  initial,
  onChange,
}: {
  q: Question;
  initial?: Answer;
  onChange: (a: Answer) => void;
}) {
  const { tr, locale } = useI18n();

  return (
    <>
      <div className="observe-grid">
        {(['a', 'b'] as const).map((v, i) => (
          <div key={v}>
            <Art
              source={pairSVG(q.art!, v, locale)}
              alt={tr(i ? '调整后的画面' : '调整前的画面')}
            />
            <span>{tr(i ? '调整后' : '调整前')}</span>
          </div>
        ))}
      </div>
      <div className="observe-options">
        {q.options!.map((t, i) => (
          <button
            key={t}
            className={initial?.type === 'observe' && initial.value === i ? 'active' : ''}
            onClick={() => onChange({ type: 'observe', value: i })}
          >
            <span>0{tr(i + 1)}</span>
            {tr(t)}
            <span>{tr(initial?.type === 'observe' && initial.value === i ? '✓' : '')}</span>
          </button>
        ))}
      </div>
    </>
  );
}

export function QuestionView({
  s,
  submit,
  back,
  home,
  report,
}: {
  s: Session;
  submit: (a: Answer, advance: boolean) => void;
  back: () => void;
  home: () => void;
  report: () => void;
}) {
  const { tr } = useI18n();

  const q = QUESTIONS[s.step];
  const [draft, setDraft] = useState<Answer | undefined>(s.drafts?.[q.id] ?? s.answers[q.id]);
  const valid =
    !!draft &&
    draft.type !== 'skip' &&
    (draft.type !== 'crop' || (draft.value.frozen && !!draft.value.intent)) &&
    (draft.type !== 'outfit' || !!draft.value.reason) &&
    (draft.type !== 'archive' || draft.value.ids.length > 0);
  const update = (a: Answer) => {
    setDraft(a);
    submit(a, false);
  };
  return (
    <main className="experiment">
      <div className="experiment-top">
        <button className="text-button" onClick={s.step ? back : home}>
          ← {tr(s.step ? '上一题' : '返回首页')}
        </button>
        <span>
          {tr(String(s.step + 1).padStart(2, '0'))} <span className="subtle">/ 16</span>
        </span>
        <button className="text-button" onClick={home}>
          {tr('暂存离开 ↗')}
        </button>
      </div>
      <div className="progress-track">
        <span style={{ width: `${((s.step + 1) / 16) * 100}%` }} />
      </div>
      <div className="question-heading">
        <div className="eyebrow">
          {tr(q.label)}{' '}
          <span>/ {tr(s.step < 4 ? 'LOOK' : s.step < 13 ? 'MAKE & LOOK' : 'DISCOVER')}</span>
        </div>
        <h1>{tr(q.title)}</h1>
        <p>{tr(q.subtitle)}</p>
      </div>
      <div className="question-body">
        {q.kind === 'archive' ? (
          <ArchiveQuestion seed={s.id} initial={draft} onChange={update} />
        ) : q.kind === 'pair' ? (
          <PairQuestion q={q} answer={draft} flip={s.flips[s.step]} onChange={update} />
        ) : q.kind === 'crop' ? (
          <CropEditor
            initial={draft?.type === 'crop' ? draft.value : undefined}
            onChange={update}
          />
        ) : q.kind === 'palette' ? (
          <PaletteEditor
            initial={draft?.type === 'palette' ? draft.value : undefined}
            onChange={update}
          />
        ) : q.kind === 'poster' ? (
          <PosterEditor
            initial={draft?.type === 'poster' ? draft.value : undefined}
            palette={s.answers.q08?.type === 'palette' ? s.answers.q08.value : undefined}
            onChange={update}
          />
        ) : q.kind === 'outfit' ? (
          <OutfitEditor
            initial={draft?.type === 'outfit' ? draft.value : undefined}
            onChange={update}
          />
        ) : (
          <Observe q={q} initial={draft} onChange={update} />
        )}
      </div>
      <div className="question-footer">
        <button className="text-button skip" onClick={() => submit({ type: 'skip' }, true)}>
          {tr('这题先跳过')}
        </button>
        <div>
          {s.done && (
            <button className="text-button" onClick={report}>
              {tr('查看已保存报告')}
            </button>
          )}
          <button
            className="primary"
            disabled={!valid}
            onClick={() => draft && submit(draft, true)}
          >
            {tr(s.step === 15 ? '打开我的审美档案' : '留下这个选择')} <span>→</span>
          </button>
        </div>
      </div>
      <p className="experiment-note">
        {tr('跟着你的感觉走。没有统一审美答案。修改后请确认选择，再回到报告。')}
      </p>
    </main>
  );
}
