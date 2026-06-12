import React, { useState, useEffect } from 'react';

interface StampCardProps {
    stamps: Record<string, boolean>;
    currentDate: string; // YYYY-MM-DD
}

export const StampCard: React.FC<StampCardProps> = ({ stamps, currentDate }) => {
    const [days, setDays] = useState<string[]>([]);

    const [yearStr, monthStr] = currentDate.split('-');
    const year = parseInt(yearStr);
    const month = parseInt(monthStr) - 1; // 0-indexed

    useEffect(() => {
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const newDays = Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        });

        setDays(newDays);
    }, [currentDate, year, month]);

    const titleDate = `${year}年${month + 1}月`;
    const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
    const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0: 日, 1: 月, ..., 6: 土
    const emptyCells = Array.from({ length: firstDayOfWeek });

    return (
        <section className="bg-gradient-to-br from-white via-lime-50/50 to-pink-50/40 p-6 rounded-[2rem] border-4 border-lime-200 shadow-lg mt-8 relative overflow-hidden">
            <h2 className="text-2xl font-black text-green-800 mb-6 flex items-center justify-center gap-3">
                <span className="text-3xl">💮</span>
                <span>{titleDate} のスタンプ帳なのだ</span>
                <span className="text-3xl">💮</span>
            </h2>

            <div className="grid grid-cols-7 gap-2 sm:gap-4">
                {/* 曜日ヘッダー */}
                {weekdays.map(w => (
                    <div key={w} className="text-center font-bold text-sm text-lime-700 py-1 bg-lime-50/50 rounded-lg">
                        {w}
                    </div>
                ))}

                {/* 前月の空セル */}
                {emptyCells.map((_, index) => (
                    <div key={`empty-${index}`} className="aspect-square bg-transparent border-2 border-transparent"></div>
                ))}

                {/* 日付セル */}
                {days.map(dayStr => {
                    const isEarned = stamps[dayStr];
                    const dayNum = parseInt(dayStr.split('-')[2]);
                    const isToday = dayStr === currentDate;

                    return (
                        <div 
                            key={dayStr} 
                            className={`aspect-square flex flex-col items-center justify-center rounded-xl border-2 transition-all duration-300 relative hover:border-lime-300 hover:shadow-sm ${
                                isEarned ? 'bg-gradient-to-br from-lime-200 to-emerald-200 border-lime-300' : 'bg-lime-50/50 border-lime-100'
                            } ${
                                isToday ? 'border-lime-400 ring-2 ring-lime-200 font-black' : ''
                            }`}
                        >
                            <span className="absolute top-1 left-1.5 text-[10px] font-bold text-lime-600">{dayNum}</span>

                            {isEarned ? (
                                <span className="text-3xl sm:text-4xl animate-bounce-in animate-jelly drop-shadow-md select-none opacity-100 filter-none">🫛</span>
                            ) : (
                                <span className="text-2xl sm:text-3xl opacity-20 filter grayscale select-none">🫛</span>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="mt-6 text-center text-xs font-bold text-lime-700 bg-gradient-to-r from-lime-100 via-emerald-100 to-lime-100 py-2 rounded-full">
                <p>1日3回の集中でスタンプGETなのだ！✨</p>
            </div>
        </section>
    );
};
