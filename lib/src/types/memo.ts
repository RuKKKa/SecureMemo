export interface Folder {
  id: string;
  name: string;
  color?: string;
  createdAt: number;
}

export interface Memo {
  id: string;
  title: string;
  content: string; // ロック時は空、または復号された内容（メモリ上）
  folderId: string | null; // null: 未分類
  isLocked: boolean;
  encryptedContent?: string; // ロック時のAES-GCM暗号化データ (base64)
  iv?: string; // AES-GCM IV (base64)
  pinSalt?: string; // PINハッシュ & 鍵導出用ソルト
  pinHash?: string; // PIN検証用ハッシュ
  isPinned?: boolean;
  createdAt: number;
  updatedAt: number;
}

export type ThemeMode = 'light' | 'dark' | 'system';
