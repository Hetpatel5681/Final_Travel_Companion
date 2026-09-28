import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getTripById, updateTripCoordinates, generateItineraryForTrip } from '../api/trips.api';
import { Trip } from '../types/trips.types';
import { geocodingApi } from '../../maps/api/geocoding.api';
import { MapView } from '../../maps/components/MapView';
import { MapMarker } from '../../maps/components/MapMarker';
import { formatCurrency } from '../../../utils/currency.utils';
import { itineraryApi } from '../../itinerary/api/itinerary.api';
import { IItineraryDay, IActivity } from '../../itinerary/types/itinerary.types';
import { TimelineView } from '../../itinerary/components/TimelineView';
import { ActivityDetailsDrawer } from '../../itinerary/components/ActivityDetailsDrawer';
import { isValidCoordinate } from '../../itinerary/pages/ItineraryTimeline';

// Finance Components
import { FinanceSummary } from '../../expenses/components/FinanceSummary';
import { ExpenseForm } from '../../expenses/components/ExpenseForm';
import { ExpenseHistory } from '../../expenses/components/ExpenseHistory';
import { ExpensePieChart } from '../../expenses/components/ExpensePieChart';
import { DailySpendingChart } from '../../expenses/components/DailySpendingChart';
import { BudgetAlert } from '../../expenses/components/BudgetAlert';
import { FinancialInsights } from '../../expenses/components/FinancialInsights';
import { ExportTripReport } from '../../expenses/components/ExportTripReport';
import { expensesApi, IExpense } from '../../../services/api/expenses.api';
import { Weather } from '../../weather/Weather';

// Framer motion variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

export const TripDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [mapLoading, setMapLoading] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'Overview' | 'Itinerary' | 'Finance'>('Overview');
  const [days, setDays] = useState<IItineraryDay[]>([]);
  const [loadingItinerary, setLoadingItinerary] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<IActivity | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Finance State
  const [expenses, setExpenses] = useState<IExpense[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [dailyData, setDailyData] = useState<any[]>([]);

  const loadFinanceData = async () => {
    if (!id) return;
    try {
      const [exp, cat, daily] = await Promise.all([
        expensesApi.getTripExpenses(id),
        expensesApi.getCategoryBreakdown(id),
        expensesApi.getDailyExpenseAnalytics(id)
      ]);
      
      const safeExpenses = Array.isArray(exp) ? exp : (exp?.data || []);
      const safeCat = Array.isArray(cat) ? cat : (cat?.data || []);
      const safeDaily = Array.isArray(daily) ? daily : (daily?.data || []);
      
      setExpenses(safeExpenses);
      setCategoryData(safeCat);
      setDailyData(safeDaily.map((d: any) => ({ ...d, date: new Date(d.date || new Date()).toLocaleDateString() })));
    } catch (err) {
      console.error('Failed to load finance data', err);
      // Fail gracefully ensuring arrays remain []
      setExpenses([]);
      setCategoryData([]);
      setDailyData([]);
    }
  };

  const loadItinerary = async () => {
    if (!id) return;
    try {
      setLoadingItinerary(true);
      const data = await itineraryApi.getItinerary(id);
      setDays(data);
    } catch (err: any) {
      console.error('Failed to load itinerary.', err);
    } finally {
      setLoadingItinerary(false);
    }
  };

  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const fetchTrip = async () => {
      try {
        if (!id) return;
        const res = await getTripById(id);
        const fetchedTrip = res.data;
        setTrip(fetchedTrip);
        
        // Geocode if missing
        if (fetchedTrip && !isValidCoordinate(fetchedTrip.destination.latitude, fetchedTrip.destination.longitude)) {
          setMapLoading(true);
          try {
             const coords = await geocodingApi.geocodeDestination(fetchedTrip.destination.name, fetchedTrip.destination.country, (fetchedTrip.destination as any).address, fetchedTrip.destination.city);
             if (coords && isValidCoordinate(coords.latitude, coords.longitude)) {
                await updateTripCoordinates(fetchedTrip._id, coords.latitude, coords.longitude);
                setTrip(prev => prev ? { 
                  ...prev, 
                  destination: { 
                    ...prev.destination, 
                    latitude: coords.latitude, 
                    longitude: coords.longitude 
                  } 
                } : prev);
             } else {
                setMapError('Unable to locate this destination on the map.');
             }
          } catch (err) {
             setMapError('Unable to locate this destination on the map.');
          } finally {
             setMapLoading(false);
          }
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load trip details.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchTrip();
    loadItinerary();
    loadFinanceData();
  }, [id]);

  const handleAddExpense = async (expenseData: any) => {
    if (!trip) return;
    try {
      await expensesApi.createExpense({ ...expenseData, tripId: trip._id });
      const res = await getTripById(trip._id);
      setTrip(res.data);
      await loadFinanceData();
    } catch (err) {
      alert("Failed to add expense");
    }
  };

  const handleDeleteExpense = async (expenseId: string) => {
    if (!trip) return;
    const confirm = window.confirm("Delete this expense?");
    if (!confirm) return;
    try {
      await expensesApi.deleteExpense(expenseId);
      const res = await getTripById(trip._id);
      setTrip(res.data);
      await loadFinanceData();
    } catch (err) {
      alert("Failed to delete expense");
    }
  };

  const handleDeleteActivity = async (activityId: string) => {
    const confirm = window.confirm("Are you sure you want to delete this activity?");
    if (!confirm) return;
    try {
      await itineraryApi.deleteActivity(activityId);
      await loadItinerary();
    } catch (err: any) {
      alert('Failed to delete activity.');
    }
  };

  const handleActivityToggleStatus = async (activityId: string, status: string) => {
    try {
       await itineraryApi.toggleActivityStatus(activityId, status);
       const res = await getTripById(id!);
       setTrip(res.data);
       await loadItinerary();
    } catch (err) {
       alert('Failed to update activity status.');
    }
  };

  const handleStatusChange = async (status: string) => {
    if (!selectedActivity) return;
    try {
       await itineraryApi.toggleActivityStatus(selectedActivity._id, status);
       setSelectedActivity({ ...selectedActivity, status: status as any });
       await loadItinerary();
    } catch (err) {
       alert('Failed to update status.');
    }
  };

  const handleGenerateAIItinerary = async () => {
    if (!trip) return;
    try {
      setIsGenerating(true);
      await generateItineraryForTrip(trip._id, {});
      navigate(`/dashboard/trips/${trip._id}/itinerary`);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to generate AI itinerary. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const formatLocation = (dest: any) => {
    return [dest.city, dest.state, dest.country]
      .filter(Boolean)
      .filter(l => l !== 'Unknown')
      .join(', ');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-slate-800 dark:border-white"></div>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="p-8 text-center text-red-600 bg-red-50 rounded-[2rem] my-8 max-w-7xl mx-auto shadow-md">
        <p className="font-bold text-lg">{error || 'Trip not found'}</p>
      </div>
    );
  }

  const cardClass = "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[2rem] p-6 lg:p-8 shadow-md hover:shadow-xl transition-all duration-300 print:shadow-none print:border-slate-300";
  const utilPercent = trip.budget > 0 ? (((trip as any).totalExpenses || 0) / trip.budget) * 100 : 0;

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8 max-w-7xl mx-auto pb-20 print:p-0 print:space-y-4">
      
      {/* Cinematic Trip Hero Banner */}
      <motion.div variants={itemVariants} className="relative h-[400px] lg:h-[450px] w-full overflow-hidden rounded-[3rem] shadow-2xl print:shadow-none print:h-auto print:rounded-none">
        <div className="absolute inset-0 bg-slate-900 border border-slate-100/10">
           {trip.coverImage ? (
               <img src={trip.coverImage} className="w-full h-full object-cover opacity-90 print:opacity-100 print:relative print:h-64" alt="Cover" />
           ) : (
               <div className="w-full h-full bg-gradient-to-br from-indigo-900 via-slate-800 to-slate-900 print:hidden"></div>
           )}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/95 via-slate-900/50 to-transparent print:hidden" />
        
        {/* Print Only Header */}
        <div className="hidden print:block absolute top-0 left-0 bg-white w-full p-6 pb-2">
            <h1 className="text-4xl font-black text-slate-900">{trip.title}</h1>
            <p className="text-slate-600 font-bold">📍 {formatLocation(trip.destination)}</p>
        </div>

        <div className="absolute top-6 right-6 flex gap-4 z-20 print:hidden">
          {activeTab === 'Finance' && (
             <ExportTripReport elementId="finance-report-export" tripTitle={trip.title} />
          )}
          <Link to={`/trips/${trip._id}/edit`} className="bg-white/20 hover:bg-white/30 backdrop-blur-xl text-white px-5 py-2.5 rounded-full font-bold text-sm tracking-widest uppercase flex items-center gap-2 border border-white/20 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5">
             ⚙️ Settings
          </Link>
        </div>

        <div className="absolute bottom-10 left-10 right-10 z-20 print:hidden">
           <span className="inline-block px-4 py-1.5 bg-amber-500 text-amber-50 text-[10px] font-black uppercase tracking-widest rounded-full mb-4 shadow-lg backdrop-blur-md">
             {trip.tripStatus}
           </span>
           {trip.aiStatus === 'Completed' && (
             <span className="inline-block px-4 py-1.5 bg-white/20 text-white text-[10px] font-black uppercase tracking-widest rounded-full mb-4 ml-3 border border-white/30 shadow-lg backdrop-blur-md">
               ✨ AI Planned
             </span>
           )}
           <h1 className="text-4xl md:text-6xl font-black text-white drop-shadow-2xl mb-4 tracking-tight line-clamp-2">{trip.title}</h1>
           <div className="flex flex-wrap items-center gap-3 md:gap-5 text-amber-50/90 text-xs md:text-sm font-bold uppercase tracking-widest drop-shadow-md">
             <span className="flex items-center gap-1.5 bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">📍 {formatLocation(trip.destination)}</span>
             <span className="flex items-center gap-1.5 bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">📅 {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()} ({trip.totalDays}D)</span>
             <span className="flex items-center gap-1.5 bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">👥 {trip.numberOfTravelers} <span className="hidden sm:inline">Travelers</span></span>
             <span className="flex items-center gap-1.5 bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-emerald-400">💰 {formatCurrency(trip.budget, trip.currency)}</span>
           </div>
        </div>
      </motion.div>
      
      {/* Navigation Tabs */}
      <motion.div variants={itemVariants} className="flex px-4 md:px-8 border-b-2 border-slate-100 dark:border-slate-800 pb-0 gap-8 min-h-12 print:hidden -mt-4">
         <button 
           onClick={() => setActiveTab('Overview')} 
           className={`font-black uppercase tracking-widest text-xs px-2 pb-4 transition-colors relative ${activeTab === 'Overview' ? 'text-amber-500' : 'text-slate-400 hover:text-slate-600'}`}
         >
           Overview
           {activeTab === 'Overview' && <div className="absolute bottom-[-2px] left-0 right-0 h-1 bg-amber-500 rounded-t-full shadow-[0_-2px_10px_rgba(245,158,11,0.5)]"></div>}
         </button>
         <button 
           onClick={() => setActiveTab('Itinerary')}
           className={`font-black uppercase tracking-widest text-xs px-2 pb-4 transition-colors relative ${activeTab === 'Itinerary' ? 'text-blue-500' : 'text-slate-400 hover:text-slate-600'}`}
         >
           Itinerary Timeline
           {activeTab === 'Itinerary' && <div className="absolute bottom-[-2px] left-0 right-0 h-1 bg-blue-500 rounded-t-full shadow-[0_-2px_10px_rgba(59,130,246,0.5)]"></div>}
         </button>
         <button 
           onClick={() => setActiveTab('Finance')}
           className={`font-black uppercase tracking-widest text-xs px-2 pb-4 transition-colors relative ${activeTab === 'Finance' ? 'text-emerald-500' : 'text-slate-400 hover:text-slate-600'}`}
         >
           Finance & Budget
           {activeTab === 'Finance' && <div className="absolute bottom-[-2px] left-0 right-0 h-1 bg-emerald-500 rounded-t-full shadow-[0_-2px_10px_rgba(16,185,129,0.5)]"></div>}
         </button>
      </motion.div>

      {activeTab === 'Overview' ? (
      <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        
        {/* Itinerary CTA */}
        <motion.div variants={itemVariants} className={`${cardClass} flex flex-col justify-between print:hidden`}>
          <div>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-[1rem] bg-blue-500/10 text-blue-500 flex items-center justify-center text-2xl shadow-inner">🗺️</div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">Active Itinerary</h3>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 leading-relaxed">Detailed day-by-day scheduling mapping out transport, meals, and accommodations.</p>
          </div>
          <Link to={`/dashboard/trips/${trip._id}/itinerary`} className="h-12 bg-blue-600 hover:bg-blue-700 w-full rounded-2xl flex items-center justify-center text-sm uppercase tracking-widest font-black text-white transition-all shadow-lg hover:shadow-blue-600/30">
            Manage Timeline
          </Link>
        </motion.div>

        {/* Dynamic Budget & Expenses */}
        <motion.div variants={itemVariants} className={`${cardClass} flex flex-col justify-between print:mt-4`}>
          <div>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-[1rem] bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-2xl shadow-inner">💰</div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">Finance Tracking</h3>
            </div>
            <div className="space-y-4 mb-6">
               <div className="flex justify-between items-end">
                  <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Base Budget</span>
                  <span className="text-3xl font-black text-slate-900 dark:text-white drop-shadow-sm">{formatCurrency(trip.budget, trip.currency)}</span>
               </div>
               <div className="flex justify-between items-end">
                  <span className="text-pink-400 text-[10px] font-bold uppercase tracking-widest">Spent</span>
                  <span className="text-xl font-black text-pink-500 drop-shadow-sm">{formatCurrency((trip as any).totalExpenses || 0, trip.currency)}</span>
               </div>
               <div className="flex justify-between items-end">
                  <span className="text-emerald-400 text-[10px] font-bold uppercase tracking-widest">Remaining</span>
                  <span className="text-xl font-black text-emerald-500 drop-shadow-sm">{formatCurrency((trip as any).remainingBudget ?? trip.budget, trip.currency)}</span>
               </div>
               
               <div className="w-full bg-slate-100 dark:bg-slate-900 rounded-full h-2.5 overflow-hidden shadow-inner flex">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(utilPercent, 100)}%` }} className={`h-full ${utilPercent > 80 ? 'bg-red-500' : 'bg-gradient-to-r from-emerald-400 to-teal-500'}`}></motion.div>
               </div>
               <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                 <span className={`${utilPercent > 80 ? 'text-red-500' : 'text-emerald-500'}`}>Utilization</span>
                 <span className={`${utilPercent > 80 ? 'text-red-500' : 'text-slate-500'}`}>{utilPercent.toFixed(1)}% {((trip as any).totalExpenses || 0) >= trip.budget && trip.budget > 0 && ' (Exceeded)'}</span>
               </div>
            </div>
          </div>
          <button onClick={() => setActiveTab('Finance')} className="h-12 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 w-full rounded-2xl flex items-center justify-center text-[10px] uppercase tracking-widest font-black text-slate-500 dark:text-slate-400 transition-colors print:hidden">
            View Finance Dashboard
          </button>
        </motion.div>
        
        {/* AI Assistant */}
        <motion.div variants={itemVariants} className={`${cardClass} flex flex-col justify-between print:hidden`}>
          <div>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-[1rem] bg-purple-500/10 text-purple-500 flex items-center justify-center text-2xl shadow-inner">✨</div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">AI Automation</h3>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 leading-relaxed">Inject perfectly curated activities formatted tightly precisely to the '{trip.tripType}' profile constraint.</p>
          </div>
          <button 
            disabled={isGenerating}
            onClick={handleGenerateAIItinerary}
            className="h-12 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 w-full rounded-2xl flex items-center justify-center text-sm font-black uppercase tracking-widest text-white transition-all shadow-lg hover:shadow-purple-600/30 disabled:opacity-50 disabled:grayscale"
          >
            {isGenerating ? 'Computing...' : 'Force AI Refresh'}
          </button>
        </motion.div>

        <Weather latitude={trip.destination.latitude} longitude={trip.destination.longitude} />

        {/* Dynamic Packing Preview */}
        <motion.div variants={itemVariants} className={`${cardClass} flex flex-col justify-between print:hidden`}>
          <div>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-[1rem] bg-rose-500/10 text-rose-500 flex items-center justify-center text-2xl shadow-inner">🎒</div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">Prep & Docs</h3>
            </div>
            <div className="space-y-3 mb-6">
               <div className="flex items-center gap-3">
                 <div className="w-4 h-4 rounded-full border-2 border-emerald-500 bg-emerald-500 flex items-center justify-center"><div className="w-1.5 h-1.5 bg-white rounded-full"></div></div>
                 <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Flight Tickets Vaulted</span>
               </div>
               <div className="flex items-center gap-3">
                 <div className="w-4 h-4 rounded-full border-2 border-slate-300 dark:border-slate-600"></div>
                 <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Hotel Check-in Details</span>
               </div>
               <div className="flex items-center gap-3">
                 <div className="w-4 h-4 rounded-full border-2 border-slate-300 dark:border-slate-600"></div>
                 <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Passport Validation</span>
               </div>
            </div>
          </div>
          <button className="h-12 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 w-full rounded-2xl flex items-center justify-center text-[10px] uppercase tracking-widest font-black text-slate-500 dark:text-slate-400">
            Manage Checklist
          </button>
        </motion.div>

        {/* Map & Location Integration */}
        <motion.div variants={itemVariants} className={`${cardClass} md:col-span-2 lg:col-span-3 !p-4 md:!p-6 overflow-hidden`}>
          <div className="flex items-center gap-4 mb-6 px-2">
            <div className="w-12 h-12 rounded-[1rem] bg-indigo-500/10 text-indigo-500 flex items-center justify-center text-2xl shadow-inner">📍</div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-0 drop-shadow-sm">Geospatial Plot</h3>
          </div>
          
          <div className="rounded-[2rem] overflow-hidden border border-slate-100 dark:border-slate-800 shadow-inner">
            {mapLoading ? (
              <div className="w-full h-96 bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-500 font-bold uppercase tracking-widest text-xs">
                <span className="animate-pulse">🛰️ Acquiring Coordinates...</span>
              </div>
            ) : mapError ? (
              <div className="w-full h-96 bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-red-500 font-bold uppercase tracking-widest text-xs">
                {mapError}
              </div>
            ) : isValidCoordinate(trip.destination.latitude, trip.destination.longitude) ? (
              <MapView 
                center={{ lat: trip.destination.latitude!, lng: trip.destination.longitude! }} 
                zoom={12} 
                height="450px"
                className="w-full"
              >
                <MapMarker 
                  position={{ lat: trip.destination.latitude!, lng: trip.destination.longitude! }} 
                  title={trip.destination.name} 
                  city={trip.destination.city}
                  country={trip.destination.country}
                />
              </MapView>
            ) : (
              <div className="w-full h-96 bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-500 font-bold uppercase tracking-widest text-xs">
                Coordinates Offline
              </div>
            )}
          </div>
        </motion.div>

      </motion.div>
      ) : activeTab === 'Itinerary' ? (
        <motion.div variants={itemVariants} className="bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-[3rem] p-6 md:p-12 shadow-2xl relative min-h-[500px]">
             <TimelineView 
               days={days}
               isLoading={loadingItinerary}
               tripCompletionPercentage={trip.completionPercentage || 0}
               onClickActivity={(activity) => setSelectedActivity(activity)}
               onAddActivity={(dayId) => navigate(`/dashboard/trips/${id}/itinerary/days/${dayId}/add-activity`)}
               onEditActivity={(activityId) => navigate(`/dashboard/trips/${id}/itinerary/activities/${activityId}/edit`)}
               onDeleteActivity={handleDeleteActivity}
               onToggleStatus={handleActivityToggleStatus}
             />
        </motion.div>
      ) : (
        <motion.div variants={itemVariants} id="finance-report-export" className="bg-slate-900 border border-slate-800 rounded-[3rem] p-6 md:p-10 shadow-2xl min-h-[500px] print:bg-white print:border-none print:shadow-none print:p-0 text-white">
           <BudgetAlert utilPercent={utilPercent} />
           <FinanceSummary 
             tripBudget={trip.budget} 
             totalSpent={(trip as any).totalExpenses || 0} 
             remaining={(trip as any).remainingBudget ?? trip.budget} 
             utilPercent={utilPercent} 
           />
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
             <div className="lg:col-span-2 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <ExpensePieChart data={categoryData} />
                  <DailySpendingChart data={dailyData} />
                </div>
                <ExpenseHistory expenses={expenses} onDeleteExpense={handleDeleteExpense} />
             </div>
             <div className="space-y-6 print:hidden">
                <ExpenseForm onAddExpense={handleAddExpense} />
                <FinancialInsights categoryData={categoryData} totalSpent={(trip as any).totalExpenses || 0} remainingBudget={(trip as any).remainingBudget ?? trip.budget} />
             </div>
           </div>
        </motion.div>
      )}

      {/* Render drawer always, control visibility via isOpen. We pass selectedActivity for data. */}
      <ActivityDetailsDrawer 
        activity={selectedActivity}
        isOpen={!!selectedActivity}
        onClose={() => setSelectedActivity(null)}
        onStatusChange={handleStatusChange}
      />
    </motion.div>
  );
}
