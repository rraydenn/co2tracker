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
          <div class="trip-header">
            <div class="trip-route">{{ trip.start_address }} → {{ trip.end_address }}</div>
            <div class="trip-date">{{ formatDate(trip.created_at) }}</div>
          </div>
          <div class="trip-info">
            <div class="transport-mode">
              <span class="label">Mode:</span> {{ trip.transport }}
            </div>
            <div class="co2-amount">
              <span class="label">CO2:</span> {{ trip.co_2_total }}
            </div>
            <div class="distance">
              <span class="label">Distance:</span> {{ trip.distance_km }} km
          </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent, ref, onMounted } from 'vue';
  import { formatDate, formatCO2 } from '@/utils/formatters';
  import { Trip } from '@/types/trip';
  import { useAuthStore } from '@/stores/auth';
  
  export default defineComponent({
    name: 'TripHistory',
    
    setup() {
      console.log("### Debug: TripHistory component initializing");
      const trips = ref<Trip[]>([]);
      const loading = ref(true);
      const error = ref('');
      const authStore = useAuthStore();
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
      
      const fetchTrips = async () => {
        console.log("### Debug: TripHistory - Fetching trips");
        loading.value = true;
        error.value = '';
        
        try {
          console.log("### Debug: TripHistory - Making API request with token:", authStore.token ? "[Token Available]" : "[No Token]");
          const response = await fetch(`${API_BASE_URL}/users/history`, {
            headers: {
              'Authorization': `Bearer ${authStore.token}`,
              'Content-Type': 'application/json'
            }
          });
          
          console.log("### Debug: TripHistory - API response status:", response.status);

          
          if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
          }
          
          const data = await response.json();
          console.log(`### Debug: TripHistory - Received ${data.length} trips:`, data);
          trips.value = data;
        } catch (err) {
          console.error('### Debug: TripHistory - Failed to fetch trips:', err);
          error.value = err instanceof Error ? err.message : 'Une erreur est survenue lors du chargement des trajets';
        } finally {
          console.log("### Debug: TripHistory - Fetch operation completed");
          loading.value = false;
        }
      };
      
      onMounted(() => {
        console.log("### Debug: TripHistory - Component mounted");
        if (authStore.token) {
          console.log("### Debug: TripHistory - User is authenticated, fetching trips");
          fetchTrips();
        } else {
          console.log("### Debug: TripHistory - User not authenticated, showing error");
          error.value = 'Veuillez vous connecter pour voir votre historique';
          loading.value = false;
        }
      });
      
      return {
        trips,
        loading,
        error,
        formatDate,
        formatCO2
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
  border-bottom: 1px solid #eee;
  padding: 12px 0;
}

.trip-item:last-child {
  border-bottom: none;
}

.trip-header {
  display: flex;
  justify-content: space-between;
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
  display: flex;
  justify-content: space-between;
}

.label {
  font-weight: bold;
  color: #666;
}

.co2-amount {
  color: #4a8;
  font-weight: bold;
}

.distance {
  color: #48a;
}
</style>