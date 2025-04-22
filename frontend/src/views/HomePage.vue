<template>
  <div class="home-page">

    <AppHeader />
    <main>
            <!---
      <RouteMap />
      

      -->
      <SideMenu
        :isVisible="isMenuVisible"
        @toggle="toggleMenu"
      />





    <div>
      <CO2Results />
      <Comparisons />
      <TripSummary />
      
    </div>
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
import TripForm from '@/components/forms/TripForm.vue'
import CO2Results from '@/components/results/CO2Results.vue'
import Comparisons from '@/components/results/Comparisons.vue'
import TripSummary from '@/components/results/TripSummary.vue'

// Exemple d'état local simplifié
const isMenuVisible = ref(false)
const toggleMenu = () => (isMenuVisible.value = !isMenuVisible.value)

const departure = ref('')
const arrival = ref('')
const departureResults = ref<any[]>([])
const arrivalResults = ref<any[]>([])
const people = ref(1)
const transport = ref('voiture')

const isFormValid = computed(() => departure.value && arrival.value && people.value > 0)

// Coordonnées (à récupérer du géocodeur)
const departureCoords = ref(null)
const arrivalCoords = ref(null)
const route = ref(null)
const co2Data = ref<{ total: number; distance: number } | null>(null)
const tripDetails = ref({})

// Handlers
function onDepartureInput(val: string) { /* appel au service de géocodage */ }
function onArrivalInput(val: string) { /* appel au service de géocodage */ }
function selectDepartureResult(result: any) { departure.value = result.display_name }
function selectArrivalResult(result: any) { arrival.value = result.display_name }

function onTravelFormSubmit() {
  // Appeler API de routage + calcul CO2
  // Puis mettre à jour co2Data, route, etc.
}
</script>

<style scoped></style>