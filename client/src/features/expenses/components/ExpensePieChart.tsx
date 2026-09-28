import { motion } from 'framer-motion';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#64748b'];

interface ExpensePieChartProps {
  data: any[];
}

export const ExpensePieChart = ({ data }: ExpensePieChartProps) => {
  return (
    <motion.div className="bg-black/40 backdrop-blur-xl border border-white/10 p-6 rounded-[2rem] h-[340px] print:bg-white print:border-slate-300 print:text-black">
      <h3 className="text-lg font-semibold mb-2 print:text-slate-800">Category Distribution</h3>
      {data.length > 0 ? (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} cx="50%" cy="45%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="total">
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', borderColor: '#333', borderRadius: '12px' }} itemStyle={{ color: '#fff' }} />
          </PieChart>
        </ResponsiveContainer>
      ) : <p className="text-white/40 mt-10 text-center print:text-slate-500">No data</p>}
    </motion.div>
  );
};
