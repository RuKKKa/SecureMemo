# SecureMemo - セキュアWebメモアプリ

青色を基調とした、モダンで洗練されたレスポンシブWebメモアプリケーションです。  
ブラウザのWeb Crypto APIを活用した強固なAES-GCM暗号化ロック機能、見たまま装飾できるWYSIWYGリッチテキストエディタ、フォルダ分類機能、ダークモード、画面切り替え型のフルビューUIを標準搭載しています。

---

## 📁 フォルダ構成

本プロジェクトは以下の構成に整理されています：
- **`docs/`**: アプリ機能仕様書やアーキテクチャ設計書などの文書
- **`lib/assets/`**: 画像・CSSなどの静的アセットデータ
- **`lib/src/`**: アプリケーション本体のソースコード
## 🛠 開発事前準備

以下の手順でローカル開発環境を構築できます。

1. **Node.js (v24) と npm** をインストール
   - 推奨: <https://nodejs.org/> から LTS 版を取得

2. **依存パッケージのインストール**
   ```bash
   npm install
   ```

3. **husky のセットアップ（Git フック）**
   ```bash
   npm run prepare   # `husky install` が走ります
   ```

4. **ESLint のローカル検証**
   ```bash
   npm run lint               # Lint
   ```

5. **開発サーバー起動**
   ```bash
   npm run dev
   ```

これで `http://localhost:5173/` にアクセスしてアプリを確認できます。
- **`dist/`**: ビルド成果物（本番デプロイ用、`npm run build` で自動生成）

```text
secure-memo-app/
├── docs/                     # 各種仕様書・設計ドキュメント
│   ├── features.md           # アプリ機能仕様書
│   └── architecture.md       # 詳細アーキテクチャ設計書
├── test/                     # ユニットテストコード
│   ├── crypto.test.ts        # 暗号化・ハッシュ化テスト
│   └── storage.test.ts       # ストレージ入出力テスト
├── lib/
│   ├── assets/               # 画像・CSSなどのデータ
│   │   ├── index.css         # スタイル定義
│   │   └── memo-icon.svg     # アプリアイコン
│   └── src/                  # 作成物のコード
│       ├── components/       # UIコンポーネント群
│       ├── types/            # 型定義
│       ├── utils/            # 暗号化 & ストレージロジック
│       ├── App.tsx           # メインアプリ
│       ├── main.tsx          # エントリーポイント
│       └── vite-env.d.ts     # Vite型定義
├── index.html                # ルートHTML
├── package.json              # パッケージ設定
├── tsconfig.json             # TypeScript設定
├── vite.config.ts            # Vite設定
├── tailwind.config.js        # Tailwind CSS設定
├── jest.config.cjs           # Jestテスト設定
└── .gitignore                # Git除外設定
```

---

## 🌟 アプリ機能の概要

各機能の詳細な仕様や操作方法については **[docs/features.md](docs/features.md)** をご覧ください。

1. **リッチテキストメモ管理 (WYSIWYG & CRUD)**
   - 見たまま装飾（太字・斜体・下線・見出し・箇条書き・番号付きリスト・引用）
   - ショートカットキー対応 (`Ctrl + B`, `Ctrl + I`, `Ctrl + U`)
   - リアルタイム自動保存、更新日時の自動記録
   - 一覧カードでの装飾プレビュー
   - キーワードリアルタイムインクリメンタル検索、ピン留め固定機能

2. **フォルダ分類機能**
   - フォルダ作成（カラーラベル選択）、名前変更、削除
   - メモの所属フォルダ変更、サイドバーによるフォルダ絞り込み

3. **PINコードによる暗号化ロック**
   - Web Crypto API (`AES-GCM 256bit` + `PBKDF2 100,000回ストレッチング`)
   - ロック中のメモの本文秘匿・暗号化保護バッジ表示
   - スマホ向けオンスクリーンキーパッド & PC向けキーボード入力・Enter決定の最適化

4. **洗練されたUI & レスポンシブ設計**
   - 一覧とエディタを画面横並びにしない全画面切り替え（単一ビュー）
   - 青色基調のクリーンなデザイン & ダークモード対応
   - モバイル向けドロワーサイドバー & 新規作成FABボタン
   - JSONバックアップ（エクスポート & インポート）

---

## 🚀 起動方法

### 開発サーバーの起動
```bash
cd secure-memo-app
npm run dev
```

ターミナルに表示されるURL（例: `http://localhost:5173/`）をブラウザで開いてご利用いただけます。

### プロダクションビルド
```bash
npm run build
```
ビルド成果物は `dist/` フォルダに出力されます。

### テストの実行 (Jest)
```bash
npm run test
```
Jest + ts-jest により `test/` 配下のユニットテスト全16項目を実行します。

---

## 🛠 技術スタック
- **Language**: TypeScript
- **Framework**: React 18 + Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Cryptography**: Web Crypto API (SubtleCrypto: PBKDF2, AES-GCM, SHA-256)
- **Storage**: LocalStorage (クライアントサイド完結)

---

## 📚 ドキュメント一覧
詳細な仕様や設計については `docs/` フォルダ内の以下のドキュメントをご覧ください：
- **[アプリ機能仕様書 (docs/features.md)](docs/features.md)**: 各機能の詳細仕様・ショートカット・セキュリティ機能の解説
- **[フォルダ構成 & アーキテクチャ解説 (docs/architecture.md)](docs/architecture.md)**: ディレクトリ構成と各レイヤー・コンポーネントの責務解説
