<template>
  <div class="coupon-page">
    <MainNavigation />
    
    <!-- 쿠폰 배너 -->
    <section class="coupon-banner" @click="goToHome">
    </section>
    
    <!-- 내 쿠폰 목록 -->
    <section class="coupon-section">
      <h2 class="section-title">내 쿠폰</h2>
      
      <div v-if="loading" class="loading-message">
        쿠폰을 불러오는 중...
      </div>
      
      <div v-else-if="serviceError" class="error-message">
        쿠폰 서비스에 접속할 수 없습니다. 잠시 후 다시 시도해주세요.
        <button class="retry-button" @click="loadMyCoupons">다시 시도</button>
      </div>
      
      <div v-else-if="coupons.length === 0" class="empty-message">
        발급받은 쿠폰이 없습니다.
      </div>
      
      <div v-else class="coupon-grid">
        <div 
          v-for="coupon in coupons" 
          :key="coupon.couponId"
          class="coupon-card"
        >
          <div class="coupon-header">
            <h3 class="coupon-title">{{ coupon.title }}</h3>
            <div class="coupon-discount">
              <span v-if="coupon.discountType === 'PERCENT'" class="discount-value">
                {{ coupon.discountValue }}% OFF
              </span>
              <span v-else class="discount-value">
                {{ formatNumber(coupon.discountValue) }}원 OFF
              </span>
            </div>
            <!-- 쿠폰 상태 표시 -->
            <div class="coupon-limited">
              <span v-if="coupon.status === 'AVAILABLE'" class="status-badge status-available">
                사용 가능
              </span>
              <span v-else-if="coupon.status === 'USED'" class="status-badge status-used">
                사용 완료
              </span>
              <span v-else-if="coupon.status === 'EXPIRED'" class="status-badge status-expired">
                기간 만료
              </span>
            </div>
          </div>
          
          <div class="coupon-period">
            <p class="period-text">
              {{ formatDate(coupon.startedAt) }} ~ {{ formatDate(coupon.finishedAt) }}
            </p>
          </div>
          
          <div class="coupon-footer">
            <button 
              v-if="coupon.status === 'AVAILABLE'"
              class="coupon-button coupon-button--use"
              @click="goToProducts"
            >
              사용하기
            </button>
            <button 
              v-else
              class="coupon-button coupon-button--disabled"
              disabled
            >
              {{ coupon.status === 'USED' ? '사용 완료' : '기간 만료' }}
            </button>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import MainNavigation from '@/components/main/MainNavigation.vue'
import { couponAPI } from '@/api/coupon'
import { useApi } from '@/composables/useApi'
import { formatNumber } from '@/utils/helpers'
import '@/assets/styles/pages/coupon.css'
import '@/assets/styles/pages/my-coupon.css'

const router = useRouter()
const { execute, loading } = useApi()

const coupons = ref([])
const serviceError = ref(false) // 서비스 에러 상태 추가

// 홈으로 이동
const goToHome = () => {
  router.push('/')
}

// 내 쿠폰 목록 로드
const loadMyCoupons = async () => {
  serviceError.value = false // 에러 상태 초기화
  
  // 1단계: 사용 가능한 내 쿠폰 조회
  const myCouponsResult = await execute(
    () => couponAPI.getMyAvailableCoupons(),
    {
      showErrorModal: false,
      onError: (error) => {
        console.error('내 쿠폰 목록 로드 실패:', error)
      }
    }
  )

  if (!myCouponsResult.success) {
    console.log('내 쿠폰 목록 조회 실패')
    coupons.value = []
    return
  }

  // nginx fallback JSON 응답 체크
  if (myCouponsResult.data && myCouponsResult.data.code === 'C502') {
    console.log('쿠폰 서비스 접속 불가:', myCouponsResult.data.message)
    serviceError.value = true
    coupons.value = []
    return
  }

  if (!myCouponsResult.data || myCouponsResult.data.length === 0) {
    console.log('사용 가능한 쿠폰이 없습니다.')
    coupons.value = []
    return
  }

  const myCoupons = myCouponsResult.data
  console.log('내 쿠폰 목록:', myCoupons)

  // 2단계: 쿠폰 템플릿 정보 조회
  const templatesResult = await execute(
    () => couponAPI.getAvailableTemplates(),
    {
      showErrorModal: false,
      onError: (error) => {
        console.error('쿠폰 템플릿 로드 실패:', error)
      }
    }
  )

  if (!templatesResult.success) {
    console.log('쿠폰 템플릿 정보를 불러올 수 없습니다.')
    coupons.value = []
    return
  }

  // nginx fallback JSON 응답 체크 (템플릿 조회에서도)
  if (templatesResult.data && templatesResult.data.code === 'C502') {
    console.log('쿠폰 서비스 접속 불가:', templatesResult.data.message)
    serviceError.value = true
    coupons.value = []
    return
  }

  if (!templatesResult.data) {
    console.log('쿠폰 템플릿 정보를 불러올 수 없습니다.')
    coupons.value = []
    return
  }

  const templates = templatesResult.data
  console.log('쿠폰 템플릿 목록:', templates)

  // 3단계: 내 쿠폰과 템플릿 정보 매칭
  coupons.value = myCoupons.map(myCoupon => {
    const template = templates.find(t => t.id === myCoupon.templateId)
    
    console.log('myCoupon', myCoupon);

    if (!template) {
      console.warn(`템플릿을 찾을 수 없습니다: templateId=${myCoupon.templateId}`)
      return null
    }
    return {
      couponId: myCoupon.id,
      templateId: myCoupon.templateId,
      title: template.title,
      discountType: template.discountType,
      discountValue: template.discountValue,
      startedAt: template.startedAt,
      finishedAt: template.finishedAt,
      isUsed: myCoupon.isUsed,
      usedAt: myCoupon.usedAt,
      issuedAt: myCoupon.issuedAt,
      canUse: myCoupon.canUse,
      status: getStatus(myCoupon, template)
    }
  }).filter(coupon => coupon !== null)

  console.log('최종 쿠폰 목록:', coupons.value)
}

// 쿠폰 상태 결정
const getStatus = (myCoupon, template) => {
  if (myCoupon.isUsed) {
    return 'USED'
  }
  
  const now = new Date()
  const endDate = new Date(template.finishedAt)
  
  if (now > endDate) {
    return 'EXPIRED'
  }
  
  return 'AVAILABLE'
}



// 날짜 포맷팅
const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).replace(/\./g, '.').replace(/\s/g, '')
}

// 상품 목록으로 이동
const goToProducts = () => {
  router.push('/')
}

onMounted(() => {
  loadMyCoupons()
})
</script>
