<template>
  <div class="account-page">
    <h1>Mon Compte</h1>
    <div v-if="!authStore.token" class="auth-required">
      <p>Vous devez être connecté pour accéder à cette page.</p>
      <router-link to="/login" class="login-btn">Se connecter</router-link>
    </div>
    <div v-else class="profile-container">
      <ProfileHeader :userData="accountStore.userData" :loading="accountStore.loading" />
      
      <div class="account-sections">
        <TripHistory 
          :trips="accountStore.userTrips" 
          :loading="accountStore.loading" 
          :error="accountStore.error" 
        />
        <CO2Stats 
          :stats="accountStore.userStats" 
          :loading="accountStore.loading" 
        />
      </div>
      
      <div class="button-container">
        <router-link to="/" class="return-btn">Retour à l'accueil</router-link>
        <button class="button-danger" @click="logout">Déconnexion</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useAccountStore } from '@/stores/account';
import { useRouter } from 'vue-router';
import ProfileHeader from '@/components/results/ProfileHeader.vue';
import TripHistory from '@/components/results/TripHistory.vue';
import CO2Stats from '@/components/results/CO2Stats.vue';

export default defineComponent({
  name: 'AccountPage',
  components: {
    ProfileHeader,
    TripHistory,
    CO2Stats
  },

  setup() {
    const authStore = useAuthStore();
    const accountStore = useAccountStore();
    const router = useRouter();

    const logout = () => {
      authStore.logout();
      router.push('/');
    };

    onMounted(() => {
      console.log("AccountPage mounted, token exists:", !!authStore.token);
      if (!authStore.token) {
        router.push('/login');
      } else {
        accountStore.fetchAccountData(authStore.token);
      }
    });

    return {
      authStore,
      accountStore,
      logout
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

.auth-required {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  text-align: center;
  margin-top: 20px;
}

.profile-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.account-sections {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

@media (max-width: 768px) {
  .account-sections {
    grid-template-columns: 1fr;
  }
}

.button-container {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}

.login-btn, .return-btn {
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
</style>