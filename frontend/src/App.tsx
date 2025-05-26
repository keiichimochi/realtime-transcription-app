import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import {
  Mic,
  MicOff,
  Download,
  Clear,
  Settings,
  VolumeUp
} from '@mui/icons-material';
import './App.css';

interface TranscriptionSegment {
  start: number;
  end: number;
  text: string;
  speaker?: string;
}

interface TranscriptionResult {
  success: boolean;
  segments: TranscriptionSegment[];
  language: string;
  timestamp: string;
  error?: string;
}

const App: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [transcriptions, setTranscriptions] = useState<TranscriptionSegment[]>([]);
  const [currentLanguage, setCurrentLanguage] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [bufferSize, setBufferSize] = useState(4096);
  
  const wsRef = useRef<WebSocket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  // WebSocket接続
  const connectWebSocket = useCallback(() => {
    try {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        return; // 既に接続済み
      }
      
      wsRef.current = new WebSocket('ws://localhost:4321/ws');
      
      wsRef.current.onopen = () => {
        setIsConnected(true);
        setError('');
        console.log('WebSocket接続成功！');
      };
      
      wsRef.current.onmessage = (event) => {
        const message = JSON.parse(event.data);
        
        if (message.type === 'transcription_result') {
          const result: TranscriptionResult = message.data;
          
          if (result.success) {
            setTranscriptions(prev => [...prev, ...result.segments]);
            setCurrentLanguage(result.language);
          } else {
            setError(result.error || '文字起こしエラー');
          }
        }
      };
      
      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setError('バックエンド（localhost:4321）に接続できません。バックエンドが起動しているか確認してください。');
        setIsConnected(false);
      };
      
      wsRef.current.onclose = (event) => {
        setIsConnected(false);
        console.log('WebSocket接続切断', event.code, event.reason);
        
        // 5秒後に再接続を試行
        if (!event.wasClean) {
          setTimeout(() => {
            console.log('WebSocket再接続を試行中...');
            connectWebSocket();
          }, 5000);
        }
      };
      
    } catch (err) {
      console.error('WebSocket接続エラー:', err);
      setError('WebSocket接続に失敗しました。バックエンドが起動しているか確認してください。');
    }
  }, []);

  // 音声レベル監視
  const monitorAudioLevel = useCallback(() => {
    if (analyserRef.current) {
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      analyserRef.current.getByteFrequencyData(dataArray);
      
      const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
      setAudioLevel(average / 255 * 100);
      
      if (isRecording) {
        requestAnimationFrame(monitorAudioLevel);
      }
    }
  }, [isRecording]);

  // 録音開始
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000
        }
      });
      
      streamRef.current = stream;
      
      // AudioContextでレベル監視
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      
      // MediaRecorder設定
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      audioChunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
          
          // 音声データをWebSocketで送信
          if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            const reader = new FileReader();
            reader.onloadend = () => {
              const base64 = (reader.result as string).split(',')[1];
              wsRef.current?.send(JSON.stringify({
                type: 'audio_data',
                data: base64,
                sample_rate: 16000
              }));
            };
            reader.readAsDataURL(event.data);
          }
        }
      };
      
      setIsRecording(true);
      mediaRecorderRef.current.start(1000); // 1秒ごとにデータ送信
      monitorAudioLevel();
      
    } catch (err) {
      setError('マイクへのアクセスに失敗しました');
      console.error('Recording error:', err);
    }
  };

  // 録音停止
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    
    setIsRecording(false);
    setAudioLevel(0);
  };

  // 文字起こし結果をクリア
  const clearTranscriptions = () => {
    setTranscriptions([]);
    setCurrentLanguage('');
  };

  // 結果をダウンロード
  const downloadTranscriptions = () => {
    const text = transcriptions.map(seg => 
      `[${seg.start.toFixed(2)}s - ${seg.end.toFixed(2)}s] ${seg.speaker ? `${seg.speaker}: ` : ''}${seg.text}`
    ).join('\n');
    
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transcription_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // 初期化
  useEffect(() => {
    connectWebSocket();
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      stopRecording();
    };
  }, [connectWebSocket]);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" component="h1" gutterBottom>
            🎤 リアルタイム文字起こし
          </Typography>
          <Box>
            <IconButton onClick={() => setSettingsOpen(true)}>
              <Settings />
            </IconButton>
          </Box>
        </Box>

        {/* 接続状態 */}
        <Box mb={2}>
          <Chip 
            label={isConnected ? '🟢 接続中' : '🔴 切断中'} 
            color={isConnected ? 'success' : 'error'}
            sx={{ mr: 2 }}
          />
          {currentLanguage && (
            <Chip label={`言語: ${currentLanguage}`} color="info" />
          )}
        </Box>

        {/* エラー表示 */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
            {error.includes('バックエンド') && (
              <Box mt={1}>
                <Typography variant="body2">
                  バックエンドを起動するには：
                </Typography>
                <Typography variant="body2" component="pre" sx={{ fontSize: '0.8rem', mt: 1, p: 1, bgcolor: 'grey.100', borderRadius: 1 }}>
{`cd backend
source venv/bin/activate
python main.py`}
                </Typography>
              </Box>
            )}
          </Alert>
        )}

        {/* 音声レベル */}
        {isRecording && (
          <Box mb={2}>
            <Typography variant="body2" gutterBottom>
              音声レベル
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={audioLevel} 
              sx={{ height: 8, borderRadius: 4 }}
            />
          </Box>
        )}

        {/* コントロールボタン */}
        <Box display="flex" gap={2} mb={3} justifyContent="center">
          <Button
            variant="contained"
            size="large"
            startIcon={isRecording ? <MicOff /> : <Mic />}
            onClick={isRecording ? stopRecording : startRecording}
            disabled={!isConnected}
            color={isRecording ? 'error' : 'primary'}
            sx={{ px: 4 }}
          >
            {isRecording ? '録音停止' : '録音開始'}
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<Clear />}
            onClick={clearTranscriptions}
            disabled={transcriptions.length === 0}
          >
            クリア
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<Download />}
            onClick={downloadTranscriptions}
            disabled={transcriptions.length === 0}
          >
            ダウンロード
          </Button>
        </Box>

        {/* 文字起こし結果 */}
        <Card variant="outlined" sx={{ maxHeight: 400, overflow: 'auto' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              文字起こし結果
            </Typography>
            
            {transcriptions.length === 0 ? (
              <Typography color="text.secondary" style={{ fontStyle: 'italic' }}>
                録音を開始すると、ここに文字起こし結果が表示されます
              </Typography>
            ) : (
              <Box>
                {transcriptions.map((segment, index) => (
                  <Box key={index} mb={1} p={1} bgcolor="grey.50" borderRadius={1}>
                    <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                      <Typography variant="caption" color="text.secondary">
                        {segment.start.toFixed(1)}s - {segment.end.toFixed(1)}s
                      </Typography>
                      {segment.speaker && (
                        <Chip 
                          label={segment.speaker} 
                          size="small" 
                          color="primary" 
                          variant="outlined"
                        />
                      )}
                    </Box>
                    <Typography variant="body1">
                      {segment.text}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}
          </CardContent>
        </Card>

        {/* 設定ダイアログ */}
        <Dialog open={settingsOpen} onClose={() => setSettingsOpen(false)}>
          <DialogTitle>設定</DialogTitle>
          <DialogContent>
            <TextField
              label="バッファサイズ"
              type="number"
              value={bufferSize}
              onChange={(e) => setBufferSize(Number(e.target.value))}
              fullWidth
              margin="normal"
              helperText="音声処理のバッファサイズ（デフォルト: 4096）"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSettingsOpen(false)}>キャンセル</Button>
            <Button onClick={() => setSettingsOpen(false)} variant="contained">
              保存
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Container>
  );
};

export default App;
