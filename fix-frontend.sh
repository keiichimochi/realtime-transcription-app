#!/bin/bash

echo "🔧 フロントエンドのトラブルシューティング中..."

cd frontend

echo "🗑️ node_modulesとpackage-lock.jsonを削除中..."
rm -rf node_modules
rm -f package-lock.json

echo "📦 パッケージを再インストール中..."
npm install

echo "🚀 アプリを起動中..."
npm start
