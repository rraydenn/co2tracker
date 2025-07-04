import { defineStore } from 'pinia';
import axios from 'axios';
import { UserStats, UserData } from '@/types/user';
import { Trip } from '@/types/trip';
import { log } from '@/utils/logger';


// Variables d'environnement
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const useAccountStore = defineStore('account', {
  state: () => ({
    userData: null as UserData | null,
    userTrips: [] as Trip[],
    userStats: {
      totalTrips: 0,
      totalCO2: '0.0',
      ranking: 'N/A',
    } as UserStats,
    error: null as string | null,
    loading: false,
  }),

  actions: {
    async fetchAccountData(token: string) {
      try {
        this.loading = true;
        this.error = null;
    
        const headers = { Authorization: `Bearer ${token}` };
    
        // Fetch user name with better error handling
        try {
          log("Fetching user data from API...", 'debug');
          const userResponse = await axios.get(`${API_BASE_URL}/users/me`, { headers });
          log('API Response:', 'debug', userResponse.data);
          
          if (userResponse.data && typeof userResponse.data === 'object') {
            this.userData = {
              id: userResponse.data.id || null,
              full_name: userResponse.data.full_name || null,
              email: userResponse.data.email || null,
              created_at: userResponse.data.created_at || null,
              updated_at: userResponse.data.updated_at || null
            };
            
            log('User data fetched:', 'debug', this.userData);
          } else {
            throw new Error('Invalid response format from API');
          }
        } catch (err) {
          console.error('Error fetching user data:', err);
          throw err;
        }
    
        // The trips and stats can be uncommented when your API supports them
        /* 
        const tripsResponse = await axios.get(`${API_BASE_URL}/trips`, { headers });
        this.userTrips = tripsResponse.data;
    
        const statsResponse = await axios.get(`${API_BASE_URL}/user/stats`, { headers });
        this.userStats = statsResponse.data;
        */
    
        log('Account data fetched successfully', 'debug');
        return this.userData;
      } catch (error) {
        log('Error fetching account data: ' + (error as Error).message, 'error');
        this.error = 'Erreur lors du chargement des données. Veuillez réessayer.';
        throw error;
      } finally {
        this.loading = false;
      }
    },
  },
});