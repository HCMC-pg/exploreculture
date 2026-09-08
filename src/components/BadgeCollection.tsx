import React, { useState } from 'react';
import { 
  Award, 
  Sparkles, 
  Lock, 
  CheckCircle2, 
  Info, 
  Share2, 
  Layers, 
  ShieldCheck, 
  ChevronRight, 
  Filter, 
  Trophy, 
  Clock, 
  MapPin, 
  TrendingUp, 
  GraduationCap,
  Gift,
  Compass
} from 'lucide-react';
import { Badge, BadgeRarity } from '../types';
import { BADGES } from '../data/badges';
import { sound } from '../utils/audio';

interface BadgeCollectionProps {
  badges?: Badge[];
  unlockedBadgeIds?: string[];
  onSelectBadgeQuest?: (badge: Badge) => void;
  onShareBadge?: (badge: Badge) => void;
  onNavigateTab?: (tab: 'rewards' | 'quests' | 'map' | 'forum') => void;
}

export const BadgeCollection: React.FC<BadgeCollectionProps> = ({
  badges,
  unlockedBadgeIds = [],
  onSelectBadgeQuest,
  onShareBadge,
  onNavigateTab
}) => {
  const [selectedRarity, setSelectedRarity] = useState<string>('all');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [inspectBadge, setInspectBadge] = useState<Badge | null>(null);

  const badgeList = badges || BADGES || [];
  const safeUnlockedIds = Array.isArray(unlockedBadgeIds) ? unlockedBadgeIds : [];

  const filteredBadges = badgeList.filter(b => {
    const matchRarity = selectedRarity === 'all' || b.rarity === selectedRarity;
    const matchRegion = selectedRegion === 'all' || 
      (selectedRegion === 'hcm' && !b.id.includes('binh_duong') && !b.id.includes('vung_tau') && !b.id.includes('con_dao')) ||
      (selectedRegion === 'binh_duong' && (b.id.includes('binh_duong') || b.id.includes('lai_thieu') || b.id.includes('dia_dao'))) ||
      (selectedRegion === 'vung_tau' && (b.id.includes('vung_tau') || b.id.includes('con_dao') || b.id.includes('bach_dinh')));
    return matchRarity && matchRegion;
  });

  const getRarityLabel = (rarity: BadgeRarity) => {
    switch (rarity) {
      case 'legendary': return { text: 'Huyền Thoại', color: 'text-amber-400 bg-amber-500/20 border-amber-500/40' };
      case 'epic': return { text: 'Sử Thi', color: 'text-purple-400 bg-purple-500/20 border-purple-500/40' };
      case 'rare': return { text: 'Hiếm', color: 'text-blue-400 bg-blue-500/20 border-blue-500/40' };
      default: return { text: 'Phổ Biến', color: 'text-emerald-400 bg-emerald-500/20 border-emerald-500/40' };
    }
  };

  const unlockedCount = safeUnlockedIds.length;
  const progressPercent = badgeList.length > 0 ? Math.round((unlockedCount / badgeList.length) * 100) : 0;

  // Calculate stats by rarity & region
  const legendaryCount = badgeList.filter(b => b.rarity === 'legendary' && safeUnlockedIds.includes(b.id)).length;
  const epicCount = badgeList.filter(b => b.rarity === 'epic' && safeUnlockedIds.includes(b.id)).length;
  const rareCount = badgeList.filter(b => b.rarity === 'rare' && safeUnlockedIds.includes(b.id)).length;
  const commonCount = badgeList.filter(b => b.rarity === 'common' && safeUnlockedIds.includes(b.id)).length;
  
  // Calculate approximate study hours from unlocked badges (each badge represents ~2.5 hours of heritage study)
  const estimatedStudyHours = Math.max(8, unlockedCount * 2.5);

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 py-6 space-y-6 animate-fadeIn pb-24 text-stone-100">
      
      {/* 🏆 HEADER & MAIN METRICS CARD */}
      <div className="p-5 sm:p-8 rounded-3xl bg-gradient-to-r from-stone-900 via-amber-950/40 to-stone-900 border border-amber-500/40 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs uppercase font-bold tracking-widest text-amber-400 flex items-center gap-1.5 bg-amber-500/15 px-3 py-1 rounded-full border border-amber-500/30">
                <Award className="w-4 h-4 text-amber-400" />
                ĐIỆN VINH DANH DI SẢN NAM BỘ
              </span>
              <span className="text-emerald-300 text-[11px] font-bold bg-emerald-500/20 px-2.5 py-0.5 rounded-full border border-emerald-500/40">
                21 Huy Hiệu Độc Bản
              </span>
            </div>

            <h2 className="font-['Cinzel',serif] font-bold text-2xl sm:text-3xl text-amber-200">
              Thống Kê Huy Hiệu & Tri Thức Lịch Sử
            </h2>
            <p className="text-xs sm:text-sm text-stone-300 max-w-xl leading-relaxed">
              Mỗi huy hiệu là minh chứng lịch sử được đúc kết từ quá trình khảo cứu di sản thực địa và giải mã câu đố. Tích lũy huy hiệu để mở khóa tri thức và nhận các ưu đãi giá trị.
            </p>
          </div>

          {/* Quick Collection Metric & Rewards Shortcut */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="bg-stone-950/90 p-4 rounded-2xl border border-amber-500/40 flex items-center gap-3.5 shadow-xl">
              <div className="relative w-14 h-14 rounded-full bg-stone-900 border-4 border-amber-500/40 flex items-center justify-center shrink-0">
                <span className="font-bold font-mono text-sm text-amber-300">{progressPercent}%</span>
              </div>
              <div>
                <p className="text-[10px] text-stone-400 uppercase tracking-wider">Tiến độ thu thập</p>
                <p className="font-bold text-base text-amber-300 font-mono">
                  {unlockedCount} / {badgeList.length} <span className="text-xs text-stone-400 font-sans">Huy hiệu</span>
                </p>
              </div>
            </div>

            {onNavigateTab && (
              <button
                onClick={() => {
                  sound.playClick();
                  onNavigateTab('rewards');
                }}
                className="px-4 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-stone-950 font-bold text-xs flex items-center justify-center gap-2 shadow-xl hover:scale-105 transition-all"
                title="Dùng huy hiệu để mở khóa các tầng quà tặng di sản"
              >
                <Gift className="w-4 h-4 text-stone-950" />
                <span>Đổi Thưởng Bằng Huy Hiệu ➔</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 📊 DETAILED STATS ROW */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-stone-900/80 border border-stone-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-400 text-xs">
            <span>Thời lượng học sử</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2">
            <span className="text-xl font-bold font-mono text-amber-300">{estimatedStudyHours}</span>
            <span className="text-xs text-stone-400 ml-1">Giờ học</span>
          </div>
          <p className="text-[10px] text-stone-500 mt-1">Tích lũy từ 3 tỉnh thành</p>
        </div>

        <div className="p-4 rounded-2xl bg-stone-900/80 border border-stone-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-400 text-xs">
            <span>Huyền Thoại & Sử Thi</span>
            <Sparkles className="w-4 h-4 text-purple-400" />
          </div>
          <div className="mt-2">
            <span className="text-xl font-bold font-mono text-purple-300">{legendaryCount + epicCount}</span>
            <span className="text-xs text-stone-400 ml-1">Huy hiệu</span>
          </div>
          <p className="text-[10px] text-stone-500 mt-1">Độ hiếm cao nhất</p>
        </div>

        <div className="p-4 rounded-2xl bg-stone-900/80 border border-stone-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-400 text-xs">
            <span>Hiếm & Phổ Biến</span>
            <Award className="w-4 h-4 text-blue-400" />
          </div>
          <div className="mt-2">
            <span className="text-xl font-bold font-mono text-blue-300">{rareCount + commonCount}</span>
            <span className="text-xs text-stone-400 ml-1">Huy hiệu</span>
          </div>
          <p className="text-[10px] text-stone-500 mt-1">Cơ bản & Nâng cao</p>
        </div>

        <div className="p-4 rounded-2xl bg-stone-900/80 border border-stone-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-400 text-xs">
            <span>Danh Hiệu Học Thuật</span>
            <GraduationCap className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2">
            <span className="text-xs font-bold text-emerald-300 truncate block">
              {unlockedCount >= 18 ? 'Đại Học Sĩ Gia Định' : unlockedCount >= 10 ? 'Nhà Giám Định Di Sản' : 'Học Giả Nam Bộ'}
            </span>
          </div>
          <p className="text-[10px] text-stone-500 mt-1">Được công nhận toàn quốc</p>
        </div>
      </div>

      {/* 🏷️ FILTER TABS */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-stone-800 pb-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'all', label: 'Tất Cả Độ Hiếm' },
            { id: 'legendary', label: 'Huyền Thoại' },
            { id: 'epic', label: 'Sử Thi' },
            { id: 'rare', label: 'Hiếm' },
            { id: 'common', label: 'Phổ Biến' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => { sound.playClick(); setSelectedRarity(tab.id); }}
              className={`min-h-[34px] px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                selectedRarity === tab.id
                  ? 'bg-amber-500 text-stone-950 font-bold shadow-md shadow-amber-500/20'
                  : 'bg-stone-900/80 text-stone-400 hover:text-stone-200 hover:bg-stone-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 no-scrollbar">
          {[
            { id: 'all', label: 'Tất cả miền' },
            { id: 'hcm', label: 'TP.HCM' },
            { id: 'binh_duong', label: 'Bình Dương' },
            { id: 'vung_tau', label: 'BR-VT' }
          ].map(reg => (
            <button
              key={reg.id}
              onClick={() => { sound.playClick(); setSelectedRegion(reg.id); }}
              className={`min-h-[34px] px-2.5 py-1 rounded-xl text-xs font-medium transition-all ${
                selectedRegion === reg.id
                  ? 'bg-stone-800 text-amber-300 border border-amber-500/50 font-bold'
                  : 'text-stone-400 hover:text-stone-200 bg-stone-950'
              }`}
            >
              {reg.label}
            </button>
          ))}
        </div>
      </div>

      {/* 🎖️ 3D BADGES GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {filteredBadges.map((badge) => {
          const isUnlocked = safeUnlockedIds.includes(badge.id);
          const rarityMeta = getRarityLabel(badge.rarity);

          return (
            <div
              key={badge.id}
              id={`badge-card-${badge.id}`}
              onClick={() => {
                sound.playDanTranhNote(659.25, 0.6);
                setInspectBadge(badge);
              }}
              className={`group relative p-4 sm:p-5 rounded-3xl border transition-all duration-300 cursor-pointer flex flex-col items-center text-center ${
                isUnlocked 
                  ? 'bg-stone-900/90 border-amber-500/40 hover:border-amber-400 hover:-translate-y-2 hover:shadow-[0_15px_30px_rgba(245,158,11,0.15)]' 
                  : 'bg-stone-950/60 border-stone-800 opacity-60 hover:opacity-80'
              }`}
            >
              {/* Rarity Tag */}
              <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border mb-3 ${rarityMeta.color}`}>
                {rarityMeta.text}
              </span>

              {/* 3D Medal Illustration */}
              <div className="relative mb-3.5">
                <div 
                  className={`w-20 h-20 sm:w-24 sm:h-24 rounded-3xl p-1 shadow-2xl transition-transform duration-500 group-hover:scale-105 ${
                    isUnlocked 
                      ? `bg-gradient-to-tr ${badge.bgGradient} ring-2 ring-amber-400/50` 
                      : 'bg-stone-800 ring-1 ring-stone-700'
                  }`}
                >
                  <div className="w-full h-full bg-stone-950 rounded-[20px] flex items-center justify-center text-amber-300 relative overflow-hidden">
                    {isUnlocked ? (
                      <>
                        <Award className="w-10 h-10 sm:w-12 sm:h-12 text-amber-400 drop-shadow-[0_0_12px_rgba(245,158,11,0.8)]" />
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent gold-shimmer" />
                      </>
                    ) : (
                      <Lock className="w-8 h-8 text-stone-600" />
                    )}
                  </div>
                </div>
              </div>

              {/* Title & Description */}
              <h3 className="font-['Cinzel',serif] font-bold text-sm text-stone-100 group-hover:text-amber-200 line-clamp-1">
                {badge.name}
              </h3>
              <p className="text-[11px] text-amber-400/90 font-medium mb-1 line-clamp-1">
                {badge.title}
              </p>
              <p className="text-[10px] text-stone-400 line-clamp-2 leading-relaxed">
                {badge.description}
              </p>

              {/* Status footer */}
              <div className="mt-3 pt-2 border-t border-stone-800/80 w-full flex items-center justify-center gap-1 text-[11px]">
                {isUnlocked ? (
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Đã Sở Hữu
                  </span>
                ) : (
                  <span className="text-stone-500 flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Chưa Mở Khóa
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 🔍 INSPECT BADGE MODAL */}
      {inspectBadge && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-lg bg-stone-900 border-2 border-amber-500/40 rounded-3xl p-6 shadow-2xl text-stone-100 space-y-5 animate-scaleUp">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <span className={`text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full border ${getRarityLabel(inspectBadge.rarity).color}`}>
                Huy Hiệu {getRarityLabel(inspectBadge.rarity).text}
              </span>
              <button
                onClick={() => setInspectBadge(null)}
                className="text-stone-400 hover:text-stone-100 text-xs font-bold px-2.5 py-1 bg-stone-800 rounded-lg"
              >
                Đóng
              </button>
            </div>

            {/* Medal Centered Preview */}
            <div className="flex flex-col items-center text-center space-y-3">
              <div className={`w-28 h-28 rounded-3xl p-1 bg-gradient-to-tr ${inspectBadge.bgGradient} shadow-2xl ring-4 ring-amber-400/40`}>
                <div className="w-full h-full bg-stone-950 rounded-[20px] flex items-center justify-center relative overflow-hidden">
                  <Award className="w-14 h-14 text-amber-400 drop-shadow-[0_0_15px_rgba(245,158,11,0.9)]" />
                  <div className="absolute inset-0 gold-shimmer opacity-40" />
                </div>
              </div>

              <div>
                <h3 className="font-['Cinzel',serif] font-bold text-xl text-amber-200">
                  {inspectBadge.name}
                </h3>
                <p className="text-xs text-amber-400 font-semibold">{inspectBadge.title}</p>
              </div>
            </div>

            {/* Cultural Story */}
            <div className="space-y-1.5 p-3.5 rounded-2xl bg-stone-950 border border-stone-800 text-xs leading-relaxed">
              <p className="font-bold text-amber-300 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-amber-400" />
                Điển tích di sản & Giá trị lịch sử:
              </p>
              <p className="text-stone-300">{inspectBadge.culturalStory}</p>
            </div>

            {/* Active Perk */}
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-amber-300">Đặc quyền lữ khách kích hoạt:</p>
                <p className="text-stone-300">{inspectBadge.perk}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
              {safeUnlockedIds.includes(inspectBadge.id) ? (
                <>
                  <button
                    onClick={() => {
                      if (onShareBadge) {
                        onShareBadge(inspectBadge);
                      } else if (onSelectBadgeQuest) {
                        onSelectBadgeQuest(inspectBadge);
                      }
                      setInspectBadge(null);
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Khoe Lên Diễn Đàn Lữ Khách</span>
                  </button>

                  {onNavigateTab && (
                    <button
                      onClick={() => {
                        sound.playClick();
                        setInspectBadge(null);
                        onNavigateTab('rewards');
                      }}
                      className="py-2.5 px-4 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md"
                      title="Chuyển đến cửa hàng đổi thưởng di sản"
                    >
                      <Gift className="w-4 h-4 text-amber-400" />
                      <span>Đến Kho Quà ➔</span>
                    </button>
                  )}
                </>
              ) : (
                <>
                  {onSelectBadgeQuest && (
                    <button
                      onClick={() => {
                        sound.playClick();
                        setInspectBadge(null);
                        onSelectBadgeQuest(inspectBadge);
                      }}
                      className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-stone-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all"
                    >
                      <Compass className="w-4 h-4" />
                      <span>Nhận Nhiệm Vụ Mở Khóa Huy Hiệu Này ➔</span>
                    </button>
                  )}

                  {onNavigateTab && (
                    <button
                      onClick={() => {
                        sound.playClick();
                        setInspectBadge(null);
                        onNavigateTab('rewards');
                      }}
                      className="py-2.5 px-4 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Gift className="w-4 h-4 text-amber-400" />
                      <span>Xem Kho Quà</span>
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
