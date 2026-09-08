import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Mic,
  BookOpen,
  Waves,
  Sparkles,
  Sliders,
  Radio,
  FileText
} from 'lucide-react';
import { Location3D } from '../types';
import { sound } from '../utils/audio';

interface LocationAudioPlayerProps {
  location: Location3D;
  onAudioStateChange?: (isPlaying: boolean) => void;
}

export const LocationAudioPlayer: React.FC<LocationAudioPlayerProps> = ({
  location,
  onAudioStateChange
}) => {
  const [activeTab, setActiveTab] = useState<'narration' | 'poem'>('narration');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [showFullTranscript, setShowFullTranscript] = useState<boolean>(false);

  // Stop previous audio when changing location
  useEffect(() => {
    stopPlayback();
    setProgress(0);
  }, [location.id]);

  // Timer simulation for progress bar when playing (optimized for ~45s audio)
  useEffect(() => {
    let interval: any = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            stopPlayback();
            return 0;
          }
          return prev + 2.2;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying]);

  const stopPlayback = () => {
    sound.stopSpeech();
    sound.stopBackgroundAmbience();
    setIsPlaying(false);
    if (onAudioStateChange) onAudioStateChange(false);
  };

  const handleTogglePlay = () => {
    if (isPlaying) {
      stopPlayback();
    } else {
      startPlayback(activeTab);
    }
  };

  const startPlayback = (tab: 'narration' | 'poem') => {
    sound.stopSpeech();
    sound.stopBackgroundAmbience();
    setIsPlaying(true);
    if (onAudioStateChange) onAudioStateChange(true);

    if (tab === 'narration') {
      const textToRead = location.storyNarration || location.fullHistory || location.shortDesc;
      // Start TTS narration at natural rate 1.0 (concise <= 50s duration)
      sound.speakVietnamese(textToRead, 1.0, 1.0, () => {
        stopPlayback();
      });
    } else if (tab === 'poem') {
      const poemText = location.poemVerse || location.shortDesc;
      sound.playTraditionalMelody();
      sound.speakVietnamese(poemText, 0.95, 1.05, () => {
        stopPlayback();
      });
    }
  };

  const handleChangeTab = (tab: 'narration' | 'poem') => {
    sound.playClick();
    setActiveTab(tab);
    setProgress(0);
    if (isPlaying) {
      startPlayback(tab);
    }
  };

  return (
    <div className="p-3.5 rounded-2xl bg-gradient-to-b from-stone-900 via-stone-900/90 to-stone-950 border border-amber-500/30 shadow-xl space-y-3">
      {/* Audio Engine Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-stone-950 shadow-md ${isPlaying ? 'animate-pulse' : ''}`}>
            <Radio className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="text-xs font-bold text-amber-200">Thuyết Minh Di Sản</h4>
              <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[9px] font-black tracking-wider uppercase border border-amber-500/30">
                AI Voice
              </span>
            </div>
            <p className="text-[10px] text-stone-400 truncate max-w-[200px]">
              {isPlaying
                ? (activeTab === 'narration' ? '🎙️ Đang phát thuyết minh lịch sử...' : '📜 Đang ngâm thơ di sản...')
                : 'Thuyết minh truyền cảm & thơ ca'}
            </p>
          </div>
        </div>

        {/* Live soundwave animation */}
        {isPlaying ? (
          <div className="flex items-end gap-1 h-5 px-2 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <span className="w-1 bg-amber-400 rounded-full animate-[pulse_0.4s_infinite] h-3.5" />
            <span className="w-1 bg-amber-300 rounded-full animate-[pulse_0.6s_infinite] h-5" />
            <span className="w-1 bg-yellow-400 rounded-full animate-[pulse_0.3s_infinite] h-2.5" />
            <span className="w-1 bg-amber-500 rounded-full animate-[pulse_0.5s_infinite] h-4.5" />
          </div>
        ) : (
          <div className="text-[10px] text-stone-500 font-mono">00:00</div>
        )}
      </div>

      {/* Mode Selectors */}
      <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-stone-950/80 border border-stone-800">
        <button
          onClick={() => handleChangeTab('narration')}
          className={`py-1.5 px-2 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'narration'
              ? 'bg-amber-500 text-stone-950 shadow-md'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
          }`}
        >
          <Mic className="w-3.5 h-3.5" />
          <span>Thuyết Minh</span>
        </button>

        <button
          onClick={() => handleChangeTab('poem')}
          className={`py-1.5 px-2 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'poem'
              ? 'bg-amber-500 text-stone-950 shadow-md'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Ngâm Thơ</span>
        </button>
      </div>

      {/* Progress Bar & Seekbar */}
      <div className="space-y-1">
        <div className="w-full h-1.5 bg-stone-950 rounded-full overflow-hidden border border-stone-800 relative cursor-pointer"
             onClick={(e) => {
               const rect = e.currentTarget.getBoundingClientRect();
               const clickX = e.clientX - rect.left;
               const newPct = Math.min(100, Math.max(0, (clickX / rect.width) * 100));
               setProgress(newPct);
             }}>
          <div
            className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-300 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between text-[9px] text-stone-500 font-mono">
          <span>{isPlaying ? `${Math.floor((progress * 0.45) / 60)}:${Math.floor((progress * 0.45) % 60).toString().padStart(2, '0')}` : '0:00'}</span>
          <span className="text-amber-400/80">00:45 (Chuẩn 50s)</span>
        </div>
      </div>

      {/* Active Content Preview / Lyrics */}
      <div className="p-2.5 rounded-xl bg-stone-950/90 border border-stone-800 text-xs">
        {activeTab === 'poem' ? (
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                <BookOpen className="w-3 h-3" />
                Thơ Cổ Di Sản ({location.name})
              </span>
            </div>
            <p className="italic text-amber-200/90 whitespace-pre-line leading-relaxed font-serif text-[11px]">
              {location.poemVerse || 'Đất lành chim đậu rạng muôn hoa,\nSông nước phương Nam đẹp thái hòa.'}
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                <Mic className="w-3 h-3" />
                Lời Dẫn Lịch Sử & Huyền Thoại
              </span>
              <button
                onClick={() => setShowFullTranscript(!showFullTranscript)}
                className="text-[10px] text-amber-400 hover:text-amber-300 font-semibold underline cursor-pointer"
              >
                {showFullTranscript ? 'Thu gọn' : 'Xem toàn văn'}
              </button>
            </div>
            <p className={`text-stone-300 text-[11px] leading-relaxed ${showFullTranscript ? '' : 'line-clamp-3'}`}>
              {location.storyNarration || location.shortDesc}
            </p>
          </div>
        )}
      </div>

      {/* Control Buttons Bar */}
      <div className="flex items-center justify-between gap-2 pt-1 border-t border-stone-800/80">
        {/* Play/Pause & Replay */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleTogglePlay}
            id="audio-player-play-btn"
            className={`px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md transition-all ${
              isPlaying
                ? 'bg-red-600 hover:bg-red-500 text-white'
                : 'bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-stone-950'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>Tạm Dừng</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Phát Ngay</span>
              </>
            )}
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setProgress(0);
              startPlayback(activeTab);
            }}
            title="Phát lại từ đầu"
            className="p-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-800 hover:text-amber-400 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Status badge */}
        <div className="flex items-center gap-1 text-[11px] text-amber-300/80 font-medium">
          <Sparkles className="w-3 h-3 text-amber-400" />
          <span>Thuyết minh tinh gọn ≤ 50s</span>
        </div>
      </div>
    </div>
  );
};
