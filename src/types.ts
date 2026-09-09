export type Province = 
  | 'TP. Hồ Chí Minh'
  | 'Bình Dương'
  | 'Bà Rịa - Vũng Tàu';

export type District = 
  | 'Quận 1' 
  | 'Quận 3' 
  | 'Quận 5' 
  | 'Quận 4' 
  | 'TP. Thủ Đức' 
  | 'Bình Thạnh'
  | 'Củ Chi'
  | 'Quận 1 / Quận 4'
  | 'Phú Nhuận / Quận 3'
  | 'TP. Thủ Dầu Một (Bình Dương)'
  | 'TP. Mới Bình Dương'
  | 'Huyện Dầu Tiếng (Bình Dương)'
  | 'TP. Vũng Tàu (Bà Rịa - Vũng Tàu)'
  | 'Huyện Côn Đảo (Bà Rịa - Vũng Tàu)'
  | 'Huyện Đất Đỏ (Bà Rịa - Vũng Tàu)';

export type Category = 
  | 'architecture'      // Kiến trúc & Cổ vật
  | 'history'           // Lịch sử Sài Gòn - Nam Bộ
  | 'cuisine'           // Ẩm thực & Hương vị xưa
  | 'culture'           // Phong tục, Tín ngưỡng, Lễ hội & Nghệ thuật
  | 'secret_alley'      // Hẻm phố & Ký ức đô thị
  | 'nature_coastal'    // Di sản biển đảo & Thắng cảnh thiên nhiên
  | 'nature'            // Thiên nhiên & Thắng cảnh
  | 'traditional_art';  // Đờn ca tài tử & Cải lương Nam Bộ

export type BadgeRarity = 'common' | 'rare' | 'epic' | 'legendary';

export type KnowledgeTier = 'basic' | 'intermediate' | 'advanced' | 'master';

export interface AITourScene {
  id: string;
  name: string;
  timeCode: string;
  cameraMode: 'aerial_drone' | 'ground_360' | 'interior_walk' | 'historical_reconstruction' | 'sunset_timelapse';
  cameraLabel: string;
  description: string;
  narratorVoiceover: string;
  visualHighlight: string;
  snapshotUrl?: string;
}

export interface AITourVideo {
  title: string;
  subtitle: string;
  duration: string;
  resolution: string;
  droneAlt: string;
  voiceGuide: string;
  scenes: AITourScene[];
}

export interface HistoricalNarration {
  id: string;
  title: string;
  voiceType: 'nam_bo_warm' | 'guide_standard' | 'elder_scholar';
  voiceLabel: string;
  duration: string;
  era: string;
  transcript: string;
  poemExcerpt?: string;
  historicalContext: string;
}

export interface Location3D {
  id: string;
  name: string;
  vietnameseName: string;
  title: string;
  province?: Province;
  district: District;
  category: Category;
  x: number; // 0 to 100 on map coordinate
  y: number; // 0 to 100 on map coordinate
  elevation: number; // 3D height
  builtYear: string;
  architect?: string;
  historicalPeriod: string;
  iconName: string;
  color: string;
  coverImage: string;
  thumbnail: string;
  shortDesc: string;
  fullHistory: string;
  architecturalHighlights: string[];
  culturalSignificance: string;
  secretFunFact: string;
  audioAmbientType: 'church_bell' | 'market_bustle' | 'river_wave' | 'traditional_music' | 'street_chime' | 'alley_echo' | 'sea_waves' | 'pottery_kiln' | 'cai_luong';
  poemVerse?: string;
  storyNarration?: string;
  caiLuongChant?: string;
  aiTourVideo?: AITourVideo;
  historicalNarrations?: HistoricalNarration[];
  activeExplorers?: number;
  heatScore?: number; // 0 to 100
  popularityRank?: number;
  trendingTag?: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  questIds: string[];
  isUnlocked: boolean;
}

export type PuzzleType = 
  | 'multiple_choice'   // Trắc nghiệm kiến thức
  | 'true_false'         // Đúng hay Sai
  | 'open_ended'         // Tự luận / Trả lời mở
  | 'cipher_text'        // Mật mã số / Chữ cổ
  | 'ordering'           // Sắp xếp thứ tự thời gian/bước làm
  | 'fill_blank';        // Điền từ còn thiếu vào điệu lý/lời ca

export interface QuestStep {
  id: string;
  title: string;
  tier?: KnowledgeTier;
  tierTitle?: string;
  bonusLP?: number;
  storyPrompt: string;
  clueVerse: string; // Thơ lục bát / câu hò / mật ngôn
  puzzleType: PuzzleType;
  puzzleData: {
    question: string;
    options?: string[]; // Cho multiple_choice hoặc true_false
    correctAnswer: string | number | boolean;
    explanation: string;
    keywords?: string[]; // Dùng để chấm tự luận thông minh
    hintLevel1: string;  // Manh mối khẽ khàng
    hintLevel2: string;  // Chỉ điểm lịch sử & tọa độ
    hintLevel3: string;  // Phân tích chuyên sâu & đáp án
  };
}

export interface Badge {
  id: string;
  name: string;
  title: string;
  category: Category;
  rarity: BadgeRarity;
  icon: string;
  color: string;
  bgGradient: string;
  description: string;
  culturalStory: string;
  perk: string;
  unlockedAt?: string;
}

export interface Quest {
  id: string;
  locationId: string;
  title: string;
  subtitle: string;
  category: Category;
  difficulty: 'Dễ' | 'Trung Bình' | 'Trung bình' | 'Khó' | 'Kỳ Công' | 'Huyền Thoại';
  level: number; // 1, 2, 3, 4
  estimatedMinutes: number;
  rewardLP: number;
  badgeId: string;
  loreChapter: string;
  description?: string;
  steps: QuestStep[];
  isCompleted?: boolean;
}

export interface HeritageSticker {
  id: string;
  name: string;
  icon: string;
  category: 'heritage' | 'emotion' | 'landmark' | 'food';
  meaning: string;
}

export interface DirectMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  recipientId: string;
  recipientName: string;
  text: string;
  sticker?: HeritageSticker;
  timestamp: string;
}

export interface ForumComment {
  id: string;
  authorName: string;
  authorAvatar: string;
  authorTitle: string;
  content: string;
  timestamp: string;
  likes: number;
  sticker?: HeritageSticker;
  replyToAuthor?: string;
}

export interface ForumPost {
  id: string;
  title: string;
  authorName: string;
  authorAvatar: string;
  authorTitle: string;
  category: 'hints' | 'history' | 'cuisine' | 'general' | 'showcase' | 'culture' | 'music';
  content: string;
  locationTag?: string;
  likes: number;
  isLiked?: boolean;
  commentsCount: number;
  comments: ForumComment[];
  timestamp: string;
  badgeEarned?: string;
  sticker?: HeritageSticker;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai' | 'player';
  senderName: string;
  senderAvatar?: string;
  text: string;
  timestamp: string;
  suggestedActions?: string[];
  locationContext?: string;
  hintLevel?: number;
  sticker?: HeritageSticker;
  sources?: Array<{ title: string; uri: string }>;
  groundingQueries?: string[];
}

export interface RewardItem {
  id: string;
  name: string;
  partner: string;
  category: 'ticket' | 'cuisine' | 'souvenir' | 'honor' | 'daily_gift';
  tier?: 'apprentice' | 'challenger' | 'legendary';
  costLP: number;
  requiredBadgesCount: number;
  requiredBadgeId?: string;
  requiredQuestsCount?: number;
  prestigeTitleRequired?: string;
  challengeRequirementText?: string;
  description: string;
  terms: string;
  expiryDays: number;
  remainingQuota: number;
  image: string;
  redeemedCode?: string;
  isRedeemed?: boolean;
  valueVND?: string; // Giá trị tương đương
  isExclusiveLimited?: boolean;
}

export interface TravelJournalEntry {
  id: string;
  locationId: string;
  locationName: string;
  province?: Province;
  district?: District;
  thumbnail?: string;
  coverImage?: string;
  visitedDate: string;
  note: string;
  mood: 'wonder' | 'nostalgic' | 'inspired' | 'peaceful' | 'proud' | 'excited';
  tags: string[];
  rating: number; // 1 to 5
  weather?: 'sunny' | 'sunset' | 'rain' | 'breeze' | 'night';
  photoUrl?: string;
  questCompleted?: boolean;
  badgeEarnedName?: string;
  isFavorite?: boolean;
  updatedAt: string;
}

export interface TraditionalSong {
  id: string;
  title: string;
  type: 'cai_luong' | 'don_ca_tai_tu' | 'ly_nam_bo';
  artist: string;
  duration: string;
  description: string;
  audioKeyNote: number; // Tần số gốc để tổng hợp âm thanh
  melodySteps: number[]; // Giai điệu ngũ cung mô phỏng
}

export interface LeaderboardUser {
  rank: number;
  id: string;
  name: string;
  avatar: string;
  title: string;
  lpPoints: number;
  badgesCount: number;
  completedCount: number;
  region: string;
}

export type CostumeId = 
  | 'costume_ngu_than'       // Áo Ngũ Thân Triều Nguyễn / Gia Định
  | 'costume_lemur_ao_dai'   // Áo Dài Tân Thời Lemur Sài Gòn
  | 'costume_ba_ba'          // Áo Bà Ba Phương Nam & Khăn Rằn
  | 'costume_ba_son_sailor'   // Đồng Phục Thủy Thủ Xưởng Ba Son
  | 'costume_don_ca_tai_tu'  // Lễ Phục Đờn Ca Tài Tử Lụa Gấm
  | 'costume_explorer_kaki';  // Trang Phục Thám Hiểm Rừng Sác Kaki

export type HeadwearId =
  | 'none'
  | 'head_non_la'            // Nón Lá Quai Thao
  | 'head_khan_dong'         // Khăn Đóng Hoàng Gia
  | 'head_non_tai_beo'       // Nón Tai Bèo Kháng Chiến
  | 'head_beret_vintage'     // Mũ Beret Ký Giả Sài Gòn Xưa
  | 'head_non_coi'           // Nón Cối Dã Ngoại
  | 'head_tram_cai_hoa_sen'; // Trâm Cài Bạc Hoa Sen

export type AccessoryId =
  | 'none'
  | 'acc_compass'            // La Bàn Đồng Thau Xoay 3D
  | 'acc_magnifier'          // Kính Lúp Soi Cổ Vật
  | 'acc_khan_ran'           // Khăn Rằn Nam Bộ
  | 'acc_the_bai'            // Thẻ Bài Ngự Tứ Triều Nguyễn
  | 'acc_kinh_vintage'       // Kính Cổ Tròn Đồi Mồi
  | 'acc_so_tay_but_tre'     // Sổ Tay Bìa Da & Bút Tre
  | 'acc_binh_inox';         // Bình Giữ Nhiệt Khắc Tọa Độ

export type AvatarPose = 'greeting' | 'scholar_inspect' | 'compass_guide' | 'confident_hero' | 'meditation';
export type AvatarAura = 'none' | 'royal_gold' | 'heritage_fire' | 'southern_ocean' | 'ancient_jade';
export type AvatarBackdrop = 'ben_thanh' | 'thu_ngu' | 'nha_rong' | 'ba_thien_hau' | 'lai_thieu_kiln' | 'vung_tau_lighthouse';

export interface AvatarCustomization {
  costumeId: CostumeId;
  headwearId: HeadwearId;
  accessoryId: AccessoryId;
  gender: 'male' | 'female' | 'explorer';
  skinTone: string; // Hex color or palette id
  hairStyle: 'traditional_bun' | 'vintage_wavy' | 'modern_short' | 'scholar_ponytail';
  hairColor: string;
  expression: 'smile' | 'scholarly' | 'proud' | 'focus';
  pose: AvatarPose;
  aura: AvatarAura;
  backdrop: AvatarBackdrop;
  unlockedCostumes: CostumeId[];
  unlockedHeadwears: HeadwearId[];
  unlockedAccessories: AccessoryId[];
}

export interface UserPreferences {
  favoriteCategories: Category[];
  preferredEras: string[];
  learningStyle: 'visual' | 'auditory' | 'reading' | 'interactive';
  dailyStudyGoalMinutes: number; // e.g. 15, 30, 45, 60
  preferredStudyTime: 'morning' | 'afternoon' | 'evening' | 'night';
  preferredGuideId: AITourGuideId;
  bookmarkedLandmarks: string[]; // List of location IDs
  autoPlayAudioEffects?: boolean;
  studyReminderEnabled?: boolean;
}

export interface DayStudyRecord {
  day: string; // 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'
  date: string; // YYYY-MM-DD
  minutes: number;
  questionsCount: number;
  completedGoal: boolean;
}

export interface LearningHabits {
  weeklyRecords: DayStudyRecord[];
  totalSessionsCompleted: number;
  longestDailyStreak: number;
  currentDailyStreak: number;
  averageSessionDurationMinutes: number;
  mostActiveTimeOfDay: string;
  categoryQuestsCompleted: Record<string, number>;
  quizAccuracyRate: number;
  lastStudyTimestamp: string;
}

export interface UserProfile {
  id: string;
  username: string; // Tên đăng nhập
  name: string;
  email?: string;
  title: string;
  avatar: string;
  level: number;
  exp: number;
  lpPoints: number;
  studyHours: number; // Tổng số giờ học sử & nghiên cứu di sản
  studyMinutes: number; // Phút tích lũy thêm
  learningStreakDays: number; // Chuỗi ngày học liên tục
  studySessionsCount: number; // Số buổi tham gia học & giải mã
  badgesUnlocked: string[];
  completedQuests: string[];
  redeemedRewardCodes: { rewardId: string; code: string; date: string; name: string }[];
  joinedDate: string;
  lastLoginDate?: string;
  lastSyncedAt?: string;
  isLoggedIn?: boolean;
  authProvider?: 'google' | 'custom' | 'guest';
  isGoogleLinked?: boolean;
  googleEmail?: string;
  avatarCustomization?: AvatarCustomization;
  activeItinerary?: PersonalizedItinerary;
  themeSkin?: HistoricalThemeId;
  customAccentColor?: string;
  gmailVerified?: boolean;
  preferences?: UserPreferences;
  learningHabits?: LearningHabits;
}

export type HistoricalThemeId = 
  | 'classic_amber' 
  | 'indochine' 
  | 'vintage_90s' 
  | 'gia_dinh_dynasty' 
  | 'ba_son_industrial'
  | 'lai_thieu_ceramic'
  | 'vung_tau_ocean'
  | 'lotus_pink';

export interface HistoricalThemeSkin {
  id: HistoricalThemeId;
  name: string;
  era: string;
  tagline: string;
  description: string;
  previewColors: {
    primary: string;
    accent: string;
    background: string;
    border: string;
    cardBg?: string;
  };
  cardBgClass: string;
  borderClass: string;
  accentTextClass: string;
  headerGradient: string;
  buttonGradient?: string;
  glowColor?: string;
  badgeTag: string;
  iconName: string;
  musicMood: string;
  cssVariables?: Record<string, string>;
}

export type AITourGuideId = 
  | 'co_van_ba_son' 
  | 'co_ba_sai_gon' 
  | 'bac_ba_phi' 
  | 'phuot_thu_gen_z';

export interface AITourGuide {
  id: AITourGuideId;
  name: string;
  title: string;
  avatar: string;
  tagline: string;
  personality: string;
  greeting: string;
  voiceStyle: string;
  voicePitch: number;
  voiceRate: number;
  badge: string;
}

export type ItineraryThemeType = 
  | 'architecture_classic' 
  | 'river_ports_300' 
  | 'cuisine_flavors' 
  | 'pottery_spiritual' 
  | 'coastal_heroes' 
  | 'heroic_tunnels'
  | 'urban_sketch_vintage'
  | 'cipher_adventure';

export interface ItineraryStop {
  locationId: string;
  locationName: string;
  province?: Province;
  district: District;
  order: number;
  timeSlot: string; // e.g. "08:30 - 10:00"
  durationMinutes: number;
  distanceFromPrevKm: number;
  travelMode: 'walk' | 'cyclo' | 'waterbus' | 'hop_on_bus' | 'motorbike';
  activityHighlight: string;
  aiLocalTip: string;
  goldenPhotoHour: string;
  mustTryCuisine: string;
  coordinates: { lat: number; lng: number };
  isVisited?: boolean;
  guideVoiceNarration?: string;
  spotChallengeTrivia?: {
    question: string;
    answer: string;
    rewardLP: number;
  };
}

export interface PersonalizedItinerary {
  id: string;
  title: string;
  subtitle: string;
  theme: ItineraryThemeType;
  themeLabel: string;
  durationMode: 'half_day' | 'full_day' | 'two_days';
  durationLabel: string;
  transportMode: 'walk' | 'cyclo' | 'waterbus' | 'hop_on_bus' | 'motorbike';
  transportLabel: string;
  startPoint: string;
  pace: 'relaxed' | 'balanced' | 'deep_dive';
  totalDistanceKm: number;
  totalDurationHours: number;
  totalLPBonus: number;
  completionBadgeId?: string;
  stops: ItineraryStop[];
  tourGuideId?: AITourGuideId;
  tourGuide?: AITourGuide;
  createdAt: string;
  isActiveOnMap?: boolean;
}

export interface TravelerDirectoryUser {
  id: string;
  name: string;
  age: number;
  avatar: string;
  title: string;
  level: number;
  lpPoints: number;
  badgesCount: number;
  studyHours: number; // Số giờ học sử được vinh danh
  province: string;
  favoriteHeritage: string;
  bio: string;
  isOnline: boolean;
  friendStatus: 'none' | 'pending' | 'friends';
}
