<template>
  <div id="app" style="display: flex; flex-direction: column; min-height: 100vh;">
    <header class="header">Registro de rendimentos</header>
    <app-body style="flex: 1;" />
    <footer class="text-sm text-center pb-1" style="margin-top: auto;">Developed by <a href="https://github.com/lucasnasc2">Lucas N. C.</a></footer>
  </div>
</template>

<script lang="ts">
import AppBody from "./components/app-body.vue";
export default {
  name: "app",
  components: {
    AppBody,
  },
};
</script>

<style>
@import "./css/variables.css";
body {
  margin: 0;
  max-width: 650px;
}
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e51;
  padding-top: 0 !important;
  padding-bottom: 0 !important;
  padding-left: 0 !important;
  padding-right: 0 !important;
}
.header {
  border-bottom: 1px solid grey;
  height: 60px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.5em;
}
/* Chrome, Safari, Edge, Opera */
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* Firefox */
input[type="number"] {
  -moz-appearance: textfield;
}
</style>
