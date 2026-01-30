<template>
  <header class="top-navigation">
    <div class="nav-container">
      <div class="nav-left">
        <h1 class="logo">MSA Frontend</h1>
      </div>
      
      <div class="nav-right">
        <div v-if="isAuthenticated" class="user-menu">
          <span class="user-name">{{ user?.name }}</span>
          <BaseButton @click="handleLogout" variant="outline" size="small">
            로그아웃
          </BaseButton>
        </div>
        <div v-else class="auth-buttons">
          <BaseButton @click="goToLogin" variant="outline" size="small">
            로그인
          </BaseButton>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import BaseButton from '@/components/common/BaseButton.vue'
import { useAuth } from '@/composables/useAuth'
import { useNavigation } from '@/composables/useNavigation'

const { isAuthenticated, user, logout } = useAuth()
const { goPage } = useNavigation()

const handleLogout = async () => {
  await logout()
}

const goToLogin = () => {
  goPage('/login')
}
</script>