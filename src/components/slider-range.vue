<template>
  <div class="range_container">
    <div class="sliders_control">
      <input
        id="fromSlider"
        type="range"
        v-model="fromSlider"
        min="0"
        :max="dataArray.length - 1"
      />
      <input
        id="toSlider"
        type="range"
        v-model="toSlider"
        :min="0"
        :max="dataArray.length - 1"
      />
    </div>
  </div>
</template>

<script>
import { defineComponent } from "vue";
export default defineComponent({
  name: "LineChart",
  props: {
    dataArray: {
      type: Array,
      required: true,
    },
  },
  data: function () {
    return {
      fromSlider: 0,
      toSlider: this.dataArray.length - 1,
    };
  },
  mounted() {
    function controlFromSlider(fromSlider, toSlider) {
      const [from, to] = getParsed(fromSlider, toSlider);
      fillSlider(fromSlider, toSlider, "#C6C6C6", "#ba4de3", toSlider);
      if (from > to) {
        fromSlider.value = to;
      }
    }

    function controlToSlider(fromSlider, toSlider) {
      const [from, to] = getParsed(fromSlider, toSlider);
      fillSlider(fromSlider, toSlider, "#C6C6C6", "#ba4de3", toSlider);
      setToggleAccessible(toSlider);
      if (from <= to) {
        toSlider.value = to;
      } else {
        toSlider.value = from;
      }
    }

    function getParsed(currentFrom, currentTo) {
      const from = parseInt(currentFrom.value, 10);
      const to = parseInt(currentTo.value, 10);
      return [from, to];
    }
    function fillSlider(from, to, sliderColor, rangeColor, controlSlider) {
      const rangeDistance = to.max - to.min;
      const fromPosition = from.value - to.min;
      const toPosition = to.value - to.min;
      controlSlider.style.background = `linear-gradient(
      to right,
      ${sliderColor} 0%,
      ${sliderColor} ${(fromPosition / rangeDistance) * 100}%,
      ${rangeColor} ${(fromPosition / rangeDistance) * 100}%,
      ${rangeColor} ${(toPosition / rangeDistance) * 100}%, 
      ${sliderColor} ${(toPosition / rangeDistance) * 100}%, 
      ${sliderColor} 100%)`;
    }

    function setToggleAccessible(currentTarget) {
      const toSlider = document.querySelector("#toSlider");
      if (Number(currentTarget.value) <= 0) {
        toSlider.style.zIndex = 2;
      } else {
        toSlider.style.zIndex = 0;
      }
    }
    const fromSlider = document.querySelector("#fromSlider");
    const toSlider = document.querySelector("#toSlider");
    fillSlider(fromSlider, toSlider, "#C6C6C6", "#ba4de3", toSlider);
    setToggleAccessible(toSlider);
    fromSlider.oninput = () =>
      controlFromSlider(fromSlider, toSlider);
    toSlider.oninput = () => controlToSlider(fromSlider, toSlider);
  },
  watch: {
    fromSlider() {
      this.$emit("changed", [
        parseInt(this.fromSlider),
        parseInt(this.toSlider),
      ]);
    },
    toSlider() {
      this.$emit("changed", [
        parseInt(this.fromSlider),
        parseInt(this.toSlider),
      ]);
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
  -webkit-appearance: none;
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
