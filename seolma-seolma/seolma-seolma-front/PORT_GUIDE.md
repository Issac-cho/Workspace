# 포트 설정 가이드

## 최종 포트 구조

### 개발 환경 (로컬)
```
localhost:8080 - General Service (User + Product + Order 통합)
localhost:8081 - Coupon Service
```

### 운영 환경 (AWS)
```
EC2-1 (10.0.1.10:8081) - Coupon Service
EC2-2 (10.0.1.20:8080) - General Service (User + Product + Order 통합)
```

## 프론트엔드 환경 변수 설정

### 개발 환경 (.env.development)
```bash
VITE_API_BASE_URL=http://localhost:8080
VITE_GENERAL_SERVICE_URL=http://localhost:8080
VITE_COUPON_SERVICE_URL=http://localhost:8081
VITE_USER_SERVICE_URL=http://localhost:8080
VITE_PRODUCT_SERVICE_URL=http://localhost:8080
VITE_ORDER_SERVICE_URL=http://localhost:8080
VITE_ENV=development
```

### 운영 환경 (.env.production)
```bash
VITE_API_BASE_URL=https://your-domain.com
VITE_GENERAL_SERVICE_URL=https://your-domain.com
VITE_COUPON_SERVICE_URL=https://your-domain.com
VITE_USER_SERVICE_URL=https://your-domain.com
VITE_PRODUCT_SERVICE_URL=https://your-domain.com
VITE_ORDER_SERVICE_URL=https://your-domain.com
VITE_ENV=production
```

## 서비스 접근 URL

### 개발 환경

**General Service (8080):**
- User API: http://localhost:8080/api/v1/auth/*, /api/v1/users/*
- Product API: http://localhost:8080/api/v1/products/*
- Order API: http://localhost:8080/api/v1/orders/*

**Coupon Service (8081):**
- Coupon API: http://localhost:8081/api/v1/coupons/*

### 운영 환경 (ALB 통해 접근)
```
https://your-domain.com/api/v1/users/*     → General Service (EC2-2:8080)
https://your-domain.com/api/v1/products/*  → General Service (EC2-2:8080)
https://your-domain.com/api/v1/orders/*    → General Service (EC2-2:8080)
https://your-domain.com/api/v1/coupons/*   → Coupon Service (EC2-1:8081)
```

## 프론트엔드 개발 서버 실행

### 개발 모드
```bash
npm run dev
# 또는
yarn dev
```

### 프로덕션 빌드
```bash
npm run build
# 또는
yarn build
```

### 프로덕션 미리보기
```bash
npm run preview
# 또는
yarn preview
```

## API 클라이언트 구조

프론트엔드는 `src/api/client.js`에서 서비스별 클라이언트를 생성합니다:

- `generalServiceClient`: User, Product, Order API 호출
- `couponServiceClient`: Coupon API 호출
- `userServiceClient`, `productServiceClient`, `orderServiceClient`: 하위 호환성 유지

## 환경별 동작 방식

### 개발 환경
- General Service: `localhost:8080`으로 직접 요청
- Coupon Service: `localhost:8081`로 직접 요청
- CORS 설정 필요

### 운영 환경
- 모든 요청: `https://your-domain.com`으로 전송
- ALB가 경로 기반으로 라우팅:
  - `/api/v1/coupons/*` → Coupon Service (EC2-1:8081)
  - 나머지 → General Service (EC2-2:8080)

## 트러블슈팅

### 1. CORS 에러 발생
**개발 환경에서 발생 가능**

백엔드 서비스에서 CORS 설정 확인:
```java
@CrossOrigin(origins = "http://localhost:5173")
```

### 2. 환경 변수가 적용되지 않음
```bash
# 개발 서버 재시작
npm run dev
```

### 3. 프로덕션 빌드 시 환경 변수 확인
```bash
# .env.production 파일 확인
cat .env.production

# 빌드
npm run build
```

## 요약

| 환경 | General Service | Coupon Service | 프론트엔드 |
|------|----------------|----------------|-----------|
| 개발 | localhost:8080 | localhost:8081 | localhost:5173 |
| 운영 | EC2-2:8080 | EC2-1:8081 | CloudFront/S3 |
| 접근 | your-domain.com | your-domain.com | your-domain.com |
