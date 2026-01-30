<template>
  <AuthLayout>
    <div class="login">
      <div class="login-container">
        <div class="login-header">
          <h1>로그인</h1>
          <p>계정에 로그인하세요</p>
        </div>
        
        <form @submit.prevent="handleLogin" class="login-form">
          <BaseInput
            :model-value="form.loginId"
            @update:model-value="(value) => handleFieldInput('loginId', value)"
            @blur="() => handleFieldBlur('loginId')"
            label="로그인 아이디"
            placeholder="아이디를 입력하세요"
            required
            :error-message="getFieldError('loginId')"
          />
          
          <BaseInput
            :model-value="form.password"
            @update:model-value="(value) => handleFieldInput('password', value)"
            @blur="() => handleFieldBlur('password')"
            type="password"
            label="비밀번호"
            placeholder="비밀번호를 입력하세요"
            required
            :error-message="getFieldError('password')"
          />
          
          <BaseButton
            type="submit"
            :loading="isLoading"
            block
            size="large"
          >
            로그인
          </BaseButton>
        </form>
        
        <div class="login-footer">
          <p>계정이 없으신가요? <router-link to="/register">회원가입</router-link></p>
        </div>
      </div>
    </div>
  </AuthLayout>
</template>

<script setup>
import { ref } from 'vue'
import AuthLayout from '@/layouts/AuthLayout.vue'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import { useAuth } from '@/composables/useAuth'
import { useModal } from '@/composables/useModal'
import { useValidation } from '@/composables/useValidation'
import { required, loginId, minLength } from '@/utils/validation'
import '@/assets/styles/pages/login.css'

const { login } = useAuth()
const { error: showError } = useModal()

// 유효성 검사 설정
const { 
  form, 
  errors, 
  isValid, 
  validateForm, 
  handleFieldInput, 
  handleFieldBlur,
  getFieldError 
} = useValidation(
  // 초기 폼 데이터
  {
    loginId: '',
    password: ''
  },
  // 유효성 검사 규칙
  {
    loginId: [
      (value) => required(value, '로그인 아이디를 입력하세요'),
      (value) => loginId(value)
    ],
    password: [
      (value) => required(value, '비밀번호를 입력하세요'),
      (value) => minLength(value, 4, '비밀번호는 최소 4자 이상이어야 합니다')
    ]
  }
)

const isLoading = ref(false)

const handleLogin = async () => {
  if (!validateForm()) return
  
  isLoading.value = true
  
  try {
    const result = await login({
      loginId: form.loginId,
      password: form.password
    })
    
    if (!result.success) {
      showError(result.message)
    }
    // 성공 시 useAuth에서 자동으로 라우팅 처리
  } catch (error) {
    showError('로그인 중 오류가 발생했습니다.')
  } finally {
    isLoading.value = false
  }
}
</script>