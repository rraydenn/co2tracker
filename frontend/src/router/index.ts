import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import CO2Tracker from "@/components/CO2Tracker.vue";
import InfoPage from "@/components/InfoPage.vue";
import AccountPage from "@/components/AccountPage.vue";
import Login from "../views/Login.vue";
import Register from "../views/Register.vue";
import Dashboard from "../views/Dashboard.vue";

const routes: Array<RouteRecordRaw> = [
  { path: "/", name: 'Home', component: CO2Tracker },
  { path: "/login", name: 'Login', component: Login },
  { path: "/register", name: 'Register', component: Register },
  { path: "/account", name: 'Account', component: AccountPage },
  { path: "/info", name: 'Info', component: InfoPage },
  { path: "/dashboard", component: Dashboard }, //TODO: remove and replace with AccountPage
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
