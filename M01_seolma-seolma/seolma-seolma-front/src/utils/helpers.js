/**
 * 공통 헬퍼 함수들
 */

/**
 * 숫자를 천 단위 콤마로 포맷팅
 * @param {Number} number 숫자
 * @returns {String} 포맷된 문자열
 */
export function formatNumber(number) {
    if (number === null || number === undefined) return '0'
    return Number(number).toLocaleString()
}

/**
 * 날짜 포맷팅
 * @param {String|Date} date 날짜
 * @param {String} format 포맷 (YYYY-MM-DD, YYYY.MM.DD, MM/DD/YYYY 등)
 * @returns {String} 포맷된 날짜
 */
export function formatDate(date, format = 'YYYY-MM-DD') {
    if (!date) return ''

    const d = new Date(date)
    if (isNaN(d.getTime())) return ''

    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')

    return format
        .replace('YYYY', year)
        .replace('MM', month)
        .replace('DD', day)
}

/**
 * 상대 시간 표시 (몇 분 전, 몇 시간 전 등)
 * @param {String|Date} date 날짜
 * @returns {String} 상대 시간
 */
export function timeAgo(date) {
    if (!date) return ''

    const now = new Date()
    const target = new Date(date)
    const diff = now - target

    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days}일 전`
    if (hours > 0) return `${hours}시간 전`
    if (minutes > 0) return `${minutes}분 전`
    return '방금 전'
}
/**
 * 문자열 자르기 (말줄임표 추가)
 * @param {String} text 텍스트
 * @param {Number} length 최대 길이
 * @returns {String} 자른 텍스트
 */
export function truncateText(text, length = 50) {
    if (!text) return ''
    if (text.length <= length) return text
    return text.substring(0, length) + '...'
}

/**
 * 파일 크기 포맷팅
 * @param {Number} bytes 바이트 크기
 * @returns {String} 포맷된 크기
 */
export function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes'

    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * 이메일 유효성 검사
 * @param {String} email 이메일
 * @returns {Boolean} 유효 여부
 */
export function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
}

/**
 * 전화번호 포맷팅 (010-1234-5678)
 * @param {String} phone 전화번호
 * @returns {String} 포맷된 전화번호
 */
export function formatPhone(phone) {
    if (!phone) return ''

    const cleaned = phone.replace(/\D/g, '')
    const match = cleaned.match(/^(\d{3})(\d{4})(\d{4})$/)

    if (match) {
        return `${match[1]}-${match[2]}-${match[3]}`
    }

    return phone
}

/**
 * 객체 깊은 복사
 * @param {Object} obj 복사할 객체
 * @returns {Object} 복사된 객체
 */
export function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj
    if (obj instanceof Date) return new Date(obj.getTime())
    if (obj instanceof Array) return obj.map(item => deepClone(item))

    const cloned = {}
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            cloned[key] = deepClone(obj[key])
        }
    }

    return cloned
}

/**
 * 디바운스 함수
 * @param {Function} func 실행할 함수
 * @param {Number} delay 지연 시간 (ms)
 * @returns {Function} 디바운스된 함수
 */
export function debounce(func, delay) {
    let timeoutId
    return function (...args) {
        clearTimeout(timeoutId)
        timeoutId = setTimeout(() => func.apply(this, args), delay)
    }
}

/**
 * 쓰로틀 함수
 * @param {Function} func 실행할 함수
 * @param {Number} limit 제한 시간 (ms)
 * @returns {Function} 쓰로틀된 함수
 */
export function throttle(func, limit) {
    let inThrottle
    return function (...args) {
        if (!inThrottle) {
            func.apply(this, args)
            inThrottle = true
            setTimeout(() => inThrottle = false, limit)
        }
    }
}

/**
 * 로컬 스토리지 헬퍼
 */
export const storage = {
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value))
        } catch (error) {
            console.error('localStorage 저장 실패:', error)
        }
    },

    get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key)
            return item ? JSON.parse(item) : defaultValue
        } catch (error) {
            console.error('localStorage 읽기 실패:', error)
            return defaultValue
        }
    },

    remove(key) {
        try {
            localStorage.removeItem(key)
        } catch (error) {
            console.error('localStorage 삭제 실패:', error)
        }
    },

    clear() {
        try {
            localStorage.clear()
        } catch (error) {
            console.error('localStorage 초기화 실패:', error)
        }
    }
}

/**
 * URL 쿼리 파라미터 파싱
 * @param {String} url URL (기본값: 현재 URL)
 * @returns {Object} 쿼리 파라미터 객체
 */
export function parseQuery(url = window.location.search) {
    const params = new URLSearchParams(url)
    const result = {}

    for (const [key, value] of params) {
        result[key] = value
    }

    return result
}

/**
 * 객체를 쿼리 스트링으로 변환
 * @param {Object} obj 객체
 * @returns {String} 쿼리 스트링
 */
export function objectToQuery(obj) {
    return new URLSearchParams(obj).toString()
}
/**
 * 이미지 경로 헬퍼 함수들
 */

// 아이콘 이미지 경로 생성
export function getIconPath(iconName) {
    return new URL(`../assets/images/icons/${iconName}`, import.meta.url).href
}

// 배너 이미지 경로 생성
export function getBannerPath(bannerName) {
    return new URL(`../assets/images/banners/${bannerName}`, import.meta.url).href
}

// 상품 이미지 경로 생성
export function getProductImagePath(imageName) {
    return new URL(`../assets/images/products/${imageName}`, import.meta.url).href
}

// 공통 이미지 경로 생성
export function getCommonImagePath(imageName) {
    return new URL(`../assets/images/common/${imageName}`, import.meta.url).href
}

// 기본 상품 이미지 (이미지가 없을 때 사용)
export function getDefaultProductImage() {
    return getCommonImagePath('default-product.png')
}