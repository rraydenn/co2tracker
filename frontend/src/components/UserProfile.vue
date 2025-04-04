<template>
    <div class="user-profile">
      <div v-if="loading" class="loading-container">
        <p>Chargement de vos données...</p>
      </div>
      <div v-else-if="error" class="error-container">
        <p>{{ error }}</p>
        <button class="return-btn" @click="reload">Réessayer</button>
      </div>
      <div v-else-if="userData" class="profile-content">
        <div class="profile-header">
          <div class="profile-avatar">👤</div>
          <div class="profile-info">
            <h2>Bienvenue, {{ userData.full_name }}</h2>
            <p>Membre depuis {{ formatDate(userData.created_at) }}</p>
          </div>
        </div>
  
        <div class="stats-section">
          <h3>Vos statistiques</h3>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-value">{{ userStats.totalTrips || 0 }}</div>
              <div class="stat-label">Trajets</div>
            </div>
  
            <div class="stat-card">
              <div class="stat-value">{{ userStats.totalCO2 || '0.0' }}</div>
              <div class="stat-label">kg CO2</div>
            </div>
  
            <div class="stat-card">
              <div class="stat-value">{{ userStats.ranking || 'N/A' }}</div>
              <div class="stat-label">Classement</div>
            </div>
          </div>
        </div>
  
        <div class="recent-trips">
          <h3>Trajets récents</h3>
          <div v-if="userTrips.length === 0" class="no-trips">
            Vous n'avez pas encore de trajets enregistrés.
          </div>
          <div v-else class="trip-list">
            <div v-for="trip in userTrips" :key="trip.id" class="trip-item">
              <div class="trip-route">
                {{ trip.departure }} → {{ trip.arrival }}
              </div>
              <div class="trip-details">
                <span class="trip-transport">{{ trip.transport }}</span>
                <span class="trip-co2">{{ trip.co2 }} kg CO2</span>
                <span class="trip-date">{{ formatDate(trip.created_at) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent, onMounted, ref, computed, watch, PropType } from 'vue';
  import { useAuthStore } from '../stores/auth';
  import { useAccountStore } from '../stores/account';
  
  export default defineComponent({
    name: 'UserProfile',
    
    props: {
      token: {
        type: String,
        required: true
      }
    },
    
    setup(props) {
      const accountStore = useAccountStore();
      
      const loading = ref(true);
      const dataLoaded = ref(false);
      
      const formatDate = (dateString: string | null): string => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR');
      };
      
      const loadUserData = async () => {
        loading.value = true;
        try {
          console.log("UserProfile - Loading user data with token");
          await accountStore.fetchAccountData(props.token);
          console.log("UserProfile - Data loaded:", accountStore.userData);
          dataLoaded.value = true;
        } catch (error) {
          console.error("Error loading user profile:", error);
        } finally {
          loading.value = false;
        }
      };
      
      const reload = () => {
        loadUserData();
      };
      
      onMounted(() => {
        console.log("UserProfile mounted with token:", !!props.token);
        if (props.token) {
          loadUserData();
        }
      });
      
      // Watch for token changes and reload data if needed
      watch(() => props.token, (newToken) => {
        if (newToken) {
          console.log("Token changed, reloading user data");
          loadUserData();
        }
      });
  
      return {
        userData: computed(() => accountStore.userData),
        userTrips: computed(() => accountStore.userTrips),
        userStats: computed(() => accountStore.userStats),
        error: computed(() => accountStore.error),
        loading,
        formatDate,
        reload
      };
    }
  });
  </script>
  
  <style scoped>
  .loading-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 200px;
    background-color: #f0f0f0;
    border-radius: 8px;
  }
  
  .error-container {
    background-color: #fff0f0;
    padding: 20px;
    border-radius: 8px;
    text-align: center;
    color: #ef4444;
    min-height: 200px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
  
  .return-btn {
    display: inline-block;
    margin-top: 20px;
    padding: 8px 16px;
    background: #4a8;
    color: white;
    text-decoration: none;
    border-radius: 4px;
    border: none;
    cursor: pointer;
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
  </style>