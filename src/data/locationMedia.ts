import { AITourVideo, HistoricalNarration } from '../types';

export const LOCATION_MEDIA_MAP: Record<string, { aiTourVideo: AITourVideo; historicalNarrations: HistoricalNarration[] }> = {
  loc_ben_nha_rong: {
    aiTourVideo: {
      title: 'Tour Flycam AI 4K: Bến Nhà Rồng & Dòng Sông Sài Gòn Lịch Sử',
      subtitle: 'Khám phá ngã ba sông Sài Gòn, kiến trúc Lưỡng Long Chầu Nguyệt và dấu ấn Người thanh niên Nguyễn Tất Thành 1911',
      duration: '02:30',
      resolution: '4K Ultra HD (60fps)',
      droneAlt: '120m AGL',
      voiceGuide: 'Thuyết Minh AI Giọng Nam Bộ Ấm Áp',
      scenes: [
        {
          id: 'scene_bnr_1',
          name: '1. Góc Nhìn Flycam: Ngã Ba Sông Sài Gòn & Kênh Bến Nghé',
          timeCode: '00:00 - 00:38',
          cameraMode: 'aerial_drone',
          cameraLabel: 'Flycam Drone 120m',
          description: 'Flycam lượn từ sông Sài Gòn bao quát ngã ba kênh Tàu Hủ - Bến Nghé, hướng thẳng về đôi rồng xanh uy nghi trên mái ngói.',
          narratorVoiceover: 'Từ trên cao, Bến Nhà Rồng hiện lên sừng sững bên ngã ba sông Sài Gòn lộng gió. Được xây dựng từ năm 1863 bởi hãng Messageries Maritimes, nơi đây từng là trái tim thương cảng viễn đông sầm uất.',
          visualHighlight: 'Mái ngói âm dương đỏ son hòa cùng sóng nước sông Sài Gòn lấp lánh ánh mai.'
        },
        {
          id: 'scene_bnr_2',
          name: '2. Cận Cảnh Đôi Rồng Gốm Men Châu Mặt Trăng',
          timeCode: '00:38 - 01:15',
          cameraMode: 'ground_360',
          cameraLabel: 'Cận Cảnh 360° Kiến Trúc',
          description: 'Ống kính quét cận chi tiết đôi rồng đất nung tráng men xanh ngọc ngậm châu chầu nguyệt tinh xảo trên nóc tòa nhà.',
          narratorVoiceover: 'Điểm nhấn kiến trúc độc bản chính là cặp rồng đất nung tráng men ngọc bích châu đầu vào mặt trăng, tạo nên tên gọi dân gian Bến Nhà Rồng bất tử suốt hơn một thế kỷ.',
          visualHighlight: 'Chi tiết vảy rồng men ngọc và phù điêu vòm cửa kiểu Pháp nhiệt đới.'
        },
        {
          id: 'scene_bnr_3',
          name: '3. Tái Hiện Lịch Sử: Ngày 5 Tháng 6 Năm 1911',
          timeCode: '01:15 - 01:52',
          cameraMode: 'historical_reconstruction',
          cameraLabel: 'Tái Hiện Không Gian 1911',
          description: 'Mô phỏng không gian bến cảng năm 1911 với con tàu Đô đốc Latouche-Tréville kéo còi xuất bến ra biển Đông.',
          narratorVoiceover: 'Ngày 5 tháng 6 năm 1911, người thanh niên yêu nước Nguyễn Tất Thành bước chân xuống tàu Amiral Latouche-Tréville mang tên Văn Ba, bắt đầu cuộc hành trình 30 năm bôn ba tìm đường cứu nước.',
          visualHighlight: 'Cầu tàu bằng gỗ lim cổ kính hướng ra luồng hàng hải quốc tế.'
        },
        {
          id: 'scene_bnr_4',
          name: '4. Toàn Cảnh Hoàng Hôn Bên Bờ Sông Sài Gòn',
          timeCode: '01:52 - 02:30',
          cameraMode: 'sunset_timelapse',
          cameraLabel: 'Hoàng Hôn Sông Nước',
          description: 'Ánh hoàng hôn buông xuống nhuộm vàng mặt nước sông Sài Gòn, đối diện là những tòa tháp chọc trời hiện đại.',
          narratorVoiceover: 'Khi hoàng hôn buông xuống, bóng hình Bến Nhà Rồng cổ kính soi bóng lung linh giữa một TP. Hồ Chí Minh năng động, nối liền quá khứ hào hùng với tương lai xán lạn.',
          visualHighlight: 'Ánh đèn vàng ấm áp thắp sáng mái ngói rồng thiêng trong chiều tà.'
        }
      ]
    },
    historicalNarrations: [
      {
        id: 'narr_bnr_main',
        title: 'Bến Nhà Rồng - Khởi Đầu Hành Trình Cứu Nước',
        voiceType: 'nam_bo_warm',
        voiceLabel: 'Giọng Đọc Nam Bộ Truyền Cảm',
        duration: '00:45',
        era: '1863 - 1911 - Hiện đại',
        transcript: 'Bến Nhà Rồng khởi công năm 1862 bên ngã ba sông Sài Gòn với đôi rồng ngậm ngọc chầu nguyệt trên mái ngói. Ngày 5 tháng 6 năm 1911, người thanh niên yêu nước Nguyễn Tất Thành bước chân lên tàu Đô đốc Latouche-Tréville, khởi đầu cuộc hành trình 30 năm tìm đường giải phóng non sông.',
        poemExcerpt: 'Bến xưa ngóng đợi cánh buồm xa,\nSóng vỗ Nhà Rồng rạng gấm hoa.\nĐôi rồng châu nguyệt in dòng biếc,\nMuôn thuở soi đường rạng nước nhà.',
        historicalContext: 'Di tích lịch sử cấp quốc gia đặc biệt, biểu tượng vĩ đại của lòng yêu nước Việt Nam.'
      },
      {
        id: 'narr_bnr_architecture',
        title: 'Bí Mật Đôi Rồng Gốm & Tháp Cột Cờ Cổ Xưa',
        voiceType: 'elder_scholar',
        voiceLabel: 'Giọng Học Giả Nam Bộ',
        duration: '00:40',
        era: 'Thế kỷ 19',
        transcript: 'Đôi tượng rồng men ngọc trên nóc Bến Nhà Rồng được nghệ nhân gốm Cây Mai Chợ Lớn tạo tác tinh xảo, bền vững trước sương muối biển khơi suốt hơn một thế kỷ qua.',
        historicalContext: 'Kỹ thuật gốm men thủ công Nam Bộ và lịch sử thương cảng Sài Gòn thế kỷ 19.'
      }
    ]
  },

  loc_dinh_doc_lap: {
    aiTourVideo: {
      title: 'Tour Flycam AI 4K: Dinh Độc Lập & Kiệt Tác Triết Học Đông Phương',
      subtitle: 'Chiêm ngưỡng công trình đỉnh cao của KTS Ngô Viết Thụ và giây phút lịch sử 30/4/1975',
      duration: '02:45',
      resolution: '4K Ultra HD (60fps)',
      droneAlt: '90m AGL',
      voiceGuide: 'Thuyết Minh AI Phong Cách Kiến Trúc Học',
      scenes: [
        {
          id: 'scene_ddl_1',
          name: '1. Flycam Bao Quát Đại Lộ Lê Duẩn & Toàn Cảnh Chữ CÁT',
          timeCode: '00:00 - 00:42',
          cameraMode: 'aerial_drone',
          cameraLabel: 'Flycam Drone 90m',
          description: 'Flycam bay dọc đại lộ rợp bóng cây cổ thụ, hướng thẳng vào mặt tiền uy nghi tạo hình chữ CÁT (吉) của Dinh.',
          narratorVoiceover: 'Dinh Độc Lập là một kiệt tác kiến trúc độc nhất vô nhị. Toàn thể mặt bằng công trình được KTS Ngô Viết Thụ bố cục theo hình chữ CÁT trong Hán tự, mang ý nghĩa cầu chúc sự may mắn và thái bình cho đất nước.',
          visualHighlight: 'Mặt bằng tổng thể cân xứng hoàn hảo giữa rừng cây cổ thụ trung tâm Quận 1.'
        },
        {
          id: 'scene_ddl_2',
          name: '2. Khám Phá Rèm Hoa Đá & Bao Lơn Đốt Trúc Thanh Cao',
          timeCode: '00:42 - 01:25',
          cameraMode: 'ground_360',
          cameraLabel: 'Góc Nhìn Cận Cảnh Kiến Trúc',
          description: '360° bao lơn tầng 2 với hàng rèm đá bê tông cách điệu từ những đốt trúc vươn thẳng đón ánh sáng tự nhiên.',
          narratorVoiceover: 'Mặt tiền tầng 2 được bao bọc bởi hệ thống rèm hoa đá hình đốt trúc thanh tao, vừa cản bức xạ nhiệt nhiệt đới gay gắt, vừa gợi nhắc phong thái chính nhân quân tử của văn hóa phương Đông.',
          visualHighlight: 'Hàng rèm hoa đá đốt trúc đón bóng nắng lung linh chiếu vào đại sảnh.'
        },
        {
          id: 'scene_ddl_3',
          name: '3. Tái Hiện Lịch Sử: Cổng Dinh Giây Phút 30/4/1975',
          timeCode: '01:25 - 02:05',
          cameraMode: 'historical_reconstruction',
          cameraLabel: 'Tái Hiện Ngày Toàn Thắng',
          description: 'Tái hiện khoảnh khắc xe tăng 390 và 843 tiến vào húc đổ cổng chính trưa ngày 30 tháng 4 năm 1975.',
          narratorVoiceover: 'Trưa ngày 30 tháng 4 năm 1975, lá cờ Mặt trận Dân tộc Giải phóng miền Nam tung bay trên nóc Dinh Độc Lập, đánh dấu thời khắc non sông liền một dải, mở ra kỷ nguyên hòa bình thống nhất.',
          visualHighlight: 'Cánh cổng sắt lịch sử và bãi cỏ xanh rực rỡ dưới nắng trưa tháng Tư.'
        },
        {
          id: 'scene_ddl_4',
          name: '4. Hệ Thống Hầm Ngầm Kiên Cố & Sân Trực Thăng Tầng Thượng',
          timeCode: '02:05 - 02:45',
          cameraMode: 'interior_walk',
          cameraLabel: 'Khám Phá Hầm Chỉ Huy Tác Chiến',
          description: 'Góc nhìn tham quan bên trong hệ thống hầm ngầm chống bom bọc thép và sân đáp trực thăng trên nóc Dinh.',
          narratorVoiceover: 'Sâu dưới lòng đất là hệ thống hầm ngầm kiên cố với đài phát thanh dự phòng và bản đồ quân sự tối mật, minh chứng cho sự tinh xảo trong tính toán công năng kỹ thuật của công trình.',
          visualHighlight: 'Các vách thép dày và hệ thống đường hầm thoát hiểm độc đáo.'
        }
      ]
    },
    historicalNarrations: [
      {
        id: 'narr_ddl_main',
        title: 'Dinh Độc Lập - Triết Lý Phương Đông & Dấu Mốc Non Sông Liền Một Dải',
        voiceType: 'nam_bo_warm',
        voiceLabel: 'Giọng Thuyết Minh Chuẩn Mực',
        duration: '00:45',
        era: '1962 - 1975 - Nay',
        transcript: 'Dinh Độc Lập do KTS Ngô Viết Thụ thiết kế mang bố cục chữ Cát và rèm đốt trúc thanh cao. Trưa ngày 30 tháng 4 năm 1975, xe tăng quân giải phóng tiến qua cổng chính, khắc ghi mốc son lịch sử rực rỡ khi non sông Việt Nam hoàn toàn thống nhất.',
        poemExcerpt: 'Thênh thang đại lộ bóng cờ bay,\nCổng sắt nghiêng chào nắng sớm mai.\nNon nước từ đây liền một dải,\nKhúc ca thống nhất rộn tương lai.',
        historicalContext: 'Biểu tượng lịch sử của hòa bình và độc lập dân tộc Việt Nam.'
      }
    ]
  },

  loc_cu_chi: {
    aiTourVideo: {
      title: 'Tour Flycam AI 4K: Địa Đạo Củ Chi - Mê Cung Trong Lòng Đất',
      subtitle: 'Thám hiểm hệ thống địa đạo 3 tầng hơn 250km tại Đất Thép Thành Đồng',
      duration: '02:40',
      resolution: '4K Ultra HD (60fps)',
      droneAlt: '80m AGL',
      voiceGuide: 'Thuyết Minh AI Giọng Kể Hào Hùng',
      scenes: [
        {
          id: 'scene_cc_1',
          name: '1. Rừng Cao Su & Vùng Đất Thép Nhìn Từ Flycam',
          timeCode: '00:00 - 00:35',
          cameraMode: 'aerial_drone',
          cameraLabel: 'Flycam Bến Dược Củ Chi',
          description: 'Flycam bay trên tán rừng bạt ngàn của Củ Chi, nơi ẩn giấu một kỳ quan chiến tranh ngầm bên dưới mặt đất.',
          narratorVoiceover: 'Củ Chi – vùng đất thép thành đồng nằm cách trung tâm Sài Gòn 70km. Ẩn mình dưới những tán rừng bình yên hôm nay là mạng lưới địa đạo dài hơn 250km được đào hoàn toàn bằng bàn tay con người.',
          visualHighlight: 'Tán rừng xanh ngắt và dòng sông Sài Gòn uốn lượn hiền hòa.'
        },
        {
          id: 'scene_cc_2',
          name: '2. Nắp Hầm Bí Mật Ẩn Mình Dưới Lá Khô',
          timeCode: '00:35 - 01:15',
          cameraMode: 'ground_360',
          cameraLabel: 'Cận Cảnh Nắp Hầm Bí Mật',
          description: 'Mô phỏng 360° nắp hầm địa đạo chỉ vừa một người chui lọt, ngụy trang hoàn hảo bằng lớp lá cây rừng.',
          narratorVoiceover: 'Các nắp hầm bí mật với kích thước chỉ bằng chiếc ván gỗ nhỏ, phủ đầy lá khô, hoàn toàn vô hình trước tai mắt tuần tra của kẻ thù.',
          visualHighlight: 'Kỹ thuật nắp hầm chốt trong và lỗ thông hơi hình ụ mối đất.'
        },
        {
          id: 'scene_cc_3',
          name: '3. Khám Phá Mê Cung 3 Tầng Sâu Trong Lòng Đất',
          timeCode: '01:15 - 02:00',
          cameraMode: 'interior_walk',
          cameraLabel: 'Bên Trong Địa Đạo 3 Tầng',
          description: 'Ống kính đi dọc đường hầm địa đạo tầng 1 (3m), tầng 2 (6m) và tầng 3 (sâu 12m) chống bom xuyên.',
          narratorVoiceover: 'Hệ thống hầm gồm 3 tầng thông nhau liên hoàn: tầng 1 cách mặt đất 3 mét chịu được pháo kích, tầng 2 sâu 6 mét và tầng đáy sâu tới 12 mét có thể chống bom hạng nặng, nối thẳng ra bờ sông Sài Gòn.',
          visualHighlight: 'Bệnh viện dã chiến ngầm, phòng hội họp và kho vũ khí dưới lòng đất.'
        },
        {
          id: 'scene_cc_4',
          name: '4. Kỳ Tích Bếp Hoàng Cầm Không Khói',
          timeCode: '02:00 - 02:40',
          cameraMode: 'historical_reconstruction',
          cameraLabel: 'Bếp Hoàng Cầm Huyền Thoại',
          description: 'Mô phỏng hệ thống rãnh khói dẫn ngầm của bếp Hoàng Cầm, làm tản khói bay là là như sương sớm.',
          narratorVoiceover: 'Sáng kiến bếp Hoàng Cầm huyền thoại giúp quân dân Củ Chi nấu nướng đêm ngày mà không để lộ một gợn khói lên không trung, làm nên huyền thoại Đất Thép anh hùng.',
          visualHighlight: 'Hệ thống rãnh tản khói ngoạn mục dưới thảm thực vật rừng.'
        }
      ]
    },
    historicalNarrations: [
      {
        id: 'narr_cc_main',
        title: 'Địa Đạo Củ Chi - Kỳ Quan Công Sự Ngầm 250km',
        voiceType: 'nam_bo_warm',
        voiceLabel: 'Giọng Kể Hào Hùng Phương Nam',
        duration: '00:45',
        era: '1946 - 1975',
        transcript: 'Địa đạo Củ Chi là kỳ quan công sự ngầm dài hơn 250km với 3 tầng hầm thông suốt, đào bằng cuốc xẻng thủ công trên đất sét pha sỏi. Sáng kiến Bếp Hoàng Cầm giấu khói cùng hệ thống thông khí hình ụ mối tài tình đã làm nên huyền thoại Đất Thép Thành Đồng.',
        poemExcerpt: 'Đất thép Củ Chi rạng chiến công,\nLòng sâu hun hút vững non sông.\nCuốc đơn đào đất thành lũy thép,\nRạng rỡ phương Nam khí phách hồng.',
        historicalContext: 'Di tích quốc gia đặc biệt, biểu tượng cho ý chí kiên cường bất khuất của dân tộc Việt Nam.'
      }
    ]
  },

  loc_cho_ben_thanh: {
    aiTourVideo: {
      title: 'Tour Flycam AI 4K: Chợ Bến Thành - Trái Tim Phồn Hoa Đất Sài Gòn',
      subtitle: 'Khám phá tháp đồng hồ 4 mặt huyền thoại, 4 cổng Đông-Tây-Nam-Bắc và nhịp sống trăm năm',
      duration: '02:20',
      resolution: '4K Ultra HD (60fps)',
      droneAlt: '75m AGL',
      voiceGuide: 'Thuyết Minh AI Giọng Sài Gòn Xưa',
      scenes: [
        {
          id: 'scene_cbt_1',
          name: '1. Tháp Đồng Hồ Cổng Nam Nhìn Từ Flycam',
          timeCode: '00:00 - 00:35',
          cameraMode: 'aerial_drone',
          cameraLabel: 'Flycam Tháp Đồng Hồ Cổng Nam',
          description: 'Flycam bay lượn từ vòng xoay Quách Thị Trang cũ hướng thẳng vào tháp đồng hồ 4 mặt biểu tượng của TP.HCM.',
          narratorVoiceover: 'Khánh thành năm 1914, tháp đồng hồ Chợ Bến Thành là hình ảnh thân thương in sâu trong tâm khảm của biết bao thế hệ người con Sài Gòn và du khách bốn phương.',
          visualHighlight: 'Mái ngói tam giác đỏ và đồng hồ 4 mặt trường tồn suốt hơn 110 năm.'
        },
        {
          id: 'scene_cbt_2',
          name: '2. Phù Điêu Gốm Biên Hòa 12 Con Giáp & Nông Sản',
          timeCode: '00:35 - 01:10',
          cameraMode: 'ground_360',
          cameraLabel: 'Cận Cảnh Phù Điêu Gốm 1952',
          description: 'Cận cảnh các bức phù điêu gốm men màu Biên Hòa tuyệt đẹp gắn trên 4 cổng chính của chợ từ năm 1952.',
          narratorVoiceover: 'Gắn trên 4 cửa chợ là những bức phù điêu gốm Biên Hòa tinh xảo mô tả nông sản trù phú của đất phương Nam: buồng chuối, con bò sữa, cành lúa vàng óng và người gánh hàng rong.',
          visualHighlight: 'Nước men gốm màu rực rỡ đặc trưng mỹ thuật Nam Bộ xưa.'
        },
        {
          id: 'scene_cbt_3',
          name: '3. Gian Hàng Ẩm Thực Nam Bộ Ngào Ngạt Khói Hương',
          timeCode: '01:10 - 01:45',
          cameraMode: 'interior_walk',
          cameraLabel: 'Dạo Bước Gian Hàng Ẩm Thực',
          description: 'Dạo quanh các sạp ẩm thực với bún mắm, chè ba màu, bánh bèo, hủ tiếu ngát hương vị đất Sài Gòn.',
          narratorVoiceover: 'Bước vào lòng chợ, du khách như lạc vào thiên đường ẩm thực Nam Bộ với món bún mắm đậm đà, ly chè sương sa hạt lựu ngọt mát và tiếng chào mời đon đả thân tình.',
          visualHighlight: 'Khay chè rực rỡ sắc màu và nồi nước dùng bún bò, hủ tiếu nghi ngút khói.'
        },
        {
          id: 'scene_cbt_4',
          name: '4. Chợ Đêm Bến Thành Rực Rỡ Sắc Đèn Về Đêm',
          timeCode: '01:45 - 02:20',
          cameraMode: 'sunset_timelapse',
          cameraLabel: 'Chợ Đêm Lung Linh Ánh Đèn',
          description: 'Khung cảnh phố chợ đêm sôi động với hàng trăm gian hàng lưu niệm, thủ công mỹ nghệ dưới ánh đèn vàng.',
          narratorVoiceover: 'Về đêm, xung quanh Chợ Bến Thành hóa thành khu chợ đêm sầm uất, nơi hội tụ tinh hoa văn hóa du lịch và nhịp sống không ngủ của thành phố.',
          visualHighlight: 'Ánh đèn neon lung linh chiếu rọi tháp đồng hồ cổ kính.'
        }
      ]
    },
    historicalNarrations: [
      {
        id: 'narr_cbt_main',
        title: 'Chợ Bến Thành - Biểu Tượng Giao Thương Trăm Năm',
        voiceType: 'nam_bo_warm',
        voiceLabel: 'Giọng Đọc Sài Gòn Ấm Áp',
        duration: '00:45',
        era: '1914 - Nay',
        transcript: 'Khánh thành năm 1914, Chợ Bến Thành với tháp đồng hồ ba mặt Cửa Nam và mười hai bức phù điêu gốm Biên Hòa đã trở thành biểu tượng giao thương sầm uất, gắn liền với ký ức và nhịp sống hào sảng của người dân phương Nam.',
        poemExcerpt: 'Chợ Bến Thành chuông ngân bốn phía,\nKhách bốn phương nườm nượp đổ về.\nĐồng hồ tích tắc trăm năm lẻ,\nSài Gòn hoa lệ đẹp say mê.',
        historicalContext: 'Biểu tượng thương mại văn hóa sống động hơn 1 thế kỷ của Sài Gòn.'
      }
    ]
  },

  loc_nha_tho_duc_ba: {
    aiTourVideo: {
      title: 'Tour Flycam AI 4K: Nhà Thờ Đức Bà Sài Gòn & Tuyệt Tác Gạch Marseille',
      subtitle: 'Chiêm ngưỡng kiến trúc Romanesque kết hợp Gothic, tháp chuông 60m và gạch hồng không vữa 1880',
      duration: '02:35',
      resolution: '4K Ultra HD (60fps)',
      droneAlt: '110m AGL',
      voiceGuide: 'Thuyết Minh AI Giọng Cổ Kính',
      scenes: [
        {
          id: 'scene_db_1',
          name: '1. Toàn Cảnh Tháp Đôi 60m Vươn Cao Lên Nền Trời',
          timeCode: '00:00 - 00:38',
          cameraMode: 'aerial_drone',
          cameraLabel: 'Flycam Tháp Đôi Đức Bà 110m',
          description: 'Flycam lượn vòng quanh đôi tháp chuông cao 60.5m với hai chóp nhọn bọc kẽm tuyệt mỹ giữa trung tâm Quận 1.',
          narratorVoiceover: 'Vương cung thánh đường Chính tòa Đức Bà Sài Gòn được khởi công năm 1877 bởi KTS Jules Bourard. Hai tháp chuông cao 60 mét vươn thẳng lên trời xanh là tuyệt phẩm kiến trúc Roman hòa quyện Gothic.',
          visualHighlight: 'Đôi tháp chuông vươn cao đón những tia nắng ban mai đầu tiên của thành phố.'
        },
        {
          id: 'scene_db_2',
          name: '2. Cận Cảnh Gạch Đỏ Marseille Không Rêu Mốc 145 Năm',
          timeCode: '00:38 - 01:18',
          cameraMode: 'ground_360',
          cameraLabel: 'Chi Tiết Gạch Đỏ Marseille',
          description: 'Ống kính quét siêu cận những viên gạch đỏ nung từ cảng Marseille nước Pháp, xếp khít không vữa trát.',
          narratorVoiceover: 'Toàn bộ gạch xây dựng được vận chuyển bằng đường biển từ cảng Marseille nước Pháp sang. Trải qua gần 150 năm mưa nắng nhiệt đới, sắc gạch hồng vẫn tươi rói và không hề bám một vết rêu mốc.',
          visualHighlight: 'Sắc hồng cam ấm áp của từng viên gạch in chìm xuất xứ Marseille.'
        },
        {
          id: 'scene_db_3',
          name: '3. 6 Quả Chuông Đồng Nặng Gần 30 Tấn Nổi Tiếng',
          timeCode: '01:18 - 01:55',
          cameraMode: 'interior_walk',
          cameraLabel: 'Bên Trong Tháp Chuông Cổ',
          description: 'Góc nhìn bên trong tháp chuông với bộ 6 quả chuông đồng đúc tại Pháp mang các nốt Sol, La, Si, Đô, Rê, Mì.',
          narratorVoiceover: 'Bên trong tháp là bộ 6 quả chuông đồng đúc tại Pháp năm 1879 với tổng trọng lượng gần 30 tấn. Khi cả 6 quả chuông cùng ngân vang, âm thanh có thể truyền xa tới hơn 10 cây số.',
          visualHighlight: 'Họa tiết chạm khắc hoa văn tinh xảo trên thân quả chuông lớn nhất (chuông Sol nặng gần 9 tấn).'
        },
        {
          id: 'scene_db_4',
          name: '4. Tượng Đức Mẹ Hòa Bình & Công Viên Công Xã Paris',
          timeCode: '01:55 - 02:35',
          cameraMode: 'sunset_timelapse',
          cameraLabel: 'Tượng Đức Mẹ Hòa Bình',
          description: 'Khung cảnh trang nghiêm trước quảng trường với Tượng Đức Mẹ Hòa Bình tạc bằng đá cẩm thạch trắng Carrara.',
          narratorVoiceover: 'Trước tiền đường là bức tượng Đức Mẹ Hòa Bình bằng đá cẩm thạch trắng tinh khôi tạc từ Ý năm 1959, tay ôm quả địa cầu gửi gắm lời cầu nguyện an lành cho đất nước và thế giới.',
          visualHighlight: 'Tượng Đức Mẹ bằng cẩm thạch trắng tỏa sáng giữa hoa lá quảng trường Paris.'
        }
      ]
    },
    historicalNarrations: [
      {
        id: 'narr_db_main',
        title: 'Nhà Thờ Đức Bà Sài Gòn - Tuyệt Tác Gạch Marseille',
        voiceType: 'nam_bo_warm',
        voiceLabel: 'Giọng Thuyết Minh Truyền Cảm',
        duration: '00:45',
        era: '1877 - 1880 - Nay',
        transcript: 'Khởi công năm 1877 theo phong cách Tân Roman, Vương cung thánh đường Đức Bà nổi bật với sắc gạch đỏ Marseille không bám rêu mốc suốt gần một trăm năm mươi năm và cặp tháp chuông cao gần 60m uy nghi giữa quảng trường.',
        poemExcerpt: 'Tháp chuông sừng sững giữa trời xanh,\nGạch đỏ Marseille sắc thắm lành.\nChuông ngân thanh thoát lòng thanh thản,\nĐức Mẹ từ bi rạng đất lành.',
        historicalContext: 'Kiệt tác kiến trúc cổ điển tiêu biểu hơn 140 năm giữa lòng Sài Gòn.'
      }
    ]
  }
};

// Fallback generator for other locations so every single landmark has rich AI Tour Videos & Audio Guides
export function getMediaForLocation(locId: string, locName: string, province: string = 'TP. Hồ Chí Minh', shortDesc: string = '', fullHistory: string = ''): { aiTourVideo: AITourVideo; historicalNarrations: HistoricalNarration[] } {
  if (LOCATION_MEDIA_MAP[locId]) {
    return LOCATION_MEDIA_MAP[locId];
  }

  return {
    aiTourVideo: {
      title: `Tour Flycam AI 4K: Khám Phá Toàn Cảnh ${locName}`,
      subtitle: `Du ngoạn danh thắng di sản ${locName} (${province}) qua lăng kính công nghệ AI 4K`,
      duration: '02:15',
      resolution: '4K Ultra HD (60fps)',
      droneAlt: '100m AGL',
      voiceGuide: 'Thuyết Minh AI Di Sản Phương Nam',
      scenes: [
        {
          id: `scene_${locId}_1`,
          name: `1. Toàn Cảnh Flycam Không Gian ${locName}`,
          timeCode: '00:00 - 00:35',
          cameraMode: 'aerial_drone',
          cameraLabel: 'Flycam Drone 100m',
          description: `Flycam lượn từ trên cao bao quát toàn thể kiến trúc và cảnh quan thiên nhiên tại ${locName}.`,
          narratorVoiceover: `Chào mừng du khách đến với ${locName}, một trong những điểm đến văn hóa lịch sử đặc sắc của vùng đất ${province}.`,
          visualHighlight: `Toàn cảnh không gian di tích rạng rỡ dưới ánh nắng phương Nam.`
        },
        {
          id: `scene_${locId}_2`,
          name: `2. Cận Cảnh Dấu Ấn Kiến Trúc & Cổ Vật`,
          timeCode: '00:35 - 01:10',
          cameraMode: 'ground_360',
          cameraLabel: 'Cận Cảnh 360° Di Sản',
          description: `Góc quay 360 độ chi tiết các đường nét hoa văn, hiện vật và kết cấu kiến trúc cổ kính.`,
          narratorVoiceover: shortDesc || `Nơi đây lưu giữ những giá trị văn hóa ngàn năm với những đường nét hoa văn kiến trúc truyền thống độc bản.`,
          visualHighlight: `Hoa văn cổ kính và chi tiết điêu khắc tinh xảo.`
        },
        {
          id: `scene_${locId}_3`,
          name: `3. Hành Trình Khám Phá Bên Trong Di Tích`,
          timeCode: '01:10 - 01:45',
          cameraMode: 'interior_walk',
          cameraLabel: 'Dạo Bước Không Gian Di Sản',
          description: `Ống kính di chuyển vào bên trong, cảm nhận chiều sâu lịch sử và không gian hoài cổ lắng đọng.`,
          narratorVoiceover: `Từng viên gạch, mái ngói và hiện vật nơi đây đều là nhân chứng cho dòng chảy lịch sử hào hùng của vùng đất phương Nam.`,
          visualHighlight: `Không gian trang nghiêm lắng đọng hồn cốt xưa.`
        },
        {
          id: `scene_${locId}_4`,
          name: `4. Hoàng Hôn & Ánh Sáng Di Sản Lung Linh`,
          timeCode: '01:45 - 02:15',
          cameraMode: 'sunset_timelapse',
          cameraLabel: 'Hoàng Hôn Phương Nam',
          description: `Ánh hoàng hôn buông xuống phủ lớp vàng ươm lên ${locName}, tạo nên bức tranh huyền ảo.`,
          narratorVoiceover: `Khi chiều buông, ${locName} khoác lên mình vẻ đẹp trầm mặc lung linh, níu giữ bước chân lữ khách muôn phương.`,
          visualHighlight: `Bóng chiều tà huyền ảo in trên nền trời hoàng hôn.`
        }
      ]
    },
    historicalNarrations: [
      {
        id: `narr_${locId}_main`,
        title: `Thuyết Minh Di Sản: ${locName}`,
        voiceType: 'nam_bo_warm',
        voiceLabel: 'Giọng Đọc Nam Bộ Truyền Cảm',
        duration: '00:45',
        era: 'Lịch sử & Di sản phương Nam',
        transcript: shortDesc || fullHistory || `Địa danh ${locName} là một trong những di sản tiêu biểu của vùng đất ${province}, gắn liền với những câu chuyện lịch sử hào hùng và nét đẹp văn hóa truyền thống của cư dân phương Nam.`,
        historicalContext: `Di sản văn hóa lịch sử tiêu biểu tại ${province}.`
      }
    ]
  };
}
