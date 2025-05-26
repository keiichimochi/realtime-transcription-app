#!/bin/bash

echo "🔧 バックエンドを完全に再セットアップするナリ！"

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

# PyAudioの依存関係をインストール（macOS）
echo "🔧 macOS用音声ライブラリを確認中..."
if command -v brew >/dev/null 2>&1; then
    echo "Homebrewでportaudioをインストール..."
    brew install portaudio
else
    echo "⚠️ Homebrewがインストールされていません"
    echo "以下のコマンドでHomebrewをインストールしてください："
    echo '/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"'
fi

# PyTorchを先にインストール（CPU版）
echo "🔥 PyTorch（CPU版）をインストール中..."
pip install torch torchaudio --index-url https://download.pytorch.org/whl/cpu

# 基本的なパッケージを個別にインストール
echo "📦 基本パッケージをインストール中..."
pip install numpy>=1.24.3
pip install scipy>=1.11.4
pip install soundfile>=0.12.1
pip install librosa>=0.10.1
pip install fastapi==0.104.1
pip install uvicorn==0.24.0
pip install websockets==12.0
pip install python-multipart==0.0.6
pip install pydantic>=2.5.0

# WhisperXをインストール
echo "🤖 WhisperXをインストール中..."
pip install git+https://github.com/m-bain/whisperx.git

# PyAudioをインストール（macOS用）
echo "🎵 PyAudioをインストール中..."
if command -v brew >/dev/null 2>&1; then
    export CPPFLAGS=-I$(brew --prefix)/include
    export LDFLAGS=-L$(brew --prefix)/lib
    pip install pyaudio
else
    echo "⚠️ PyAudioのインストールをスキップ（Homebrewが必要）"
fi

# インストールされたパッケージを確認
echo "📋 インストールされたパッケージ："
pip list

# WhisperXのテスト
echo "🧪 WhisperXをテスト中..."
python -c "
try:
    import whisperx
    print('✅ WhisperX import successful!')
    # 軽量モデルでテスト
    model = whisperx.load_model('tiny', 'cpu')
    print('✅ WhisperX model loading successful!')
except Exception as e:
    print(f'❌ WhisperX error: {e}')
"

echo ""
echo "🎉 セットアップ完了！"
echo "🚀 バックエンドを起動するには:"
echo "python main.py"
