import { defineStore } from 'pinia';
import L from 'leaflet';
import { calculateCO2Emissions, calculateCO2BarWidth } from '@/services/co2';
import { fetchRoute } from '@/services/routing';
import axios from 'axios';

// Variables d'environnement
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const LOG_LEVEL = 'info';

// Utils : gestion du niveau de log
function log(
	message: string,
	level: 'debug' | 'info' | 'warn' | 'error' = 'info'
) {
	const levelOrder = ['debug', 'info', 'warn', 'error'];
	if (levelOrder.indexOf(level) >= levelOrder.indexOf(LOG_LEVEL)) {
		console[level](`[AUTH] ${message}`);
	}
}


export const useTripStore = defineStore('trip', {
  state: () => ({
    departure: '',
    arrival: '',
    people: 1,
    transport: 'voiture',
    distance: '0',
    departureCoordinates: null as L.LatLng | null,
    arrivalCoordinates: null as L.LatLng | null,
    routeData: null,
    isTripCalculated: false,
    calculatedCO2: '0 kg CO2',
    co2BarWidth: 0
  }),

  actions: {


    async savingTransport(name:string, co2_per_km: number, average_speed: number){
      try{
        const response = await axios.get(`${API_BASE_URL}/transports`)

        const existing = response.data.find((transport: any) =>
          transport.name === name &&
          transport.co2_per_km === co2_per_km &&
          transport.average_speed === average_speed
        )
           
        if (existing) { return existing.id }
   
        const postRes = await axios.post(`${API_BASE_URL}/transports`, {
          name,
          co2_per_km,
          average_speed,
        })

        log('Transport enregistrée avec succès.', 'info')

        return postRes.data.id

      } catch (error) {
        log(
          'Échec de la sauvegarde de Transport : ' +
          (error as Error).message,
          'error'
        )
      }   
    },

    async savingAddress(full_address:string, latitude: number, longitude: number) {
      try {
        const response = await axios.get(`${API_BASE_URL}/address`)

        const existing = response.data.find((address: any) =>
           address.latitude === latitude &&
          address.longitude === longitude
        )

        if (existing) { return existing.id }

        const postRes = await axios.post(`${API_BASE_URL}/address`, {
          full_address,
          latitude,
          longitude
        })

        log('Adresse enregistrée avec succès.', 'info')

        return postRes.data.id

      } catch (error) {
          log(
            'Échec de la sauvegarde Adresse : ' +
            (error as Error).message,
            'error'
          )
      }
    },

    async savingTripToHistory( token: string, transport_id: number, start_address_id: number,
                               end_address_id: number, distance_km: number, co_2_total: number ) {
      try {
        const response = await axios.post(
          `${API_BASE_URL}/users/history`,
          {
            transport_id,
            start_address_id,
            end_address_id,
            distance_km,
            co_2_total,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )

        if(token) { localStorage.setItem('token', token); }

        log('Trajet enregistré avec succès.', 'info')

      } catch (error) {
          log(
            'Échec de l’enregistrement du trajet : ' +
            (error as Error).message,
            'error'
          )
      }
    },



  }
});