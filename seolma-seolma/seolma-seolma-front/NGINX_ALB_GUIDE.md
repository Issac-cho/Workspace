# Nginx + ALB 구성 가이드

## 아키텍처 구성

```
Internet → ALB → Nginx (EC2) → Backend Services
                   ↓
            ┌─────────────────┐
            │  Nginx (80/443) │
            └─────────────────┘
                   ↓
        ┌──────────┴──────────┐
        ↓                     ↓
┌─────────────┐    ┌─────────────┐
│General Svc  │    │Coupon Svc   │
│(8080)       │    │(8081)       │
└─────────────┘    └─────────────┘
```

## 1. ALB 대상그룹 설정 (Nginx용)

### Frontend Nginx 대상그룹
- **이름**: `nginx-frontend-tg`
- **프로토콜**: HTTP
- **포트**: `80` (Nginx 기본 포트)
- **VPC**: 해당 VPC 선택
- **대상 유형**: 인스턴스

### 상태 검사 설정
```
프로토콜: HTTP
포트: 80
경로: /health (권장)

고급 상태 검사 설정:
- 정상 임계값: 2
- 비정상 임계값: 2
- 제한 시간: 5초
- 간격: 30초
- 성공 코드: 200
```

### ❌ 잘못된 헬스체크 경로
- `/` - 프론트엔드 index.html 반환 (헬스체크 부적합)
- `/index.html` - 정적 파일 (Nginx 상태와 무관)

### ✅ 올바른 헬스체크 경로
- `/health` - 전용 헬스체크 엔드포인트 (권장)
- `/nginx-health` - 더 구체적인 이름
- `/status` - 대안

## 2. Nginx 설정 파일

### /etc/nginx/nginx.conf
```nginx
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log;
pid /run/nginx.pid;

events {
    worker_connections 1024;
}

http {
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;

    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;

    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Gzip 압축
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript 
               application/javascript application/xml+rss 
               application/json application/xml;

    # 업스트림 서버 정의
    upstream general_service {
        server 127.0.0.1:8080;
        # 다중 인스턴스 시
        # server 10.0.1.10:8080;
        # server 10.0.3.10:8080;
    }

    upstream coupon_service {
        server 127.0.0.1:8081;
        # 다중 인스턴스 시
        # server 10.0.1.20:8081;
        # server 10.0.3.20:8081;
    }

    include /etc/nginx/conf.d/*.conf;
}
```

### /etc/nginx/conf.d/default.conf
```nginx
server {
    listen 80;
    server_name _;

    # 헬스체크 엔드포인트
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }

    location /nginx-health {
        access_log off;
        return 200 '{"status":"UP","service":"nginx-proxy"}';
        add_header Content-Type application/json;
    }

    # 쿠폰 서비스 라우팅
    location /api/v1/coupons/ {
        proxy_pass http://coupon_service;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # 타임아웃 설정
        proxy_connect_timeout 30s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
    }

    # 일반 서비스 라우팅 (User, Product, Order)
    location /api/v1/ {
        proxy_pass http://general_service;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # 타임아웃 설정
        proxy_connect_timeout 30s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
    }

    # 정적 파일 서빙 (선택사항)
    location / {
        root /usr/share/nginx/html;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;
    }

    # 에러 페이지
    error_page 404 /404.html;
    error_page 500 502 503 504 /50x.html;
    location = /50x.html {
        root /usr/share/nginx/html;
    }
}
```

## 3. ALB 리스너 규칙 (단순화)

### HTTPS 리스너 (443 포트)
```
기본 규칙: nginx-frontend-tg로 전달
```

### HTTP 리스너 (80 포트)
```
기본 규칙: HTTPS로 리다이렉트 (301)
```

## 4. 대상 등록

### Nginx Frontend 대상그룹에 등록
```
EC2-1 (AZ-a): 10.0.1.30:80 (Nginx)
EC2-2 (AZ-c): 10.0.3.30:80 (Nginx)
```

## 5. 보안 그룹 설정

### ALB 보안 그룹
```
인바운드:
- HTTP (80): 0.0.0.0/0
- HTTPS (443): 0.0.0.0/0
```

### Nginx EC2 보안 그룹
```
인바운드:
- 80 포트: ALB 보안 그룹에서만
- SSH (22): 관리자 IP에서만
```

### Backend EC2 보안 그룹
```
인바운드:
- 8080 포트: Nginx EC2 보안 그룹에서만
- 8081 포트: Nginx EC2 보안 그룹에서만
- SSH (22): 관리자 IP에서만
```

## 6. 환경별 Nginx 설정

### 개발 환경 (Staging)
```nginx
upstream general_service {
    server 10.0.1.10:8080;
    server 10.0.3.10:8080;
}

upstream coupon_service {
    server 10.0.1.20:8081;
    server 10.0.3.20:8081;
}
```

### 운영 환경 (Production)
```nginx
upstream general_service {
    server 10.0.1.10:8080 weight=3;
    server 10.0.3.10:8080 weight=3;
    server 10.0.1.11:8080 weight=2;  # 추가 인스턴스
    server 10.0.3.11:8080 weight=2;  # 추가 인스턴스
}

upstream coupon_service {
    server 10.0.1.20:8081 weight=1;
    server 10.0.3.20:8081 weight=1;
}
```

## 7. 로드밸런싱 방식

### 라운드 로빈 (기본)
```nginx
upstream general_service {
    server 10.0.1.10:8080;
    server 10.0.3.10:8080;
}
```

### 가중치 기반
```nginx
upstream general_service {
    server 10.0.1.10:8080 weight=3;
    server 10.0.3.10:8080 weight=1;
}
```

### IP 해시 (세션 유지)
```nginx
upstream general_service {
    ip_hash;
    server 10.0.1.10:8080;
    server 10.0.3.10:8080;
}
```

## 8. 헬스체크 및 모니터링

### Nginx 상태 확인
```bash
# Nginx 상태
sudo systemctl status nginx

# 설정 테스트
sudo nginx -t

# 리로드
sudo nginx -s reload
```

### 로그 모니터링
```bash
# 액세스 로그
sudo tail -f /var/log/nginx/access.log

# 에러 로그
sudo tail -f /var/log/nginx/error.log
```

## 9. 배포 스크립트 업데이트

### Nginx 설정 배포
```bash
#!/bin/bash

ENV=$1

case $ENV in
    "staging")
        # Nginx 설정 복사
        sudo cp nginx/staging.conf /etc/nginx/conf.d/default.conf
        sudo nginx -t && sudo nginx -s reload
        ;;
    "production")
        # Nginx 설정 복사
        sudo cp nginx/production.conf /etc/nginx/conf.d/default.conf
        sudo nginx -t && sudo nginx -s reload
        ;;
esac
```

## 10. 장점

### Nginx 사용 시 장점
1. **단일 엔드포인트**: ALB → Nginx → Backend
2. **유연한 라우팅**: 복잡한 라우팅 규칙 가능
3. **캐싱**: 정적 파일 및 API 응답 캐싱
4. **압축**: Gzip 압축으로 대역폭 절약
5. **SSL 종료**: Nginx에서 SSL 처리 가능
6. **로그 통합**: 모든 요청 로그 중앙화

### 고려사항
1. **추가 홉**: 지연시간 약간 증가
2. **단일 장애점**: Nginx 장애 시 전체 서비스 영향
3. **관리 복잡성**: Nginx 설정 관리 필요

## 11. 테스트

### 헬스체크 테스트
```bash
# Nginx 헬스체크
curl http://nginx-server-ip/health

# 백엔드 라우팅 테스트
curl http://nginx-server-ip/api/v1/products
curl http://nginx-server-ip/api/v1/coupons/templates
```