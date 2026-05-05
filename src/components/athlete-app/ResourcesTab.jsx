import { useState } from 'react';
import { Apple, Brain, Flower, TrendingUp, ChevronLeft } from 'lucide-react';

// Each resource card. Image is a CSS gradient placeholder until real
// imagery is dropped in (gradient swatches kept distinct so the four
// cards still read as separate categories at a glance).
const RESOURCES = [
  {
    id:    'nutrition',
    label: 'Nutrition',
    icon:  Apple,
    gradient: 'linear-gradient(135deg, #6b3a1a 0%, #1c1c1c 100%)',
    intro: 'Fuelling for performance and recovery.',
    body:  'Your nutrition library lives here. Macronutrient targets, hydration plans, race-week fuelling, and post-session recovery meals will appear in this space as they are added by your performance team.',
  },
  {
    id:    'psychology',
    label: 'Psychology',
    icon:  Brain,
    gradient: 'linear-gradient(135deg, #1c1c1c 0%, #2a2a2a 100%)',
    intro: 'Mental skills + self-management.',
    body:  'Visualisation drills, focus routines, and mindset content from your coach drop here. Tap any item to read or save for later.',
  },
  {
    id:    'lifestyle',
    label: 'Lifestyle',
    icon:  Flower,
    gradient: 'linear-gradient(135deg, #d97a3c 0%, #b8541a 60%, #5e2a0a 100%)',
    intro: 'Sleep, recovery, daily habits.',
    body:  'Sleep hygiene, recovery routines, and habit-tracking content. Build the routines that protect your performance long-term.',
  },
  {
    id:    'future',
    label: 'Future Preparation',
    icon:  TrendingUp,
    gradient: 'linear-gradient(135deg, #5b3a1a 0%, #2c1f10 100%)',
    intro: 'Goals, planning, and what is next.',
    body:  'Long-term planning content — competition prep, off-season focus, education and university pathways. Reflect, plan, and revisit.',
  },
];

/**
 * ResourcesTab — bottom-nav destination on the athlete app.
 *
 * Top-level shows a grid of category cards (Nutrition / Psychology /
 * Lifestyle / Future Preparation). Tapping a card opens an inline
 * detail view with a back button — no router needed because we're
 * already inside a tab.
 *
 * Real content is dropped in by the coach later; the structure here
 * is the shell + placeholder copy so athletes see the surface land.
 */
export default function ResourcesTab() {
  const [openId, setOpenId] = useState(null);
  const open = openId ? RESOURCES.find(r => r.id === openId) : null;

  if (open) {
    const Icon = open.icon;
    return (
      <div className="px-4 py-4">
        <button
          onClick={() => setOpenId(null)}
          className="inline-flex items-center gap-1 text-meta text-ink-500 hover:text-ink-800 transition-colors mb-4"
        >
          <ChevronLeft size={14} />
          Resources
        </button>

        <div
          className="rounded-xl overflow-hidden mb-4 flex items-end p-5"
          style={{ background: open.gradient, minHeight: 180 }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-md"
              style={{ backgroundColor: 'rgba(255,255,255,0.18)' }}
            >
              <Icon size={22} className="text-white" strokeWidth={1.8} />
            </div>
            <div>
              <p className="text-h2 text-white font-bold leading-tight">{open.label}</p>
              <p className="text-meta text-white/75">{open.intro}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-ink-100 shadow-card p-4">
          <p className="text-body text-ink-700 leading-relaxed">{open.body}</p>
        </div>

        <p className="text-meta text-ink-400 text-center mt-6 italic">
          More content drops here as your coach adds it.
        </p>
      </div>
    );
  }

  return (
    <div className="px-4 py-4">
      <div className="mb-4">
        <h1 className="text-h2 text-ink-900 font-bold leading-tight">Resources</h1>
        <p className="text-meta text-ink-500 mt-1">
          Explore tools and insights to support your journey.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {RESOURCES.map(r => {
          const Icon = r.icon;
          return (
            <button
              key={r.id}
              onClick={() => setOpenId(r.id)}
              className="relative rounded-xl overflow-hidden text-left transition-transform active:scale-[0.98]"
              style={{ aspectRatio: '3 / 4', background: r.gradient }}
            >
              {/* Centered icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center backdrop-blur-md"
                  style={{ backgroundColor: 'rgba(255,255,255,0.16)' }}
                >
                  <Icon size={26} className="text-white" strokeWidth={1.6} />
                </div>
              </div>
              {/* Label */}
              <div
                className="absolute left-0 right-0 bottom-0 px-3 py-3"
                style={{
                  background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.55) 100%)',
                }}
              >
                <p className="text-meta font-bold text-white text-center">
                  {r.label}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
