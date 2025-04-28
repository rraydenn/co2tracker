<template>
  <!-- TODO: utiliser dans la MainPage ou supprimer -->
  <div ref="mapContainer" class="map-container"></div>
</template>

<script setup lang="ts">
import {defineComponent, ref, computed, onMounted, nextTick, watch} from 'vue';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { AutocompleteResult } from '@/types/map';
import { initializeMap } from '@/services/map';



  const mapContainer = ref<HTMLElement | null>(null);
  const map = ref<L.Map | null>(null);
  const startMarker = ref<L.Marker | null>(null);
  const endMarker = ref<L.Marker | null>(null);
  const routeLayer = ref<L.GeoJSON | L.LayerGroup | null>(null);
  const baseLayer = ref<L.TileLayer | null>(null);
  const routeGroup = ref<L.LayerGroup>(L.layerGroup());

  if (mapContainer.value && routeGroup.value) {
    map.value = initializeMap(
      mapContainer.value,
      routeGroup.value as L.LayerGroup,
      (latlng: L.LatLng, type: 'start' | 'end') => {
        if (type === 'start') {
          if (startMarker.value) {
            startMarker.value.setLatLng(latlng);
          } else {
            startMarker.value = L.marker(latlng).addTo(routeGroup.value as L.LayerGroup);
          }
        } else if (type === 'end') {
          if (endMarker.value) {
            endMarker.value.setLatLng(latlng);
          } else {
            endMarker.value = L.marker(latlng).addTo(routeGroup.value as L.LayerGroup);
          }
        }
      },
      () => {
        // Handle route calculation logic here
      },
      () => {
        // Handle clear map logic here
        routeGroup.value.clearLayers();
        startMarker.value = null;
        endMarker.value = null;
      },
      () => {
        // Handle toggle menu logic here
      },
      false // Initial state of isMenuVisible
    );
  }
  
  

</script>

<style scoped>
.map-container {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 10px;
  overflow: hidden; /* Cache les débordements */
}
</style>