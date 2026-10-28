import { outfitSVG } from '../../art.ts';
import { Art } from '../../components/ui.tsx';
import { REASONS } from '../../content.ts';
import { type Answer } from '../../core.ts';
import { useDraft } from '../../draft.ts';
import { useI18n } from '../../i18n/index.tsx';

export function OutfitEditor({
  initial,
  onChange,
}: {
  initial?: { item: number; reason: string };
  onChange: (a: Answer) => void;
}) {
  const { tr } = useI18n();

  const [v, setV] = useDraft(initial ?? { item: 0, reason: '' }, (value) =>
    onChange({ type: 'outfit', value }),
  );
  return (
    <div className="studio">
      <div className="studio-canvas outfit-preview">
        <Art
          source={outfitSVG(v.item)}
          alt={tr(`基础穿搭与${['原配件', '暖色围巾', '蓝色挎包', '棕色鞋履'][v.item]}`)}
        />
      </div>
      <div className="studio-controls">
        <span className="control-title">{tr('只换一件，也可以保留原样')}</span>
        <div className="outfit-options">
          {['保留原搭配', '加一条暖色围巾', '换一个蓝色挎包', '换一双棕色鞋'].map((t, i) => (
            <button
              key={t}
              className={v.item === i ? 'active' : ''}
              onClick={() => setV((o) => ({ ...o, item: i }))}
            >
              <span>0{tr(i + 1)}</span>
              {tr(t)}
              <span>{tr(v.item === i ? '✓' : '↗')}</span>
            </button>
          ))}
        </div>
        <span className="control-title">{tr('你主要在意的是……')}</span>
        <div className="chips">
          {REASONS.map((r) => (
            <button
              key={r}
              className={v.reason === r ? 'active' : ''}
              onClick={() => setV((o) => ({ ...o, reason: r }))}
            >
              {tr(r)}
            </button>
          ))}
        </div>
        <small>{tr('没有最时髦的答案，看看你在照顾什么关系。')}</small>
      </div>
    </div>
  );
}
