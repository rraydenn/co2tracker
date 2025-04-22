<template>
    <div class="co2-consumption">
      <h3>Consommation de CO2</h3>
      <p><strong>CO2 émis : </strong>{{ calculatedCO2 }} g</p>
      <div class="co2-bar">
        <div class="filled-bar" :style="{ width: co2BarWidth + '%' }"></div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue'
  
  // Données à recevoir depuis un parent (par exemple, `CO2Tracker.vue`)
  const calculatedCO2 = ref(0)
  const co2BarWidth = computed(() => {
    return Math.min(100, (calculatedCO2.value / 1000) * 100)  // Exemple pour l'échelle de la barre
  })
  </script>
  
  <style scoped>
  /* Style pour la consommation de CO2 */
  .co2-consumption {
    margin-top: 20px;
  }
  
  .co2-bar {
    width: 100%;
    height: 10px;
    background-color: #ddd;
  }
  
  .filled-bar {
    height: 100%;
    background-color: #4caf50;
  }
  </style>
  