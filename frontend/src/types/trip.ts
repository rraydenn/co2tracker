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
  full_address: string;
  latitude: number;
  longitude: number;
}

export interface Transport {
  id: number;
  name: string;
  co_2_per_km: number;
  average_speed: number;
}

export interface Trip {
  id: number;
  user_id: number;
  transport_id: number;
  start_address_id: number;
  end_address_id: number;
  distance_km: number;
  co_2_total: number;
  created_at: string;
  transport?: Transport;
  start_address?: Address;
  end_address?: Address;
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