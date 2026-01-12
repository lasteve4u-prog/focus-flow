import React, { useState } from 'react';
import type { DailyLog, Event, Subtask } from '../types';
import { exportToMarkdown } from '../utils/exporter';

import { StampCard } from './StampCard';
import { TaskBreakdownModal } from './TaskBreakdownModal';

interface HomeScreenProps {
    dailyLog: DailyLog;
    onAddEvent: (title: string, start: string, end: string) => void;
    onUpdateEvent: (event: Event) => void;
    onDeleteEvent: (id: string) => void;
    onStartTask: (title: string, duration: number, subtasks?: Subtask[]) => Promise<void>; // Updated to Promise
    onDeleteTask: (taskId: string) => void;
    isAudioReady: boolean;
    stamps: Record<string, boolean>;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ dailyLog, onAddEvent, onUpdateEvent, onDeleteEvent, onStartTask, onDeleteTask, isAudioReady, stamps }) => {
    const [newEventTitle, setNewEventTitle] = useState('');
    const [startTime, setStartTime] = useState('09:00');
    const [endTime, setEndTime] = useState('10:00');
    const [taskDuration, setTaskDuration] = useState<number | string>(25);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isStarting, setIsStarting] = useState(false);

    const [sessionTitle, setSessionTitle] = useState('');
    const [isBreakdownModalOpen, setIsBreakdownModalOpen] = useState(false);
    const [pendingSubtasks, setPendingSubtasks] = useState<Subtask[]>([]);

    const handleSubmitEvent = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newEventTitle) return;

        if (editingId) {
            onUpdateEvent({
                id: editingId,
                title: newEventTitle,
                startTime,
                endTime
            });
            setEditingId(null);
        } else {
            onAddEvent(newEventTitle, startTime, endTime);
        }
        setNewEventTitle('');
        // Reset time only on add, or keep it? Let's reset for fresh entry or clear form.
        setStartTime('09:00');
        setEndTime('10:00');
    };

    const handleEditClick = (event: Event) => {
        setNewEventTitle(event.title);
        setStartTime(event.startTime);
        setEndTime(event.endTime);
        setEditingId(event.id);
    };

    const handleCancelEdit = () => {
        setNewEventTitle('');
        setStartTime('09:00');
        setEndTime('10:00');
        setEditingId(null);
    };

    const handleStartTask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (Number(taskDuration) > 0 && isAudioReady && !isStarting) {
            setIsStarting(true);
            try {
                // Play start sound (NotificationContext will also warm up, but this is immediate user feedback if needed)
                // Actually we rely on unlockAudio now.

                // Call start task which will await unlock
                await onStartTask(sessionTitle || "集中タイム", Number(taskDuration) || 25, pendingSubtasks);
            } catch (e) {
                console.error("Start task failed", e);
                setIsStarting(false);
            }
        }
    };



    // Better approach: Pass `playVoice` prop?
    // Implementation Plan said: "Play praise-1 or praise-2 randomly when mounting if achievements exist."
    // Okay, I will implement that.

    // NOTE: HomeScreen doesn't know about `useNotification`.
    // I will use `new Audio` which is consistent with `handleStartTask`.



    return (
        <div className="w-full">
            <div className="w-full space-y-8 mt-4 md:mt-8">
                <header className="flex flex-col items-center justify-center mb-12 mt-6 gap-4 animate-fade-in">
                    <div className="flex items-center gap-4 sm:gap-6">
                        <span className="text-6xl sm:text-7xl animate-bounce select-none">🫛</span>
                        <h1 className="text-6xl sm:text-7xl font-extrabold text-lime-600 tracking-widest drop-shadow-md select-none">
                            FocusFlow
                        </h1>
                    </div>
                    <div className="bg-lime-100/50 px-6 py-1 rounded-full border border-lime-200">
                        <p className="text-lime-700 text-lg font-bold tracking-wider">{dailyLog.date}</p>
                    </div>
                </header>

                {/* Task Starter */}
                <section className="bg-white p-8 rounded-[2rem] shadow-lg border-4 border-lime-200 transition-transform hover:scale-[1.01] duration-300">
                    <h2 className="text-2xl font-black text-green-800 mb-6 flex items-center gap-3">
                        <span className="text-3xl animate-bounce">⏱️</span>
                        <span>セッションを開始するのだ！</span>
                    </h2>
                    <form onSubmit={handleStartTask} className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1">
                            <label className="block text-sm font-bold text-lime-700 pl-2">何に集中するのだ？</label>
                            <input
                                type="text"
                                placeholder="例: レポート作成"
                                value={sessionTitle}
                                onChange={(e) => setSessionTitle(e.target.value)}
                                className="w-full p-4 bg-lime-50 border-2 border-lime-100 rounded-[1.5rem] focus:ring-4 focus:ring-lime-200 focus:border-lime-400 outline-none transition-all font-bold text-lg text-lime-800 placeholder-lime-300"
                            />
                            {/* Magic Breakdown Button */}
                            <button
                                type="button"
                                onClick={() => setIsBreakdownModalOpen(true)}
                                className="absolute right-3 top-[2.4rem] text-2xl hover:scale-110 transition-transform p-2 bg-lime-100 hover:bg-lime-200 rounded-full"
                                title="AIでタスクを分解するのだ！"
                            >
                                🪄
                            </button>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-6 items-stretch sm:items-end">
                            <div className="flex-1">
                                <label className="block text-sm font-bold text-lime-700 mb-2 pl-2">集中時間 (分)</label>
                                <input
                                    type="number"
                                    value={taskDuration}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        if (val === '') setTaskDuration('');
                                        else setTaskDuration(Number(val));
                                    }}
                                    className="w-full p-5 bg-lime-50 border-2 border-lime-100 rounded-[1.5rem] focus:ring-4 focus:ring-lime-200 focus:border-lime-400 outline-none transition-all font-mono text-xl font-bold text-lime-800"
                                    min="1"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={!isAudioReady || isStarting}
                                className={`px-10 py-5 text-white text-lg font-black rounded-full transition-all btn-puni
                                    ${(!isAudioReady || isStarting)
                                        ? 'bg-gray-400 cursor-not-allowed shadow-none'
                                        : 'bg-green-700 hover:bg-green-800'
                                    }`}
                            >
                                {isStarting ? '起動中...' : (!isAudioReady ? '準備中なのだ...' : '集中を開始するのだ！')}
                            </button>
                        </div>
                    </form>
                </section>

                <TaskBreakdownModal
                    isOpen={isBreakdownModalOpen}
                    onClose={() => setIsBreakdownModalOpen(false)}
                    taskTitle={sessionTitle}
                    onConfirm={(subtasks) => {
                        setPendingSubtasks(subtasks);
                        setIsBreakdownModalOpen(false);
                        // Optional: auto-start or just show visual feedback that subtasks are attached?
                        // For now, let's just create a toast or visual indicator.
                        alert(`${subtasks.length}個のサブタスクをセットしたのだ！`);
                    }}
                />

                {/* Schedule / Events */}
                <section>
                    <div className="flex items-center justify-between mb-6 px-2">
                        <h2 className="text-2xl font-black text-green-800 flex items-center gap-2">
                            <span>📅</span> 今日の予定なのだ
                        </h2>
                    </div>

                    <div className="space-y-4 mb-10">
                        {dailyLog.events.sort((a, b) => a.startTime.localeCompare(b.startTime)).map((event) => (
                            <div key={event.id} className="group bg-white p-5 rounded-[1.5rem] border-2 border-lime-100 shadow-sm flex items-center justify-between hover:border-lime-300 hover:shadow-md transition-all duration-200">
                                <div className="flex items-center gap-5 w-full">
                                    <div className="text-sm font-mono font-bold text-lime-600 bg-lime-50 px-4 py-2 rounded-full border border-lime-100">
                                        {event.startTime} - {event.endTime}
                                    </div>
                                    <span className="font-bold text-green-800 text-lg truncate flex-1">{event.title}</span>
                                </div>
                                <div className="flex gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => handleEditClick(event)}
                                        className="p-3 text-lime-600 hover:bg-lime-100 rounded-full transition-colors active:scale-95"
                                        title="Edit"
                                    >
                                        ✏️
                                    </button>
                                    <button
                                        onClick={() => onDeleteEvent(event.id)}
                                        className="p-3 text-red-400 hover:bg-red-50 rounded-full transition-colors active:scale-95"
                                        title="Delete"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        ))}
                        {dailyLog.events.length === 0 && (
                            <div className="text-center p-10 border-4 border-dashed border-lime-200 rounded-[2rem] text-lime-500 bg-lime-50/50">
                                <p className="font-bold">予定はまだないのだ 🌱</p>
                            </div>
                        )}
                    </div>

                    {/* Add/Edit Event Form */}
                    <div className={`bg-white p-6 rounded-[2rem] border-4 shadow-lg transition-colors ${editingId ? 'border-orange-200 bg-orange-50/30' : 'border-lime-200'}`}>
                        <h3 className={`text-sm font-bold mb-4 px-2 uppercase tracking-wider ${editingId ? 'text-orange-600' : 'text-lime-600'}`}>
                            {editingId ? '✏️ 予定を編集するのだ' : '✨ 新しい予定を追加するのだ'}
                        </h3>
                        <form onSubmit={handleSubmitEvent} className="flex flex-col gap-4 flex-wrap md:items-center">
                            <div className="flex gap-2 flex-shrink-0 w-full md:w-auto">
                                <input
                                    type="time"
                                    value={startTime}
                                    onChange={(e) => setStartTime(e.target.value)}
                                    className="p-3 border-2 border-lime-100 rounded-2xl text-sm font-bold text-green-800 focus:ring-4 focus:ring-lime-100 focus:border-lime-300 outline-none transition bg-lime-50 w-full md:w-auto"
                                />
                                <span className="self-center text-lime-400 font-bold text-lg">~</span>
                                <input
                                    type="time"
                                    value={endTime}
                                    onChange={(e) => setEndTime(e.target.value)}
                                    className="p-3 border-2 border-lime-100 rounded-2xl text-sm font-bold text-green-800 focus:ring-4 focus:ring-lime-100 focus:border-lime-300 outline-none transition bg-lime-50 w-full md:w-auto"
                                />
                            </div>
                            <input
                                type="text"
                                placeholder="例: ミーティング"
                                value={newEventTitle}
                                onChange={(e) => setNewEventTitle(e.target.value)}
                                className="flex-1 p-3 border-2 border-lime-100 rounded-2xl text-sm font-bold text-green-800 focus:ring-4 focus:ring-lime-100 focus:border-lime-300 outline-none transition bg-lime-50 placeholder-lime-300 min-w-[200px]"
                            />
                            {editingId ? (
                                <div className="flex gap-2 flex-shrink-0 w-full md:w-auto justify-end">
                                    <button
                                        type="button"
                                        onClick={handleCancelEdit}
                                        className="px-5 py-3 bg-gray-400 text-white rounded-full text-sm font-bold hover:bg-gray-500 shadow-md whitespace-nowrap btn-puni"
                                    >
                                        やめるのだ
                                    </button>
                                    <button
                                        type="submit"
                                        onClick={(e) => handleSubmitEvent(e)}
                                        className="px-6 py-3 bg-orange-500 text-white rounded-full text-sm font-bold hover:bg-orange-600 shadow-md whitespace-nowrap btn-puni"
                                    >
                                        更新するのだ
                                    </button>
                                </div>
                            ) : (
                                <button
                                    type="submit"
                                    className="px-6 py-3 bg-green-700 text-white rounded-full text-sm font-bold hover:bg-green-800 shadow-md flex-shrink-0 whitespace-nowrap w-full md:w-auto btn-puni"
                                >
                                    追加するのだ
                                </button>
                            )}
                        </form>
                    </div>
                </section>

                {/* Daily Achievements */}
                {dailyLog.tasks.length > 0 && (
                    <section className="animate-fade-in mt-12 pb-12">
                        <div className="flex items-center justify-center mb-8">
                            <div className="h-1 w-20 bg-lime-200 rounded-full"></div>
                            <h2 className="text-xl font-black text-lime-600 mx-4 uppercase tracking-widest">今日の実績なのだ</h2>
                            <div className="h-1 w-20 bg-lime-200 rounded-full"></div>
                        </div>

                        <div className="grid gap-4">
                            {dailyLog.tasks.map((task) => {
                                // Simple random praise
                                const praises = ["天才なのだ！", "集中力がすごかったのだ！", "えらい！", "すごいのだ！", "完璧なのだ！"];
                                // Use task id to deterministically pick a praise so it doesn't change on re-render
                                const praiseIndex = task.id.charCodeAt(0) % praises.length;
                                const praise = praises[praiseIndex];

                                return (
                                    <div key={task.id} className="bg-lime-100/50 p-5 rounded-2xl border border-lime-200 flex flex-col gap-3 relative hover:shadow-sm transition-shadow">

                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="font-bold text-green-900 text-lg">{task.title || "集中セッション"}</h3>
                                                <div className="flex items-baseline gap-2 mt-1">
                                                    <p className="text-xs text-lime-600 font-bold bg-white/50 px-2 py-0.5 rounded-md border border-lime-100">{task.durationMinutes} min</p>
                                                    <span className="text-[10px] text-lime-400 font-bold">{new Date(task.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-bold text-lime-600 bg-white px-3 py-1 rounded-full border border-lime-100 shadow-sm">
                                                        {praise}
                                                    </span>
                                                    <span className="text-2xl">💮</span>
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        if (confirm('本当に削除するのだ？\n(消したタスクは元に戻せないのだ...)')) {
                                                            onDeleteTask(task.id);
                                                        }
                                                    }}
                                                    className="p-2 text-lime-400 hover:bg-red-50 hover:text-red-400 rounded-full transition-colors active:scale-95"
                                                    title="タスクを削除"
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </div>

                                        {/* Memo Section */}
                                        {task.description && (
                                            <div className="bg-lime-50 p-3 rounded-xl border border-lime-100/50 text-sm font-medium text-lime-800 ml-1">
                                                <div className="flex items-center gap-1 mb-1 text-lime-500 text-xs font-bold uppercase tracking-wider">
                                                    <span>📝</span>
                                                    <span>Memo</span>
                                                </div>
                                                <div className="whitespace-pre-wrap pl-1">
                                                    {task.description}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                )}

                <StampCard stamps={stamps} currentDate={dailyLog.date} />

                <div className="flex justify-center mt-12 mb-8">
                    <button
                        onClick={() => exportToMarkdown(dailyLog)}
                        className="px-8 py-4 text-lime-600 border-2 border-lime-200 bg-white rounded-full font-bold hover:bg-lime-50 hover:border-lime-300 outline-none focus:ring-4 focus:ring-lime-100 transition-all shadow-sm btn-puni"
                    >
                        Obsidianに書き出すのだ 📝
                    </button>
                </div>
            </div>
        </div>
    );
};
