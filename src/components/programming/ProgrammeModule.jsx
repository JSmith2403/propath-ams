import { lazy, Suspense, useState } from 'react';

const TemplatesTab = lazy(() => import('./programme/TemplatesTab'));
const BuildTab     = lazy(() => import('./programme/BuildTab'));
const AssignTab    = lazy(() => import('./programme/AssignTab'));

const SUBTABS = [
  { id: 'templates', label: 'Templates' },
  { id: 'build',     label: 'Build'     },
  { id: 'assign',    label: 'Assign'    },
];

// Sub-tab bar — matches Physical Development sub-tab styling.
function SubTabBar({ active, onChange }) {
  return (
    <div className="border-b border-gray-200 mb-6 no-print">
      <div className="flex">
        {SUBTABS.map(t => (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            className="relative px-4 py-2.5 text-sm font-medium transition-colors"
            style={{
              color: active === t.id ? '#A58D69' : '#6b7280',
              borderBottom: active === t.id ? '2px solid #A58D69' : '2px solid transparent',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function SubTabLoader() {
  return (
    <div className="flex items-center justify-center py-16">
      <div
        className="w-8 h-8 border-2 rounded-full animate-spin"
        style={{ borderColor: '#e5e7eb', borderTopColor: '#A58D69' }}
      />
    </div>
  );
}

/**
 * ProgrammeModule (Brief 3.5 Part C) — top-level Programme page.
 *
 * Three sub-tabs:
 *   • Templates — saved block / session / exercise templates (Brief 5)
 *   • Build     — new template and one-off block creation (Brief 4)
 *   • Assign    — apply templates to athletes (Brief 5)
 *
 * Defaults to Templates on first entry. Sub-tab state is local to the
 * page so navigating away and back returns to whichever tab was last
 * open during the session.
 */
export default function ProgrammeModule() {
  const [subTab, setSubTab] = useState('templates');

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="px-8 py-6">
        <div className="mb-6">
          <h2 className="text-lg font-bold" style={{ color: '#1C1C1C' }}>
            Programme
          </h2>
          <p className="text-sm mt-1" style={{ color: '#6b7280' }}>
            Templates, build, and assignment tools for training programmes.
          </p>
        </div>

        <SubTabBar active={subTab} onChange={setSubTab} />

        <Suspense fallback={<SubTabLoader />}>
          {subTab === 'templates' && <TemplatesTab />}
          {subTab === 'build'     && <BuildTab     />}
          {subTab === 'assign'    && <AssignTab    />}
        </Suspense>
      </div>
    </div>
  );
}
