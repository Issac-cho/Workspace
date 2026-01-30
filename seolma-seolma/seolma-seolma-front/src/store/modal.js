import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useModalStore = defineStore('modal', () => {
    // State
    const isOpen = ref(false)
    const component = ref(null)
    const props = ref({})
    const options = ref({})

    // Actions
    const open = (componentName, componentProps = {}, modalOptions = {}) => {
        component.value = componentName
        props.value = componentProps
        options.value = {
            closable: true,
            maskClosable: true,
            ...modalOptions
        }
        isOpen.value = true
    }

    const close = () => {
        isOpen.value = false
        component.value = null
        props.value = {}
        options.value = {}
    }

    // 편의 메서드들
    const showAlert = (message, title = '알림') => {
        open('BaseModal', {
            type: 'info',
            message,
            title
        }, { closable: true, maskClosable: true })
    }

    const showConfirm = (message, title = '확인', onConfirm = null, onCancel = null) => {
        open('BaseModal', {
            type: 'confirm',
            message,
            title,
            onConfirm: () => {
                close()
                onConfirm?.()
            },
            onCancel: () => {
                close()
                onCancel?.()
            }
        }, { closable: false, maskClosable: false })
    }

    const showError = (message, title = '오류') => {
        open('BaseModal', {
            type: 'error',
            message,
            title
        }, { closable: true, maskClosable: true })
    }

    const showSuccess = (message, title = '성공') => {
        open('BaseModal', {
            type: 'success',
            message,
            title
        }, { closable: true, maskClosable: true })
    }

    // 커스텀 모달 (사용자 정의 컴포넌트)
    const showCustom = (componentName, componentProps = {}, modalOptions = {}) => {
        open(componentName, componentProps, modalOptions)
    }

    return {
        // State
        isOpen,
        component,
        props,
        options,

        // Actions
        open,
        close,
        showAlert,
        showConfirm,
        showError,
        showSuccess,
        showCustom
    }
})