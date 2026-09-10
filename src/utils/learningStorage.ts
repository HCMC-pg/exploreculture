// =========================================================================
// Enhanced Player Learning Memory & Traveler Equipment Storage System
// =========================================================================

export interface QuestStepAttempt {
  stepId: string;
  questionText: string;
  isCorrect: boolean;
  userAnswer: string | number | boolean;
  correctAnswer: string | number | boolean;
  explanation: string;
  attemptsCount: number;
  timestamp: string;
  timeSpentSec: number;
  note?: string;
  starred?: boolean;
}

export interface QuestRecord {
  questId: string;
  locationId: string;
  title: string;
  completedAt?: string;
  isCompleted: boolean;
  totalQuestions: number;
  correctCount: number;
  scorePercent: number;
  earnedLP: number;
  badgeId?: string;
  stepAttempts: Record<string, QuestStepAttempt>;
  timeSpentMinutes: number;
}

export interface EquippedGearItem {
  id: string;
  name: string;
  category: 'headwear' | 'tool' | 'bag' | 'accessory' | 'journal' | 'water' | 'attire' | 'relic';
  icon: string;
  buffName: string;
  buffDescription: string;
  acquiredDate: string;
  isEquipped: boolean;
  bonusLPPercent?: number;
  bonusExpPercent?: number;
  hintSpeedBonus?: boolean;
  filterWrongOptionBonus?: boolean;
  protectStreakBonus?: boolean;
  criticalLPRate?: number;
  setPiece?: string;
}

export interface LearningDailyStreak {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string; // YYYY-MM-DD
  todayQuestionsAnswered: number;
  dailyGoal: number; // e.g. 5 questions per day
  streakHistory: string[]; // List of YYYY-MM-DD active
  streakFreezeTokens: number;
}

export interface PlayerLearningMemory {
  userId: string;
  questRecords: Record<string, QuestRecord>;
  totalQuestionsAnswered: number;
  totalCorrectAnswers: number;
  overallAccuracy: number;
  totalStudyMinutes: number;
  dailyStreak: LearningDailyStreak;
  equippedGear: Record<string, EquippedGearItem>; // Gear ID -> Gear Item
  studyNotes: Record<string, string>; // stepId -> custom note
  starredQuestions: string[]; // List of stepIds
  postsCreatedCount?: number; // Total forum posts created by player
  myPostIds?: string[]; // Forum post IDs created by player
  totalLikesReceived?: number;
  lastUpdated: string;
}

const STORAGE_KEY = 'saigon_heritage_learning_memory_v2';
const INVENTORY_KEY = 'saigon_heritage_equipped_gear_v2';

// Rich initial gear unlocked for all heritage travelers with authentic cultural resonance
export const DEFAULT_STARTER_GEAR: Record<string, EquippedGearItem> = {
  rew_gear_compass: {
    id: 'rew_gear_compass',
    name: 'La Bàn Đồng Thau Du Khách Phương Nam 1862',
    category: 'tool',
    icon: 'Compass',
    buffName: 'Định Hướng Tri Thức',
    buffDescription: 'Giảm 50% thời gian chờ mở gợi ý AI và +10% LP khi khám phá',
    acquiredDate: new Date().toLocaleDateString('vi-VN'),
    isEquipped: true,
    bonusLPPercent: 10,
    hintSpeedBonus: true,
    setPiece: 'phuong_nam'
  },
  rew_gear_scarf: {
    id: 'rew_gear_scarf',
    name: 'Khăn Rằn Nam Bộ Sợi Bông Dệt Thủ Công',
    category: 'accessory',
    icon: 'Sparkles',
    buffName: 'Hồn Cốt Phương Nam',
    buffDescription: 'Tăng +15% EXP cho mỗi câu đố và kích hoạt bộ Khí Phách Lữ Khách',
    acquiredDate: new Date().toLocaleDateString('vi-VN'),
    isEquipped: true,
    bonusExpPercent: 15,
    setPiece: 'phuong_nam'
  },
  rew_gear_bucket_hat: {
    id: 'rew_gear_bucket_hat',
    name: 'Nón Tai Bèo Thám Hiểm Rừng Sác UPF 50+',
    category: 'headwear',
    icon: 'Crown',
    buffName: 'Bền Lòng Thám Hiểm',
    buffDescription: 'Tăng +15% EXP và kích hoạt khiên bảo vệ chuỗi ngày streak',
    acquiredDate: new Date().toLocaleDateString('vi-VN'),
    isEquipped: true,
    bonusExpPercent: 15,
    protectStreakBonus: true,
    setPiece: 'phuong_nam'
  },
  rew_gear_flashlight: {
    id: 'rew_gear_flashlight',
    name: 'Đèn Pin Thấu Kính Địa Đạo Củ Chi',
    category: 'tool',
    icon: 'Flashlight',
    buffName: 'Rọi Sáng Địa Đạo',
    buffDescription: 'Tự động soi rọi và loại bỏ 1 phương án sai trong câu đố trắc nghiệm',
    acquiredDate: new Date().toLocaleDateString('vi-VN'),
    isEquipped: true,
    filterWrongOptionBonus: true
  },
  rew_gear_magnifier: {
    id: 'rew_gear_magnifier',
    name: 'Kính Lúp Khảo Cổ Hoa Sen Đồng',
    category: 'tool',
    icon: 'Search',
    buffName: 'Nhãn Quan Sử Gia',
    buffDescription: 'Tăng +20% LP thưởng khi giải đúng câu đố ngay từ lần thử đầu tiên',
    acquiredDate: new Date().toLocaleDateString('vi-VN'),
    isEquipped: true,
    bonusLPPercent: 20
  },
  rew_gear_ba_ba: {
    id: 'rew_gear_ba_ba',
    name: 'Áo Bà Ba Lụa Tân Châu Truyền Thống',
    category: 'attire',
    icon: 'Shirt',
    buffName: 'Phong Thái Nam Bộ',
    buffDescription: 'Tăng +25% EXP học thuật và 25% tỷ lệ nhận LP bạo kích (Critical LP)',
    acquiredDate: new Date().toLocaleDateString('vi-VN'),
    isEquipped: true,
    bonusExpPercent: 25,
    criticalLPRate: 25
  },
  rew_gear_tumbler: {
    id: 'rew_gear_tumbler',
    name: 'Bình Giữ Nhiệt Lữ Khách 1892',
    category: 'water',
    icon: 'Coffee',
    buffName: 'Sức Bền Hành Trình',
    buffDescription: 'Tăng +12% LP cho mọi trạm khảo cứu và duy trì năng lượng dẻo dai',
    acquiredDate: new Date().toLocaleDateString('vi-VN'),
    isEquipped: false,
    bonusLPPercent: 12
  },
  rew_gear_seal: {
    id: 'rew_gear_seal',
    name: 'Kỳ Lân Ấn Chương Cố Vấn Ba Son',
    category: 'relic',
    icon: 'Award',
    buffName: 'Ấn Tín Bách Khoa',
    buffDescription: 'Tăng +30% LP toàn bộ di tích và tỏa vầng hào quang Học Giả Phương Nam',
    acquiredDate: new Date().toLocaleDateString('vi-VN'),
    isEquipped: false,
    bonusLPPercent: 30
  }
};

export const getTodayDateString = (): string => {
  return new Date().toISOString().split('T')[0];
};

export const getLearningMemory = (): PlayerLearningMemory => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed: PlayerLearningMemory = JSON.parse(raw);
      // Ensure all upgraded wardrobe gear is merged so players immediately receive new buffs
      parsed.equippedGear = {
        ...DEFAULT_STARTER_GEAR,
        ...(parsed.equippedGear || {})
      };
      if (parsed.postsCreatedCount === undefined) {
        parsed.postsCreatedCount = 0;
      }
      if (!Array.isArray(parsed.myPostIds)) {
        parsed.myPostIds = [];
      }
      return parsed;
    }
  } catch (err) {
    console.error('Failed to load learning memory:', err);
  }

  const today = getTodayDateString();
  const initialMemory: PlayerLearningMemory = {
    userId: 'user_sg_exp_01',
    questRecords: {},
    totalQuestionsAnswered: 0,
    totalCorrectAnswers: 0,
    overallAccuracy: 0,
    totalStudyMinutes: 0,
    dailyStreak: {
      currentStreak: 1,
      longestStreak: 1,
      lastActiveDate: today,
      todayQuestionsAnswered: 0,
      dailyGoal: 5,
      streakHistory: [today],
      streakFreezeTokens: 2
    },
    equippedGear: DEFAULT_STARTER_GEAR,
    postsCreatedCount: 0,
    myPostIds: [],
    totalLikesReceived: 12,
    studyNotes: {},
    starredQuestions: [],
    lastUpdated: new Date().toISOString()
  };

  saveLearningMemory(initialMemory);
  return initialMemory;
};

export const saveLearningMemory = (memory: PlayerLearningMemory): void => {
  try {
    memory.lastUpdated = new Date().toISOString();
    // Recalculate stats
    let totalAnswered = 0;
    let totalCorrect = 0;
    Object.values(memory.questRecords).forEach(q => {
      Object.values(q.stepAttempts).forEach(step => {
        totalAnswered++;
        if (step.isCorrect) totalCorrect++;
      });
    });
    memory.totalQuestionsAnswered = totalAnswered;
    memory.totalCorrectAnswers = totalCorrect;
    memory.overallAccuracy = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;

    localStorage.setItem(STORAGE_KEY, JSON.stringify(memory));
  } catch (err) {
    console.error('Failed to save learning memory:', err);
  }
};

// Record an individual question attempt
export const recordQuestionAttempt = (
  questId: string,
  locationId: string,
  questTitle: string,
  stepId: string,
  questionText: string,
  isCorrect: boolean,
  userAnswer: string | number | boolean,
  correctAnswer: string | number | boolean,
  explanation: string,
  timeSpentSec: number = 10
): PlayerLearningMemory => {
  const memory = getLearningMemory();
  const today = getTodayDateString();

  if (!memory.questRecords[questId]) {
    memory.questRecords[questId] = {
      questId,
      locationId,
      title: questTitle,
      isCompleted: false,
      totalQuestions: 20,
      correctCount: 0,
      scorePercent: 0,
      earnedLP: 0,
      stepAttempts: {},
      timeSpentMinutes: 0
    };
  }

  const questRecord = memory.questRecords[questId];
  const prevAttempt = questRecord.stepAttempts[stepId];
  const attemptsCount = prevAttempt ? prevAttempt.attemptsCount + 1 : 1;

  questRecord.stepAttempts[stepId] = {
    stepId,
    questionText,
    isCorrect,
    userAnswer,
    correctAnswer,
    explanation,
    attemptsCount,
    timestamp: new Date().toISOString(),
    timeSpentSec: (prevAttempt?.timeSpentSec || 0) + timeSpentSec,
    note: prevAttempt?.note || memory.studyNotes[stepId] || '',
    starred: prevAttempt?.starred || memory.starredQuestions.includes(stepId)
  };

  // Recalculate quest correctness
  const allAttempts = Object.values(questRecord.stepAttempts);
  questRecord.correctCount = allAttempts.filter(a => a.isCorrect).length;
  questRecord.scorePercent = Math.round((questRecord.correctCount / Math.max(1, allAttempts.length)) * 100);
  questRecord.timeSpentMinutes += Math.round(timeSpentSec / 60);

  // Update Daily Streak
  const streak = memory.dailyStreak;
  if (streak.lastActiveDate === today) {
    streak.todayQuestionsAnswered += 1;
  } else {
    // Check if yesterday or gap
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    if (streak.lastActiveDate === yesterday) {
      streak.currentStreak += 1;
      streak.longestStreak = Math.max(streak.longestStreak, streak.currentStreak);
    } else {
      // Gap day
      streak.currentStreak = 1;
    }
    streak.lastActiveDate = today;
    streak.todayQuestionsAnswered = 1;
    if (!streak.streakHistory.includes(today)) {
      streak.streakHistory.push(today);
    }
  }

  memory.totalStudyMinutes += Math.max(1, Math.round(timeSpentSec / 60));
  saveLearningMemory(memory);
  return memory;
};

// Record complete quest finish
export const recordQuestFinish = (
  questId: string,
  locationId: string,
  questTitle: string,
  totalQuestions: number,
  correctCount: number,
  earnedLP: number,
  badgeId?: string
): PlayerLearningMemory => {
  const memory = getLearningMemory();
  if (!memory.questRecords[questId]) {
    memory.questRecords[questId] = {
      questId,
      locationId,
      title: questTitle,
      isCompleted: true,
      totalQuestions,
      correctCount,
      scorePercent: Math.round((correctCount / Math.max(1, totalQuestions)) * 100),
      earnedLP,
      badgeId,
      completedAt: new Date().toISOString(),
      stepAttempts: {},
      timeSpentMinutes: 15
    };
  } else {
    const q = memory.questRecords[questId];
    q.isCompleted = true;
    q.completedAt = new Date().toISOString();
    q.totalQuestions = Math.max(totalQuestions, Object.keys(q.stepAttempts).length);
    q.correctCount = correctCount;
    q.scorePercent = Math.round((correctCount / Math.max(1, q.totalQuestions)) * 100);
    q.earnedLP = earnedLP;
    if (badgeId) q.badgeId = badgeId;
  }

  saveLearningMemory(memory);
  return memory;
};

// Get list of wrong questions for study & review
export const getReviewQuestions = (): QuestStepAttempt[] => {
  const memory = getLearningMemory();
  const reviewList: QuestStepAttempt[] = [];

  Object.values(memory.questRecords).forEach(quest => {
    Object.values(quest.stepAttempts).forEach(step => {
      if (!step.isCorrect || step.starred) {
        reviewList.push(step);
      }
    });
  });

  return reviewList.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

// Toggle Star Question
export const toggleStarQuestion = (stepId: string): boolean => {
  const memory = getLearningMemory();
  const idx = memory.starredQuestions.indexOf(stepId);
  let isStarred = false;
  if (idx >= 0) {
    memory.starredQuestions.splice(idx, 1);
    isStarred = false;
  } else {
    memory.starredQuestions.push(stepId);
    isStarred = true;
  }

  // Update in attempts
  Object.values(memory.questRecords).forEach(quest => {
    if (quest.stepAttempts[stepId]) {
      quest.stepAttempts[stepId].starred = isStarred;
    }
  });

  saveLearningMemory(memory);
  return isStarred;
};

// Save custom study note
export const saveStudyNote = (stepId: string, note: string): void => {
  const memory = getLearningMemory();
  memory.studyNotes[stepId] = note;
  Object.values(memory.questRecords).forEach(quest => {
    if (quest.stepAttempts[stepId]) {
      quest.stepAttempts[stepId].note = note;
    }
  });
  saveLearningMemory(memory);
};

// Equip or Unequip Traveler Gear
export const toggleEquipGear = (gearId: string): boolean => {
  const memory = getLearningMemory();
  if (memory.equippedGear[gearId]) {
    memory.equippedGear[gearId].isEquipped = !memory.equippedGear[gearId].isEquipped;
    saveLearningMemory(memory);
    return memory.equippedGear[gearId].isEquipped;
  }
  return false;
};

// Add new gear to player inventory
export const addGearToInventory = (gear: EquippedGearItem): void => {
  const memory = getLearningMemory();
  memory.equippedGear[gear.id] = {
    ...gear,
    isEquipped: true,
    acquiredDate: new Date().toLocaleDateString('vi-VN')
  };
  saveLearningMemory(memory);
};

// Equip all optimal gear at once
export const equipAllOptimalGear = (): void => {
  const memory = getLearningMemory();
  Object.keys(memory.equippedGear).forEach(id => {
    memory.equippedGear[id].isEquipped = true;
  });
  saveLearningMemory(memory);
};

// Unequip all gear
export const unequipAllGear = (): void => {
  const memory = getLearningMemory();
  Object.keys(memory.equippedGear).forEach(id => {
    memory.equippedGear[id].isEquipped = false;
  });
  saveLearningMemory(memory);
};

// Record user post creation, awards LP & EXP, and tracks in memory
export const recordPlayerPostCreation = (postId: string): { totalPosts: number; earnedLP: number; earnedExp: number } => {
  const memory = getLearningMemory();
  const currentCount = memory.postsCreatedCount || 0;
  const currentPosts = memory.myPostIds || [];
  
  memory.postsCreatedCount = currentCount + 1;
  if (!currentPosts.includes(postId)) {
    memory.myPostIds = [postId, ...currentPosts];
  }
  memory.lastUpdated = new Date().toISOString();
  saveLearningMemory(memory);

  return {
    totalPosts: memory.postsCreatedCount,
    earnedLP: 50,
    earnedExp: 35
  };
};

// Get current active Traveler Buffs with Synergy Sets
export const getActiveTravelerBuffs = () => {
  const memory = getLearningMemory();
  const equipped = Object.values(memory.equippedGear).filter(g => g.isEquipped);

  // Check Set Synergy: Bộ Lữ Khách Phương Nam (La Bàn + Khăn Rằn + Nón Tai Bèo)
  const hasPhuongNamSet = 
    equipped.some(g => g.id === 'rew_gear_compass') &&
    equipped.some(g => g.id === 'rew_gear_scarf') &&
    equipped.some(g => g.id === 'rew_gear_bucket_hat');

  const baseExtraLP = equipped.reduce((acc, g) => acc + (g.bonusLPPercent || 0), 0);
  const baseExtraExp = equipped.reduce((acc, g) => acc + (g.bonusExpPercent || 0), 0);

  return {
    extraLPPercent: baseExtraLP + (hasPhuongNamSet ? 15 : 0),
    extraExpPercent: baseExtraExp + (hasPhuongNamSet ? 15 : 0),
    hintSpeedBonus: equipped.some(g => g.hintSpeedBonus),
    filterWrongOptionBonus: equipped.some(g => g.filterWrongOptionBonus),
    protectStreakBonus: equipped.some(g => g.protectStreakBonus) || hasPhuongNamSet,
    criticalLPRate: equipped.reduce((acc, g) => acc + (g.criticalLPRate || 0), 0),
    hasPhuongNamSet,
    setSynergyName: hasPhuongNamSet ? 'Khí Phách Lữ Khách Phương Nam (+15% LP/EXP, Giữ Chuỗi)' : undefined,
    equippedCount: equipped.length,
    equippedItems: equipped
  };
};

// =========================================================================
// User Preferences & Learning Habits Management
// =========================================================================

import { UserPreferences, LearningHabits, DayStudyRecord } from '../types';

const PREFERENCES_STORAGE_KEY = 'saigon_heritage_user_preferences_v2';
const HABITS_STORAGE_KEY = 'saigon_heritage_learning_habits_v2';

export const getDefaultPreferences = (): UserPreferences => ({
  favoriteCategories: ['architecture', 'history', 'cuisine', 'culture'],
  preferredEras: ['Thời Chúa Nguyễn & Gia Định', 'Sài Gòn - Gia Định Xưa', 'Kháng Chiến Nam Bộ'],
  learningStyle: 'interactive',
  dailyStudyGoalMinutes: 20,
  preferredStudyTime: 'evening',
  preferredGuideId: 'co_van_ba_son',
  bookmarkedLandmarks: ['loc_ben_thanh', 'loc_duc_ba', 'loc_nha_rong'],
  autoPlayAudioEffects: true,
  studyReminderEnabled: true
});

export const getUserPreferences = (): UserPreferences => {
  try {
    const raw = localStorage.getItem(PREFERENCES_STORAGE_KEY);
    if (raw) {
      return { ...getDefaultPreferences(), ...JSON.parse(raw) };
    }
  } catch (e) {
    console.warn('Could not read user preferences:', e);
  }
  return getDefaultPreferences();
};

export const saveUserPreferences = (prefs: UserPreferences): void => {
  try {
    localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(prefs));
  } catch (e) {
    console.warn('Could not save user preferences:', e);
  }
};

export const toggleBookmarkLocation = (locationId: string): string[] => {
  const prefs = getUserPreferences();
  const bookmarks = Array.isArray(prefs.bookmarkedLandmarks) ? [...prefs.bookmarkedLandmarks] : [];
  const idx = bookmarks.indexOf(locationId);
  if (idx >= 0) {
    bookmarks.splice(idx, 1);
  } else {
    bookmarks.push(locationId);
  }
  prefs.bookmarkedLandmarks = bookmarks;
  saveUserPreferences(prefs);
  return bookmarks;
};

export const generateWeeklyHabitRecords = (): DayStudyRecord[] => {
  const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  const today = new Date();
  const records: DayStudyRecord[] = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today.getTime() - i * 86400000);
    const dayLabel = days[d.getDay()];
    const dateStr = d.toISOString().split('T')[0];
    
    // Base simulation values enhanced by actual progress
    const isToday = i === 0;
    const baseMinutes = isToday ? 15 : Math.floor(10 + ((d.getDate() * 7) % 25));
    const baseQuestions = isToday ? 4 : Math.floor(2 + ((d.getDate() * 3) % 6));

    records.push({
      day: dayLabel,
      date: dateStr,
      minutes: baseMinutes,
      questionsCount: baseQuestions,
      completedGoal: baseMinutes >= 15
    });
  }

  return records;
};

export const getLearningHabits = (): LearningHabits => {
  try {
    const raw = localStorage.getItem(HABITS_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Could not read learning habits:', e);
  }

  const defaultHabits: LearningHabits = {
    weeklyRecords: generateWeeklyHabitRecords(),
    totalSessionsCompleted: 12,
    longestDailyStreak: 7,
    currentDailyStreak: 3,
    averageSessionDurationMinutes: 18,
    mostActiveTimeOfDay: '19:30 - 21:00 (Buổi Tối Tĩnh Lặng)',
    categoryQuestsCompleted: {
      architecture: 4,
      history: 3,
      cuisine: 2,
      culture: 3,
      traditional_art: 1
    },
    quizAccuracyRate: 88,
    lastStudyTimestamp: new Date().toISOString()
  };

  saveLearningHabits(defaultHabits);
  return defaultHabits;
};

export const saveLearningHabits = (habits: LearningHabits): void => {
  try {
    localStorage.setItem(HABITS_STORAGE_KEY, JSON.stringify(habits));
  } catch (e) {
    console.warn('Could not save learning habits:', e);
  }
};

// Sync learning progress to backend server
export const syncProgressToBackend = async (userProfile: any): Promise<boolean> => {
  try {
    const response = await fetch('/api/user/save-progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userProfile: {
          ...userProfile,
          preferences: getUserPreferences(),
          learningHabits: getLearningHabits(),
          learningMemory: getLearningMemory()
        }
      })
    });
    return response.ok;
  } catch (e) {
    console.warn('Background progress sync to server postponed (offline/local fallback active):', e);
    return false;
  }
};
