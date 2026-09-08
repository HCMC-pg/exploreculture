import React from 'react';
import { 
  Compass, 
  Award, 
  MessageSquare, 
  Gift, 
  Volume2, 
  VolumeX, 
  Sparkles,
  Bot,
  Camera,
  Route,
  Palette,
  CheckCircle2,
  LogIn
} from 'lucide-react';
import { UserProfile, HistoricalThemeId } from '../types';
import { getHistoricalSkin } from '../data/historicalThemes';
import { sound } from '../utils/audio';

interface NavbarProps {
  activeTab: 'map' | 'quests' | 'badges' | 'forum' | 'rewards';
  setActiveTab: (tab: 'map' | 'quests' | 'badges' | 'forum' | 'rewards') => void;
  user: UserProfile;
  isMuted: boolean;
  setIsMuted: (muted: boolean) => void;
  onOpenProfile: () => void;
  onOpenAI: () => void;
  onOpenAR: () => void;
  onOpenJournal?: () => void;
  onOpenItineraryPlanner?: () => void;
  onOpenThemeModal?: () => void;
  currentThemeId?: HistoricalThemeId;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  user,
  isMuted,
  setIsMuted,
  onOpenProfile,
  onOpenAI,
  onOpenAR,
  onOpenJournal,
  onOpenItineraryPlanner,
  onOpenThemeModal,
  currentThemeId = 'classic_amber'
}) => {
  const currentSkin = getHistoricalSkin(currentThemeId);
  const toggleSound = () => {
    const next = !isMuted;
    setIsMuted(next);
    sound.setMuted(next);
    if (!next) {
      sound.playCycloBell();
    }
  };

  const navItems = [
    { id: 'map', label: 'Bản Đồ 3D', icon: Compass },
    { id: 'quests', label: 'Nhiệm Vụ', icon: Sparkles },
    { id: 'badges', label: 'Huy Hiệu', icon: Award },
    { id: 'forum', label: 'Diễn Đàn Di Sản', icon: MessageSquare },
    { id: 'rewards', label: 'Đổi Thưởng', icon: Gift },
  ];

  return (
    <header 
      className="sticky top-0 z-40 backdrop-blur-md border-b text-stone-200 shadow-xl transition-colors duration-500"
      style={{
        backgroundColor: currentSkin.previewColors.cardBg || 'var(--theme-header-bg)',
        borderColor: currentSkin.previewColors.border || 'var(--theme-border)'
      }}
    >
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 py-2 flex items-center justify-between gap-1.5 sm:gap-2">
        {/* Brand Logo */}
        <div 
          onClick={() => { sound.playTraditionalMelody(); setActiveTab('map'); }}
          className="flex items-center gap-2 cursor-pointer group shrink-0"
          id="brand-logo-btn"
        >
          <div 
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl p-0.5 shadow-lg group-hover:scale-105 transition-transform"
            style={{
              background: `var(--theme-gradient)`
            }}
          >
            <div 
              className="w-full h-full rounded-[10px] flex items-center justify-center"
              style={{ backgroundColor: currentSkin.previewColors.background }}
            >
              <Compass 
                className="w-4 h-4 sm:w-5 sm:h-5 animate-spin-slow group-hover:rotate-45 transition-transform" 
                style={{ color: currentSkin.previewColors.accent }}
              />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span 
                className="font-['Be_Vietnam_Pro',sans-serif] font-black text-sm sm:text-lg tracking-wide"
                style={{ color: currentSkin.previewColors.accent }}
              >
                SÀI GÒN KỲ BÍ
              </span>
            </div>
            <p className="text-[10px] text-stone-400 hidden sm:block">
              {currentSkin.tagline}
            </p>
          </div>
        </div>

        {/* Navigation Tabs (Desktop) */}
        <nav 
          className="hidden lg:flex items-center gap-1 p-1 rounded-xl border transition-colors"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            borderColor: currentSkin.previewColors.border
          }}
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-tab-${item.id}`}
                onClick={() => {
                  sound.playClick();
                  setActiveTab(item.id as any);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  isActive
                    ? 'text-stone-950 shadow-md font-black'
                    : 'text-stone-300 hover:text-white hover:bg-white/10'
                }`}
                style={isActive ? {
                  background: `var(--theme-gradient)`
                } : {}}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-stone-950' : ''}`} style={!isActive ? { color: currentSkin.previewColors.primary } : {}} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Tools & Profile */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Personalized Itinerary Planner Button */}
          {onOpenItineraryPlanner && (
            <button
              onClick={() => { sound.playClick(); onOpenItineraryPlanner(); }}
              id="open-itinerary-planner-navbar-btn"
              title="Lập Lộ Trình Di Sản Cá Nhân Hóa AI"
              className="px-2 sm:px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center gap-1.5 shadow-md transition-all hover:scale-105"
            >
              <Route className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Lộ Trình AI</span>
            </button>
          )}

          {/* Travel Journal Button */}
          {onOpenJournal && (
            <button
              onClick={() => { sound.playClick(); onOpenJournal(); }}
              id="open-travel-journal-navbar-btn"
              title="Mở Sổ Nhật Ký Lữ Hành Phương Nam"
              className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-amber-950/40 border border-stone-800 text-stone-300 hover:text-amber-300 text-xs font-bold flex items-center gap-1.5 shadow-md transition-all hover:scale-105 hidden xl:flex"
            >
              <Compass className="w-3.5 h-3.5 text-amber-400" />
              <span>Nhật Ký</span>
            </button>
          )}

          {/* AR Camera Scanner Button */}
          <button
            onClick={() => { sound.playClick(); onOpenAR(); }}
            id="open-ar-scanner-btn"
            title="Mở máy quét Thực Tế Tăng Cường (AR) nhận diện di sản nhận +100 LP"
            className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-stone-950 text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-amber-500/20 transition-all hover:scale-105"
          >
            <Camera className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">AR</span>
            <span className="hidden md:inline px-1 py-0.2 rounded bg-stone-950/20 text-[9px] font-black">+100LP</span>
          </button>

          {/* AI Heritage Assistant Trigger */}
          <button
            onClick={onOpenAI}
            id="open-ai-assistant-btn"
            className="px-2 sm:px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-600/30 to-amber-500/20 hover:from-amber-600/40 hover:to-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1.5 shadow-md transition-all animate-pulse"
          >
            <Bot className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Ba Son AI</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            id="sound-toggle-btn"
            title={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
            className="p-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-amber-300 border border-stone-800 transition-colors"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-stone-500" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
          </button>

          {/* User Profile Capsule */}
          <div
            onClick={onOpenProfile}
            id="user-profile-capsule-btn"
            className="flex items-center gap-1.5 sm:gap-2 pl-1.5 sm:pl-2 pr-2 sm:pr-3 py-1 rounded-xl border border-amber-500/30 bg-stone-900/90 hover:bg-stone-800 cursor-pointer shadow-md transition-all group"
            title={`Hồ sơ Lữ Khách: ${user.name}`}
          >
            <div className="relative">
              <img 
                src={user.avatar} 
                alt={user.name} 
                className="w-7 h-7 rounded-lg object-cover border border-amber-400/50 group-hover:scale-105 transition-transform" 
              />
            </div>
            <div className="text-left hidden sm:block">
              <div className="flex items-center gap-1">
                <span className="text-[11px] font-bold text-stone-200 group-hover:text-amber-200 transition-colors leading-tight truncate max-w-[100px]">
                  {user.name}
                </span>
              </div>
              <div className="text-[10px] text-amber-400 font-mono font-bold leading-tight flex items-center gap-1">
                <span>{user.lpPoints} LP</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div className="lg:hidden flex items-center gap-1 border-t border-stone-800/80 px-2 py-1.5 bg-stone-950/95 overflow-x-auto no-scrollbar scroll-smooth">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                sound.playClick();
                setActiveTab(item.id as any);
              }}
              className={`min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-colors ${
                isActive
                  ? 'bg-amber-500 text-stone-950 font-bold shadow-md'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span className="whitespace-nowrap">{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
