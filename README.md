# Sample Site

18件のサンプルサイト・ブラウザゲームを、1つのリポジトリで管理します。

**公開URL:** https://kenkenta51-max.github.io/SAMPLE-site/

## サイトを更新する

1. `sites/<サイト名>/` のHTML・CSS・JavaScript・画像を編集します。
2. `python3 scripts/build.py` で公開用ファイルを生成します。
3. `python3 scripts/audit.py` で内部リンク・画像などの参照先を検査します。
4. `main` にpushするとGitHub Actionsがビルド・検査・GitHub Pagesへの公開を行います。

Python 3.12以降を推奨します。外部パッケージやnpmのインストールは不要です。

## 構成

- `sites/`: サイト別の制作ファイル。元のREADME・制作資料・設定も保存しています。
- `sites.json`: サイト一覧、移行元リポジトリ、コピー時点のコミット、旧公開URL。
- `web/index.html`: サイト一覧ページのテンプレート。
- `scripts/build.py`: 公開用ファイルの生成。
- `scripts/audit.py`: 公開用HTML・CSSのローカル参照先検査。
- `.github/workflows/pages.yml`: ビルド・検査・公開の自動処理。
- `dist/`: 自動生成される公開用ファイル。Gitには登録しません。

`sites/` 内に残した旧 `.github/workflows/` は資料として保存したもので、自動実行されません。各サイトの旧READMEに記載されたURL・公開手順より、このREADMEを優先してください。

## ローカルプレビュー

```sh
python3 scripts/build.py
python3 scripts/audit.py
mkdir -p .preview
ln -s ../dist .preview/SAMPLE-site
python3 -m http.server 8000 --directory .preview
```

http://localhost:8000/SAMPLE-site/ を開きます。2回目以降、シンボリックリンクの作成は不要です。`.preview/` はGitの対象外です。

## 公開設定

GitHubの Settings → Pages → Build and deployment → Source で **GitHub Actions** を選択します。公開ワークフローを実行すると、一覧ページと全18サイトが1つのPagesサイトとして公開されます。

サイトの公開URLは `https://kenkenta51-max.github.io/SAMPLE-site/sites/<サイト名>/` です。

Amiは `sites/ami-hair-atelier/dist/` を公開対象にし、診断・料金計算・デモ予約を含む完成済みファイルをそのまま使います。

KURAHAUSは既存の公開用ビルドを再利用し、新しいURLに合わせてリンク・canonical・サイトマップを生成します。架空サイトの注記とデモフォームの挙動を保っています。PINK CRATERとVOID DEPT.には、検証で見つかった表示・操作上の不具合を各1か所修正しています。詳細は `MIGRATION.md` を参照してください。

## 移行の範囲

HTML中心の16件を対象とし、Vite製の `hair-shindan`・`monster-trail`、Next.js製の `hokuriku-seimitsu-techno` は含みません。

元リポジトリのファイルをコピーしたスナップショットです。過去のGit履歴・Issue・PRは統合していません。元のリポジトリ・既存公開サイトは変更・削除していません。

元リポジトリ名が `-` のサイトは、管理しやすいよう `sites/ao-works/` に配置しています。`hoshi-catch-game` は移行元がアーカイブ済みですが、読み取り・コピーには問題ありません。

## 新しいサイトを追加する

`sites/` にサイトフォルダを追加し、`sites.json` に情報を追記してください。ルート相対URLや専用ビルドを使うサイトは、公開パスへの対応を先に行ってください。一覧ページの件数表記も更新します。

## 検証

実施結果・残っている制約は `MIGRATION.md` に記載します。

## MIRAI CODE LABの追加

`sites/mirai-code-lab/` に完成版LPを追加しています。FV・01〜09の全セクション、FAQ、動作デモ、体験案内を含みます。予約送信は行いません。

公開URL: https://kenkenta51-max.github.io/SAMPLE-site/sites/mirai-code-lab/

04〜09のデザイン案は`designs.html`から確認できます。画像6枚のZIPはビルド時に生成します。

## FLOAT WASHの追加

`sites/float-wash/` に、宇宙をテーマにした架空のコインランドリーの完成版を追加しています。スクロールに連動するFV、タップでの自動演出、洗濯コースのデモ、FAQ、料金の試算を含みます。写真・CSS・JavaScriptを1つのHTMLに内包しています。実際の予約・決済は行いません。

公開URL: https://kenkenta51-max.github.io/SAMPLE-site/sites/float-wash/
