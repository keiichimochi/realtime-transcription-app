# macOS用 リアルタイム会議文字起こしアプリ

macOSで動作するリアルタイム音声認識＆話者分離Webアプリが完成したナリ！

## 🌟 特徴

- **リアルタイム文字起こし**: WhisperXを使った高精度音声認識
- **話者分離**: 複数の話者を自動で識別・分離
- **美しいUI**: React + Material-UIで作ったモダンなインターフェース
- **WebSocket通信**: リアルタイムでの双方向通信
- **音声レベル監視**: 視覚的な音声入力レベル表示
- **結果保存**: 文字起こし結果のダウンロード機能

## 🚀 クイックスタート

### 1. 権限設定
```bash
cd /Users/k/github/realtime-transcription-app
chmod +x setup.sh
chmod +x start.sh
```

### 2. セットアップ実行
```bash
./setup.sh
```

### 3. アプリ起動
```bash
./start.sh
```

### 4. ブラウザでアクセス
- フロントエンド: http://localhost:3210
- バックエンドAPI: http://localhost:4321

## 🔧 手動セットアップ

### バックエンド
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python main.py  # http://localhost:4321
```

### フロントエンド
```bash
cd frontend
npm install
npm start  # http://localhost:3210
```

## 📱 使い方

1. ブラウザでアプリにアクセス
2. マイクの使用を許可
3. 「録音開始」ボタンをクリック
4. リアルタイムで文字起こし結果を確認
5. 話者が複数いる場合は自動で分離表示
6. 「ダウンロード」で結果を保存

## 🎯 技術スタック

### Backend
- **FastAPI**: 高速なWebAPI フレームワーク
- **WhisperX**: OpenAIのWhisperをベースにした高精度音声認識
- **WebSocket**: リアルタイム通信
- **PyAudio**: 音声処理

### Frontend
- **React 18**: モダンなフロントエンドフレームワーク
- **TypeScript**: 型安全な開発
- **Material-UI**: 美しいUIコンポーネント
- **WebSocket Client**: リアルタイム通信

## 🔧 カスタマイズ

### WhisperXモデルの変更
`backend/main.py`の`AudioTranscriber`クラス内で：
```python
self.model = whisperx.load_model("large-v2", self.device, compute_type=self.compute_type)
```

利用可能なモデル: `tiny`, `base`, `small`, `medium`, `large-v1`, `large-v2`

### 音声品質の調整
フロントエンドの`getUserMedia`設定で：
```javascript
audio: {
  echoCancellation: true,
  noiseSuppression: true,
  autoGainControl: true,
  sampleRate: 16000
}
```

## 🐛 トラブルシューティング

### マイクアクセスエラー
- ブラウザでマイクの使用を許可
- システム設定でブラウザのマイクアクセスを確認

### WebSocket接続エラー
- バックエンドが起動しているか確認
- ポート4321が使用可能か確認

### 文字起こし精度が低い
- 静かな環境で録音
- マイクの位置を調整
- より大きなWhisperXモデルを使用

## 📝 TODO

- [ ] 複数言語対応
- [ ] 音声ファイルからの文字起こし
- [ ] チャット機能
- [ ] 録音履歴管理
- [ ] Docker対応
- [ ] クラウドデプロイ対応

---

**Created with ❤️ for macOS users**

質問や改善提案があれば、お気軽にIssueを作成してください！
