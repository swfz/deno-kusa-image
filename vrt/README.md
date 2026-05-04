# Playwright test

本VRTで確認する項目はGitHub APIへのリクエストパラメータなどは問題ない前提で、描画部分で問題がないかどうか確認するためのテスト

GitHub APIへのリクエストURLを環境変数により切り替え（CI=trueでlocalhostへのアクセス）

localhostのAPIはjson-serverで用意

ユーザーパラメータにより返すレスポンスを切り替え

## スナップショット再生成

スナップショットは `*-linux.png` で保存されているため、macOSローカルでは生成できない。
描画ロジックや`@playwright/test`の更新で差分が出た場合、Docker経由で再生成する。

```
./vrt/update-snapshots.sh
```

内部で`mcr.microsoft.com/playwright:v<バージョン>-jammy`イメージを使い、Deno + json-server + playwright test --update-snapshots を一括実行する。
