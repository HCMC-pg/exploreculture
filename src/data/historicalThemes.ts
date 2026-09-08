import { HistoricalThemeSkin, HistoricalThemeId } from '../types';

export const HISTORICAL_THEME_SKINS: HistoricalThemeSkin[] = [
  {
    id: 'classic_amber',
    name: 'Phương Nam Hoàng Kim',
    era: 'Nguyên Bản Di Sản (Thế kỷ 19 - Hiện đại)',
    tagline: 'Sắc vàng hoàng kim & Tinh hoa di sản phương Nam',
    description: 'Phong cách nguyên bản cổ kính và thanh lịch với ánh hoàng kim phương Nam rạng ngời kết hợp cùng chiều sâu trầm mặc của di sản cổ truyền.',
    previewColors: {
      primary: '#f59e0b',
      accent: '#fbbf24',
      background: '#0c0a09',
      border: 'rgba(245, 158, 11, 0.45)',
      cardBg: '#1c1917'
    },
    cardBgClass: 'bg-stone-900/95',
    borderClass: 'border-amber-500/40',
    accentTextClass: 'text-amber-300',
    headerGradient: 'from-amber-600 via-amber-500 to-yellow-400',
    buttonGradient: 'from-amber-500 via-amber-400 to-yellow-400',
    glowColor: 'rgba(245, 158, 11, 0.35)',
    badgeTag: '👑 Nguyên Bản',
    iconName: 'Sparkles',
    musicMood: 'Nhã nhạc & Cung đình Nam Bộ',
    cssVariables: {
      '--theme-primary': '#f59e0b',
      '--theme-primary-hover': '#fbbf24',
      '--theme-accent': '#fbbf24',
      '--theme-bg': '#0c0a09',
      '--theme-header-bg': 'rgba(12, 10, 9, 0.95)',
      '--theme-card': '#1c1917',
      '--theme-border': 'rgba(245, 158, 11, 0.45)',
      '--theme-glow': 'rgba(245, 158, 11, 0.35)',
      '--theme-gradient': 'linear-gradient(135deg, #d97706, #f59e0b, #fbbf24)',
      '--theme-badge-bg': 'rgba(245, 158, 11, 0.2)',
      '--theme-badge-text': '#fde68a'
    }
  },
  {
    id: 'indochine',
    name: 'Đông Dương Cổ Điển (Indochine 1930)',
    era: 'Thời kỳ 1920 - 1950',
    tagline: 'Xanh ngọc bích quý phái & Vàng hoàng thổ rêu phong',
    description: 'Phong cách kiến trúc Indochine giao thoa Á - Âu lãng mạn. Tông xanh ngọc rêu quý phái hòa cùng sắc vàng hoàng thổ của những căn biệt thự cổ và họa tiết gạch bông Nam Bộ.',
    previewColors: {
      primary: '#10b981',
      accent: '#34d399',
      background: '#041c16',
      border: 'rgba(16, 185, 129, 0.5)',
      cardBg: '#062d23'
    },
    cardBgClass: 'bg-emerald-950/90',
    borderClass: 'border-emerald-500/40',
    accentTextClass: 'text-emerald-300',
    headerGradient: 'from-emerald-600 via-teal-500 to-amber-300',
    buttonGradient: 'from-emerald-500 via-teal-400 to-emerald-300',
    glowColor: 'rgba(16, 185, 129, 0.35)',
    badgeTag: '🌿 Indochine 1930',
    iconName: 'Palmtree',
    musicMood: 'Tơ đồng thính phòng & Jazz Đông Dương',
    cssVariables: {
      '--theme-primary': '#10b981',
      '--theme-primary-hover': '#34d399',
      '--theme-accent': '#34d399',
      '--theme-bg': '#041c16',
      '--theme-header-bg': 'rgba(4, 28, 22, 0.95)',
      '--theme-card': '#062d23',
      '--theme-border': 'rgba(16, 185, 129, 0.5)',
      '--theme-glow': 'rgba(16, 185, 129, 0.35)',
      '--theme-gradient': 'linear-gradient(135deg, #059669, #10b981, #34d399)',
      '--theme-badge-bg': 'rgba(16, 185, 129, 0.2)',
      '--theme-badge-text': '#a7f3d0'
    }
  },
  {
    id: 'vintage_90s',
    name: 'Sài Gòn Thập Niên 90 (Retro 90s)',
    era: 'Thời kỳ 1985 - 1999',
    tagline: 'Lam dạ quang, Cam san hô & Băng cassette phố thị',
    description: 'Ký ức Hòn Ngọc Viễn Đông thập niên 90 với bảng hiệu vẽ tay nghệ thuật, quán cà phê vợt hẻm nhỏ, ánh đèn neon rực rỡ và nhịp sống đô thị năng động.',
    previewColors: {
      primary: '#06b6d4',
      accent: '#f97316',
      background: '#071828',
      border: 'rgba(6, 182, 212, 0.5)',
      cardBg: '#0c2842'
    },
    cardBgClass: 'bg-cyan-950/85',
    borderClass: 'border-cyan-500/40',
    accentTextClass: 'text-cyan-300',
    headerGradient: 'from-cyan-500 via-teal-400 to-orange-400',
    buttonGradient: 'from-cyan-500 via-teal-400 to-orange-400',
    glowColor: 'rgba(6, 182, 212, 0.35)',
    badgeTag: '📼 Retro 90s',
    iconName: 'Radio',
    musicMood: 'Băng nhạc cassette & Phố thị về đêm',
    cssVariables: {
      '--theme-primary': '#06b6d4',
      '--theme-primary-hover': '#22d3ee',
      '--theme-accent': '#f97316',
      '--theme-bg': '#071828',
      '--theme-header-bg': 'rgba(7, 24, 40, 0.95)',
      '--theme-card': '#0c2842',
      '--theme-border': 'rgba(6, 182, 212, 0.5)',
      '--theme-glow': 'rgba(6, 182, 212, 0.35)',
      '--theme-gradient': 'linear-gradient(135deg, #0891b2, #06b6d4, #f97316)',
      '--theme-badge-bg': 'rgba(6, 182, 212, 0.2)',
      '--theme-badge-text': '#a5f3fc'
    }
  },
  {
    id: 'gia_dinh_dynasty',
    name: 'Hoàng Triều Gia Định (Triều Nguyễn 1698)',
    era: 'Thời kỳ 1698 - 1880',
    tagline: 'Đỏ son sơn mài, Vàng rồng & Thành Bát Quái',
    description: 'Tái hiện thời kỳ mở cõi phương Nam với Lễ Thành Hầu Nguyễn Hữu Cảnh, thành Quy Bát Quái và nghệ thuật sơn mài son thiếp vàng lộng lẫy.',
    previewColors: {
      primary: '#ef4444',
      accent: '#f59e0b',
      background: '#1c0808',
      border: 'rgba(239, 68, 68, 0.5)',
      cardBg: '#300f0f'
    },
    cardBgClass: 'bg-red-950/85',
    borderClass: 'border-rose-500/40',
    accentTextClass: 'text-rose-300',
    headerGradient: 'from-rose-600 via-amber-500 to-yellow-300',
    buttonGradient: 'from-rose-600 via-red-500 to-amber-400',
    glowColor: 'rgba(239, 68, 68, 0.35)',
    badgeTag: '🏮 Hoàng Triều 1698',
    iconName: 'Crown',
    musicMood: 'Trống hội khai khẩn & Nhã nhạc triều đình',
    cssVariables: {
      '--theme-primary': '#ef4444',
      '--theme-primary-hover': '#f87171',
      '--theme-accent': '#f59e0b',
      '--theme-bg': '#1c0808',
      '--theme-header-bg': 'rgba(28, 8, 8, 0.95)',
      '--theme-card': '#300f0f',
      '--theme-border': 'rgba(239, 68, 68, 0.5)',
      '--theme-glow': 'rgba(239, 68, 68, 0.35)',
      '--theme-gradient': 'linear-gradient(135deg, #dc2626, #ef4444, #f59e0b)',
      '--theme-badge-bg': 'rgba(239, 68, 68, 0.2)',
      '--theme-badge-text': '#fecaca'
    }
  },
  {
    id: 'ba_son_industrial',
    name: 'Cơ Khí Ba Son 1925 (Xưởng Tàu Hào Hùng)',
    era: 'Thời kỳ 1911 - 1945',
    tagline: 'Xanh thép hải quân, Đồng thau & Ngọn lửa bến cảng',
    description: 'Phong cách tôn vinh cái nôi công nghiệp đóng tàu bên bờ sông Sài Gòn, nơi ghi dấu chân người thợ Tôn Đức Thắng và những chuyến hải trình vượt đại dương.',
    previewColors: {
      primary: '#38bdf8',
      accent: '#fbbf24',
      background: '#091526',
      border: 'rgba(56, 189, 248, 0.5)',
      cardBg: '#0f2442'
    },
    cardBgClass: 'bg-slate-900/90',
    borderClass: 'border-sky-500/40',
    accentTextClass: 'text-sky-300',
    headerGradient: 'from-sky-500 via-blue-400 to-amber-300',
    buttonGradient: 'from-sky-500 via-blue-500 to-amber-400',
    glowColor: 'rgba(56, 189, 248, 0.35)',
    badgeTag: '⚓ Ba Son 1925',
    iconName: 'Anchor',
    musicMood: 'Sóng vỗ bến cảng & Còi tàu viễn dương',
    cssVariables: {
      '--theme-primary': '#38bdf8',
      '--theme-primary-hover': '#7dd3fc',
      '--theme-accent': '#fbbf24',
      '--theme-bg': '#091526',
      '--theme-header-bg': 'rgba(9, 21, 38, 0.95)',
      '--theme-card': '#0f2442',
      '--theme-border': 'rgba(56, 189, 248, 0.5)',
      '--theme-glow': 'rgba(56, 189, 248, 0.35)',
      '--theme-gradient': 'linear-gradient(135deg, #0284c7, #38bdf8, #fbbf24)',
      '--theme-badge-bg': 'rgba(56, 189, 248, 0.2)',
      '--theme-badge-text': '#bae6fd'
    }
  },
  {
    id: 'lai_thieu_ceramic',
    name: 'Men Ngọc Gốm Lái Thiêu & Đất Thủ',
    era: 'Thời kỳ Làng Nghề Trăm Năm',
    tagline: 'Xanh men ngọc, Đất nung lò rồng & Hương bưởi ven sông',
    description: 'Sắc men lam ngọc đặc trưng của gốm Lái Thiêu kết hợp đất nung ấm áp của các lò rồng Tân Phước Khánh và kiến trúc sơn mài Tương Bình Hiệp.',
    previewColors: {
      primary: '#14b8a6',
      accent: '#f59e0b',
      background: '#041c1b',
      border: 'rgba(20, 184, 166, 0.5)',
      cardBg: '#073330'
    },
    cardBgClass: 'bg-teal-950/90',
    borderClass: 'border-teal-500/40',
    accentTextClass: 'text-teal-300',
    headerGradient: 'from-teal-500 via-emerald-400 to-amber-400',
    buttonGradient: 'from-teal-500 via-emerald-400 to-amber-400',
    glowColor: 'rgba(20, 184, 166, 0.35)',
    badgeTag: '🏺 Gốm Lái Thiêu',
    iconName: 'Flame',
    musicMood: 'Tiếng củi lò gốm & Đờn ca tài tử đất Thủ',
    cssVariables: {
      '--theme-primary': '#14b8a6',
      '--theme-primary-hover': '#2dd4bf',
      '--theme-accent': '#f59e0b',
      '--theme-bg': '#041c1b',
      '--theme-header-bg': 'rgba(4, 28, 27, 0.95)',
      '--theme-card': '#073330',
      '--theme-border': 'rgba(20, 184, 166, 0.5)',
      '--theme-glow': 'rgba(20, 184, 166, 0.35)',
      '--theme-gradient': 'linear-gradient(135deg, #0d9488, #14b8a6, #f59e0b)',
      '--theme-badge-bg': 'rgba(20, 184, 166, 0.2)',
      '--theme-badge-text': '#99f6e4'
    }
  },
  {
    id: 'vung_tau_ocean',
    name: 'Hải Đăng & Biển Vàng Vũng Tàu',
    era: 'Hải Trình Biển Đảo Phương Nam',
    tagline: 'Lam ngọc đại dương, Cát vàng & Gió ngàn Côn Đảo',
    description: 'Sắc xanh dương đại dương phóng khoáng hòa cùng ánh vàng ngọn Hải Đăng cổ kính và bãi cát vàng Bãi Sau, mang đến cảm giác mát lành, tự do và hào hùng.',
    previewColors: {
      primary: '#0ea5e9',
      accent: '#facc15',
      background: '#041324',
      border: 'rgba(14, 165, 233, 0.5)',
      cardBg: '#08213b'
    },
    cardBgClass: 'bg-sky-950/90',
    borderClass: 'border-sky-500/40',
    accentTextClass: 'text-sky-300',
    headerGradient: 'from-sky-600 via-cyan-500 to-amber-300',
    buttonGradient: 'from-sky-500 via-cyan-400 to-amber-300',
    glowColor: 'rgba(14, 165, 233, 0.35)',
    badgeTag: '🌊 Biển Vàng Vũng Tàu',
    iconName: 'Compass',
    musicMood: 'Tiếng sóng biển & Tiếng còi hải đăng viễn du',
    cssVariables: {
      '--theme-primary': '#0ea5e9',
      '--theme-primary-hover': '#38bdf8',
      '--theme-accent': '#facc15',
      '--theme-bg': '#041324',
      '--theme-header-bg': 'rgba(4, 19, 36, 0.95)',
      '--theme-card': '#08213b',
      '--theme-border': 'rgba(14, 165, 233, 0.5)',
      '--theme-glow': 'rgba(14, 165, 233, 0.35)',
      '--theme-gradient': 'linear-gradient(135deg, #0284c7, #0ea5e9, #facc15)',
      '--theme-badge-bg': 'rgba(14, 165, 233, 0.2)',
      '--theme-badge-text': '#bae6fd'
    }
  },
  {
    id: 'lotus_pink',
    name: 'Hoa Sen Hồng & Đất Phương Nam',
    era: 'Văn Hóa Dân Gian & Sông Nước',
    tagline: 'Hồng cánh sen, Nhụy vàng hoàng yến & Nước phù sa',
    description: 'Sắc hồng cánh sen thanh nhã kết hợp vàng nhụy sen rạng rỡ, gợi nhắc vẻ đẹp thuần khiết của đầm sen Tháp Mười và tâm hồn đôn hậu, nghĩa tình của người miền Nam.',
    previewColors: {
      primary: '#ec4899',
      accent: '#fbbf24',
      background: '#190814',
      border: 'rgba(236, 72, 153, 0.5)',
      cardBg: '#2d0f25'
    },
    cardBgClass: 'bg-pink-950/85',
    borderClass: 'border-pink-500/40',
    accentTextClass: 'text-pink-300',
    headerGradient: 'from-pink-600 via-rose-500 to-amber-300',
    buttonGradient: 'from-pink-500 via-rose-400 to-amber-300',
    glowColor: 'rgba(236, 72, 153, 0.35)',
    badgeTag: '🪷 Sen Hồng Nam Bộ',
    iconName: 'Sparkles',
    musicMood: 'Đàn bầu, sáo trúc & Tiếng hò sông nước',
    cssVariables: {
      '--theme-primary': '#ec4899',
      '--theme-primary-hover': '#f472b6',
      '--theme-accent': '#fbbf24',
      '--theme-bg': '#190814',
      '--theme-header-bg': 'rgba(25, 8, 20, 0.95)',
      '--theme-card': '#2d0f25',
      '--theme-border': 'rgba(236, 72, 153, 0.5)',
      '--theme-glow': 'rgba(236, 72, 153, 0.35)',
      '--theme-gradient': 'linear-gradient(135deg, #db2777, #ec4899, #fbbf24)',
      '--theme-badge-bg': 'rgba(236, 72, 153, 0.2)',
      '--theme-badge-text': '#fbcfe8'
    }
  }
];

export const getHistoricalSkin = (themeId?: string): HistoricalThemeSkin => {
  return HISTORICAL_THEME_SKINS.find(s => s.id === themeId) || HISTORICAL_THEME_SKINS[0];
};

export const applyGlobalThemeToDocument = (themeId?: string, customAccentColor?: string): void => {
  if (typeof document === 'undefined') return;
  const skin = getHistoricalSkin(themeId);
  const root = document.documentElement;
  
  if (skin.cssVariables) {
    Object.entries(skin.cssVariables).forEach(([key, val]) => {
      root.style.setProperty(key, val);
    });
  }

  // If user has a custom accent color, override primary and gradient
  if (customAccentColor) {
    root.style.setProperty('--theme-primary', customAccentColor);
    root.style.setProperty('--theme-accent', customAccentColor);
    root.style.setProperty('--theme-glow', `${customAccentColor}55`);
    root.style.setProperty('--theme-border', `${customAccentColor}70`);
    root.style.setProperty('--theme-gradient', `linear-gradient(135deg, ${customAccentColor}, #f59e0b, #fbbf24)`);
  }

  // Update body background color and text color smoothly
  document.body.style.backgroundColor = skin.previewColors.background;
  document.body.style.color = '#f5f5f4';
};
