# バックエンド修復手順

## 🚨 エラーの原因
Python仮想環境でnumpyなどのパッケージがインストールされていません。

## 🔧 修復手順

### 1. バックエンドディレクトリに移動
```bash
cd /Users/k/github/realtime-transcription-app/backend
```

### 2. 修復スクリプトに実行権限を付与
```bash
chmod +x fix-backend.sh
```

### 3. 修復スクリプトを実行
```bash
./fix-backend.sh
```

### 4. バックエンドを起動
```bash
python main.py
```

## 🛠 手動修復（スクリプトが失敗した場合）

```bash
cd backend

# 古い仮想環境を削除
rm -rf venv

# 新しい仮想環境を作成
python3 -m venv venv
source venv/bin/activate

# 基本パッケージをインストール
pip install --upgrade pip
pip install numpy scipy soundfile librosa fastapi uvicorn websockets python-multipart pydantic

# PyTorchをインストール
pip install torch torchaudio --index-url https://download.pytorch.org/whl/cpu

# WhisperXをインストール
pip install git+https://github.com/m-bain/whisperx.git

# バックエンド起動
python main.py
```

## ✅ 成功のサイン
- `INFO: Uvicorn running on http://127.0.0.1:4321`
- `WhisperXモデルをロード中...`
- エラーなしで起動完了

バックエンドが起動したら、フロントエンドの接続エラーが解消されます！
