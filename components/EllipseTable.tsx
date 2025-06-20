// components/EllipseTable.tsx
'use client';

import type { Ellipse } from '../types/ellipse';
import { Checkbox } from './ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';

interface EllipseTableProps {
  ellipses: Ellipse[];
  loading?: boolean;
  error?: string | null;
  selectedEllipseIds: string[];
  setSelectedEllipseIds: (ids: string[]) => void;
}

/**
 * 楕円リストをテーブル表示するコンポーネント
 */
export function EllipseTable({
  ellipses,
  loading,
  error,
  selectedEllipseIds,
  setSelectedEllipseIds,
}: EllipseTableProps) {
  if (loading) return <div>楕円データ取得中...</div>;
  if (error)
    return <div className='text-red-500'>楕円データ取得エラー: {error}</div>;
  if (!ellipses || ellipses.length === 0)
    return <div className='text-gray-400'>楕円データなし</div>;

  // チェックボックスの切り替え
  const handleCheckboxChange = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedEllipseIds([...selectedEllipseIds, id]);
    } else {
      setSelectedEllipseIds(selectedEllipseIds.filter((eid) => eid !== id));
    }
  };

  return (
    <div className='overflow-x-auto mt-4'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead></TableHead> {/* チェックボックス用 */}
            <TableHead>index</TableHead>
            <TableHead>comment</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ellipses.map((e) => (
            <TableRow key={e.id}>
              <TableCell>
                <Checkbox
                  checked={selectedEllipseIds.includes(e.id)}
                  onCheckedChange={(checked) =>
                    handleCheckboxChange(e.id, Boolean(checked))
                  }
                  aria-label={`select ellipse ${e.index}`}
                />
              </TableCell>
              <TableCell>{e.index}</TableCell>
              <TableCell>{e.comment}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
