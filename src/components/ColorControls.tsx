import { useEffect, useState } from 'react';
import { COLOR_STORIES, COLORS } from '../content.ts';
import { useI18n } from '../i18n/index.tsx';

export function ColorPicker({
  color,
  onColor,
  prefix = '选择颜色',
}: {
  color: string;
  onColor: (c: string) => void;
  prefix?: string;
}) {
  const { tr } = useI18n();

  const [family, setFamily] = useState('全部'),
    [hex, setHex] = useState(color);
  useEffect(() => setHex(color), [color]);
  const families = ['全部', '亮色', '柔雾', '自然', '深色'];
  const selected = COLORS.filter(
    (_, i) =>
      family === '全部' ||
      (family === '亮色' && [12, 14, 16, 17, 18, 20, 22, 24, 28, 31, 32, 33].includes(i)) ||
      (family === '柔雾' && [0, 4, 9, 11, 15, 21, 23, 26, 27, 30, 31, 34].includes(i)) ||
      (family === '自然' && [0, 1, 2, 3, 6, 7, 18, 19, 34, 35, 36].includes(i)) ||
      (family === '深色' && [3, 5, 8, 10, 13, 19, 25, 29, 35, 37].includes(i)),
  );
  return (
    <div className="color-picker">
      <div className="color-family">
        {families.map((f) => (
          <button key={f} className={family === f ? 'active' : ''} onClick={() => setFamily(f)}>
            {tr(f)}
          </button>
        ))}
      </div>
      <div className="color-grid expanded">
        {selected.map((c) => (
          <button
            key={c}
            aria-label={tr(`${prefix} ${c}`)}
            aria-pressed={color.toLowerCase() === c}
            style={{
              background: c,
              color: [
                '#faf8f2',
                '#efe5cd',
                '#ffd145',
                '#ffe787',
                '#d9f963',
                '#c6d9e2',
                '#f8d8e9',
                '#d6c8ff',
                '#d6f3ed',
              ].includes(c)
                ? '#202b58'
                : '#fff',
            }}
            onClick={() => onColor(c)}
          >
            {tr(color.toLowerCase() === c ? '✓' : '')}
          </button>
        ))}
      </div>
      <div className="custom-color">
        <label>
          <input
            type="color"
            aria-label={tr(`${prefix} 自定义取色`)}
            value={color}
            onChange={(e) => onColor(e.target.value)}
          />
          <span>{tr('任何颜色，随你。')}</span>
        </label>
        <input
          aria-label={tr(`${prefix} HEX`)}
          maxLength={7}
          value={hex}
          onChange={(e) => {
            const value = e.target.value;
            setHex(value);
            if (/^#[0-9a-f]{6}$/i.test(value)) onColor(value.toLowerCase());
          }}
          onBlur={() => setHex(color)}
        />
      </div>
    </div>
  );
}

export function ColorStories({ onSelect }: { onSelect: (colors: string[], name: string) => void }) {
  const { tr } = useI18n();

  return (
    <div className="color-stories">
      <div className="control-title">{tr('没有头绪？借一组颜色开场。')}</div>
      <div className="story-grid">
        {COLOR_STORIES.map((p) => (
          <button
            key={p.name}
            onClick={() => onSelect([...p.colors], p.name)}
            title={tr(p.note)}
            aria-label={tr(`套用配色 ${p.name}`)}
          >
            <span>
              {p.colors.map((c, i) => (
                <i key={i} style={{ background: c }} />
              ))}
            </span>
            <small>{tr(p.name)}</small>
          </button>
        ))}
      </div>
    </div>
  );
}
