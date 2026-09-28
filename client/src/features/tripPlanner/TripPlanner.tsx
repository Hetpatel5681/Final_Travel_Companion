import { Card } from '@/components/Card';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';

export function TripPlanner() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white drop-shadow-md mb-2">AI Trip Planner</h1>
        <p className="text-slate-200">Let AI Travel Companion craft the perfect itinerary for your next journey.</p>
      </div>
      
      <Card>
        <form className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input label="Where do you want to go?" placeholder="e.g. Tokyo, Japan" />
            <Input label="When are you traveling?" type="date" />
            <Input label="How many days?" type="number" placeholder="5" />
            <Input label="Budget Level" placeholder="Select budget..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-white mb-2 ml-1">Travel Preferences</label>
            <textarea className="w-full px-4 py-3 rounded-[1.5rem] border bg-white/10 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-300 text-white placeholder-white/50 border-white/20" rows={4} placeholder="e.g. I prefer historical sites and local food over busy tourist traps..."></textarea>
          </div>
          <div className="flex justify-end pt-4">
            <Button size="lg">Generate Itinerary</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
