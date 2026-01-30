<template>
  <article class="product-card">
    <div class="product-img-placeholder">
      <img 
        v-if="productImageUrl" 
        :src="productImageUrl" 
        :alt="product.name" 
      />
      <span v-else>상품 이미지</span>
    </div>
    
    <div class="product-info">
      <h3>{{ product.name }}</h3>
      <p class="price">{{ formatNumber(product.price) }}원</p>
      
      <div v-if="!isAdmin" class="controls">
        <div class="quantity">
          <button @click="decreaseQuantity" :disabled="quantity <= 1">-</button>
          <span>{{ quantity }}</span>
          <button @click="increaseQuantity">+</button>
        </div>
        <button class="add-cart-btn" @click="addToCart">주문</button>
      </div>
    </div>
  </article>
</template>

<script setup>
import { ref, computed } from 'vue'
import { formatNumber } from '@/utils/helpers'
import { getProductImageUrl } from '@/utils/imageUrl'
import { useAuthStore } from '@/store/auth'

const props = defineProps({
  product: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['add-to-cart'])

const authStore = useAuthStore()
const isAdmin = computed(() => authStore.isAdmin)

const quantity = ref(1)

// 이미지 URL 처리
const productImageUrl = computed(() => {
  // images 배열이 있고 첫 번째 이미지가 있는 경우
  if (props.product.images && props.product.images.length > 0) {
    const originalUrl = props.product.images[0].imageUrl
    const transformedUrl = getProductImageUrl(originalUrl)
    
    // 디버깅용 로그
    console.log('Original image URL:', originalUrl)
    console.log('Transformed image URL:', transformedUrl)
    console.log('USE_PROXY:', import.meta.env.VITE_USE_PROXY)
    
    return transformedUrl
  }
  
  // 기존 imageUrl 필드가 있는 경우 (하위 호환성)
  if (props.product.imageUrl) {
    const originalUrl = props.product.imageUrl
    const transformedUrl = getProductImageUrl(originalUrl)
    
    // 디버깅용 로그
    console.log('Original image URL:', originalUrl)
    console.log('Transformed image URL:', transformedUrl)
    
    return transformedUrl
  }
  
  return null
})

const increaseQuantity = () => {
  quantity.value++
}

const decreaseQuantity = () => {
  if (quantity.value > 1) {
    quantity.value--
  }
}

const addToCart = () => {
  emit('add-to-cart', {
    product: props.product,
    quantity: quantity.value
  })
}
</script>