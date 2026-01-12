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
                "【設計】技術選定とディレクトリ構成・型定義を最初に行う",
                "【準備】Gitブランチを作成し、必要なライブラリをインストールする",
                "【実装】コアロジック（関数・クラス）を記述し、単体テストを通す",
                "【UI】画面コンポーネントを作成し、Storybookで表示を確認する",
                "【結合】ロジックとUIを繋ぎ込み、実際のデータフローで動作確認する",
                "【品質】リンター・フォーマッターをかけ、コード規約違反を修正する",
                "【保存】変更をコミットし、リモートリポジトリへプッシュする",
                "【共有】Pull Requestを作成し、セルフレビュー完了後にマージする"
            ];
        }
        // Report / Writing (Audio First)
        else if (t.includes('report') || t.includes('write') || t.includes('paper') || t.includes('レポート') || t.includes('執筆') || t.includes('note')) {
            steps = [
                "【収録】noteの元となる内容を音声入力ツールで一気に喋り、録音する",
                "【修正】AIツール等で録音データの誤字脱字を直し、文章の体裁を整える",
                "【素材】記事内容に合わせた画像生成プロンプトを作成し、画像を生成する",
                "【構成】エディタに本文と画像を流し込み、見出し等の構成を整える",
                "【設定】SEOキーワード・ハッシュタグ・メタデータ等を設定する",
                "【確認】プレビュー機能で表示崩れがないか確認し、最終校正を行う",
                "【公開】記事を公開し、SNSでURLをシェアして拡散する"
            ];
        }
        // Cleaning / Tidy up
        else if (t.includes('clean') || t.includes('tidy') || t.includes('掃除') || t.includes('片付け')) {
            steps = [
                "【分別】「捨てるもの」と「残すもの」の基準を決め、ゴミ袋を手に持つ",
                "【回収】床や机にある明らかなゴミ（ペットボトル・紙屑）を全回収する",
                "【移動】衣類や本など、本来あるべき場所に戻すべきものを移動する",
                "【除去】ホコリを高い場所から低い場所へ落とし、掃除機で吸い取る",
                "【拭き】水拭きモップや雑巾で、床やデスクの汚れを拭き取る",
                "【排出】ゴミ袋の口を縛り、所定の収集場所へ搬出・移動する"
            ];
        }
        // Email / Contact
        else if (t.includes('mail') || t.includes('contact') || t.includes('メール') || t.includes('連絡')) {
            steps = [
                "【要件】連絡の目的と、相手へのアクション依頼内容を明確にする",
                "【準備】宛先（To/CC）を確認し、必要な添付資料を手元に用意する",
                "【下書】AIツールに要点を入力し、ドラフト文面を作成させる",
                "【編集】件名を具体的で伝わりやすい形式（【要確認】等）に整える",
                "【確認】敬語・誤字脱字・添付忘れをツールと目視でダブルチェックする",
                "【送信】予約送信または即時送信を行い、送信済みトレイで完了を確認する"
            ];
        }
        // Shopping
        else if (t.includes('shop') || t.includes('buy') || t.includes('買い物') || t.includes('スーパー')) {
            steps = [
                "【在庫】冷蔵庫等の写真を撮り、ストック状況を可視化する",
                "【計画】必要なものをリストアップし、店内の回る順序に並べ替える",
                "【準備】エコバッグと決済手段（スマホ/財布）を持ち、店へ移動する",
                "【入店】カートを確保し、リストの上から順に効率よくピックアップする",
                "【精算】レジでクーポン等を提示し、決済を完了させる",
                "【帰宅】冷蔵・冷凍品を優先して収納し、完了とする"
            ];
        }
        // Generic Fallback
        else {
            steps = [
                "【定義】タスクの「完了状態（ゴール）」を具体的に定義する",
                "【準備】必要なツール・資料をすべて手元に揃え、環境を整える",
                "【着手】最初の5分で、最も心理的ハードルの低い作業から手を付ける",
                "【集中】タイマーをセットし、中断せずに作業を進める",
                "【確認】進捗が50%を超えた時点で一度品質や方向性を確認する",
                "【仕上】残りの作業を完了させ、最終的な見直しを行う",
                "【完了】成果物を保存・提出し、次のタスクへのメモを残す"
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
