<template>
  <div class="admin-page">
    <MainNavigation />
    
    <section class="admin-banner" @click="goToHome">
    </section>
    
    <section class="admin-section">
      <h2 class="section-title">쿠폰 템플릿 목록</h2>
      
      <div v-if="loading" class="loading-message">
        쿠폰 템플릿을 불러오는 중...
      </div>
      
      <div v-else-if="serviceError" class="error-message">
        쿠폰 서비스에 접속할 수 없습니다. 잠시 후 다시 시도해주세요.
        <button class="retry-button" @click="loadTemplates">다시 시도</button>
      </div>
      
      <div v-else-if="templates.length === 0" class="empty-message">
        등록된 쿠폰 템플릿이 없습니다.
      </div>
      
      <div v-else class="coupon-template-list">
        <div 
          v-for="template in templates" 
          :key="template.id || template.templateId"
          class="coupon-template-card"
        >
          <div class="template-header">
            <h3 class="template-title">{{ template.title }}</h3>
            <span 
              class="template-status"
              :class="getStatusClass(template)"
            >
              {{ getStatusText(template) }}
            </span>
          </div>
          
          <div class="template-content">
            <div class="template-info">
              <div class="info-row">
                <span class="info-label">할인 타입:</span>
                <span class="info-value">
                  {{ template.discountType === 'PERCENT' ? '퍼센트 할인' : '고정 금액 할인' }}
                </span>
              </div>
              
              <div class="info-row">
                <span class="info-label">할인 값:</span>
                <span class="info-value discount-value">
                  {{ template.discountType === 'PERCENT' 
                    ? `${template.discountValue}%` 
                    : `${formatNumber(template.discountValue)}원` 
                  }}
                </span>
              </div>
              
              <div class="info-row">
                <span class="info-label">기간:</span>
                <span class="info-value">
                  {{ formatDateTime(template.startedAt) }} ~ {{ formatDateTime(template.finishedAt) }}
                </span>
              </div>
              
              <div class="info-row" v-if="template.isLimited">
                <span class="info-label">선착순:</span>
                <span class="info-value">
                  {{  `(${template.issuedCount || 0}/${template.totalQuantity})`}}
                </span>
              </div>
              
              <div class="info-row">
                <span class="info-label">템플릿 ID:</span>
                <span class="info-value">{{ template.id || template.templateId }}</span>
              </div>
            </div>
          </div>
          
          <div class="template-actions">
            <button 
              @click="handleEdit(template)"
              class="edit-btn"
            >
              수정
            </button>
            <button 
              @click="handleDelete(template)"
              class="delete-btn"
            >
              삭제
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
    
    <!-- 수정 모달 -->
    <div v-if="showEditModal" class="modal-overlay" @click.self="closeEditModal">
      <div class="modal-content coupon-edit-modal">
        <h3 class="modal-title">쿠폰 템플릿 수정</h3>
        
        <form @submit.prevent="handleUpdateSubmit" class="coupon-form">
          <div class="form-field">
            <label for="editTitle" class="field-label">쿠폰명 *</label>
            <input 
              id="editTitle"
              v-model="editForm.title"
              type="text" 
              class="field-input"
              required
            />
          </div>
          
          <div class="form-field">
            <label class="field-label">할인 타입 *</label>
            <div class="radio-group">
              <label class="radio-option">
                <input 
                  type="radio" 
                  v-model="editForm.discountType"
                  value="PERCENT"
                />
                <span>퍼센트 할인</span>
              </label>
              <label class="radio-option">
                <input 
                  type="radio" 
                  v-model="editForm.discountType"
                  value="FIXED_AMOUNT"
                />
                <span>고정 금액 할인</span>
              </label>
            </div>
          </div>
          
          <div class="form-field">
            <label for="editDiscountValue" class="field-label">
              {{ editForm.discountType === 'PERCENT' ? '할인율 (%)' : '할인 금액 (원)' }} *
            </label>
            <input 
              id="editDiscountValue"
              v-model.number="editForm.discountValue"
              type="number" 
              class="field-input"
              min="0"
              :max="editForm.discountType === 'PERCENT' ? 100 : undefined"
              required
            />
          </div>
          
          <div class="form-field">
            <label for="editStartDate" class="field-label">시작일시 *</label>
            <input 
              id="editStartDate"
              v-model="editForm.startedAt"
              type="datetime-local" 
              class="field-input"
              :min="minStartDate"
              required
            />
          </div>
          
          <div class="form-field">
            <label for="editEndDate" class="field-label">종료일시 *</label>
            <input 
              id="editEndDate"
              v-model="editForm.finishedAt"
              type="datetime-local" 
              class="field-input"
              :min="minEndDate"
              required
            />
          </div>
          
          <div class="form-field">
            <label class="field-label checkbox-label">
              <input 
                type="checkbox" 
                v-model="editForm.isLimited"
              />
              <span>선착순 쿠폰</span>
            </label>
          </div>
          
          <div v-if="editForm.isLimited" class="form-field">
            <label for="editTotalQuantity" class="field-label">발급 수량 *</label>
            <input 
              id="editTotalQuantity"
              v-model.number="editForm.totalQuantity"
              type="number" 
              class="field-input"
              min="1"
              :required="editForm.isLimited"
            />
          </div>
          
          <div class="modal-actions">
            <button type="button" @click="closeEditModal" class="cancel-btn">
              취소
            </button>
            <button type="submit" class="submit-btn" :disabled="updateLoading">
              {{ updateLoading ? '수정 중...' : '수정 완료' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import MainNavigation from '@/components/main/MainNavigation.vue'
import { couponAPI } from '@/api/coupon'
import { useApi } from '@/composables/useApi'
import { useModal } from '@/composables/useModal'
import { useAuthStore } from '@/store/auth'
import { formatNumber } from '@/utils/helpers'
import '@/assets/styles/pages/admin.css'

const router = useRouter()
const authStore = useAuthStore()
const { execute, loading } = useApi()
const { success, error: showError, confirm } = useModal()

const templates = ref([])
const currentPage = ref(0)
const totalPages = ref(0)
const pageSize = 20
const serviceError = ref(false) // 서비스 에러 상태 추가

const showEditModal = ref(false)
const updateLoading = ref(false)
const editingTemplate = ref(null)
const editForm = ref({
  title: '',
  discountType: 'PERCENT',
  discountValue: 0,
  startedAt: '',
  finishedAt: '',
  isLimited: false,
  totalQuantity: null
})

const goToHome = () => {
  router.push('/')
}

// 날짜/시간 포맷팅
const formatDateTime = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 쿠폰 상태 확인
const getStatusClass = (template) => {
  const now = new Date()
  const start = new Date(template.startedAt)
  const end = new Date(template.finishedAt)
  
  if (now < start) return 'status-scheduled'
  if (now > end) return 'status-expired'
  if (template.isLimited && template.issuedCount >= template.totalQuantity) return 'status-soldout'
  return 'status-active'
}

const getStatusText = (template) => {
  const now = new Date()
  const start = new Date(template.startedAt)
  const end = new Date(template.finishedAt)
  
  if (now < start) return '예정'
  if (now > end) return '종료'
  if (template.isLimited && template.issuedCount >= template.totalQuantity) return '소진'
  return '진행중'
}

// 현재 날짜/시간을 datetime-local 형식으로 변환
const getCurrentDateTime = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

// 시작일시 최소값
const minStartDate = computed(() => getCurrentDateTime())

// 종료일시 최소값
const minEndDate = computed(() => {
  return editForm.value.startedAt || getCurrentDateTime()
})

// 쿠폰 템플릿 목록 로드
const loadTemplates = async (page = 0) => {
  serviceError.value = false // 에러 상태 초기화
  
  const result = await execute(
    () => couponAPI.getAdminTemplates({ page, size: pageSize }),
    {
      showErrorModal: false,
      onError: (error) => {
        console.error('쿠폰 템플릿 로드 실패:', error)
        templates.value = []
      }
    }
  )

  if (result.success) {
    // nginx fallback JSON 응답 체크
    if (result.data && result.data.code === 'C502') {
      console.log('쿠폰 서비스 접속 불가:', result.data.message)
      serviceError.value = true
      templates.value = []
      return
    }

    if (result.data) {
      // 응답이 배열로 직접 오는 경우
      if (Array.isArray(result.data)) {
        templates.value = result.data
        currentPage.value = 0
        totalPages.value = 1
      } else {
        // 페이지네이션 응답인 경우
        templates.value = result.data.content || []
        currentPage.value = result.data.number || 0
        totalPages.value = result.data.totalPages || 0
      }
    }
  }
}

// 페이지 이동
const goToPage = (page) => {
  loadTemplates(page)
}

// ISO 날짜를 datetime-local 형식으로 변환
const toDateTimeLocal = (isoString) => {
  if (!isoString) return ''
  const date = new Date(isoString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

// 수정 모달 열기
const handleEdit = async (template) => {
  const templateId = template.id || template.templateId
  editingTemplate.value = { ...template, templateId }
  
  // 상세 정보 조회
  const result = await execute(
    () => couponAPI.getAdminTemplateDetail(templateId),
    {
      showErrorModal: false,
      onError: (error) => {
        console.error('쿠폰 템플릿 상세 조회 실패:', error)
        showError('쿠폰 템플릿 정보를 불러오는데 실패했습니다.')
      }
    }
  )
  
  if (result.success) {
    // nginx fallback JSON 응답 체크
    if (result.data && result.data.code === 'C502') {
      console.log('쿠폰 서비스 접속 불가:', result.data.message)
      showError('쿠폰 서비스에 접속할 수 없습니다. 잠시 후 다시 시도해주세요.')
      return
    }

    if (result.data) {
      const detail = result.data
      console.log('=== 쿠폰 템플릿 상세 조회 ===')
      console.log('detail.startedAt:', detail.startedAt)
      console.log('detail.finishedAt:', detail.finishedAt)
      console.log('toDateTimeLocal(startedAt):', toDateTimeLocal(detail.startedAt))
      console.log('toDateTimeLocal(finishedAt):', toDateTimeLocal(detail.finishedAt))
      
      editForm.value = {
        title: detail.title,
        discountType: detail.discountType,
        discountValue: detail.discountValue,
        startedAt: toDateTimeLocal(detail.startedAt),
        finishedAt: toDateTimeLocal(detail.finishedAt),
        isLimited: detail.isLimited,
        totalQuantity: detail.totalQuantity
      }
      showEditModal.value = true
    }
  }
}

// 수정 모달 닫기
const closeEditModal = () => {
  showEditModal.value = false
  editingTemplate.value = null
}

// 쿠폰 템플릿 수정
const handleUpdateSubmit = async () => {
  if (!editingTemplate.value) return
  
  updateLoading.value = true
  
  // datetime-local 값을 로컬 시간 기준 ISO 문자열로 변환
  const formatToLocalISO = (dateTimeLocal) => {
    if (!dateTimeLocal) return null
    // datetime-local 형식: "2026-01-15T04:23"
    // 초를 추가하여 ISO 형식으로 변환: "2026-01-15T04:23:00"
    return `${dateTimeLocal}:00`
  }
  
  const updateData = {
    ...editForm.value,
    startedAt: formatToLocalISO(editForm.value.startedAt),
    finishedAt: formatToLocalISO(editForm.value.finishedAt),
    totalQuantity: editForm.value.isLimited ? editForm.value.totalQuantity : null,
    validPeriod: true,
    validDiscountValue: true,
    validQuantity: true
  }
  
  console.log('=== 쿠폰 템플릿 수정 데이터 ===')
  console.log('editForm.startedAt:', editForm.value.startedAt)
  console.log('editForm.finishedAt:', editForm.value.finishedAt)
  console.log('updateData.startedAt:', updateData.startedAt)
  console.log('updateData.finishedAt:', updateData.finishedAt)
  console.log('전체 updateData:', updateData)
  
  const result = await execute(
    () => couponAPI.updateTemplate(editingTemplate.value.templateId, updateData),
    {
      onSuccess: () => {
        success('쿠폰 템플릿이 수정되었습니다.')
        closeEditModal()
        loadTemplates(currentPage.value)
      },
      onError: (message) => {
        showError(message || '쿠폰 템플릿 수정에 실패했습니다.')
      }
    }
  )
  
  updateLoading.value = false
}

// 쿠폰 템플릿 삭제
const handleDelete = async (template) => {
  const templateId = template.id || template.templateId
  const result = await confirm(
    `"${template.title}" 쿠폰 템플릿을 삭제하시겠습니까?`,
    '쿠폰 템플릿 삭제'
  )
  
  if (!result) return

  await execute(
    () => couponAPI.deleteTemplate(templateId),
    {
      onSuccess: () => {
        success('쿠폰 템플릿이 삭제되었습니다.')
        loadTemplates(currentPage.value)
      },
      onError: (message) => {
        showError(message || '쿠폰 템플릿 삭제에 실패했습니다.')
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

  loadTemplates()
})
</script>
