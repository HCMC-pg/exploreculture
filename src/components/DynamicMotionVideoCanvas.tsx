import React, { useState, useEffect, useRef } from 'react';
import { 
  Compass, 
  Sparkles, 
  Wind, 
  Sun, 
  Layers, 
  Radio, 
  Maximize2, 
  RotateCw,
  Scan,
  Zap,
  ZoomIn,
  ZoomOut,
  Sliders,
  MapPin,
  Volume2,
  VolumeX,
  Eye
} from 'lucide-react';
import { AITourScene } from '../types';
import { sound } from '../utils/audio';

interface DynamicMotionVideoCanvasProps {
  scene: AITourScene;
  fallbackImage: string;
  landmarkName: string;
  isPlaying: boolean;
  resolution?: string;
  droneAlt?: string;
  className?: string;
  isCinemaMode?: boolean;
}

interface ARHotspot {
  x: number;
  y: number;
  label: string;
  category: string;
}

export const DynamicMotionVideoCanvas: React.FC<DynamicMotionVideoCanvasProps> = ({
  scene,
  fallbackImage,
  landmarkName,
  isPlaying,
  resolution = '4K UHD 60FPS',
  droneAlt = '100m AGL',
  className = '',
  isCinemaMode = false
}) => {
  // Motion camera animation parameters
  const [motionType, setMotionType] = useState<'pan_zoom_in' | 'pan_zoom_out' | 'diagonal_drift' | 'drone_flyover'>('pan_zoom_in');
  const [visionFilter, setVisionFilter] = useState<'cinematic' | 'golden_hour' | 'historical_scan' | 'night_glamour'>('cinematic');
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [manualZoom, setManualZoom] = useState<number>(1.0);
  const [showARHotspots, setShowARHotspots] = useState<boolean>(true);
  const [activeHotspot, setActiveHotspot] = useState<ARHotspot | null>(null);

  // Interactive mouse gyro offset for 3D parallax
  const [parallaxOffset, setParallaxOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Realtime simulated telemetry
  const [telemetry, setTelemetry] = useState({
    altitude: 105,
    speed: 34.2,
    pitch: -4.5,
    roll: 1.2,
    heading: 142,
    gpsLat: 10.7769,
    gpsLng: 106.7009
  });

  // Switch camera motion pattern on scene change
  useEffect(() => {
    const motions: ('pan_zoom_in' | 'pan_zoom_out' | 'diagonal_drift' | 'drone_flyover')[] = [
      'pan_zoom_in',
      'pan_zoom_out',
      'diagonal_drift',
      'drone_flyover'
    ];
    const nextMotion = motions[Math.floor(Math.random() * motions.length)];
    setMotionType(nextMotion);
    setManualZoom(1.0);
  }, [scene?.id]);

  // Live telemetry updater
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setTelemetry(prev => ({
        altitude: Math.round(100 + Math.sin(Date.now() / 1500) * 12),
        speed: Number((32 * playbackSpeed + Math.cos(Date.now() / 2000) * 4).toFixed(1)),
        pitch: Number((-5 + Math.sin(Date.now() / 1800) * 3).toFixed(1)),
        roll: Number((Math.sin(Date.now() / 2500) * 2.5).toFixed(1)),
        heading: (prev.heading + 1) % 360,
        gpsLat: Number((10.7769 + Math.sin(Date.now() / 5000) * 0.0008).toFixed(5)),
        gpsLng: Number((106.7009 + Math.cos(Date.now() / 5000) * 0.0008).toFixed(5))
      }));
    }, 400);
    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed]);

  // Handle Mouse Move for Parallax Effect
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 20; // -10 to +10px
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 20;
    setParallaxOffset({ x, y });
  };

  const handleMouseLeave = () => {
    setParallaxOffset({ x: 0, y: 0 });
  };

  // Dynamic AR Hotspots for the scene
  const hotspots: ARHotspot[] = React.useMemo(() => {
    return [
      { x: 35, y: 42, label: scene?.visualHighlight || 'Kiến Trúc Điểm Nhấn', category: 'Chi tiết di sản' },
      { x: 68, y: 30, label: 'Góc Nhìn Flycam Toàn Cảnh', category: 'Điểm cao khảo sát' },
      { x: 50, y: 65, label: landmarkName, category: 'Tọa độ chính' }
    ];
  }, [scene?.visualHighlight, landmarkName]);

  // Motion class calculations
  const getMotionAnimationClass = () => {
    if (!isPlaying) return 'scale-100 transform-none';
    switch (motionType) {
      case 'pan_zoom_in':
        return 'animate-cameraZoomIn duration-[12000ms] ease-out';
      case 'pan_zoom_out':
        return 'animate-cameraZoomOut duration-[12000ms] ease-out';
      case 'diagonal_drift':
        return 'animate-cameraDiagonal duration-[14000ms] ease-in-out';
      case 'drone_flyover':
        return 'animate-cameraFlyover duration-[15000ms] ease-in-out';
      default:
        return 'animate-pulse duration-[6000ms]';
    }
  };

  const imageUrl = scene?.snapshotUrl || fallbackImage;

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative w-full h-full overflow-hidden bg-stone-950 select-none ${className}`}
    >
      {/* 1. Cinematic Background Layer with Dynamic Ken Burns Motion & Parallax */}
      <div 
        className="absolute inset-0 overflow-hidden transition-transform duration-200 ease-out"
        style={{
          transform: `translate3d(${parallaxOffset.x}px, ${parallaxOffset.y}px, 0) scale(${manualZoom})`
        }}
      >
        <img
          src={imageUrl}
          alt={landmarkName}
          className={`w-full h-full object-cover transition-all will-change-transform ${getMotionAnimationClass()} ${
            visionFilter === 'golden_hour' ? 'sepia-[0.3] contrast-110 saturate-125' :
            visionFilter === 'historical_scan' ? 'grayscale contrast-125' :
            visionFilter === 'night_glamour' ? 'brightness-90 contrast-125 hue-rotate-15' :
            'contrast-[1.08] saturate-[1.12]'
          }`}
          style={{
            transformOrigin: motionType === 'diagonal_drift' ? 'top left' : 'center center'
          }}
        />
      </div>

      {/* 2. Dynamic Weather & Atmosphere Visual FX */}
      {/* 🌅 Golden Hour Sun Flare Beams */}
      {isPlaying && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden mix-blend-screen">
          <div className="absolute -top-16 -right-16 w-96 h-96 bg-gradient-to-br from-amber-400/40 via-yellow-500/20 to-transparent rounded-full blur-3xl animate-pulse duration-[4000ms]" />
          <div className="absolute top-1/4 left-1/3 w-72 h-72 bg-amber-500/15 rounded-full blur-2xl animate-pulse duration-[6000ms]" />
          {/* Anamorphic Horizontal Lens Streak */}
          <div className="absolute top-1/3 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent blur-sm" />
        </div>
      )}

      {/* 🌫️ Flowing Atmospheric Mist & Cloud Drift */}
      {isPlaying && (
        <div className="absolute inset-0 pointer-events-none opacity-30 mix-blend-overlay animate-subtleDrift">
          <div className="w-[200%] h-full bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12" />
        </div>
      )}

      {/* ✨ Floating Golden Heritage Particles */}
      {isPlaying && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-1/5 w-2 h-2 rounded-full bg-amber-300 shadow-[0_0_10px_#f59e0b] animate-ping duration-[3000ms]" />
          <div className="absolute top-2/3 right-1/4 w-2.5 h-2.5 rounded-full bg-yellow-200 shadow-[0_0_12px_#fbbf24] animate-pulse duration-[2500ms]" />
          <div className="absolute bottom-1/4 left-1/3 w-2 h-2 rounded-full bg-rose-300 shadow-[0_0_10px_#fb7185] animate-ping duration-[4000ms]" />
          <div className="absolute top-1/2 left-2/3 w-1.5 h-1.5 rounded-full bg-amber-100 shadow-[0_0_8px_#ffffff] animate-pulse duration-[3500ms]" />
        </div>
      )}

      {/* 📺 Historical Reconstruction Scanlines */}
      {visionFilter === 'historical_scan' && (
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.4)_50%)] bg-[length:100%_4px] opacity-60 animate-scanline" />
      )}

      {/* 3. Cinematic Film Vignette & Gradients */}
      <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-transparent to-stone-950/60 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_35%,rgba(0,0,0,0.7)_100%)] pointer-events-none" />

      {/* 4. Interactive Landmark AR Hotspot Callouts */}
      {showARHotspots && (
        <div className="absolute inset-0 pointer-events-none">
          {hotspots.map((hs, i) => (
            <div
              key={i}
              className="absolute pointer-events-auto cursor-pointer group"
              style={{ left: `${hs.x}%`, top: `${hs.y}%` }}
              onClick={() => {
                sound.playClick();
                setActiveHotspot(hs);
              }}
            >
              {/* Radar pulse rings */}
              <div className="relative flex items-center justify-center">
                <span className="absolute w-7 h-7 rounded-full bg-amber-400/40 animate-ping" />
                <span className="w-3.5 h-3.5 rounded-full bg-amber-400 border-2 border-stone-950 shadow-lg group-hover:scale-125 transition-transform" />
                
                {/* Floating Tag */}
                <div className="absolute left-5 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-xl bg-stone-950/90 backdrop-blur-md border border-amber-500/40 text-stone-100 text-[10px] font-bold whitespace-nowrap shadow-xl flex items-center gap-1.5 group-hover:border-amber-400 group-hover:text-amber-300 transition-colors">
                  <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
                  <span>{hs.label}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Active Hotspot Modal/Card Preview */}
      {activeHotspot && (
        <div className="absolute bottom-16 left-6 right-6 sm:left-auto sm:right-6 sm:max-w-xs p-3 rounded-2xl bg-stone-950/95 backdrop-blur-xl border border-amber-500/50 shadow-2xl text-stone-100 z-30 animate-fadeIn">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] uppercase font-bold text-amber-400">{activeHotspot.category}</span>
            <button 
              onClick={() => setActiveHotspot(null)} 
              className="text-stone-400 hover:text-stone-100 text-xs font-bold"
            >
              ✕
            </button>
          </div>
          <p className="text-xs font-bold text-stone-100">{activeHotspot.label}</p>
          <p className="text-[11px] text-stone-400 mt-1">
            Tọa độ này đã được hệ thống Flycam AI phân tích và ghi nhận trong hồ sơ di sản Nam Bộ.
          </p>
        </div>
      )}

      {/* 5. Live Drone Flycam Telemetry & Gimbal HUD */}
      <div className="absolute inset-0 p-3 sm:p-5 flex flex-col justify-between pointer-events-none font-mono">
        {/* Top HUD: Flight Mode, Resolution, Alt & Speed */}
        <div className="flex items-center justify-between text-xs text-amber-300/90 drop-shadow">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-stone-950/80 backdrop-blur-md border border-amber-500/40">
              <span className={`w-2.5 h-2.5 rounded-full ${isPlaying ? 'bg-red-500 animate-ping' : 'bg-stone-500'}`} />
              <span className="font-bold uppercase tracking-wider text-[11px]">
                {isPlaying ? 'REC AI FLYCAM 4K' : 'STANDBY'}
              </span>
            </div>

            <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-xl bg-stone-950/80 backdrop-blur-md border border-amber-500/30 text-[10px]">
              <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
              <span>GIMBAL 3-AXIS 360°</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px]">
            <div className="px-2.5 py-1 rounded-xl bg-stone-950/80 backdrop-blur-md border border-amber-500/40 flex items-center gap-2">
              <span className="text-stone-400">ALT:</span>
              <span className="text-amber-300 font-bold">{telemetry.altitude}m</span>
              <span className="text-stone-500">|</span>
              <span className="text-stone-400">SPD:</span>
              <span className="text-cyan-300 font-bold">{telemetry.speed} km/h</span>
            </div>
            <div className="px-2 py-1 rounded-xl bg-amber-500 text-stone-950 font-black text-[10px] hidden md:block">
              {resolution}
            </div>
          </div>
        </div>

        {/* Center Drone Crosshair & Horizon Indicator */}
        <div className="absolute inset-0 m-auto w-36 h-36 flex items-center justify-center pointer-events-none opacity-40">
          {/* Circular reticle */}
          <div className="w-28 h-28 rounded-full border border-amber-400/60 border-dashed animate-spin-slow" />
          {/* Horizontal Level Line */}
          <div 
            className="absolute w-32 h-0.5 bg-amber-400/80 transition-transform duration-300"
            style={{ transform: `rotate(${telemetry.roll}deg)` }}
          />
          {/* Center Point */}
          <div className="absolute w-2.5 h-2.5 rounded-full bg-red-400 ring-2 ring-amber-300" />
          {/* Pitch brackets */}
          <div className="absolute top-2 w-4 h-1 border-t border-amber-400" />
          <div className="absolute bottom-2 w-4 h-1 border-b border-amber-400" />
        </div>

        {/* Bottom Coordinates & Camera Angle Banner */}
        <div className="flex items-end justify-between text-[10px] text-amber-200/80 drop-shadow">
          <div className="flex items-center gap-2">
            <div className="px-2.5 py-1 rounded-xl bg-stone-950/80 backdrop-blur-md border border-amber-500/30">
              <span className="font-bold text-amber-400">GPS: </span>
              <span>{telemetry.gpsLat}° N, {telemetry.gpsLng}° E</span>
            </div>
            <div className="px-2 py-1 rounded-xl bg-stone-950/80 backdrop-blur-md border border-amber-500/30 hidden sm:block">
              <span>HDG: {telemetry.heading}° SE</span>
            </div>
          </div>

          <div className="px-2.5 py-1 rounded-xl bg-stone-950/80 backdrop-blur-md border border-amber-500/30 font-sans font-bold text-amber-300">
            {scene?.cameraLabel || 'Flycam Khảo Sát Toàn Cảnh'}
          </div>
        </div>
      </div>

      {/* 6. Interactive Video Controls Overlay (Cinema Mode) */}
      {isCinemaMode && (
        <div className="absolute top-16 right-4 flex flex-col gap-2 z-20">
          {/* Vision Filters */}
          <div className="flex flex-col gap-1">
            {[
              { id: 'cinematic', label: '🎬 4K Cinema', icon: Zap },
              { id: 'golden_hour', label: '🌅 Nắng Vàng', icon: Sun },
              { id: 'historical_scan', label: '📜 Quét Cổ', icon: Scan },
              { id: 'night_glamour', label: '✨ Huyền Ảo', icon: Sparkles }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => { sound.playClick(); setVisionFilter(f.id as any); }}
                className={`px-2.5 py-1 rounded-xl text-[10px] font-bold flex items-center gap-1.5 transition-all ${
                  visionFilter === f.id
                    ? 'bg-amber-500 text-stone-950 shadow-md font-extrabold scale-105'
                    : 'bg-stone-950/80 text-stone-300 hover:bg-stone-900 border border-stone-800 backdrop-blur-md'
                }`}
              >
                <span>{f.label}</span>
              </button>
            ))}
          </div>

          {/* Zoom In / Zoom Out Controls */}
          <div className="flex items-center gap-1 bg-stone-950/85 backdrop-blur-md p-1 rounded-xl border border-stone-800">
            <button
              onClick={() => {
                sound.playClick();
                setManualZoom(z => Math.min(z + 0.15, 1.6));
              }}
              className="p-1 rounded-lg hover:bg-stone-800 text-stone-300 hover:text-amber-300 transition-colors"
              title="Phóng to camera"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <span className="text-[9px] font-mono text-amber-400 font-bold px-0.5">
              {manualZoom.toFixed(1)}x
            </span>
            <button
              onClick={() => {
                sound.playClick();
                setManualZoom(z => Math.max(z - 0.15, 0.9));
              }}
              className="p-1 rounded-lg hover:bg-stone-800 text-stone-300 hover:text-amber-300 transition-colors"
              title="Thu nhỏ camera"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* AR Callouts Toggle */}
          <button
            onClick={() => {
              sound.playClick();
              setShowARHotspots(v => !v);
            }}
            className={`px-2.5 py-1 rounded-xl text-[10px] font-bold flex items-center gap-1 border transition-all ${
              showARHotspots
                ? 'bg-amber-500/20 text-amber-300 border-amber-400/50'
                : 'bg-stone-950/80 text-stone-400 border-stone-800'
            }`}
          >
            <Eye className="w-3 h-3" />
            <span>AR Điểm Nhấn</span>
          </button>
        </div>
      )}
    </div>
  );
};
