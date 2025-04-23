<template>
  <div class="home-page">

    <AppHeader />
    <main>
      <section id="map">

      <RouteMap />
      </section>

      <aside id="sidebar">

      <SideMenu
        :isVisible="isMenuVisible"
        @toggle="toggleMenu"
      />
      </aside>


    <section id="results">
      <CO2Results />
      <Comparisons />
      <TripSummary />
      
    </section>
    </main> 

    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

// Layout
import AppHeader from '@/components/layout/AppHeader.vue'
import SideMenu from '@/components/layout/SideMenu.vue'
import AppFooter from '@/components/layout/AppFooter.vue'

// Carte & UI
import RouteMap from '@/components/map/RouteMap.vue'
import CO2Results from '@/components/results/CO2Results.vue'
import Comparisons from '@/components/results/Comparisons.vue'
import TripSummary from '@/components/results/TripSummary.vue'

// Exemple d'état local simplifié
const isMenuVisible = ref(false)
const toggleMenu = () => (isMenuVisible.value = !isMenuVisible.value)


</script>

<style scoped>


</style>