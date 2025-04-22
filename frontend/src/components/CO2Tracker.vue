<template>
  <div class="co2-tracker">
    <header>
      <div class="site-title">CO2 Tracker Title</div>
      <button id="menu-toggle" @click="toggleMenu">☰</button>
    </header>

    <main>
      <section id="map">
        <div id="map-container" ref="mapContainer"></div>
      </section>

      <aside id="menu" :class="{ visible: isMenuVisible, hidden: !isMenuVisible }">

        <!-- Account section -->
        <div id="account-section">
          <router-link to="/account" id="account-link">👤 Mon compte</router-link>
        </div>

        <!-- Trip form -->
        <h2>Votre futur trajet</h2>
        <form id="travel-form" @submit.prevent="onTravelFormSubmit">
          <label for="departure">Départ:</label>
          <div class="autocomplete-container">
            <input
                type="text"
                id="departure"
                v-model="departure"
                required
                @input="onDepartureInput"
            >
            <div
                class="autocomplete-results"
                v-show="departureResults.length > 0"
            >
              <div
                  v-for="(result, index) in departureResults"
                  :key="`departure-${index}`"
                  class="autocomplete-item"
                  @click="selectDepartureResult(result)"
              >
                {{ result.display_name }}
              </div>
            </div>
          </div>

          <label for="arrival">Arrivée:</label>
          <div class="autocomplete-container">
            <input
                type="text"
                id="arrival"
                v-model="arrival"
                required
                @input="onArrivalInput"
            >
            <div
                class="autocomplete-results"
                v-show="arrivalResults.length > 0"
            >
              <div
                  v-for="(result, index) in arrivalResults"
                  :key="`arrival-${index}`"
                  class="autocomplete-item"
                  @click="selectArrivalResult(result)"
              >
                {{ result.display_name }}
              </div>
            </div>
          </div>

          <label for="people">Nombre de personnes:</label>
          <input type="number" id="people" v-model="people" required min="1">

          <label for="transport">Mode de transport:</label>
          <select id="transport" v-model="transport" required>
            <option value="voiture">Voiture</option>
            <option value="avion">Avion</option>
            <option value="bateau">Bateau</option>

          </select>

          <button
              type="submit"
              id="calculateCO2"
              :class="{ 'btn-disabled': !isFormValid, 'btn-active': isFormValid }"
              :disabled="!isFormValid"
          >
            Calculer CO₂
          </button>
        </form>
      </aside>

      <section id="results">
        <!-- No trip confirmed -->
        <div id="no-trip" class="trip-status" v-show="!isTripCalculated">
          <h2>Pas de voyage confirmé</h2>
        </div>

        <!-- Trip calculated -->
        <div id="trip-calculated" class="trip-status" v-show="isTripCalculated">
          <h2>Résultats du voyage</h2>
          <div class="summary">
            <h3>Résumé de votre voyage</h3>
            <p><strong>Départ :</strong> {{ departure }}</p>
            <p><strong>Arrivée :</strong> {{ arrival }}</p>
            <p><strong>Mode de transport :</strong> {{ transport }}</p>
            <p><strong>Nombre de personnes :</strong> {{ people }}</p>
            <p><strong>Distance totale WIP :</strong> {{ distance }}</p>
          </div>

          <!-- CO2 consumption -->
          <div class="co2-consumption">
            <h3>Consommation de CO2 WIP</h3>
            <p><strong>CO2 émis : </strong>{{ calculatedCO2 }}</p>
            <div class="co2-bar">
              <div class="filled-bar" :style="{ width: co2BarWidth + '%' }"></div>
            </div>
          </div>

          <!-- Fun statistics -->
          <div class="fun-comparisons">
            <h3>Statistiques comparatives amusantes WIP</h3>
            <ul>
              <li>Équivalent à un voyage Terre-Lune de <strong>10%</strong></li>
              <li>CO2 de votre voyage est égal à <strong>200 bananes</strong> !</li>
              <li>En termes de carburant, cela représente <strong>10 pleins de voiture</strong>.</li>
            </ul>
          </div>

          <!-- User ranking -->
          <div class="user-ranking">
            <h3>Classement parmi les utilisateurs WIP</h3>
            <p><strong>Votre rang :</strong> <span id="user-rank">5ème sur 200</span></p>
            <div class="ranking-bar">
              <div class="user-bar" style="width: 25%"></div>
            </div>
          </div>
        </div>
      </section>
    </main>

    <footer>
      <div class="footer">
        <p>CO2 Tracker - 2025 - PierreManoel - Ugo - XXXXXXX</p>
        <router-link to="/info">Informations du site</router-link>
      </div>
    </footer>
  </div>
</template>

<script lang="ts">
import {defineComponent, ref, computed, onMounted, nextTick, watch} from 'vue';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface AutocompleteResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

export default defineComponent({
  name: 'CO2Tracker',

  setup() {
    console.log("### Debug: CO2Tracker component setup initialized");

    // Map-related state
    const mapContainer = ref<HTMLElement | null>(null);
    const map = ref<L.Map | null>(null);
    const startMarker = ref<L.Marker | null>(null);
    const endMarker = ref<L.Marker | null>(null);
    const routeLayer = ref<L.GeoJSON | null>(null);
    const baseLayer = ref<L.TileLayer | null>(null);
    const routeGroup = ref<L.LayerGroup | null>(null);

    // UI state
    const isMenuVisible = ref(false);
    const isPopupVisible = ref(false);
    const isTripCalculated = ref(false);

    // Form inputs
    const departure = ref('');
    const arrival = ref('');
    const people = ref(1);
    const transport = ref('voiture');
    const distance = ref('0');
    const calculatedCO2 = ref('0 kg CO2');
    const co2BarWidth = ref(50); // Default value for demonstration
    const manuallySelected = ref({
      departure: false,

    });

    // Autocomplete results
    const departureResults = ref<AutocompleteResult[]>([]);
    const arrivalResults = ref<AutocompleteResult[]>([]);

    // Login forms
    const loginName = ref('');
    const loginPassword = ref('');
    const registerName = ref('');
    const registerPassword = ref('');

    // Timers for debouncing
    let departureTimer: number | null = null;
    let arrivalTimer: number | null = null;

    const routeCalculationInProgress = ref(false);
    let currentRouteRequest: AbortController | null = null;

    // URLs
    const OSRM_BASE_URL = import.meta.env.VITE_OSRM_BASE_URL;
    const OSRM_API_KEY = import.meta.env.VITE_OSRM_API_KEY;

    // Computed properties
    const isFormValid = computed(() => {
      const valid = (
          departure.value.trim() !== '' &&
          arrival.value.trim() !== '' &&
          people.value > 0 &&
          transport.value !== ''
      );
      console.log("### Debug: Form validity checked:", valid);
      return valid;
    });

  const initMap = () => {
  console.log("### Debug: Initializing map with container:", mapContainer.value);
  if (!mapContainer.value) {
    console.error("### Debug: Map container element not found!");
    return;
  }

  map.value = L.map(mapContainer.value).setView([48.8566, 2.3522], 7);
  console.log("### Debug: Map created and centered on Paris");

  baseLayer.value = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  });

  if (map.value) baseLayer.value.addTo(map.value as L.Map);
  console.log("### Debug: OSM tile layer added to map");

  routeGroup.value = L.layerGroup().addTo(map.value);

  map.value.on('click', async (e: L.LeafletMouseEvent) => {
    console.log("### Debug: Map clicked at coordinates:", e.latlng);

    if (startMarker.value && endMarker.value) {
      console.log("### Debug: Both markers exist, clearing map and route");

      routeGroup.value.clearLayers();
      console.log("### Debug: All routes removed");
      

      // Supprimer les marqueurs
      map.value.removeLayer(startMarker.value);
      map.value.removeLayer(endMarker.value);
      startMarker.value = null;
      endMarker.value = null;
      console.log("### Debug: Markers removed");

      return; 
    }

    // 🎯 Ajouter le marqueur de départ
    if (!startMarker.value) {
      console.log("### Debug: Adding start marker");
      manuallySelected.value.departure = false;
      addMarker(e.latlng, 'start');

      // Ouvrir le menu si fermé
      if (!isMenuVisible.value) {
        console.log("### Debug: Menu is closed, opening it");
        toggleMenu();
      }
    }
    // 🎯 Ajouter le marqueur d’arrivée + Calcul de la route
    else if (!endMarker.value) {
      console.log("### Debug: Adding end marker");
      manuallySelected.value.arrival = false;
      addMarker(e.latlng, 'end');

      console.log("### Debug: Calculating route...");
      await calculateRoute();
    }
  });
};



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

const addMarker = (latlng: L.LatLng, type: 'start' | 'end', skipReverseGeocode = false) => {
  console.log(`### Debug: Adding ${type} marker at:`, latlng);
  if (!map.value) {
    console.error("### Debug: Cannot add marker, map not initialized");
    return;
  }

  const isStart = type === 'start';

  if (isStart) {
    if (startMarker.value) {
      console.log("### Debug: Updating existing start marker");
      startMarker.value.setLatLng(latlng);
    } else {
      startMarker.value = L.marker(latlng, { icon: greenIcon, draggable: true })
        .addTo(map.value)
        .bindPopup('Départ');

      startMarker.value.on('dragend', () => {
        console.log("### Debug: Start marker dragged");
        manuallySelected.value.departure = false;
        const newPos = startMarker.value.getLatLng();
        reverseGeocode(newPos, 'start');
        if (endMarker.value) calculateRoute();
      });

      console.log("### Debug: Start marker added");
    }
  } else {
    if (endMarker.value) {
      console.log("### Debug: Updating existing end marker");
      endMarker.value.setLatLng(latlng);
    } else {
      endMarker.value = L.marker(latlng, { icon: redIcon, draggable: true })
        .addTo(map.value)
        .bindPopup('Arrivée');

      endMarker.value.on('dragend', () => {
        console.log("### Debug: End marker dragged");
        manuallySelected.value.arrival = false;
        const newPos = endMarker.value.getLatLng();
        reverseGeocode(newPos, 'end');
        if (startMarker.value) calculateRoute();
      });

      console.log("### Debug: End marker added");
    }
  }

  if (!skipReverseGeocode) {
    reverseGeocode(latlng, type);
  }
};


    const reverseGeocode = (latlng: L.LatLng, type: 'start' | 'end') => {
      const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?lat=${latlng.lat}&lon=${latlng.lng}&format=json`;
      console.log(`### Debug: Sending reverse geocoding request for ${type} to:`, nominatimUrl);

      fetch(nominatimUrl)
          .then(response => {
            if (!response.ok) {
              throw new Error(`Nominatim request failed with status ${response.status}`);
            }
            return response.json();
          })
          .then(data => {
            console.log(`### Debug: Reverse geocoding result for ${type} marker:`, data);
            const address = data.display_name;
            if (type === 'start') {
              console.log("### Debug: Setting departure address:", address);
              departure.value = address;
            } else {
              console.log("### Debug: Setting arrival address:", address);
              arrival.value = address;
            }
          })
          .catch(error => {
            console.error('### Debug: Error during reverse geocoding:', error);
          });
    };






    

    const calculateRoute = async () => {
    console.log("### Debug: Calculating route between markers");

    if (!map.value || !startMarker.value || !endMarker.value) {
        console.error("### Debug: Cannot calculate route, map or markers not initialized");
        return;
    }

    // Set flag to indicate calculation in progress
    routeCalculationInProgress.value = true;

    const startLatLng = startMarker.value.getLatLng();
    const endLatLng = endMarker.value.getLatLng();
    console.log("### Debug: Route coordinates - Start:", startLatLng, "End:", endLatLng);

    // Supprimer la route existante si elle existe
    if (routeLayer.value && map.value) {
        console.log("### Debug: Removing existing route layer");
        map.value.removeLayer(routeLayer.value);
        routeLayer.value = null;
    }

    // Mode AVION (ligne droite)
    if (transport.value === "avion") {
        console.log("### Debug: Calculating direct flight distance");

        // Calcul de la distance en ligne droite
        const distanceInMeters = startLatLng.distanceTo(endLatLng);
        distance.value = (distanceInMeters / 1000).toFixed(2);
        console.log("### Debug: Flight distance calculated:", distance.value, "km");

        // Dessiner une ligne en pointillés rouges
        const newRoute = L.polyline([startLatLng, endLatLng], {
            color: 'red',
            weight: 3,
            dashArray: '5, 10'
        }).addTo(map.value);
        routeGroup.value.addLayer(newRoute);

        routeCalculationInProgress.value = false;
        return;
    }

    // Mode BATEAU (partie sur la mer)
    if (transport.value === "bateau") {
        console.log("### Debug: Calculating boat route");

        // WIP 
        /* Bug détecté sur OSMRroute : peut importe le point de départ, la route commencera toujours de 
          l'europe (donc de là où on se rapproche de 0,0) et non de la position de départ.

          Dans le cas du bateau, cela fait qu'il n'est pas possible de calculer deux chemins séparément
          en supposant qu'ils seronts interommutés par un océan. 
        */
        try {

            // Calculer la route en voiture de A à B
            const nearestPort1 = await findNearestPort(startLatLng.lat, startLatLng.lng);
            if (!nearestPort1 || nearestPort1.name == 'null') {
                console.error("### Debug: No nearest port found for start location");
                return;
            }
            const carRoute = await fetchOSRMRoute(startLatLng, { lat: nearestPort1.lat, lng: nearestPort1.lon }, "driving-car");
            console.log("### Debug: AB startLatLng:", startLatLng, "nearestPort:", nearestPort1);

            // Add the first car route to the map
            const carRouteLayer = L.geoJSON(carRoute.features[0].geometry, {
              color: 'blue',
              weight: 5,
              opacity: 0.7
            }).addTo(map.value);
            routeGroup.value.addLayer(carRouteLayer);



            
            // Calculer la route en voiture de Z à Y
            const nearestPort2 = await findNearestPort(endLatLng.lat, endLatLng.lng);
            if (!nearestPort2 || nearestPort2.name == 'null') {
                console.error("### Debug: No nearest port found for end location");
                return;
            }
            const carRoute2 = await fetchOSRMRoute({ lat: endLatLng.lat, lng: endLatLng.lng }, { lat: nearestPort2.lat, lng: nearestPort2.lon }, "driving-car");
            console.log("### Debug: YZ startLatLng:", endLatLng, "endLatLng:", nearestPort2);


            // Add the second car route to the map
            const carRouteLayer2 = L.geoJSON(carRoute2.features[0].geometry, {
              color: 'red',
              weight: 5,
              opacity: 0.7
            }).addTo(map.value);
            routeGroup.value.addLayer(carRouteLayer2);

            // Group the layers to avoid overwriting routeLayer
            routeLayer.value = L.layerGroup([carRouteLayer, carRouteLayer2]);



            // Tracer la ligne à vol d'oiseau (avion) de B à Y
            const flightStart = L.latLng(nearestPort1.lat, nearestPort1.lon);
            const flightEnd = L.latLng(nearestPort2.lat, nearestPort2.lon);
            console.log("### Debug: Flight from B to Y - Start:", flightStart, "End:", flightEnd);

            // Tracer la ligne à vol d'oiseau (avion)
            const boatRoute = L.polyline([flightStart, flightEnd], {
                color: 'green',
                weight: 3,
                dashArray: '5, 10'
            }).addTo(map.value);
            routeGroup.value.addLayer(boatRoute);


            const flightDistanceInMeters = flightStart.distanceTo(flightEnd);
            const distanceInMeters = startLatLng.distanceTo(flightStart);
            const distanceInMeters2 = endLatLng.distanceTo(flightEnd);


            const totalDistanceInMeters = distanceInMeters + distanceInMeters2 + flightDistanceInMeters;
            console.log("### Debug: Total distance calculated:", totalDistanceInMeters, "m");
            distance.value = (totalDistanceInMeters / 1000).toFixed(2);
            console.log("### Debug: Final full route distance:", distance.value, "km");
        
            


        } catch (error) {
            console.error("### Debug: Error calculating boat route:", error);
        }

        routeCalculationInProgress.value = false;
        return;
    }

    // Mode normal (voiture, bus, train)
    console.log("### Debug: Using OSRM API for route calculation");
    try {
        const routeData = await fetchOSRMRoute(startLatLng, endLatLng, "driving-car");
        console.log("### Debug: OSRM route data received:", routeData);
        /*
        routeLayer.value = L.geoJSON(routeData.routes[0].geometry, {
                color: 'blue',
                weight: 5,
                opacity: 0.7
        }).addTo(map.value);
        console.log("### Debug: New route layer added to map");
       */
    const newRoute = L.geoJSON(routeData.features[0].geometry, {
                color: 'blue',
                weight: 5,
                opacity: 0.7
            });
            
            routeGroup.value.addLayer(newRoute);
            console.log("### Debug: New route layer added to map");
            
        const distanceInMeters = routeData.features[0].properties.summary.distance;
            distance.value = (distanceInMeters / 1000).toFixed(2);

            console.log("### Debug: Route distance calculated:", distance.value, "km");
    } catch (error) {
            console.error('### Debug: Error calculating route:', error);

        
    }

    routeCalculationInProgress.value = false;
};

const fetchOSRMRoute = async (start: L.LatLng, end: L.LatLng, profile: string) => {
    const url = `${OSRM_BASE_URL}/v2/directions/${profile}?api_key=${OSRM_API_KEY}&start=${start.lng},${start.lat}&end=${end.lng},${end.lat}`;
    console.log("### Debug: Sending OSRM route request to:", url);

    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`OSRM request failed with status ${response.status}`);
    }
    return response.json();
};




// Fonction pour calculer la distance entre deux points géographiques
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3; // Rayon de la Terre en mètres
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance en mètres
}

// Fonction pour récupérer les ports depuis Overpass API et trouver le plus proche
async function findNearestPort(startLat: number, startLng: number) {
  const overpassUrl = 'https://overpass-api.de/api/interpreter';
    const query = `
    [out:json];
    node["seamark:type"="harbour"](around:50000,${startLat},${startLng}); /* Reduced radius to 50 km */
    out body;
  `;

  try {
    const response = await fetch(overpassUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: `data=${encodeURIComponent(query)}`
    });

    if (!response.ok) {
      throw new Error(`Overpass API request failed with status ${response.status}`);
    }

    const data = await response.json();
    const ports = data.elements.map((port: { tags: { name?: string }; lat: number; lon: number }) => ({
      name: port.tags.name || 'Unknown Port',
      lat: port.lat,
      lon: port.lon
    }));
    console.log("### Debug: Ports found:", ports);
    if (ports.length === 0) {
      console.log("### Debug: No ports found within 50 km");
      return null;
    }

    // Calculer la distance de chaque port par rapport au point donné
    let nearestPort: {  name: string ; lat: number; lon: number } = {  name: 'null' , lat: 999999, lon: 9999999 };
    let minDistance = Infinity;

    ports.forEach((port: { name: string ; lat: number; lon: number }) => {
      const distancePort = calculateDistance(startLat, startLng, port.lat, port.lon);
      if (distancePort < minDistance) {
        minDistance = distancePort;
        nearestPort = { name: port.name, lat: port.lat, lon: port.lon };
      }
    });

    if (nearestPort.name !== 'null') {
        console.log("### Debug: Nearest port found:", nearestPort.name);
        console.log(`### Debug: Distance ${startLat} et ${nearestPort} = ${(minDistance / 1000).toFixed(2)} km`);
    } else {
        console.log("### Debug: Aucun port trouvé.");
    }

    return nearestPort;

  } catch (error) {
    console.error("Erreur lors de la récupération des ports :", error);
  }
}












    const toggleMenu = () => {
      isMenuVisible.value = !isMenuVisible.value;
      console.log("### Debug: Menu visibility toggled to:", isMenuVisible.value);
    };

    const onDepartureInput = () => {
      console.log("### Debug: Departure input event fired, current value:", departure.value);

      if (departureTimer) {
        console.log("### Debug: Clearing previous departure timer");
        window.clearTimeout(departureTimer);
      }

      const query = departure.value.trim();
      if (query.length < 3) {
        console.log("### Debug: Departure query too short, hiding results");
        departureResults.value = [];
        return;
      }

      console.log("### Debug: Setting up departure query timer for:", query);
      departureTimer = window.setTimeout(() => {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`;
        console.log("### Debug: Sending GET request to Nominatim for departure:", url);

        fetch(url)
            .then(response => response.json())
            .then(data => {
              console.log("### Debug: Received departure autocomplete results:", data.length, "items");
              departureResults.value = data;
              departureResults.length = data.length;
              console.log("### Debug: Departure results set:", departureResults.value);
              console.log("### Debug: Departure results length:", departureResults.length);
            })
            .catch(error => {
              console.error('### Debug: Error fetching departure suggestions:', error);
              departureResults.value = [];
            });
      }, 300);
    };

    const onArrivalInput = () => {
      console.log("### Debug: Arrival input event fired, current value:", arrival.value);

      if (arrivalTimer) {
        console.log("### Debug: Clearing previous arrival timer");
        window.clearTimeout(arrivalTimer);
      }

      const query = arrival.value.trim();
      if (query.length < 3) {
        console.log("### Debug: Arrival query too short, hiding results");
        arrivalResults.value = [];
        return;
      }

      console.log("### Debug: Setting up arrival query timer for:", query);
      arrivalTimer = window.setTimeout(() => {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`;
        console.log("### Debug: Sending GET request to Nominatim for arrival:", url);

        fetch(url)
            .then(response => response.json())
            .then(data => {
              console.log("### Debug: Received arrival autocomplete results:", data.length, "items");
              arrivalResults.value = data;
              arrivalResults.length = data.length;
              console.log("### Debug: Arrival results set:", arrivalResults.value);
              console.log("### Debug: Arrival results length:", arrivalResults.length);
            })
            .catch(error => {
              console.error('### Debug: Error fetching arrival suggestions:', error);
              arrivalResults.value = [];
            });
      }, 300);
    };

    const selectDepartureResult = (result: AutocompleteResult) => {
      console.log("### Debug: Departure result selected:", result);
      departure.value = result.display_name;
      departureResults.value = [];

      // Mark as manually selected
      manuallySelected.value.departure = true;

      const lat = parseFloat(result.lat);
      const lng = parseFloat(result.lon);
      console.log("### Debug: Creating start marker from selected result at:", lat, lng);

      // Pass true to skip reverse geocoding
      addMarker({lat, lng}, 'start', true);
    };

    const selectArrivalResult = (result: AutocompleteResult) => {
      console.log("### Debug: Arrival result selected:", result);
      arrival.value = result.display_name;
      arrivalResults.value = [];

      // Mark as manually selected
      manuallySelected.value.arrival = true;

      const lat = parseFloat(result.lat);
      const lng = parseFloat(result.lon);
      console.log("### Debug: Creating end marker from selected result at:", lat, lng);

      // Pass true to skip reverse geocoding
      addMarker({lat, lng}, 'end', true);
    };

    const onTravelFormSubmit = () => {
      console.log("### Debug: Travel form submitted with values:", {
        departure: departure.value,
        arrival: arrival.value,
        people: people.value,
        transport: transport.value,
        distance: distance.value
      });

      // Calculate CO2 based on transport mode and distance
      const distanceNum = parseFloat(distance.value);

      // This is just a placeholder - in a real app you'd have actual CO2 coefficients
      const co2Coefficients = {
        voiture: 0.2,
        bus: 0.1,
        train: 0.05,
        avion: 0.3
      };

      const co2PerPerson = distanceNum * (co2Coefficients as any)[transport.value];
      const totalCO2 = co2PerPerson * people.value;
      console.log("### Debug: CO2 calculation:", {
        distanceKm: distanceNum,
        coefficient: (co2Coefficients as any)[transport.value],
        co2PerPerson,
        totalCO2
      });

      calculatedCO2.value = `${totalCO2.toFixed(2)} kg CO2`;
      co2BarWidth.value = Math.min(totalCO2 / 10, 100); // Just for visualization

      isTripCalculated.value = true;
      isMenuVisible.value = false;
      console.log("### Debug: Trip calculated, showing results");

      // Scroll to results
      nextTick(() => {
        console.log("### Debug: Scrolling to results section");
        document.getElementById('results')?.scrollIntoView({behavior: 'smooth'});
      });
    };

    const onLoginFormSubmit = () => {
      console.log("### Debug: Login form submitted with username:", loginName.value);
      // Simply redirect to account page for now
      if (loginName.value === 'admin' && loginPassword.value === 'admin') {
        console.log("### Debug: Valid login, redirecting to account page");
        window.location.href = '/account';
      } else {
        console.log("### Debug: Invalid login credentials");
      }
    };

    const onRegisterFormSubmit = () => {
      console.log("### Debug: Registration submitted for username:", registerName.value);
      // Handle registration (stub)
      alert('Compte créé avec succès!');
      isPopupVisible.value = false;
    };

    // Lifecycle hooks
    onMounted(() => {
      console.log("### Debug: Component mounted");
      nextTick(() => {
        console.log("### Debug: Next tick after mount, initializing map");
        initMap();
      });
    });


    watch(departureResults, (newResults) => {
      console.log("### Debug: Departure results updated:", newResults);
      console.log("### Debug: Departure results length:", newResults.length);
    });

    return {
      // Refs
      mapContainer,
      // State
      isMenuVisible,
      isPopupVisible,
      isTripCalculated,
      departure,
      arrival,
      people,
      transport,
      distance,
      calculatedCO2,
      co2BarWidth,
      departureResults,
      arrivalResults,
      loginName,
      loginPassword,
      registerName,
      registerPassword,
      // Computed
      isFormValid,
      // Methods
      toggleMenu,
      onDepartureInput,
      onArrivalInput,
      selectDepartureResult,
      selectArrivalResult,
      onTravelFormSubmit,
      onLoginFormSubmit,
      onRegisterFormSubmit
    };
  }
});
</script>

<style scoped>
/* You can import your CSS or add scoped styles here */
/* For a cleaner approach, consider moving styles to a separate CSS file */
</style>