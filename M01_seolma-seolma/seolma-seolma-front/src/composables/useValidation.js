import { reactive, computed } from 'vue'
import * as validators from '@/utils/validation'

/**
 * 폼 유효성 검사 Composable
 * @param {Object} initialForm 초기 폼 데이터
 * @param {Object} rules 유효성 검사 규칙
 * @returns {Object} 폼 관련 상태와 메서드들
 */
export function useValidation(initialForm = {}, rules = {}) {
    // 폼 데이터
    const form = reactive({ ...initialForm })

    // 에러 상태
    const errors = reactive({})

    // 터치된 필드 (사용자가 입력한 적이 있는 필드)
    const touched = reactive({})

    // 전체 폼 유효성 여부
    const isValid = computed(() => {
        return Object.keys(errors).length === 0
    })

    // 특정 필드 유효성 검사
    const validateField = (field) => {
        const fieldRules = rules[field]
        if (!fieldRules) return

        const error = validators.validate(form[field], fieldRules)

        if (error) {
            errors[field] = error
        } else {
            delete errors[field]
        }
    }

    // 전체 폼 유효성 검사
    const validateForm = () => {
        const formErrors = validators.validateForm(form, rules)

        // 기존 에러 초기화
        Object.keys(errors).forEach(key => {
            delete errors[key]
        })

        // 새 에러 설정
        Object.keys(formErrors).forEach(key => {
            errors[key] = formErrors[key]
        })

        return validators.isFormValid(formErrors)
    }

    // 필드 터치 처리
    const touchField = (field) => {
        touched[field] = true
    }

    // 특정 필드 에러 초기화
    const clearFieldError = (field) => {
        delete errors[field]
    }

    // 모든 에러 초기화
    const clearErrors = () => {
        Object.keys(errors).forEach(key => {
            delete errors[key]
        })
    }

    // 폼 초기화
    const resetForm = () => {
        Object.keys(form).forEach(key => {
            form[key] = initialForm[key] || ''
        })
        clearErrors()
        Object.keys(touched).forEach(key => {
            delete touched[key]
        })
    }

    // 필드별 에러 메시지 가져오기
    const getFieldError = (field) => {
        return touched[field] ? errors[field] : null
    }

    // 필드 입력 핸들러 (터치 + 유효성 검사)
    const handleFieldInput = (field, value) => {
        form[field] = value
        touchField(field)
        validateField(field)
    }

    // 필드 블러 핸들러
    const handleFieldBlur = (field) => {
        touchField(field)
        validateField(field)
    }

    return {
        // 상태
        form,
        errors,
        touched,
        isValid,

        // 메서드
        validateField,
        validateForm,
        touchField,
        clearFieldError,
        clearErrors,
        resetForm,
        getFieldError,
        handleFieldInput,
        handleFieldBlur,

        // 유효성 검사 함수들 (직접 사용 가능)
        validators
    }
}