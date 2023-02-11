<template>
  <div class="wrapper">
    <div class="card">
      <div v-if="!historyExists" class="flex-layout justify-space-between">
        <span>Montante Bruto</span>
        <input
          class="border-solid border-1 rounded-lg border-gray-500 w-1/2"
          type="number"
          v-model="formGrossAmount"
        />
      </div>
      <div class="flex-layout justify-space-between pb-2">
        <span>Montante Atual</span>
        <input
          class="border-solid border-1 rounded-lg border-gray-500 w-1/2"
          type="number"
          v-model="formCurrentAmount"
        />
      </div>
      <div class="flex-layout justify-end max-width">
        <button class="button positive w-1/2" v-on:click="evaluateCondition">
          registrar
        </button>
      </div>
    </div>

    <div v-if="historyExists" class="card">
      <div class="flex-layout justify-space-between pb-2">
        <span>Novo depósito</span>
        <input
          class="border-solid border-1 rounded-lg border-gray-500 w-1/2"
          type="number"
          v-model="formGrossAmountUpdate"
        />
      </div>
      <div class="flex-layout justify-end max-width">
        <button class="button positive w-1/2" v-on:click="addToGrossAmount">
          registrar
        </button>
      </div>
    </div>
    <div class="card">
      <div class="flex-layout justify-space-between pb-2">
        <span>Moeda</span>
        <select
          class="border-solid border-1 rounded-lg border-gray-500"
          v-model="formCurrencySource"
        >
          <option v-for="item in currencyList" :key="item" :value="item">
            {{ item }}
          </option>
        </select>
        <span>→</span>
        <select
          class="border-solid border-1 rounded-lg border-gray-500"
          v-model="formCurrencyTarget"
        >
          <option v-for="item in currencyList" :key="item" :value="item">
            {{ item }}
          </option>
        </select>
      </div>
      <div class="flex-layout justify-space-between pb-2">
        <span>Taxa</span>
        <span>{{ currencyRate }}</span>
      </div>
      <div class="flex-layout justify-end max-width">
        <button
          :class="currencyConverter ? 'bg-gray-200' : 'positive'"
          class="button w-1/2"
          v-on:click="currencyConverter = !currencyConverter"
        >
          {{ currencyConverter ? "Original" : "Converter" }}
        </button>
      </div>
    </div>
    <div v-if="historyExists">
      <div class="card">
        <div class="flex-layout justify-space-between no-padding">
          <span>Montante total</span>
          <span>{{
            converter(history[history.length - 1].currentAmount)
          }}</span>
        </div>
        <div class="flex-layout justify-space-between no-padding">
          <span>Montante bruto</span>
          <span>{{ converter(history[history.length - 1].grossAmount) }}</span>
        </div>
        <div class="flex-layout justify-space-between no-padding">
          <span>Rendimento total</span>
          <span>{{ converter(history[history.length - 1].totalYield) }}</span>
        </div>
      </div>
      <div class="card">
        <chart :title="'Rendimento diário'" :chart-data="historyChartData" />
      </div>
      <div class="card">
        <chart :title="'Projeção'" :chart-data="projectionChartData" />
      </div>

      <div class="card">
        <div class="flex-layout">
          <textarea
            :disabled="!editForm"
            class="max-width"
            type="text"
            v-model="formEditHistory"
            rows="10"
          />
        </div>

        <div v-if="editForm" class="flex-layout pt-2">
          <button class="grow1 button negative" v-on:click="cancelEditHistory">
            cancelar
          </button>
          <button class="grow1 button positive" v-on:click="saveEditHistory">
            salvar
          </button>
        </div>
        <div v-else class="flex-layout pt-2">
          <button
            class="span-button button bg-gray-200"
            v-on:click="openEditHistory"
          >
            editar registro
          </button>
        </div>
      </div>
      <div class="flex-layout pb-6 pt-4" v-if="historyExists">
        <button
          class="span-button button bg-gray-200"
          v-on:click="deleteAllData"
        >
          apagar registro
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import chart from "./chart.vue";
import getDays from "../misc/getDaysFromInterval.js";
import axios from "axios";
import type { HistoryArchive, HistoryObject } from "@/types/History.interface";
let tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
let locale = Intl.DateTimeFormat().resolvedOptions().locale;

const percentage = (partialValue: number, totalValue: number) => {
  return ((100 * partialValue) / totalValue).toFixed(3);
};
export default {
  name: "HelloWorld",
  components: { chart },
  data: function () {
    return {
      historyExists: false,
      formGrossAmount: "",
      formCurrentAmount: "",
      formGrossAmountUpdate: "",
      history: new Array() as HistoryArchive,
      editForm: false,
      formEditHistory: "",
      currencyList: new Array() as string[],
      formCurrencySource: "brl",
      formCurrencyTarget: "eur",
      currencyRate: 0,
      currencyConverter: false,
    };
  },
  mounted() {
    this.getCurrencyList();
    this.checkHistory();
  },
  computed: {
    historyChartData() {
      let dailyYieldArray = this.history.map((a) => a.dailyYield);
      let percentageDailyYieldArray = this.history.map((a) =>
        percentage(a.dailyYield, a.currentAmount)
      );
      let labelArray = this.history.map((a) => {
        let date = new Date(a.timestamp);
        return date.toLocaleDateString(locale, {
          timeZone: tz,
        });
      });
      let data = {
        labels: labelArray,
        datasets: [
          {
            label: "R$",
            backgroundColor: "#ba4de3",
            data: dailyYieldArray,
            yAxisID: "y",
          },
          {
            label: "%",
            backgroundColor: "#530082",
            data: percentageDailyYieldArray,
            yAxisID: "y1",
          },
        ],
      };
      return data;
    },
    projectionChartData() {
      const { days, yieldArray, amountArray } = this.calculateProjection(12);
      let data = {
        labels: days,
        datasets: [
          {
            label: "Total R$",
            backgroundColor: "#ba4de3",
            data: amountArray,
            yAxisID: "y",
          },
          {
            label: "Diário R$",
            backgroundColor: "#530082",
            data: yieldArray,
            yAxisID: "y1",
          },
        ],
      };
      return data;
    },
    converter() {
      return (v: number): number => {
        return this.currencyConverter
          ? parseFloat((v * this.currencyRate).toFixed(2))
          : v;
      };
    },
  },
  watch: {
    formCurrencySource() {
      this.getCurrency();
    },
    formCurrencyTarget() {
      this.getCurrency();
    },
  },
  methods: {
    async getCurrency() {
      let fields = this.formCurrencySource && this.formCurrencyTarget;
      if (!fields) return;
      try {
        let params = `${this.formCurrencySource}/${this.formCurrencyTarget}`;
        let endpoint = `https://cdn.jsdelivr.net/gh/fawazahmed0/currency-api@1/latest/currencies/${params}.json`;
        let response = await axios.get(endpoint);
        this.currencyRate = response.data[this.formCurrencyTarget];
        console.log(response);
      } catch (error) {
        console.log(error);
      }
    },
    async getCurrencyList() {
      try {
        let response = await axios.get(
          "https://cdn.jsdelivr.net/gh/fawazahmed0/currency-api@1/latest/currencies.min.json"
        );
        this.currencyList = Object.keys(response.data);
        this.getCurrency();
      } catch (error) {
        console.log(error);
      }
    },
    calculateCurrencyRate() {},
    daysSinceLastUpdate() {
      let today = Date.now();
      let lastUpdate = this.history[this.history.length - 1].timestamp;
      let filteredArray = this.filterWeekendsFromInterval(lastUpdate, today);
      return filteredArray.length - 1;
    },
    checkStillSameDay() {
      let today = new Date().toString();
      let lastUpdate = new Date(
        this.history[this.history.length - 1].timestamp
      ).toString();
      let todayWeekday = today.substring(0, 3);
      let lastUpdateWeekday = lastUpdate.substring(0, 3);
      return todayWeekday === lastUpdateWeekday;
    },
    filterWeekendsFromInterval(start: number, end: number) {
      let days = getDays(start, end);
      let daysWithoutWeekends: Date[] = [];
      days.forEach((day) => {
        let d = day.toString();
        if (d.includes("Sun") || d.includes("Mon")) return;
        daysWithoutWeekends.push(day);
      });
      return daysWithoutWeekends;
    },
    invalidDay() {
      let day = new Date();
      let dayString = day.toString();
      return dayString.includes("Sun") || dayString.includes("Mon");
    },
    checkHistory() {
      if (localStorage.history) {
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
    getDailyYield(days: number) {
      return (
        (parseFloat(this.formCurrentAmount) -
          this.history[this.history.length - 1].currentAmount) /
        days
      );
    },
    getArrayOfMissingData(days: number) {
      let grossAmount = this.history[this.history.length - 1].grossAmount;
      let arrayOfMissingData = [];
      for (let i = 0; i < days; i++) {
        let totalYield = parseFloat(this.formCurrentAmount) - grossAmount;
        let amountObject = {
          grossAmount: grossAmount,
          currentAmount: parseFloat(this.formCurrentAmount),
          totalYield: parseFloat(totalYield.toFixed(2)),
          dailyYield: parseFloat(this.getDailyYield(days).toFixed(2)),
          timestamp: Date.now(),
        };

        arrayOfMissingData.push(amountObject);
      }
      return arrayOfMissingData;
    },
    evaluateCondition() {
      if (this.historyExists) {
        let days = this.daysSinceLastUpdate();
        if (!days) {
          if (this.checkStillSameDay()) {
            alert("Esperar 24h.");
            return;
          }
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
        parseFloat(this.formCurrentAmount) <=
        this.history[this.history.length - 1].currentAmount
      ) {
        alert("Montante invalido.");
        return;
      }
      let days = this.daysSinceLastUpdate();
      if (days <= 1) {
        let totalYield = parseFloat(this.formCurrentAmount) - grossAmount;
        let amountObject = {
          grossAmount: grossAmount,
          currentAmount: parseFloat(this.formCurrentAmount),
          totalYield: parseFloat(totalYield.toFixed(2)),
          dailyYield: parseFloat(this.getDailyYield(1).toFixed(2)),
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
      if (!this.formGrossAmount || !this.formCurrentAmount) {
        alert("Formulário vazio");
        return;
      }
      let grossAmount = parseFloat(this.formGrossAmount);

      let totalYield = parseFloat(this.formCurrentAmount) - grossAmount;

      let amountObject = {
        grossAmount: grossAmount,
        currentAmount: parseFloat(this.formCurrentAmount),
        totalYield: parseFloat(totalYield.toFixed(2)),
        dailyYield: 0,
        timestamp: Date.now(),
      };

      this.saveResult(amountObject);
    },
    saveResult(result: HistoryObject) {
      this.history.push(result);
      localStorage.setItem("history", JSON.stringify(this.history));
      this.resetForm();
      if (!this.historyExists) this.historyExists = true;
    },
    addToGrossAmount() {
      let currentAmount = this.history[this.history.length - 1].currentAmount;
      let grossAmount = this.history[this.history.length - 1].grossAmount;
      let newAmount = parseFloat(this.formGrossAmountUpdate);
      if (newAmount <= 0 || !newAmount) {
        alert("Formulário vazio");
        return;
      }
      this.history[this.history.length - 1].grossAmount =
        newAmount + grossAmount;
      this.history[this.history.length - 1].currentAmount =
        newAmount + currentAmount;
      localStorage.setItem("history", JSON.stringify(this.history));
      this.resetForm();
    },
    calculateProjection(months: number) {
      let latest = this.history[this.history.length - 1];
      let initialTs = latest.timestamp;
      let date = new Date(initialTs);
      let futureTs = date.setMonth(date.getMonth() + months).valueOf();
      let days = this.filterWeekendsFromInterval(initialTs, futureTs).map(
        (day) =>
          day.toLocaleDateString(locale, {
            timeZone: tz,
          })
      );
      let yieldPercent = parseFloat(
        percentage(latest.dailyYield, latest.currentAmount)
      );
      let amountArray: number[] = [];
      let yieldArray: number[] = [];
      days.forEach((day, i) => {
        let total = i ? amountArray[i - 1] : latest.currentAmount;
        let currentYield = (yieldPercent / 100) * total;
        let newTotal = total + currentYield;
        amountArray.push(newTotal);
        yieldArray.push(currentYield);
      });
      amountArray = amountArray.map((i) => parseFloat(i.toFixed(2)));
      yieldArray = yieldArray.map((i) => parseFloat(i.toFixed(2)));
      return { yieldArray, amountArray, days };
    },
    updateHistory() {
      this.history = JSON.parse(localStorage.history);
    },
    resetForm() {
      this.formGrossAmount = "";
      this.formGrossAmountUpdate = "";
      this.formCurrentAmount = "";
      this.formEditHistory = "";
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
      this.formEditHistory = "";
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
  padding: 0 10px;
}
.card {
  border-radius: 8px;
  border: 1px solid grey;
  padding: 10px;
  margin: 10px 0;
}
.flex-layout {
  width: 100%;
  display: flex;
  gap: 16px;
  justify-content: center;
}
.justify-space-between {
  justify-content: space-between;
}
.justify-end {
  justify-content: end;
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
  text-align: center;
  font-size: 16px;
}
.border-1 {
  border-width: 1px;
}
.no-padding {
  padding: 0;
}
.no-padding-x {
  padding-left: 0;
  padding-right: 0;
}
.no-padding-y {
  padding-top: 0;
  padding-bottom: 0;
}
.positive {
  background-color: var(--primary);
  color: white;
}
.negative {
  background-color: var(--negative);
  color: white;
}
.onDisabled:disabled {
  background-color: #d3d3d3;
}
</style>
