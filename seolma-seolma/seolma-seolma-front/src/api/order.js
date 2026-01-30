import { orderServiceClient } from './client'

export const orderAPI = {
    // === 사용자 주문 API ===

    // 주문 생성
    createOrder(orderData) {
        return orderServiceClient.post('/api/v1/orders', orderData)
    },

    // 내 주문 목록 조회
    getMyOrders(params = {}) {
        return orderServiceClient.get('/api/v1/orders/my', { params })
    },

    // 주문 상세 조회
    getOrder(orderId) {
        return orderServiceClient.get(`/api/v1/orders/${orderId}`)
    },

    // 주문 취소
    cancelOrder(orderId) {
        return orderServiceClient.patch(`/api/v1/orders/${orderId}/cancel`)
    },

    // === 관리자 주문 API ===

    // 전체 주문 목록 조회 (관리자)
    getAdminOrders(params = {}) {
        return orderServiceClient.get('/api/v1/admin/orders', { params })
    },

    // 주문 상세 조회 (관리자)
    getAdminOrder(orderId) {
        return orderServiceClient.get(`/api/v1/admin/orders/${orderId}`)
    },

    // 주문 상태 변경 (관리자)
    updateOrderStatus(orderId, status) {
        return orderServiceClient.patch(`/api/v1/admin/orders/${orderId}/status`, null, {
            params: { status }
        })
    },

    // 주문 통계 (관리자)
    getOrderStatistics(params = {}) {
        return orderServiceClient.get('/api/v1/admin/orders/statistics', { params })
    },

    // === 하위 호환성을 위한 기존 메서드들 ===

    // 주문 목록 조회 (기존 호환성)
    getOrders(params = {}) {
        return this.getMyOrders(params)
    },

    // 전체 주문 목록 조회 (기존 호환성)
    getAllOrders(params = {}) {
        return this.getAdminOrders(params)
    },

    // 결제 처리 (기존 호환성)
    processPayment(orderId, paymentData) {
        return orderServiceClient.post(`/api/v1/orders/${orderId}/payment`, paymentData)
    }
}