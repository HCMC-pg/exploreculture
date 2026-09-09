import React, { useState } from 'react';
import { 
  X, 
  Award, 
  Sparkles, 
  MapPin, 
  Compass, 
  CheckCircle2, 
  ShieldCheck, 
  User,
  Edit2,
  Share2,
  BookOpen,
  Flame,
  Star,
  CheckCircle,
  AlertCircle,
  Clock,
  Zap,
  Package,
  Layers,
  ChevronRight,
  RotateCcw,
  Shirt,
  Palette,
  Heart,
  Target,
  Bookmark,
  Calendar,
  Headphones,
  Eye,
  FileText,
  BrainCircuit,
  Cloud,
  Check
} from 'lucide-react';
import { UserProfile, Badge, HistoricalThemeId, Category, UserPreferences } from '../types';
import { BADGES } from '../data/badges';
import { LOCATIONS } from '../data/locations';
import { HISTORICAL_THEME_SKINS, getHistoricalSkin } from '../data/historicalThemes';
import { AI_TOUR_GUIDES } from '../data/aiTourGuides';
import { sound } from '../utils/audio';
import { 
  getLearningMemory, 
  getReviewQuestions, 
  getActiveTravelerBuffs,
  getUserPreferences,
  saveUserPreferences,
  getLearningHabits,
  saveLearningHabits,
  syncProgressToBackend,
  QuestStepAttempt 
} from '../utils/learningStorage';
import { WeeklyStudyBarChart } from './WeeklyStudyBarChart';

interface UserProfileModalProps {
  user: UserProfile;
  onClose: () => void;
  onUpdateName: (name: string) => void;
  onUpdateUserProfile?: (updated: UserProfile) => void;
  onSelectTheme?: (themeId: HistoricalThemeId, customAccentColor?: string) => void;
  currentThemeId?: HistoricalThemeId;
  onResetProgress?: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  user,
  onClose,
  onUpdateName,
  onUpdateUserProfile,
  onSelectTheme,
  currentThemeId = 'classic_amber',
  onResetProgress
}) => {
  const [activeTab, setActiveTab] = useState<'habits' | 'learning' | 'review' | 'gear' | 'theme' | 'passport'>('habits');
  const [isEditing, setIsEditing] = useState(false);
  const [nameInput, setNameInput] = useState(user.name);
  const [preferences, setPreferences] = useState<UserPreferences>(() => getUserPreferences());
  const [habits, setHabits] = useState(() => getLearningHabits());
  const [isSavingPrefs, setIsSavingPrefs] = useState(false);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const memory = getLearningMemory();
  const reviewQuestions = getReviewQuestions();
  const buffs = getActiveTravelerBuffs();

  const handleSaveName = () => {
    if (nameInput.trim()) {
      onUpdateName(nameInput.trim());
      setIsEditing(false);
      sound.playSuccess();
    }
  };

  const handleUpdatePreferenceField = <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => {
    const updated = { ...preferences, [key]: value };
    setPreferences(updated);
    saveUserPreferences(updated);
    sound.playClick();
  };

  const handleToggleCategory = (cat: Category) => {
    const list = [...preferences.favoriteCategories];
    const idx = list.indexOf(cat);
    if (idx >= 0) {
      if (list.length > 1) list.splice(idx, 1);
    } else {
      list.push(cat);
    }
    handleUpdatePreferenceField('favoriteCategories', list);
  };

  const handleToggleEra = (era: string) => {
    const list = [...preferences.preferredEras];
    const idx = list.indexOf(era);
    if (idx >= 0) {
      if (list.length > 1) list.splice(idx, 1);
    } else {
      list.push(era);
    }
    handleUpdatePreferenceField('preferredEras', list);
  };

  const handleSaveAllPreferences = async () => {
    setIsSavingPrefs(true);
    saveUserPreferences(preferences);
    const updatedProfile: UserProfile = {
      ...user,
      preferences,
      learningHabits: habits
    };
    if (onUpdateUserProfile) {
      onUpdateUserProfile(updatedProfile);
    }
    await syncProgressToBackend(updatedProfile);
    setIsSavingPrefs(false);
    setSaveSuccessNotice(true);
    sound.playSuccess();
    setTimeout(() => setSaveSuccessNotice(false), 3000);
  };

  const safeBadgesUnlocked = Array.isArray(user?.badgesUnlocked) ? user.badgesUnlocked : [];
  const unlockedBadges = (BADGES || []).filter(b => safeBadgesUnlocked.includes(b.id));

  const CATEGORY_OPTIONS: { id: Category; label: string; icon: string }[] = [
    { id: 'architecture', label: 'Kiến Trúc & Cổ Vật', icon: '🏛️' },
    { id: 'history', label: 'Lịch Sử Sài Gòn - Nam Bộ', icon: '📜' },
    { id: 'cuisine', label: 'Ẩm Thực Phương Nam', icon: '🍲' },
    { id: 'culture', label: 'Tín Ngưỡng & Lễ Hội', icon: '🏮' },
    { id: 'traditional_art', label: 'Đờn Ca Tài Tử & Cải Lương', icon: '🎭' },
    { id: 'nature_coastal', label: 'Di Sản Biển Đảo & Sông Nước', icon: '⛵' },
    { id: 'secret_alley', label: 'Hẻm Phố & Ký Ức Đô Thị', icon: '🚲' }
  ];

  const ERA_OPTIONS = [
    'Thời Chúa Nguyễn & Gia Định Kinh (1698 - 1858)',
    'Thời Kỳ Giao Thoa & Pháp Thuộc (1859 - 1945)',
    'Kháng Chiến & Di Tích Lịch Sử (1945 - 1975)',
    'Ký Ức Sài Gòn Thập Niên 60-90',
    'Đô Thị Sáng Tạo & Di Sản Đương Đại'
  ];

  const LEARNING_STYLES = [
    { id: 'interactive', label: 'Giải Mật Thư & Câu Đố', desc: 'Học qua câu hỏi tương tác & mini-game', icon: BrainCircuit },
    { id: 'visual', label: 'Trực Quan 3D & AR', desc: 'Khám phá mô hình kiến trúc & camera AR', icon: Eye },
    { id: 'auditory', label: 'Thính Giác & Ngâm Thơ', desc: 'Lắng nghe giọng đọc truyền cảm & ngũ cung', icon: Headphones },
    { id: 'reading', label: 'Đọc Sử Liệu & Bia Ký', desc: 'Đọc kỹ tư liệu lịch sử chuyên sâu', icon: FileText }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div className="w-full max-w-2xl bg-stone-900 border-2 border-amber-500/40 rounded-3xl p-5 sm:p-6 shadow-2xl text-stone-100 space-y-4 relative overflow-hidden max-h-[92vh] flex flex-col">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-stone-950 text-stone-400 hover:text-stone-100 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Passport Top Cover Header */}
        <div className="text-center space-y-1 pb-3 border-b border-stone-800 shrink-0">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 mb-0.5">
            <Compass className="w-5 h-5 animate-spin-slow" />
          </div>
          <p className="text-[10px] uppercase font-bold tracking-widest text-amber-400">
            HỒ SƠ LỮ KHÁCH & TRUNG TÂM TIẾN TRÌNH HỌC TẬP
          </p>
          <h2 className="font-['Be_Vietnam_Pro',sans-serif] font-black text-lg sm:text-xl text-amber-200">
            Hộ Chiếu & Bộ Nhớ Tri Thức Phương Nam
          </h2>
        </div>

        {/* Top Navigation Tabs */}
        <div className="flex items-center gap-1.5 border-b border-stone-800 pb-2 overflow-x-auto shrink-0 no-scrollbar">
          {[
            { id: 'habits', label: '🎯 Thói Quen & Sở Thích', icon: Target },
            { id: 'learning', label: '📊 Tiến Trình Học Tập', icon: BookOpen },
            { id: 'review', label: `📝 Sổ Tay Ôn Tập (${reviewQuestions.length})`, icon: RotateCcw },
            { id: 'gear', label: `🎒 Trang Bị (${buffs.equippedCount})`, icon: Package },
            { id: 'passport', label: '🪪 Hộ Chiếu', icon: Award }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  sound.playClick();
                  setActiveTab(tab.id as any);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 ${
                  activeTab === tab.id
                    ? 'bg-amber-500 text-stone-950 font-extrabold shadow-lg'
                    : 'bg-stone-950 text-stone-400 hover:text-amber-200 border border-stone-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          
          {/* TAB 0: HABITS & PREFERENCES (NEW COMPREHENSIVE HUB) */}
          {activeTab === 'habits' && (
            <div className="space-y-5 animate-fadeIn">
              
              {/* Daily Goal & Streak Progress Header */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/40 via-stone-950 to-stone-950 border border-amber-500/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-amber-400" />
                    <h3 className="font-bold text-amber-200 text-sm sm:text-base">Mục Tiêu Thói Quen Học Tập Hàng Ngày</h3>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                    Chuỗi: {habits.currentDailyStreak} ngày 🔥
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  {[15, 30, 45, 60].map(mins => {
                    const isSelected = preferences.dailyStudyGoalMinutes === mins;
                    return (
                      <button
                        key={mins}
                        onClick={() => handleUpdatePreferenceField('dailyStudyGoalMinutes', mins)}
                        className={`p-2.5 rounded-xl border text-center transition-all ${
                          isSelected
                            ? 'bg-amber-500 text-stone-950 border-amber-400 font-bold shadow-md'
                            : 'bg-stone-900/90 text-stone-300 border-stone-800 hover:border-amber-500/40'
                        }`}
                      >
                        <p className="text-xs font-bold">{mins} phút/ngày</p>
                        <p className={`text-[10px] ${isSelected ? 'text-stone-900 font-semibold' : 'text-amber-400/80'}`}>
                          +{mins * 2} LP thưởng
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Recharts Weekly Study & Interaction Bar Chart */}
              <WeeklyStudyBarChart 
                weeklyRecords={habits.weeklyRecords}
                dailyGoalMinutes={preferences.dailyStudyGoalMinutes || 20}
                learningHabits={habits}
                totalStudyHours={user.studyHours}
                totalStudyMinutes={user.studyMinutes}
              />

              {/* Learning Style Preferences */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                  <BrainCircuit className="w-4 h-4 text-amber-400" />
                  Phong Cách Học Tập Yêu Thích
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {LEARNING_STYLES.map(style => {
                    const Icon = style.icon;
                    const isSelected = preferences.learningStyle === style.id;
                    return (
                      <div
                        key={style.id}
                        onClick={() => handleUpdatePreferenceField('learningStyle', style.id as any)}
                        className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                          isSelected
                            ? 'bg-amber-950/30 border-amber-400 shadow-md ring-1 ring-amber-400/40'
                            : 'bg-stone-950 border-stone-800 hover:border-stone-700'
                        }`}
                      >
                        <div className={`p-2 rounded-xl shrink-0 ${isSelected ? 'bg-amber-500 text-stone-950' : 'bg-stone-900 text-stone-400'}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-stone-200">{style.label}</p>
                          <p className="text-[11px] text-stone-400 leading-snug">{style.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Favorite Heritage Categories */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Heart className="w-4 h-4 text-rose-400" />
                  Chủ Đề Di Sản Quan Tâm (Chọn nhiều)
                </h4>
                <div className="flex flex-wrap gap-2">
                  {CATEGORY_OPTIONS.map(cat => {
                    const isSelected = preferences.favoriteCategories.includes(cat.id);
                    return (
                      <button
                        key={cat.id}
                        onClick={() => handleToggleCategory(cat.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all border ${
                          isSelected
                            ? 'bg-amber-500/20 text-amber-300 border-amber-400 font-bold shadow'
                            : 'bg-stone-950 text-stone-400 border-stone-800 hover:text-stone-200'
                        }`}
                      >
                        <span>{cat.icon}</span>
                        <span>{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Preferred Historical Eras */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-400" />
                  Thời Kỳ Lịch Sử Yêu Thích
                </h4>
                <div className="space-y-1.5">
                  {ERA_OPTIONS.map(era => {
                    const isSelected = preferences.preferredEras.includes(era);
                    return (
                      <div
                        key={era}
                        onClick={() => handleToggleEra(era)}
                        className={`p-2.5 rounded-xl border text-xs cursor-pointer flex items-center justify-between transition-all ${
                          isSelected
                            ? 'bg-amber-950/20 border-amber-500/50 text-amber-200 font-semibold'
                            : 'bg-stone-950 border-stone-800 text-stone-400 hover:text-stone-300'
                        }`}
                      >
                        <span>{era}</span>
                        <span className={`w-4 h-4 rounded-md flex items-center justify-center text-[10px] ${
                          isSelected ? 'bg-amber-500 text-stone-950 font-bold' : 'border border-stone-700'
                        }`}>
                          {isSelected && '✓'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Favorite AI Tour Guide Selection */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-4 h-4 text-amber-400" />
                  Cố Vấn AI Đồng Hành Yêu Thích
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {AI_TOUR_GUIDES.map(guide => {
                    const isSelected = preferences.preferredGuideId === guide.id;
                    return (
                      <div
                        key={guide.id}
                        onClick={() => handleUpdatePreferenceField('preferredGuideId', guide.id as any)}
                        className={`p-2.5 rounded-2xl border text-center cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-amber-950/30 border-amber-400 ring-1 ring-amber-400/40 shadow-md'
                            : 'bg-stone-950 border-stone-800 hover:border-stone-700'
                        }`}
                      >
                        <img src={guide.avatar} alt={guide.name} className="w-10 h-10 rounded-full mx-auto object-cover border border-amber-400/60 mb-1.5" />
                        <p className="text-xs font-bold text-stone-200 truncate">{guide.name}</p>
                        <p className="text-[10px] text-amber-400 truncate">{guide.badge}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Save & Cloud Sync Action */}
              <div className="pt-3 border-t border-stone-800 flex items-center justify-between">
                <span className="text-xs text-stone-400 flex items-center gap-1.5">
                  <Cloud className="w-4 h-4 text-cyan-400" />
                  <span>Tự động đồng bộ tiến trình học vào đám mây</span>
                </span>

                <button
                  onClick={handleSaveAllPreferences}
                  disabled={isSavingPrefs}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-stone-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all"
                >
                  {saveSuccessNotice ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-950" />
                      <span>Đã Lưu & Đồng Bộ!</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>{isSavingPrefs ? 'Đang Lưu...' : 'Lưu Thói Quen & Sở Thích'}</span>
                    </>
                  )}
                </button>
              </div>

            </div>
          )}

          {/* TAB 1: LEARNING STATS & PROGRESS */}
          {activeTab === 'learning' && (
            <div className="space-y-4 animate-fadeIn">
              {/* Daily Streak Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-orange-950/40 via-amber-950/30 to-stone-950 border border-orange-500/40 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-orange-500/20 border border-orange-500/50 flex items-center justify-center text-orange-400">
                    <Flame className="w-7 h-7 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="font-bold text-amber-200 text-sm sm:text-base">
                      Chuỗi Học Tập {memory.dailyStreak.currentStreak} Ngày Liên Tiếp
                    </h3>
                    <p className="text-xs text-stone-300">
                      Hôm nay đã hoàn thành: <strong className="text-amber-400">{memory.dailyStreak.todayQuestionsAnswered}</strong> / {memory.dailyStreak.dailyGoal} câu hỏi
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-stone-400 block uppercase">Kỷ lục dài nhất</span>
                  <span className="text-sm font-bold font-mono text-orange-400">{memory.dailyStreak.longestStreak} ngày</span>
                </div>
              </div>

              {/* 4 Key Metrics Dashboard */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-stone-950 border border-amber-500/30">
                  <p className="text-[10px] text-stone-400 uppercase tracking-wider">Tổng Câu Đã Làm</p>
                  <p className="text-xl font-bold font-mono text-amber-300">{memory.totalQuestionsAnswered}</p>
                  <p className="text-[10px] text-stone-500">Tất cả 21 nhiệm vụ</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-stone-950 border border-amber-500/30">
                  <p className="text-[10px] text-stone-400 uppercase tracking-wider">Câu Đúng Chính Xác</p>
                  <p className="text-xl font-bold font-mono text-emerald-400">{memory.totalCorrectAnswers}</p>
                  <p className="text-[10px] text-emerald-500 font-semibold">{memory.overallAccuracy}% độ chính xác</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-stone-950 border border-amber-500/30">
                  <p className="text-[10px] text-stone-400 uppercase tracking-wider">Thời Gian Học Tập</p>
                  <p className="text-xl font-bold font-mono text-cyan-400">{memory.totalStudyMinutes} phút</p>
                  <p className="text-[10px] text-stone-500">Thám hiểm tích lũy</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-stone-950 border border-amber-500/30">
                  <p className="text-[10px] text-stone-400 uppercase tracking-wider">Nhiệm Vụ Đã Học</p>
                  <p className="text-xl font-bold font-mono text-purple-400">{Object.keys(memory.questRecords).length} / 21</p>
                  <p className="text-[10px] text-stone-500">20+ câu mỗi nhiệm vụ</p>
                </div>
              </div>

              {/* Recharts Weekly Heritage Exploration & Study Hours Chart */}
              <WeeklyStudyBarChart 
                weeklyRecords={habits.weeklyRecords}
                dailyGoalMinutes={preferences.dailyStudyGoalMinutes || 20}
                learningHabits={habits}
                totalStudyHours={user.studyHours}
                totalStudyMinutes={user.studyMinutes}
              />

              {/* Quest History Breakdown */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                  Lịch Sử Các Nhiệm Vụ Đã Thám Hiểm
                </h4>

                {Object.values(memory.questRecords).length === 0 ? (
                  <div className="p-4 rounded-xl bg-stone-950 text-center text-xs text-stone-400 border border-stone-800">
                    Chưa có lịch sử câu hỏi. Hãy bắt đầu một nhiệm vụ từ Bản đồ 3D để lưu tiến trình học tập!
                  </div>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {Object.values(memory.questRecords).map(qr => (
                      <div key={qr.questId} className="p-3 rounded-xl bg-stone-950 border border-stone-800 flex items-center justify-between gap-3 text-xs">
                        <div>
                          <p className="font-bold text-stone-200">{qr.title}</p>
                          <p className="text-[11px] text-stone-400">
                            {qr.correctCount} / {qr.totalQuestions} câu đúng ({qr.scorePercent}%) • {qr.timeSpentMinutes} phút
                          </p>
                        </div>
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          qr.isCompleted ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-amber-500/20 text-amber-300'
                        }`}>
                          {qr.isCompleted ? 'Đã Hoàn Tất' : 'Đang Làm'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: REVIEW NOTEBOOK */}
          {activeTab === 'review' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-3 rounded-xl bg-stone-950 border border-amber-500/30 text-xs text-stone-300 flex items-center justify-between">
                <span>Tổng hợp các câu hỏi đã làm sai hoặc được bạn đánh dấu ghim để ôn tập củng cố:</span>
                <span className="font-bold text-amber-300">{reviewQuestions.length} câu</span>
              </div>

              {reviewQuestions.length === 0 ? (
                <div className="p-8 rounded-2xl bg-stone-950 text-center space-y-2 border border-stone-800">
                  <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto" />
                  <h4 className="font-bold text-stone-200 text-sm">Tuyệt Vời! Không Có Câu Nào Cần Ôn Tập</h4>
                  <p className="text-xs text-stone-400">Bạn đã trả lời đúng tất cả các câu hỏi đã thử thách.</p>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-72 overflow-y-auto">
                  {reviewQuestions.map((q, idx) => (
                    <div
                      key={q.stepId || idx}
                      className="p-3.5 rounded-2xl bg-stone-950 border border-stone-800 hover:border-amber-500/40 space-y-2 transition-all"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className={`w-5 h-5 rounded-md text-[10px] font-bold flex items-center justify-center ${
                            q.isCorrect ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                          }`}>
                            {q.isCorrect ? '✓' : '✗'}
                          </span>
                          <h5 className="font-bold text-xs text-stone-200">{q.questionText}</h5>
                        </div>
                        {q.starred && <Star className="w-4 h-4 text-amber-400 fill-amber-400 shrink-0" />}
                      </div>

                      <div className="p-2.5 rounded-xl bg-stone-900 border border-stone-800 text-[11px] space-y-1">
                        <p className="text-emerald-400">
                          <strong>Đáp án đúng: </strong>{String(q.correctAnswer)}
                        </p>
                        <p className="text-stone-300 leading-relaxed">
                          <strong>Giải thích: </strong>{q.explanation}
                        </p>
                        {q.note && (
                          <p className="text-cyan-300 pt-1 border-t border-stone-800">
                            <strong>Ghi chú của bạn: </strong>{q.note}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: EQUIPPED GEAR */}
          {activeTab === 'gear' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-3 rounded-xl bg-stone-950 border border-amber-500/30 text-xs text-stone-300 flex items-center justify-between">
                <span>Trang bị du hành & cổ phục:</span>
                <span className="text-[11px] text-amber-400 font-semibold">Tự động kích hoạt hiệu ứng</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(Object.values(memory.equippedGear) as any[]).map((gear: any) => (
                  <div
                    key={gear.id}
                    className={`p-3.5 rounded-2xl border ${
                      gear.isEquipped ? 'bg-amber-950/20 border-amber-500/50' : 'bg-stone-950 border-stone-800 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-xs text-amber-200">{gear.name}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        gear.isEquipped ? 'bg-emerald-500 text-stone-950' : 'bg-stone-800 text-stone-400'
                      }`}>
                        {gear.isEquipped ? 'Đang Mặc' : 'Trong Túi'}
                      </span>
                    </div>
                    <p className="text-[11px] text-amber-400 font-bold flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      {gear.buffName}
                    </p>
                    <p className="text-[11px] text-stone-300 mt-1">{gear.buffDescription}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: PASSPORT & BADGES */}
          {activeTab === 'passport' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl bg-stone-950 border border-amber-500/30">
                <div className="relative w-16 h-16 rounded-2xl overflow-hidden border-2 border-amber-400/60 shadow-lg shrink-0">
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                </div>

                <div className="flex-1 space-y-1 text-center sm:text-left">
                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={nameInput}
                        onChange={(e) => setNameInput(e.target.value)}
                        className="px-3 py-1 rounded-lg bg-stone-900 border border-amber-400 text-sm text-stone-100 font-bold outline-none"
                      />
                      <button
                        onClick={handleSaveName}
                        className="px-3 py-1 rounded-lg bg-amber-500 text-stone-950 text-xs font-bold"
                      >
                        Lưu
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center sm:justify-start gap-2">
                      <h3 className="font-bold text-base text-amber-200">{user.name}</h3>
                      <button onClick={() => setIsEditing(true)} className="text-stone-400 hover:text-amber-300">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                  <p className="text-xs text-amber-400/90 font-semibold">{user.title}</p>
                  <p className="text-[11px] text-stone-400">Cấp Độ {user.level} • {user.lpPoints} LP</p>
                </div>
              </div>

              {/* Badges Collection */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                  Bộ Sưu Tập Huy Hiệu Di Sản ({unlockedBadges.length} / {BADGES.length})
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-48 overflow-y-auto">
                  {BADGES.map(b => {
                    const isUnlocked = safeBadgesUnlocked.includes(b.id);
                    return (
                      <div
                        key={b.id}
                        className={`p-2.5 rounded-xl border flex items-center gap-2.5 ${
                          isUnlocked ? 'bg-stone-950 border-amber-500/40 text-stone-100' : 'bg-stone-950/40 border-stone-800 text-stone-600 opacity-50'
                        }`}
                      >
                        <span className="text-lg">{b.icon || '🏅'}</span>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold truncate">{b.name}</p>
                          <p className="text-[10px] text-stone-400 truncate">{isUnlocked ? 'Đã mở khóa' : 'Chưa mở'}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Reset Progress Section */}
              <div className="pt-4 border-t border-stone-800">
                {!showResetConfirm ? (
                  <button
                    onClick={() => setShowResetConfirm(true)}
                    className="w-full py-2.5 px-4 rounded-xl border border-rose-900/50 bg-rose-950/20 text-rose-400 hover:bg-rose-950/40 hover:border-rose-500/50 text-xs font-bold transition-all flex items-center justify-center gap-2"
                  >
                    <span>🔄</span>
                    <span>Đặt Lại Điểm Số & Tiến Trình (Reset về 0 LP)</span>
                  </button>
                ) : (
                  <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/40 space-y-3">
                    <p className="text-xs text-rose-200 text-center font-medium">
                      Bạn có chắc chắn muốn đặt lại điểm số LP, huy hiệu và các nhiệm vụ đã hoàn thành về 0 để trải nghiệm lại từ đầu?
                    </p>
                    <div className="flex items-center justify-center gap-3">
                      <button
                        onClick={() => {
                          if (onResetProgress) onResetProgress();
                          setShowResetConfirm(false);
                        }}
                        className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow"
                      >
                        Xác Nhận Đặt Lại Về 0
                      </button>
                      <button
                        onClick={() => setShowResetConfirm(false)}
                        className="px-4 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold text-xs"
                      >
                        Hủy Bỏ
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

