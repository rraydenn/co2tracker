<template>
  <div>
    <router-view v-slot="{ Component }">
      <Transition :name="transitionName" mode="out-in">
        <component :is="Component" />
      </Transition>
    </router-view>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const transitionName = ref("slide-right");

router.beforeEach((to, from, next) => {
  if (from.path === "/login" && to.path === "/register") {
    transitionName.value = "slide-right";
  } else if (from.path === "/register" && to.path === "/login") {
    transitionName.value = "slide-left";
  } else if (from.path === "/login" && to.path === "/account") {
    transitionName.value = "slide-down";
  } else if (from.path === "/account" && to.path === "/login") {
    transitionName.value = "slide-up";
  }
  next();
});
</script>

<style scoped></style>
