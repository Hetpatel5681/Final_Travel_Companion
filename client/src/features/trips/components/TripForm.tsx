import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Card } from '@/components/Card';
import { supportedCurrencies } from '../../../utils/currency.utils';

const tripSchema = z.object({
  title: z.string().min(2, 'Title is required'),
  destination: z.object({
    name: z.string().min(2, 'Destination name is required'),
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().min(1, 'Country is required'),
  }),
  startDate: z.string().refine(val => !isNaN(Date.parse(val)), 'Valid start date is required'),
  endDate: z.string().refine(val => !isNaN(Date.parse(val)), 'Valid end date is required'),
  numberOfTravelers: z.number().min(1),
  budget: z.number().min(0, 'Budget must be at least 0'),
  currency: z.enum(['INR', 'USD', 'EUR', 'GBP', 'AED', 'JPY', 'AUD', 'CAD', 'SGD']),
  tripType: z.enum(['Solo', 'Family', 'Friends', 'Couple', 'Business', 'Honeymoon', 'Pilgrimage', 'Road Trip', 'Weekend', 'Adventure']),
  travelStyle: z.string().optional(),
  transportationMode: z.string().optional(),
  accommodationPreference: z.string().optional(),
  visibility: z.enum(['Private', 'Shared', 'Public']),
  notes: z.string().optional(),
  preferences: z.object({
    vegetarianOnly: z.boolean().optional(),
    wheelchairAccessible: z.boolean().optional(),
    petFriendly: z.boolean().optional(),
    avoidTolls: z.boolean().optional(),
    avoidCrowds: z.boolean().optional(),
    childFriendly: z.boolean().optional(),
    ecoFriendly: z.boolean().optional(),
  }).optional(),
}).refine(data => new Date(data.endDate) >= new Date(data.startDate), {
  message: 'End date must be after start date',
  path: ['endDate'],
});

export type TripFormValues = z.infer<typeof tripSchema>;

interface TripFormProps {
  initialValues?: Partial<TripFormValues>;
  onSubmit: (data: TripFormValues) => Promise<void>;
  isLoading: boolean;
  submitLabel?: string;
  error?: string | null;
}

export const TripForm = ({ initialValues, onSubmit, isLoading, submitLabel = 'Save Trip', error }: TripFormProps) => {
  const { register, handleSubmit, formState: { errors } } = useForm<TripFormValues>({
    resolver: zodResolver(tripSchema),
    defaultValues: {
      title: initialValues?.title || '',
      destination: {
        name: initialValues?.destination?.name || '',
        city: initialValues?.destination?.city || '',
        state: initialValues?.destination?.state || '',
        country: initialValues?.destination?.country || '',
      },
      startDate: initialValues?.startDate ? new Date(initialValues.startDate).toISOString().split('T')[0] : '',
      endDate: initialValues?.endDate ? new Date(initialValues.endDate).toISOString().split('T')[0] : '',
      numberOfTravelers: initialValues?.numberOfTravelers || 1,
      budget: initialValues?.budget || 0,
      currency: initialValues?.currency || 'INR',
      tripType: initialValues?.tripType as any || 'Solo',
      travelStyle: initialValues?.travelStyle || '',
      transportationMode: initialValues?.transportationMode || '',
      accommodationPreference: initialValues?.accommodationPreference || '',
      visibility: initialValues?.visibility as any || 'Private',
      notes: initialValues?.notes || '',
      preferences: {
        vegetarianOnly: initialValues?.preferences?.vegetarianOnly ?? false,
        wheelchairAccessible: initialValues?.preferences?.wheelchairAccessible ?? false,
        petFriendly: initialValues?.preferences?.petFriendly ?? false,
        avoidTolls: initialValues?.preferences?.avoidTolls ?? false,
        avoidCrowds: initialValues?.preferences?.avoidCrowds ?? false,
        childFriendly: initialValues?.preferences?.childFriendly ?? false,
        ecoFriendly: initialValues?.preferences?.ecoFriendly ?? false,
      }
    }
  });

  return (
    <Card className="max-w-4xl mx-auto p-8 shadow-sm">
      {error && <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        
        {/* Basic Info Section */}
        <div>
          <h3 className="text-lg font-bold text-white border-b border-white/20 pb-2 mb-4">Core Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Input label="Trip Title" placeholder="Summer in Paris" error={errors.title?.message} {...register('title')} />
            </div>
            
            <Input label="Destination Name" placeholder="Paris, France" error={errors.destination?.name?.message} {...register('destination.name')} />
            <Input label="Country" placeholder="France" error={errors.destination?.country?.message} {...register('destination.country')} />
            <Input label="City (Optional)" placeholder="Paris" error={errors.destination?.city?.message} {...register('destination.city')} />
            
            <Input type="date" label="Start Date" error={errors.startDate?.message} {...register('startDate')} />
            <Input type="date" label="End Date" error={errors.endDate?.message} {...register('endDate')} />
          </div>
        </div>

        {/* Financial & Logistics Section */}
        <div>
          <h3 className="text-lg font-bold text-white border-b border-white/20 pb-2 mb-4">Logistics</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <Input type="number" label="Travelers" min="1" error={errors.numberOfTravelers?.message} {...register('numberOfTravelers', { valueAsNumber: true })} />
            <Input type="number" label="Budget" min="0" error={errors.budget?.message} {...register('budget', { valueAsNumber: true })} />
            
            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-700">Currency</label>
              <select {...register('currency')} className="w-full h-11 px-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                {supportedCurrencies.map(c => (
                  <option key={c.code} value={c.code}>
                    {c.code} ({c.symbol}) - {c.name}
                  </option>
                ))}
              </select>
              {errors.currency && <span className="text-red-500 text-xs">{errors.currency.message}</span>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-700">Trip Type</label>
              <select {...register('tripType')} className="w-full h-11 px-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                {['Solo', 'Family', 'Friends', 'Couple', 'Business', 'Honeymoon', 'Pilgrimage', 'Road Trip', 'Weekend', 'Adventure'].map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              {errors.tripType && <span className="text-red-500 text-xs">{errors.tripType.message}</span>}
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-700">Travel Style</label>
              <select {...register('travelStyle')} className="w-full h-11 px-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                <option value="">Select a style</option>
                {['Relaxation', 'Adventure', 'Culture', 'Luxury'].map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-700">Transportation</label>
              <select {...register('transportationMode')} className="w-full h-11 px-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                <option value="">Select standard transport</option>
                {['Flight', 'Train', 'Car', 'Mixed'].map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-700">Accommodation</label>
              <select {...register('accommodationPreference')} className="w-full h-11 px-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                <option value="">Select preference</option>
                {['Hotel', 'Hostel', 'Airbnb', 'Camping', 'Resort'].map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            
            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-700">Visibility</label>
              <select {...register('visibility')} className="w-full h-11 px-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                <option value="Private">Private</option>
                <option value="Shared">Shared</option>
                <option value="Public">Public</option>
              </select>
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div>
          <h3 className="text-lg font-bold text-white border-b border-white/20 pb-2 mb-4">Preferences</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl">
            {['vegetarianOnly', 'petFriendly', 'ecoFriendly', 'childFriendly', 'avoidCrowds', 'avoidTolls', 'wheelchairAccessible'].map((pref) => (
               <label key={pref} className="flex items-center space-x-2 text-sm text-slate-700 cursor-pointer">
                 <input type="checkbox" {...register(`preferences.${pref}` as any)} className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
                 <span className="capitalize">{pref.replace(/([A-Z])/g, ' $1').trim()}</span>
               </label>
            ))}
          </div>
        </div>

        {/* Notes Section */}
        <div>
           <h3 className="text-lg font-bold text-white border-b border-white/20 pb-2 mb-4">Additional Notes</h3>
           <textarea 
             {...register('notes')} 
             rows={4} 
             placeholder="Any special requests like 'Make sure we visit that small cafe'..." 
             className="w-full p-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
           />
        </div>

        <div className="pt-4 border-t flex justify-end">
          <Button type="submit" disabled={isLoading} className="px-8 min-w-[150px]">
             {isLoading ? 'Saving...' : submitLabel}
          </Button>
        </div>
      </form>
    </Card>
  );
};
