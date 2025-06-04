import { createApp } from "vue";
import { VueFire, VueFireAuth } from "vuefire";
import "./index.css";
import App from "./App.vue";
import { firebaseApp } from "./configs/firebase";
import { createRouter, createWebHistory } from "vue-router";
import { routes } from "vue-router/auto-routes";

const router = createRouter({
  history: createWebHistory(),
  routes,
});

const app = createApp(App);

app.use(VueFire, {
  firebaseApp,
  modules: [VueFireAuth()],
});

app.use(router);

app.mount("#app");
