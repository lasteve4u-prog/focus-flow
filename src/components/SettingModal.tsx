import React, { useState } from 'react';
import Picker from 'react-mobile-picker';
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
    // State for picker value (controlled component)
    const [pickerValue, setPickerValue] = useState({
        focus: initialFocusDuration,
        break: initialBreakDuration
    });

    const [sessionTitle, setSessionTitle] = useState('');
    const [isBreakdownModalOpen, setIsBreakdownModalOpen] = useState(false);
    const [pendingSubtasks, setPendingSubtasks] = useState<Subtask[]>([]);
    const [isStarting, setIsStarting] = useState(false);

    // Generate options
    const focusOptions = Array.from({ length: 24 }, (_, i) => (i + 1) * 5);
    const breakOptions = Array.from({ length: 30 }, (_, i) => i + 1);

    const handleStartTask = async (e: React.FormEvent) => {
        e.preventDefault();
        // Validation
        const focus = Number(pickerValue.focus);
        const breakTime = Number(pickerValue.break);

        if (focus > 0 && isAudioReady && !isStarting) {
            setIsStarting(true);
            try {
                await onStart(
                    focus,
                    breakTime,
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

                <div className="flex flex-col gap-2">
                    <div className="flex justify-around px-8 text-sm font-bold text-lime-700">
                        <span>集中時間</span>
                        <span>休憩時間</span>
                    </div>

                    {/* Picker Container */}
                    <div className="bg-lime-50 rounded-[2rem] border-2 border-lime-100 p-4 h-[220px] overflow-hidden relative">
                        <Picker
                            value={pickerValue}
                            onChange={setPickerValue}
                            wheelMode="natural"
                            height={180}
                            itemHeight={40}
                        >
                            <Picker.Column name="focus">
                                {focusOptions.map(option => (
                                    <Picker.Item key={option} value={option}>
                                        {({ selected }) => (
                                            <div className={`flex items-center justify-center h-full w-full font-bold text-xl transition-all ${selected ? 'text-lime-600 scale-110' : 'text-gray-300'}`}>
                                                {option} <span className="text-xs ml-1">分</span>
                                            </div>
                                        )}
                                    </Picker.Item>
                                ))}
                            </Picker.Column>
                            <Picker.Column name="break">
                                {breakOptions.map(option => (
                                    <Picker.Item key={option} value={option}>
                                        {({ selected }) => (
                                            <div className={`flex items-center justify-center h-full w-full font-bold text-xl transition-all ${selected ? 'text-blue-500 scale-110' : 'text-gray-300'}`}>
                                                {option} <span className="text-xs ml-1">分</span>
                                            </div>
                                        )}
                                    </Picker.Item>
                                ))}
                            </Picker.Column>
                        </Picker>

                        {/* Center Highlight Overlay (Custom styling to mimic look) */}
                        <div className="absolute top-[50%] left-0 w-full h-[40px] -translate-y-[50%] pointer-events-none border-y-2 border-lime-200/50 bg-lime-100/10"></div>
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
