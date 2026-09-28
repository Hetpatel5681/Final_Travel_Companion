import { useMapEvents } from 'react-leaflet';

interface LocationPickerProps {
  onLocationSelected: (lat: number, lng: number) => void;
}

export const LocationPicker = ({ onLocationSelected }: LocationPickerProps) => {
  useMapEvents({
    click(e) {
      onLocationSelected(e.latlng.lat, e.latlng.lng);
    },
  });

  return null;
};
