<template>
  <main class="product-grid">
    <ProductCard 
      v-for="product in products" 
      :key="product.productId"
      :product="product"
      @add-to-cart="handleAddToCart"
    />
    
    <div v-if="loading" class="loading-message">
      상품을 불러오는 중...
    </div>
    
    <div v-else-if="products.length === 0" class="empty-message">
      상품이 없습니다.
    </div>
  </main>
</template>

<script setup>
import ProductCard from './ProductCard.vue'

const props = defineProps({
  products: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['add-to-cart'])

const handleAddToCart = (cartItem) => {
  emit('add-to-cart', cartItem)
}
</script>