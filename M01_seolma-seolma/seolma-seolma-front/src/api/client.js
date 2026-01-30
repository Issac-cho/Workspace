import axios from 'axios'

// 서비스별 API 클라이언트 생성
const createServiceClient = (serviceUrl) => {
    const client = axios.create({
        baseURL: serviceUrl,
        timeout: 30000, // 30초
        withCredentials: true, // MSA 환경에서 필수 - RefreshToken 쿠키 전송
        headers: {
            'Content-Type': 'application/json'
        }
    })
    return client
}

// 프록시 사용 여부에 따른 URL 결정
const getServiceUrl = (envUrl) => {
    const useProxy = import.meta.env.VITE_USE_PROXY === 'true'
    return useProxy ? '' : envUrl // 프록시 사용시 빈 문자열(상대경로), 아니면 전체 URL
}

// 포트 구조:
// 개발 환경: General Service (8080), Coupon Service (8081)
// 운영 환경: nginx 프록시를 통해 ALB로 라우팅
//   - /api/v1/users/*, /api/v1/products/*, /api/v1/orders/* → General Service (8080)
//   - /api/v1/coupons/* → Coupon Service (8081)

// General Service 클라이언트 (User + Product + Order 통합)
export const generalServiceClient = createServiceClient(getServiceUrl(import.meta.env.VITE_GENERAL_SERVICE_URL))

// Coupon Service 클라이언트 (독립 서비스)
export const couponServiceClient = createServiceClient(getServiceUrl(import.meta.env.VITE_COUPON_SERVICE_URL))

// 각 도메인별 클라이언트 (하위 호환성 유지)
export const userServiceClient = createServiceClient(getServiceUrl(import.meta.env.VITE_USER_SERVICE_URL))
export const productServiceClient = createServiceClient(getServiceUrl(import.meta.env.VITE_PRODUCT_SERVICE_URL))
export const orderServiceClient = createServiceClient(getServiceUrl(import.meta.env.VITE_ORDER_SERVICE_URL))

// 기본 클라이언트 (하위 호환성)
const apiClient = generalServiceClient

export default apiClient