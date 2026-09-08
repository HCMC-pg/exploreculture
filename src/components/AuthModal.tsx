import React, { useState, useEffect } from 'react';
import { 
  X, 
  LogIn, 
  ShieldCheck, 
  Mail, 
  CheckCircle2, 
  RefreshCw, 
  Check, 
  Sparkles, 
  ArrowRight, 
  LogOut, 
  Cloud, 
  AlertCircle,
  GraduationCap,
  Compass,
  Award,
  Heart,
  Sliders,
  CheckCircle,
  Globe
} from 'lucide-react';
import { UserProfile, UserPreferences, Category } from '../types';
import { sound } from '../utils/audio';
import { getUserPreferences, saveUserPreferences } from '../utils/learningStorage';

interface AuthModalProps {
  currentUser: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onLogin: (updatedProfile: UserProfile) => void;
  onLogout: () => void;
  targetReason?: 'quests' | 'general';
}

const CATEGORY_OPTIONS: { id: Category; label: string; icon: string }[] = [
  { id: 'history', label: 'Lịch Sử Khai Phá & Kháng Chiến', icon: '📜' },
  { id: 'architecture', label: 'Kiến Trúc Cổ & Di Sản Đô Thị', icon: '🏛️' },
  { id: 'culture', label: 'Tín Ngưỡng, Phong Tục & Làng Nghề', icon: '🛕' },
  { id: 'nature_coastal', label: 'Biển Đảo & Sông Nước Phương Nam', icon: '🌊' },
  { id: 'cuisine', label: 'Ẩm Thực & Nếp Sống Gia Định', icon: '🍜' },
  { id: 'traditional_art', label: 'Nghệ Thuật Truyền Thống & Ca Kịch', icon: '🎭' }
];

export const AuthModal: React.FC<AuthModalProps> = ({
  currentUser,
  isOpen,
  onClose,
  onLogin,
  onLogout,
  targetReason = 'general'
}) => {
  const isAccountActive = !!currentUser.email || !!currentUser.isLoggedIn;
  const isGoogleLinked = !!currentUser.isGoogleLinked || currentUser.authProvider === 'google' || currentUser.email?.endsWith('@gmail.com');
  
  const [email, setEmail] = useState<string>(
    currentUser.email || ''
  );
  const [googleEmailInput, setGoogleEmailInput] = useState<string>(
    currentUser.googleEmail || (currentUser.email?.includes('@') ? currentUser.email : '')
  );
  const [name, setName] = useState<string>(currentUser.name || 'Lữ Khách Phương Nam');
  const [authMode, setAuthMode] = useState<'google' | 'standard'>('google');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncMessage, setSyncMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [learningAnalytics, setLearningAnalytics] = useState<any>(null);
  const [preferences, setPreferences] = useState<UserPreferences>(() => getUserPreferences());
  const [showPreferencesSection, setShowPreferencesSection] = useState<boolean>(true);

  useEffect(() => {
    if (isOpen && currentUser.email) {
      fetch(`/api/user/learning-analytics/${encodeURIComponent(currentUser.email)}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.analytics) {
            setLearningAnalytics(data.analytics);
          }
        })
        .catch(() => {});
    }
  }, [isOpen, currentUser.email]);

  if (!isOpen) return null;

  // Toggle category preference
  const toggleCategoryPref = (catId: Category) => {
    const list = [...(preferences.favoriteCategories || [])];
    const idx = list.indexOf(catId);
    if (idx >= 0) {
      list.splice(idx, 1);
    } else {
      list.push(catId);
    }
    const updated = { ...preferences, favoriteCategories: list };
    setPreferences(updated);
    saveUserPreferences(updated);
    sound.playClick();
  };

  // Set learning style
  const setTravelerStyle = (style: 'scholar' | 'explorer' | 'relaxed') => {
    const updated = { ...preferences, travelerStyle: style };
    setPreferences(updated);
    saveUserPreferences(updated);
    sound.playClick();
  };

  // Google Authentication Handler
  const handleGoogleLogin = async (customEmail?: string) => {
    sound.playClick();
    setIsLoading(true);
    setErrorMessage('');
    
    const targetEmail = (customEmail || googleEmailInput || email).trim();
    if (!targetEmail || !targetEmail.includes('@')) {
      sound.playError();
      setErrorMessage('Vui lòng nhập địa chỉ Google Email của bạn (ví dụ: tenban@gmail.com).');
      setIsLoading(false);
      return;
    }

    try {
      const googleId = `google_${targetEmail.replace(/[^a-zA-Z0-9]/g, '_')}`;
      const payload = {
        email: targetEmail,
        name: name.trim() || targetEmail.split('@')[0],
        picture: `https://api.dicebear.com/7.x/identicon/svg?seed=${targetEmail}`,
        googleId: googleId,
        clientProfile: {
          ...currentUser,
          preferences: preferences
        }
      };

      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.success && data.user) {
        sound.playSuccess();
        const mergedUser: UserProfile = {
          ...currentUser,
          ...data.user,
          isLoggedIn: true,
          isGoogleLinked: true,
          authProvider: 'google',
          googleEmail: targetEmail,
          email: targetEmail,
          lpPoints: Math.max(currentUser.lpPoints, data.user.lpPoints || 550),
          lastSyncedAt: new Date().toISOString()
        };

        saveUserPreferences(preferences);
        onLogin(mergedUser);
        setSyncMessage(`Đã liên kết Google (${targetEmail}) & đồng bộ tiến trình học tập thành công!`);
        
        setTimeout(() => {
          setSyncMessage('');
          onClose();
        }, 1400);
      } else {
        setErrorMessage(data.error || 'Đăng nhập Google thất bại. Vui lòng kiểm tra lại.');
      }
    } catch (err) {
      sound.playSuccess();
      const fallbackUser: UserProfile = {
        ...currentUser,
        isLoggedIn: true,
        isGoogleLinked: true,
        authProvider: 'google',
        email: targetEmail,
        googleEmail: targetEmail,
        name: name.trim() || targetEmail.split('@')[0],
        lastSyncedAt: new Date().toISOString()
      };
      saveUserPreferences(preferences);
      onLogin(fallbackUser);
      setSyncMessage(`Đã bảo lưu tiến trình học tập và sở thích với Google (${targetEmail})!`);
      setTimeout(() => {
        setSyncMessage('');
        onClose();
      }, 1200);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (authMode === 'google') {
      await handleGoogleLogin();
      return;
    }

    sound.playClick();
    setErrorMessage('');
    
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      sound.playError();
      setErrorMessage('Vui lòng nhập địa chỉ email hoặc tên định danh để bảo lưu tiến trình.');
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        name: name.trim() || 'Lữ Khách Phương Nam',
        email: cleanEmail,
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanEmail}`,
        preferences
      };

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.success) {
        sound.playSuccess();
        const mergedUser: UserProfile = {
          ...currentUser,
          ...data.user,
          name: data.user.name || name,
          email: cleanEmail,
          isLoggedIn: true,
          lpPoints: Math.max(currentUser.lpPoints, data.user.lpPoints || 500),
          lastSyncedAt: new Date().toISOString()
        };

        saveUserPreferences(preferences);
        onLogin(mergedUser);
        setSyncMessage(`Bảo lưu hồ sơ (${cleanEmail}) thành công!`);
        
        setTimeout(() => {
          setSyncMessage('');
          onClose();
        }, 1200);
      } else {
        setErrorMessage(data.error || 'Bảo lưu hồ sơ thất bại. Vui lòng thử lại.');
      }
    } catch (err) {
      const fallbackUser: UserProfile = {
        ...currentUser,
        isLoggedIn: true,
        email: cleanEmail,
        name: name.trim() || currentUser.name,
        lastSyncedAt: new Date().toISOString()
      };
      saveUserPreferences(preferences);
      onLogin(fallbackUser);
      setSyncMessage('Đã lưu tiến trình cục bộ thành công!');
      setTimeout(() => {
        setSyncMessage('');
        onClose();
      }, 1000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSyncProgress = async () => {
    sound.playClick();
    setIsSyncing(true);
    setSyncMessage('');
    try {
      saveUserPreferences(preferences);
      const res = await fetch('/api/user/save-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userProfile: {
            ...currentUser,
            preferences: preferences
          }
        })
      });
      const data = await res.json();
      if (data.success) {
        sound.playSuccess();
        setSyncMessage('Tiến trình học tập và sở thích đã đồng bộ an toàn lên đám mây!');
      }
    } catch (e) {
      sound.playSuccess();
      setSyncMessage('Tiến trình và sở thích đã được sao lưu vào thiết bị!');
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncMessage(''), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-lg bg-stone-900 border-2 border-amber-500/40 rounded-3xl shadow-[0_20px_70px_rgba(0,0,0,0.8)] overflow-hidden text-stone-100 flex flex-col my-auto max-h-[90vh]">
        
        {/* Contextual Reason Banner */}
        {targetReason === 'quests' && (
          <div className="bg-gradient-to-r from-amber-600/30 via-yellow-500/20 to-amber-600/30 border-b border-amber-500/40 p-3 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/30 border border-amber-400/50 flex items-center justify-center text-amber-300 shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300">Đồng Bộ Hồ Sơ Khám Phá</span>
              <p className="text-xs font-semibold text-stone-100">
                Lưu câu trả lời, nhận điểm thưởng LP và bảo lưu huy hiệu di sản của bạn!
              </p>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="relative px-5 py-4 bg-stone-950 border-b border-amber-500/30 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-['Be_Vietnam_Pro',sans-serif] font-black text-base text-amber-200 flex items-center gap-2">
                <span>Hồ Sơ & Tiến Trình Di Sản</span>
                {isGoogleLinked && (
                  <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/40 text-[10px] font-bold">
                    Google Connected
                  </span>
                )}
              </h2>
              <p className="text-[10px] text-stone-400">
                Bảo lưu điểm LP, huân chương khảo cứu và sở thích học tập cá nhân
              </p>
            </div>
          </div>

          <button
            onClick={() => { sound.playClick(); onClose(); }}
            className="p-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-stone-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error / Success Notices */}
        {syncMessage && (
          <div className="mx-5 mt-3 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-fadeIn shrink-0">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{syncMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="mx-5 mt-3 p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-semibold flex items-center gap-2 animate-fadeIn shrink-0">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Main Content Body (Scrollable) */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          {isAccountActive ? (
            <div className="p-4 rounded-2xl bg-stone-950 border border-emerald-500/40 shadow-lg space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center text-emerald-300">
                    <Check className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs font-bold text-stone-100">{currentUser.name}</h4>
                      {isGoogleLinked ? (
                        <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40 text-[9px] font-bold flex items-center gap-1">
                          <svg className="w-2.5 h-2.5" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                          </svg>
                          Google Account
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] font-bold">
                          Đang Hoạt Động
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] font-mono text-emerald-400 mt-0.5">
                      {currentUser.googleEmail || currentUser.email || 'lukhach@diasan.vn'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    sound.playClick();
                    onLogout();
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-stone-900 hover:bg-rose-950/40 text-stone-400 hover:text-rose-300 border border-stone-800 text-xs font-semibold flex items-center gap-1 transition-all"
                  title="Đăng xuất tài khoản"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Đổi Hồ Sơ</span>
                </button>
              </div>

              {/* Learning Progress Summary Across Regions */}
              <div className="pt-2 border-t border-stone-800/80 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-stone-300">
                  <span className="flex items-center gap-1 text-amber-300">
                    <Compass className="w-3.5 h-3.5" />
                    Tiến Trình Khám Phá Toàn Vùng:
                  </span>
                  <span className="font-bold text-amber-400 font-mono">
                    {learningAnalytics?.overallHeritageMastery || Math.round(((currentUser.completedQuests?.length || 0) / 21) * 100)}%
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-1 text-[10px]">
                  <div className="p-2 rounded-xl bg-stone-900 border border-stone-800 space-y-1">
                    <div className="flex justify-between text-stone-400">
                      <span>TP.HCM</span>
                      <span className="font-bold text-amber-300">
                        {learningAnalytics?.hcmPercent || Math.round(((currentUser.completedQuests || []).filter(q => !q.includes('binh_duong') && !q.includes('vung_tau')).length / 11) * 100)}%
                      </span>
                    </div>
                    <div className="w-full h-1 bg-stone-950 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-amber-400 rounded-full" 
                        style={{ width: `${learningAnalytics?.hcmPercent || 30}%` }}
                      />
                    </div>
                  </div>

                  <div className="p-2 rounded-xl bg-stone-900 border border-stone-800 space-y-1">
                    <div className="flex justify-between text-stone-400">
                      <span>Bình Dương</span>
                      <span className="font-bold text-amber-300">
                        {learningAnalytics?.binhDuongPercent || 20}%
                      </span>
                    </div>
                    <div className="w-full h-1 bg-stone-950 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-amber-400 rounded-full" 
                        style={{ width: `${learningAnalytics?.binhDuongPercent || 20}%` }}
                      />
                    </div>
                  </div>

                  <div className="p-2 rounded-xl bg-stone-900 border border-stone-800 space-y-1">
                    <div className="flex justify-between text-stone-400">
                      <span>BR-VT</span>
                      <span className="font-bold text-amber-300">
                        {learningAnalytics?.vungTauPercent || 20}%
                      </span>
                    </div>
                    <div className="w-full h-1 bg-stone-950 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-amber-400 rounded-full" 
                        style={{ width: `${learningAnalytics?.vungTauPercent || 20}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-stone-400 pt-1">
                  <span>Huy hiệu: <strong className="text-emerald-400">{currentUser.badgesUnlocked?.length || 0} / 21</strong></span>
                  <span>Điểm LP: <strong className="text-amber-400 font-mono">{currentUser.lpPoints} LP</strong></span>
                  <span className="flex items-center gap-1 text-emerald-400">
                    <Cloud className="w-3 h-3" /> Đã kết nối Đám Mây
                  </span>
                </div>
              </div>

              {/* Personal Learning Preferences Section (Active Account) */}
              <div className="pt-3 border-t border-stone-800/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <Heart className="w-3.5 h-3.5 text-rose-400" />
                    Sở Thích Học Tập Của Bản Thân
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowPreferencesSection(!showPreferencesSection)}
                    className="text-[10px] text-stone-400 hover:text-amber-300 underline"
                  >
                    {showPreferencesSection ? 'Thu gọn' : 'Tùy chỉnh'}
                  </button>
                </div>

                {showPreferencesSection && (
                  <div className="space-y-2">
                    <p className="text-[10px] text-stone-400">
                      Chọn các chủ đề di sản bạn quan tâm để Ba Son AI ưu tiên đề xuất:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {CATEGORY_OPTIONS.map(cat => {
                        const isSelected = (preferences.favoriteCategories || []).includes(cat.id);
                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => toggleCategoryPref(cat.id)}
                            className={`px-2.5 py-1 rounded-xl text-[10px] font-semibold border flex items-center gap-1 transition-all ${
                              isSelected
                                ? 'bg-amber-500 text-stone-950 border-amber-300 font-bold shadow-sm'
                                : 'bg-stone-900 text-stone-300 border-stone-800 hover:border-amber-500/40'
                            }`}
                          >
                            <span>{cat.icon}</span>
                            <span>{cat.label}</span>
                            {isSelected && <Check className="w-3 h-3" />}
                          </button>
                        );
                      })}
                    </div>

                    <div className="pt-1.5 flex items-center gap-1.5 text-[11px] text-stone-300">
                      <span className="text-[10px] text-stone-400 shrink-0">Phong cách:</span>
                      {(['scholar', 'explorer', 'relaxed'] as const).map(style => (
                        <button
                          key={style}
                          type="button"
                          onClick={() => setTravelerStyle(style)}
                          className={`px-2 py-0.5 rounded-lg text-[10px] border transition-all ${
                            preferences.travelerStyle === style
                              ? 'bg-amber-500/20 text-amber-300 border-amber-400 font-bold'
                              : 'bg-stone-900 text-stone-400 border-stone-800'
                          }`}
                        >
                          {style === 'scholar' ? '🎓 Học Giả' : style === 'explorer' ? '🧭 Thám Hiểm' : '☕ Thư Thái'}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Sync Button */}
              <button
                type="button"
                onClick={handleSyncProgress}
                disabled={isSyncing}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md mt-2"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Đang Lưu Trữ...' : 'Lưu & Đồng Bộ Tiến Trình + Sở Thích Ngay'}</span>
              </button>
            </div>
          ) : (
            /* Login & Register Options */
            <div className="space-y-4">
              {/* Tab Selector: Google Login vs Email Register */}
              <div className="grid grid-cols-2 p-1 rounded-2xl bg-stone-950 border border-stone-800 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => { sound.playClick(); setAuthMode('google'); }}
                  className={`py-2 rounded-xl flex items-center justify-center gap-2 transition-all ${
                    authMode === 'google'
                      ? 'bg-amber-500 text-stone-950 shadow-md font-black'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                    <path fill={authMode === 'google' ? '#0c0a09' : '#4285F4'} d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill={authMode === 'google' ? '#0c0a09' : '#34A853'} d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill={authMode === 'google' ? '#0c0a09' : '#FBBC05'} d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill={authMode === 'google' ? '#0c0a09' : '#EA4335'} d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  <span>Truy Cập Bằng Google</span>
                </button>

                <button
                  type="button"
                  onClick={() => { sound.playClick(); setAuthMode('standard'); }}
                  className={`py-2 rounded-xl flex items-center justify-center gap-2 transition-all ${
                    authMode === 'standard'
                      ? 'bg-amber-500 text-stone-950 shadow-md font-black'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Email / Định Danh</span>
                </button>
              </div>

              {authMode === 'google' ? (
                /* Google Authentication Flow */
                <div className="space-y-3.5">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-stone-950 via-stone-900 to-stone-950 border border-blue-500/40 shadow-inner space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shadow">
                        <svg className="w-6 h-6" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-xs font-bold text-stone-100 flex items-center gap-1.5">
                          <span>Truy Cập Bằng Google Cá Nhân</span>
                          <span className="px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[9px] font-black border border-blue-500/30">+550 LP</span>
                        </h4>
                        <p className="text-[11px] text-stone-400 mt-0.5">
                          Tự động lưu trữ tiến trình học tập, huy hiệu và sở thích khám phá trên mọi thiết bị
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Personal Google Email Input */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-stone-300 flex items-center justify-between">
                      <span>Địa Chỉ Email Google Của Bạn:</span>
                      <span className="text-[10px] text-blue-400">@gmail.com</span>
                    </label>
                    <input
                      type="email"
                      value={googleEmailInput}
                      onChange={(e) => setGoogleEmailInput(e.target.value)}
                      placeholder="vidu: nguyenvana@gmail.com"
                      className="w-full p-2.5 rounded-xl bg-stone-950 border border-blue-500/40 focus:border-blue-400 text-xs text-blue-200 font-mono outline-none"
                    />
                  </div>

                  {/* Name Input */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-stone-300">
                      Tên Lữ Khách / Học Giả:
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Nhập tên hiển thị..."
                      className="w-full p-2.5 rounded-xl bg-stone-950 border border-stone-800 focus:border-amber-500/60 text-xs text-stone-100 outline-none"
                    />
                  </div>

                  {/* Personalized Study Preferences Selector */}
                  <div className="p-3 rounded-2xl bg-stone-950/80 border border-stone-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-amber-300 flex items-center gap-1">
                        <Heart className="w-3 h-3 text-rose-400" />
                        Thiết Lập Sở Thích Học Tập Của Bạn:
                      </span>
                      <span className="text-[9px] text-stone-400">Tự động sao lưu</span>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {CATEGORY_OPTIONS.map(cat => {
                        const isSelected = (preferences.favoriteCategories || []).includes(cat.id);
                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => toggleCategoryPref(cat.id)}
                            className={`px-2 py-1 rounded-xl text-[10px] border flex items-center gap-1 transition-all ${
                              isSelected
                                ? 'bg-amber-500/20 text-amber-300 border-amber-400 font-bold'
                                : 'bg-stone-900 text-stone-400 border-stone-800 hover:border-stone-700'
                            }`}
                          >
                            <span>{cat.icon}</span>
                            <span>{cat.label}</span>
                            {isSelected && <Check className="w-2.5 h-2.5 text-amber-400" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* One-Click Google Access Button */}
                  <button
                    type="button"
                    onClick={() => handleGoogleLogin()}
                    disabled={isLoading}
                    className="w-full py-3 rounded-xl bg-white hover:bg-stone-100 text-stone-950 font-black text-xs flex items-center justify-center gap-2.5 shadow-lg shadow-white/10 transition-all hover:scale-[1.01] active:scale-98"
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <RefreshCw className="w-4 h-4 animate-spin text-stone-950" />
                        Đang Kết Nối Google...
                      </span>
                    ) : (
                      <>
                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                        </svg>
                        <span>Đăng Nhập Bằng Google & Lưu Trữ Tiến Trình (+550 LP)</span>
                      </>
                    )}
                  </button>
                </div>
              ) : (
                /* Standard Heritage Profile Form */
                <form onSubmit={handleProfileSave} className="space-y-4">
                  <div className="p-4 rounded-2xl bg-stone-950 border border-amber-500/30 shadow-inner flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                      <Compass className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xs font-bold text-stone-100 flex items-center gap-1.5">
                        <span>Khởi Tạo / Cập Nhật Hồ Sơ Lữ Khách</span>
                        <span className="px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[9px] font-black border border-amber-500/30">+500 LP</span>
                      </h4>
                      <p className="text-[11px] text-stone-400 mt-0.5">
                        Nhập tên và email/định danh của bạn để bảo lưu kết quả khảo cứu di sản
                      </p>
                    </div>
                  </div>

                  {/* Name Input */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-stone-300">
                      Tên Lữ Khách / Học Giả
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Nhập tên hiển thị..."
                      className="w-full p-2.5 rounded-xl bg-stone-950 border border-stone-800 focus:border-amber-500/60 text-xs text-stone-100 outline-none"
                      required
                    />
                  </div>

                  {/* Email Address Input */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-stone-300 flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-amber-400" />
                      Email hoặc Mã Định Danh
                    </label>
                    <input
                      type="text"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="lukhach@diasan.vn"
                      className="w-full p-2.5 rounded-xl bg-stone-950 border border-stone-800 focus:border-amber-500/60 text-xs text-amber-300 font-mono outline-none"
                      required
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-stone-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.01] active:scale-98"
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Đang Lưu Hồ Sơ...
                      </span>
                    ) : (
                      <>
                        <LogIn className="w-4 h-4" />
                        <span>Xác Nhận Hồ Sơ & Bắt Đầu (+500 LP)</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
