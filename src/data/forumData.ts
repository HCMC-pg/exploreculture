import { ForumPost, HeritagePoll } from '../types';

export const INITIAL_HERITAGE_POLLS: HeritagePoll[] = [
  {
    id: 'poll_1',
    question: 'Tranh Luận Học Thuật: Chi tiết kiến trúc nào tại Dinh Độc Lập thể hiện minh triết Đông Phương sâu sắc nhất?',
    category: 'history',
    locationTag: 'Dinh Độc Lập',
    totalVotes: 298,
    discussionPrompt: 'KTS Ngô Viết Thụ đã phối hợp tài tình các chữ Hán phong thủy và lam rèm trúc cản nắng nhiệt đới.',
    options: [
      { id: 'opt_1_1', text: 'Rèm hoa đá hình đốt trúc lầu 2 (Khí tiết quân tử, cản nắng nhiệt đới)', votes: 142 },
      { id: 'opt_1_2', text: 'Mặt bằng tổng thể triết lý chữ Hán: CÁT - KHẨU - TRUNG - CHỦ', votes: 104 },
      { id: 'opt_1_3', text: 'Hệ thống boong ngầm chỉ huy thời chiến kiên cố', votes: 52 }
    ]
  },
  {
    id: 'poll_2',
    question: 'Phong Vị Đô Thành: Thức uống bạn yêu thích nhất khi ngồi đàm đạo di sản phương Nam?',
    category: 'cuisine',
    locationTag: 'Phố Cà Phê Vợt',
    totalVotes: 326,
    discussionPrompt: 'Văn hóa cà phê vợt và thức uống thảo mộc gắn liền với ký ức sông nước bao thế hệ.',
    options: [
      { id: 'opt_2_1', text: 'Bạc xỉu nóng cà phê vợt thơm lừng sữa đặc', votes: 178 },
      { id: 'opt_2_2', text: 'Cà phê đen phin đậm đà nguyên chất', votes: 94 },
      { id: 'opt_2_3', text: 'Nước mía lau hoa cúc mát lành góc Chợ Lớn', votes: 54 }
    ]
  }
];

export const LIVE_COMMUNITY_ACTIVITIES = [
  { id: 'act_1', user: 'Trần Văn Kiệt', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&q=80', action: 'vừa hoàn thành khảo cứu thực địa tại', target: 'Thủy Xưởng Ba Son', reward: '+120 LP', time: 'Vừa xong' },
  { id: 'act_2', user: 'Lê Thảo My', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=160&q=80', action: 'vừa chia sẻ ảnh ký họa cổ kính tại', target: 'Hào Sĩ Phường (Q5)', reward: '📸 Ký Họa', time: '1 phút trước' },
  { id: 'act_3', user: 'Nguyễn Minh Khang', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=160&q=80', action: 'vừa giải mã chuỗi chuông 6 âm giai', target: 'Nhà Thờ Đức Bà', reward: '+80 LP', time: '2 phút trước' },
  { id: 'act_4', user: 'Đặng Ngọc Hân', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=160&q=80', action: 'vừa check-in và gửi lời chào từ', target: 'Bạch Dinh Vũng Tàu', reward: '⚓ Hải Đăng', time: '4 phút trước' },
  { id: 'act_5', user: 'Cố Vấn Ba Son (AI)', avatar: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=160&q=80', action: 'vừa trao tặng Điểm Uy Danh cho lữ khách', target: 'Thảo luận Cổ Thư', reward: '+50 Uy Danh', time: '5 phút trước' }
];

export const INITIAL_FORUM_POSTS: ForumPost[] = [
  {
    id: 'post_pinned_1',
    title: '📜 [Ghim Ban Cố Vấn] Lộ trình khảo cứu liên tỉnh 21 di sản: TP.HCM - Bình Dương - Vũng Tàu',
    authorName: 'Cố Vấn Ba Son (AI Học Thuật)',
    authorAvatar: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=160&q=80',
    authorTitle: 'Cố Vấn Di Sản Phương Nam',
    category: 'history',
    content: 'Chào mừng các lữ khách đến với Diễn Đàn Khảo Cứu Sài Gòn Kỳ Bí!\n\nNhằm giúp các bạn thu thập đủ 21 Huy hiệu Di sản và tích lũy Điểm Uy Danh nhanh nhất, Ban Cố Vấn khuyến nghị:\n1. Bắt đầu từ trục di sản sông Sài Gòn: Chu Sư Xưởng Ba Son -> Bến Nhà Rồng -> Bưu Điện Trung Tâm;\n2. Khám phá làng nghề phương Nam tại Bình Dương: Lò gốm cổ Đại Hưng 160 năm nung củi & Sơn mài Tương Bình Hiệp;\n3. Hướng biển Đông tại Vũng Tàu: Bạch Dinh & Cổ vật tàu đắm Hòn Cau thế kỷ 17.\n\nChúc quý lữ khách luôn sáng tâm và chân cứng đá mềm!',
    locationTag: 'Toàn Vùng Đông Nam Bộ',
    likes: 156,
    isPinned: true,
    imageUrl: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=800&q=80',
    commentsCount: 8,
    timestamp: 'Đã ghim',
    badgeEarned: 'badge_ba_son',
    comments: [
      {
        id: 'c_pinned_1',
        authorName: 'Tiến Sĩ Trần Nam',
        authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80',
        authorTitle: 'Cố Vấn Di Sản Cổ',
        content: 'Một cẩm nang định hướng tuyệt vời! Các bạn trẻ nhớ chú ý ghi chép lại niên biểu và hiện vật độc bản tại từng trạm dừng chân nhé.',
        timestamp: '2 giờ trước',
        likes: 18
      }
    ]
  },
  {
    id: 'post_1',
    title: 'Kinh nghiệm giải mã câu đố gạch Marseille ở Nhà Thờ Đức Bà',
    authorName: 'Minh Khang (Lữ Khách Bậc Thầy)',
    authorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
    authorTitle: 'Nhà Giám Định Di Sản',
    category: 'hints',
    content: 'Chào cả nhà, mình vừa hoàn thành nhiệm vụ ở Nhà Thờ Đức Bà sáng nay! Cho bạn nào đang kẹt ở câu hỏi về nguồn gốc gạch: hãy chú ý đến chi tiết tàu buồm và nước Pháp nhé. Gạch đỏ này không hề trát vữa nhưng chống rêu cực đỉnh, nung từ cảng Marseille. Bác nào kẹt chỗ 6 quả chuông thì hỏi Trợ lý Ba Son gợi ý cấp 1 là ra ngay!',
    locationTag: 'Nhà thờ Đức Bà Sài Gòn',
    imageUrl: 'https://images.unsplash.com/photo-1569154941061-e231b4725ef1?auto=format&fit=crop&w=800&q=80',
    likes: 42,
    commentsCount: 6,
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
    imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80',
    likes: 68,
    commentsCount: 4,
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
  },
  {
    id: 'post_3',
    title: 'Thảo luận: Ý nghĩa chữ CÁT (吉) trong mặt bằng Dinh Độc Lập',
    authorName: 'Tiến Sĩ Lịch Sử Trần Nam',
    authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
    authorTitle: 'Cố Vấn Di Sản Cổ',
    category: 'history',
    content: 'KTS Ngô Viết Thụ đã lồng ghép triết học phương Đông vô cùng tài tình. Không chỉ có chữ CÁT ở tổng thể, mà nhìn thẳng là chữ KHẨU và chữ TRUNG, trên nóc là lầu Tứ phương vô sự. Có bạn nào nhận ra những đốt trúc thanh cao quanh bao lơn tầng 2 chưa?',
    locationTag: 'Dinh Độc Lập',
    likes: 95,
    commentsCount: 9,
    timestamp: '1 ngày trước',
    badgeEarned: 'badge_dinh_doc_lap',
    comments: [
      {
        id: 'c_4',
        authorName: 'Ngọc Lan',
        authorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80',
        authorTitle: 'Kiến Trúc Sư Trẻ',
        content: 'Dạ cháu thấy rồi ạ! Hệ lam đốt trúc chắn nắng nhiệt đới cực kỳ thông minh mà lại thuần phong mỹ tục Việt Nam.',
        timestamp: '18 giờ trước',
        likes: 21
      }
    ]
  },
  {
    id: 'post_4',
    title: 'Top 3 quán cà phê vợt và bánh mì lâu đời nhất Sài Gòn nên ghé',
    authorName: 'Bếp Trưởng Sài Thành',
    authorAvatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=120&q=80',
    authorTitle: 'Sành Ăn Đất Gia Định',
    category: 'cuisine',
    content: 'Làm xong nhiệm vụ ẩm thực nhận ngay 160 LP, mình xin gợi ý cho anh em: 1. Cà phê Vợt Phan Đình Phùng (Phú Nhuận - mở 24/7); 2. Cà phê Ba Lù (Chợ Phùng Hưng Q5 chắt lọc bằng bơ thơm lừng); 3. Bánh mì Huỳnh Hoa & Bánh mì Bảy Hổ nức tiếng.',
    locationTag: 'Phố Cà Phê Vợt',
    likes: 114,
    commentsCount: 15,
    timestamp: '1 ngày trước',
    badgeEarned: 'badge_am_thuc_vot',
    comments: []
  }
];

export const INITIAL_COMMUNITY_MESSAGES = [
  {
    id: 'msg_1',
    senderName: 'Lữ Khách Sài Gòn 99',
    senderAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
    text: 'Có ai đang săn huy hiệu Chùa Bà Thiên Hậu ở Quận 5 không? Chùa hôm nay đông vui và hương trầm thơm ngát!',
    timestamp: '10:14'
  },
  {
    id: 'msg_2',
    senderName: 'Mai Anh (Thợ Săn Di Sản)',
    senderAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
    text: 'Mình vừa đổi được vé Saigon Waterbus hoàng hôn 350 LP rồi nè! Chiều nay ai đi chung chuyến 17h15 ngắm hoàng hôn Bến Nhà Rồng hông?',
    timestamp: '10:18'
  },
  {
    id: 'msg_3',
    senderName: 'Tuấn Khang',
    senderAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=120&q=80',
    text: 'Trợ lý Ba Son AI thông minh ghê, mình hỏi về nguồn gốc gạch Marseille giải thích tường tận từng chi tiết lịch sử luôn!',
    timestamp: '10:22'
  }
];
