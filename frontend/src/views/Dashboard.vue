<template>
  <div class="container">
    <div class="box">
      <h1 class="title">Dashboard</h1>
      <p>Welcome to the dashboard!</p>
      <div
        class="button-container"
        style="display: flex; justify-content: space-between"
      >
        <button class="button" @click="showFullname">Show my fullname</button>
        <button class="button-danger" @click="logout">Logout</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from "../stores/auth";
import { useRouter } from "vue-router";

const router = useRouter();
const authStore = useAuthStore();

const logout = () => {
  authStore.logout();
  router.push("/login");
};

const showFullname = async () => {
  const data = await authStore.showUser();
  const full_name = data.full_name;
  alert(`Your fullname is: ${full_name}`);
};
</script>

<style src="../style.css"></style>
