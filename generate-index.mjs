import fs from 'fs'; // ファイル操作用モジュール
import path from 'path'; // ファイルパス計算用モジュール
import { fileURLToPath } from 'url'; // ファイルのURLをパスに変換するモジュール

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

// 自然順ソートを行う関数
function naturalSort(a, b) {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
}

// フォルダの中身を調べてHTMLリストを作成する関数
function walk(dir, depth = 0) {
  // 引数dirで指定したフォルダ内のファイル・フォルダの一覧を取得
  const allItems = fs.readdirSync(dir);
  
  // ファイル・フォルダの一覧から「除外リストに含まれていない」かつ「ドットで始まらない」ものだけを採用
  const items = allItems.filter(
    (item) => !CONFIG.ignoreList.includes(item) && !item.startsWith('.')
  );

  // フォルダとファイルに分け、それぞれ名前順に並び替える
  const dirs = [];
  const files = [];

  for (const name of items) {
    const fullPath = path.join(dir, name);
    if (fs.statSync(fullPath).isDirectory()) {
      dirs.push(name);
    } else {
      const ext = path.extname(name).slice(1);
      if (CONFIG.allowedExtensions.includes(ext)) {
        files.push(name);
      }
    }
  }

  dirs.sort(naturalSort);
  files.sort(naturalSort);

  // ルートフォルダの中身は表示し、それ以外のフォルダの中身は隠すようにする
  let result = (depth === 0) ? '<ul>' : '<ul hidden>';

  // フォルダのHTMLを作成
  for (const folderName of dirs) {
    const fullPath = path.join(dir, folderName);
    result += `<li class="dir">`;
    result += `  <button class="dir-name" aria-expanded="false">`;
    result += `    <span class="arrow"></span>${folderName}`;
    result += `  </button>`;
    result += walk(fullPath, depth + 1);
    result += `</li>`;
  }

  // ファイルのHTMLを作成
  for (const fileName of files) {
    const fullPath = path.join(dir, fileName);

    // Windowsの「\」を「/」に変換し、先頭の「./」を消してブラウザ用パスを作る
    const webPath = fullPath.split(path.sep).join('/').replace(/^\.\//, '');
    // ファイル拡張子を取得
    const extension = path.extname(fileName).slice(1);

    if (extension === 'html') {
      // HTMLファイルをクリックするとそのページに飛べるようにする
      result += `<li class="file"><a class="file-html" href="/${webPath}">${fileName}</a></li>`;
    } else {
      // CSSやJSはファイル名だけ表示する
      result += `<li class="file"><span class="file-name file-${extension}">${fileName}</span></li>`;
    }
  }

  result += '</ul>';
  return result;
}

// 完成したHTMLをファイルとして書き出す処理
export function generateIndex() {
  const htmlContent = `
<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${CONFIG.title}</title>
    <link rel="stylesheet" href="${CONFIG.stylePath}">
  </head>
  <body>
    <div class="container">
      <h1>${CONFIG.title}</h1>
      ${walk(CONFIG.root)}
    </div>
    <script>
      // フォルダ名の要素をすべて取得
      const buttons = document.querySelectorAll('.dir-name');
      
      // 各フォルダ名の要素にクリックイベントを追加
      for (let i = 0; i < buttons.length; i++) {
        const btn = buttons[i];
        
        btn.addEventListener('click', function() {
          // 開閉状態を確認
          const isExpanded = btn.getAttribute('aria-expanded') === 'true';
          
          // 開閉状態を切り替える
          btn.setAttribute('aria-expanded', String(!isExpanded));
          
          // フォルダ内の要素を表示もしくは非表示にする
          const subList = btn.nextElementSibling;
          if (subList) {
            subList.hidden = isExpanded;
          }
        });
      }
    </script>
  </body>
</html>
`.trim();

  fs.writeFileSync(CONFIG.outputHtml, htmlContent);
}

// node で直接実行したときだけの処理
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  generateIndex();
}
