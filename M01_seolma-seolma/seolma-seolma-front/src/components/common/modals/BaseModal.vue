<template>
  <div class="modal-base">
    <div v-if="showIcon" class="modal-icon">
      <component :is="iconComponent" />
    </div>
    
    <h3 class="modal-title">{{ title }}</h3>
    <p class="modal-message">{{ message }}</p>
    
    <div class="modal-actions">
      <BaseButton 
        v-if="showCancel"
        @click="handleCancel" 
        :class="cancelButtonClass"
      >
        {{ cancelText }}
      </BaseButton>
      <BaseButton 
        @click="handleConfirm"
        :class="confirmButtonClass"
      >
        {{ confirmText }}
      </BaseButton>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import BaseButton from '@/components/common/BaseButton.vue'
import '@/assets/styles/components/base-modal.css'

const props = defineProps({
  type: {
    type: String,
    default: 'info',
    validator: (value) => ['info', 'success', 'error', 'warning', 'confirm'].includes(value)
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  confirmText: {
    type: String,
    default: '확인'
  },
  cancelText: {
    type: String,
    default: '취소'
  },
  onConfirm: {
    type: Function,
    default: null
  },
  onCancel: {
    type: Function,
    default: null
  }
})

const emit = defineEmits(['close'])

// 타입별 설정
const modalConfig = computed(() => {
  switch (props.type) {
    case 'success':
      return {
        showIcon: true,
        showCancel: false,
        confirmButtonClass: 'modal-btn--success',
        iconColor: '#10b981'
      }
    case 'error':
      return {
        showIcon: true,
        showCancel: false,
        confirmButtonClass: 'modal-btn--danger',
        iconColor: '#ef4444'
      }
    case 'warning':
      return {
        showIcon: true,
        showCancel: false,
        confirmButtonClass: 'modal-btn--warning',
        iconColor: '#f59e0b'
      }
    case 'confirm':
      return {
        showIcon: true,
        showCancel: true,
        confirmButtonClass: 'modal-btn--primary',
        cancelButtonClass: 'modal-btn--secondary',
        iconColor: '#f59e0b'
      }
    case 'info':
    default:
      return {
        showIcon: true,
        showCancel: false,
        confirmButtonClass: 'modal-btn--primary',
        iconColor: '#3b82f6'
      }
  }
})

const showIcon = computed(() => modalConfig.value.showIcon)
const showCancel = computed(() => modalConfig.value.showCancel)
const confirmButtonClass = computed(() => modalConfig.value.confirmButtonClass)
const cancelButtonClass = computed(() => modalConfig.value.cancelButtonClass)

// 아이콘 컴포넌트
const iconComponent = computed(() => {
  const color = modalConfig.value.iconColor
  
  switch (props.type) {
    case 'success':
      return {
        template: `
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="${color}" stroke-width="2"/>
            <path d="M9 12l2 2 4-4" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        `
      }
    case 'error':
      return {
        template: `
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="${color}" stroke-width="2"/>
            <path d="M15 9l-6 6M9 9l6 6" stroke="${color}" stroke-width="2" stroke-linecap="round"/>
          </svg>
        `
      }
    case 'warning':
    case 'confirm':
      return {
        template: `
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="${color}" stroke-width="2"/>
            <path d="M12 9v4M12 17h.01" stroke="${color}" stroke-width="2" stroke-linecap="round"/>
          </svg>
        `
      }
    case 'info':
    default:
      return {
        template: `
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="${color}" stroke-width="2"/>
            <path d="M12 16v-4M12 8h.01" stroke="${color}" stroke-width="2" stroke-linecap="round"/>
          </svg>
        `
      }
  }
})

const handleConfirm = () => {
  props.onConfirm?.()
  emit('close')
}

const handleCancel = () => {
  props.onCancel?.()
  emit('close')
}
</script>