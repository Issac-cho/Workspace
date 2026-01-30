import { couponServiceClient } from './client'

export const couponAPI = {
    // === 사용자 쿠폰 API ===

    // 모든 쿠폰 목록 조회
    getAvailableTemplates() {
        return couponServiceClient.get('/api/v1/coupons/templates')
    },

    // 쿠폰 발급
    issueCoupon(templateId) {
        console.log('쿠폰 발급 API 호출:')
        console.log('- templateId:', templateId)
        console.log('- 요청 body:', { templateId })

        if (!templateId) {
            console.error('templateId가 없습니다!')
            throw new Error('templateId는 필수입니다.')
        }

        return couponServiceClient.post('/api/v1/coupons/issue', { templateId })
    },

    // 내 쿠폰 목록 조회
    getMyCoupons(params = {}) {
        return couponServiceClient.get('/api/v1/coupons/my', { params })
    },

    // 사용 가능한 내 쿠폰 조회
    getMyAvailableCoupons() {
        return couponServiceClient.get('/api/v1/coupons/my/available')
    },

    // 쿠폰 사용
    useCoupon(couponId) {
        return couponServiceClient.patch(`/api/v1/coupons/${couponId}/use`)
    },

    // 쿠폰 상세 조회
    getCoupon(couponId) {
        return couponServiceClient.get(`/api/v1/coupons/${couponId}`)
    },

    // === 관리자 쿠폰 API ===

    // 쿠폰 템플릿 등록 (관리자)
    createTemplate(templateData) {
        return couponServiceClient.post('/api/v1/admin/coupons/templates', templateData)
    },

    // 모든 쿠폰 템플릿 조회 (관리자)
    getAdminTemplates(params = {}) {
        return couponServiceClient.get('/api/v1/admin/coupons/templates', { params })
    },

    // 쿠폰 템플릿 상세 조회 (관리자)
    getAdminTemplateDetail(templateId) {
        return couponServiceClient.get(`/api/v1/admin/coupons/templates/${templateId}`)
    },

    // 쿠폰 템플릿 수정 (관리자)
    updateTemplate(templateId, templateData) {
        return couponServiceClient.put(`/api/v1/admin/coupons/templates/${templateId}`, templateData)
    },

    // 쿠폰 템플릿 삭제 (관리자)
    deleteTemplate(templateId) {
        return couponServiceClient.delete(`/api/v1/admin/coupons/templates/${templateId}`)
    },

    // 전체 쿠폰 발급 내역 조회 (관리자)
    getAdminIssuedCoupons(params = {}) {
        return couponServiceClient.get('/api/v1/admin/coupons/issued', { params })
    }
}