import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { PublicRoute } from '@/components/PublicRoute';
import { PublicLayout } from '@/layouts/PublicLayout';
import { DashboardLayout } from '@/layouts/DashboardLayout';

import { Home } from '@/features/home/Home';
import { Login } from '@/features/auth/Login';
import { Register } from '@/features/auth/Register';
import { Dashboard } from '@/features/dashboard/Dashboard';
import { DestinationExplorer } from '@/features/destination/DestinationExplorer';
import { TripPlanner } from '@/pages/TripPlanner';
import { SavedTrips } from '@/pages/SavedTrips';
import { Profile } from '@/features/profile/Profile';
import { Weather } from '@/features/weather/Weather';
import { Maps } from '@/features/maps/Maps';
import { Settings } from '@/features/settings/Settings';
import { NotFound } from '@/features/core/NotFound';

import { MyTrips } from '@/features/trips/components/MyTrips';
import { CreateTrip } from '@/features/trips/components/CreateTrip';
import { TripDetails } from '@/features/trips/components/TripDetails';
import { EditTrip } from '@/features/trips/components/EditTrip';

import { ItineraryTimeline } from '@/features/itinerary/pages/ItineraryTimeline';
import { DayView } from '@/features/itinerary/pages/DayView';
import { AddActivity } from '@/features/itinerary/pages/AddActivity';
import { EditActivity } from '@/features/itinerary/pages/EditActivity';
import { ActivityDetails } from '@/features/itinerary/pages/ActivityDetails';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
            <Route path="/destination-explorer" element={<DestinationExplorer />} />
          </Route>

          {/* Dashboard Routes (Protected) */}
          <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard/trips" element={<MyTrips />} />
            <Route path="/trips/new" element={<CreateTrip />} />
            <Route path="/trips/:id" element={<TripDetails />} />
            <Route path="/trips/:id/edit" element={<EditTrip />} />
            
            <Route path="/dashboard/trips/:id/itinerary" element={<ItineraryTimeline />} />
            <Route path="/dashboard/trips/:id/itinerary/days/:dayId" element={<DayView />} />
            <Route path="/dashboard/trips/:id/itinerary/days/:dayId/add-activity" element={<AddActivity />} />
            <Route path="/dashboard/trips/:id/itinerary/activities/:activityId/edit" element={<EditActivity />} />
            <Route path="/dashboard/trips/:id/itinerary/activities/:activityId" element={<ActivityDetails />} />
            
            <Route path="/trip-planner" element={<TripPlanner />} />
            <Route path="/saved-trips" element={<SavedTrips />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/weather" element={<Weather />} />
            <Route path="/maps" element={<Maps />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
          
          {/* Fallback */}
          <Route path="*" element={<PublicLayout />}>
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
export default App;
