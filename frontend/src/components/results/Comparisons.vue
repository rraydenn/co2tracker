<template>
  <div class="co2-stats">
    <h2>Statistiques CO2 basées sur votre trajet</h2>
    <div class="charts-container">
      <canvas id="chartCandles"></canvas>
      <canvas id="chartClimateGoal"></canvas>
      <canvas id="chartBananas"></canvas>
      <canvas id="chartCarTank"></canvas>
    </div>
  </div>
</template>

<script setup>
import { onMounted, watch } from 'vue';
import Chart from 'chart.js/auto';
import { ref } from 'vue';

// Props d’entrée
const props = defineProps({
  distanceKm: Number,
  transportType: String // "car", "plane", "train", "bike"
});

const renderCharts = () => {
  const co2Factors = {
    car: 120,
    plane: 250,
    train: 40,
    bike: 0
  };

  const co2PerKm = co2Factors[props.transportType] || 0;
  const totalCO2g = props.distanceKm * co2PerKm;

  const candlesPerHour = 10;
  const candleHours = (totalCO2g / candlesPerHour).toFixed(0);

  const planetLimit = 2000000;
  const percentClimateGoal = ((totalCO2g / planetLimit) * 100).toFixed(2);

  const bananaCO2 = 80;
  const bananas = (totalCO2g / bananaCO2).toFixed(0);

  const carTankCO2 = 25000;
  const fullTanks = (totalCO2g / carTankCO2).toFixed(2);

  const chartData = [
    {
      id: "chartCandles",
      label: "Équivalent bougies (1h)",
      value: candleHours,
      color: "orange"
    },
    {
      id: "chartClimateGoal",
      label: "Objectif climat utilisé (%)",
      value: percentClimateGoal,
      color: "green"
    },
    {
      id: "chartBananas",
      label: "Banane-CO2",
      value: bananas,
      color: "gold"
    },
    {
      id: "chartCarTank",
      label: "Nombre de pleins de voiture",
      value: fullTanks,
      color: "steelblue"
    }
  ];

  chartData.forEach(({ id, label, value, color }) => {
    const ctx = document.getElementById(id);
    if (ctx) {
      new Chart(ctx, {
        type: "doughnut",
        data: {
          labels: [label, "reste"],
          datasets: [{
            data: [value, 100],
            backgroundColor: [color, "#e0e0e0"],
            borderWidth: 1
          }]
        },
        options: {
          plugins: {
            title: {
              display: true,
              text: `${label} : ${value}`
            }
          },
          cutout: "60%"
        }
      });
    }
  });
};

onMounted(renderCharts);

// Si props changent dynamiquement, on re-render
watch(() => [props.distanceKm, props.transportType], renderCharts);
</script>

<style scoped>
.co2-stats {
  padding: 2rem;
  font-family: Arial, sans-serif;
}
h2 {
  text-align: center;
  margin-bottom: 2rem;
}
.charts-container {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;
}
canvas {
  background: #f9f9f9;
  border-radius: 8px;
  padding: 1rem;
}
</style>
