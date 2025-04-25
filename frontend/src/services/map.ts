import L from 'leaflet';
import { Ref } from 'vue';
import { AutocompleteResult } from '@/types/map';
import { reverseGeocode } from './geocoding';


// start et end doivent être des variables globales pour pouvoir être modifiées par un fonction
// accesible dans HomePage.vue tout en étant dans le scope de la fonction initializeMap 
// (pour s'assurer que le premier ou dernier marqueurs sont bien ajoutés)


let start = false;
let end = false;
export function resetMarkersState() {
  start = false;
  end = false;
  console.log("### Debug: Markers state reset (start and end set to false)");
}

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


  map.on('click', async (e: L.LeafletMouseEvent) => {
    console.log("### Debug: Map clicked at coordinates:", e.latlng);

    if (end && start) {
      console.log("### Debug: Both markers already exist, doing nothing.");
      return;
    }

    // Add start marker
    if (!start) {
      console.log("### Debug: Adding start marker");
      onMarkerAdded(e.latlng, 'start');

      // Open menu
      start = true;
      openMenu();
    }
    // Add end marker and calculate route
    else if (!end) {
      end = true;
      openMenu();

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