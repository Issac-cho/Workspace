# EC2 + Nginx 배포 가이드

## 1. EC2 인스턴스 준비

### EC2 인스턴스 생성
- **AMI**: Amazon Linux 2023 또는 Ubuntu 22.04
- **인스턴스 타입**: t3.micro (프리티어) 또는 t3.small
- **보안 그룹**: HTTP(80), HTTPS(443), SSH(22) 포트 열기
- **키 페어**: SSH 접속용 키 페어 생성/선택

### SSH 접속
```bash
# Windows (PowerShell)
ssh -i "your-key.pem" ec2-user@your-ec2-public-ip

# macOS/Linux
ssh -i "your-key.pem" ec2-user@your-ec2-public-ip
```

## 2. EC2에 필수 소프트웨어 설치

### Amazon Linux 2023
```bash
# 시스템 업데이트
sudo yum update -y

# Nginx 설치
sudo yum install -y nginx

# Node.js 설치 (빌드용)
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Git 설치 (소스코드 다운로드용)
sudo yum install -y git

# 설치 확인
nginx -v
node -v
npm -v
```

### Ubuntu 22.04
```bash
# 시스템 업데이트
sudo apt update && sudo apt upgrade -y

# Nginx 설치
sudo apt install -y nginx

# Node.js 설치
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Git 설치
sudo apt install -y git

# 설치 확인
nginx -v
node -v
npm -v
```

## 3. 프로젝트 소스코드 배포

### 방법 1: Git Clone (권장)
```bash
# 프로젝트 클론
cd /home/ec2-user
git clone https://github.com/your-username/your-repo.git
cd your-repo

# 의존성 설치
npm install

# 환경별 빌드
npm run build:staging  # 개발 환경
# 또는
npm run build:prod     # 운영 환경

# 빌드된 파일을 Nginx 디렉토리로 복사
sudo cp -r dist/* /var/www/html/
```

### 방법 2: 로컬에서 빌드 후 업로드
```bash
# 로컬에서 빌드
npm run build:staging

# SCP로 파일 업로드 (Windows PowerShell/macOS/Linux)
scp -i "your-key.pem" -r dist/* ec2-user@your-ec2-ip:/tmp/
```

```bash
# EC2에서 파일 이동
sudo mkdir -p /var/www/html
sudo cp -r /tmp/* /var/www/html/
sudo chown -R nginx:nginx /var/www/html
```

## 4. Nginx 설정

### Nginx 설정 파일 생성
```bash
sudo vi /etc/nginx/conf.d/frontend.conf
```

### 설정 내용 (개발 환경)
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

    # API 프록시 - 쿠폰 서비스
    location /api/v1/coupons/ {
        proxy_pass http://10.0.1.20:8081;  # 백엔드 서버 IP
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        proxy_connect_timeout 30s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
    }

    # API 프록시 - 일반 서비스
    location /api/v1/ {
        proxy_pass http://10.0.1.10:8080;  # 백엔드 서버 IP
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        proxy_connect_timeout 30s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
    }

    # Vue.js 정적 파일 서빙
    location / {
        root /var/www/html;
        index index.html;
        try_files $uri $uri/ /index.html;
        
        # 캐싱 설정
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Gzip 압축
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript 
               application/javascript application/xml+rss 
               application/json application/xml;
}
```

## 5. Nginx 서비스 시작

```bash
# 설정 문법 검사
sudo nginx -t

# Nginx 시작 및 자동 시작 설정
sudo systemctl start nginx
sudo systemctl enable nginx

# 상태 확인
sudo systemctl status nginx
```

## 6. 방화벽 설정 (필요시)

### Amazon Linux
```bash
# 방화벽 상태 확인
sudo systemctl status firewalld

# HTTP/HTTPS 포트 열기 (방화벽이 활성화된 경우)
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

### Ubuntu
```bash
# UFW 방화벽 설정
sudo ufw allow 'Nginx Full'
sudo ufw allow ssh
sudo ufw --force enable
```

## 7. 테스트

### 로컬 테스트
```bash
# 헬스체크
curl http://localhost/health

# 정적 파일 확인
curl http://localhost/

# API 프록시 테스트
curl http://localhost/api/v1/products
```

### 외부 접속 테스트
```bash
# 브라우저에서 접속
http://your-ec2-public-ip

# 헬스체크
curl http://your-ec2-public-ip/health
```

## 8. 자동 배포 스크립트

### deploy-to-ec2.sh
```bash
#!/bin/bash

# 설정
EC2_HOST="your-ec2-public-ip"
KEY_PATH="path/to/your-key.pem"
ENV=${1:-staging}

echo "🚀 EC2 배포 시작 (환경: $ENV)"

# 1. 로컬 빌드
echo "📦 프로젝트 빌드 중..."
npm run build:$ENV

# 2. 파일 업로드
echo "📤 파일 업로드 중..."
scp -i "$KEY_PATH" -r dist/* ec2-user@$EC2_HOST:/tmp/

# 3. EC2에서 파일 이동 및 Nginx 재시작
echo "🔄 EC2에서 배포 적용 중..."
ssh -i "$KEY_PATH" ec2-user@$EC2_HOST << 'EOF'
    sudo rm -rf /var/www/html/*
    sudo cp -r /tmp/* /var/www/html/
    sudo chown -R nginx:nginx /var/www/html
    sudo nginx -t && sudo systemctl reload nginx
    rm -rf /tmp/*
EOF

echo "✅ 배포 완료!"
echo "🌐 접속 URL: http://$EC2_HOST"
```

### 사용법
```bash
# 실행 권한 부여
chmod +x deploy-to-ec2.sh

# 개발 환경 배포
./deploy-to-ec2.sh staging

# 운영 환경 배포
./deploy-to-ec2.sh production
```

## 9. SSL 인증서 설정 (선택사항)

### Let's Encrypt 사용
```bash
# Certbot 설치
sudo yum install -y certbot python3-certbot-nginx  # Amazon Linux
# 또는
sudo apt install -y certbot python3-certbot-nginx  # Ubuntu

# SSL 인증서 발급
sudo certbot --nginx -d your-domain.com

# 자동 갱신 설정
sudo crontab -e
# 다음 라인 추가:
# 0 12 * * * /usr/bin/certbot renew --quiet
```

## 10. 모니터링 및 로그

### 로그 확인
```bash
# Nginx 액세스 로그
sudo tail -f /var/log/nginx/access.log

# Nginx 에러 로그
sudo tail -f /var/log/nginx/error.log

# 시스템 로그
sudo journalctl -u nginx -f
```

### 성능 모니터링
```bash
# 시스템 리소스 확인
htop
free -h
df -h

# Nginx 프로세스 확인
ps aux | grep nginx
```

## 11. 트러블슈팅

### 일반적인 문제들

#### 1. 403 Forbidden 에러
```bash
# 파일 권한 확인
ls -la /var/www/html/

# 권한 수정
sudo chown -R nginx:nginx /var/www/html
sudo chmod -R 755 /var/www/html
```

#### 2. 502 Bad Gateway (API 프록시 에러)
```bash
# 백엔드 서비스 상태 확인
curl http://backend-server-ip:8080/api/v1/health

# Nginx 에러 로그 확인
sudo tail -f /var/log/nginx/error.log
```

#### 3. Vue Router History Mode 404 에러
```nginx
# Nginx 설정에서 try_files 확인
location / {
    try_files $uri $uri/ /index.html;  # 이 라인이 중요!
}
```

## 12. 보안 강화 (권장)

### 기본 보안 설정
```bash
# 불필요한 서비스 중지
sudo systemctl disable httpd  # Apache가 설치된 경우

# 시스템 업데이트 자동화
sudo yum install -y yum-cron  # Amazon Linux
sudo systemctl enable yum-cron
```

### Nginx 보안 헤더
```nginx
# 보안 헤더 추가
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "no-referrer-when-downgrade" always;
add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
```

이제 EC2에서 Nginx로 Vue.js 프로젝트를 완전히 배포할 수 있습니다!