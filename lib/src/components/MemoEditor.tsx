import React, { useEffect, useRef, useState, useCallback } from 'react';
import { 
  ArrowLeft, 
  Lock, 
  Unlock, 
  Pin, 
  Trash2, 
  Folder as FolderIcon,
  Check,
  Clock,
  Sparkles,
  Bold,
  Italic,
  Underline,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Quote,
  Minus,
  RemoveFormatting
} from 'lucide-react';
import { marked } from 'marked';
import { Memo, Folder } from '../types/memo';

interface MemoEditorProps {
  memo: Memo;
  folders: Folder[];
  onUpdate: (updated: Partial<Memo>) => void;
  onClose: () => void;
  onRequestLockToggle: () => void;
  onDelete: () => void;
}

// プレーンテキストまたはMarkdownをHTMLに正規化
function normalizeToHtml(content: string): string {
  if (!content) return '';
  // すでにHTMLタグ（<p>, <div>, <h1>, <strong>など）が含まれている場合はそのまま使用
  const hasHtmlTags = /<([a-z]+)([^<]+)*(?:>(.*)<\/\1>|\s+\/>)/i.test(content);
  if (hasHtmlTags) {
    return content;
  }
  // Markdownまたは改行テキストの場合はHTMLに変換
  try {
    return marked.parse(content, { breaks: true, gfm: true }) as string;
  } catch {
    return content.replace(/\n/g, '<br>');
  }
}

export const MemoEditor: React.FC<MemoEditorProps> = ({
  memo,
  folders,
  onUpdate,
  onClose,
  onRequestLockToggle,
  onDelete,
}) => {
  const titleInputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const lastMemoIdRef = useRef<string | null>(null);

  // 書式アクティブ状態の検知用ステート
  const [activeFormats, setActiveFormats] = useState({
    bold: false,
    italic: false,
    underline: false,
    ul: false,
    ol: false,
  });

  // アクティブな書式を更新
  const updateActiveFormats = useCallback(() => {
    setActiveFormats({
      bold: document.queryCommandState('bold'),
      italic: document.queryCommandState('italic'),
      underline: document.queryCommandState('underline'),
      ul: document.queryCommandState('insertUnorderedList'),
      ol: document.queryCommandState('insertOrderedList'),
    });
  }, []);

  // メモIDが切り替わった時にエディタの内容を初期化
  useEffect(() => {
    if (editorRef.current && lastMemoIdRef.current !== memo.id) {
      editorRef.current.innerHTML = normalizeToHtml(memo.content);
      lastMemoIdRef.current = memo.id;
    }
  }, [memo.id, memo.content]);

  // 新規メモ作成時はタイトルにフォーカス
  useEffect(() => {
    if (!memo.title && !memo.content) {
      titleInputRef.current?.focus();
    }
  }, [memo.id]);

  // 入力イベント（内容の保存）
  const handleInput = () => {
    if (!editorRef.current) return;
    const html = editorRef.current.innerHTML;
    onUpdate({ content: html });
    updateActiveFormats();
  };

  // 書式実行関数
  const executeCommand = (command: string, value: string | undefined = undefined) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    document.execCommand(command, false, value);
    handleInput();
  };

  return (
    <div className="w-full h-full bg-white dark:bg-slate-900 flex flex-col overflow-hidden animate-in fade-in duration-150">
      {/* 上部ツールバー */}
      <div className="h-16 px-3 sm:px-6 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm">
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* 戻るボタン */}
          <button
            onClick={onClose}
            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            title="一覧に戻る"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          {/* フォルダ選択 */}
          <div className="relative flex items-center">
            <FolderIcon className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
            <select
              value={memo.folderId || ''}
              onChange={(e) => onUpdate({ folderId: e.target.value || null })}
              className="pl-7 pr-6 py-1.5 text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl border border-transparent focus:border-brand-500 focus:outline-none appearance-none cursor-pointer max-w-[110px] sm:max-w-[160px] truncate"
            >
              <option value="">未分類</option>
              {folders.map(f => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 右側アクション */}
        <div className="flex items-center gap-1">
          {/* ピン留め */}
          <button
            onClick={() => onUpdate({ isPinned: !memo.isPinned })}
            className={`p-2 rounded-xl transition-colors ${
              memo.isPinned
                ? 'text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/60'
                : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title={memo.isPinned ? 'ピン留め解除' : 'ピン留め'}
          >
            <Pin className={`w-4 h-4 ${memo.isPinned ? 'fill-current' : ''}`} />
          </button>

          {/* ロック切替 */}
          <button
            onClick={onRequestLockToggle}
            className={`p-2 rounded-xl transition-colors flex items-center gap-1.5 text-xs font-semibold ${
              memo.isLocked
                ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 hover:bg-amber-200'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-brand-50 hover:text-brand-600'
            }`}
            title={memo.isLocked ? 'ロックを解除して平文に戻す' : 'PINコードで暗号化ロック'}
          >
            {memo.isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
            <span className="hidden sm:inline">
              {memo.isLocked ? '保護中' : 'ロック'}
            </span>
          </button>

          {/* 削除 */}
          <button
            onClick={() => {
              if (confirm('このメモを削除してもよろしいですか？')) {
                onDelete();
              }
            }}
            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-colors"
            title="メモを削除"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          {/* 完了ボタン */}
          <button
            onClick={onClose}
            className="ml-1 px-3 py-1.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-semibold shadow-sm transition-all flex items-center gap-1"
          >
            <Check className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">完了</span>
          </button>
        </div>
      </div>

      {/* WYSIWYG書式装飾ツールバー */}
      <div className="px-3 sm:px-6 py-2 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/80 dark:bg-slate-900/60 flex items-center gap-1 overflow-x-auto no-scrollbar text-slate-600 dark:text-slate-300 sticky top-0 z-10">
        {/* 太字 */}
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); executeCommand('bold'); }}
          className={`p-2 rounded-lg transition-colors ${
            activeFormats.bold 
              ? 'bg-brand-600 text-white shadow-sm' 
              : 'hover:bg-white dark:hover:bg-slate-800 hover:text-brand-600'
          }`}
          title="太字 (Ctrl+B)"
        >
          <Bold className="w-4 h-4" />
        </button>

        {/* 斜体 */}
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); executeCommand('italic'); }}
          className={`p-2 rounded-lg transition-colors ${
            activeFormats.italic 
              ? 'bg-brand-600 text-white shadow-sm' 
              : 'hover:bg-white dark:hover:bg-slate-800 hover:text-brand-600'
          }`}
          title="斜体 (Ctrl+I)"
        >
          <Italic className="w-4 h-4" />
        </button>

        {/* 下線 */}
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); executeCommand('underline'); }}
          className={`p-2 rounded-lg transition-colors ${
            activeFormats.underline 
              ? 'bg-brand-600 text-white shadow-sm' 
              : 'hover:bg-white dark:hover:bg-slate-800 hover:text-brand-600'
          }`}
          title="下線 (Ctrl+U)"
        >
          <Underline className="w-4 h-4" />
        </button>

        <span className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-1 shrink-0" />

        {/* 大見出し (H1) */}
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); executeCommand('formatBlock', '<h1>'); }}
          className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-lg hover:text-brand-600 transition-colors"
          title="大見出し"
        >
          <Heading1 className="w-4 h-4" />
        </button>

        {/* 中見出し (H2) */}
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); executeCommand('formatBlock', '<h2>'); }}
          className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-lg hover:text-brand-600 transition-colors"
          title="中見出し"
        >
          <Heading2 className="w-4 h-4" />
        </button>

        <span className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-1 shrink-0" />

        {/* 箇条書きリスト */}
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); executeCommand('insertUnorderedList'); }}
          className={`p-2 rounded-lg transition-colors ${
            activeFormats.ul 
              ? 'bg-brand-600 text-white shadow-sm' 
              : 'hover:bg-white dark:hover:bg-slate-800 hover:text-brand-600'
          }`}
          title="箇条書きリスト"
        >
          <List className="w-4 h-4" />
        </button>

        {/* 番号付きリスト */}
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); executeCommand('insertOrderedList'); }}
          className={`p-2 rounded-lg transition-colors ${
            activeFormats.ol 
              ? 'bg-brand-600 text-white shadow-sm' 
              : 'hover:bg-white dark:hover:bg-slate-800 hover:text-brand-600'
          }`}
          title="番号付きリスト"
        >
          <ListOrdered className="w-4 h-4" />
        </button>

        <span className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-1 shrink-0" />

        {/* 引用 */}
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); executeCommand('formatBlock', '<blockquote>'); }}
          className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-lg hover:text-brand-600 transition-colors"
          title="引用ブロック"
        >
          <Quote className="w-4 h-4" />
        </button>

        {/* 区切り線 */}
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); executeCommand('insertHorizontalRule'); }}
          className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-lg hover:text-brand-600 transition-colors"
          title="区切り線"
        >
          <Minus className="w-4 h-4" />
        </button>

        {/* 書式クリア */}
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); executeCommand('removeFormat'); }}
          className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-lg hover:text-red-500 transition-colors ml-auto"
          title="書式をクリア"
        >
          <RemoveFormatting className="w-4 h-4" />
        </button>
      </div>

      {/* エディタ本文入力エリア */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-5 max-w-4xl mx-auto w-full space-y-4 flex flex-col">
        {/* ロック中アラートバナー */}
        {memo.isLocked && (
          <div className="flex items-center gap-2.5 p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/40 rounded-2xl text-xs text-amber-700 dark:text-amber-300">
            <Lock className="w-4 h-4 shrink-0" />
            <span>このメモは暗号化ロックされています。アプリをリロードすると再ロックされます。</span>
          </div>
        )}

        {/* タイトル入力 */}
        <input
          ref={titleInputRef}
          type="text"
          placeholder="タイトルを入力..."
          value={memo.title}
          onChange={(e) => onUpdate({ title: e.target.value })}
          className="w-full text-xl md:text-2xl font-bold bg-transparent text-slate-900 dark:text-white placeholder-slate-300 dark:placeholder-slate-600 focus:outline-none border-b border-transparent focus:border-slate-200 dark:focus:border-slate-800 pb-2 transition-colors"
        />

        {/* メタ情報表示バー */}
        <div className="flex items-center gap-4 text-[11px] text-slate-400 dark:text-slate-500 pb-1">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            最終更新: {new Date(memo.updatedAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
          </span>
          <span className="flex items-center gap-1 text-brand-600 dark:text-brand-400 font-medium">
            <Sparkles className="w-3 h-3" />
            リアルタイム保存中
          </span>
        </div>

        {/* 見たまま編集（WYSIWYG）リッチエディタエリア */}
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
          onKeyUp={updateActiveFormats}
          onMouseUp={updateActiveFormats}
          data-placeholder="ここにメモを入力... 上部のツールバーで太字や箇条書きなどの装飾がその場で反映されます"
          className="flex-1 min-h-[400px] outline-none text-slate-800 dark:text-slate-100 leading-relaxed text-sm md:text-base 
            empty:before:content-[attr(data-placeholder)] empty:before:text-slate-300 dark:empty:before:text-slate-600 empty:before:pointer-events-none
            [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:text-brand-700 dark:[&_h1]:text-brand-400 [&_h1]:border-b [&_h1]:border-slate-200 dark:[&_h1]:border-slate-800 [&_h1]:pb-2 [&_h1]:my-3
            [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-slate-900 dark:[&_h2]:text-slate-100 [&_h2]:my-2.5
            [&_b]:font-bold [&_b]:text-slate-900 dark:[&_b]:text-white
            [&_strong]:font-bold [&_strong]:text-slate-900 dark:[&_strong]:text-white
            [&_i]:italic [&_em]:italic
            [&_u]:underline [&_u]:decoration-brand-500
            [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-2 [&_ul]:space-y-1
            [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-2 [&_ol]:space-y-1
            [&_li]:leading-relaxed
            [&_blockquote]:border-l-4 [&_blockquote]:border-brand-500 [&_blockquote]:bg-brand-50/50 dark:[&_blockquote]:bg-brand-950/30 [&_blockquote]:pl-4 [&_blockquote]:py-1.5 [&_blockquote]:my-2.5 [&_blockquote]:rounded-r-lg [&_blockquote]:text-slate-600 dark:[&_blockquote]:text-slate-400
            [&_hr]:my-4 [&_hr]:border-slate-200 dark:[&_hr]:border-slate-800
          "
        />
      </div>
    </div>
  );
};
