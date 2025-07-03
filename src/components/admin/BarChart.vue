<template>
  <div>
    <canvas ref="chartCanvas"></canvas>
  </div>
</template>

<script setup>
import { onMounted, watch, ref } from 'vue'
import { Chart, registerables } from 'chart.js'
Chart.register(...registerables)

const props = defineProps({
  data: {
    type: Array,
    required: true,
  },
  label: {
    type: String,
    default: '값',
  },
})

const chartCanvas = ref(null)
let chartInstance = null

function renderChart() {
  if (!chartCanvas.value) return
  const ctx = chartCanvas.value.getContext('2d')
  if (chartInstance) {
    chartInstance.destroy()
  }

  const labels = props.data.map((item) => `${item.endpoint} (${item.httpMethod})`)
  const values = props.data.map((item) => item.value ?? 0)

  chartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: props.label,
          data: values,
          backgroundColor: '#42a5f5',
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              return `${props.label}: ${context.parsed.y}`
            },
          },
        },
      },
      scales: {
        x: {
          ticks: {
            autoSkip: false,
            maxRotation: 0, 
            minRotation: 0, 
            font: {
              family: 'Arial',
              size: 12,
              weight: 'normal',
              style: 'normal',
            },
            color: '#333',
          },
        },
        y: {
          beginAtZero: true,
        },
      },
    },
  })
}

onMounted(renderChart)
watch(() => props.data, renderChart, { deep: true })
</script>

<style scoped>
canvas {
  max-width: 100%;
  max-height: 400px;
}
</style>
