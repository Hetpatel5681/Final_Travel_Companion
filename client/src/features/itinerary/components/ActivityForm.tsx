import React from 'react';
import { useForm } from 'react-hook-form';
import { CreateActivityRequest } from '../types/itinerary.types';

interface ActivityFormProps {
  initialData?: Partial<CreateActivityRequest>;
  onSubmit: (data: CreateActivityRequest) => void;
  isLoading?: boolean;
}

export const ActivityForm: React.FC<ActivityFormProps> = ({ initialData, onSubmit, isLoading }) => {
  const { register, handleSubmit, formState: { errors } } = useForm<CreateActivityRequest>({
    defaultValues: initialData || {
    category: 'Sightseeing',
      priority: 'Must-Do',
      bookingRequired: false,
      aiGenerated: false,
      isLocked: true, // User creates it, so it's manually locked
      orderIndex: 0
    }
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Title */}
        <div className="col-span-2 md:col-span-1">
          <label className="block text-sm font-medium text-slate-700 mb-2">Activity Name *</label>
          <input 
            {...register('title', { required: 'Title is required' })} 
            className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow outline-none"
            placeholder="E.g., Visit the Eiffel Tower"
          />
          {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
        </div>

        {/* Category */}
        <div className="col-span-2 md:col-span-1">
          <label className="block text-sm font-medium text-slate-700 mb-2">Category *</label>
          <select
  {...register('category')}
  className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
>
  <option value="Sightseeing">Sightseeing</option>
  <option value="Restaurant">Restaurant</option>
  <option value="Hotel">Hotel</option>
  <option value="Shopping">Shopping</option>
  <option value="Adventure">Adventure</option>
  <option value="Transport">Transport</option>
  <option value="Flight">Flight</option>
  <option value="Train">Train</option>
  <option value="Bus">Bus</option>
  <option value="Cafe">Cafe</option>
  <option value="Temple">Temple</option>
  <option value="Museum">Museum</option>
  <option value="Beach">Beach</option>
  <option value="Custom">Custom</option>
</select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Priority */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Priority</label>
          <select 
            {...register('priority')} 
            className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl outline-none"
          >
            <option value="Must-Do">Must Do</option>
            <option value="Optional">Optional</option>
            <option value="Backup">Backup Plan</option>
          </select>
        </div>

        {/* Order Index */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Sequence Order</label>
          <input 
            type="number"
            {...register('orderIndex', { valueAsNumber: true })} 
            className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl outline-none"
          />
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
        <textarea 
          {...register('description')} 
          rows={3}
          className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl outline-none"
          placeholder="Any details to keep in mind..."
        />
      </div>

      {/* Booking URL */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Booking Link (Optional)</label>
        <input 
          {...register('bookingUrl')} 
          type="url"
          className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl outline-none"
          placeholder="https://..."
        />
      </div>

      <div className="flex justify-end pt-4 border-t border-slate-200">
        <button 
          type="submit" 
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-xl shadow-md transition-all flex items-center gap-2 disabled:bg-blue-400"
        >
          {isLoading ? 'Saving...' : 'Save Activity'}
        </button>
      </div>

    </form>
  );
};
