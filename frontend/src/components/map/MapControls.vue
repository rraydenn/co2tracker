<template>
    <div class="route-controls">
      <button @click="clearRoute" v-if="isRouteAvailable">Clear Route</button>
      <button @click="calculateRoute" v-if="isRouteAvailable">Recalculate Route</button>
      <div v-if="routeCalculationInProgress" class="loading-indicator">Calculating route...</div>
      <div v-if="distance.value" class="route-distance">
        <p>Distance: {{ distance.value }} km</p>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      routeCalculationInProgress: Boolean,
      distance: {
        type: Object,
        required: true
      },
      isRouteAvailable: Boolean
    },
    methods: {
      clearRoute() {
        console.log("### Debug: Clearing route");
        this.$emit('clearRoute');
      },
      recalculateRoute() {
        console.log("### Debug: Recalculating route");
        this.$emit('recalculateRoute');
      }
    }
  };
  </script>
  
  <style scoped>
  .route-controls {
    padding: 10px;
    background-color: #f4f4f4;
    border-radius: 5px;
  }
  
  button {
    margin: 5px;
    padding: 10px;
    background-color: #4CAF50;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
  }
  
  button:hover {
    background-color: #45a049;
  }
  
  .loading-indicator {
    font-size: 14px;
    color: #ff9800;
  }
  
  .route-distance {
    font-size: 16px;
    font-weight: bold;
  }
  </style>
  