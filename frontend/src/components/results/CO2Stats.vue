<template>
    <div class="co2-stats">
      <h2>Statistiques CO2</h2>
      
      <div v-if="loading" class="loading-container">
        <p>Chargement des statistiques...</p>
      </div>
      <div v-else-if="!stats" class="error-container">
        <p>Impossible de charger les statistiques</p>
      </div>
      <div v-else class="stats-container">
        <div class="stat-card">
          <div class="stat-title">Nombre de trajets</div>
          <div class="stat-value">{{ stats.totalTrips }}</div>
        </div>
        
        <div class="stat-card">
          <div class="stat-title">CO2 Total émis</div>
          <div class="stat-value">{{ stats.totalCO2 }} kg</div>
        </div>
        
        <div class="stat-card full-width">
          <div class="stat-title">Classement</div>
          <div class="stat-value ranking">{{ stats.ranking }}</div>
          <div class="stat-desc">par rapport aux autres utilisateurs</div>
        </div>
        
        <div class="eco-tips">
          <h3>Conseils écologiques</h3>
          <ul>
            <li>Privilégiez les transports en commun pour vos trajets quotidiens</li>
            <li>Le covoiturage permet de réduire jusqu'à 75% vos émissions</li>
            <li>Pour les courtes distances, pensez au vélo ou à la marche</li>
          </ul>
        </div>
      </div>
    </div>
  </template>
  
  <script lang="ts">
import { defineComponent, ref, onMounted, computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { formatCO2 } from '@/utils/formatters';
import { Trip, TripStats, RankingData } from '@/types/trip';

export default defineComponent({
  name: 'CO2Stats',
  
  setup() {
    console.log("### Debug: CO2Stats component initializing");
    const trips = ref<Trip[]>([]);
    const ranking = ref<RankingData | null>(null);
    const loading = ref(true);
    const error = ref('');
    const authStore = useAuthStore();
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    
    const stats = computed<TripStats>(() => {
      console.log("### Debug: CO2Stats - Computing statistics from", trips.value.length, "trips");
      if (trips.value.length === 0) {
        console.log("### Debug: CO2Stats - No trips available, returning empty stats");
        return {
          totalTrips: 0,
          totalCO2: 0,
          totalDistance: 0,
          mostUsedTransport: null,
          ranking: ranking.value?.[0]?.rank ? `${ranking.value[0].rank}` : 'N/A'
        };
      }
      
      // Calculate total CO2
      const totalCO2 = trips.value.reduce((sum, trip) => sum + trip.co_2_total, 0);
      console.log("### Debug: CO2Stats - Total CO2 calculated:", totalCO2);
      
      // Calculate total distance
      const totalDistance = trips.value.reduce((sum, trip) => sum + trip.distance_km, 0);
      console.log("### Debug: CO2Stats - Total distance calculated:", totalDistance);
      
      // Find most used transport
      const transportCounts: Record<string, number> = {};
      trips.value.forEach(trip => {
        const transportName = trip.transport?.name || `Transport ${trip.transport_id}`;
        transportCounts[transportName] = (transportCounts[transportName] || 0) + 1;
      });
      
      let mostUsedTransport: string | null = null;
      let maxCount = 0;
      
      Object.entries(transportCounts).forEach(([transport, count]) => {
        if (count > maxCount) {
          mostUsedTransport = transport;
          maxCount = count;
        }
      });
      
      console.log("### Debug: CO2Stats - Most used transport:", mostUsedTransport, "with count:", maxCount);
      console.log("### Debug: CO2Stats - Ranking data:", ranking.value);
      
      return {
        totalTrips: trips.value.length,
        totalCO2,
        totalDistance,
        mostUsedTransport,
        ranking: ranking.value?.[0]?.rank ? `${ranking.value[0].rank}` : 'N/A'
      };
    });
    
    const fetchTrips = async () => {
      console.log("### Debug: CO2Stats - Fetching trips for statistics");
      try {
        console.log("### Debug: CO2Stats - Making API request with token:", authStore.token ? "[Token Available]" : "[No Token]");
        const response = await fetch(`${API_BASE_URL}/users/history`, {
          headers: {
            'Authorization': `Bearer ${authStore.token}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log("### Debug: CO2Stats - API response status:", response.status);
        
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log(`### Debug: CO2Stats - Received ${data.length} trips for stats calculation`);
        console.log("### Debug: CO2Stats - Trips data:", data);
        trips.value = data;
      } catch (err) {
        console.error('### Debug: CO2Stats - Failed to fetch trips for stats:', err);
        error.value = err instanceof Error ? err.message : 'Une erreur est survenue lors du chargement des statistiques';
        throw err;
      }
    };
    
    const fetchRanking = async () => {
      console.log("### Debug: CO2Stats - Fetching user ranking");
      try {
        console.log("### Debug: CO2Stats - Making ranking API request");
        const response = await fetch(`${API_BASE_URL}/users/ranking`, {
          headers: {
            'Authorization': `Bearer ${authStore.token}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log("### Debug: CO2Stats - Ranking API response status:", response.status);
        
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log("### Debug: CO2Stats - Received ranking data:", data);
        ranking.value = data;
      } catch (err) {
        console.error('### Debug: CO2Stats - Failed to fetch ranking:', err);
        // Not throwing here as this is secondary data
      }
    };
    
    const loadStats = async () => {
      console.log("### Debug: CO2Stats - Loading all statistics");
      loading.value = true;
      error.value = '';
      
      try {
        console.log("### Debug: CO2Stats - Starting parallel API requests");
        await Promise.all([fetchTrips(), fetchRanking()]);
        console.log("### Debug: CO2Stats - All data loaded successfully");
      } catch (err) {
        console.error("### Debug: CO2Stats - Error loading statistics:", err);
        // Error already set in the fetch functions
      } finally {
        console.log("### Debug: CO2Stats - Loading completed");
        loading.value = false;
      }
    };
    
    onMounted(() => {
      console.log("### Debug: CO2Stats - Component mounted");
      if (authStore.token) {
        console.log("### Debug: CO2Stats - User is authenticated, loading stats");
        loadStats();
      } else {
        console.log("### Debug: CO2Stats - User not authenticated, showing error");
        error.value = 'Veuillez vous connecter pour voir vos statistiques';
        loading.value = false;
      }
    });
    
    return {
      stats,
      loading,
      error,
      formatCO2
    };
  }
});
</script>
  
  <style scoped>
  .co2-stats {
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
  
  .loading-container, .error-container {
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
  
  .stats-container {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 15px;
  }
  
  .stat-card {
    background-color: #f0f4f8;
    padding: 15px;
    border-radius: 8px;
    text-align: center;
  }
  
  .full-width {
    grid-column: span 2;
    background-color: #e6f7f0;
  }
  
  .stat-title {
    color: #666;
    margin-bottom: 5px;
    font-size: 0.9em;
  }
  
  .stat-value {
    font-size: 1.8em;
    font-weight: bold;
    color: #2c3e50;
  }
  
  .ranking {
    color: #4a8;
  }
  
  .stat-desc {
    font-size: 0.8em;
    color: #888;
    margin-top: 5px;
  }
  
  .eco-tips {
    grid-column: span 2;
    background-color: #f0f4f8;
    padding: 15px;
    border-radius: 8px;
    margin-top: 10px;
  }
  
  .eco-tips h3 {
    color: #4a8;
    margin-top: 0;
    margin-bottom: 10px;
    font-size: 1.1em;
  }
  
  .eco-tips ul {
    margin: 0;
    padding-left: 20px;
  }
  
  .eco-tips li {
    margin-bottom: 5px;
    color: #555;
  }
  </style>