import { createApp } from 'vue';
import App from './App.vue';
import './css/index.css';

// Dynamically import all components from the icons folder
const iconComponents: Record<string, any> = import.meta.globEager('./components/icons/*.vue');

// Create Vue Application
const app = createApp(App);

// Register each component globally
Object.keys(iconComponents).forEach((path) => {
  const componentName = path.split('/').pop()!.replace(/\.\w+$/, '');
  const component = iconComponents[path].default;
  app.component(componentName, component);
});

// Mount Vue Application
app.mount('#app');
