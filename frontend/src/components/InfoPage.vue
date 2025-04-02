<template>
    <div class="info-page">
      <h1>Informations du site</h1>
      <div class="content">
        <h2>À propos de CO2 Tracker</h2>
        <p>
          CO2 Tracker est une application permettant de calculer et de visualiser
          l'empreinte carbone de vos déplacements.
        </p>
        
        <h2>Comment ça marche</h2>
        <p>
          1. Entrez votre point de départ et d'arrivée
          2. Sélectionnez votre mode de transport
          3. Indiquez le nombre de personnes 
          4. Obtenez une estimation de votre empreinte CO2
        </p>
        
        <h2>Nos sources de données</h2>
        <p>
          Les calculs d'émissions CO2 sont basés sur des données provenant de 
          sources officielles concernant les émissions moyennes des différents
          modes de transport.
        </p>
        
        <router-link to="/" class="return-btn">Retour à l'accueil</router-link>
      </div>
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent } from 'vue';
  
  export default defineComponent({
    name: 'InfoPage'
  });
  </script>
  
  <style scoped>
  .info-page {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
  }
  
  .content {
    background-color: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }
  
  .return-btn {
    display: inline-block;
    margin-top: 20px;
    padding: 8px 16px;
    background: #4a8;
    color: white;
    text-decoration: none;
    border-radius: 4px;
  }
  </style>