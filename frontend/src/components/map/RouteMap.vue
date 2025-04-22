<template>
    <div ref="mapContainer" class="map-container"></div>
  </template>
  
  <script lang="ts">
  import { ref, onMounted } from 'vue';
  import L from 'leaflet';
  
  export default {
    name: 'RouteMap',
    setup() {
      const mapContainer = ref<HTMLElement | null>(null);
      const map = ref<L.Map | null>(null);
      const startMarker = ref<L.Marker | null>(null);
      const endMarker = ref<L.Marker | null>(null);
      const routeGroup = ref<L.LayerGroup | null>(new L.LayerGroup());
      const routeLayer = ref<L.LayerGroup | null>(null);
      const distance = ref<string>('0.00');
  
      const greenIcon = L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      });
  
      const redIcon = L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      });
  
      const initMap = () => {
        console.log('### Debug: Initializing map with container:', mapContainer.value);
        if (!mapContainer.value) {
          console.error('### Debug: Map container element not found!');
          return;
        }
  
        map.value = L.map(mapContainer.value).setView([48.8566, 2.3522], 7);
        console.log('### Debug: Map created and centered on Paris');
  
        const baseLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors',
        }).addTo(map.value as L.Map);
  
        routeGroup.value?.addTo(map.value as L.Map);
  
        map.value.on('click', async (e: L.LeafletMouseEvent) => {
          console.log('### Debug: Map clicked at coordinates:', e.latlng);
          if (startMarker.value && endMarker.value) {
            routeGroup.value?.clearLayers();
            startMarker.value?.remove();
            endMarker.value?.remove();
            startMarker.value = null;
            endMarker.value = null;
            return;
          }
  
          if (!startMarker.value) {
            addMarker(e.latlng, 'start');
          } else if (!endMarker.value) {
            addMarker(e.latlng, 'end');
          }
        });
      };
  
      const addMarker = (latlng: L.LatLng, type: 'start' | 'end') => {
        console.log(`### Debug: Adding ${type} marker at:`, latlng);
        if (!map.value) {
          console.error('### Debug: Cannot add marker, map not initialized');
          return;
        }
  
        if (type === 'start') {
          if (startMarker.value) {
            startMarker.value.setLatLng(latlng);
          } else {
            startMarker.value = L.marker(latlng, { icon: greenIcon, draggable: true })
              .addTo(map.value as L.Map)
              .bindPopup('Départ');
            startMarker.value.on('dragend', () => {
              if (startMarker.value) {
                const newPos = startMarker.value.getLatLng();
                reverseGeocode(newPos, 'start');
              }
              if (endMarker.value) calculateRoute();
            });
          }
        } else {
          if (endMarker.value) {
            endMarker.value.setLatLng(latlng);
          } else {
            endMarker.value = L.marker(latlng, { icon: redIcon, draggable: true })
              .addTo(map.value as L.Map)
              .bindPopup('Arrivée');
            endMarker.value.on('dragend', () => {
              if (endMarker.value) {
                const newPos = endMarker.value.getLatLng();
                reverseGeocode(newPos, 'end');
              }
              if (startMarker.value) calculateRoute();
            });
          }
        }
      };
  
      const reverseGeocode = async (latlng: L.LatLng, type: 'start' | 'end') => {
        const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?lat=${latlng.lat}&lon=${latlng.lng}&format=json`;
        try {
          const response = await fetch(nominatimUrl);
          const data = await response.json();
          const address = data.display_name;
          if (type === 'start') {
            console.log('### Debug: Setting departure address:', address);
          } else {
            console.log('### Debug: Setting arrival address:', address);
          }
        } catch (error) {
          console.error('### Debug: Error during reverse geocoding:', error);
        }
      };
  
      const calculateRoute = async () => {
        if (!map.value || !startMarker.value || !endMarker.value) {
          console.error('### Debug: Cannot calculate route, map or markers not initialized');
          return;
        }
  
        const startLatLng = startMarker.value.getLatLng();
        const endLatLng = endMarker.value.getLatLng();
  
        try {
          const routeData = await fetchOSRMRoute(startLatLng, endLatLng);
          const newRoute = L.geoJSON(routeData.features[0].geometry).addTo(map.value as L.Map);
          routeGroup.value?.addLayer(newRoute);
  
          const distanceInMeters = routeData.features[0].properties.summary.distance;
          distance.value = (distanceInMeters / 1000).toFixed(2);
        } catch (error) {
          console.error('### Debug: Error calculating route:', error);
        }
      };
  
      const fetchOSRMRoute = async (start: L.LatLng, end: L.LatLng) => {
        const url = `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`;
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`OSRM request failed with status ${response.status}`);
        }
        return response.json();
      };
  
      onMounted(() => {
        initMap();
      });
  
      return {
        mapContainer,
        distance,
      };
    },
  };
  </script>
  
  <style scoped>
  .map-container {
    height: 500px;
    width: 100%;
  }
  </style>
  