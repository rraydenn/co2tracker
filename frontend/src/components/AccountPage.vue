<template>
  <div class="account-page">
    <h1>Mon Compte</h1>
    <div v-if="!authStore.token" class="auth-required">
      <p>Vous devez être connecté pour accéder à cette page.</p>
      <router-link to="/login" class="login-btn">Se connecter</router-link>
    </div>
    <div v-else class="profile-card">
      <UserProfile :token="authStore.token" />
      
      <div class="button-container" style="display: flex; justify-content: space-between; margin-top: 20px;">
        <router-link to="/" class="return-btn">Retour à l'accueil</router-link>
        <button class="button-danger" @click="logout">Déconnexion</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';
import UserProfile from './UserProfile.vue';

export default defineComponent({
  name: 'AccountPage',
  components: {
    UserProfile
  },

  setup() {
    const authStore = useAuthStore();
    const router = useRouter();

    const logout = () => {
      authStore.logout();
      router.push('/');
    };

    onMounted(() => {
      console.log("AccountPage mounted, token exists:", !!authStore.token);
      if (!authStore.token) {
        router.push('/login');
      }
    });

    return {
      authStore,
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

.profile-card {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.login-btn, .return-btn {
  display: inline-block;
  margin-top: 10px;
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