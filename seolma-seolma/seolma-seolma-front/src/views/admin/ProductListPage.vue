<template>
  <div class="admin-page">
    <MainNavigation />
    
    <section class="admin-banner" @click="goToHome">
    </section>
    
    <section class="admin-section">
      <h2 class="section-title">상품 목록</h2>
      
      <div v-if="loading" class="loading-message">
        상품 목록을 불러오는 중...
      </div>
      
      <div v-else-if="products.length === 0" class="empty-message">
        등록된 상품이 없습니다.
      </div>
      
      <div v-else class="admin-grid">
        <div 
          v-for="product in products" 
          :key="product.productId || product.id"
          class="admin-card"
        >
          <div class="card-image">
            <img 
              v-if="product.images && product.images.length > 0" 
              :src="getProductImageUrl(product.images[0].imageUrl)" 
              :alt="product.name" 
            />
            <div v-else class="no-image">이미지 없음</div>
          </div>
          
          <div class="card-content">
            <h3 class="card-title">{{ product.name }}</h3>
            <p class="card-price">{{ formatNumber(product.price) }}원</p>
            <p class="card-id">상품 ID: {{ product.productId || product.id }}</p>
            <p v-if="product.isDeleted" class="deleted-status">삭제된 상품</p>
          </div>
          
          <div class="card-actions">
            <button 
              @click="handleDelete(product)"
              :class="['delete-btn', { 'deleted': product.isDeleted }]"
              :disabled="product.isDeleted"
            >
              {{ product.isDeleted ? '삭제된 제품' : '삭제' }}
            </button>
          </div>
        </div>
      </div>
      
      <!-- 페이지네이션 -->
      <div v-if="totalPages > 1" class="pagination">
        <button 
          v-for="page in totalPages" 
          :key="page"
          :class="{ active: currentPage === page - 1 }"
          @click="goToPage(page - 1)"
          class="page-button"
        >
          {{ page }}
        </button>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import MainNavigation from '@/components/main/MainNavigation.vue'
import { productAPI } from '@/api/product'
import { useApi } from '@/composables/useApi'
import { useModal } from '@/composables/useModal'
import { useAuthStore } from '@/store/auth'
import { formatNumber } from '@/utils/helpers'
import { getProductImageUrl } from '@/utils/imageUrl'
import '@/assets/styles/pages/admin.css'

const router = useRouter()
const authStore = useAuthStore()
const { execute, loading } = useApi()
const { success, error: showError, confirm } = useModal()

const products = ref([])
const currentPage = ref(0)
const totalPages = ref(0)
const pageSize = 20

const goToHome = () => {
  router.push('/')
}

// 상품 목록 로드
const loadProducts = async (page = 0) => {
  const result = await execute(
    () => productAPI.getAdminProducts({ page, size: pageSize }),
    {
      showErrorModal: false,
      onError: (error) => {
        console.error('상품 목록 로드 실패:', error)
        products.value = []
      }
    }
  )

  if (result.success && result.data) {
    products.value = result.data.content || []
    currentPage.value = result.data.number || 0
    totalPages.value = result.data.totalPages || 0
  }
}

// 페이지 이동
const goToPage = (page) => {
  loadProducts(page)
}

// 상품 삭제
const handleDelete = async (product) => {
  const productId = product.productId || product.id
  const result = await confirm(
    `"${product.name}" 상품을 삭제하시겠습니까?`,
    '상품 삭제'
  )
  
  if (!result) return

  await execute(
    () => productAPI.deleteProduct(productId),
    {
      onSuccess: () => {
        success('상품이 삭제되었습니다.')
        loadProducts(currentPage.value)
      },
      onError: (message) => {
        showError(message || '상품 삭제에 실패했습니다.')
      }
    }
  )
}

onMounted(() => {
  // 관리자 권한 확인
  if (!authStore.isAdmin) {
    alert('관리자만 접근할 수 있습니다.')
    router.push('/')
    return
  }

  loadProducts()
})
</script>
