import { PersonalDetails } from './PersonalDetails.tsx';
import { referenceCrop } from '../../photoScenarios.ts';
import { useState } from 'react';
import { contrast, cropSVG, paletteSVG, posterSVG, shareSVG } from '../../art.ts';
import { Art, Eye, Tag } from '../../components/ui.tsx';
import { QUESTIONS, SOURCE_NOTE } from '../../content.ts';
import { type Answer, type Crop, type Session } from '../../core.ts';
import { useI18n } from '../../i18n/index.tsx';
import { localizedReport } from '../../i18n/report.ts';
import { CropEditor } from '../experiment/CropStudio.tsx';
import { Portrait } from './Portrait.tsx';
import { ShareCardStudio } from './ShareCardStudio.tsx';

export function Artwork({
  source,
  title,
  name,
  onExport,
}: {
  source: string;
  title: string;
  name: string;
  onExport: (svg: string, name: string) => void;
}) {
  const { tr } = useI18n();

  return (
    <div className="artwork">
      <div className="artwork-image">
        <Art source={source} alt={tr(title)} />
      </div>
      <div className="artwork-caption">
        <span>{tr(title)}</span>
        <button className="text-button" onClick={() => onExport(source, name)}>
          {tr('保存 PNG ↓')}
        </button>
      </div>
    </div>
  );
}

export function Report({
  s,
  edit,
  onExport,
  onMarkdown,
  onHome,
}: {
  s: Session;
  edit: (n: number) => void;
  onExport: (svg: string, name: string) => void;
  onMarkdown: () => void;
  onHome: () => void;
}) {
  const { tr, locale } = useI18n();

  const r = localizedReport(s, locale);
  const crop = s.answers.q05,
    palette = s.answers.q08,
    poster = s.answers.q10,
    outfit = s.answers.q12;
  const [reference, setReference] = useState(false);
  const [practice, setPractice] = useState(false);
  const [practiceDraft, setPracticeDraft] = useState<Answer>();
  const refCrop: Crop = referenceCrop(
    crop?.type === 'crop'
      ? crop.value
      : { ratio: '4:3', zoom: 1, panX: 0.5, panY: 0.5, intent: '', frozen: false },
  );

  return (
    <main className="report">
      <div className="report-nav">
        <button className="text-button" onClick={onHome}>
          {tr('← 返回首页')}
        </button>
        <span>YOUR VISUAL SIGNATURE / 01</span>
        <button className="text-button" onClick={() => edit(0)}>
          {tr('回看选择 ↗')}
        </button>
      </div>
      <section className="report-hero">
        <div className="eyebrow">
          <span className="tiny-dot" /> {tr('审美 DNA · 本次视觉档案')}
        </div>
        <h1>{tr(r.title)}</h1>
        <div className="report-signature">
          <Eye small />
          <span>{tr(r.signature)}</span>
        </div>
        <p className="report-intro">
          {tr(r.quote)}
          <br />
          <span>{tr('你的审美侧重、创作取舍与性格感，这次一起说清楚。')}</span>
        </p>
        <div className="report-keywords">
          {r.keywords.map((k, i) => (
            <span key={i}>{tr(k)}</span>
          ))}
        </div>
        <div className="report-meta">
          <Tag>
            {tr(r.answered)} {tr('/ 16 步已作答')}
          </Tag>
          <Tag>{tr('本次选择 · 非固定人格')}</Tag>
        </div>
        <button
          className="primary"
          onClick={() => onExport(shareSVG(s, undefined, locale), tr('我的审美DNA.png'))}
        >
          {tr('保存我的审美卡')}
          <span>↓</span>
        </button>
      </section>
      <PersonalDetails report={r.personal} edit={edit} />
      <ShareCardStudio s={s} onExport={onExport} />
      <section className="report-section">
        <div className="section-title">
          <span>01 / YOUR WORK</span>
          <h2>{tr('先看看，你留下了什么。')}</h2>
          <p>{tr('三件作品，比一个分数更像你。')}</p>
        </div>
        <div className="artworks">
          {crop?.type === 'crop' ? (
            <Artwork
              source={cropSVG(crop.value)}
              title={tr('你的定格')}
              name={tr('定格照片.png')}
              onExport={onExport}
            />
          ) : (
            <div className="empty-art">
              <span>{tr('01 / 定格照片')}</span>
              <p>{tr('这一帧，还在等你。')}</p>
              <button onClick={() => edit(4)}>{tr('去取一次景 ↗')}</button>
            </div>
          )}
          {poster?.type === 'poster' ? (
            <Artwork
              source={posterSVG(poster.value, locale)}
              title={tr('你的慢一拍')}
              name={tr('慢一拍海报.png')}
              onExport={onExport}
            />
          ) : (
            <div className="empty-art">
              <span>{tr('02 / 海报')}</span>
              <p>{tr('把邀请排成一张海报。')}</p>
              <button onClick={() => edit(9)}>{tr('去排一张海报 ↗')}</button>
            </div>
          )}
          {palette?.type === 'palette' ? (
            <Artwork
              source={paletteSVG(palette.value, locale)}
              title={tr(palette.value.name || '你的三色片段')}
              name={tr('我的配色卡.png')}
              onExport={onExport}
            />
          ) : (
            <div className="empty-art">
              <span>{tr('03 / 配色')}</span>
              <p>{tr('给感觉，搭一组颜色。')}</p>
              <button onClick={() => edit(7)}>{tr('去搭一组颜色 ↗')}</button>
            </div>
          )}
        </div>
      </section>
      <section className="report-section preference-section">
        <div className="section-title">
          <span>02 / YOUR PREFERENCES</span>
          <h2>{tr('你看世界，有哪些偏心？')}</h2>
          <p>{tr('刻度描述选择方向，证据数量不代表审美高低。')}</p>
        </div>
        <div className="axis-list">
          {r.axes.slice(0, 3).map((a) => (
            <div className="axis" key={a.id}>
              <div className="axis-heading">
                <h3>{tr(a.name)}</h3>
                <span>{tr(a.label)}</span>
              </div>
              <div className="axis-bar">
                <span style={{ left: `${50 + a.score * 42}%`, opacity: a.count ? 1 : 0.25 }} />
              </div>
              <div className="axis-endpoints">
                <span>{tr(a.left)}</span>
                <small>
                  {tr(
                    a.count === 0
                      ? '暂无方向证据'
                      : `${a.count} 份独立方向证据${a.count < 3 ? ' · 初步观察' : ''}`,
                  )}
                </small>
                <span>{tr(a.right)}</span>
              </div>
              {a.mixed && (
                <p className="axis-note">
                  {tr('两端都有吸引你的地方，平均位置不能概括场景差异。')}
                </p>
              )}
            </div>
          ))}
        </div>
        <div className="explore-grid">
          {r.axes.slice(3).map((a) => (
            <div key={a.id}>
              <span>{tr(a.name)}</span>
              <h3>{tr(a.label)}</h3>
              <p>{tr(a.count ? '单题探索，暂不推导稳定偏好。' : '未作答，等待下一次探索。')}</p>
            </div>
          ))}
        </div>
      </section>
      <Portrait s={s} edit={edit} />
      <section className="report-section">
        <div className="section-title">
          <span>03 / THE EVIDENCE</span>
          <h2>{tr('为什么这样说？有图有线索。')}</h2>
          <p>{tr('每条主要结论，都能回到你的选择。')}</p>
        </div>
        {r.claims.length ? (
          <div className="evidence-grid">
            {r.claims.map((c, i) => (
              <article className="evidence-card" key={c.title}>
                <span className="feature-no">NOTE / 0{tr(i + 1)}</span>
                <h3>{tr(c.title)}</h3>
                <p>{tr(c.text)}</p>
                <details>
                  <summary>
                    {tr('看看依据')}
                    <span>＋</span>
                  </summary>
                  {c.evidenceIds.map((id) => {
                    const e = r.evidence.find((e) => e.id === id)!;
                    return (
                      <div className="evidence-detail" key={id}>
                        <p>{tr(e.fact)}</p>
                        <button
                          className="text-button"
                          onClick={() => edit(QUESTIONS.findIndex((q) => q.id === e.questionId))}
                        >
                          {tr('回看原题 ↗')}
                        </button>
                      </div>
                    );
                  })}
                </details>
              </article>
            ))}
          </div>
        ) : (
          <div className="gentle-empty">
            {tr('现有选择还不足以形成跨题结论。你可以回看题目，补充两三次直觉选择。')}
          </div>
        )}
        {r.titleEvidenceIds.length > 0 && (
          <details className="title-evidence">
            <summary>{tr('这个标题从哪里来？')}</summary>
            {r.titleEvidenceIds.map((id) => (
              <p key={id}>{tr(r.evidence.find((e) => e.id === id)?.fact)}</p>
            ))}
          </details>
        )}
      </section>
      <section className="report-section">
        <div className="section-title">
          <span>04 / HOW YOU MAKE</span>
          <h2>{tr('当你出手，画面发生了什么？')}</h2>
        </div>
        <div className="making-grid">
          {crop?.type === 'crop' && (
            <article className="making-card crop-comparison">
              <div className="control-heading">
                <h3>{tr('取景，意味着取舍。')}</h3>
                <button className="text-button" onClick={() => setReference((v) => !v)}>
                  {tr(reference ? '看你的取景' : '看另一种取景')} ⇄
                </button>
              </div>
              <Art
                source={cropSVG(reference ? refCrop : crop.value)}
                alt={tr(reference ? '预标注的参考取景，侧重突出人物' : '你提交的定格取景')}
              />
              <p>
                {tr(
                  reference
                    ? '这个参考取景更靠近人物，减少周边环境。它是一种表达方向，并非标准答案。'
                    : r.evidence.find((e) => e.id === 'q05-crop')?.fact,
                )}
              </p>
              <button className="text-button" onClick={() => setPractice(true)}>
                {tr('做一张练习副本 ↗')}
              </button>
            </article>
          )}
          <div className="making-notes">
            {palette?.type === 'palette' && (
              <article>
                <Tag>{tr('配色')}</Tag>
                <h3>{tr('颜色，也在分配注意力。')}</h3>
                <p>
                  {tr(r.evidence.find((e) => e.id === 'q08-palette')?.fact)}
                  {tr(' ')}
                  {tr('试着交换背景与点缀的面积，观察感觉如何变化。')}
                </p>
              </article>
            )}
            {poster?.type === 'poster' && (
              <article>
                <Tag>{tr('海报')}</Tag>
                <h3>{tr('让重要的信息被看见。')}</h3>
                <p>{tr(r.evidence.find((e) => e.id === 'q10-poster')?.fact)}</p>
                <p>
                  {tr('当前文字与背景的对比约为')}
                  {tr(' ')}
                  {tr(contrast(poster.value.colors[0], poster.value.colors[1]).toFixed(1))}:1.
                  {tr(
                    contrast(poster.value.colors[0], poster.value.colors[1]) < 4.5
                      ? '部分小字可能不易阅读，可试着拉开明暗。'
                      : '纯背景上的明暗差较清楚；图形叠加处仍需单独观察。',
                  )}
                </p>
              </article>
            )}
            {outfit?.type === 'outfit' && (
              <article>
                <Tag>{tr('搭配')}</Tag>
                <h3>{tr('你照顾的是一种关系。')}</h3>
                <p>
                  {tr(r.evidence.find((e) => e.id === 'q12-outfit')?.fact)}
                  {tr(' ')}
                  {tr('这描述了本次取舍，不代表日常风格。')}
                </p>
              </article>
            )}
            {r.evidence
              .filter((e) => e.id.endsWith('-observe'))
              .map((e) => (
                <article key={e.id}>
                  <Tag>
                    {tr('视觉观察 · 第')}
                    {tr(e.questionId === 'q14' ? '14' : '15')} {tr('题')}
                  </Tag>
                  <p>{tr(e.fact)}</p>
                </article>
              ))}
            {!['q05', 'q08', 'q10', 'q12', 'q14', 'q15'].some(
              (id) => s.answers[id] && s.answers[id].type !== 'skip',
            ) && (
              <p className="gentle-empty">{tr('你跳过了动手与观察题，这里暂不生成任务反馈。')}</p>
            )}
          </div>
        </div>
      </section>
      <section className="report-section exercises">
        <div className="section-title">
          <span>05 / KEEP LOOKING</span>
          <h2>{tr('眼光，可以继续玩下去。')}</h2>
          <p>{tr('三个五分钟练习，让今天的选择有下一集。')}</p>
        </div>
        <div className="exercise-grid">
          {r.exercises.map((e, i) => (
            <div key={e}>
              <span>0{tr(i + 1)}</span>
              <p>{tr(e)}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="report-end">
        <Eye />
        <h2>{tr('喜欢什么，也是在认识自己。')}</h2>
        <p>{tr('把这一次的眼光留住，过段时间再来看看。')}</p>
        <div>
          <button
            className="primary"
            onClick={() => onExport(shareSVG(s, undefined, locale), tr('我的审美DNA.png'))}
          >
            {tr('保存审美卡 ↓')}
          </button>
          <button className="secondary" onClick={onMarkdown}>
            {tr('下载完整文字报告 ↓')}
          </button>
        </div>
        <small>{tr(SOURCE_NOTE)}</small>
      </section>
      <footer className="footer">
        <span>{tr('审美 DNA · 好看，由你来定义。')}</span>
        <span>{tr('记录保存在当前设备')}</span>
      </footer>
      {practice && (
        <div className="modal-backdrop">
          <section
            className="modal wide"
            role="dialog"
            aria-modal="true"
            aria-label={tr('取景练习副本')}
          >
            <button
              className="modal-close"
              onClick={() => setPractice(false)}
              aria-label={tr('关闭练习')}
            >
              ×
            </button>
            <h2>{tr('再看一眼，会有什么不同？')}</h2>
            <p>{tr('这是一张副本，原来的作品和档案会保留。')}</p>
            <CropEditor
              initial={crop?.type === 'crop' ? { ...crop.value, frozen: false } : undefined}
              onChange={setPracticeDraft}
              practice
            />
            <button
              className="primary"
              disabled={practiceDraft?.type !== 'crop' || !practiceDraft.value.frozen}
              onClick={() =>
                practiceDraft?.type === 'crop' &&
                onExport(cropSVG(practiceDraft.value), tr('取景练习副本.png'))
              }
            >
              {tr('保存练习副本 ↓')}
            </button>
          </section>
        </div>
      )}
    </main>
  );
}
