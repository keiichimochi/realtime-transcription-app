#!/bin/bash

echo "🚀 簡易版バックエンドのセットアップを開始するナリ！"
echo "📝 この版はWhisperXなしで動作します（デモ用）"

# 古い仮想環境を削除
echo "🗑️ 古い仮想環境を削除中..."
rm -rf venv

# 新しい仮想環境を作成
echo "📦 新しい仮想環境を作成中..."
python3 -m venv venv
source venv/bin/activate

# pipを最新にアップグレード
echo "⬆️ pipをアップグレード中..."
pip install --upgrade pip

# 簡易版の依存関係をインストール
echo "📦 軽量パッケージをインストール中..."
pip install -r requirements_simple.txt

# インストール確認
echo "✅ インストールされたパッケージ："
pip list

# 簡易版のテスト
echo "🧪 簡易版をテスト中..."
python -c "
import numpy as np
import soundfile
import fastapi
import uvicorn
print('✅ 全ての基本パッケージが正常にインストールされました！')
"

echo ""
echo "🎉 簡易版セットアップ完了！"
echo ""
echo "🚀 簡易版バックエンドを起動するには："
echo "python main_simple.py"
echo ""
echo "📝 注意："
echo "- この版は音声認識のデモ版です"
echo "- 実際の音声はダミー応答に変換されます"
echo "- フロントエンドの動作確認には十分です"
echo ""
echo "💡 本格的な音声認識にはWhisperXが必要です"
