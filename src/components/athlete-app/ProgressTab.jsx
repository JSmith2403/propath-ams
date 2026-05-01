import { TrendingUp } from 'lucide-react';

export default function ProgressTab() {
  return (
    <div className="px-4 pt-12 pb-6 flex flex-col items-center text-center">
      <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 bg-gold-50">
        <TrendingUp size={28} className="text-gold-600" />
      </div>
      <p className="text-h3 mb-1 text-ink-900">Track Progress</p>
      <p className="text-meta max-w-xs text-ink-500">
        Charts of your training, lifts and wellness over time will live here.
      </p>
      <span className="mt-4 text-micro font-bold uppercase px-3 py-1 rounded-full bg-gold-50 text-gold-600">
        Coming soon
      </span>
    </div>
  );
}
