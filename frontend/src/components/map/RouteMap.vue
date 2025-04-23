<template>
  <div ref="mapContainer" class="map-container"></div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useMapStore } from '@/stores/map';

// Initialisez le store
const mapStore = useMapStore();
const mapContainer = ref<HTMLElement | null>(null);

onMounted(() => {
  if (mapContainer.value) {
    mapStore.initMap(mapContainer.value);
  }
});
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