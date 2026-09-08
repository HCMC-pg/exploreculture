import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Compass, 
  MapPin, 
  Sparkles, 
  CheckCircle2, 
  Info, 
  Layers, 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  Volume2, 
  VolumeX, 
  Play, 
  Camera, 
  Users, 
  Navigation, 
  Footprints, 
  Ship, 
  X, 
  ExternalLink, 
  Maximize2, 
  Radio
} from 'lucide-react';
import { Location3D } from '../types';
import { LOCATIONS } from '../data/locations';
import { sound } from '../utils/audio';
import { LocationAudioPlayer } from './LocationAudioPlayer';
import { AITourVideoPlayer } from './AITourVideoPlayer';
import { AITourCinemaModal } from './AITourCinemaModal';

interface Map3DViewProps {
  locations?: Location3D[];
  selectedLocation: Location3D | null;
  onSelectLocation: (loc: Location3D | null) => void;
  onStartQuest: (loc: Location3D) => void;
  onOpenAI: (prompt?: string) => void;
  onOpenAR?: () => void;
  onOpenJournal?: (loc?: Location3D) => void;
  completedQuests?: string[];
  userCompletedQuests?: string[];
}

type AudioMode = 'narration' | 'poem';

// Live community activity events ticker
const LIVE_ACTIVITY_EVENTS = [
  'Lữ khách Minh Khôi vừa hoàn thành nhiệm vụ tại Chợ Bến Thành (+50 LP)',
  'Thảo Vy vừa chụp ảnh thực tế AR tại Bến Nhà Rồng (+100 LP)',
  'Hoàng Nam vừa mở khóa huy hiệu "Đất Thép Thành Đồng" tại Củ Chi',
  'Nhóm bạn Trúc Linh đang nghe hòa tấu Đờn Ca Tài Tử Nam Bộ',
  'Đức Anh vừa gửi một bài cảm nghĩ di sản tại Bưu Điện Trung Tâm',
  'Hương Giang vừa khám phá Tượng Phật nằm dài 52m tại Chùa Hội Khánh',
  'Quang Hải vừa check-in hoàng hôn tại Bãi Sau Vũng Tàu'
];

export const Map3DView: React.FC<Map3DViewProps> = ({
  locations,
  selectedLocation,
  onSelectLocation,
  onStartQuest,
  onOpenAI,
  onOpenAR,
  onOpenJournal,
  completedQuests = [],
  userCompletedQuests = []
}) => {
  const activeQuestsDone = completedQuests.length > 0 ? completedQuests : userCompletedQuests;

  // 3D Canvas Transform State
  const [zoom, setZoom] = useState<number>(1.0);
  const [tilt, setTilt] = useState<number>(36);
  const [rotation, setRotation] = useState<number>(0);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number; panX: number; panY: number }>({
    x: 0,
    y: 0,
    panX: 0,
    panY: 0
  });

  // Touch tracking for pinch-to-zoom on mobile
  const touchStartDist = useRef<number | null>(null);
  const touchStartZoom = useRef<number>(1.0);

  // Filters & View Controls
  const [selectedProvince, setSelectedProvince] = useState<string>('all');
  const [liveEventIndex, setLiveEventIndex] = useState<number>(0);

  // AI Tour Video Cinema Modal State
  const [isCinemaModalOpen, setIsCinemaModalOpen] = useState<boolean>(false);
  const [cinemaSceneIdx, setCinemaSceneIdx] = useState<number>(0);

  // Audio Storytelling & Narration State
  const [autoPlayNarration, setAutoPlayNarration] = useState<boolean>(() => {
    return localStorage.getItem('saigon_auto_audio') !== 'false';
  });
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [audioMode, setAudioMode] = useState<AudioMode>('narration');

  // Player Position & Travel Simulation
  const [playerPos, setPlayerPos] = useState<{ x: number; y: number }>({ x: 46, y: 48 });
  const [isTraveling, setIsTraveling] = useState<boolean>(false);
  const [travelMode, setTravelMode] = useState<'water' | 'road'>('road');

  // Focus / Compact Mode
  const [isFocusMode, setIsFocusMode] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Filtered locations based on selected province
  const locationList = locations || LOCATIONS || [];
  const filteredLocations = locationList.filter(loc => {
    return selectedProvince === 'all' || (loc.province && loc.province === selectedProvince);
  });

  // Rotate live community activity events ticker
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveEventIndex(prev => (prev + 1) % LIVE_ACTIVITY_EVENTS.length);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  // Center camera smoothly onto a location
  const centerCameraOnLocation = useCallback((loc: Location3D) => {
    const offsetX = -(loc.x - 50) * 8.5;
    const offsetY = -(loc.y - 50) * 7.5;
    setPan({ x: Math.max(-350, Math.min(350, offsetX)), y: Math.max(-280, Math.min(280, offsetY)) });
  }, []);

  // Stop any playing audio
  const stopAllAudio = useCallback(() => {
    sound.stopSpeech();
    sound.stopTraditionalMusic();
    sound.stopBackgroundAmbience();
    setIsPlayingAudio(false);
  }, []);

  // Play audio based on mode (calibrated <= 50s duration)
  const playAudioForLocation = useCallback((loc: Location3D, mode: AudioMode) => {
    stopAllAudio();
    setIsPlayingAudio(true);
    setAudioMode(mode);

    if (mode === 'narration') {
      const textToRead = loc.storyNarration || `${loc.name}, ${loc.shortDesc} ${loc.culturalSignificance}`;
      sound.playDanTranhNote(293.66, 0, 0.2);
      sound.speakText(
        textToRead,
        () => {
          setIsPlayingAudio(false);
        },
        1.0,
        1.0
      );
    } else if (mode === 'poem') {
      const poemText = loc.poemVerse || `Bóng xưa lưu dấu phương Nam,\nDi sản ngàn năm thắm sắc vàng.\nKhắc ghi câu hát người xưa lại,\nSống mãi muôn đời tiếng rộn vang.`;
      sound.playDanTranhNote(440.0, 0, 0.25);
      sound.playSongLangBeat(0.2);
      sound.playSongLangBeat(2.0);
      sound.speakText(
        poemText,
        () => {
          setIsPlayingAudio(false);
        },
        0.95,
        1.05
      );
    }
  }, [stopAllAudio]);

  // Handle travel animation and state
  const travelToLocation = useCallback((loc: Location3D, autoAudio: boolean = autoPlayNarration) => {
    setIsTraveling(true);
    const isWaterDestination = loc.category === 'nature_coastal' || loc.id === 'loc_ben_nha_rong';
    setTravelMode(isWaterDestination ? 'water' : 'road');
    
    sound.playTravelStart();
    centerCameraOnLocation(loc);

    const steps = 14;
    let currentStep = 0;
    const startX = playerPos.x;
    const startY = playerPos.y;
    const deltaX = (loc.x - startX) / steps;
    const deltaY = (loc.y - startY) / steps;

    const interval = setInterval(() => {
      currentStep++;
      if (currentStep <= steps) {
        setPlayerPos({
          x: startX + deltaX * currentStep,
          y: startY + deltaY * currentStep
        });
      } else {
        clearInterval(interval);
        setPlayerPos({ x: loc.x, y: loc.y });
        setIsTraveling(false);
        sound.playTravelArrive();

        if (autoAudio) {
          playAudioForLocation(loc, 'narration');
        }
      }
    }, 45);
  }, [autoPlayNarration, centerCameraOnLocation, playAudioForLocation, playerPos]);

  // Click on a landmark pin
  const handleLocationClick = (loc: Location3D, e?: React.MouseEvent | React.TouchEvent) => {
    if (e) {
      e.stopPropagation();
    }
    sound.playClick();
    onSelectLocation(loc);
    centerCameraOnLocation(loc);

    if (autoPlayNarration && (!selectedLocation || selectedLocation.id !== loc.id)) {
      playAudioForLocation(loc, 'narration');
    }
  };

  // Toggle auto play narration preference
  const toggleAutoPlayNarration = () => {
    const nextVal = !autoPlayNarration;
    setAutoPlayNarration(nextVal);
    localStorage.setItem('saigon_auto_audio', String(nextVal));
    sound.playClick();
  };

  // Check if location is completed
  const isLocationCompleted = (loc: Location3D) => {
    return activeQuestsDone.some(qId => loc.questIds?.includes(qId));
  };

  // Reset Camera View
  const resetCamera = () => {
    sound.playClick();
    setZoom(1.0);
    setTilt(36);
    setRotation(0);
    setPan({ x: 0, y: 0 });
  };

  // Mouse Drag Handlers for 3D Panning
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX,
      y: e.clientY,
      panX: pan.x,
      panY: pan.y
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    setPan({
      x: dragStart.panX + dx,
      y: dragStart.panY + dy
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Mobile Touch Gestures: Smooth 1-finger Pan & 2-finger Pinch-to-Zoom
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        panX: pan.x,
        panY: pan.y
      });
    } else if (e.touches.length === 2) {
      setIsDragging(false);
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      touchStartDist.current = Math.sqrt(dx * dx + dy * dy);
      touchStartZoom.current = zoom;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && isDragging) {
      const dx = e.touches[0].clientX - dragStart.x;
      const dy = e.touches[0].clientY - dragStart.y;
      setPan({
        x: dragStart.panX + dx,
        y: dragStart.panY + dy
      });
    } else if (e.touches.length === 2 && touchStartDist.current !== null) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const currentDist = Math.sqrt(dx * dx + dy * dy);
      const scaleFactor = currentDist / touchStartDist.current;
      const newZoom = Math.max(0.65, Math.min(2.2, touchStartZoom.current * scaleFactor));
      setZoom(newZoom);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    touchStartDist.current = null;
  };

  return (
    <div className="relative w-full h-[calc(100vh-4rem)] flex flex-col md:flex-row bg-stone-950 overflow-hidden select-none">
      {/* Real-time Community Ticker Bar */}
      <div className="absolute top-0 left-0 right-0 z-30 bg-stone-950/90 border-b border-amber-500/30 px-3 py-1 flex items-center justify-between text-[11px] text-amber-200/90 backdrop-blur-md">
        <div className="flex items-center gap-2 overflow-hidden">
          <span className="flex items-center gap-1 font-bold text-red-400 uppercase tracking-wider shrink-0">
            <Radio className="w-3.5 h-3.5 text-red-500 animate-pulse" />
            Trực Tuyến:
          </span>
          <p className="truncate text-stone-300 transition-all duration-500">
            {LIVE_ACTIVITY_EVENTS[liveEventIndex]}
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-3 shrink-0 text-stone-400 text-[10px]">
          <span className="flex items-center gap-1 text-amber-400">
            <Users className="w-3 h-3" />
            2,480 lữ khách
          </span>
          <span>•</span>
          <span className="text-emerald-400 font-bold">21 Di Sản Nam Bộ</span>
        </div>
      </div>

      {/* Top Map Control Bar (Mobile-Optimized Horizontal Scroll Pills) */}
      <div className="absolute top-9 left-2 right-2 sm:left-4 sm:right-4 z-20 flex items-center gap-1.5 overflow-x-auto no-scrollbar pointer-events-auto py-1">
        {/* Province Quick Filter Pills */}
        <div className="flex items-center bg-stone-900/95 rounded-xl p-0.5 border border-amber-500/30 backdrop-blur-md shadow-lg text-xs shrink-0">
          {[
            { id: 'all', label: 'Tất Cả (21)' },
            { id: 'TP. Hồ Chí Minh', label: 'TP.HCM' },
            { id: 'Bình Dương', label: 'Bình Dương' },
            { id: 'Bà Rịa - Vũng Tàu', label: 'BR-VT' }
          ].map(p => (
            <button
              key={p.id}
              onClick={() => {
                sound.playClick();
                setSelectedProvince(p.id);
              }}
              className={`min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-colors ${
                selectedProvince === p.id 
                  ? 'bg-amber-500 text-stone-950 font-bold shadow-sm' 
                  : 'text-stone-300 hover:text-amber-300'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Focus / Expand Map Mode Toggle */}
        <button
          onClick={() => {
            sound.playClick();
            setIsFocusMode(!isFocusMode);
          }}
          className={`min-h-[36px] px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 shadow-lg backdrop-blur-md shrink-0 transition-all ${
            isFocusMode 
              ? 'bg-amber-500 text-stone-950 border-amber-300' 
              : 'bg-stone-900/95 text-stone-300 border-stone-800 hover:text-amber-300'
          }`}
          title="Thu gọn thanh chi tiết để mở rộng toàn cảnh Bản Đồ 3D"
        >
          <Layers className="w-3.5 h-3.5 shrink-0" />
          <span className="whitespace-nowrap">{isFocusMode ? 'Mở Chi Tiết' : 'Toàn Cảnh 3D'}</span>
        </button>
      </div>

      {/* 3D Map Canvas Stage */}
      <div 
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="relative flex-1 h-full cursor-grab active:cursor-grabbing bg-gradient-to-b from-stone-900 via-stone-900 to-stone-950 overflow-hidden perspective-1000 touch-none"
      >
        {/* Atmospheric Glow */}
        <div className="absolute inset-0 pointer-events-none opacity-40">
          <div className="absolute w-96 h-96 -top-20 -left-20 bg-amber-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute w-96 h-96 bottom-10 right-10 bg-cyan-600/15 rounded-full blur-3xl" />
        </div>

        {/* The 3D Rotatable & Tiltable Isometric Surface */}
        <div 
          className="absolute top-1/2 left-1/2 w-[1200px] h-[1000px] -ml-[600px] -mt-[500px] transition-transform duration-150 ease-out preserve-3d"
          style={{
            transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${zoom}) rotateX(${tilt}deg) rotateZ(${rotation}deg)`,
          }}
        >
          {/* Map Base Terrain Board */}
          <div className="relative w-full h-full rounded-3xl bg-stone-900/95 border-4 border-amber-900/60 shadow-[0_50px_100px_rgba(0,0,0,0.85)] overflow-hidden">
            {/* Grid Pattern */}
            <div 
              className="absolute inset-0 opacity-15"
              style={{
                backgroundImage: 'linear-gradient(to right, rgba(245, 158, 11, 0.3) 1px, transparent 1px), linear-gradient(to bottom, rgba(245, 158, 11, 0.3) 1px, transparent 1px)',
                backgroundSize: '40px 40px'
              }}
            />

            {/* Coastal Vung Tau Sea Waters Base (Bottom-Right) */}
            <div className="absolute bottom-0 right-0 w-[440px] h-[360px] bg-gradient-to-tl from-cyan-950/90 via-sky-900/50 to-transparent rounded-tl-full border-t-2 border-l-2 border-cyan-500/25 pointer-events-none" />

            {/* Dầu Tiếng Lake Base (Top-Left) */}
            <div className="absolute top-0 left-4 w-[280px] h-[180px] bg-gradient-to-br from-sky-950/80 via-blue-900/40 to-transparent rounded-br-full border-b-2 border-r-2 border-sky-500/20 pointer-events-none" />

            {/* SVG Transit Routes & Waterways System */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="riverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#0284c7" stopOpacity="0.85" />
                  <stop offset="50%" stopColor="#0369a1" stopOpacity="0.95" />
                  <stop offset="100%" stopColor="#082f49" stopOpacity="0.85" />
                </linearGradient>
                <filter id="waterGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Sông Sài Gòn & Sông Đồng Nai */}
              <path
                d="M 120 180 C 220 220, 260 320, 360 420 S 520 480, 620 540 S 780 720, 960 840"
                fill="none"
                stroke="url(#riverGrad)"
                strokeWidth="16"
                strokeLinecap="round"
                filter="url(#waterGlow)"
                className="opacity-90"
              />

              {/* Tuyến Du Thuyền Di Sản Sài Gòn - Vũng Tàu */}
              <path
                d="M 540 550 C 640 600, 720 700, 880 780"
                fill="none"
                stroke="#38bdf8"
                strokeWidth="2.5"
                strokeDasharray="6 6"
                className="opacity-80 animate-pulse"
              />

              {/* Tuyến Hành Trình Di Sản Đường Bộ Nối 3 Tỉnh */}
              <path
                d="M 280 260 L 390 380 L 520 490 L 610 520 L 760 620 L 860 760"
                fill="none"
                stroke="#f59e0b"
                strokeWidth="2"
                strokeDasharray="4 4"
                className="opacity-60"
              />
            </svg>

            {/* Regional Labels on Map Surface */}
            <div className="absolute top-8 left-12 font-['Cinzel',serif] font-bold text-amber-500/40 text-lg tracking-widest pointer-events-none">
              BÌNH DƯƠNG (ĐẤT THỦ & LÀNG GỐM)
            </div>
            <div className="absolute top-1/2 left-1/3 font-['Cinzel',serif] font-bold text-amber-400/40 text-xl tracking-widest pointer-events-none -translate-y-1/2">
              SÀI GÒN - TP. HỒ CHÍ MINH (TRUNG TÂM DI SẢN)
            </div>
            <div className="absolute bottom-16 right-16 font-['Cinzel',serif] font-bold text-cyan-400/40 text-lg tracking-widest pointer-events-none text-right">
              BÀ RỊA - VŨNG TÀU & CÔN ĐẢO (BIỂN ĐẢO HÀO HÙNG)
            </div>

            {/* Render All 21 Heritage 3D Landmark Pins */}
            {filteredLocations.map((loc) => {
              const isSelected = selectedLocation?.id === loc.id;
              const isCompleted = isLocationCompleted(loc);
              const categoryEmoji = 
                loc.category === 'nature_coastal' ? '🌊' :
                loc.category === 'craft_trade' ? '🎨' :
                loc.category === 'spiritual' ? '🛕' :
                loc.category === 'culinary_living' ? '🍜' :
                loc.id === 'loc_ba_son' || loc.id === 'loc_ben_nha_rong' ? '⚓' : '🏛️';

              return (
                <div
                  key={loc.id}
                  onClick={(e) => handleLocationClick(loc, e)}
                  style={{
                    left: `${loc.x}%`,
                    top: `${loc.y}%`,
                  }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300 z-20 group ${
                    isSelected ? 'scale-125 z-30' : 'hover:scale-115'
                  }`}
                >
                  {/* Floating Marker Card */}
                  <div className="flex flex-col items-center">
                    {/* Landmark Name & Status Pill */}
                    <div 
                      className={`px-2.5 py-1 rounded-xl text-[11px] font-bold shadow-xl backdrop-blur-md flex items-center gap-1.5 whitespace-nowrap mb-1 transition-all border ${
                        isSelected
                          ? 'bg-amber-500 text-stone-950 border-amber-300 scale-105 shadow-amber-500/40'
                          : isCompleted
                            ? 'bg-emerald-950/90 text-emerald-200 border-emerald-500/50'
                            : 'bg-stone-900/95 text-stone-200 border-amber-500/40 group-hover:border-amber-400'
                      }`}
                    >
                      <span className="text-xs">{categoryEmoji}</span>
                      <span className="font-semibold">{loc.name}</span>
                      {isCompleted ? (
                        <CheckCircle2 className={`w-3.5 h-3.5 ${isSelected ? 'text-stone-950' : 'text-emerald-400'} shrink-0`} />
                      ) : (
                        <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
                          +50 LP
                        </span>
                      )}
                    </div>

                    {/* 3D Pin Icon Body */}
                    <div 
                      className={`relative w-11 h-11 rounded-2xl p-1 shadow-2xl flex items-center justify-center transition-all ${
                        isSelected 
                          ? 'bg-gradient-to-tr from-amber-600 via-amber-400 to-yellow-300 ring-4 ring-amber-400/50' 
                          : isCompleted
                            ? 'bg-gradient-to-tr from-emerald-700 to-stone-800 border-2 border-emerald-400'
                            : 'bg-gradient-to-tr from-stone-800 to-stone-700 border border-amber-500/50 group-hover:border-amber-400'
                      }`}
                    >
                      <img 
                        src={loc.thumbnail || loc.coverImage} 
                        alt={loc.name} 
                        className="w-full h-full object-cover rounded-xl"
                      />

                      {/* Playing Audio Story Indicator */}
                      {isSelected && isPlayingAudio && (
                        <div className="absolute -bottom-1.5 -right-1.5 w-5 h-5 bg-amber-500 rounded-full border-2 border-stone-900 flex items-center justify-center shadow-md animate-pulse">
                          <Volume2 className="w-3 h-3 text-stone-950" />
                        </div>
                      )}

                      {/* Unexplored Landmark Attention Ping */}
                      {!isCompleted && !isSelected && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full border border-stone-900 shadow animate-ping" />
                      )}
                    </div>

                    {/* Ground Marker Radar Ripple */}
                    <div className={`w-9 h-4 rounded-full blur-xs -mt-1 transition-all ${
                      isSelected ? 'bg-amber-400/60 scale-125' : 'bg-amber-500/30 group-hover:bg-amber-400/50'
                    }`} />
                  </div>
                </div>
              );
            })}

            {/* Real-time Player 3D Avatar Marker */}
            <div
              style={{
                left: `${playerPos.x}%`,
                top: `${playerPos.y}%`,
                transition: 'left 0.85s cubic-bezier(0.34, 1.56, 0.64, 1), top 0.85s cubic-bezier(0.34, 1.56, 0.64, 1)'
              }}
              className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none z-30 flex flex-col items-center"
            >
              {/* Player Tag */}
              <div className="px-2 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-bold shadow-lg border border-red-300 animate-bounce flex items-center gap-1">
                {travelMode === 'water' ? <Ship className="w-3 h-3" /> : <Footprints className="w-3 h-3" />}
                <span>{isTraveling ? 'Đang du hành...' : 'Lữ khách ở đây'}</span>
              </div>
              {/* Avatar Icon */}
              <div className={`w-9 h-9 rounded-full bg-gradient-to-tr from-rose-500 to-amber-400 p-0.5 shadow-2xl ${isTraveling ? 'scale-125 transition-transform' : ''}`}>
                <div className="w-full h-full bg-stone-950 rounded-full flex items-center justify-center">
                  <Navigation className={`w-5 h-5 text-amber-300 rotate-45 ${isTraveling ? 'animate-spin' : ''}`} />
                </div>
              </div>
              <div className="w-10 h-10 rounded-full bg-red-500/20 animate-ping -mt-8" />
            </div>
          </div>
        </div>

        {/* 3D Map Floating Touch HUD Controls (Bottom Right - 44px touch targets) */}
        <div className="absolute bottom-4 right-3 sm:right-4 z-20 flex flex-col gap-1.5">
          {/* Reset Camera */}
          <button
            onClick={resetCamera}
            className="w-10 h-10 rounded-xl bg-stone-900/95 hover:bg-stone-800 border border-stone-700 text-stone-300 hover:text-amber-400 shadow-xl transition-all flex items-center justify-center active:scale-95"
            title="Đặt lại góc nhìn 3D mặc định"
          >
            <RotateCw className="w-4 h-4" />
          </button>

          {/* 3D Tilt adjust */}
          <button
            onClick={() => setTilt(t => (t === 0 ? 36 : t === 36 ? 55 : 0))}
            className="w-10 h-10 rounded-xl bg-stone-900/95 hover:bg-stone-800 border border-stone-700 text-stone-300 hover:text-amber-400 shadow-xl transition-all font-bold text-xs flex items-center justify-center active:scale-95"
            title="Đổi góc nghiêng 3D"
          >
            3D
          </button>

          {/* Zoom In / Out */}
          <button
            onClick={() => setZoom(z => Math.min(z + 0.15, 2.0))}
            className="w-10 h-10 rounded-xl bg-stone-900/95 hover:bg-stone-800 border border-stone-700 text-stone-300 hover:text-amber-400 shadow-xl transition-all flex items-center justify-center active:scale-95"
            title="Phóng to"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          <button
            onClick={() => setZoom(z => Math.max(z - 0.15, 0.7))}
            className="w-10 h-10 rounded-xl bg-stone-900/95 hover:bg-stone-800 border border-stone-700 text-stone-300 hover:text-amber-400 shadow-xl transition-all flex items-center justify-center active:scale-95"
            title="Thu nhỏ"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Floating Prompt when pure 3D map is active without selected landmark */}
      {!selectedLocation && !isFocusMode && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 pointer-events-auto">
          <div className="bg-stone-950/90 backdrop-blur-md px-5 py-3 rounded-2xl border border-amber-500/40 shadow-2xl flex items-center gap-3 animate-fadeIn">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
              <Sparkles className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-stone-100 font-bold whitespace-nowrap">
                Toàn Cảnh Bản Đồ Di Sản 3D
              </p>
              <p className="text-[11px] text-stone-400 whitespace-nowrap">
                Chạm vào bất kỳ địa danh nào trên bản đồ để mở chi tiết & nhiệm vụ
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Selected Landmark Detail Sidebar / Bottom Sheet */}
      {!isFocusMode && selectedLocation && (
        <aside className="w-full md:w-96 bg-stone-900/95 border-t md:border-t-0 md:border-l border-amber-500/20 p-4 sm:p-5 flex flex-col justify-between overflow-y-auto max-h-[50vh] md:max-h-full z-30 shadow-2xl animate-fadeIn">
          <div className="space-y-4">
            {/* Header with image & Close Button */}
            <div className="relative h-40 sm:h-44 rounded-2xl overflow-hidden border border-amber-500/30 group">
              <img 
                src={selectedLocation.coverImage || selectedLocation.thumbnail} 
                alt={selectedLocation.name} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent" />

              <div className="absolute bottom-2.5 left-3 right-3">
                <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                  <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-amber-500 text-stone-950">
                    {selectedLocation.province || 'TP. Hồ Chí Minh'} • {selectedLocation.district}
                  </span>
                </div>
                <h3 className="font-['Cinzel',serif] font-bold text-lg text-amber-200 leading-tight">
                  {selectedLocation.name}
                </h3>
              </div>

              {/* Close Sidebar Button (Returns to Pure 3D Map View) */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  sound.playClick();
                  onSelectLocation(null);
                }}
                className="absolute top-2.5 right-2.5 z-20 w-8 h-8 rounded-xl bg-stone-950/85 hover:bg-stone-900 border border-stone-700 hover:border-amber-500/50 text-stone-300 hover:text-white flex items-center justify-center transition-all shadow-xl"
                title="Đóng chi tiết (trở về bản đồ 3D)"
              >
                <X className="w-4 h-4" />
              </button>

              {/* 360 VR Button overlaid on cover image */}
              {onOpenAR && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    sound.playClick();
                    onOpenAR();
                  }}
                  className="absolute top-2.5 right-12 min-h-[32px] px-2.5 py-1 rounded-xl bg-amber-500/90 hover:bg-amber-400 text-stone-950 text-[11px] font-bold flex items-center gap-1 shadow-lg backdrop-blur-sm transition-all"
                  title="Mở chế độ thực tế ảo 360° VR"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>360° VR</span>
                </button>
              )}
            </div>

            {/* AI-Generated 4K Tour Video Player */}
            <AITourVideoPlayer
              location={selectedLocation}
              onOpenFullscreenCinema={(idx) => {
                setCinemaSceneIdx(idx || 0);
                setIsCinemaModalOpen(true);
              }}
            />

            {/* Audio Story Narration Player */}
            <LocationAudioPlayer
              location={selectedLocation}
              autoPlay={false}
              onPlayStateChange={(playing, mode) => {
                setIsPlayingAudio(playing);
                setAudioMode((mode as AudioMode) || 'narration');
              }}
            />

            {/* Architectural & Cultural Highlights */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5" />
                Đặc Điểm Kiến Trúc & Di Sản:
              </h4>
              <p className="text-xs text-stone-300 leading-relaxed bg-stone-950/60 p-3 rounded-xl border border-stone-800">
                {selectedLocation.shortDesc}
              </p>
              {selectedLocation.architecturalHighlights && selectedLocation.architecturalHighlights.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {selectedLocation.architecturalHighlights.map((highlight, idx) => (
                    <span 
                      key={idx}
                      className="px-2 py-0.5 rounded-lg bg-stone-800 text-[11px] text-stone-300 border border-stone-700"
                    >
                      ✦ {highlight}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Bottom Action Triggers */}
          <div className="pt-4 space-y-2 border-t border-stone-800">
            <button
              onClick={() => {
                sound.playSuccess();
                onStartQuest(selectedLocation);
              }}
              className="min-h-[44px] w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all active:scale-98"
            >
              <Play className="w-4 h-4 fill-stone-950" />
              <span>{isLocationCompleted(selectedLocation) ? 'Chơi Lại Nhiệm Vụ' : 'Bắt Đầu Giải Mã Nhiệm Vụ'}</span>
            </button>

            <button
              onClick={() => onOpenAI(`Tôi đang ở ${selectedLocation.name} (${selectedLocation.province || 'TP.HCM'}). Hãy kể cho tôi nghe một bí mật lịch sử đặc biệt hoặc hướng dẫn tôi cách khám phá chi tiết tại đây!`)}
              className="min-h-[40px] w-full py-2 px-3 rounded-xl bg-stone-950 hover:bg-stone-800 border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors active:scale-98"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Hỏi Cố Vấn Ba Son Về Địa Điểm Này</span>
            </button>
          </div>
        </aside>
      )}

      {/* Fullscreen AI Heritage Cinema Modal */}
      {isCinemaModalOpen && selectedLocation && (
        <AITourCinemaModal
          location={selectedLocation}
          initialSceneIndex={cinemaSceneIdx}
          allLocations={locations}
          onClose={() => setIsCinemaModalOpen(false)}
          onSelectOtherLocation={(loc) => {
            onSelectLocation(loc);
            setCinemaSceneIdx(0);
          }}
        />
      )}
    </div>
  );
};
