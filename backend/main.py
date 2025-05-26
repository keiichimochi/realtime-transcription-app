import asyncio
import json
import logging
import os
import tempfile
import time
from datetime import datetime
from typing import Dict, List, Optional

import numpy as np
import soundfile as sf
import whisperx
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import uvicorn

# ログ設定
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AudioTranscriber:
    def __init__(self):
        self.device = "cpu"  # macOSではCPUを推奨
        self.batch_size = 16
        self.compute_type = "float32"
        
        # WhisperXモデルの初期化
        logger.info("WhisperXモデルをロード中...")
        self.model = whisperx.load_model("base", self.device, compute_type=self.compute_type)
        
        # 話者分離モデルの初期化（HuggingFace tokenが必要な場合があります）
        try:
            self.diarize_model = whisperx.DiarizationPipeline(use_auth_token=None, device=self.device)
        except Exception as e:
            logger.warning(f"話者分離モデルの初期化に失敗: {e}")
            self.diarize_model = None
        
        logger.info("モデルの初期化完了！")
    
    def transcribe_audio(self, audio_data: np.ndarray, sample_rate: int = 16000) -> Dict:
        """音声データを文字起こし"""
        try:
            # 一時ファイルに保存
            with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as temp_file:
                sf.write(temp_file.name, audio_data, sample_rate)
                temp_path = temp_file.name
            
            # WhisperXで文字起こし
            audio = whisperx.load_audio(temp_path)
            result = self.model.transcribe(audio, batch_size=self.batch_size)
            
            # アライメント
            model_a, metadata = whisperx.load_align_model(language_code=result["language"], device=self.device)
            result = whisperx.align(result["segments"], model_a, metadata, audio, self.device, return_char_alignments=False)
            
            # 話者分離
            if self.diarize_model:
                try:
                    diarize_segments = self.diarize_model(audio)
                    result = whisperx.assign_word_speakers(diarize_segments, result)
                except Exception as e:
                    logger.warning(f"話者分離でエラー: {e}")
            
            # 一時ファイル削除
            os.unlink(temp_path)
            
            return {
                "success": True,
                "segments": result.get("segments", []),
                "language": result.get("language", "unknown"),
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"文字起こしエラー: {e}")
            return {
                "success": False,
                "error": str(e),
                "timestamp": datetime.now().isoformat()
            }

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.transcriber = AudioTranscriber()
    
    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"WebSocket接続: {len(self.active_connections)}個のアクティブ接続")
    
    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)
        logger.info(f"WebSocket切断: {len(self.active_connections)}個のアクティブ接続")
    
    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)
    
    async def broadcast(self, message: str):
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except:
                # 切断されたコネクションを削除
                self.active_connections.remove(connection)

# FastAPIアプリ初期化
app = FastAPI(title="リアルタイム文字起こしAPI")

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
                # Base64エンコードされた音声データをデコード
                import base64
                audio_bytes = base64.b64decode(message["data"])
                audio_array = np.frombuffer(audio_bytes, dtype=np.float32)
                
                # 文字起こし実行
                result = manager.transcriber.transcribe_audio(audio_array, message.get("sample_rate", 16000))
                
                # 結果をクライアントに送信
                await manager.send_personal_message(json.dumps({
                    "type": "transcription_result",
                    "data": result
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
    return {"message": "リアルタイム文字起こしAPI起動中"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="127.0.0.1",
        port=4321,
        reload=True,
        log_level="info"
    )
