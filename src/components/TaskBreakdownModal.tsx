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

        // Coding / Development
        if (t.includes('code') || t.includes('program') || t.includes('app') || t.includes('開発') || t.includes('実装')) {
            steps = [
                "仕様書やデザインを確認する", "Gitで最新のmainをpullする", "新しいブランチを切る",
                "必要なディレクトリを作成する", "空のファイルを作成する", "定数や型定義を書く",
                "メインのロジックを書く", "UIコンポーネントを実装する", "動作確認（ローカル実行）する", "コミットしてプッシュする"
            ];
        }
        // Report / Writing
        else if (t.includes('report') || t.includes('write') || t.includes('paper') || t.includes('レポート') || t.includes('執筆')) {
            steps = [
                "資料や参考文献を集める", "資料を机に広げる", "全体の構成案（見出し）を作る",
                "各章のポイントを箇条書きにする", "エディタを開く", "導入部分（はじめに）を書く",
                "本文のセクション1を書く", "本文のセクション2を書く", "結論（まとめ）を書く", "誤字脱字チェック・推敲する"
            ];
        }
        // Cleaning / Tidy up
        else if (t.includes('clean') || t.includes('tidy') || t.includes('掃除') || t.includes('片付け')) {
            steps = [
                "ゴミ袋を用意する", "床にある大きなゴミを拾う", "床にある服を拾う", "不要な郵便物や紙を捨てる",
                "机の上にある食器を下げる", "机の上を拭く", "棚のホコリを払う", "掃除機をコンセントに繋ぐ",
                "部屋全体に掃除機をかける", "ゴミ袋の口を縛って捨てる"
            ];
        }
        // Email / Contact
        else if (t.includes('mail') || t.includes('contact') || t.includes('メール') || t.includes('連絡')) {
            steps = [
                "宛先のアドレスを確認する", "CC/BCCが必要か確認する", "件名を入力する",
                "相手の会社名・氏名を書く", "挨拶文（お世話になっております等）を書く", "要件を箇条書きにする",
                "詳細な本文を書く", "結びの言葉を書く", "誤字脱字がないか読み返す", "送信ボタンを押す"
            ];
        }
        // Shopping
        else if (t.includes('shop') || t.includes('buy') || t.includes('買い物') || t.includes('スーパー')) {
            steps = [
                "冷蔵庫の中身を確認する", "調味料の残量を確認する", "日用品のストックを確認する", "買うものリストを紙に書く",
                "財布とスマホを持つ", "エコバッグを持つ", "靴を履いて玄関を出る", "お店まで移動する",
                "カゴを持って売り場を回る", "レジで精算する"
            ];
        }
        // Laundry
        else if (t.includes('laundry') || t.includes('wash') || t.includes('洗濯')) {
            steps = [
                "洗濯機の中を確認する", "色物と白物を分ける", "洗濯物をネットに入れる", "洗濯機に洗濯物を入れる",
                "洗剤・柔軟剤を投入口に入れる", "スタートボタンを押す", "ハンガーやピンチを用意する",
                "洗濯が終わるのを待つ", "洗濯物をカゴに取り出す", "一枚ずつシワを伸ばして干す"
            ];
        }
        // Cooking
        else if (t.includes('cook') || t.includes('meal') || t.includes('料理') || t.includes('ご飯')) {
            steps = [
                "手を洗う", "献立（メニュー）を決める", "冷蔵庫から食材を出す", "調理器具（包丁・まな板）を出す",
                "野菜を洗う", "食材を切る", "お湯を沸かす・鍋を温める", "食材を加熱調理する",
                "味見をして調味料を足す", "お皿に盛り付ける"
            ];
        }
        // Study
        else if (t.includes('study') || t.includes('learn') || t.includes('勉強')) {
            steps = [
                "机の上を片付けてスペースを作る", "教科書・参考書を出す", "ノートと筆記用具を出す", "今日の目標ページを決める",
                "重要な部分を音読する", "重要語句をノートに書く", "問題を3問解く", "答え合わせをする",
                "解説を読んで理解する", "次のスケジュールを確認する"
            ];
        }
        // Generic Fallback (More physical)
        else {
            steps = [
                "必要な道具を全て机に出す", "スマホをマナーモードにする", "やることを小さな付箋に書く", "最初の1つ目の付箋を貼る",
                "1ステップ目に着手する", "5分間作業を続ける", "1つ目が終わったらチェックする", "2つ目のステップに着手する",
                "10分間作業を続ける", "キリの良いところまで進める"
            ];
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
