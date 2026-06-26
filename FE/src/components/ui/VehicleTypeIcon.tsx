import { Car, Bike, ParkingCircle } from 'lucide-react';

interface VehicleTypeIconProps {
  vehicleType: string;
  size?: 'sm' | 'md';
}

export function VehicleTypeIcon({ vehicleType, size = 'sm' }: VehicleTypeIconProps) {
  const isCar = vehicleType === 'car';
  const iconClass = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';

  return (
    <div
      className={`p-2 rounded-lg ${
        isCar ? 'bg-blue-500/10 text-blue-400' : 'bg-orange-500/10 text-orange-400'
      }`}
    >
      {isCar ? <Car className={iconClass} /> : <Bike className={iconClass} />}
    </div>
  );
}

export function VehiclesSectionIcon({ className = 'w-5 h-5 text-primary-500' }: { className?: string }) {
  return <ParkingCircle className={className} />;
}
