import type { Ellipse } from '@/types/ellipse';

/**
 * コメントリストUIコンポーネント
 * @param props.comments コメント配列
 * @param props.ellipses 楕円配列
 * @param props.selectedId 選択中楕円ID
 * @param props.setSelectedId 楕円選択関数
 * @param props.updateComment コメント更新関数
 * @param props.handleDeleteEllipse 楕円削除関数
 * @param props.PRIMARY_COLOR 選択色
 */
export type CommentListProps = {
  ellipses: Ellipse[];
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  updateComment: (ellipseId: string, content: string) => void;
  handleDeleteEllipse: () => void;
  PRIMARY_COLOR: string;
};

export function CommentList({
  ellipses,
  selectedId,
  setSelectedId,
  updateComment,
  handleDeleteEllipse,
  PRIMARY_COLOR,
}: CommentListProps) {
  return (
    <ul className='space-y-1' onClick={(e) => e.stopPropagation()}>
      {ellipses.length === 0 ? (
        <li className='text-gray-400'>コメントはありません</li>
      ) : (
        ellipses.map((ellipse) => {
          const ellipseIndex = ellipse ? ellipse.index : '?';
          return (
            <li
              key={ellipse.id}
              className={`flex items-center px-2 py-1 rounded border-2`}
              style={{
                transition: 'background 0.2s',
                borderColor:
                  selectedId === ellipse.id ? PRIMARY_COLOR : 'transparent',
              }}
              onClick={(e) => {
                e.stopPropagation();
                if (selectedId !== ellipse.id) {
                  setSelectedId(ellipse.id);
                }
              }}
            >
              <span
                className='mr-2 font-bold font-sans'
                style={{
                  color: PRIMARY_COLOR,
                  fontSize: '1rem',
                  minWidth: '1.8em',
                  display: 'inline-block',
                  textAlign: 'center',
                  fontFamily: 'monospace',
                }}
              >
                {ellipseIndex}
              </span>
              {selectedId === ellipse.id ? (
                <>
                  <input
                    type='text'
                    value={ellipse.comment}
                    onChange={(e) => updateComment(ellipse.id, e.target.value)}
                    placeholder='コメントを入力...'
                    className='flex-1 outline-none border-none bg-transparent px-2 py-1 rounded text-slate-500 text-sm font-mono'
                    style={{ minWidth: 0 }}
                    autoFocus
                  />
                  <button
                    type='button'
                    aria-label='コメント削除'
                    onClick={handleDeleteEllipse}
                    className='text-white rounded-full w-7 h-7 flex items-center justify-center ml-1'
                    style={{
                      color: PRIMARY_COLOR,
                      fontWeight: 'bold',
                      fontSize: '1.2rem',
                      fontFamily: 'monospace',
                    }}
                  >
                    ×
                  </button>
                </>
              ) : (
                <span className='truncate flex-1 cursor-pointer text-slate-700 font-mono text-sm whitespace-pre-line'>
                  {ellipse.comment || '（未入力）'}
                </span>
              )}
            </li>
          );
        })
      )}
    </ul>
  );
}
