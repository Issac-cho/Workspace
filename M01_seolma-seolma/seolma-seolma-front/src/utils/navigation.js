import router from '@/router'
import { useAuthStore } from '@/store/auth'
import { useModalStore } from '@/store/modal'

/**
 * 화면 이동
 * @description 라우터의 path 속성 기반으로 동작한다.
 * @param {String} path 이동할 화면의 경로
 * @param {RouteLocationRaw} options 라우트 옵션
 * @see RouteLocationRaw https://router.vuejs.org/api/#routelocationraw
 */
export function goPage(path, options = {}) {
    try {
        if (options.params) {
            // 동적 라우트 파라미터 처리
            setParams(path, options.params)
        }

        return router.push({
            path,
            ...options
        })
    } catch (error) {
        console.error('페이지 이동 실패:', error)
        const modalStore = useModalStore()
        modalStore.showError('페이지 이동 중 오류가 발생했습니다.')
    }
}

/**
 * 뒤로가기
 * @param {Number} delta 뒤로 갈 단계 수 (기본값: -1)
 */
export function goBack(delta = -1) {
    try {
        router.go(delta)
    } catch (error) {
        // 히스토리가 없는 경우 홈으로 이동
        goPage('/')
    }
}

/**
 * 새 탭에서 페이지 열기
 * @param {String} path 이동할 화면의 경로
 * @param {Object} options 옵션
 */
export function openNewTab(path, options = {}) {
    const { query = {}, params = {} } = options

    // 쿼리 파라미터 구성
    const queryString = new URLSearchParams(query).toString()
    const fullPath = queryString ? `${path}?${queryString}` : path

    window.open(fullPath, '_blank')
}

/**
 * 외부 URL로 이동
 * @param {String} url 외부 URL
 * @param {Boolean} newTab 새 탭에서 열지 여부 (기본값: true)
 */
export function goExternal(url, newTab = true) {
    if (newTab) {
        window.open(url, '_blank')
    } else {
        window.location.href = url
    }
}

/**
 * 인증이 필요한 페이지로 이동
 * @param {String} path 이동할 화면의 경로
 * @param {RouteLocationRaw} options 라우트 옵션
 */
export function goAuthPage(path, options = {}) {
    const authStore = useAuthStore()

    if (!authStore.isAuthenticated) {
        // 로그인 후 원래 페이지로 돌아가기 위해 redirect 파라미터 설정
        goPage('/login', {
            query: {
                redirect: encodeURIComponent(path)
            }
        })
        return false
    }

    return goPage(path, options)
}

/**
 * 관리자 권한이 필요한 페이지로 이동
 * @param {String} path 이동할 화면의 경로
 * @param {RouteLocationRaw} options 라우트 옵션
 */
export function goAdminPage(path, options = {}) {
    const authStore = useAuthStore()
    const modalStore = useModalStore()

    if (!authStore.isAuthenticated) {
        goPage('/login', {
            query: {
                redirect: encodeURIComponent(path)
            }
        })
        return false
    }

    if (!authStore.isAdmin) {
        modalStore.showError('관리자 권한이 필요합니다.')
        return false
    }

    return goPage(path, options)
}

/**
 * 확인 후 페이지 이동
 * @param {String} message 확인 메시지
 * @param {String} path 이동할 화면의 경로
 * @param {RouteLocationRaw} options 라우트 옵션
 */
export async function goPageWithConfirm(message, path, options = {}) {
    const modalStore = useModalStore()

    const confirmed = await new Promise((resolve) => {
        modalStore.showConfirm(
            message,
            '확인',
            () => resolve(true),
            () => resolve(false)
        )
    })

    if (confirmed) {
        return goPage(path, options)
    }

    return false
}

/**
 * 동적 라우트 파라미터 설정
 * @param {String} path 경로
 * @param {Object} params 파라미터 객체
 */
function setParams(path, params) {
    // 동적 라우트 파라미터 처리 로직
    // 예: /user/:id -> /user/123
    Object.keys(params).forEach(key => {
        path = path.replace(`:${key}`, params[key])
    })
    return path
}

/**
 * 현재 경로 정보 가져오기
 */
export function getCurrentRoute() {
    return router.currentRoute.value
}

/**
 * 쿼리 파라미터 가져오기
 * @param {String} key 쿼리 키
 * @param {*} defaultValue 기본값
 */
export function getQuery(key, defaultValue = null) {
    const route = getCurrentRoute()
    return route.query[key] || defaultValue
}

/**
 * 라우트 파라미터 가져오기
 * @param {String} key 파라미터 키
 * @param {*} defaultValue 기본값
 */
export function getParam(key, defaultValue = null) {
    const route = getCurrentRoute()
    return route.params[key] || defaultValue
}

/**
 * 페이지 새로고침
 */
export function refreshPage() {
    window.location.reload()
}

/**
 * 에러 페이지로 이동
 * @param {String} code 에러 코드 (404, 403, 500 등)
 * @param {String} message 에러 메시지
 */
export function goErrorPage(code, message = null) {
    const query = { code }
    if (message) {
        query.message = message
    }

    return goPage('/error', { query })
}

/**
 * 브라우저 히스토리 체크
 */
export function canGoBack() {
    return window.history.length > 1
}

// 상수 정의 - 자주 사용하는 경로들
export const ROUTES = {
    HOME: '/',
    LOGIN: '/login',
    REGISTER: '/register',
    PROFILE: '/profile',
    PRODUCTS: '/products',
    ORDERS: '/orders',
    COUPONS: '/coupons',
    ADMIN: '/admin',
    // 에러 페이지
    ERROR: '/error'
}

// 편의 함수들
export const navigation = {
    home: () => goPage(ROUTES.HOME),
    login: () => goPage(ROUTES.LOGIN),
    register: () => goPage(ROUTES.REGISTER),
    profile: () => goAuthPage(ROUTES.PROFILE),
    products: () => goPage(ROUTES.PRODUCTS),
    orders: () => goAuthPage(ROUTES.ORDERS),
    coupons: () => goAuthPage(ROUTES.COUPONS),
    admin: () => goAdminPage(ROUTES.ADMIN)
}