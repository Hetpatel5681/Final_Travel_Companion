import { Card } from '@/components/Card';

export function Maps() {
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-black tracking-tight text-slate-800 dark:text-white mb-2">Interactive Maps</h1>
        <p className="text-slate-600 dark:text-slate-400 font-medium">Plot your routes and visualize your journeys.</p>
      </div>
      <Card>
        <div className="py-12 text-center text-slate-500">
          Maps integration coming soon.
        </div>
      </Card>
    </div>
  );
}
