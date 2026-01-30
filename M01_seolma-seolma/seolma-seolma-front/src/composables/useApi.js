import { ref } from 'vue'
import { useModal } from './useModal'
import { isSuccess } from '@/constants/apiCodes'

export function useApi() {
    const { error: showError } = useModal()

    const loading = ref(false)
    const data = ref(null)
    const errorMsg = ref(null)

    const execute = async (apiCall, options = {}) => {
        const {
            showErrorModal = true,
            loadingRef = loading,
            onSuccess = null,
            onError = null
        } = options

        try {
            loadingRef.value = true
            errorMsg.value = null

            const response = await apiCall()

            // skipErrorModal 옵션을 axios config에 설정
            if (response.config) {
                response.config.skipErrorModal = !showErrorModal
            }

            if (isSuccess(response.data.code)) {
                data.value = response.data.data
                onSuccess?.(response.data.data)
                return { success: true, data: response.data.data }
            } else {
                const message = response.data.message || '요청 처리에 실패했습니다.'
                errorMsg.value = message

                if (showErrorModal) {
                    showError(message)
                }

                onError?.(message)
                return { success: false, message }
            }
        } catch (err) {
            console.error('API 호출 에러 상세:', {
                message: err.message,
                response: err.response,
                request: err.request,
                config: err.config,
                status: err.response?.status,
                statusText: err.response?.statusText,
                data: err.response?.data
            })

            const message = err.response?.data?.message || '네트워크 오류가 발생했습니다.'
            errorMsg.value = message

            // 에러 발생 시에도 skipErrorModal 설정
            if (err.config) {
                err.config.skipErrorModal = !showErrorModal
            }

            if (showErrorModal) {
                showError(message)
            }

            onError?.(message)
            return { success: false, message }
        } finally {
            loadingRef.value = false
        }
    }

    const reset = () => {
        loading.value = false
        data.value = null
        errorMsg.value = null
    }

    return {
        loading,
        data,
        errorMsg,
        execute,
        reset
    }
}