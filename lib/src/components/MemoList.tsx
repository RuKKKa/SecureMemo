import React from 'react';
import { Plus, StickyNote } from 'lucide-react';
import { Memo, Folder } from '../types/memo';
import { MemoCard } from './MemoCard';

interface MemoListProps {
  memos: Memo[];
  folders: Folder[];
  selectedMemoId: string | null;
  onSelectMemo: (memo: Memo) => void;
  onTogglePin: (memo: Memo, e: React.MouseEvent) => void;
  onDeleteMemo: (id: string, e: React.MouseEvent) => void;
  onCreateMemo: () => void;
  searchQuery: string;
}

export const MemoList: React.FC<MemoListProps> = ({
  memos,
  folders,
  selectedMemoId,
  onSelectMemo,
  onTogglePin,
  onDeleteMemo,
  onCreateMemo,
  searchQuery,
}) => {
  const folderMap = new Map(folders.map(f => [f.id, f]));

  // ピン留めメモと通常メモの分割
  const pinnedMemos = memos.filter(m => m.isPinned);
  const normalMemos = memos.filter(m => !m.isPinned);

  if (memos.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <div className="w-16 h-16 rounded-3xl bg-brand-50 dark:bg-slate-800 flex items-center justify-center text-brand-500 mb-4 shadow-sm">
          {searchQuery ? <StickyNote className="w-8 h-8 text-slate-400" /> : <Plus className="w-8 h-8 text-brand-600" />}
        </div>
        <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-1">
          {searchQuery ? '一致するメモが見つかりません' : 'メモがまだありません'}
        </h3>
        <p className="text-xs text-slate-400 dark:text-slate-500 max-w-xs mb-5">
          {searchQuery
            ? `「${searchQuery}」に一致するメモはありませんでした。別のキーワードをお試しください。`
            : '右下の「＋」ボタン、または下のボタンから最初のメモを作成しましょう。'}
        </p>
        {!searchQuery && (
          <button
            onClick={onCreateMemo}
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-sm font-semibold shadow-md shadow-brand-500/20 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>メモを作成する</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
      {/* ピン留めセクション */}
      {pinnedMemos.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-brand-600 dark:text-brand-400 tracking-wider">
            <span>ピン留めされたメモ ({pinnedMemos.length})</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {pinnedMemos.map(memo => (
              <MemoCard
                key={memo.id}
                memo={memo}
                folder={memo.folderId ? folderMap.get(memo.folderId) : undefined}
                isSelected={selectedMemoId === memo.id}
                onSelect={() => onSelectMemo(memo)}
                onTogglePin={(e) => onTogglePin(memo, e)}
                onDelete={(e) => onDeleteMemo(memo.id, e)}
              />
            ))}
          </div>
        </div>
      )}

      {/* 通常メモセクション */}
      {normalMemos.length > 0 && (
        <div className="space-y-3">
          {pinnedMemos.length > 0 && (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <span>その他のメモ ({normalMemos.length})</span>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {normalMemos.map(memo => (
              <MemoCard
                key={memo.id}
                memo={memo}
                folder={memo.folderId ? folderMap.get(memo.folderId) : undefined}
                isSelected={selectedMemoId === memo.id}
                onSelect={() => onSelectMemo(memo)}
                onTogglePin={(e) => onTogglePin(memo, e)}
                onDelete={(e) => onDeleteMemo(memo.id, e)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
