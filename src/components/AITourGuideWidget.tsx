import React, { useState, useEffect } from 'react';
import { 
  Compass, 
  MapPin, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2, 
  X, 
  Camera, 
  Utensils, 
  HelpCircle, 
  Navigation, 
  Award,
  BookOpen,
  MessageSquare
} from 'lucide-react';
import { PersonalizedItinerary, Location3D, AITourGuide } from '../types';
import { getAITourGuide } from '../data/aiTourGuides';
import { sound } from '../utils/audio';

interface AITourGuideWidgetProps {
  itinerary: PersonalizedItinerary;
  locations: Location3D[];
  onSelectAndTeleport?: (loc: Location3D) => void;
  onOpenQuestModal?: (loc: Location3D) => void;
  onOpenAIAsk?: (prompt: string) => void;
  onCloseTour?: () => void;
  onUpdateItinerary?: (updated: PersonalizedItinerary) => void;
}

export const AITourGuideWidget: React.FC<AITourGuideWidgetProps> = ({
  itinerary,
  locations,
  onSelectAndTeleport,
  onOpenQuestModal,
  onOpenAIAsk,
  onCloseTour,
  onUpdateItinerary
}) => {
  const [currentStopIndex, setCurrentStopIndex] = useState<number>(0);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [showTriviaModal, setShowTriviaModal] = useState<boolean>(false);
  const [triviaUserAnswer, setTriviaUserAnswer] = useState<string>('');
  const [triviaSolved, setTriviaSolved] = useState<boolean>(false);

  const guide: AITourGuide = itinerary.tourGuide || getAITourGuide(itinerary.tourGuideId);
  const currentStop = itinerary.stops[currentStopIndex] || itinerary.stops[0];
  const matchedLocation = locations.find(l => l.id === currentStop?.locationId);

  // Stop speech when component unmounts
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Text-To-Speech for AI Tour Guide
  const handleToggleVoice = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      sound.playSuccess();
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    sound.playDanTranhNote(659.25, 0.3);
    const textToSpeak = `${guide.name} thuyết minh: ${currentStop.guideVoiceNarration || currentStop.activityHighlight}. Mẹo di sản: ${currentStop.aiLocalTip}`;
    
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = 'vi-VN';
    utterance.pitch = guide.voicePitch || 1.0;
    utterance.rate = guide.voiceRate || 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  const handleNextStop = () => {
    if (currentStopIndex < itinerary.stops.length - 1) {
      sound.playClick();
      setCurrentStopIndex(prev => prev + 1);
      if (isSpeaking && typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      }
    }
  };

  const handlePrevStop = () => {
    if (currentStopIndex > 0) {
      sound.playClick();
      setCurrentStopIndex(prev => prev - 1);
      if (isSpeaking && typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      }
    }
  };

  const handleMarkVisited = () => {
    sound.playSuccess();
    const updatedStops = [...itinerary.stops];
    updatedStops[currentStopIndex] = {
      ...updatedStops[currentStopIndex],
      isVisited: !updatedStops[currentStopIndex].isVisited
    };
    const updated = { ...itinerary, stops: updatedStops };
    if (onUpdateItinerary) onUpdateItinerary(updated);
  };

  const handleSolveTrivia = () => {
    if (!currentStop.spotChallengeTrivia) return;
    sound.playSuccess();
    setTriviaSolved(true);
  };

  if (!currentStop) return null;

  return (
    <aside aria-label="Hướng dẫn viên du lịch AI" className="fixed bottom-20 left-3 sm:left-6 z-40 max-w-md w-[calc(100vw-24px)] sm:w-96 animate-fadeIn">
      {/* Minimized Pill View */}
      {isMinimized ? (
        <div 
          onClick={() => { sound.playClick(); setIsMinimized(false); }}
          className="p-2.5 px-4 rounded-2xl bg-stone-950/95 backdrop-blur-xl border border-amber-500/50 shadow-2xl flex items-center justify-between gap-3 cursor-pointer hover:border-amber-400 transition-all hover:scale-102"
        >
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <img src={guide.avatar} alt={guide.name} className="w-8 h-8 rounded-full object-cover border border-amber-400 shadow" />
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <div>
              <p className="text-xs font-bold text-amber-300 flex items-center gap-1">
                <span>HDV {guide.name}</span>
              </p>
              <p className="text-[10px] text-stone-300 truncate max-w-[170px]">
                Trạm {currentStop.order}/{itinerary.stops.length}: {currentStop.locationName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button 
              onClick={(e) => { e.stopPropagation(); handleToggleVoice(); }} 
              className={`p-1.5 rounded-xl border text-xs ${isSpeaking ? 'bg-amber-500 text-stone-950 border-amber-400 animate-pulse' : 'bg-stone-900 text-amber-400 border-stone-800'}`}
              title="Nghe thuyết minh"
            >
              {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>
            <span className="text-[10px] font-bold text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded-lg border border-amber-500/30">
              Mở rộng ▲
            </span>
          </div>
        </div>
      ) : (
        /* Full Expanded Guide Card */
        <div className="p-4 rounded-3xl bg-stone-950/95 backdrop-blur-2xl border-2 border-amber-500/50 shadow-2xl text-stone-100 space-y-3 relative overflow-hidden">
          
          {/* Subtle Era/Theme Glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

          {/* Guide Header */}
          <div className="flex items-start justify-between gap-2 border-b border-stone-800 pb-2.5">
            <div className="flex items-center gap-2.5">
              <div className="relative shrink-0">
                <img src={guide.avatar} alt={guide.name} className="w-10 h-10 rounded-2xl object-cover border-2 border-amber-400/80 shadow-md" />
                <span className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-stone-950" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h4 className="font-bold text-xs sm:text-sm text-amber-200">{guide.name}</h4>
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30">
                    HDV AI Dẫn Tour
                  </span>
                </div>
                <p className="text-[10px] text-stone-400 truncate max-w-[210px]">{guide.tagline}</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => { sound.playClick(); setIsMinimized(true); }}
                className="p-1 rounded-xl bg-stone-900 text-stone-400 hover:text-stone-200 border border-stone-800"
                title="Thu nhỏ thanh dẫn đường"
              >
                <span className="text-xs px-1 font-bold">▼</span>
              </button>
              {onCloseTour && (
                <button
                  onClick={() => { sound.playClick(); onCloseTour(); }}
                  className="p-1 rounded-xl bg-stone-900 text-stone-400 hover:text-red-400 border border-stone-800"
                  title="Kết thúc dẫn tour"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Active Stop Status & Stepper */}
          <div className="flex items-center justify-between bg-stone-900/80 p-2 rounded-2xl border border-stone-800 text-xs">
            <button
              onClick={handlePrevStop}
              disabled={currentStopIndex === 0}
              className="p-1 rounded-lg bg-stone-950 disabled:opacity-30 text-amber-400 hover:bg-stone-800"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="text-center px-1">
              <span className="text-[10px] uppercase font-mono text-amber-400 font-bold tracking-wider block">
                TRẠM DỪNG CHÂN {currentStop.order} / {itinerary.stops.length}
              </span>
              <h5 className="font-bold text-xs text-stone-100 truncate max-w-[180px] sm:max-w-[210px]">
                {currentStop.locationName}
              </h5>
            </div>

            <button
              onClick={handleNextStop}
              disabled={currentStopIndex === itinerary.stops.length - 1}
              className="p-1 rounded-lg bg-stone-950 disabled:opacity-30 text-amber-400 hover:bg-stone-800"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Guide Narration Bubble */}
          <div className="p-3 rounded-2xl bg-amber-950/20 border border-amber-500/30 text-xs space-y-1.5">
            <div className="flex items-center justify-between text-amber-300 font-bold text-[11px]">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Lời Thuyết Minh Của {guide.name}:
              </span>
              <button
                onClick={handleToggleVoice}
                className={`px-2 py-0.5 rounded-lg border text-[10px] font-bold flex items-center gap-1 transition-all ${
                  isSpeaking
                    ? 'bg-amber-500 text-stone-950 border-amber-400 animate-pulse'
                    : 'bg-stone-950 text-amber-300 border-amber-500/40 hover:bg-amber-500/20'
                }`}
              >
                {isSpeaking ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                <span>{isSpeaking ? 'Dừng Nói' : 'Nghe Thuyết Minh'}</span>
              </button>
            </div>

            <p className="text-stone-300 text-[11px] leading-relaxed italic">
              "{currentStop.guideVoiceNarration || currentStop.activityHighlight}"
            </p>
          </div>

          {/* Quick Local Highlights */}
          <div className="grid grid-cols-2 gap-1.5 text-[10px]">
            <div className="p-1.5 rounded-xl bg-stone-900/80 border border-stone-800/80 flex items-center gap-1.5 truncate">
              <Camera className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
              <span className="text-stone-300 truncate">{currentStop.goldenPhotoHour}</span>
            </div>

            <div className="p-1.5 rounded-xl bg-stone-900/80 border border-stone-800/80 flex items-center gap-1.5 truncate">
              <Utensils className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <span className="text-stone-300 truncate">{currentStop.mustTryCuisine}</span>
            </div>
          </div>

          {/* Trivia Challenge Modal Popup if Open */}
          {showTriviaModal && currentStop.spotChallengeTrivia && (
            <div className="p-3 rounded-2xl bg-stone-900 border border-amber-500/40 space-y-2 animate-fadeIn">
              <div className="flex items-center justify-between text-xs font-bold text-amber-300">
                <span className="flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  Thử Thách Tại Trạm (+{currentStop.spotChallengeTrivia.rewardLP} LP)
                </span>
                <button onClick={() => setShowTriviaModal(false)} className="text-stone-400 hover:text-stone-200">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <p className="text-xs text-stone-200 font-semibold">{currentStop.spotChallengeTrivia.question}</p>

              {triviaSolved ? (
                <div className="p-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-1.5 font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Chính xác: {currentStop.spotChallengeTrivia.answer}!</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 pt-1">
                  <button
                    onClick={handleSolveTrivia}
                    className="w-full py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center justify-center gap-1"
                  >
                    <span>Xem Đáp Án & Nhận Điểm</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Action Button Strip */}
          <div className="grid grid-cols-3 gap-1.5 pt-1 text-xs">
            {matchedLocation && onSelectAndTeleport && (
              <button
                onClick={() => {
                  sound.playSuccess();
                  onSelectAndTeleport(matchedLocation);
                }}
                className="py-2 px-2 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-700 text-amber-300 font-bold text-[11px] flex items-center justify-center gap-1 transition-all"
                title="Dẫn đường đến điểm này trên bản đồ 3D"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Bản Đồ 3D</span>
              </button>
            )}

            {matchedLocation && onOpenQuestModal && (
              <button
                onClick={() => {
                  sound.playSuccess();
                  onOpenQuestModal(matchedLocation);
                }}
                className="py-2 px-2 rounded-xl bg-amber-500/20 hover:bg-amber-500 hover:text-stone-950 border border-amber-500/40 text-amber-300 font-bold text-[11px] flex items-center justify-center gap-1 transition-all"
                title="Mở bảng nhiệm vụ di sản"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Nhiệm Vụ</span>
              </button>
            )}

            <button
              onClick={() => {
                if (onOpenAIAsk) {
                  onOpenAIAsk(`Tôi đang cùng HDV ${guide.name} tham quan ${currentStop.locationName} trong lộ trình "${itinerary.title}". Hãy chia sẻ cho tôi thêm 1 câu chuyện bí ẩn và 1 mẹo thực địa thú vị nhất tại đây!`);
                }
              }}
              className="py-2 px-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 text-stone-950 font-bold text-[11px] flex items-center justify-center gap-1 shadow transition-all"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Hỏi HDV AI</span>
            </button>
          </div>

          {/* Check-in status toggle */}
          <div className="pt-2 border-t border-stone-800/80 flex items-center justify-between text-[11px] text-stone-400">
            <button
              onClick={handleMarkVisited}
              className={`flex items-center gap-1 font-semibold transition-colors ${
                currentStop.isVisited ? 'text-emerald-400' : 'hover:text-stone-200'
              }`}
            >
              <CheckCircle2 className={`w-3.5 h-3.5 ${currentStop.isVisited ? 'text-emerald-400' : 'text-stone-600'}`} />
              <span>{currentStop.isVisited ? 'Đã check-in trạm này' : 'Đánh dấu đã đến'}</span>
            </button>

            {currentStop.spotChallengeTrivia && !showTriviaModal && (
              <button
                onClick={() => setShowTriviaModal(true)}
                className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 underline text-[10px]"
              >
                <HelpCircle className="w-3 h-3" />
                <span>Thử Thách Tại Trạm</span>
              </button>
            )}
          </div>
        </div>
      )}
    </aside>
  );
};
