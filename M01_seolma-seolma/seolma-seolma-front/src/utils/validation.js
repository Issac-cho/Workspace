/**
 * 유효성 검사 헬퍼 함수들
 */

/**
 * 필수 입력 검사
 * @param {*} value 값
 * @param {String} message 에러 메시지
 * @returns {String|null} 에러 메시지 또는 null
 */
export function required(value, message = '필수 입력 항목입니다.') {
    if (value === null || value === undefined || value === '') {
        return message
    }
    if (typeof value === 'string' && value.trim() === '') {
        return message
    }
    return null
}

/**
 * 최소 길이 검사
 * @param {String} value 값
 * @param {Number} min 최소 길이
 * @param {String} message 에러 메시지
 * @returns {String|null} 에러 메시지 또는 null
 */
export function minLength(value, min, message) {
    if (!value) return null
    if (value.length < min) {
        return message || `최소 ${min}자 이상 입력해주세요.`
    }
    return null
}

/**
 * 최대 길이 검사
 * @param {String} value 값
 * @param {Number} max 최대 길이
 * @param {String} message 에러 메시지
 * @returns {String|null} 에러 메시지 또는 null
 */
export function maxLength(value, max, message) {
    if (!value) return null
    if (value.length > max) {
        return message || `최대 ${max}자까지 입력 가능합니다.`
    }
    return null
}

/**
 * 이메일 형식 검사
 * @param {String} value 이메일
 * @param {String} message 에러 메시지
 * @returns {String|null} 에러 메시지 또는 null
 */
export function email(value, message = '올바른 이메일 형식이 아닙니다.') {
    if (!value) return null
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(value) ? null : message
}

/**
 * 로그인 아이디 형식 검사 (3-50자, 영문/숫자/언더스코어만)
 * @param {String} value 로그인 아이디
 * @param {String} message 에러 메시지
 * @returns {String|null} 에러 메시지 또는 null
 */
export function loginId(value, message = '로그인 아이디는 3-50자의 영문, 숫자, 언더스코어만 사용 가능합니다.') {
    if (!value) return null

    // 길이 검사 (3-50자)
    if (value.length < 3 || value.length > 50) {
        return '로그인 아이디는 3-50자여야 합니다.'
    }

    // 형식 검사 (영문, 숫자, 언더스코어만)
    const loginIdRegex = /^[a-zA-Z0-9_]+$/
    return loginIdRegex.test(value) ? null : message
}

/**
 * 비밀번호 형식 검사 (8-100자, 대소문자/숫자/특수문자 각각 하나 이상)
 * @param {String} value 비밀번호
 * @param {String} message 에러 메시지
 * @returns {String|null} 에러 메시지 또는 null
 */
export function password(value, message = '비밀번호는 8-100자이며 대소문자, 숫자, 특수문자를 각각 하나 이상 포함해야 합니다.') {
    if (!value) return null

    // 길이 검사 (8-100자)
    if (value.length < 8 || value.length > 100) {
        return '비밀번호는 8-100자여야 합니다.'
    }

    const hasLower = /[a-z]/.test(value)
    const hasUpper = /[A-Z]/.test(value)
    const hasNumber = /\d/.test(value)
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(value)

    if (hasLower && hasUpper && hasNumber && hasSpecial) {
        return null
    }

    return message
}

/**
 * 사용자 이름 형식 검사 (2-50자)
 * @param {String} value 사용자 이름
 * @param {String} message 에러 메시지
 * @returns {String|null} 에러 메시지 또는 null
 */
export function userName(value, message = '사용자 이름은 2-50자여야 합니다.') {
    if (!value) return null

    // 길이 검사 (2-50자)
    if (value.trim().length < 2 || value.trim().length > 50) {
        return message
    }

    return null
}

/**
 * 역할(권한) 검사
 * @param {String} value 역할
 * @param {String} message 에러 메시지
 * @returns {String|null} 에러 메시지 또는 null
 */
export function role(value, message = '올바른 역할을 선택해주세요.') {
    if (!value) return null

    const validRoles = ['USER', 'ADMIN']
    return validRoles.includes(value) ? null : message
}

/**
 * 전화번호 형식 검사
 * @param {String} value 전화번호
 * @param {String} message 에러 메시지
 * @returns {String|null} 에러 메시지 또는 null
 */
export function phone(value, message = '올바른 전화번호 형식이 아닙니다.') {
    if (!value) return null
    const phoneRegex = /^01[0-9]-?[0-9]{4}-?[0-9]{4}$/
    return phoneRegex.test(value.replace(/-/g, '')) ? null : message
}

/**
 * 숫자 범위 검사
 * @param {Number} value 값
 * @param {Number} min 최소값
 * @param {Number} max 최대값
 * @param {String} message 에러 메시지
 * @returns {String|null} 에러 메시지 또는 null
 */
export function numberRange(value, min, max, message) {
    if (value === null || value === undefined || value === '') return null

    const num = Number(value)
    if (isNaN(num)) {
        return '숫자를 입력해주세요.'
    }

    if (num < min || num > max) {
        return message || `${min}~${max} 범위의 숫자를 입력해주세요.`
    }

    return null
}

/**
 * 날짜 형식 검사
 * @param {String} value 날짜
 * @param {String} message 에러 메시지
 * @returns {String|null} 에러 메시지 또는 null
 */
export function dateFormat(value, message = '올바른 날짜 형식이 아닙니다.') {
    if (!value) return null

    const date = new Date(value)
    if (isNaN(date.getTime())) {
        return message
    }

    return null
}

/**
 * 복합 유효성 검사 실행
 * @param {*} value 검사할 값
 * @param {Array} rules 검사 규칙 배열
 * @returns {String|null} 첫 번째 에러 메시지 또는 null
 */
export function validate(value, rules) {
    for (const rule of rules) {
        const error = rule(value)
        if (error) {
            return error
        }
    }
    return null
}

/**
 * 폼 전체 유효성 검사
 * @param {Object} form 폼 데이터
 * @param {Object} rules 필드별 검사 규칙
 * @returns {Object} 필드별 에러 메시지 객체
 */
export function validateForm(form, rules) {
    const errors = {}

    Object.keys(rules).forEach(field => {
        const fieldRules = rules[field]
        const fieldValue = form[field]

        const error = validate(fieldValue, fieldRules)
        if (error) {
            errors[field] = error
        }
    })

    return errors
}

/**
 * 폼 유효성 검사 결과 확인
 * @param {Object} errors 에러 객체
 * @returns {Boolean} 유효 여부
 */
export function isFormValid(errors) {
    return Object.keys(errors).length === 0
}