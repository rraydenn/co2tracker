<template>
    <Transition :name="transitionName" mode="out-in">
      <div class="login-page-container" key="login-page">
        <div class="login-box" ref="boxRef">
          <h1 class="title">Login</h1>
          
          <LoginForm @login="handleLogin" :isLoading="isLoading" :error="errorMessage" />
          
          <p class="register-link">
            New here?
            <router-link to="/register" class="link" @click="setTransition('slide-right')">
              Sign Up
            </router-link>
          </p>
          
          <router-link to="/" class="return-btn">Retour à l'accueil</router-link>
        </div>
      </div>
    </Transition>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted, nextTick } from 'vue';
  import { useAuthStore } from '@/stores/auth';
  import { useRouter } from 'vue-router';
  import LoginForm from '@/components/forms/LoginForm.vue';
  import { gsap } from 'gsap';
  
  const router = useRouter();
  const authStore = useAuthStore();
  const isLoading = ref(false);
  const errorMessage = ref('');
  
  // Animation control
  const isActive = ref(false);
  const boxRef = ref<HTMLElement | null>(null);
  const transitionName = ref('slide-down');
  
  const handleLogin = async (email: string, password: string) => {
    isLoading.value = true;
    errorMessage.value = '';
    
    try {
      const response = await authStore.login(email, password);
      
      if (response && authStore.token) {
        isActive.value = false;
        setTimeout(() => {
          transitionName.value = 'slide-down';
          router.push('/account');
        }, 50);
      } else {
        errorMessage.value = 'Login failed. Please check your credentials.';
      }
    } catch (error) {
      errorMessage.value = error instanceof Error 
        ? error.message 
        : 'An unexpected error occurred';
    } finally {
      isLoading.value = false;
    }
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
        ease: 'power2.out',
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
  
  <style scoped>
  .login-page-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    padding: 20px;
    background-color: #f5f5f5;
  }
  
  .login-box {
    width: 100%;
    max-width: 400px;
    padding: 2rem;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  
  .title {
    font-size: 1.8rem;
    text-align: center;
    margin-bottom: 1.5rem;
    color: #2c3e50;
  }
  
  .register-link {
    margin-top: 1rem;
    text-align: center;
  }
  
  .link {
    color: #4a8;
    text-decoration: none;
    font-weight: bold;
  }
  
  .link:hover {
    text-decoration: underline;
  }
  
  .return-btn {
    display: block;
    margin-top: 20px;
    padding: 8px 16px;
    background: #4a8;
    color: white;
    text-decoration: none;
    border-radius: 4px;
    text-align: center;
    transition: background 0.3s;
  }
  
  .return-btn:hover {
    background: #3a7;
  }
  
  /* Transition animations */
  .slide-down-enter-active,
  .slide-down-leave-active,
  .slide-left-enter-active,
  .slide-left-leave-active,
  .slide-right-enter-active,
  .slide-right-leave-active,
  .slide-up-enter-active,
  .slide-up-leave-active {
    transition: transform 0.4s, opacity 0.4s;
  }
  
  .slide-down-enter-from {
    transform: translateY(-50px);
    opacity: 0;
  }
  
  .slide-down-leave-to {
    transform: translateY(50px);
    opacity: 0;
  }
  
  .slide-up-enter-from {
    transform: translateY(50px);
    opacity: 0;
  }
  
  .slide-up-leave-to {
    transform: translateY(-50px);
    opacity: 0;
  }
  
  .slide-left-enter-from {
    transform: translateX(50px);
    opacity: 0;
  }
  
  .slide-left-leave-to {
    transform: translateX(-50px);
    opacity: 0;
  }
  
  .slide-right-enter-from {
    transform: translateX(-50px);
    opacity: 0;
  }
  
  .slide-right-leave-to {
    transform: translateX(50px);
    opacity: 0;
  }
  </style>