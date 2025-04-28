import { defineStore } from 'pinia';
import L from 'leaflet';
import { calculateCO2Emissions, calculateCO2BarWidth } from '@/services/co2';
import { fetchRoute } from '@/services/routing';

//TODO: inutilisé
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
    async calculateRoute() {
      if (!this.departureCoordinates || !this.arrivalCoordinates) return;
      
      try {
        const routeData = await fetchRoute(
          this.departureCoordinates, 
          this.arrivalCoordinates,
          this.transport === 'avion' ? 'direct' : 'driving-car'
        );
        
        // Extract distance from route data
        const distanceInMeters = routeData.features[0].properties.summary.distance;
        this.distance = (distanceInMeters / 1000).toFixed(2);
        
        // Calculate CO2
        const totalCO2 = calculateCO2Emissions(
          parseFloat(this.distance),
          this.transport,
          this.people
        );
        const co2BarWidth = calculateCO2BarWidth(totalCO2);
        
        this.calculatedCO2 = `${totalCO2.toFixed(2)} kg CO2`;
        this.co2BarWidth = co2BarWidth;
        this.isTripCalculated = true;
        this.routeData = routeData;
        
        return routeData;
      } catch (error) {
        console.error('Error calculating route:', error);
        throw error;
      }
    }
  }
});