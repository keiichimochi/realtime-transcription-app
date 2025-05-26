import asyncio
import json
import logging
import os
import tempfile
import time
from datetime import datetime
from typing import Dict, List, Optional
import base64

import numpy as np
import soundfile as sf
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

# ログ設定
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class SimpleTranscriber:
    """WhisperXなしの簡易版（デモ用）"""
    def __init__(self):
        logger.info("簡易音声認識システムを初期化中...")
        # 実際の音声認識なしで、デモ用の応答を返す
        self.demo_responses = [
            "こんにちは、テスト音声です。",
            "リアルタイム文字起こしのデモンストレーションです。",
            "音声が認識されました。",
            "マイクからの入力を受信しています。",
            "WhisperXなしでも基本動作を確認できます。"
        ]
        self.response_index = 0
        logger.info("簡易音声認識システムの初期化完了！")
    
    def transcribe_audio(self, audio_data: np.ndarray, sample_rate: int = 16000) -> Dict:
        """音声データの簡易処理（デモ用）"""
        try:
            # 音声レベルを計算
            audio_level = np.mean(np.abs(audio_data))
            
            # 音声レベルが一定以上の場合のみ応答
            if audio_level > 0.01:
                text = self.demo_responses[self.response_index % len(self.demo_responses)]
                self.response_index += 1
                
                # 簡易的なセグメント情報を作成
                segments = [{
                    "start": 0.0,
                    "end": len(audio_data) / sample_rate,
                    "text": text,
                    "speaker": f"Speaker_{(self.response_index % 2) + 1}"
                }]
            else:
                segments = []
            
            return {
                "success": True,
                "segments": segments,
                "language": "ja",
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"音声処理エラー: {e}")
            return {
                "success": False,
                "error": str(e),
                "timestamp": datetime.now().isoformat()
            }

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.transcriber = SimpleTranscriber()
    
    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"WebSocket接続: {len(self.active_connections)}個のアクティブ接続")
    
    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        logger.info(f"WebSocket切断: {len(self.active_connections)}個のアクティブ接続")
    
    async def send_personal_message(self, message: str, websocket: WebSocket):
        try:
            await websocket.send_text(message)
        except:
            self.disconnect(websocket)

# FastAPIアプリ初期化
app = FastAPI(title="リアルタイム文字起こしAPI（簡易版）")

# CORS設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3210"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 接続マネージャー
manager = ConnectionManager()

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # クライアントからのデータを待機
            data = await websocket.receive_text()
            message = json.loads(data)
            
            if message["type"] == "audio_data":
                try:
                    # Base64エンコードされた音声データをデコード
                    audio_bytes = base64.b64decode(message["data"])
                    audio_array = np.frombuffer(audio_bytes, dtype=np.float32)
                    
                    # 音声処理実行
                    result = manager.transcriber.transcribe_audio(audio_array, message.get("sample_rate", 16000))
                    
                    # 結果をクライアントに送信
                    await manager.send_personal_message(json.dumps({
                        "type": "transcription_result",
                        "data": result
                    }), websocket)
                    
                except Exception as e:
                    logger.error(f"音声データ処理エラー: {e}")
                    await manager.send_personal_message(json.dumps({
                        "type": "transcription_result",
                        "data": {
                            "success": False,
                            "error": "音声データの処理中にエラーが発生しました",
                            "timestamp": datetime.now().isoformat()
                        }
                    }), websocket)
            
            elif message["type"] == "ping":
                await manager.send_personal_message(json.dumps({
                    "type": "pong"
                }), websocket)
                
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"WebSocketエラー: {e}")
        manager.disconnect(websocket)

@app.get("/")
async def read_root():
    return {
        "message": "リアルタイム文字起こしAPI起動中（簡易版）",
        "note": "この版はWhisperXなしのデモ版です。実際の音声認識はダミー応答です。",
        "upgrade": "本格的な音声認識にはWhisperXのインストールが必要です。"
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy", 
        "timestamp": datetime.now().isoformat(),
        "mode": "simple_demo"
    }

if __name__ == "__main__":
    logger.info("🚀 簡易版バックエンドを起動中...")
    logger.info("📝 この版はWhisperXなしのデモ版です")
    logger.info("🎤 音声入力は受信しますが、応答はダミーデータです")
    logger.info("💡 実際の音声認識にはWhisperXが必要です")
    
    uvicorn.run(
        "main_simple:app",
        host="127.0.0.1",
        port=4321,
        reload=True,
        log_level="info"
    )
