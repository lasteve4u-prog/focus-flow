import React, { useState, useEffect, useRef } from 'react';
import { useNotification } from '../contexts/NotificationContext';

interface BreakTimerProps {
    onFinish: () => void;
}

export const BreakTimer: React.FC<BreakTimerProps> = ({ onFinish }) => {
    const DURATION_MINUTES = 5;
    const [timeLeft, setTimeLeft] = useState(DURATION_MINUTES * 60);
    const { playAlert, stopAlert } = useNotification();
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

    // Check for finish
    useEffect(() => {
        if (timeLeft === 0) {
            playAlert('break-end');
        }
    }, [timeLeft, playAlert]);

    const handleFinish = () => {
        stopAlert();
        onFinish();
    };

    return (
        <div className="flex flex-col items-center justify-center flex-1 w-full bg-green-50 text-green-900 p-8 rounded-[2rem] shadow-2xl animate-fade-in border-4 border-green-200">
            <div className="w-full max-w-2xl flex flex-col items-center text-center">
                <div className="mb-8">
                    <span className="text-6xl animate-bounce inline-block mb-4">🍵</span>
                    <h2 className="text-3xl md:text-5xl font-black text-green-800 tracking-tight">休憩タイムなのだ！</h2>
                    <p className="text-green-600 font-bold mt-4 text-lg">今は休むのだ！偉いのだ！</p>
                </div>

                <div className="relative mb-12">
                    <div className="text-[8rem] md:text-[10rem] leading-none font-black tracking-tighter text-green-500 drop-shadow-sm tabular-nums font-mono">
                        {formatTime(timeLeft)}
                    </div>
                </div>

                {timeLeft === 0 && (
                    <button
                        onClick={handleFinish}
                        className="px-10 py-5 bg-green-500 hover:bg-green-600 text-white rounded-full font-black text-xl shadow-[0_4px_0_rgb(34,197,94)] active:shadow-none active:translate-y-[4px] transition-all animate-bounce"
                    >
                        休憩おわり！
                    </button>
                )}

                {timeLeft > 0 && (
                    <button
                        onClick={handleFinish}
                        className="px-8 py-3 bg-gray-300 hover:bg-gray-400 text-white rounded-full font-bold text-sm transition-all"
                    >
                        スキップする
                    </button>
                )}
            </div>
        </div>
    );
};
