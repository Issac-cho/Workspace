/**
 * API 응답 코드 상수
 */

// 공통 응답 코드
export const API_CODES = {
    // 성공
    SUCCESS: 'C0000',

    // 공통 에러
    BAD_REQUEST: 'C0001',
    AUTH_FAILED: 'C0002',
    FORBIDDEN: 'C0003',
    NOT_FOUND: 'C0004',
    INTERNAL_ERROR: 'C0005',
    DATABASE_ERROR: 'C0006',

    // 사용자 서비스 에러
    USER: {
        DUPLICATE_LOGIN_ID: 'L0001',
        INVALID_LOGIN: 'L0002',
        USER_NOT_FOUND: 'L0003'
    },

    // 상품 서비스 에러
    PRODUCT: {
        NOT_FOUND: 'P0001',
        ALREADY_DELETED: 'P0002',
        IMAGE_UPLOAD_FAILED: 'P0003'
    },

    // 쿠폰 서비스 에러
    COUPON: {
        TEMPLATE_NOT_FOUND: 'CP0001',
        ALREADY_ISSUED: 'CP0002',
        NOT_ISSUE_PERIOD: 'CP0003',
        COUPON_NOT_FOUND: 'CP0004',
        ALREADY_USED: 'CP0005',
        CANNOT_USE: 'CP0006',
        ALREADY_RECEIVED: 'CP1004',
        CANNOT_DELETE_ISSUED: 'CP1008',
        SOLD_OUT: 'CP1009'
    },

    // 주문 서비스 에러
    ORDER: {
        NOT_FOUND: 'O0001',
        ALREADY_CANCELLED: 'O0002',
        CANNOT_CANCEL: 'O0003',
        PAYMENT_FAILED: 'O0004'
    }
}

// 응답 코드 체크 헬퍼 함수들
export const isSuccess = (code) => code === API_CODES.SUCCESS
export const isAuthError = (code) => code === API_CODES.AUTH_FAILED
export const isTokenRefreshNeeded = (code) => code === API_CODES.AUTH_FAILED

// 에러 메시지 매핑 (기본 메시지, 서버에서 오는 메시지가 우선)
export const ERROR_MESSAGES = {
    [API_CODES.BAD_REQUEST]: '잘못된 요청입니다.',
    [API_CODES.AUTH_FAILED]: '인증에 실패했습니다.',
    [API_CODES.FORBIDDEN]: '접근 권한이 없습니다.',
    [API_CODES.NOT_FOUND]: '요청한 리소스를 찾을 수 없습니다.',
    [API_CODES.INTERNAL_ERROR]: '서버 내부 오류가 발생했습니다.',
    [API_CODES.DATABASE_ERROR]: '데이터베이스 오류가 발생했습니다.',

    // 사용자 서비스
    [API_CODES.USER.DUPLICATE_LOGIN_ID]: '이미 사용 중인 로그인 아이디입니다.',
    [API_CODES.USER.INVALID_LOGIN]: '로그인 정보가 올바르지 않습니다.',
    [API_CODES.USER.USER_NOT_FOUND]: '사용자를 찾을 수 없습니다.',

    // 상품 서비스
    [API_CODES.PRODUCT.NOT_FOUND]: '상품을 찾을 수 없습니다.',
    [API_CODES.PRODUCT.ALREADY_DELETED]: '이미 삭제된 상품입니다.',
    [API_CODES.PRODUCT.IMAGE_UPLOAD_FAILED]: '상품 이미지 업로드에 실패했습니다.',

    // 쿠폰 서비스
    [API_CODES.COUPON.TEMPLATE_NOT_FOUND]: '쿠폰 템플릿을 찾을 수 없습니다.',
    [API_CODES.COUPON.ALREADY_ISSUED]: '이미 발급된 쿠폰입니다.',
    [API_CODES.COUPON.NOT_ISSUE_PERIOD]: '쿠폰 발급 기간이 아닙니다.',
    [API_CODES.COUPON.COUPON_NOT_FOUND]: '쿠폰을 찾을 수 없습니다.',
    [API_CODES.COUPON.ALREADY_USED]: '이미 사용된 쿠폰입니다.',
    [API_CODES.COUPON.CANNOT_USE]: '사용할 수 없는 쿠폰입니다.',
    [API_CODES.COUPON.ALREADY_RECEIVED]: '이미 발급받은 쿠폰입니다.',
    [API_CODES.COUPON.CANNOT_DELETE_ISSUED]: '발급된 쿠폰이 있어 삭제할 수 없습니다.',
    [API_CODES.COUPON.SOLD_OUT]: '쿠폰이 모두 소진되었습니다.',

    // 주문 서비스
    [API_CODES.ORDER.NOT_FOUND]: '주문을 찾을 수 없습니다.',
    [API_CODES.ORDER.ALREADY_CANCELLED]: '이미 취소된 주문입니다.',
    [API_CODES.ORDER.CANNOT_CANCEL]: '취소할 수 없는 주문 상태입니다.',
    [API_CODES.ORDER.PAYMENT_FAILED]: '결제 처리에 실패했습니다.'
}

// 에러 메시지 가져오기
export const getErrorMessage = (code, serverMessage = null) => {
    // 서버에서 온 메시지가 있으면 우선 사용
    if (serverMessage) {
        return serverMessage
    }

    // 매핑된 메시지 사용
    return ERROR_MESSAGES[code] || '알 수 없는 오류가 발생했습니다.'
}