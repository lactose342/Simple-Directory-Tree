# Simple-Directory-Tree

Vite プロジェクトのルートに、ファイル一覧ページ（`index.html`）を自動生成するスクリプトです。

## 背景

HTML/CSS/JavaScript を教える際、これまでは VSCode 拡張の **Live Server** を使ってローカルサーバーを立てていましたが、脆弱性が報告されたため、代替手段として **Vite** を採用することにしました。しかし、Viteを利用する際に以下の課題が考えられました。

- **プロジェクトを分ける場合**：課題ごとに `npm create vite` からセットアップする手間がかかる
- **1つのプロジェクトにまとめる場合**：ターミナルでルートに移動してサーバーを起動しても、目的のファイルを開くには URL を直打ちしなければならず手間がかかる

このスクリプトは後者の構成を前提に、URL 直打ち問題を解決するために作成しました。プロジェクト内の HTML ファイルを一覧表示し、クリック一つで目的のページに飛べるため、学習者にとっても教える側にとってもわかりやすくなります。

## 機能

- プロジェクト内の `.html` / `.css` / `.js` ファイルを再帰的に一覧表示
- ディレクトリ → ファイルの順に自然順ソート
- ディレクトリはアコーディオンで開閉可能
- `node_modules` と隠しファイル（`.`始まり）は除外

## 使い方

### 前提

- Node.js がインストールされていること

### セットアップ

以下の 4 ファイル(gitで管理するなら.gitignoreも)をプロジェクトのルートに配置します。

```
your-project/
├── generate-index.mjs
├── vite.config.js
├── style.css
├── package.json
└── ...
```

### 依存パッケージのインストール(初回使用時のみ)

```bash
npm install
```

### 開発サーバーの起動

```bash
npm run dev
```

Vite の起動と同時にインデックスページが生成されます。ブラウザで `http://localhost:5173` を開くと一覧ページが表示されます。

### フォルダの追加

ルート直下に `projects/` （または `src/` ）などのディレクトリを設け、その中に個別のプロジェクトフォルダを配置するとコードが管理しやすくなると思います。

```
your-project/
└── projects
    ├── practice1
    ├── practice2
    └── ...
```

### ファイル・フォルダを追加・削除したときの動作

Vite が変更を検知し、`index.html` を自動で再生成します。再生成が完了すると、 Viteのターミナルにログが出力されます。

## 設定のカスタマイズ

`generate-index.mjs` 内の `CONFIG` を書き換えることで各種設定を変更できます。

```javascript
const CONFIG = {
  root: './',                 // 生成対象のルートフォルダ
  outputHtml: './index.html', // 生成するHTMLファイルのパス
  stylePath: '/style.css',    // 使用するCSSファイルのパス
  ignoreList: [               // 非表示にする「裏方ファイル」のリスト
    'node_modules',
    'package.json',
    'package-lock.json',
    'vite.config.js',
    'generate-index.mjs',
    'README.md',
  ],
  allowedExtensions: [         // 表示するファイルの拡張子リスト
    'html', 'css', 'js'
  ],
  title: 'ファイル一覧',        // 生成するHTMLのタイトル
};
```

また、 `style.css` に　`.file-name.file-[拡張子]::before` と `.file-name.file-[拡張子]` を追記することでスタイルを設定できます。

## ファイル構成

| ファイル | 役割 |
|---|---|
| `generate-index.mjs` | 一覧ページを生成するスクリプト本体 |
| `vite.config.js` | Vite プラグインとしてスクリプトを組み込む設定 |
| `style.css` | 生成された `index.html` 用のスタイル |
| `package.json` | 依存関係と起動スクリプト |
| `.gitignore` | Git 除外設定 |
| `index.html` | 生成物（`.gitignore` で除外済み） |
