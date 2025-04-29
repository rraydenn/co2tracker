<template>
  <div class="comparisons">
    <div class="chart-container">
      <canvas ref="candlesChart"></canvas>
    </div>

    <div class="chart-container">
      <canvas ref="quotaChart"></canvas>
    </div>

    <div class="chart-container">
      <canvas ref="treesChart"></canvas>
    </div>

    <div class="chart-container">
      <canvas ref="vikingChart"></canvas>
    </div>

    <div class="chart-container">
    <canvas ref="luneChart" width="300" height="300"></canvas>
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
    if (co2Emitted === undefined && co2Emitted === 0) {
      console.error('co2Emitted is undefined');
      co2Emitted = 666; // Set a default value if undefined
    } else {
      console.log('co2Emitted:', co2Emitted);
    }
    
    // Références pour les graphiques
    const candlesChart = ref(null);
    const quotaChart = ref(null);
    const treesChart = ref(null);
    const vikingChart = ref(null);
    const luneChart = ref(null);
    


  // Données pour les conversions amusantes
  const CO2_per_candle = 0.01; // kg de CO2 par bougie/heure
  const CO2_per_tree_year = 20; // kg CO2 absorbé par arbre par an
  const CO2_quota_per_year = 2000; // kg CO2 par personne par an
  const CO2_per_cremationViking = 200; // kg CO2 par heure de château

  // Hypothèse : 10 000 000 kg CO₂ pour un aller-retour Terre–Lune en fusée
  const co2TerreLune = 10000000

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
      plugins: { title: { display: true, text: 'Quota CO₂ annuel moyen par personne utilisé' } }
    }
  });

  // Arbres nécessaires pour compenser
  
  new Chart(treesChart.value, {
    type: 'bar',
    data: {
      labels: ['Nombre d\'arbres necessaires pour compenser'], 
      datasets: [{
        label: 'Nombre d\'arbres necessaires pour compenser',
        data: [Math.round(co2Emitted / CO2_per_tree_year)],
        backgroundColor: 'green'
      }]
    },
    options: {
      plugins: { title: { display: true, text: 'Nombre d\'arbres' } }
    }
  });

  // Heures de chateau gonflable
  new Chart(vikingChart.value, {
    type: 'pie',
    data: {
      labels: ['Votre trajet', 'Cremation Viking restant'],
      datasets: [{
        data: [co2Emitted, CO2_per_cremationViking - co2Emitted],
        backgroundColor: ['blue', 'red']
      }]
    },
    options: {
      plugins: { title: { display: true, text: 'Pourcentage d\'une cremation viking' } }
    }
  });


new Chart(luneChart.value, {
    type: 'pie',
    data: {
      labels: ['Votre trajet', 'Voyage Terre–Lune restant'],
      datasets: [{
        data: [co2Emitted, co2TerreLune - co2Emitted],
        backgroundColor: ['#f06292', '#e0e0e0']
      }]
    },
    options: {
      plugins: { title: { display: true, text: 'Pourcentage d\'un voyage Terre Lune' } }
    }
  });
});

    return {
      candlesChart,
      quotaChart,
      treesChart,
      vikingChart,
      luneChart,
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
  height: 300px;
}
</style>
