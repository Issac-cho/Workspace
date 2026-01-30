<template>
  <Teleport to="body">
    <Transition name="modal">
      <div 
        v-if="modalStore.isOpen" 
        class="modal-overlay"
        @click="handleOverlayClick"
      >
        <div class="modal-container" @click.stop>
          <div class="modal-header" v-if="modalStore.options.closable">
            <button class="modal-close" @click="modalStore.close">×</button>
          </div>
          
          <div class="modal-content">
            <!-- 동적 컴포넌트 렌더링 -->
            <component 
              :is="currentComponent" 
              v-bind="modalStore.props"
              @close="modalStore.close"
            />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue'
import { useModalStore } from '@/store/modal'
import '@/assets/styles/components/common-modal.css'

// 공통 모달 컴포넌트 import
import BaseModal from './modals/BaseModal.vue'

const modalStore = useModalStore()

// 컴포넌트 매핑
const componentMap = {
  BaseModal
}

const currentComponent = computed(() => {
  if (!modalStore.component) return null
  return componentMap[modalStore.component] || modalStore.component
})

const handleOverlayClick = () => {
  if (modalStore.options.maskClosable) {
    modalStore.close()
  }
}
</script>