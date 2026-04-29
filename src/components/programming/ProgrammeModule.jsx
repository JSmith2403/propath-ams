// ProgrammeModule — top-level Programme page (Brief 3.5 Part C will fill
// in Templates / Build / Assign sub-tabs). Stub shell for Part B testing.
//
// Hidden from the external role at the App.jsx level; this component
// assumes admin / co_admin reached it.

export default function ProgrammeModule() {
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

        <div
          className="rounded-xl p-12 text-center"
          style={{ backgroundColor: '#fff', border: '1px solid #e5e7eb' }}
        >
          <p className="text-sm" style={{ color: '#6b7280' }}>
            Programme module shell coming next.
          </p>
          <p className="text-xs mt-1" style={{ color: '#9ca3af' }}>
            Sub-tabs (Templates / Build / Assign) land in the next checkpoint.
          </p>
        </div>
      </div>
    </div>
  );
}
