import { Card } from '@/components/Card';
import { Button } from '@/components/Button';

export function BudgetPlanner() {
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Budget Planner</h1>
          <p className="text-slate-600">Manage your travel finances and set trip budgets.</p>
        </div>
        <Button>+ New Budget</Button>
      </div>
      <Card>
        <div className="text-center py-16 text-slate-500">
          <p className="mb-4">No budgets created yet.</p>
          <Button variant="outline">Create Your First Budget</Button>
        </div>
      </Card>
    </div>
  );
}
