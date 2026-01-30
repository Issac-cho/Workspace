<template>
  <div class="admin-page">
    <MainNavigation />
    
    <section class="admin-banner" @click="goToHome">
    </section>
    
    <section class="admin-section">
      <h2 class="section-title">주문 확인</h2>
      
      <div v-if="loading" class="loading-message">
        주문 내역을 불러오는 중...
      </div>
      
      <div v-else-if="orders.length === 0" class="empty-message">
        주문 내역이 없습니다.
      </div>
      
      <div v-else class="admin-grid">
        <div 
          v-for="order in orders" 
          :key="order.id"
          class="admin-card order-card"
        >
          <div class="card-header">
            <h3 class="card-title">{{ order.productSnapshotName }}</h3>
            <span class="order-status" :class="getStatusClass(order.status)">
              {{ order.statusDisplayName }}
            </span>
          </div>
          
          <div class="card-content">
            <div class="info-row">
              <span class="info-label">주문번호</span>
              <span class="info-value">#{{ order.id }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">사용자 ID</span>
              <span class="info-value">{{ order.userId }}</span>
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
            <div class="info-row">
              <span class="info-label">결제금액</span>
              <span class="info-value price">{{ formatNumber(order.totalPrice) }}원</span>
            </div>
            <div class="info-row">
              <span class="info-label">주문일시</span>
              <span class="info-value">{{ formatDate(order.orderedAt) }}</span>
            </div>
          </div>
          
          <!-- 주문 상태 변경 -->
          <div class="card-actions">
            <div class="status-change">
              <select 
                v-model="order.selectedStatus"
                class="status-select"
              >
                <option value="PAYMENT_COMPLETED">결제완료</option>
                <option value="PREPARING">배송준비중</option>
                <option value="SHIPPING">배송중</option>
                <option value="DELIVERED">배송완료</option>
                <option value="CANCELLED">취소</option>
              </select>
              <button 
                @click="handleStatusChange(order)"
                class="status-update-btn"
                :disabled="order.selectedStatus === order.status"
              >
                상태 변경
              </button>
            </div>
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
import { orderAPI } from '@/api/order'
import { useApi } from '@/composables/useApi'
import { useAuthStore } from '@/store/auth'
import { formatNumber } from '@/utils/helpers'
import '@/assets/styles/pages/admin.css'

const router = useRouter()
const authStore = useAuthStore()
const { execute, loading } = useApi()

const orders = ref([])
const currentPage = ref(0)
const totalPages = ref(0)
const pageSize = 20

const goToHome = () => {
  router.push('/')
}

// 주문 목록 로드
const loadOrders = async (page = 0) => {
  const result = await execute(
    () => orderAPI.getAdminOrders({ page, size: pageSize }),
    {
      showErrorModal: false,
      onError: (error) => {
        console.error('주문 목록 로드 실패:', error)
        orders.value = []
      }
    }
  )

  if (result.success && result.data) {
    // 각 주문에 selectedStatus 추가 (현재 상태로 초기화)
    orders.value = (result.data.content || []).map(order => ({
      ...order,
      selectedStatus: order.status
    }))
    currentPage.value = result.data.number || 0
    totalPages.value = result.data.totalPages || 0
  }
}

// 페이지 이동
const goToPage = (page) => {
  loadOrders(page)
}

// 주문 상태 변경
const handleStatusChange = async (order) => {
  if (order.selectedStatus === order.status) {
    return
  }

  const result = await execute(
    () => orderAPI.updateOrderStatus(order.id, order.selectedStatus),
    {
      onSuccess: () => {
        // 주문 상태 업데이트
        order.status = order.selectedStatus
        
        // 상태 표시명 업데이트
        const statusDisplayMap = {
          'PAYMENT_COMPLETED': '결제완료',
          'PREPARING': '배송준비중',
          'SHIPPING': '배송중',
          'DELIVERED': '배송완료',
          'CANCELLED': '취소'
        }
        order.statusDisplayName = statusDisplayMap[order.status]
        
        alert('주문 상태가 변경되었습니다.')
      },
      onError: (message) => {
        alert(message || '주문 상태 변경에 실패했습니다.')
        // 실패 시 선택 상태를 원래대로 되돌림
        order.selectedStatus = order.status
      }
    }
  )
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
  // 관리자 권한 확인
  if (!authStore.isAdmin) {
    alert('관리자만 접근할 수 있습니다.')
    router.push('/')
    return
  }

  loadOrders()
})
</script>
