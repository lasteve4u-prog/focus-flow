import React, { useState } from 'react';
import type { DailyLog, Event, Subtask } from '../types';
import { exportToMarkdown } from '../utils/exporter';

import { StampCard } from './StampCard';
import { SettingModal } from './SettingModal';
import { ZundaPowerDisplay } from './ZundaPowerDisplay';
import ZundaShop from './ZundaShop';

const getWeekdayStr = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-').map(Number);
    const dateObj = new Date(year, month - 1, day);
    const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
    return weekdays[dateObj.getDay()];
};

interface HomeScreenProps {
    dailyLog: DailyLog;
    onAddEvent: (title: string, focusDuration: number, breakDuration: number) => void;
    onUpdateEvent: (event: Event) => void;
    onDeleteEvent: (id: string) => void;
    onStartTask: (title: string, duration: number, breakDuration: number, subtasks?: Subtask[], sourceEventId?: string) => Promise<void>; // Updated to Promise
    onDeleteTask: (taskId: string) => void;
    isAudioReady: boolean;
    stamps: Record<string, boolean>;
    // ずんだコイン制度
    zundaCoins: number;
    unlockedVoices: string[];
    selectedVoice: string;
    onSpendCoins: (amount: number) => boolean;
    onUnlockVoice: (voiceId: string) => void;
    onSelectVoice: (voiceId: string) => void;
    zundaPower: number;
    isStartLocked: boolean;
}

const FOCUS_OPTIONS = [15, 20, 25, 30, 45, 60, 90];
const BREAK_OPTIONS = [5, 10, 15];

export const HomeScreen: React.FC<HomeScreenProps> = ({ dailyLog, onAddEvent, onUpdateEvent, onDeleteEvent, onStartTask, onDeleteTask, isAudioReady, stamps, zundaCoins, unlockedVoices, selectedVoice, onSpendCoins, onUnlockVoice, onSelectVoice, zundaPower, isStartLocked }) => {
    const [newEventTitle, setNewEventTitle] = useState('');
    const [focusDuration, setFocusDuration] = useState(25);
    const [breakDuration, setBreakDuration] = useState(5);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [convertingEvent, setConvertingEvent] = useState<Event | null>(null);

    const handleSubmitEvent = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newEventTitle) return;

        if (editingId) {
            onUpdateEvent({
                id: editingId,
                title: newEventTitle,
                focusDuration,
                breakDuration
            });
            setEditingId(null);
        } else {
            onAddEvent(newEventTitle, focusDuration, breakDuration);
        }
        setNewEventTitle('');
        // Reset durations for a fresh entry
        setFocusDuration(25);
        setBreakDuration(5);
    };

    const handleEditClick = (event: Event) => {
        setNewEventTitle(event.title);
        setFocusDuration(event.focusDuration);
        setBreakDuration(event.breakDuration);
        setEditingId(event.id);
    };

    const handleCancelEdit = () => {
        setNewEventTitle('');
        setFocusDuration(25);
        setBreakDuration(5);
        setEditingId(null);
    };

    return (
        <>
        <div className="w-full">
           <div className="w-full space-y-4 mt-2 md:mt-4">
           <header className="flex flex-col items-center mb-2 mt-2 gap-4 animate-fade-in">
                    <div className="flex flex-row items-center justify-center gap-6 flex-wrap">
                        <div className="flex items-center gap-2 sm:gap-3">
                            <span className="text-4xl sm:text-5xl animate-bounce select-none">🫛</span>
                            <h1 className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-lime-500 via-green-500 to-emerald-500 bg-clip-text text-transparent tracking-widest drop-shadow-md select-none">
                                FocusFlow
                            </h1>
                        </div>
                        <div className="bg-gradient-to-r from-lime-100 to-emerald-100 px-5 py-1.5 rounded-full border border-lime-200 shadow-sm">
                            <p className="text-lime-700 text-xl font-bold tracking-wider">
                                {`${dailyLog.date} (${getWeekdayStr(dailyLog.date)})`}
                            </p>
                        </div>
                    </div>
                    <ZundaPowerDisplay power={zundaPower} size="lg" />
                </header>

                {/* Task Starter Section (Refactored to SettingModal) */}
                <SettingModal
                    initialFocusDuration={25}
                    initialBreakDuration={5}
                    onStart={async (focusDuration, breakDuration, title, subtasks) => {
                        await onStartTask(title, focusDuration, breakDuration, subtasks);
                    }}
                    isAudioReady={isAudioReady}
                    isStartLocked={isStartLocked}
                />

                {/* Schedule / Events */}
                <section>
                    <div className="flex items-center justify-between mb-6 px-2">
                        <h2 className="text-2xl font-black text-green-800 flex items-center gap-2">
                            <span>📅</span> 今日のTo Doなのだ
                        </h2>
                    </div>

                    <div className="space-y-4 mb-10">
                        {dailyLog.events.map((event) => (
                            <div key={event.id} className="group bg-gradient-to-r from-white to-lime-50 p-5 rounded-[1.5rem] border-2 border-lime-100 shadow-sm flex items-center justify-between hover:border-lime-300 hover:shadow-md transition-all duration-200">
                                <div className="flex items-center gap-5 w-full">
                                    <div className="flex flex-col gap-1 flex-shrink-0">
                                        <span className="text-xs font-bold text-lime-600 bg-lime-50 px-3 py-1 rounded-full border border-lime-100 whitespace-nowrap">⏱️ {event.focusDuration}分</span>
                                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 whitespace-nowrap">☕ {event.breakDuration}分</span>
                                    </div>
                                    <span className="font-bold text-green-800 text-lg truncate flex-1">{event.title}</span>
                                </div>
                                <div className="flex gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => setConvertingEvent(event)}
                                        className="p-3 text-green-600 hover:bg-green-50 rounded-full transition-colors active:scale-95"
                                        title="タスクとして開始"
                                    >
                                        ▶️
                                    </button>
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
                                <p className="font-bold">To Doはまだないのだ 🌱</p>
                            </div>
                        )}
                    </div>

                    {/* Add/Edit Event Form */}
                    <div className={`p-6 rounded-[2rem] border-4 shadow-lg transition-colors ${editingId ? 'border-orange-200 bg-gradient-to-br from-white to-orange-50' : 'border-lime-200 bg-gradient-to-br from-white via-lime-50/40 to-emerald-50/60'}`}>
                        <h3 className={`text-sm font-bold mb-4 px-2 uppercase tracking-wider ${editingId ? 'text-orange-600' : 'text-lime-600'}`}>
                            {editingId ? '✏️ To Doを編集するのだ' : '✨ 新しいTo Doを追加するのだ'}
                        </h3>
                        <form onSubmit={handleSubmitEvent} className="flex flex-col gap-4 flex-wrap md:items-center">
                            <div className="flex gap-2 flex-shrink-0 w-full md:w-auto">
                                <label className="flex items-center gap-2 text-sm font-bold text-green-800 bg-lime-50 border-2 border-lime-100 rounded-2xl px-3 py-2 w-full md:w-auto">
                                    <span className="whitespace-nowrap">⏱️ 集中</span>
                                    <select
                                        value={focusDuration}
                                        onChange={(e) => setFocusDuration(Number(e.target.value))}
                                        className="bg-transparent outline-none font-bold text-green-800 flex-1 md:flex-none"
                                    >
                                        {FOCUS_OPTIONS.map((m) => (
                                            <option key={m} value={m}>{m}分</option>
                                        ))}
                                    </select>
                                </label>
                                <label className="flex items-center gap-2 text-sm font-bold text-green-800 bg-emerald-50 border-2 border-emerald-100 rounded-2xl px-3 py-2 w-full md:w-auto">
                                    <span className="whitespace-nowrap">☕ 休憩</span>
                                    <select
                                        value={breakDuration}
                                        onChange={(e) => setBreakDuration(Number(e.target.value))}
                                        className="bg-transparent outline-none font-bold text-green-800 flex-1 md:flex-none"
                                    >
                                        {BREAK_OPTIONS.map((m) => (
                                            <option key={m} value={m}>{m}分</option>
                                        ))}
                                    </select>
                                </label>
                            </div>
                            <input
                                type="text"
                                placeholder="例: レポート作成"
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
                                    className="px-6 py-3 bg-gradient-to-r from-lime-500 to-green-600 text-white rounded-full text-sm font-bold hover:from-lime-600 hover:to-green-700 shadow-md flex-shrink-0 whitespace-nowrap w-full md:w-auto btn-puni"
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
                                    <div key={task.id} className="bg-gradient-to-br from-lime-100/70 to-emerald-100/50 p-5 rounded-2xl border border-lime-200 flex flex-col gap-3 relative hover:shadow-sm transition-shadow">

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

                {/* ずんだ銀行 & ショップ */}
                <ZundaShop
                    coins={zundaCoins}
                    unlockedVoices={unlockedVoices}
                    selectedVoice={selectedVoice}
                    onSpendCoins={onSpendCoins}
                    onUnlockVoice={onUnlockVoice}
                    onSelectVoice={onSelectVoice}
                />

                <div className="flex justify-center mt-12 mb-8">
                    <button
                        onClick={() => exportToMarkdown(dailyLog)}
                        className="px-8 py-4 text-lime-600 border-2 border-lime-200 bg-white rounded-full font-bold hover:bg-lime-50 hover:border-lime-300 outline-none focus:ring-4 focus:ring-lime-100 transition-all shadow-sm btn-puni"
                    >
                        Obsidianに書き出すのだ 📝
                    </button>
                </div>
            </div>
        </div >

        {/* Event → Task 変換モーダル */}
        {convertingEvent && (
            <div
                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={() => setConvertingEvent(null)}
            >
                <div className="w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                    <div className="mb-3 flex items-center justify-between px-2">
                        <p className="text-white font-bold text-sm opacity-80">
                            ⏱️ 集中 {convertingEvent.focusDuration}分 / ☕ 休憩 {convertingEvent.breakDuration}分
                        </p>
                        <button
                            onClick={() => setConvertingEvent(null)}
                            className="text-white opacity-60 hover:opacity-100 text-xl font-bold"
                        >✕</button>
                    </div>
                    <SettingModal
                        key={convertingEvent.id}
                        initialTitle={convertingEvent.title}
                        initialFocusDuration={convertingEvent.focusDuration}
                        initialBreakDuration={convertingEvent.breakDuration}
                        onStart={async (focusDuration, breakDuration, title, subtasks) => {
                            // 完走したときに削除できるよう、元のTo Do idを渡す
                            await onStartTask(title, focusDuration, breakDuration, subtasks, convertingEvent.id);
                            setConvertingEvent(null);
                        }}
                        isAudioReady={isAudioReady}
                        isStartLocked={isStartLocked}
                    />
                </div>
            </div>
        )}
        </>
    );
};
