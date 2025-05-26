# 🚀 GitHubへのプッシュ手順

## 📋 前提条件
- GitHubアカウントでログイン済み
- リポジトリ `https://github.com/keiichimochi/realtime-transcription-app` が存在

## 🎯 プッシュコマンド

プロジェクトディレクトリで以下を実行：

```bash
cd /Users/k/github/realtime-transcription-app

# Gitリポジトリを初期化
git init

# リモートリポジトリを追加
git remote add origin https://github.com/keiichimochi/realtime-transcription-app.git

# 全ファイルをステージング
git add .

# コミット
git commit -m "🎤 Initial commit: Real-time transcription app with WhisperX and React

✨ Features:
- Real-time speech recognition with WhisperX
- Speaker diarization (multiple speakers)
- Modern React + TypeScript frontend
- FastAPI backend with WebSocket
- Audio level monitoring
- Export transcription results
- Simple mode (no WhisperX required)

🚀 Quick start:
- chmod +x setup.sh start.sh
- ./setup.sh
- ./start.sh
- Open http://localhost:3210

📱 Supports both WhisperX (high accuracy) and simple demo mode"

# メインブランチに設定
git branch -M main

# プッシュ
git push -u origin main
```

## 🔧 トラブルシューティング

### 認証エラーが出る場合

1. **Personal Access Token使用**:
```bash
# ユーザー名: keiichimochi
# パスワード: [Personal Access Token]
```

2. **SSH Key使用**:
```bash
git remote set-url origin git@github.com:keiichimochi/realtime-transcription-app.git
git push -u origin main
```

### リポジトリが存在しない場合

1. GitHub.comでリポジトリを手動作成
2. 名前: `realtime-transcription-app`
3. 説明: `🎤 macOS用リアルタイム会議文字起こしアプリ - WhisperX使用の高精度音声認識＆話者分離`
4. パブリック設定
5. 上記のプッシュコマンドを実行

## ✅ 完了確認

プッシュ成功後、以下が確認できるはず：
- https://github.com/keiichimochi/realtime-transcription-app
- 美しいREADME表示
- 全ファイルがアップロード済み
- MITライセンス設定済み

🎉 GitHubリポジトリの完成ナリ！
