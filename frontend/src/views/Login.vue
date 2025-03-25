<template>
  <Transition :name="transitionName" mode="out-in">
    <div class="container" key="login-page">
      <div class="box" ref="boxRef">
        <h1 class="title">Login</h1>
        <form @submit.prevent="login" class="form">
          <div class="form-group">
            <label for="email" class="form-label">Email:</label>
            <input
              type="email"
              v-model="email"
              placeholder="Enter your email"
              required
              class="form-input"
              :disabled="!isActive"
            />
          </div>
          <div class="form-group">
            <label for="password" class="form-label">Password:</label>
            <input
              type="password"
              v-model="password"
              placeholder="Enter your password"
              required
              class="form-input"
              :disabled="!isActive"
            />
          </div>
          <button type="submit" class="button">Login</button>
        </form>
        <p class="footer">
          New here?
          <router-link
            to="/register"
            class="link"
            @click.native="setTransition('slide-right')"
            >Sign Up</router-link
          >
        </p>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from "vue";
import { useAuthStore } from "../stores/auth";
import { useRouter } from "vue-router";
import gsap from "gsap";

const router = useRouter();
const email = ref("");
const password = ref("");
const authStore = useAuthStore();

const isActive = ref(false);
const boxRef = ref<HTMLElement | null>(null);
const transitionName = ref("slide-down");

const login = async () => {
  await authStore.login(email.value, password.value);
  isActive.value = false;
  setTimeout(() => {
    transitionName.value = "slide-down";
    router.push("/dashboard");
  }, 50);
};

const setTransition = (name: string) => {
  transitionName.value = name;
};

const animateForm = async () => {
  if (boxRef.value) {
    gsap.from(boxRef.value, {
      opacity: 0,
      y: 50,
      duration: 0.8,
      ease: "power2.out",
      onComplete: () => {
        isActive.value = true;
      },
    });
  }
};

onMounted(async () => {
  await nextTick();
  animateForm();
});
</script>

<style scoped></style>
