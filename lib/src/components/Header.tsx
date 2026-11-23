import React from 'react';
import { Menu, Search, X, Moon, Sun, Settings as SettingsIcon } from 'lucide-react';
import { ThemeMode } from '../types/memo';

interface HeaderProps {
  onOpenSidebar: () => void;
  folderTitle: string;
  folderColor?: string;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSidebar,
  folderTitle,
  folderColor,
  searchQuery,
  onSearchChange,
  theme,
  onToggleTheme,
  onOpenSettings,
}) => {
  return (
    <header className="h-16 px-4 md:px-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        {/* モバイル用ハンバーガーボタン */}
        <button
          onClick={onOpenSidebar}
          className="md:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          aria-label="メニューを開く"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* 現在のフォルダ名 */}
        <div className="flex items-center gap-2">
          {folderColor && (
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: folderColor }}
            />
          )}
          <h2 className="font-semibold text-base md:text-lg text-slate-900 dark:text-white truncate max-w-[140px] sm:max-w-[200px] md:max-w-xs">
            {folderTitle}
          </h2>
        </div>
      </div>

      {/* 検索バー */}
      <div className="flex-1 max-w-md mx-2">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="メモを検索..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-8 py-1.5 md:py-2 text-xs md:text-sm bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 rounded-xl border border-transparent focus:border-brand-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* アクションボタン */}
      <div className="flex items-center gap-1">
        <button
          onClick={onToggleTheme}
          className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          title="ダークモード切り替え"
        >
          {theme === 'dark' ? (
            <Sun className="w-5 h-5 text-amber-400" />
          ) : (
            <Moon className="w-5 h-5 text-slate-600" />
          )}
        </button>

        <button
          onClick={onOpenSettings}
          className="hidden sm:flex p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          title="設定"
        >
          <SettingsIcon className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};
