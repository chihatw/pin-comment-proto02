import { useEffect, useState } from 'react';
import { getEllipses } from '../repositories/ellipseRepository';
import type { Ellipse } from '../types/ellipse';

/**
 * 指定した imageMetaId の楕円リストを取得するカスタムフック
 * @param imageMetaId
 */
export function useEllipses(imageMetaId: string) {
  const [ellipses, setEllipses] = useState<Ellipse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    getEllipses(imageMetaId).then((data) => {
      if (!ignore) {
        setEllipses(data);
        setLoading(false);
      }
    });
    return () => {
      ignore = true;
    };
  }, [imageMetaId]);

  return { ellipses, loading };
}
