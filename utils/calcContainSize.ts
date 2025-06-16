/**
 * 画面サイズと画像サイズから、アスペクト比を保って最大表示できる幅・高さを計算するユーティリティ関数
 * @param containerW 親要素の幅(px)
 * @param containerH 親要素の高さ(px)
 * @param imageW 画像の幅(px)
 * @param imageH 画像の高さ(px)
 * @returns 最大で収まる幅・高さ
 */
export function calcContainSize(
  containerW: number,
  containerH: number,
  imageW: number,
  imageH: number
): { width: number; height: number } {
  const containerRatio = containerW / containerH;
  const imageRatio = imageW / imageH;
  if (imageRatio > containerRatio) {
    // 横長画像: 横を最大に合わせる
    return { width: containerW, height: Math.round(containerW / imageRatio) };
  } else {
    // 縦長画像: 縦を最大に合わせる
    return { width: Math.round(containerH * imageRatio), height: containerH };
  }
}
