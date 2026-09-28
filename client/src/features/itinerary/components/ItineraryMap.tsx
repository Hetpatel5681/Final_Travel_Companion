import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { IActivity } from '../types/itinerary.types';


// Fix missing leafet marker icons in React Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapBoundsProps {
  activities: IActivity[];
  selectedActivityId?: string;
}

const MapBounds = ({ activities }: MapBoundsProps) => {
  const map = useMap();
  
  useEffect(() => {
    if (activities.length > 0) {
      const bounds = L.latLngBounds(
        activities.map(a => [a.location!.latitude!, a.location!.longitude!])
      );
      
      if (activities.length === 1) {
        // If there's only one marker, just center on it with an appropriate zoom
        map.setView([activities[0].location!.latitude!, activities[0].location!.longitude!], 14);
      } else {
        // Automatically fit bounds for multiple markers
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 16 });
      }
    }
  }, [activities, map]);

  return null;
};

interface ItineraryMapProps {
  activities: IActivity[];
  selectedActivity: IActivity | null;
  onClickActivity: (activity: IActivity) => void;
  dayRoutes?: Record<string, any>;
}

export const ItineraryMap: React.FC<ItineraryMapProps> = ({ activities, onClickActivity, dayRoutes = {} }) => {
  // Only deal with activities that have valid coordinates
  const validActivities = activities.filter(a => {
    const lat = a.location?.latitude;
    const lon = a.location?.longitude;
    return typeof lat === 'number' && typeof lon === 'number' && Number.isFinite(lat) && Number.isFinite(lon);
  });

  // Define a safe fallback center based on the first valid activity, or default to Central India
  const defaultCenter = validActivities.length > 0 
      ? [validActivities[0].location!.latitude!, validActivities[0].location!.longitude!]
      : [22.9074, 79.5822]; // Center of India

  const createNumberedIcon = (number: number) => {
    return L.divIcon({
      html: `<div style="background-color: #3b82f6; color: white; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; border-radius: 50%; font-weight: bold; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); font-size: 14px;">${number}</div>`,
      className: '',
      iconSize: [28, 28],
      iconAnchor: [14, 14],
      popupAnchor: [0, -14],
    });
  };

  return (
    <div className="w-full h-[450px] lg:h-[calc(100vh-160px)] min-h-[450px] rounded-[3rem] overflow-hidden shadow-2xl border border-white/20 dark:border-white/10 backdrop-blur-xl z-10 lg:sticky top-24 bg-slate-100/50">
       <MapContainer 
        center={defaultCenter as [number, number]} 
        zoom={13} 
        minZoom={3}
        maxZoom={19}
        style={{ height: '100%', width: '100%' }} 
        zoomControl={false}
        scrollWheelZoom={true}
      >
        <ZoomControl position="bottomright" />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          maxZoom={19}
        />
        
        <MapBounds activities={validActivities} />

        {validActivities.length > 1 && Object.values(dayRoutes).map((routeData: any, i: number) => {
          if (!routeData) return null;
          // Render precise OSRM Geometry if provided
          if (routeData.geometry && routeData.geometry.length > 0) {
            return (
              <Polyline 
                key={`geo-${i}`}
                positions={routeData.geometry.map((lonlat: [number, number]) => [lonlat[1], lonlat[0]] as [number, number])}
                color="#3b82f6" 
                weight={4}
                opacity={0.8}
              />
            )
          } 
          
          // Render silent fallback geographic estimates if OSRM was unavailable natively or SerpApi provides no geometries
          if (routeData.routingSource === 'haversine' || routeData.routingSource === 'serpapi') {
             const dayValid = activities.filter(a => routeData.segments.some((s:any) => s.fromActivityId===a._id || s.toActivityId===a._id) && typeof a.location?.latitude === 'number');
             if (dayValid.length > 1) {
               return (
                  <Polyline 
                    key={`hav-${i}`}
                    positions={dayValid.map(a => [a.location!.latitude!, a.location!.longitude!] as [number, number])}
                    color="#94a3b8" 
                    weight={3}
                    opacity={0.7}
                    dashArray="10, 10"
                  />
               )
             }
          }
          return null;
        })}

        {/* Fallback rendering when no DayRoutes execute logic precisely natively (e.g initialization stage) */}
        {validActivities.length > 1 && Object.keys(dayRoutes).length === 0 && (
          <Polyline 
            positions={validActivities.map(a => [a.location!.latitude!, a.location!.longitude!] as [number, number])}
            color="#cbd5e1" 
            weight={3}
            opacity={0.7}
            dashArray="10, 10"
          />
        )}
        
        {validActivities.map((activity, index) => (
          <Marker 
            key={activity._id} 
            position={[activity.location!.latitude!, activity.location!.longitude!]}
            // Using numbered sequential divIcon to visualize correct order
            icon={createNumberedIcon(index + 1)}
            eventHandlers={{
              click: () => onClickActivity(activity)
            }}
          >
            <Popup>
               <div className="text-sm min-w-[120px]">
                 <strong className="block text-base font-bold text-slate-800 mb-1">{activity.title}</strong>
                 <span className="text-slate-500 block text-xs uppercase font-semibold">
                   {activity.category}
                 </span>
                 {activity.location?.address && (
                   <span className="text-slate-500 block text-xs mt-1 truncate max-w-[200px]" title={activity.location.address}>
                     {activity.location.address}
                   </span>
                 )}
               </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};
