import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authAPI } from '@/api/auth'
import { isSuccess } from '@/constants/apiCodes'

export const useAuthStore = defineStore('auth', () => {
    // State
    const accessToken = ref(localStorage.getItem('accessToken') || null)
    const user = ref(JSON.parse(localStorage.getItem('user') || 'null'))
    const isLoading = ref(false)

    // Getters
    const isAuthenticated = computed(() => !!accessToken.value)
    const isAdmin = computed(() => user.value?.role === 'ADMIN')

    // Actions
    const setAccessToken = (token) => {
        accessToken.value = token
        if (token) {
            localStorage.setItem('accessToken', token)
        } else {
            localStorage.removeItem('accessToken')
        }
    }

    const setUser = (userData) => {
        user.value = userData
        if (userData) {
            localStorage.setItem('user', JSON.stringify(userData))
        } else {
            localStorage.removeItem('user')
        }
    }

    const login = async (credentials) => {
        try {
            isLoading.value = true
            const response = await authAPI.login(credentials)

            if (isSuccess(response.data.code)) {
                const data = response.data.data
                const { accessToken: token, userId, userName, role } = data

                setAccessToken(token)
                // user 객체 구성
                setUser({
                    userId,
                    userName,
                    role
                })

                return { success: true, data: response.data.data }
            } else {
                return { success: false, message: response.data.message }
            }
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || '로그인에 실패했습니다.'
            }
        } finally {
            isLoading.value = false
        }
    }

    const logout = () => {
        // 로컬 상태 초기화
        setAccessToken(null)
        setUser(null)
    }

    const fetchProfile = async () => {
        try {
            const response = await authAPI.getProfile()

            if (isSuccess(response.data.code)) {
                setUser(response.data.data)
                return { success: true, data: response.data.data }
            }
        } catch (error) {
            console.error('프로필 조회 실패:', error)
            return { success: false }
        }
    }

    const register = async (userData) => {
        try {
            isLoading.value = true
            const response = await authAPI.signup(userData)

            if (isSuccess(response.data.code)) {
                return { success: true, data: response.data.data }
            } else {
                return { success: false, message: response.data.message }
            }
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || '회원가입에 실패했습니다.'
            }
        } finally {
            isLoading.value = false
        }
    }

    const checkLoginId = async (loginId) => {
        try {
            const response = await authAPI.checkLoginId(loginId)

            if (isSuccess(response.data.code)) {
                return {
                    success: true,
                    available: response.data.data.available,
                    message: response.data.data.message
                }
            } else {
                return { success: false, message: response.data.message }
            }
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || '로그인 아이디 확인에 실패했습니다.'
            }
        }
    }

    const refreshToken = async () => {
        try {
            const response = await authAPI.refresh()

            if (isSuccess(response.data.code)) {
                const { accessToken: token } = response.data.data
                setAccessToken(token)
                return { success: true, token }
            } else {
                throw new Error('토큰 갱신 실패')
            }
        } catch (error) {
            // 토큰 갱신 실패 시 로그아웃 처리
            setAccessToken(null)
            setUser(null)
            throw error
        }
    }

    return {
        // State
        accessToken,
        user,
        isLoading,

        // Getters
        isAuthenticated,
        isAdmin,

        // Actions
        setAccessToken,
        setUser,
        login,
        logout,
        fetchProfile,
        register,
        checkLoginId,
        refreshToken
    }
})