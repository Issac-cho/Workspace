# ALB 대상그룹 설정 가이드

## 구성 방식 선택

### 방식 1: 직접 연결 (현재 가이드)
```
ALB → Backend Services (8080, 8081)
```

### 방식 2: Nginx 프록시 (NGINX_ALB_GUIDE.md 참고)
```
ALB → Nginx (80) → Backend Services (8080, 8081)
```

## 1. 대상그룹 구성 (직접 연결 방식)

### General Service 대상그룹
- **이름**: `general-service-tg`
- **프로토콜**: HTTP
- **포트**: `8080`
- **VPC**: 해당 VPC 선택
- **대상 유형**: 인스턴스

### Coupon Service 대상그룹  
- **이름**: `coupon-service-tg`
- **프로토콜**: HTTP
- **포트**: `8081`
- **VPC**: 해당 VPC 선택
- **대상 유형**: 인스턴스

## 2. 상태 검사 설정

### General Service 상태 검사
```
프로토콜: HTTP
포트: 8080
경로: /api/v1/health
또는: /actuator/health (Spring Boot Actuator 사용 시)

고급 상태 검사 설정:
- 정상 임계값: 2
- 비정상 임계값: 2  
- 제한 시간: 5초
- 간격: 30초
- 성공 코드: 200
```

### Coupon Service 상태 검사
```
프로토콜: HTTP
포트: 8081
경로: /api/v1/coupons/health
또는: /actuator/health (Spring Boot Actuator 사용 시)

고급 상태 검사 설정:
- 정상 임계값: 2
- 비정상 임계값: 2
- 제한 시간: 5초
- 간격: 30초
- 성공 코드: 200
```

## 3. 백엔드 헬스체크 엔드포인트 구현 예시

### Spring Boot 기본 헬스체크 (권장)

**의존성 추가 (pom.xml)**:
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>
```

**application.yml 설정**:
```yaml
management:
  endpoints:
    web:
      exposure:
        include: health
  endpoint:
    health:
      show-details: when-authorized
```

**접근 경로**: `/actuator/health`

### 커스텀 헬스체크 엔드포인트

**General Service (8080)**:
```java
@RestController
@RequestMapping("/api/v1")
public class HealthController {
    
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        Map<String, String> status = new HashMap<>();
        status.put("status", "UP");
        status.put("service", "general-service");
        status.put("timestamp", Instant.now().toString());
        return ResponseEntity.ok(status);
    }
}
```

**Coupon Service (8081)**:
```java
@RestController
@RequestMapping("/api/v1/coupons")
public class CouponHealthController {
    
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        Map<String, String> status = new HashMap<>();
        status.put("status", "UP");
        status.put("service", "coupon-service");
        status.put("timestamp", Instant.now().toString());
        return ResponseEntity.ok(status);
    }
}
```

## 4. ALB 리스너 규칙 설정

### HTTPS 리스너 (443 포트)
```
우선순위 1: 경로 패턴 = /api/v1/coupons/*
→ coupon-service-tg로 전달

우선순위 2: 경로 패턴 = /api/v1/*
→ general-service-tg로 전달

기본 규칙: 정적 파일 (S3/CloudFront)
```

### HTTP 리스너 (80 포트)
```
기본 규칙: HTTPS로 리다이렉트 (301)
```

## 5. 대상 등록

### General Service 대상그룹에 등록
```
EC2-1 (AZ-a): 10.0.1.10:8080
EC2-2 (AZ-c): 10.0.3.10:8080
```

### Coupon Service 대상그룹에 등록
```
EC2-3 (AZ-a): 10.0.1.20:8081  
EC2-4 (AZ-c): 10.0.3.20:8081
```

## 6. 보안 그룹 설정

### ALB 보안 그룹
```
인바운드:
- HTTP (80): 0.0.0.0/0
- HTTPS (443): 0.0.0.0/0

아웃바운드:
- 모든 트래픽: 0.0.0.0/0
```

### EC2 보안 그룹
```
인바운드:
- 8080 포트: ALB 보안 그룹에서만
- 8081 포트: ALB 보안 그룹에서만
- SSH (22): 관리자 IP에서만

아웃바운드:
- 모든 트래픽: 0.0.0.0/0
```

## 7. 테스트 방법

### 헬스체크 직접 테스트
```bash
# General Service
curl http://EC2-IP:8080/api/v1/health
curl http://EC2-IP:8080/actuator/health

# Coupon Service  
curl http://EC2-IP:8081/api/v1/coupons/health
curl http://EC2-IP:8081/actuator/health
```

### ALB 통한 테스트
```bash
# 헬스체크 (ALB DNS 이름 사용)
curl http://your-alb-dns-name.elb.amazonaws.com/api/v1/health
curl http://your-alb-dns-name.elb.amazonaws.com/api/v1/coupons/health

# 실제 API 테스트
curl http://your-alb-dns-name.elb.amazonaws.com/api/v1/products
curl http://your-alb-dns-name.elb.amazonaws.com/api/v1/coupons/templates
```

## 8. 모니터링

### CloudWatch 메트릭
- `TargetResponseTime`: 응답 시간
- `HealthyHostCount`: 정상 대상 수
- `UnHealthyHostCount`: 비정상 대상 수
- `RequestCount`: 요청 수

### 알람 설정 예시
```
메트릭: UnHealthyHostCount
조건: >= 1 (1분간)
알림: SNS 토픽으로 이메일/SMS 발송
```

## 9. 트러블슈팅

### 헬스체크 실패 시
1. EC2에서 직접 헬스체크 URL 접근 확인
2. 보안 그룹 인바운드 규칙 확인
3. 애플리케이션 로그 확인
4. 포트 바인딩 상태 확인: `netstat -tlnp | grep :8080`

### 라우팅 문제 시
1. ALB 리스너 규칙 우선순위 확인
2. 경로 패턴 정확성 확인
3. 대상그룹 등록 상태 확인