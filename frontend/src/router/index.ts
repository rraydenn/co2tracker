import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import InfoPage from "@/views/InfoPage.vue";
import AccountPage from "@/views/AccountPage.vue";
import { useAuthStore } from "@/stores/auth";
import HomePage from "@/views/HomePage.vue";
import LoginPage from "@/views/LoginPage.vue";
import RegisterPage from "@/views/RegisterPage.vue";
import { log } from "@/utils/logger";


const routes: Array<RouteRecordRaw> = [
  { path: "/", name: 'Home', component: HomePage },
  { path: "/login", name: 'Login', component: LoginPage },
  { path: "/register", name: 'Register', component: RegisterPage },
  { 
    path: "/account",
    name: 'Account',
    component: AccountPage,
    meta: { requiresAuth: true },
  },
  { path: "/info", name: 'Info', component: InfoPage },
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
      log('No token found, redirecting to login', 'warn');
      return next('/login');
    }
    
    log('Token found, proceeding to route', 'info');
  }
  
  return next();
});

export default router;
