import React, { useState, useEffect, useRef } from 'react';
import { useNotification } from '../contexts/NotificationContext';

interface SummerFatigueTimerProps {
    endAt: number;
    onRecover: () => void;
}

export const SummerFatigueTimer: React.FC<SummerFatigueTimerProps> = ({ endAt, onRecover }) => {
    const calcRemaining = () => Math.max(0, Math.ceil((endAt - Date.now()) / 1000));
    const [timeLeft, setTimeLeft] = useState(calcRemaining);
    const { playAlert, stopAlert } = useNotification();
    const timerRef = useRef<number | null>(null);
    const hasRecoveredRef = useRef(false);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    useEffect(() => {
        timerRef.current = window.setInterval(() => {
            const remaining = calcRemaining();
            setTimeLeft(remaining);

            if (remaining <= 0 && timerRef.current) {
                clearInterval(timerRef.current);
            }
        }, 200);

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [endAt]);

    useEffect(() => {
        if (timeLeft > 0 || hasRecoveredRef.current) return;

        hasRecoveredRef.current = true;
        stopAlert();
        playAlert('praise-2');

        window.alert(
            'スイカを食べ終わったのだ！🍉\nずんだパワーが全回復したのだ！\nまた無理せず集中するのだ！'
        );

        onRecover();
    }, [timeLeft, onRecover, playAlert, stopAlert]);

    return (
        <div className="flex flex-col items-center justify-center flex-1 w-full bg-gradient-to-b from-amber-50 to-orange-100 text-orange-900 p-8 rounded-[2rem] shadow-2xl animate-fade-in border-4 border-orange-300">
            <div className="w-full max-w-2xl flex flex-col items-center text-center">
                <div className="mb-6">
                    <span className="text-7xl animate-pulse inline-block mb-4">🍉</span>
                    <h2 className="text-3xl md:text-4xl font-black text-orange-800 tracking-tight">
                        夏バテモードなのだ…
                    </h2>
                </div>

                <p className="text-lg md:text-xl font-bold text-orange-700 leading-relaxed mb-8 px-2 max-w-lg">
                    ずんだもんが夏バテでのびちゃったのだ…
                    <br />
                    スイカを食べて回復するまで待つ（15分）のだ…🍉
                </p>

                <div className="relative mb-10">
                    <div className="text-[7rem] md:text-[9rem] leading-none font-black tracking-[0.2rem] text-orange-500 drop-shadow-sm tabular-nums font-mono">
                        {formatTime(timeLeft)}
                    </div>
                    <p className="mt-4 text-orange-600 font-bold text-sm md:text-base">
                        回復まであと…（スキップ不可なのだ）
                    </p>
                </div>

                <div className="flex items-center gap-3 bg-orange-200/60 px-6 py-4 rounded-2xl border-2 border-orange-300">
                    <span className="text-4xl">😵‍💫</span>
                    <p className="text-left text-sm md:text-base font-bold text-orange-800">
                        次の集中は、タイマーが終わるまで
                        <br />
                        開始できないのだ…
                    </p>
                </div>
            </div>
        </div>
    );
};
