import { Card } from '../components/Card';
import { Button } from '../components/Button';

export function ExpenseTracker() {
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Expense Tracker</h1>
          <p className="text-slate-600">Track your spending during your trips.</p>
        </div>
        <Button>+ Add Expense</Button>
      </div>
      
      <Card>
         <div className="overflow-x-auto">
           <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 text-sm">
                  <th className="py-4 px-6 font-medium">Date</th>
                  <th className="py-4 px-6 font-medium">Description</th>
                  <th className="py-4 px-6 font-medium">Category</th>
                  <th className="py-4 px-6 font-medium text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-500">No expenses recorded yet.</td>
                </tr>
              </tbody>
           </table>
         </div>
      </Card>
    </div>
  );
}
