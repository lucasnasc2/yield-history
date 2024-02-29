<template>
  <div class="wrapper">
    <!-- starting menu-->
    <div class="card" v-if="!historyExists && startingMode == ''">
      <div style="height: 129px;">
        <div class="container">
          <chart :height="85" :title-display="false" :legend-display="false" :chart-data="placeholderChartData" />
        </div>
      </div>
      <div class="flex-layout">
          <button class="grow1 button positive" v-on:click="startingMode = 'import'">
            Importar dados
          </button>
          <button class="grow1 button positive" v-on:click="startingMode = 'scratch'">
            Começar do zero
          </button>
        </div>
    </div>
    <!-- Import -->
    <div v-if="!historyExists && startingMode == 'import'" class="card">
      <div>
        <button class="mx-2" v-on:click="startingMode = ''">
          <mdi-arrow-left size="24" />
        </button>
        <span class="text-lg ml-2">Importar datos</span>
      </div>
      <div v-if="stagedFile == null" class="card flex bg-gray-200" style="height: 81px;">
          <div class="self-center text-center flex-1">nenhum arquivo</div>
        </div>
        <div v-else v-on:click="clearStagedDataAlert" class="card flex no-border" style="height: 81px;background-color: var(--primary); cursor: pointer;">
          <div class="self-center text-center flex-1" style="color: white;">{{stagedFileName}}  {{ Math.round(stagedFileSize/1000) + "kb"}}</div>
        </div>
        <div class="flex-layout">
          <button class="grow1 button bg-gray-200" v-on:click="openFilePicker">
            Escolher arquivo
          </button>
          <button class="grow1 button positive" v-on:click="importFile">
            Importar
          </button>
        </div>
    </div>
    <!-- scratch form-->
    <div v-if="!historyExists && startingMode == 'scratch'" class="card no-padding">
      <div class="container">
        <button class="mx-2" v-on:click="startingMode = ''">
          <mdi-arrow-left size="24" />
        </button>
        <span class="text-lg ml-2">Primeiro registro</span>
      </div>
      <hr />
      <div class="container">
        <!-- Gross Amount input-->
        <div v-if="!historyExists" class="flex-layout justify-space-between pb-2">
          <span>Montante Bruto</span>
          <input
            class="border-solid border-1 rounded-lg border-gray-500 w-1/2"
            type="number"
            v-model="formGrossAmount"
          />
        </div>
        <!-- Current Amount input-->
        <div class="flex-layout justify-space-between pb-2">
          <span>Montante Atual</span>
          <input
            class="border-solid border-1 rounded-lg border-gray-500 w-1/2"
            type="number"
            v-model="formCurrentAmount"
          />
        </div>
        <!-- register button-->
        <div class="flex-layout justify-end max-width">
          <button class="button positive w-1/2" v-on:click="evaluateCondition">
            registrar
          </button>
        </div>
      </div>
    </div>

    <div v-if="historyExists">
      <div class="card">
        <!-- Current Amount input-->
        <div class="flex-layout justify-space-between pb-2">
          <span>Montante Atual</span>
          <input
            class="border-solid border-1 rounded-lg border-gray-500 w-1/2"
            type="number"
            v-model="formCurrentAmount"
          />
        </div>
        <!-- register button-->
        <div class="flex-layout justify-end max-width">
          <button class="button positive w-1/2" v-on:click="evaluateCondition">
            registrar
          </button>
        </div>
      </div>
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
          <span>Taxa média diária (mês)</span>
          <span>{{ averageDayRate }}%</span>
        </div>
        <div class="flex-layout justify-space-between no-padding">
          <span>Taxa acumulada (mês)</span>
          <span
            >{{ monthlyRate }}% (x12 =
            {{ (monthlyRate * 12).toFixed(2) }}%)</span
          >
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
          <slider-range
            ref="rangeSlider"
            :length="historyLength"
            @changed="updateGraph"
          ></slider-range>
        </div>
      </div>
      <!-- monthly yield history chart -->
      <div class="card no-padding">
        <div class="container">
          <chart :title="'Rendimento mensal'" :chart-data="monthlyYiedChartData" />
        </div>
      </div>
      <!-- projection chart -->
      <div class="card no-padding">
        <div class="container">
          <chart :title="'Projeção'" :chart-data="projectionChartData" />
        </div>
        <hr style="margin-top: 0.7em" />
        <div class="container">
          <div class="flex-layout justify-space-between">
            <span>Depósito mensal</span>
            <div class="w-1/2">
              <input
                style="width: 100%; padding-left: 1.5em; font: inherit"
                class="border-solid border-1 rounded-lg border-gray-500"
                type="number"
                v-model="formProjectionMonthlyDeposit"
              /><span style="margin-left: -4.5em" v-if="currencyConverter"
                >{{ currencySymbol() }}
                {{ converter(parseFloat(formProjectionMonthlyDeposit)) }}</span
              >
            </div>
          </div>
        </div>
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
      <!-- export data -->
      <div class="flex-layout pb-2 pt-4">
        <button
          class="span-button button bg-gray-200"
          v-on:click="exportData"
        >
          exportar dados
        </button>
      </div>
      <!-- delete data -->
      <div class="flex-layout pb-6">
        <button
          class="span-button button bg-gray-200"
          v-on:click="deleteAllData"
        >
          apagar registro
        </button>
      </div>
    </div>
    <input type="file" ref="fileInput" @change="stageImportedFile" accept=".json" style="display: none">
  </div>
</template>

<script lang="ts">
import { ref } from 'vue';
import chart from "./chart.vue";
import sliderRange from "./slider-range.vue";
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
/** return todays date in yyyymmdd format */
const getTodayDate = () => new Date().toISOString().slice(0, 10).replace(/-/g, '');
const fileInput = ref<HTMLInputElement | null>(null);

//vue instance
export default {
  name: "AppBody",
  components: { chart, sliderRange },
  data: function () {
    return {
      history: new Array() as HistoryArchive,
      deposits: new Array() as DepositArchive,
      currencyList: new Array() as string[],
      currencyRate: 0,
      currencyDate: "",
      historyExists: false,
      startingMode: "", 
      currencyConverter: false,
      editHistoryForm: false,
      editDepositsForm: false,
      editImportForm: false,
      formImport: "",
      formGrossAmount: "",
      formCurrentAmount: "",
      formDepositAmount: "",
      formDepositPayoutStart: "",
      formEditHistory: "",
      formEditDeposits: "",
      formCurrencySource: "brl",
      formCurrencyTarget: "eur",
      formProjectionMonthlyDeposit: "",
      graphFilterRange: new Array() as number[],
      monthlyGraphFilterRange: new Array() as number[],
      stagedFile: null as any,
      stagedFileHistoryString:"",
      stagedFileDepositsString:"",
      stagedFileName: "",
      stagedFileSize: 0,
    };
  },
  mounted() {
    this.getCurrencyList();
    this.checkHistory();
  },
  computed: {
    historyLength() {
      return this.history.length - 1;
    },
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
      return Number(
        this.history
          .reduce(
            (partialSum, r) => (tsIsCurrentMonth(r.ts) ? partialSum + r.dy : 0),
            0
          )
          .toFixed(2)
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
    placeholderChartData() {
      let data = {
        labels: ["jan","fev","mar","abr","mai"],
        datasets: [
          {
            backgroundColor: "#ba4de3",
            data: [300,335,310,345,365],
            yAxisID: "y",
          }
        ],
      };
      return data;
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
    monthlyYiedChartData() {
      let { labelArray, monthlyYieldArray, percentageMonthlyYieldArray, monthlyAmountArray } =
        this.getMonthlyYieldChartData();

      let data = {
        labels: labelArray,
        datasets: [
          {
            label: this.currencySymbol(),
            backgroundColor: "#ba4de3",
            data: monthlyYieldArray,
            yAxisID: "y",
          },
          {
            label: "%",
            backgroundColor: "#530082",
            data: percentageMonthlyYieldArray,
            yAxisID: "y1",
          },
          {
            label: "Total",
            backgroundColor: "#658185",
            data: monthlyAmountArray,
            yAxisID: "y2",
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
    getMonthlyYieldChartData() {
      let monthlyYieldArray: number[] = [];
      let percentageMonthlyYieldArray: number[] = [];
      let monthlyAmountArray: number[] = [];
      let labelArray: string[] = [];
      let monthlySum: number = 0
      this.history.forEach((a, i) => {
        let newDate = new Date(a.ts)
        let pastDate = new Date(this.history[i == 0 ? i : i-1].ts)
        let newMonth = newDate.getMonth()
        let pastMonth = pastDate.getMonth()
        if (newMonth == pastMonth) {
          monthlySum = monthlySum + a.dy
        } else {
            labelArray.push(new Date(this.history[i-1].ts).toLocaleString(locale, { month: "short" , year: 'numeric'}));
            percentageMonthlyYieldArray.push(percentage(monthlySum, this.history[i-1].am))
            monthlyAmountArray.push(this.converter(this.history[i-1].am))
            monthlyYieldArray.push(this.converter(monthlySum));
            monthlySum = a.dy;
        }
      });
      return { labelArray, monthlyYieldArray, percentageMonthlyYieldArray, monthlyAmountArray };
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
      this.updateHistory();
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
      this.history[this.history.length - 1].gross = parseFloat(
        (deposit + grossAmount).toFixed(2)
      );
      this.history[this.history.length - 1].am = parseFloat(
        (deposit + currentAmount).toFixed(2)
      );
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
      let fullDays = this.filterWeekendsFromInterval(initialTs, futureTs);
      let yieldPercent = this.averageDayRate;
      let amountArray: number[] = [];
      let yieldArray: number[] = [];
      days.forEach((day, i) => {
        let total = i ? amountArray[i - 1] : latest.am;
        let currentYield = (yieldPercent / 100) * total;
        let newTotal = total + currentYield;

        if (this.formProjectionMonthlyDeposit) {
          let monthlyDeposit = parseFloat(this.formProjectionMonthlyDeposit);
          let currentDayMonth = fullDays[i].getMonth();
          if (i > 0) {
            let pastDayMonth = fullDays[i - 1].getMonth();
            if (currentDayMonth != pastDayMonth) {
              newTotal = newTotal + monthlyDeposit;
            }
          }
        }
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
    openImportForm() {
      this.editImportForm = true;
    },
    openFilePicker() {
      if (this.$refs.fileInput) {
        (this.$refs.fileInput as HTMLInputElement).click();
      }
    },
    stageImportedFile(event: Event) {
      const selectedFile = (event.target as HTMLInputElement).files?.[0];
      if (selectedFile) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const jsonString = event.target?.result as string;
            const jsonData = JSON.parse(jsonString);
            console.log("Parsed JSON data:", jsonData);
            // Assign the parsed JSON data to a variable or use it as needed
            // For example, you can assign it to a component data property
            this.stagedFile = jsonData; // Assuming 'parsedData' is a component data property
            this.stagedFileHistoryString = JSON.stringify(jsonData.history);
            this.stagedFileDepositsString = JSON.stringify(jsonData.deposits);
            this.stagedFileName = selectedFile.name
            this.stagedFileSize = selectedFile.size
          } catch (error) {
            console.error("Error parsing JSON:", error);
          }
        };
        reader.readAsText(selectedFile);
        (event.target as HTMLInputElement).value = '';
      }
    },
    importFile() {
      if (!this.stagedFile) {
        alert("Escolha un arquivo");
        return;
      }
      localStorage.setItem("history", this.stagedFileHistoryString);
      localStorage.setItem("deposits", this.stagedFileDepositsString);
      this.checkHistory()
      this.updateHistory();
      this.updateDeposits();
      this.clearStagedData();
      this.startingMode = "";
    },
    clearStagedDataAlert() {
      if (confirm("Descartar arquivo?") == true) {
        this.clearStagedData()
      }
    },
    clearStagedData() {
      this.stagedFile = null;
      this.stagedFileName = "";
      this.stagedFileSize = 0;
      this.stagedFileHistoryString = "";
      this.stagedFileDepositsString = "";
    },
    exportData() {
      let data = {
        history: this.history,
        deposits: this.deposits
      }
      let dt = getTodayDate();
      // Convert the object to a JSON string
      const jsonStr = JSON.stringify(data, null, 2);

      // Create a Blob object from the JSON string
      const blob = new Blob([jsonStr], { type: 'application/json' });

      // Create a link element
      const link = document.createElement('a');

      // Set the href attribute of the link to the Blob object
      link.href = window.URL.createObjectURL(blob);

      // Set the download attribute of the link
      link.download = "yieldHistory_backup_" + dt;

      // Append the link to the body
      document.body.appendChild(link);

      // Programmatically click the link to trigger the download
      link.click();

      // Remove the link from the DOM
      document.body.removeChild(link);
    },
    saveImportForm() {
      const {deposits , history} = JSON.parse(this.formImport)
      console.log(deposits ,history)
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
        localStorage.removeItem("deposits");
        this.history = [];
        this.deposits = [];
        this.historyExists = false;
      } else return;
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
svg {
  display: inline !important
}
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
.no-border{
  border-style: none;
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
