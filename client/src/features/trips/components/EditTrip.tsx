import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getTripById, updateTrip } from '../api/trips.api';
import { TripForm, TripFormValues } from './TripForm';
import { formatDateForApi } from '../../../utils/date.utils';

export const EditTrip = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [initialData, setInitialData] = useState<Partial<TripFormValues> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrip = async () => {
      try {
        if (!id) return;
        const res = await getTripById(id);
        const trip = res.data;
        // Map backend model to form values
        setInitialData({
          title: trip.title,
          destination: trip.destination as any,
          startDate: trip.startDate,
          endDate: trip.endDate,
          numberOfTravelers: trip.numberOfTravelers,
          budget: trip.budget,
          currency: trip.currency as any,
          tripType: trip.tripType as any,
          travelStyle: trip.travelStyle,
          transportationMode: trip.transportationMode,
          accommodationPreference: trip.accommodationPreference,
          visibility: trip.visibility as any,
          notes: trip.notes,
          preferences: trip.preferences as any
        });
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to open trip details.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchTrip();
  }, [id]);

  const handleSubmit = async (data: TripFormValues) => {
    if (!id) return;
    setIsSaving(true);
    setError(null);
    try {
      await updateTrip(id, {
        ...data,
        startDate: formatDateForApi(data.startDate),
        endDate: formatDateForApi(data.endDate),
        destination: {
          ...data.destination
        }
      });
      navigate(`/trips/${id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'There was an error updating the trip.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="p-10 text-center text-slate-500 font-medium">Loading Trip Settings...</div>;
  }

  if (error && !initialData) {
    return (
      <div className="p-8 text-center text-red-600">
        <p>{error}</p>
        <Link to="/dashboard" className="text-blue-600 hover:underline mt-4 inline-block">Back to Dashboard</Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-10 bg-white/10 dark:bg-slate-900/30 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-[3rem] shadow-2xl my-8">
       <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-black text-slate-800 dark:text-white tracking-tight">Edit Trip Settings</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Adjust foundational dates and preferences.</p>
        </div>
        <Link to={`/trips/${id}`} className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white font-black uppercase tracking-widest text-xs flex items-center transition-colors mt-2">
          ✕ Cancel
        </Link>
      </div>
      {initialData && (
        <TripForm 
          initialValues={initialData} 
          onSubmit={handleSubmit} 
          isLoading={isSaving} 
          submitLabel="Save Changes" 
          error={error} 
        />
      )}
    </div>
  );
};
