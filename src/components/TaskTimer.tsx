import React, { useState, useEffect, useRef } from 'react';
import { useNotification, type AlertType } from '../contexts/NotificationContext';
import { NotificationModal } from './NotificationModal';

interface TaskTimerProps {
    durationMinutes: number;
    taskTitle: string;
    onStop: (interruptions?: string[]) => void;
}

export const TaskTimer: React.FC<TaskTimerProps> = ({ durationMinutes, taskTitle, onStop }) => {
    const [timeLeft, setTimeLeft] = useState(durationMinutes * 60);
    const [isAlertOpen, setIsAlertOpen] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [isTimeUp, setIsTimeUp] = useState(false);
    const [alertType, setAlertType] = useState<AlertType>('default');
    const [localInterruptions, setLocalInterruptions] = useState<string[]>([]);

    // Notification Hook
    const { } = useNotification();

    const timerRef = useRef<number | null>(null);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    useEffect(() => {
        timerRef.current = window.setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 0) {
                    if (timerRef.current) clearInterval(timerRef.current);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

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

                setAlertMessage(`${remainingMin} minutes left! Stay focused.`);
                setIsAlertOpen(true);
            }

            // Trigger at 0 (Time's up)
            if (remainingSec === 0 && !isTimeUp) {
                setIsTimeUp(true);
                setAlertType('timeout');
                setAlertMessage("Time's up! Great work.");
                setIsAlertOpen(true);
            }
        };

        checkNotification(timeLeft);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [timeLeft]);

    const handleStop = () => {
        if (timerRef.current) clearInterval(timerRef.current);
        onStop(localInterruptions);
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
                <div className="mb-12 text-center text-lime-800">
                    <p className="uppercase tracking-[0.2em] text-sm font-black mb-3 text-lime-600 bg-lime-200 inline-block px-4 py-1 rounded-full">Current Task</p>
                    <h2 className="text-3xl md:text-5xl font-black text-green-900 tracking-tight mt-4">{taskTitle}</h2>
                </div>

                <div className="relative mb-8 w-full max-w-lg">
                    {/* Visual Progress Bar */}
                    <div className="w-full h-6 bg-lime-200/50 rounded-full overflow-hidden border-2 border-lime-300 shadow-inner relative">
                        <div
                            className={`h-full transition-all duration-1000 ease-linear ${(timeLeft / (durationMinutes * 60)) < 0.2 ? 'bg-red-400' :
                                (timeLeft / (durationMinutes * 60)) < 0.5 ? 'bg-yellow-400' : 'bg-lime-500'
                                }`}
                            style={{ width: `${(timeLeft / (durationMinutes * 60)) * 100}%` }}
                        />
                        {/* Wrapper for the time text to sit nicely above or near the bar if needed */}
                    </div>
                </div>

                <div className="relative mb-12">
                    {/* Glow effect */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-lime-400/20 blur-3xl rounded-full pointer-events-none animate-pulse"></div>

                    <div className="text-[9rem] md:text-[11rem] leading-none font-black tracking-tighter text-lime-600 drop-shadow-xl tabular-nums transition-all duration-300 font-mono">
                        {formatTime(timeLeft)}
                    </div>
                </div>

                <div className="flex gap-4">
                    <button
                        onClick={handleStop}
                        className="group relative inline-flex items-center justify-center px-10 py-5 font-black text-white text-xl transition-all duration-300 bg-red-400 rounded-full hover:bg-red-500 shadow-[0_4px_0_rgb(200,50,50)] hover:shadow-[0_6px_0_rgb(200,50,50)] active:shadow-none active:translate-y-[4px] border-4 border-white/30"
                    >
                        <span className="mr-3 animate-pulse text-2xl">⏹</span> STOP!
                    </button>

                    <button
                        onClick={() => {
                            const note = prompt("あとでやることをメモするのだ！✍️");
                            if (note) {
                                setLocalInterruptions(prev => [...prev, note]);
                                alert("メモしたのだ！集中に戻るのだ！😤");
                            }
                        }}
                        className="group relative inline-flex items-center justify-center px-6 py-5 font-black text-lime-600 text-lg transition-all duration-300 bg-white rounded-full hover:bg-lime-50 shadow-[0_4px_0_#bef264] hover:shadow-[0_6px_0_#bef264] active:shadow-none active:translate-y-[4px] border-4 border-lime-200"
                        title="あとでやる (Memo)"
                    >
                        <span className="text-2xl">⚡️</span> あとで！
                    </button>
                </div>

                <div className="mt-16 text-lime-700 text-lg font-bold tracking-wide bg-lime-50 px-6 py-2 rounded-full border-2 border-lime-200">
                    ✨ Stay Focused! You are doing great! ✨
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
