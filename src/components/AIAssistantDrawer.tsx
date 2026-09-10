import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Send, 
  Bot, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Compass, 
  MapPin, 
  BookOpen, 
  HelpCircle,
  RotateCcw,
  Zap,
  Coffee,
  Landmark,
  Route,
  CheckCircle2,
  Copy,
  Check,
  ShieldCheck,
  ExternalLink
} from 'lucide-react';
import { ChatMessage, Location3D } from '../types';
import { sound } from '../utils/audio';

interface AIAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentLocation: Location3D | null;
  initialPrompt?: string;
  onSelectLocationByName?: (name: string) => void;
}

const TOPIC_CATEGORIES = [
  { id: 'quiz', label: 'Giải Mã Cổ Thư', icon: Zap },
  { id: 'arch', label: 'Kiến Trúc Di Sản', icon: Landmark },
  { id: 'history', label: 'Chính Sử & Niên Đại', icon: BookOpen },
  { id: 'relics', label: 'Bảo Vật Quốc Gia', icon: Compass },
  { id: 'culture', label: 'Huyền Tích & Cổ Vật', icon: Route }
];

export const AIAssistantDrawer: React.FC<AIAssistantDrawerProps> = ({
  isOpen,
  onClose,
  currentLocation,
  initialPrompt,
  onSelectLocationByName
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome_1',
      sender: 'ai',
      senderName: 'Cố Vấn Ba Son',
      text: 'Dạ, kính chào Lữ Khách! Tôi là Ba Son - Cố Vấn Di Sản & Bách Khoa Toàn Thư Phương Nam. Tôi được tối ưu hóa toàn diện để giải đáp MỌI THẮC MẮC của bạn về lịch sử, kiến trúc, văn hóa, cổ vật và hỗ trợ bạn giải mã các câu đố nhiệm vụ hóc búa nhất tại TP.HCM, Bình Dương và Bà Rịa - Vũng Tàu. Bạn muốn khám phá điều gì hôm nay?',
      timestamp: 'Vừa xong',
      suggestedActions: [
        'Bí mật phong thủy và hệ thống hầm chỉ huy Dinh Độc Lập',
        'Ý nghĩa lịch sử đốc nổi Ba Son 1863 và cuộc bãi công 1925',
        'Hành trình Bác Hồ tại Bến Nhà Rồng năm 1911 và con tàu Amiral Latouche-Tréville',
        'Bộ 6 quả chuông đồng và kỹ thuật gạch trần Nhà thờ Đức Bà',
        'Bí mật cấu trúc ngầm 3 tầng và Bếp Hoàng Cầm Địa đạo Củ Chi'
      ]
    }
  ]);

  const [inputVal, setInputVal] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('quiz');
  const [aiStatus, setAiStatus] = useState<{ online: boolean; engine: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/gemini/status')
      .then(res => res.json())
      .then(data => setAiStatus(data))
      .catch(() => setAiStatus({ online: false, engine: 'Bách Khoa Cổ Viện Phương Nam (Chính Sử)' }));
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  useEffect(() => {
    if (initialPrompt && isOpen) {
      handleSendMessage(initialPrompt);
    }
  }, [initialPrompt, isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputVal.trim();
    if (!query || isLoading) return;

    sound.playClick();
    setInputVal('');

    const userMsg: ChatMessage = {
      id: `u_${Date.now()}`,
      sender: 'user',
      senderName: 'Lữ Khách',
      text: query,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          locationContext: currentLocation ? `${currentLocation.name} (${currentLocation.province})` : 'TP. Hồ Chí Minh & Nam Bộ',
          history: messages.slice(-6)
        })
      });

      const data = await response.json();
      const aiReplyText = data.reply || 'Ba Son đã ghi nhận. Hãy tiếp tục quan sát các chi tiết kiến trúc độc đáo nhé!';

      const aiMsg: ChatMessage = {
        id: `ai_${Date.now()}`,
        sender: 'ai',
        senderName: 'Cố Vấn Ba Son',
        text: aiReplyText,
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        sources: data.sources || [],
        groundingQueries: data.searchQueries || []
      };

      setMessages(prev => [...prev, aiMsg]);
      sound.playDanTranhNote(587.33, 0.8);
    } catch (err) {
      const fallbackMsg: ChatMessage = {
        id: `ai_${Date.now()}`,
        sender: 'ai',
        senderName: 'Cố Vấn Ba Son',
        text: 'Vùng đất Gia Định - Sài Gòn - Phương Nam chất chứa hơn 300 năm bề dày lịch sử. Bạn hãy quan sát kỹ hoa văn, vật liệu và bối cảnh lịch sử của địa danh để tìm ra đáp án chính xác nhé!',
        timestamp: 'Vừa xong'
      };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Text-To-Speech Narrator in Vietnamese
  const speakText = (text: string) => {
    if (isSpeaking) {
      sound.stopSpeech();
      setIsSpeaking(false);
      return;
    }

    setIsSpeaking(true);
    sound.playDanTranhNote(440, 1.2);
    sound.speakVietnamese(text, 0.95, 1.0, () => {
      setIsSpeaking(false);
    });
  };

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    sound.playClick();
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearHistory = () => {
    sound.playClick();
    setMessages([
      {
        id: 'welcome_fresh',
        sender: 'ai',
        senderName: 'Cố Vấn Ba Son',
        text: 'Lịch sử trò chuyện đã được làm mới. Ba Son sẵn sàng tiếp tục đồng hành cùng Lữ Khách!',
        timestamp: 'Vừa xong'
      }
    ]);
  };

  const getPromptsForCategory = (catId: string) => {
    const locName = currentLocation ? currentLocation.name : null;

    switch (catId) {
      case 'quiz':
        return [
          locName ? `Manh mối mật thư ẩn giấu tại ${locName}` : 'Cách giải đố mật thư Bến Nhà Rồng',
          locName ? `Hoa văn và niên đại khảo cứu của ${locName}` : 'Ý nghĩa các con số niên biểu tại Bưu Điện Sài Gòn',
          'Phương pháp đối chiếu câu đối chữ Hán và niên đại lịch sử'
        ];
      case 'arch':
        return [
          locName ? `Đặc trưng kiến trúc và vật liệu xây dựng tại ${locName}` : 'Kiến trúc Gothic kết hợp Roman của Nhà Thờ Đức Bà',
          'Nghệ thuật đắp nổi phù điêu gốm Cây Mai tại các hội quán Nam Bộ',
          'Triết lý chữ Hán Cát - Khẩu - Trung - Tam trong kiến trúc Dinh Độc Lập'
        ];
      case 'history':
        return [
          locName ? `Dấu mốc lịch sử quan trọng nhất gắn với ${locName}` : 'Hành trình ra đi tìm đường cứu nước năm 1911 tại Bến Nhà Rồng',
          'Chu Sư Xưởng Ba Son từ thời chúa Nguyễn Ánh 1790 đến bãi công 1925',
          'Hệ thống trận đồ phòng thủ ngầm 250km Địa đạo Củ Chi'
        ];
      case 'relics':
        return [
          locName ? `Bảo vật hoặc hiện vật lịch sử tiêu biểu tại ${locName}` : 'Hai Bảo vật Quốc gia Xe tăng 390 và Xe tăng 843 tại Dinh Độc Lập',
          'Bản đồ cổ Nam Kỳ viễn đông vẽ tay năm 1892 tại Bưu Điện Sài Gòn',
          'Bộ 6 quả chuông đồng Sol-La-Si-Do-Re-Mi đúc năm 1879 tại Nhà Thờ Đức Bà'
        ];
      case 'culture':
        return [
          locName ? `Huyền tích dân gian và văn bia cổ gắn với ${locName}` : 'Tín ngưỡng thờ Bà Thiên Hậu và ký ức thương cảng Bến Nghé xưa',
          'Nghi thức thượng cờ và di sản hàng hải sông Sài Gòn thế kỷ 19',
          'Tinh thần quật khởi và văn hóa kháng chiến của quân dân Nam Bộ'
        ];
      default:
        return [];
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex justify-end animate-fadeIn">
      <div className="w-full max-w-md sm:max-w-lg h-full bg-stone-900 border-l border-amber-500/30 flex flex-col shadow-2xl text-stone-100 animate-slideLeft">
        
        {/* Header */}
        <div className="p-4 bg-stone-950 border-b border-amber-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-600 p-0.5 shadow-lg">
              <div className="w-full h-full bg-stone-950 rounded-[14px] flex items-center justify-center">
                <Bot className="w-5 h-5 text-amber-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="font-['Cinzel',serif] font-bold text-base text-amber-200">
                  Cố Vấn Ba Son AI
                </h3>
              </div>
              <p className="text-[11px] text-stone-400 mt-0.5">
                <span>{currentLocation ? `Đang tại: ${currentLocation.name}` : 'Bách khoa toàn thư di sản Nam Bộ'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleClearHistory}
              title="Làm mới trò chuyện"
              className="p-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-amber-400 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                if (isSpeaking) sound.stopSpeech();
                onClose();
              }}
              className="p-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-stone-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Topic Filters */}
        <div className="px-3 py-2 bg-stone-950/70 border-b border-stone-800/80 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {TOPIC_CATEGORIES.map(cat => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  sound.playClick();
                  setActiveCategory(cat.id);
                }}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all ${
                  isActive
                    ? 'bg-amber-500 text-stone-950 shadow-md font-bold'
                    : 'bg-stone-900 text-stone-400 hover:text-stone-200 border border-stone-800'
                }`}
              >
                <Icon className="w-3 h-3" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Suggested Quick Questions for Active Category */}
        <div className="px-3 py-2 bg-stone-950/40 border-b border-stone-800/50 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {getPromptsForCategory(activeCategory).map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(prompt)}
              className="px-2.5 py-1 rounded-lg bg-stone-900 hover:bg-amber-500/10 border border-stone-800 hover:border-amber-500/40 text-stone-300 hover:text-amber-300 text-[11px] whitespace-nowrap transition-colors flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3 text-yellow-400 shrink-0" />
              <span>{prompt}</span>
            </button>
          ))}
        </div>

        {/* Chat Message Stream */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div key={msg.id} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1.5`}>
                <div className="flex items-center gap-1.5 text-[10px] text-stone-400 px-1">
                  <span>{msg.senderName}</span>
                  <span>•</span>
                  <span>{msg.timestamp}</span>
                </div>

                <div className={`relative max-w-[95%] sm:max-w-[90%] p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                  isUser 
                    ? 'bg-gradient-to-r from-amber-600 to-amber-500 text-stone-950 font-medium rounded-tr-none shadow-md' 
                    : 'bg-stone-950/95 border border-stone-800 text-stone-200 rounded-tl-none shadow-xl'
                }`}>
                  {/* Academic Citation Badge for AI */}
                  {!isUser && (
                    <div className="flex items-center gap-1.5 mb-2.5 pb-2 border-b border-stone-800/80">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        Khảo Cứu Di Sản Chuẩn Xác
                      </span>
                      <span className="text-[10px] text-stone-500 font-mono">Trích Dẫn Thư Tịch Cổ</span>
                    </div>
                  )}

                  {/* Render content with clean paragraph and markdown styling */}
                  <div className="space-y-2 prose-invert">
                    {msg.text.split('\n\n').map((para, pIdx) => {
                      if (para.includes('### 📜') || para.includes('Nguồn Trích Dẫn') || para.includes('Nguồn Sử Liệu')) {
                        return (
                          <div key={pIdx} className="p-3 my-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-100 text-xs">
                            <div className="font-bold text-amber-300 flex items-center gap-1.5 mb-1.5 text-xs">
                              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                              <span>Nguồn Trích Dẫn Thư Tịch & Sử Liệu Khảo Cứu:</span>
                            </div>
                            <div className="whitespace-pre-line text-stone-300 font-serif leading-relaxed text-[11px]">
                              {para.replace(/###\s*📜.*?\n/, '')}
                            </div>
                          </div>
                        );
                      }
                      if (para.startsWith('### ')) {
                        return (
                          <h4 key={pIdx} className="font-bold text-amber-300 text-xs sm:text-sm mt-3 mb-1 border-b border-stone-800 pb-1 flex items-center gap-1.5">
                            {para.replace('### ', '')}
                          </h4>
                        );
                      }

                      // Split by **bold** markers
                      const parts = para.split(/(\*\*.*?\*\*)/g);
                      return (
                        <p key={pIdx} className="whitespace-pre-line text-stone-200 leading-relaxed">
                          {parts.map((part, idx) => {
                            if (part.startsWith('**') && part.endsWith('**')) {
                              return <strong key={idx} className="text-amber-200 font-semibold">{part.slice(2, -2)}</strong>;
                            }
                            return part;
                          })}
                        </p>
                      );
                    })}
                  </div>

                  {/* Verified Official Sources from Search Grounding / Scientific Dossier */}
                  {!isUser && msg.sources && msg.sources.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-stone-800/80 space-y-1.5">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-300">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Nguồn Sử Liệu & Hồ Sơ Đã Khảo Cứu Xác Thực:</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.sources.map((src, sIdx) => (
                          <a
                            key={sIdx}
                            href={src.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-900/90 hover:bg-stone-800 border border-amber-500/30 hover:border-amber-400 text-amber-200 hover:text-amber-100 text-[10px] font-medium transition-colors"
                          >
                            <ExternalLink className="w-2.5 h-2.5 text-amber-400 shrink-0" />
                            <span className="truncate max-w-[260px]">{src.title}</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Grounding Real-Time Search Queries */}
                  {!isUser && msg.groundingQueries && msg.groundingQueries.length > 0 && (
                    <div className="mt-2 flex items-center gap-1.5 flex-wrap text-[10px] text-stone-400">
                      <span className="font-semibold text-stone-400">Tra cứu thời gian thực:</span>
                      {msg.groundingQueries.map((q, qIdx) => (
                        <span key={qIdx} className="px-1.5 py-0.5 rounded bg-stone-900 border border-stone-800 text-stone-300 font-mono text-[9px]">
                          "{q}"
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Actions for AI messages */}
                  {!isUser && (
                    <div className="mt-3 pt-2.5 border-t border-stone-800/80 flex items-center justify-between gap-2 text-[11px]">
                      <button
                        onClick={() => speakText(msg.text)}
                        className={`flex items-center gap-1.5 transition-colors ${
                          isSpeaking ? 'text-rose-400 font-bold' : 'text-amber-400 hover:text-amber-300'
                        }`}
                        title="Đọc to bằng giọng thuyết minh di sản"
                      >
                        {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                        <span>{isSpeaking ? 'Dừng đọc' : 'Nghe Ba Son đọc'}</span>
                      </button>

                      <button
                        onClick={() => handleCopyMessage(msg.id, msg.text)}
                        className="flex items-center gap-1 text-stone-400 hover:text-stone-200 transition-colors"
                        title="Sao chép nội dung và trích dẫn"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400 font-bold">Đã chép trích dẫn</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Sao chép</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {/* Suggested Action Chips */}
                {msg.suggestedActions && (
                  <div className="flex flex-wrap gap-1.5 pt-1.5 max-w-[92%]">
                    {msg.suggestedActions.map((action, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(action)}
                        className="px-2.5 py-1 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs text-left transition-colors flex items-center gap-1"
                      >
                        <Sparkles className="w-3 h-3 text-yellow-400 shrink-0" />
                        <span>{action}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-center gap-2.5 text-amber-300 text-xs p-3.5 rounded-2xl bg-stone-950/80 border border-amber-500/30 w-fit shadow-md">
              <Bot className="w-4 h-4 text-amber-400 animate-spin" />
              <span>Ba Son đang tra cứu thư tịch cổ và phân tích di sản...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-stone-950 border-t border-stone-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              id="ai-chat-input"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Hỏi Ba Son về lịch sử, kiến trúc hoặc giải mã câu đố..."
              className="flex-1 p-3 rounded-xl bg-stone-900 border border-stone-700 focus:border-amber-400 text-xs sm:text-sm text-stone-100 outline-none"
            />
            <button
              type="submit"
              id="ai-chat-send-btn"
              disabled={isLoading || !inputVal.trim()}
              className="p-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 disabled:opacity-40 disabled:pointer-events-none text-stone-950 font-bold transition-all shadow-md"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
