# 🎤 リアルタイム会議文字起こしアプリ

macOSで動作するリアルタイム音声認識＆話者分離Webアプリです。WhisperXを使用した高精度音声認識または軽量デモ版での動作確認が可能です。

![Demo](https://img.shields.io/badge/Status-Working-brightgreen)
![Platform](https://img.shields.io/badge/Platform-macOS-blue)
![License](https://img.shields.io/badge/License-MIT-green)

## 🌟 特徴

- **🎯 リアルタイム音声認識**: WhisperXによる高精度音声認識
- **👥 話者分離**: 複数の話者を自動で識別・分離
- **🎨 モダンUI**: React + Material-UIの美しいインターフェース
- **⚡ WebSocket通信**: リアルタイム双方向通信
- **📊 音声レベル表示**: 視覚的な音声入力レベルモニタリング
- **💾 結果保存**: 文字起こし結果のダウンロード・エクスポート
- **🚀 簡易版対応**: WhisperXなしでも動作確認可能

## 📸 スクリーンショット

```
┌─────────────────────────────────────────────┐
│  🎤 リアルタイム文字起こし            ⚙️   │
├─────────────────────────────────────────────┤
│  🟢 接続中    言語: ja                      │
├─────────────────────────────────────────────┤
│  音声レベル: ████████░░ 80%                 │
├─────────────────────────────────────────────┤
│     [🎙️ 録音開始]  [🗑️ クリア]  [⬇️ DL]      │
├─────────────────────────────────────────────┤
│  文字起こし結果                              │
│  ┌─────────────────────────────────────────┐ │
│  │ 0.0s - 2.5s  [Speaker_1]                │ │
│  │ こんにちは、今日の会議を始めます。      │ │
│  │                                         │ │
│  │ 2.6s - 5.1s  [Speaker_2]                │ │
│  │ 資料の準備はできています。              │ │
│  └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

## 🚀 クイックスタート

### 📋 前提条件

- macOS (推奨)
- Python 3.9-3.12
- Node.js 16+
- Git

### ⚡ 1分で起動

```bash
# リポジトリをクローン
git clone https://github.com/keiichimochi/realtime-transcription-app.git
cd realtime-transcription-app

# 実行権限を付与
chmod +x setup.sh start.sh

# セットアップ実行（自動）
./setup.sh

# アプリ起動（自動）
./start.sh
```

ブラウザで **http://localhost:3210** にアクセス！

## 🛠 詳細セットアップ

### 🎭 簡易版（推奨・即座に動作）

WhisperXなしで動作確認したい場合：

```bash
cd backend
chmod +x setup_simple.sh
./setup_simple.sh
python main_simple.py
```

### 🔥 完全版（WhisperX使用）

本格的な音声認識を使用したい場合：

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip

# PyTorchをインストール
pip install torch torchaudio --index-url https://download.pytorch.org/whl/cpu

# WhisperXをインストール
pip install git+https://github.com/m-bain/whisperx.git

# その他の依存関係
pip install -r requirements.txt

# 起動
python main.py
```

### 🌐 フロントエンド

```bash
cd frontend
npm install
npm start  # http://localhost:3210
```

## 🎯 使用方法

1. **アプリ起動**: ブラウザでアクセス
2. **マイク許可**: ブラウザでマイクアクセスを許可
3. **録音開始**: 「🎙️ 録音開始」ボタンをクリック
4. **リアルタイム確認**: 音声が自動で文字に変換
5. **話者確認**: 複数人の場合、Speaker_1, Speaker_2で分離表示
6. **結果保存**: 「⬇️ ダウンロード」で .txt ファイルとして保存

## 🏗 アーキテクチャ

```
┌─────────────────┐    WebSocket     ┌──────────────────┐
│   Frontend      │ ←─────────────→  │    Backend       │
│                 │  Port 3210       │                  │
│ React + TS      │                  │ FastAPI + Python │
│ Material-UI     │                  │ WhisperX/Simple  │
│ WebAudio API    │                  │ WebSocket        │
└─────────────────┘                  └──────────────────┘
        │                                       │
        │                                       │
    ┌─────────┐                         ┌─────────────┐
    │ Browser │                         │ Audio       │
    │ Microphone│                         │ Processing  │
    └─────────┘                         └─────────────┘
```

## 🔧 技術スタック

### Frontend
- **⚛️ React 18**: モダンなフロントエンドフレームワーク
- **📘 TypeScript**: 型安全な開発
- **🎨 Material-UI (MUI)**: 美しいUIコンポーネント
- **🔌 WebSocket**: リアルタイム通信
- **🎵 Web Audio API**: ブラウザ音声処理

### Backend
- **⚡ FastAPI**: 高速WebAPIフレームワーク
- **🤖 WhisperX**: OpenAI Whisperベースの音声認識
- **🔌 WebSocket**: リアルタイム通信
- **🎵 NumPy + SoundFile**: 音声処理
- **🎭 Simple Mode**: WhisperXなしのデモモード

## ⚙️ 設定とカスタマイズ

### 🎤 WhisperXモデルの変更

`backend/main.py` の `AudioTranscriber` クラス内：

```python
# 軽量・高速
self.model = whisperx.load_model("tiny", self.device)

# バランス型（デフォルト）
self.model = whisperx.load_model("base", self.device)

# 高精度
self.model = whisperx.load_model("large-v2", self.device)
```

### 🔊 音声品質の調整

フロントエンドの `getUserMedia` 設定：

```javascript
audio: {
  echoCancellation: true,    // エコーキャンセル
  noiseSuppression: true,    // ノイズ抑制
  autoGainControl: true,     // 自動ゲイン制御
  sampleRate: 16000         // サンプリングレート
}
```

### 🌐 ポート変更

- **Frontend**: `frontend/package.json` の `PORT=3210`
- **Backend**: `backend/main.py` の `port=4321`

## 🐛 トラブルシューティング

### ❌ "WebSocket接続エラー"
```bash
# バックエンドが起動しているか確認
cd backend && python main_simple.py
```

### ❌ "ModuleNotFoundError: No module named 'whisperx'"
```bash
# 簡易版を使用
cd backend && python main_simple.py
```

### ❌ "マイクアクセスエラー"
- Safariの設定 → プライバシーとセキュリティ → マイク
- システム設定 → プライバシーとセキュリティ → マイク

### ❌ "PyAudio インストールエラー"
```bash
# macOSの場合
brew install portaudio
pip install pyaudio
```

## 📊 パフォーマンス

| モード | 精度 | 速度 | メモリ使用量 | 推奨用途 |
|--------|------|------|-------------|----------|
| Simple | ⭐ | ⭐⭐⭐⭐⭐ | 低 | デモ・開発 |
| Tiny | ⭐⭐ | ⭐⭐⭐⭐ | 低 | リアルタイム |
| Base | ⭐⭐⭐ | ⭐⭐⭐ | 中 | バランス |
| Large | ⭐⭐⭐⭐⭐ | ⭐⭐ | 高 | 高精度 |

## 🤝 コントリビューション

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 ライセンス

MIT License - 詳細は [LICENSE](LICENSE) ファイルを参照

## 🙏 謝辞

- [OpenAI Whisper](https://github.com/openai/whisper) - 音声認識モデル
- [WhisperX](https://github.com/m-bain/whisperx) - 話者分離・高速化
- [FastAPI](https://fastapi.tiangolo.com/) - WebAPIフレームワーク
- [React](https://react.dev/) - フロントエンドフレームワーク
- [Material-UI](https://mui.com/) - UIコンポーネント

## 🚀 今後の予定

- [ ] 🌍 多言語対応（英語、中国語など）
- [ ] 📁 音声ファイルからの文字起こし
- [ ] 💬 リアルタイムチャット機能
- [ ] 📚 録音履歴管理
- [ ] 🐳 Docker対応
- [ ] ☁️ クラウドデプロイ対応
- [ ] 📱 モバイルアプリ版

## 📞 サポート

質問や問題がある場合は、[GitHub Issues](https://github.com/keiichimochi/realtime-transcription-app/issues) で報告してください。

---

**Created with ❤️ for developers and content creators**

⭐ このプロジェクトが役に立ったら、星をつけてください！
