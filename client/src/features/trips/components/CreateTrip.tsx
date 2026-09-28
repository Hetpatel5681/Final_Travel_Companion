import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TripForm, TripFormValues } from './TripForm';
import { createTrip } from '../api/trips.api';
import { formatDateForApi } from '../../../utils/date.utils';

export const CreateTrip = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: TripFormValues) => {
    setIsLoading(true);
    setError(null);
    try {
      // Create request mapping to Dto
      const response = await createTrip({
  ...data,
  startDate: formatDateForApi(data.startDate),
  endDate: formatDateForApi(data.endDate),
  destination: {
    ...data.destination,
  },
});
      
      const createdTripId = response.data._id;
      // Simple successful creation toast replacement could be here
      navigate(`/trips/${createdTripId}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'There was an error creating the trip.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-10 bg-white/10 dark:bg-slate-900/30 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-[3rem] shadow-2xl my-8">
      <div className="mb-8">
        <h1 className="text-4xl font-black text-slate-800 dark:text-white tracking-tight">Plan a New Architecture</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Provide the foundational details for your upcoming adventure.</p>
      </div>
      <TripForm onSubmit={handleSubmit} isLoading={isLoading} submitLabel="Create Trip" error={error} />
    </div>
  );
};
