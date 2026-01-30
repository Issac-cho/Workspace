#!/bin/bash

# EC2 배포 스크립트
# 사용법: ./deploy-to-ec2.sh [staging|production] [ec2-ip] [key-path]

ENV=${1:-staging}
EC2_HOST=${2:-"your-ec2-public-ip"}
KEY_PATH=${3:-"your-key.pem"}

if [ -z "$2" ]; then
    echo "사용법: ./deploy-to-ec2.sh [staging|production] [ec2-ip] [key-path]"
    echo "예시: ./deploy-to-ec2.sh staging 3.34.123.45 ~/.ssh/my-key.pem"
    exit 1
fi

echo "🚀 EC2 배포 시작"
echo "환경: $ENV"
echo "서버: $EC2_HOST"
echo "키: $KEY_PATH"

# 1. 로컬 빌드
echo "📦 프로젝트 빌드 중..."
case $ENV in
    "staging")
        npm run build:staging
        ;;
    "production")
        npm run build:prod
        ;;
    *)
        echo "❌ 잘못된 환경입니다. staging 또는 production을 입력하세요."
        exit 1
        ;;
esac

# 2. 파일 업로드
echo "📤 파일 업로드 중..."
scp -i "$KEY_PATH" -r dist/* ec2-user@$EC2_HOST:/tmp/

# 3. Nginx 설정 파일 업로드
echo "📤 Nginx 설정 업로드 중..."
scp -i "$KEY_PATH" nginx/$ENV.conf ec2-user@$EC2_HOST:/tmp/nginx.conf

# 4. EC2에서 배포 적용
echo "🔄 EC2에서 배포 적용 중..."
ssh -i "$KEY_PATH" ec2-user@$EC2_HOST << 'EOF'
    # 기존 파일 백업
    sudo mkdir -p /var/www/backup
    sudo cp -r /var/www/html/* /var/www/backup/ 2>/dev/null || true
    
    # 새 파일 배포
    sudo rm -rf /var/www/html/*
    sudo cp -r /tmp/* /var/www/html/
    sudo rm /var/www/html/nginx.conf 2>/dev/null || true
    sudo chown -R nginx:nginx /var/www/html
    
    # Nginx 설정 적용
    sudo cp /tmp/nginx.conf /etc/nginx/conf.d/frontend.conf
    sudo nginx -t
    
    if [ $? -eq 0 ]; then
        sudo systemctl reload nginx
        echo "✅ Nginx 설정 적용 완료"
    else
        echo "❌ Nginx 설정 오류"
        exit 1
    fi
    
    # 임시 파일 정리
    rm -rf /tmp/*
EOF

if [ $? -eq 0 ]; then
    echo "✅ 배포 완료!"
    echo "🌐 접속 URL: http://$EC2_HOST"
    echo "🏥 헬스체크: http://$EC2_HOST/health"
else
    echo "❌ 배포 실패"
    exit 1
fi