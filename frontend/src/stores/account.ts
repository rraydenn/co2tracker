import { defineStore } from 'pinia';
import axios from 'axios';

// Types
interface UserStats {
  totalTrips: number;
  totalCO2: string;
  ranking: string;
}

interface Trip {
  id: number;
  departure: string;
  arrival: string;
  transport: string;
  co2: string;
  created_at: string;
  user_id: number;
}

interface UserData {
  id: number | null;
  full_name: string | null;
  email: string | null;
  created_at: string | null;
  updated_at: string | null;
}

// Variables d'environnement
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const LOG_LEVEL = import.meta.env.VITE_LOG_LEVEL || 'info';

// Utils : gestion du niveau de log
function log(
  message: string,
  level: 'debug' | 'info' | 'warn' | 'error' = 'info'
) {
  const levelOrder = ['debug', 'info', 'warn', 'error'];
  if (levelOrder.indexOf(level) >= levelOrder.indexOf(LOG_LEVEL)) {
    console[level](`[ACCOUNT] ${message}`);
  }
}

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

        // Fetch user name
        const userResponse = await axios.get(`${API_BASE_URL}/users/me`, { headers });
        this.userData = {
          id: null,
          full_name: userResponse.data["full_name"],
          email: null,
          created_at: userResponse.data["create_at"],
          updated_at: null
        };
        console.log('User data:', this.userData);

        // Fetch user trips
        //const tripsResponse = await axios.get(`${API_BASE_URL}/trips`, { headers });
        //this.userTrips = tripsResponse.data;

        // Fetch user stats
        //const statsResponse = await axios.get(`${API_BASE_URL}/user/stats`, { headers });
        //this.userStats = statsResponse.data;

        log('Account data fetched successfully', 'info');
      } catch (error) {
        log('Error fetching account data: ' + (error as Error).message, 'error');
        this.error = 'Erreur lors du chargement des données. Veuillez réessayer.';
      } finally {
        this.loading = false;
      }
    },
  },
});