# Nginx /health 엔드포인트 설정 가이드

## 1. Nginx 설정 파일 위치

### CentOS/RHEL/Amazon Linux
```bash
/etc/nginx/nginx.conf
/etc/nginx/conf.d/default.conf
```

### Ubuntu/Debian
```bash
/etc/nginx/sites-available/default
/etc/nginx/nginx.conf
```

## 2. /health 엔드포인트 추가 방법

### 방법 1: 간단한 텍스트 응답
```nginx
server {
    listen 80;
    server_name _;

    # 헬스체크 엔드포인트 - 이 부분만 추가하면 됨!
    location /health {
        access_log off;                    # 로그 기록 안 함
        return 200 "healthy\n";           # 200 상태코드와 "healthy" 텍스트 반환
        add_header Content-Type text/plain;
    }

    # 기존 설정들...
    location / {
        root /usr/share/nginx/html;
        index index.html;
    }
}
```

### 방법 2: JSON 응답
```nginx
location /health {
    access_log off;
    return 200 '{"status":"UP","service":"nginx","timestamp":"$time_iso8601"}';
    add_header Content-Type application/json;
}
```

### 방법 3: 상세한 상태 정보
```nginx
location /health {
    access_log off;
    return 200 '{"status":"UP","service":"nginx-proxy","version":"1.0","uptime":"$upstream_response_time"}';
    add_header Content-Type application/json;
    add_header Cache-Control "no-cache, no-store, must-revalidate";
}
```

## 3. 실제 설정 예시

### /etc/nginx/conf.d/default.conf
```nginx
server {
    listen 80;
    server_name _;

    # ✅ 헬스체크 엔드포인트 (이 부분을 추가)
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }

    # 백엔드 프록시 설정
    location /api/v1/coupons/ {
        proxy_pass http://127.0.0.1:8081;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    location /api/v1/ {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # 정적 파일 서빙
    location / {
        root /usr/share/nginx/html;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;
    }
}
```

## 4. 설정 적용 방법

### 1단계: 설정 파일 편집
```bash
sudo vi /etc/nginx/conf.d/default.conf
```

### 2단계: 설정 문법 검사
```bash
sudo nginx -t
```

### 3단계: Nginx 재시작/리로드
```bash
# 리로드 (권장 - 무중단)
sudo nginx -s reload

# 또는 재시작
sudo systemctl restart nginx
```

## 5. 테스트

### 로컬에서 테스트
```bash
# 헬스체크 테스트
curl http://localhost/health
# 응답: healthy

# 상태 코드 확인
curl -I http://localhost/health
# 응답: HTTP/1.1 200 OK
```

### 원격에서 테스트
```bash
curl http://your-server-ip/health
curl http://your-domain.com/health
```

## 6. 고급 헬스체크 (선택사항)

### 백엔드 상태까지 확인
```nginx
location /health/full {
    access_log off;
    
    # 백엔드 서비스 확인
    proxy_pass http://127.0.0.1:8080/api/v1/health;
    proxy_connect_timeout 2s;
    proxy_read_timeout 2s;
    
    # 백엔드 실패 시 처리
    proxy_intercept_errors on;
    error_page 502 503 504 = @backend_down;
}

location @backend_down {
    return 503 '{"status":"DOWN","reason":"backend_unavailable"}';
    add_header Content-Type application/json;
}
```

## 7. 트러블슈팅

### 404 Not Found 에러
```bash
# 설정 파일 확인
sudo nginx -t

# Nginx 프로세스 확인
sudo systemctl status nginx

# 설정 리로드
sudo nginx -s reload
```

### 권한 문제
```bash
# Nginx 사용자 확인
ps aux | grep nginx

# 파일 권한 확인
ls -la /etc/nginx/conf.d/
```

## 8. 보안 고려사항

### 외부 접근 제한 (선택사항)
```nginx
location /health {
    # 특정 IP에서만 접근 허용
    allow 10.0.0.0/8;     # VPC 내부
    allow 172.16.0.0/12;  # ALB
    deny all;
    
    access_log off;
    return 200 "healthy\n";
    add_header Content-Type text/plain;
}
```

## 요약

1. **파일 생성 불필요**: 별도 HTML/PHP 파일 만들 필요 없음
2. **Nginx 설정만**: `location /health` 블록만 추가
3. **즉시 동작**: 설정 리로드 후 바로 사용 가능
4. **응답 커스터마이징**: 텍스트, JSON 등 원하는 형태로 설정