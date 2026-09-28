import { MapContainer, TileLayer, useMap, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { ReactNode, useEffect } from 'react';

// Required to fix missing marker icons in React Leaflet
import L from 'leaflet';
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

interface MapViewProps {
  center: { lat: number; lng: number };
  zoom?: number;
  children?: ReactNode;
  height?: string;
  className?: string;
}

const ChangeView = ({ center, zoom }: { center: { lat: number; lng: number }, zoom: number }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

export const MapView = ({ center, zoom = 13, children, height = '400px', className = '' }: MapViewProps) => {
  return (
    <div className={`relative rounded-xl overflow-hidden shadow-sm border border-slate-200 z-10 ${className}`} style={{ height }}>
      <MapContainer 
        center={center} 
        zoom={zoom} 
        minZoom={3}
        maxZoom={19}
        style={{ height: '100%', width: '100%' }} 
        zoomControl={false}
        scrollWheelZoom={false}
      >
        <ZoomControl position="bottomright" />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          maxZoom={19}
        />
        <ChangeView center={center} zoom={zoom} />
        {children}
      </MapContainer>
    </div>
  );
};
