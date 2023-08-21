<template>
  <div class="wrapper">
    <!-- entry form-->
    <div class="card">
      <div v-if="!historyExists" class="flex-layout justify-space-between pb-2">
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

    <div v-if="historyExists">
      <!-- new deposit form-->
      <div class="card">
        <div class="flex-layout justify-space-between pb-2">
          <span>Novo depósito</span>
          <input
            class="border-solid border-1 rounded-lg border-gray-500 w-1/2"
            type="number"
            v-model="formDepositAmount"
          />
        </div>
        <div class="flex-layout justify-space-between pb-2">
          <span>Início do rendimento</span>
          <input
            class="border-solid border-1 rounded-lg border-gray-500 w-1/2 text-sm"
            type="date"
            v-model="formDepositPayoutStart"
          />
        </div>
        <div class="flex-layout justify-end max-width">
          <button class="button positive w-1/2" v-on:click="addDeposit">
            registrar
          </button>
        </div>
      </div>
      <!-- currency card -->
      <div v-if="currencyActive" class="card">
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
          <span>{{ formatDate(currencyDate) }}</span>
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
      <!-- currency card placeholder -->
      <div
        v-if="!currencyActive"
        class="card flex items-stretch"
        style="height: 118px"
      >
        <span class="self-center text-center flex-1"
          >Inactive<br />Try reloading the page</span
        >
      </div>
      <!-- overview -->
      <div class="card">
        <div class="flex-layout justify-space-between no-padding">
          <span>Montante total</span>
          <span
            >{{ currencySymbol() }}
            {{ converter(history[history.length - 1].am) }}</span
          >
        </div>
        <div class="flex-layout justify-space-between no-padding">
          <span>Montante bruto</span>
          <span
            >{{ currencySymbol() }}
            {{ converter(history[history.length - 1].gross) }}</span
          >
        </div>
        <div class="flex-layout justify-space-between no-padding">
          <span>Rendimento total</span>
          <span
            >{{ currencySymbol() }}
            {{ converter(history[history.length - 1].ty) }}</span
          >
        </div>
        <div class="flex-layout justify-space-between no-padding">
          <span>Rendimento do mês</span>
          <span>{{ currencySymbol() }} {{ converter(monthlyYield) }}</span>
        </div>
        <div class="flex-layout justify-space-between no-padding">
          <span>Taxa média de juros diário (mês)</span>
          <span>{{ averageDayRate }}%</span>
        </div>
        <div class="flex-layout justify-space-between no-padding">
          <span>Taxa acumulada de juros (mês)</span>
          <span>{{ monthlyRate }}% (x12 = {{ (monthlyRate * 12).toFixed(3) }}%)</span>
        </div>
      </div>
      <!-- deposits -->
      <div class="card" v-if="depositsActive">
        <div class="mb-1">Depósitos</div>
        <div
          class="p-2 rounded-lg bg-gray-200"
          style="max-height: 90px; overflow-y: scroll"
        >
          <div
            v-for="deposit in deposits.slice().reverse()"
            :key="deposit.ts"
            class="flex-layout justify-space-between no-padding text-center text-sm"
            :class="deposit.s <= tsNow() ? 'text-gray-500' : ''"
          >
            <span>{{ currencySymbol() + converter(deposit.am) }}</span>
            <span
              >{{ deposit.s <= tsNow() ? "Passou a render em " : "Renderá em "
              }}{{ formatDate(deposit.s) }}</span
            >
          </div>
        </div>
      </div>
      <!-- history chart -->
      <div class="card no-padding">
        <div class="container">
          <chart :title="'Rendimento diário'" :chart-data="historyChartData" />
        </div>
        <hr style="margin-top: 0.7em" />
        <div class="container" style="padding-bottom: 1em">
          <range-slider
            ref="rangeSlider"
            :data-array="history"
            @changed="updateGraph"
          ></range-slider>
        </div>
      </div>
      <!-- projection chart -->
      <div class="card">
        <chart :title="'Projeção'" :chart-data="projectionChartData" />
      </div>
      <!-- history editor -->
      <div class="card">
        <div class="flex-layout">
          <textarea
            :disabled="!editHistoryForm"
            class="max-width"
            type="text"
            v-model="formEditHistory"
            rows="10"
          />
        </div>

        <div v-if="editHistoryForm" class="flex-layout pt-2">
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
      <!-- deposit editor -->
      <div class="card" v-if="deposits.length">
        <div class="flex-layout">
          <textarea
            :disabled="!editDepositsForm"
            class="max-width"
            type="text"
            v-model="formEditDeposits"
            rows="10"
          />
        </div>

        <div v-if="editDepositsForm" class="flex-layout pt-2">
          <button class="grow1 button negative" v-on:click="cancelEditDeposits">
            cancelar
          </button>
          <button class="grow1 button positive" v-on:click="saveEditDeposits">
            salvar
          </button>
        </div>
        <div v-else class="flex-layout pt-2">
          <button
            class="span-button button bg-gray-200"
            v-on:click="openEditDeposits"
          >
            editar registro
          </button>
        </div>
      </div>
      <!-- delete data -->
      <div class="flex-layout pb-6 pt-4">
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
import rangeSlider from "./slider-range.vue";
import getDays from "../misc/getDaysFromInterval.js";
import axios from "axios";
import type {
  HistoryArchive,
  HistoryObject,
  DepositArchive,
  DepositObject,
} from "@/types/History.interface";

//globals
/** browser timezone */
let tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
/** browser locale code */
let locale = Intl.DateTimeFormat().resolvedOptions().locale;
/** return partialValue is what percentage of totalValue */
const percentage = (partialValue: number, totalValue: number) => {
  return Number(((100 * partialValue) / totalValue).toFixed(3));
};

//vue instance
export default {
  name: "HelloWorld",
  components: { chart, rangeSlider },
  data: function () {
    return {
      history: new Array() as HistoryArchive,
      deposits: new Array() as DepositArchive,
      currencyList: new Array() as string[],
      currencyRate: 0,
      currencyDate: "",
      historyExists: false,
      currencyConverter: false,
      editHistoryForm: false,
      editDepositsForm: false,
      formGrossAmount: "",
      formCurrentAmount: "",
      formDepositAmount: "",
      formDepositPayoutStart: "",
      formEditHistory: "",
      formEditDeposits: "",
      formCurrencySource: "brl",
      formCurrencyTarget: "eur",
      graphFilterRange: new Array() as number[],
    };
  },
  mounted() {
    this.getCurrencyList();
    this.checkHistory();
  },
  computed: {
    currencyActive() {
      return !!this.currencyList.length;
    },
    depositsActive() {
      return !!this.deposits.length;
    },
    currencySymbol() {
      return () => {
        if (this.currencyConverter) {
          if (this.formCurrencyTarget == "eur") {
            return "€";
          } else if (this.formCurrencyTarget == "usd") {
            return "$";
          } else return this.formCurrencyTarget;
        } else return "R$";
      };
    },
    converter() {
      return (v: number, d = 2): number => {
        return this.currencyConverter
          ? parseFloat((v * this.currencyRate).toFixed(d))
          : v;
      };
    },
    monthlyYield() {
      const tsIsCurrentMonth = (ts: string | number) => {
        let checkDate = new Date(ts);
        let currentDate = new Date();
        let checkMonth = checkDate.getMonth();
        let currentMonth = currentDate.getMonth();
        return checkMonth == currentMonth;
      };
      return this.history.reduce(
        (partialSum, r) => (tsIsCurrentMonth(r.ts) ? partialSum + r.dy : 0),
        0
      );
    },
    averageDayRate() {
      let averages: number[] = [];
      this.history.forEach((h, i, arr) => {
        if (i >= arr.length - 23) {
          averages.push(percentage(h.dy, h.am));
        }
      });
      return Number(
        (
          averages.reduce((prev, current) => prev + current) / averages.length
        ).toFixed(3)
      );
    },
    monthlyRate() {
      let averages: number[] = [];
      this.history.forEach((h, i, arr) => {
        if (i >= arr.length - 23) {
          averages.push(percentage(h.dy, h.am));
        }
      });
      return Number(
        averages.reduce((prev, current) => prev + current).toFixed(3)
      );
    },
    tsNow() {
      return () => Date.now();
    },
    formatDate() {
      return (d: string | number) => {
        if (!d) return "";
        let date = new Date(d);
        return date.toLocaleDateString(locale, {
          timeZone: tz,
        });
      };
    },
    offsetDeposits() {
      return (amount: number, ts: number): number => {
        let dayIntersects = (
          dateFrom: string | number,
          dateTo: string | number,
          dateCheck: string | number
        ) => {
          let from = parseInt(
            new Date(dateFrom)
              .toISOString()
              .split("T", 1)[0]
              .split("-")
              .join("")
          );
          let to = parseInt(
            new Date(dateTo).toISOString().split("T", 1)[0].split("-").join("")
          );
          let check = parseInt(
            new Date(dateCheck)
              .toISOString()
              .split("T", 1)[0]
              .split("-")
              .join("")
          );
          return check >= from && check <= to;
        };
        let offset = 0;
        // eslint-disable-next-line no-extra-boolean-cast
        if (!!this.deposits.length) {
          this.deposits.forEach((deposit) => {
            if (dayIntersects(deposit.ts, deposit.s, ts)) {
              offset = offset + deposit.am;
            }
          });
          return Math.abs(amount - offset);
        } else return amount;
      };
    },
    historyChartData() {
      let { labelArray, percentageDailyYieldArray, dailyYieldArray } =
        this.getChartHistoryData();

      let data = {
        labels: labelArray,
        datasets: [
          {
            label: this.currencySymbol(),
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
      let { days, yieldArray, amountArray } = this.calculateProjection(12);
      yieldArray = yieldArray.map((a) => this.converter(a, 3));
      amountArray = amountArray.map((a) => this.converter(a));
      let data = {
        labels: days,
        datasets: [
          {
            label: `Total ${this.currencySymbol()}`,
            backgroundColor: "#ba4de3",
            data: amountArray,
            yAxisID: "y",
          },
          {
            label: `Diário ${this.currencySymbol()}`,
            backgroundColor: "#530082",
            data: yieldArray,
            yAxisID: "y1",
          },
        ],
      };
      return data;
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
    updateGraph(arr: []) {
      this.graphFilterRange = arr;
    },
    getChartHistoryData() {
      let dailyYieldArray: number[] = [];
      let percentageDailyYieldArray: string[] = [];
      let labelArray: string[] = [];
      this.history.forEach((a, i) => {
        if (i >= this.graphFilterRange[0] && i <= this.graphFilterRange[1]) {
          percentageDailyYieldArray.push(
            percentage(a.dy, this.offsetDeposits(a.am, a.ts)).toString()
          );
          dailyYieldArray.push(this.converter(a.dy));
          labelArray.push(this.formatDate(a.ts));
        }
      });
      return { labelArray, percentageDailyYieldArray, dailyYieldArray };
    },
    async getCurrency() {
      let fields = this.formCurrencySource && this.formCurrencyTarget;
      if (!fields) return;
      try {
        let params = `${this.formCurrencySource}/${this.formCurrencyTarget}`;
        let endpoint = `https://cdn.jsdelivr.net/gh/fawazahmed0/currency-api@1/latest/currencies/${params}.json`;
        let response = await axios.get(endpoint);
        this.currencyRate = response.data[this.formCurrencyTarget];
        this.currencyDate = response.data.date;
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
    daysSinceLastUpdate() {
      let today = Date.now();
      let lastUpdate = this.history[this.history.length - 1].ts;
      let filteredArray = this.filterWeekendsFromInterval(lastUpdate, today);
      return filteredArray.length - 1;
    },
    checkStillSameDay() {
      let today = new Date().toString();
      let lastUpdate = new Date(
        this.history[this.history.length - 1].ts
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
      let historyString: string = localStorage.history;
      if (historyString) {
        this.fillData(historyString);
        this.historyExists = true;
      } else {
        this.history = [];
        this.historyExists = false;
      }
    },
    fillData(historyString: string) {
      this.history = JSON.parse(historyString);
      this.graphFilterRange = [
        this.history.length > 23 ? this.history.length - 23 : 0,
        this.history.length - 1,
      ];
      let depositsString: string = localStorage.deposits;
      if (depositsString) {
        this.deposits = JSON.parse(depositsString);
      }
    },
    resetGraphFilterRange() {
      this.graphFilterRange = [
        this.history.length > 23 ? this.history.length - 23 : 0,
        this.history.length - 1,
      ];
      this.$refs.rangeSlider.updateSlider(
        this.graphFilterRange[0],
        this.graphFilterRange[1]
      );
    },
    getSavedGrossAmount() {
      return this.history[this.history.length - 1].gross;
    },
    getDailyYield(days: number) {
      return (
        (parseFloat(this.formCurrentAmount) -
          this.history[this.history.length - 1].am) /
        days
      );
    },
    getArrayOfMissingData(days: number) {
      let grossAmount = this.history[this.history.length - 1].gross;
      let arrayOfMissingData = [];
      for (let i = 0; i < days; i++) {
        let totalYield = parseFloat(this.formCurrentAmount) - grossAmount;
        let amountObject: HistoryObject = {
          gross: grossAmount,
          am: parseFloat(this.formCurrentAmount),
          ty: parseFloat(totalYield.toFixed(2)),
          dy: parseFloat(this.getDailyYield(days).toFixed(2)),
          ts: Date.now(),
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
        // if (this.invalidDay()) {
        //   alert("Esperar até o fim do proximo dia útil.");
        //   return;
        // }
        this.calculate();
      } else this.calculateFirstTime();
    },
    calculate() {
      let grossAmount = this.getSavedGrossAmount();
      if (
        parseFloat(this.formCurrentAmount) <=
        this.history[this.history.length - 1].am
      ) {
        alert("Montante invalido.");
        return;
      }
      let days = this.daysSinceLastUpdate();
      if (days <= 1) {
        let totalYield = parseFloat(this.formCurrentAmount) - grossAmount;
        let amountObject: HistoryObject = {
          gross: grossAmount,
          am: parseFloat(this.formCurrentAmount),
          ty: parseFloat(totalYield.toFixed(2)),
          dy: parseFloat(this.getDailyYield(1).toFixed(2)),
          ts: Date.now(),
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

      let amountObject: HistoryObject = {
        gross: grossAmount,
        am: parseFloat(this.formCurrentAmount),
        ty: parseFloat(totalYield.toFixed(2)),
        dy: 0,
        ts: Date.now(),
      };

      this.saveResult(amountObject);
    },
    saveResult(result: HistoryObject) {
      this.history.push(result);
      localStorage.setItem("history", JSON.stringify(this.history));
      this.resetForm();
      this.resetGraphFilterRange();
      if (!this.historyExists) this.historyExists = true;
    },
    addDeposit() {
      if (!this.formDepositAmount || !this.formDepositPayoutStart) {
        alert("Formulário vazio");
        return;
      }
      let am = parseFloat(this.formDepositAmount);
      let s = Date.parse(this.formDepositPayoutStart);
      console.log(am, s);
      let deposit: DepositObject = {
        am,
        s,
        ts: Date.now(),
        b: false,
      };
      this.deposits.push(deposit);
      localStorage.setItem("deposits", JSON.stringify(this.deposits));
      this.addToGrossAmount(deposit.am);
      this.resetForm();
    },
    addToGrossAmount(deposit: number) {
      let currentAmount = this.history[this.history.length - 1].am;
      let grossAmount = this.history[this.history.length - 1].gross;
      this.history[this.history.length - 1].gross = deposit + grossAmount;
      this.history[this.history.length - 1].am = deposit + currentAmount;
      localStorage.setItem("history", JSON.stringify(this.history));
    },
    calculateProjection(months: number) {
      let latest = this.history[this.history.length - 1];
      let initialTs = latest.ts;
      let date = new Date(initialTs);
      let futureTs = date.setMonth(date.getMonth() + months).valueOf();
      let days = this.filterWeekendsFromInterval(initialTs, futureTs).map(
        (day) =>
          day.toLocaleDateString(locale, {
            timeZone: tz,
          })
      );
      let yieldPercent = parseFloat(
        percentage(latest.dy, this.offsetDeposits(latest.am, latest.ts))
      );
      let amountArray: number[] = [];
      let yieldArray: number[] = [];
      days.forEach((day, i) => {
        let total = i ? amountArray[i - 1] : latest.am;
        let currentYield = (yieldPercent / 100) * total;
        let newTotal = total + currentYield;
        amountArray.push(newTotal);
        yieldArray.push(currentYield);
      });
      return { yieldArray, amountArray, days };
    },
    updateHistory() {
      this.history = JSON.parse(localStorage.history);
    },
    updateDeposits() {
      this.deposits = JSON.parse(localStorage.deposits);
    },
    resetForm() {
      this.formGrossAmount = "";
      this.formDepositAmount = "";
      this.formCurrentAmount = "";
      this.formDepositPayoutStart = "";
      this.formEditHistory = "";
      this.editHistoryForm = false;
    },
    openEditHistory() {
      this.formEditHistory = localStorage.history;
      this.editHistoryForm = true;
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
      this.editHistoryForm = false;
    },
    openEditDeposits() {
      this.formEditDeposits = localStorage.deposits;
      this.editDepositsForm = true;
    },
    saveEditDeposits() {
      if (!(this.formEditDeposits === localStorage.deposits)) {
        localStorage.setItem("deposits", this.formEditDeposits);
      }
      this.updateDeposits();
      this.cancelEditDeposits();
    },
    cancelEditDeposits() {
      this.formEditDeposits = "";
      this.editDepositsForm = false;
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
input {
  padding: 3px 6px !important;
}
textarea {
  padding: 3px !important;
}
.wrapper {
  padding: 0 10px;
}
.card {
  border-radius: 8px;
  border: 1px solid grey;
  padding: 10px;
  margin: 10px 0;
}
.container {
  padding: 10px;
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
