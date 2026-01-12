import React, { useState, useEffect } from 'react';
import type { Subtask } from '../types';

interface TaskBreakdownModalProps {
    isOpen: boolean;
    onClose: () => void;
    taskTitle: string;
    onConfirm: (subtasks: Subtask[]) => void;
}

export const TaskBreakdownModal: React.FC<TaskBreakdownModalProps> = ({ isOpen, onClose, taskTitle, onConfirm }) => {
    const [subtasks, setSubtasks] = useState<Subtask[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [newItemTitle, setNewItemTitle] = useState('');

    // Mock "AI" Logic
    useEffect(() => {
        if (isOpen && taskTitle) {
            setIsLoading(true);
            setSubtasks([]); // Clear previous

            // Simulate API delay
            const timer = setTimeout(() => {
                const mockSteps = generateMockSteps(taskTitle);
                setSubtasks(mockSteps);
                setIsLoading(false);
            }, 1500);

            return () => clearTimeout(timer);
        }
    }, [isOpen, taskTitle]);

    const generateMockSteps = (title: string): Subtask[] => {
        const t = title.toLowerCase();
        let steps: string[] = [];

        if (t.includes('report') || t.includes('レポート') || t.includes('書く')) {
            steps = ["資料を集める", "構成を考える (Outlining)", "下書きを書く", "推敲・見直し", "提出する"];
        } else if (t.includes('clean') || t.includes('掃除') || t.includes('片付け')) {
            steps = ["ゴミを袋にまとめる", "床にあるものを拾う", "掃除機をかける", "机を拭く", "換気をする"];
        } else if (t.includes('mail') || t.includes('メール') || t.includes('連絡')) {
            steps = ["宛先を確認する", "要件を箇条書きにする", "本文を書く", "誤字脱字チェック", "送信ボタンを押す"];
        } else if (t.includes('study') || t.includes('勉強')) {
            steps = ["教材を用意する", "目標ページを決める", "タイマーをセットする", "集中して解く", "答え合わせをする"];
        } else {
            // Generic fallback
            steps = ["まずは深呼吸する", "なにから始めるか書き出す", "最初の5分だけやってみる", "途中休憩を入れる"];
        }

        return steps.map(step => ({
            id: crypto.randomUUID(),
            title: step,
            isCompleted: false
        }));
    };

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newItemTitle.trim()) return;
        setSubtasks(prev => [...prev, {
            id: crypto.randomUUID(),
            title: newItemTitle,
            isCompleted: false
        }]);
        setNewItemTitle('');
    };

    const handleDelete = (id: string) => {
        setSubtasks(prev => prev.filter(s => s.id !== id));
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-lime-900/60 backdrop-blur-sm animate-fade-in p-4">
            <div className="bg-white rounded-[2rem] w-full max-w-lg shadow-2xl border-4 border-lime-300 flex flex-col max-h-[85vh]">

                {/* Header */}
                <div className="bg-lime-100 p-6 border-b-2 border-lime-200 rounded-t-[1.8rem]">
                    <h3 className="text-xl font-black text-lime-800 flex items-center gap-2">
                        <span className="text-2xl animate-spin-slow">🪄</span>
                        <span>AI自動分解なのだ！</span>
                    </h3>
                    <p className="text-lime-600 text-sm font-bold mt-1 truncate">
                        「{taskTitle}」を小さく分けたのだ
                    </p>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto flex-1 bg-lime-50/30">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-12 gap-4">
                            <div className="text-4xl animate-bounce">🤔</div>
                            <p className="font-bold text-lime-600 animate-pulse">考え中なのだ...</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {subtasks.map((step, index) => (
                                <div key={step.id} className="flex items-center gap-3 bg-white p-3 rounded-xl border-2 border-lime-100 shadow-sm animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                                    <div className="bg-lime-200 text-lime-700 font-black w-6 h-6 rounded-full flex items-center justify-center text-xs flex-shrink-0">
                                        {index + 1}
                                    </div>
                                    <input
                                        type="text"
                                        value={step.title}
                                        onChange={(e) => {
                                            const newTitle = e.target.value;
                                            setSubtasks(prev => prev.map(s => s.id === step.id ? { ...s, title: newTitle } : s));
                                        }}
                                        className="flex-1 bg-transparent font-bold text-green-800 outline-none border-b border-transparent focus:border-lime-300 transition-colors"
                                    />
                                    <button
                                        onClick={() => handleDelete(step.id)}
                                        className="text-gray-300 hover:text-red-400 p-1 transition-colors"
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}

                            {/* Add New Input */}
                            <form onSubmit={handleAdd} className="mt-4 flex gap-2">
                                <input
                                    type="text"
                                    placeholder="手順を追加する..."
                                    value={newItemTitle}
                                    onChange={(e) => setNewItemTitle(e.target.value)}
                                    className="flex-1 bg-white border-2 border-dashed border-lime-200 rounded-xl px-4 py-3 font-bold text-sm text-green-800 outline-none focus:border-lime-400 focus:ring-2 focus:ring-lime-100 transition-all placeholder-lime-300"
                                />
                                <button type="submit" className="bg-lime-200 hover:bg-lime-300 text-lime-700 font-black px-4 rounded-xl transition-colors">
                                    ＋
                                </button>
                            </form>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t-2 border-lime-100 flex gap-4 bg-white rounded-b-[1.8rem]">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 font-bold text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        やめる
                    </button>
                    <button
                        onClick={() => onConfirm(subtasks)}
                        disabled={isLoading || subtasks.length === 0}
                        className={`flex-1 py-3 font-black text-white rounded-full shadow-md transition-all 
                            ${(isLoading || subtasks.length === 0)
                                ? 'bg-gray-300 cursor-not-allowed'
                                : 'bg-lime-500 hover:bg-lime-600 active:translate-y-1 shadow-[0_4px_0_rgb(65,130,20)]'
                            }`}
                    >
                        これで開始！
                    </button>
                </div>
            </div>
        </div>
    );
};
