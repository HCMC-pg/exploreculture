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
  onOpenAuth?: () => void;
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
  onOpenAuth,
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

          {/* Gmail Login / Cloud Sync Status Button */}
          {(!user.googleEmail || !user.googleEmail.endsWith('@gmail.com')) ? (
            <button
              onClick={() => { sound.playClick(); onOpenAuth?.(); }}
              id="navbar-gmail-login-btn"
              title="Yêu cầu đăng nhập Gmail chính chủ để lưu tiến trình học tập"
              className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-red-500/20 border border-red-400/40 transition-all hover:scale-105"
            >
              <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                <path fill="#ffffff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#ffffff" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#ffffff" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#ffffff" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span className="hidden sm:inline">Đăng Nhập Gmail</span>
              <span className="sm:hidden">Gmail</span>
            </button>
          ) : (
            <button
              onClick={() => { sound.playClick(); onOpenAuth?.(); }}
              id="navbar-gmail-synced-btn"
              title={`Đã đồng bộ với Gmail: ${user.googleEmail}`}
              className="px-2 py-1 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-[11px] font-semibold flex items-center gap-1.5 hover:bg-emerald-900/60 transition-colors"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="hidden md:inline font-mono truncate max-w-[110px]">{user.googleEmail.split('@')[0]}</span>
              <span className="text-[9px] bg-emerald-500/20 px-1 py-0.5 rounded text-emerald-300 font-bold">Gmail</span>
            </button>
          )}

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
