// components/EllipseTable.tsx
'use client';

import type { Ellipse } from '../types/ellipse';
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
}

/**
 * 楕円リストをテーブル表示するコンポーネント
 */
export function EllipseTable({ ellipses, loading, error }: EllipseTableProps) {
  if (loading) return <div>楕円データ取得中...</div>;
  if (error)
    return <div className='text-red-500'>楕円データ取得エラー: {error}</div>;
  if (!ellipses || ellipses.length === 0)
    return <div className='text-gray-400'>楕円データなし</div>;

  return (
    <div className='overflow-x-auto mt-4'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>index</TableHead>
            <TableHead>comment</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ellipses.map((e) => (
            <TableRow key={e.id}>
              <TableCell>{e.index}</TableCell>
              <TableCell>{e.comment}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
