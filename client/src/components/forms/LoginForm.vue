<template>
    <form class="login-form" @submit.prevent="submitForm">
      <h2>Connexion</h2>
  
      <div class="form-group">
        <label for="email">Email</label>
        <input
          id="email"
          type="email"
          v-model="email"
          required
          placeholder="Votre email"
        />
      </div>
  
      <div class="form-group">
        <label for="password">Mot de passe</label>
        <input
          id="password"
          type="password"
          v-model="password"
          required
          placeholder="Votre mot de passe"
        />
      </div>
  
      <button type="submit" class="btn-login">Se connecter</button>
  
      <div class="error-message" v-if="errorMessage">{{ errorMessage }}</div>
    </form>
  </template>
  
  <script setup lang="ts">
  import { ref } from 'vue'
  
  const emit = defineEmits<{
    (e: 'login', email: string, password: string): void
  }>()
  
  const email = ref('')
  const password = ref('')
  const errorMessage = ref('')
  
  function submitForm() {
    if (!email.value || !password.value) {
      errorMessage.value = 'Veuillez remplir tous les champs.'
      return
    }
  
    errorMessage.value = ''
    emit('login', email.value, password.value)
  }
  </script>
  
  <style scoped>
  .login-form {
    max-width: 400px;
    margin: auto;
    padding: 2rem;
    border-radius: 8px;
    background: #f9f9f9;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  
  .form-group {
    margin-bottom: 1.2rem;
  }
  
  label {
    display: block;
    margin-bottom: 0.3rem;
    font-weight: bold;
  }
  
  input {
    width: 100%;
    padding: 0.6rem;
    border: 1px solid #ccc;
    border-radius: 6px;
  }
  
  .btn-login {
    width: 100%;
    padding: 0.8rem;
    border: none;
    background-color: #2c3e50;
    color: white;
    font-weight: bold;
    border-radius: 6px;
    cursor: pointer;
  }
  
  .btn-login:hover {
    background-color: #1a252f;
  }
  
  .error-message {
    color: red;
    margin-top: 1rem;
  }
  </style>
  