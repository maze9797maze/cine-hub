#!/bin/bash
# CineHub 一键部署脚本：打包 → 替换成品 → 提交 → 推送
# 用法：./deploy.sh "提交说明"（提交说明可省略）
set -e   # 任何一步出错就立刻停止

# 脚本所在目录就是仓库根目录
ROOT="$(cd "$(dirname "$0")" && pwd)"

# 1. 打包 React 源码
cd "$ROOT/cinehub-react"
npm run build

# 2. 回到仓库根，删掉旧成品，复制新成品
cd "$ROOT"
rm -rf assets index.html favicon.svg icons.svg
cp -r cinehub-react/dist/* .

# 3. 提交并推送
git add -A
if git diff --cached --quiet; then
  echo "✅ 没有变更需要提交"
else
  git commit -m "${1:-更新 CineHub}"
fi
git push

echo "✅ 部署完成，稍后刷新 https://maze9797maze.github.io/cine-hub/"
