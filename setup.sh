#!/bin/bash

echo "🎤 リアルタイム文字起こしアプリのセットアップを開始するナリ！"

# Python仮想環境の作成
echo "📦 Python仮想環境を作成中..."
cd backend
python3 -m venv venv
source venv/bin/activate

# PyAudioの依存関係をmacOSでインストール
echo "🔧 macOS用音声ライブラリをインストール中..."
if command -v brew >/dev/null 2>&1; then
    echo "Homebrewでportaudioをインストール..."
    brew install portaudio
else
    echo "⚠️  Homebrewがインストールされていません。手動でportaudioをインストールしてください。"
fi

# Pythonパッケージのインストール
echo "📦 Pythonパッケージをインストール中..."
pip install --upgrade pip

# PyTorchを先にインストール（最新版）
echo "🔥 PyTorchをインストール中..."
pip install torch torchaudio --index-url https://download.pytorch.org/whl/cpu

# その他のパッケージをインストール
pip install -r requirements.txt

# WhisperXモデルのダウンロード（初回のみ）
echo "🤖 WhisperXモデルをダウンロード中..."
python -c "import whisperx; print('WhisperX import successful!'); model = whisperx.load_model('base', 'cpu'); print('Model loaded successfully!')"

cd ..

# Node.jsパッケージのインストール
echo "📦 Node.jsパッケージをインストール中..."
cd frontend
npm install

cd ..

echo "✅ セットアップ完了！"
echo ""
echo "🚀 アプリを起動するには："
echo "1. バックエンド: cd backend && source venv/bin/activate && python main.py"
echo "2. フロントエンド: cd frontend && npm start"
echo ""
echo "🌐 ブラウザで http://localhost:3210 にアクセスしてください"
