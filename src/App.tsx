import { useState } from 'react'
import { useLocalStorage } from './hooks/useLocalStorage'
import { useStamps } from './hooks/useStamps'
import type { DailyLog, Event, Task } from './types'
import { NotificationProvider, useNotification } from './contexts/NotificationContext'
import { HomeScreen } from './components/HomeScreen'
import { TaskTimer } from './components/TaskTimer'
import { ForcedChecklist } from './components/ForcedChecklist'


import { BreakTimer } from './components/BreakTimer'
import confetti from 'canvas-confetti';

type ViewState = 'HOME' | 'TIMER' | 'CHECKLIST' | 'BREAK';

// Separate component to check NotificationContext internals
function AppContent() {
  const today = new Date().toISOString().split('T')[0];
  const [dailyLog, setDailyLog] = useLocalStorage<DailyLog>(today, {
    date: today,
    events: [],
    tasks: []
  });

  const [view, setView] = useState<ViewState>('HOME');
  const [currentTask, setCurrentTask] = useState<{ title: string; duration: number; interruptions?: string[] } | null>(null);

  const { unlockAudio, playAlert, stopAlert, isReady } = useNotification();
  const { stamps, addStamp } = useStamps();

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

  const startTask = async (title: string, duration: number) => {
    // Explicitly unlock audio on start to ensure context is ready
    await unlockAudio();

    console.log('Zundamon: Attempting to play start sound');
    // Small delay to allow audio context to stabilize after resume/unlock
    setTimeout(() => {
      playAlert('start');
    }, 100);

    setCurrentTask({ title, duration });
    // Also record start of task logic if needed
    setView('TIMER');
  };

  const stopTask = (interruptions?: string[]) => {
    // Explicitly stop any playing alerts (like the timeout loop)
    stopAlert();

    if (currentTask) {
      setCurrentTask({ ...currentTask, interruptions });
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
          : undefined
      };
      setDailyLog(prev => ({ ...prev, tasks: [...prev.tasks, newTask] }));
      taskForStamp = newTask;
    }

    setView('BREAK');

    playAlert('break-start');

    // Stamp Logic
    if (taskForStamp) {
      const currentTasks = dailyLog.tasks;
      const totalDuration = currentTasks.reduce((acc, t) => acc + t.durationMinutes, 0) + taskForStamp.durationMinutes;
      const totalSessions = currentTasks.length + 1;

      if (totalDuration >= 120 || totalSessions >= 4) {
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
    <div onClick={handleInteraction} className={`min-h-screen w-full flex justify-center py-8 font-sans text-green-900 transition-colors duration-1000 ease-in-out ${view === 'TIMER' ? 'bg-[#ecfccb]' : 'bg-lime-50'}`}>
      <div className="w-full max-w-2xl px-4 flex flex-col items-center gap-6 relative">
        {view === 'HOME' && (
          <HomeScreen
            dailyLog={dailyLog}
            onAddEvent={handleAddEvent}
            onUpdateEvent={handleUpdateEvent}
            onDeleteEvent={handleDeleteEvent}
            onStartTask={startTask}
            onDeleteTask={handleDeleteTask}
            onPlayPraise={() => {
              const type = Math.random() > 0.5 ? 'praise-1' : 'praise-2';
              playAlert(type);
            }}
            isAudioReady={isReady}
            stamps={stamps}
          />
        )}

        {view === 'TIMER' && currentTask && (
          <TaskTimer
            durationMinutes={currentTask?.duration}
            taskTitle={currentTask?.title}
            onStop={stopTask}
          />
        )}

        {view === 'CHECKLIST' && (
          <ForcedChecklist onComplete={completeChecklist} />
        )}

        {view === 'BREAK' && (
          <BreakTimer onFinish={finishBreak} />
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
