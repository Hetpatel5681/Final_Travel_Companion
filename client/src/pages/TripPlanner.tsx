import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { getTripById, generateItineraryForTrip, generateNewItinerary } from '../features/trips/api/trips.api';

export function TripPlanner() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tripId = searchParams.get('tripId');
  
  const [formData, setFormData] = useState({
    destination: '',
    startDate: '',
    endDate: '',
    travelers: 2,
    budget: 1000,
    travelPreferences: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (tripId) {
      getTripById(tripId).then(res => {
        const t = res.data;
        setFormData({
          destination: t.destination.name,
          startDate: new Date(t.startDate).toISOString().split('T')[0],
          endDate: new Date(t.endDate).toISOString().split('T')[0],
          travelers: t.numberOfTravelers || 2,
          budget: t.budget || 1000,
          travelPreferences: ''
        });
      }).catch(err => console.error('Failed to hook existing trip', err));
    } else {
      const dest = searchParams.get('destination');
      if (dest) {
        setFormData(prev => ({ ...prev, destination: dest }));
      }
    }
  }, [searchParams, tripId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (!formData.destination || !formData.startDate || !formData.endDate) {
        throw new Error("Destination, start date, and end date are required.");
      }
      // Validating Date constraint locally
      if (new Date(formData.startDate) >= new Date(formData.endDate)) {
        throw new Error("End date must be broadly after the start date.");
      }
      
      if (tripId) {
        await generateItineraryForTrip(tripId, {
          preferences: formData.travelPreferences,
          budget: formData.budget,
          interests: []
        });
        navigate(`/dashboard/trips/${tripId}/itinerary`);
      } else {
        const response = await generateNewItinerary({
          ...formData,
          interests: []
        });
        
        if (response.success && response.data) {
          navigate(`/dashboard/trips/${response.data._id}/itinerary`);
        } else {
          throw new Error(response.message || 'Generation failed');
        }
      }
    } catch (err: any) {
       console.error("AI Generation Error", err);
       setError(err.response?.data?.message || err.message || 'Failed to generate itinerary. Please try again.');
    } finally {
       setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 mb-2">AI Trip Planner</h1>
        <p className="text-slate-600">Let AI craft the perfect itinerary for your next journey.</p>
      </div>
      
      <Card>
        <form className="space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 text-red-500 font-semibold text-sm p-3 rounded-lg">
              {error}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input 
              label="Where do you want to go?" 
              placeholder="e.g. Tokyo, Japan"
              name="destination"
              value={formData.destination}
              onChange={handleChange as any}
              required
            />
            <Input 
              label="Start Date" 
              type="date" 
              name="startDate"
              value={formData.startDate}
              onChange={handleChange as any}
              required
            />
            <Input 
              label="End Date" 
              type="date" 
              name="endDate"
              value={formData.endDate}
              onChange={handleChange as any}
              required
            />
            <Input 
              label="How many travelers?" 
              type="number"
              name="travelers"
              min="1"
              max="20"
              value={formData.travelers}
              onChange={handleChange as any}
              required
            />
            <Input 
              label="Budget (₹)" 
              type="number"
              name="budget"
              min="100"
              value={formData.budget}
              onChange={handleChange as any}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Travel Preferences</label>
            <textarea 
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500" 
              rows={4} 
              name="travelPreferences"
              value={formData.travelPreferences}
              onChange={handleChange}
              placeholder="e.g. I prefer historical sites and local food over busy tourist traps..."
            ></textarea>
          </div>
          <div className="flex justify-end pt-4">
            <Button size="lg" disabled={loading} type="submit">
               {loading ? 'Generating...' : 'Generate Itinerary'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
