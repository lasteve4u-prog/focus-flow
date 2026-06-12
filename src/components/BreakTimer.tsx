import React, { useState, useEffect, useRef } from 'react';
import { useNotification } from '../contexts/NotificationContext';

interface BreakTimerProps {
    onFinish: () => void;
    durationMinutes: number;
}

export const BreakTimer: React.FC<BreakTimerProps> = ({ onFinish, durationMinutes }) => {
    const [timeLeft, setTimeLeft] = useState(durationMinutes * 60);
    const [endTime, setEndTime] = useState<number | null>(null);
    const { playAlert, stopAlert } = useNotification();
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

    const hasPlayedRef = useRef(false);

    // Check for finish
    useEffect(() => {
        if (timeLeft === 0 && !hasPlayedRef.current) {
            hasPlayedRef.current = true;
            // Eusure strict single playback
            stopAlert();
            playAlert('break-end');
        }
    }, [timeLeft, playAlert, stopAlert]);

    const handleFinish = () => {
        // If skipping (time remains), force play the end sound
        if (timeLeft > 0) {
            stopAlert(); // Stop break-start or other sounds
            playAlert('break-end');
        }
        // If time is up (timeLeft == 0), the useEffect already played the sound.
        // We do NOT call stopAlert() here so the voice finishes naturally.

        onFinish();
    };

    return (
        <div className="flex flex-col items-center justify-center flex-1 w-full bg-gradient-to-b from-emerald-50 via-green-50 to-teal-100 text-green-900 p-8 rounded-[2rem] shadow-2xl animate-fade-in border-4 border-green-200">
            <div className="w-full max-w-2xl flex flex-col items-center text-center">
                <div className="mb-8">
                    <span className="text-6xl animate-bounce inline-block mb-4">🍵</span>
                    <h2 className="text-3xl md:text-5xl font-black text-green-800 tracking-tight">休憩タイムなのだ！</h2>
                    <p className="text-green-600 font-bold mt-4 text-lg">今は休むのだ！偉いのだ！</p>
                </div>

                <div className="relative mb-12">
                    <div className="text-[8rem] md:text-[10rem] leading-none font-black tracking-[0.2rem] bg-gradient-to-b from-emerald-400 to-teal-600 bg-clip-text text-transparent drop-shadow-sm tabular-nums font-mono">
                        {formatTime(timeLeft)}
                    </div>
                </div>

                {timeLeft === 0 && (
                    <button
                        onClick={handleFinish}
                        className="px-10 py-5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-full font-black text-xl shadow-[0_4px_0_rgb(34,197,94)] active:shadow-none active:translate-y-[4px] transition-all animate-bounce"
                    >
                        休憩を終えるのだ！
                    </button>
                )}

                {timeLeft > 0 && (
                    <button
                        onClick={handleFinish}
                        className="px-8 py-3 bg-gray-300 hover:bg-gray-400 text-white rounded-full font-bold text-sm transition-all"
                    >
                        スキップするのだ
                    </button>
                )}
            </div>
        </div>
    );
};
