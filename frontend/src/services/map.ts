import L from 'leaflet';
import { Ref } from 'vue';
import { AutocompleteResult } from '@/types/map';
import { reverseGeocode } from './geocoding';

export function initializeMap(
  mapContainer: HTMLElement,
  routeGroup: L.LayerGroup,
  onMarkerAdded: (latlng: L.LatLng, type: 'start' | 'end') => void,
  onRouteCalculationNeeded: () => void,
  onClearMap: () => void,
  openMenu: () => void,
): L.Map {
  console.log("### Debug: Initializing map with container:", mapContainer);
  
  const map = L.map(mapContainer).setView([48.8566, 2.3522], 7);
  console.log("### Debug: Map created and centered on Paris");

  const baseLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  });

  baseLayer.addTo(map);
  console.log("### Debug: OSM tile layer added to map");

  routeGroup.addTo(map);
  let start = true;
  let startMarker: L.Marker | null = null;
  let endMarker: L.Marker | null = null;

  map.on('click', async (e: L.LeafletMouseEvent) => {
    console.log("### Debug: Map clicked at coordinates:", e.latlng);

    if (startMarker && endMarker) {
      console.log("### Debug: Both markers exist, clearing map and route");
      routeGroup.clearLayers();
      console.log("### Debug: All routes removed");

      startMarker.remove();
      endMarker.remove();
      startMarker = null;
      endMarker = null;
      console.log("### Debug: Markers removed");
      
      onClearMap();
      return;
    }

    // Add start marker
    if (start) {
      console.log("### Debug: Adding start marker");
      onMarkerAdded(e.latlng, 'start');

      // Open menu
      start = false;
      openMenu();
    }
    // Add end marker and calculate route
    else if (!endMarker) {
      start = true;
      console.log("### Debug: Adding end marker");
      onMarkerAdded(e.latlng, 'end');

      console.log("### Debug: Calculating route...");
      onRouteCalculationNeeded();
    }
  });

  return map;
}

export const greenIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

export const redIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

export function addMarker(
  map: L.Map,
  latlng: L.LatLng, 
  type: 'start' | 'end',
  startMarker: Ref<L.Marker | null>,
  endMarker: Ref<L.Marker | null>,
  setDeparture: (value: string) => void,
  setArrival: (value: string) => void,
  setManuallySelected: (type: 'start' | 'end', value: boolean) => void,
  calculateRoute: () => Promise<void>,
  skipReverseGeocode = false
): void {
  console.log(`### Debug: Adding ${type} marker at:`, latlng);
  
  const isStart = type === 'start';

  if (isStart) {
    if (startMarker.value) {
      console.log("### Debug: Updating existing start marker");
      startMarker.value.setLatLng(latlng);
    } else {
      startMarker.value = L.marker(latlng, { icon: greenIcon, draggable: true })
        .addTo(map)
        .bindPopup('Départ');

      startMarker.value.on('dragend', () => {
        console.log("### Debug: Start marker dragged");
        setManuallySelected('start', false);
        if (startMarker.value) {
          const newPos = startMarker.value.getLatLng();
          reverseGeocode(newPos, (address: string) => setDeparture(address));
        }
      });
      if (endMarker.value) calculateRoute();

      console.log("### Debug: Start marker added");
    }
  } else {
    if (endMarker.value) {
      console.log("### Debug: Updating existing end marker");
      endMarker.value.setLatLng(latlng);
    } else {
      endMarker.value = L.marker(latlng, { icon: redIcon, draggable: true })
        .addTo(map)
        .bindPopup('Arrivée');

      endMarker.value.on('dragend', () => {
        console.log("### Debug: End marker dragged");
        setManuallySelected('end', false);
        if(endMarker.value) {
          const newPos = endMarker.value.getLatLng();
          reverseGeocode(newPos, (address: string) => setArrival(address));
        }
      });
      if (startMarker.value) calculateRoute();
      console.log("### Debug: End marker added");
    }
  }

  if (!skipReverseGeocode) {
    const callback = isStart 
      ? (address: string) => setDeparture(address) 
      : (address: string) => setArrival(address);
    reverseGeocode(latlng, callback);
  }
}