#!/bin/bash
# deploy.sh - 在AWS服务器上执行

set -e
cd "$(dirname "$0")"

echo "=== 拉取最新代码 ==="
git pull

echo "=== 构建镜像 ==="
docker compose build --no-cache

echo "=== 重启服务 ==="
docker compose down
docker compose up -d

echo "=== 等待启动 ==="
sleep 5

echo "=== 健康检查 ==="
curl -s http://localhost:3001/api/health

echo ""
echo "=== 清理旧镜像 ==="
docker image prune -f

echo "=== 部署完成! ==="
