<template>
  <div class="order-list-page">
    <MainNavigation />
    
    <!-- 배너 (쿠폰 페이지와 동일) -->
    <section class="order-list-banner" @click="goToHome">
    </section>
    
    <!-- 주문 목록 -->
    <section class="order-list-section">
      <h2 class="section-title">주문 내역</h2>
      
      <div v-if="loading" class="loading-message">
        주문 내역을 불러오는 중...
      </div>
      
      <div v-else-if="orders.length === 0" class="empty-message">
        주문 내역이 없습니다.
      </div>
      
      <div v-else class="order-grid">
        <div 
          v-for="order in orders" 
          :key="order.id"
          class="order-card"
        >
          <div class="order-header">
            <h3 class="order-product-name">{{ order.productSnapshotName }}</h3>
            <span class="order-status" :class="getStatusClass(order.status)">
              {{ order.statusDisplayName }}
            </span>
          </div>
          
          <div class="order-info">
            <div class="info-row">
              <span class="info-label">주문번호</span>
              <span class="info-value">#{{ order.id }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">주문자</span>
              <span class="info-value">{{ order.ordererName }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">배송지</span>
              <span class="info-value">{{ order.shippingAddress }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">수량</span>
              <span class="info-value">{{ order.quantity }}개</span>
            </div>
            <div class="info-row">
              <span class="info-label">결제방법</span>
              <span class="info-value">{{ order.paymentMethodDisplayName }}</span>
            </div>
          </div>
          
          <div class="order-price">
            <div class="price-row">
              <span class="price-label">결제금액</span>
              <span class="price-value">{{ formatNumber(order.totalPrice) }}원</span>
            </div>
          </div>
          
          <div class="order-date">
            <span class="date-text">주문일시: {{ formatDate(order.orderedAt) }}</span>
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
import MainNavigation from '@/components/main/MainNavigation.vue'
import { orderAPI } from '@/api/order'
import { useApi } from '@/composables/useApi'
import { useAuthStore } from '@/store/auth'
import { useRouter } from 'vue-router'
import { formatNumber } from '@/utils/helpers'
import '@/assets/styles/pages/order-list.css'

const router = useRouter()
const authStore = useAuthStore()
const { execute, loading } = useApi()

const orders = ref([])
const currentPage = ref(0)
const totalPages = ref(0)
const pageSize = 20

// 홈으로 이동
const goToHome = () => {
  router.push('/')
}

// 주문 목록 로드
const loadOrders = async (page = 0) => {
  const result = await execute(
    () => orderAPI.getMyOrders({ page, size: pageSize }),
    {
      showErrorModal: false,
      onError: (error) => {
        console.error('주문 목록 로드 실패:', error)
        orders.value = []
      }
    }
  )

  if (result.success && result.data) {
    orders.value = result.data.content || []
    currentPage.value = result.data.number || 0
    totalPages.value = result.data.totalPages || 0
  }
}

// 페이지 이동
const goToPage = (page) => {
  loadOrders(page)
}

// 날짜 포맷팅
const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 주문 상태별 클래스
const getStatusClass = (status) => {
  const statusMap = {
    'PAYMENT_COMPLETED': 'status-completed',
    'PREPARING': 'status-preparing',
    'SHIPPING': 'status-shipping',
    'DELIVERED': 'status-delivered',
    'CANCELLED': 'status-cancelled'
  }
  return statusMap[status] || 'status-default'
}

onMounted(() => {
  // 로그인 확인
  if (!authStore.isAuthenticated) {
    alert('로그인이 필요합니다.')
    router.push('/login')
    return
  }

  loadOrders()
})
</script>
