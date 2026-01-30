import { userServiceClient } from './client'

export const authAPI = {
    // 회원가입
    signup(userData) {
        return userServiceClient.post('/api/v1/users/auth/signup', userData)
    },

    // 로그인 아이디 중복 확인
    checkLoginId(loginId) {
        return userServiceClient.get('/api/v1/users/auth/check-loginid', {
            params: { loginId }
        })
    },

    // 로그인
    login(credentials) {
        return userServiceClient.post('/api/v1/users/auth/login', credentials)
    },

    // 로그아웃
    logout() {
        return userServiceClient.post('/api/v1/users/auth/logout')
    },

    // 토큰 갱신
    refresh() {
        return userServiceClient.post('/api/v1/users/auth/refresh')
    },

    // 사용자 정보 조회
    getProfile() {
        return userServiceClient.get('/api/v1/users/profile')
    },

    // 비밀번호 변경
    changePassword(passwordData) {
        return userServiceClient.put('/api/v1/users/password', passwordData)
    }
}