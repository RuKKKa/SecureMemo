import React, { useMemo } from 'react';
import { Lock, Pin, Trash2, Calendar, Folder as FolderIcon } from 'lucide-react';
import { marked } from 'marked';
import { Memo, Folder } from '../types/memo';

interface MemoCardProps {
  memo: Memo;
  folder?: Folder;
  isSelected: boolean;
  onSelect: () => void;
  onTogglePin: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
}

// リッチテキストまたはMarkdownをカードプレビュー用に装飾HTMLに変換
function formatPreviewHtml(content: string): string {
  if (!content) return '';
  const hasHtmlTags = /<([a-z]+)([^<]+)*(?:>(.*)<\/\1>|\s+\/>)/i.test(content);
  if (hasHtmlTags) {
    return content;
  }
  try {
    return marked.parse(content, { breaks: true, gfm: true }) as string;
  } catch {
    return content.replace(/\n/g, '<br>');
  }
}

export const MemoCard: React.FC<MemoCardProps> = ({
  memo,
  folder,
  isSelected,
  onSelect,
  onTogglePin,
  onDelete,
}) => {
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  const previewHtml = useMemo(() => {
    if (memo.isLocked || !memo.content) return '';
    return formatPreviewHtml(memo.content);
  }, [memo.content, memo.isLocked]);

  return (
    <div
      onClick={onSelect}
      className={`group relative p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between ${
        isSelected
          ? 'bg-brand-50/70 dark:bg-brand-950/40 border-brand-500 shadow-md shadow-brand-500/10'
          : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-brand-300 dark:hover:border-slate-700 hover:shadow-sm'
      }`}
    >
      <div>
        {/* 上部タグ・メタ情報 */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5 overflow-hidden">
            {folder ? (
              <span
                className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md truncate"
                style={{
                  backgroundColor: `${folder.color || '#2563eb'}18`,
                  color: folder.color || '#2563eb',
                }}
              >
                <FolderIcon className="w-3 h-3 shrink-0" />
                <span className="truncate max-w-[100px]">{folder.name}</span>
              </span>
            ) : (
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500">
                未分類
              </span>
            )}

            {memo.isLocked && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
                <Lock className="w-3 h-3" />
                ロック中
              </span>
            )}
          </div>

          {/* ピン留め & 削除ボタン */}
          <div className="flex items-center gap-1">
            <button
              onClick={onTogglePin}
              className={`p-1 rounded-lg transition-colors ${
                memo.isPinned
                  ? 'text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/50'
                  : 'text-slate-300 hover:text-slate-500 dark:hover:text-slate-400 md:opacity-0 md:group-hover:opacity-100'
              }`}
              title={memo.isPinned ? 'ピン留め解除' : '上部に固定'}
            >
              <Pin className={`w-3.5 h-3.5 ${memo.isPinned ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={onDelete}
              className="p-1 text-slate-300 hover:text-red-500 dark:hover:text-red-400 rounded-lg md:opacity-0 md:group-hover:opacity-100 transition-opacity"
              title="メモを削除"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* タイトル */}
        <h3 className="font-semibold text-sm md:text-base text-slate-900 dark:text-slate-100 mb-1.5 truncate group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
          {memo.title || '（タイトルなし）'}
        </h3>

        {/* 本文プレビュー（太字・斜体・リスト・見出しの装飾をそのまま反映） */}
        <div className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed mb-3 min-h-[3rem] overflow-hidden
          [&_b]:font-bold [&_b]:text-slate-900 dark:[&_b]:text-white
          [&_strong]:font-bold [&_strong]:text-slate-900 dark:[&_strong]:text-white
          [&_i]:italic [&_em]:italic
          [&_u]:underline [&_u]:decoration-brand-500
          [&_ul]:list-disc [&_ul]:pl-4 [&_ul]:my-0.5
          [&_ol]:list-decimal [&_ol]:pl-4 [&_ol]:my-0.5
          [&_li]:my-0.5
          [&_h1]:text-xs [&_h1]:font-bold [&_h1]:text-brand-600 dark:[&_h1]:text-brand-400 [&_h1]:inline-block
          [&_h2]:text-xs [&_h2]:font-bold [&_h2]:inline-block
          [&_blockquote]:border-l-2 [&_blockquote]:border-brand-500 [&_blockquote]:pl-1.5 [&_blockquote]:italic [&_blockquote]:text-slate-500
          [&_hr]:my-1 [&_hr]:border-slate-200 dark:[&_hr]:border-slate-700
        ">
          {memo.isLocked ? (
            <span className="text-slate-400 dark:text-slate-500 italic flex items-center gap-1.5 pt-1">
              <Lock className="w-3.5 h-3.5 text-amber-500" />
              <span>このメモは暗号化されています。ロックを解除すると閲覧できます。</span>
            </span>
          ) : memo.content ? (
            <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
          ) : (
            <span className="text-slate-400 italic">（本文なし）</span>
          )}
        </div>
      </div>

      {/* 日時 & ロック状態 */}
      <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800/80">
        <span className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          {formatDate(memo.updatedAt)}
        </span>
        {memo.isLocked && (
          <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
            暗号化保護
          </span>
        )}
      </div>
    </div>
  );
};
