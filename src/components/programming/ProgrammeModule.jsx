import { lazy, Suspense, useState } from 'react';
import { TabBar } from '../ui';

const TemplatesTab = lazy(() => import('./programme/TemplatesTab'));
const BuildTab     = lazy(() => import('./programme/BuildTab'));
const AssignTab    = lazy(() => import('./programme/AssignTab'));

const SUBTABS = [
  { id: 'build',     label: 'Build'     },
  { id: 'templates', label: 'Templates' },
  { id: 'assign',    label: 'Assign'    },
];

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
  const [subTab, setSubTab] = useState('build');
  // tick increments whenever a template is created or deleted, so the
  // Templates and Assign sub-tabs re-fetch the list when the user
  // navigates back to them.
  const [tick, setTick] = useState(0);
  const bumpTick = () => setTick(n => n + 1);

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

        <TabBar tabs={SUBTABS} active={subTab} onChange={setSubTab} className="mb-6 no-print" />

        <Suspense fallback={<SubTabLoader />}>
          {subTab === 'templates' && <TemplatesTab tick={tick} onChange={bumpTick} />}
          {subTab === 'build'     && <BuildTab     onTemplateSaved={bumpTick} />}
          {subTab === 'assign'    && <AssignTab    tick={tick} />}
        </Suspense>
      </div>
    </div>
  );
}
