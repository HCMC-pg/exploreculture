import React, { useState, useEffect } from 'react';
import {
  Video,
  Play,
  Pause,
  Maximize2,
  Volume2,
  VolumeX,
  Compass,
  Layers,
  Sparkles,
  Eye,
  SkipForward,
  SkipBack,
  Clapperboard,
  Tv,
  Film
} from 'lucide-react';
import { Location3D, AITourScene } from '../types';
import { DynamicMotionVideoCanvas } from './DynamicMotionVideoCanvas';
import { sound } from '../utils/audio';

interface AITourVideoPlayerProps {
  location: Location3D;
  onOpenFullscreenCinema?: (initialSceneIdx?: number) => void;
}

export const AITourVideoPlayer: React.FC<AITourVideoPlayerProps> = ({
  location,
  onOpenFullscreenCinema
}) => {
  const videoData = location.aiTourVideo;
  const scenes = videoData?.scenes || [];
  
  const [activeSceneIdx, setActiveSceneIdx] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [sceneProgress, setSceneProgress] = useState<number>(0);

  const currentScene: AITourScene | undefined = scenes[activeSceneIdx] || scenes[0];

  // Reset scene on landmark change
  useEffect(() => {
    setActiveSceneIdx(0);
    setIsPlaying(false);
    setSceneProgress(0);
    sound.stopSpeech();
  }, [location.id]);

  // Video progress timer & auto advance to next scene
  useEffect(() => {
    let interval: any = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setSceneProgress(prev => {
          if (prev >= 100) {
            // Next scene
            if (activeSceneIdx < scenes.length - 1) {
              setActiveSceneIdx(s => s + 1);
              return 0;
            } else {
              // Loop or finish
              setIsPlaying(false);
              return 100;
            }
          }
          return prev + 2.5; // ~20s per scene
        });
      }, 500);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, activeSceneIdx, scenes.length]);

  // Voice narration when scene changes while playing
  useEffect(() => {
    if (isPlaying && currentScene && !isMuted) {
      sound.stopSpeech();
      sound.speakVietnamese(currentScene.narratorVoiceover, 1.0, 1.0);
    }
  }, [isPlaying, activeSceneIdx, isMuted]);

  const handleTogglePlay = () => {
    sound.playClick();
    const nextState = !isPlaying;
    setIsPlaying(nextState);
    if (nextState) {
      if (currentScene && !isMuted) {
        sound.speakVietnamese(currentScene.narratorVoiceover, 1.0, 1.0);
      }
    } else {
      sound.stopSpeech();
    }
  };

  const handleSelectScene = (index: number) => {
    sound.playClick();
    setActiveSceneIdx(index);
    setSceneProgress(0);
    if (isPlaying) {
      sound.stopSpeech();
      if (scenes[index] && !isMuted) {
        sound.speakVietnamese(scenes[index].narratorVoiceover, 1.0, 1.0);
      }
    }
  };

  if (!videoData || scenes.length === 0) {
    return null;
  }

  return (
    <div className="p-3.5 rounded-2xl bg-gradient-to-b from-stone-900 via-stone-900/90 to-stone-950 border border-amber-500/30 shadow-xl space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-xl bg-gradient-to-tr from-rose-500 to-amber-500 text-white shadow-md ${isPlaying ? 'animate-pulse' : ''}`}>
            <Clapperboard className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="text-xs font-bold text-amber-200">Video Flycam AI Chuyển Động 4K</h4>
              <span className="px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 text-[9px] font-black tracking-wider uppercase border border-rose-500/30 animate-pulse">
                Dynamic 360°
              </span>
            </div>
            <p className="text-[10px] text-stone-400">
              Chuyển động đa tầng Parallax & Thuyết minh viên ảo AI
            </p>
          </div>
        </div>

        {/* Fullscreen Cinema Mode Button */}
        {onOpenFullscreenCinema && (
          <button
            onClick={() => {
              sound.playClick();
              onOpenFullscreenCinema(activeSceneIdx);
            }}
            className="px-2.5 py-1 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[10px] font-bold flex items-center gap-1 transition-all hover:scale-105"
            title="Mở toàn màn hình chế độ Rạp Chiếu Phim AI"
          >
            <Tv className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Rạp Chiếu AI</span>
          </button>
        )}
      </div>

      {/* Interactive Dynamic Motion Video Canvas */}
      <div className="relative h-48 rounded-2xl overflow-hidden border border-amber-500/40 bg-black group shadow-2xl">
        <DynamicMotionVideoCanvas
          scene={currentScene}
          fallbackImage={location.coverImage || location.thumbnail}
          landmarkName={location.name}
          isPlaying={isPlaying}
          resolution={videoData.resolution}
          droneAlt={videoData.droneAlt}
        />

        {/* Play / Pause Center Overlay Button if Paused */}
        {!isPlaying && (
          <button
            onClick={handleTogglePlay}
            className="absolute inset-0 m-auto w-12 h-12 rounded-2xl bg-amber-500/90 hover:bg-amber-400 text-stone-950 flex items-center justify-center shadow-2xl backdrop-blur-md transition-all hover:scale-110 z-20"
            title="Bắt đầu tour tham quan AI chuyển động"
          >
            <Play className="w-6 h-6 fill-stone-950 translate-x-0.5" />
          </button>
        )}

        {/* Minimal Corner Scene Badge (Subtitle overlay removed as per user preference) */}
        <div className="absolute top-2 left-2 px-2.5 py-1 rounded-lg bg-stone-950/80 backdrop-blur-md border border-amber-500/30 z-20 flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-yellow-400" />
          <span className="text-[10px] font-bold text-amber-300">{currentScene?.name}</span>
          <span className="text-[9px] font-mono text-stone-400 ml-1">({currentScene?.timeCode})</span>
        </div>

        {/* Scene progress scrubber at bottom edge */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-stone-950/80 z-20">
          <div
            className="h-full bg-gradient-to-r from-rose-500 via-amber-400 to-yellow-300 transition-all duration-300"
            style={{ width: `${sceneProgress}%` }}
          />
        </div>
      </div>

      {/* Scene Selector Strip */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[10px] text-stone-400 px-0.5">
          <span className="font-bold text-amber-300">Phân Cảnh Tham Quan ({scenes.length})</span>
          <span>Nhấn để đổi góc quay flycam</span>
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          {scenes.map((scene, idx) => (
            <button
              key={scene.id}
              onClick={() => handleSelectScene(idx)}
              className={`p-2 rounded-xl text-left text-xs transition-all border ${
                activeSceneIdx === idx
                  ? 'bg-amber-500/20 border-amber-400 text-amber-200 shadow-md ring-1 ring-amber-400/50'
                  : 'bg-stone-950/70 border-stone-800 text-stone-400 hover:border-stone-700 hover:text-stone-200'
              }`}
            >
              <div className="flex items-center justify-between mb-0.5">
                <span className="font-bold text-[10px] truncate">{scene.name.split(':')[0]}</span>
                <span className="text-[9px] font-mono opacity-70">{scene.timeCode.split('-')[0].trim()}</span>
              </div>
              <p className="text-[10px] text-stone-300 truncate">{scene.visualHighlight}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Video Controls Bar */}
      <div className="flex items-center justify-between pt-1 border-t border-stone-800/80">
        <div className="flex items-center gap-2">
          <button
            onClick={handleTogglePlay}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md transition-all ${
              isPlaying
                ? 'bg-rose-600 hover:bg-rose-500 text-white'
                : 'bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-stone-950'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>Tạm Dừng Tour</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Xem Tour Động AI</span>
              </>
            )}
          </button>

          <button
            onClick={() => {
              if (activeSceneIdx > 0) handleSelectScene(activeSceneIdx - 1);
            }}
            disabled={activeSceneIdx === 0}
            className="p-1.5 rounded-xl bg-stone-900 text-stone-300 disabled:opacity-40 border border-stone-800 hover:text-amber-400"
            title="Cảnh trước"
          >
            <SkipBack className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => {
              if (activeSceneIdx < scenes.length - 1) handleSelectScene(activeSceneIdx + 1);
            }}
            disabled={activeSceneIdx === scenes.length - 1}
            className="p-1.5 rounded-xl bg-stone-900 text-stone-300 disabled:opacity-40 border border-stone-800 hover:text-amber-400"
            title="Cảnh kế tiếp"
          >
            <SkipForward className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Sound toggle & Fullscreen */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              setIsMuted(!isMuted);
              if (!isMuted) sound.stopSpeech();
            }}
            className="p-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-800 hover:text-amber-400"
            title={isMuted ? 'Bật âm thanh thuyết minh' : 'Tắt âm thanh'}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 text-stone-500" /> : <Volume2 className="w-3.5 h-3.5 text-amber-400" />}
          </button>

          {onOpenFullscreenCinema && (
            <button
              onClick={() => {
                sound.playClick();
                onOpenFullscreenCinema(activeSceneIdx);
              }}
              className="p-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-800 hover:text-amber-400"
              title="Xem toàn màn hình"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
