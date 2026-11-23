import React, { useState, useEffect, useMemo } from 'react';
import { 
  loadStoredMemos, 
  saveStoredMemos, 
  loadStoredFolders, 
  saveStoredFolders, 
  loadStoredTheme, 
  saveStoredTheme 
} from './utils/storage';
import { 
  generateSalt, 
  hashPin, 
  encryptText, 
  decryptText 
} from './utils/crypto';
import { Memo, Folder, ThemeMode } from './types/memo';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { MemoList } from './components/MemoList';
import { MemoEditor } from './components/MemoEditor';
import { FabButton } from './components/FabButton';
import { PinModal } from './components/PinModal';
import { SettingsModal } from './components/SettingsModal';

export const App: React.FC = () => {
  // 基本ステート
  const [memos, setMemos] = useState<Memo[]>(() => loadStoredMemos());
  const [folders, setFolders] = useState<Folder[]>(() => loadStoredFolders());
  const [currentFolderId, setCurrentFolderId] = useState<string | 'ALL' | 'UNFILED' | 'LOCKED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMemoId, setSelectedMemoId] = useState<string | null>(null);

  // UIステート
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [theme, setTheme] = useState<ThemeMode>(() => loadStoredTheme());

  // ロック / PINモーダルステート
  const [pinModalConfig, setPinModalConfig] = useState<{
    isOpen: boolean;
    mode: 'unlock' | 'set';
    memoId: string | null;
  }>({
    isOpen: false,
    mode: 'unlock',
    memoId: null,
  });

  // ストレージ同期
  useEffect(() => {
    saveStoredMemos(memos);
  }, [memos]);

  useEffect(() => {
    saveStoredFolders(folders);
  }, [folders]);

  // テーマ適用（ダークモードクラス制御）
  useEffect(() => {
    saveStoredTheme(theme);
    const root = document.documentElement;
    const applyDark = () => {
      if (theme === 'dark') {
        root.classList.add('dark');
      } else if (theme === 'light') {
        root.classList.remove('dark');
      } else {
        // system
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDark) {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
      }
    };

    applyDark();

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = () => applyDark();
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme(prev => {
      if (prev === 'light') return 'dark';
      if (prev === 'dark') return 'system';
      return 'light';
    });
  };

  // メモ件数集計
  const memoCounts = useMemo(() => {
    const byFolder: Record<string, number> = {};
    let unfiled = 0;
    let locked = 0;

    memos.forEach(m => {
      if (m.isLocked) locked++;
      if (m.folderId) {
        byFolder[m.folderId] = (byFolder[m.folderId] || 0) + 1;
      } else {
        unfiled++;
      }
    });

    return {
      all: memos.length,
      unfiled,
      locked,
      byFolder,
    };
  }, [memos]);

  // 表示対象メモのフィルタリング & 検索
  const filteredMemos = useMemo(() => {
    return memos
      .filter(m => {
        // フォルダフィルター
        if (currentFolderId === 'ALL') return true;
        if (currentFolderId === 'UNFILED') return m.folderId === null;
        if (currentFolderId === 'LOCKED') return m.isLocked;
        return m.folderId === currentFolderId;
      })
      .filter(m => {
        // 検索クエリ
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        const titleMatch = m.title.toLowerCase().includes(q);
        const contentMatch = !m.isLocked && m.content.toLowerCase().includes(q);
        return titleMatch || contentMatch;
      })
      .sort((a, b) => b.updatedAt - a.updatedAt);
  }, [memos, currentFolderId, searchQuery]);

  // 現在選択されているメモ
  const currentMemo = useMemo(() => {
    return memos.find(m => m.id === selectedMemoId) || null;
  }, [memos, selectedMemoId]);

  // 現在のフォルダ情報
  const currentFolder = useMemo(() => {
    if (typeof currentFolderId === 'string' && !['ALL', 'UNFILED', 'LOCKED'].includes(currentFolderId)) {
      return folders.find(f => f.id === currentFolderId);
    }
    return undefined;
  }, [folders, currentFolderId]);

  const currentFolderTitle = useMemo(() => {
    if (currentFolderId === 'ALL') return 'すべてのメモ';
    if (currentFolderId === 'UNFILED') return '未分類';
    if (currentFolderId === 'LOCKED') return 'ロック中のメモ';
    return currentFolder?.name || 'フォルダ';
  }, [currentFolderId, currentFolder]);

  // 新規メモ作成
  const handleCreateMemo = () => {
    const newMemo: Memo = {
      id: `memo-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title: '',
      content: '',
      folderId: typeof currentFolderId === 'string' && !['ALL', 'UNFILED', 'LOCKED'].includes(currentFolderId)
        ? currentFolderId
        : null,
      isLocked: false,
      isPinned: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    setMemos(prev => [newMemo, ...prev]);
    setSelectedMemoId(newMemo.id);
  };

  // メモ選択時のハンドラ（ロックされている場合の解除対応）
  const handleSelectMemo = (memo: Memo) => {
    if (memo.isLocked && memo.encryptedContent) {
      // ロック中メモをクリックした場合はPIN入力を要求
      setPinModalConfig({
        isOpen: true,
        mode: 'unlock',
        memoId: memo.id,
      });
    } else {
      setSelectedMemoId(memo.id);
    }
  };

  // メモ更新ハンドラ
  const handleUpdateMemo = (updatedFields: Partial<Memo>) => {
    if (!selectedMemoId) return;

    setMemos(prev =>
      prev.map(m => {
        if (m.id === selectedMemoId) {
          const updated = {
            ...m,
            ...updatedFields,
            updatedAt: Date.now(),
          };
          return updated;
        }
        return m;
      })
    );
  };

  // メモ削除
  const handleDeleteMemo = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (confirm('このメモを削除しますか？')) {
      setMemos(prev => prev.filter(m => m.id !== id));
      if (selectedMemoId === id) {
        setSelectedMemoId(null);
      }
    }
  };

  // ピン留めトグル
  const handleTogglePin = (memo: Memo, e: React.MouseEvent) => {
    e.stopPropagation();
    setMemos(prev =>
      prev.map(m => (m.id === memo.id ? { ...m, isPinned: !m.isPinned } : m))
    );
  };

  // フォルダ作成
  const handleCreateFolder = (name: string, color?: string) => {
    const newFolder: Folder = {
      id: `folder-${Date.now()}`,
      name,
      color: color || '#2563eb',
      createdAt: Date.now(),
    };
    setFolders(prev => [...prev, newFolder]);
    setCurrentFolderId(newFolder.id);
  };

  // フォルダ削除
  const handleDeleteFolder = (folderId: string) => {
    setFolders(prev => prev.filter(f => f.id !== folderId));
    // フォルダ内のメモを未分類に
    setMemos(prev =>
      prev.map(m => (m.folderId === folderId ? { ...m, folderId: null } : m))
    );
    if (currentFolderId === folderId) {
      setCurrentFolderId('ALL');
    }
  };

  // ロック設定 / 解除リクエスト
  const handleRequestLockToggle = () => {
    if (!currentMemo) return;

    if (currentMemo.isLocked) {
      // 既にロックされている場合、平文に戻すか確認
      if (confirm('このメモの暗号化ロックを解除して平文で保存しますか？')) {
        setMemos(prev =>
          prev.map(m =>
            m.id === currentMemo.id
              ? {
                  ...m,
                  isLocked: false,
                  encryptedContent: undefined,
                  iv: undefined,
                  pinSalt: undefined,
                  pinHash: undefined,
                  updatedAt: Date.now(),
                }
              : m
          )
        );
      }
    } else {
      // ロック設定用モーダルを開く
      setPinModalConfig({
        isOpen: true,
        mode: 'set',
        memoId: currentMemo.id,
      });
    }
  };

  // PIN送信（暗号化設定 または 復号）
  const handlePinSubmit = async (pin: string): Promise<boolean> => {
    const targetMemo = memos.find(m => m.id === pinModalConfig.memoId);
    if (!targetMemo) return false;

    if (pinModalConfig.mode === 'set') {
      // 新規ロック設定
      const salt = generateSalt();
      const pHash = await hashPin(pin, salt);
      const { cipherText, iv } = await encryptText(targetMemo.content, pin, salt);

      setMemos(prev =>
        prev.map(m =>
          m.id === targetMemo.id
            ? {
                ...m,
                isLocked: true,
                encryptedContent: cipherText,
                iv,
                pinSalt: salt,
                pinHash: pHash,
                updatedAt: Date.now(),
              }
            : m
        )
      );
      return true;
    } else {
      // ロック解除 (検証 & 復号)
      if (!targetMemo.pinSalt || !targetMemo.pinHash || !targetMemo.encryptedContent || !targetMemo.iv) {
        return false;
      }

      const checkHash = await hashPin(pin, targetMemo.pinSalt);
      if (checkHash !== targetMemo.pinHash) {
        return false;
      }

      // 復号
      try {
        const decrypted = await decryptText(
          targetMemo.encryptedContent,
          targetMemo.iv,
          pin,
          targetMemo.pinSalt
        );

        // メモリ上に復号された本文をセットしてエディタを開く
        setMemos(prev =>
          prev.map(m => (m.id === targetMemo.id ? { ...m, content: decrypted } : m))
        );
        setSelectedMemoId(targetMemo.id);
        return true;
      } catch (err) {
        console.error('復号に失敗しました:', err);
        return false;
      }
    }
  };

  // データ初期化
  const handleResetData = () => {
    localStorage.clear();
    setMemos(loadStoredMemos());
    setFolders(loadStoredFolders());
    setCurrentFolderId('ALL');
    setSelectedMemoId(null);
  };

  // データインポート
  const handleImportData = (newMemos: Memo[], newFolders: Folder[]) => {
    setMemos(newMemos);
    setFolders(newFolders);
    setCurrentFolderId('ALL');
    setSelectedMemoId(null);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 dark:bg-slate-950 font-sans">
      {/* サイドバー */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        folders={folders}
        currentFolderId={currentFolderId}
        onSelectFolder={(id) => {
          setCurrentFolderId(id);
          setSelectedMemoId(null);
        }}
        onCreateFolder={handleCreateFolder}
        onDeleteFolder={handleDeleteFolder}
        memoCounts={memoCounts}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* メインエリア */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <Header
          onOpenSidebar={() => setIsSidebarOpen(true)}
          folderTitle={currentFolderTitle}
          folderColor={currentFolder?.color}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          theme={theme}
          onToggleTheme={handleToggleTheme}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />

        {/* コンテンツエリア (メモ一覧 または メモエディタの画面切り替え) */}
        <main className="flex-1 overflow-hidden relative">
          {selectedMemoId && currentMemo ? (
            /* メモエディタ（全画面表示） */
            <MemoEditor
              memo={currentMemo}
              folders={folders}
              onUpdate={handleUpdateMemo}
              onClose={() => setSelectedMemoId(null)}
              onRequestLockToggle={handleRequestLockToggle}
              onDelete={() => handleDeleteMemo(currentMemo.id)}
            />
          ) : (
            /* メモ一覧（全画面表示） */
            <div className="w-full h-full flex flex-col overflow-hidden">
              <MemoList
                memos={filteredMemos}
                folders={folders}
                selectedMemoId={selectedMemoId}
                onSelectMemo={handleSelectMemo}
                onTogglePin={handleTogglePin}
                onDeleteMemo={handleDeleteMemo}
                onCreateMemo={handleCreateMemo}
                searchQuery={searchQuery}
              />
            </div>
          )}
        </main>

        {/* 右下の新規メモ作成フローティングボタン (一覧表示時のみ表示) */}
        {!selectedMemoId && <FabButton onClick={handleCreateMemo} />}
      </div>

      {/* PIN入力 / ロック設定モーダル */}
      <PinModal
        isOpen={pinModalConfig.isOpen}
        mode={pinModalConfig.mode}
        memoTitle={memos.find(m => m.id === pinModalConfig.memoId)?.title}
        onClose={() => setPinModalConfig({ isOpen: false, mode: 'unlock', memoId: null })}
        onSubmit={handlePinSubmit}
      />

      {/* 設定・バックアップモーダル */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        theme={theme}
        onThemeChange={setTheme}
        memos={memos}
        folders={folders}
        onImportData={handleImportData}
        onResetData={handleResetData}
      />
    </div>
  );
};

export default App;
