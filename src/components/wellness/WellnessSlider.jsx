import { useId } from 'react';

const STOPS = [1, 2, 3, 4, 5, 6, 7];

export default function WellnessSlider({ label, value, onChange, leftAnchor, rightAnchor }) {
  const id = useId();

  return (
    <div className="mb-6">
      <label htmlFor={id} className="block text-sm font-semibold mb-2" style={{ color: '#e5e5e5' }}>
        {label}
      </label>

      {/* Slider track */}
      <div className="relative px-1">
        <input
          id={id}
          type="range"
          min={1}
          max={7}
          step={1}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="wellness-slider w-full"
        />

        {/* Tick marks */}
        <div className="flex justify-between px-[2px] mt-1">
          {STOPS.map((n) => (
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

      {/* Anchor labels */}
      <div className="flex justify-between mt-1">
        <span className="text-xs" style={{ color: '#888' }}>{leftAnchor}</span>
        <span className="text-xs" style={{ color: '#888' }}>{rightAnchor}</span>
      </div>

      {/* Custom slider styles */}
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
