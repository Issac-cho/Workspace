# 단일 ALB + 다중 대상그룹 설정 가이드

## 1. ALB 생성

### 기본 설정
- **이름**: `backend-dev-alb` (개발), `backend-prod-alb` (운영)
- **스키마**: Internet-facing 또는 Internal
- **IP 주소 유형**: IPv4
- **VPC**: 해당 VPC 선택
- **가용 영역**: 최소 2개 AZ 선택

## 2. 대상그룹 생성

### General Service 대상그룹
- **이름**: `general-service-tg`
- **프로토콜**: HTTP
- **포트**: 8080
- **헬스체크 경로**: `/api/v1/health`

### Coupon Service 대상그룹
- **이름**: `coupon-service-tg`
- **프로토콜**: HTTP
- **포트**: 8081
- **헬스체크 경로**: `/api/v1/coupons/health`

## 3. ALB 리스너 규칙 설정

### HTTP 리스너 (80 포트)
```
우선순위 1: 경로 패턴 = /api/v1/coupons/*
→ coupon-service-tg로 전달

우선순위 2: 경로 패턴 = /api/v1/*  
→ general-service-tg로 전달

기본 규칙: 404 반환
```

## 4. 환경변수 설정

### 개발 환경 (.env.staging)
```bash
# 모든 서비스가 같은 ALB 도메인 사용
VITE_API_BASE_URL=http://backend-dev-alb-123456789.ap-northeast-2.elb.amazonaws.com
VITE_GENERAL_SERVICE_URL=http://backend-dev-alb-123456789.ap-northeast-2.elb.amazonaws.com
VITE_COUPON_SERVICE_URL=http://backend-dev-alb-123456789.ap-northeast-2.elb.amazonaws.com
VITE_USER_SERVICE_URL=http://backend-dev-alb-123456789.ap-northeast-2.elb.amazonaws.com
VITE_PRODUCT_SERVICE_URL=http://backend-dev-alb-123456789.ap-northeast-2.elb.amazonaws.com
VITE_ORDER_SERVICE_URL=http://backend-dev-alb-123456789.ap-northeast-2.elb.amazonaws.com
```

### 운영 환경 (.env.production)
```bash
# SSL 사용 (HTTPS)
VITE_API_BASE_URL=https://backend-prod-alb-987654321.ap-northeast-2.elb.amazonaws.com
VITE_GENERAL_SERVICE_URL=https://backend-prod-alb-987654321.ap-northeast-2.elb.amazonaws.com
VITE_COUPON_SERVICE_URL=https://backend-prod-alb-987654321.ap-northeast-2.elb.amazonaws.com
VITE_USER_SERVICE_URL=https://backend-prod-alb-987654321.ap-northeast-2.elb.amazonaws.com
VITE_PRODUCT_SERVICE_URL=https://backend-prod-alb-987654321.ap-northeast-2.elb.amazonaws.com
VITE_ORDER_SERVICE_URL=https://backend-prod-alb-987654321.ap-northeast-2.elb.amazonaws.com
```

## 5. API 호출 흐름

### General Service API 호출
```javascript
// 프론트엔드 코드
productAPI.getProducts()
// ↓
generalServiceClient.get('/api/v1/products')
// ↓  
http://backend-alb.com/api/v1/products
// ↓ ALB 라우팅
EC2:8080/api/v1/products
```

### Coupon Service API 호출
```javascript
// 프론트엔드 코드
couponAPI.getAvailableTemplates()
// ↓
couponServiceClient.get('/api/v1/coupons/templates')
// ↓
http://backend-alb.com/api/v1/coupons/templates
// ↓ ALB 라우팅  
EC2:8081/api/v1/coupons/templates
```

## 6. 대상 등록

### General Service 대상그룹
```
EC2-1 (AZ-a): 10.0.1.10:8080
EC2-2 (AZ-c): 10.0.3.10:8080
```

### Coupon Service 대상그룹
```
EC2-3 (AZ-a): 10.0.1.20:8081
EC2-4 (AZ-c): 10.0.3.20:8081
```

## 7. 보안 그룹 설정

### ALB 보안 그룹
```
인바운드:
- HTTP (80): 0.0.0.0/0 또는 Frontend에서만
- HTTPS (443): 0.0.0.0/0 또는 Frontend에서만

아웃바운드:
- 8080: Backend EC2 보안 그룹
- 8081: Backend EC2 보안 그룹
```

### Backend EC2 보안 그룹
```
인바운드:
- 8080: ALB 보안 그룹에서만
- 8081: ALB 보안 그룹에서만
- SSH (22): 관리자 IP

아웃바운드:
- 모든 트래픽: 0.0.0.0/0
```

## 8. 테스트

### ALB 직접 테스트
```bash
# General Service
curl http://backend-alb-domain.com/api/v1/products
curl http://backend-alb-domain.com/api/v1/health

# Coupon Service
curl http://backend-alb-domain.com/api/v1/coupons/templates
curl http://backend-alb-domain.com/api/v1/coupons/health
```

### 라우팅 확인
```bash
# ALB 액세스 로그에서 확인
# /api/v1/products → general-service-tg
# /api/v1/coupons/templates → coupon-service-tg
```

## 9. 장점

### 비용 효율성
- ALB 1대로 모든 서비스 처리
- 관리 포인트 최소화

### 단순성
- 프론트엔드에서 단일 도메인 사용
- 환경변수 관리 간편

### 확장성
- 새로운 서비스 추가 시 대상그룹만 추가
- 라우팅 규칙으로 유연한 처리

## 10. 주의사항

### 경로 패턴 순서
- 더 구체적인 패턴을 높은 우선순위로 설정
- `/api/v1/coupons/*`가 `/api/v1/*`보다 먼저 와야 함

### 헬스체크 경로
- 각 서비스별로 다른 헬스체크 경로 사용
- General: `/api/v1/health`
- Coupon: `/api/v1/coupons/health`

### 포트 충돌 방지
- 같은 EC2에서 다른 포트 사용 (8080, 8081)
- 또는 다른 EC2에서 같은 포트 사용

이 구성이 가장 효율적이고 관리하기 쉬운 방식입니다!