import { useState, useCallback, useEffect } from 'react'
import { useLocalStorage } from './hooks/useLocalStorage'
import { useStamps } from './hooks/useStamps'
import type { DailyLog, Event, Task, Subtask } from './types'
import { NotificationProvider, useNotification } from './contexts/NotificationContext'
import { HomeScreen } from './components/HomeScreen'
import { TaskTimer } from './components/TaskTimer'
import { ForcedChecklist } from './components/ForcedChecklist'
import { BreakTimer } from './components/BreakTimer'
import { SummerFatigueTimer } from './components/SummerFatigueTimer'
import CoinPopup from './components/CoinPopup'
import confetti from 'canvas-confetti';
import { MAX_ZUNDA_POWER, SUMMER_FATIGUE_DURATION_MS } from './constants/zundaPower';

const COIN_PER_SESSION = 100;

type ViewState = 'HOME' | 'TIMER' | 'CHECKLIST' | 'BREAK' | 'SUMMER_FATIGUE';

// ローカルのタイムゾーンで YYYY-MM-DD を取得するヘルパー
const getLocalDateString = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Separate component to check NotificationContext internals
function AppContent() {
  const [currentDate, setCurrentDate] = useState(getLocalDateString());
  const [dailyLog, setDailyLog] = useLocalStorage<DailyLog>(currentDate, {
    date: currentDate,
    events: [],
    tasks: []
  });

  // 日付の監視と自動更新
  useEffect(() => {
    const checkDate = () => {
      const todayStr = getLocalDateString();
      if (todayStr !== currentDate) {
        setCurrentDate(todayStr);
      }
    };

    // 30秒ごとにチェック
    const intervalId = setInterval(checkDate, 30000);

    // アプリにフォーカスが戻った時にもチェック
    window.addEventListener('focus', checkDate);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('focus', checkDate);
    };
  }, [currentDate]);

  const [view, setView] = useState<ViewState>('HOME');
  const [currentTask, setCurrentTask] = useState<{ title: string; duration: number; breakDuration: number; interruptions?: string[]; subtasks?: Subtask[] } | null>(null);

  // ずんだコイン制度の状態
  const [zundaCoins, setZundaCoins] = useLocalStorage<number>('zundaCoins', 0);
  const [unlockedVoices, setUnlockedVoices] = useLocalStorage<string[]>('unlockedVoices', ['default']);
  const [selectedVoice, setSelectedVoice] = useLocalStorage<string>('selectedVoice', 'default');
  const [showCoinPopup, setShowCoinPopup] = useState(false);

  // ずんだパワー（過集中防止スタミナ）
  const [zundaPower, setZundaPower] = useLocalStorage<number>('zundaPower', MAX_ZUNDA_POWER);
  const [summerFatigueEndAt, setSummerFatigueEndAt] = useLocalStorage<number | null>('summerFatigueEndAt', null);

  const isSummerFatigueActive =
    summerFatigueEndAt !== null && Date.now() < summerFatigueEndAt;

  const { unlockAudio, playAlert, stopAlert, isReady } = useNotification();
  const { stamps, addStamp } = useStamps();

  // コインを消費する（成功時true、不足時false）
  const handleSpendCoins = useCallback((amount: number): boolean => {
    if (zundaCoins < amount) return false;
    setZundaCoins(prev => prev - amount);
    return true;
  }, [zundaCoins, setZundaCoins]);

  // ボイスをアンロックする
  const handleUnlockVoice = useCallback((voiceId: string) => {
    setUnlockedVoices(prev => prev.includes(voiceId) ? prev : [...prev, voiceId]);
  }, [setUnlockedVoices]);

  const recoverFromSummerFatigue = useCallback(() => {
    setZundaPower(MAX_ZUNDA_POWER);
    setSummerFatigueEndAt(null);
    setCurrentTask(null);
    setView('HOME');
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.5 },
      colors: ['#fb923c', '#fbbf24', '#84cc16', '#ffffff'],
    });
  }, [setZundaPower, setSummerFatigueEndAt]);

  // 夏バテ状態の復元（リロード・日跨ぎ対応）
  useEffect(() => {
    if (summerFatigueEndAt === null) return;

    if (Date.now() >= summerFatigueEndAt) {
      recoverFromSummerFatigue();
      return;
    }

    setView('SUMMER_FATIGUE');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Ensure audio context is unlocked on first interaction
  const handleInteraction = async () => {
    await unlockAudio();
  };

  const handleAddEvent = (title: string, start: string, end: string) => {
    const newEvent: Event = {
      id: crypto.randomUUID(),
      title,
      startTime: start,
      endTime: end
    };
    setDailyLog(prev => ({ ...prev, events: [...prev.events, newEvent] }));
  };

  const startTask = async (title: string, duration: number, breakDuration: number, subtasks?: Subtask[]) => {
    if (isSummerFatigueActive) return;

    // Explicitly unlock audio on start to ensure context is ready
    await unlockAudio();

    console.log('Zundamon: Attempting to play start sound');
    // Small delay to allow audio context to stabilize after resume/unlock
    setTimeout(() => {
      playAlert('start');
    }, 100);

    setCurrentTask({ title, duration, breakDuration, subtasks });
    // Also record start of task logic if needed
    setView('TIMER');
  };

  const stopTask = (interruptions?: string[], finalSubtasks?: Subtask[]) => {
    // Explicitly stop any playing alerts (like the timeout loop)
    stopAlert();

    if (currentTask) {
      setCurrentTask({ ...currentTask, interruptions, subtasks: finalSubtasks || currentTask.subtasks });
    }
    setView('CHECKLIST');
  };

  const completeChecklist = () => {
    let taskForStamp: Task | null = null;

    if (currentTask) {
      const newTask: Task = {
        id: crypto.randomUUID(),
        title: currentTask.title,
        durationMinutes: currentTask.duration,
        startedAt: new Date().toISOString(),
        endedAt: new Date().toISOString(),
        toiletDoneAt: new Date().toISOString(),
        paperDoneAt: new Date().toISOString(),
        description: currentTask.interruptions && currentTask.interruptions.length > 0
          ? `[割り込みメモ]\n- ${currentTask.interruptions.join('\n- ')}`
          : undefined,
        subtasks: currentTask.subtasks
      };
      setDailyLog(prev => ({ ...prev, tasks: [...prev.tasks, newTask] }));
      taskForStamp = newTask;
    }

    // ずんだコイン付与（チェックリスト完了＝25分集中完了時）
    setZundaCoins(prev => prev + COIN_PER_SESSION);
    setShowCoinPopup(true);

    // コイン獲得コンフェッティ
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.5 },
      colors: ['#fde047', '#f59e0b', '#fbbf24', '#ffffff'],
      scalar: 1.0
    });

    // ずんだパワーを消費（集中セッション完了時）
    const newPower = Math.max(0, zundaPower - 1);
    setZundaPower(newPower);

    if (newPower <= 0) {
      const endAt = Date.now() + SUMMER_FATIGUE_DURATION_MS;
      setSummerFatigueEndAt(endAt);
      setView('SUMMER_FATIGUE');
      stopAlert();
      playAlert('break-start');
    } else {
      setView('BREAK');

      // Ensure strict single playback
      stopAlert();

      // 選択されたボイスでタイマー終了音を再生
      const voiceType = selectedVoice === 'default' ? 'break-start' : selectedVoice as any;
      playAlert(voiceType);
    }

    // Stamp Logic
    if (taskForStamp) {
      const currentTasks = dailyLog.tasks;
      const totalSessions = currentTasks.length + 1;

      if (totalSessions >= 3) {
        const isNew = addStamp(dailyLog.date);
        if (isNew) {
          setTimeout(() => {
            playAlert('praise-2');
            console.log("天才なのだ！スタンプをあげるのだ！💮");
            // Celebration Confetti
            confetti({
              particleCount: 200,
              spread: 100,
              origin: { y: 0.6 },
              colors: ['#a3e635', '#fcd34d', '#ffffff'], // Lime/Yellow/White
              scalar: 1.2
            });
          }, 500);
        }
      }
    }
  };

  const finishBreak = () => {
    setCurrentTask(null);
    setView('HOME');
  };

  const handleUpdateEvent = (updatedEvent: Event) => {
    setDailyLog(prev => ({
      ...prev,
      events: prev.events.map(ev => ev.id === updatedEvent.id ? updatedEvent : ev)
    }));
  };

  const handleDeleteEvent = (eventId: string) => {
    setDailyLog(prev => ({
      ...prev,
      events: prev.events.filter(ev => ev.id !== eventId)
    }));
  };

  const handleDeleteTask = (taskId: string) => {
    setDailyLog(prev => ({
      ...prev,
      tasks: prev.tasks.filter(t => t.id !== taskId)
    }));
  };

  return (
    <div onClick={handleInteraction} className={`min-h-screen w-full flex justify-center py-8 font-sans text-green-900 transition-colors duration-1000 ease-in-out ${view === 'TIMER' ? 'bg-[#ecfccb]' : view === 'SUMMER_FATIGUE' ? 'bg-orange-50' : 'bg-lime-50'}`}>
      {/* コインゲットポップアップ（全画面オーバーレイ） */}
      <CoinPopup
        visible={showCoinPopup}
        amount={COIN_PER_SESSION}
        onComplete={() => setShowCoinPopup(false)}
      />

      <div className="w-full max-w-2xl px-4 flex flex-col items-center gap-6 relative">
        {view === 'HOME' && (
          <HomeScreen
            dailyLog={dailyLog}
            onAddEvent={handleAddEvent}
            onUpdateEvent={handleUpdateEvent}
            onDeleteEvent={handleDeleteEvent}
            onStartTask={startTask}
            onDeleteTask={handleDeleteTask}
            isAudioReady={isReady}
            stamps={stamps}
            zundaCoins={zundaCoins}
            unlockedVoices={unlockedVoices}
            selectedVoice={selectedVoice}
            onSpendCoins={handleSpendCoins}
            onUnlockVoice={handleUnlockVoice}
            onSelectVoice={setSelectedVoice}
            zundaPower={zundaPower}
            isStartLocked={isSummerFatigueActive}
          />
        )}

        {view === 'TIMER' && currentTask && (
          <TaskTimer
            durationMinutes={currentTask?.duration}
            taskTitle={currentTask?.title}
            subtasks={currentTask?.subtasks}
            zundaPower={zundaPower}
            onStop={stopTask}
          />
        )}

        {view === 'CHECKLIST' && (
          <ForcedChecklist onComplete={completeChecklist} />
        )}

        {view === 'BREAK' && currentTask && (
          <BreakTimer onFinish={finishBreak} durationMinutes={currentTask.breakDuration} />
        )}

        {view === 'SUMMER_FATIGUE' && summerFatigueEndAt && (
          <SummerFatigueTimer
            endAt={summerFatigueEndAt}
            onRecover={recoverFromSummerFatigue}
          />
        )}

      </div>
    </div>
  )
}

function App() {
  return (
    <NotificationProvider>
      <AppContent />
    </NotificationProvider>
  )
}

export default App
