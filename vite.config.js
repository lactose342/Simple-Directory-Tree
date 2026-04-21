import { generateIndex } from './generate-index.mjs';

export default {
  plugins: [
    {
      name: 'index-generator',
      buildStart() {
        generateIndex(); // 起動時に1回生成
      },
      configureServer(server) {
        // ファイルの追加・削除を監視
        server.watcher.on('add',    () => generateIndex());
        server.watcher.on('unlink', () => generateIndex());

        // ディレクトリの追加・削除を監視
        server.watcher.on('addDir',    () => generateIndex());
        server.watcher.on('unlinkDir', () => generateIndex());
      },
    },
  ],
};
