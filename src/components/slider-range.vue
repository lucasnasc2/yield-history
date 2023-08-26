<template>
  <div class="range_container">
    <div class="sliders_control">
      <input
        id="fromSlider"
        type="range"
        v-model="fromSlider"
        min="0"
        :max="length"
      />
      <input
        id="toSlider"
        type="range"
        v-model="toSlider"
        :min="0"
        :max="length"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
export default defineComponent({
  name: "sliderRange",
  props: {
    length: {
      type: Number,
      required: true,
    },
  },
  data: function () {
    return {
      fromSlider: (this.length > 23 ? this.length - 23 : 0).toString(),
      toSlider: this.length.toString(),
    };
  },
  methods: {
    fillSlider(
      from: HTMLInputElement,
      to: HTMLInputElement,
      sliderColor: string,
      rangeColor: string,
      controlSlider: HTMLInputElement
    ) {
      const rangeDistance = parseFloat(to.max) - parseFloat(to.min);
      const fromPosition = parseFloat(from.value) - parseFloat(to.min);
      const toPosition = parseFloat(to.value) - parseFloat(to.min);
      controlSlider.style.background = `linear-gradient(
      to right,
      ${sliderColor} 0%,
      ${sliderColor} ${(fromPosition / rangeDistance) * 100}%,
      ${rangeColor} ${(fromPosition / rangeDistance) * 100}%,
      ${rangeColor} ${(toPosition / rangeDistance) * 100}%, 
      ${sliderColor} ${(toPosition / rangeDistance) * 100}%, 
      ${sliderColor} 100%)`;
    },
    controlFromSlider(
      fromSlider: HTMLInputElement,
      toSlider: HTMLInputElement
    ) {
      const [from, to] = this.getParsed(fromSlider, toSlider);
      this.fillSlider(fromSlider, toSlider, "#C6C6C6", "#ba4de3", toSlider);
      if (from > to) {
        fromSlider.value = to.toString();
      }
    },
    controlToSlider(fromSlider: HTMLInputElement, toSlider: HTMLInputElement) {
      const [from, to] = this.getParsed(fromSlider, toSlider);
      this.fillSlider(fromSlider, toSlider, "#C6C6C6", "#ba4de3", toSlider);
      this.setToggleAccessible(toSlider);
      if (from <= to) {
        toSlider.value = to.toString();
      } else {
        toSlider.value = from.toString();
      }
    },
    getParsed(currentFrom: HTMLInputElement, currentTo: HTMLInputElement) {
      const from = parseInt(currentFrom.value, 10);
      const to = parseInt(currentTo.value, 10);
      return [from, to];
    },
    setToggleAccessible(currentTarget: HTMLInputElement) {
      const toSlider = document.querySelector("#toSlider") as HTMLInputElement;
      if (parseInt(currentTarget.value) <= 0) {
        toSlider.style.zIndex = "2";
      } else {
        toSlider.style.zIndex = "0";
      }
    },
  },
  mounted() {
    const fromSlider = document.querySelector(
      "#fromSlider"
    ) as HTMLInputElement;
    const toSlider = document.querySelector("#toSlider") as HTMLInputElement;
    this.fillSlider(fromSlider, toSlider, "#C6C6C6", "#ba4de3", toSlider);
    this.setToggleAccessible(toSlider);
    fromSlider.oninput = () => this.controlFromSlider(fromSlider, toSlider);
    toSlider.oninput = () => this.controlToSlider(fromSlider, toSlider);
  },
  watch: {
    fromSlider() {
      this.$emit("changed", [this.fromSlider, this.toSlider]);
    },
    toSlider() {
      this.$emit("changed", [this.fromSlider, this.toSlider]);
    },
    length(v) {
      this.toSlider = v.toString();
    },
  },
});
</script>

<style scoped>
.range_container {
  display: flex;
  flex-direction: column;
  width: 100%;
  margin: 0 0;
  padding: 1em 0;
}

.sliders_control {
  position: relative;
}

.form_control {
  position: relative;
  display: flex;
  justify-content: space-between;
  font-size: 24px;
  color: #635a5a;
}

input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  pointer-events: all;
  width: 20px;
  height: 20px;
  background-color: var(--primary);
  border-radius: 50%;
  cursor: pointer;
}

input[type="range"]::-moz-range-thumb {
  pointer-events: all;
  width: 20px;
  height: 20px;
  background-color: var(--primary);
  border-radius: 50%;
  cursor: pointer;
}

input[type="range"]::-webkit-slider-thumb:hover {
  background: var(--primary);
}

input[type="range"]::-webkit-slider-thumb:active {
  box-shadow: inset 0 0 3px var(--primary), 0 0 9px var(--primary);
  -webkit-box-shadow: inset 0 0 3px var(--primary), 0 0 9px var(--primary);
}

input[type="range"] {
  -webkit-appearance: none;
  appearance: none;
  height: 6px;
  width: 100%;
  border-radius: 3px;
  position: absolute;
  background-color: #c6c6c6;
  pointer-events: none;
}

#fromSlider {
  height: 0;
  margin-top: 3px;
  z-index: 1;
}
</style>
