<template>
    <div class="account-page">
      <h1>Mon Compte</h1>
      <div class="profile-card">
        <div class="profile-header">
          <div class="profile-avatar">👤</div>
          <div class="profile-info">
            <h2>Bienvenue, {{ username }}</h2>
            <p>Membre depuis {{ memberSince }}</p>
          </div>
        </div>
        
        <div class="stats-section">
          <h3>Vos statistiques</h3>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-value">{{ totalTrips }}</div>
              <div class="stat-label">Trajets</div>
            </div>
            
            <div class="stat-card">
              <div class="stat-value">{{ totalCO2 }}</div>
              <div class="stat-label">kg CO2</div>
            </div>
            
            <div class="stat-card">
              <div class="stat-value">{{ ranking }}</div>
              <div class="stat-label">Classement</div>
            </div>
          </div>
        </div>
        
        <div class="recent-trips">
          <h3>Trajets récents</h3>
          <div v-if="trips.length === 0" class="no-trips">
            Vous n'avez pas encore de trajets enregistrés.
          </div>
          <div v-else class="trip-list">
            <div v-for="(trip, index) in trips" :key="index" class="trip-item">
              <div class="trip-route">
                {{ trip.departure }} → {{ trip.arrival }}
              </div>
              <div class="trip-details">
                <span class="trip-transport">{{ trip.transport }}</span>
                <span class="trip-co2">{{ trip.co2 }} kg CO2</span>
                <span class="trip-date">{{ trip.date }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <router-link to="/" class="return-btn">Retour à l'accueil</router-link>
      </div>
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent, ref } from 'vue';
  
  interface Trip {
    departure: string;
    arrival: string;
    transport: string;
    co2: string;
    date: string;
  }
  
  export default defineComponent({
    name: 'AccountPage',
    
    setup() {
      const username = ref('Utilisateur');
      const memberSince = ref('01/03/2025');
      const totalTrips = ref('12');
      const totalCO2 = ref('156.3');
      const ranking = ref('Top 10%');
      
      // Sample trips
      const trips = ref<Trip[]>([
        {
          departure: 'Paris',
          arrival: 'Lyon',
          transport: 'Train',
          co2: '15.4',
          date: '28/03/2025'
        },
        {
          departure: 'Lyon',
          arrival: 'Marseille',
          transport: 'Voiture',
          co2: '45.8',
          date: '24/03/2025'
        },
        {
          departure: 'Marseille',
          arrival: 'Paris',
          transport: 'Avion',
          co2: '95.1',
          date: '15/03/2025'
        }
      ]);
      
      return {
        username,
        memberSince,
        totalTrips,
        totalCO2,
        ranking,
        trips
      };
    }
  });
  </script>
  
  <style scoped>
  .account-page {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
  }
  
  .profile-card {
    background-color: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }
  
  .profile-header {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
  }
  
  .profile-avatar {
    font-size: 3rem;
    margin-right: 20px;
  }
  
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 15px;
    margin-bottom: 20px;
  }
  
  .stat-card {
    background-color: #f7f9fc;
    padding: 15px;
    border-radius: 8px;
    text-align: center;
  }
  
  .stat-value {
    font-size: 1.5rem;
    font-weight: bold;
    color: #4a8;
  }
  
  .trip-item {
    border-bottom: 1px solid #eee;
    padding: 10px 0;
  }
  
  .trip-route {
    font-weight: bold;
    margin-bottom: 5px;
  }
  
  .trip-details {
    display: flex;
    justify-content: space-between;
    font-size: 0.9rem;
    color: #666;
  }
  
  .return-btn {
    display: inline-block;
    margin-top: 20px;
    padding: 8px 16px;
    background: #4a8;
    color: white;
    text-decoration: none;
    border-radius: 4px;
  }
  </style>