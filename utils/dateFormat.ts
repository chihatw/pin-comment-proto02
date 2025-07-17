/**
 * 日付フォーマット用のユーティリティ関数
 */

/**
 * ISO 8601 形式の日付文字列を日本語の読みやすい形式に変換
 * @param isoDateString ISO 8601 形式の日付文字列
 * @returns 日本語の読みやすい形式の日付文字列 (例: 2025年7月17日 14:30:45)
 */
export function formatDateToJapanese(isoDateString: string | null): string {
  if (!isoDateString) return '日付不明';

  try {
    const date = new Date(isoDateString);

    // 無効な日付の場合
    if (isNaN(date.getTime())) {
      return '日付不明';
    }

    // 日本のタイムゾーンで表示
    const formatter = new Intl.DateTimeFormat('ja-JP', {
      timeZone: 'Asia/Tokyo',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    return formatter.format(date);
  } catch (error) {
    console.error('日付フォーマットエラー:', error);
    return '日付不明';
  }
}

/**
 * ISO 8601 形式の日付文字列を短い形式に変換
 * @param isoDateString ISO 8601 形式の日付文字列
 * @returns 短い形式の日付文字列 (例: 2025/07/17 14:30:45)
 */
export function formatDateToShort(isoDateString: string | null): string {
  if (!isoDateString) return '日付不明';

  try {
    const date = new Date(isoDateString);

    // 無効な日付の場合
    if (isNaN(date.getTime())) {
      return '日付不明';
    }

    // 日本のタイムゾーンで表示
    const formatter = new Intl.DateTimeFormat('ja-JP', {
      timeZone: 'Asia/Tokyo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    return formatter.format(date);
  } catch (error) {
    console.error('日付フォーマットエラー:', error);
    return '日付不明';
  }
}
