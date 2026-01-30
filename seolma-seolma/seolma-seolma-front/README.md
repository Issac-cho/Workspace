# 설마설마 E-Commerce Frontend

Vue3 기반 이커머스 프론트엔드 애플리케이션입니다. MSA(Microservices Architecture) 환경에서 구동되며, 사용자와 관리자 기능을 모두 제공합니다.

## 🚀 주요 기능

### 사용자 기능
- **회원 인증**: JWT 기반 로그인/회원가입 (자동 토큰 갱신)
- **상품 조회**: 상품 목록 조회 및 검색
- **주문 관리**: 상품 직접 주문 및 주문 내역 조회
- **쿠폰 시스템**: 쿠폰 발급 및 사용 (선착순 쿠폰 지원)

### 관리자 기능
- **상품 관리**: 상품 등록, 조회, 삭제 (이미지 업로드 지원)
- **주문 관리**: 전체 주문 조회 및 상태 변경
- **쿠폰 관리**: 쿠폰 템플릿 등록, 조회, 수정, 삭제 (퍼센트/고정금액 할인, 선착순 지원)

## 🏗️ 아키텍처 개요

### 서비스 구성 (MSA)

#### 개발 환경
- **General Service** (포트 8080): User + Product + Order 통합
- **Coupon Service** (포트 8081): 쿠폰 발급, 관리

#### 운영 환경
- **EC2-1** (10.0.1.10:8081): Coupon Service
- **EC2-2** (10.0.1.20:8080): General Service
- **ALB**: 경로 기반 라우팅
  - `/api/v1/coupons/*` → Coupon Service
  - 나머지 → General Service

### 인증 방식
- **AccessToken**: JWT Bearer Token (Header 주입)
- **RefreshToken**: HttpOnly Cookie
- **자동 갱신**: 401 에러 시 자동 토큰 갱신 및 재시도

## 📁 프로젝트 구조

```
src/
├── api/                    # API 모듈 (MSA 서비스별)
│   ├── client.js          # Axios 클라이언트 설정
│   ├── interceptors.js    # 요청/응답 인터셉터
│   ├── auth.js           # 인증 API
│   ├── product.js        # 상품 API
│   ├── coupon.js         # 쿠폰 API
│   └── order.js          # 주문 API
├── components/           # 컴포넌트
│   ├── common/           # 공통 컴포넌트
│   │   ├── BaseButton.vue
│   │   ├── BaseInput.vue
│   │   ├── CommonModal.vue
│   │   └── modals/
│   ├── layout/           # 레이아웃 컴포넌트
│   └── main/             # 메인 페이지 컴포넌트
│       ├── MainNavigation.vue
│       ├── HeroBanner.vue
│       ├── ProductGrid.vue
│       └── ProductCard.vue
├── views/                # 페이지 컴포넌트
│   ├── Home.vue          # 메인 페이지 (상품 목록)
│   ├── Login.vue         # 로그인
│   ├── Register.vue      # 회원가입
│   ├── CouponPage.vue    # 쿠폰 발급
│   ├── MyCouponPage.vue  # 내 쿠폰 조회
│   ├── OrderPage.vue     # 주문하기
│   ├── MyOrderPage.vue   # 주문 내역
│   ├── admin/            # 관리자 페이지
│   │   ├── ProductRegisterPage.vue   # 상품 등록
│   │   ├── ProductListPage.vue       # 상품 목록
│   │   ├── AdminOrderListPage.vue    # 주문 관리
│   │   ├── CouponRegisterPage.vue    # 쿠폰 등록
│   │   └── CouponTemplateListPage.vue # 쿠폰 템플릿 목록
│   └── ErrorPage.vue     # 에러 페이지
├── composables/          # 재사용 가능한 로직
│   ├── useAuth.js        # 인증 관련
│   ├── useModal.js       # 모달 관리
│   ├── useApi.js         # API 호출 헬퍼
│   ├── useList.js        # 목록/페이지네이션
│   ├── useNavigation.js  # 네비게이션 헬퍼
│   └── useValidation.js  # 유효성 검사
├── store/                # Pinia 스토어
│   ├── auth.js           # 인증 상태 (role 기반 권한)
│   └── modal.js          # 모달 상태
├── utils/                # 유틸리티
│   ├── navigation.js
│   ├── helpers.js
│   └── validation.js
├── constants/            # 상수
│   └── apiCodes.js
├── assets/               # 정적 자원
│   ├── styles/
│   │   ├── components/
│   │   └── pages/
│   │       ├── main.css
│   │       ├── coupon.css
│   │       ├── order.css
│   │       ├── order-list.css
│   │       └── admin.css
│   └── images/
├── router/               # 라우터 설정
└── main.js              # 앱 진입점
```

## 🎯 시작하기

### 설치
```bash
npm install
```

### 개발 서버 실행
```bash
npm run dev
```
개발 서버는 `http://localhost:5173`에서 실행됩니다.

### 빌드
```bash
# 프로덕션 빌드 (.env.production 사용)
npm run build

# 빌드 미리보기
npm run preview
```

## 🔧 환경 변수

### .env.development (개발 환경)
```bash
VITE_API_BASE_URL=http://localhost:8080
VITE_GENERAL_SERVICE_URL=http://localhost:8080
VITE_COUPON_SERVICE_URL=http://localhost:8081
VITE_USER_SERVICE_URL=http://localhost:8080
VITE_PRODUCT_SERVICE_URL=http://localhost:8080
VITE_ORDER_SERVICE_URL=http://localhost:8080
VITE_ENV=development
```

### .env.production (운영 환경)
```bash
VITE_API_BASE_URL=https://your-domain.com
VITE_GENERAL_SERVICE_URL=https://your-domain.com
VITE_COUPON_SERVICE_URL=https://your-domain.com
VITE_USER_SERVICE_URL=https://your-domain.com
VITE_PRODUCT_SERVICE_URL=https://your-domain.com
VITE_ORDER_SERVICE_URL=https://your-domain.com
VITE_ENV=production
```

## 📱 주요 페이지

### 사용자 페이지
- `/` - 메인 페이지 (상품 목록)
- `/login` - 로그인
- `/register` - 회원가입
- `/coupons` - 쿠폰 발급
- `/my-coupons` - 내 쿠폰 조회
- `/order` - 주문하기
- `/my-orders` - 주문 내역

### 관리자 페이지 (ADMIN 권한 필요)
- `/admin/products/register` - 상품 등록
- `/admin/products` - 상품 목록 관리
- `/admin/orders` - 주문 관리
- `/admin/coupons/register` - 쿠폰 등록
- `/admin/coupons` - 쿠폰 템플릿 목록 관리

## 🎨 주요 기능 상세

### 1. 권한 기반 UI
- 관리자 계정 로그인 시 상품 목록에서 수량 선택 및 주문 버튼 숨김
- 역할(role)에 따른 네비게이션 메뉴 자동 변경
- 관리자 전용 페이지 접근 제어

### 2. 상품 관리 (관리자)
- 상품명, 가격, 이미지 등록
- 이미지 미리보기 기능
- 상품 목록 조회 및 삭제
- 페이지네이션 지원

### 3. 주문 시스템
- 상품 카드에서 수량 선택 후 바로 주문
- 주문자 정보 입력 (이름, 연락처, 주소)
- 쿠폰 적용 (퍼센트/고정금액 할인)
- 결제 방법 선택 (신용카드/가상계좌/계좌이체)
- 실시간 금액 계산 (상품 금액 - 할인 금액)

### 4. 쿠폰 시스템

**사용자 기능**
- 쿠폰 발급 (선착순 지원)
- 내 쿠폰 조회
- 주문 시 쿠폰 적용

**관리자 기능**
- 쿠폰 템플릿 등록
  - 할인 타입: 퍼센트 할인 / 고정 금액 할인
  - 선착순 쿠폰 설정 (발급 수량 제한)
  - 날짜 제한: 시작일시는 현재 이후, 종료일시는 시작일시 이후만 선택 가능
- 쿠폰 템플릿 목록 조회
  - 상태별 표시: 진행중 / 예정 / 종료 / 소진
  - 발급 현황 표시 (선착순 쿠폰의 경우)
- 쿠폰 템플릿 수정
  - 상세 정보 조회 후 수정
  - 날짜 유효성 검사
- 쿠폰 템플릿 삭제

**날짜 처리**
```javascript
// datetime-local 입력값을 로컬 시간 기준으로 서버에 전송
// UTC 변환 없이 사용자가 입력한 시간 그대로 전송
const formatToLocalISO = (dateTimeLocal) => {
  return `${dateTimeLocal}:00`  // "2026-01-15T04:23" → "2026-01-15T04:23:00"
}
```

### 5. 주문 관리 (관리자)
- 전체 주문 내역 조회
- 주문 상태 변경
  - 결제완료 → 배송준비중 → 배송중 → 배송완료
  - 취소 처리

## 🔐 인증 시스템

### 자동 토큰 갱신
```javascript
// interceptors.js에서 자동 처리
// 401 에러 + C0002 코드 시:
// 1. RefreshToken으로 AccessToken 갱신
// 2. 원래 요청 재시도
// 3. 갱신 실패 시 로그아웃 및 로그인 페이지 이동
```

### 권한 체크
```javascript
// 각 관리자 페이지에서 자동 체크
if (!authStore.isAdmin) {
  alert('관리자만 접근할 수 있습니다.')
  router.push('/')
}
```

## 📋 API 응답 형식

### 성공 응답
```json
{
  "code": "C0000",
  "message": "성공",
  "data": { ... },
  "timestamp": "2026-01-14T10:30:00"
}
```

### 에러 응답
```json
{
  "code": "C0002",
  "message": "인증 실패",
  "data": null,
  "timestamp": "2026-01-14T10:30:00"
}
```

## 🚀 배포

### EC2 + Nginx 배포
자세한 배포 가이드는 [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)를 참조하세요.

**간단 요약:**
1. `npm run build` - 프로덕션 빌드
2. `dist/` 폴더를 EC2로 업로드
3. Nginx 설정 (Vue Router History Mode 지원)
4. Nginx 재시작

### 포트 설정
자세한 포트 구조는 [PORT_GUIDE.md](./PORT_GUIDE.md)를 참조하세요.

## 🎨 디자인 시스템

### 색상 팔레트
- **Primary**: `#5d4e37` (브라운)
- **Secondary**: `#a67c52` (라이트 브라운)
- **Accent**: `#b32d2d` (레드)
- **Background**: `#f8f6f0` (베이지)

### 주요 스타일
- 통일된 배너 디자인 (모든 페이지)
- 카드 기반 레이아웃
- 그라데이션 버튼
- 반응형 디자인 (모바일 지원)

## 🛠️ 기술 스택

- **Vue 3** - Composition API
- **Vite** - 빌드 도구
- **Vue Router** - 라우팅
- **Pinia** - 상태 관리
- **Axios** - HTTP 클라이언트
- **CSS3** - 스타일링 (순수 CSS)

## 📝 개발 가이드

### 새로운 페이지 추가
1. `src/views/`에 컴포넌트 생성
2. `src/router/index.js`에 라우트 추가
3. 필요시 CSS 파일 생성 (`src/assets/styles/pages/`)

### 새로운 API 추가
1. `src/api/`에 API 함수 정의
2. 적절한 서비스 클라이언트 사용 (generalServiceClient, couponServiceClient)

### 관리자 기능 추가
1. `src/views/admin/`에 페이지 생성
2. `authStore.isAdmin` 체크 추가
3. MainNavigation에 메뉴 추가
4. `src/router/index.js`에 라우트 추가
5. 필요시 `src/assets/styles/pages/admin.css`에 스타일 추가

## 🐛 트러블슈팅

### 이미지가 표시되지 않음
- API 응답의 `images` 배열 확인
- `imageUrl`이 상대 경로인 경우 서버 URL 추가 필요
- `getImageUrl()` 함수 사용

### 관리자 메뉴가 표시되지 않음
- 로그인 API 응답에 `role: "ADMIN"` 포함 확인
- localStorage에 user 정보 저장 확인
- `authStore.isAdmin` computed 값 확인

### 쿠폰 템플릿 수정 시 날짜가 바뀜
- `datetime-local` 입력값은 로컬 시간 기준
- `new Date().toISOString()`은 UTC로 변환하여 시간대 차이 발생
- 해결: `formatToLocalISO()` 함수 사용하여 로컬 시간 그대로 전송

### 환경 변수가 적용되지 않음
- `.env.production` 파일 확인
- 다시 빌드 (`npm run build`)
- 환경 변수는 빌드 시점에 코드에 주입됨

## 📄 라이선스

이 프로젝트는 교육 목적으로 제작되었습니다.

## 👥 기여

프로젝트 개선을 위한 제안이나 버그 리포트는 언제든 환영합니다!

## 🚀 주요 기능

- **JWT 기반 인증 시스템** (자동 토큰 갱신)
- **MSA 환경 최적화** (도메인별 API 모듈화)
- **전역 모달 시스템** (Alert, Confirm, Error, Success)
- **페이지네이션 & 검색** (URL 쿼리 동기화)
- **유효성 검사 시스템** (실시간 검증)
- **네비게이션 헬퍼** (권한 기반 라우팅)
- **쿠폰 발급 시스템** (선착순 기능 지원)
- **상품 관리 시스템** (장바구니 기능)

## 🏗️ 아키텍처 개요

### 서비스 구성 (MSA)
- **User Service** (포트 8080): 인증, 회원가입, 사용자 관리
- **Product Service** (포트 8081): 상품 조회, 관리
- **Coupon Service** (포트 8082): 쿠폰 발급, 관리
- **Order Service** (포트 8083): 주문 처리, 결제

### 인증 방식
- **AccessToken**: JWT Bearer Token (Header 주입)
- **RefreshToken**: HttpOnly Cookie
- **자동 갱신**: 401 에러 시 자동 토큰 갱신 및 재시도

## 📁 프로젝트 구조

```
src/
├── api/                    # API 모듈 (MSA 서비스별)
│   ├── client.js          # Axios 클라이언트 설정
│   ├── interceptors.js    # 요청/응답 인터셉터
│   ├── auth.js           # 사용자 서비스 API
│   ├── product.js        # 상품 서비스 API
│   ├── coupon.js         # 쿠폰 서비스 API
│   └── order.js          # 주문 서비스 API
├── components/           # 컴포넌트
│   ├── common/           # 공통 컴포넌트
│   │   ├── BaseButton.vue       # 기본 버튼
│   │   ├── BaseInput.vue        # 기본 입력
│   │   ├── CommonModal.vue      # 전역 모달
│   │   └── modals/              # 모달 컴포넌트들
│   ├── layout/           # 레이아웃 컴포넌트
│   │   ├── DefaultLayout.vue    # 기본 레이아웃
│   │   ├── AuthLayout.vue       # 인증 레이아웃
│   │   ├── TopNavigation.vue    # 상단 네비게이션
│   │   └── SideMenu.vue         # 사이드 메뉴
│   └── main/             # 메인 페이지 컴포넌트
│       ├── MainNavigation.vue   # 메인 네비게이션
│       ├── HeroBanner.vue       # 히어로 배너
│       ├── ProductGrid.vue      # 상품 그리드
│       └── ProductCard.vue      # 상품 카드
├── views/                # 페이지 컴포넌트
│   ├── Home.vue          # 메인 페이지
│   ├── Login.vue         # 로그인 페이지
│   ├── Register.vue      # 회원가입 페이지
│   ├── CouponPage.vue    # 쿠폰 발급 페이지
│   └── ErrorPage.vue     # 에러 페이지
├── composables/          # 재사용 가능한 로직
│   ├── useAuth.js        # 인증 관련
│   ├── useModal.js       # 모달 관리
│   ├── useApi.js         # API 호출 헬퍼
│   ├── useList.js        # 목록/페이지네이션
│   ├── useNavigation.js  # 네비게이션 헬퍼
│   └── useValidation.js  # 유효성 검사 헬퍼
├── store/                # Pinia 스토어
│   ├── auth.js           # 인증 상태 관리
│   ├── modal.js          # 모달 상태 관리
│   └── cart.js           # 장바구니 상태 관리
├── utils/                # 유틸리티 함수들
│   ├── navigation.js     # 네비게이션 헬퍼
│   ├── helpers.js        # 공통 헬퍼 함수들
│   └── validation.js     # 유효성 검사 함수들
├── constants/            # 상수 정의
│   └── apiCodes.js       # API 응답 코드 상수
├── assets/               # 정적 자원
│   ├── styles/           # CSS 파일들
│   │   ├── components/   # 컴포넌트별 CSS
│   │   └── pages/        # 페이지별 CSS
│   └── images/           # 이미지 파일들
├── layouts/              # 레이아웃 컴포넌트
├── router/               # 라우터 설정
└── main.js              # 앱 진입점
```

## 시작하기

### 설치
```bash
npm install
```

### 개발 서버 실행
```bash
npm run dev
```

### 빌드
```bash
npm run build
```

## 🎯 핵심 기능

### 1. 쿠폰 발급 시스템

**선착순 쿠폰 지원**
```javascript
// 쿠폰 목록 조회
const coupons = await couponAPI.getAvailableTemplates()

// 쿠폰 발급 (로그인 필요)
await couponAPI.issueCoupon(templateId)
```

**주요 특징**
- 발급 기간 기반 버튼 상태 (발급 예정/다운로드/발급 마감)
- 선착순 수량 표시 (`선착순: 100명`)
- 로그인 전 사용자 안내 메시지
- 실시간 발급 상태 확인

### 2. 상품 관리 시스템

**상품 목록 & 검색**
```javascript
// 상품 목록 조회 (페이지네이션)
const products = await productAPI.getProducts({ page: 0, size: 20 })

// 상품 검색
const results = await productAPI.searchProducts({ 
  keyword: '스마트폰',
  minPrice: 100000,
  maxPrice: 2000000
})
```

**장바구니 기능**
```javascript
import { useCartStore } from '@/store/cart'

const cartStore = useCartStore()

// 상품 추가
cartStore.addItem(product, quantity)

// 수량 변경
cartStore.updateQuantity(productId, newQuantity)
```

### 3. Axios 인터셉터 (자동 인증 처리)

**Request 인터셉터**
- Pinia의 `authStore`에서 AccessToken을 자동으로 가져와 헤더에 주입
- 모든 요청에 `withCredentials: true` 설정 (RefreshToken 쿠키 전송)

**Response 인터셉터**
- 401 에러 + `C0002` 코드 시 자동 토큰 갱신
- 갱신 성공 시 원래 요청 재시도
- 갱신 실패 시 로그아웃 처리 및 로그인 페이지 리다이렉트
- 기타 에러 시 전역 팝업으로 에러 메시지 표시

### 2. 전역 모달 시스템

**사용법**
```javascript
import { useModal } from '@/composables/useModal'

const { alert, confirm, error, success, custom } = useModal()

// 기본 모달들
await alert('알림 메시지')
const result = await confirm('확인하시겠습니까?')
error('에러 메시지')
success('성공 메시지')

// 커스텀 모달
custom('CustomComponent', { prop1: 'value' }, { closable: false })
```

### 3. API 호출 패턴

**도메인별 API 모듈**
```javascript
import { authAPI } from '@/api/auth'
import { productAPI } from '@/api/product'

// 로그인
const response = await authAPI.login({ loginId, password })

// 상품 목록 조회
const products = await productAPI.getProducts({ page: 1, size: 10 })
```

**useApi Composable 활용**
```javascript
import { useApi } from '@/composables/useApi'

const { execute, loading, data } = useApi()

await execute(
  () => productAPI.getProducts(),
  {
    onSuccess: (data) => console.log('성공:', data),
    onError: (message) => console.log('실패:', message)
  }
)
```

### 5. 네비게이션 헬퍼

**기본 사용법**
```javascript
import { useNavigation } from '@/composables/useNavigation'

const { goPage, goAuthPage, goAdminPage, goPageWithConfirm, navigation } = useNavigation()

// 기본 페이지 이동
goPage('/products')

// 인증 필요한 페이지 (미인증 시 로그인 페이지로)
goAuthPage('/profile')

// 관리자 권한 필요한 페이지
goAdminPage('/admin')

// 확인 후 이동
await goPageWithConfirm('정말 이동하시겠습니까?', '/orders')

// 편의 함수 사용
navigation.home()     // 홈으로 이동
navigation.login()    // 로그인 페이지로 이동
```

### 6. 유효성 검사 시스템

**useValidation Composable**
```javascript
import { useValidation } from '@/composables/useValidation'
import { required, email, minLength } from '@/utils/validation'

const { 
  form, 
  errors, 
  isValid, 
  validateForm, 
  handleFieldInput, 
  getFieldError 
} = useValidation(
  // 초기 데이터
  { email: '', password: '' },
  // 검사 규칙
  {
    email: [required, email],
    password: [required, (value) => minLength(value, 8)]
  }
)

// 템플릿에서 사용
// <BaseInput :model-value="form.email" @update:model-value="(v) => handleFieldInput('email', v)" />
```

### 7. 공통 헬퍼 함수들

**포맷팅 함수들**
```javascript
import { formatNumber, formatDate, formatFileSize, formatPhone } from '@/utils/helpers'

formatNumber(1234567)        // "1,234,567"
formatDate('2025-01-09')     // "2025-01-09"
formatFileSize(1024)         // "1 KB"
formatPhone('01012345678')   // "010-1234-5678"
```

**유틸리티 함수들**
```javascript
import { debounce, throttle, storage, deepClone } from '@/utils/helpers'

// 디바운스 (검색 등에 유용)
const debouncedSearch = debounce(searchFunction, 300)

// 로컬 스토리지
storage.set('key', { data: 'value' })
const data = storage.get('key')

// 객체 깊은 복사
const cloned = deepClone(originalObject)
```

**useAuth Composable**
```javascript
import { useAuth } from '@/composables/useAuth'

const { 
  isAuthenticated, 
  isAdmin, 
  user, 
  login, 
  logout, 
  requireAuth 
} = useAuth()

// 로그인
await login({ loginId: 'user', password: 'pass' })

// 권한 체크
if (requireAuth()) {
  // 인증된 사용자만 접근 가능한 로직
}
```

## 환경 변수

### .env.development
```
VITE_API_BASE_URL=http://localhost:8080
VITE_ENV=development
```

### .env.production
```
VITE_API_BASE_URL=https://api.yourdomain.com
VITE_ENV=production
```

## 📋 API 응답 형식

### 성공 응답
```json
{
  "code": "C0000",
  "message": "성공",
  "data": {},
  "timestamp": "2025-01-07T10:30:00"
}
```

### 에러 응답
```json
{
  "code": "C0002",
  "message": "인증 실패",
  "data": null,
  "timestamp": "2025-01-07T10:30:00"
}
```

## 에러 코드 관리

### API 응답 코드 상수
```javascript
import { API_CODES, isSuccess, getErrorMessage } from '@/constants/apiCodes'

// 응답 코드 체크
if (isSuccess(response.data.code)) {
  // 성공 처리
}

// 에러 메시지 가져오기 (서버 메시지 우선)
const errorMessage = getErrorMessage(response.data.code, response.data.message)

// 특정 에러 코드 체크
if (response.data.code === API_CODES.USER.DUPLICATE_LOGIN_ID) {
  // 중복 아이디 처리
}
```

### 에러 코드 목록

### 공통 에러
- `C0000`: 성공
- `C0001`: 잘못된 요청 파라미터
- `C0002`: 인증 실패 (토큰 갱신 트리거)
- `C0003`: 권한 없음
- `C0004`: 리소스를 찾을 수 없음
- `C0005`: 서버 내부 오류

### 서비스별 에러
- **사용자**: L0001~L0003
- **상품**: P0001~P0003
- **쿠폰**: CP0001~CP1009
- **주문**: O0001~O0004

## 주요 특징

1. **MSA 최적화**: 도메인별 API 모듈화 및 서비스 분리
2. **자동 인증**: 토큰 갱신 및 재시도 로직 내장
3. **전역 상태 관리**: Pinia 기반 중앙집중식 상태 관리
4. **재사용성**: Composables 패턴으로 로직 재사용
5. **타입 안전성**: Vue3 Composition API 활용
6. **사용자 경험**: 로딩 상태, 에러 처리, 모달 시스템

## 확장 가이드

### 새로운 API 모듈 추가
1. `src/api/` 폴더에 도메인별 파일 생성
2. `apiClient`를 import하여 API 함수 정의
3. 필요시 새로운 Composable 생성

### 새로운 모달 컴포넌트 추가
1. `src/components/common/modals/` 폴더에 컴포넌트 생성
2. `CommonModal.vue`의 `componentMap`에 등록
3. `useModal`에서 편의 메서드 추가

### 새로운 스토어 추가
1. `src/store/` 폴더에 Pinia 스토어 생성
2. 필요시 관련 Composable 생성
3. 컴포넌트에서 활용

이 뼈대를 기반으로 MSA 환경에서 안정적이고 확장 가능한 Vue3 애플리케이션을 구축할 수 있습니다.

## 추가된 헬퍼 시스템

### 페이지네이션 시스템
```javascript
import { useList } from '@/composables/useList'
import { productAPI } from '@/api/product'

// 기본 사용법
const { 
  items,           // 목록 데이터
  loading,         // 로딩 상태
  currentPage,     // 현재 페이지 (0부터 시작)
  totalPages,      // 총 페이지 수
  hasNext,         // 다음 페이지 존재 여부
  hasPrev,         // 이전 페이지 존재 여부
  goToPage,        // 페이지 이동
  nextPage,        // 다음 페이지
  prevPage,        // 이전 페이지
  refresh,         // 새로고침
  applyFilters,    // 필터 적용
  clearFilters     // 필터 초기화
} = useList(productAPI.getProducts, {
  defaultSize: 20,
  autoLoad: true,
  useQuery: true
})

// 검색/필터 적용
applyFilters({ sellerId: 'admin', keyword: '스마트폰' })

// 페이지 이동
goToPage(2)
```
```javascript
import { useNavigation } from '@/composables/useNavigation'

const { goPage, goAuthPage, goAdminPage, goPageWithConfirm } = useNavigation()

// 기본 이동
goPage('/products')

// 인증 필요 페이지 (미인증 시 로그인으로)
goAuthPage('/profile')

// 관리자 권한 필요 페이지
goAdminPage('/admin')

// 확인 후 이동
await goPageWithConfirm('정말 이동하시겠습니까?', '/orders')
```

### 네비게이션 헬퍼
```javascript
import { useValidation } from '@/composables/useValidation'
import { required, email, minLength } from '@/utils/validation'

const { form, errors, isValid, handleFieldInput } = useValidation(
  { email: '', password: '' },
  {
    email: [required, email],
    password: [required, (value) => minLength(value, 8)]
  }
)
```

### 공통 헬퍼 함수들
```javascript
import { formatNumber, formatDate, debounce, storage } from '@/utils/helpers'

// 포맷팅
formatNumber(1234567)        // "1,234,567"
formatDate('2025-01-09')     // "2025-01-09"

// 유틸리티
const debouncedFn = debounce(fn, 300)
storage.set('key', data)
```

이제 완전한 MSA 환경용 Vue3 프론트엔드 뼈대가 구축되었습니다!