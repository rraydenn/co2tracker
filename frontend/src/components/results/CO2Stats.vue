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
  import { defineComponent, PropType } from 'vue';
  
  interface UserStats {
    totalTrips: number;
    totalCO2: string;
    ranking: string;
  }
  
  export default defineComponent({
    name: 'CO2Stats',
    
    props: {
      stats: {
        type: Object as PropType<UserStats>,
        default: null
      },
      loading: {
        type: Boolean,
        default: false
      }
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