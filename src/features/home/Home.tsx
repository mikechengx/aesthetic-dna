import { cropSVG } from '../../art.ts';
import { Arrow, Art } from '../../components/ui.tsx';
import { defaultPalette, defaultCrop, type Session } from '../../core.ts';
import { useI18n } from '../../i18n/index.tsx';
import { POSTERS } from '../../posters.ts';
import { PosterImage } from '../posters/PosterImage.tsx';
import { WorldPosterShelf } from '../posters/PosterShelf.tsx';

export function Home({
  session,
  start,
  resume,
  report,
}: {
  session: Session | null;
  start: () => void;
  resume: () => void;
  report: () => void;
}) {
  const { tr, locale } = useI18n();

  return (
    <>
      <main className="home">
        <section className="hero-copy">
          <div className="eyebrow">
            <span className="tiny-dot" /> A LITTLE EXPERIMENT, ALL ABOUT YOU
          </div>
          <h1>
            {locale === 'en' ? (
              <>
                Your eyes.
                <br />
                Your rules.
                <br />
                <span className="hand-circle">
                  Your DNA.
                  <svg viewBox="0 0 240 110" preserveAspectRatio="none" aria-hidden="true">
                    <path d="M228 24C181-5 36-1 12 41s32 61 112 57 124-34 107-60C209 6 69-3 26 23" />
                  </svg>
                </span>
              </>
            ) : (
              <>
                好看这件事，
                <br />
                你有自己的
                <span className="hand-circle">
                  偏心
                  <svg viewBox="0 0 240 110" preserveAspectRatio="none" aria-hidden="true">
                    <path d="M228 24C181-5 36-1 12 41s32 61 112 57 124-34 107-60C209 6 69-3 26 23" />
                  </svg>
                </span>
                。
              </>
            )}
          </h1>
          <p className="hero-desc">
            {tr('有些颜色，一眼来电。有些画面，偏偏忘不掉。')}
            <br />
            {tr('从真实海报到你的定格，把喜欢拼成一种主张。')}
            <strong>{tr('不是随便选选，是你的眼光在发言。')}</strong>
          </p>
          <div className="hero-actions">
            <button
              className="primary large"
              onClick={session ? (session.done ? report : resume) : start}
            >
              {tr(
                session
                  ? session.done
                    ? '打开我的审美档案'
                    : '继续上次的实验'
                  : '看看我的审美 DNA',
              )}
              <Arrow />
            </button>
            {session && (
              <button className="text-button" onClick={start}>
                {tr('重新开始 ↻')}
              </button>
            )}
          </div>
          <div className="hero-meta">
            <span>{tr('16 个互动步骤')}</span>
            <i />
            <span>{tr('约 6–10 分钟')}</span>
            <i />
            <span>{tr('无需注册')}</span>
          </div>
        </section>
        <section className="hero-art" aria-label={tr('取景、海报与配色的创作示例')}>
          <div className="orbit-text">YOUR EYES. YOUR RULES.</div>
          <div className="hero-image">
            <Art
              source={cropSVG(defaultCrop())}
              alt={
                locale === 'zh'
                  ? '东方明珠旁的人物取景练习，AI 生成写实素材'
                  : 'A person and the Oriental Pearl Tower, an AI-generated framing scenario'
              }
            />
            <div className="viewfinder">
              <i />
              <i />
              <i />
              <i />
              <div className="focus-cross">＋</div>
            </div>
            <div className="image-label">
              <span className="record-dot" /> FIND YOUR OWN FRAME <span>01 / 03</span>
            </div>
          </div>
          <div className="floating-poster">
            <PosterImage poster={POSTERS[1]} eager />
            <span>EEAAO / POSTER VIA A24</span>
          </div>
          <div className="floating-palette">
            <div className="palette-mini">
              {defaultPalette().colors.map((c) => (
                <i key={c} style={{ background: c }} />
              ))}
            </div>
            <div>
              <span>{tr('今天的偏心')}</span>
              <span>60 / 30 / 10</span>
            </div>
          </div>
          <span className="hand-note">
            {tr('你的眼睛，')}
            <br />
            {tr('比你更了解你。')}
            <svg viewBox="0 0 130 60" aria-hidden="true">
              <path d="M4 5Q13 63 117 31M103 23l17 7-13 14" />
            </svg>
          </span>
        </section>
      </main>
      <div className="taste-ticker">
        <span>GOOD TASTE. NO SAME TASTE.</span>
        <span>✳</span>
        <span>{tr('好看，由你来定义。')}</span>
        <span>✳</span>
        <span>MORE COLOR. MORE YOU.</span>
      </div>
      <WorldPosterShelf />
      <section className="home-bottom">
        <div className="bottom-intro">
          <span className="number-label">01 — 03</span>
          <h2>{tr('把直觉，变成看得见的自己。')}</h2>
          <p>{tr('没有统一审美答案，每一次选择都是线索。')}</p>
        </div>
        <div className="feature">
          <span className="feature-no">01 / LOOK</span>
          <h3>{tr('先凭感觉')}</h3>
          <p>
            {tr('海报、建筑、服装。')}
            <br />
            {tr('留下第一眼的偏爱。')}
          </p>
        </div>
        <div className="feature">
          <span className="feature-no">02 / MAKE</span>
          <h3>{tr('换你出手')}</h3>
          <p>
            {tr('定格一帧，搭一组色。')}
            <br />
            {tr('做三件属于自己的作品。')}
          </p>
        </div>
        <div className="feature">
          <span className="feature-no">03 / DISCOVER</span>
          <h3>{tr('看见规律')}</h3>
          <p>
            {tr('让选择互相呼应。')}
            <br />
            {tr('收下一份有依据的审美档案。')}
          </p>
        </div>
      </section>
      <footer className="footer">
        <span>{tr('审美 DNA · 好看，由你来定义。')}</span>
        <span>{tr('真实海报 × 原创实验 / VOL. 02')}</span>
      </footer>
    </>
  );
}
