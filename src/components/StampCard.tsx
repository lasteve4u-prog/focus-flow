import React, { useState, useEffect } from 'react';

interface StampCardProps {
    stamps: Record<string, boolean>;
    currentDate: string; // YYYY-MM-DD
}

export const StampCard: React.FC<StampCardProps> = ({ stamps, currentDate }) => {
    const [days, setDays] = useState<string[]>([]);


    useEffect(() => {
        // Generate days for the current month
        const date = new Date(currentDate);
        const year = date.getFullYear();
        const month = date.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const newDays = Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        });

        setDays(newDays);
    }, [currentDate]);

    // Check if we just got a stamp today to trigger animation
    useEffect(() => {
        if (stamps[currentDate]) {
            // In a real app we might want a more robust "just earned" state, 
            // but for now, if it's there, we can animate on mount or just be static.
            // Let's make it static mainly, but maybe a subtle pulse.
        }
    }, [stamps, currentDate]);

    const titleDate = new Date(currentDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long' });

    return (
        <section className="bg-white p-6 rounded-[2rem] border-4 border-lime-200 shadow-lg mt-8 relative overflow-hidden">
            <h2 className="text-2xl font-black text-green-800 mb-6 flex items-center justify-center gap-3">
                <span className="text-3xl">💮</span>
                <span>{titleDate} のスタンプ帳</span>
                <span className="text-3xl">💮</span>
            </h2>

            <div className="grid grid-cols-7 gap-2 sm:gap-4">
                {days.map(dayStr => {
                    const isEarned = stamps[dayStr];
                    const dayNum = parseInt(dayStr.split('-')[2]);
                    const isToday = dayStr === currentDate;

                    return (
                        <div key={dayStr} className={`aspect-square flex flex-col items-center justify-center bg-lime-50 rounded-xl border-2 ${isToday ? 'border-lime-400 ring-2 ring-lime-200' : 'border-lime-100'} relative`}>
                            <span className="absolute top-1 left-1 text-[10px] font-bold text-lime-400">{dayNum}</span>

                            {isEarned ? (
                                <img
                                    src="/zundamon-icon.png"
                                    alt="Stamped"
                                    className="w-4/5 h-4/5 object-contain animate-bounce-in drop-shadow-md"
                                />
                            ) : (
                                <img
                                    src="/zundamon-icon.png"
                                    alt="Not Stamped"
                                    className="w-4/5 h-4/5 object-contain grayscale opacity-20"
                                />
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="mt-6 text-center text-xs font-bold text-lime-600 bg-lime-100/50 py-2 rounded-full">
                <p>1日 120分 or 4回集中でスタンプGETなのだ！✨</p>
            </div>
        </section>
    );
};
