<template>
 <!-- TODO: utiliser dans la MainPage ou supprimer -->
 <h2>Votre futur trajet</h2>
      <form id="travel-form" >
        <label for="departure">Départ:</label>
        <div class="autocomplete-container">
          <input
              type="text"
              id="departure"
              v-model="departure"
              required
          >
          <div
              class="autocomplete-results"
              v-show="departureResults.length > 0"
          >
            <div
                v-for="(result, index) in departureResults"
                :key="`departure-${index}`"
                class="autocomplete-item"
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
          >
          <div
              class="autocomplete-results"
              v-show="arrivalResults.length > 0"
          >
            <div
                v-for="(result, index) in arrivalResults"
                :key="`arrival-${index}`"
                class="autocomplete-item"
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
            :class="{ 'btn-disabled': !isFormValid(), 'btn-active': isFormValid() }"
            :disabled="!isFormValid()"
        >
          Calculer CO₂
        </button>
      </form>
  </template>
  
  <script setup lang="ts">
  import { ref } from 'vue'
  import L from 'leaflet'
  //import { getGeocodingResults } from '@/services/geocoding'
  import {useMapStore} from '@/stores/map'

  const mapStore = useMapStore()
  
  const emit = defineEmits<{
    (e: 'submit-trip', payload: { from: string; to: string; mode: string }): void
  }>()
  
  interface AutocompleteResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  length: number;
}

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
      arrival: false
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
  
  function isFormValid(): boolean {
    return departure.value.trim() !== '' && arrival.value.trim() !== '' && transport.value.trim() !== '';
  }

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
              departureResults.value.length = data.length;
              console.log("### Debug: Departure results set:", departureResults.value);
              console.log("### Debug: Departure results length:", departureResults.value.length);
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
              arrivalResults.value.length = data.length;
              console.log("### Debug: Arrival results set:", arrivalResults.value);
              console.log("### Debug: Arrival results length:", arrivalResults.value.length);
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
      const latlng = L.latLng(lat, lng);
      mapStore.addStartMarker(latlng);
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
      const latlng = L.latLng(lat, lng);
      mapStore.addEndMarker(latlng);
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

      console.log("### Debug: Trip calculated, showing results");

        document.getElementById('results')?.scrollIntoView({behavior: 'smooth'});
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
    };

  
  
  </script>
  
  <style scoped>
  .trip-form {
    display: flex;
    flex-direction: column;
    gap: 1.2rem;
    padding: 1.5rem;
    background: #f7f7f7;
    border-radius: 8px;
  }
  
  .form-group {
    display: flex;
    flex-direction: column;
  }
  
  label {
    margin-bottom: 0.3rem;
    font-weight: bold;
  }
  
  select,
  input {
    padding: 0.6rem;
    border-radius: 6px;
    border: 1px solid #ccc;
  }
  
  .btn-submit {
    padding: 0.8rem;
    background-color: #2c3e50;
    color: white;
    border: none;
    border-radius: 6px;
    font-weight: bold;
    cursor: pointer;
  }
  .btn-submit:hover {
    background-color: #1a252f;
  }
  </style>
  