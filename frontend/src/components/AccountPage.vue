<template>
  <div class="account-page">
    <h1>Mon Compte</h1>
    <div v-if="loading" class="loading-container">
      <p>Chargement de vos données...</p>
    </div>
    <div v-else-if="error" class="error-container">
      <p>{{ error }}</p>
      <button class="return-btn" @click="tryAgain">Réessayer</button>
    </div>
    <div v-else class="profile-card">
      <div class="profile-header">
        <div class="profile-avatar">👤</div>
        <div class="profile-info">
          <h2>Bienvenue, {{ userData?.full_name }}</h2>
          <p>Membre depuis {{ formatDate(userData?.created_at) }}</p>
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

      <div class="button-container" style="display: flex; justify-content: space-between; margin-top: 20px;">
        <router-link to="/" class="return-btn">Retour à l'accueil</router-link>
        <button class="button-danger" @click="logout">Logout</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useAccountStore } from '../stores/account';
import { useRouter } from 'vue-router';

export default defineComponent({
  name: 'AccountPage',

  setup() {
    const authStore = useAuthStore();
    const accountStore = useAccountStore();
    const router = useRouter();

    const formatDate = (dateString: string | undefined): string => {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR');
    };

    const tryAgain = () => {
      if (authStore.token) {
        accountStore.fetchAccountData(authStore.token);
      }
    };

    const logout = () => {
      authStore.logout();
      router.push('/');
    };

    onMounted(() => {
      if (authStore.token) {
        accountStore.fetchAccountData(authStore.token);
      } else {
        router.push('/login');
      }
    });

    return {
      ...accountStore,
      formatDate,
      tryAgain,
      logout,
    };
  },
});
</script>

<style scoped>
.account-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.loading-container,
.error-container {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  text-align: center;
  margin-top: 20px;
}

.error-container {
  color: #ef4444;
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
  padding: 8px 16px;
  background: #4a8;
  color: white;
  text-decoration: none;
  border-radius: 4px;
}

.button-danger {
  background: #ef4444;
  padding: 8px 16px;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.button-danger:hover {
  background: #f87171;
}

.no-trips {
  text-align: center;
  padding: 20px;
  background-color: #f7f9fc;
  border-radius: 8px;
  color: #666;
}
</style>