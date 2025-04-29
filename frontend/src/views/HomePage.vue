<template>
  <div class="co2-tracker">
    <header>
      <div class="site-title">CO2 Tracker V2</div>
      <button id="menu-toggle" @click="toggleMenu">☰</button>
    </header>

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
            <option value="voiture">Voiture</option>
            <option value="avion">Avion</option>
            <option value="bateau">Bateau</option>

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
import { defineComponent, ref, computed, onMounted, nextTick, Ref } from 'vue';
import L, { latLng } from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Import types
import { AutocompleteResult, ManualSelectionState } from '@/types/map';

// Import services
import { initializeMap, addMarker } from '@/services/map';
import { searchLocation } from '@/services/geocoding';
import { fetchRoute, calculateDirectDistance, findNearestPort } from '@/services/routing';
import { calculateCO2Emissions, calculateCO2BarWidth } from '@/services/co2';
import { resetMarkersState } from '@/services/map';
import { useTripStore } from '@/stores/trip';
import Comparisons from '../components/results/Comparisons.vue';




export default defineComponent({
  name: 'HomePage',

  components: {
    Comparisons
  },

  setup() {
    console.log("### Debug: HomePage component setup initialized");

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
    

    // Form inputs
    const departure = ref('');
    const arrival = ref('');
    const people = ref(1);
    const transport = ref('voiture');
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


    const setManuallySelected = (type: 'start' | 'end', value: boolean) => {
      if (type === 'start') {
        manuallySelected.value.departure = value;
      } else {
        manuallySelected.value.arrival = value;
      }
    };

    const toggleMenu = () => {
      isMenuVisible.value = !isMenuVisible.value;
      console.log("### Debug: Menu visibility toggled to:", isMenuVisible.value);
    };

    const openMenu = () => {
      isMenuVisible.value = true;
      console.log("### Debug: Menu opened");
    }

    const clearMap = () => {
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
    };

    const onDepartureInput = () => {
      console.log("### Debug: Departure input event fired, current value:", departure.value);

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
      console.log("### Debug: Arrival input event fired, current value:", arrival.value);

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
      console.log("### Debug: Departure result selected:", result);
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
      console.log("### Debug: Arrival result selected:", result);
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

      // Clear existing route if it exists
      if (routeLayer.value && map.value) {
        console.log("### Debug: Removing existing route layer");
        routeLayer.value.remove();
        routeLayer.value = null;
      }

      try {
        // Handle different transport modes
        if (transport.value === "avion") {
          // AIRPLANE MODE - Direct line
          console.log("### Debug: Calculating direct flight distance");
          
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
        else if (transport.value === "bateau") {
          // BOAT MODE
          console.log("### Debug: Calculating boat route");
          
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
          console.log("### Debug: Using OSRM API for route calculation");
          
          const routeData = await fetchRoute(startLatLng, endLatLng, "driving-car", OSRM_BASE_URL, OSRM_API_KEY);
          console.log("### Debug: Route data received:", routeData);
          
          const newRoute = L.geoJSON(routeData.features[0].geometry);
          routeGroup.value.addLayer(newRoute);
          
          const distanceInMeters = routeData.features[0].properties.summary.distance;
          distance.value = (distanceInMeters / 1000).toFixed(2);
        }
      }
      catch (error) {
        console.error("### Debug: Error calculating route:", error);
      }
      
      routeCalculationInProgress.value = false;
    };

    const onTravelFormSubmit = () => {
      console.log("### Debug: Travel form submitted");
      
      // Calculate CO2 emissions
      const distanceNum = parseFloat(distance.value);
      const totalCO2 = calculateCO2Emissions(distanceNum, transport.value, people.value);
      
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

      //transport

      //TODO: trouver une meilleur methode pour remplir la base de donnée pour le mode de transport (à faire qu'une seul fois)
      //ici on va faire a chaque fois appel a la base de donnée pour voir s'il existe ou non le transport
      //pas un pb a notre echelle mais c'est bof

      let co2_per_km
      let average_speed
      
      switch (transport.value) {
        case 'voiture':
          co2_per_km = 0.2 // kg/km 
          average_speed = 50 // km/h
          break
        case 'avion':
          co2_per_km = 0.3 
          average_speed = 850
          break
        case 'bateau':
          co2_per_km = 0.15
          average_speed = 30
          break
        default:
          co2_per_km = 0
          average_speed = 0
          break
        }

      const transportID = await tripStore.savingTransport(transport.value, co2_per_km , average_speed)

      //ID position de depart      
      let departureID = null
      if (startMarker.value) {
        const latlng = startMarker.value.getLatLng();
        departureID = await tripStore.savingAddress( departure.value, latlng.lat , latlng.lng)
      }

      //ID position arrive
      let arrivalID = null
      if (endMarker.value) {
        const latlng = endMarker.value.getLatLng();
        arrivalID = await tripStore.savingAddress( arrival.value, latlng.lat , latlng.lng)
      }

      //Distance
      const distanceInMk = parseFloat(distance.value);

      //cout en co2
      const co2Cost = calculateCO2Emissions(distanceInMk, transport.value, people.value);

      if (userToken && departureID) { await tripStore.savingTripToHistory( userToken, transportID , departureID, arrivalID, distanceInMk, co2Cost) 
        alert('✅ Trajet enregistré avec succès !');
      }
        else { console.warn('### Debug: Un ou plusieurs paramètres sont invalides. savingTrip non lancé.') }
      
     };
    

    // Lifecycle hooks
    onMounted(() => {
      console.log("### Debug: Component mounted");
      nextTick(() => {
        console.log("### Debug: Next tick after mount, initializing map");
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
            console.log("### Debug: Map initialized, invalidating size");
            
            map.value?.invalidateSize();
          }, 500);
        }
      });
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
</style>