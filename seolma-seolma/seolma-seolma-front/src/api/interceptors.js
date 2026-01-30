import { userServiceClient, productServiceClient, couponServiceClient, orderServiceClient } from './client'
import { useAuthStore } from '@/store/auth'
import { useModalStore } from '@/store/modal'
import { API_CODES, isSuccess, isTokenRefreshNeeded, getErrorMessage } from '@/constants/apiCodes'

let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error)
        } else {
            prom.resolve(token)
        }
    })

    failedQueue = []
}

// 모든 서비스 클라이언트 배열
const serviceClients = [userServiceClient, productServiceClient, couponServiceClient, orderServiceClient]

// Request 인터셉터 설정 함수
const setupRequestInterceptor = (client) => {
    client.interceptors.request.use(
        (config) => {
            const authStore = useAuthStore()

            if (authStore.accessToken) {
                config.headers.Authorization = `Bearer ${authStore.accessToken}`
            }

            return config
        },
        (error) => {
            return Promise.reject(error)
        }
    )
}

// Response 인터셉터 설정 함수
const setupResponseInterceptor = (client) => {
    client.interceptors.response.use(
        (response) => {
            return response
        },
        async (error) => {
            const originalRequest = error.config
            const authStore = useAuthStore()
            const modalStore = useModalStore()

            // 401 에러이고 토큰 갱신이 필요한 경우
            if (error.response?.status === 401 &&
                isTokenRefreshNeeded(error.response?.data?.code) &&
                !originalRequest._retry) {

                if (isRefreshing) {
                    // 이미 갱신 중이면 큐에 추가
                    return new Promise((resolve, reject) => {
                        failedQueue.push({ resolve, reject })
                    }).then(token => {
                        originalRequest.headers.Authorization = `Bearer ${token}`
                        return client(originalRequest)
                    }).catch(err => {
                        return Promise.reject(err)
                    })
                }

                originalRequest._retry = true
                isRefreshing = true

                try {
                    // 토큰 갱신 API 호출 (User Service를 통해)
                    const response = await userServiceClient.post('/api/v1/users/auth/refresh')

                    if (isSuccess(response.data.code)) {
                        const newToken = response.data.data.accessToken
                        authStore.setAccessToken(newToken)

                        // 큐에 있는 요청들 처리
                        processQueue(null, newToken)

                        // 원래 요청 재시도
                        originalRequest.headers.Authorization = `Bearer ${newToken}`
                        return client(originalRequest)
                    }
                } catch (refreshError) {
                    // 토큰 갱신 실패 시 로그아웃 처리
                    processQueue(refreshError, null)
                    authStore.logout()

                    modalStore.showError('세션이 만료되었습니다. 다시 로그인해주세요.')

                    // 로그인 페이지로 리다이렉트
                    if (window.location.pathname !== '/login') {
                        window.location.href = '/login'
                    }

                    return Promise.reject(refreshError)
                } finally {
                    isRefreshing = false
                }
            }

            // 기타 에러 처리
            if (error.response) {
                const { data } = error.response

                // skipErrorModal 옵션이 있으면 모달 표시 안 함
                if (!originalRequest.skipErrorModal) {
                    // 에러 메시지 표시 (서버 메시지 우선, 없으면 매핑된 메시지)
                    const errorMessage = getErrorMessage(data?.code, data?.message)
                    modalStore.showError(errorMessage)
                }
            } else if (error.request) {
                if (!originalRequest.skipErrorModal) {
                    modalStore.showError('네트워크 연결을 확인해주세요.')
                }
            } else {
                if (!originalRequest.skipErrorModal) {
                    modalStore.showError('요청 처리 중 오류가 발생했습니다.')
                }
            }

            return Promise.reject(error)
        }
    )
}

// 모든 서비스 클라이언트에 인터셉터 적용
serviceClients.forEach(client => {
    setupRequestInterceptor(client)
    setupResponseInterceptor(client)
})

export { userServiceClient, productServiceClient, couponServiceClient, orderServiceClient }