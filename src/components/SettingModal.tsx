import React, { useState } from 'react';
import type { Subtask } from '../types';
import { TaskBreakdownModal } from './TaskBreakdownModal';

interface SettingModalProps {
    initialFocusDuration: number; // minutes
    initialBreakDuration: number; // minutes
    onStart: (focusDuration: number, breakDuration: number, title: string, subtasks: Subtask[]) => Promise<void>;
    isAudioReady: boolean;
}

export const SettingModal: React.FC<SettingModalProps> = ({
    initialFocusDuration,
    initialBreakDuration,
    onStart,
    isAudioReady
}) => {
    // Local state for the settings
    const [taskDuration, setTaskDuration] = useState<number>(initialFocusDuration);
    const [breakDuration, setBreakDuration] = useState<number>(initialBreakDuration);
    const [sessionTitle, setSessionTitle] = useState('');
    const [isBreakdownModalOpen, setIsBreakdownModalOpen] = useState(false);
    const [pendingSubtasks, setPendingSubtasks] = useState<Subtask[]>([]);
    const [isStarting, setIsStarting] = useState(false);

    const handleStartTask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (Number(taskDuration) > 0 && isAudioReady && !isStarting) {
            setIsStarting(true);
            try {
                await onStart(
                    Number(taskDuration),
                    Number(breakDuration),
                    sessionTitle || "集中タイム",
                    pendingSubtasks
                );
            } catch (e) {
                console.error("Start task failed", e);
                setIsStarting(false);
            }
        }
    };

    return (
        <section className="bg-white p-8 rounded-[2rem] shadow-lg border-4 border-lime-200 transition-transform hover:scale-[1.01] duration-300">
            <h2 className="text-2xl font-black text-green-800 mb-6 flex items-center gap-3">
                <span className="text-3xl animate-bounce">⏱️</span>
                <span>セッションを設定するのだ！</span>
            </h2>
            <form onSubmit={handleStartTask} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                    <label className="block text-sm font-bold text-lime-700 pl-2">何に集中するのだ？</label>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="例: レポート作成"
                            value={sessionTitle}
                            onChange={(e) => setSessionTitle(e.target.value)}
                            className="w-full p-4 pr-14 bg-lime-50 border-2 border-lime-100 rounded-[1.5rem] focus:ring-4 focus:ring-lime-200 focus:border-lime-400 outline-none transition-all font-bold text-lg text-lime-800 placeholder-lime-300"
                        />
                        {/* Magic Breakdown Button */}
                        <button
                            type="button"
                            onClick={() => setIsBreakdownModalOpen(true)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-2xl hover:scale-110 transition-transform p-2 text-lime-500 hover:text-lime-700 active:scale-95"
                            title="AIでタスクを分解するのだ！"
                        >
                            🪄
                        </button>
                    </div>
                </div>
                <div className="flex gap-4">
                    <div className="flex-1 flex flex-col gap-1">
                        <label className="block text-sm font-bold text-lime-700 pl-2">集中時間 (分)</label>
                        <input
                            type="number"
                            min="1"
                            value={taskDuration}
                            onChange={(e) => setTaskDuration(Number(e.target.value))}
                            className="w-full p-4 bg-lime-50 border-2 border-lime-100 rounded-[1.5rem] focus:ring-4 focus:ring-lime-200 focus:border-lime-400 outline-none transition-all font-bold text-lg text-lime-800"
                        />
                    </div>
                    <div className="flex-1 flex flex-col gap-1">
                        <label className="block text-sm font-bold text-lime-700 pl-2">休憩時間 (分)</label>
                        <input
                            type="number"
                            min="1"
                            value={breakDuration}
                            onChange={(e) => setBreakDuration(Number(e.target.value))}
                            className="w-full p-4 bg-blue-50 border-2 border-blue-100 rounded-[1.5rem] focus:ring-4 focus:ring-blue-200 focus:border-blue-400 outline-none transition-all font-bold text-lg text-blue-800"
                        />
                    </div>
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
                    {isStarting ? '起動中...' : (!isAudioReady ? '準備中なのだ...' : 'この設定で始めるのだ！')}
                </button>

            </form>

            <TaskBreakdownModal
                isOpen={isBreakdownModalOpen}
                onClose={() => setIsBreakdownModalOpen(false)}
                taskTitle={sessionTitle}
                onConfirm={(subtasks) => {
                    setPendingSubtasks(subtasks);
                    setIsBreakdownModalOpen(false);
                    alert(`${subtasks.length}個のサブタスクをセットしたのだ！`);
                }}
            />
        </section>
    );
};
