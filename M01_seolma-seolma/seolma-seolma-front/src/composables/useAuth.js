import { computed } from 'vue'
import { useAuthStore } from '@/store/auth'
import { useRouter } from 'vue-router'

export function useAuth() {
    const authStore = useAuthStore()
    const router = useRouter()

    // Computed
    const isAuthenticated = computed(() => authStore.isAuthenticated)
    const isAdmin = computed(() => authStore.isAdmin)
    const user = computed(() => authStore.user)
    const isLoading = computed(() => authStore.isLoading)

    // Methods
    const login = async (credentials) => {
        const result = await authStore.login(credentials)

        if (result.success) {
            // 로그인 성공 시 메인페이지로 이동
            router.push('/')
        }

        return result
    }

    const register = async (userData) => {
        return await authStore.register(userData)
    }

    const checkLoginId = async (loginId) => {
        return await authStore.checkLoginId(loginId)
    }

    const logout = async () => {
        await authStore.logout()
        router.push('/login')
    }

    const requireAuth = () => {
        if (!isAuthenticated.value) {
            router.push('/login')
            return false
        }
        return true
    }

    const requireAdmin = () => {
        if (!isAuthenticated.value) {
            router.push('/login')
            return false
        }

        if (!isAdmin.value) {
            router.push('/') // 권한 없음 페이지로 리다이렉트
            return false
        }

        return true
    }

    return {
        // State
        isAuthenticated,
        isAdmin,
        user,
        isLoading,

        // Methods
        login,
        register,
        checkLoginId,
        logout,
        requireAuth,
        requireAdmin
    }
}