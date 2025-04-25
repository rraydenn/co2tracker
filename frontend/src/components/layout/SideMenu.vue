<template>
    <aside id="menu" :class="{ visible: isMenuVisible, hidden: !isMenuVisible }">
      <!-- Section compte utilisateur -->
      <button id="menu-toggle" @click="toggleMenu">☰</button>

      <div id="account-section">
        <router-link to="/account" id="account-link">👤 Mon compte</router-link>
      </div>
  
      <TripForm
        :departure="departure"
        :arrival="arrival"
        :departureResults="departureResults"
        :arrivalResults="arrivalResults"
        :people="people"
        :transport="transport"
        :isFormValid="isFormValid"
        @onDepartureInput="onDepartureInput"
        @onArrivalInput="onArrivalInput"
        @selectDepartureResult="selectDepartureResult"
        @selectArrivalResult="selectArrivalResult"
        @onTravelFormSubmit="onTravelFormSubmit"
      />
    </aside>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import TripForm from '../forms/TripForm.vue';
  
  const isMenuVisible = ref(false);
  const departure = ref('');
  const departureResults = ref([]);
  const arrival = ref('');
  const arrivalResults = ref([]);
  const people = ref(1);
  const transport = ref('');
  const isFormValid = ref(false);
  
  const toggleMenu = () => {
      isMenuVisible.value = !isMenuVisible.value;
  };
  
  const onDepartureInput = () => {
      // Add logic to populate departureResults based on input
  };
  
  const onArrivalInput = () => {
      // Add logic to populate arrivalResults based on input
  };
  
  const selectDepartureResult = (result) => {
      departure.value = result.display_name;
      departureResults.value = [];
  };
  
  const selectArrivalResult = (result) => {
      arrival.value = result.display_name;
      arrivalResults.value = [];
  };
  
  const onTravelFormSubmit = () => {
      // Add form submission logic
  };
  </script>
  
  <style scoped>
  /* Ajoute les styles pour ton menu ici */
  </style>