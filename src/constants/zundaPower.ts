/** ずんだパワー（スタミナ）の最大値 */
export const MAX_ZUNDA_POWER = 2;

/** 夏バテモードの強制休憩時間（分） */
export const SUMMER_FATIGUE_MINUTES = 15;

/** 夏バテモードの強制休憩時間（ミリ秒） */
// ❌ 元のコード：SUMMER_FATIGUE_MINUTES * 60 * 1000;
// 🟢 修正コード：一時的に直接「3000（3秒）」に書き換えるのだ！
export const SUMMER_FATIGUE_DURATION_MS = 3000;