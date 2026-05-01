import { useId } from 'react';

/**
 * Hooper-style flexible slider — light theme.
 * Shows only the two endpoint anchors; the selected number lives in
 * a gold badge above the track.
 */
export default function FlexSlider({ label, value, onChange, min = 1, max = 7, leftAnchor, rightAnchor }) {
  const id = useId();
  const current = value ?? Math.round((min + max) / 2);

  return (
    <div className="mb-6">
      <label htmlFor={id} className="block text-meta font-semibold mb-2 text-ink-800">
        {label}
      </label>

      {/* Big current value above the track */}
      <div className="flex justify-center mb-2">
        <div className="rounded-md px-3 py-1 inline-flex items-baseline gap-1 bg-gold-50">
          <span className="text-h2 tabular-nums text-gold-600">
            {current}
          </span>
          <span className="text-meta text-ink-500">
            / {max}
          </span>
        </div>
      </div>

      <div className="relative px-1">
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          step={1}
          value={current}
          onChange={(e) => onChange(Number(e.target.value))}
          className="wellness-slider w-full"
        />
      </div>

      {/* Endpoint anchors only — Hooper convention */}
      <div className="flex justify-between mt-2 px-1 gap-3">
        <span className="text-caption leading-tight max-w-[40%] text-ink-500">
          <span className="font-bold text-ink-600">{min}</span>
          {leftAnchor ? `  ${leftAnchor}` : ''}
        </span>
        <span className="text-caption leading-tight max-w-[40%] text-right text-ink-500">
          {rightAnchor ? `${rightAnchor}  ` : ''}
          <span className="font-bold text-ink-600">{max}</span>
        </span>
      </div>

      <style>{`
        .wellness-slider {
          -webkit-appearance: none;
          appearance: none;
          height: 6px;
          border-radius: 3px;
          background: #e5e5e7;
          outline: none;
          cursor: pointer;
        }
        .wellness-slider::-webkit-slider-thumb {
          -webkit-appearance: none; appearance: none;
          width: 24px; height: 24px; border-radius: 50%;
          background: #A58D69; border: 2px solid #fff;
          cursor: pointer; box-shadow: 0 1px 4px rgba(15,15,15,0.18);
        }
        .wellness-slider::-moz-range-thumb {
          width: 24px; height: 24px; border-radius: 50%;
          background: #A58D69; border: 2px solid #fff;
          cursor: pointer; box-shadow: 0 1px 4px rgba(15,15,15,0.18);
        }
      `}</style>
    </div>
  );
}
