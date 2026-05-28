import React, { useState } from 'react';

// ============================================================
// 型定義
// ============================================================
export interface RewardItem {
  id: string;
  label: string;
  cost: number;
}

export interface VoiceItem {
  id: string;
  label: string;
  description: string;
  cost: number;
  audioPath: string;
}

interface ZundaShopProps {
  coins: number;
  unlockedVoices: string[];
  selectedVoice: string;
  onSpendCoins: (amount: number) => boolean; // returns false if not enough coins
  onUnlockVoice: (voiceId: string) => void;
  onSelectVoice: (voiceId: string) => void;
}

// ============================================================
// 定数
// ============================================================
export const DEFAULT_REWARDS: RewardItem[] = [
  { id: 'chips', label: 'ポテチを食べて良い券 🥔', cost: 300 },
  { id: 'youtube', label: 'YouTubeを20分見て良い券 📺', cost: 500 },
];

export const VOICE_SHOP_ITEMS: VoiceItem[] = [
  {
    id: 'default',
    label: 'デフォルトボイス',
    description: 'ずんだもんの通常ボイスなのだ',
    cost: 0,
    audioPath: '/sounds/timeout.mp3',
  },
  {
    id: 'voice_b',
    label: 'ボイスB「もっとがんばるのだ！」',
    description: '激熱応援バージョンなのだ🔥',
    cost: 500,
    audioPath: '/audio/voice_b.wav',
  },
  {
    id: 'voice_c',
    label: 'ボイスC「だらけちゃダメなのだ！」',
    description: 'ツンデレ怒りバージョンなのだ😤',
    cost: 1000,
    audioPath: '/audio/voice_c.wav',
  },
];

// ============================================================
// サブコンポーネント: ご褒美引き換えダイアログ
// ============================================================
interface RewardDialogProps {
  reward: RewardItem | null;
  onClose: () => void;
}

const RewardDialog: React.FC<RewardDialogProps> = ({ reward, onClose }) => {
  if (!reward) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-[2rem] p-8 max-w-sm w-full shadow-2xl border-4 border-lime-300 text-center animate-bounce-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-6xl mb-4 animate-bounce">🫛</div>
        <h3 className="text-2xl font-black text-green-800 mb-3">
          引き換えたのだ！
        </h3>
        <div className="bg-lime-100 rounded-2xl p-4 mb-5 border-2 border-lime-200">
          <p className="font-black text-lime-700 text-lg">{reward.label}</p>
        </div>
        <p className="text-green-700 font-bold leading-relaxed mb-6">
          罪悪感なく楽しむのだ！🫛✨<br />
          <span className="text-sm text-lime-600">これはご褒美なのだ。えらいのだ！</span>
        </p>
        <button
          onClick={onClose}
          className="px-8 py-4 bg-lime-500 hover:bg-lime-600 text-white font-black rounded-full text-lg btn-puni transition-all"
        >
          ありがとうなのだ！
        </button>
      </div>
    </div>
  );
};

// ============================================================
// サブコンポーネント: カスタムご褒美追加フォーム
// ============================================================
interface AddRewardFormProps {
  onAdd: (label: string, cost: number) => void;
}

const AddRewardForm: React.FC<AddRewardFormProps> = ({ onAdd }) => {
  const [label, setLabel] = useState('');
  const [cost, setCost] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const costNum = parseInt(cost, 10);
    if (label.trim() && costNum > 0) {
      onAdd(label.trim(), costNum);
      setLabel('');
      setCost('');
      setIsOpen(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-full py-3 border-2 border-dashed border-lime-300 rounded-2xl text-lime-500 font-bold hover:border-lime-400 hover:text-lime-600 hover:bg-lime-50 transition-all text-sm"
      >
        ＋ ご褒美を追加するのだ
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-lime-50 rounded-2xl p-4 border-2 border-lime-200 animate-fade-in">
      <p className="text-xs font-bold text-lime-600 mb-3 uppercase tracking-wide">新しいご褒美を追加するのだ</p>
      <div className="flex flex-col gap-2">
        <input
          type="text"
          placeholder="ご褒美の内容（例: アイスを食べる）"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          className="w-full p-3 bg-white border-2 border-lime-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-lime-300 text-green-800 placeholder-lime-300"
          required
        />
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="コスト（コイン）"
            value={cost}
            onChange={(e) => setCost(e.target.value)}
            min="1"
            className="flex-1 p-3 bg-white border-2 border-lime-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-lime-300 text-green-800 placeholder-lime-300"
            required
          />
          <button
            type="submit"
            className="px-5 py-3 bg-lime-500 text-white rounded-xl font-bold text-sm hover:bg-lime-600 btn-puni"
          >
            追加
          </button>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="px-4 py-3 bg-gray-200 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-300"
          >
            ✕
          </button>
        </div>
      </div>
    </form>
  );
};

// ============================================================
// メインコンポーネント: ZundaShop
// ============================================================
const ZundaShop: React.FC<ZundaShopProps> = ({
  coins,
  unlockedVoices,
  selectedVoice,
  onSpendCoins,
  onUnlockVoice,
  onSelectVoice,
}) => {
  const [activeTab, setActiveTab] = useState<'reward' | 'voice'>('reward');
  const [rewardDialog, setRewardDialog] = useState<RewardItem | null>(null);
  const [customRewards, setCustomRewards] = useState<RewardItem[]>([]);
  const [failFlash, setFailFlash] = useState<string | null>(null); // for "not enough coins" flash

  const allRewards = [...DEFAULT_REWARDS, ...customRewards];

  const handleRedeem = (item: RewardItem) => {
    const success = onSpendCoins(item.cost);
    if (success) {
      setRewardDialog(item);
    } else {
      setFailFlash(item.id);
      setTimeout(() => setFailFlash(null), 800);
    }
  };

  const handleUnlockVoice = (voice: VoiceItem) => {
    if (unlockedVoices.includes(voice.id)) {
      // Already unlocked → just select
      onSelectVoice(voice.id);
      return;
    }
    const success = onSpendCoins(voice.cost);
    if (success) {
      onUnlockVoice(voice.id);
      onSelectVoice(voice.id);
    } else {
      setFailFlash(voice.id);
      setTimeout(() => setFailFlash(null), 800);
    }
  };

  const addCustomReward = (label: string, cost: number) => {
    const newReward: RewardItem = {
      id: `custom_${Date.now()}`,
      label,
      cost,
    };
    setCustomRewards((prev) => [...prev, newReward]);
  };

  const removeCustomReward = (id: string) => {
    setCustomRewards((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <>
      <RewardDialog reward={rewardDialog} onClose={() => setRewardDialog(null)} />

      <section className="bg-white rounded-[2rem] shadow-lg border-4 border-yellow-200 overflow-hidden">
        {/* ---- ずんだ銀行ヘッダー ---- */}
        <div
          className="p-6 text-center relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #fef08a 0%, #fde047 50%, #eab308 100%)',
          }}
        >
          {/* 背景の装飾コイン */}
          <div className="absolute top-2 left-4 text-2xl opacity-20 animate-spin-slow">🪙</div>
          <div className="absolute top-4 right-6 text-3xl opacity-15 animate-spin-slow" style={{ animationDirection: 'reverse' }}>🪙</div>
          <div className="absolute bottom-2 left-1/4 text-xl opacity-10 animate-spin-slow">🪙</div>

          <div className="relative z-10">
            <p className="text-yellow-800 font-black text-sm uppercase tracking-widest mb-1">🏦 ずんだ銀行</p>
            <div className="flex items-center justify-center gap-3 mb-1">
              <span className="text-5xl animate-bounce-slow">🪙</span>
              <div>
                <span className="text-6xl font-black text-yellow-900 tabular-nums leading-none">
                  {coins.toLocaleString()}
                </span>
                <p className="text-yellow-700 font-bold text-sm">コイン所持中</p>
              </div>
            </div>
            <p className="text-yellow-800 text-xs font-bold opacity-75">
              集中タイマー1回 = 100コインなのだ！
            </p>
          </div>
        </div>

        {/* ---- タブ切り替え ---- */}
        <div className="flex border-b-2 border-yellow-100">
          <button
            onClick={() => setActiveTab('reward')}
            className={`flex-1 py-4 font-black text-sm transition-all ${
              activeTab === 'reward'
                ? 'bg-amber-50 text-amber-700 border-b-4 border-amber-400'
                : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'
            }`}
          >
            🎁 リアルご褒美
          </button>
          <button
            onClick={() => setActiveTab('voice')}
            className={`flex-1 py-4 font-black text-sm transition-all ${
              activeTab === 'voice'
                ? 'bg-purple-50 text-purple-700 border-b-4 border-purple-400'
                : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'
            }`}
          >
            🎙️ ボイスショップ
          </button>
        </div>

        {/* ---- リアルご褒美タブ ---- */}
        {activeTab === 'reward' && (
          <div className="p-6 space-y-3 animate-fade-in">
            <p className="text-xs text-amber-600 font-bold uppercase tracking-wider mb-4">
              🎖️ コインを使ってご褒美と引き換えるのだ！
            </p>
            {allRewards.map((item) => {
              const canAfford = coins >= item.cost;
              const isFlashing = failFlash === item.id;
              const isCustom = customRewards.some((r) => r.id === item.id);
              return (
                <div
                  key={item.id}
                  className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all duration-200 ${
                    isFlashing
                      ? 'border-red-400 bg-red-50 animate-shake'
                      : canAfford
                      ? 'border-amber-200 bg-amber-50 hover:border-amber-300 hover:shadow-md'
                      : 'border-gray-100 bg-gray-50 opacity-60'
                  }`}
                >
                  <div className="flex-1 mr-3">
                    <p className={`font-black text-sm ${canAfford ? 'text-amber-800' : 'text-gray-500'}`}>
                      {item.label}
                    </p>
                    <p className="text-xs font-bold text-amber-500 flex items-center gap-1 mt-0.5">
                      🪙 {item.cost.toLocaleString()} コイン
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {isCustom && (
                      <button
                        onClick={() => removeCustomReward(item.id)}
                        className="text-gray-400 hover:text-red-400 text-xs p-1 rounded transition-colors"
                        title="削除"
                      >
                        🗑️
                      </button>
                    )}
                    <button
                      onClick={() => handleRedeem(item)}
                      disabled={!canAfford}
                      className={`px-4 py-2 rounded-xl font-black text-sm transition-all btn-puni ${
                        canAfford
                          ? 'bg-amber-400 hover:bg-amber-500 text-white shadow-[0_3px_0_#b45309]'
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                      }`}
                    >
                      {canAfford ? '引き換え！' : 'コイン不足'}
                    </button>
                  </div>
                </div>
              );
            })}

            <AddRewardForm onAdd={addCustomReward} />
          </div>
        )}

        {/* ---- ボイスショップタブ ---- */}
        {activeTab === 'voice' && (
          <div className="p-6 space-y-3 animate-fade-in">
            <p className="text-xs text-purple-600 font-bold uppercase tracking-wider mb-4">
              🎙️ タイマー終了時のボイスをアンロックするのだ！
            </p>
            {VOICE_SHOP_ITEMS.map((voice) => {
              const isUnlocked = unlockedVoices.includes(voice.id);
              const isSelected = selectedVoice === voice.id;
              const canAfford = coins >= voice.cost;
              const isFlashing = failFlash === voice.id;

              return (
                <div
                  key={voice.id}
                  className={`p-4 rounded-2xl border-2 transition-all duration-200 ${
                    isFlashing
                      ? 'border-red-400 bg-red-50 animate-shake'
                      : isSelected
                      ? 'border-purple-400 bg-purple-50 shadow-md'
                      : isUnlocked
                      ? 'border-green-200 bg-green-50 hover:border-green-300'
                      : canAfford
                      ? 'border-purple-200 bg-purple-50/50 hover:border-purple-300 hover:shadow-md'
                      : 'border-gray-100 bg-gray-50 opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {isSelected && (
                          <span className="text-xs bg-purple-500 text-white px-2 py-0.5 rounded-full font-bold animate-pulse">
                            ▶ 使用中
                          </span>
                        )}
                        {isUnlocked && !isSelected && (
                          <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full font-bold">
                            ✓ 解禁済み
                          </span>
                        )}
                        {!isUnlocked && (
                          <span className="text-xs bg-gray-300 text-gray-600 px-2 py-0.5 rounded-full font-bold">
                            🔒 ロック中
                          </span>
                        )}
                      </div>
                      <p className={`font-black text-sm ${isUnlocked ? 'text-green-800' : canAfford ? 'text-purple-800' : 'text-gray-500'}`}>
                        {voice.label}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">{voice.description}</p>
                      {voice.cost > 0 && (
                        <p className="text-xs font-bold text-purple-500 flex items-center gap-1 mt-1">
                          🪙 {voice.cost.toLocaleString()} コイン
                        </p>
                      )}
                    </div>
                    <div>
                      {isUnlocked ? (
                        <button
                          onClick={() => onSelectVoice(voice.id)}
                          className={`px-4 py-2 rounded-xl font-black text-sm transition-all btn-puni ${
                            isSelected
                              ? 'bg-purple-500 text-white shadow-[0_3px_0_#7c3aed] cursor-default'
                              : 'bg-green-400 hover:bg-green-500 text-white shadow-[0_3px_0_#15803d]'
                          }`}
                        >
                          {isSelected ? '選択中✓' : '選択する'}
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUnlockVoice(voice)}
                          disabled={!canAfford}
                          className={`px-4 py-2 rounded-xl font-black text-sm transition-all btn-puni ${
                            canAfford
                              ? 'bg-purple-500 hover:bg-purple-600 text-white shadow-[0_3px_0_#7c3aed]'
                              : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                          }`}
                        >
                          {canAfford ? 'アンロック！' : 'コイン不足'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            <div className="mt-4 p-4 bg-purple-50 rounded-2xl border-2 border-purple-100">
              <p className="text-xs text-purple-600 font-bold text-center">
                💡 解禁したボイスはタイマー終了時にランダムで再生されるのだ！
              </p>
            </div>
          </div>
        )}
      </section>
    </>
  );
};

export default ZundaShop;
