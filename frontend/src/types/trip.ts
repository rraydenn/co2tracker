import L from 'leaflet';

export interface TripData {
  departure: string;
  arrival: string;
  people: number;
  transport: string;
  distance: string;
  departureCoordinates: L.LatLng | null;
  arrivalCoordinates: L.LatLng | null;
}

export interface CO2Result {
  totalCO2: number;
  co2PerPerson: number;
  co2BarWidth: number;
}

export interface SavedTrip {
  id: number;
  user_id: number;
  departure: string;
  arrival: string;
  distance: number;
  transport: string;
  co2: number;
  people: number;
  created_at: string;
  updated_at: string;
}

export interface TripState {
  trips: SavedTrip[];
  currentTrip: TripData;
  isTripCalculated: boolean;
  calculatedCO2: CO2Result | null;
  loading: boolean;
  error: string | null;
}