import { useState } from 'react';
import { motion } from 'framer-motion';

interface ExpenseFormProps {
  onAddExpense: (expense: any) => Promise<void>;
}

export const ExpenseForm = ({ onAddExpense }: ExpenseFormProps) => {
  const [formData, setFormData] = useState({
    category: 'Food',
    description: '',
    amount: '',
    paymentMethod: 'Credit Card',
    date: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onAddExpense(formData);
    setFormData({ ...formData, description: '', amount: '' });
  };

  return (
    <motion.div className="bg-black/40 backdrop-blur-xl border border-white/10 p-6 rounded-[2rem] print:hidden">
      <h3 className="text-xl font-semibold mb-6">Add Expense</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm text-white/60 block mb-1">Category</label>
          <select className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white appearance-none" 
            value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
            {['Hotel', 'Food', 'Transport', 'Shopping', 'Entertainment', 'Activities', 'Miscellaneous'].map(c => (
              <option key={c} value={c} className="bg-zinc-900 border-none">{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm text-white/60 block mb-1">Description</label>
          <input type="text" required className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white"
                 value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
        </div>
        <div>
          <label className="text-sm text-white/60 block mb-1">Amount</label>
          <input type="number" required min="1" className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white"
                 value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-white/60 block mb-1">Method</label>
            <select className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white appearance-none"
                    value={formData.paymentMethod} onChange={e => setFormData({...formData, paymentMethod: e.target.value})}>
              {['Cash', 'Credit Card', 'UPI', 'Debit Card'].map(c => (
                 <option key={c} value={c} className="bg-zinc-900">{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm text-white/60 block mb-1">Date</label>
            <input type="date" required className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white"
                   value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
          </div>
        </div>
        <button type="submit" className="w-full mt-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl font-medium text-white shadow-lg hover:shadow-emerald-500/25 transition-all">
          Add Expense
        </button>
      </form>
    </motion.div>
  );
};
