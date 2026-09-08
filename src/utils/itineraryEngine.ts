import { Location3D, PersonalizedItinerary, ItineraryStop, ItineraryThemeType, AITourGuideId, AITourGuide, UserPreferences } from '../types';
import { LOCATIONS } from '../data/locations';
import { AI_TOUR_GUIDES, getAITourGuide } from '../data/aiTourGuides';

export interface ItineraryGenerationOptions {
  theme: ItineraryThemeType;
  durationMode: 'half_day' | 'full_day' | 'two_days';
  transportMode: 'walk' | 'cyclo' | 'waterbus' | 'hop_on_bus' | 'motorbike';
  startPoint: string;
  pace: 'relaxed' | 'balanced' | 'deep_dive';
  tourGuideId?: AITourGuideId;
  travelerStyle?: 'scholar' | 'photographer' | 'spiritual' | 'foodie' | 'adventurer';
  regionFilter?: 'all' | 'TP. Hồ Chí Minh' | 'Bình Dương' | 'Bà Rịa - Vũng Tàu';
  customAccentColor?: string;
  themeSkinName?: string;
  userPreferences?: UserPreferences;
  bookmarkedLandmarks?: string[];
}

const THEME_DETAILS: Record<ItineraryThemeType, {
  label: string;
  subtitle: string;
  badgeId: string;
  recommendedGuide: AITourGuideId;
  locationFilter: (l: Location3D) => boolean;
}> = {
  architecture_classic: {
    label: 'Kiến Trúc & Di Sản Đông Dương (Indochine Heritage)',
    subtitle: 'Chiêm ngưỡng những tuyệt tác kiến trúc vòm kính, hoa văn sắt uốn và phù điêu trăm năm tuổi',
    badgeId: 'badge_ben_thanh',
    recommendedGuide: 'co_ba_sai_gon',
    locationFilter: (l: Location3D) => ['ben_thanh', 'buu_dien_tphcm', 'dinh_doc_lap', 'duong_sach_hcm', 'cho_ben_thanh'].includes(l.id) || l.province === 'TP. Hồ Chí Minh'
  },
  river_ports_300: {
    label: 'Ký Ức Sông Nước & Bến Cảng 300 Năm',
    subtitle: 'Ngược dòng ký ức từ Cột cờ Thủ Ngữ, Bến Nhà Rồng đến cái nôi công nghiệp xưởng Ba Son',
    badgeId: 'badge_nha_rong',
    recommendedGuide: 'co_van_ba_son',
    locationFilter: (l: Location3D) => ['thu_ngu', 'nha_rong', 'cho_ben_thanh', 'buu_dien_tphcm'].includes(l.id) || l.category === 'history'
  },
  cuisine_flavors: {
    label: 'Ẩm Thực Đô Thành & Cà Phê Vợt Chợ Xưa',
    subtitle: 'Thưởng thức phong vị ẩm thực giao thoa Việt - Hoa, cà phê bệt và các món quà vặt danh tiếng',
    badgeId: 'badge_ben_thanh',
    recommendedGuide: 'bac_ba_phi',
    locationFilter: (l: Location3D) => ['cho_ben_thanh', 'cho_thu_dau_mot', 'cho_xom_luoi_vt', 'duong_sach_hcm'].includes(l.id) || l.category === 'cuisine'
  },
  pottery_spiritual: {
    label: 'Làng Nghề Gốm Sứ & Danh Lam Tâm Linh Đất Thủ',
    subtitle: 'Hành trình tĩnh tại khám phá gốm men lam Lái Thiêu, chùa cổ Hội Khánh và làng sơn mài',
    badgeId: 'badge_bd_hoi_khanh',
    recommendedGuide: 'co_van_ba_son',
    locationFilter: (l: Location3D) => ['chua_hoi_khanh_bd', 'lo_gom_dai_hung_bd', 'nha_co_tran_van_ho_bd', 'lang_nghe_son_mai_tuong_binh_hiep_bd'].includes(l.id) || l.province === 'Bình Dương'
  },
  coastal_heroes: {
    label: 'Hải Trình Biển Đảo & Di Tích Lịch Sử',
    subtitle: 'Từ ngọn hải đăng Vũng Tàu sừng sững ngắm sóng biển đến Côn Đảo thiêng liêng',
    badgeId: 'badge_vt_hai_dang',
    recommendedGuide: 'bac_ba_phi',
    locationFilter: (l: Location3D) => ['hai_dang_vung_tau', 'bach_dinh_vung_tau', 'con_dao_prison', 'tuong_chua_kito_vung_tau', 'lang_chai_phuoc_hai'].includes(l.id) || l.province === 'Bà Rịa - Vũng Tàu'
  },
  heroic_tunnels: {
    label: 'Huyền Thoại Đất Thép & Rừng Sác Cần Giờ',
    subtitle: 'Khám phá hệ thống địa đạo Củ Chi kiên cường và căn cứ thủy quân Rừng Sác',
    badgeId: 'badge_cu_chi',
    recommendedGuide: 'co_van_ba_son',
    locationFilter: (l: Location3D) => ['cu_chi_tunnels', 'rung_sac_can_gio', 'dinh_doc_lap', 'con_dao_prison'].includes(l.id)
  },
  urban_sketch_vintage: {
    label: 'Ký Họa Nghệ Thuật & Nhiếp Ảnh Hoài Cổ',
    subtitle: 'Săn các góc chụp ảnh hoàng kim, ban công hoa sắt cổ kính và quán xá đậm chất thơ',
    badgeId: 'badge_ben_thanh',
    recommendedGuide: 'co_ba_sai_gon',
    locationFilter: (l: Location3D) => ['buu_dien_tphcm', 'duong_sach_hcm', 'cho_ben_thanh', 'bach_dinh_vung_tau'].includes(l.id) || l.category === 'architecture'
  },
  cipher_adventure: {
    label: 'Thám Hiểm Mật Thư & Giải Mã Di Sản Tốc Độ',
    subtitle: 'Hành trình vượt chướng ngại vật trí tuệ, bóc tách các mật mã ẩn giấu tại các di tích lớn',
    badgeId: 'badge_ben_thanh',
    recommendedGuide: 'phuot_thu_gen_z',
    locationFilter: (l: Location3D) => ['cho_ben_thanh', 'buu_dien_tphcm', 'dinh_doc_lap', 'hai_dang_vung_tau', 'chua_hoi_khanh_bd'].includes(l.id)
  }
};

const TRANSPORT_DETAILS = {
  walk: { label: 'Đi bộ thư thả & chụp ảnh', avgSpeedKmH: 4, icon: '🚶' },
  cyclo: { label: 'Xích lô hoài cổ phương Nam', avgSpeedKmH: 10, icon: '🚲' },
  waterbus: { label: 'Tàu buýt sông Saigon Waterbus', avgSpeedKmH: 22, icon: '🛥️' },
  hop_on_bus: { label: 'Xe buýt 2 tầng Hop-On Hop-Off', avgSpeedKmH: 18, icon: '🚌' },
  motorbike: { label: 'Xe máy luồn lách khám phá hẻm phố', avgSpeedKmH: 25, icon: '🛵' }
};

const STOP_GUIDE_NARRATIONS: Record<string, Record<AITourGuideId, string>> = {
  cho_ben_thanh: {
    co_van_ba_son: 'Chào quý vị! Chúng ta đang đứng trước Chợ Bến Thành, biểu tượng hơn 110 năm của Sài Gòn. Tháp đồng hồ 3 mặt này được xây dựng năm 1914 bởi hãng Brossard et Maupin, là nhân chứng cho vô vàn thăng trầm lịch sử.',
    co_ba_sai_gon: 'Cả nhà ơi, góc tháp đồng hồ cổng Nam này lên ảnh áo dài duyên dáng lắm đó! Bên trong chợ có hàng chè mâm ba màu nước cốt dừa béo ngậy và bánh bèo tôm cháy ngon nức tiếng.',
    bac_ba_phi: 'Bớ bà con! Chợ Bến Thành này xưa kia nằm sát sông Bến Nghé, tàu ghe miền Tây chở cá tôm lúa gạo lên tấp nập. Sau dời về đây thành trung tâm sầm uất nhất xứ Nam Kỳ!',
    phuot_thu_gen_z: 'Tip săn ảnh xịn: đứng ở đảo giao thông phía đối diện góc 45 độ lúc 8h sáng, ánh nắng rọi thẳng vào vòm tháp tạo độ tương phản cực nghệ thuật luôn anh em!'
  },
  buu_dien_tphcm: {
    co_van_ba_son: 'Bưu Điện Trung Tâm Sài Gòn là tuyệt tác kết hợp phong cách Gothic, Phục Hưng và ảnh hưởng kiến trúc Pháp cuối thế kỷ 19. Hãy chú ý hai bản đồ cổ vẽ tay trên vòm trần ghi lại tuyến viễn thông Nam Kỳ xưa.',
    co_ba_sai_gon: 'Hàng ghế gỗ lim dài bóng loáng giữa sảnh chính là nơi gắn liền với bao bức thư tay gửi gắm yêu thương qua năm tháng. Cửa sổ vòm kính cong cong ở đây lên màu ảnh vintage cực kỳ đẹp.',
    bac_ba_phi: 'Nhìn cái đồng hồ to đùng trước cổng nghen, chạy hơn trăm năm rồi mà giờ giấc vẫn ngay bon! Hồi xưa bà con miền Tây lên Sài Gòn là phải ghé đây chụp tấm hình lưu niệm làm kỷ niệm đó.',
    phuot_thu_gen_z: 'Anh em nhớ check-in góc buồng bốt điện thoại gỗ cổ kính bên phải sảnh nhé! Đố mọi người tìm ra vị trí bức mật thư số 1886 khắc trên khung kim loại vòm trần đấy!'
  },
  dinh_doc_lap: {
    co_van_ba_son: 'Dinh Độc Lập do Kiến trúc sư Ngô Viết Thụ - khôi nguyên giải La Mã thiết kế, mang đậm triết lý phương Đông qua các chữ Cát, Khẩu, Trung, Tam, Chủ trong bố cục mặt bằng.',
    co_ba_sai_gon: 'Những tấm rèm hoa đá hình đốt trúc bao quanh tầng 2 vừa che bớt nắng nhiệt đới vừa tạo vẻ thanh tao, uyển chuyển như đốt trúc Việt Nam kiên cường.',
    bac_ba_phi: 'Khu hầm ngầm dưới lòng Dinh kiên cố dữ dội lắm nghen bà con, có cả trung tâm chỉ huy truyền tin thời chiến với những bản đồ quân sự tối mật.',
    phuot_thu_gen_z: 'Điểm nhấn số 1: Chiếc xe tăng 390 và 843 lịch sử ngoài bãi cỏ và bãi đáp trực thăng trên nóc Dinh. Góc chụp từ sân cỏ phía trước bao trọn toàn cảnh 100 điểm!'
  },
  nha_rong: {
    co_van_ba_son: 'Bến Nhà Rồng - khởi đầu là trụ sở thương cảng Messageries Maritimes xây dựng năm 1863, nơi người thanh niên yêu nước Nguyễn Tất Thành bước lên con tàu Amiral Latouche-Tréville ra đi tìm đường cứu nước.',
    co_ba_sai_gon: 'Đứng trên ban công tầng 2 lúc chiều tà, nhìn gió sông Sài Gòn thổi lồng lộng và ngắm những chuyến tàu qua lại, lòng chợt dâng lên bao niềm xúc cảm bồi hồi.',
    bac_ba_phi: 'Đôi rồng uốn lượn trên nóc nhà theo kiểu "Lưỡng Long Chầu Nguyệt" là nét kiến trúc giao thoa Đông - Tây rất đỗi độc đáo bên bờ sông Bến Nghé.',
    phuot_thu_gen_z: '17h chiều là khung giờ vàng! Bạn sẽ chụp được cảnh hoàng hôn phản chiếu rực rỡ trên mặt nước sông Sài Gòn với hậu cảnh là tòa nhà Ba Son và Landmark 81!'
  },
  chua_hoi_khanh_bd: {
    co_van_ba_son: 'Chùa Hội Khánh được xây dựng từ năm 1741, lưu giữ nhiều pho tượng gỗ quý sơn son thiếp vàng và bộ kinh Phật cổ. Ngôi chùa là trung tâm phật giáo tiêu biểu đất Bình Dương.',
    co_ba_sai_gon: 'Bức tượng Phật Thích Ca nhập niết bàn dài 52m thanh thoát tọa lạc trên mái chùa cao giữa vườn cây sao dầu cổ thụ rợp bóng thanh tịnh.',
    bac_ba_phi: 'Bà con tới đây nhớ đi nhẹ nói khẽ nghe tiếng chuông chùa ngân nga, cầu bình an cho gia đạo và ngắm những nét chạm trổ rồng phụng tài tình của thợ mộc xưa.',
    phuot_thu_gen_z: 'Góc flycam hoặc chụp từ chân tháp hướng lên tượng Phật 52m bao quát toàn bộ nền trời xanh mát cực kỳ hùng vĩ!'
  },
  hai_dang_vung_tau: {
    co_van_ba_son: 'Hải đăng Vũng Tàu khánh thành lần đầu năm 1862 trên đỉnh núi Nhỏ, là một trong những ngọn hải đăng cổ xưa nhất Đông Nam Á, dẫn lối cho hàng triệu chuyến hải trình an toàn.',
    co_ba_sai_gon: 'Con đường hoa sứ cổ thụ trắng xóa nở thơm ngát dẫn lên ngọn hải đăng là phông nền chụp ảnh không thể bỏ lỡ khi ghé thăm phố biển.',
    bac_ba_phi: 'Lên đỉnh tháp gió biển thổi mát rượi, phóng tầm mắt thấy hết Bãi Trước Bãi Sau, tàu bè ngoài khơi xa xôi nhỏ xíu như hòn sỏi!',
    phuot_thu_gen_z: 'Check-in ngọn hải đăng xong nhớ ghé quán Cô Tiên thưởng thức yaourt dẻo thơm và trứng gà lòng đào chấm muối tiêu ớt cực phẩm nhé anh em!'
  }
};

const TRIVIA_DATABASE: Record<string, { question: string; answer: string; rewardLP: number }> = {
  cho_ben_thanh: {
    question: 'Chợ Bến Thành với tháp đồng hồ 3 mặt đặc trưng được khánh thành vào năm nào?',
    answer: 'Năm 1914',
    rewardLP: 30
  },
  buu_dien_tphcm: {
    question: 'Hai bức bản đồ cổ trên tường sảnh Bưu Điện Trung Tâm Sài Gòn miêu tả điều gì?',
    answer: 'Tuyến viễn thông & đường dây điện tín Nam Kỳ xưa (1892 & 1936)',
    rewardLP: 35
  },
  dinh_doc_lap: {
    question: 'Kiến trúc sư nào là tác giả thiết kế công trình Dinh Độc Lập hiện đại?',
    answer: 'Kiến trúc sư Ngô Viết Thụ (Khôi nguyên La Mã)',
    rewardLP: 40
  },
  nha_rong: {
    question: 'Bến Nhà Rồng gắn liền với sự kiện lịch sử trọng đại nào vào ngày 05/06/1911?',
    answer: 'Bác Hồ (Nguyễn Tất Thành) ra đi tìm đường cứu nước trên tàu Amiral Latouche-Tréville',
    rewardLP: 45
  },
  chua_hoi_khanh_bd: {
    question: 'Tượng Phật Thích Ca nằm trên mái tại Chùa Hội Khánh có chiều dài bao nhiêu mét?',
    answer: 'Dài 52 mét (Kỷ lục châu Á)',
    rewardLP: 35
  },
  hai_dang_vung_tau: {
    question: 'Ngọn hải đăng Vũng Tàu tọa lạc trên đỉnh ngọn núi nào?',
    answer: 'Núi Nhỏ (Núi Tao Phùng)',
    rewardLP: 30
  }
};

const AI_TIPS_DATABASE: Record<string, { tip: string; photoHour: string; cuisine: string }> = {
  cho_ben_thanh: {
    tip: 'Vào cổng Nam ngắm tháp đồng hồ nguyên bản 1914, ghé hàng chè mâm bà Ba ở cổng Đông.',
    photoHour: '07:30 - 08:30 (Nắng sớm xuyên qua mái vòm)',
    cuisine: 'Bún riêu gánh chợ Bến Thành & Chè ba màu Nam Bộ'
  },
  buu_dien_tphcm: {
    tip: 'Chiêm ngưỡng 2 bản đồ cổ vẽ tay thời kỳ Pháp thuộc trên tường hai bên sảnh chính và buồng điện thoại bằng gỗ lim.',
    photoHour: '09:00 - 10:30 (Ánh sáng hắt qua cửa kính vòm)',
    cuisine: 'Cà phê bệt Nhà thờ Đức Bà'
  },
  dinh_doc_lap: {
    tip: 'Tham quan hầm chỉ huy ngầm dưới lòng đất và ngắm rèm hoa đá hình đốt trúc thanh tao bao quanh tầng 2.',
    photoHour: '14:30 - 16:00 (Nắng vàng rọi sân cỏ phía trước)',
    cuisine: 'Cơm tấm Sài Gòn sườn bì chả trứng'
  },
  nha_rong: {
    tip: 'Đứng tại ban công tầng 2 ngắm tàu thuyền tấp nập trên sông Sài Gòn và tìm hiểu hành trình năm 1911.',
    photoHour: '16:45 - 17:45 (Hoàng hôn buông trên bến cảng)',
    cuisine: 'Nước mía sầu riêng & bánh mì phá lấu'
  },
  thu_ngu: {
    tip: 'Di tích tín hiệu hàng hải 1865, điểm ngắm toàn cảnh cầu Ba Son và bến Bạch Đằng lộng gió.',
    photoHour: '17:30 - 18:30 (Lên đèn lung linh ven sông)',
    cuisine: 'Trà tắc khổng lồ phố đi bộ Bạch Đằng'
  },
  duong_sach_hcm: {
    tip: 'Không gian rợp bóng cây xanh cổ thụ, ghé các sạp sách tìm ấn phẩm lịch sử Sài Gòn xưa.',
    photoHour: '08:00 - 10:00 (Bóng nắng xuyên qua tán me)',
    cuisine: 'Cà phê trứng & bánh sừng bò'
  },
  chua_hoi_khanh_bd: {
    tip: 'Chiêm bái tượng Phật Thích Ca nhập niết bàn trên mái chùa dài 52m lớn nhất châu Á.',
    photoHour: '08:30 - 10:00 (Thanh tịnh ban mai)',
    cuisine: 'Bánh bèo bì Mỹ Liên Chợ Búng'
  },
  lo_gom_dai_hung_bd: {
    tip: 'Chứng kiến nghệ nhân vuốt gốm thủ công bên lò rồng cổ 180 năm tuổi còn đỏ lửa.',
    photoHour: '13:30 - 15:30 (Ánh sáng lò gốm huyền ảo)',
    cuisine: 'Gỏi gà măng cụt Lái Thiêu'
  },
  hai_dang_vung_tau: {
    tip: 'Tháp hải đăng cổ nhất Việt Nam (1862), đi dạo dọc đường hoa sứ cổ thụ nở thơm ngát.',
    photoHour: '16:00 - 17:30 (Hoàng hôn biển Bãi Trước)',
    cuisine: 'Bánh bông lan trứng muối Gốc Cột Điện & Sữa chua cô Tiên'
  },
  bach_dinh_vung_tau: {
    tip: 'Biệt thự phong cách Pháp thế kỷ 19 với bộ sưu tập 19 khẩu thần công cổ và gốm sứ Khang Hy.',
    photoHour: '10:00 - 11:30 (Ánh sáng biển trong trẻo)',
    cuisine: 'Bánh khọt Cô Ba Vũng Tàu'
  },
  cu_chi_tunnels: {
    tip: 'Trải nghiệm chui hầm địa đạo tầng 1 và thưởng thức khoai mì chấm muối mè tại bếp Hoàng Cầm.',
    photoHour: '09:30 - 11:30 (Nắng rọi qua tán rừng nguyên sinh)',
    cuisine: 'Khoai mì luộc chấm muối mè & Bò tơ Củ Chi'
  },
  con_dao_prison: {
    tip: 'Viếng Nghĩa trang Hàng Dương và tìm hiểu chứng tích lịch sử kiên trung bất khuất của các chiến sĩ.',
    photoHour: '07:00 - 09:00 hoặc 20:00 - 22:00',
    cuisine: 'Hải sản tươi sống Côn Đảo & Mứt hạt bàng'
  }
};

export const generatePersonalizedItinerary = (options: ItineraryGenerationOptions): PersonalizedItinerary => {
  const themeInfo = THEME_DETAILS[options.theme] || THEME_DETAILS.architecture_classic;
  const transportInfo = TRANSPORT_DETAILS[options.transportMode] || TRANSPORT_DETAILS.walk;
  const guideId = options.tourGuideId || themeInfo.recommendedGuide || 'co_van_ba_son';
  const tourGuide = getAITourGuide(guideId);

  // Filter locations by theme and region
  let pool = [...LOCATIONS];
  if (options.regionFilter && options.regionFilter !== 'all') {
    pool = pool.filter(l => l.province === options.regionFilter);
    if (pool.length === 0) pool = [...LOCATIONS];
  }

  // Filter matching theme
  let matchingLocations = pool.filter(themeInfo.locationFilter);
  if (matchingLocations.length < 3) {
    matchingLocations = pool;
  }

  // Intelligent style and user preference priority ordering
  const favCategories = options.userPreferences?.favoriteCategories || [];
  const bookmarks = options.bookmarkedLandmarks || options.userPreferences?.bookmarkedLandmarks || [];

  matchingLocations.sort((a, b) => {
    let scoreA = 0;
    let scoreB = 0;

    // 1. Bookmarked landmarks get highest priority
    if (bookmarks.includes(a.id)) scoreA += 10;
    if (bookmarks.includes(b.id)) scoreB += 10;

    // 2. Matching user favorite categories
    if (favCategories.includes(a.category)) scoreA += 5;
    if (favCategories.includes(b.category)) scoreB += 5;

    // 3. Style priority ordering
    if (options.travelerStyle === 'scholar') {
      if (a.category === 'history') scoreA += 3;
      if (b.category === 'history') scoreB += 3;
    } else if (options.travelerStyle === 'photographer') {
      if (a.category === 'architecture') scoreA += 3;
      if (b.category === 'architecture') scoreB += 3;
    } else if (options.travelerStyle === 'foodie') {
      if (a.category === 'cuisine') scoreA += 3;
      if (b.category === 'cuisine') scoreB += 3;
    } else if (options.travelerStyle === 'spiritual') {
      if (a.category === 'culture') scoreA += 3;
      if (b.category === 'culture') scoreB += 3;
    } else if (options.travelerStyle === 'adventurer') {
      if (a.category === 'nature_coastal') scoreA += 3;
      if (b.category === 'nature_coastal') scoreB += 3;
    }

    return scoreB - scoreA;
  });

  // Determine stop count based on duration
  const stopCount = options.durationMode === 'half_day' ? 3 : options.durationMode === 'full_day' ? 5 : 7;
  const selectedLocs = matchingLocations.slice(0, stopCount);

  // Time schedules
  const startHour = 8;
  const startMinute = 0;
  let currentTotalMinutes = startHour * 60 + startMinute;
  let totalDistanceKm = 0;

  const stops: ItineraryStop[] = selectedLocs.map((loc, idx) => {
    const stayMinutes = options.pace === 'relaxed' ? 75 : options.pace === 'deep_dive' ? 90 : 60;
    const distance = idx === 0 ? 0 : Number((1.5 + idx * 1.2).toFixed(1));
    totalDistanceKm += distance;

    const travelMinutes = idx === 0 ? 0 : Math.round((distance / transportInfo.avgSpeedKmH) * 60) + 10;
    currentTotalMinutes += travelMinutes;

    const startH = Math.floor(currentTotalMinutes / 60);
    const startM = currentTotalMinutes % 60;
    const endTotal = currentTotalMinutes + stayMinutes;
    const endH = Math.floor(endTotal / 60);
    const endM = endTotal % 60;

    const formatTime = (h: number, m: number) => `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    const timeSlot = `${formatTime(startH, startM)} - ${formatTime(endH, endM)}`;

    currentTotalMinutes = endTotal;

    const aiData = AI_TIPS_DATABASE[loc.id] || {
      tip: `Khám phá các nét độc đáo và giải mã câu đố di sản tại ${loc.name}.`,
      photoHour: '08:00 - 10:00 (Ánh sáng tự nhiên)',
      cuisine: 'Đặc sản địa phương Nam Bộ'
    };

    const locNarrations = STOP_GUIDE_NARRATIONS[loc.id];
    const narrationText = locNarrations ? (locNarrations[guideId] || locNarrations['co_van_ba_son']) : `${tourGuide.name} chào bạn! Chúng ta đã tới ${loc.name}. ${loc.shortDesc}`;
    const trivia = TRIVIA_DATABASE[loc.id];

    return {
      locationId: loc.id,
      locationName: loc.name,
      province: loc.province,
      district: loc.district,
      order: idx + 1,
      timeSlot,
      durationMinutes: stayMinutes,
      distanceFromPrevKm: distance,
      travelMode: options.transportMode,
      activityHighlight: loc.shortDesc,
      aiLocalTip: aiData.tip,
      goldenPhotoHour: aiData.photoHour,
      mustTryCuisine: aiData.cuisine,
      guideVoiceNarration: narrationText,
      spotChallengeTrivia: trivia,
      coordinates: { lat: 10.7 + loc.y * 0.005, lng: 106.6 + loc.x * 0.005 },
      isVisited: idx === 0
    };
  });

  const totalDurationHours = options.durationMode === 'half_day' ? 3.5 : options.durationMode === 'full_day' ? 7.5 : 16;
  const totalLPBonus = stops.length * 60 + (options.durationMode === 'two_days' ? 250 : 150);

  return {
    id: `itinerary_${options.theme}_${Date.now()}`,
    title: `Lộ Trình: ${themeInfo.label}`,
    subtitle: themeInfo.subtitle,
    theme: options.theme,
    themeLabel: themeInfo.label,
    durationMode: options.durationMode,
    durationLabel: options.durationMode === 'half_day' ? 'Nửa Ngày (3 - 4 giờ)' : options.durationMode === 'full_day' ? '1 Ngày Trọn Vẹn' : '2 Ngày 1 Đêm (Liên Tỉnh)',
    transportMode: options.transportMode,
    transportLabel: transportInfo.label,
    startPoint: options.startPoint,
    pace: options.pace,
    totalDistanceKm: Number(totalDistanceKm.toFixed(1)),
    totalDurationHours,
    totalLPBonus,
    completionBadgeId: themeInfo.badgeId,
    tourGuideId: guideId,
    tourGuide,
    stops,
    createdAt: new Date().toISOString(),
    isActiveOnMap: true
  };
};

const ITINERARY_STORAGE_KEY = 'saigon_heritage_personalized_itinerary_v3';

export const getSavedItinerary = (): PersonalizedItinerary | null => {
  try {
    const raw = localStorage.getItem(ITINERARY_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
};

export const saveActiveItinerary = (itinerary: PersonalizedItinerary | null): void => {
  try {
    if (itinerary) {
      localStorage.setItem(ITINERARY_STORAGE_KEY, JSON.stringify(itinerary));
    } else {
      localStorage.removeItem(ITINERARY_STORAGE_KEY);
    }
  } catch (err) {
    console.error('Failed to save itinerary:', err);
  }
};
