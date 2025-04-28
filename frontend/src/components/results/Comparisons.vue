<template>
  <div class="comparisons">
    <p>{{ co2number }}</p>
    <div class="chart-container">
      <h3>Nombre de bougies allumées pendant 1h</h3>
      <canvas ref="candlesChart"></canvas>
    </div>

    <div class="chart-container">
      <h3>Pourcentage de l'objectif climat utilisé</h3>
      <canvas ref="quotaChart"></canvas>
    </div>

    <div class="chart-container">
      <h3>Nombre d'arbres nécessaires pour compenser</h3>
      <canvas ref="treesChart"></canvas>
    </div>

    <div class="chart-container">
      <h3>Équivalent en plein de voitures</h3>
      <canvas ref="castleChart"></canvas>
    </div>
  </div>
</template>

<script>
import { defineComponent, onMounted, ref } from 'vue'
import Chart from 'chart.js/auto'

export default defineComponent({
  name: 'Comparisons',

  props: {
    co2number: {
      type: Number,
      required: true,
      default: 0 // Provide a default value to avoid undefined
    },
  },

  setup(props) {
    const co2Emitted = props.co2number;
    
    // Références pour les graphiques
    const candlesChart = ref(null);
    const quotaChart = ref(null);
    const treesChart = ref(null);
    const castleChart = ref(null);
    


  // Données pour les conversions amusantes
  const CO2_per_candle = 0.01; // kg de CO2 par bougie/heure
  const CO2_per_tree_year = 20; // kg CO2 absorbé par arbre par an
  const CO2_quota_per_year = 2000; // kg CO2 par personne par an
  const CO2_castle_per_hour = 0.2; // kg CO2 par heure de chateau gonflable

onMounted(() => {
  console.log('co2Emitted:', co2Emitted);
  console.log('Comparison component mounted');

  // Bougies allumées
  new Chart(candlesChart.value, {
    type: 'bar',
    data: {
      labels: ['Bougies équivalentes'],
      datasets: [{
        label: 'Nombre de bougies (1h)',
        data: [Math.round(co2Emitted / CO2_per_candle)],
        backgroundColor: '#ffcc00'
      }]
    },
    options: {
      plugins: { title: { display: true, text: 'Bougies allumées pendant 1h' } }
    }
  });

  // Pourcentage du quota annuel
  new Chart(quotaChart.value, {
    type: 'doughnut',
    data: {
      labels: ['Utilisé', 'Restant'],
      datasets: [{
        data: [co2Emitted, Math.max(0, CO2_quota_per_year - co2Emitted)],
        backgroundColor: ['#ff6384', '#36a2eb']
      }]
    },
    options: {
      plugins: { title: { display: true, text: 'Quota CO₂ Annuel Utilisé' } }
    }
  });

  // Arbres nécessaires pour compenser
  new Chart(treesChart.value, {
    type: 'bubble',
    data: {
      datasets: [{
        label: 'Arbres nécessaires',
        data: [{ x: 5, y: 5, r: Math.min(30, Math.max(5, co2Emitted / CO2_per_tree_year * 5)) }],
        backgroundColor: '#4caf50'
      }]
    },
    options: {
      plugins: { title: { display: true, text: 'Nombre d\'arbres pour compenser' } }
    }
  });

  // Heures de chateau gonflable
  new Chart(castleChart.value, {
    type: 'bar',
    data: {
      labels: ['Heures de chateau gonflable'],
      datasets: [{
        label: 'Heures équivalentes',
        data: [Math.round(co2Emitted / CO2_castle_per_hour)],
        backgroundColor: '#ff66cc'
      }]
    },
    options: {
      plugins: { title: { display: true, text: 'Temps de chateau gonflable équivalent' } }
    }
  });
});

    return {
      candlesChart,
      quotaChart,
      treesChart,
      castleChart
    }
  }
})
</script>

<style scoped>
.comparisons {
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
  justify-content: center;
  margin-top: 2rem;
}

.chart-container {
  width: 300px;
}
</style>
