# EC2 + Nginx 배포 가이드

## 1. 프로덕션 빌드

### 빌드 명령어
```bash
# 프로덕션 모드로 빌드 (.env.production 사용)
npm run build

# 또는
yarn build
```

빌드 시 Vite는 자동으로 `.env.production` 파일을 읽어서 환경 변수를 적용합니다.

### 빌드 결과
- `dist/` 폴더에 정적 파일들이 생성됩니다
- HTML, CSS, JS 파일들이 최적화되어 번들링됩니다
- 환경 변수는 빌드 시점에 코드에 주입됩니다

## 2. .env.production 설정

배포 전에 `.env.production` 파일을 실제 도메인으로 수정하세요:

```bash
VITE_API_BASE_URL=https://your-actual-domain.com
VITE_GENERAL_SERVICE_URL=https://your-actual-domain.com
VITE_COUPON_SERVICE_URL=https://your-actual-domain.com
VITE_USER_SERVICE_URL=https://your-actual-domain.com
VITE_PRODUCT_SERVICE_URL=https://your-actual-domain.com
VITE_ORDER_SERVICE_URL=https://your-actual-domain.com
VITE_ENV=production
```

**중요:** `your-actual-domain.com`을 실제 도메인 또는 EC2 IP로 변경하세요.

## 3. EC2에 파일 업로드

### 방법 1: SCP 사용
```bash
# dist 폴더를 EC2로 복사
scp -i your-key.pem -r dist/* ec2-user@your-ec2-ip:/var/www/html/
```

### 방법 2: Git 사용
```bash
# EC2에서 실행
cd /var/www/html
git clone your-repository-url .
npm install
npm run build
```

### 방법 3: GitHub Actions (자동 배포)
`.github/workflows/deploy.yml` 파일 생성 (아래 참조)

## 4. Nginx 설정

### Nginx 설치 (EC2에서 실행)
```bash
sudo yum update -y
sudo yum install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx
```

### Nginx 설정 파일 생성
```bash
sudo nano /etc/nginx/conf.d/frontend.conf
```

### Nginx 설정 내용
```nginx
server {
    listen 80;
    server_name your-domain.com;  # 또는 EC2 IP

    root /var/www/html/dist;
    index index.html;

    # Gzip 압축 활성화
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Vue Router History Mode 지원
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 정적 파일 캐싱
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # API 프록시 (백엔드 서버로 전달)
    location /api/ {
        proxy_pass http://localhost:8080;  # General Service
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 쿠폰 서비스 프록시 (필요한 경우)
    location /api/v1/coupons/ {
        proxy_pass http://localhost:8081;  # Coupon Service
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Nginx 설정 테스트 및 재시작
```bash
# 설정 파일 문법 검사
sudo nginx -t

# Nginx 재시작
sudo systemctl restart nginx
```

## 5. 배포 스크립트 (deploy.sh)

프로젝트 루트에 `deploy.sh` 파일 생성:

```bash
#!/bin/bash

echo "🚀 Starting deployment..."

# 1. 프로덕션 빌드
echo "📦 Building for production..."
npm run build

# 2. EC2로 파일 전송
echo "📤 Uploading to EC2..."
scp -i ~/.ssh/your-key.pem -r dist/* ec2-user@your-ec2-ip:/var/www/html/dist/

# 3. Nginx 재시작 (EC2에서)
echo "🔄 Restarting Nginx..."
ssh -i ~/.ssh/your-key.pem ec2-user@your-ec2-ip "sudo systemctl restart nginx"

echo "✅ Deployment completed!"
```

실행 권한 부여:
```bash
chmod +x deploy.sh
```

배포 실행:
```bash
./deploy.sh
```

## 6. GitHub Actions 자동 배포 (선택사항)

`.github/workflows/deploy.yml` 파일 생성:

```yaml
name: Deploy to EC2

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Build
      run: npm run build
    
    - name: Deploy to EC2
      env:
        PRIVATE_KEY: ${{ secrets.EC2_SSH_KEY }}
        HOST: ${{ secrets.EC2_HOST }}
        USER: ${{ secrets.EC2_USER }}
      run: |
        echo "$PRIVATE_KEY" > private_key.pem
        chmod 600 private_key.pem
        scp -i private_key.pem -o StrictHostKeyChecking=no -r dist/* ${USER}@${HOST}:/var/www/html/dist/
        ssh -i private_key.pem -o StrictHostKeyChecking=no ${USER}@${HOST} "sudo systemctl restart nginx"
```

GitHub Secrets 설정:
- `EC2_SSH_KEY`: EC2 SSH 키 내용
- `EC2_HOST`: EC2 IP 또는 도메인
- `EC2_USER`: EC2 사용자명 (보통 `ec2-user`)

## 7. HTTPS 설정 (Let's Encrypt)

### Certbot 설치
```bash
sudo yum install certbot python3-certbot-nginx -y
```

### SSL 인증서 발급
```bash
sudo certbot --nginx -d your-domain.com
```

Certbot이 자동으로 Nginx 설정을 업데이트하고 HTTPS를 활성화합니다.

### 자동 갱신 설정
```bash
sudo certbot renew --dry-run
```

## 8. 배포 체크리스트

- [ ] `.env.production` 파일에 실제 도메인 설정
- [ ] `npm run build` 실행하여 빌드 성공 확인
- [ ] EC2 보안 그룹에서 80, 443 포트 오픈
- [ ] Nginx 설치 및 설정
- [ ] `dist/` 폴더를 EC2로 업로드
- [ ] Nginx 재시작
- [ ] 브라우저에서 접속 테스트
- [ ] API 호출 테스트
- [ ] HTTPS 설정 (선택사항)

## 9. 트러블슈팅

### 문제: 페이지 새로고침 시 404 에러
**해결:** Nginx 설정에 `try_files $uri $uri/ /index.html;` 추가

### 문제: API 호출 실패 (CORS 에러)
**해결:** 백엔드 서버에서 CORS 설정 확인 또는 Nginx 프록시 사용

### 문제: 정적 파일 로딩 실패
**해결:** Nginx root 경로 확인 (`/var/www/html/dist`)

### 문제: 환경 변수가 적용되지 않음
**해결:** 
1. `.env.production` 파일 확인
2. 다시 빌드 (`npm run build`)
3. 빌드된 파일 재업로드

## 10. 유용한 명령어

```bash
# Nginx 로그 확인
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Nginx 상태 확인
sudo systemctl status nginx

# 디스크 사용량 확인
df -h

# 프로세스 확인
ps aux | grep nginx
```

## 요약

1. **로컬에서**: `npm run build` (프로덕션 빌드)
2. **EC2로 업로드**: `dist/` 폴더를 `/var/www/html/dist/`로 복사
3. **Nginx 설정**: Vue Router 지원 및 API 프록시 설정
4. **Nginx 재시작**: `sudo systemctl restart nginx`
5. **접속 테스트**: 브라우저에서 도메인 또는 IP로 접속

배포 완료! 🎉
