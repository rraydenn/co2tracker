import L from 'leaflet';

//TODO: supprimer si inutilisé
export interface TripData {
  departure: string;
  arrival: string;
  people: number;
  transport: string;
  distance: string;
  departureCoordinates: L.LatLng | null;
  arrivalCoordinates: L.LatLng | null;
}

//TODO: supprimer si inutilisé
export interface CO2Result {
  totalCO2: number;
  co2PerPerson: number;
  co2BarWidth: number;
}

//TODO: supprimer si inutilisé
export interface TripState {
  trips: Trip[];
  currentTrip: TripData;
  isTripCalculated: boolean;
  calculatedCO2: CO2Result | null;
  loading: boolean;
  error: string | null;
}

export interface Port {
  name: string;
  lat: number;
  lon: number;
}

export interface Address {
  id: number;
  fullAddress: string;
  latitude: number;
  longitude: number;
}

export interface Transport {
  id: number;
  name: string;
  co2PerKm: number;
  averageSpeed: number;
}

export interface Trip {
  id: number;
  userId: number;
  transportId: number;
  startAddressId: number;
  endAddressId: number;
  distanceKm: number;
  co2Total: number;
  transport?: Transport;
  startAddress?: Address;
  endAddress?: Address;
}

export interface TripStats {
  totalTrips: number;
  totalCO2: number;
  totalDistance: number;
  mostUsedTransport: string | null;
  ranking: string;
}

export interface RankingItem {
  rank: number;
  full_name: string;
  total_co2: number;
  total_distance: number;
}

export type RankingData = RankingItem[];