import { type ReactNode } from 'react';
import { uri } from '../art.ts';
import { useI18n } from '../i18n/index.tsx';

export function Eye({ small = false }: { small?: boolean }) {
  return (
    <svg
      width={small ? 30 : 42}
      height={small ? 30 : 42}
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M4 24S11 12 24 12s20 12 20 12-7 12-20 12S4 24 4 24Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <circle cx="24" cy="24" r="6" fill="currentColor" />
      <path
        d="M24 3v5m0 32v5M7 8l4 4m26 25 4 4M41 8l-4 4M11 37l-4 4"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}

export const Arrow = () => <span aria-hidden="true">↗</span>;

export function Header({ home, onAbout }: { home: () => void; onAbout: () => void }) {
  const { tr, locale, setLocale } = useI18n();

  return (
    <header className="header">
      <button className="brand" onClick={home} aria-label={tr('审美 DNA 首页')}>
        <Eye small />
        <span>
          {tr('审美')}
          <b>DNA</b>
        </span>
      </button>
      <div className="nav-note">VOL. 03 / TASTE HAS ATTITUDE</div>
      <div className="header-actions">
        <button className="text-button about-link" onClick={onAbout}>
          <span className="about-long">{tr('关于这场实验')}</span>
          <span className="about-short">{locale === 'en' ? 'About' : '关于'}</span>
          <span>↗</span>
        </button>
        <div className="language-switch" role="group" aria-label="Language / 语言">
          <button lang="en" aria-pressed={locale === 'en'} onClick={() => setLocale('en')}>
            EN
          </button>
          <span>/</span>
          <button lang="zh-CN" aria-pressed={locale === 'zh'} onClick={() => setLocale('zh')}>
            中文
          </button>
        </div>
      </div>
    </header>
  );
}

export function Art({
  source,
  className = '',
  alt,
}: {
  source: string;
  className?: string;
  alt: string;
}) {
  const { tr } = useI18n();

  return <img className={className} src={uri(source)} alt={tr(alt)} draggable={false} />;
}

export function Tag({ children }: { children: ReactNode }) {
  const { tr } = useI18n();

  return <span className="tag">{tr(children)}</span>;
}
