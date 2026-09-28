import { motion } from 'framer-motion';

interface FinancialInsightsProps {
  categoryData: any[];
  totalSpent: number;
  remainingBudget: number;
}

export const FinancialInsights = ({ categoryData, totalSpent, remainingBudget }: FinancialInsightsProps) => {
  const generateInsights = () => {
    const insights: string[] = [];
    if (!categoryData || categoryData.length === 0) {
      return ["Start logging expenses to get personalized AI financial insights!"];
    }

    // Top spending category
    const topCategory = categoryData[0];
    if (topCategory && totalSpent > 0 && topCategory.total > 0) {
      const percentage = Math.round((topCategory.total / totalSpent) * 100);
      insights.push(`${topCategory.category} accounts for ${percentage}% of your spending.`);
    }

    // Check specific anomalies (mocked AI bounds)
    const transport = categoryData.find(c => c.category === 'Transport');
    if (transport && totalSpent > 0 && (transport.total / totalSpent) > 0.3) {
       insights.push(`Transportation costs are above average (${Math.round((transport.total / totalSpent) * 100)}%). Consider walking or public transit.`);
    }

    // Remaining capacity logic
    if (totalSpent > 0) {
      const avgSpentPerCategory = totalSpent / categoryData.length;
      if (remainingBudget < avgSpentPerCategory) {
         insights.push("Your remaining budget is extremely constrained. Avoid additional purchases.");
      } else {
         // Assuming roughly a static burn rate.
         insights.push("Your remaining budget is healthy and well-optimized for the current pace.");
      }
    }

    return insights;
  };

  const insightsList = generateInsights();

  return (
    <motion.div className="bg-black/40 backdrop-blur-xl border border-white/10 p-6 rounded-[2rem] print:hidden">
      <div className="flex items-center gap-3 mb-4">
        <span className="w-10 h-10 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-xl">✨</span>
        <h3 className="text-xl font-bold">AI Financial Insights</h3>
      </div>
      <ul className="space-y-4">
        {insightsList.map((insight, idx) => (
          <li key={idx} className="flex gap-3 text-sm text-white/80 bg-white/5 p-4 rounded-xl border border-white/5 shadow-sm">
            <span className="text-purple-400 font-bold">●</span>
            {insight}
          </li>
        ))}
      </ul>
    </motion.div>
  );
};
