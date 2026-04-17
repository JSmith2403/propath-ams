import { useId } from 'react';

export default function WellnessSlider({ label, value, onChange, min = 1, max = 7, leftAnchor, rightAnchor }) {
  const id = useId();
  const stops = [];
  for (let i = min; i <= max; i++) stops.push(i);

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold mb-2" style={{ color: '#e5e5e5' }}>
        {label}
      </label>

      <div className="relative px-1">
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          step={1}
          value={value ?? min}
          onChange={(e) => onChange(Number(e.target.value))}
          className="wellness-slider w-full"
        />

        <div className="flex justify-between px-[2px] mt-1">
          {stops.map((n) => (
            <span
              key={n}
              className="text-xs font-medium"
              style={{ color: n === value ? '#A58D69' : '#666', minWidth: '14px', textAlign: 'center' }}
            >
              {n}
            </span>
          ))}
        </div>
      </div>

      <div className="flex justify-between mt-1">
        <span className="text-xs" style={{ color: '#888' }}>{leftAnchor}</span>
        <span className="text-xs" style={{ color: '#888' }}>{rightAnchor}</span>
      </div>

      <style>{`
        .wellness-slider {
          -webkit-appearance: none;
          appearance: none;
          height: 6px;
          border-radius: 3px;
          background: #333;
          outline: none;
          cursor: pointer;
        }
        .wellness-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: #A58D69;
          border: 2px solid #1C1C1C;
          cursor: pointer;
          box-shadow: 0 1px 4px rgba(0,0,0,0.4);
        }
        .wellness-slider::-moz-range-thumb {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: #A58D69;
          border: 2px solid #1C1C1C;
          cursor: pointer;
          box-shadow: 0 1px 4px rgba(0,0,0,0.4);
        }
      `}</style>
    </div>
  );
}
