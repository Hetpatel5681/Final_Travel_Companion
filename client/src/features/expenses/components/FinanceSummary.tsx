import { motion } from 'framer-motion';

interface FinanceSummaryProps {
  tripBudget: number;
  totalSpent: number;
  remaining: number;
  utilPercent: number;
}

export const FinanceSummary = ({ tripBudget, totalSpent, remaining, utilPercent }: FinanceSummaryProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 print:grid-cols-4 print:gap-4 print:mb-4">
      <motion.div className="bg-black/40 backdrop-blur-xl border border-white/10 p-6 rounded-[2rem] print:bg-white print:border-slate-300 print:text-black">
        <p className="text-white/60 text-sm mb-1 print:text-slate-500">Total Budget</p>
        <p className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-emerald-400 print:text-teal-600">
          ₹{tripBudget.toLocaleString()}
        </p>
      </motion.div>
      <motion.div className="bg-black/40 backdrop-blur-xl border border-white/10 p-6 rounded-[2rem] print:bg-white print:border-slate-300 print:text-black">
        <p className="text-white/60 text-sm mb-1 print:text-slate-500">Total Expenses</p>
        <p className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-rose-400 print:text-red-500">
          ₹{totalSpent.toLocaleString()}
        </p>
      </motion.div>
      <motion.div className="bg-black/40 backdrop-blur-xl border border-white/10 p-6 rounded-[2rem] print:bg-white print:border-slate-300 print:text-black">
        <p className="text-white/60 text-sm mb-1 print:text-slate-500">Remaining Budget</p>
        <p className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400 print:text-emerald-500">
          ₹{remaining.toLocaleString()}
        </p>
      </motion.div>
      <motion.div className="bg-black/40 backdrop-blur-xl border border-white/10 p-6 rounded-[2rem] print:bg-white print:border-slate-300 print:text-black">
        <p className="text-white/60 text-sm mb-1 print:text-slate-500">Utilization</p>
        <p className="text-3xl font-bold text-white/90 print:text-slate-800">
          {utilPercent.toFixed(1)}%
        </p>
        <div className="w-full bg-white/10 rounded-full h-2 mt-3 print:bg-slate-200">
          <div className={`h-2 rounded-full ${utilPercent >= 80 ? 'bg-red-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(utilPercent, 100)}%` }} />
        </div>
      </motion.div>
    </div>
  );
};
