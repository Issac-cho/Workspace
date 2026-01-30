import { ref, watch, onMounted } from 'vue'
import { usePagination } from './usePagination'
import { useApi } from './useApi'

/**
 * 목록 조회 Composable
 * @param {Function} fetchFunction API 호출 함수
 * @param {Object} options 옵션
 * @param {Number} options.defaultSize 기본 페이지 크기
 * @param {Boolean} options.autoLoad 자동 로드 여부 (기본값: true)
 * @param {Boolean} options.useQuery URL 쿼리 사용 여부 (기본값: true)
 * @returns {Object} 목록 관련 상태와 메서드들
 */
export function useList(fetchFunction, options = {}) {
    const {
        defaultSize = 20,
        autoLoad = true,
        useQuery = true
    } = options

    // 페이지네이션 상태
    const pagination = usePagination({ defaultSize, useQuery })

    // API 호출 상태
    const { execute, loading } = useApi()

    // 목록 데이터
    const items = ref([])

    // 검색/필터 상태
    const filters = ref({})

    // 데이터 로드
    const loadData = async (additionalParams = {}) => {
        const params = {
            ...pagination.getParams(),
            ...filters.value,
            ...additionalParams
        }

        const result = await execute(
            () => fetchFunction(params, { skipErrorModal: true }), // API 호출에 직접 전달
            {
                showErrorModal: false, // 에러 모달 비활성화
                onError: (error) => {
                    console.error('데이터 로드 실패:', error)
                }
            }
        )

        if (result.success) {
            items.value = result.data.content || []
            pagination.setPageData(result.data)
        } else {
            // 에러 발생 시 빈 배열로 설정
            items.value = []
        }

        return result
    }

    // 새로고침
    const refresh = () => loadData()

    // 검색/필터 적용
    const applyFilters = (newFilters = {}) => {
        filters.value = { ...newFilters }
        pagination.currentPage.value = 0
        return loadData()
    }

    // 필터 초기화
    const clearFilters = () => {
        filters.value = {}
        pagination.currentPage.value = 0
        return loadData()
    }

    // 페이지 변경 시 데이터 로드
    watch(
        [() => pagination.currentPage.value, () => pagination.pageSize.value],
        () => loadData()
    )

    // 자동 로드
    if (autoLoad) {
        onMounted(() => loadData())
    }

    return {
        // 페이지네이션 상태
        ...pagination,

        // 목록 데이터
        items,
        loading,

        // 검색/필터 상태
        filters,

        // 메서드
        loadData,
        refresh,
        applyFilters,
        clearFilters
    }
}