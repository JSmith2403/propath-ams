import { Library } from 'lucide-react';

export default function TemplatesTab() {
  return (
    <div
      className="rounded-xl px-8 py-16 text-center"
      style={{ backgroundColor: '#fff', border: '1px solid #e5e7eb' }}
    >
      <div
        className="mx-auto flex items-center justify-center mb-4"
        style={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          backgroundColor: 'rgba(67,126,141,0.10)',
          color: '#437E8D',
        }}
      >
        <Library size={26} strokeWidth={1.75} />
      </div>
      <h3 className="text-sm font-bold mb-1" style={{ color: '#1C1C1C' }}>
        Template library coming soon
      </h3>
      <p className="text-xs max-w-md mx-auto" style={{ color: '#6b7280' }}>
        This is where saved block, session, and exercise prescription templates will live.
      </p>
    </div>
  );
}
