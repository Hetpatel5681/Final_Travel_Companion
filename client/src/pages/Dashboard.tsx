import { Card } from '../components/Card';
import { RecommendationSection } from '../features/destination/components/RecommendationSection';
import { formatCurrency } from '../utils/currency.utils';

export function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card hover className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-none shadow-md">
          <h3 className="text-lg font-medium opacity-90">Upcoming Trips</h3>
          <p className="text-4xl font-bold mt-2">2</p>
        </Card>
        <Card hover className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-none shadow-md">
          <h3 className="text-lg font-medium opacity-90">Total Saved Places</h3>
          <p className="text-4xl font-bold mt-2">14</p>
        </Card>
        <Card hover className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-none shadow-md">
          <h3 className="text-lg font-medium opacity-90">Budget Tracking</h3>
          <p className="text-4xl font-bold mt-2">{formatCurrency(24000)}</p>
        </Card>
      </div>
      
      <RecommendationSection />
      
      <div className="mt-12">
        <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center justify-between">
          <span>Recent Activity</span>
          <button className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">View all</button>
        </h3>
        <Card className="border border-slate-100 shadow-sm">
          <div className="text-center py-12 text-slate-500">
            No recent activity yet. Start planning a trip!
          </div>
        </Card>
      </div>
    </div>
  );
}
