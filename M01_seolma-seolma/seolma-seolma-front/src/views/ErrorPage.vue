<template>
  <div class="error-page">
    <div class="error-content">
      <h1 class="error-code">{{ errorCode }}</h1>
      <h2 class="error-title">{{ errorTitle }}</h2>
      <p class="error-message">{{ errorMessage }}</p>
      
      <div class="error-actions">
        <BaseButton @click="handlePrimaryAction">
          {{ primaryActionText }}
        </BaseButton>
        <BaseButton @click="handleGoBack" variant="outline">
          이전 페이지
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import BaseButton from '@/components/common/BaseButton.vue'
import { useNavigation } from '@/composables/useNavigation'
import '@/assets/styles/pages/error.css'

const route = useRoute()
const { goPage, goBack, refreshPage } = useNavigation()

// 쿼리 파라미터에서 에러 정보 가져오기
const errorCode = computed(() => route.query.code || '404')
const errorMessage = computed(() => route.query.message || getDefaultMessage(errorCode.value))

// 에러 코드별 기본 정보
const errorInfo = computed(() => {
  const code = errorCode.value
  
  switch (code) {
    case '403':
      return {
        title: '접근 권한이 없습니다',
        defaultMessage: '이 페이지에 접근할 권한이 없습니다. 관리자에게 문의하세요.',
        primaryAction: 'home',
        primaryActionText: '홈으로 이동'
      }
    case '500':
      return {
        title: '서버 오류가 발생했습니다',
        defaultMessage: '일시적인 서버 오류입니다. 잠시 후 다시 시도해주세요.',
        primaryAction: 'refresh',
        primaryActionText: '새로고침'
      }
    case '404':
    default:
      return {
        title: '페이지를 찾을 수 없습니다',
        defaultMessage: '요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.',
        primaryAction: 'home',
        primaryActionText: '홈으로 이동'
      }
  }
})

const errorTitle = computed(() => errorInfo.value.title)
const primaryActionText = computed(() => errorInfo.value.primaryActionText)

function getDefaultMessage(code) {
  return errorInfo.value.defaultMessage
}

const handlePrimaryAction = () => {
  const action = errorInfo.value.primaryAction
  
  if (action === 'refresh') {
    refreshPage()
  } else {
    goPage('/')
  }
}

const handleGoBack = () => {
  // sessionStorage에서 이전 페이지 정보 확인
  const previousPage = sessionStorage.getItem('previousPage')
  
  if (previousPage && previousPage !== '/error' && previousPage !== window.location.pathname) {
    // 저장된 이전 페이지로 이동
    goPage(previousPage)
  } else {
    // 브라우저 히스토리 확인
    if (window.history.length > 2) {
      const referrer = document.referrer
      const currentOrigin = window.location.origin
      
      // 같은 도메인에서 온 경우이고, 에러페이지가 아닌 경우
      if (referrer && referrer.startsWith(currentOrigin) && !referrer.includes('/error')) {
        goBack()
      } else {
        // 안전하게 홈으로 이동
        goPage('/')
      }
    } else {
      // 히스토리가 충분하지 않으면 홈으로 이동
      goPage('/')
    }
  }
}
</script>