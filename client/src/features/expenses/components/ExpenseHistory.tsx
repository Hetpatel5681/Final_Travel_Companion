import { motion } from 'framer-motion';
import { IExpense } from '../../../services/api/expenses.api';

interface ExpenseHistoryProps {
  expenses: IExpense[];
  onDeleteExpense: (id: string) => void;
}

export const ExpenseHistory = ({ expenses, onDeleteExpense }: ExpenseHistoryProps) => {
  const safeExpenses = Array.isArray(expenses) ? expenses : [];
  
  return (
    <motion.div className="bg-black/40 backdrop-blur-xl border border-white/10 p-6 rounded-[2rem] print:bg-white print:border-slate-300 print:text-black">
      <h3 className="text-xl font-semibold mb-6 print:text-slate-800">Recent Transactions</h3>
      {safeExpenses.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-white/60 mb-2 print:text-slate-500">No expenses recorded yet.</p>
          <p className="text-emerald-400 text-sm print:text-emerald-600">Start tracking your travel spending.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {safeExpenses.map(exp => (
            <div key={exp._id} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 print:bg-slate-50 print:border-slate-200">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-white/10 print:bg-slate-200 flex items-center justify-center shrink-0">
                   <span className="text-xl opacity-80">💸</span>
                </div>
                <div>
                  <p className="font-medium text-white/90 print:text-slate-800">{exp.description}</p>
                  <p className="text-xs text-white/50 print:text-slate-500">{exp.category} • {exp.paymentMethod} • {new Date(exp.date).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <p className="font-bold text-emerald-400 print:text-slate-800">₹{exp.amount.toLocaleString()}</p>
                <button onClick={() => onDeleteExpense(exp._id)} className="text-red-400/50 hover:text-red-400 p-2 print:hidden">✕</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};
