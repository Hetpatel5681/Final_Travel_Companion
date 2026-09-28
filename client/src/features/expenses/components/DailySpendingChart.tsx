import { motion } from 'framer-motion';
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar } from 'recharts';

interface DailySpendingChartProps {
  data: any[];
}

export const DailySpendingChart = ({ data }: DailySpendingChartProps) => {
  return (
    <motion.div className="bg-black/40 backdrop-blur-xl border border-white/10 p-6 rounded-[2rem] h-[340px] print:bg-white print:border-slate-300 print:text-black">
      <h3 className="text-lg font-semibold mb-2 print:text-slate-800">Daily Spending</h3>
      {data.length > 0 ? (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 0, left: -20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff15" vertical={false} />
            <XAxis dataKey="date" stroke="#ffffff50" tick={{ fill: '#ffffff50', fontSize: 12 }} />
            <YAxis stroke="#ffffff50" tick={{ fill: '#ffffff50', fontSize: 12 }} />
            <Tooltip cursor={{ fill: '#ffffff10' }} contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', borderColor: '#333', borderRadius: '12px' }} />
            <Bar dataKey="total" fill="#10b981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      ) : <p className="text-white/40 mt-10 text-center print:text-slate-500">No data</p>}
    </motion.div>
  );
};
