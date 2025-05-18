import L from 'leaflet';

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