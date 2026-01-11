import { useState } from 'react'
import { useLocalStorage } from './hooks/useLocalStorage'
import type { DailyLog, Event, Task } from './types'
import { NotificationProvider, useNotification } from './contexts/NotificationContext'
import { HomeScreen } from './components/HomeScreen'
import { TaskTimer } from './components/TaskTimer'
import { ForcedChecklist } from './components/ForcedChecklist'
import { InstallHint } from './components/InstallHint'

import { BreakTimer } from './components/BreakTimer'

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
    if (currentTask) {
      const newTask: Task = {
        id: crypto.randomUUID(),
        title: currentTask.title,
        durationMinutes: currentTask.duration,
        startedAt: new Date().toISOString(), // This is approximate, ideally captured at start
        endedAt: new Date().toISOString(),
        toiletDoneAt: new Date().toISOString(),
        paperDoneAt: new Date().toISOString(),
        description: currentTask.interruptions && currentTask.interruptions.length > 0
          ? `[割り込みメモ]\n- ${currentTask.interruptions.join('\n- ')}`
          : undefined
      };
      setDailyLog(prev => ({ ...prev, tasks: [...prev.tasks, newTask] }));
    }
    // Don't clear currentTask yet if we want to refer to it, but actually we are done with it.
    // Transition to BREAK
    setView('BREAK');

    // Play break start sound
    // We need to access useNotification here? 
    // AppContent sits inside NotificationProvider, so we can use `playAlert`.
    // But `completeChecklist` is inside AppContent, so `const { playAlert } = useNotification()` works.
    playAlert('break-start');
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
    <div onClick={handleInteraction} className="min-h-screen bg-lime-50 w-full flex justify-center py-8 font-sans text-green-900 transition-colors duration-500">
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

        <InstallHint />
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
