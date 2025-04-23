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
            <div class="trip-route">{{ trip.departure }} → {{ trip.arrival }}</div>
            <div class="trip-date">{{ formatDate(trip.created_at) }}</div>
          </div>
          <div class="trip-info">
            <div class="transport-mode">
              <span class="label">Mode:</span> {{ trip.transport }}
            </div>
            <div class="co2-amount">
              <span class="label">CO2:</span> {{ trip.co2 }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent, PropType } from 'vue';
  import { formatDate } from '@/utils/formatters';
  
  interface Trip {
    id: number;
    departure: string;
    arrival: string;
    transport: string;
    co2: string;
    created_at: string;
    user_id: number;
  }
  
  export default defineComponent({
    name: 'TripHistory',
    
    props: {
      trips: {
        type: Array as PropType<Trip[]>,
        default: () => []
      },
      loading: {
        type: Boolean,
        default: false
      },
      error: {
        type: String,
        default: ''
      }
    },
    
    setup() {
      return {
        formatDate
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
  </style>