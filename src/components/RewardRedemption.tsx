import React, { useState, useRef, useEffect } from 'react';
import { 
  Gift, 
  Sparkles, 
  Award, 
  CheckCircle2, 
  QrCode, 
  Download, 
  Clock, 
  ShieldCheck, 
  AlertCircle,
  X,
  ExternalLink,
  Compass,
  Briefcase,
  Check,
  Shield,
  Zap,
  Tag,
  Package,
  Layers,
  Flame,
  RotateCcw,
  Coins,
  Ticket,
  Trophy,
  Coffee,
  MapPin,
  Eye,
  Search,
  Copy,
  Printer,
  Bot,
  CheckCheck,
  Filter
} from 'lucide-react';
import { RewardItem, UserProfile } from '../types';
import { REWARDS } from '../data/rewards';
import { sound } from '../utils/audio';
import { 
  getLearningMemory, 
  toggleEquipGear, 
  addGearToInventory, 
  getActiveTravelerBuffs,
  EquippedGearItem 
} from '../utils/learningStorage';

interface RewardRedemptionProps {
  user?: UserProfile;
  currentUser?: UserProfile;
  rewards?: RewardItem[];
  userLP?: number;
  badgesCount?: number;
  onNavigateTab?: (tab: 'badges' | 'quests' | 'map' | 'forum') => void;
  onRedeemReward: (reward: RewardItem) => boolean;
  onOpenBaSonAI?: (prompt?: string) => void;
}

interface ChestType {
  id: string;
  name: string;
  costLP: number;
  tier: 'bronze' | 'silver' | 'gold';
  color: string;
  borderColor: string;
  description: string;
  possiblePrizes: string[];
}

const CHEST_TYPES: ChestType[] = [
  {
    id: 'chest_bronze',
    name: 'Rương Đồng Cổ Điển',
    costLP: 50,
    tier: 'bronze',
    color: 'from-amber-800 to-amber-950',
    borderColor: 'border-amber-700/60',
    description: 'Rương cổ sơ cấp chứa voucher giảm giá 20-30%, điểm LP may mắn hoặc huy hiệu lưu niệm.',
    possiblePrizes: ['+80 Linh Điểm LP', 'Voucher Cà Phê Vợt Ba Lù 20k', 'Huy Hiệu Cổ Vật Đồng', '+50 EXP']
  },
  {
    id: 'chest_silver',
    name: 'Rương Bạc Nam Kỳ',
    costLP: 120,
    tier: 'silver',
    color: 'from-slate-600 to-slate-900',
    borderColor: 'border-slate-400/60',
    description: 'Rương bạc chứa vé bảo tàng miễn phí, voucher ẩm thực Chợ Bến Thành và trang bị du hành quý.',
    possiblePrizes: ['+250 Linh Điểm LP', 'Vé Miễn Phí Bảo Tàng TP.HCM', 'Kính Lúp Soi Cổ Vật', 'Voucher Cơm Tấm 50k']
  },
  {
    id: 'chest_gold',
    name: 'Rương Vàng Hoàng Gia Gia Định',
    costLP: 250,
    tier: 'gold',
    color: 'from-yellow-500 via-amber-600 to-amber-950',
    borderColor: 'border-yellow-400',
    description: 'Báu vật hoàng gia chứa quà gốm sứ thủ công Đại Hưng cao cấp, vé du thuyền sông Sài Gòn và buff siêu cấp.',
    possiblePrizes: ['+600 Linh Điểm LP', 'Vé Du Thuyền Sông Sài Gòn 5 Sao', 'Bình Men Lam Cổ Truyền', 'Bộ Sưu Tập La Bàn Đồng']
  }
];

export const RewardRedemption: React.FC<RewardRedemptionProps> = ({
  user,
  currentUser,
  rewards,
  userLP,
  badgesCount,
  onNavigateTab,
  onRedeemReward,
  onOpenBaSonAI
}) => {
  const [activeTab, setActiveTab] = useState<'store' | 'scratch' | 'chest' | 'inventory'>('store');
  const [selectedRewardForRedeem, setSelectedRewardForRedeem] = useState<RewardItem | null>(null);
  const [activeVoucher, setActiveVoucher] = useState<{ reward: RewardItem; code: string; date: string } | null>(null);
  const [equippedMemory, setEquippedMemory] = useState(getLearningMemory());

  // Search, Filter & Voucher Interaction States
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'ticket' | 'cuisine' | 'souvenir' | 'recommended'>('all');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code).then(() => {
      sound.playSuccess();
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2500);
    }).catch(() => {});
  };

  // 🎴 Scratch Card Daily State & 1/1000 Probability Configuration
  interface DailyScratchData {
    date: string;
    hasScratched: boolean;
    isJackpot: boolean;
    prizeName: string;
    prizeValue: string;
    prizeType: 'legendary_gear' | 'miss';
    prizeQuote: string;
    icon: string;
  }

  const getTodayDateStr = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const PROVERBS = [
    'Đường dài mới biết ngựa hay, lữ khách kiên trì ắt tìm thấy ngọc báu phương Nam.',
    'Sông Sài Gòn nước chảy xuôi dòng, ngày mai may mắn sẽ đong đầy tay lữ khách.',
    'Chớ thấy sóng cả mà ngã tay chèo, kho tàng di sản vẫn đang đợi bạn giải mã.',
    'Gia Định xưa ngàn năm văn hiến, vận may luôn mỉm cười với người bền lòng.',
    'Nước ngọt Bến Nghé nuôi lòng người nhân hậu, hẹn gặp bạn ở chuyến du hành ngày mai.'
  ];

  const [dailyScratch, setDailyScratch] = useState<DailyScratchData>(() => {
    const today = getTodayDateStr();
    try {
      const saved = localStorage.getItem('saigon_heritage_daily_scratch_v2');
      if (saved) {
        const parsed: DailyScratchData = JSON.parse(saved);
        if (parsed.date === today) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Could not read daily scratch state', e);
    }

    // New scratch ticket for today with exact 1/1000 (0.001) chance of rare legendary equipment
    const isJackpot = Math.random() < 0.001; // Exactly 1 in 1000 chance
    const quote = PROVERBS[Math.floor(Math.random() * PROVERBS.length)];

    const newTicket: DailyScratchData = isJackpot ? {
      date: today,
      hasScratched: false,
      isJackpot: true,
      prizeName: 'Trang Bị Cổ Truyền Thần Thoại: Áo Dài Hoàng Triều Gia Định Thêu Rồng Vàng',
      prizeValue: 'BẢO VẬT 1/1000 (+5000 LP)',
      prizeType: 'legendary_gear',
      prizeQuote: 'Vận may ngút trời! Lữ khách đã mở ra báu vật thần thoại với tỷ lệ cực hiếm 1/1000!',
      icon: '👑'
    } : {
      date: today,
      hasScratched: false,
      isJackpot: false,
      prizeName: 'Chúc Bạn May Mắn Lần Sau',
      prizeValue: 'HẸN GẶP NGÀY MAI',
      prizeType: 'miss',
      prizeQuote: quote,
      icon: '🍀'
    };

    try {
      localStorage.setItem('saigon_heritage_daily_scratch_v2', JSON.stringify(newTicket));
    } catch (e) {}

    return newTicket;
  });

  // Time countdown to midnight (next daily scratch ticket)
  const [timeUntilTomorrow, setTimeUntilTomorrow] = useState<string>('');

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
      const diffMs = tomorrow.getTime() - now.getTime();
      
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diffMs % (1000 * 60)) / 1000);

      setTimeUntilTomorrow(
        `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
      );
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  // 🎴 Scratch Card Interactive Canvas State
  const scratchCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [scratchProgress, setScratchProgress] = useState<number>(0);
  const [isScratchRevealed, setIsScratchRevealed] = useState<boolean>(() => dailyScratch.hasScratched);

  // 📦 Chest Opening State
  const [openingChest, setOpeningChest] = useState<ChestType | null>(null);
  const [chestResult, setChestResult] = useState<{ name: string; desc: string; icon: string } | null>(null);
  const [isChestOpeningAnim, setIsChestOpeningAnim] = useState<boolean>(false);

  const activeUser = user || currentUser;
  const currentLP = activeUser?.lpPoints ?? userLP ?? 0;
  const currentBadgesCount = activeUser?.badgesUnlocked?.length ?? badgesCount ?? 0;
  const rewardsList = rewards || REWARDS || [];

  const activeBuffs = getActiveTravelerBuffs();
  const userFavoriteCategories = activeUser?.preferences?.favoriteCategories || [];

  const filteredRewards = rewardsList.filter(reward => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = reward.name.toLowerCase().includes(q);
      const matchDesc = reward.description.toLowerCase().includes(q);
      const matchPartner = reward.partner?.toLowerCase().includes(q);
      if (!matchName && !matchDesc && !matchPartner) return false;
    }

    if (categoryFilter === 'all') return true;
    if (categoryFilter === 'recommended') {
      if (userFavoriteCategories.length === 0) return true;
      if (userFavoriteCategories.includes('cuisine') && reward.category === 'cuisine') return true;
      if (userFavoriteCategories.includes('architecture') && reward.category === 'ticket') return true;
      if (userFavoriteCategories.includes('history') && reward.category === 'ticket') return true;
      if (userFavoriteCategories.includes('craft') && reward.category === 'souvenir') return true;
      return false;
    }
    return reward.category === categoryFilter;
  });

  // Initialize Scratch Canvas
  useEffect(() => {
    if (activeTab === 'scratch' && scratchCanvasRef.current && !dailyScratch.hasScratched && !isScratchRevealed) {
      initScratchCanvas();
    }
  }, [activeTab, dailyScratch.hasScratched, isScratchRevealed]);

  const initScratchCanvas = () => {
    const canvas = scratchCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 340;
    canvas.height = 180;

    // Fill with metallic gold scratch coating
    const grad = ctx.createLinearGradient(0, 0, 340, 180);
    grad.addColorStop(0, '#b45309');
    grad.addColorStop(0.3, '#f59e0b');
    grad.addColorStop(0.6, '#fde68a');
    grad.addColorStop(1, '#92400e');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 340, 180);

    // Decorative pattern
    ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
    for (let i = 0; i < 340; i += 15) {
      ctx.fillRect(i, 0, 2, 180);
    }

    // Border inner
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 4;
    ctx.strokeRect(6, 6, 328, 168);

    // Overlay text
    ctx.font = 'bold 14px sans-serif';
    ctx.fillStyle = '#451a03';
    ctx.textAlign = 'center';
    ctx.fillText('✨ VÉ CÀO MAY MẮN HÔM NAY ✨', 170, 80);
    ctx.font = '11px sans-serif';
    ctx.fillStyle = '#78350f';
    ctx.fillText('Mỗi ngày 1 lượt duy nhất • Cào để mở thưởng', 170, 105);
    ctx.font = 'bold 10px monospace';
    ctx.fillStyle = '#92400e';
    ctx.fillText('TỈ LỆ TRANG BỊ HIẾM: 1/1000', 170, 130);

    setScratchProgress(0);
  };

  const handleScratchMove = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (isScratchRevealed || dailyScratch.hasScratched) return;
    const canvas = scratchCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let clientX = 0;
    let clientY = 0;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      if (e.buttons !== 1) return; // Only when mouse button pressed
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 24, 0, Math.PI * 2);
    ctx.fill();

    sound.playScratchCardSound();

    // Check scratched percentage
    setScratchProgress(prev => {
      const next = prev + 4;
      if (next >= 50 && !isScratchRevealed) {
        setIsScratchRevealed(true);
        const updatedTicket: DailyScratchData = {
          ...dailyScratch,
          hasScratched: true
        };
        setDailyScratch(updatedTicket);
        try {
          localStorage.setItem('saigon_heritage_daily_scratch_v2', JSON.stringify(updatedTicket));
        } catch (e) {}

        if (dailyScratch.isJackpot) {
          sound.playVoucherUnlockedSound();
          // Add legendary gear to player's inventory
          const legendaryItem: EquippedGearItem = {
            id: 'legendary_dragon_robe',
            name: 'Áo Dài Hoàng Triều Gia Định Thêu Rồng Vàng (Thần Thoại)',
            category: 'accessory',
            icon: 'Crown',
            buffName: 'Khí Chất Đế Vương 1/1000',
            buffDescription: 'Tăng +50% LP thám hiểm và hào quang hoàng gia rực rỡ',
            acquiredDate: new Date().toLocaleDateString('vi-VN'),
            isEquipped: true,
            bonusLPPercent: 50,
            bonusExpPercent: 50
          };
          addGearToInventory(legendaryItem);
          setEquippedMemory(getLearningMemory());
        } else {
          sound.playClick();
        }
      }
      return next;
    });
  };

  const handleOpenChest = (chest: ChestType) => {
    if (currentLP < chest.costLP) {
      sound.playError();
      return;
    }

    sound.playClick();
    setOpeningChest(chest);
    setIsChestOpeningAnim(true);
    sound.playChestOpeningSound();

    setTimeout(() => {
      setIsChestOpeningAnim(false);
      const prizePick = chest.possiblePrizes[Math.floor(Math.random() * chest.possiblePrizes.length)];
      setChestResult({
        name: prizePick,
        desc: `Chúc mừng bạn đã mở thành công ${chest.name}! Phần thưởng đã được nạp tự động vào tài khoản lữ khách.`,
        icon: chest.tier === 'gold' ? '👑' : chest.tier === 'silver' ? '💎' : '🪙'
      });
      sound.playVoucherUnlockedSound();
    }, 1800);
  };

  const handleToggleEquip = (gearId: string) => {
    sound.playClick();
    toggleEquipGear(gearId);
    setEquippedMemory(getLearningMemory());
  };

  const handleConfirmRedeem = () => {
    if (!selectedRewardForRedeem) return;

    const success = onRedeemReward(selectedRewardForRedeem);
    if (success) {
      sound.playVoucherUnlockedSound();
      const voucherCode = `SG-${selectedRewardForRedeem.id.toUpperCase().replace('REW_', '').slice(0, 8)}-${Math.floor(100000 + Math.random() * 900000)}`;
      
      // If it is traveler gear, add to player inventory automatically
      if (selectedRewardForRedeem.id.startsWith('rew_gear_')) {
        let buffName = 'Trang Bị Thám Hiểm';
        let buffDescription = selectedRewardForRedeem.description;
        let bonusLP = 0;
        let bonusExp = 0;

        if (selectedRewardForRedeem.id.includes('magnifier')) {
          buffName = 'Kính Lúp Soi Cổ Vật';
          buffDescription = 'Nhận thêm +20% Điểm Thám Hiểm (LP) khi trả lời đúng lần đầu';
          bonusLP = 20;
        } else if (selectedRewardForRedeem.id.includes('tumbler')) {
          buffName = 'Bình Giữ Nhiệt Lữ Khách';
          buffDescription = 'Tăng +15% EXP nhân vật và bảo vệ năng lượng hành trình';
          bonusExp = 15;
        } else if (selectedRewardForRedeem.id.includes('flashlight')) {
          buffName = 'Đèn Pin Dã Ngoại';
          buffDescription = 'Soi sáng tự động lọc bớt 1 đáp án sai trong câu hỏi';
        }

        const newGear: EquippedGearItem = {
          id: selectedRewardForRedeem.id,
          name: selectedRewardForRedeem.name,
          category: 'tool',
          icon: 'Package',
          buffName,
          buffDescription,
          acquiredDate: new Date().toLocaleDateString('vi-VN'),
          isEquipped: true,
          bonusLPPercent: bonusLP,
          bonusExpPercent: bonusExp
        };
        addGearToInventory(newGear);
        setEquippedMemory(getLearningMemory());
      }

      setActiveVoucher({
        reward: selectedRewardForRedeem,
        code: voucherCode,
        date: new Date().toLocaleDateString('vi-VN')
      });
      setSelectedRewardForRedeem(null);
    } else {
      sound.playError();
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-fadeIn">
      {/* Top Banner & LP Balance */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-stone-900 via-amber-950/60 to-stone-900 border border-amber-500/30 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-bold tracking-widest text-amber-400 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30">
              <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
              Đổi Thưởng Di Sản Thế Hệ Mới
            </span>
          </div>
          <h2 className="font-['Cinzel',serif] font-bold text-2xl sm:text-3xl text-amber-200">
            Kho Tàng Đổi Thưởng & May Mắn Phương Nam
          </h2>
          <p className="text-xs sm:text-sm text-stone-300 max-w-2xl leading-relaxed">
            Dùng Linh Điểm (LP) quy đổi vé tham quan bảo tàng, voucher ẩm thực, trang bị dã ngoại, cào thẻ may mắn trúng quà và khai mở Rương Báu Di Sản Hoàng Gia!
          </p>
        </div>

        {/* User Balance Display Card */}
        <div className="bg-stone-950/90 p-5 rounded-2xl border border-amber-500/40 min-w-[250px] flex items-center gap-4 shadow-xl">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-stone-950 shadow-md">
            <Coins className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <p className="text-[10px] text-stone-400 uppercase tracking-wider font-bold">Linh Điểm Khả Dụng</p>
            <p className="text-2xl font-black font-mono text-amber-300">{currentLP} LP</p>
            <p className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
              <Award className="w-3.5 h-3.5" />
              {currentBadgesCount} Huy hiệu di sản
            </p>
          </div>
        </div>
      </div>

      {/* 🎖️ BADGE & REWARD INTERLOCKING HUB */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-amber-950/40 via-stone-900 to-stone-950 border border-amber-500/30 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1.5 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <Award className="w-5 h-5 text-amber-400" />
            <h3 className="font-['Cinzel',serif] font-bold text-base sm:text-lg text-amber-200">
              Liên Thông Huy Hiệu & Kho Quà Di Sản
            </h3>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
              {currentBadgesCount}/21 Huy Hiệu Đã Đạt
            </span>
          </div>
          <p className="text-xs text-stone-300 max-w-2xl leading-relaxed">
            Huy hiệu khảo cứu là chìa khóa mở các tầng quà tặng cao cấp: cành hoa gốm sứ, vé du thuyền Saigon Waterbus, ẩm thực cổ truyền và trang phục hoàng triều!
          </p>

          {/* Tier Milestones Progress */}
          <div className="pt-1.5 flex items-center gap-2 sm:gap-3 flex-wrap text-[11px]">
            <div className={`px-2.5 py-1 rounded-xl border flex items-center gap-1.5 ${
              currentBadgesCount >= 1 ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300' : 'bg-stone-950 border-stone-800 text-stone-500'
            }`}>
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Cấp 1-3: Vé Di Tích & Ẩm Thực</span>
            </div>
            <div className={`px-2.5 py-1 rounded-xl border flex items-center gap-1.5 ${
              currentBadgesCount >= 4 ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300' : 'bg-stone-950 border-stone-800 text-stone-500'
            }`}>
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Cấp 4-7: Vé Saigon Waterbus & Quà Lưu Niệm</span>
            </div>
            <div className={`px-2.5 py-1 rounded-xl border flex items-center gap-1.5 ${
              currentBadgesCount >= 8 ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300' : 'bg-stone-950 border-stone-800 text-stone-500'
            }`}>
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Cấp 8+: Rương Báu & Áo Dài Thần Thoại</span>
            </div>
          </div>
        </div>

        {onNavigateTab && (
          <button
            onClick={() => {
              sound.playClick();
              onNavigateTab('badges');
            }}
            className="px-4 py-2.5 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 hover:text-amber-200 font-bold text-xs flex items-center gap-2 transition-all shrink-0 shadow-md group whitespace-nowrap"
          >
            <Award className="w-4 h-4 text-amber-400 group-hover:rotate-12 transition-transform" />
            <span>Xem 21 Huy Hiệu & Cách Mở Khóa ➔</span>
          </button>
        )}
      </div>

      {/* Main Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-800 pb-3 overflow-x-auto no-scrollbar">
        {[
          { id: 'store', label: '🎁 Cửa Hàng Quà Tặng & Vé', icon: Gift },
          { id: 'scratch', label: '🎴 Thẻ Cào May Mắn Tri Ân', icon: Sparkles },
          { id: 'chest', label: '📦 Rương Báu Cổ Truyền', icon: Trophy },
          { id: 'inventory', label: '🎒 Tủ Đồ & Hiệu Ứng Buff', icon: Package }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                sound.playClick();
                setActiveTab(tab.id as any);
              }}
              className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shrink-0 border ${
                isActive
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-stone-950 border-amber-300 shadow-lg font-black scale-105'
                  : 'bg-stone-900/90 text-stone-400 hover:text-stone-200 border-stone-800 hover:border-amber-500/30'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 🎴 TAB 1: INTERACTIVE SCRATCH CARD */}
      {activeTab === 'scratch' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="p-6 rounded-3xl bg-gradient-to-br from-amber-950/40 via-stone-900 to-stone-950 border border-amber-500/40 shadow-2xl flex flex-col items-center text-center space-y-4">
            <div>
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold uppercase tracking-wider border border-amber-500/30">
                  Vé Cào May Mắn Hàng Ngày
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  dailyScratch.hasScratched
                    ? 'bg-stone-800 text-stone-400 border border-stone-700'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse'
                }`}>
                  {dailyScratch.hasScratched ? 'Đã dùng hôm nay (0/1)' : 'Sẵn sàng cào (1/1)'}
                </span>
              </div>
              <h3 className="font-['Cinzel',serif] font-bold text-xl sm:text-2xl text-amber-200 mt-1">
                Thẻ Cào Tri Ân Lữ Khách Phương Nam
              </h3>
              <p className="text-xs sm:text-sm text-stone-300 max-w-md mx-auto mt-1">
                {dailyScratch.hasScratched 
                  ? 'Bạn đã hoàn thành 1 lượt cào may mắn của ngày hôm nay. Hãy quay lại sau!' 
                  : 'Mỗi ngày đăng nhập chỉ có 1 lượt cào duy nhất. Cào lớp nhũ vàng để thử vận may!'}
              </p>
            </div>

            {/* Scratch Card Container */}
            <div className="relative w-[340px] h-[190px] rounded-2xl overflow-hidden shadow-2xl border-2 border-amber-400/80 bg-gradient-to-tr from-stone-950 via-stone-900 to-stone-950 flex flex-col items-center justify-center p-4">
              {/* Prize Behind the Scratch Coating */}
              <div className="text-center space-y-2 z-0 px-3">
                <div className={`w-12 h-12 rounded-full mx-auto flex items-center justify-center text-2xl shadow-inner ${
                  dailyScratch.isJackpot 
                    ? 'bg-gradient-to-tr from-yellow-500 to-amber-600 border border-yellow-300 animate-bounce' 
                    : 'bg-stone-800/80 border border-stone-700'
                }`}>
                  {dailyScratch.icon}
                </div>
                
                <h4 className={`font-bold text-sm leading-snug ${
                  dailyScratch.isJackpot ? 'text-yellow-300' : 'text-stone-200'
                }`}>
                  {dailyScratch.prizeName}
                </h4>

                <span className={`inline-block px-3 py-0.5 rounded-full text-xs font-black uppercase tracking-wider ${
                  dailyScratch.isJackpot
                    ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-stone-950 shadow-md'
                    : 'bg-stone-800 text-stone-400 border border-stone-700'
                }`}>
                  {dailyScratch.prizeValue}
                </span>

                <p className="text-[11px] text-stone-400 italic leading-relaxed pt-1">
                  "{dailyScratch.prizeQuote}"
                </p>
              </div>

              {/* Scratchable Canvas Layer (Only active if not yet scratched) */}
              {!dailyScratch.hasScratched && (
                <canvas
                  ref={scratchCanvasRef}
                  onMouseMove={handleScratchMove}
                  onTouchMove={handleScratchMove}
                  className="absolute inset-0 cursor-crosshair z-10 touch-none transition-opacity"
                />
              )}
            </div>

            {/* Daily Scratch Reset Countdown (shown cleanly when already scratched) */}
            {dailyScratch.hasScratched && (
              <div className="flex items-center justify-center gap-2 text-xs text-stone-400 bg-stone-950/80 px-4 py-2 rounded-2xl border border-stone-800">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Lượt cào mới sau:</span>
                <span className="font-mono font-bold text-amber-300">
                  {timeUntilTomorrow || '00:00:00'}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 📦 TAB 2: MYSTERY TREASURE CHESTS */}
      {activeTab === 'chest' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="p-4 rounded-2xl bg-stone-950 border border-amber-500/30 flex items-center justify-between flex-wrap gap-4">
            <div>
              <h3 className="font-bold text-amber-200 text-base flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-400" />
                Khai Mở Rương Báu Di Sản Cổ Truyền
              </h3>
              <p className="text-xs text-stone-400">
                Mỗi chiếc rương chứa đựng những bí bảo di sản, voucher và vật phẩm tăng tốc thám hiểm độc quyền.
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs text-stone-400">Số dư hiện tại:</span>
              <p className="text-lg font-black text-amber-300 font-mono">{currentLP} LP</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {CHEST_TYPES.map((chest) => {
              const canAfford = currentLP >= chest.costLP;
              return (
                <div
                  key={chest.id}
                  className={`rounded-3xl border p-6 flex flex-col justify-between bg-gradient-to-b ${chest.color} ${chest.borderColor} shadow-2xl transition-all hover:scale-105 group relative overflow-hidden`}
                >
                  {/* Decorative Glow */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

                  <div className="space-y-4 text-center">
                    <div className="w-20 h-20 rounded-3xl bg-black/40 border border-amber-400/30 mx-auto flex items-center justify-center text-4xl shadow-inner group-hover:rotate-6 transition-transform">
                      {chest.tier === 'gold' ? '👑' : chest.tier === 'silver' ? '💎' : '🪙'}
                    </div>

                    <div>
                      <h4 className="font-['Cinzel',serif] font-bold text-lg text-amber-200">
                        {chest.name}
                      </h4>
                      <p className="text-xs text-stone-300 mt-1 leading-relaxed">
                        {chest.description}
                      </p>
                    </div>

                    {/* Possible Items */}
                    <div className="p-3 rounded-2xl bg-black/40 border border-amber-500/20 text-left space-y-1.5 text-xs">
                      <p className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                        Vật phẩm có thể mở:
                      </p>
                      {chest.possiblePrizes.map((pz, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 text-[11px] text-stone-200">
                          <Sparkles className="w-3 h-3 text-yellow-400 shrink-0" />
                          <span>{pz}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-amber-500/20 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-stone-400">Giá mở rương:</span>
                      <p className="font-mono font-bold text-amber-300 text-base">{chest.costLP} LP</p>
                    </div>

                    <button
                      onClick={() => handleOpenChest(chest)}
                      disabled={!canAfford}
                      className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-md ${
                        canAfford
                          ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-stone-950 hover:from-amber-400 hover:to-yellow-300 hover:scale-105'
                          : 'bg-stone-800 text-stone-500 cursor-not-allowed'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{canAfford ? 'Mở Rương' : 'Không Đủ LP'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 🎒 TAB 3: INVENTORY & ACTIVE BUFFS */}
      {activeTab === 'inventory' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Active Buffs Summary */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-950/40 via-stone-900 to-stone-900 border border-amber-500/30 flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-amber-200">
                  Hiệu Ứng Trang Bị Đang Kích Hoạt ({activeBuffs.equippedCount} món)
                </h4>
                <p className="text-xs text-stone-400">
                  {activeBuffs.extraLPPercent > 0 && `+${activeBuffs.extraLPPercent}% LP • `}
                  {activeBuffs.extraExpPercent > 0 && `+${activeBuffs.extraExpPercent}% EXP • `}
                  Trang bị du hành tăng cường năng lực giải mã di sản
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {(Object.values(equippedMemory.equippedGear) as EquippedGearItem[]).map((gear: EquippedGearItem) => (
              <div
                key={gear.id}
                className={`p-5 rounded-2xl border transition-all ${
                  gear.isEquipped
                    ? 'bg-amber-950/20 border-amber-500/60 shadow-lg ring-1 ring-amber-500/30'
                    : 'bg-stone-900 border-stone-800 opacity-75'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                    <Compass className="w-6 h-6" />
                  </div>
                  <span className={`text-[10px] uppercase font-bold px-2.5 py-1 rounded-full ${
                    gear.isEquipped 
                      ? 'bg-emerald-500 text-stone-950' 
                      : 'bg-stone-800 text-stone-400'
                  }`}>
                    {gear.isEquipped ? 'Đang Mặc' : 'Trong Túi'}
                  </span>
                </div>

                <h4 className="font-bold text-amber-100 text-sm mb-1">{gear.name}</h4>
                <div className="p-2.5 rounded-xl bg-stone-950/80 border border-stone-800 mb-3 space-y-1">
                  <p className="text-xs font-bold text-amber-400 flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    {gear.buffName}
                  </p>
                  <p className="text-[11px] text-stone-300 leading-relaxed">{gear.buffDescription}</p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-stone-800 text-xs">
                  <span className="text-stone-500 text-[10px]">Ngày nhận: {gear.acquiredDate}</span>
                  <button
                    onClick={() => handleToggleEquip(gear.id)}
                    className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${
                      gear.isEquipped
                        ? 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                        : 'bg-amber-500 text-stone-950 hover:bg-amber-400 shadow'
                    }`}
                  >
                    {gear.isEquipped ? 'Tháo Ra' : 'Mặc Ngay'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 🎁 TAB 4: REWARDS STORE GRID */}
      {activeTab === 'store' && (
        <div className="space-y-6">
          {/* Search & Filter Bar */}
          <div className="p-4 rounded-2xl bg-stone-900/90 border border-stone-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 shadow-xl">
            {/* Search input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm voucher di sản, vé bảo tàng, cà phê, nón tai bèo..."
                className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-500/60"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 md:pb-0 shrink-0">
              {[
                { id: 'all', label: 'Tất Cả', icon: Layers },
                ...(userFavoriteCategories.length > 0 ? [{ id: 'recommended', label: '🎯 Gợi Ý Cho Bạn', icon: Sparkles }] : []),
                { id: 'ticket', label: '🎫 Vé Di Tích', icon: Ticket },
                { id: 'cuisine', label: '🍜 Ẩm Thực', icon: Coffee },
                { id: 'souvenir', label: '🎒 Trang Bị', icon: Package }
              ].map(f => {
                const isSelected = categoryFilter === f.id;
                return (
                  <button
                    key={f.id}
                    onClick={() => {
                      sound.playClick();
                      setCategoryFilter(f.id as any);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 border ${
                      isSelected
                        ? 'bg-amber-500 text-stone-950 border-amber-300 shadow-md font-black'
                        : 'bg-stone-950 text-stone-400 hover:text-stone-200 border-stone-800'
                    }`}
                  >
                    <span>{f.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* User Preferences Highlight Notice if in recommended or favorites match */}
          {userFavoriteCategories.length > 0 && (
            <div className="px-4 py-2.5 rounded-2xl bg-amber-950/20 border border-amber-500/30 flex items-center justify-between gap-3 text-xs text-amber-300">
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  Đang lọc theo sở thích cá nhân đã lưu của bạn: <strong className="text-amber-200 font-bold">{userFavoriteCategories.join(', ')}</strong>
                </span>
              </span>
              {categoryFilter !== 'all' && (
                <button
                  onClick={() => setCategoryFilter('all')}
                  className="text-stone-400 hover:text-amber-200 underline font-semibold text-[11px]"
                >
                  Xem tất cả
                </button>
              )}
            </div>
          )}

          {/* Rewards Grid */}
          {filteredRewards.length === 0 ? (
            <div className="text-center py-12 rounded-3xl bg-stone-950 border border-stone-800 space-y-3">
              <Package className="w-12 h-12 text-stone-600 mx-auto" />
              <h4 className="font-bold text-stone-300 text-base">Không tìm thấy phần thưởng phù hợp</h4>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Hãy thử đổi từ khóa tìm kiếm hoặc bấm nút "Tất Cả" để khám phá toàn bộ kho quà tặng di sản.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setCategoryFilter('all');
                }}
                className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold"
              >
                Đặt Lại Bộ Lọc
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRewards.map((reward) => {
                const canAfford = currentLP >= reward.costLP && currentBadgesCount >= reward.requiredBadgesCount;
                const isUserPreferred = 
                  (userFavoriteCategories.includes('cuisine') && reward.category === 'cuisine') ||
                  (userFavoriteCategories.includes('architecture') && reward.category === 'ticket') ||
                  (userFavoriteCategories.includes('history') && reward.category === 'ticket') ||
                  (userFavoriteCategories.includes('craft') && reward.category === 'souvenir');

                return (
                  <div
                    key={reward.id}
                    className={`bg-stone-900 border rounded-3xl overflow-hidden transition-all flex flex-col justify-between group shadow-xl relative ${
                      isUserPreferred
                        ? 'border-amber-500/60 shadow-amber-500/10'
                        : 'border-stone-800 hover:border-amber-500/50'
                    }`}
                  >
                    {/* Image Banner */}
                    <div className="relative h-44 overflow-hidden bg-stone-950">
                      <img
                        src={reward.image}
                        alt={reward.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/20 to-transparent" />
                      
                      <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap">
                        <span className="px-2.5 py-1 rounded-xl bg-stone-950/80 backdrop-blur-md border border-amber-500/30 text-amber-300 text-[10px] font-bold uppercase tracking-wider">
                          {reward.category === 'ticket' ? '🎫 Vé Tham Quan' : reward.category === 'cuisine' ? '🍜 Ẩm Thực' : '🎒 Trang Bị Di Sản'}
                        </span>
                        {isUserPreferred && (
                          <span className="px-2 py-1 rounded-xl bg-amber-500 text-stone-950 text-[10px] font-black uppercase tracking-wider shadow flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            Hợp Sở Thích
                          </span>
                        )}
                      </div>

                      <span className="absolute bottom-3 right-3 px-2.5 py-1 rounded-xl bg-amber-500 text-stone-950 font-black font-mono text-xs shadow-lg">
                        {reward.costLP} LP
                      </span>

                      {reward.valueVND && (
                        <span className="absolute bottom-3 left-3 text-[11px] font-mono text-stone-300 bg-stone-950/80 px-2 py-0.5 rounded-lg border border-stone-800">
                          Trị giá: {reward.valueVND}
                        </span>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                      <div className="space-y-1.5">
                        <h4 className="font-['Cinzel',serif] font-bold text-amber-200 text-base leading-snug">
                          {reward.name}
                        </h4>
                        {reward.partner && (
                          <p className="text-[11px] text-amber-400 font-semibold flex items-center gap-1">
                            <MapPin className="w-3 h-3 shrink-0" />
                            {reward.partner}
                          </p>
                        )}
                        <p className="text-xs text-stone-400 line-clamp-2 leading-relaxed">
                          {reward.description}
                        </p>
                      </div>

                      <div className="space-y-3 pt-3 border-t border-stone-800/80">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-stone-400">Yêu cầu huy hiệu:</span>
                          <span className={`font-bold ${currentBadgesCount >= reward.requiredBadgesCount ? 'text-amber-300' : 'text-rose-400'}`}>
                            {currentBadgesCount}/{reward.requiredBadgesCount} Huy hiệu
                          </span>
                        </div>

                        {currentBadgesCount < reward.requiredBadgesCount ? (
                          <button
                            onClick={() => {
                              sound.playClick();
                              if (onNavigateTab) {
                                onNavigateTab('badges');
                              }
                            }}
                            className="w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 hover:text-amber-200 shadow-sm group"
                            title="Chuyển đến bộ sưu tập huy hiệu để mở khóa"
                          >
                            <Award className="w-3.5 h-3.5 text-amber-400 group-hover:rotate-12 transition-transform" />
                            <span>Thiếu {reward.requiredBadgesCount - currentBadgesCount} huy hiệu • Săn ngay ➔</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              sound.playClick();
                              setSelectedRewardForRedeem(reward);
                            }}
                            disabled={!canAfford}
                            className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md ${
                              canAfford
                                ? 'bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-stone-950 hover:scale-[1.02]'
                                : 'bg-stone-800 text-stone-500 cursor-not-allowed'
                            }`}
                          >
                            <Sparkles className="w-4 h-4" />
                            <span>{canAfford ? 'Đổi Quà Ngay' : 'Chưa Đủ LP'}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 📦 CHEST OPENING MODAL */}
      {openingChest && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="max-w-md w-full bg-stone-900 border border-amber-500/40 rounded-3xl p-6 text-center space-y-6 shadow-2xl">
            {isChestOpeningAnim ? (
              <div className="space-y-4 py-8">
                <div className="w-24 h-24 rounded-3xl bg-amber-500/20 border border-amber-400 mx-auto flex items-center justify-center text-5xl animate-bounce">
                  ✨📦✨
                </div>
                <h3 className="font-['Cinzel',serif] font-bold text-xl text-amber-200">
                  Đang Khai Mở {openingChest.name}...
                </h3>
                <p className="text-xs text-stone-400">Hòa âm chuông thiêng và ánh sáng cổ vật đang hội tụ...</p>
              </div>
            ) : chestResult ? (
              <div className="space-y-5 animate-scaleUp">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-500 to-yellow-400 mx-auto flex items-center justify-center text-4xl shadow-xl">
                  {chestResult.icon}
                </div>

                <div>
                  <span className="text-xs uppercase font-bold text-amber-400 tracking-wider">
                    Phần Thưởng Đã Mở Khóa!
                  </span>
                  <h3 className="font-['Cinzel',serif] font-bold text-xl text-amber-200 mt-1">
                    {chestResult.name}
                  </h3>
                  <p className="text-xs text-stone-300 mt-2 leading-relaxed">
                    {chestResult.desc}
                  </p>
                </div>

                <button
                  onClick={() => {
                    sound.playClick();
                    setOpeningChest(null);
                    setChestResult(null);
                  }}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-stone-950 font-bold text-sm shadow-xl"
                >
                  Nhận Thưởng & Tiếp Tục
                </button>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* 🎟️ CONFIRM REDEEM MODAL */}
      {selectedRewardForRedeem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="max-w-md w-full bg-stone-900 border border-amber-500/40 rounded-3xl p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="font-['Cinzel',serif] font-bold text-lg text-amber-200">
                Xác Nhận Đổi Thưởng Di Sản
              </h3>
              <button
                onClick={() => setSelectedRewardForRedeem(null)}
                className="p-2 rounded-xl bg-stone-800 text-stone-400 hover:text-stone-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 flex items-center gap-4">
              <img
                src={selectedRewardForRedeem.image}
                alt={selectedRewardForRedeem.name}
                className="w-16 h-16 rounded-xl object-cover"
              />
              <div>
                <h4 className="font-bold text-amber-100 text-sm">{selectedRewardForRedeem.name}</h4>
                <p className="text-xs text-stone-400">Chi phí: <span className="font-bold text-amber-300 font-mono">{selectedRewardForRedeem.costLP} LP</span></p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedRewardForRedeem(null)}
                className="flex-1 py-2.5 rounded-xl bg-stone-800 text-stone-300 font-bold text-xs"
              >
                Hủy Bỏ
              </button>
              <button
                onClick={handleConfirmRedeem}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-stone-950 font-bold text-xs shadow-lg"
              >
                Xác Nhận Đổi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🎫 LUXURY HERITAGE VOUCHER RECEIPT MODAL */}
      {activeVoucher && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn overflow-y-auto">
          <div className="max-w-md w-full bg-gradient-to-b from-stone-900 via-stone-900 to-stone-950 border-2 border-amber-400/90 rounded-3xl p-6 space-y-5 shadow-2xl relative my-auto">
            {/* Close Button */}
            <button
              onClick={() => setActiveVoucher(null)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-stone-800 text-stone-400 hover:text-stone-200 z-10"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header with seal */}
            <div className="text-center space-y-1 pt-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-black uppercase tracking-wider border border-emerald-500/40">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Đổi Thưởng Thành Công
              </div>
              <h3 className="font-['Cinzel',serif] font-bold text-xl sm:text-2xl text-amber-200 mt-1">
                Thẻ Voucher Di Sản Điện Tử
              </h3>
              <p className="text-[11px] text-stone-400">
                Chứng nhận quyền thụ hưởng di sản chính thức từ Saigon Heritage Hub
              </p>
            </div>

            {/* Voucher Body (Vintage Guilloche-styled card) */}
            <div className="p-5 rounded-2xl bg-stone-950 border-2 border-amber-500/40 text-center space-y-4 relative overflow-hidden shadow-inner">
              {/* Watermark Heritage Stamp */}
              <div className="absolute -right-4 -bottom-4 w-32 h-32 rounded-full border-4 border-amber-500/10 pointer-events-none flex items-center justify-center -rotate-12">
                <span className="text-[9px] font-black text-amber-500/20 uppercase tracking-widest text-center">
                  DI SẢN<br />CHỨNG THỰC
                </span>
              </div>

              {/* QR Code Container */}
              <div className="w-36 h-36 mx-auto bg-white p-2.5 rounded-2xl flex flex-col items-center justify-center shadow-2xl border-2 border-amber-400/40">
                <QrCode className="w-28 h-28 text-stone-950" />
                <span className="text-[9px] font-bold text-stone-700 tracking-tighter uppercase mt-0.5">
                  Quét Mã Tại Điểm Di Tích
                </span>
              </div>

              {/* Verification Code Box with Copy */}
              <div className="p-3 rounded-xl bg-stone-900 border border-amber-500/30 space-y-1">
                <span className="text-[10px] text-stone-400 uppercase tracking-widest font-bold block">
                  Mã Xác Thực Voucher
                </span>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-base sm:text-lg font-black font-mono text-amber-300 tracking-widest">
                    {activeVoucher.code}
                  </span>
                  <button
                    onClick={() => handleCopyCode(activeVoucher.code)}
                    className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-amber-300 transition-colors flex items-center gap-1 text-xs font-bold"
                    title="Sao chép mã"
                  >
                    {copiedCode === activeVoucher.code ? (
                      <>
                        <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-[10px] text-emerald-400">Đã chép!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span className="text-[10px]">Sao chép</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Reward Details */}
              <div className="pt-2 border-t border-stone-800/80 text-xs text-stone-300 text-left space-y-1">
                <p className="font-bold text-amber-200 text-sm">{activeVoucher.reward.name}</p>
                {activeVoucher.reward.partner && (
                  <p className="text-[11px] text-amber-400/90 flex items-center gap-1">
                    <MapPin className="w-3 h-3 shrink-0" />
                    {activeVoucher.reward.partner}
                  </p>
                )}
                <div className="flex items-center justify-between text-[11px] text-stone-400 pt-1">
                  <span>Ngày cấp: <strong className="text-stone-300">{activeVoucher.date}</strong></span>
                  <span>Thời hạn: <strong className="text-amber-300">{activeVoucher.reward.expiryDays || 45} ngày</strong></span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-1">
              {onOpenBaSonAI && (
                <button
                  onClick={() => {
                    sound.playClick();
                    const prompt = `Tôi vừa đổi thành công voucher "${activeVoucher.reward.name}". Cố vấn Ba Son hãy hướng dẫn cho tôi cách sử dụng, địa chỉ chi tiết, khung giờ ghé thăm lý tưởng và gợi ý các di sản lân cận nên ghé kết hợp nhé!`;
                    setActiveVoucher(null);
                    onOpenBaSonAI(prompt);
                  }}
                  className="w-full py-2.5 rounded-xl bg-amber-950/40 hover:bg-amber-900/50 border border-amber-500/40 text-amber-300 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <Bot className="w-4 h-4 text-amber-400" />
                  <span>Hỏi Cố Vấn Ba Son Về Điểm Dùng Voucher Này</span>
                </button>
              )}

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    sound.playClick();
                    window.print();
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>In / Lưu Phiếu</span>
                </button>

                <button
                  onClick={() => {
                    sound.playClick();
                    setActiveVoucher(null);
                    setActiveTab('inventory');
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-stone-950 font-bold text-xs shadow-lg transition-transform hover:scale-[1.02]"
                >
                  Xem Trong Tủ Đồ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
