# 인프라 구성 가이드

## 환경별 구성

### 1. 로컬 개발 환경
- **파일**: `.env.development`
- **구성**: 직접 포트 연결
- **특징**: 서비스별 다른 포트 사용 (General: 8080, Coupon: 8081)

### 2. AWS 개발 VPC (Staging)
- **파일**: `.env.staging`
- **구성**: ALB + Target Group
- **도메인**: `dev-api.your-domain.com`

### 3. AWS 운영 VPC (Production)
- **파일**: `.env.production`
- **구성**: ALB + Target Group (Multi-AZ)
- **도메인**: `api.your-domain.com`

## 이중화 처리 전략

### ALB (Application Load Balancer) 구성

```
Internet Gateway
    ↓
ALB (Multi-AZ)
    ↓
Target Groups
    ├── General Service Target Group
    │   ├── EC2-1 (AZ-a): 10.0.1.10:8080
    │   └── EC2-2 (AZ-c): 10.0.3.10:8080
    └── Coupon Service Target Group
        ├── EC2-3 (AZ-a): 10.0.1.20:8081
        └── EC2-4 (AZ-c): 10.0.3.20:8081
```

### 라우팅 규칙

1. **Path-based 라우팅**:
   - `/api/v1/coupons/*` → Coupon Service Target Group
   - `/api/v1/*` → General Service Target Group

2. **Health Check**:
   - General Service: `GET /api/v1/health`
   - Coupon Service: `GET /api/v1/coupons/health`

### 환경변수에서 단일 도메인 사용하는 이유

- 프론트엔드는 ALB의 단일 엔드포인트만 알면 됨
- ALB가 내부적으로 서비스별 라우팅 처리
- 가용영역별 IP 변경에 영향받지 않음
- Auto Scaling 시에도 투명하게 처리

## 배포 스크립트

### package.json 스크립트 추가
```json
{
  "scripts": {
    "build:dev": "vite build --mode development",
    "build:staging": "vite build --mode staging",
    "build:prod": "vite build --mode production"
  }
}
```

### 환경별 빌드 명령어
- 로컬: `npm run build:dev`
- 개발 VPC: `npm run build:staging`
- 운영 VPC: `npm run build:prod`

## 보안 고려사항

1. **VPC 간 통신**: VPC Peering 또는 Transit Gateway
2. **SSL/TLS**: ALB에서 SSL 종료
3. **보안 그룹**: 
   - ALB: 80, 443 포트만 인터넷에서 접근
   - EC2: ALB에서만 8080, 8081 포트 접근 허용
4. **환경변수**: AWS Systems Manager Parameter Store 또는 Secrets Manager 사용 권장

## 모니터링

1. **ALB 메트릭**: CloudWatch로 요청 수, 응답 시간, 에러율 모니터링
2. **Target Health**: 각 EC2 인스턴스 상태 모니터링
3. **로그**: ALB Access Log, EC2 Application Log 수집