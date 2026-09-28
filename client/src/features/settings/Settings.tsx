import { Card } from '@/components/Card';

export function Settings() {
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-black tracking-tight text-slate-800 dark:text-white mb-2">Application Settings</h1>
        <p className="text-slate-600 dark:text-slate-400 font-medium">Configure global preferences and defaults.</p>
      </div>
      <Card>
        <div className="py-12 text-center text-slate-500">
          Settings configuration coming soon.
        </div>
      </Card>
    </div>
  );
}
