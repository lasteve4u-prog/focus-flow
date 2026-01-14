import React, { useState, useEffect, useRef } from 'react';
import { useNotification, type AlertType } from '../contexts/NotificationContext';
import { NotificationModal } from './NotificationModal';
import confetti from 'canvas-confetti';
import type { Subtask } from '../types';
interface TaskTimerProps {
    durationMinutes: number;
    taskTitle: string;
    subtasks?: Subtask[];
    onStop: (interruptions: string[], finalSubtasks: Subtask[]) => void;
}

export const TaskTimer: React.FC<TaskTimerProps> = ({ durationMinutes, taskTitle, subtasks: initialSubtasks, onStop }) => {
    const [timeLeft, setTimeLeft] = useState(durationMinutes * 60);
    const [endTime, setEndTime] = useState<number | null>(null);
    const [isAlertOpen, setIsAlertOpen] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [isTimeUp, setIsTimeUp] = useState(false);
    const [alertType, setAlertType] = useState<AlertType>('default');
    const [interruptions, setInterruptions] = useState<string[]>([]);
    const [subtasks, setSubtasks] = useState<Subtask[]>(initialSubtasks || []);

    // Notification Hook
    const { } = useNotification();

    const timerRef = useRef<number | null>(null);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    useEffect(() => {
        // Calculate end time on mount
        const durationMs = durationMinutes * 60 * 1000;
        const targetTime = Date.now() + durationMs;
        setEndTime(targetTime);
    }, []);

    useEffect(() => {
        if (!endTime) return;

        timerRef.current = window.setInterval(() => {
            const now = Date.now();
            const diff = endTime - now;
            // Calculate remaining seconds, ensuring it doesn't go below 0
            const remaining = Math.max(0, Math.ceil(diff / 1000));

            setTimeLeft(remaining);

            if (remaining <= 0) {
                if (timerRef.current) clearInterval(timerRef.current);
            }
        }, 200);

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [endTime]);

    // Focus Mode Logic
    const [focusIndex, setFocusIndex] = useState(0);
    const [isFocusMode, setIsFocusMode] = useState(true); // Default to focus mode if subtasks exist

    const currentSubtask = subtasks[focusIndex];
    const isAllSubtasksComplete = subtasks.length > 0 && subtasks.every(s => s.isCompleted);

    const handleNextSubtask = () => {
        // Mark current as done
        const updated = subtasks.map((s, i) => i === focusIndex ? { ...s, isCompleted: true } : s);
        setSubtasks(updated);

        // Move to next incomplete
        const nextIndex = updated.findIndex((s, i) => i > focusIndex && !s.isCompleted);
        if (nextIndex !== -1) {
            setFocusIndex(nextIndex);
        } else {
            // Check from beginning if any skipped
            const firstIncomplete = updated.findIndex(s => !s.isCompleted);
            if (firstIncomplete !== -1) {
                setFocusIndex(firstIncomplete);
            } else {
                // All done
                setIsFocusMode(false); // Switch to list view to show success or empty
                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 }
                });
            }
        }
    };

    const handleSkipSubtask = () => {
        // Just move index
        const nextIndex = subtasks.findIndex((s, i) => i > focusIndex && !s.isCompleted);
        if (nextIndex !== -1) {
            setFocusIndex(nextIndex);
        } else {
            const firstIncomplete = subtasks.findIndex(s => !s.isCompleted);
            if (firstIncomplete !== -1) {
                setFocusIndex(firstIncomplete);
            }
        }
    };

    // Notification Logic
    useEffect(() => {
        const checkNotification = (remainingSec: number) => {
            const remainingMin = remainingSec / 60;

            // Trigger at exactly 15, 10, 5, 1 minutes left
            if ([15, 10, 5, 1].includes(remainingMin)) {
                // Guard: Don't trigger if the task just started (within last 3 seconds)
                const elapsedTime = (durationMinutes * 60) - remainingSec;
                if (elapsedTime < 3) return;

                if (remainingMin === 1) setAlertType('1min');
                else if (remainingMin === 5) setAlertType('5min');
                else setAlertType('default');

                setAlertMessage(`${remainingMin} 分前なのだ！集中するのだ。`);
                setIsAlertOpen(true);
            }

            // Trigger at 0 (Time's up)
            if (remainingSec === 0 && !isTimeUp) {
                setIsTimeUp(true);
                setAlertType('timeout');
                setAlertMessage("時間なのだ！よく頑張ったのだ！");
                setIsAlertOpen(true);
                // Trigger confetti
                confetti({
                    particleCount: 150,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: ['#84cc16', '#ecfccb', '#ffffff'] // Lime/Green theme
                });
            }
        };

        checkNotification(timeLeft);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [timeLeft]);

    const handleStop = () => {
        if (timerRef.current) clearInterval(timerRef.current);
        onStop(interruptions, subtasks);
    };

    const handleModalClose = () => {
        setIsAlertOpen(false);
        if (isTimeUp) {
            handleStop();
        }
    };

    return (
        <div className="flex flex-col items-center justify-center flex-1 w-full bg-lime-100 text-green-900 p-8 rounded-[2rem] shadow-2xl animate-fade-in border-4 border-lime-300">
            <div className="w-full max-w-2xl flex flex-col items-center">
                <div className="mb-4 text-center text-lime-800">
                    <p className="uppercase tracking-[0.2em] text-sm font-black mb-3 text-lime-600 bg-lime-200 inline-block px-4 py-1 rounded-full">現在のタスクなのだ</p>
                    <h2 className="text-3xl md:text-5xl font-black text-green-900 tracking-tight mt-4 mb-2">{taskTitle}</h2>
                </div>

                {/* Subtasks Display (Focus Mode or List Mode) */}
                {subtasks.length > 0 && (
                    <div className="w-full mb-8">
                        <div className="flex justify-between items-center mb-4 px-2">
                            <h3 className="text-sm font-black text-lime-700 flex items-center gap-2">
                                <span>📝</span> サブタスク
                                <span className="text-xs font-normal bg-lime-200 px-2 py-0.5 rounded-full text-lime-800">
                                    {subtasks.filter(s => s.isCompleted).length}/{subtasks.length}
                                </span>
                            </h3>
                            <button
                                onClick={() => setIsFocusMode(!isFocusMode)}
                                className="text-xs font-bold text-lime-600 underline hover:text-lime-800"
                            >
                                {isFocusMode ? "リスト表示にする" : "集中モードにする"}
                            </button>
                        </div>

                        {/* Focus View */}
                        {isFocusMode && currentSubtask && !isAllSubtasksComplete ? (
                            <div className="bg-white rounded-[2rem] p-8 border-4 border-lime-400 shadow-xl flex flex-col items-center text-center animate-slide-up relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-2 bg-gray-100">
                                    <div
                                        className="h-full bg-lime-500 transition-all duration-300"
                                        style={{ width: `${(subtasks.filter(s => s.isCompleted).length / subtasks.length) * 100}%` }}
                                    />
                                </div>
                                <div className="mt-4 mb-2 text-lime-500 font-bold uppercase tracking-widest text-xs">
                                    Current Focus
                                </div>
                                <h4 className="text-2xl md:text-3xl font-black text-green-900 mb-8 leading-relaxed">
                                    {currentSubtask.title}
                                </h4>

                                <div className="flex gap-4 w-full">
                                    <button
                                        onClick={handleSkipSubtask}
                                        className="px-6 py-4 rounded-2xl font-bold text-lime-600 bg-lime-50 hover:bg-lime-100 transition-colors"
                                    >
                                        スキップ
                                    </button>
                                    <button
                                        onClick={handleNextSubtask}
                                        className="flex-1 px-6 py-4 rounded-2xl font-black text-white bg-lime-500 hover:bg-lime-600 shadow-[0_4px_0_rgb(65,130,20)] active:translate-y-1 active:shadow-none transition-all text-xl"
                                    >
                                        完了！次へ 👉
                                    </button>
                                </div>
                            </div>
                        ) : (
                            /* List View */
                            <div className="bg-white/50 rounded-2xl p-6 border-2 border-lime-200 animate-fade-in">
                                {isAllSubtasksComplete && (
                                    <div className="text-center mb-4 p-4 bg-lime-100 rounded-xl border border-lime-300 text-lime-700 font-bold">
                                        🎉 全て完了したのだ！お疲れ様なのだ！
                                    </div>
                                )}
                                <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
                                    {subtasks.map((step, idx) => (
                                        <label key={step.id} className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${step.isCompleted ? 'bg-lime-100 opacity-60' : (idx === focusIndex && isFocusMode) ? 'bg-lime-50 border-2 border-lime-300' : 'bg-white hover:bg-lime-50'}`}>
                                            <input
                                                type="checkbox"
                                                checked={step.isCompleted}
                                                onChange={() => {
                                                    setSubtasks(prev => prev.map(s => s.id === step.id ? { ...s, isCompleted: !s.isCompleted } : s));
                                                }}
                                                className="w-6 h-6 text-lime-500 rounded focus:ring-lime-400 border-gray-300"
                                            />
                                            <span className={`font-bold text-md ${step.isCompleted ? 'line-through text-lime-600' : 'text-green-800'}`}>
                                                {step.title}
                                            </span>
                                            {idx === focusIndex && !step.isCompleted && (
                                                <span className="ml-auto text-xs bg-lime-500 text-white px-2 py-1 rounded-full font-bold">NOW</span>
                                            )}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <div className="relative mb-8 w-full max-w-lg mt-4">
                    {/* Visual Progress Bar */}
                    <div className="w-full h-6 bg-lime-200/50 rounded-full overflow-hidden border-2 border-lime-300 shadow-inner relative">
                        <div
                            className={`h-full transition-all duration-1000 ease-linear ${(timeLeft / (durationMinutes * 60)) < 0.2 ? 'bg-red-400' :
                                (timeLeft / (durationMinutes * 60)) < 0.5 ? 'bg-yellow-400' : 'bg-lime-500'
                                }`}
                            style={{ width: `${(timeLeft / (durationMinutes * 60)) * 100}%` }}
                        />
                    </div>
                </div>

                <div className="relative mb-12">
                    {/* Glow effect */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-lime-400/20 blur-3xl rounded-full pointer-events-none animate-pulse"></div>

                    {/* Zundamon/Bean Icon Animated */}
                    <div className="absolute -top-24 left-1/2 -translate-x-1/2 text-6xl animate-yura-yura drop-shadow-md">
                        🫛
                    </div>

                    <div className="text-[9rem] md:text-[11rem] leading-none font-black tracking-[0.2rem] text-lime-600 drop-shadow-xl tabular-nums transition-all duration-300 font-mono">
                        {formatTime(timeLeft)}
                    </div>
                </div>

                <div className="flex gap-4">
                    <button
                        onClick={handleStop}
                        className="group relative inline-flex items-center justify-center px-10 py-5 font-black text-white text-xl rounded-full bg-red-400 hover:bg-red-500 border-4 border-white/30 btn-puni"
                    >
                        <span className="mr-3 animate-pulse text-2xl">⏹</span> 中断するのだ！
                    </button>

                    <button
                        onClick={() => {
                            const note = prompt("あとでやることをメモするのだ！✍️");
                            if (note) {
                                setInterruptions(prev => [...prev, note]);
                                alert("メモしたのだ！集中に戻るのだ！😤");
                            }
                        }}
                        className="group relative inline-flex items-center justify-center px-6 py-5 font-black text-lime-600 text-lg rounded-full bg-white hover:bg-lime-50 border-4 border-lime-200 btn-puni"
                        title="あとでやる (Memo)"
                    >
                        <span className="text-2xl">⚡️</span> あとで！
                    </button>
                </div>

                <div className="mt-16 text-lime-700 text-lg font-bold tracking-wide bg-lime-50 px-6 py-2 rounded-full border-2 border-lime-200">
                    ✨ 集中するのだ！えらいのだ！ ✨
                </div>
            </div>

            <NotificationModal
                isOpen={isAlertOpen}
                onClose={handleModalClose}
                message={alertMessage}
                alertType={alertType}
            />
        </div>
    );
};
