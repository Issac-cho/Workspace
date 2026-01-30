# Tomcat ALB 설정 가이드

## 1. Tomcat ALB 생성

### ALB 기본 설정
- **이름**: `tomcat-dev-alb` (개발), `tomcat-prod-alb` (운영)
- **스키마**: Internal (VPC 내부) 또는 Internet-facing
- **IP 주소 유형**: IPv4
- **VPC**: 해당 VPC 선택
- **가용 영역**: 최소 2개 AZ 선택

### 리스너 설정
- **프로토콜**: HTTP
- **포트**: 80
- **기본 작업**: 대상 그룹으로 전달

## 2. 대상 그룹 설정

### General Service 대상 그룹
- **이름**: `tomcat-general-tg`
- **프로토콜**: HTTP
- **포트**: 8080
- **VPC**: 해당 VPC
- **헬스체크 경로**: `/api/v1/health` 또는 `/actuator/health`

### Coupon Service 대상 그룹
- **이름**: `tomcat-coupon-tg`
- **프로토콜**: HTTP
- **포트**: 8081
- **VPC**: 해당 VPC
- **헬스체크 경로**: `/api/v1/coupons/health` 또는 `/actuator/health`

## 3. ALB 리스너 규칙

### 경로 기반 라우팅
```
우선순위 1: 경로 패턴 = /api/v1/coupons/*
→ tomcat-coupon-tg로 전달

우선순위 2: 경로 패턴 = /api/v1/*
→ tomcat-general-tg로 전달

기본 규칙: 404 반환 또는 기본 페이지
```

## 4. 대상 등록

### General Service 대상 등록
```
EC2-1 (AZ-a): 10.0.1.10:8080
EC2-2 (AZ-c): 10.0.3.10:8080
```

### Coupon Service 대상 등록
```
EC2-3 (AZ-a): 10.0.1.20:8081
EC2-4 (AZ-c): 10.0.3.20:8081
```

## 5. 보안 그룹 설정

### Tomcat ALB 보안 그룹
```
인바운드:
- HTTP (80): Frontend Nginx 보안 그룹에서만
- HTTPS (443): Frontend Nginx 보안 그룹에서만 (SSL 사용 시)

아웃바운드:
- 8080 포트: Tomcat EC2 보안 그룹으로
- 8081 포트: Tomcat EC2 보안 그룹으로
```

### Tomcat EC2 보안 그룹
```
인바운드:
- 8080 포트: Tomcat ALB 보안 그룹에서만
- 8081 포트: Tomcat ALB 보안 그룹에서만
- SSH (22): 관리자 IP에서만

아웃바운드:
- 모든 트래픽: 0.0.0.0/0 (DB, 외부 API 호출용)
```

## 6. 환경별 ALB 도메인 설정

### 개발 환경 (.env.staging)
```bash
# ALB DNS 이름 사용 (실제 값으로 변경)
VITE_API_BASE_URL=http://tomcat-dev-alb-123456789.ap-northeast-2.elb.amazonaws.com
VITE_GENERAL_SERVICE_URL=http://tomcat-dev-alb-123456789.ap-northeast-2.elb.amazonaws.com
VITE_COUPON_SERVICE_URL=http://tomcat-dev-alb-123456789.ap-northeast-2.elb.amazonaws.com
```

### 운영 환경 (.env.production)
```bash
# ALB DNS 이름 사용 (실제 값으로 변경)
VITE_API_BASE_URL=https://tomcat-prod-alb-987654321.ap-northeast-2.elb.amazonaws.com
VITE_GENERAL_SERVICE_URL=https://tomcat-prod-alb-987654321.ap-northeast-2.elb.amazonaws.com
VITE_COUPON_SERVICE_URL=https://tomcat-prod-alb-987654321.ap-northeast-2.elb.amazonaws.com
```

## 7. 커스텀 도메인 설정 (선택사항)

### Route 53 설정
```
dev-api.mycompany.com → tomcat-dev-alb-123456789.ap-northeast-2.elb.amazonaws.com
api.mycompany.com → tomcat-prod-alb-987654321.ap-northeast-2.elb.amazonaws.com
```

### 환경변수 업데이트 (도메인 사용 시)
```bash
# .env.staging
VITE_API_BASE_URL=https://dev-api.mycompany.com

# .env.production  
VITE_API_BASE_URL=https://api.mycompany.com
```

## 8. SSL 인증서 설정 (운영 환경)

### ACM 인증서 발급
1. AWS Certificate Manager에서 인증서 요청
2. 도메인 검증 완료
3. ALB 리스너에 HTTPS(443) 추가
4. SSL 인증서 연결

### HTTPS 리스너 추가
```
프로토콜: HTTPS
포트: 443
SSL 인증서: ACM에서 발급받은 인증서
보안 정책: ELBSecurityPolicy-TLS-1-2-2017-01
```

## 9. 테스트

### ALB 도메인 직접 테스트
```bash
# 헬스체크
curl http://tomcat-alb-domain.com/api/v1/health
curl http://tomcat-alb-domain.com/api/v1/coupons/health

# API 테스트
curl http://tomcat-alb-domain.com/api/v1/products
curl http://tomcat-alb-domain.com/api/v1/coupons/templates
```

### Frontend에서 테스트
```bash
# 빌드
npm run build:staging

# 배포 후 브라우저에서 확인
# 개발자 도구 → Network 탭에서 API 호출 URL 확인
```

## 10. 모니터링

### CloudWatch 메트릭
- `RequestCount`: 요청 수
- `TargetResponseTime`: 응답 시간
- `HealthyHostCount`: 정상 대상 수
- `UnHealthyHostCount`: 비정상 대상 수

### 알람 설정
```
메트릭: UnHealthyHostCount
조건: >= 1 (5분간)
알림: SNS로 이메일 발송
```

## 11. 비용 최적화

### 개발 환경
- ALB 1개로 모든 서비스 라우팅
- 최소 인스턴스 수 유지

### 운영 환경
- 서비스별 ALB 분리 고려 (트래픽이 많은 경우)
- Auto Scaling으로 비용 최적화

이렇게 Tomcat ALB를 구성하면 안정적이고 확장 가능한 백엔드 인프라를 구축할 수 있습니다!