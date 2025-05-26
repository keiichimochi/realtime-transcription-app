#!/bin/bash

echo "🚀 バックエンドサーバーを起動するナリ！"

cd backend

# 仮想環境が存在するかチェック
if [ ! -d "venv" ]; then
    echo "❌ 仮想環境が見つかりません。先に ./setup.sh を実行してください。"
    exit 1
fi

# 仮想環境をアクティベート
source venv/bin/activate

echo "✅ 仮想環境をアクティベートしました"
echo "🔥 FastAPIサーバーを起動中..."
echo "📡 バックエンドAPI: http://localhost:4321"
echo "🌐 WebSocket: ws://localhost:4321/ws"
echo ""
echo "停止するには Ctrl+C を押してください"

# FastAPIサーバー起動
python main.py
