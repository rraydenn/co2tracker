<template>
  <div class="co2-tracker">
    <header>
      <div class="site-title">CO2 Tracker V2</div>
      <button id="menu-toggle" @click="toggleMenu">☰</button>
    </header>

    <div id="tutorial-popup" v-if="showTutorial" class="popup">
      <div class="popup-content">
        <button id="close-popup" @click="closeTutorial">×</button>
        <h2>Bienvenue sur CO2 Tracker!</h2>
        
        <div class="tutorial-content">
          <h3>Comment ça marche</h3>
          <p>
            1. Entrez votre point de départ et d'arrivée<br>
            2. Sélectionnez votre mode de transport<br>
            3. Indiquez le nombre de personnes<br>
            4. Obtenez une estimation de votre empreinte CO2
          </p>
          
          <h3>À propos de CO2 Tracker</h3>
          <p>
            CO2 Tracker est une application permettant de calculer et de visualiser
            l'empreinte carbone de vos déplacements.
          </p>
          
          <button class="tutorial-btn" @click="closeTutorial">Commencer</button>
        </div>
      </div>
    </div>

    <main>
      <section id="map">
        <div id="map-container" ref="mapContainer"></div>
        <button class="clear-map-btn" @click="clearMap">Clear</button>

      </section>

      <aside id="menu" :class="{ visible: isMenuVisible, hidden: !isMenuVisible }">

        <!-- Account section -->
        <div id="account-section">
          <router-link to="/account" id="account-link">👤 Mon compte</router-link>
        </div>

        <!-- Trip form -->
        <h2>Votre futur trajet</h2>
        <form id="travel-form" @submit.prevent="onTravelFormSubmit">

          <label for="transport">Mode de transport:</label>
          <select id="transport" v-model="transport" required>
            <option v-for="t in transports" :key="t.id" :value="t.name">
              {{ t.name }}
            </option>
          </select>

          
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
            <h3>Détails</h3>
            <p><strong>Départ :</strong> {{ departure }}</p>
            <p><strong>Arrivée :</strong> {{ arrival }}</p>
            <p><strong>Mode de transport :</strong> {{ transport }}</p>
            <p><strong>Nombre de personnes :</strong> {{ people }}</p>
            <p><strong>Distance totale :</strong> {{ distance }} km</p>
          </div>

          <!-- CO2 consumption -->
          <div class="co2-consumption">
            <h3>Consommation de CO2</h3>
            <p><strong>CO2 émis : </strong>{{ calculatedCO2 }}</p>
          </div>



          <!-- Temp -->
          <div v-if="userToken">
            <button @click="saveTrip" type="submit" class="btn-active">Enregistrer le trajet</button>  
          </div>
          <div v-else>
            <p class="text-warning">Veuillez vous connecter pour enregistrer un trajet.</p>
          </div>

          <!-- Fun statistics -->
          <div class="fun-comparisons" v-if="isTripCalculated">
            <Comparisons :co2number="parseFloat(calculatedCO2)" />
          </div>
        
        </div>
      </section>
    </main>

    <footer>
      <div class="footer">
        <p>CO2 Tracker - 2025 - Pierre - Ugo - Enzo - Karim - Corentin - Amine </p>
        <router-link to="/info">Informations du site</router-link>
      </div>
    </footer>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, nextTick, Ref, onUnmounted } from 'vue';
import L, { latLng } from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Import types
import { AutocompleteResult, ManualSelectionState } from '@/types/map';

// Import services
import { initializeMap, addMarker } from '@/services/map';
import { searchLocation } from '@/services/geocoding';
import { fetchRoute, calculateDirectDistance, findNearestPort } from '@/services/routing';
import { calculateCO2Emissions, calculateCO2BarWidth, fetchTransports, Transport } from '@/services/co2';
import { resetMarkersState } from '@/services/map';
import { useTripStore } from '@/stores/trip';
import { log } from '@/utils/logger';
import Comparisons from '../components/results/Comparisons.vue';




export default defineComponent({
  name: 'HomePage',

  components: {
    Comparisons
  },

  setup() {
    log("HomePage component setup started", 'debug');

    // Map-related state
    const mapContainer = ref<HTMLElement | null>(null);
    const map = ref<L.Map | null>(null);
    const startMarker = ref<L.Marker | null>(null);
    const endMarker = ref<L.Marker | null>(null);
    const routeLayer = ref<L.GeoJSON | L.LayerGroup | null>(null);
    const routeGroup = ref<L.LayerGroup>(L.layerGroup());

    // UI state
    const isMenuVisible = ref(false);
    const isPopupVisible = ref(false);
    const isTripCalculated = ref(false);
    const showTutorial = ref(false);
    

    // Form inputs
    const departure = ref('');
    const arrival = ref('');
    const people = ref(1);
    const transport = ref('');
    const distance = ref('0');
    const calculatedCO2 = ref('0 kg CO2');
    const co2BarWidth = ref(50); // Default value for demonstration
    const manuallySelected = ref<ManualSelectionState>({
      departure: false,
      arrival: false
    });

    // Autocomplete results
    const departureResults = ref<AutocompleteResult[]>([]);
    const arrivalResults = ref<AutocompleteResult[]>([]);

    //History saving related
    const userToken = localStorage.getItem('token') //if user connected : token else is null/not connected
    const tripStore = useTripStore();

    // Timers for debouncing
    let departureTimer: number | null = null;
    let arrivalTimer: number | null = null;

    const routeCalculationInProgress = ref(false);

    // Environment variables
    const OSRM_BASE_URL = import.meta.env.VITE_OSRM_BASE_URL;
    const OSRM_API_KEY = import.meta.env.VITE_OSRM_API_KEY;

    // Add transports state
    const transports = ref<Transport[]>([]);

    // Computed properties
    const isFormValid = computed(() => {
      const valid = (
        departure.value.trim() !== '' &&
        arrival.value.trim() !== '' &&
        people.value > 0 &&
        transport.value !== ''
      );
      log("Form validity checked:", 'debug', valid);
      return valid;
    });


    const setManuallySelected = (type: 'start' | 'end', value: boolean) => {
      if (type === 'start') {
        manuallySelected.value.departure = value;
      } else {
        manuallySelected.value.arrival = value;
      }
    };

    const toggleMenu = () => {
      isMenuVisible.value = !isMenuVisible.value;
      log("Menu visibility toggled:", 'debug', isMenuVisible.value);
    };

    const openMenu = () => {
      isMenuVisible.value = true;
      log("Menu opened:", 'debug');
    }

    const clearMap = () => {
      isTripCalculated.value = false;
      departure.value = '';
      arrival.value = '';
      routeLayer.value = null;
      routeGroup.value.clearLayers();
      startMarker.value?.remove();
      endMarker.value?.remove();
      startMarker.value = null;
      endMarker.value = null;

      // Reinitialiser les valeurs start et end dans services/map.ts
      resetMarkersState();

      nextTick(() => {
        document.body.scrollIntoView({ behavior: 'smooth' });
      });
      log("Map cleared", 'debug');
    };

    const onDepartureInput = () => {
      log("Departure input event fired, current value:", 'debug', departure.value);

      if (departureTimer) {
        window.clearTimeout(departureTimer);
      }

      const query = departure.value.trim();
      if (query.length < 3) {
        departureResults.value = [];
        return;
      }

      departureTimer = window.setTimeout(() => {
        searchLocation(query, (results) => {
          departureResults.value = results;
          departureResults.value.length = results.length;
        });
      }, 300);
    };

    const onArrivalInput = () => {
      log("Arrival input event fired, current value:", 'debug', arrival.value);

      if (arrivalTimer) {
        window.clearTimeout(arrivalTimer);
      }

      const query = arrival.value.trim();
      if (query.length < 3) {
        arrivalResults.value = [];
        return;
      }

      arrivalTimer = window.setTimeout(() => {
        searchLocation(query, (results) => {
          arrivalResults.value = results;
          arrivalResults.value.length = results.length;
        });
      }, 300);
    };

    const selectDepartureResult = (result: AutocompleteResult) => {
      log("Departure result selected:", 'debug', result);
      departure.value = result.display_name;
      departureResults.value = [];

      setManuallySelected('start', true);

      const lat = parseFloat(result.lat);
      const lng = parseFloat(result.lon);
      
      if (map.value) {
        const latlng = L.latLng(lat, lng);
        addMarker(
          map.value as L.Map, 
          latlng, 
          'start', 
          startMarker as Ref<L.Marker | null>, 
          endMarker as Ref<L.Marker | null>, 
          (addr) => departure.value = addr,
          (addr) => arrival.value = addr,
          setManuallySelected,
          calculateRoute,
          true
        );
      }
    };

    const selectArrivalResult = (result: AutocompleteResult) => {
      log("Arrival result selected:", 'debug', result);
      arrival.value = result.display_name;
      arrivalResults.value = [];

      setManuallySelected('end', true);

      const lat = parseFloat(result.lat);
      const lng = parseFloat(result.lon);
      
      if (map.value) {
        const latlng = L.latLng(lat, lng);
        addMarker(
          map.value as L.Map, 
          latlng, 
          'end', 
          startMarker as Ref<L.Marker | null>, 
          endMarker as Ref<L.Marker | null>, 
          (addr) => departure.value = addr,
          (addr) => arrival.value = addr,
          setManuallySelected,
          calculateRoute,
          true
        );
      }
    };

    const handleMarkerAdded = (latlng: L.LatLng, type: 'start' | 'end') => {
      if (!map.value) return;
      
      addMarker(
        map.value as L.Map, 
        latlng, 
        type, 
        startMarker as Ref<L.Marker | null>, 
        endMarker as Ref<L.Marker | null>, 
        (addr) => departure.value = addr,
        (addr) => arrival.value = addr,
        setManuallySelected,
        calculateRoute
      );
    };

    const calculateRoute = async () => {
      log("Calculating route between markers", 'debug');

      if (!map.value || !startMarker.value || !endMarker.value) {
        console.error("### Debug: Cannot calculate route, map or markers not initialized");
        return;
      }

      // Set flag to indicate calculation in progress
      routeCalculationInProgress.value = true;

      const startLatLng = startMarker.value.getLatLng();
      const endLatLng = endMarker.value.getLatLng();
      log(`Route coordinates - Start: ${startLatLng}, End: ${endLatLng}`, 'debug');

      // Clear existing route if it exists
      log("Checking for existing route layer", 'debug', { routeGroup: routeGroup.value, map: map.value });

      // Clear existing routes from routeGroup
      if (routeGroup.value) {
        log("Clearing existing route layers from routeGroup", 'debug');
        routeGroup.value.clearLayers();
      }

      if (routeLayer.value && map.value) {
        log("Removing existing route layer", 'debug');
        routeLayer.value.remove();
        routeLayer.value = null;
      }

      try {
        // Handle different transport modes
        if (transport.value === "Avion") {
          // AIRPLANE MODE - Direct line
          log("Calculating direct flight distance", 'debug');
          
          const distanceInMeters = calculateDirectDistance(startLatLng, endLatLng);
          distance.value = (distanceInMeters / 1000).toFixed(2);
          
          // Draw a dashed red line
          const newRoute = L.polyline([startLatLng, endLatLng], {
            color: 'red',
            weight: 3,
            dashArray: '5, 10'
          }).addTo(map.value as L.Map);
          routeGroup.value.addLayer(newRoute);
        }
        else if (transport.value === "Bateau") {
          // BOAT MODE
          log("Calculating boat route", 'debug');
          
          // Find nearest ports
          const nearestPort1 = await findNearestPort(startLatLng.lat, startLatLng.lng);
          if (!nearestPort1 || nearestPort1.name == 'null') {
            console.error("### Debug: No nearest port found for start location");
            routeCalculationInProgress.value = false;
            return;
          }
          
          const port1LatLng = L.latLng(nearestPort1.lat, nearestPort1.lon);
          const carRoute1 = await fetchRoute(startLatLng, port1LatLng, "driving-car", OSRM_BASE_URL, OSRM_API_KEY);
          
          const carRouteLayer1 = L.geoJSON(carRoute1.features[0].geometry).addTo(map.value as L.Map);
          routeGroup.value.addLayer(carRouteLayer1);
          
          const nearestPort2 = await findNearestPort(endLatLng.lat, endLatLng.lng);
          if (!nearestPort2 || nearestPort2.name == 'null') {
            console.error("### Debug: No nearest port found for end location");
            routeCalculationInProgress.value = false;
            return;
          }
          
          const port2LatLng = L.latLng(nearestPort2.lat, nearestPort2.lon);
          const carRoute2 = await fetchRoute(endLatLng, port2LatLng, "driving-car", OSRM_BASE_URL, OSRM_API_KEY);
          
          const carRouteLayer2 = L.geoJSON(carRoute2.features[0].geometry).addTo(map.value as L.Map);
          routeGroup.value.addLayer(carRouteLayer2);
          
          // Draw the boat route
          const boatRoute = L.polyline([port1LatLng, port2LatLng], {
            color: 'green',
            weight: 3,
            dashArray: '5, 10'
          }).addTo(map.value as L.Map);
          routeGroup.value.addLayer(boatRoute);
          
          // Calculate total distance
          const carDistance1 = calculateDirectDistance(startLatLng, port1LatLng);
          const boatDistance = calculateDirectDistance(port1LatLng, port2LatLng);
          const carDistance2 = calculateDirectDistance(endLatLng, port2LatLng);
          
          const totalDistanceInMeters = carDistance1 + boatDistance + carDistance2;
          distance.value = (totalDistanceInMeters / 1000).toFixed(2);
          
          // Group all layers
          routeLayer.value = L.layerGroup([carRouteLayer1, carRouteLayer2, boatRoute]);
        }
        else {
          // CAR MODE - Default
          log("Using OSRM API for car route calculation", 'debug');
          
          const routeData = await fetchRoute(startLatLng, endLatLng, "driving-car", OSRM_BASE_URL, OSRM_API_KEY);
          log("Route data received:", 'debug', routeData);
          
          const newRoute = L.geoJSON(routeData.features[0].geometry);
          routeGroup.value.addLayer(newRoute);
          
          const distanceInMeters = routeData.features[0].properties.summary.distance;
          distance.value = (distanceInMeters / 1000).toFixed(2);
        }
      }
      catch (error) {
        console.error("Error calculating route:", error);
      }
      
      routeCalculationInProgress.value = false;
    };

    const onTravelFormSubmit = () => {
      log("Travel form submitted", 'debug');
      
      // Calculate CO2 emissions
      const distanceNum = parseFloat(distance.value);
      const totalCO2 = calculateCO2Emissions(distanceNum, transport.value, people.value, transports.value);
      
      calculatedCO2.value = `${totalCO2.toFixed(2)} kg CO2`;
      co2BarWidth.value = calculateCO2BarWidth(totalCO2);
      
      isTripCalculated.value = true;
      isMenuVisible.value = false;
      
      // Scroll to results
      nextTick(() => {
        document.getElementById('results')?.scrollIntoView({behavior: 'smooth'});
      });
    };

    const saveTrip = async () => {
      // Find the selected transport from the API data
      const selectedTransport = transports.value.find(t => t.name === transport.value);
      
      if (!selectedTransport) {
        console.error('Selected transport not found in API data');
        return;
      }

      const transportID = await tripStore.savingTransport(
        selectedTransport.name,
        selectedTransport.co2_per_km,
        selectedTransport.average_speed
      );

      //ID position de depart      
      let departureID = null;
      if (startMarker.value) {
        const latlng = startMarker.value.getLatLng();
        departureID = await tripStore.savingAddress(departure.value, latlng.lat, latlng.lng);
      }

      //ID position arrive
      let arrivalID = null;
      if (endMarker.value) {
        const latlng = endMarker.value.getLatLng();
        arrivalID = await tripStore.savingAddress(arrival.value, latlng.lat, latlng.lng);
      }

      //Distance
      const distanceInMk = parseFloat(distance.value);

      //cout en co2
      const co2Cost = calculateCO2Emissions(distanceInMk, transport.value, people.value, transports.value);

      if (userToken && departureID) {
        await tripStore.savingTripToHistory(userToken, transportID, departureID, arrivalID, distanceInMk, co2Cost);
        alert('✅ Trajet enregistré avec succès !');
      } else {
        console.warn('### Debug: Un ou plusieurs paramètres sont invalides. savingTrip non lancé.');
      }
    };

    const closeTutorial= () => {
      showTutorial.value = false;
      localStorage.setItem('tutorialShown', 'true');
      log("Tutorial closed", 'debug');
    }
    

    // Add fetchTransportsData function
    const fetchTransportsData = async () => {
      try {
        transports.value = await fetchTransports();
        if (transports.value.length > 0) {
          transport.value = transports.value[0].name;
        }
      } catch (error) {
        console.error('Failed to fetch transports:', error);
      }
    };

    // Lifecycle hooks
    onMounted(() => {
      log("HomePage component mounted", 'debug');
      fetchTransportsData();
      nextTick(() => {
        log("Next tick after mount, initializing map", 'debug');
        if (mapContainer.value) {
          map.value = initializeMap(
            mapContainer.value, 
            routeGroup.value as L.LayerGroup, 
            handleMarkerAdded,
            calculateRoute,
            clearMap,
            openMenu,
          );
          setTimeout(() => {
            log("Map initialized, invalidating size", 'debug');
            
            map.value?.invalidateSize();
          }, 500);
        }
        const tutorialShown = localStorage.getItem('tutorialShown');
        if (!tutorialShown) {
          setTimeout(() => {
            showTutorial.value = true;
          }, 500);
        }
      });
    });

    onUnmounted(() => {
      if (startMarker.value) {
        startMarker.value.remove();
        startMarker.value = null;
      }
      if (endMarker.value) {
        endMarker.value.remove();
        endMarker.value = null;
      }
      if (routeLayer.value) {
        routeLayer.value.remove();
        routeLayer.value = null;
      }
      if (routeGroup.value) {
        routeGroup.value.clearLayers();
      }
      resetMarkersState();
      log("HomePage component unmounted, map and markers cleaned up", 'debug');
    });

    return {
      // Refs
      mapContainer,
      // State
      isMenuVisible,
      isPopupVisible,
      isTripCalculated,
      userToken,
      departure,
      arrival,
      people,
      transport,
      distance,
      calculatedCO2,
      co2BarWidth,
      departureResults,
      arrivalResults,
      transports,
      // Computed
      isFormValid,
      // Methods
      toggleMenu,
      onDepartureInput,
      onArrivalInput,
      selectDepartureResult,
      selectArrivalResult,
      onTravelFormSubmit,
      clearMap, // Added clearMap to expose it to the template
      saveTrip,
      showTutorial,
      closeTutorial,
    };
  }
});
</script>

<style scoped>
#map-container {
  position: relative;
  width: 100%;
}

.clear-map-btn {
  position: absolute;
  bottom: 40px;
  left: 30px; /* Distance depuis la gauche du conteneur */
  background-color: #ff4d4d;
  color: white;
  border: none;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: background-color 0.3s ease;
  z-index: 1000; /* Assurez-vous que le bouton est au-dessus de la carte */
}

.clear-map-btn:hover {
  background-color: #ff1a1a;
}

/* Tutorial popup styles */
.popup {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000; /* Higher than other elements */
}

.tutorial-content {
  margin-top: 20px;
  text-align: left;
}

.tutorial-btn {
  background: #4a8;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  font-size: 1em;
  cursor: pointer;
  margin-top: 20px;
  transition: background 0.3s ease;
}

.tutorial-btn:hover {
  background: #3a7;
  transform: scale(1.05);
}
</style>