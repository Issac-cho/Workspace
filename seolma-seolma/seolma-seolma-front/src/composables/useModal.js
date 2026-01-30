import { useModalStore } from '@/store/modal'

export function useModal() {
    const modalStore = useModalStore()

    // 기본 모달 메서드들
    const open = (component, props = {}, options = {}) => {
        modalStore.open(component, props, options)
    }

    const close = () => {
        modalStore.close()
    }

    // 편의 메서드들
    const alert = (message, title = '알림') => {
        return new Promise((resolve) => {
            modalStore.showAlert(message, title)
            // 모달이 닫힐 때까지 대기
            const unwatch = modalStore.$subscribe((mutation, state) => {
                if (!state.isOpen) {
                    unwatch()
                    resolve()
                }
            })
        })
    }

    const confirm = (message, title = '확인') => {
        return new Promise((resolve) => {
            modalStore.showConfirm(
                message,
                title,
                () => resolve(true),  // 확인
                () => resolve(false)  // 취소
            )
        })
    }

    const error = (message, title = '오류') => {
        modalStore.showError(message, title)
    }

    const success = (message, title = '성공') => {
        modalStore.showSuccess(message, title)
    }

    // 커스텀 모달
    const custom = (component, props = {}, options = {}) => {
        modalStore.showCustom(component, props, options)
    }

    return {
        // 기본 메서드
        open,
        close,

        // 편의 메서드
        alert,
        confirm,
        error,
        success,
        custom
    }
}