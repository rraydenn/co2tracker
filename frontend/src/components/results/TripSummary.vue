<template>
  <!-- TODO: utiliser dans la MainPage ou supprimer -->
  <div class="summary">
      <h3>Résumé de votre voyage</h3>
      <p><strong>Départ :</strong> {{ departure }}</p>
      <p><strong>Arrivée :</strong> {{ arrival }}</p>
      <p><strong>Mode de transport :</strong> {{ transport }}</p>
      <p><strong>Nombre de personnes :</strong> {{ people }}</p>
      <p><strong>Distance totale :</strong> {{ distance }} km</p>
    </div>
  </template>
  
  <script setup>
  // Données à recevoir depuis un parent (par exemple, `CO2Tracker.vue`)
  defineProps(['departure', 'arrival', 'transport', 'people', 'distance'])
  </script>
  
  <style scoped>
  /* Style pour le résumé du trajet */
  .summary {
    margin-top: 20px;
  }
  </style>
  