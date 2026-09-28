import { Input } from '../components/Input';
import { Card } from '../components/Card';
import { Button } from '../components/Button';

export function DestinationExplorer() {
  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <h1 className="text-4xl font-bold text-slate-800">Explore Destinations</h1>
        <p className="text-slate-600">Discover beautiful places for your next adventure.</p>
        <div className="flex flex-col sm:flex-row gap-2 mt-6 justify-center">
          <Input placeholder="Search for cities, countries, or landmarks..." className="w-full sm:w-96" />
          <Button>Search</Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} hover className="p-0 overflow-hidden group cursor-pointer border-none shadow-md">
            <div className="h-48 bg-slate-200 animate-pulse relative">
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
              <h3 className="absolute bottom-4 left-6 text-white text-xl font-bold z-20">Destination {i}</h3>
            </div>
            <div className="p-6">
              <p className="text-sm text-slate-500 line-clamp-2">A beautiful placeholder destination with amazing sights and incredible experiences waiting for you.</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
