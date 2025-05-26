#!/bin/bash

echo "🚀 リアルタイム文字起こしアプリを起動するナリ！"

# バックエンドとフロントエンドを並行起動
echo "🔥 バックエンドとフロントエンドを起動中..."

# バックエンド起動
cd backend
source venv/bin/activate
python main.py &
BACKEND_PID=$!

# フロントエンド起動
cd ../frontend
npm start &
FRONTEND_PID=$!

echo "✅ アプリが起動しました！"
echo "📱 バックエンド: http://localhost:4321"
echo "🌐 フロントエンド: http://localhost:3210"
echo ""
echo "停止するには Ctrl+C を押してください"

# 終了シグナルをキャッチ
trap "echo '🛑 アプリを停止中...'; kill $BACKEND_PID $FRONTEND_PID; exit" INT

# 待機
wait
