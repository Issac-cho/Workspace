<template>
  <div id="app">
    <router-view />
    <!-- 전역 모달 - 앱 전체에서 단 하나만 존재 -->
    <CommonModal />
  </div>
</template>

<script setup>
import CommonModal from '@/components/common/CommonModal.vue'
import '@/assets/styles/app.css'
</script>