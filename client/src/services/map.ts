import L from 'leaflet';
import { Ref } from 'vue';
import { reverseGeocode } from '@/services/geocoding';
import { log } from '@/utils/logger';


// start et end doivent être des variables globales pour pouvoir être modifiées par un fonction
// accesible dans HomePage.vue tout en étant dans le scope de la fonction initializeMap 
// (pour s'assurer que le premier ou dernier marqueurs sont bien ajoutés)


let start = false;
let end = false;
export function resetMarkersState() {
  start = false;
  end = false;
  log("Markers state reset (start and end set to false)", 'debug');
}

export function initializeMap(
  mapContainer: HTMLElement,
  routeGroup: L.LayerGroup,
  onMarkerAdded: (latlng: L.LatLng, type: 'start' | 'end') => void,
  onRouteCalculationNeeded: () => void,
  onClearMap: () => void,
  openMenu: () => void,
): L.Map {
  log("Initializing map with container:", 'debug', mapContainer);
  
  const map = L.map(mapContainer).setView([48.8566, 2.3522], 7);
  log("Map created and centered on Paris", 'debug');

  const baseLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  });

  baseLayer.addTo(map);
  log("OSM tile layer added to map", 'debug');

  routeGroup.addTo(map);


  map.on('click', async (e: L.LeafletMouseEvent) => {
    log("Map clicked at coordinates:", 'debug', e.latlng);

    if (end && start) {
      log ("Both markers already exist, doing nothing", 'debug');
      return;
    }

    // Add start marker
    if (!start) {
      log("Adding start marker", 'debug');
      onMarkerAdded(e.latlng, 'start');

      // Open menu
      start = true;
      openMenu();
    }
    // Add end marker and calculate route
    else if (!end) {
      end = true;
      openMenu();

      log("Adding end marker", 'debug');
      onMarkerAdded(e.latlng, 'end');

      log("Calculating route...", 'debug');
      onRouteCalculationNeeded();
    }
  });

  return map;
}


const greenIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const redIcon = L.icon({
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
  log(`Adding ${type} marker at:`, 'debug', latlng);
  
  const isStart = type === 'start';

  if (isStart) {
    if (startMarker.value) {
      log("Updating existing start marker", 'debug');
      startMarker.value.setLatLng(latlng);
    } else {
      startMarker.value = L.marker(latlng, { icon: greenIcon, draggable: true })
        .addTo(map)
        .bindPopup('Départ');

      startMarker.value.on('dragend', () => {
        log("Start marker dragged", 'debug');
        setManuallySelected('start', false);
        if (startMarker.value) {
          const newPos = startMarker.value.getLatLng();
          reverseGeocode(newPos, (address: string) => setDeparture(address));
        }
      });

      log("Start marker added", 'debug');
    }
    if (endMarker.value) calculateRoute();
  } else {
    if (endMarker.value) {
      log("Updating existing end marker", 'debug');
      endMarker.value.setLatLng(latlng);
    } else {
      endMarker.value = L.marker(latlng, { icon: redIcon, draggable: true })
        .addTo(map)
        .bindPopup('Arrivée');

      endMarker.value.on('dragend', () => {
        log("End marker dragged", 'debug');
        setManuallySelected('end', false);
        if(endMarker.value) {
          const newPos = endMarker.value.getLatLng();
          reverseGeocode(newPos, (address: string) => setArrival(address));
        }
      });
      log("End marker added", 'debug');
    }
    if (startMarker.value) calculateRoute();
  }

  if (!skipReverseGeocode) {
    const callback = isStart 
      ? (address: string) => setDeparture(address) 
      : (address: string) => setArrival(address);
    reverseGeocode(latlng, callback);
  }
}