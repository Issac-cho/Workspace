<template>
  <div class="category-tabs">
    <span 
      v-for="category in categories" 
      :key="category.value"
      :class="{ active: selectedCategory === category.value }"
      @click="selectCategory(category.value)"
    >
      {{ category.label }}
    </span>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const categories = [
  { value: '', label: '전체' },
  { value: 'healthyfood', label: '건강식품' },
  { value: 'food', label: '식품' },
  { value: 'kitchen', label: '주방용품' },
  { value: 'appliance', label: '가전제품' }
]

const selectedCategory = ref('')

const emit = defineEmits(['category-change'])

const selectCategory = (categoryValue) => {
  selectedCategory.value = categoryValue
  emit('category-change', categoryValue)
}
</script>