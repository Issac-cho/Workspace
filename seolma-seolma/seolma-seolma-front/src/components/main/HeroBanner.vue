<template>
  <section class="hero-banner" @click="handleBannerClick">
    <div class="search-container" @click.stop>
      <input 
        type="text" 
        placeholder="설 선물을 검색해보세요" 
        class="search-input"
        v-model="searchKeyword"
        @keyup.enter="handleSearch"
      >
      <button class="search-btn" @click="handleSearch">
        <img src="/src/assets/images/icons/search-icon.png" alt="검색" class="search-icon" />
      </button>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const searchKeyword = ref('')

const emit = defineEmits(['search'])

const handleSearch = () => {
  if (searchKeyword.value.trim()) {
    emit('search', searchKeyword.value.trim())
  }
}

const handleBannerClick = () => {
  router.push('/coupons')
}
</script>