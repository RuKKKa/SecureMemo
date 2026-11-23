import React, { useState } from 'react';
import { 
  FolderPlus, 
  Folder as FolderIcon, 
  Layers, 
  Lock, 
  FileQuestion, 
  Trash2, 
  Settings as SettingsIcon, 
  X,
  ChevronRight,
  Sun,
  Moon,
  Laptop
} from 'lucide-react';
import { Folder, ThemeMode } from '../types/memo';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  folders: Folder[];
  currentFolderId: string | 'ALL' | 'UNFILED' | 'LOCKED';
  onSelectFolder: (id: string | 'ALL' | 'UNFILED' | 'LOCKED') => void;
  onCreateFolder: (name: string, color?: string) => void;
  onDeleteFolder: (id: string) => void;
  memoCounts: {
    all: number;
    unfiled: number;
    locked: number;
    byFolder: Record<string, number>;
  };
  theme: ThemeMode;
  onToggleTheme: () => void;
  onOpenSettings: () => void;
}

const FOLDER_COLORS = ['#2563eb', '#0284c7', '#0d9488', '#16a34a', '#ca8a04', '#ea580c', '#e11d48', '#7c3aed'];

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  folders,
  currentFolderId,
  onSelectFolder,
  onCreateFolder,
  onDeleteFolder,
  memoCounts,
  theme,
  onToggleTheme,
  onOpenSettings,
}) => {
  const [isAddingFolder, setIsAddingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [selectedColor, setSelectedColor] = useState(FOLDER_COLORS[0]);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newFolderName.trim()) {
      onCreateFolder(newFolderName.trim(), selectedColor);
      setNewFolderName('');
      setIsAddingFolder(false);
    }
  };

  return (
    <>
      {/* モバイル用背景オーバーレイ */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 md:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* サイドバー本体 */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:static md:z-0`}
      >
        {/* ヘッダー部（ロゴ・閉じるボタン） */}
        <div className="h-16 px-5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-700 to-sky-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
                Secure<span className="text-brand-600 dark:text-brand-400">Memo</span>
              </h1>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium tracking-wide">
                暗号化対応セキュアメモ
              </p>
            </div>
          </div>
          {/* モバイル閉じるボタン */}
          <button
            onClick={onClose}
            className="md:hidden p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* フォルダ・フィルター一覧 */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {/* 基本ビュー */}
          <div className="space-y-1">
            <div className="px-3 pb-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              メイン
            </div>
            <button
              onClick={() => { onSelectFolder('ALL'); onClose(); }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                currentFolderId === 'ALL'
                  ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 font-semibold'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Layers className={`w-4 h-4 ${currentFolderId === 'ALL' ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400'}`} />
                <span>すべてのメモ</span>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                {memoCounts.all}
              </span>
            </button>

            <button
              onClick={() => { onSelectFolder('LOCKED'); onClose(); }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                currentFolderId === 'LOCKED'
                  ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 font-semibold'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Lock className={`w-4 h-4 ${currentFolderId === 'LOCKED' ? 'text-brand-600 dark:text-brand-400' : 'text-amber-500'}`} />
                <span>ロック中</span>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
                {memoCounts.locked}
              </span>
            </button>

            <button
              onClick={() => { onSelectFolder('UNFILED'); onClose(); }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                currentFolderId === 'UNFILED'
                  ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 font-semibold'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <FileQuestion className={`w-4 h-4 ${currentFolderId === 'UNFILED' ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400'}`} />
                <span>未分類</span>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                {memoCounts.unfiled}
              </span>
            </button>
          </div>

          {/* ユーザーフォルダ */}
          <div className="space-y-1">
            <div className="flex items-center justify-between px-3 pb-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                フォルダ ({folders.length})
              </span>
              <button
                onClick={() => setIsAddingFolder(prev => !prev)}
                className="p-1 text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                title="新しいフォルダを追加"
              >
                <FolderPlus className="w-4 h-4" />
              </button>
            </div>

            {/* 新規フォルダ作成フォーム */}
            {isAddingFolder && (
              <form onSubmit={handleAddSubmit} className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2.5 mb-2">
                <input
                  type="text"
                  placeholder="フォルダ名を入力..."
                  value={newFolderName}
                  onChange={e => setNewFolderName(e.target.value)}
                  autoFocus
                  className="w-full px-2.5 py-1.5 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                <div className="flex items-center gap-1.5">
                  {FOLDER_COLORS.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      style={{ backgroundColor: color }}
                      className={`w-5 h-5 rounded-full transition-transform ${
                        selectedColor === color ? 'scale-125 ring-2 ring-offset-2 ring-brand-500' : 'hover:scale-110'
                      }`}
                    />
                  ))}
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => { setIsAddingFolder(false); setNewFolderName(''); }}
                    className="px-2.5 py-1 text-xs text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md"
                  >
                    キャンセル
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1 text-xs bg-brand-600 hover:bg-brand-700 text-white font-medium rounded-md shadow-sm"
                  >
                    作成
                  </button>
                </div>
              </form>
            )}

            {folders.length === 0 && !isAddingFolder && (
              <p className="px-3 py-2 text-xs text-slate-400 italic">
                フォルダはありません
              </p>
            )}

            {folders.map(folder => {
              const isSelected = currentFolderId === folder.id;
              const count = memoCounts.byFolder[folder.id] || 0;
              return (
                <div
                  key={folder.id}
                  className={`group flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isSelected
                      ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 font-semibold'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <button
                    onClick={() => { onSelectFolder(folder.id); onClose(); }}
                    className="flex-1 flex items-center gap-3 overflow-hidden text-left"
                  >
                    <FolderIcon
                      className="w-4 h-4 shrink-0"
                      style={{ color: folder.color || '#2563eb' }}
                    />
                    <span className="truncate">{folder.name}</span>
                  </button>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:hidden">
                      {count}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`フォルダ「${folder.name}」を削除しますか？\n（フォルダ内のメモは未分類に移動します）`)) {
                          onDeleteFolder(folder.id);
                        }
                      }}
                      className="hidden group-hover:flex p-1 text-slate-400 hover:text-red-500 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700"
                      title="フォルダを削除"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* サイドバーフッター（設定・テーマ切り替え） */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50 space-y-1">
          {/* テーマ切り替えボタン */}
          <button
            onClick={onToggleTheme}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <div className="flex items-center gap-3">
              {theme === 'dark' ? (
                <Moon className="w-4 h-4 text-sky-400" />
              ) : theme === 'light' ? (
                <Sun className="w-4 h-4 text-amber-500" />
              ) : (
                <Laptop className="w-4 h-4 text-brand-500" />
              )}
              <span>ダークモード</span>
            </div>
            <span className="text-xs text-slate-400 capitalize">
              {theme === 'dark' ? 'ON' : theme === 'light' ? 'OFF' : '自動'}
            </span>
          </button>

          {/* 設定ボタン */}
          <button
            onClick={() => { onOpenSettings(); onClose(); }}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <div className="flex items-center gap-3">
              <SettingsIcon className="w-4 h-4 text-slate-400" />
              <span>設定・バックアップ</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      </aside>
    </>
  );
};
