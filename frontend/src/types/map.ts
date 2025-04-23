import L from 'leaflet';

export interface AutocompleteResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  length: number;
}

export interface RouteData {
  features: Array<{
    geometry: any;
    properties: {
      summary: {
        distance: number;
        duration: number;
      }
    }
  }>
}

export interface MapState {
  map: L.Map | null;
  startMarker: L.Marker | null;
  endMarker: L.Marker | null;
  routeLayer: L.GeoJSON | L.LayerGroup | null;
  routeGroup: L.LayerGroup | null;
}