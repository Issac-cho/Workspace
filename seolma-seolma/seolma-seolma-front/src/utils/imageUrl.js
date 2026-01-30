/**
 * 이미지 URL을 현재 환경에 맞게 변환
 * @param {string} imageUrl - 백엔드에서 받은 이미지 URL
 * @returns {string} - 변환된 이미지 URL
 */
export const transformImageUrl = (imageUrl) => {
    if (!imageUrl) return ''
    
    const useProxy = import.meta.env.VITE_USE_PROXY === 'true'
    
    if (useProxy) {
        // 프록시 사용시: localhost:8080을 제거하여 상대 경로로 변환
        // 예: "http://localhost:8080/images/products/image.png" → "/images/products/image.png"
        // 브라우저에서 현재 도메인 기준으로 요청하게 됨
        return imageUrl.replace('http://localhost:8080', '')
    } else {
        // 개발환경: 그대로 사용 (직접 백엔드 연결)
        return imageUrl
    }
}

/**
 * 제품 이미지 URL 변환 (특화 함수)
 * @param {string} imageUrl - 제품 이미지 URL
 * @returns {string} - 변환된 URL
 */
export const getProductImageUrl = (imageUrl) => {
    return transformImageUrl(imageUrl)
}