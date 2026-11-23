import type { Folder, Memo, ThemeMode } from '../types/memo';

const STORAGE_KEYS = {
  MEMOS: 'secure_memo_memos_v1',
  FOLDERS: 'secure_memo_folders_v1',
  THEME: 'secure_memo_theme_v1',
};

// 初期サンプルデータ（Markdown記法を活用）
const INITIAL_FOLDERS: Folder[] = [
  { id: 'f-work', name: '仕事・プロジェクト', color: '#2563eb', createdAt: Date.now() - 86400000 * 5 },
  { id: 'f-private', name: 'プライベート', color: '#0ea5e9', createdAt: Date.now() - 86400000 * 4 },
  { id: 'f-ideas', name: 'アイデア・備忘録', color: '#6366f1', createdAt: Date.now() - 86400000 * 3 },
];

const INITIAL_MEMOS: Memo[] = [
  {
    id: 'memo-welcome',
    title: 'ロック機能付きメモアプリへようこそ！',
    content: `# SecureMemoへようこそ 📝\n\nこのアプリは、**太字**や*斜体*、箇条書きやチェックリストなどの**多彩な書式**に対応したセキュアなWebメモです。\n\n## 💡 便利な書式機能\n- **太字** (\`**太字**\`) や *斜体* (\`*斜体*\`)\n- 箇条書きリスト & 番号付きリスト\n- [x] チェックリスト機能（タスク管理に便利）\n- [ ] 未完了タスク\n- > 引用ブロックの活用\n\n上部ツールバーのボタンからワンタップで挿入でき、「プレビュー」タブで仕上がりを即座に確認できます！`,
    folderId: 'f-ideas',
    isLocked: false,
    isPinned: true,
    createdAt: Date.now() - 3600000 * 2,
    updatedAt: Date.now() - 3600000 * 2,
  },
  {
    id: 'memo-security',
    title: '🔒 ロック機能の使い方・仕様について',
    content: `## 暗号化ロックの仕組み\n\n1. メモ右上の**ロック**アイコンをタップ\n2. 4桁以上のPINコードを設定\n3. Web標準の \`AES-GCM 256bit\` で本文を強力に暗号化\n\n> **ポイント**: 暗号化されたメモは、一覧でもプレビューが隠され、正しいPINを入力するまで誰にも見られません。`,
    folderId: 'f-work',
    isLocked: false,
    isPinned: false,
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now() - 86400000,
  },
];

/**
 * ローカルストレージからメモ一覧を取得します。
 * 初回アクセス時やデータが存在しない場合は、サンプルの初期メモデータを保存して返却します。
 * 読み込みに失敗した場合は初期メモデータをフォールバックとして返します。
 * 
 * @returns {Memo[]} 取得したメモの配列
 */
export function loadStoredMemos(): Memo[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MEMOS);
    if (!raw) {
      saveStoredMemos(INITIAL_MEMOS);
      return INITIAL_MEMOS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load memos from localStorage:', e);
    return INITIAL_MEMOS;
  }
}

/**
 * メモ一覧をローカルストレージにJSON形式で保存します。
 * 
 * @param {Memo[]} memos 保存対象のメモ配列
 */
export function saveStoredMemos(memos: Memo[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.MEMOS, JSON.stringify(memos));
  } catch (e) {
    console.error('Failed to save memos to localStorage:', e);
  }
}

/**
 * ローカルストレージからフォルダー一覧を取得します。
 * 初回アクセス時やデータが存在しない場合は、サンプルの初期フォルダーデータを保存して返却します。
 * 読み込みに失敗した場合は初期フォルダーデータをフォールバックとして返します。
 * 
 * @returns {Folder[]} 取得したフォルダーの配列
 */
export function loadStoredFolders(): Folder[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.FOLDERS);
    if (!raw) {
      saveStoredFolders(INITIAL_FOLDERS);
      return INITIAL_FOLDERS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load folders from localStorage:', e);
    return INITIAL_FOLDERS;
  }
}

/**
 * フォルダー一覧をローカルストレージにJSON形式で保存します。
 * 
 * @param {Folder[]} folders 保存対象のフォルダー配列
 */
export function saveStoredFolders(folders: Folder[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.FOLDERS, JSON.stringify(folders));
  } catch (e) {
    console.error('Failed to save folders to localStorage:', e);
  }
}

/**
 * ローカルストレージから保存されているテーマ設定（'light' | 'dark' | 'system'）を取得します。
 * 設定が存在しない場合や取得に失敗した場合は、デフォルトの 'system' を返却します。
 * 
 * @returns {ThemeMode} テーマ設定値
 */
export function loadStoredTheme(): ThemeMode {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.THEME) as ThemeMode | null;
    return raw || 'system';
  } catch {
    return 'system';
  }
}

/**
 * テーマ設定（'light' | 'dark' | 'system'）をローカルストレージに保存します。
 * 
 * @param {ThemeMode} theme 保存するテーマ設定値
 */
export function saveStoredTheme(theme: ThemeMode) {
  try {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  } catch (e) {
    console.error('Failed to save theme to localStorage:', e);
  }
}
