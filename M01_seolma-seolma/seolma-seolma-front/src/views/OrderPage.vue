<template>
  <div class="order-page">
    <MainNavigation />
    
    <!-- 배너 (쿠폰 페이지와 동일) -->
    <section class="order-banner" @click="goToHome">
    </section>
    
    <!-- 주문 폼 -->
    <section class="order-section">
      <h2 class="section-title">주문하기</h2>
      
      <div class="order-container">
        <!-- 주문자 정보 -->
        <div class="order-form-group">
          <h3 class="form-title">주문자 정보</h3>
          <div class="form-content">
            <div class="form-field">
              <label for="ordererName" class="field-label">이름</label>
              <input 
                id="ordererName"
                v-model="orderForm.ordererName"
                type="text" 
                placeholder="이름을 입력하세요"
                class="field-input"
              />
            </div>
            
            <div class="form-field">
              <label for="ordererPhone" class="field-label">연락처</label>
              <input 
                id="ordererPhone"
                v-model="orderForm.ordererPhone"
                type="tel" 
                placeholder="010-0000-0000"
                class="field-input"
              />
            </div>
            
            <div class="form-field">
              <label for="ordererAddress" class="field-label">주소</label>
              <input 
                id="ordererAddress"
                v-model="orderForm.ordererAddress"
                type="text" 
                placeholder="주소를 입력하세요"
                class="field-input"
              />
            </div>
          </div>
        </div>

        <!-- 주문 상품 정보 -->
        <div class="order-form-group">
          <h3 class="form-title">주문 상품 정보</h3>
          <div class="form-content">
            <div v-if="cartItems.length === 0" class="empty-message">
              장바구니에 상품이 없습니다.
            </div>
            
            <div v-else class="product-list">
              <div 
                v-for="item in cartItems" 
                :key="item.product.productId || item.product.id"
                class="product-item"
              >
                <div class="product-info">
                  <span class="product-name">{{ item.product.name }}</span>
                  <span class="product-quantity">수량: {{ item.quantity }}개</span>
                </div>
                <div class="product-price">
                  {{ formatNumber(item.product.price * item.quantity) }}원
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 할인 정보 -->
        <div class="order-form-group">
          <h3 class="form-title">할인 정보</h3>
          <div class="form-content">
            <div class="form-field">
              <label for="couponSelect" class="field-label">쿠폰 선택</label>
              <select 
                id="couponSelect"
                v-model="orderForm.selectedCouponId"
                class="field-select"
              >
                <option :value="null">쿠폰을 선택하세요</option>
                <option 
                  v-for="coupon in availableCoupons" 
                  :key="coupon.couponId"
                  :value="coupon.couponId"
                >
                  {{ coupon.title }} - 
                  <span v-if="coupon.discountType === 'PERCENT'">
                    {{ coupon.discountValue }}% 할인
                  </span>
                  <span v-else>
                    {{ formatNumber(coupon.discountValue) }}원 할인
                  </span>
                </option>
              </select>
            </div>
          </div>
        </div>

        <!-- 결제 방법 선택 -->
        <div class="order-form-group">
          <h3 class="form-title">결제 방법 선택</h3>
          <div class="form-content">
            <div class="payment-methods">
              <label class="payment-option">
                <input 
                  type="radio" 
                  v-model="orderForm.paymentMethod"
                  value="CARD"
                  name="paymentMethod"
                />
                <span>신용카드</span>
              </label>
              
              <label class="payment-option">
                <input 
                  type="radio" 
                  v-model="orderForm.paymentMethod"
                  value="VIRTUAL_ACCOUNT"
                  name="paymentMethod"
                />
                <span>가상계좌</span>
              </label>
              
              <label class="payment-option">
                <input 
                  type="radio" 
                  v-model="orderForm.paymentMethod"
                  value="TRANS"
                  name="paymentMethod"
                />
                <span>계좌이체</span>
              </label>
            </div>
          </div>
        </div>

        <!-- 결제 금액 요약 -->
        <div class="order-summary">
          <div class="summary-row">
            <span class="summary-label">상품 금액</span>
            <span class="summary-value">{{ formatNumber(totalPrice) }}원</span>
          </div>
          <div class="summary-row">
            <span class="summary-label">할인 금액</span>
            <span class="summary-value discount">-{{ formatNumber(discountAmount) }}원</span>
          </div>
          <div class="summary-row total">
            <span class="summary-label">최종 결제 금액</span>
            <span class="summary-value">{{ formatNumber(finalPrice) }}원</span>
          </div>
        </div>

        <!-- 주문 버튼 -->
        <div class="order-actions">
          <button 
            class="order-button"
            :disabled="!isFormValid || loading"
            @click="handleSubmitOrder"
          >
            {{ loading ? '주문 처리 중...' : '주문하기' }}
          </button>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import MainNavigation from '@/components/main/MainNavigation.vue'
import { useCartStore } from '@/store/cart'
import { useAuthStore } from '@/store/auth'
import { orderAPI } from '@/api/order'
import { couponAPI } from '@/api/coupon'
import { useApi } from '@/composables/useApi'
import { useModal } from '@/composables/useModal'
import { formatNumber } from '@/utils/helpers'
import '@/assets/styles/pages/order.css'

const router = useRouter()
const cartStore = useCartStore()
const authStore = useAuthStore()
const { execute, loading } = useApi()
const { success, error: showError, alert } = useModal()

// 홈으로 이동
const goToHome = () => {
  router.push('/')
}

// 주문할 상품 정보 (라우터 state에서 받아옴)
const orderProduct = ref(null)
const orderQuantity = ref(1)

// 주문 폼 데이터
const orderForm = ref({
  ordererName: '',
  ordererPhone: '',
  ordererAddress: '',
  selectedCouponId: null,
  paymentMethod: 'CARD'
})

// 사용 가능한 쿠폰 목록
const availableCoupons = ref([])

// 장바구니 아이템 (호환성 유지)
const cartItems = computed(() => {
  if (!orderProduct.value) return []
  return [{
    product: orderProduct.value,
    quantity: orderQuantity.value
  }]
})

// 총 상품 금액
const totalPrice = computed(() => {
  if (!orderProduct.value) return 0
  return orderProduct.value.price * orderQuantity.value
})

// 선택된 쿠폰
const selectedCoupon = computed(() => {
  if (!orderForm.value.selectedCouponId) return null
  return availableCoupons.value.find(
    coupon => coupon.couponId === orderForm.value.selectedCouponId
  )
})

// 할인 금액 계산
const discountAmount = computed(() => {
  if (!selectedCoupon.value) return 0
  
  if (selectedCoupon.value.discountType === 'PERCENT') {
    return Math.floor(totalPrice.value * selectedCoupon.value.discountValue / 100)
  } else {
    return selectedCoupon.value.discountValue
  }
})

// 최종 결제 금액
const finalPrice = computed(() => {
  const price = totalPrice.value - discountAmount.value
  return price > 0 ? price : 0
})

// 폼 유효성 검사
const isFormValid = computed(() => {
  return (
    orderForm.value.ordererName.trim() !== '' &&
    orderForm.value.ordererPhone.trim() !== '' &&
    orderForm.value.ordererAddress.trim() !== '' &&
    orderForm.value.paymentMethod !== '' &&
    cartItems.value.length > 0
  )
})

// 사용 가능한 쿠폰 목록 로드
const loadAvailableCoupons = async () => {
  // 1. 사용 가능한 내 쿠폰 목록 조회
  const result = await execute(
    () => couponAPI.getMyAvailableCoupons(),
    {
      showErrorModal: false,
      onError: (error) => {
        console.error('쿠폰 목록 로드 실패:', error)
        availableCoupons.value = []
      }
    }
  )

  if (result.success && result.data && result.data.length > 0) {
    // 2. 각 쿠폰의 템플릿 정보 조회
    const couponsWithDetails = []
    
    for (const coupon of result.data) {
      // canUse가 true인 쿠폰만 처리
      if (coupon.canUse) {
        try {
          const templateResult = await execute(
            () => couponAPI.getCoupon(coupon.id),
            {
              showErrorModal: false,
              onError: (error) => {
                console.error(`쿠폰 ${coupon.id} 상세 정보 로드 실패:`, error)
              }
            }
          )

          if (templateResult.success && templateResult.data) {
            // 쿠폰 정보와 템플릿 정보 병합
            couponsWithDetails.push({
              couponId: coupon.id,
              templateId: coupon.templateId,
              isUsed: coupon.isUsed,
              usedAt: coupon.usedAt,
              issuedAt: coupon.issuedAt,
              canUse: coupon.canUse,
              // 템플릿 정보 추가
              title: templateResult.data.title || '쿠폰',
              discountType: templateResult.data.discountType || 'FIXED',
              discountValue: templateResult.data.discountValue || 0
            })
          }
        } catch (error) {
          console.error(`쿠폰 ${coupon.id} 처리 중 오류:`, error)
        }
      }
    }
    
    availableCoupons.value = couponsWithDetails
  } else {
    availableCoupons.value = []
  }
}

// 주문 제출
const handleSubmitOrder = async () => {
  if (!isFormValid.value) {
    alert('모든 필수 정보를 입력해주세요.')
    return
  }

  if (!orderProduct.value) {
    alert('주문할 상품 정보가 없습니다.')
    return
  }

  // 주문 데이터 구성 (API 스펙에 맞춤)
  const orderData = {
    ordererName: orderForm.value.ordererName,
    shippingAddress: orderForm.value.ordererAddress,
    productId: orderProduct.value.productId || orderProduct.value.id,
    quantity: orderQuantity.value,
    appliedCouponId: orderForm.value.selectedCouponId,
    paymentMethod: orderForm.value.paymentMethod
  }

  console.log('주문 데이터:', orderData)
  console.log('상품 객체:', orderProduct.value)

  const result = await execute(
    () => orderAPI.createOrder(orderData),
    {
      onSuccess: (data) => {
        success('주문이 완료되었습니다!')
        router.push('/')
      },
      onError: (message) => {
        showError(message || '주문 처리 중 오류가 발생했습니다.')
      }
    }
  )
}

onMounted(() => {
  // 로그인 확인
  if (!authStore.isAuthenticated) {
    alert('로그인이 필요합니다.')
    router.push('/login')
    return
  }

  // sessionStorage에서 상품 정보 가져오기
  const productData = sessionStorage.getItem('orderProduct')
  const quantityData = sessionStorage.getItem('orderQuantity')
  
  console.log('sessionStorage 상품 데이터:', productData)
  console.log('sessionStorage 수량 데이터:', quantityData)
  
  if (productData && quantityData) {
    try {
      orderProduct.value = JSON.parse(productData)
      orderQuantity.value = parseInt(quantityData, 10)
      
      console.log('파싱된 상품 객체:', orderProduct.value)
      console.log('상품 ID 필드들:', {
        productId: orderProduct.value.productId,
        id: orderProduct.value.id,
        allKeys: Object.keys(orderProduct.value)
      })
      
      // 사용한 데이터는 삭제
      sessionStorage.removeItem('orderProduct')
      sessionStorage.removeItem('orderQuantity')
    } catch (error) {
      console.error('상품 정보 파싱 실패:', error)
      alert('주문할 상품을 선택해주세요.')
      router.push('/')
      return
    }
  } else {
    // 상품 정보가 없으면 홈으로 이동
    alert('주문할 상품을 선택해주세요.')
    router.push('/')
    return
  }

  // 쿠폰 목록 로드
  loadAvailableCoupons()
})
</script>
