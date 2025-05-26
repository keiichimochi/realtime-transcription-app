# 🚨 トラブルシューティングガイド

Python 3.13でのセットアップエラーが発生した場合の対処法ナリ！

## 🔧 解決方法

### 1. 仮想環境をクリーンアップ
```bash
cd /Users/k/github/realtime-transcription-app/backend
rm -rf venv
```

### 2. 手動でHomebrewとportaudioをインストール
```bash
# Homebrewがない場合はインストール
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# portaudioをインストール
brew install portaudio
```

### 3. 改良版セットアップを実行
```bash
cd /Users/k/github/realtime-transcription-app
./setup.sh
```

### 4. PyAudioでエラーが出る場合
```bash
cd backend
source venv/bin/activate
pip install --global-option="build_ext" --global-option="-I/opt/homebrew/include" --global-option="-L/opt/homebrew/lib" pyaudio
```

### 5. 簡単モードでテスト
PyAudioなしでも動くバージョンに変更するか、以下のパッケージで代替：
```bash
pip install sounddevice  # PyAudioの代替
```

## 📋 変更点

- **PyTorch**: 2.1.0 → 最新版（2.6.0+）に対応
- **WhisperX**: 固定版 → 最新版に対応  
- **モデル**: large-v2 → base（軽量化、後で変更可能）
- **依存関係**: macOS特化のインストール手順追加

## 🎯 次のステップ

セットアップが成功したら：
```bash
./start.sh
```

ブラウザで http://localhost:3210 にアクセス！

---

**問題が続く場合は、Python 3.11 または 3.12 の使用を推奨ナリ！**
