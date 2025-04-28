<template>
  <!-- TODO: utiliser dans la MainPage ou supprimer -->
  <div class="autocomplete-container">
      <input
        :id="inputId"
        type="text"
        v-model="modelValueLocal"
        :placeholder="placeholder"
        required
        @input="onInput"
      />
      <div class="autocomplete-results" v-show="results.length > 0">
        <div
          v-for="(result, index) in results"
          :key="`${inputId}-${index}`"
          class="autocomplete-item"
          @click="selectResult(result)"
        >
          {{ result.display_name }}
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, watch } from 'vue'
  
  const props = defineProps<{
    modelValue: string
    results: any[]
    placeholder: string
    inputId: string
  }>()
  
  const emit = defineEmits<{
    (e: 'update:modelValue', value: string): void
    (e: 'input', value: string): void
    (e: 'select', value: any): void
  }>()
  
  const modelValueLocal = ref(props.modelValue)
  
  watch(() => props.modelValue, (val) => {
    modelValueLocal.value = val
  })
  
  function onInput() {
    emit('update:modelValue', modelValueLocal.value)
    emit('input', modelValueLocal.value)
  }
  
  function selectResult(result: any) {
    emit('select', result)
  }
  </script>
  
  <style scoped>
  .autocomplete-container {
    position: relative;
    width: 100%;
  }
  
  input {
    width: 100%;
    padding: 0.5rem;
  }
  
  .autocomplete-results {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    max-height: 200px;
    overflow-y: auto;
    background: white;
    border: 1px solid #ccc;
    z-index: 10;
  }
  
  .autocomplete-item {
    padding: 0.5rem;
    cursor: pointer;
  }
  
  .autocomplete-item:hover {
    background-color: #f0f0f0;
  }
  </style>
  