// 必要なモジュールの読み込み
import fs from 'fs'; // ファイルを操作用モジュール
import path from 'path'; // ファイルパス計算用モジュール

// 基準となるフォルダのパスを指定
const root = './';

// 自然順ソートを行う関数
function naturalSort(a, b) {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
}

// フォルダの中身を調べてHTMLリストを作成する関数
function walk(dir, depth = 0) {
  // 引数dirで指定したフォルダ内のファイル・フォルダの一覧を取得
  const allItems = fs.readdirSync(dir);
  
  // ファイル・フォルダの一覧からnode_modulesと隠しファイルを除外
  const items = [];
  for (let i = 0; i < allItems.length; i++) {
    const item = allItems[i];
    if (item !== 'node_modules' && !item.startsWith('.')) {
      items.push(item);
    }
  }

  // フォルダとファイルに分け、それぞれ名前順に並び替える
  const dirs = [];
  const files = [];

  for (let i = 0; i < items.length; i++) {
    const name = items[i];
    const fullPath = path.join(dir, name);
    
    if (fs.statSync(fullPath).isDirectory()) {
      dirs.push(name);
    } else {
      files.push(name);
    }
  }

  dirs.sort(naturalSort);
  files.sort(naturalSort);

  // ルートフォルダの中身は表示し、それ以外のフォルダの中身は隠すようにする
  let result = (depth === 0) ? '<ul>' : '<ul hidden>';

  // フォルダのHTMLを作成
  for (let i = 0; i < dirs.length; i++) {
    const folderName = dirs[i];
    const fullPath = path.join(dir, folderName);
    
    result += '<li class="dir">';
    result += '  <button class="dir-name" aria-expanded="false">';
    result += '    <span class="arrow"></span>' + folderName;
    result += '  </button>';
    result += walk(fullPath, depth + 1); // 再帰的にサブフォルダのHTMLを作成
    result += '</li>';
  }

  // ファイルのHTMLを作成
  for (let i = 0; i < files.length; i++) {
    const fileName = files[i];
    const fullPath = path.join(dir, fileName);

    const relativePath = fullPath.replace('./', '');
    const extension = path.extname(fileName).slice(1); // 拡張子を取得

    if (extension === 'html') {
      // HTMLファイルをクリックするとそのページに飛べるようにする
      result += '<li class="file"><a class="file-html" href="/' + relativePath + '">' + fileName + '</a></li>';
    } else if (extension === 'css' || extension === 'js') {
      // CSSやJSはファイル名だけ表示する
      result += '<li class="file"><span class="file-name file-' + extension + '">' + fileName + '</span></li>';
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
    <title>ファイル一覧</title>
    <link rel="stylesheet" href="/style.css">
  </head>
  <body>
    <div class="container">
      <h1>ファイル一覧</h1>
      ${walk(root)}
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
`;

  fs.writeFileSync('./index.html', htmlContent.trim());
  fs.copyFileSync('./style.css', path.join(root, 'style.css'));
}

// 直接実行でもindex.htmlを生成する
generateIndex();
