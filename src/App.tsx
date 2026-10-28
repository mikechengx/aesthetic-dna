import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Eye, Header } from './components/ui.tsx';
import { QUESTIONS, SOURCE_NOTE } from './content.ts';
import { newSession, type Answer, type Session } from './core.ts';
import { useDialogAccessibility } from './dialog.ts';
import { downloadBlob, downloadPNG, markdown } from './export.ts';
import { QuestionView } from './features/experiment/Experiment.tsx';
import { Home } from './features/home/Home.tsx';
import { Report } from './features/report/Report.tsx';
import { useI18n } from './i18n/index.tsx';
import * as storage from './storage.ts';

export default function App() {
  const { tr, locale } = useI18n();

  useDialogAccessibility();
  const [session, setSession] = useState<Session | null>(null),
    [loaded, setLoaded] = useState(false),
    [page, setPage] = useState(
      location.hash.includes('report')
        ? 'report'
        : location.hash.includes('experiment')
          ? 'experiment'
          : 'home',
    );
  const [about, setAbout] = useState(false),
    [reset, setReset] = useState(false),
    [deleteConfirm, setDeleteConfirm] = useState(false),
    [notice, setNotice] = useState(''),
    [error, setError] = useState('');
  const queue = useRef(Promise.resolve());
  function nav(p: string) {
    location.hash = p === 'home' ? '#/' : `#/${p}`;
    setPage(p);
  }
  useEffect(() => {
    storage
      .load()
      .then((s) => {
        if (s?.versionNotice) setNotice(s.versionNotice);
        setSession(s ? { ...s, versionNotice: undefined } : null);
        if (!s) setPage('home');
      })
      .catch(() => setError('浏览器暂时无法保存记录；本次仍可体验，请及时导出作品。'))
      .finally(() => setLoaded(true));
    const listener = () =>
      setPage(
        location.hash.includes('report')
          ? 'report'
          : location.hash.includes('experiment')
            ? 'experiment'
            : 'home',
      );
    window.addEventListener('hashchange', listener);
    return () => window.removeEventListener('hashchange', listener);
  }, []);
  useEffect(() => {
    if (!loaded || !session) return;
    queue.current = queue.current
      .catch(() => {})
      .then(() => storage.save(session))
      .catch(() => setError('记录未能保存到设备；本次仍可继续，请在结束后导出作品。'));
  }, [session, loaded]);
  useLayoutEffect(() => {
    if (loaded && session) storage.backup(session);
  }, [session, loaded]);
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [page, session?.step]);
  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(''), 4500);
    return () => clearTimeout(t);
  }, [notice]);
  function start() {
    if (session) {
      setReset(true);
      return;
    }
    setSession(newSession());
    nav('experiment');
  }
  function fresh() {
    setReset(false);
    setSession(newSession());
    nav('experiment');
  }
  function submit(a: Answer, advance: boolean) {
    setSession((old) => {
      if (!old) return old;
      const q = QUESTIONS[old.step];
      return advance
        ? {
            ...old,
            answers: { ...old.answers, [q.id]: a },
            drafts: { ...old.drafts, [q.id]: a },
            step: old.step < 15 ? old.step + 1 : old.step,
            done: old.step === 15 ? true : old.done,
          }
        : { ...old, drafts: { ...old.drafts, [q.id]: a } };
    });
    if (advance && session?.step === 15) nav('report');
  }
  async function exportImage(source: string, name: string) {
    try {
      setNotice('正在生成图片…');
      await downloadPNG(source, name);
      setNotice('图片已生成，请查看浏览器下载。');
    } catch (e) {
      setNotice(e instanceof Error ? e.message : '生成失败，请重试');
    }
  }
  async function deleteData() {
    await queue.current;
    await storage.clear();
    setSession(null);
    setDeleteConfirm(false);
    setAbout(false);
    nav('home');
    setNotice('本次设备记录已删除。');
  }
  if (!loaded)
    return (
      <div className="loading">
        <Eye />
        <p>{tr('正在打开你的视觉实验…')}</p>
      </div>
    );
  return (
    <>
      <Header home={() => nav('home')} onAbout={() => setAbout(true)} />
      {error && (
        <div role="status" className="storage-warning">
          {tr(error)}
        </div>
      )}
      {page === 'experiment' && session ? (
        <QuestionView
          key={session.id + '-' + session.step}
          s={session}
          submit={submit}
          back={() => setSession((o) => (o ? { ...o, step: Math.max(0, o.step - 1) } : o))}
          home={() => nav('home')}
          report={() => nav('report')}
        />
      ) : page === 'report' && session ? (
        <Report
          s={session}
          edit={(n) => {
            setSession((o) => (o ? { ...o, step: n } : o));
            nav('experiment');
          }}
          onExport={exportImage}
          onMarkdown={() => {
            downloadBlob(
              new Blob([markdown(session, locale)], { type: 'text/markdown;charset=utf-8' }),
              tr('我的审美DNA报告.md'),
            );
            setNotice('完整文字报告已生成，作品请单独保存。');
          }}
          onHome={() => nav('home')}
        />
      ) : (
        <Home
          session={session}
          start={start}
          resume={() => nav('experiment')}
          report={() => nav('report')}
        />
      )}
      {notice && (
        <div className="toast" role="status">
          {tr(notice)}
        </div>
      )}
      {about && (
        <div className="modal-backdrop" onClick={() => setAbout(false)}>
          <section
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-label={tr('关于审美 DNA')}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close"
              aria-label={tr('关闭关于')}
              onClick={() => setAbout(false)}
            >
              ×
            </button>
            <Eye />
            <div className="eyebrow">ABOUT THIS EXPERIMENT</div>
            <h2>
              {tr('每双眼睛，')}
              <br />
              {tr('都有自己的取舍。')}
            </h2>
            <p>
              {tr('审美 DNA 通过选图与创作，观察你对秩序、色彩与密度的偏好，以及你如何组织画面。')}
            </p>
            <p>{tr('结果描述本次选择，不是固定人格、能力排名或科学诊断。「DNA」是产品隐喻。')}</p>
            <p>{tr(SOURCE_NOTE)}</p>
            <p>
              {tr(
                '无需注册，不上传答案或图片。记录通过浏览器保存在当前设备，清理网站数据可能导致丢失。',
              )}
            </p>
            <button
              className="secondary"
              onClick={() => {
                setAbout(false);
                start();
              }}
            >
              {tr('开始探索 ↗')}
            </button>
            {session && (
              <button className="danger text-button" onClick={() => setDeleteConfirm(true)}>
                {tr('删除本设备的实验记录')}
              </button>
            )}
          </section>
        </div>
      )}
      {reset && (
        <div className="modal-backdrop">
          <section
            className="modal compact"
            role="dialog"
            aria-modal="true"
            aria-label={tr('重新开始实验')}
          >
            <h2>{tr('再看世界一次？')}</h2>
            <p>{tr('重新开始会替换当前设备的这次记录。建议先保存报告和作品。')}</p>
            <div className="modal-actions">
              <button className="secondary" onClick={() => setReset(false)}>
                {tr('保留这次')}
              </button>
              <button className="primary" onClick={fresh}>
                {tr('重新开始 ↗')}
              </button>
            </div>
          </section>
        </div>
      )}
      {deleteConfirm && (
        <div className="modal-backdrop">
          <section
            className="modal compact"
            role="dialog"
            aria-modal="true"
            aria-label={tr('确认删除记录')}
          >
            <h2>{tr('删除这次实验记录？')}</h2>
            <p>{tr('已下载的文件会保留，当前设备里的答案和作品参数将被删除。')}</p>
            <div className="modal-actions">
              <button className="secondary" onClick={() => setDeleteConfirm(false)}>
                {tr('保留记录')}
              </button>
              <button
                className="primary"
                onClick={() => deleteData().catch(() => setNotice('删除失败，请重试。'))}
              >
                {tr('确认删除')}
              </button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
