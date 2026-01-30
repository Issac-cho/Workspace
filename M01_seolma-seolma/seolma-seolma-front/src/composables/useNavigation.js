import {
    goPage,
    goBack,
    openNewTab,
    goExternal,
    goAuthPage,
    goAdminPage,
    goPageWithConfirm,
    goErrorPage,
    getCurrentRoute,
    getQuery,
    getParam,
    refreshPage,
    canGoBack,
    ROUTES,
    navigation
} from '@/utils/navigation'

/**
 * 네비게이션 관련 Composable
 * @returns {Object} 네비게이션 함수들
 */
export function useNavigation() {
    return {
        // 기본 네비게이션
        goPage,
        goBack,
        openNewTab,
        goExternal,

        // 권한 기반 네비게이션
        goAuthPage,
        goAdminPage,
        goPageWithConfirm,

        // 에러 페이지
        goErrorPage,

        // 라우트 정보
        getCurrentRoute,
        getQuery,
        getParam,

        // 유틸리티
        refreshPage,
        canGoBack,

        // 상수 및 편의 함수
        ROUTES,
        navigation
    }
}