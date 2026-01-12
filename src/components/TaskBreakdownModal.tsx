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
                "技術選定を行い、使用するライブラリとバージョンを確定する",
                "プロジェクトのディレクトリ構成と設定ファイル(package.json等)を作成する",
                "主要なコンポーネントのインターフェース(型定義)を設計する",
                "Gitブランチを作成し、初期コミットを行う",
                "コアとなるビジネスロジック関数を実装し単体テストを通す",
                "UIコンポーネントを実装し、Storybook等で表示確認する",
                "APIとの通信処理を実装し、モックデータで動作確認する",
                "メインロジックとUIを結合し、実際のデータフローを確認する",
                "リンターとフォーマッターを実行し、コード規約に適合させる",
                "Pull Requestを作成し、セルフレビュー完了後にマージする"
            ];
        }
        // Report / Writing
        else if (t.includes('report') || t.includes('write') || t.includes('paper') || t.includes('レポート') || t.includes('執筆') || t.includes('note')) {
            steps = [
                "記事の主要なテーマと結論（アウトライン）を確定させる",
                "音声入力ツールを使って、各見出しごとの内容を網羅的にテキスト化する",
                "AIツールを用いてテキストの誤字脱字を修正し、文体を整える",
                "記事の内容に合わせた画像生成用のプロンプトを作成する",
                "画像生成AI(Midjourney/DALL-E等)でヘッダーおよび挿入画像を生成する",
                "エディタ(VSCode/Note等)に本文と生成した画像を配置する",
                "SEOキーワードとハッシュタグを選定し、メタデータを設定する",
                "プレビュー機能でスマホ・PCそれぞれの表示崩れがないか確認する",
                "誤字脱字チェックツールで最終的な校正を行う",
                "公開ボタンを押し、SNSで記事のURLをシェアする"
            ];
        }
        // Cleaning / Tidy up
        else if (t.includes('clean') || t.includes('tidy') || t.includes('掃除') || t.includes('片付け')) {
            steps = [
                "「捨てるもの」と「残すもの」の基準を明確にする",
                "床一面の写真を撮り、片付け前の現状を記録する",
                "45Lゴミ袋を手に持ち、明らかなゴミ（ペットボトル・紙屑）を全回収する",
                "床にある衣類を「洗濯するもの」と「クローゼットに戻すもの」に分別する",
                "机の上の書類を「スキャンして保存」「即処分」「保留」の3つに仕分ける",
                "クイックルワイパー等で、ホコリを高い場所から低い場所へ落とす",
                "掃除機を使って、部屋の隅から中心に向かってゴミを吸い取る",
                "水拭きモップまたは雑巾で、床のベタつき汚れを拭き取る",
                "片付け後の写真を撮り、Before画像と比較して成果を確認する",
                "ゴミ袋の口を縛り、所定のゴミ収集場所に搬出する"
            ];
        }
        // Email / Contact
        else if (t.includes('mail') || t.includes('contact') || t.includes('メール') || t.includes('連絡')) {
            steps = [
                "連絡の目的と、相手に期待するアクション（返信/承認/共有）を明確にする",
                "過去のメール履歴やCRMツールを参照し、宛先とCC/BCCをリストアップする",
                "AIツールに要点を箇条書きで入力し、ビジネスメールのドラフトを作成させる",
                "件名を「【要確認】件名 (件名詳細)」の形式で具体的かつ短潔に編集する",
                "本文の冒頭に、結論（最も伝えたいこと）を配置する",
                "必要資料（PDF/画像）を添付し、ファイルが開けるか確認する",
                "誤字脱字ツールで敬語や固有名詞の誤りをチェックする",
                "自分宛にテスト送信を行い、スマホでの表示崩れを確認する",
                "送信日時指定（予約送信）を設定するか、即時送信ボタンを押す",
                "送信済みトレイを確認し、正しく送信されたかステータスをチェックする"
            ];
        }
        // Shopping
        else if (t.includes('shop') || t.includes('buy') || t.includes('買い物') || t.includes('スーパー')) {
            steps = [
                "冷蔵庫とパントリーの在庫を写真に撮り、スマホで確認できるようにする",
                "レシピアプリまたはAI献立提案を参照し、必要な食材リストを生成する",
                "買い物リストアプリ(ToDoリスト)に、購入品を売り場順に並べ替えて入力する",
                "エコバッグと決済手段（スマホ/財布）を準備する",
                "店舗に到着後、入口のカートを確保し、リストの「野菜コーナー」から回る",
                "リストにある商品をカゴに入れ、アプリ上でチェックを入れて消し込む",
                "消費期限や鮮度を目視で確認し、痛んでいるものを避ける",
                "レジでアプリのクーポンやポイントカードを提示し、キャッシュレス決済を行う",
                "サッカー台で、重いものが下、潰れやすいものが上になるよう袋詰めする",
                "帰宅後、冷蔵・冷凍品を直ちに冷蔵庫へ格納する"
            ];
        }
        // Generic Fallback
        else {
            steps = [
                "タスクの最終成果物（ゴール）を具体的に1行で定義する",
                "タスク完了に必要なツールや資料をすべてデスク上に展開する",
                "タイマーを「25分」にセットし、ポモドーロ・テクニックを開始する",
                "最初の5分で、着手可能な最小単位のアクションを実行する",
                "不明点があれば、関連ドキュメントやAI検索を使って即座に解消する",
                "作業の進捗を30%時点で一度セルフレビューし、方向修正を行う",
                "作業の進捗が70%を超えたら、細かい修正よりも全体の完成度を優先する",
                "成果物の品質チェックリスト（誤字・動作・要件）に基づき確認する",
                "タスク完了の証跡（ファイル保存・コミット・送信）を残す",
                "次のアクション（ネクストアクション）をメモに残して終了する"
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
