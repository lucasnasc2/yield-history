<template>
  <LineChartGenerator
    :options="chartOptions"
    :data="chartData"
    :chart-id="chartId"
    :dataset-id-key="datasetIdKey"
    :width="width"
    :height="height"
  />
</template>

<script lang="ts">
import { Line as LineChartGenerator } from "vue-chartjs";
import { defineComponent } from "vue";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  LinearScale,
  CategoryScale,
  PointElement,
} from "chart.js";

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  LineElement,
  LinearScale,
  CategoryScale,
  PointElement
);

export default defineComponent({
  name: "LineChart",
  components: {
    LineChartGenerator,
  },
  props: {
    chartData: {
      type: Object,
      required: true,
    },
    chartId: {
      type: String,
      default: "line-chart",
    },
    title: {
      type: String,
      default: "no title",
    },
    titleDisplay: {
      type: Boolean,
      default: true,
    },
    legendDisplay: {
      display: Boolean,
      default: true
    },
    datasetIdKey: {
      type: String,
      default: "label",
    },
    width: {
      type: Number,
      default: 400,
    },
    height: {
      type: Number,
      default: 300,
    },
  },
  data() {
    return {
      chartOptions: {
        responsive: true,
        interaction: {
          mode: "index",
          intersect: false,
        },
        stacked: false,
        plugins: {
          title: {
            display: this.titleDisplay,
            text: this.title,
          },
          legend: {
            display: this.legendDisplay
          }
        },
        scales: {
          y: {
            type: "linear",
            display: true,
            position: "left",
          },
          y1: {
            type: "linear",
            display: true,
            position: "right",

            // grid line settings
            grid: {
              drawOnChartArea: false, // only want the grid lines for one axis to show up
            },
          },
        },
      },
    };
  },
});
</script>
