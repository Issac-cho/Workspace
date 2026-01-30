<template>
  <aside class="side-menu">
    <nav class="menu-nav">
      <ul class="menu-list">
        <li class="menu-item">
          <router-link to="/products" class="menu-link">
            상품 관리
          </router-link>
        </li>
        
        <li class="menu-item">
          <router-link to="/orders" class="menu-link">
            주문 관리
          </router-link>
        </li>
        
        <li class="menu-item">
          <router-link to="/coupons" class="menu-link">
            쿠폰 관리
          </router-link>
        </li>
        
        <li v-if="isAdmin" class="menu-item">
          <router-link to="/admin" class="menu-link">
            관리자
          </router-link>
        </li>
      </ul>
    </nav>
  </aside>
</template>

<script setup>
import { useAuth } from '@/composables/useAuth'

const { isAdmin } = useAuth()
</script>