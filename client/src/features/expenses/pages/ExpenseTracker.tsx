import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { expensesApi, IExpense } from '../../../services/api/expenses.api';

// Recharts colors
const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#64748b'];

export default function ExpenseTracker() {
  const { id: tripId } = useParams();
  
  const [expenses, setExpenses] = useState<IExpense[]>([]);
  const [summary, setSummary] = useState({ totalSpent: 0 });
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [dailyData, setDailyData] = useState<any[]>([]);
  
  // Need to know budget to calculate remaining. For simplicity we get it from an API or pass as prop.
  // Actually, wait - let's fetch trip details or just let it calculate based on what we have. 
  // Wait, I need trip details to get "total budget".
  // Let's implement fetching trip details here.
  const [tripBudget, setTripBudget] = useState(0);

  const fetchExpensesData = async () => {
    if (!tripId) return;
    try {
      const exps = await expensesApi.getTripExpenses(tripId);
      setExpenses(exps.data);

      const sum = await expensesApi.getExpenseSummary(tripId);
      setSummary(sum.data);

      const cats = await expensesApi.getCategoryBreakdown(tripId);
      setCategoryData(cats.data);

      const daily = await expensesApi.getDailyExpenseAnalytics(tripId);
      setDailyData(daily.data);

      // In real scenario we also fetch trip details to get tripBudget. We will fetch it from /api/v1/trips/:id 
      // but to keep imports simple we assume we have a way. I will add dynamic fetch natively.
      const res = await fetch(`http://localhost:5000/api/v1/trips/${tripId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const tData = await res.json();
      if(tData.success) {
        setTripBudget(tData.data.budget);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchExpensesData();
  }, [tripId]);

  const [formData, setFormData] = useState({
    category: 'Food',
    description: '',
    amount: '',
    paymentMethod: 'Credit Card',
    date: new Date().toISOString().split('T')[0]
  });

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tripId) return;
    try {
      await expensesApi.createExpense({
        tripId,
        category: formData.category,
        description: formData.description,
        amount: Number(formData.amount),
        paymentMethod: formData.paymentMethod,
        date: formData.date
      });
      fetchExpensesData();
      setFormData({ ...formData, description: '', amount: '' });
    } catch (err) {
      console.error('Error adding expense', err);
    }
  };
  
  const handleDelete = async (id: string) => {
    try {
      await expensesApi.deleteExpense(id);
      fetchExpensesData();
    } catch (err) {
      console.error(err);
    }
  };

  const remaining = tripBudget - (summary?.totalSpent || 0);
  const utilPercent = tripBudget > 0 ? ((summary?.totalSpent || 0) / tripBudget) * 100 : 0;
  
  let warningState = null;
  if (utilPercent >= 100) {
    warningState = <div className="text-red-500 font-bold mb-4">🚨 Budget exceeded</div>;
  } else if (utilPercent >= 80) {
    warningState = <div className="text-yellow-500 font-bold mb-4">⚠️ Approaching budget limit</div>;
  }

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 animate-fade-in text-white min-h-screen pt-24">
      
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold tracking-tight text-white/90">Finance Tracker</h1>
        <Link to={`/trips/${tripId}`} className="px-6 py-2 rounded-full bg-white/10 hover:bg-white/20 transition-all border border-white/10 backdrop-blur-md">
          Back to Trip
        </Link>
      </div>

      {warningState}

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div className="bg-black/40 backdrop-blur-xl border border-white/10 p-6 rounded-[2rem]">
          <p className="text-white/60 text-sm mb-1">Total Budget</p>
          <p className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-emerald-400">
            ₹{tripBudget.toLocaleString()}
          </p>
        </motion.div>
        <motion.div className="bg-black/40 backdrop-blur-xl border border-white/10 p-6 rounded-[2rem]">
          <p className="text-white/60 text-sm mb-1">Total Expenses</p>
          <p className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-rose-400">
            ₹{(summary?.totalSpent || 0).toLocaleString()}
          </p>
        </motion.div>
        <motion.div className="bg-black/40 backdrop-blur-xl border border-white/10 p-6 rounded-[2rem]">
          <p className="text-white/60 text-sm mb-1">Remaining Budget</p>
          <p className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">
            ₹{remaining.toLocaleString()}
          </p>
        </motion.div>
        <motion.div className="bg-black/40 backdrop-blur-xl border border-white/10 p-6 rounded-[2rem]">
          <p className="text-white/60 text-sm mb-1">Budget Utilization</p>
          <p className="text-3xl font-bold text-white/90">
            {utilPercent.toFixed(1)}%
          </p>
          <div className="w-full bg-white/10 rounded-full h-2 mt-3">
            <div className={`h-2 rounded-full ${utilPercent > 80 ? 'bg-red-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(utilPercent, 100)}%` }} />
          </div>
        </motion.div>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Col: Form and History */}
        <div className="lg:col-span-1 space-y-8">
          <motion.div className="bg-black/40 backdrop-blur-xl border border-white/10 p-6 rounded-[2rem]">
            <h3 className="text-xl font-semibold mb-6">Add Expense</h3>
            <form onSubmit={handleAddExpense} className="space-y-4">
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
        </div>

        {/* Right Col: Charts & Lists */}
        <div className="lg:col-span-2 space-y-8">
          {/* Charts Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div className="bg-black/40 backdrop-blur-xl border border-white/10 p-6 rounded-[2rem] h-[340px]">
              <h3 className="text-lg font-semibold mb-2">Category Distribution</h3>
              {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={categoryData} cx="50%" cy="45%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="total">
                      {categoryData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', borderColor: '#333', borderRadius: '12px' }} itemStyle={{ color: '#fff' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : <p className="text-white/40 mt-10 text-center">No data</p>}
            </motion.div>
            
            <motion.div className="bg-black/40 backdrop-blur-xl border border-white/10 p-6 rounded-[2rem] h-[340px]">
              <h3 className="text-lg font-semibold mb-2">Daily Spending</h3>
              {dailyData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailyData} margin={{ top: 20, right: 0, left: -20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff15" vertical={false} />
                    <XAxis dataKey="date" stroke="#ffffff50" tick={{ fill: '#ffffff50', fontSize: 12 }} />
                    <YAxis stroke="#ffffff50" tick={{ fill: '#ffffff50', fontSize: 12 }} />
                    <Tooltip cursor={{ fill: '#ffffff10' }} contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', borderColor: '#333', borderRadius: '12px' }} />
                    <Bar dataKey="total" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : <p className="text-white/40 mt-10 text-center">No data</p>}
            </motion.div>
          </div>

          {/* History */}
          <motion.div className="bg-black/40 backdrop-blur-xl border border-white/10 p-6 rounded-[2rem]">
            <h3 className="text-xl font-semibold mb-6">Recent Transactions</h3>
            {expenses.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-white/60 mb-2">No expenses recorded yet.</p>
                <p className="text-emerald-400 text-sm">Start tracking your travel spending.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {expenses.map(exp => (
                  <div key={exp._id} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                         {/* Simple Icon placeholder */}
                         <span className="text-xl text-white/70">💸</span>
                      </div>
                      <div>
                        <p className="font-medium text-white/90">{exp.description}</p>
                        <p className="text-xs text-white/50">{exp.category} • {exp.paymentMethod} • {new Date(exp.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <p className="font-bold text-emerald-400">₹{exp.amount.toLocaleString()}</p>
                      <button onClick={() => handleDelete(exp._id)} className="text-red-400/50 hover:text-red-400 p-2">✕</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
