import React, { useState } from 'react';
import {
  X,
  MapPin,
  Clock,
  Navigation,
  Sparkles,
  Compass,
  Calendar,
  Layers,
  ChevronRight,
  Camera,
  Utensils,
  Award,
  Share2,
  CheckCircle2,
  Play,
  RotateCcw,
  Zap,
  Bus,
  Bike,
  Ship,
  Footprints,
  UserCheck,
  Bot,
  Volume2,
  Palette,
  Check,
  Globe,
  Sliders,
  CheckCircle
} from 'lucide-react';
import { 
  Location3D, 
  PersonalizedItinerary, 
  ItineraryStop, 
  ItineraryThemeType, 
  AITourGuideId, 
  UserProfile, 
  HistoricalThemeId 
} from '../types';
import { 
  generatePersonalizedItinerary, 
  ItineraryGenerationOptions,
  saveActiveItinerary,
  getSavedItinerary
} from '../utils/itineraryEngine';
import { AI_TOUR_GUIDES, getAITourGuide } from '../data/aiTourGuides';
import { HISTORICAL_THEME_SKINS, getHistoricalSkin } from '../data/historicalThemes';
import { sound } from '../utils/audio';

interface PersonalizedItineraryModalProps {
  locations: Location3D[];
  isOpen: boolean;
  onClose: () => void;
  onSelectAndTeleport?: (loc: Location3D) => void;
  onActivateItineraryOnMap: (itinerary: PersonalizedItinerary) => void;
  onShareToForum?: (title: string, content: string, locationTag: string) => void;
  currentActiveItinerary?: PersonalizedItinerary | null;
  user?: UserProfile;
  currentThemeId?: HistoricalThemeId;
  onSelectTheme?: (themeId: HistoricalThemeId, customAccentColor?: string) => void;
  onUpdateUserProfile?: (updated: UserProfile) => void;
  onOpenBaSonAI?: (prompt?: string) => void;
}

export const PersonalizedItineraryModal: React.FC<PersonalizedItineraryModalProps> = ({
  locations,
  isOpen,
  onClose,
  onSelectAndTeleport,
  onActivateItineraryOnMap,
  onShareToForum,
  currentActiveItinerary,
  user,
  currentThemeId = 'classic_amber',
  onSelectTheme,
  onUpdateUserProfile,
  onOpenBaSonAI
}) => {
  const [modalTab, setModalTab] = useState<'itinerary' | 'theme_colors'>('itinerary');

  const userPrefs = user?.preferences;
  const initialTheme: ItineraryThemeType = 
    userPrefs?.favoriteCategories?.includes('cuisine') ? 'cuisine_flavors' :
    userPrefs?.favoriteCategories?.includes('architecture') ? 'architecture_classic' :
    userPrefs?.favoriteCategories?.includes('nature_coastal') ? 'coastal_heroes' :
    'architecture_classic';

  const initialStyle = 
    userPrefs?.learningStyle === 'visual' ? 'photographer' :
    userPrefs?.learningStyle === 'interactive' ? 'adventurer' :
    userPrefs?.favoriteCategories?.includes('cuisine') ? 'foodie' :
    'scholar';

  const [options, setOptions] = useState<ItineraryGenerationOptions>({
    theme: initialTheme,
    durationMode: 'half_day',
    transportMode: 'walk',
    startPoint: 'Bến Bạch Đằng & Cột cờ Thủ Ngữ',
    pace: 'balanced',
    tourGuideId: userPrefs?.preferredGuideId || 'co_van_ba_son',
    travelerStyle: initialStyle,
    regionFilter: 'all',
    customAccentColor: user?.customAccentColor || '#d97706',
    themeSkinName: currentThemeId,
    userPreferences: userPrefs,
    bookmarkedLandmarks: userPrefs?.bookmarkedLandmarks
  });

  const [activeAccentColor, setActiveAccentColor] = useState<string>(
    user?.customAccentColor || '#d97706'
  );
  const [activeSkinId, setActiveSkinId] = useState<HistoricalThemeId>(currentThemeId);
  const [colorAppliedToast, setColorAppliedToast] = useState<boolean>(false);

  const [generatedItinerary, setGeneratedItinerary] = useState<PersonalizedItinerary | null>(() => {
    return currentActiveItinerary || getSavedItinerary() || generatePersonalizedItinerary({
      theme: initialTheme,
      durationMode: 'half_day',
      transportMode: 'walk',
      startPoint: 'Bến Bạch Đằng & Cột cờ Thủ Ngữ',
      pace: 'balanced',
      tourGuideId: userPrefs?.preferredGuideId || 'co_van_ba_son',
      travelerStyle: initialStyle,
      regionFilter: 'all',
      userPreferences: userPrefs,
      bookmarkedLandmarks: userPrefs?.bookmarkedLandmarks
    });
  });

  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [selectedStopIdx, setSelectedStopIdx] = useState<number>(0);
  const [isPlayingNarration, setIsPlayingNarration] = useState<boolean>(false);

  const handlePlayAudioNarration = (narrationText: string) => {
    sound.playClick();
    if (isPlayingNarration) {
      setIsPlayingNarration(false);
      return;
    }
    setIsPlayingNarration(true);
    // Play melodious Vietnamese traditional instruments notes
    sound.playDanTranhNote(329.63, 0.4);
    setTimeout(() => sound.playDanTranhNote(392.00, 0.45), 200);
    setTimeout(() => sound.playDanTranhNote(440.00, 0.45), 450);
    setTimeout(() => sound.playDanTranhNote(523.25, 0.5), 700);
    setTimeout(() => sound.playDanTranhNote(659.25, 0.55), 1000);
    setTimeout(() => sound.playDanTranhNote(783.99, 0.65), 1350);
    setTimeout(() => {
      setIsPlayingNarration(false);
    }, 4000);
  };

  const handleAutoOptimize = () => {
    sound.playClick();
    setIsGenerating(true);
    const newOptions: ItineraryGenerationOptions = {
      ...options,
      theme: initialTheme,
      travelerStyle: initialStyle,
      tourGuideId: userPrefs?.preferredGuideId || 'co_van_ba_son',
      userPreferences: userPrefs,
      bookmarkedLandmarks: userPrefs?.bookmarkedLandmarks
    };
    setOptions(newOptions);
    setTimeout(() => {
      const it = generatePersonalizedItinerary(newOptions);
      setGeneratedItinerary(it);
      setSelectedStopIdx(0);
      setIsGenerating(false);
      sound.playSuccess();
    }, 400);
  };

  if (!isOpen) return null;

  const handleGenerate = () => {
    sound.playClick();
    setIsGenerating(true);
    setTimeout(() => {
      const it = generatePersonalizedItinerary({
        ...options,
        customAccentColor: activeAccentColor,
        themeSkinName: activeSkinId
      });
      setGeneratedItinerary(it);
      setSelectedStopIdx(0);
      setIsGenerating(false);
      sound.playSuccess();
    }, 450);
  };

  const handleActivate = () => {
    if (!generatedItinerary) return;
    sound.playSuccess();
    saveActiveItinerary(generatedItinerary);
    onActivateItineraryOnMap(generatedItinerary);
    onClose();
  };

  const handleApplyColors = (skinId: HistoricalThemeId, accent: string) => {
    sound.playSuccess();
    setActiveSkinId(skinId);
    setActiveAccentColor(accent);
    if (onSelectTheme) {
      onSelectTheme(skinId, accent);
    }
    if (user && onUpdateUserProfile) {
      onUpdateUserProfile({
        ...user,
        customAccentColor: accent
      });
    }
    setColorAppliedToast(true);
    setTimeout(() => setColorAppliedToast(false), 2200);
  };

  const handleToggleStopVisited = (idx: number) => {
    sound.playClick();
    if (!generatedItinerary) return;
    const updatedStops = [...generatedItinerary.stops];
    updatedStops[idx].isVisited = !updatedStops[idx].isVisited;
    const updated = { ...generatedItinerary, stops: updatedStops };
    setGeneratedItinerary(updated);
    saveActiveItinerary(updated);
  };

  const currentStop = generatedItinerary?.stops[selectedStopIdx];
  const matchedLocation = currentStop ? locations.find(l => l.id === currentStop.locationId) : null;
  const currentGuide = getAITourGuide(options.tourGuideId);

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/90 backdrop-blur-xl flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-fadeIn">
      <div className="w-full max-w-6xl bg-stone-900 border-2 border-amber-500/40 rounded-3xl p-4 sm:p-6 shadow-2xl text-stone-100 relative max-h-[94vh] flex flex-col overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-2xl bg-stone-950 text-stone-400 hover:text-stone-100 hover:bg-red-950/40 transition-colors z-20"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-amber-500/20 pb-3 gap-2 shrink-0">
          <div className="flex items-center gap-3">
            <div 
              className="p-2.5 rounded-2xl text-stone-950 shadow-lg"
              style={{ backgroundColor: activeAccentColor }}
            >
              <Compass className="w-6 h-6 animate-spin-slow text-stone-950" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-['Cinzel',serif] text-lg sm:text-2xl font-bold text-amber-200">
                  Lộ Trình AI Cá Nhân Hóa & Màu Sắc Giao Diện
                </h2>
                <span 
                  className="px-2.5 py-0.5 rounded-full text-white text-[10px] font-bold border border-white/20 shadow-sm"
                  style={{ backgroundColor: activeAccentColor }}
                >
                  AI Personal Style
                </span>
              </div>
              <p className="text-xs text-stone-400">
                Tự động tối ưu hành trình theo sở thích, phong cách lữ khách và đồng bộ sắc màu website của bạn
              </p>
            </div>
          </div>

          {/* Sub Tab Switcher */}
          <div className="flex items-center gap-1 bg-stone-950/80 p-1 rounded-2xl border border-stone-800 self-start sm:self-center">
            <button
              onClick={() => { sound.playClick(); setModalTab('itinerary'); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                modalTab === 'itinerary'
                  ? 'bg-amber-500 text-stone-950 shadow-md'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>1. Lộ Trình & HDV AI</span>
            </button>
            <button
              onClick={() => { sound.playClick(); setModalTab('theme_colors'); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                modalTab === 'theme_colors'
                  ? 'bg-amber-500 text-stone-950 shadow-md'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              <span>2. Màu Sắc & Design Web</span>
            </button>
          </div>
        </div>

        {colorAppliedToast && (
          <div className="mx-2 mt-2 p-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Đã áp dụng màu sắc và phong cách giao diện thành công cho toàn trang web!</span>
          </div>
        )}

        {/* TAB 1: ITINERARY GENERATOR */}
        {modalTab === 'itinerary' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 my-3 flex-1 overflow-y-auto pr-1 animate-fadeIn">
            
            {/* Left Column: Preferences & Controls (5 cols) */}
            <div className="lg:col-span-5 flex flex-col space-y-3.5 p-4 rounded-2xl bg-stone-950 border border-amber-500/30">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-xs uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" /> Tùy Biến Theo Sở Thích & Phong Cách
                </h3>
                <span 
                  className="w-3 h-3 rounded-full border border-white/50 shadow"
                  style={{ backgroundColor: activeAccentColor }}
                  title="Màu sắc cá nhân đang kích hoạt"
                />
              </div>

              {/* Personalized Profile Sync Card */}
              {userPrefs && (
                <div className="p-3 rounded-xl bg-gradient-to-r from-amber-950/40 to-stone-900 border border-amber-500/40 space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-amber-300 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      Đã Kết Nối Hồ Sơ Của Bạn
                    </span>
                    <span className="text-stone-400 font-mono text-[10px]">
                      {user?.isGoogleLinked ? 'Google Sync' : 'Tài khoản cá nhân'}
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-300">
                    Sở thích: <strong className="text-amber-200">{userPrefs.favoriteCategories?.join(', ') || 'Đa dạng'}</strong>
                    {' '}• Phong cách học: <strong className="text-amber-200">{userPrefs.learningStyle || 'Trực quan'}</strong>
                  </p>
                  <button
                    onClick={handleAutoOptimize}
                    className="w-full py-1.5 px-2.5 rounded-lg bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-stone-950 border border-amber-500/40 text-[11px] font-bold transition-all flex items-center justify-center gap-1.5"
                  >
                    <Zap className="w-3 h-3 text-amber-400" />
                    <span>Tự Động Tối Ưu Lộ Trình Theo Hồ Sơ Của Tôi</span>
                  </button>
                </div>
              )}

              {/* 1. Phong Cách Lữ Khách (Persona) */}
              <div>
                <label className="text-xs font-bold text-stone-300 block mb-1 flex items-center gap-1">
                  <span>1. Phong Cách Lữ Khách</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {[
                    { id: 'scholar', label: '📜 Khảo Cứu', desc: 'Lịch sử & kiến trúc' },
                    { id: 'photographer', label: '📸 Nhiếp Ảnh', desc: 'Góc chụp di sản ấn tượng' },
                    { id: 'spiritual', label: '🪷 Tâm Linh', desc: 'Chùa cổ & an yên' },
                    { id: 'foodie', label: '🍲 Ẩm Thực', desc: 'Vị xưa chợ truyền thống' },
                    { id: 'adventurer', label: '🧭 Thám Hiểm', desc: 'Địa đạo & địa danh' }
                  ].map(style => (
                    <button
                      key={style.id}
                      onClick={() => {
                        sound.playClick();
                        setOptions(o => ({ ...o, travelerStyle: style.id as any }));
                      }}
                      className={`p-2 rounded-xl border text-left transition-all ${
                        options.travelerStyle === style.id
                          ? 'border-amber-400 text-amber-200 bg-amber-500/20 ring-1 ring-amber-400/50'
                          : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      <p className="text-[11px] font-bold text-stone-200">{style.label}</p>
                      <p className="text-[9px] text-stone-400 truncate">{style.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Vùng Miền Trọng Tâm */}
              <div>
                <label className="text-xs font-bold text-stone-300 block mb-1">2. Vùng Địa Lý Trọng Tâm</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {[
                    { id: 'all', label: 'Toàn Nam Bộ' },
                    { id: 'TP. Hồ Chí Minh', label: 'TP.HCM' },
                    { id: 'Bình Dương', label: 'Bình Dương' },
                    { id: 'Bà Rịa - Vũng Tàu', label: 'BR-VT' }
                  ].map(r => (
                    <button
                      key={r.id}
                      onClick={() => {
                        sound.playClick();
                        setOptions(o => ({ ...o, regionFilter: r.id as any }));
                      }}
                      className={`p-1.5 rounded-xl border text-xs font-semibold text-center transition-all ${
                        options.regionFilter === r.id
                          ? 'bg-amber-500 text-stone-950 font-bold border-amber-400'
                          : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Chọn Hướng Dẫn Viên Du Lịch AI */}
              <div>
                <label className="text-xs font-bold text-stone-300 block mb-1 flex items-center gap-1.5">
                  <Bot className="w-3.5 h-3.5 text-amber-400" /> 3. Đồng Hành Viên AI
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {AI_TOUR_GUIDES.map(g => (
                    <button
                      key={g.id}
                      onClick={() => {
                        sound.playClick();
                        setOptions(o => ({ ...o, tourGuideId: g.id }));
                      }}
                      className={`p-2 rounded-xl border text-left flex items-start gap-2 transition-all ${
                        options.tourGuideId === g.id
                          ? 'bg-amber-500/20 border-amber-400 text-amber-200 ring-1 ring-amber-400/50 shadow-md'
                          : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      <img src={g.avatar} alt={g.name} className="w-7 h-7 rounded-full object-cover shrink-0 border border-amber-500/50 mt-0.5" />
                      <div className="min-w-0">
                        <p className="text-[11px] font-bold text-stone-200 truncate">{g.name}</p>
                        <p className="text-[9px] text-amber-300/90 truncate">{g.badge}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. Chủ Đề / Sở Thích Di Sản */}
              <div>
                <label className="text-xs font-bold text-stone-300 block mb-1">4. Chủ Đề Cốt Lõi</label>
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {[
                    { id: 'architecture_classic', label: '🏛️ Kiến Trúc & Di Sản Đông Dương' },
                    { id: 'river_ports_300', label: '🛶 Ký Ức Sông Nước & Bến Cảng 300 Năm' },
                    { id: 'cuisine_flavors', label: '🍲 Ẩm Thực Đô Thành & Cà Phê Vợt Chợ Xưa' },
                    { id: 'pottery_spiritual', label: '🏺 Làng Nghề Gốm Sứ & Danh Lam Tâm Linh' },
                    { id: 'coastal_heroes', label: '🌊 Hải Trình Biển Đảo & Di Tích Lịch Sử' },
                    { id: 'heroic_tunnels', label: '🎖️ Huyền Thoại Đất Thép & Rừng Sác' },
                    { id: 'urban_sketch_vintage', label: '🎨 Ký Họa Nghệ Thuật & Nhiếp Ảnh Hoài Cổ' },
                    { id: 'cipher_adventure', label: '🧩 Thám Hiểm Mật Thư & Giải Mã Di Sản' }
                  ].map(t => (
                    <button
                      key={t.id}
                      onClick={() => {
                        sound.playClick();
                        setOptions(o => ({ ...o, theme: t.id as any }));
                      }}
                      className={`w-full p-2 rounded-xl border text-left transition-all ${
                        options.theme === t.id
                          ? 'bg-amber-500/20 border-amber-400 text-amber-200 ring-1 ring-amber-400/50'
                          : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      <p className="text-xs font-bold text-stone-200">{t.label}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* 5. Thời Lượng & Phương Tiện */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-stone-300 block mb-1">Thời Lượng</label>
                  <select
                    value={options.durationMode}
                    onChange={(e) => setOptions(o => ({ ...o, durationMode: e.target.value as any }))}
                    className="w-full bg-stone-900 border border-stone-800 rounded-xl p-2 text-xs text-amber-300 font-semibold focus:outline-none"
                  >
                    <option value="half_day">Nửa Ngày (3-4h)</option>
                    <option value="full_day">1 Ngày (7-8h)</option>
                    <option value="two_days">2 Ngày 1 Đêm</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-stone-300 block mb-1">Phương Tiện</label>
                  <select
                    value={options.transportMode}
                    onChange={(e) => setOptions(o => ({ ...o, transportMode: e.target.value as any }))}
                    className="w-full bg-stone-900 border border-stone-800 rounded-xl p-2 text-xs text-amber-300 font-semibold focus:outline-none"
                  >
                    <option value="walk">🚶 Đi bộ thư thả</option>
                    <option value="waterbus">🛥️ Waterbus đường sông</option>
                    <option value="hop_on_bus">🚌 Bus 2 tầng Hop-on</option>
                    <option value="cyclo">🚲 Xích lô hoài cổ</option>
                    <option value="motorbike">🛵 Xe máy lướt phố</option>
                  </select>
                </div>
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-stone-950 font-black text-xs shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-transform hover:scale-[1.02]"
              >
                {isGenerating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-stone-950 border-t-transparent rounded-full animate-spin" />
                    <span>AI Đang Phối Hợp Lộ Trình Cá Nhân...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Tạo Lộ Trình AI Theo Sở Thích Của Tôi</span>
                  </>
                )}
              </button>
            </div>

            {/* Right Column: Generated Itinerary Timeline & Details (7 cols) */}
            <div className="lg:col-span-7 flex flex-col space-y-3">
              {generatedItinerary ? (
                <>
                  {/* Route Header Overview Card */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/30 via-stone-900 to-stone-950 border border-amber-500/30 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img 
                          src={generatedItinerary.tourGuide?.avatar || currentGuide.avatar} 
                          alt="HDV" 
                          className="w-12 h-12 rounded-2xl object-cover border-2 border-amber-400 shadow-md shrink-0" 
                        />
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h4 className="font-['Cinzel',serif] text-base font-bold text-amber-200">
                              {generatedItinerary.title}
                            </h4>
                          </div>
                          <p className="text-xs text-stone-300 mt-0.5">
                            HDV: <strong className="text-amber-300">{generatedItinerary.tourGuide?.name || currentGuide.name}</strong> • Thưởng: <strong className="text-emerald-400 font-mono">+{generatedItinerary.totalLPBonus} LP</strong>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 sm:self-center shrink-0 flex-wrap">
                        <div className="px-3 py-1 rounded-xl bg-stone-950 border border-stone-800 text-right">
                          <span className="text-[10px] text-stone-400 block uppercase">Khoảng Cách</span>
                          <span className="text-xs font-mono font-bold text-amber-400">{generatedItinerary.totalDistanceKm} km</span>
                        </div>
                        <div className="px-3 py-1 rounded-xl bg-stone-950 border border-stone-800 text-right">
                          <span className="text-[10px] text-stone-400 block uppercase">Thời Gian</span>
                          <span className="text-xs font-mono font-bold text-amber-300">{generatedItinerary.totalDurationHours}h</span>
                        </div>
                        {onOpenBaSonAI && (
                          <button
                            type="button"
                            onClick={() => {
                              sound.playClick();
                              const routeStops = generatedItinerary.stops.map(s => s.locationName).join(' ➔ ');
                              const prompt = `Cố vấn Ba Son ơi, hãy phân tích và tối ưu hóa lộ trình di sản "${generatedItinerary.title}" qua các trạm: ${routeStops}. Hãy cho tôi biết thêm những con hẻm cổ, mẹo di chuyển, thời điểm ánh sáng đẹp nhất và lưu ý văn hóa nhé!`;
                              onClose();
                              onOpenBaSonAI(prompt);
                            }}
                            className="px-3 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all hover:scale-102"
                            title="Tham vấn Cố Vấn Ba Son để tối ưu lộ trình"
                          >
                            <Bot className="w-3.5 h-3.5" />
                            <span>Hỏi Ba Son AI</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Route Health & Eco Insight Badges */}
                    <div className="pt-2 border-t border-stone-800/80 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                      <div className="p-2 rounded-xl bg-stone-950/80 border border-stone-800 flex items-center gap-2">
                        <span className="text-base">🚶‍♂️</span>
                        <div>
                          <span className="text-[10px] text-stone-400 block">Bước Chân Ước Tính</span>
                          <span className="font-bold text-amber-300 font-mono">~{Math.round(generatedItinerary.totalDistanceKm * 1350).toLocaleString()} bước</span>
                        </div>
                      </div>

                      <div className="p-2 rounded-xl bg-stone-950/80 border border-stone-800 flex items-center gap-2">
                        <span className="text-base">🔥</span>
                        <div>
                          <span className="text-[10px] text-stone-400 block">Năng Lượng Tiêu Hao</span>
                          <span className="font-bold text-orange-400 font-mono">~{Math.round(generatedItinerary.totalDistanceKm * 58)} kcal</span>
                        </div>
                      </div>

                      <div className="p-2 rounded-xl bg-stone-950/80 border border-stone-800 flex items-center gap-2">
                        <span className="text-base">🌿</span>
                        <div>
                          <span className="text-[10px] text-stone-400 block">Tiêu Chuẩn Xanh</span>
                          <span className="font-bold text-emerald-400">100% Eco-Trail</span>
                        </div>
                      </div>

                      <div className="p-2 rounded-xl bg-stone-950/80 border border-stone-800 flex items-center gap-2">
                        <span className="text-base">🏆</span>
                        <div>
                          <span className="text-[10px] text-stone-400 block">Điểm Tri Thức</span>
                          <span className="font-bold text-amber-400">+{generatedItinerary.totalLPBonus} LP</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Interactive Stepper Station Bar */}
                  <div className="p-3 rounded-2xl bg-stone-950 border border-stone-800/80 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1.5 text-[11px]">
                        <Compass className="w-3.5 h-3.5" /> Chuỗi Trạm Di Sản Đề Xuất
                      </span>
                      <span className="text-[10px] text-stone-400 font-mono">
                        Trạm {selectedStopIdx + 1}/{generatedItinerary.stops.length}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 overflow-x-auto pb-1">
                      {generatedItinerary.stops.map((st, sIdx) => {
                        const isCur = selectedStopIdx === sIdx;
                        return (
                          <React.Fragment key={st.locationId + sIdx}>
                            <button
                              type="button"
                              onClick={() => {
                                sound.playClick();
                                setSelectedStopIdx(sIdx);
                              }}
                              className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 shrink-0 transition-all ${
                                isCur
                                  ? 'bg-amber-500 text-stone-950 font-bold border-amber-400 shadow-md scale-102'
                                  : 'bg-stone-900 hover:bg-stone-800 text-stone-300 border-stone-800'
                              }`}
                            >
                              <span className={`w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center shrink-0 ${
                                isCur ? 'bg-stone-950 text-amber-400' : 'bg-stone-800 text-stone-300'
                              }`}>
                                {sIdx + 1}
                              </span>
                              <span className="text-xs truncate max-w-[120px] sm:max-w-[160px]">{st.locationName}</span>
                              {st.isVisited && <CheckCircle2 className={`w-3 h-3 ${isCur ? 'text-stone-950' : 'text-emerald-400'}`} />}
                            </button>
                            {sIdx < generatedItinerary.stops.length - 1 && (
                              <span className="text-stone-600 font-bold shrink-0">➔</span>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </div>
                  </div>

                  {/* Timeline Stops */}
                  <div className="space-y-2 flex-1 overflow-y-auto pr-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-300 uppercase tracking-wider block">
                        Chi Tiết Lộ Trình {generatedItinerary.stops.length} Trạm Khám Phá
                      </span>
                      <span className="text-[11px] text-stone-400">
                        Bấm vào trạm để nghe thuyết minh & mẹo di sản
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      {generatedItinerary.stops.map((stop, idx) => {
                        const isSelected = selectedStopIdx === idx;
                        const targetLoc = locations.find(l => l.id === stop.locationId);

                        return (
                          <div
                            key={stop.locationId + idx}
                            onClick={() => {
                              sound.playClick();
                              setSelectedStopIdx(idx);
                            }}
                            className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-amber-950/30 border-amber-400 shadow-lg ring-1 ring-amber-400'
                                : 'bg-stone-950 border-stone-800 hover:border-amber-500/40'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-2.5">
                                <span 
                                  className="w-6 h-6 rounded-full text-stone-950 text-xs font-black flex items-center justify-center shrink-0 shadow"
                                  style={{ backgroundColor: activeAccentColor }}
                                >
                                  {stop.order}
                                </span>
                                <div>
                                  <h5 className="font-bold text-xs text-stone-100">{stop.locationName}</h5>
                                  <div className="flex items-center gap-2 text-[10px] text-stone-400">
                                    <span className="flex items-center gap-1">
                                      <Clock className="w-3 h-3 text-amber-400" /> {stop.timeSlot}
                                    </span>
                                    <span>•</span>
                                    <span>{stop.province || 'Phương Nam'}</span>
                                  </div>
                                </div>
                              </div>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleStopVisited(idx);
                                }}
                                className={`p-1.5 rounded-xl border text-xs font-bold flex items-center gap-1 ${
                                  stop.isVisited
                                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                                    : 'bg-stone-900 text-stone-500 border-stone-800 hover:text-stone-300'
                                }`}
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span className="text-[10px] hidden sm:inline">
                                  {stop.isVisited ? 'Đã Đến' : 'Chưa Đến'}
                                </span>
                              </button>
                            </div>

                            {/* Details when selected */}
                            {isSelected && (
                              <div className="mt-2.5 pt-2.5 border-t border-stone-800 text-xs space-y-2 animate-fadeIn">
                                {stop.guideVoiceNarration && (
                                  <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/30 text-amber-200/95 space-y-2">
                                    <div className="flex items-center justify-between text-[11px] font-bold text-amber-300">
                                      <span className="flex items-center gap-1.5">
                                        <Bot className="w-3.5 h-3.5 text-amber-400" /> Lời Thuyết Minh Của HDV AI:
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => handlePlayAudioNarration(stop.guideVoiceNarration || '')}
                                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-stone-950 font-bold text-[10px] transition-all shadow-sm"
                                        title="Nghe giọng thuyết minh hòa quyện âm sắc Đàn Tranh Nam Bộ"
                                      >
                                        {isPlayingNarration ? (
                                          <>
                                            <span className="inline-block animate-pulse">🔊</span>
                                            <span>Đang Thuyết Minh...</span>
                                          </>
                                        ) : (
                                          <>
                                            <span>▶️</span>
                                            <span>Nghe Thuyết Minh & Đàn Tranh</span>
                                          </>
                                        )}
                                      </button>
                                    </div>
                                    <p className="text-[11px] italic leading-relaxed text-stone-300 pl-1 border-l-2 border-amber-500/40">
                                      "{stop.guideVoiceNarration}"
                                    </p>
                                  </div>
                                )}

                                <p className="text-stone-300 leading-relaxed">
                                  {stop.activityHighlight}
                                </p>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                                  <div className="p-2 rounded-xl bg-stone-900 border border-stone-800/80 flex items-start gap-1.5">
                                    <Camera className="w-3.5 h-3.5 text-yellow-400 shrink-0 mt-0.5" />
                                    <div>
                                      <strong className="text-amber-300">Khung Giờ Chụp Ảnh:</strong>
                                      <p className="text-stone-300">{stop.goldenPhotoHour}</p>
                                    </div>
                                  </div>

                                  <div className="p-2 rounded-xl bg-stone-900 border border-stone-800/80 flex items-start gap-1.5">
                                    <Utensils className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                                    <div>
                                      <strong className="text-amber-300">Món Ngon Lân Cận:</strong>
                                      <p className="text-stone-300">{stop.mustTryCuisine}</p>
                                    </div>
                                  </div>
                                </div>

                                <div className="p-2 rounded-xl bg-amber-950/20 border border-amber-500/20 text-[11px] text-amber-200/90 flex items-start gap-1.5">
                                  <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                                  <div>
                                    <strong>Mẹo Di Sản AI: </strong>{stop.aiLocalTip}
                                  </div>
                                </div>

                                {stop.spotChallengeTrivia && (
                                  <div className="p-2.5 rounded-xl bg-amber-950/30 border border-amber-400/40 text-[11px] space-y-1">
                                    <div className="flex items-center justify-between text-amber-300 font-bold">
                                      <span className="flex items-center gap-1">
                                        <Award className="w-3.5 h-3.5 text-amber-400" />
                                        Thử Thách Khám Phá Tại Điểm:
                                      </span>
                                      <span className="font-mono text-xs text-amber-400 font-black">+{stop.spotChallengeTrivia.rewardLP} LP</span>
                                    </div>
                                    <p className="text-stone-200 font-semibold">{stop.spotChallengeTrivia.question}</p>
                                    <p className="text-stone-400 italic">Đáp án gợi ý: <span className="text-amber-200 font-medium">{stop.spotChallengeTrivia.answer}</span></p>
                                  </div>
                                )}

                                <div className="flex items-center justify-end gap-2 pt-1 flex-wrap">
                                  {onOpenBaSonAI && (
                                    <button
                                      onClick={() => {
                                        sound.playClick();
                                        const prompt = `Cố vấn Ba Son ơi, hãy kể chi tiết hơn cho tôi nghe về điểm dừng "${stop.locationName}" trong lộ trình "${generatedItinerary?.title}", bao gồm những câu chuyện lịch sử thú vị và mẹo tham quan nhé!`;
                                        onClose();
                                        onOpenBaSonAI(prompt);
                                      }}
                                      className="px-3 py-1.5 rounded-xl bg-amber-950/40 hover:bg-amber-900/50 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1.5 transition-colors"
                                    >
                                      <Bot className="w-3.5 h-3.5 text-amber-400" />
                                      <span>Hỏi Cố Vấn Ba Son</span>
                                    </button>
                                  )}

                                  {targetLoc && onSelectAndTeleport && (
                                    <button
                                      onClick={() => {
                                        sound.playSuccess();
                                        onSelectAndTeleport(targetLoc);
                                        onClose();
                                      }}
                                      className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500 hover:text-stone-950 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1.5 transition-colors"
                                    >
                                      <Navigation className="w-3 h-3" />
                                      <span>Xem Trên Bản Đồ 3D</span>
                                    </button>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-8 rounded-2xl bg-stone-950 border border-stone-800 text-center space-y-3">
                  <Compass className="w-12 h-12 text-stone-600 animate-spin-slow" />
                  <h4 className="font-bold text-stone-300 text-sm">Chưa Có Lộ Trình Nào Được Tạo</h4>
                  <p className="text-xs text-stone-500 max-w-sm">
                    Hãy bấm nút "Tạo Lộ Trình AI Theo Sở Thích Của Tôi" để bắt đầu chuyến du ngoạn.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: PERSONAL WEBSITE COLOR & THEME CUSTOMIZER */}
        {modalTab === 'theme_colors' && (
          <div className="my-3 flex-1 overflow-y-auto pr-1 space-y-4 animate-fadeIn">
            {/* Header info */}
            <div className="p-4 rounded-2xl bg-stone-950 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-sm text-amber-200 flex items-center gap-2">
                  <Palette className="w-4 h-4 text-amber-400" />
                  Cá Nhân Hóa Màu Sắc & Giao Diện Toàn Trang Web
                </h3>
                <p className="text-xs text-stone-400 mt-0.5">
                  Tùy chỉnh phong cách thẩm mỹ và sắc thái chủ đạo của website theo sở thích riêng của bạn
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleApplyColors(activeSkinId, activeAccentColor)}
                className="px-4 py-2 rounded-xl text-stone-950 font-black text-xs shadow-lg transition-transform hover:scale-105 shrink-0 flex items-center gap-1.5"
                style={{ backgroundColor: activeAccentColor }}
              >
                <Check className="w-4 h-4" />
                <span>Lưu & Áp Dụng Cho Toàn Web</span>
              </button>
            </div>

            {/* 1. Bộ 5 Phong Cách Lịch Sử */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-amber-300 uppercase tracking-wider block">
                1. Chọn Phong Cách Thẩm Mỹ Lịch Sử (Theme Skin)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {HISTORICAL_THEME_SKINS.map(skin => {
                  const isSelected = activeSkinId === skin.id;
                  return (
                    <div
                      key={skin.id}
                      onClick={() => handleApplyColors(skin.id, skin.previewColors.primary)}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                        isSelected
                          ? `${skin.cardBgClass} border-2 border-amber-400 shadow-xl scale-[1.02]`
                          : 'bg-stone-950 hover:bg-stone-900 border-stone-800'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-xs text-amber-200">{skin.name}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-stone-900 border border-stone-700 text-stone-300">
                          {skin.badgeTag}
                        </span>
                      </div>
                      <p className="text-[11px] text-amber-400 font-medium">{skin.tagline}</p>
                      <p className="text-[11px] text-stone-400 mt-1 line-clamp-2">{skin.description}</p>
                      
                      <div className="mt-2.5 pt-2 border-t border-stone-800/80 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <div className="w-4 h-4 rounded-full border border-stone-700" style={{ backgroundColor: skin.previewColors.primary }} />
                          <div className="w-4 h-4 rounded-full border border-stone-700" style={{ backgroundColor: skin.previewColors.accent }} />
                          <div className="w-4 h-4 rounded-full border border-stone-700" style={{ backgroundColor: skin.previewColors.background }} />
                        </div>
                        <span className={`text-[10px] font-bold ${isSelected ? 'text-emerald-400' : 'text-stone-500'}`}>
                          {isSelected ? '✓ Đang kích hoạt' : 'Chọn phong cách'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2. Bảng Màu Sắc Điểm Nhấn Tùy Biến (Custom Accent Colors) */}
            <div className="p-4 rounded-2xl bg-stone-950 border border-amber-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-amber-200">
                    2. Màu Sắc Điểm Nhấn Cá Nhân (Accent Color)
                  </h4>
                  <p className="text-[11px] text-stone-400">
                    Điểm tô màu sắc cho các nút điều hướng, viền huy hiệu và đường nối lộ trình
                  </p>
                </div>
                <div 
                  className="w-8 h-8 rounded-xl border-2 border-white/60 shadow-lg shrink-0"
                  style={{ backgroundColor: activeAccentColor }}
                />
              </div>

              {/* Preset swatches */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                {[
                  { color: '#d97706', label: 'Hoàng Cung (Vàng Triều Nguyễn)' },
                  { color: '#dc2626', label: 'Son Đỏ (Gạch Marseille Sài Gòn)' },
                  { color: '#0d9488', label: 'Ngọc Lục (Thủy Xưởng Ba Son)' },
                  { color: '#0284c7', label: 'Đại Dương (Biển Chiều Vũng Tàu)' },
                  { color: '#db2777', label: 'Hồng Sen (Đồng Tháp Mười)' },
                  { color: '#9333ea', label: 'Tím Quý Phái (Hoàng Gia Nam Bộ)' },
                  { color: '#ea580c', label: 'Cam Rực (Hoàng Hôn Cần Giờ)' },
                  { color: '#16a34a', label: 'Trúc Xanh (Gốm Cổ Đất Thủ)' }
                ].map(swatch => (
                  <button
                    key={swatch.color}
                    type="button"
                    onClick={() => handleApplyColors(activeSkinId, swatch.color)}
                    className={`p-2 rounded-xl text-[11px] font-semibold flex items-center gap-2 border transition-all text-left ${
                      activeAccentColor === swatch.color
                        ? 'border-amber-400 bg-stone-900 text-white shadow-md ring-1 ring-amber-400'
                        : 'border-stone-800 bg-stone-950 text-stone-400 hover:border-stone-700 hover:text-stone-200'
                    }`}
                  >
                    <span className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: swatch.color }} />
                    <span className="truncate">{swatch.label.split('(')[0]}</span>
                  </button>
                ))}
              </div>

              {/* Free Color Input */}
              <div className="flex items-center gap-3 pt-2 border-t border-stone-800">
                <span className="text-xs text-stone-400">Hoặc chọn mã màu tùy ý:</span>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={activeAccentColor}
                    onChange={(e) => handleApplyColors(activeSkinId, e.target.value)}
                    className="w-8 h-8 rounded-lg bg-transparent border border-stone-700 cursor-pointer"
                  />
                  <span className="text-xs font-mono font-bold text-amber-300">
                    {activeAccentColor}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Bottom Action Bar */}
        <div className="flex items-center justify-between pt-3 border-t border-amber-500/20 shrink-0">
          <button
            onClick={() => {
              if (onShareToForum && generatedItinerary) {
                onShareToForum(
                  `Lộ trình khám phá cùng HDV AI: ${generatedItinerary.title}`,
                  `Mình vừa cùng HDV ${generatedItinerary.tourGuide?.name || 'Cố Vấn Ba Son'} tạo lộ trình di sản cá nhân hóa "${generatedItinerary.title}" với ${generatedItinerary.stops.length} trạm dừng chân (${generatedItinerary.stops.map(s => s.locationName).join(' ➔ ')}). Lộ trình dài ${generatedItinerary.totalDistanceKm} km, đồng bộ màu sắc cá nhân hóa rất đẹp!`,
                  generatedItinerary.stops[0]?.locationName || 'Sài Gòn'
                );
                onClose();
              }
            }}
            className="px-3.5 py-2 rounded-xl bg-stone-950 hover:bg-stone-800 text-stone-400 hover:text-amber-200 border border-stone-800 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Chia Sẻ Lên Diễn Đàn</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-stone-950 hover:bg-stone-800 text-stone-300 border border-stone-800 text-xs font-semibold transition-colors"
            >
              Đóng
            </button>
            <button
              onClick={handleActivate}
              disabled={!generatedItinerary}
              className="px-6 py-2 rounded-xl text-stone-950 text-xs font-black shadow-lg flex items-center gap-2 transition-transform hover:scale-105 disabled:opacity-50"
              style={{ backgroundColor: activeAccentColor }}
            >
              <Navigation className="w-4 h-4 fill-stone-950" />
              <span>Bật HDV AI Dẫn Tour Trên Bản Đồ 3D</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
