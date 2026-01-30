import { productServiceClient } from './client'

export const productAPI = {
    // === 사용자 상품 API ===

    // 상품 목록 조회
    getProducts(params = {}, config = {}) {
        return productServiceClient.get('/api/v1/products', {
            params,
            ...config
        })
    },

    // 상품 상세 조회
    getProduct(productId) {
        return productServiceClient.get(`/api/v1/products/${productId}`)
    },

    // 상품 검색
    searchProducts(params = {}) {
        return productServiceClient.get('/api/v1/products/search', { params })
    },

    // === 관리자 상품 API ===

    // 상품 등록 (관리자)
    createProduct(productData) {
        return productServiceClient.post('/api/v1/admin/products', productData)
    },

    // 전체 상품 목록 조회 (관리자)
    getAdminProducts(params = {}) {
        return productServiceClient.get('/api/v1/admin/products', { params })
    },

    // 상품 수정 (관리자)
    updateProduct(productId, productData) {
        return productServiceClient.put(`/api/v1/admin/products/${productId}`, productData)
    },

    // 상품 삭제 (관리자)
    deleteProduct(productId) {
        return productServiceClient.delete(`/api/v1/admin/products/${productId}`)
    },

    // 상품 이미지 업로드 (관리자)
    uploadProductImage(productId, imageFile) {
        const formData = new FormData()
        formData.append('file', imageFile)

        return productServiceClient.post(`/api/v1/admin/products/${productId}/images`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
    }
}