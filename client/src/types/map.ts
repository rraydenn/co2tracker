import L from 'leaflet';

export interface AutocompleteResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  length: number;
}

export interface ManualSelectionState {
  departure: boolean;
  arrival: boolean;
}