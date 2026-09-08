import React from 'react';
import { 
  X, 
  Palette, 
  Check, 
  Sparkles, 
  Compass, 
  History, 
  Music, 
  Layers, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { HistoricalThemeId, HistoricalThemeSkin } from '../types';
import { HISTORICAL_THEME_SKINS } from '../data/historicalThemes';
import { sound } from '../utils/audio';

interface HistoricalThemeModalProps {
  currentThemeId: HistoricalThemeId;
  isOpen: boolean;
  onClose: () => void;
  onSelectTheme: (themeId: HistoricalThemeId) => void;
}

export const HistoricalThemeModal: React.FC<HistoricalThemeModalProps> = ({
  currentThemeId,
  isOpen,
  onClose,
  onSelectTheme
}) => {
  if (!isOpen) return null;

  const handleSelect = (themeId: HistoricalThemeId) => {
    sound.playSuccess();
    onSelectTheme(themeId);
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-stone-950 border-2 border-amber-500/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col text-stone-100">
        
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-stone-900 via-stone-900 to-amber-950/40 border-b border-amber-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-lg">
              <Palette className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-['Cinzel',serif] font-bold text-lg sm:text-xl text-amber-200">
                  Chủ Đề Giao Diện Thời Kỳ Lịch Sử (Historical Skin)
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-bold">
                  6 Thời Kỳ Vàng Son
                </span>
              </div>
              <p className="text-xs text-stone-400 mt-0.5">
                Cá nhân hóa sắc thái thị giác theo từng giai đoạn vàng son của Sài Gòn & Đất Phương Nam: toàn bộ trang web sẽ đổi màu theo thời kỳ bạn chọn!
              </p>
            </div>
          </div>

          <button
            onClick={() => { sound.playClick(); onClose(); }}
            className="p-2 rounded-2xl bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-400 hover:text-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Themes Grid */}
        <div className="flex-1 p-5 sm:p-6 overflow-y-auto space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {HISTORICAL_THEME_SKINS.map((skin) => {
              const isSelected = currentThemeId === skin.id;

              return (
                <div
                  key={skin.id}
                  onClick={() => handleSelect(skin.id)}
                  className={`p-5 rounded-3xl cursor-pointer transition-all duration-300 border relative flex flex-col justify-between group overflow-hidden ${
                    isSelected
                      ? `${skin.cardBgClass} border-2 shadow-2xl scale-[1.01]`
                      : 'bg-stone-900/70 hover:bg-stone-900 border-stone-800 hover:border-stone-700'
                  }`}
                  style={{
                    borderColor: isSelected ? skin.previewColors.primary : undefined,
                    boxShadow: isSelected ? `0 10px 30px -10px ${skin.previewColors.primary}40` : undefined
                  }}
                >
                  {/* Decorative background glow for active skin */}
                  {isSelected && (
                    <div 
                      className="absolute -right-10 -bottom-10 w-40 h-40 rounded-full blur-3xl opacity-20 pointer-events-none"
                      style={{ backgroundColor: skin.previewColors.primary }}
                    />
                  )}

                  <div className="space-y-3 relative z-10">
                    {/* Era & Selection Status */}
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-stone-950/80 border border-stone-700/60 flex items-center gap-1.5"
                        style={{ color: skin.previewColors.accent }}
                      >
                        <History className="w-3.5 h-3.5" />
                        <span>{skin.badgeTag}</span>
                      </span>

                      {isSelected ? (
                        <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                          <Check className="w-3.5 h-3.5" />
                          Đang Áp Dụng
                        </span>
                      ) : (
                        <span className="text-[11px] text-stone-500 group-hover:text-stone-300 flex items-center gap-1 transition-colors">
                          <span>Chọn áp dụng</span>
                          <ArrowRight className="w-3 h-3" />
                        </span>
                      )}
                    </div>

                    {/* Skin Name & Era */}
                    <div>
                      <h3 className="font-['Cinzel',serif] font-bold text-base sm:text-lg text-stone-100 group-hover:text-amber-200 transition-colors">
                        {skin.name}
                      </h3>
                      <p className="text-xs font-medium text-amber-400/90 mt-0.5">
                        {skin.tagline}
                      </p>
                      <p className="text-[11px] text-stone-400 italic mt-0.5">
                        {skin.era}
                      </p>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-stone-300 leading-relaxed">
                      {skin.description}
                    </p>

                    {/* Palette Swatches */}
                    <div className="pt-2 flex items-center justify-between border-t border-stone-800/80">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-stone-400 mr-1 font-semibold">Bảng màu:</span>
                        <div 
                          className="w-5 h-5 rounded-full border border-stone-700 shadow-sm"
                          style={{ backgroundColor: skin.previewColors.primary }}
                          title="Màu chủ đạo"
                        />
                        <div 
                          className="w-5 h-5 rounded-full border border-stone-700 shadow-sm"
                          style={{ backgroundColor: skin.previewColors.accent }}
                          title="Màu điểm nhấn"
                        />
                        <div 
                          className="w-5 h-5 rounded-full border border-stone-700 shadow-sm"
                          style={{ backgroundColor: skin.previewColors.background }}
                          title="Tông nền"
                        />
                      </div>

                      <div className="flex items-center gap-1 text-[10px] text-stone-400">
                        <Music className="w-3 h-3 text-stone-500" />
                        <span className="truncate max-w-[140px]">{skin.musicMood}</span>
                      </div>
                    </div>
                  </div>

                  {/* Apply Button */}
                  <div className="mt-4 pt-3 border-t border-stone-800/60 flex items-center justify-end">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelect(skin.id);
                      }}
                      className={`w-full py-2.5 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 shadow-lg ${
                        isSelected
                          ? 'text-stone-950 scale-100 ring-2 ring-white/30'
                          : 'bg-stone-900 hover:bg-stone-800 text-stone-200 border border-stone-700 hover:scale-[1.02]'
                      }`}
                      style={isSelected ? {
                        background: skin.cssVariables?.['--theme-gradient'] || `linear-gradient(135deg, ${skin.previewColors.primary}, ${skin.previewColors.accent})`,
                        color: '#09090b'
                      } : {}}
                    >
                      {isSelected ? (
                        <>
                          <Check className="w-4 h-4 text-stone-950 stroke-[3]" />
                          <span>GIAO DIỆN ĐANG KÍCH HOẠT</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" style={{ color: skin.previewColors.primary }} />
                          <span>KÍCH HOẠT SẮC THÁI NÀY</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer Note */}
        <div className="p-4 bg-stone-900 border-t border-stone-800 flex items-center justify-between text-xs text-stone-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>Chủ đề được lưu tự động vào tiến trình tài khoản của bạn.</span>
          </div>
          <button
            onClick={() => { sound.playClick(); onClose(); }}
            className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
