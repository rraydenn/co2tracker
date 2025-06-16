<template>
    <div class="profile-header">
      <div v-if="loading" class="loading-container">
        <p>Chargement des informations...</p>
      </div>
      <div v-else-if="!userData" class="error-container">
        <p>Impossible de charger les informations du profil</p>
      </div>
      <div v-else class="user-info">
        <div class="user-avatar">{{ userInitials }}</div>
        <div class="user-details">
          <h2>{{ userData.full_name }}</h2>
          <p class="user-email">{{ userData.email }}</p>
          <p class="user-since">Membre depuis le {{ formatDate(userData.created_at) }}</p>
        </div>
      </div>
    </div>
  </template>
  
  <script lang="ts">
  import { computed, defineComponent, PropType } from 'vue';
  import { formatDate } from '@/utils/formatters';
  import { UserData } from '@/types/user';

  
  export default defineComponent({
    name: 'ProfileHeader',
    
    props: {
      userData: {
        type: Object as PropType<UserData | null>,
        default: null
      },
      loading: {
        type: Boolean,
        default: false
      }
    },
    
    setup(props) {
      const userInitials = computed(() => {
        if (!props.userData?.full_name) return '?';
        return props.userData.full_name
          .split(' ')
          .map(name => name.charAt(0).toUpperCase())
          .join('');
      });
      
      return {
        userInitials,
        formatDate
      };
    }
  });
  </script>
  
  <style scoped>
  .profile-header {
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    padding: 20px;
    margin-bottom: 20px;
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
  
  .user-info {
    display: flex;
    align-items: center;
    gap: 20px;
  }
  
  .user-avatar {
    width: 60px;
    height: 60px;
    background-color: #4a8;
    color: white;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 24px;
    font-weight: bold;
  }
  
  .user-details h2 {
    margin: 0 0 5px 0;
  }
  
  .user-email {
    color: #666;
    margin: 0 0 5px 0;
  }
  
  .user-since {
    font-size: 0.9em;
    color: #888;
    margin: 0;
  }
  </style>