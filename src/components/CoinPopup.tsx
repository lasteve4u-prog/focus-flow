import React, { useEffect, useState } from 'react';

interface CoinPopupProps {
  visible: boolean;
  amount: number;
  onComplete: () => void;
}

/**
 * コイン獲得時の派手なポップアップアニメーション
 */
const CoinPopup: React.FC<CoinPopupProps> = ({ visible, amount, onComplete }) => {
  const [phase, setPhase] = useState<'hidden' | 'enter' | 'hold' | 'exit'>('hidden');

  useEffect(() => {
    if (!visible) {
      setPhase('hidden');
      return;
    }

    // アニメーションシーケンス
    setPhase('enter');

    const holdTimer = setTimeout(() => {
      setPhase('hold');
    }, 300);

    const exitTimer = setTimeout(() => {
      setPhase('exit');
    }, 2200);

    const completeTimer = setTimeout(() => {
      setPhase('hidden');
      onComplete();
    }, 2800);

    return () => {
      clearTimeout(holdTimer);
      clearTimeout(exitTimer);
      clearTimeout(completeTimer);
    };
  }, [visible, onComplete]);

  if (phase === 'hidden') return null;

  return (
    <div
      className="fixed inset-0 pointer-events-none z-[100] flex items-center justify-center"
    >
      {/* オーバーレイフラッシュ */}
      {phase === 'enter' && (
        <div className="absolute inset-0 bg-yellow-300/20 animate-flash-once" />
      )}

      {/* メインポップアップ */}
      <div
        className={`relative flex flex-col items-center gap-2 transition-all duration-300 ${
          phase === 'enter' ? 'scale-50 opacity-0'
          : phase === 'hold' ? 'scale-100 opacity-100'
          : 'scale-110 opacity-0'
        }`}
      >
        {/* 背景グロー */}
        <div className="absolute inset-0 bg-yellow-400/30 blur-3xl rounded-full scale-150" />

        <div className="relative z-10 bg-yellow-400 rounded-[2rem] px-10 py-6 shadow-2xl border-4 border-yellow-300 text-center"
          style={{
            background: 'linear-gradient(135deg, #fef08a 0%, #fde047 40%, #f59e0b 100%)',
            boxShadow: '0 0 40px rgba(251, 191, 36, 0.8), 0 8px 32px rgba(0,0,0,0.2)',
          }}
        >
          {/* コインアイコン群 */}
          <div className="flex justify-center gap-2 mb-2">
            {[...Array(5)].map((_, i) => (
              <span
                key={i}
                className="text-2xl animate-coin-fly"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                🪙
              </span>
            ))}
          </div>

          <p className="text-4xl font-black text-yellow-900 leading-tight">
            +{amount}
          </p>
          <p className="text-lg font-black text-yellow-800 mt-1">
            コインGETなのだ！🪙
          </p>
          <p className="text-sm font-bold text-yellow-700 mt-1 opacity-80">
            えらい！集中できたのだ✨
          </p>
        </div>

        {/* パーティクル */}
        {['✨', '⭐', '💛', '🌟', '✨'].map((emoji, i) => (
          <div
            key={i}
            className="absolute text-2xl animate-particle-burst pointer-events-none"
            style={{
              animationDelay: `${i * 60}ms`,
              transform: `rotate(${i * 72}deg) translateX(80px)`,
            }}
          >
            {emoji}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CoinPopup;
