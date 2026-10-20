# Ami — Codex引き継ぎパッケージ

現在承認されている美容室サイトの完成版です。新規デザインの参考素材ではなく、動作する実装そのものです。

## 最初に

1. ZIPを展開し、このフォルダをCodexのプロジェクトとして開きます。
2. `CODEX_HANDOFF.md` の指示文をCodexに渡してください。
3. 承認済みの内容・デザインを維持し、表示確認とGitHub登録・GitHub Pages公開を進めてください。

## 内容

- `dist/`: HTML・CSS・JavaScript・画像・SVGを含む完成版サイト
- `.agents/skills/ui-ux-pro-max/`: 導入済みのUI UX Pro Maxスキルと検索データ（上流のMITライセンスを同梱）
- `AGENTS.md`: ブランドと実装上の維持事項
- `CODEX_HANDOFF.md`: 次のCodexに渡す作業指示
- `tests/`: 診断・料金・デモ予約の操作チェック
- `.github/workflows/deploy-pages.yml`: `dist/` をGitHub Pagesへ公開するワークフロー

認証情報、元のGit履歴、ホスティングサービスの内部設定、node_modulesは含めていません。

## ローカル表示

ビルドは不要です。Python 3があれば以下で表示できます。

```bash
python3 -m http.server 8000 --directory dist
```

`http://localhost:8000` を開いてください。Windowsで `python3` が使えない場合は `python` に置き換えます。

## 動作確認

サイト表示自体にNode.jsやnpmは不要です。テストを実行する場合のみNode.js 22.12以降とnpmを使います。

```bash
npm install
npm test
```

3つのテストスイートはDOM上の動作チェックです。スマホ・PCでの描画品質の検証を代替するものではありません。引き継ぎ元では実機ブラウザでの表示確認は未実施です。

## 公開

GitHubにリポジトリを作成し、このフォルダの内容を `main` へpushします。GitHubの Settings → Pages → Build and deployment で **GitHub Actions** を選ぶと、同梱ワークフローから公開できます。必要に応じてActions画面から `Deploy Ami to GitHub Pages` を手動実行してください。

新規リポジトリ作成・Pages設定には、GitHub側で対応する権限のある認証が必要です。過去の実行環境では、既存リポジトリへの書き込み権限はありましたが、新規作成は403で拒否されました。新しい環境では現在の認証を確認し、過去と同じ制約があると決めつけないでください。

## デモについて

店舗名・営業時間・料金・スタッフ・所在地はデモ用の仮設定です。写真はAI生成のイメージ、背景SVGはこのサイト用の装飾です。予約・決済・メール送信は行わず、入力内容を外部送信・永続保存しません。
