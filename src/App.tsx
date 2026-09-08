/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { UserProfile, Location3D, Quest, Badge, RewardItem, PersonalizedItinerary, HistoricalThemeId } from './types';
import { LOCATIONS } from './data/locations';
import { QUESTS } from './data/quests';
import { BADGES } from './data/badges';
import { REWARDS } from './data/rewards';
import { INITIAL_FORUM_POSTS, INITIAL_COMMUNITY_MESSAGES } from './data/forumData';
import { getHistoricalSkin, applyGlobalThemeToDocument } from './data/historicalThemes';

import { Navbar } from './components/Navbar';
import { Map3DView } from './components/Map3DView';
import { QuestModal } from './components/QuestModal';
import { QuestListView } from './components/QuestListView';
import { BadgeCollection } from './components/BadgeCollection';
import { CommunityForum } from './components/CommunityForum';
import { RewardRedemption } from './components/RewardRedemption';
import { AIAssistantDrawer } from './components/AIAssistantDrawer';
import { UserProfileModal } from './components/UserProfileModal';
import { AuthModal } from './components/AuthModal';
import { ARHeritageScannerModal } from './components/ARHeritageScannerModal';
import { TravelJournalModal } from './components/TravelJournalModal';
import { PersonalizedItineraryModal } from './components/PersonalizedItineraryModal';
import { HistoricalThemeModal } from './components/HistoricalThemeModal';
import { AITourGuideWidget } from './components/AITourGuideWidget';
import { getSavedItinerary, saveActiveItinerary } from './utils/itineraryEngine';
import { sound } from './utils/audio';

const STORAGE_KEY = 'saigon_heritage_explorer_user_v3';

export default function App() {
  // Navigation & Atmosphere State
  const [activeTab, setActiveTab] = useState<'map' | 'quests' | 'badges' | 'forum' | 'rewards'>('map');
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // User Profile State (persisted locally with 0 starting points)
  const [user, setUser] = useState<UserProfile>(() => {
    const defaultUser: UserProfile = {
      id: 'guest_sg_01',
      username: 'lu_khach_phuong_nam',
      name: 'Lữ Khách Phương Nam',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=160&q=80',
      lpPoints: 0, // Reset to 0 points as requested
      level: 1,
      exp: 0,
      title: 'Lữ Khách Tập Sự',
      studyHours: 0,
      studyMinutes: 0,
      learningStreakDays: 1,
      studySessionsCount: 1,
      badgesUnlocked: [],
      completedQuests: [],
      redeemedRewardCodes: [],
      joinedDate: '2026',
      isLoggedIn: false,
      isGoogleLinked: false
    };
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...defaultUser,
          ...parsed,
          isLoggedIn: typeof parsed?.isLoggedIn === 'boolean' ? parsed.isLoggedIn : false,
          isGoogleLinked: typeof parsed?.isGoogleLinked === 'boolean' ? parsed.isGoogleLinked : false,
          studyHours: typeof parsed?.studyHours === 'number' ? parsed.studyHours : defaultUser.studyHours,
          studyMinutes: typeof parsed?.studyMinutes === 'number' ? parsed.studyMinutes : defaultUser.studyMinutes,
          learningStreakDays: typeof parsed?.learningStreakDays === 'number' ? parsed.learningStreakDays : defaultUser.learningStreakDays,
          badgesUnlocked: Array.isArray(parsed?.badgesUnlocked) ? parsed.badgesUnlocked : defaultUser.badgesUnlocked,
          completedQuests: Array.isArray(parsed?.completedQuests) ? parsed.completedQuests : defaultUser.completedQuests,
          lpPoints: typeof parsed?.lpPoints === 'number' ? parsed.lpPoints : defaultUser.lpPoints,
        };
      }
    } catch {}
    return defaultUser;
  });

  // Handle explicit progress reset back to 0 points
  const handleResetProgress = useCallback(() => {
    sound.playClick();
    const freshUser: UserProfile = {
      id: user.id || 'guest_sg_01',
      username: user.username || 'lu_khach_phuong_nam',
      name: user.name || 'Lữ Khách Phương Nam',
      avatar: user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=160&q=80',
      lpPoints: 0,
      level: 1,
      exp: 0,
      title: 'Lữ Khách Tập Sự',
      studyHours: 0,
      studyMinutes: 0,
      learningStreakDays: 1,
      studySessionsCount: 1,
      badgesUnlocked: [],
      completedQuests: [],
      redeemedRewardCodes: [],
      joinedDate: '2026',
      isLoggedIn: user.isLoggedIn,
      isGoogleLinked: user.isGoogleLinked,
      googleEmail: user.googleEmail
    };
    setUser(freshUser);
    try {
      localStorage.removeItem('saigon_heritage_explorer_user_v2');
      localStorage.setItem(STORAGE_KEY, JSON.stringify(freshUser));
    } catch {}
    sound.playSuccess();
  }, [user.googleEmail, user.id, user.isGoogleLinked, user.isLoggedIn, user.name, user.username, user.avatar]);

  // Auth requirement & pending navigation state
  const [authTargetReason, setAuthTargetReason] = useState<'quests' | 'leaderboard' | 'general'>('general');
  const [pendingTabAfterAuth, setPendingTabAfterAuth] = useState<'map' | 'quests' | 'badges' | 'leaderboard' | 'forum' | 'chat' | 'rewards' | null>(null);
  const [pendingQuestAfterAuth, setPendingQuestAfterAuth] = useState<Location3D | null>(null);

  // Real-time Study Hours Tracker (Accumulates learning time during app experience)
  useEffect(() => {
    const studyInterval = setInterval(() => {
      setUser(prev => {
        const newMins = (prev.studyMinutes || 0) + 1;
        if (newMins >= 60) {
          return {
            ...prev,
            studyHours: (prev.studyHours || 0) + 1,
            studyMinutes: 0,
            lpPoints: prev.lpPoints + 10 // Bonus LP for continuous study
          };
        }
        return {
          ...prev,
          studyMinutes: newMins
        };
      });
    }, 60000); // 1 minute per tick

    return () => clearInterval(studyInterval);
  }, []);

  // Active Modals & Drawers
  // Initial selectedLocation is null so the view opens cleanly to the pure 3D map
  const [selectedLocation, setSelectedLocation] = useState<Location3D | null>(null);
  const [activeQuest, setActiveQuest] = useState<{ quest: Quest; location: Location3D; badge?: Badge } | null>(null);
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState<boolean>(false);
  const [aiAssistantPrompt, setAiAssistantPrompt] = useState<string | undefined>(undefined);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isARScannerOpen, setIsARScannerOpen] = useState<boolean>(false);
  const [isJournalModalOpen, setIsJournalModalOpen] = useState<boolean>(false);
  const [journalTargetLocation, setJournalTargetLocation] = useState<Location3D | null>(null);
  
  // Theme & Personalized Itinerary Modals
  const [isThemeModalOpen, setIsThemeModalOpen] = useState<boolean>(false);
  const [isItineraryModalOpen, setIsItineraryModalOpen] = useState<boolean>(false);
  const [activeItinerary, setActiveItinerary] = useState<PersonalizedItinerary | null>(() => getSavedItinerary());

  const currentThemeId: HistoricalThemeId = user.themeSkin || 'classic_amber';
  const currentThemeSkin = getHistoricalSkin(currentThemeId);

  // Dynamically apply visual theme across the entire document
  useEffect(() => {
    applyGlobalThemeToDocument(currentThemeId, user.customAccentColor);
  }, [currentThemeId, user.customAccentColor]);

  const handleSelectThemeSkin = (themeId: HistoricalThemeId, customAccentColor?: string) => {
    setUser(prev => ({ 
      ...prev, 
      themeSkin: themeId,
      customAccentColor: customAccentColor || prev.customAccentColor 
    }));
    applyGlobalThemeToDocument(themeId, customAccentColor || user.customAccentColor);
    sound.playSuccess();
  };

  const handleOpenJournal = (loc?: Location3D) => {
    setJournalTargetLocation(loc || selectedLocation || LOCATIONS[0]);
    setIsJournalModalOpen(true);
  };

  // Robust Player Progress & Learning Memory Persistence
  useEffect(() => {
    try {
      // Primary local storage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      // Isolated individual player storage key to preserve multi-user accounts
      if (user.id) {
        localStorage.setItem(`saigon_heritage_user_${user.id}`, JSON.stringify(user));
      }
    } catch (e) {
      console.warn('Could not persist user progress to localStorage', e);
    }

    // Debounced automatic server synchronization for cloud persistence
    const syncTimer = setTimeout(() => {
      fetch('/api/user/save-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userProfile: user })
      }).catch(err => console.debug('Server progress sync deferred:', err));
    }, 1200);

    return () => clearTimeout(syncTimer);
  }, [user]);

  // Tab navigation - completely seamless for all travelers
  const handleNavigateTab = (tab: 'map' | 'quests' | 'badges' | 'leaderboard' | 'forum' | 'chat' | 'rewards') => {
    sound.playClick();
    setActiveTab(tab);
  };

  // Handle starting a quest directly from location
  const handleStartQuest = (loc: Location3D) => {
    sound.playSuccess();
    const quest = QUESTS.find(q => q.locationId === loc.id) || QUESTS[0];
    const badge = BADGES.find(b => b.id === quest.badgeId);
    setActiveQuest({ quest, location: loc, badge });
  };

  // Handle user login / registration success
  const handleUserLogin = (updated: UserProfile) => {
    setUser(updated);
    if (pendingTabAfterAuth) {
      setActiveTab(pendingTabAfterAuth);
      setPendingTabAfterAuth(null);
    }
    if (pendingQuestAfterAuth) {
      const loc = pendingQuestAfterAuth;
      const quest = QUESTS.find(q => q.locationId === loc.id) || QUESTS[0];
      const badge = BADGES.find(b => b.id === quest.badgeId);
      setActiveQuest({ quest, location: loc, badge });
      setPendingQuestAfterAuth(null);
    }
  };

  // Handle quest completion
  const handleCompleteQuest = (questId: string, earnedLP: number, badgeId: string) => {
    setUser(prev => {
      const newBadges = prev.badgesUnlocked.includes(badgeId)
        ? prev.badgesUnlocked
        : [...prev.badgesUnlocked, badgeId];

      const newCompleted = prev.completedQuests.includes(questId)
        ? prev.completedQuests
        : [...prev.completedQuests, questId];

      const newExp = prev.exp + 120;
      const newLevel = Math.floor(newExp / 100) + 1;

      let newTitle = prev.title;
      if (newBadges.length >= 18) newTitle = 'Đại Học Sĩ Đất Gia Định';
      else if (newBadges.length >= 12) newTitle = 'Nhà Giám Định Di Sản';
      else if (newBadges.length >= 6) newTitle = 'Nhà Thám Hiểm Di Sản';
      else if (newBadges.length >= 3) newTitle = 'Học Giả Nam Bộ';

      return {
        ...prev,
        lpPoints: prev.lpPoints + earnedLP,
        exp: newExp,
        level: newLevel,
        title: newTitle,
        badgesUnlocked: newBadges,
        completedQuests: newCompleted
      };
    });
  };

  // Handle redeeming a cultural reward
  const handleRedeemReward = (reward: RewardItem) => {
    if (user.lpPoints < reward.costLP) {
      alert('Bạn không đủ Linh Điểm (LP) để quy đổi phần thưởng này!');
      return;
    }
    if (user.badgesUnlocked.length < reward.requiredBadgesCount) {
      alert(`Bạn cần ít nhất ${reward.requiredBadgesCount} huy hiệu để mở khóa phần thưởng này!`);
      return;
    }

    sound.playSuccess();
    setUser(prev => ({
      ...prev,
      lpPoints: prev.lpPoints - reward.costLP
    }));

    // Post automatic boast to community forum
    fetch('/api/forum/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: `Vừa đổi thành công: ${reward.name}!`,
        authorName: user.name,
        authorAvatar: user.avatar,
        authorTitle: user.title,
        category: 'general',
        content: `Mình vừa quy đổi thành công phần thưởng "${reward.name}" từ đối tác ${reward.partner} với giá ${reward.costLP} LP. Cảm ơn game khám phá di sản đã mang lại trải nghiệm tuyệt vời! Mọi người cùng cố gắng săn thêm huy hiệu nhé!`,
        locationTag: 'Trung tâm Đổi Thưởng',
      })
    }).catch(() => {});
  };

  // Handle sharing quest milestone to community forum
  const handleShareToForum = (questTitle: string, badgeName: string, locationName: string) => {
    sound.playSuccess();
    // Reward bonus LP for community sharing
    setUser(prev => ({
      ...prev,
      lpPoints: prev.lpPoints + 50
    }));

    fetch('/api/forum/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: `Vừa giải mã thành công nhiệm vụ: ${questTitle}!`,
        authorName: user.name,
        authorAvatar: user.avatar,
        authorTitle: user.title,
        category: 'hints',
        content: `Vừa xuất sắc vượt qua toàn bộ câu hỏi và thử thách tại ${locationName} và rinh về ${badgeName}! Manh mối thơ cổ ở đây rất thú vị, ai kẹt ở bước nào thì bình luận bên dưới mình và cố vấn Ba Son sẽ hỗ trợ nha!`,
        locationTag: locationName,
        badgeEarned: badgeName
      })
    }).catch(() => {});

    setActiveTab('forum');
  };

  return (
    <div 
      className="min-h-screen font-['Plus_Jakarta_Sans',sans-serif] text-stone-100 flex flex-col selection:bg-amber-500 selection:text-stone-950 transition-colors duration-500"
      style={{ backgroundColor: currentThemeSkin.previewColors.background }}
    >
      {/* Top Main Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={handleNavigateTab}
        user={user}
        isMuted={isMuted}
        setIsMuted={setIsMuted}
        onOpenProfile={() => {
          setAuthTargetReason('general');
          setIsProfileModalOpen(true);
        }}
        onOpenAI={() => {
          setAiAssistantPrompt(undefined);
          setIsAIAssistantOpen(true);
        }}
        onOpenAR={() => setIsARScannerOpen(true)}
        onOpenJournal={() => handleOpenJournal()}
        onOpenItineraryPlanner={() => setIsItineraryModalOpen(true)}
        onOpenThemeModal={() => setIsThemeModalOpen(true)}
        currentThemeId={currentThemeId}
      />

      {/* Main Content View Switcher */}
      <main className="flex-1 relative flex flex-col min-h-0 h-[calc(100vh-64px)] overflow-hidden">
        {activeTab === 'map' && (
          <div className="relative w-full h-full">
            <Map3DView
              locations={LOCATIONS}
              selectedLocation={selectedLocation}
              onSelectLocation={(loc) => setSelectedLocation(loc)}
              onStartQuest={handleStartQuest}
              completedQuests={user.completedQuests}
              onOpenAI={(prompt) => {
                setAiAssistantPrompt(prompt);
                setIsAIAssistantOpen(true);
              }}
              onOpenAR={() => setIsARScannerOpen(true)}
              onOpenJournal={handleOpenJournal}
            />

            {/* Floating Itinerary Tracker Banner on Map if Active */}
            {activeItinerary && (
              <div className="absolute top-4 left-4 z-20 max-w-sm p-3 rounded-2xl bg-stone-950/90 backdrop-blur-xl border border-amber-500/40 shadow-2xl animate-fadeIn">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    Lộ Trình Đang Dẫn Đường
                  </span>
                  <button
                    onClick={() => setIsItineraryModalOpen(true)}
                    className="text-[10px] text-stone-400 hover:text-amber-300 underline font-semibold"
                  >
                    Xem chi tiết
                  </button>
                </div>
                <h4 className="font-bold text-xs text-stone-100 truncate">{activeItinerary.title}</h4>
                <div className="flex items-center gap-2 mt-1 text-[11px] text-stone-300">
                  <span>{activeItinerary.stops.filter(s => s.isVisited).length}/{activeItinerary.stops.length} trạm đã qua</span>
                  <span>•</span>
                  <span className="text-amber-300 font-mono font-bold">+{activeItinerary.totalLPBonus} LP</span>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'quests' && (
          <QuestListView
            quests={QUESTS}
            locations={LOCATIONS}
            badges={BADGES}
            completedQuests={user.completedQuests}
            onStartQuest={handleStartQuest}
            onOpenAI={(context) => {
              setAiAssistantPrompt(context);
              setIsAIAssistantOpen(true);
            }}
          />
        )}

        {activeTab === 'badges' && (
          <BadgeCollection
            badges={BADGES}
            unlockedBadgeIds={user.badgesUnlocked}
            onNavigateTab={handleNavigateTab}
            onSelectBadgeQuest={(badge) => {
              const loc = LOCATIONS.find(l => l.id === badge.locationId);
              if (loc) {
                handleStartQuest(loc);
              }
            }}
            onShareBadge={(badge) => {
              setActiveTab('forum');
            }}
          />
        )}

        {activeTab === 'forum' && (
          <CommunityForum
            user={user}
            currentUser={user}
            initialPosts={INITIAL_FORUM_POSTS}
            locations={LOCATIONS}
            onOpenAI={(prompt) => {
              setAiAssistantPrompt(prompt);
              setIsAIAssistantOpen(true);
            }}
          />
        )}

        {activeTab === 'rewards' && (
          <RewardRedemption
            user={user}
            rewards={REWARDS}
            userLP={user.lpPoints}
            badgesCount={user.badgesUnlocked.length}
            onNavigateTab={handleNavigateTab}
            onRedeemReward={handleRedeemReward}
            onOpenBaSonAI={(prompt) => {
              setAiAssistantPrompt(prompt);
              setIsAIAssistantOpen(true);
            }}
          />
        )}
      </main>

      {/* Interactive Floating AI Tour Guide Widget */}
      {activeItinerary && activeTab === 'map' && (
        <AITourGuideWidget
          itinerary={activeItinerary}
          locations={LOCATIONS}
          onSelectAndTeleport={(loc) => {
            setSelectedLocation(loc);
          }}
          onOpenQuestModal={(loc) => {
            handleStartQuest(loc);
          }}
          onOpenAIAsk={(prompt) => {
            setAiAssistantPrompt(prompt);
            setIsAIAssistantOpen(true);
          }}
          onCloseTour={() => {
            setActiveItinerary(null);
            saveActiveItinerary(null);
          }}
          onUpdateItinerary={(updated) => {
            setActiveItinerary(updated);
            saveActiveItinerary(updated);
          }}
        />
      )}

      {/* Interactive Quest Modal */}
      {activeQuest && (
        <QuestModal
          quest={activeQuest.quest}
          location={activeQuest.location}
          badge={activeQuest.badge}
          onClose={() => setActiveQuest(null)}
          onCompleteQuest={handleCompleteQuest}
          onShareToForum={handleShareToForum}
          onOpenJournal={handleOpenJournal}
        />
      )}

      {/* AI Heritage Assistant Drawer */}
      <AIAssistantDrawer
        isOpen={isAIAssistantOpen}
        onClose={() => setIsAIAssistantOpen(false)}
        currentLocation={selectedLocation}
        initialPrompt={aiAssistantPrompt}
      />

      {/* User Auth & Login/Sync Modal */}
      <AuthModal
        currentUser={user}
        isOpen={isAuthModalOpen}
        targetReason={authTargetReason}
        onClose={() => setIsAuthModalOpen(false)}
        onLogin={handleUserLogin}
        onLogout={() => {
          localStorage.removeItem(STORAGE_KEY);
          setUser({
            id: 'guest_sg_01',
            username: 'lu_khach_phuong_nam',
            name: 'Lữ Khách Phương Nam',
            avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=160&q=80',
            lpPoints: 350,
            level: 1,
            exp: 80,
            title: 'Lữ Khách Tập Sự',
            studyHours: 3,
            studyMinutes: 20,
            learningStreakDays: 2,
            studySessionsCount: 4,
            badgesUnlocked: ['badge_ben_thanh'],
            completedQuests: ['quest_ben_thanh_01'],
            redeemedRewardCodes: [],
            joinedDate: '2026',
            isLoggedIn: false,
            isGoogleLinked: false
          });
        }}
      />

      {/* User Profile, Learning & Theme Passport Modal */}
      {isProfileModalOpen && (
        <UserProfileModal
          user={user}
          onClose={() => setIsProfileModalOpen(false)}
          onUpdateName={(name) => setUser(prev => ({ ...prev, name }))}
          onUpdateUserProfile={(updated) => setUser(updated)}
          onSelectTheme={handleSelectThemeSkin}
          currentThemeId={currentThemeId}
          onResetProgress={handleResetProgress}
        />
      )}

      {/* Historical Theme Skin Modal (5 Thời Kỳ Lịch Sử) */}
      <HistoricalThemeModal
        currentThemeId={currentThemeId}
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
        onSelectTheme={handleSelectThemeSkin}
      />

      {/* AR Heritage Camera Scanner Modal */}
      {isARScannerOpen && (
        <ARHeritageScannerModal
          locations={LOCATIONS}
          onClose={() => setIsARScannerOpen(false)}
          onAwardLP={(points, landmarkName) => {
            sound.playSuccess();
            setUser(prev => ({
              ...prev,
              lpPoints: prev.lpPoints + points,
              exp: prev.exp + 60
            }));
          }}
          onSelectLocation={(loc) => {
            setSelectedLocation(loc);
            setActiveTab('map');
          }}
          onSelectAndTeleport={(loc) => {
            setSelectedLocation(loc);
            setActiveTab('map');
          }}
          onStartQuest={(loc) => {
            handleStartQuest(loc);
          }}
        />
      )}

      {/* 📖 Travel Journal Modal (Nhật Ký Lữ Hành Phương Nam) */}
      {isJournalModalOpen && (
        <TravelJournalModal
          locations={LOCATIONS}
          initialLocation={journalTargetLocation}
          completedQuestLocationIds={
            LOCATIONS.filter(loc => loc.questIds.some(qId => user.completedQuests.includes(qId))).map(l => l.id)
          }
          onClose={() => setIsJournalModalOpen(false)}
          onSelectAndTeleport={(loc) => {
            setSelectedLocation(loc);
            setActiveTab('map');
          }}
          onShareToForum={(title, content, locationName) => {
            setActiveTab('forum');
            sound.playSuccess();
          }}
          onAwardLP={(pts, reason) => {
            sound.playSuccess();
            setUser(prev => ({
              ...prev,
              lpPoints: prev.lpPoints + pts,
              exp: prev.exp + 40
            }));
          }}
        />
      )}

      {/* 🧭 Personalized Itinerary Planner Modal (Lập Lộ Trình Di Sản Cá Nhân Hóa AI) */}
      <PersonalizedItineraryModal
        locations={LOCATIONS}
        isOpen={isItineraryModalOpen}
        onClose={() => setIsItineraryModalOpen(false)}
        user={user}
        onUpdateUserProfile={(updated) => setUser(updated)}
        currentThemeId={currentThemeId}
        onSelectTheme={handleSelectThemeSkin}
        onOpenBaSonAI={(prompt) => {
          setAiAssistantPrompt(prompt);
          setIsAIAssistantOpen(true);
        }}
        onSelectAndTeleport={(loc) => {
          setSelectedLocation(loc);
          setActiveTab('map');
        }}
        onActivateItineraryOnMap={(it) => {
          setActiveItinerary(it);
          setActiveTab('map');
          const firstLoc = LOCATIONS.find(l => l.id === it.stops[0]?.locationId);
          if (firstLoc) setSelectedLocation(firstLoc);
        }}
        onShareToForum={(title, content, locationTag) => {
          sound.playSuccess();
          fetch('/api/forum/posts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title,
              authorName: user.name,
              authorAvatar: user.avatar,
              authorTitle: user.title,
              category: 'general',
              content,
              locationTag,
            })
          }).catch(() => {});
          setActiveTab('forum');
        }}
        currentActiveItinerary={activeItinerary}
      />
    </div>
  );
}
