import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { itineraryApi } from '../api/itinerary.api';
import { IItineraryDay, IActivity } from '../types/itinerary.types';
import { TimelineView } from '../components/TimelineView';
import { ActivityDetailsDrawer } from '../components/ActivityDetailsDrawer';
import { ItineraryMap } from '../components/ItineraryMap';
import { OptimizeRouteModal } from '../components/OptimizeRouteModal';
import { getTripById } from '../../trips/api/trips.api';
import { formatCurrency } from '../../../utils/currency.utils';

export const isValidCoordinate = (lat: any, lon: any) => 
  typeof lat === 'number' && typeof lon === 'number' && 
  Number.isFinite(lat) && Number.isFinite(lon) && 
  lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;

export const ItineraryTimeline: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [days, setDays] = useState<IItineraryDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedActivity, setSelectedActivity] = useState<IActivity | null>(null);
  const [dayRoutes, setDayRoutes] = useState<Record<string, any>>({});
  const [trip, setTrip] = useState<any>(null);

  const [optimizationPreview, setOptimizationPreview] = useState<any>(null);
  const [optimizeDayId, setOptimizeDayId] = useState<string | null>(null);

  const [actionError, setActionError] = useState<string | null>(null);
  const [isAddingDay, setIsAddingDay] = useState(false);
  const [deletingActivityId, setDeletingActivityId] = useState<string | null>(null);
  const [togglingActivityId, setTogglingActivityId] = useState<string | null>(null);
  const [isOptimizingPreview, setIsOptimizingPreview] = useState<string | null>(null);
  const [isOptimizingApply, setIsOptimizingApply] = useState(false);
  const loadItinerary = async () => {
    if (!id) return;
    try {
        setLoading(true);
        const [itineraryData, tripDataRes] = await Promise.all([
          itineraryApi.getItinerary(id),
          getTripById(id)
        ]);
        setDays(itineraryData);
        setTrip(tripDataRes.data);
    } catch (err: any) {
        console.error(err);
        setError(err.response?.data?.message || "Failed to load itinerary.");
    } finally {
        setLoading(false);
    }
  };

  const fetchAllRoutes = async (currentDays: IItineraryDay[]) => {
    const newRoutes = { ...dayRoutes };
    let hasChanges = false;
    
    for (const day of currentDays) {
      const validIds = (day.activities || [])
        .filter(a => isValidCoordinate(a.location?.latitude, a.location?.longitude))
        .map(a => a._id);
      
      if (validIds.length < 2) {
        if (newRoutes[day._id]) {
          delete newRoutes[day._id];
          hasChanges = true;
        }
        continue;
      }
      
      const newSequenceKey = validIds.join('-');
      if (newRoutes[day._id]?._sequenceKey === newSequenceKey) continue;
      
      try {
        const routeData = await itineraryApi.getDayRouteSegments(day._id, validIds);
        if (routeData.success) {
          newRoutes[day._id] = { ...routeData.data, _sequenceKey: newSequenceKey };
          hasChanges = true;
        }
      } catch(err) {
        // Fallback gracefully without overriding arrays
      }
    }
    
    if (hasChanges) {
       setDayRoutes(newRoutes);
    }
  };

  useEffect(() => {
    loadItinerary();
  }, [id]);
  
  useEffect(() => {
    if (days.length > 0) fetchAllRoutes(days);
  }, [days]);

  const handleAddDay = async () => {
    if (!id || isAddingDay) return;
    setIsAddingDay(true);
    setActionError(null);
    try {
      await itineraryApi.createDay(id, { date: new Date().toISOString() });
      await loadItinerary();
    } catch (err: any) {
      setActionError('Failed to initialize the next day. Please try again.');
    } finally {
      setIsAddingDay(false);
    }
  };

  const handleDeleteActivity = async (activityId: string) => {
    if (deletingActivityId) return;
    const confirm = window.confirm("Are you sure you want to delete this activity?");
    if (!confirm) return;
    setDeletingActivityId(activityId);
    setActionError(null);
    try {
      await itineraryApi.deleteActivity(activityId);
      await loadItinerary(); // reload
    } catch (err: any) {
      setActionError('Failed to delete activity. Please try again.');
    } finally {
      setDeletingActivityId(null);
    }
  };

  const handleToggleStatus = async (activityId: string, status: string) => {
    if (togglingActivityId) return;
    setTogglingActivityId(activityId);
    setActionError(null);
    try {
      await itineraryApi.toggleActivityStatus(activityId, status);
      if (selectedActivity && selectedActivity._id === activityId) {
        setSelectedActivity(prev => prev ? { ...prev, status: status as any } : prev);
      }
      await loadItinerary();
    } catch (err: any) {
      setActionError('Failed to update activity status.');
    } finally {
      setTogglingActivityId(null);
    }
  };

  const handleOptimizePreview = async (dayId: string) => {
    if (isOptimizingPreview) return;
    setIsOptimizingPreview(dayId);
    setActionError(null);
    try {
      const data = await itineraryApi.previewDayOptimization(dayId);
      setOptimizationPreview(data);
      setOptimizeDayId(dayId);
    } catch (err: any) {
      setActionError(err.response?.data?.message || 'Optimization failed.');
    } finally {
      setIsOptimizingPreview(null);
    }
  };

  const handleOptimizeApply = async () => {
    if (!optimizeDayId || !optimizationPreview || isOptimizingApply) return;
    setIsOptimizingApply(true);
    setActionError(null);
    try {
      const optimizedIds = optimizationPreview.optimizedOrder.map((a: any) => a._id);
      await itineraryApi.applyDayOptimization(optimizeDayId, optimizedIds);
      setOptimizationPreview(null);
      setOptimizeDayId(null);
      await loadItinerary();
    } catch (err: any) {
      setActionError(err.response?.data?.message || 'Failed to apply optimized route.');
    } finally {
      setIsOptimizingApply(false);
    }
  };

  const tripCompletionPercentage = days.length === 0 ? 0 : Math.round(days.reduce((sum, day) => sum + (day.completionPercentage || 0), 0) / days.length);

  const allActivities = days.flatMap(d => d.activities || []);
  const validMapActivities = allActivities.filter(a => isValidCoordinate(a.location?.latitude, a.location?.longitude));

  const calculateTotalTripDistance = () => {
    let totalKm = 0;
    for (const day of days) {
      if (dayRoutes[day._id] && dayRoutes[day._id].totalDistanceKm) {
        totalKm += dayRoutes[day._id].totalDistanceKm;
        continue;
      }
      const validActs = (day.activities || []).filter(a => isValidCoordinate(a.location?.latitude, a.location?.longitude));
      for (let i = 0; i < validActs.length - 1; i++) {
         const lat1 = validActs[i].location!.latitude!;
         const lon1 = validActs[i].location!.longitude!;
         const lat2 = validActs[i+1].location!.latitude!;
         const lon2 = validActs[i+1].location!.longitude!;
         const R = 6371;
         const dLat = (lat2 - lat1) * Math.PI / 180;
         const dLon = (lon2 - lon1) * Math.PI / 180;
         const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
         totalKm += (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)));
      }
    }
    return totalKm;
  };

  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;

  return (
    <div className="max-w-7xl mx-auto pb-12 px-4 md:px-8">
      <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-6 gap-4">
        <div>
          <Link to={`/dashboard/trips/${id}`} className="text-blue-600 hover:underline text-sm mb-3 md:mb-2 flex items-center gap-1">
            <span className="text-lg">←</span> Back to Trip Details
          </Link>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
            {trip?.destination?.name || 'Trip Itinerary'}
          </h1>
          <p className="text-slate-500 mt-1.5 font-medium">
            {trip?.startDate && trip?.endDate ? (
              `${new Date(trip.startDate).toLocaleDateString(undefined, {month: 'short', day: 'numeric', year: 'numeric'})} – ${new Date(trip.endDate).toLocaleDateString(undefined, {month: 'short', day: 'numeric', year: 'numeric'})}`
            ) : 'Your AI-crafted travel plan'}
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleAddDay}
            disabled={isAddingDay}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-full font-black uppercase tracking-widest text-xs transition-all disabled:opacity-50 shadow-lg hover:shadow-blue-600/30"
          >
            {isAddingDay ? 'Initializing...' : '+ Initialize Next Day'}
          </button>
        </div>
      </div>

      {/* Dynamic Trip Summary Navigation Bar */}
      {trip && (
      <div className="flex flex-wrap gap-4 mb-10 bg-white/10 dark:bg-slate-900/30 backdrop-blur-xl p-4 rounded-[3rem] border border-white/20 dark:border-white/10 shadow-2xl text-sm font-black uppercase tracking-widest text-slate-700 dark:text-slate-300">
         <div className="bg-white dark:bg-slate-800 px-5 py-2.5 rounded-full border border-slate-100 dark:border-slate-700 flex gap-2 items-center shadow-sm">
            <span className="text-blue-500 text-lg">🗓️</span> {trip.totalDays} Days
         </div>
         <div className="bg-white dark:bg-slate-800 px-5 py-2.5 rounded-full border border-slate-100 dark:border-slate-700 flex gap-2 items-center shadow-sm">
            <span className="text-blue-500 text-lg">👥</span> {trip.numberOfTravelers} <span className="hidden sm:inline">Travelers</span>
         </div>
         <div className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-800 rounded-full border border-slate-100 dark:border-slate-700 shadow-sm">
            <span className="text-emerald-500 text-lg">💰</span> Budget {formatCurrency(trip.budget)}
          </div>
         <div className="bg-white dark:bg-slate-800 px-5 py-2.5 rounded-full border border-slate-100 dark:border-slate-700 flex gap-2 items-center shadow-sm">
            <span className="text-purple-500 text-lg">📍</span> {allActivities.length} Activities
         </div>
         <div className="bg-white dark:bg-slate-800 px-5 py-2.5 rounded-full border border-slate-100 dark:border-slate-700 flex gap-2 items-center shadow-sm">
            <span className="text-rose-500 text-lg">🗺️</span> {calculateTotalTripDistance().toFixed(1)} km
         </div>
         <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-5 py-2.5 rounded-full shadow-lg flex gap-2 items-center ml-auto">
            <span className="text-lg">💵</span> Est. Cost {formatCurrency(days.reduce((total, d) => total + ((d.totalTicketCost || 0) + (d.totalEstimatedExpenses || 0)), 0))}
         </div>
      </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8 items-start relative">
         <div className="w-full lg:w-[60%]">
          {actionError && (
            <div className="mb-8 p-5 bg-red-500/10 backdrop-blur-md text-red-600 rounded-[2rem] border border-red-500/20 flex justify-between items-center shadow-lg font-bold">
              <span>{actionError}</span>
              <button onClick={() => setActionError(null)} className="text-red-400 hover:text-red-700 text-lg w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center transition-colors">✕</button>
            </div>
          )}
          <TimelineView 
            tripDestination={trip?.destination?.name}
            days={days}
            tripCompletionPercentage={tripCompletionPercentage}
            onClickActivity={(activity) => setSelectedActivity(activity)}
            onAddActivity={(dayId) => navigate(`/dashboard/trips/${id}/itinerary/days/${dayId}/add-activity`)}
            onEditActivity={(activityId) => navigate(`/dashboard/trips/${id}/itinerary/activities/${activityId}/edit`)}
            onDeleteActivity={handleDeleteActivity}
            onToggleStatus={handleToggleStatus}
            onOptimizeRoute={handleOptimizePreview}
            dayRoutes={dayRoutes}
            optimizingDayId={isOptimizingPreview}
          />
         </div>
         
         <div className="w-full lg:w-[40%]">
           {allActivities.length > 0 && allActivities.length === validMapActivities.length ? (
             <div className="mb-6 text-xs font-black uppercase tracking-widest text-emerald-700 bg-emerald-500/10 backdrop-blur-md p-4 rounded-[1.5rem] border border-emerald-500/20 shadow-md flex items-center justify-center">
               <span className="mr-2 text-lg">✓</span> All activities mapped successfully
             </div>
           ) : allActivities.length > validMapActivities.length && allActivities.length > 0 ? (
             <div className="mb-6 text-xs font-black uppercase tracking-widest text-amber-700 bg-amber-500/10 backdrop-blur-md p-4 rounded-[1.5rem] border border-amber-500/20 shadow-md flex items-center justify-center">
               <span className="mr-2 text-lg">⚠️</span> {allActivities.length - validMapActivities.length} activities unmapped
             </div>
           ) : null}
           <ItineraryMap 
             activities={allActivities} 
             selectedActivity={selectedActivity}
             onClickActivity={(activity) => setSelectedActivity(activity)}
             dayRoutes={dayRoutes}
           />
         </div>
      </div>

      <ActivityDetailsDrawer 
        activity={selectedActivity}
        isOpen={!!selectedActivity}
        onClose={() => setSelectedActivity(null)}
        onStatusChange={(status) => {
          if (selectedActivity) handleToggleStatus(selectedActivity._id, status);
        }}
      />

      {optimizationPreview && (
        <OptimizeRouteModal 
          isOpen={!!optimizationPreview}
          onClose={() => setOptimizationPreview(null)}
          onApply={handleOptimizeApply}
          originalDistanceKm={optimizationPreview.originalDistanceKm}
          optimizedDistanceKm={optimizationPreview.optimizedDistanceKm}
          distanceSavedKm={optimizationPreview.distanceSavedKm}
          improvementPercentage={optimizationPreview.improvementPercentage}
          optimizedOrder={optimizationPreview.optimizedOrder}
          activitiesWithoutCoordinates={optimizationPreview.activitiesWithoutCoordinates}
          isApplying={isOptimizingApply}
        />
      )}
    </div>
  );
};
