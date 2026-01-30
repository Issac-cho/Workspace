<template>
  <div class="admin-page">
    <MainNavigation />
    
    <section class="admin-banner" @click="goToHome">
    </section>
    
    <section class="admin-section">
      <h2 class="section-title">상품 등록</h2>
      
      <div class="admin-container">
        <form @submit.prevent="handleSubmit" class="product-form">
          <div class="form-field">
            <label for="productName" class="field-label">상품명 *</label>
            <input 
              id="productName"
              v-model="productForm.name"
              type="text" 
              placeholder="상품명을 입력하세요"
              class="field-input"
              required
            />
          </div>
          
          <div class="form-field">
            <label for="productPrice" class="field-label">가격 *</label>
            <input 
              id="productPrice"
              v-model.number="productForm.price"
              type="number" 
              placeholder="가격을 입력하세요"
              class="field-input"
              min="0"
              required
            />
          </div>
          
          <div class="form-field">
            <label for="productImage" class="field-label">상품 이미지</label>
            <input 
              id="productImage"
              type="file"
              accept="image/*"
              @change="handleImageChange"
              class="field-input"
            />
            <div v-if="imagePreview" class="image-preview">
              <img :src="imagePreview" alt="미리보기" />
            </div>
          </div>
          
          <div class="form-actions">
            <button type="submit" class="submit-btn" :disabled="loading">
              {{ loading ? '등록 중...' : '상품 등록' }}
            </button>
          </div>
        </form>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import MainNavigation from '@/components/main/MainNavigation.vue'
import { productAPI } from '@/api/product'
import { useApi } from '@/composables/useApi'
import { useModal } from '@/composables/useModal'
import { useAuthStore } from '@/store/auth'
import '@/assets/styles/pages/admin.css'

const router = useRouter()
const authStore = useAuthStore()
const { execute, loading } = useApi()
const { success, error: showError, alert } = useModal()

const productForm = ref({
  name: '',
  price: 0
})

const imageFile = ref(null)
const imagePreview = ref(null)

const goToHome = () => {
  router.push('/')
}

const handleImageChange = (event) => {
  const file = event.target.files[0]
  if (file) {
    imageFile.value = file
    
    // 이미지 미리보기
    const reader = new FileReader()
    reader.onload = (e) => {
      imagePreview.value = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

const handleSubmit = async () => {
  if (!productForm.value.name || productForm.value.price <= 0) {
    alert('모든 필수 항목을 입력해주세요.')
    return
  }

  // 상품 등록
  const result = await execute(
    () => productAPI.createProduct(productForm.value),
    {
      onSuccess: async (data) => {
        console.log('상품 등록 응답:', data)
        
        // productId 추출 (id 또는 productId 필드)
        const productId = data.productId || data.id
        
        // 이미지가 있으면 업로드
        if (imageFile.value && productId) {
          console.log('이미지 업로드 시작, productId:', productId)
          
          const imageResult = await execute(
            () => productAPI.uploadProductImage(productId, imageFile.value),
            {
              showErrorModal: false,
              onSuccess: () => {
                console.log('이미지 업로드 성공')
              },
              onError: (error) => {
                console.error('이미지 업로드 실패:', error)
              }
            }
          )
        }
        
        success('상품이 등록되었습니다!')
        router.push('/admin/products')
      },
      onError: (message) => {
        showError(message || '상품 등록에 실패했습니다.')
      }
    }
  )
}

// 관리자 권한 확인
if (!authStore.isAdmin) {
  alert('관리자만 접근할 수 있습니다.')
  router.push('/')
}
</script>
