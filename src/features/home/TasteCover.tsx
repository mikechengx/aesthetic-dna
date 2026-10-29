import { useI18n } from '../../i18n/index.tsx';

/** Original vector cover; homepage artwork stays separate from exercise photographs. */
export function TasteCover() {
  const { locale } = useI18n();
  return (
    <svg
      className="taste-cover"
      viewBox="0 0 640 500"
      role="img"
      aria-label={
        locale === 'zh'
          ? '蓝、粉、青柠色的原创眼睛图形封面'
          : 'Original blue, pink and lime eye graphic cover'
      }
    >
      <rect width="640" height="500" fill="#324cff" />
      <path d="M28 62H612" stroke="#fff9e8" strokeOpacity=".5" />
      <g fill="#fff9e8" fontFamily="Arial,sans-serif" fontSize="10" letterSpacing="2">
        <text x="28" y="37">
          AESTHETIC DNA
        </text>
        <text x="612" y="37" textAnchor="end">
          A STUDY IN SEEING / 03
        </text>
      </g>
      <circle cx="525" cy="153" r="65" fill="#ff91bd" />
      <path d="M492 105v30m-15-15h30" stroke="#324cff" strokeWidth="2" />
      <g fill="#fff9e8" fontFamily="Georgia,serif" fontSize="79" letterSpacing="-4">
        <text x="28" y="151">
          A point
        </text>
        <text x="29" y="232" fontStyle="italic">
          of view.
        </text>
      </g>
      <g transform="rotate(-12 370 335)">
        <path d="M109 335Q370 116 617 335Q370 550 109 335Z" fill="#ddf86a" />
        <circle cx="370" cy="335" r="98" fill="#fff9e8" />
        <circle cx="370" cy="335" r="64" fill="#202c48" />
        <circle cx="393" cy="311" r="17" fill="#fff9e8" />
        <path d="M140 335H184m376 0h29" stroke="#202c48" strokeWidth="2" />
      </g>
      <path d="M46 319v47m-24-24h48" stroke="#ff91bd" strokeWidth="2" />
      <path d="M29 454H611" stroke="#fff9e8" strokeOpacity=".5" />
      <g fill="#fff9e8" fontFamily="Arial,sans-serif" fontSize="10" letterSpacing="2">
        <text x="29" y="478">
          NO TWO EYES SEE ALIKE.
        </text>
        <text x="611" y="478" textAnchor="end">
          LOOK CLOSER ↗
        </text>
      </g>
    </svg>
  );
}
