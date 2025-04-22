import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import InfoPage from "@/components/InfoPage.vue";
import AccountPage from "@/components/AccountPage.vue";
import Login from "../views/Login.vue";
import Register from "../views/Register.vue";
import Dashboard from "../views/Dashboard.vue";
import { useAuthStore } from "@/stores/auth";
import HomePage from "@/views/HomePage.vue";
import CO2Tracker from "@/components/CO2Tracker.vue";
  

const routes: Array<RouteRecordRaw> = [
  { path: "/", name: 'Home', component: HomePage },
  { path: "/login", name: 'Login', component: Login },
  { path: "/register", name: 'Register', component: Register },
  { 
    path: "/account",
    name: 'Account',
    component: AccountPage,
    meta: { requiresAuth: true },
  },
  { path: "/info", name: 'Info', component: InfoPage },
  { path: "/dashboard", component: Dashboard }, //TODO: remove and replace with AccountPage
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, from, next) => {
  // If the route requires authentication
  if (to.meta.requiresAuth) {
    const authStore = useAuthStore();
    
    if (!authStore.token) {
      // No token, redirect to login
      console.log('No token found, redirecting to login');
      return next('/login');
    }
    
    console.log('Authentication token found, proceeding to route');
  }
  
  return next();
});

export default router;
