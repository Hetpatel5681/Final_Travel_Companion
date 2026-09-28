import { Marker, Popup } from 'react-leaflet';

interface MapMarkerProps {
  position: { lat: number; lng: number };
  title: string;
  city?: string;
  country: string;
}

export const MapMarker = ({ position, title, city, country }: MapMarkerProps) => {
  return (
    <Marker position={position}>
      <Popup>
        <div className="text-sm min-w-[120px]">
          <strong className="block text-base text-slate-800 mb-1">{title}</strong>
          <span className="text-slate-500 block">
            {city ? `${city}, ` : ''}{country}
          </span>
        </div>
      </Popup>
    </Marker>
  );
};
