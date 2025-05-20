<template>
    <div class="trip-history">
      <h2>Historique des trajets</h2>
      
      <div v-if="loading" class="loading-container">
        <p>Chargement de l'historique...</p>
      </div>
      <div v-else-if="error" class="error-container">
        <p>{{ error }}</p>
      </div>
      <div v-else-if="trips.length === 0" class="empty-container">
        <p>Aucun trajet enregistré</p>
      </div>
      <div v-else class="trips-list">
        <div v-for="trip in trips" :key="trip.id" class="trip-item">
          <button @click="deleteTrip(trip.id)" class="delete-button">✖</button>
          <div class="trip-header">
            <div class="trip-route"> </div> 
            <div class="trip-date">{{ formatDate(trip.createdAt) }}</div>
            <span class="trip-route">DEPART : </span> {{ trip.startAddress?.fullAddress}} <br>
            <span class="trip-route">ARRIVEE : </span> {{ trip.endAddress?.fullAddress}} <br>
          </div>
          <div class="trip-info">
            <div class="transport-mode">
               Mode de Transport :
               <span class="valeur"> {{ trip.transport?.name }} </span>
            </div> <br>
            <div class="co2-amount"> 
              CO2 : 
              <span class="valeur"> {{ trip.co2Total }} </span>
              kg/km
            </div> <br>
            <div class="distance">
              Distance:
              <span class="valeur"> {{ trip.distanceKm}} </span>
              km  
          </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent, ref, onMounted } from 'vue';
  import { formatDate, formatCO2 } from '@/utils/formatters';
  import { log } from '@/utils/logger';
  import { Trip } from '@/types/trip';
  import { useAuthStore } from '@/stores/auth';
  
  export default defineComponent({
    name: 'TripHistory',
    
    setup() {
      log("TripHistory - Initializing component", 'debug');
      const trips = ref<Trip[]>([]);
      const loading = ref(true);
      const error = ref('');
      const authStore = useAuthStore();
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
      
      const fetchTrips = async () => {
        log("TripHistory - Fetching trips", 'debug');
        loading.value = true;
        error.value = '';
        
        try {
          log("TripHistory - Making API request with token", 'debug', authStore.token ? "[Token Available]" : "[No Token]");
          const response = await fetch(`${API_BASE_URL}/users/history`, {
            headers: {
              'Authorization': `Bearer ${authStore.token}`,
              'Content-Type': 'application/json'
            }
          });
          
          log("TripHistory - API response status", 'debug', response.status);

          
          if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
          }
          
          const data = await response.json();
          log(`TripHistory - Received ${data.length} trips`, 'debug', data);
          trips.value = data;
        } catch (err) {
          console.error('### Debug: TripHistory - Failed to fetch trips:', err);
          error.value = err instanceof Error ? err.message : 'Une erreur est survenue lors du chargement des trajets';
        } finally {
          log("TripHistory - Fetch operation completed", 'debug');
          loading.value = false;
        }
      };

      const deleteTrip = async (tripId: number) =>  {
        try {
        const response = await fetch(`${API_BASE_URL}/users/history/${tripId}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${authStore.token}`,
              'Content-Type': 'application/json'
            }
          });

          trips.value = trips.value.filter(trip => trip.id !== tripId);
          alert('✅ Trajet supprimé avec succès !');
          
        } catch(err) { 
          console.error('### Debug: TripHistory - Failed to delete trips:', err);
        }
      };
      
      onMounted(() => {
        log("TripHistory - Component mounted", 'debug');
        if (authStore.token) {
          log("TripHistory - User is authenticated, fetching trips", 'debug');
          fetchTrips();
        } else {
          log("TripHistory - User not authenticated, showing error", 'debug');
          error.value = 'Veuillez vous connecter pour voir votre historique';
          loading.value = false;
        }
      });
      
      return {
        trips,
        loading,
        error,
        formatDate,
        formatCO2,
        deleteTrip
      };
    }
  });
  </script>

<style scoped>
.trip-history {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 20px;
  height: 100%;
}

h2 {
  margin-top: 0;
  color: #2c3e50;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
  margin-bottom: 15px;
}

.loading-container, .error-container, .empty-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100px;
  background-color: #f0f0f0;
  border-radius: 8px;
  text-align: center;
  padding: 20px;
}

.error-container {
  background-color: #fff0f0;
  color: #ef4444;
}

.empty-container {
  background-color: #f0f4f8;
  color: #666;
}

.trips-list {
  max-height: 400px;
  overflow-y: auto;
}

.trip-item {
  position: relative;
  border-bottom: 1px solid #eee;
  padding: 12px 0;
}

.trip-item:last-child {
  border-bottom: none;
}

.trip-header {
  
  margin-bottom: 8px;
}

.trip-route {
  font-weight: bold;
  color: #2c3e50;
}

.trip-date {
  font-size: 0.9em;
  color: #888;
}

.trip-info {
  color: #45DA12;
  justify-content: space-between;
}

.transport-mode {
  font-weight: bold;
  color: #2D7A7A;
  
}

.valeur{
  font-weight: bold;
  color: #60D624;
  
}

.co2-amount {
  color: #4a8;
  font-weight: bold;
  
}

.distance {
  color: #48a;
  
}

.delete-button{
  background: none;
  border: none;
  font-size: 1.2em;
  position: absolute;
  color: red;
  right: 10px;
}
</style>