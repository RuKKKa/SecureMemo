import {
  loadStoredMemos,
  saveStoredMemos,
  loadStoredFolders,
  saveStoredFolders,
  loadStoredTheme,
  saveStoredTheme,
} from '../lib/src/utils/storage';
import type { Memo, Folder } from '../lib/src/types/memo';

// Node.js テスト環境用の LocalStorage モック
class LocalStorageMock {
  private store: Map<string, string> = new Map();

  getItem(key: string): string | null {
    return this.store.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.store.set(key, String(value));
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }
}

const mockStorage = new LocalStorageMock();
(globalThis as unknown as { localStorage: LocalStorageMock }).localStorage = mockStorage;

describe('storage utils', () => {
  beforeEach(() => {
    mockStorage.clear();
  });

  describe('memos storage', () => {
    it('初期アクセス時は初期サンプルメモ配列を読み込んで保存すること', () => {
      const memos = loadStoredMemos();
      expect(Array.isArray(memos)).toBe(true);
      expect(memos.length).toBeGreaterThan(0);
      expect(memos[0].id).toBe('memo-welcome');

      const raw = mockStorage.getItem('secure_memo_memos_v1');
      expect(raw).not.toBeNull();
      const parsed = JSON.parse(raw!);
      expect(parsed.length).toBe(memos.length);
    });

    it('保存したメモを正しく読み込めること', () => {
      const customMemos: Memo[] = [
        {
          id: 'test-1',
          title: 'テストタイトル',
          content: 'テスト本文',
          folderId: 'f-ideas',
          isLocked: false,
          isPinned: true,
          createdAt: 1000,
          updatedAt: 2000,
        },
      ];

      saveStoredMemos(customMemos);
      const loaded = loadStoredMemos();

      expect(loaded).toHaveLength(1);
      expect(loaded[0].id).toBe('test-1');
      expect(loaded[0].title).toBe('テストタイトル');
      expect(loaded[0].isPinned).toBe(true);
    });
  });

  describe('folders storage', () => {
    it('初期アクセス時は初期サンプルフォルダ配列を読み込んで保存すること', () => {
      const folders = loadStoredFolders();
      expect(Array.isArray(folders)).toBe(true);
      expect(folders.length).toBeGreaterThan(0);
      expect(folders[0].id).toBe('f-work');

      const raw = mockStorage.getItem('secure_memo_folders_v1');
      expect(raw).not.toBeNull();
      const parsed = JSON.parse(raw!);
      expect(parsed.length).toBe(folders.length);
    });

    it('保存したフォルダを正しく読み込めること', () => {
      const customFolders: Folder[] = [
        {
          id: 'f-custom',
          name: 'カスタムフォルダ',
          color: '#ff0000',
          createdAt: 5000,
        },
      ];

      saveStoredFolders(customFolders);
      const loaded = loadStoredFolders();

      expect(loaded).toHaveLength(1);
      expect(loaded[0].id).toBe('f-custom');
      expect(loaded[0].name).toBe('カスタムフォルダ');
    });
  });

  describe('theme storage', () => {
    it('未設定時はデフォルト値 "system" を返すこと', () => {
      const theme = loadStoredTheme();
      expect(theme).toBe('system');
    });

    it('ダークテーマの保存と読み込みができること', () => {
      saveStoredTheme('dark');
      expect(loadStoredTheme()).toBe('dark');
    });

    it('ライトテーマの保存と読み込みができること', () => {
      saveStoredTheme('light');
      expect(loadStoredTheme()).toBe('light');
    });
  });
});
