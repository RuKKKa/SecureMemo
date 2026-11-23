# プロジェクト構成 & アーキテクチャ解説

本書では、`secure-memo-app` のディレクトリ構成、各ファイルの責務、および内部アーキテクチャについて解説します。

---

## 📁 ディレクトリ構造

本プロジェクトは以下の主要ディレクトリで構成されています：
- **`docs/`**: 設計書や機能仕様書などの文書ファイル
- **`lib/assets/`**: 画像・CSS・アイコンなどの静的アセットデータ
- **`lib/src/`**: アプリケーション本体のソースコード
- **`dist/`**: ビルド成果物（`npm run build` 出力先）

```text
secure-memo-app/
├── index.html                # アプリケーションのエントリーポイントHTML
├── package.json              # 依存ライブラリおよび実行スクリプトの定義
├── tsconfig.json             # TypeScriptのコンパイラ設定
├── vite.config.ts            # Viteバンドラーの設定
├── tailwind.config.js        # 青色テーマやダークモードのTailwind CSS設定
├── postcss.config.js         # PostCSS（Tailwind/Autoprefixer）設定
├── jest.config.cjs           # Jestテストランナー設定
├── .gitignore                # Gitバージョン管理除外設定
│
├── docs/                     # 各種仕様書・設計ドキュメント
│   ├── features.md           # アプリ機能仕様書
│   └── architecture.md       # 本書（フォルダ構成 & アーキテクチャ解説）
│
├── test/                     # ユニットテストコード
│   ├── crypto.test.ts        # 暗号化・復号・ハッシュ化のテスト
│   └── storage.test.ts       # LocalStorage操作・初期化のテスト
│
├── lib/
│   ├── assets/               # 画像・CSSなどのデータ
│   │   ├── index.css         # Tailwindディレクティブ・基本スタイル定義
│   │   └── memo-icon.svg     # アプリのファビコン・ロゴアイコン
│   │
│   └── src/                  # 作成物のコード
│       ├── main.tsx          # Reactルートコンポーネントのマウント処理
│       ├── App.tsx           # アプリ全体のステート管理 & 画面切り替え制御
│       ├── vite-env.d.ts     # Vite型定義
│       │
│       ├── types/
│       │   └── memo.ts       # Memo, Folder, ThemeMode などの型定義
│       │
│       ├── utils/
│       │   ├── crypto.ts     # Web Crypto APIを用いた暗号化・復号・ハッシュ化処理
│       │   └── storage.ts    # LocalStorage同期・初期サンプルデータ・バックアップ処理
│       │
│       └── components/
│           ├── Sidebar.tsx   # フォルダ一覧・新規作成・ダークモード・設定のサイドバー
│           ├── Header.tsx    # 検索バー・モバイルメニュー・テーマ切替のヘッダー
│           ├── MemoList.tsx  # メモ一覧表示コンポーネント（ピン留め・通常メモの分別）
│           ├── MemoCard.tsx  # 各メモのカード表示（リッチ装飾プレビュー・ロック状態・タグ）
│           ├── MemoEditor.tsx # 見たまま編集（WYSIWYG）リッチテキストエディタ
│           ├── MarkdownRenderer.tsx # Markdown/リッチテキストの安全なHTML変換
│           ├── PinModal.tsx  # PINコード入力・設定用モーダル（スマホ用キーパッド & PCキーボード入力対応）
│           ├── FabButton.tsx # 画面右下に固定配置される新規メモ作成ボタン（FAB）
│           └── SettingsModal.tsx # テーマ設定・JSONバックアップ・復元モーダル
```

---

## 🔍 各レイヤーとファイルの責務

### 1. 文書層 (`docs/`)
- **`features.md`**: 各機能の詳細仕様書、装飾コマンド、セキュリティ要件。
- **`architecture.md`**: アプリケーションの全体設計、ディレクトリ構成、各モジュールの責務を定義したドキュメント。

### 2. アセット層 (`lib/assets/`)
- **`index.css`**: Tailwind CSSの基本ディレクティブ、カスタムスクロールバー、ベーステーマ設定。
- **`memo-icon.svg`**: アプリケーションのロゴおよびファビコン画像。

### 3. ソースコード層 (`lib/src/`)
#### ① 型定義層 (`lib/src/types/`)
- **`memo.ts`**: メモデータ、フォルダ構造、テーマモードの型定義。

#### ② ロジック・暗号化・永続化層 (`lib/src/utils/`)
- **`crypto.ts`**: Web Crypto API (`AES-GCM 256bit` + `PBKDF2 100,000回`) によるクライアントサイド暗号化・復号・PIN検証。
- **`storage.ts`**: `localStorage` への同期・初期サンプルデータ投入・JSONインポート/エクスポート。

#### ③ UIコンポーネント層 (`lib/src/components/`)
- **`Sidebar.tsx`**: フォルダの切り替え・新規作成・削除、ダークモード切替、設定ドロワー。
- **`Header.tsx`**: インクリメンタルリアルタイム検索バー、テーマ切替トグル。
- **`MemoList.tsx`**: 画面幅いっぱいに展開するメモカード一覧。
- **`MemoCard.tsx`**: 太字やリストなどのリッチ装飾プレビュー、ロック時の伏字保護。
- **`MemoEditor.tsx`**: 見たまま装飾（WYSIWYG）リッチエディタ。全画面切り替え対応。
- **`PinModal.tsx`**: テンキー・キーボード対応のPIN設定・解除モーダル。
- **`FabButton.tsx`**: 一覧画面右下に常駐する新規作成フローティングアクションボタン。
- **`SettingsModal.tsx`**: 外観テーマ設定、JSONバックアップ・復元、初期化モーダル。

#### ④ アプリケーション統合層 (`lib/src/`)
- **`App.tsx`**: メモ一覧とエディタの全画面切り替え制御、ステート一元管理。
- **`main.tsx`**: Reactアプリケーションのエントリーポイント。
