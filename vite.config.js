import { defineConfig } from 'vite';
import { generateIndex } from './generate-index.mjs';

export default defineConfig({
  plugins: [
    {
      name: 'index-generator',

      // サーバー起動時・ビルド開始時に実行
      buildStart() {
        generateIndex();
      },

      // 開発サーバーでの監視設定
      configureServer(server) {
        let timer = null;

        // 生成処理をまとめる関数（デバウンス）
        const debouncedGenerate = () => {
          // すでにタイマーが動いていたらキャンセルする
          if (timer) clearTimeout(timer);

          // 300ミリ秒後に実行する予約を入れる
          timer = setTimeout(() => {
            generateIndex();
            // Viteのターミナルにログを出力
            server.config.logger.info('  \x1b[32m➜\x1b[0m  index.html generated', { timestamp: true });
            
            // 生成された index.html をブラウザに反映させる（フルリロード）
            server.ws.send({ type: 'full-reload' });
            
            timer = null;
          }, 300);
        };

        // ファイルやディレクトリの変化をまとめて監視
        const watcherEvents = ['add', 'unlink', 'addDir', 'unlinkDir'];
        for (const eventName of watcherEvents) {
          server.watcher.on(eventName, debouncedGenerate);
        }
      },
    },
  ],
});
