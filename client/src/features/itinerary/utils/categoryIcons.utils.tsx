import {
  MapPin,
  Utensils,
  Hotel,
  ShoppingCart,
  Mountain,
  Car,
  Plane,
  Train,
  Bus,
  Coffee,
  Landmark,
  Ticket,
  Umbrella,
  Info
} from 'lucide-react';

export const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'Sightseeing': return <MapPin className="w-5 h-5" />;
    case 'Restaurant': return <Utensils className="w-5 h-5" />;
    case 'Hotel': return <Hotel className="w-5 h-5" />;
    case 'Shopping': return <ShoppingCart className="w-5 h-5" />;
    case 'Adventure': return <Mountain className="w-5 h-5" />;
    case 'Transport': return <Car className="w-5 h-5" />;
    case 'Flight': return <Plane className="w-5 h-5" />;
    case 'Train': return <Train className="w-5 h-5" />;
    case 'Bus': return <Bus className="w-5 h-5" />;
    case 'Cafe': return <Coffee className="w-5 h-5" />;
    case 'Temple': return <Landmark className="w-5 h-5" />;
    case 'Museum': return <Ticket className="w-5 h-5" />;
    case 'Beach': return <Umbrella className="w-5 h-5" />;
    case 'Custom':
    default:
      return <Info className="w-5 h-5" />;
  }
};
