interface BudgetAlertProps {
  utilPercent: number;
}

export const BudgetAlert = ({ utilPercent }: BudgetAlertProps) => {
  if (utilPercent >= 100) {
    return (
      <div className="bg-red-500/20 border border-red-500 text-red-100 p-4 rounded-xl flex items-center gap-3 backdrop-blur-md mb-6 shadow-lg shadow-red-500/10">
        <span className="text-2xl">🚨</span>
        <div>
          <h4 className="font-bold">Critical: Budget Exceeded</h4>
          <p className="text-sm opacity-90">You have surpassed your hard budget. Please track expenditures closely.</p>
        </div>
      </div>
    );
  } else if (utilPercent >= 80) {
    return (
      <div className="bg-orange-500/20 border border-orange-500 text-orange-100 p-4 rounded-xl flex items-center gap-3 backdrop-blur-md mb-6 shadow-lg shadow-orange-500/10">
        <span className="text-2xl">⚠️</span>
        <div>
          <h4 className="font-bold">Warning: Approaching Budget Limit</h4>
          <p className="text-sm opacity-90">You have used {utilPercent.toFixed(1)}% of your allowed budget.</p>
        </div>
      </div>
    );
  } else if (utilPercent >= 50) {
    return (
      <div className="bg-blue-500/20 border border-blue-500 text-blue-100 p-4 rounded-xl flex items-center gap-3 backdrop-blur-md mb-6 shadow-lg shadow-blue-500/10">
        <span className="text-2xl">💡</span>
        <div>
          <h4 className="font-bold">Informational: Halfway Mark</h4>
          <p className="text-sm opacity-90">You have passed 50% of your budget. Spend wisely.</p>
        </div>
      </div>
    );
  }
  
  return null;
};
