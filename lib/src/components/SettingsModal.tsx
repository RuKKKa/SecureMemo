import React from 'react';
import { X, Moon, Sun, Laptop, Download, Upload, RotateCcw, ShieldCheck, Heart } from 'lucide-react';
import { ThemeMode, Memo, Folder } from '../types/memo';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
  memos: Memo[];
  folders: Folder[];
  onImportData: (memos: Memo[], folders: Folder[]) => void;
  onResetData: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  theme,
  onThemeChange,
  memos,
  folders,
  onImportData,
  onResetData,
}) => {
  if (!isOpen) return null;

  const handleExport = () => {
    const data = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      folders,
      memos,
    };
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `secure_memo_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed.memos) && Array.isArray(parsed.folders)) {
          if (confirm(`メモ${parsed.memos.length}件、フォルダ${parsed.folders.length}件を読み込みますか？\n（現在のデータは上書きされます）`)) {
            onImportData(parsed.memos, parsed.folders);
            alert('データを正常にインポートしました');
            onClose();
          }
        } else {
          alert('不正なバックアップファイル形式です');
        }
      } catch (err) {
        alert('ファイルの読み込みに失敗しました');
        console.error(err);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* ヘッダー */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 dark:text-white text-base">
            設定 & バックアップ
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 設定リスト */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* テーマ設定 */}
          <div className="space-y-3">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              外観テーマ (ダークモード)
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => onThemeChange('light')}
                className={`flex flex-col items-center gap-2 p-3 rounded-2xl border text-xs font-semibold transition-all ${
                  theme === 'light'
                    ? 'border-brand-600 bg-brand-50/70 text-brand-700 dark:bg-brand-950/50 dark:text-brand-300 ring-2 ring-brand-500/20'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <Sun className="w-5 h-5 text-amber-500" />
                <span>ライト</span>
              </button>

              <button
                type="button"
                onClick={() => onThemeChange('dark')}
                className={`flex flex-col items-center gap-2 p-3 rounded-2xl border text-xs font-semibold transition-all ${
                  theme === 'dark'
                    ? 'border-brand-600 bg-brand-50/70 text-brand-700 dark:bg-brand-950/50 dark:text-brand-300 ring-2 ring-brand-500/20'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <Moon className="w-5 h-5 text-sky-400" />
                <span>ダーク</span>
              </button>

              <button
                type="button"
                onClick={() => onThemeChange('system')}
                className={`flex flex-col items-center gap-2 p-3 rounded-2xl border text-xs font-semibold transition-all ${
                  theme === 'system'
                    ? 'border-brand-600 bg-brand-50/70 text-brand-700 dark:bg-brand-950/50 dark:text-brand-300 ring-2 ring-brand-500/20'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <Laptop className="w-5 h-5 text-slate-500" />
                <span>端末連動</span>
              </button>
            </div>
          </div>

          {/* セキュリティ仕様説明 */}
          <div className="p-3.5 bg-brand-50/60 dark:bg-brand-950/40 rounded-2xl border border-brand-100 dark:border-brand-900/40 space-y-1.5 text-xs">
            <div className="flex items-center gap-2 font-semibold text-brand-800 dark:text-brand-300">
              <ShieldCheck className="w-4 h-4 text-brand-600" />
              <span>安心のクライアント暗号化</span>
            </div>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
              ロック設定したメモはWeb Crypto API (AES-GCM / PBKDF2 100,000回ストレッチング) で暗号化されます。PINや平文が外部サーバーに送信されることはありません。
            </p>
          </div>

          {/* バックアップ・復元 */}
          <div className="space-y-3">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              データ管理 & バックアップ
            </label>
            <div className="space-y-2">
              <button
                type="button"
                onClick={handleExport}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Download className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                  <span>データをJSONファイルとしてエクスポート</span>
                </div>
                <span className="text-[10px] text-slate-400">{memos.length}件</span>
              </button>

              <label className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 transition-colors cursor-pointer">
                <div className="flex items-center gap-2.5">
                  <Upload className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                  <span>バックアップJSONファイルをインポート</span>
                </div>
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleImportFile}
                  className="hidden"
                />
              </label>

              <button
                type="button"
                onClick={() => {
                  if (confirm('全てのメモとフォルダを初期サンプルデータに戻しますか？')) {
                    onResetData();
                    onClose();
                  }
                }}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-red-50/50 dark:bg-red-950/20 hover:bg-red-100/60 dark:hover:bg-red-950/40 text-xs font-medium text-red-600 dark:text-red-400 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <RotateCcw className="w-4 h-4 text-red-500" />
                  <span>初期サンプルデータにリセット</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* フッター */}
        <div className="px-6 py-3 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <span>SecureMemo App v1.0</span>
          <span className="flex items-center gap-1">
            Made with <Heart className="w-3 h-3 text-red-400 fill-current" /> TypeScript
          </span>
        </div>
      </div>
    </div>
  );
};
