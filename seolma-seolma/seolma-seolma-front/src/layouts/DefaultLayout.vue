<template>
  <div class="layout">
    <TopNavigation />
    <div class="layout-body">
      <SideMenu />
      <main class="main-content">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup>
import TopNavigation from '@/components/layout/TopNavigation.vue'
import SideMenu from '@/components/layout/SideMenu.vue'
</script>