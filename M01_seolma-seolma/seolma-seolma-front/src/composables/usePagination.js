import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

/**
 * 페이지네이션 Composable
 * @param {Object} options 옵션
 * @param {Number} options.defaultSize 기본 페이지 크기 (기본값: 20)
 * @param {Boolean} options.useQuery URL 쿼리 파라미터 사용 여부 (기본값: true)
 * @returns {Object} 페이지네이션 관련 상태와 메서드들
 */
export function usePagination(options = {}) {
    const {
        defaultSize = 20,
        useQuery = true
    } = options

    const route = useRoute()
    const router = useRouter()

    // 페이지네이션 상태
    const currentPage = ref(0)
    const pageSize = ref(defaultSize)
    const totalElements = ref(0)
    const totalPages = ref(0)

    // URL 쿼리에서 초기값 설정
    if (useQuery) {
        currentPage.value = parseInt(route.query.page) || 0
        pageSize.value = parseInt(route.query.size) || defaultSize
    }

    // 계산된 속성들
    const hasNext = computed(() => currentPage.value < totalPages.value - 1)
    const hasPrev = computed(() => currentPage.value > 0)

    // API 요청용 파라미터 생성
    const getParams = (additionalParams = {}) => {
        return {
            page: currentPage.value,
            size: pageSize.value,
            ...additionalParams
        }
    }

    // 페이지 이동
    const goToPage = (page) => {
        if (page < 0 || page >= totalPages.value) return

        currentPage.value = page

        if (useQuery) {
            updateQuery()
        }
    }

    // 다음/이전 페이지
    const nextPage = () => hasNext.value && goToPage(currentPage.value + 1)
    const prevPage = () => hasPrev.value && goToPage(currentPage.value - 1)

    // 페이지 크기 변경
    const changePageSize = (newSize) => {
        pageSize.value = newSize
        currentPage.value = 0

        if (useQuery) {
            updateQuery()
        }
    }

    // URL 쿼리 업데이트
    const updateQuery = () => {
        const query = { ...route.query }

        if (currentPage.value > 0) {
            query.page = currentPage.value.toString()
        } else {
            delete query.page
        }

        if (pageSize.value !== defaultSize) {
            query.size = pageSize.value.toString()
        } else {
            delete query.size
        }

        router.replace({ query })
    }

    // API 응답 데이터 설정
    const setPageData = (responseData) => {
        if (!responseData) return

        totalElements.value = responseData.totalElements || 0
        totalPages.value = responseData.totalPages || 0

        // 현재 페이지가 총 페이지를 초과하는 경우 마지막 페이지로 이동
        if (currentPage.value >= totalPages.value && totalPages.value > 0) {
            goToPage(totalPages.value - 1)
        }
    }

    // 초기화
    const reset = () => {
        currentPage.value = 0
        pageSize.value = defaultSize
        totalElements.value = 0
        totalPages.value = 0

        if (useQuery) {
            updateQuery()
        }
    }

    // URL 쿼리 변경 감지 (뒤로가기/앞으로가기 대응)
    if (useQuery) {
        watch(
            () => route.query,
            (newQuery) => {
                const newPage = parseInt(newQuery.page) || 0
                const newSize = parseInt(newQuery.size) || defaultSize

                if (newPage !== currentPage.value || newSize !== pageSize.value) {
                    currentPage.value = newPage
                    pageSize.value = newSize
                }
            },
            { deep: true }
        )
    }

    return {
        // 상태
        currentPage,
        pageSize,
        totalElements,
        totalPages,

        // 계산된 속성
        hasNext,
        hasPrev,

        // 메서드
        getParams,
        goToPage,
        nextPage,
        prevPage,
        changePageSize,
        setPageData,
        reset
    }
}