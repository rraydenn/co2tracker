import { defineStore } from 'pinia';
import L from 'leaflet';

export const useMapStore = defineStore('map', {
  state: () => ({
    map: null as L.Map | null,
    startMarker: null as L.Marker | null,
    endMarker: null as L.Marker | null,
    routeLayer: null as L.GeoJSON | L.LayerGroup | null,
    routeGroup: null as L.LayerGroup | null
  }),

  actions: {
    initMap(container: HTMLElement) {
      this.map = L.map(container).setView([48.8566, 2.3522], 7);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(this.map as L.Map);
      
      this.routeGroup = L.layerGroup().addTo(this.map as L.Map);
      
      return this.map;
    },
    
    addStartMarker(latlng: L.LatLng) {
      if (this.map) {
        const greenIcon = this.createIcon('green');
        
        if (this.startMarker) {
          this.startMarker.setLatLng(latlng);
        } else {
          this.startMarker = L.marker(latlng, { 
            icon: greenIcon, 
            draggable: true 
          }).addTo(this.map as L.Map).bindPopup('Départ');
        }
        
        return this.startMarker;
      }
      return null;
    },
    
    addEndMarker(latlng: L.LatLng) {
      if (this.map) {
        const redIcon = this.createIcon('red');
        
        if (this.endMarker) {
          this.endMarker.setLatLng(latlng);
        } else {
          this.endMarker = L.marker(latlng, { 
            icon: redIcon, 
            draggable: true 
          }).addTo(this.map as L.Map).bindPopup('Arrivée');
        }
        
        return this.endMarker;
      }
      return null;
    },
    
    createIcon(color: string) {
      return L.icon({
        iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${color}.png`,
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });
    },
    
    clearMap() {
      if (this.routeGroup) this.routeGroup.clearLayers();
      if (this.startMarker && this.map) this.map.removeLayer(this.startMarker as L.Marker);
      if (this.endMarker && this.map) this.map.removeLayer(this.endMarker as L.Marker);
      
      this.startMarker = null;
      this.endMarker = null;
      this.routeLayer = null;
    }
  }
});