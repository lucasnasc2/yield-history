<template>
  <div class="wrapper">
    <div class="card">
      <div v-if="!historyExists" class="flex-layout justify-space-between">
        <span>Montante Bruto</span>
        <input v-model="formGrossAmount" />
      </div>
      <div class="flex-layout justify-space-between">
        <span>Montante Atual</span>
        <input v-model="formCurrentAmount" />
      </div>
      <div class="flex-layout">
        <button
          class="span-button button positive"
          v-on:click="this.evaluateCondition"
        >
          calcular
        </button>
      </div>
    </div>

    <div v-if="historyExists">
      <div class="card">
        <div class="flex-layout justify-space-between no-padding">
          <span>Montante total</span>
          <span>{{ this.history[this.history.length - 1].currentAmount }}</span>
        </div>
        <div class="flex-layout justify-space-between no-padding">
          <span>Montante bruto</span>
          <span>{{ this.history[this.history.length - 1].grossAmount }}</span>
        </div>
        <div class="flex-layout justify-space-between no-padding">
          <span>Rendimento total</span>
          <span>{{ this.history[this.history.length - 1].totalYield }}</span>
        </div>
      </div>
      <div class="card">
        <chart :chart-data="this.chartData" />
      </div>
      <div class="flex-layout" v-if="!this.editForm">
        <button class="span-button button" v-on:click="this.openEditHistory">
          editar registro
        </button>
      </div>

      <div v-if="this.editForm" class="card">
        <div class="flex-layout">
          <textarea
            class="max-width"
            type="text"
            v-model="formEditHistory"
            rows="10"
          />
        </div>

        <div class="flex-layout">
          <button
            class="grow1 button negative"
            v-on:click="this.cancelEditHistory"
          >
            cancelar
          </button>
          <button
            class="grow1 button positive"
            v-on:click="this.saveEditHistory"
          >
            salvar
          </button>
        </div>
      </div>
      <div class="flex-layout" v-if="this.historyExists">
        <button class="span-button button" v-on:click="this.deleteAllData">
          apagar registro
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import chart from "./chart.vue";

import getDays from "../misc/getDaysFromInterval.js";
export default {
  name: "HelloWorld",
  components: { chart },
  data: function () {
    return {
      historyExists: false,
      formGrossAmount: null,
      formCurrentAmount: null,
      history: [],
      editForm: false,
      formEditHistory: null,
    };
  },
  mounted() {
    this.checkHistory();
  },
  computed: {
    chartData() {
      const percentage = function (partialValue, totalValue) {
   return ((100 * partialValue) / totalValue).toFixed(2) + "%";
} 
      let dataArray = this.history.map((a) => a.dailyYield);
      let labelArray = this.history.map((a) => percentage(a.dailyYield,a.currentAmount));
      let data = {
        labels: labelArray,
        datasets: [
          {
            label: "Rendimento diário",
            backgroundColor: "#ba4de3",
            data: dataArray,
          },
        ],
      };
      return data;
    },
  },
  watch: {},
  methods: {
    daysSinceLastUpdate() {
      let today = Date.now();
      let lastUpdate = this.history[this.history.length - 1].timestamp;
      let filteredArray = this.filterWeekendsFromInterval(lastUpdate, today);
      return filteredArray.length - 1;
    },
    filterWeekendsFromInterval(start, end) {
      let days = getDays(start, end);
      let daysWithoutWeekends = [];
      days.forEach((day) => {
        let d = day.toString();
        if (d.includes("Sat") || d.includes("Sun")) return;
        daysWithoutWeekends.push(day);
      });
      return daysWithoutWeekends;
    },
    invalidDay() {
      let day = new Date();
      day = day.toString();
      return day.includes("Sun") || day.includes("Mon");
    },
    checkHistory() {
      if (!!localStorage.history) {
        this.history = JSON.parse(localStorage.history);
        this.historyExists = true;
      } else {
        this.history = [];
        this.historyExists = false;
      }
    },
    getSavedGrossAmount() {
      return this.history[this.history.length - 1].grossAmount;
    },
    getDailyYield(days) {
      return (
        (this.formCurrentAmount -
          this.history[this.history.length - 1].currentAmount) /
        days
      );
    },
    getArrayOfMissingData(days) {
      let grossAmount = this.getSavedGrossAmount();
      let arrayOfMissingData = [];
      for (let i = 0; i < days; i++) {
        let totalYield = this.formCurrentAmount - grossAmount;
        let amountObject = {
          grossAmount: grossAmount,
          currentAmount: this.formCurrentAmount,
          totalYield: totalYield.toFixed(2),
          dailyYield: this.getDailyYield(days),
          timestamp: Date.now(),
        };

        arrayOfMissingData.push(amountObject);
      }
      return arrayOfMissingData;
    },
    evaluateCondition() {
      if (!this.formGrossAmount || !this.formCurrentAmount) return
      if (this.historyExists) {
        let days = this.daysSinceLastUpdate();
        if (!days) {
          alert("Esperar 24h.");
          return;
        }
        if (this.invalidDay()) {
          alert("Esperar até o fim do proximo dia útil.");
          return;
        }
        this.calculate();
      } else this.calculateFirstTime();
    },
    calculate() {
      let grossAmount = this.getSavedGrossAmount();
      if (
        this.formCurrentAmount <=
        this.history[this.history.length - 1].currentAmount
      ) {
        alert("Montante invalido.");
        return;
      }
      let days = this.daysSinceLastUpdate();
      if (days === 1) {
        let totalYield = this.formCurrentAmount - grossAmount;
        let amountObject = {
          grossAmount: grossAmount,
          currentAmount: this.formCurrentAmount,
          totalYield: totalYield.toFixed(2),
          dailyYield: this.getDailyYield(),
          timestamp: Date.now(),
        };

        this.saveResult(amountObject);
      } else {
        let arrayOfMissingData = this.getArrayOfMissingData(days);
        arrayOfMissingData.forEach((item) => {
          this.saveResult(item);
        });
      }
    },
    calculateFirstTime() {
      let grossAmount = this.formGrossAmount;

      let totalYield = this.formCurrentAmount - grossAmount;

      let amountObject = {
        grossAmount: grossAmount,
        currentAmount: this.formCurrentAmount,
        totalYield: totalYield.toFixed(2),
        dailyYield: 0,
        timestamp: Date.now(),
      };

      this.saveResult(amountObject);
    },
    saveResult(result) {
      this.history.push(result);
      console.log(this.history);
      localStorage.setItem("history", JSON.stringify(this.history));
      this.resetForm();
      if (!this.historyExists) this.historyExists = true;
    },
    updateHistory() {
      this.history = JSON.parse(localStorage.history);
    },
    resetForm() {
      this.formGrossAmount = null;
      this.formCurrentAmount = null;
      this.formEditHistory = null;
      this.editForm = false;
    },
    openEditHistory() {
      this.formEditHistory = localStorage.history;
      this.editForm = true;
    },
    saveEditHistory() {
      if (!(this.formEditHistory === localStorage.history)) {
        localStorage.setItem("history", this.formEditHistory);
      }
      this.updateHistory();
      this.cancelEditHistory();
    },
    cancelEditHistory() {
      this.formEditHistory = null;
      this.editForm = false;
    },
    deleteAllData() {
      if (
        window.confirm("Apagar todos os dados e reiniciar aplicação?") === true
      ) {
        localStorage.removeItem("history");
        this.history = [];
        this.historyExists = false;
      } else return;
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.wrapper {
  padding: 0 20px;
}
.flex-layout {
  width: 100%;
  display: flex;
  gap: 16px;
  justify-content: center;
  padding: 10px 0;
}
.justify-space-between {
  justify-content: space-between;
}
.grow1 {
  flex-grow: 1;
}
.max-width {
  width: 100%;
}
.span-button {
  width: 70%;
}
.button {
  height: 30px;
  padding: 0 20px;
  border-radius: 8px;
  border: none;
  text-align: center;
  font-size: 16px;
}
.no-padding {
  padding: 0;
}
.positive {
  background-color: var(--primary);
  color: white;
}
.negative {
  background-color: var(--negative);
  color: white;
}
.card {
  border-radius: 8px;
  border: 1px solid grey;
  padding: 10px;
  margin: 10px 0;
}
</style>
