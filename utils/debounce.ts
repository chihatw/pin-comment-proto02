/**
 * debounce: 指定時間内の連続呼び出しをまとめて、最後の1回だけ実行する
 * @param fn 実行関数
 * @param delay 遅延ミリ秒
 */
export function debounce<T extends (...args: any[]) => void>(
  fn: T,
  delay: number
) {
  let timer: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<T>) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fn(...args);
    }, delay);
  };
}
