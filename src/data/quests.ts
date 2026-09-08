import { Quest, QuestStep, KnowledgeTier } from '../types';
import { QUESTS_PART_1 } from './quests/chapter1_to_5';
import { QUESTS_PART_2 } from './quests/chapter6_to_10';
import { QUESTS_PART_3 } from './quests/chapter11_to_15';
import { QUESTS_PART_4 } from './quests/chapter16_to_21';
import { EXTRA_QUEST_STEPS } from './questQuestionsBank';
import { LOCATIONS } from './locations';

// Generate tailored deep-learning questions based on location metadata if a quest has fewer than 20 questions
function generateSupplementaryQuestions(quest: Quest, neededCount: number): QuestStep[] {
  const loc = LOCATIONS.find(l => l.id === quest.locationId);
  const locName = loc?.vietnameseName || loc?.name || quest.title;
  const startIdx = (quest.steps || []).length + 1;
  const generated: QuestStep[] = [];
  const builtYear = loc?.builtYear || 'thế kỷ 19';
  const district = loc?.district || 'Khu vực trung tâm';
  const province = loc?.province || 'TP. Hồ Chí Minh';

  const questionTemplates = [
    // TẬP 1: DỄ - NHẬP MÔN NHẬN BIẾT (Tier 1: Basic)
    {
      title: `Nhận diện địa bàn & Tọa độ di sản`,
      tier: 'basic' as KnowledgeTier,
      tierTitle: 'Cơ Bản: Địa Bàn Tọa Độ',
      bonusLP: 20,
      storyPrompt: `Xác định tọa độ hành chính và khu vực tọa lạc của di tích ${locName}:`,
      clueVerse: `Đất phương Nam ngàn trùng sông nước,\nTìm dấu xưa soi tỏ lối về.`,
      puzzleType: 'multiple_choice' as const,
      puzzleData: {
        question: `Di tích ${locName} hiện nay tọa lạc tại địa phương nào?`,
        options: [
          `${district}, ${province}`,
          `Quận Hoàn Kiếm, TP. Hà Nội`,
          `Thành phố Đà Lạt, Lâm Đồng`,
          `Thành phố Huế, Thừa Thiên Huế`
        ],
        correctAnswer: `${district}, ${province}`,
        explanation: `${locName} nằm tại khu vực ${district}, thuộc ${province}.`,
        hintLevel1: 'Tra cứu tỉnh/thành phố của địa danh này trên bản đồ Nam Bộ.',
        hintLevel2: `Thuộc vùng quản lý của ${province}.`,
        hintLevel3: `Chọn đáp án: ${district}, ${province}.`
      }
    },
    {
      title: `Nhận định Đúng/Sai về vai trò lịch sử`,
      tier: 'basic' as KnowledgeTier,
      tierTitle: 'Cơ Bản: Đúng / Sai Lịch Sử',
      bonusLP: 20,
      storyPrompt: `Kiểm tra hiểu biết ban đầu về giá trị di sản của ${locName}:`,
      clueVerse: `Bia đá nghìn năm ghi tấc dạ,\nLời xưa truyền mãi sáng ngàn thu.`,
      puzzleType: 'true_false' as const,
      puzzleData: {
        question: `Đúng hay Sai: ${locName} là một trong những công trình / di tích lịch sử văn hóa tiêu biểu, phản ánh đậm nét quá trình hình thành và phát triển của vùng đất Nam Bộ?`,
        options: ['Đúng', 'Sai'],
        correctAnswer: 'Đúng',
        explanation: `Chính xác! ${locName} lưu giữ các dấu ấn lịch sử, văn hóa và kiến trúc vô giá của Nam Bộ qua nhiều thời kỳ.`,
        hintLevel1: 'Xem xét vai trò di sản văn hóa của địa danh đối với vùng đất Phương Nam.',
        hintLevel2: 'Đây là di tích được trân trọng gìn giữ qua nhiều thế hệ.',
        hintLevel3: 'Chọn ĐÚNG.'
      }
    },
    {
      title: `Điền từ ca dao & Lời ca Nam Bộ`,
      tier: 'basic' as KnowledgeTier,
      tierTitle: 'Cơ Bản: Điền Từ Khuyết',
      bonusLP: 25,
      storyPrompt: `Khôi phục từ còn thiếu trong câu ngâm vịnh về vẻ đẹp bền bỉ của ${locName}:`,
      clueVerse: `Trăm năm vững chãi bia truyền,\nNon sông gấm vóc đất hiền phương Nam.`,
      puzzleType: 'fill_blank' as const,
      puzzleData: {
        question: `Hãy điền từ còn thiếu vào câu truyền miệng về di sản Nam Bộ: "Đến ${locName}, ngắm bóng dáng trăm năm rạng rỡ đất Phương [...]" (Gợi ý: 3 chữ cái, chỉ hướng phương Nam)`,
        correctAnswer: 'Nam',
        options: ['Nam', 'Bắc', 'Tây', 'Đông'],
        keywords: ['nam', 'phương nam'],
        explanation: `Từ cần điền là "Nam" - mảnh đất Phương Nam địa linh nhân kiệt nơi ${locName} trường tồn.`,
        hintLevel1: 'Chỉ phương hướng của dải đất Nam Bộ hiền hòa.',
        hintLevel2: 'Từ gồm 3 chữ cái: N - A - M.',
        hintLevel3: 'Đáp án chính xác là: Nam.'
      }
    },

    // TẬP 2: TRUNG BÌNH - THÔNG HIỂU & KẾT CẤU (Tier 2: Intermediate)
    {
      title: `Kỹ nghệ kiến trúc và vật liệu xây dựng`,
      tier: 'intermediate' as KnowledgeTier,
      tierTitle: 'Thông Hiểu: Nghệ Thuật Kiến Trúc',
      bonusLP: 30,
      storyPrompt: `Khám phá nghệ thuật bài trí không gian và vật liệu đặc trưng tại ${locName}:`,
      clueVerse: `Bàn tay thợ khéo dựng nên,\nTrăm năm vững chãi bia truyền ngàn thu.`,
      puzzleType: 'multiple_choice' as const,
      puzzleData: {
        question: `Nét đặc sắc nổi bật nhất trong kết cấu và phong cách kiến trúc của ${locName} là gì?`,
        options: [
          loc?.architecturalHighlights?.[0] || `Sự kết hợp tinh tế giữa phong cách kiến trúc bản địa Nam Bộ và kỹ nghệ điêu khắc truyền thống`,
          `Sử dụng toàn bộ vách ngăn kính cường lực hiện đại thời 4.0`,
          `Mô phỏng kiến trúc lều tuyết Bắc Cực`,
          `Kết cấu thép tiền chế công nghiệp không chạm khắc`
        ],
        correctAnswer: loc?.architecturalHighlights?.[0] || `Sự kết hợp tinh tế giữa phong cách kiến trúc bản địa Nam Bộ và kỹ nghệ điêu khắc truyền thống`,
        explanation: `Đặc điểm kiến trúc: ${loc?.architecturalHighlights?.join('; ') || loc?.shortDesc || 'Đậm đà phong vị phương Nam'}.`,
        hintLevel1: 'Để ý các yếu tố hoa văn chạm trổ, ngói lợp và vật liệu tự nhiên.',
        hintLevel2: 'Công trình gắn liền với bàn tay tài hoa của những nghệ nhân xưa.',
        hintLevel3: `Chọn: ${loc?.architecturalHighlights?.[0] || 'Sự kết hợp tinh tế...'}`
      }
    },
    {
      title: `Giải mã mật mã niên đại lịch sử`,
      tier: 'intermediate' as KnowledgeTier,
      tierTitle: 'Thông Hiểu: Mật Mã Niên Đại',
      bonusLP: 35,
      storyPrompt: `Giải mã con số niên đại khởi dựng hoặc phát triển rực rỡ của ${locName}:`,
      clueVerse: `Chữ số ngàn năm ẩn bóng hình,\nSoi vào sử sách sáng lung linh.`,
      puzzleType: 'cipher_text' as const,
      puzzleData: {
        question: `Giải mã niên đại lịch sử: Gợi ý mật mã cho biết công trình gắn liền với mốc thời gian [ ${builtYear} ]. Hãy nhập chính xác con số hoặc thế kỷ lịch sử này:`,
        correctAnswer: String(builtYear),
        keywords: [String(builtYear), '19', '20', '18'],
        explanation: `Niên đại gắn liền với ${locName} là ${builtYear}, đánh dấu mốc son trong lịch sử phát triển đô thị và văn hóa Nam Bộ.`,
        hintLevel1: 'Xem mốc thời gian ghi trong thông tin di tích.',
        hintLevel2: `Mốc lịch sử: ${builtYear}.`,
        hintLevel3: `Nhập chính xác: ${builtYear}.`
      }
    },
    {
      title: `Sắp xếp trình tự khảo cứu di sản`,
      tier: 'intermediate' as KnowledgeTier,
      tierTitle: 'Thông Hiểu: Dòng Thời Gian',
      bonusLP: 35,
      storyPrompt: `Sắp xếp các bước tìm hiểu và bảo tồn di tích ${locName} theo đúng trình tự khoa học:`,
      clueVerse: `Trước sau lớp lang rành rành,\nSử xưa tỏ tường ngọn ngành trước sau.`,
      puzzleType: 'ordering' as const,
      puzzleData: {
        question: `Sắp xếp các bước khảo cứu di sản ${locName} theo thứ tự chuẩn xác: (A) Quan sát kiến trúc tổng thể -> (B) Tra cứu văn bia & lịch sử -> (C) Trải nghiệm không gian thực địa -> (D) Lan tỏa giá trị di sản. Nhập thứ tự đúng các chữ cái (ví dụ: A B C D hoặc A, B, C, D):`,
        options: [
          'A: Quan sát kiến trúc tổng thể',
          'B: Tra cứu văn bia & lịch sử',
          'C: Trải nghiệm không gian thực địa',
          'D: Lan tỏa giá trị di sản'
        ],
        correctAnswer: 'A B C D',
        keywords: ['a b c d', 'abcd', 'a, b, c, d', 'a-b-c-d'],
        explanation: `Trình tự nghiên cứu di sản chuẩn mực: Khảo sát tổng thể (A) -> Tìm hiểu tư liệu văn bia lịch sử (B) -> Trải nghiệm tương tác thực địa (C) -> Đúc kết và lan tỏa (D).`,
        hintLevel1: 'Bắt đầu từ cái nhìn tổng quát đến chi tiết và lan tỏa.',
        hintLevel2: 'Thứ tự bảng chữ cái A B C D.',
        hintLevel3: 'Nhập: A B C D.'
      }
    },

    // TẬP 3: KHÓ - VẬN DỤNG & SỰ KIỆN LỊCH SỬ (Tier 3: Advanced)
    {
      title: `Bí ẩn và sự kiện lịch sử đặc biệt`,
      tier: 'advanced' as KnowledgeTier,
      tierTitle: 'Vận Dụng: Sự Kiện Lịch Sử',
      bonusLP: 40,
      storyPrompt: `Khám phá giai thoại và chiều sâu ý nghĩa của ${locName}:`,
      clueVerse: `Ký ức ngàn năm còn vẹn nguyên,\nKhói hương lan tỏa bóng con thuyền.`,
      puzzleType: 'multiple_choice' as const,
      puzzleData: {
        question: `Điểm độc đáo hoặc giai thoại văn hóa đặc biệt nhất gắn liền với ${locName} là gì?`,
        options: [
          loc?.secretFunFact || `Công trình lưu giữ những bảo vật, cổ vật và câu chuyện nhân văn sâu sắc của các bậc tiền hiền`,
          `Từng được sử dụng làm sân bay vũ trụ thế kỷ trước`,
          `Được di chuyển toàn bộ bằng đường hàng không từ châu Âu về`,
          `Chưa từng mở cửa cho người dân sinh hoạt văn hóa`
        ],
        correctAnswer: loc?.secretFunFact || `Công trình lưu giữ những bảo vật, cổ vật và câu chuyện nhân văn sâu sắc của các bậc tiền hiền`,
        explanation: `Giai thoại và nét độc đáo: ${loc?.secretFunFact || loc?.culturalSignificance || 'Minh chứng sống động cho bản sắc cộng đồng Nam Bộ'}.`,
        hintLevel1: 'Gắn liền với tín ngưỡng, công đức tiền hiền và lòng tri ân nguồn cội.',
        hintLevel2: 'Lưu giữ những giá trị nhân văn và cổ vật quý hiếm.',
        hintLevel3: `Chọn: ${loc?.secretFunFact || 'Công trình lưu giữ những bảo vật...'}`
      }
    },
    {
      title: `Điền từ khuyết trong diễn từ di sản`,
      tier: 'advanced' as KnowledgeTier,
      tierTitle: 'Vận Dụng: Điền Khuyết Di Sản',
      bonusLP: 40,
      storyPrompt: `Điền từ khóa phản ánh hồn cốt tinh thần bảo tồn của ${locName}:`,
      clueVerse: `Non sông nghìn thuở lưu danh,\nNgười sau tiếp bước lòng thành khắc sâu.`,
      puzzleType: 'fill_blank' as const,
      puzzleData: {
        question: `Điền từ còn thiếu: "${locName} là biểu tượng thiêng liêng của tinh thần yêu nước và [...] di sản văn hóa dân tộc." (Gợi ý: từ gồm 6 chữ cái bắt đầu bằng chữ B, chỉ việc giữ gìn)`,
        correctAnswer: 'bảo tồn',
        options: ['bảo tồn', 'phát triển', 'xây dựng', 'quảng bá'],
        keywords: ['bảo tồn', 'bao ton'],
        explanation: `Từ cần điền là "bảo tồn" - sứ mệnh gìn giữ nguyên trạng và phát huy giá trị di sản cho muôn đời sau.`,
        hintLevel1: 'Hành động giữ gìn không để mai một giá trị cổ truyền.',
        hintLevel2: 'Từ gồm 2 âm tiết: "bảo tồn".',
        hintLevel3: 'Nhập từ: bảo tồn.'
      }
    },
    {
      title: `Giải mã mật mã văn bia khảo cổ`,
      tier: 'advanced' as KnowledgeTier,
      tierTitle: 'Vận Dụng: Mật Mã Khảo Cổ',
      bonusLP: 45,
      storyPrompt: `Phân tích mật mã thư tịch liên quan đến địa danh:`,
      clueVerse: `Chữ xưa nắn nót trên bia,\nNgàn năm soi tỏ chẳng hề phôi pha.`,
      puzzleType: 'cipher_text' as const,
      puzzleData: {
        question: `Giải mã ký tự mật thư cổ: "D-I-A-S-A-N-N-A-M-B-O". Hãy ghép thành cụm từ tiếng Việt không dấu hoặc có dấu (4 từ) nói về tinh hoa vùng đất này:`,
        correctAnswer: 'Di sản Nam Bộ',
        keywords: ['di san nam bo', 'di sản nam bộ', 'disannambo'],
        explanation: `Cụm từ giải mã chính xác là "Di sản Nam Bộ" - dòng chảy lịch sử văn hóa xuyên suốt nơi ${locName} tỏa sáng.`,
        hintLevel1: 'Ghép các chữ cái thành 4 từ quen thuộc của ứng dụng.',
        hintLevel2: 'D-I-A S-A-N  N-A-M  B-O.',
        hintLevel3: 'Nhập: Di sản Nam Bộ.'
      }
    },

    // TẬP 4: ĐẠI SƯ - KHẢO CỨU CHUYÊN SÂU & BẢO TỒN SỐ (Tier 4: Master)
    {
      title: `Sứ mệnh số hóa 3D/AI và bảo tồn di sản bền vững`,
      tier: 'master' as KnowledgeTier,
      tierTitle: 'Đại Sư: Bảo Tồn Kỷ Nguyên Số',
      bonusLP: 50,
      storyPrompt: `Định hướng bảo tồn tương lai cho ${locName} trong kỷ nguyên công nghệ 2026:`,
      clueVerse: `Nối dòng di sản hôm nay,\nCho đời sau mãi dựng xây cơ đồ.`,
      puzzleType: 'multiple_choice' as const,
      puzzleData: {
        question: `Phương thức bảo tồn tối ưu nhất đối với ${locName} kết hợp công nghệ hiện đại là:`,
        options: [
          'Ứng dụng số hóa 3D/AR, tích hợp AI tra cứu tư liệu, bảo tồn nghiêm ngặt cấu trúc nguyên bản và đưa di sản vào giáo dục cộng đồng',
          'Đập bỏ toàn bộ các công trình cũ để thay bằng trung tâm thương mại',
          'Khóa kín di tích, không cho các nhà nghiên cứu hay người trẻ tiếp cận',
          'Xóa bỏ tư liệu lịch sử truyền miệng để viết lại theo phong cách viễn tưởng'
        ],
        correctAnswer: 'Ứng dụng số hóa 3D/AR, tích hợp AI tra cứu tư liệu, bảo tồn nghiêm ngặt cấu trúc nguyên bản và đưa di sản vào giáo dục cộng đồng',
        explanation: 'Sự kết hợp giữa bảo tồn di sản vật thể nguyên trạng và số hóa 3D/AR, AI tương tác giúp di sản trường tồn và tiếp cận hàng triệu bạn trẻ thế hệ tương lai.',
        hintLevel1: 'Xem xét vai trò của công nghệ số hóa và bảo vệ di sản nguyên bản.',
        hintLevel2: 'Ứng dụng công nghệ 3D/AR và giáo dục cộng đồng.',
        hintLevel3: 'Chọn đáp án: Ứng dụng số hóa 3D/AR, tích hợp AI tra cứu...'
      }
    },
    {
      title: `Tự luận học giả: Đúc kết giá trị cốt lõi`,
      tier: 'master' as KnowledgeTier,
      tierTitle: 'Đại Sư: Tự Luận Học Giả',
      bonusLP: 50,
      storyPrompt: `Đúc kết ngắn gọn giá trị tinh thần lớn nhất mà ${locName} mang lại cho các thế hệ:`,
      clueVerse: `Hồn thiêng đất Việt muôn đời,\nLời thề non nước rạng ngời mai sau.`,
      puzzleType: 'open_ended' as const,
      puzzleData: {
        question: `Theo góc nhìn khảo cứu di sản, giá trị lớn nhất mà ${locName} đóng góp cho văn hóa dân tộc là gì? (Hãy trả lời có chứa từ khóa: lịch sử, văn hóa hoặc tự hào)`,
        correctAnswer: 'Giá trị lịch sử, văn hóa và lòng tự hào dân tộc',
        keywords: ['lịch sử', 'văn hóa', 'tự hào', 'di sản', 'nam bộ', 'kien truc', 'lich su', 'van hoa', 'tu hao'],
        explanation: `${locName} là pho sử sống động, kết tinh giá trị lịch sử kiên cường, bản sắc văn hóa độc đáo và hun đúc lòng tự hào dân tộc cho mọi thế hệ người Việt.`,
        hintLevel1: 'Nêu lên ý nghĩa lịch sử, văn hóa hoặc tinh thần tự hào dân tộc.',
        hintLevel2: 'Câu trả lời cần chứa các từ khóa: lịch sử, văn hóa hoặc tự hào.',
        hintLevel3: 'Gợi ý câu trả lời: Giá trị lịch sử, văn hóa và lòng tự hào dân tộc.'
      }
    }
  ];

  for (let i = 0; i < neededCount; i++) {
    const tmpl = questionTemplates[i % questionTemplates.length];
    const stepNum = startIdx + i;
    generated.push({
      id: `${quest.id}_gen_step_${stepNum}`,
      title: `${tmpl.title} (Chặng ${stepNum})`,
      tier: tmpl.tier,
      tierTitle: tmpl.tierTitle,
      bonusLP: tmpl.bonusLP,
      storyPrompt: tmpl.storyPrompt,
      clueVerse: tmpl.clueVerse,
      puzzleType: tmpl.puzzleType,
      puzzleData: {
        ...tmpl.puzzleData,
        question: tmpl.puzzleData.question
      }
    });
  }

  return generated;
}

// Ensure every single quest in the application has AT LEAST 20 comprehensive questions
const RAW_QUESTS: Quest[] = [
  ...QUESTS_PART_1,
  ...QUESTS_PART_2,
  ...QUESTS_PART_3,
  ...QUESTS_PART_4
];

export const QUESTS: Quest[] = RAW_QUESTS.map(quest => {
  let existingSteps = [...(quest.steps || [])];

  // 1. Add extra handmade questions if in bank
  if (EXTRA_QUEST_STEPS[quest.id]) {
    const extra = EXTRA_QUEST_STEPS[quest.id];
    // Add steps not already included
    extra.forEach(exStep => {
      if (!existingSteps.some(s => s.id === exStep.id)) {
        existingSteps.push(exStep);
      }
    });
  }

  // 2. Guarantee MINIMUM 20 questions for every single quest!
  const MIN_QUESTIONS = 20;
  if (existingSteps.length < MIN_QUESTIONS) {
    const needed = MIN_QUESTIONS - existingSteps.length;
    const supp = generateSupplementaryQuestions(quest, needed);
    existingSteps = [...existingSteps, ...supp];
  }

  // 3. Sort strictly by difficulty progression (Dễ -> Trung Bình -> Khó -> Đại Sư)
  const tierWeights: Record<KnowledgeTier, number> = {
    basic: 1,
    intermediate: 2,
    advanced: 3,
    master: 4
  };

  // Sort and re-index steps from easy to hard
  existingSteps.sort((a, b) => {
    const wA = tierWeights[a.tier || 'basic'] || 1;
    const wB = tierWeights[b.tier || 'basic'] || 1;
    return wA - wB;
  });

  // Enforce proper Tier classification and clear numbering for all 20+ steps
  const enrichedSteps = existingSteps.map((step, idx) => {
    const ratio = idx / Math.max(1, existingSteps.length - 1);
    let tier: KnowledgeTier = 'basic';
    let tierTitle = 'Tier 1: Nhập Môn Nhận Biết (Dễ)';

    if (ratio < 0.25) {
      tier = 'basic';
      tierTitle = 'Tier 1: Nhập Môn Nhận Biết (Dễ)';
    } else if (ratio < 0.55) {
      tier = 'intermediate';
      tierTitle = 'Tier 2: Thông Hiểu & Kết Cấu (Trung Bình)';
    } else if (ratio < 0.85) {
      tier = 'advanced';
      tierTitle = 'Tier 3: Vận Dụng & Sự Kiện (Khó)';
    } else {
      tier = 'master';
      tierTitle = 'Tier 4: Đại Sư Di Sản Phương Nam (Kỳ Công)';
    }

    return {
      ...step,
      tier,
      tierTitle
    };
  });

  return {
    ...quest,
    steps: enrichedSteps,
    rewardLP: Math.max(quest.rewardLP, 450),
    estimatedMinutes: Math.max(quest.estimatedMinutes || 20, 25)
  };
});

export default QUESTS;
