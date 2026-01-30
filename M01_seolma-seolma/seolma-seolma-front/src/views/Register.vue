<template>
  <AuthLayout>
    <div class="register">
      <div class="register-container">
        <div class="register-header">
          <h1>회원가입</h1>
          <p>새 계정을 만드세요</p>
        </div>
        
        <form @submit.prevent="handleRegister" class="register-form">
          <BaseInput
            :model-value="form.loginId"
            @update:model-value="(value) => handleFieldInput('loginId', value)"
            @blur="() => handleFieldBlur('loginId')"
            label="로그인 아이디"
            placeholder="3-50자의 영문, 숫자, 언더스코어"
            required
            :error-message="getFieldError('loginId')"
          />
          
          <BaseInput
            :model-value="form.password"
            @update:model-value="(value) => handleFieldInput('password', value)"
            @blur="() => handleFieldBlur('password')"
            type="password"
            label="비밀번호"
            placeholder="8-100자, 대소문자/숫자/특수문자 포함"
            required
            :error-message="getFieldError('password')"
          />
          
          <BaseInput
            :model-value="form.passwordConfirm"
            @update:model-value="(value) => handleFieldInput('passwordConfirm', value)"
            @blur="() => handleFieldBlur('passwordConfirm')"
            type="password"
            label="비밀번호 확인"
            placeholder="비밀번호를 다시 입력하세요"
            required
            :error-message="getFieldError('passwordConfirm')"
          />
          
          <BaseInput
            :model-value="form.userName"
            @update:model-value="(value) => handleFieldInput('userName', value)"
            @blur="() => handleFieldBlur('userName')"
            label="사용자 이름"
            placeholder="2-50자"
            required
            :error-message="getFieldError('userName')"
          />
          
          <div class="form-field">
            <label class="field-label">역할</label>
            <select 
              :value="form.role"
              @change="(e) => handleFieldInput('role', e.target.value)"
              class="role-select"
            >
              <option value="USER">일반 사용자</option>
              <option value="ADMIN">관리자</option>
            </select>
            <div v-if="getFieldError('role')" class="field-error">
              {{ getFieldError('role') }}
            </div>
          </div>
          
          <BaseButton
            type="submit"
            :loading="isLoading"
            block
            size="large"
          >
            회원가입
          </BaseButton>
        </form>
        
        <div class="register-footer">
          <p>이미 계정이 있으신가요? <router-link to="/login">로그인</router-link></p>
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
import { useNavigation } from '@/composables/useNavigation'
import { useValidation } from '@/composables/useValidation'
import { required, loginId, password, userName, role } from '@/utils/validation'
import '@/assets/styles/pages/register.css'

const { register } = useAuth()
const { success, error: showError } = useModal()
const { goPage } = useNavigation()

// 유효성 검사 설정
const { 
  form, 
  isValid, 
  validateForm, 
  handleFieldInput, 
  handleFieldBlur,
  getFieldError 
} = useValidation(
  // 초기 폼 데이터
  {
    loginId: '',
    password: '',
    passwordConfirm: '',
    userName: '',
    role: 'USER'
  },
  // 유효성 검사 규칙
  {
    loginId: [
      (value) => required(value, '로그인 아이디를 입력하세요'),
      (value) => loginId(value)
    ],
    password: [
      (value) => required(value, '비밀번호를 입력하세요'),
      (value) => password(value)
    ],
    passwordConfirm: [
      (value) => required(value, '비밀번호 확인을 입력하세요'),
      (value) => {
        if (value !== form.password) {
          return '비밀번호가 일치하지 않습니다'
        }
        return null
      }
    ],
    userName: [
      (value) => required(value, '사용자 이름을 입력하세요'),
      (value) => userName(value)
    ],
    role: [
      (value) => required(value, '역할을 선택하세요'),
      (value) => role(value)
    ]
  }
)

const isLoading = ref(false)

const handleRegister = async () => {
  if (!validateForm()) return
  
  isLoading.value = true
  
  try {
    const result = await register({
      loginId: form.loginId,
      password: form.password,
      userName: form.userName,
      role: form.role
    })
    
    if (result.success) {
      success('회원가입이 완료되었습니다. 로그인해주세요.')
      goPage('/login')
    } else {
      showError(result.message)
    }
  } catch (error) {
    showError('회원가입 중 오류가 발생했습니다.')
  } finally {
    isLoading.value = false
  }
}
</script>