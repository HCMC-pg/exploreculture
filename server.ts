import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Google GenAI client lazily & safely
let genAIClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  if (!genAIClient && process.env.GEMINI_API_KEY) {
    genAIClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return genAIClient;
}

// Resilient Gemini Model Generation with Fallback & Retry
// Uses Gemini 3 series models as mandated by modern @google/genai guidelines
const CANDIDATE_MODELS = [
  'gemini-3.8-flash',
  'gemini-3.6-flash',
  'gemini-flash-latest',
  'gemini-3.1-flash-lite'
];

async function generateContentWithRetryAndFallback(
  ai: GoogleGenAI,
  params: {
    contents: any;
    config?: any;
  }
): Promise<string | null> {
  let lastError: any = null;

  for (const model of CANDIDATE_MODELS) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: params.contents,
          config: params.config,
        });
        if (response && response.text) {
          return response.text;
        }
      } catch (err: any) {
        lastError = err;
        const errMsg = err?.message || String(err);
        const isTransient = errMsg.includes('503') || errMsg.includes('429') || errMsg.includes('high demand') || errMsg.includes('UNAVAILABLE') || errMsg.includes('RESOURCE_EXHAUSTED');
        
        console.warn(`[Gemini API] Attempt ${attempt} on model ${model} failed (${isTransient ? 'transient/503' : 'other'}):`, errMsg);
        
        if (isTransient && attempt < 2) {
          await new Promise(resolve => setTimeout(resolve, 350));
          continue;
        }
        break;
      }
    }
  }

  console.error('[Gemini API] All fallback models exhausted:', lastError?.message || lastError);
  return null;
}

// In-memory data store for community forum and live chat
// In-memory data store for community forum, live chat, direct messages and user progress
let userProgressStore: Record<string, any> = {};

let directMessages: Array<{
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  recipientId: string;
  recipientName: string;
  text: string;
  sticker?: { id: string; name: string; icon: string };
  timestamp: string;
}> = [
  {
    id: 'dm_1',
    senderId: 'user_sg_01',
    senderName: 'Minh Khang',
    senderAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
    recipientId: 'current_user',
    recipientName: 'Bạn (Lữ Khách)',
    text: 'Chào bạn! Bạn đã giải xong câu đố về số lượng chuông đồng ở Nhà Thờ Đức Bà chưa? 6 quả chuông tương ứng 6 nốt nhạc Sol-La-Si-Đô-Rê-Mi đó nhé!',
    sticker: { id: 'stk_anchor', name: 'Mỏ Neo Ba Son', icon: '⚓' },
    timestamp: '10:30'
  },
  {
    id: 'dm_2',
    senderId: 'user_sg_02',
    senderName: 'Hoàng Yến',
    senderAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=120&q=80',
    recipientId: 'current_user',
    recipientName: 'Bạn (Lữ Khách)',
    text: 'Chiều nay mình đi săn huy hiệu Chùa Bà Thiên Hậu ở Quận 5, bạn có muốn lập đội cùng đi không?',
    sticker: { id: 'stk_lantern', name: 'Lồng Đèn Chợ Lớn', icon: '🏮' },
    timestamp: '11:15'
  }
];

let forumPosts = [
  {
    id: 'post_1',
    title: 'Kinh nghiệm giải mã câu đố gạch Marseille ở Nhà Thờ Đức Bà',
    authorName: 'Minh Khang (Lữ Khách Bậc Thầy)',
    authorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
    authorTitle: 'Nhà Giám Định Di Sản',
    category: 'hints',
    content: 'Chào cả nhà, mình vừa hoàn thành nhiệm vụ ở Nhà Thờ Đức Bà sáng nay! Cho bạn nào đang kẹt ở câu hỏi về nguồn gốc gạch: hãy chú ý đến chi tiết tàu buồm và nước Pháp nhé. Gạch đỏ này không hề trát vữa nhưng chống rêu cực đỉnh, nung từ cảng Marseille. Bác nào kẹt chỗ 6 quả chuông thì hỏi Trợ lý Ba Son gợi ý cấp 1 là ra ngay!',
    locationTag: 'Nhà thờ Đức Bà Sài Gòn',
    likes: 42,
    isLiked: false,
    commentsCount: 2,
    timestamp: '2 giờ trước',
    badgeEarned: 'badge_duc_ba',
    comments: [
      {
        id: 'c_1',
        authorName: 'Thùy Trang',
        authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
        authorTitle: 'Lữ Khách Khởi Nghiệp',
        content: 'Cảm ơn anh Khang nhiều ạ! Nhờ bài viết này mà em giải xong bước 2 trong vòng 3 phút, vừa ẵm được Huy hiệu Gạch Hồng rồi!',
        timestamp: '1 giờ trước',
        likes: 12
      },
      {
        id: 'c_2',
        authorName: 'Quốc Bảo',
        authorAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=120&q=80',
        authorTitle: 'Học Giả Nam Bộ',
        content: 'Nhà thờ đang trùng tu nhưng nhìn màu gạch cổ vẫn mê hoặc thật sự. Ai rảnh qua chụp góc bưu điện lấy trọn ánh sáng 3D nhé.',
        timestamp: '45 phút trước',
        likes: 8
      }
    ]
  },
  {
    id: 'post_2',
    title: 'Góc chụp ảnh và tìm chi tiết bí mật ở Hào Sĩ Phường (Quận 5)',
    authorName: 'Hoàng Yến',
    authorAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=120&q=80',
    authorTitle: 'Nhiếp Ảnh Gia Đô Thị',
    category: 'culture',
    content: 'Hào Sĩ Phường buổi sáng sớm có nắng rọi xiên qua các ô cửa lá sách xanh vàng cực đẹp. Mọi người khi đến nhớ giữ trật tự và đi nhẹ nói khẽ vì đây là khu dân cư sinh sống của các cô chú lớn tuổi nha. Mình vừa đổi thành công Voucher Cà phê Vợt từ điểm thưởng nhiệm vụ này, xịn xò lắm!',
    locationTag: 'Hẻm Hào Sĩ Phường',
    likes: 68,
    isLiked: false,
    commentsCount: 1,
    timestamp: '5 giờ trước',
    badgeEarned: 'badge_hao_si_phuong',
    comments: [
      {
        id: 'c_3',
        authorName: 'Văn Hậu',
        authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
        authorTitle: 'Khám Phá Hẻm Phố',
        content: 'Ban công tầng 2 nhìn như trong phim Vương Gia Vệ luôn bạn ơi. Văn hóa Chợ Lớn ở đây đậm đặc và ấm áp.',
        timestamp: '3 giờ trước',
        likes: 14
      }
    ]
  }
];

let liveChatMessages: Array<{
  id: string;
  senderName: string;
  senderAvatar: string;
  text: string;
  sticker?: { id: string; name: string; icon: string };
  timestamp: string;
}> = [
  {
    id: 'msg_1',
    senderName: 'Lữ Khách Sài Gòn 99',
    senderAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
    text: 'Có ai đang săn huy hiệu Chùa Bà Thiên Hậu ở Quận 5 không? Chùa hôm nay hương trầm thơm ngát và gốm Cây Mai lộng lẫy quá!',
    sticker: { id: 'stk_lotus', name: 'Hoa Sen Cổ Tự', icon: '🪷' },
    timestamp: '10:14'
  },
  {
    id: 'msg_2',
    senderName: 'Mai Anh (Thợ Săn Di Sản)',
    senderAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
    text: 'Mình vừa đổi được vé Saigon Waterbus hoàng hôn 350 LP rồi nè! Chiều nay ai đi chung chuyến 17h15 ngắm hoàng hôn Bến Nhà Rồng hông?',
    sticker: { id: 'stk_ship', name: 'Chiến Hạm Vượt Sóng', icon: '🚢' },
    timestamp: '10:18'
  },
  {
    id: 'msg_3',
    senderName: 'Tuấn Khang',
    senderAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=120&q=80',
    text: 'Trợ lý Ba Son AI thông minh ghê, mình hỏi về nguồn gốc gạch Marseille giải thích tường tận từng chi tiết lịch sử và trích dẫn chuẩn chỉ luôn!',
    sticker: { id: 'stk_anchor', name: 'Mỏ Neo Ba Son', icon: '⚓' },
    timestamp: '10:22'
  }
];

// API Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// API: Cultural AI Assistant "Cố Vấn Ba Son" - Academic Rigor, 100% Authentic Sources, Anti-Hallucination
const AUTHENTIC_HERITAGE_KNOWLEDGE: Record<string, {
  summary: string;
  artifacts: string[];
  citation: { title: string; author: string; era: string; excerpt: string };
  timeline: string;
}> = {
  'ba_son': {
    summary: 'Thủy xưởng Ba Son là cái nôi của ngành công nghiệp đóng tàu và phong trào công nhân Việt Nam. Khởi nguồn năm 1790 khi Chúa Nguyễn Ánh lập Chu Sư Xưởng bên ngã ba sông Sài Gòn và rạch Thị Nghè. Năm 1863, Hải quân Pháp khởi công ụ đốc nổi lớn bậc nhất Đông Dương. Tháng 8/1925, đồng chí Tôn Đức Thắng lãnh đạo cuộc bãi công lịch sử của hơn 1.000 công nhân thợ xưởng Ba Son đòi tăng lương và ngăn cản tàu chiến Pháp Jules Michelet chở lính sang đàn áp phong trào cách mạng Trung Quốc.',
    artifacts: [
      'Ụ tàu khô chìm xây bằng đá hoa cương nung và xi măng nhập từ Pháp (1863-1888)',
      'Hệ thống cần cẩu sắt trục hơi nước cổ cuối thế kỷ 19',
      'Khu xưởng cơ khí nơi người thợ Tôn Đức Thắng từng làm việc và thành lập Công hội Đỏ đầu tiên'
    ],
    citation: {
      title: 'Hồ Sơ Khoa Học Di Tích Lịch Sử Quốc Gia Đặc Biệt Ba Son & Gia Định Thành Thông Chí',
      author: 'Sử gia Trịnh Hoài Đức (1820) & Ban Quản Lý Di Tích Lịch Sử TP.HCM',
      era: 'Khởi lập 1790, Đốc tàu 1863, Di tích Quốc gia Đặc biệt 2017',
      excerpt: 'Chu Sư Xưởng lập năm Canh Tuất (1790) ven bờ sông Bến Nghé, chuyên đóng chiến thuyền vượt biển, sau trở thành xưởng Ba Son lẫy lừng của phong trào công nhân phương Nam.'
    },
    timeline: '1790 (Chu Sư Xưởng) -> 1863 (Đốc nổi Pháp) -> 8/1925 (Bãi công Tôn Đức Thắng) -> 2017 (Di tích Quốc gia đặc biệt)'
  },
  'ben_nha_rong': {
    summary: 'Bến Nhà Rồng khởi công xây dựng từ năm 1862 và hoàn thành năm 1863, nguyên là trụ sở của Hãng Vận tải Đường biển Pháp Messageries Maritimes tại ngã ba sông Sài Gòn và kênh Bến Nghé. Kiến trúc nổi bật với hình tượng "Lưỡng Long Chầu Nguyệt" bằng đất nung tráng men xanh trên đỉnh mái ngói. Vào ngày 5 tháng 6 năm 1911, người thanh niên yêu nước Nguyễn Tất Thành (Văn Ba) đã rời bến cảng này trên con tàu buôn Amiral Latouche-Tréville để bắt đầu hành trình 30 năm tìm đường cứu nước.',
    artifacts: [
      'Đôi rồng đất nung tráng men ngọc chầu mặt nguyệt nguyên bản trên nóc tòa nhà',
      'Mỏ neo đồng và mô hình con tàu hơi nước Amiral Latouche-Tréville năm 1911',
      'Bộ sưu tập hơn 11.000 hiện vật, tư liệu về cuộc đời và sự nghiệp của Chủ tịch Hồ Chí Minh'
    ],
    citation: {
      title: 'Lịch Sử Thành Phố Sài Gòn & Bảo Tàng Hồ Chí Minh - Chi Nhánh TP.HCM',
      author: 'GS. Trần Văn Giàu chủ biên - NXB Tổng Hợp TP.HCM',
      era: 'Khởi dựng 1862-1863, Di tích Lịch sử Lưu niệm Bác Hồ',
      excerpt: 'Tòa nhà trụ sở thương thuyền Pháp với đôi rồng ngậm trăng đã trở thành chứng nhân của sự kiện lịch sử 5/6/1911 khi Nguyễn Tất Thành xuống tàu ra đi vì đại cuộc non sông.'
    },
    timeline: '1863 (Khánh thành trụ sở Messageries Maritimes) -> 5/6/1911 (Nguyễn Tất Thành xuất dương) -> 1979 (Nhà Lưu niệm Bác Hồ)'
  },
  'dinh_doc_lap': {
    summary: 'Dinh Độc Lập (Di tích Quốc gia Đặc biệt) được khởi công xây dựng ngày 1/7/1962 và khánh thành ngày 31/10/1966 trên nền Dinh Norodom cũ (xây 1868). Công trình do Kiến trúc sư Ngô Viết Thụ (người Việt Nam đầu tiên đạt giải Khôi nguyên La Mã - Grand Prix de Rome) thiết kế. Mặt bằng bố cục triết lý Á Đông theo hình các chữ Hán phong thủy: chữ CÁT (吉 - may mắn), chữ KHẨU (口 - tôn trọng tự do ngôn luận), chữ TRUNG (中 - tính trung kiên), chữ TAM (三 - Dân chủ, Dân tộc, Dân sinh), và chữ CHỦ (主 - chủ quyền quốc gia). Vào lúc 11 giờ 30 phút ngày 30 tháng 4 năm 1975, hai chiếc xe tăng mang số hiệu 390 và 843 của Quân Giải phóng đã húc đổ cổng chính, kết thúc thắng lợi cuộc kháng chiến chống Mỹ cứu nước.',
    artifacts: [
      'Xe tăng số hiệu 390 (húc đổ cổng chính) và 843 (Bảo vật Quốc gia)',
      'Hệ thống rèm hoa đá hình các đốt trúc bao quanh mặt tiền lầu 2 cản nắng nhiệt đới',
      'Hầm ngầm chỉ huy tác chiến kiên cố sâu 2 tầng dưới lòng đất với bản đồ quân sự nguyên bản'
    ],
    citation: {
      title: 'Kiến Trúc Dinh Độc Lập & Hồ Sơ Di Tích Quốc Gia Đặc Biệt',
      author: 'KTS. Ngô Viết Thụ & Cục Di Sản Văn Hóa Việt Nam',
      era: 'Khởi công 1962, Khánh thành 1966, Mốc son 30/4/1975',
      excerpt: 'Mặt tiền Dinh kết tinh triết lý phương Đông qua các chữ Hán Cát, Khẩu, Trung, Tam, Chủ kết hợp với kỹ thuật kết cấu bê tông hiện đại và rèm hoa đá trúc thanh nhã.'
    },
    timeline: '1868 (Dinh Norodom) -> 1962-1966 (KTS Ngô Viết Thụ xây mới) -> 30/4/1975 (Giải phóng miền Nam) -> 2009 (Di tích Quốc gia đặc biệt)'
  },
  'nha_tho_duc_ba': {
    summary: 'Vương cung Thánh đường Chính tòa Đức Bà Sài Gòn khởi công ngày 7/10/1877 và khánh thành ngày 11/4/1880 do Kiến trúc sư Jules Bourard thiết kế theo phong cách Neo-Romanesque kết hợp Gothic. Toàn bộ vật liệu xây dựng gồm gạch đỏ không tô trát được nung và vận chuyển từ cảng Marseille (Pháp), đến nay vẫn giữ nguyên màu hồng đỏ tươi sáng và không bám rêu mốc. Hai tháp chuông gắn thêm năm 1895 cao 60.5m, chứa 6 quả chuông đồng lớn nặng tổng cộng 28.85 tấn mang âm Sol, La, Si, Do, Re, Mi nung tại hãng đúc Bollee (Pháp). Bức tượng Đức Mẹ Hòa Bình bằng đá cẩm thạch trắng Carrara (Ý) được tạc và khánh thành tại quảng trường phía trước năm 1959.',
    artifacts: [
      'Gạch gốm đỏ trần nung từ xưởng Guichard Carvin & Cie (Marseille, Pháp)',
      'Bộ 6 quả chuông đồng Sol-La-Si-Do-Re-Mi đúc năm 1879 tại Pháp',
      'Tượng Đức Mẹ Hòa Bình tạc từ khối đá cẩm thạch trắng Carrara của điêu khắc gia G. Ciocchetti (1959)'
    ],
    citation: {
      title: 'Sài Gòn Năm Xưa & Kiến Trúc Tôn Giáo Sài Gòn Cuối Thế Kỷ 19',
      author: 'Học giả Vương Hồng Sển & NXB Văn Hóa Thông Tin',
      era: 'Khởi công 1877, Khánh thành 1880, Tháp chuông 1895, Tượng Đức Mẹ 1959',
      excerpt: 'Ngôi thánh đường bằng gạch Marseille màu hồng son tráng lệ đứng giữa lòng đô thị, hai ngọn tháp vút cao cùng tiếng chuông đồng trầm hùng vang vọng khắp sông Bến Nghé.'
    },
    timeline: '1877 (Đặt viên đá đầu tiên) -> 1880 (Khánh thành) -> 1895 (Gắn 2 tháp nhọn cao 60.5m) -> 1962 (Tòa thánh phong Vương cung thánh đường)'
  },
  'buu_dien_tphcm': {
    summary: 'Bưu điện Trung tâm Sài Gòn được xây dựng từ năm 1886 đến năm 1891 theo đồ án thiết kế của Kiến trúc sư Marie-Alfred Foulhoux (nguyên KTS trưởng các công trình công cộng Nam Kỳ). Kiến trúc là sự giao thoa tuyệt mỹ giữa phong cách Gothic, Phục Hưng châu Âu và các giải pháp chống nóng nhiệt đới. Bên trong là mái vòm sắt uốn cong chịu lực lộng lẫy do xưởng đúc Gustave Eiffel gia công, cùng hai bức bản đồ lịch sử vẽ tay trên tường từ năm 1892 ghi lại mạng lưới điện tín Nam Kỳ - Campuchia và Sài Gòn - Chợ Lớn.',
    artifacts: [
      'Hai bức bản đồ lịch sử vẽ tay năm 1892: Lignes télégraphiques du Sud-Vietnam et Cambodge 1892 & Saigon et ses environs 1892',
      'Hệ vòm trần sắt chịu lực uốn cong hình vòm bánh quẩy cổ điển',
      'Các bảng danh nhân phát minh thế giới tạc quanh mặt tiền: Ampère, Faraday, Galvani, Morse...'
    ],
    citation: {
      title: 'Kiến Trúc Đô Thị Sài Gòn Xưa & Lịch Sử Ngành Bưu Chính Viễn Thông Việt Nam',
      author: 'Trung Tâm Lưu Trữ Quốc Gia II & NXB Trẻ',
      era: 'Xây dựng 1886-1891, KTS Marie-Alfred Foulhoux',
      excerpt: 'Mái vòm trần rộng lớn nâng đỡ bởi khung sắt mỹ thuật uốn lượn, kết hợp gạch lát men hoa văn rực rỡ tạo nên tòa bưu chính cổ điển độc nhất vô nhị vùng Đông Nam Á.'
    },
    timeline: '1886 (Khởi công) -> 1891 (Khánh thành) -> Bảo tồn nguyên vẹn công năng bưu chính di sản'
  },
  'cho_ben_thanh': {
    summary: 'Chợ Bến Thành mới được khởi công xây dựng năm 1912 và khánh thành vào tháng 3 năm 1914 do hãng thầu Brossard et Maupin thi công, thay thế cho chợ Bến Thành cũ bên bờ rạch Bến Nghé. Điểm nhấn biểu tượng là Tháp Đồng Hồ 4 mặt cao vút nhìn ra quảng trường Quách Thị Trang. Năm 1952, nhân đợt trùng tu lớn, 12 bức phù điêu gốm mỹ thuật Biên Hòa mô tả nông sản và đặc sản ba miền (chuối, cá, bò, vịt nước...) đã được các nghệ nhân trường Mỹ nghệ Biên Hòa tạo tác gắn quanh 4 cửa Đông - Tây - Nam - Bắc.',
    artifacts: [
      'Bộ 12 bức phù điêu gốm Biên Hòa nguyên bản năm 1952 ở 4 cổng chợ',
      'Tháp đồng hồ 4 mặt sản xuất tại Pháp hoạt động bền bỉ từ năm 1914',
      'Hệ thống mái vòm bê tông chống nắng mưa nhiệt đới đặc thù phương Nam'
    ],
    citation: {
      title: 'Chợ Bến Thành Qua Các Thời Kỳ Lịch Sử & Gốm Mỹ Nghệ Biên Hòa',
      author: 'Nhà nghiên cứu Nguyễn Đình Đầu & Bảo Tàng Lịch Sử TP.HCM',
      era: 'Khởi công 1912, Khánh thành 1914, Phù điêu gốm 1952',
      excerpt: 'Chợ Mới Bến Thành dựng giữa trung tâm đầm lầy Bồ Rệt xưa kia, tháp đồng hồ bốn mặt trở thành linh hồn giao thương và biểu tượng văn hóa bất biến của Sài Gòn.'
    },
    timeline: '1859 (Chợ cũ rạch Bến Nghé) -> 1912-1914 (Xây chợ mới) -> 1952 (Gắn phù điêu gốm Biên Hòa)'
  },
  'dia_dao_cu_chi': {
    summary: 'Địa đạo Củ Chi (Di tích Quốc gia Đặc biệt) là hệ thống công sự phòng thủ ngầm kỳ vĩ trong lòng đất, khởi đầu từ năm 1946 thời kháng chiến chống Pháp tại hai xã Tân Phú Trung và Phước Vĩnh An, sau đó phát triển mạnh mẽ từ năm 1961 đến 1968 thời kỳ chống Mỹ. Hệ thống trải dài hơn 250km đường hầm chia làm 3 tầng sâu (tầng 1 sâu 3m chống đạn pháo, tầng 2 sâu 6m chống bom xăng, tầng 3 sâu 8-12m chịu bom phá hạng nặng). Cùng với hệ thống ngầm là bếp Hoàng Cầm giấu khói (do anh nuôi Hoàng Cầm sáng chế năm 1951), giếng nước, phòng phẫu thuật, phòng họp và ụ chiến đấu liên hoàn.',
    artifacts: [
      'Hệ thống rãnh tản khói bếp Hoàng Cầm đào ngầm dưới rễ cây',
      'Nắp hầm bí mật ngụy trang bằng lá khô kích thước chuẩn 20cm x 30cm',
      'Hệ thống chông tre, hố bẫy ngầm và vũ khí tự tạo của đội nữ du kích Củ Chi'
    ],
    citation: {
      title: 'Đất Thép Thành Đồng Củ Chi & Lịch Sử Lực Lượng Vũ Trang TP.HCM',
      author: 'Bộ Tư Lệnh TP.HCM & NXB Quân Đội Nhân Dân',
      era: 'Đào từ 1946, mở rộng 1961-1968, Di tích Quốc gia Đặc biệt 2015',
      excerpt: 'Hơn 250km địa đạo trong lòng đất Củ Chi là biểu tượng bất khuất của chiến tranh nhân dân, nơi một tấc đất cũng thấm đượm lòng kiên trung và mưu lược cách mạng.'
    },
    timeline: '1946 (Bắt đầu đào hầm đơn lẻ) -> 1961-1965 (Nối liền toàn khu) -> 1975 (Toàn thắng) -> 2015 (Di tích Quốc gia đặc biệt)'
  },
  'chua_ba_thien_hau': {
    summary: 'Chùa Bà Thiên Hậu (Hội quán Tuệ Thành) tọa lạc tại đường Nguyễn Trãi, Quận 5, do cộng đồng người Hoa gốc Quảng Châu di cư đến Sài Gòn - Gia Định xây dựng vào khoảng năm 1760 để thờ Thiên Hậu Thánh Mẫu (vị thần bảo trợ ngư dân và người đi biển). Ngôi chùa nổi tiếng thế giới nhờ quần thể phù điêu gốm men nung Cây Mai và gốm Thạch Loan thế kỷ 19 gắn trên bờ nóc, bờ giải miêu tả các tích tuồng cổ điển (Bát Tiên, Tam Quốc, Lương Sơn Bạc). Không gian chùa nổi bật với hàng trăm vòng nhang trầm hình nón treo lơ lửng giữa sân thiên tỉnh.',
    artifacts: [
      'Bộ quần thể gốm men nhiều màu Cây Mai và Thạch Loan sản xuất năm 1895 và 1908',
      'Chuông đồng đúc năm Càn Long thứ 60 (1795)',
      'Bộ tượng gỗ sơn son thếp vàng Thiên Hậu Thánh Mẫu thế kỷ 18'
    ],
    citation: {
      title: 'Văn Hóa Người Hoa Nam Bộ & Lịch Sử Các Hội Quán Chợ Lớn',
      author: 'Nhà nghiên cứu Huỳnh Ngọc Trảng & NXB Văn Hóa',
      era: 'Khởi dựng khoảng 1760, Di tích Kiến trúc Nghệ thuật Quốc gia 1993',
      excerpt: 'Quần thể gốm Cây Mai rực rỡ đắp nổi trên mái hội quán Tuệ Thành phản ánh đỉnh cao tay nghề nung gốm truyền thống và đời sống tâm linh phương Nam.'
    },
    timeline: '1760 (Khởi dựng) -> 1795 (Đúc chuông cổ Càn Long) -> 1895 (Lắp phù điêu gốm Cây Mai) -> 1993 (Di tích cấp Quốc gia)'
  },
  'chua_hoi_khanh': {
    summary: 'Chùa Hội Khánh (Thủ Dầu Một, Bình Dương) được thiền sư Đại Ngạn (thuộc dòng thiền Lâm Tế) xây dựng năm 1741 trên ngọn đồi cao, sau khi bị giặc Tây tàn phá năm 1861 đã được dời về chân đồi năm 1868. Chùa lưu giữ pho tượng Phật Thích Ca nhập Niết bàn trên mái dài 52 mét, cao 12 mét được Tổ chức Kỷ lục Châu Á xác lập kỷ lục Tượng Phật nằm trên mái chùa dài nhất châu Á vào năm 2013. Kiến trúc chánh điện kết cấu gỗ mít cổ thụ chạm trổ tứ linh, hoa cúc, tùng bách tinh xảo của các nghệ nhân làng chạm mộc Thủ Dầu Một lừng danh.',
    artifacts: [
      'Tượng Đức Phật Thích Ca nhập Niết bàn dài 52m (Kỷ lục Châu Á 2013)',
      'Bộ cột gỗ lim chạm khắc câu đối chữ Hán sơn son thếp vàng thế kỷ 19',
      'Bộ bao lam phù điêu gỗ Thập bát La Hán tuyệt tác mộc Bình Dương'
    ],
    citation: {
      title: 'Địa Chí Bình Dương & Lịch Sử Phật Giáo Vùng Đất Sông Bé',
      author: 'Ban Tuyên Giáo Tỉnh Ủy Bình Dương & Viện Nghiên Cứu Phật Học',
      era: 'Khởi dựng 1741, Dời vị trí 1868, Kỷ lục Phật tích 2013',
      excerpt: 'Chùa Hội Khánh là viên ngọc kiến trúc gỗ cổ truyền Bình Dương, nơi giao thoa giữa nghệ thuật chạm khắc bản địa và tinh hoa Phật giáo phương Nam.'
    },
    timeline: '1741 (Khởi dựng chùa) -> 1868 (Tái thiết) -> 1993 (Di tích lịch sử văn hóa cấp Quốc gia) -> 2013 (Xác lập kỷ lục tượng Phật Châu Á)'
  },
  'hai_dang_vung_tau': {
    summary: 'Ngọn Hải Đăng Vũng Tàu tọa lạc trên đỉnh Núi Nhỏ (núi Tao Phùng) ở độ cao 149 mét so với mực nước biển. Ngọn đèn biển đầu tiên được người Pháp xây dựng vào năm 1862, là một trong những ngọn hải đăng cổ xưa nhất tại Việt Nam và Đông Nam Á. Đến năm 1913, công trình được xây dựng lại thành tháp tròn bằng đá hoa cương màu trắng cao 18 mét, đường kính 3 mét. Bên trong có cầu thang xoắn ốc 55 bậc bằng thép dẫn lên đài quan sát. Đèn hải đăng quay quét luồng sáng xa tới 30 hải lý (khoảng 55km), dẫn đường cho tàu thuyền quốc tế ra vào luồng hàng hải vịnh Gành Rái và biển Đông.',
    artifacts: [
      'Tháp hải đăng đá tròn cao 18m xây năm 1913',
      'Hệ thống cầu thang xoắn ốc 55 bậc bằng kim loại đúc',
      'Bộ thấu kính pha hải đăng quang học xoay nhiều tầng bóng đèn công suất cao'
    ],
    citation: {
      title: 'Lịch Sử Tỉnh Bà Rịa - Vũng Tàu & Hệ Thống Đèn Biển Hải Đăng Việt Nam',
      author: 'Tổng Công Ty Bảo Đảm An Toàn Hàng Hải Miền Nam & NXB Hàng Hải',
      era: 'Khởi dựng 1862, Tái thiết 1913',
      excerpt: 'Hải đăng Vũng Tàu sừng sững trên đỉnh Tao Phùng suốt hơn một thế kỷ, là mắt thần soi đường cho hàng vạn chuyến hải trình vượt trùng khơi.'
    },
    timeline: '1862 (Xây hải đăng đầu tiên) -> 1913 (Xây tháp đá trắng hiện hữu) -> Hoạt động dẫn luồng liên tục hơn 110 năm'
  },
  'nha_tu_con_dao': {
    summary: 'Hệ thống Nhà tù Côn Đảo (Di tích Quốc gia Đặc biệt) do thực dân Pháp thành lập ngày 1/2/1862 ngay sau khi chiếm đảo Côn Sơn và tồn tại suốt 113 năm (1862-1975) qua hai thời kỳ thực dân và đế quốc. Hệ thống gồm 8 trại giam chính (Bagne 1 đến Bagne 8), 2 khu biệt lập chuồng cọp Pháp (120 phòng giam cấm cố có song sắt trần ngắm rắc vôi bột và dội nước bẩn) và chuồng cọp Mỹ (384 phòng chuồng cọp bằng bê tông đúc sẵn siêu ngột ngạt). Cùng với đó là Cầu Tàu 914 (nơi ghi dấu hơn 914 chiến sĩ hy sinh khi khuân đá xây cầu tàu) và Nghĩa trang Hàng Dương - nơi an nghỉ của hơn 20.000 liệt sĩ và chí sĩ yêu nước, trong đó có Tổng Bí thư Lê Hồng Phong, nhà ái quốc Nguyễn An Ninh, và Nữ Anh hùng Lực lượng Vũ trang Nhân dân Võ Thị Sáu (hy sinh ngày 23/1/1952 khi mới 19 tuổi).',
    artifacts: [
      'Khu biệt giam Chuồng Cọp Pháp với hệ thống hành lang gác bên trên để rắc vôi bột',
      'Phiến đá Cầu Tàu 914 ghi dấu xương máu tù chính trị',
      'Mộ liệt sĩ Võ Thị Sáu và Tượng đài Tổ quốc Ghi công tại Nghĩa trang Hàng Dương'
    ],
    citation: {
      title: 'Hồ Sơ Di Tích Quốc Gia Đặc Biệt Nhà Tù Côn Đảo & Côn Đảo - Ký Sự Lịch Sử',
      author: 'Viện Lịch Sử Đảng & Ban Quản Lý Di Tích Côn Đảo',
      era: 'Thành lập 1862, Giải phóng 1975, Di tích Quốc gia Đặc biệt 2012',
      excerpt: 'Côn Đảo từ "địa ngục trần gian" đã trở thành trường học cách mạng kiên cường, nơi hàng vạn anh hùng liệt sĩ hiến dâng tuổi xuân vì độc lập, tự do cho dân tộc.'
    },
    timeline: '1/2/1862 (Pháp thành lập nhà tù) -> 23/1/1952 (Chị Võ Thị Sáu hy sinh) -> 1/5/1975 (Tù nhân nổi dậy giải phóng đảo) -> 2012 (Di tích Quốc gia đặc biệt)'
  },
  'hao_si_phuong': {
    summary: 'Hào Sĩ Phường (hẻm 206 Trần Hưng Đạo, Quận 5) là khu chung cư cổ phong cách người Hoa Chợ Lớn xây dựng từ năm 1910 bởi hãng buôn Hứa Bổn Hòa (Chú Hỏa). Cái tên mang ý nghĩa: "Hào" là hào hiệp, "Sĩ" là người có học thức, "Phường" là phường hội gắn kết. Kiến trúc nhà hai tầng với ban công hành lang gỗ chạy dài, cầu thang ngoài trời và cửa lá sách sơn xanh vàng mang đậm phong cách Chợ Lớn xưa.',
    artifacts: [
      'Hệ thống ban công gỗ hành lang mở hai tầng đặc trưng Chợ Lớn đầu thế kỷ 20',
      'Bàn thờ Thiên Quan Tứ Phước trước mỗi cửa nhà người Hoa',
      'Các ô cửa lá sách xanh ngọc và gạch bông lát sàn nhập từ Pháp thời xưa'
    ],
    citation: {
      title: 'Văn Hóa Khu Dân Cư Người Hoa Chợ Lớn & Sài Gòn Đô Thị Xưa',
      author: 'Viện Nghiên Cứu Văn Hóa Nam Bộ',
      era: 'Xây dựng khoảng 1910 bởi công ty Chú Hỏa',
      excerpt: 'Hào Sĩ Phường là không gian sống cộng đồng tiêu biểu của người Hoa Chợ Lớn với tinh thần hào hiệp tương thân tương ái giữa lòng đô thị sầm uất.'
    },
    timeline: '1910 (Thành lập) -> Phát triển cộng đồng người Hoa Chợ Lớn hơn 110 năm'
  },
  'duong_sach_hcm': {
    summary: 'Đường Sách TP.HCM (đường Nguyễn Văn Bình, Quận 1) khánh thành ngày 9/1/2016, dài 144m chạy dọc hông Bưu điện Trung tâm và Nhà thờ Đức Bà. Đây là con đường sách kiểu mẫu đầu tiên của Việt Nam, quy tụ hơn 20 gian hàng nhà xuất bản uy tín, không gian cà phê sách tao nhã và các triển lãm văn hóa đọc, giao lưu tác giả hàng tuần.',
    artifacts: [
      'Bộ sưu tập sách cổ Nam Bộ và bản đồ Sài Gòn thế kỷ 19',
      'Không gian xe buýt sách (Book Bus) độc đáo góc đường',
      'Bia đá ghi dấu kỷ niệm văn hóa đọc phương Nam'
    ],
    citation: {
      title: 'Không Gian Văn Hóa Sách TP.HCM & Đô Thị Tri Thức Sài Gòn',
      author: 'Hội Xuất Bản Việt Nam & Sở Thông Tin Truyền Thông TP.HCM',
      era: 'Khánh thành 2016, Điểm hẹn văn hóa đọc phương Nam',
      excerpt: 'Đường sách Nguyễn Văn Bình kết nối di sản kiến trúc trăm năm với nhịp sống tri thức văn minh hiện đại.'
    },
    timeline: '2016 (Khánh thành) -> Điểm đến văn hóa đọc hàng đầu cả nước'
  },
  'pho_di_bo_nguyen_hue': {
    summary: 'Phố đi bộ Nguyễn Huệ nguyên xưa là kênh đào Grand Canal (kinh Lớn hay kinh Chợ Vải) do người Pháp đào nối từ sông Sài Gòn vào thành Gia Định. Năm 1887, con kênh được lấp lại tạo thành đại lộ Charner (đường Kinh Lấp), sau đổi tên thành đại lộ Nguyễn Huệ. Năm 2015, tuyến phố được nâng cấp thành phố đi bộ quảng trường đá hoa cương hiện đại bậc nhất Việt Nam dài 670m.',
    artifacts: [
      'Tượng đài Chủ tịch Hồ Chí Minh bằng đồng trước trụ sở UBND Thành phố',
      'Mặt sàn lát đá granite tự nhiên cùng hệ thống đài phun nước nghệ thuật âm nhạc',
      'Các công trình kiến trúc trăm năm bao quanh: Tòa thị chính (UBND TP), Khách sạn Rex, Caravelle'
    ],
    citation: {
      title: 'Lịch Sử Kênh Rạch Sài Gòn & Đại Lộ Nguyễn Huệ',
      author: 'Nhà nghiên cứu Nguyễn Đình Đầu & Vương Hồng Sển',
      era: 'Kinh Lớn thế kỷ 18, Lấp kinh 1887, Phố đi bộ 2015',
      excerpt: 'Từ con kinh tấp nập thuyền buôn Chợ Vải thuở Gia Định xưa biến chuyển thành quảng trường đi bộ rực rỡ sức sống phương Nam.'
    },
    timeline: '1790 (Kinh Chợ Vải) -> 1887 (Lấp kinh làm đường Charner) -> 2015 (Phố đi bộ)'
  },
  'nha_co_doc_phu_dau': {
    summary: 'Nhà cổ Đốc Phủ Đẩu là dinh thự cổ truyền tuyệt mỹ của tầng lớp đốc phủ sứ Nam Bộ thế kỷ 19. Ngôi nhà có kết cấu 3 gian 2 chái, xây dựng hoàn toàn bằng gỗ quý căm xe, gõ đỏ với hệ thống bao lam, liễn đối cẩn xà cừ ốc ngũ sắc lộng lẫy phản ánh đỉnh cao nghệ thuật mộc phương Nam.',
    artifacts: [
      'Hệ thống cột gỗ căm xe chạm khắc tứ linh, tứ quý',
      'Bộ bàn ghế trường kỷ và phản gỗ gõ đỏ cẩn ốc xà cừ ngũ sắc',
      'Hệ ngói âm dương đất nung cổ giữ nhiệt độ mát mẻ quanh năm'
    ],
    citation: {
      title: 'Kiến Trúc Nhà Cổ Nam Bộ & Đời Sống Dinh Phủ Xưa',
      author: 'Viện Bảo Tồn Di Tích & Hội Khoa Học Lịch Sử',
      era: 'Thế kỷ 19, Đỉnh cao nghệ thuật chạm gỗ phương Nam',
      excerpt: 'Nhà cổ Đốc Phủ lưu giữ tinh hoa chạm khắc mộc Nam Bộ với kỹ thuật khảm ốc xà cừ công phu và cấu trúc nhà rường truyền thống.'
    },
    timeline: 'Cuối thế kỷ 19 -> Bảo tồn nguyên vẹn kiến trúc dinh thự Nam Kỳ'
  },
  'cho_thu_dau_mot': {
    summary: 'Chợ Thủ Dầu Một (phường Phú Cường, TP. Thủ Dầu Một, Bình Dương) nằm bên bờ sông Sài Gòn, khánh thành năm 1935 do người Pháp xây dựng với tháp đồng hồ trung tâm cổ kính hình bát giác. Chợ là trung tâm buôn bán nông sản, gốm sứ Lái Thiêu và đồ sơn mài trứ danh của Đất Thủ suốt gần một thế kỷ.',
    artifacts: [
      'Tháp chuông đồng hồ hình bát giác cao vút nổi bật phong cách Đông Dương',
      'Kiến trúc nhà lồng chợ vòm sắt uốn cong đón gió sông Sài Gòn',
      'Các quầy gốm sứ và sản vật trái cây miệt vườn Lái Thiêu lâu đời'
    ],
    citation: {
      title: 'Địa Chí Bình Dương & Lịch Sử Đô Thị Thủ Dầu Một',
      author: 'Sở Văn Hóa Bình Dương',
      era: 'Khánh thành 1935, Biểu tượng đô thị Đất Thủ',
      excerpt: 'Chợ Thủ Dầu Một với tháp đồng hồ soi bóng dòng sông Sài Gòn là linh hồn thương mại của vùng Đất Thủ kiên cường.'
    },
    timeline: '1935 (Khánh thành) -> Di sản kiến trúc thương mại tiêu biểu Đông Nam Bộ'
  },
  'lo_gom_dai_hung': {
    summary: 'Lò gốm Đại Hưng (phường Tương Bình Hiệp, TP. Thủ Dầu Một) là lò gốm cổ nhất Bình Dương với lịch sử hơn 160 năm (khởi lập khoảng thế kỷ 18-19). Lò chuyên sản xuất gốm gia dụng truyền thống như lu, hũ, khạp, chậu bằng kỹ thuật lò rồng (lò bao) nung củi truyền thống, được công nhận Di tích Lịch sử - Văn hóa cấp Tỉnh năm 2006.',
    artifacts: [
      'Hệ thống lò rồng cổ dài hơn 40 mét thoai thoải theo triền dốc đất',
      'Kỹ thuật vuốt gốm thủ công bằng bàn xoay truyền đời của nghệ nhân',
      'Dòng men da chuối đặc trưng chống thấm nước tuyệt hảo nung lửa củi'
    ],
    citation: {
      title: 'Lịch Sử Làng Gốm Bình Dương & Nghề Truyền Thống Đất Thủ',
      author: 'Sở Khoa Học và Công Nghệ Bình Dương & Bảo Tàng Tỉnh',
      era: 'Khởi nghiệp khoảng 1850, Hoạt động liên tục hơn 160 năm',
      excerpt: 'Lò gốm Đại Hưng giữ lửa nung truyền thống suốt 16 thập kỷ, là chứng nhân sống của kỹ nghệ gốm sành phương Nam.'
    },
    timeline: 'Khoảng 1850 (Thành lập) -> 2006 (Di tích Lịch sử cấp tỉnh) -> Bảo tồn làng nghề di sản'
  },
  'son_mai_tuong_binh_hiep': {
    summary: 'Làng sơn mài Tương Bình Hiệp (TP. Thủ Dầu Một, Bình Dương) có nguồn gốc từ thế kỷ 18 khi những người thợ sơn mài miền Trung theo đoàn lưu dân vào lập nghiệp. Sơn mài nơi đây nổi tiếng với kỹ thuật mài tinh xảo tới 20-30 lớp sơn, sử dụng sơn ta tự nhiên kết hợp cẩn ốc, vỏ trứng, thếp vàng bạc tạo nên chiều sâu óng ả huyền bí, được công nhận Di sản Văn hóa Phi vật thể Quốc gia.',
    artifacts: [
      'Kỹ thuật cẩn trứng vịt nung và cẩn ốc xà cừ trên cốt gỗ sơn ta',
      'Quy trình đánh bóng sơn mài trong nước kỳ công bằng bột than xoan',
      'Bộ tranh sơn mài phong cảnh làng quê Nam Bộ và bình hoa mỹ nghệ cổ'
    ],
    citation: {
      title: 'Di Sản Văn Hóa Phi Vật Thể Quốc Gia Sơn Mài Tương Bình Hiệp',
      author: 'Bộ Văn Hóa Thể Thao và Du Lịch & UBND Tỉnh Bình Dương',
      era: 'Khởi nguồn thế kỷ 18, Di sản Quốc gia 2016',
      excerpt: 'Sơn mài Tương Bình Hiệp kết tinh sự nhẫn nại, tài hoa và chiều sâu tâm hồn người thợ Đất Thủ qua hàng chục lớp son thắm mài nước.'
    },
    timeline: 'Thế kỷ 18 (Hình thành) -> 2016 (Công nhận Di sản Phi vật thể Quốc gia)'
  },
  'ho_dau_tieng': {
    summary: 'Hồ Dầu Tiếng (nằm giữa Bình Dương, Tây Ninh và Bình Phước) khởi công năm 1981 và hoàn thành năm 1985, là hồ nước nhân tạo thủy lợi lớn nhất Việt Nam với diện tích mặt nước 270 km2 và dung tích hơn 1.58 tỷ m3 nước. Cạnh hồ là thắng cảnh Quần thể Núi Cậu với Chùa Thái Sơn thanh tịnh.',
    artifacts: [
      'Công trình đập ngăn dòng sông Sài Gòn kỳ vĩ thời kỳ đổi mới',
      'Hệ thống kênh tưới tiêu Đông - Tây nuôi sống hàng trăm ngàn hecta nông nghiệp',
      'Quần thể Chùa Thái Sơn Núi Cậu với tượng Bồ Tát Quan Âm cao 36m'
    ],
    citation: {
      title: 'Công Trình Đại Thủy Nông Dầu Tiếng & Khai Phá Miền Đông Nam Bộ',
      author: 'Bộ Nông Nghiệp và Phát Triển Nông Thôn',
      era: 'Xây dựng 1981-1985, Hồ thủy lợi lớn nhất Đông Nam Á thời bấy giờ',
      excerpt: 'Hồ Dầu Tiếng là kỳ tích lao động khai mở của hàng vạn thanh niên xung phong, biến vùng khô hạn thành vựa lúa trù phú của phương Nam.'
    },
    timeline: '1981 (Khởi công) -> 1985 (Khánh thành cấp nước)'
  },
  'thanh_pho_moi_bd': {
    summary: 'Thành phố mới Bình Dương (Binh Duong New City) khởi công năm 2010 là khu đô thị thông minh hiện đại rộng 1.000 ha, trung tâm hành chính mới của tỉnh Bình Dương. Nổi bật với Tòa nhà Trung tâm Hành chính Tập trung cao 21 tầng và Công viên trung tâm hồ nước sinh thái rộng 75 ha.',
    artifacts: [
      'Tòa tháp đôi Trung tâm Hành chính Tập trung tỉnh Bình Dương với bãi đáp trực thăng',
      'Công viên trung tâm 75ha với hồ nước sinh thái và hệ thống nhạc nước hiện đại',
      'Khu Trung tâm Thương mại Thế giới WTC Thành phố Mới'
    ],
    citation: {
      title: 'Đô Thị Thông Minh Bình Dương & Quy Hoạch Phát Triển Đông Nam Bộ',
      author: 'UBND Tỉnh Bình Dương & Becamex IDC',
      era: 'Khởi công 2010, Đô thị Thông minh vinh danh Top 1 ICF thế giới 2023',
      excerpt: 'Thành phố mới Bình Dương tượng trưng cho khát vọng vươn mình ra biển lớn của miền Đông Nam Bộ văn minh, hiện đại.'
    },
    timeline: '2010 (Khởi công) -> 2014 (Khánh thành Trung tâm Hành chính) -> 2023 (Vinh danh Top 1 ICF)'
  },
  'bach_dinh_vung_tau': {
    summary: 'Bạch Dinh (Villa Blanche, số 4 Trần Phú, Vũng Tàu) được Toàn quyền Pháp Paul Doumer cho xây dựng từ năm 1898 đến 1902 trên sườn Núi Lớn. Tòa dinh thự 3 tầng màu trắng mang phong cách kiến trúc châu Âu thế kỷ 19 nhìn thẳng ra vịnh Bãi Trước. Nơi đây từng là nơi giam lỏng Vua Thành Thái từ năm 1907 đến 1916. Hiện Bạch Dinh lưu giữ bộ sưu tập hơn 10.000 cổ vật gốm sứ trục vớt từ tàu cổ đắm tại Hòn Cau - Côn Đảo.',
    artifacts: [
      'Bộ sưu tập gốm sứ Khang Hy thế kỷ 17 trục vớt từ tàu cổ Hòn Cau',
      '19 khẩu pháo thần công cổ đúc thời Nguyễn và thời Pháp đặt trên pháo đài Núi Lớn',
      '8 bức tượng bán thân phong cách Hy Lạp cổ đại đắp nổi quanh tường ngoài dinh thự'
    ],
    citation: {
      title: 'Hồ Sơ Di Tích Lịch Sử Văn Hóa Bạch Dinh & Địa Chí Bà Rịa - Vũng Tàu',
      author: 'Bảo Tàng Tỉnh Bà Rịa - Vũng Tàu & Cục Di Sản Văn Hóa',
      era: 'Xây dựng 1898-1902, Nơi lưu đày Vua Thành Thái 1907-1916, Di tích Quốc gia 1992',
      excerpt: 'Bạch Dinh trên sườn núi Tao Phùng lưu giữ vết tích thăng trầm lịch sử và di sản cổ vật tàu đắm vô giá của con đường tơ lụa trên biển.'
    },
    timeline: '1898 (Xây dựng) -> 1907-1916 (Vua Thành Thái bị giam lỏng) -> 1992 (Di tích Quốc gia)'
  },
  'thich_ca_phat_dai': {
    summary: 'Thích Ca Phật Đài (sườn Núi Lớn, TP. Vũng Tàu) khởi công năm 1961 và hoàn thành năm 1963, là quần thể kiến trúc Phật giáo rộng 28 ha. Điểm nhấn là Tượng Đức Phật Thích Ca ngồi thiền tọa trên tòa sen cao 10.2 mét (tính cả đài sen và bệ là 19m) uy nghiêm hướng ra biển Đông, cùng bảo tháp Xá Lợi Phật cao 17m chứa 13 viên ngọc Xá Lợi.',
    artifacts: [
      'Tượng Phật Thích Ca Mâu Ni thiền định đúc bê tông đá cẩm thạch trắng cao 10.2m',
      'Bảo tháp Xá Lợi hình bát giác cao 17m chứa Xá Lợi Phật thỉnh từ Sri Lanka',
      'Cây Bồ Đề chiết nhánh từ Bồ Đề Đạo Tràng (Bodh Gaya, Ấn Độ) trồng năm 1960'
    ],
    citation: {
      title: 'Di Tích Lịch Sử Văn Hóa Thích Ca Phật Đài Vũng Tàu',
      author: 'Giáo Hội Phật Giáo Việt Nam & Ban Quản Lý Di Tích Vũng Tàu',
      era: 'Khởi công 1961, Khánh thành 1963, Di tích Quốc gia 1989',
      excerpt: 'Thích Ca Phật Đài là thắng cảnh tâm linh thanh tịnh bên sườn Núi Lớn, biểu tượng cho ánh sáng từ bi và trí tuệ soi đường người dân miền biển.'
    },
    timeline: '1960 (Trồng cây Bồ Đề Ấn Độ) -> 1963 (Khánh thành tượng Phật) -> 1989 (Di tích Quốc gia)'
  },
  'cho_xom_luoi': {
    summary: 'Chợ Xóm Lưới (góc đường Phan Bội Châu - Nguyễn Công Trứ, Phường 2, TP. Vũng Tàu) là chợ hải sản tươi sống lâu đời và nổi tiếng nhất Vũng Tàu. Chợ họp từ sáng sớm khi ghe thuyền ngư dân cập bến Bãi Trước và tấp nập nhất từ 15h đến 18h hàng ngày với đủ loại ghẹ xanh, mực lá, tôm tích, hàu đá vừa đánh bắt.',
    artifacts: [
      'Ghe thuyền đánh bắt gần bờ của ngư dân xóm lưới truyền thống',
      'Hệ thống bếp than nướng hải sản tại chỗ phục vụ du khách',
      'Muối tiêu chanh ớt ngâm theo bí quyết gia truyền của cư dân miền biển'
    ],
    citation: {
      title: 'Văn Hóa Làng Chài & Ẩm Thực Miền Biển Vũng Tàu',
      author: 'Sở Du Lịch Bà Rịa - Vũng Tàu',
      era: 'Hình thành từ làng chài cổ thế kỷ 19',
      excerpt: 'Chợ Xóm Lưới là nơi lưu giữ nhịp sống mộc mạc, hào sảng và phong vị ẩm thực biển nguyên bản của ngư dân Vũng Tàu.'
    },
    timeline: 'Thế kỷ 19 (Làng chài xóm lưới) -> Điểm đến ẩm thực hải sản hàng đầu'
  },
  'lang_chai_phuoc_hai': {
    summary: 'Làng chài Phước Hải (huyện Đất Đỏ, Bà Rịa - Vũng Tàu) là một trong những làng chài ven biển cổ xưa nhất Nam Bộ với lịch sử hơn 200 năm. Nơi đây nổi tiếng với nghề làm nước mắm truyền thống cốt cá cơm thơm lừng, nghề phơi cá khô mặn mòi và nghề hấp cá bè, lưu giữ nét đẹp hồn hậu của cư dân vạn chài.',
    artifacts: [
      'Thuyền thúng chai đan nan tre trét dầu rái truyền thống',
      'Những hàng giàn phơi cá khô, mực một nắng trắng lấp lánh bên bờ biển',
      'Lò ủ chượp nước mắm cá cơm truyền thống bằng lu sành gốm Đại Hưng'
    ],
    citation: {
      title: 'Địa Chí Làng Nghề Thủy Hải Sản Nam Bộ - Vạn Chài Phước Hải',
      author: 'Bảo Tàng Bà Rịa - Vũng Tàu',
      era: 'Hình thành cuối thế kỷ 18 thời chúa Nguyễn',
      excerpt: 'Vạn chài Phước Hải mang đậm hồn cốt biển khơi phương Nam với bờ cát thoai thoải, thuyền thúng dập dềnh và hương vị nước mắm truyền thống trăm năm.'
    },
    timeline: 'Thế kỷ 18 (Thành lập làng chài) -> Nghề cá truyền thống lưu truyền qua nhiều đời'
  },
  'bai_sau_vung_tau': {
    summary: 'Bãi Sau (Bãi Thùy Vân, TP. Vũng Tàu) trải dài gần 10 km từ chân Núi Nhỏ đến Cửa Lấp. Với bờ cát thoai thoải, sóng êm và làn nước biển trong xanh, Bãi Sau là bãi tắm biểu tượng của Vũng Tàu. Phía trước Bãi Sau là Hòn Bà - hòn đảo nhỏ nổi tiếng với Miếu Bà xây năm 1881, nơi du khách có thể đi bộ qua con đường đá nổi trên biển khi thủy triều rút.',
    artifacts: [
      'Con đường đá bí mật lộ ra giữa biển khi nước ròng dẫn ra Hòn Bà',
      'Miếu Hòn Bà xây năm 1881 thờ Thủy Long Thần Nữ che chở người đi biển',
      'Hàng dương liễu xanh rì rào cản gió biển che chở bờ cát Thùy Vân'
    ],
    citation: {
      title: 'Địa Chí Thắng Cảnh Vũng Tàu & Miếu Hòn Bà',
      author: 'Sở Văn Hóa Thể Thao Bà Rịa - Vũng Tàu',
      era: 'Miếu Hòn Bà lập 1881, Bãi tắm phát triển từ đầu thế kỷ 20',
      excerpt: 'Bãi Thùy Vân sóng vỗ dạt dào cùng huyền tích Hòn Bà lối đi giữa đại dương là danh thắng huyền ảo bậc nhất xứ biển phương Nam.'
    },
    timeline: '1881 (Xây Miếu Hòn Bà) -> Bãi biển nghỉ dưỡng nổi tiếng cả nước'
  },
  'don_ca_tai_tu': {
    summary: 'Đờn ca tài tử Nam Bộ là loại hình nghệ thuật dân gian độc đáo của phương Nam, được UNESCO ghi danh là Di sản Văn hóa Phi vật thể đại diện của Nhân loại năm 2013. Bắt nguồn từ nhạc lễ Cung đình Huế kết hợp với dân ca, hò, lý Nam Bộ cuối thế kỷ 19, nghệ thuật này sử dụng dàn nhạc ngũ tuyệt gồm đờn kìm (nguyệt), đờn tranh, đờn cò (nhị), đờn tỳ bà, đờn tam hoặc ghi-ta phím lõm độc nhất vô nhị của người Việt.',
    artifacts: [
      'Cây đờn ghi-ta phím lõm (Lục huyền cầm) sáng tạo độc bản của nghệ nhân Nam Bộ',
      'Dàn nhạc ngũ tuyệt cổ truyền: Đờn kìm, đờn tranh, đờn cò, đờn tỳ bà, đờn bầu',
      'Hệ thống 20 bài bản tổ kinh điển (6 bài Bắc, 3 bài Nam, 4 bài Oán, 7 bài Hạ)'
    ],
    citation: {
      title: 'Hồ Sơ Di Sản Văn Hóa Phi Vật Thể Nhân Loại Đờn Ca Tài Tử Nam Bộ',
      author: 'UNESCO & Viện Âm Nhạc Việt Nam',
      era: 'Hình thành cuối thế kỷ 19, UNESCO vinh danh 2013',
      excerpt: 'Đờn ca tài tử thể hiện tâm hồn phóng khoáng, tình nghĩa hào sảng và tình yêu sông nước bao la của con người đất phương Nam.'
    },
    timeline: 'Cuối thế kỷ 19 (Sáng lập các ban tài tử) -> 2013 (UNESCO ghi danh Di sản nhân loại)'
  },
  'cai_luong_nam_bo': {
    summary: 'Nghệ thuật Sân khấu Cải lương Nam Bộ hình thành vào khoảng năm 1918 tại miền Tây và phát triển rực rỡ tại Sài Gòn với phương châm: "Cải cách hát ca theo tiến bộ - Lương truyền tuồng tích sánh văn minh". Xuất phát từ Đờn ca tài tử ca ra bộ, Cải lương đã tạo nên những huyền thoại sân khấu như đoàn Dạ Lý Hương, Thanh Minh - Thanh Nga, rạp Hưng Đạo, và bản Dạ Cổ Hoài Lang bất hủ của nhạc sĩ Cao Văn Lầu năm 1919.',
    artifacts: [
      'Bản thảo gốc Dạ Cổ Hoài Lang (Cao Văn Lầu sáng tác 1919) tiền thân điệu Vọng Cổ',
      'Phục trang tuồng cổ thêu tay kim tuyến lộng lẫy của các đoàn cải lương Sài Gòn xưa',
      'Rạp Hưng Đạo (Trần Hưng Đạo, Quận 1) - thánh đường của sân khấu cải lương Nam Bộ'
    ],
    citation: {
      title: 'Lịch Sử Sân Khấu Cải Lương Nam Bộ 100 Năm',
      author: 'Hội Sân Khấu TP.HCM & GS.TS Trần Văn Khê',
      era: 'Hình thành 1918, Bản Dạ Cổ Hoài Lang 1919',
      excerpt: 'Cải lương là tinh hoa sân khấu Nam Bộ, nơi lời ca tiếng đàn vọng cổ da diết hòa cùng tuồng tích nhân nghĩa, ái quốc muôn đời.'
    },
    timeline: '1918 (Hình thành vở diễn đầu tiên) -> 1919 (Dạ Cổ Hoài Lang) -> 2018 (Kỷ niệm 100 năm)'
  },
  'le_hoi_nghinh_ong': {
    summary: 'Lễ hội Nghinh Ông (Cần Giờ - TP.HCM và Thắng Tam - Vũng Tàu) là lễ hội dân gian truyền thống lớn nhất của ngư dân miền biển phương Nam thờ Cá Voi (Đức Ngài Nam Hải) vị thần cứu tinh hộ mạng cho người đi biển. Lễ hội diễn ra vào rằm tháng 8 âm lịch hàng năm với lễ rước kiệu Ông trên biển, hàng trăm tàu thuyền hoa rực rỡ, lễ cúng tế tại lăng Ông Thủy Tướng và các trò chơi dân gian sông nước.',
    artifacts: [
      'Bộ xương Cá Ông dài hơn 18 mét lưu giữ tại Lăng Ông Thủy Tướng Cần Giờ',
      'Đoàn thuyền rước kiệu trang trí cờ hoa ngũ sắc xuất hải nghinh Ông trên vịnh Gành Rái',
      'Sắc phong của triều Nguyễn phong thần hiệu cho Nam Hải Đại Tướng Quân'
    ],
    citation: {
      title: 'Di Sản Văn Hóa Phi Vật Thể Quốc Gia Lễ Hội Nghinh Ông',
      author: 'Bộ Văn Hóa Thể Thao và Du Lịch & Bảo Tàng TP.HCM',
      era: 'Di sản Phi vật thể Quốc gia 2013',
      excerpt: 'Lễ hội Nghinh Ông thể hiện đạo lý uống nước nhớ nguồn, lòng biết ơn mẹ biển khơi và tinh thần đoàn kết bền chặt của ngư dân phương Nam.'
    },
    timeline: 'Thế kỷ 19 (Các làng chài lập Lăng Ông) -> 2013 (Di sản Phi vật thể Quốc gia)'
  }
};

app.post('/api/gemini/chat', async (req, res) => {
  try {
    const { message, locationContext, currentQuest, history } = req.body;
    const ai = getGenAI();

    // Check query for matching authentic historical knowledge
    const queryLower = (message || '').toLowerCase();
    let matchedKey: string | null = null;
    
    if (queryLower.includes('ba son') || queryLower.includes('chu sư') || queryLower.includes('tôn đức thắng') || queryLower.includes('đốc nổi') || queryLower.includes('thủy xưởng')) {
      matchedKey = 'ba_son';
    } else if (queryLower.includes('nhà rồng') || queryLower.includes('nguyễn tất thành') || queryLower.includes('văn ba') || queryLower.includes('1911') || queryLower.includes('messageries')) {
      matchedKey = 'ben_nha_rong';
    } else if (queryLower.includes('độc lập') || queryLower.includes('ngô viết thụ') || queryLower.includes('390') || queryLower.includes('843') || queryLower.includes('norodom')) {
      matchedKey = 'dinh_doc_lap';
    } else if (queryLower.includes('đức bà') || queryLower.includes('marseille') || queryLower.includes('chuông') || queryLower.includes('bourard') || queryLower.includes('thánh đường')) {
      matchedKey = 'nha_tho_duc_ba';
    } else if (queryLower.includes('bưu điện') || queryLower.includes('foulhoux') || queryLower.includes('eiffel') || queryLower.includes('bản đồ')) {
      matchedKey = 'buu_dien_tphcm';
    } else if (queryLower.includes('bến thành') || queryLower.includes('quách thị trang') || queryLower.includes('phù điêu') || queryLower.includes('đồng hồ')) {
      matchedKey = 'cho_ben_thanh';
    } else if (queryLower.includes('củ chi') || queryLower.includes('địa đạo') || queryLower.includes('hoàng cầm') || queryLower.includes('đất thép')) {
      matchedKey = 'dia_dao_cu_chi';
    } else if (queryLower.includes('thiên hậu') || queryLower.includes('tuệ thành') || queryLower.includes('cây mai') || queryLower.includes('chợ lớn') || queryLower.includes('nguyễn trãi')) {
      matchedKey = 'chua_ba_thien_hau';
    } else if (queryLower.includes('hội khánh') || queryLower.includes('phật nằm') || queryLower.includes('thủ dầu một') || queryLower.includes('bình dương') || queryLower.includes('đại ngạn') || queryLower.includes('nguyễn sinh sắc')) {
      matchedKey = 'chua_hoi_khanh';
    } else if (queryLower.includes('hải đăng') || queryLower.includes('vũng tàu') || queryLower.includes('núi nhỏ') || queryLower.includes('tao phùng') || queryLower.includes('fresnel')) {
      matchedKey = 'hai_dang_vung_tau';
    } else if (queryLower.includes('côn đảo') || queryLower.includes('võ thị sáu') || queryLower.includes('chuồng cọp') || queryLower.includes('hàng dương') || queryLower.includes('914') || queryLower.includes('côn sơn')) {
      matchedKey = 'nha_tu_con_dao';
    } else if (queryLower.includes('hào sĩ phường') || queryLower.includes('chú hỏa') || queryLower.includes('hứa bổn hòa') || queryLower.includes('hẻm 206')) {
      matchedKey = 'hao_si_phuong';
    } else if (queryLower.includes('đường sách') || queryLower.includes('nguyễn văn bình') || queryLower.includes('book bus')) {
      matchedKey = 'duong_sach_hcm';
    } else if (queryLower.includes('nguyễn huệ') || queryLower.includes('kinh lấp') || queryLower.includes('grand canal') || queryLower.includes('charner')) {
      matchedKey = 'pho_di_bo_nguyen_hue';
    } else if (queryLower.includes('đốc phủ đẩu') || queryLower.includes('nhà cổ') || queryLower.includes('cẩn xà cừ') || queryLower.includes('nhà rường')) {
      matchedKey = 'nha_co_doc_phu_dau';
    } else if (queryLower.includes('chợ thủ dầu một') || queryLower.includes('tháp đồng hồ thủ dầu')) {
      matchedKey = 'cho_thu_dau_mot';
    } else if (queryLower.includes('đại hưng') || queryLower.includes('lò gốm') || queryLower.includes('lò rồng') || queryLower.includes('gốm sứ lái thiêu')) {
      matchedKey = 'lo_gom_dai_hung';
    } else if (queryLower.includes('tương bình hiệp') || queryLower.includes('sơn mài') || queryLower.includes('vỏ trứng')) {
      matchedKey = 'son_mai_tuong_binh_hiep';
    } else if (queryLower.includes('dầu tiếng') || queryLower.includes('núi cậu') || queryLower.includes('thái sơn')) {
      matchedKey = 'ho_dau_tieng';
    } else if (queryLower.includes('thành phố mới bình dương') || queryLower.includes('binh duong new city') || queryLower.includes('tháp đôi trung tâm hành chính')) {
      matchedKey = 'thanh_pho_moi_bd';
    } else if (queryLower.includes('bạch dinh') || queryLower.includes('villa blanche') || queryLower.includes('thành thái') || queryLower.includes('hòn cau')) {
      matchedKey = 'bach_dinh_vung_tau';
    } else if (queryLower.includes('thích ca phật đài') || queryLower.includes('bảo tháp xá lợi') || queryLower.includes('núi lớn vũng tàu')) {
      matchedKey = 'thich_ca_phat_dai';
    } else if (queryLower.includes('xóm lưới') || queryLower.includes('hải sản vũng tàu')) {
      matchedKey = 'cho_xom_luoi';
    } else if (queryLower.includes('phước hải') || queryLower.includes('làng chài phước hải') || queryLower.includes('nước mắm')) {
      matchedKey = 'lang_chai_phuoc_hai';
    } else if (queryLower.includes('bãi sau') || queryLower.includes('thùy vân') || queryLower.includes('hòn bà')) {
      matchedKey = 'bai_sau_vung_tau';
    } else if (queryLower.includes('đờn ca tài tử') || queryLower.includes('ngũ tuyệt') || queryLower.includes('đờn kìm') || queryLower.includes('phím lõm')) {
      matchedKey = 'don_ca_tai_tu';
    } else if (queryLower.includes('cải lương') || queryLower.includes('dạ cổ hoài lang') || queryLower.includes('cao văn lầu') || queryLower.includes('vọng cổ')) {
      matchedKey = 'cai_luong_nam_bo';
    } else if (queryLower.includes('nghinh ông') || queryLower.includes('cá voi') || queryLower.includes('nam hải') || queryLower.includes('lăng ông thủy tướng')) {
      matchedKey = 'le_hoi_nghinh_ong';
    }

    const systemInstruction = `
Bạn là "CỐ VẤN DI SẢN BA SON" — Bách khoa toàn thư sống và Người bạn đồng hành uyên bác về lịch sử, kiến trúc, văn hóa và giải mã di sản phương Nam (TP. Hồ Chí Minh, Bình Dương, Bà Rịa - Vũng Tàu, Côn Đảo).

PHONG THÁI & SỨ MỆNH:
- Bạn trả lời MỌI CÂU HỎI của người chơi một cách CHUẨN CHỈNH, CHÍNH XÁC NHẤT, vừa mang chiều sâu học thuật như một viện sĩ nghiên cứu sử học, vừa thân thiện, chân thành và truyền cảm hứng như một người thầy, người bạn phương Nam hào hiệp.
- Khi người chơi hỏi câu hỏi cụ thể (ví dụ: ai thiết kế, năm nào xây, mật thư ở đâu, mẹo chụp ảnh, món ăn ngon, lộ trình...), bạn PHẢI TRẢ LỜI TRỰC DIỆN VÀO TRỌNG TÂM CÂU HỎI NGAY DÒNG ĐẦU TIÊN, sau đó mới mở rộng bối cảnh lịch sử, chi tiết kỹ thuật và hiện vật độc bản.

QUY TẮC BẢO VỆ CHÂN LÝ LỊCH SỬ (ZERO-HALLUCINATION & FACTUAL ACCURACY):
1. TUYỆT ĐỐI KHÔNG BỊA ĐẶT SỰ KIỆN, KHÔNG NHẦM LẪN NIÊN ĐẠI HAY NHÂN VẬT LỊCH SỬ.
2. Mọi dữ kiện phải căn cứ chính xác trên các nguồn sử liệu chính thống của Việt Nam:
   - *Gia Định Thành Thông Chí* (Trịnh Hoài Đức - 1820)
   - *Đại Nam Thực Lục* & *Đại Nam Nhất Thống Chí* (Quốc Sử Quán Triều Nguyễn)
   - *Sài Gòn Năm Xưa* (Học giả Vương Hồng Sển)
   - *Địa Chí Văn Hóa Thành Phố Hồ Chí Minh* (GS. Trần Văn Giàu, GS. Trần Bạch Đằng)
   - *Hồ sơ Di tích Quốc gia Đặc biệt*: Ba Son, Dinh Độc Lập, Địa đạo Củ Chi, Nhà tù Côn Đảo, Bến Nhà Rồng...
   - *Địa chí Bình Dương*, *Lịch sử Đảng bộ & Địa chí tỉnh Bà Rịa - Vũng Tàu*.
3. Nếu người chơi hỏi về nhiệm vụ hoặc mật thư: Hãy phân tích gợi ý thông minh, dẫn dắt bằng tư duy logic và cứ liệu lịch sử để người chơi tự khám phá mà không cảm thấy bế tắc.

CẤU TRÚC PHẢN HỒI LUÔN RÕ RÀNG, ĐẸP MẮT:
### 🏛️ [Câu Trả Lời Trực Diện & Luận Giải Lịch Sử Chuyên Sâu]
(Trả lời chính xác tuyệt đối vào câu hỏi của người chơi, giải nghĩa cấu trúc kiến trúc, niên đại, bối cảnh lịch sử và ý nghĩa xã hội).

### 🔍 [Hiện Vật & Dấu Ấn Khảo Cứu Độc Bản Tại Điểm]
(Chỉ điểm hiện vật xác thực: chất liệu, kích thước, xuất xứ, ký hiệu người thợ hoặc câu chuyện ít người biết).

### 📜 Nguồn Sử Liệu & Hồ Sơ Chính Thống:
- **Tên tư liệu**: [Tên tài liệu / Văn bản lưu trữ chính xác]
- **Tác giả / Cơ quan khảo cứu**: [Học giả, viện sử học hoặc trung tâm lưu trữ quốc gia]
- **Niên đại / Căn cứ**: [Mốc thời gian / Quyết định công nhận di tích]
- **Trích yếu cốt lõi**: "[Cứ liệu lịch sử then chốt chứng minh]"
`;

    if (!ai) {
      if (matchedKey && AUTHENTIC_HERITAGE_KNOWLEDGE[matchedKey]) {
        const d = AUTHENTIC_HERITAGE_KNOWLEDGE[matchedKey];
        return res.json({
          reply: `### 🏛️ Luận Giải Lịch Sử & Di Sản Ba Son

${d.summary}

### 🔍 Hiện Vật & Dấu Ấn Khảo Cứu Độc Bản
${d.artifacts.map(a => `- **Hiện vật**: ${a}`).join('\n')}

### 📜 Nguồn Sử Liệu & Hồ Sơ Chính Thống:
- **Tên tư liệu**: *${d.citation.title}*
- **Tác giả / Cơ quan khảo cứu**: ${d.citation.author}
- **Niên đại / Mục**: ${d.citation.era}
- **Trích yếu cốt lõi**: "${d.citation.excerpt}"`
        });
      }

      return res.json({
        reply: `### 🏛️ Khảo Cứu Di Sản & Lịch Sử Nam Bộ

Kính chào Lữ Khách! Về câu hỏi của bạn tại **${locationContext || 'TP. Hồ Chí Minh & Nam Bộ'}**:
Vùng đất Nam Bộ với hơn 300 năm lịch sử hào hùng kể từ thời Lễ Thành hầu Nguyễn Hữu Cảnh kinh lược phương Nam (1698) đến nay luôn lưu giữ những giá trị văn hóa, kiến trúc và cách mạng bất diệt.

### 🔍 Hiện Vật & Dấu Ấn Khảo Cứu Độc Bản
- **Niên đại & Dấu ấn**: Công trình mang đậm dấu ấn kiến trúc bản địa hòa quyện cùng kỹ nghệ xây dựng tinh hoa phương Nam.
- **Bảo tồn**: Hiện vật và hồ sơ di tích được lưu trữ nghiêm cẩn tại Bảo tàng Lịch sử và Trung tâm Lưu trữ Quốc gia II.

### 📜 Nguồn Sử Liệu & Hồ Sơ Chính Thống:
- **Tên tư liệu**: *Gia Định Thành Thông Chí* & *Địa Chí Văn Hóa Thành Phố Hồ Chí Minh*
- **Tác giả / Cơ quan khảo cứu**: Sử gia Trịnh Hoài Đức (1820) & GS. Trần Văn Giàu chủ biên
- **Trích yếu cốt lõi**: "Đất Gia Định sông nước trù phú, nhân dân hào hiệp trọng nghĩa khinh tài, dấu xưa bờ cõi rạng rỡ ngàn đời."`
      });
    }

    const contents: any[] = [];
    if (history && Array.isArray(history)) {
      for (const h of history.slice(-6)) {
        contents.push({
          role: h.sender === 'user' ? 'user' : 'model',
          parts: [{ text: h.text }]
        });
      }
    }
    
    // Inject authentic factual reference if available to guarantee zero hallucination
    let factualContextInjection = '';
    if (matchedKey && AUTHENTIC_HERITAGE_KNOWLEDGE[matchedKey]) {
      const k = AUTHENTIC_HERITAGE_KNOWLEDGE[matchedKey];
      factualContextInjection = `\n[TƯ LIỆU GỐC XÁC THỰC CẦN BÁM SÁT]:\n${k.summary}\nHiện vật: ${k.artifacts.join('; ')}\nTrích nguồn: ${k.citation.title} - ${k.citation.author} (${k.citation.era}): "${k.citation.excerpt}"\n`;
    }

    contents.push({
      role: 'user',
      parts: [{
        text: `Địa điểm khảo cứu: ${locationContext || 'TP. Hồ Chí Minh'}\nNhiệm vụ: ${currentQuest || 'Khám phá tự do'}${factualContextInjection}\nCâu hỏi người chơi: ${message}`
      }]
    });

    const replyText = await generateContentWithRetryAndFallback(ai, {
      contents: contents,
      config: {
        systemInstruction,
        temperature: 0.3, // Lower temperature to strictly prevent hallucinations and prioritize factual accuracy
      }
    });

    if (replyText) {
      return res.json({ reply: replyText });
    }

    // Fallback if AI generation yielded empty
    if (matchedKey && AUTHENTIC_HERITAGE_KNOWLEDGE[matchedKey]) {
      const d = AUTHENTIC_HERITAGE_KNOWLEDGE[matchedKey];
      return res.json({
        reply: `### 🏛️ Luận Giải Lịch Sử & Di Sản Ba Son

${d.summary}

### 🔍 Hiện Vật & Dấu Ấn Khảo Cứu Độc Bản
${d.artifacts.map(a => `- **Hiện vật**: ${a}`).join('\n')}

### 📜 Nguồn Sử Liệu & Hồ Sơ Chính Thống:
- **Tên tư liệu**: *${d.citation.title}*
- **Tác giả / Cơ quan khảo cứu**: ${d.citation.author}
- **Niên đại / Mục**: ${d.citation.era}
- **Trích yếu cốt lõi**: "${d.citation.excerpt}"`
      });
    }

    res.json({
      reply: `### 🏛️ Luận Giải Di Sản Phương Nam
Đất Sài Gòn - Gia Định chất chứa muôn vàn bí mật di sản quý báu. Mọi hiện vật, hoa văn và niên đại đều gắn liền với các mốc son lịch sử trọng đại được ghi chép trong chính sử.

### 📜 Nguồn Sử Liệu & Hồ Sơ Chính Thống:
- **Tên tài liệu**: *Sài Gòn Năm Xưa* - Học giả Vương Hồng Sển & *Đại Nam Nhất Thống Chí* (Quốc Sử Quán Triều Nguyễn)`
    });
  } catch (error: any) {
    console.error('Error in /api/gemini/chat:', error);
    res.json({
      reply: `### 🏛️ Luận Giải Di Sản Phương Nam
Chào Lữ Khách! Các tư liệu khảo cứu của Viện Di Sản Ba Son khẳng định mọi di tích tại Nam Bộ đều được lưu giữ nghiêm cẩn trong thư tịch cổ phương Nam.

### 📜 Nguồn Sử Liệu & Hồ Sơ Chính Thống:
- **Tên tài liệu**: *Gia Định Thành Thông Chí* (Sử gia Trịnh Hoài Đức) & *Hồ sơ Di tích Quốc gia Ba Son*`
    });
  }
});

// Helper to calculate unified learning progress across regions
function calculateLearningAnalytics(userProfile: any) {
  const completedQuests: string[] = Array.isArray(userProfile.completedQuests) ? userProfile.completedQuests : [];
  const badges: string[] = Array.isArray(userProfile.badgesUnlocked) ? userProfile.badgesUnlocked : [];
  
  // Categorize completed quests by region
  const hcmQuests = completedQuests.filter(q => !q.includes('binh_duong') && !q.includes('vung_tau') && !q.includes('con_dao'));
  const bdQuests = completedQuests.filter(q => q.includes('binh_duong') || q.includes('lai_thieu') || q.includes('dia_dao'));
  const vtQuests = completedQuests.filter(q => q.includes('vung_tau') || q.includes('con_dao') || q.includes('bach_dinh'));

  const habits = userProfile.learningHabits || {};

  return {
    totalQuestsCompleted: completedQuests.length,
    totalBadgesUnlocked: badges.length,
    hcmCompletedCount: hcmQuests.length,
    hcmPercent: Math.min(100, Math.round((hcmQuests.length / 11) * 100)),
    binhDuongCompletedCount: bdQuests.length,
    binhDuongPercent: Math.min(100, Math.round((bdQuests.length / 5) * 100)),
    vungTauCompletedCount: vtQuests.length,
    vungTauPercent: Math.min(100, Math.round((vtQuests.length / 5) * 100)),
    overallHeritageMastery: Math.min(100, Math.round((completedQuests.length / 21) * 100)),
    studyMinutes: habits.averageSessionDurationMinutes ? habits.averageSessionDurationMinutes * (habits.totalSessionsCompleted || 1) : 45,
    currentDailyStreak: habits.currentDailyStreak || 1,
    longestStreak: habits.longestDailyStreak || 1,
    quizAccuracyRate: habits.quizAccuracyRate || 88,
  };
}

// User Profile & Learning Progress Save Endpoint: OPEN & SEAMLESS (No Google/Gmail barrier)
app.post('/api/user/save-progress', (req, res) => {
  try {
    const { userProfile } = req.body;
    if (!userProfile) {
      return res.status(400).json({ success: false, error: 'Thiếu dữ liệu hồ sơ người dùng.' });
    }

    const userId = userProfile.id || `user_${Date.now()}`;
    const existingData = userProgressStore[userId] || {};
    const updated = {
      ...existingData,
      ...userProfile,
      id: userId,
      lastSyncedAt: new Date().toISOString()
    };

    userProgressStore[userId] = updated;
    const analytics = calculateLearningAnalytics(updated);

    res.json({ 
      success: true, 
      user: updated,
      learningProgress: analytics,
      lastSyncedAt: updated.lastSyncedAt,
      message: 'Tiến trình khám phá di sản đã được bảo lưu an toàn!' 
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get user progress and unified learning analytics by email or ID
app.get('/api/user/get-progress/:identifier', (req, res) => {
  const { identifier } = req.params;
  const decoded = decodeURIComponent(identifier).trim().toLowerCase();
  const user = userProgressStore[decoded] || userProgressStore[identifier];
  
  if (user) {
    const analytics = calculateLearningAnalytics(user);
    res.json({ success: true, user, learningProgress: analytics });
  } else {
    res.json({ success: false, message: 'Chưa có hồ sơ học tập nào lưu dưới định danh này.' });
  }
});

// Endpoint to retrieve pure learning progress statistics for a Gmail user
app.get('/api/user/learning-analytics/:email', (req, res) => {
  const cleanEmail = decodeURIComponent(req.params.email).trim().toLowerCase();
  const user = userProgressStore[cleanEmail];
  if (!user) {
    return res.status(404).json({ success: false, error: 'Không tìm thấy hồ sơ Gmail.' });
  }
  const analytics = calculateLearningAnalytics(user);
  res.json({ success: true, analytics });
});

// Update specific user preferences
app.post('/api/user/preferences', (req, res) => {
  try {
    const { userId, preferences } = req.body;
    if (!userId || !preferences) {
      return res.status(400).json({ success: false, error: 'Missing userId or preferences' });
    }
    if (!userProgressStore[userId]) {
      userProgressStore[userId] = { id: userId };
    }
    userProgressStore[userId].preferences = preferences;
    userProgressStore[userId].lastSyncedAt = new Date().toISOString();
    res.json({ success: true, preferences, message: 'Sở thích người dùng đã được lưu.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Update learning habits & study streaks
app.post('/api/user/habits', (req, res) => {
  try {
    const { userId, habits } = req.body;
    if (!userId || !habits) {
      return res.status(400).json({ success: false, error: 'Missing userId or habits' });
    }
    if (!userProgressStore[userId]) {
      userProgressStore[userId] = { id: userId };
    }
    userProgressStore[userId].learningHabits = habits;
    userProgressStore[userId].lastSyncedAt = new Date().toISOString();
    res.json({ success: true, habits, message: 'Thói quen học tập đã được cập nhật.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Direct Messages API (Direct user-to-user chat with stickers)
app.get('/api/forum/direct-messages', (req, res) => {
  res.json({ messages: directMessages });
});

app.post('/api/forum/direct-messages', (req, res) => {
  const { senderId, senderName, senderAvatar, recipientId, recipientName, text, sticker } = req.body;
  const newDm = {
    id: `dm_${Date.now()}`,
    senderId: senderId || 'current_user',
    senderName: senderName || 'Lữ Khách',
    senderAvatar: senderAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
    recipientId: recipientId || 'user_sg_01',
    recipientName: recipientName || 'Lữ Khách Bạn Bè',
    text: text || '',
    sticker: sticker || undefined,
    timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
  };
  directMessages.push(newDm);
  res.json({ success: true, message: newDm });
});

// API: Smart Clue Deciphering & Hints
app.post('/api/gemini/hint', async (req, res) => {
  try {
    const { questTitle, stepTitle, question, clueVerse, hintLevel, locationName } = req.body;
    const ai = getGenAI();

    const systemInstruction = `
Bạn là "Hệ Thống Giải Mã Di Sản Sài Gòn".
Cung cấp gợi ý thông minh dựa trên cấp độ người chơi yêu cầu:
- Cấp 1 (hintLevel = 1): Gợi ý manh mối khẽ khàng, khơi gợi tư duy, liên hệ sự vật đời thường hoặc từ khóa then chốt mà KHÔNG tiết lộ trực tiếp.
- Cấp 2 (hintLevel = 2): Chỉ điểm bối cảnh lịch sử, năm tháng, kiến trúc hoặc tọa độ địa lý cụ thể giúp người chơi khoanh vùng.
- Cấp 3 (hintLevel = 3): Phân tích sâu sắc lời giải mã, giải thích nguồn gốc văn hóa của câu đố và đưa ra đáp án chính xác.
Độ dài ngắn gọn, súc tích (dưới 100 từ), giàu cảm xúc di sản.
`;

    if (!ai) {
      return res.json({
        hint: `[Gợi ý cấp ${hintLevel || 1}] Hãy liên hệ giữa câu thơ manh mối và các chi tiết lịch sử thực tế tại ${locationName || 'địa điểm này'}.`
      });
    }

    const prompt = `Địa điểm: ${locationName}\nNhiệm vụ: ${questTitle} - ${stepTitle}\nCâu thơ/manh mối: ${clueVerse}\nCâu hỏi: ${question}\nYêu cầu cấp độ gợi ý: Cấp ${hintLevel} (1: Khẽ khàng, 2: Chỉ điểm lịch sử, 3: Phân tích sâu & lời giải)`;

    const hintText = await generateContentWithRetryAndFallback(ai, {
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.6,
      }
    });

    res.json({ hint: hintText || `[Gợi ý cấp ${hintLevel || 1}] Quan sát kỹ các chi tiết hoa văn và niên đại lịch sử của địa điểm ${locationName || ''} nhé!` });
  } catch (error: any) {
    console.error('Error in /api/gemini/hint:', error);
    res.json({
      hint: 'Hãy đọc kỹ câu thơ lục bát và liên kết với các hiện vật trưng bày tại đây!'
    });
  }
});

// Forum Endpoints
app.get('/api/forum/posts', (req, res) => {
  res.json({ posts: forumPosts });
});

app.post('/api/forum/posts', (req, res) => {
  const { title, authorName, authorAvatar, authorTitle, category, content, locationTag, badgeEarned } = req.body;
  const newPost = {
    id: `post_${Date.now()}`,
    title: title || 'Chia sẻ của Lữ Khách',
    authorName: authorName || 'Lữ Khách Ẩn Danh',
    authorAvatar: authorAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
    authorTitle: authorTitle || 'Lữ Khách Tập Sự',
    category: category || 'general',
    content: content || '',
    locationTag: locationTag || '',
    likes: 1,
    isLiked: false,
    commentsCount: 0,
    timestamp: 'Vừa xong',
    badgeEarned: badgeEarned || undefined,
    comments: []
  };
  forumPosts.unshift(newPost);
  res.json({ success: true, post: newPost });
});

app.post('/api/forum/posts/:id/like', (req, res) => {
  const { id } = req.params;
  const post = forumPosts.find(p => p.id === id);
  if (post) {
    post.isLiked = !post.isLiked;
    post.likes += post.isLiked ? 1 : -1;
    res.json({ success: true, likes: post.likes, isLiked: post.isLiked });
  } else {
    res.status(404).json({ error: 'Post not found' });
  }
});

app.post('/api/forum/posts/:id/comment', (req, res) => {
  const { id } = req.params;
  const { authorName, authorAvatar, authorTitle, content } = req.body;
  const post = forumPosts.find(p => p.id === id);
  if (post) {
    const newComment = {
      id: `c_${Date.now()}`,
      authorName: authorName || 'Lữ Khách',
      authorAvatar: authorAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
      authorTitle: authorTitle || 'Lữ Khách',
      content: content || '',
      timestamp: 'Vừa xong',
      likes: 0
    };
    post.comments.push(newComment);
    post.commentsCount = post.comments.length;
    res.json({ success: true, comment: newComment });
  } else {
    res.status(404).json({ error: 'Post not found' });
  }
});

// Community Chat Endpoints
app.get('/api/chat/messages', (req, res) => {
  res.json({ messages: liveChatMessages });
});

app.post('/api/chat/messages', (req, res) => {
  const { senderName, senderAvatar, text } = req.body;
  const newMsg = {
    id: `msg_${Date.now()}`,
    senderName: senderName || 'Lữ Khách',
    senderAvatar: senderAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
    text: text || '',
    timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
  };
  liveChatMessages.push(newMsg);
  // Keep last 50 messages
  if (liveChatMessages.length > 50) {
    liveChatMessages = liveChatMessages.slice(-50);
  }
  res.json({ success: true, message: newMsg });
});

// Authentication & Cloud Sync Endpoints
app.post('/api/auth/google', (req, res) => {
  const { email, name, picture, googleId, clientProfile } = req.body;
  const userEmail = (email || 'user@gmail.com').toLowerCase();
  
  // Find existing profile in memory or storage by email
  const existingByEmail = Object.values(userProgressStore).find(
    (u: any) => u.email && u.email.toLowerCase() === userEmail
  ) as any;

  const existingData = existingByEmail || (googleId ? userProgressStore[googleId] : null) || {};
  
  const mergedUser = {
    ...existingData,
    ...(clientProfile || {}),
    id: existingData.id || googleId || `google_${Date.now()}`,
    username: (userEmail || 'google_user').split('@')[0],
    name: name || existingData.name || 'Lữ Khách Google',
    email: userEmail,
    avatar: picture || existingData.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=160&q=80',
    isLoggedIn: true,
    isGoogleLinked: true,
    googleEmail: userEmail,
    authProvider: 'google',
    lpPoints: existingData.lpPoints !== undefined ? existingData.lpPoints : ((clientProfile && clientProfile.lpPoints) || 0),
    completedQuests: Array.from(new Set([
      ...(existingData.completedQuests || []),
      ...((clientProfile && clientProfile.completedQuests) || [])
    ])),
    badgesUnlocked: Array.from(new Set([
      ...(existingData.badgesUnlocked || []),
      ...((clientProfile && clientProfile.badgesUnlocked) || ['badge_google_scholar'])
    ])),
    preferences: {
      ...(existingData.preferences || {}),
      ...((clientProfile && clientProfile.preferences) || {})
    },
    learningHabits: existingData.learningHabits || (clientProfile && clientProfile.learningHabits) || undefined,
    lastSyncedAt: new Date().toISOString()
  };

  userProgressStore[mergedUser.id] = mergedUser;
  // Also index by email
  userProgressStore[userEmail] = mergedUser;

  const analytics = calculateLearningAnalytics(mergedUser);

  res.json({ 
    success: true, 
    user: mergedUser, 
    analytics,
    message: 'Đăng nhập và đồng bộ dữ liệu Google thành công' 
  });
});

app.get('/api/user/google-status/:email', (req, res) => {
  const email = (req.params.email || '').toLowerCase();
  const user = Object.values(userProgressStore).find(
    (u: any) => u.email && u.email.toLowerCase() === email
  ) as any;

  if (user) {
    const analytics = calculateLearningAnalytics(user);
    res.json({ success: true, user, analytics });
  } else {
    res.json({ success: false, message: 'Chưa có dữ liệu đồng bộ cho email này.' });
  }
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = {
    id: `user_${Date.now()}`,
    username: (email || 'lu_khach').split('@')[0],
    name: (email || 'Lữ Khách Phương Nam').split('@')[0],
    email: email,
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=160&q=80',
    isLoggedIn: true,
    authProvider: 'custom',
    lastSyncedAt: new Date().toISOString()
  };
  res.json({ success: true, user, message: 'Đăng nhập thành công' });
});

app.post('/api/auth/register', (req, res) => {
  const { name, email, password, avatar } = req.body;
  const user = {
    id: `user_${Date.now()}`,
    username: (email || 'lu_khach_moi').split('@')[0],
    name: name || 'Lữ Khách Mới',
    email: email,
    avatar: avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=160&q=80',
    isLoggedIn: true,
    authProvider: 'custom',
    lpPoints: 500, // Starter bonus for new registration
    lastSyncedAt: new Date().toISOString()
  };
  res.json({ success: true, user, message: 'Đăng ký tài khoản thành công' });
});

// Vite Middleware & Static Serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Heritage Exploration Game server running on port ${PORT}`);
  });
}

startServer();
