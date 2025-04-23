import { defineStore } from 'pinia';
import L from 'leaflet';
import { fetchRoute } from '../services/routing';

export const useMapStore = defineStore('map', {
  state: () => ({
    map: null as L.Map | null,
    startMarker: null as L.Marker | null,
    endMarker: null as L.Marker | null,
    routeLayer: null as L.GeoJSON | L.LayerGroup | null,
    routeGroup: null as L.LayerGroup | null
  }),

  actions: {
    initMap(container: HTMLElement, options: { center: L.LatLngTuple; zoom: number } = { center: [48.8566, 2.3522], zoom: 7 }) {
      if (this.map) {
        console.warn("Map is already initialized");
        return;
      }
    
      this.map = L.map(container, {
        zoomAnimation: false,
        fadeAnimation: false
      }).setView(options.center, options.zoom);
    
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png?cache_buster=' + Date.now(), {
        attribution: '&copy; OpenStreetMap contributors',
        minZoom: 1,
        maxZoom: 19,
        errorTileUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/ac/No_image_available.svg'
      }).addTo(this.map as L.Map);
    
      this.map.invalidateSize();
    
      this.routeGroup = L.layerGroup().addTo(this.map as L.Map);
    
      window.addEventListener('resize', () => {
        this.map?.invalidateSize();
      });
    
      this.map.on('click', async (e: L.LeafletMouseEvent) => {
        console.log("### Debug: Map clicked at coordinates:", e.latlng);
    
        if (this.startMarker && this.endMarker) {
          console.log("### Debug: Both markers exist, clearing map and route");
    
          this.routeGroup?.clearLayers();
          this.startMarker?.remove();
          this.endMarker?.remove();
          this.startMarker = null;
          this.endMarker = null;
          console.log("### Debug: Markers removed");
    
          return;
        }
    
        if (!this.startMarker) {
          console.log("### Debug: Adding start marker");
          this.addStartMarker(e.latlng);
        } else if (!this.endMarker) {
          console.log("### Debug: Adding end marker");
          this.addEndMarker(e.latlng);
          console.log("### Debug: Calculating route...");
          await fetchRoute(this.startMarker.getLatLng(), e.latlng);
        }
      });
    
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