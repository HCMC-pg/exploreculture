import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  HelpCircle, 
  CheckCircle2, 
  AlertCircle, 
  Award, 
  ArrowRight, 
  ArrowLeft, 
  Share2, 
  Bot, 
  Lightbulb, 
  ChevronDown, 
  ChevronUp, 
  RotateCcw, 
  BookOpen, 
  Send, 
  Check, 
  ListOrdered, 
  FileQuestion, 
  Key, 
  Edit3, 
  Flag,
  Volume2,
  VolumeX,
  GraduationCap,
  Layers,
  Flame,
  Crown,
  Star,
  Bookmark,
  Zap,
  Clock,
  Compass,
  CheckCircle,
  Eye,
  Filter,
  Lock,
  Unlock
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Quest, QuestStep, Badge, Location3D, KnowledgeTier } from '../types';
import { sound } from '../utils/audio';
import { 
  recordQuestionAttempt, 
  recordQuestFinish, 
  toggleStarQuestion, 
  saveStudyNote, 
  getActiveTravelerBuffs,
  getLearningMemory
} from '../utils/learningStorage';
import { SiteMasteryRadialIndicator } from './SiteMasteryRadialIndicator';

interface QuestModalProps {
  quest: Quest;
  location: Location3D;
  badge?: Badge;
  onClose: () => void;
  onCompleteQuest: (questId: string, earnedLP: number, badgeId: string) => void;
  onShareToForum: (questTitle: string, badgeName: string, locationName: string) => void;
  onOpenJournal?: (location: Location3D) => void;
}

export const QuestModal: React.FC<QuestModalProps> = ({
  quest,
  location,
  badge,
  onClose,
  onCompleteQuest,
  onShareToForum,
  onOpenJournal
}) => {
  // Knowledge Tier Selection & Filtering
  const [activeTierFilter, setActiveTierFilter] = useState<'all' | KnowledgeTier>('all');
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<string | number | null>(null);
  const [textInput, setTextInput] = useState<string>('');
  const [orderedItems, setOrderedItems] = useState<string[]>([]);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [answeredSteps, setAnsweredSteps] = useState<{ [index: number]: boolean }>({});
  const [stepScores, setStepScores] = useState<{ [index: number]: boolean }>({});
  const [stepAttempts, setStepAttempts] = useState<{ [index: number]: any }>({});

  // Note & Star state
  const [stepNote, setStepNote] = useState<string>('');
  const [isStarred, setIsStarred] = useState<boolean>(false);
  const [showNoteBox, setShowNoteBox] = useState<boolean>(false);

  // Audio narration in quest
  const [isAudioNarrating, setIsAudioNarrating] = useState<boolean>(false);

  // Smart AI Hint State
  const [hintLevel, setHintLevel] = useState<number | null>(null);
  const [aiHintText, setAiHintText] = useState<string>('');
  const [isLoadingHint, setIsLoadingHint] = useState<boolean>(false);
  const [isHintAccordionOpen, setIsHintAccordionOpen] = useState<boolean>(false);

  // Time spent tracking
  const [startTime] = useState<number>(Date.now());
  const [stepStartTime, setStepStartTime] = useState<number>(Date.now());

  // Track wrong attempts per step to strictly lock hints until failed >= 2 times
  const [wrongAttemptsCount, setWrongAttemptsCount] = useState<{ [index: number]: number }>({});
  // Track explicit user hint requests
  const [userRequestedHintSteps, setUserRequestedHintSteps] = useState<{ [index: number]: boolean }>({});

  // Active Traveler Buffs
  const buffs = getActiveTravelerBuffs();

  // Filtered Options with Flashlight Buff (automatically remove 1 wrong option)
  const [filteredWrongOption, setFilteredWrongOption] = useState<string | null>(null);

  // Derive active steps based on tier filter
  const allSteps = quest.steps || [];
  
  // Assign default tiers if not explicitly present
  const enrichedSteps: (QuestStep & { tier: KnowledgeTier; tierTitle: string })[] = allSteps.map((step, idx) => {
    let tier: KnowledgeTier = step.tier || 'basic';
    let tierTitle = step.tierTitle || 'Cơ Bản (Nhận Biết)';
    if (!step.tier) {
      const ratio = idx / Math.max(1, allSteps.length - 1);
      if (ratio < 0.25) {
        tier = 'basic';
        tierTitle = 'Tier 1: Nhập Môn Nhận Biết';
      } else if (ratio < 0.55) {
        tier = 'intermediate';
        tierTitle = 'Tier 2: Thông Hiểu & Kết Cấu';
      } else if (ratio < 0.85) {
        tier = 'advanced';
        tierTitle = 'Tier 3: Vận Dụng & Sự Kiện';
      } else {
        tier = 'master';
        tierTitle = 'Tier 4: Đại Sư Di Sản Phương Nam';
      }
    }
    return { ...step, tier, tierTitle };
  });

  const filteredSteps = activeTierFilter === 'all' 
    ? enrichedSteps 
    : enrichedSteps.filter(s => s.tier === activeTierFilter);

  const activeStepsList = filteredSteps.length > 0 ? filteredSteps : enrichedSteps;
  const totalSteps = activeStepsList.length;
  const currentStep = activeStepsList[currentStepIndex] || activeStepsList[0];

  // Helper to reorder items in ordering puzzle
  const moveOrderItem = (index: number, direction: 'up' | 'down') => {
    if (isAnswerSubmitted) return;
    sound.playClick();
    const newItems = [...orderedItems];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= newItems.length) return;
    const temp = newItems[index];
    newItems[index] = newItems[targetIdx];
    newItems[targetIdx] = temp;
    setOrderedItems(newItems);
    setTextInput(newItems.map(o => o.charAt(0)).join(' '));
  };

  // Reset answer states when changing question step
  useEffect(() => {
    setSelectedOption(null);
    setTextInput('');
    setIsAnswerSubmitted(false);
    setIsCorrect(false);
    setHintLevel(null);
    setAiHintText('');
    setIsHintAccordionOpen(false);
    setShowNoteBox(false);
    setStepStartTime(Date.now());

    // Initialize ordering items if ordering puzzle
    if (currentStep && currentStep.puzzleType === 'ordering' && currentStep.puzzleData.options) {
      const initialOptions = [...currentStep.puzzleData.options];
      setOrderedItems(initialOptions);
      setTextInput(initialOptions.map(o => o.charAt(0)).join(' '));
    } else {
      setOrderedItems([]);
    }

    // Check if question is already starred or has notes in memory
    const memory = getLearningMemory();
    if (currentStep) {
      setIsStarred(memory.starredQuestions.includes(currentStep.id));
      setStepNote(memory.studyNotes[currentStep.id] || '');

      // Apply Flashlight buff: filter out 1 wrong choice if multiple choice
      if (buffs.filterWrongOptionBonus && currentStep.puzzleData.options && currentStep.puzzleData.options.length > 2) {
        const wrongOpts = currentStep.puzzleData.options.filter(
          o => String(o).trim().toLowerCase() !== String(currentStep.puzzleData.correctAnswer).trim().toLowerCase()
        );
        if (wrongOpts.length > 0) {
          setFilteredWrongOption(wrongOpts[0]);
        }
      } else {
        setFilteredWrongOption(null);
      }
    }
  }, [currentStepIndex, activeTierFilter]);

  // Voice narration for question clue
  const toggleNarration = () => {
    if (isAudioNarrating) {
      sound.stopSpeech();
      setIsAudioNarrating(false);
    } else {
      setIsAudioNarrating(true);
      const textToRead = currentStep.clueVerse 
        ? `${currentStep.title}. ${currentStep.clueVerse}. ${currentStep.puzzleData.question}`
        : `${currentStep.title}. ${currentStep.storyPrompt}. ${currentStep.puzzleData.question}`;
      sound.speakText(
        textToRead,
        () => setIsAudioNarrating(false),
        0.92,
        1.02
      );
    }
  };

  // Star question
  const handleToggleStar = () => {
    if (!currentStep) return;
    sound.playClick();
    const newStar = toggleStarQuestion(currentStep.id);
    setIsStarred(newStar);
  };

  // Save note
  const handleSaveNote = () => {
    if (!currentStep) return;
    sound.playClick();
    saveStudyNote(currentStep.id, stepNote);
    setShowNoteBox(false);
  };

  // Request Smart Hint from Server Gemini API - open & educational for the best player experience
  const handleRequestHint = async (level: number) => {
    sound.playClick();
    setHintLevel(level);
    setIsHintAccordionOpen(true);
    setIsLoadingHint(true);

    try {
      const response = await fetch('/api/gemini/hint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questTitle: quest.title,
          stepTitle: currentStep.title,
          question: currentStep.puzzleData.question,
          clueVerse: currentStep.clueVerse,
          hintLevel: level,
          locationName: location.name
        })
      });
      const data = await response.json();
      setAiHintText(data.hint || (currentStep.puzzleData as any)[`hintLevel${level}`] || currentStep.puzzleData.explanation);
    } catch (err) {
      if (level === 1) setAiHintText(currentStep.puzzleData.hintLevel1 || 'Đọc kỹ câu thơ manh mối để tìm từ khóa then chốt!');
      else if (level === 2) setAiHintText(currentStep.puzzleData.hintLevel2 || 'Quan sát thời kỳ lịch sử và đặc điểm kiến trúc của địa danh.');
      else setAiHintText(currentStep.puzzleData.hintLevel3 || currentStep.puzzleData.explanation);
    } finally {
      setIsLoadingHint(false);
    }
  };

  const handleRetryCurrentStep = () => {
    sound.playClick();
    setIsAnswerSubmitted(false);
    setSelectedOption(null);
    setTextInput('');
    if (currentStep && currentStep.puzzleType === 'ordering' && currentStep.puzzleData.options) {
      setOrderedItems([...currentStep.puzzleData.options]);
    }
  };

  const handleSubmitAnswer = () => {
    let correct = false;
    const puzzle = currentStep.puzzleData;
    let chosenVal: string | number | boolean = '';

    if (currentStep.puzzleType === 'multiple_choice' || currentStep.puzzleType === 'true_false') {
      if (selectedOption !== null) {
        chosenVal = selectedOption;
        const cleanSelected = String(selectedOption).trim().toLowerCase();
        const cleanCorrect = String(puzzle.correctAnswer).trim().toLowerCase();
        if (cleanSelected === cleanCorrect) {
          correct = true;
        }
      }
    } else if (currentStep.puzzleType === 'ordering') {
      const orderChars = orderedItems.map(o => o.charAt(0)).join(' ').toLowerCase();
      const orderCharsCompact = orderedItems.map(o => o.charAt(0)).join('').toLowerCase();
      const cleanInput = textInput.trim().toLowerCase();
      const cleanCorrect = String(puzzle.correctAnswer).trim().toLowerCase();
      chosenVal = textInput || orderChars;

      if (
        cleanInput === cleanCorrect ||
        orderChars === cleanCorrect ||
        orderCharsCompact === cleanCorrect.replace(/\s+/g, '') ||
        (cleanInput.length > 0 && cleanCorrect.includes(cleanInput)) ||
        (puzzle.keywords && puzzle.keywords.some(kw => orderChars.includes(kw.toLowerCase()) || cleanInput.includes(kw.toLowerCase())))
      ) {
        correct = true;
      }
    } else if (currentStep.puzzleType === 'open_ended' || currentStep.puzzleType === 'cipher_text' || currentStep.puzzleType === 'fill_blank') {
      chosenVal = textInput;
      const cleanInput = textInput.trim().toLowerCase();
      const cleanCorrect = String(puzzle.correctAnswer).trim().toLowerCase();
      
      if (cleanInput === cleanCorrect || (cleanInput.length > 0 && cleanCorrect.includes(cleanInput)) || (cleanInput.length > 0 && cleanInput.includes(cleanCorrect))) {
        correct = true;
      } else if (puzzle.keywords && Array.isArray(puzzle.keywords)) {
        for (const kw of puzzle.keywords) {
          if (cleanInput.includes(kw.toLowerCase())) {
            correct = true;
            break;
          }
        }
      }
    }

    const timeSpentSec = Math.max(5, Math.round((Date.now() - stepStartTime) / 1000));

    // Save to persistent learning memory
    recordQuestionAttempt(
      quest.id,
      location.id,
      quest.title,
      currentStep.id,
      currentStep.puzzleData.question,
      correct,
      chosenVal,
      currentStep.puzzleData.correctAnswer,
      currentStep.puzzleData.explanation,
      timeSpentSec
    );

    setIsCorrect(correct);
    setIsAnswerSubmitted(true);
    setAnsweredSteps(prev => ({ ...prev, [currentStepIndex]: true }));
    setStepScores(prev => ({ ...prev, [currentStepIndex]: correct }));

    if (correct) {
      sound.playSuccess();
    } else {
      const nextFails = (wrongAttemptsCount[currentStepIndex] || 0) + 1;
      setWrongAttemptsCount(prev => ({ ...prev, [currentStepIndex]: nextFails }));
      if (nextFails >= 2) {
        setIsHintAccordionOpen(true);
      }
      sound.playError();
    }
  };

  const handleNextStep = () => {
    sound.playClick();
    if (currentStepIndex < totalSteps - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      // Completed entire quest!
      setIsFinished(true);
      sound.playSuccess();
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 }
      });

      const totalCorrect = Object.values(stepScores).filter(Boolean).length;
      let finalLP = quest.rewardLP;
      if (buffs.extraLPPercent > 0) {
        finalLP = Math.round(finalLP * (1 + buffs.extraLPPercent / 100));
      }

      // Record final quest progress in persistent learning memory
      recordQuestFinish(
        quest.id,
        location.id,
        quest.title,
        totalSteps,
        totalCorrect,
        finalLP,
        quest.badgeId
      );

      onCompleteQuest(quest.id, finalLP, quest.badgeId);
    }
  };

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      sound.playClick();
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const correctCount = Object.values(stepScores || {}).filter(Boolean).length;
  const answeredCount = Object.keys(answeredSteps || {}).length;
  const accuracyPercent = answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0;

  // Calculate dynamic Knowledge Tier Statistics for Site Radial Indicator
  const tierStats = {
    basic: { correct: 0, total: 0 },
    intermediate: { correct: 0, total: 0 },
    advanced: { correct: 0, total: 0 },
    master: { correct: 0, total: 0 }
  };

  enrichedSteps.forEach((st, idx) => {
    const t = (st.tier || 'basic') as keyof typeof tierStats;
    if (tierStats[t]) {
      tierStats[t].total++;
      if (stepScores[idx]) {
        tierStats[t].correct++;
      }
    }
  });

  const getTierInfo = (tier: KnowledgeTier) => {
    switch (tier) {
      case 'basic':
        return { label: 'Tier 1: Nhập Môn', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40', icon: '🌱', badgeColor: 'bg-emerald-500' };
      case 'intermediate':
        return { label: 'Tier 2: Thông Hiểu', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40', icon: '🔍', badgeColor: 'bg-cyan-500' };
      case 'advanced':
        return { label: 'Tier 3: Chuyên Sâu', color: 'bg-purple-500/20 text-purple-300 border-purple-500/40', icon: '🎓', badgeColor: 'bg-purple-500' };
      case 'master':
        return { label: 'Tier 4: Đại Sư', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40', icon: '👑', badgeColor: 'bg-amber-500' };
      default:
        return { label: 'Phân Hóa Kiến Thức', color: 'bg-stone-800 text-stone-300 border-stone-700', icon: '✨', badgeColor: 'bg-amber-500' };
    }
  };

  const getPuzzleTypeLabel = (type: string) => {
    switch (type) {
      case 'multiple_choice': return { label: 'Trắc Nghiệm 4 Lựa Chọn', icon: FileQuestion, color: 'text-amber-400' };
      case 'true_false': return { label: 'Đúng Hay Sai', icon: Check, color: 'text-cyan-400' };
      case 'open_ended': return { label: 'Tự Luận & Nhập Liệu', icon: Edit3, color: 'text-purple-400' };
      case 'cipher_text': return { label: 'Giải Mật Mã Di Sản', icon: Key, color: 'text-rose-400' };
      case 'fill_blank': return { label: 'Điền Khuyết Lời Ca / Thơ Cổ', icon: BookOpen, color: 'text-emerald-400' };
      case 'ordering': return { label: 'Sắp Xếp Dòng Lịch Sử', icon: ListOrdered, color: 'text-yellow-400' };
      default: return { label: 'Thử Thách Di Sản', icon: Sparkles, color: 'text-amber-400' };
    }
  };

  const typeInfo = getPuzzleTypeLabel(currentStep?.puzzleType || 'multiple_choice');
  const TypeIcon = typeInfo.icon;
  const currentTierInfo = getTierInfo(currentStep?.tier || 'basic');

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-stone-900 border-2 border-amber-500/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh]">
        
        {/* Header */}
        <div className="px-4 sm:px-6 py-3.5 bg-gradient-to-r from-stone-950 via-stone-900 to-stone-950 border-b border-amber-500/30 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-600 to-yellow-400 p-0.5 shadow-md flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-stone-950" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-amber-500 text-stone-950">
                  {quest.loreChapter || `Level ${quest.level}`}
                </span>
                <span className="text-xs font-semibold text-amber-300">
                  {location.name} ({location.province || 'TP.HCM'})
                </span>
              </div>
              <h3 className="font-['Be_Vietnam_Pro',sans-serif] font-black text-base sm:text-lg text-amber-200 truncate max-w-[280px] sm:max-w-md">
                {quest.title}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* 🌟 Visual Progress Radial Indicator for Site Mastery */}
            <div className="hidden lg:block">
              <SiteMasteryRadialIndicator
                location={location}
                questTitle={quest.title}
                totalQuestions={enrichedSteps.length}
                correctCount={correctCount}
                answeredCount={answeredCount}
                tierStats={tierStats}
                size="sm"
              />
            </div>

            {/* Audio Narration Toggle in Quest */}
            <button
              onClick={toggleNarration}
              className={`p-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
                isAudioNarrating 
                  ? 'bg-amber-500 text-stone-950 border-amber-300 animate-pulse ring-2 ring-amber-400/40' 
                  : 'bg-stone-800/90 text-stone-300 border-stone-700 hover:text-amber-300'
              }`}
              title="Nghe giọng kể & ngâm thơ câu đố"
            >
              {isAudioNarrating ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              <span className="hidden sm:inline">{isAudioNarrating ? 'Đang Đọc' : 'Kể Chuyện'}</span>
            </button>

            <div className="text-right hidden sm:block lg:hidden">
              <span className="text-[10px] text-stone-400 block uppercase tracking-wider">Tiến Độ Học Tập</span>
              <span className="text-xs font-bold text-amber-400 font-mono">
                Câu {currentStepIndex + 1} / {totalSteps}
              </span>
            </div>

            <button
              onClick={() => { 
                sound.stopSpeech(); 
                sound.playClick(); 
                onClose(); 
              }}
              className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 🎓 KNOWLEDGE DIFFERENTIATION FILTER BAR & GEAR BUFFS */}
        {!isFinished && (
          <div className="bg-stone-950 px-4 py-2 border-b border-stone-800/90 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-1.5 shrink-0 text-xs">
              <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider mr-1 flex items-center gap-1">
                <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
                Bộ Lọc:
              </span>
              {[
                { id: 'all', label: `Tất Cả (${totalSteps} câu)`, icon: '📚' },
                { id: 'basic', label: 'Tier 1: Nhập Môn', icon: '🌱' },
                { id: 'intermediate', label: 'Tier 2: Thông Hiểu', icon: '🔍' },
                { id: 'advanced', label: 'Tier 3: Chuyên Sâu', icon: '🎓' },
                { id: 'master', label: 'Tier 4: Đại Sư', icon: '👑' }
              ].map(tf => (
                <button
                  key={tf.id}
                  onClick={() => {
                    sound.playClick();
                    setActiveTierFilter(tf.id as any);
                    setCurrentStepIndex(0);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold shrink-0 transition-all border ${
                    activeTierFilter === tf.id
                      ? 'bg-amber-500 text-stone-950 border-amber-300 shadow-sm'
                      : 'bg-stone-900 text-stone-400 border-stone-800 hover:text-stone-200'
                  }`}
                >
                  <span className="mr-1">{tf.icon}</span>
                  <span>{tf.label}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {buffs.extraLPPercent > 0 && (
                <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-400" />
                  +{buffs.extraLPPercent}% LP Trang Bị
                </span>
              )}
              <span className="text-[10px] text-amber-400/90 font-mono hidden sm:inline">
                +{quest.rewardLP} LP thưởng
              </span>
            </div>
          </div>
        )}

        {/* Question Step Carousel Navigator (All 20+ Steps Grid / Slider) */}
        {!isFinished && (
          <div className="bg-stone-950/80 px-4 py-2 border-b border-stone-800 flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth">
            {activeStepsList.map((st, idx) => {
              const isCurrent = idx === currentStepIndex;
              const isAnswered = answeredSteps[idx];
              const isStepCorrect = stepScores[idx];
              const tierTag = getTierInfo(st.tier);

              return (
                <button
                  key={st.id || idx}
                  onClick={() => {
                    sound.playClick();
                    setCurrentStepIndex(idx);
                  }}
                  className={`w-7 h-7 rounded-lg text-xs font-bold shrink-0 transition-all flex items-center justify-center border relative ${
                    isCurrent
                      ? 'bg-amber-500 text-stone-950 border-amber-300 scale-110 shadow-md ring-2 ring-amber-400/40'
                      : isAnswered
                        ? isStepCorrect 
                          ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50' 
                          : 'bg-rose-950/80 text-rose-300 border-rose-500/50'
                        : 'bg-stone-900 text-stone-400 border-stone-800 hover:text-stone-200'
                  }`}
                  title={`Câu ${idx + 1} (${tierTag.label}): ${st.title}`}
                >
                  {idx + 1}
                  <span className={`absolute -bottom-0.5 w-1.5 h-1.5 rounded-full ${tierTag.badgeColor}`} />
                </button>
              );
            })}
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {!isFinished ? (
            <>
              {/* Question Type, Tier Header & Star / Note Tools */}
              <div className="flex items-center justify-between pb-2 border-b border-stone-800 flex-wrap gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Knowledge Tier Tag */}
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-md border flex items-center gap-1 ${currentTierInfo.color}`}>
                    <span>{currentTierInfo.icon}</span>
                    <span>{currentTierInfo.label}</span>
                  </span>

                  <span className="text-stone-500">•</span>

                  <span className={`text-xs font-bold flex items-center gap-1.5 ${typeInfo.color}`}>
                    <TypeIcon className="w-4 h-4" />
                    {typeInfo.label}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Bookmark / Star Question Button */}
                  <button
                    onClick={handleToggleStar}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold border flex items-center gap-1.5 transition-all ${
                      isStarred
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow'
                        : 'bg-stone-800 text-stone-400 border-stone-700 hover:text-amber-200'
                    }`}
                    title="Đánh dấu câu hỏi này vào Sổ tay ôn tập"
                  >
                    <Star className={`w-3.5 h-3.5 ${isStarred ? 'fill-amber-400 text-amber-400' : ''}`} />
                    <span className="hidden sm:inline">{isStarred ? 'Đã Ghim Ôn Tập' : 'Ghim Câu Hỏi'}</span>
                  </button>

                  {/* Note Button */}
                  <button
                    onClick={() => setShowNoteBox(!showNoteBox)}
                    className="px-2.5 py-1 rounded-lg text-xs font-bold bg-stone-800 text-stone-300 hover:text-amber-200 border border-stone-700 flex items-center gap-1.5"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="hidden sm:inline">Ghi Chú</span>
                  </button>
                </div>
              </div>

              {/* Personal Study Note Drawer */}
              {showNoteBox && (
                <div className="p-3 rounded-2xl bg-stone-950 border border-cyan-500/30 space-y-2 animate-fadeIn">
                  <div className="flex items-center justify-between text-xs text-cyan-300 font-bold">
                    <span className="flex items-center gap-1.5">
                      <Edit3 className="w-3.5 h-3.5" />
                      Sổ Tay Ghi Chú Riêng (Lưu Trữ Bền Vững)
                    </span>
                    <button
                      onClick={() => setShowNoteBox(false)}
                      className="text-stone-400 hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <textarea
                    value={stepNote}
                    onChange={(e) => setStepNote(e.target.value)}
                    placeholder="Viết ghi chú cá nhân về sự kiện, kiến trúc hoặc mẹo nhớ cho câu hỏi này..."
                    className="w-full h-16 p-2 rounded-xl bg-stone-900 border border-stone-700 text-xs text-stone-100 placeholder-stone-500 outline-none focus:border-cyan-400 resize-none"
                  />
                  <button
                    onClick={handleSaveNote}
                    className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold"
                  >
                    Lưu Ghi Chú
                  </button>
                </div>
              )}

              {/* Cultural Lore & Clue Verse Box */}
              {currentStep.clueVerse && (
                <div className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-950/30 via-stone-900/60 to-stone-950 border border-amber-500/30 relative overflow-hidden shadow-inner">
                  <div className="absolute -right-4 -bottom-4 text-amber-500/5">
                    <BookOpen className="w-24 h-24" />
                  </div>
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-[11px] font-bold text-amber-400/90 uppercase tracking-widest flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                      📜 Manh Mối Cổ Thư & Thơ Vịnh Nam Bộ:
                    </p>
                    <button
                      onClick={toggleNarration}
                      className="text-[10px] text-amber-300 hover:text-amber-200 flex items-center gap-1 underline underline-offset-2"
                    >
                      <Volume2 className="w-3 h-3" />
                      {isAudioNarrating ? 'Tắt đọc thơ' : 'Nghe ngâm thơ'}
                    </button>
                  </div>
                  <p className="font-['Be_Vietnam_Pro',sans-serif] text-sm sm:text-base text-amber-100 font-medium whitespace-pre-line italic leading-relaxed pl-2 border-l-2 border-amber-500/60">
                    "{currentStep.clueVerse}"
                  </p>
                </div>
              )}

              {/* Story Prompt Context */}
              <div className="p-3 rounded-xl bg-stone-950/70 border border-stone-800/80">
                <p className="text-xs text-stone-300 leading-relaxed">
                  <strong className="text-amber-300 font-semibold">{currentStep.title}: </strong>
                  {currentStep.storyPrompt}
                </p>
              </div>

              {/* The Main Question Card */}
              <div className="p-4 rounded-2xl bg-stone-950 border border-amber-500/40 shadow-md space-y-3">
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
                    <HelpCircle className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-stone-100 text-sm sm:text-base leading-snug">
                    {currentStep.puzzleData.question}
                  </h4>
                </div>

                {/* PUZZLE INTERFACES */}
                {/* 1. Multiple Choice / True-False */}
                {(currentStep.puzzleType === 'multiple_choice' || currentStep.puzzleType === 'true_false') && (
                  <div className="space-y-2 pt-2">
                    {currentStep.puzzleData.options?.map((option, idx) => {
                      const isSelected = selectedOption === option;
                      const isFilteredWrong = filteredWrongOption === option;

                      return (
                        <button
                          key={idx}
                          onClick={() => {
                            if (!isAnswerSubmitted) {
                              sound.playClick();
                              setSelectedOption(option);
                            }
                          }}
                          disabled={isAnswerSubmitted || isFilteredWrong}
                          className={`w-full p-3 rounded-xl text-left text-xs sm:text-sm font-medium transition-all flex items-center justify-between border ${
                            isFilteredWrong
                              ? 'opacity-30 line-through bg-stone-950 border-stone-800 cursor-not-allowed'
                              : isSelected
                                ? 'bg-amber-500/20 border-amber-400 text-amber-200 shadow-md'
                                : 'bg-stone-900 border-stone-800 text-stone-300 hover:border-stone-700 hover:bg-stone-850'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center border ${
                              isSelected 
                                ? 'bg-amber-500 text-stone-950 border-amber-300' 
                                : 'bg-stone-800 text-stone-400 border-stone-700'
                            }`}>
                              {String.fromCharCode(65 + idx)}
                            </span>
                            <span>{option}</span>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-amber-400" />}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* 2. Interactive Timeline Ordering Game */}
                {currentStep.puzzleType === 'ordering' && (
                  <div className="space-y-3 pt-2">
                    <div className="p-2.5 rounded-xl bg-amber-950/20 border border-amber-500/30 text-xs text-amber-300 flex items-center justify-between">
                      <span>🔄 Nhấn mũi tên để đổi vị trí hoặc nhập mã thứ tự:</span>
                      <span className="font-mono font-bold text-amber-400">
                        {orderedItems.map(o => o.charAt(0)).join(' ➔ ') || 'Chưa sắp'}
                      </span>
                    </div>

                    <div className="space-y-2">
                      {orderedItems.map((item, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-xl bg-stone-900 border border-stone-800 text-xs sm:text-sm text-stone-200 flex items-center justify-between gap-2 shadow-sm"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="w-6 h-6 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-400 font-mono font-bold flex items-center justify-center shrink-0">
                              {idx + 1}
                            </span>
                            <span className="truncate">{item}</span>
                          </div>

                          {!isAnswerSubmitted && (
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => moveOrderItem(idx, 'up')}
                                disabled={idx === 0}
                                className="px-2 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 disabled:opacity-30 disabled:cursor-not-allowed text-stone-300 text-xs font-bold border border-stone-700 transition-colors"
                                title="Đưa lên trước"
                              >
                                ▲ Lên
                              </button>
                              <button
                                type="button"
                                onClick={() => moveOrderItem(idx, 'down')}
                                disabled={idx === orderedItems.length - 1}
                                className="px-2 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 disabled:opacity-30 disabled:cursor-not-allowed text-stone-300 text-xs font-bold border border-stone-700 transition-colors"
                                title="Đưa xuống sau"
                              >
                                ▼ Xuống
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="pt-1">
                      <input
                        type="text"
                        value={textInput}
                        onChange={(e) => setTextInput(e.target.value)}
                        disabled={isAnswerSubmitted}
                        placeholder="Mã trình tự (ví dụ: A B C D hoặc D C B A)..."
                        className="w-full p-2.5 rounded-xl bg-stone-900 border border-stone-700 text-stone-100 text-xs sm:text-sm font-mono outline-none focus:border-amber-400 transition-colors"
                      />
                    </div>
                  </div>
                )}

                {/* 3. Fill In The Blank Game */}
                {currentStep.puzzleType === 'fill_blank' && (
                  <div className="space-y-3 pt-2">
                    {/* Word Bank Chips (if options exist) */}
                    {currentStep.puzzleData.options && currentStep.puzzleData.options.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="text-[11px] text-stone-400 font-bold uppercase tracking-wider block">
                          Kho Từ Khóa Gợi Ý (Nhấn để chọn nhanh):
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {currentStep.puzzleData.options.map((opt, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                if (!isAnswerSubmitted) {
                                  sound.playClick();
                                  setTextInput(opt);
                                }
                              }}
                              disabled={isAnswerSubmitted}
                              className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                                textInput === opt
                                  ? 'bg-amber-500 text-stone-950 border-amber-300 shadow-sm'
                                  : 'bg-stone-900 text-stone-300 border-stone-800 hover:border-amber-500/60 hover:text-amber-200'
                              }`}
                            >
                              + {opt}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="pt-1">
                      <input
                        type="text"
                        value={textInput}
                        onChange={(e) => setTextInput(e.target.value)}
                        disabled={isAnswerSubmitted}
                        placeholder="Nhập từ hoặc cụm từ điền vào chỗ trống..."
                        className="w-full p-3 rounded-xl bg-stone-900 border border-stone-700 text-stone-100 text-xs sm:text-sm font-semibold outline-none focus:border-amber-400 transition-colors"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !isAnswerSubmitted && textInput.trim()) {
                            handleSubmitAnswer();
                          }
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* 4. Cipher Text / Archaeological Decoder */}
                {currentStep.puzzleType === 'cipher_text' && (
                  <div className="space-y-3 pt-2">
                    <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/40 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono text-amber-400 font-bold uppercase tracking-wider">
                          📜 MẬT MÃ KHẢO CỔ CẦN GIẢI
                        </span>
                        <span className="text-[10px] text-amber-300/80 font-mono">
                          STATUS: ENCRYPTED
                        </span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-stone-950 border border-amber-500/20 font-mono text-sm sm:text-base text-amber-200 text-center tracking-widest font-black">
                        {currentStep.puzzleData.question}
                      </div>
                    </div>

                    <input
                      type="text"
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      disabled={isAnswerSubmitted}
                      placeholder="Nhập chuỗi thông điệp đã giải mã..."
                      className="w-full p-3 rounded-xl bg-stone-900 border border-stone-700 text-stone-100 text-xs sm:text-sm font-mono font-bold outline-none focus:border-amber-400 transition-colors"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !isAnswerSubmitted && textInput.trim()) {
                          handleSubmitAnswer();
                        }
                      }}
                    />
                  </div>
                )}

                {/* 5. Open-ended Scholar Query */}
                {currentStep.puzzleType === 'open_ended' && (
                  <div className="space-y-3 pt-2">
                    <input
                      type="text"
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      disabled={isAnswerSubmitted}
                      placeholder="Nhập kiến giải lịch sử hoặc từ khóa cốt lõi..."
                      className="w-full p-3 rounded-xl bg-stone-900 border border-stone-700 text-stone-100 text-xs sm:text-sm font-semibold outline-none focus:border-amber-400 transition-colors"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !isAnswerSubmitted && textInput.trim()) {
                          handleSubmitAnswer();
                        }
                      }}
                    />
                  </div>
                )}

                {/* Submit Action Button */}
                {!isAnswerSubmitted && (
                  <div className="pt-2">
                    <button
                      onClick={handleSubmitAnswer}
                      disabled={
                        (currentStep.puzzleType === 'multiple_choice' || currentStep.puzzleType === 'true_false')
                          ? selectedOption === null
                          : (currentStep.puzzleType === 'ordering')
                            ? orderedItems.length === 0 && textInput.trim() === ''
                            : textInput.trim() === ''
                      }
                      className={`w-full py-3 rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 transition-all ${
                        ((currentStep.puzzleType === 'multiple_choice' || currentStep.puzzleType === 'true_false')
                          ? selectedOption !== null
                          : (currentStep.puzzleType === 'ordering')
                            ? orderedItems.length > 0 || textInput.trim() !== ''
                            : textInput.trim() !== ''
                        )
                          ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 shadow-lg cursor-pointer'
                          : 'bg-stone-800 text-stone-500 cursor-not-allowed border border-stone-700'
                      }`}
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Xác Nhận Câu Trả Lời</span>
                    </button>
                  </div>
                )}
              </div>

              {/* SMART AI HINT ACCORDION - STRICT RULE: ONLY SHOW WHEN PLAYER FAILS MULTIPLE TIMES OR EXPLICITLY REQUESTS */}
              {(() => {
                const currentFails = wrongAttemptsCount[currentStepIndex] || 0;
                const hasUserRequested = !!userRequestedHintSteps[currentStepIndex];
                const isHintEligible = currentFails >= 2 || hasUserRequested;

                if (!isHintEligible) {
                  return (
                    <div className="p-3 rounded-2xl bg-stone-900/80 border border-stone-800/90 flex items-center justify-between gap-3 animate-fadeIn">
                      <div className="flex items-center gap-2.5 text-xs text-stone-300">
                        <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                          <Sparkles className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-bold text-stone-200 block">Cố Vấn Ba Son Đang Đồng Hành</span>
                          <span className="text-[11px] text-stone-400">
                            Tự suy luận nhận tối đa LP. Gợi ý sẽ tự động kích hoạt khi trả lời sai 2 lần, hoặc bạn có thể bấm yêu cầu.
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          sound.playClick();
                          setUserRequestedHintSteps(prev => ({ ...prev, [currentStepIndex]: true }));
                          setIsHintAccordionOpen(true);
                        }}
                        className="px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 hover:text-amber-200 border border-amber-500/40 text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 shadow-sm active:scale-95"
                      >
                        <HelpCircle className="w-4 h-4 text-amber-400" />
                        <span>Yêu Cầu Gợi Ý</span>
                      </button>
                    </div>
                  );
                }

                return (
                  <div className="rounded-2xl border transition-all overflow-hidden bg-amber-950/20 border-amber-500/40 shadow-sm animate-fadeIn">
                    <button
                      onClick={() => setIsHintAccordionOpen(!isHintAccordionOpen)}
                      className="w-full px-4 py-2.5 flex items-center justify-between text-xs text-stone-300 hover:text-amber-200 transition-colors"
                    >
                      <span className="font-bold flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                        <span className="text-amber-300 font-extrabold">
                          {currentFails >= 2 
                            ? `Gợi Ý Cố Vấn Ba Son (Kích hoạt do đã thử ${currentFails} lần)` 
                            : 'Gợi Ý Cố Vấn Ba Son (Mở theo yêu cầu của bạn)'}
                        </span>
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-900 border border-amber-500/30 text-amber-300 font-mono hidden sm:inline">
                          3 Cấp Độ Gợi Ý
                        </span>
                        {isHintAccordionOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4 text-stone-400" />}
                      </div>
                    </button>

                    {isHintAccordionOpen && (
                      <div className="p-3.5 border-t border-stone-800 space-y-3">
                        <div className="p-2.5 rounded-xl bg-amber-950/30 border border-amber-500/20 text-xs text-stone-300 flex items-center justify-between flex-wrap gap-2">
                          <span>
                            {currentFails >= 2 
                              ? `Bạn đã thử ${currentFails} lần. Cố Vấn Ba Son gợi ý các manh mối sau:` 
                              : 'Chọn mức độ trợ giúp từ Cố Vấn Ba Son để giải mã câu đố này:'}
                          </span>
                          {currentFails > 0 && (
                            <span className="text-[10px] text-amber-400 font-mono bg-stone-900 px-2 py-0.5 rounded border border-amber-500/20">
                              Đã thử {currentFails} lần
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                          <button
                            onClick={() => handleRequestHint(1)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all flex items-center gap-1.5 ${
                              hintLevel === 1 
                                ? 'bg-amber-500 text-stone-950 border-amber-300 shadow' 
                                : 'bg-stone-900 text-stone-300 border-stone-700 hover:border-amber-500'
                            }`}
                          >
                            <span>🌱</span>
                            <span>Mức 1: Manh Mối Khẽ Khàng</span>
                          </button>
                          <button
                            onClick={() => handleRequestHint(2)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all flex items-center gap-1.5 ${
                              hintLevel === 2 
                                ? 'bg-amber-500 text-stone-950 border-amber-300 shadow' 
                                : 'bg-stone-900 text-stone-300 border-stone-700 hover:border-amber-500'
                            }`}
                          >
                            <span>🏛️</span>
                            <span>Mức 2: Tọa Độ & Cổ Sử</span>
                          </button>
                          <button
                            onClick={() => handleRequestHint(3)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all flex items-center gap-1.5 ${
                              hintLevel === 3 
                                ? 'bg-amber-500 text-stone-950 border-amber-300 shadow' 
                                : 'bg-stone-900 text-stone-300 border-stone-700 hover:border-amber-500'
                            }`}
                          >
                            <span>📜</span>
                            <span>Mức 3: Giải Nghĩa Toàn Diện</span>
                          </button>
                        </div>

                        {isLoadingHint ? (
                          <div className="p-3 rounded-xl bg-stone-900 flex items-center gap-2 text-xs text-amber-300">
                            <Sparkles className="w-4 h-4 animate-spin" />
                            <span>Trợ lý AI đang tra cứu thư tịch cổ phương Nam...</span>
                          </div>
                        ) : aiHintText ? (
                          <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-500/40 text-xs text-stone-200 leading-relaxed space-y-1">
                            <div className="flex items-center gap-1.5 text-amber-300 font-bold">
                              <span>💡</span>
                              <span>Manh Mối Mức {hintLevel || 1}:</span>
                            </div>
                            <p>{aiHintText}</p>
                          </div>
                        ) : null}
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* POST-SUBMISSION FEEDBACK & EXPLANATION */}
              {isAnswerSubmitted && (
                <div className={`p-4 rounded-2xl border animate-fadeIn space-y-3 ${
                  isCorrect 
                    ? 'bg-emerald-950/30 border-emerald-500/50 text-emerald-100' 
                    : 'bg-rose-950/30 border-rose-500/50 text-rose-100'
                }`}>
                  <div className="flex items-center gap-2 justify-between flex-wrap">
                    <div className="flex items-center gap-2">
                      {isCorrect ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
                      )}
                      <h4 className="font-bold text-sm">
                        {isCorrect 
                          ? 'Tuyệt Vời! Đáp Án Hoàn Toàn Chính Xác' 
                          : `Chưa Chính Xác Lần Này (${wrongAttemptsCount[currentStepIndex] || 1} lần chưa đúng)`}
                      </h4>
                    </div>

                    {!isCorrect && (
                      <span className="text-[11px] font-mono text-rose-300 bg-rose-950/50 px-2 py-0.5 rounded border border-rose-500/30">
                        {(wrongAttemptsCount[currentStepIndex] || 1) >= 2 
                          ? '💡 Cố Vấn Ba Son đã kích hoạt gợi ý hỗ trợ bên trên!' 
                          : '💡 Bạn có thể bấm "Yêu Cầu Gợi Ý" hoặc thử sức lại'}
                      </span>
                    )}
                  </div>

                  <div className="p-3 rounded-xl bg-stone-950/70 border border-stone-800 text-xs text-stone-200 leading-relaxed">
                    <strong className="text-amber-300">Giải thích lịch sử: </strong>
                    {currentStep.puzzleData.explanation}
                  </div>

                  <div className="flex items-center justify-between pt-2 flex-wrap gap-2">
                    <span className="text-[11px] text-stone-400">
                      Tiến độ: {answeredCount} / {totalSteps} câu đã hoàn tất
                    </span>
                    
                    <div className="flex items-center gap-2">
                      {!isCorrect && (
                        <button
                          onClick={handleRetryCurrentStep}
                          className="px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-600 font-bold text-xs flex items-center gap-1.5 transition-colors"
                          title="Chọn lại đáp án cho câu hỏi này"
                        >
                          <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                          <span>Thử Lại Câu Này</span>
                        </button>
                      )}

                      <button
                        onClick={handleNextStep}
                        className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-extrabold text-xs flex items-center gap-1.5 shadow-md transition-all"
                      >
                        <span>{currentStepIndex < totalSteps - 1 ? 'Câu Kế Tiếp' : 'Xem Kết Quả Tổng Kết'}</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* COMPREHENSIVE LEARNING MASTERY REPORT (20+ QUESTIONS FINISHED) */
            <div className="space-y-6 text-stone-100 animate-fadeIn text-center py-4">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-500 to-yellow-400 p-1 mx-auto shadow-2xl flex items-center justify-center">
                <Crown className="w-10 h-10 text-stone-950" />
              </div>

              <div className="space-y-2">
                <span className="text-xs uppercase font-bold tracking-widest text-amber-400">
                  HOÀN THÀNH TOÀN DIỆN THỬ THÁCH DI SẢN
                </span>
                <h3 className="font-['Be_Vietnam_Pro',sans-serif] font-black text-2xl sm:text-3xl text-amber-200">
                  Đại Sư Tri Thức Phương Nam
                </h3>
                <p className="text-xs sm:text-sm text-stone-300 max-w-md mx-auto">
                  Bạn đã xuất sắc vượt qua toàn bộ {totalSteps} câu hỏi chuyên sâu về {location.name}.
                </p>
              </div>

              {/* Mastery Radial Scorecard */}
              <div className="flex justify-center my-2">
                <SiteMasteryRadialIndicator
                  location={location}
                  questTitle={quest.title}
                  totalQuestions={enrichedSteps.length}
                  correctCount={correctCount}
                  answeredCount={answeredCount}
                  tierStats={tierStats}
                  size="lg"
                  showDetails={true}
                />
              </div>

              {/* Performance Scorecard */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto text-left">
                <div className="p-3.5 rounded-2xl bg-stone-950 border border-amber-500/30">
                  <p className="text-[10px] text-stone-400 uppercase">Câu Trả Lời Đúng</p>
                  <p className="text-xl font-bold font-mono text-emerald-400">{correctCount} / {totalSteps}</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-stone-950 border border-amber-500/30">
                  <p className="text-[10px] text-stone-400 uppercase">Độ Chính Xác</p>
                  <p className="text-xl font-bold font-mono text-amber-300">{accuracyPercent}%</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-stone-950 border border-amber-500/30">
                  <p className="text-[10px] text-stone-400 uppercase">Linh Điểm Đạt Được</p>
                  <p className="text-xl font-bold font-mono text-amber-400">+{quest.rewardLP} LP</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-stone-950 border border-amber-500/30">
                  <p className="text-[10px] text-stone-400 uppercase">Huy Hiệu Mở Khóa</p>
                  <p className="text-xs font-bold text-amber-200 mt-1 truncate">{badge?.name || 'Di Sản Nam Bộ'}</p>
                </div>
              </div>

              {/* Actions Button Row */}
              <div className="flex items-center justify-center gap-3 pt-4 flex-wrap max-w-md mx-auto">
                <button
                  onClick={() => {
                    sound.playClick();
                    onShareToForum(quest.title, badge?.name || 'Di Sản Nam Bộ', location.name);
                  }}
                  className="flex-1 py-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold flex items-center justify-center gap-2 border border-stone-700"
                >
                  <Share2 className="w-4 h-4 text-amber-400" />
                  <span>Chia Sẻ Diễn Đàn</span>
                </button>

                <button
                  onClick={() => {
                    sound.playClick();
                    onClose();
                  }}
                  className="flex-1 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-extrabold shadow-lg"
                >
                  Hoàn Tất Nhiệm Vụ
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation Bar */}
        {!isFinished && (
          <div className="p-3 sm:p-4 bg-stone-950 border-t border-stone-800 flex items-center justify-between text-xs">
            <button
              onClick={handlePrevStep}
              disabled={currentStepIndex === 0}
              className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1 transition-all ${
                currentStepIndex > 0 
                  ? 'bg-stone-800 text-stone-300 hover:bg-stone-700' 
                  : 'text-stone-600 cursor-not-allowed'
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Câu Trước</span>
            </button>

            <span className="text-[11px] text-stone-500 font-mono">
              Câu {currentStepIndex + 1} / {totalSteps}
            </span>

            <button
              onClick={handleNextStep}
              disabled={!answeredSteps[currentStepIndex]}
              className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1 transition-all ${
                answeredSteps[currentStepIndex]
                  ? 'bg-amber-500 text-stone-950 hover:bg-amber-400 shadow'
                  : 'bg-stone-800 text-stone-500 cursor-not-allowed'
              }`}
            >
              <span>{currentStepIndex < totalSteps - 1 ? 'Câu Sau' : 'Tổng Kết'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
