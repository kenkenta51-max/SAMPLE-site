# Sample Site

26件のサンプルサイト・ブラウザゲームを、1つのリポジトリで管理します。

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

GitHubの Settings → Pages → Build and deployment → Source で **GitHub Actions** を選択します。公開ワークフローを実行すると、一覧ページと全26サイトが1つのPagesサイトとして公開されます。

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

## Big burger Diner の追加

`sites/big-burger-diner/` に、アメリカンダイナー風のハンバーガー店LPとモバイルオーダーを追加しています。FVはスクロールに合わせて120枚の連番画像（`assets/frames/`）をcanvasで再生し、バーガーが分解・合体します。お店の紹介・味のこだわり・メニュー（サイズ／トッピング／セットのカスタマイズ、カート、注文確認〜完了）・アクセスを含みます。Canvaのメニュー表をもとに制作し、注文・決済はデモ、住所などの店舗情報は仮のものです。

公開URL: https://kenkenta51-max.github.io/SAMPLE-site/sites/big-burger-diner/

## MELUA CLINICの追加

`sites/melua-clinic/` に架空の医療脱毛クリニックの完成版LPを追加しました。FVから最終予約CTAまで、料金プラン切り替え・自然な産毛による肌比較スライダー・FAQを含みます。予約はデモ表示です。

公開URL: https://kenkenta51-max.github.io/SAMPLE-site/sites/melua-clinic/

## Pantry Matchaの追加

`sites/pantry-matcha/` に、抹茶カフェ「Pantry Matcha」のモバイルオーダーを追加しました。Canvaのメニュー表と店舗写真をもとに制作しています。FVは商品写真が入れ替わるネオンライム×ホットピンクのポスター風デザインで、スワイプで切り替わるギャラリー、サイズ・ミルク・濃さ・甘さ・氷・トッピングのカスタマイズ（選択内容に合わせて商品画像と価格が変化）、カート追加のアニメーション、注文確認〜完了画面を含みます。トッピング画像はCanvaのAI画像生成で作成しました。注文・決済はデモで、価格・店舗情報は仮のものです。

公開URL: https://kenkenta51-max.github.io/SAMPLE-site/sites/pantry-matcha/

## 時の雫の追加

`sites/toki-no-shizuku/` に、ゼルダの伝説 時のオカリナの世界観から着想した架空のドリンクショップ「時の雫」を追加しています。ローディングのトライフォース、妖精のカーソル、宝箱のカート演出（空きビン4本まで）、スクロールで変わる昼夜とBGM、オカリナで開く裏メニューを含みます。画像はすべて生成画像で、BGM・効果音はブラウザ内で合成するオリジナルです。実際の注文・決済は行いません。非公式のファン制作です。

公開URL: https://kenkenta51-max.github.io/SAMPLE-site/sites/toki-no-shizuku/

## ひだまりベーカリーの追加

`sites/hidamari-bakery/` に、架空のパン屋さん「ひだまりベーカリー」の3Dスクロールサイトを追加しています。Canvaのパンメニュー（黄×グレーのオーニング、テラコッタ色の文字、水彩のパン10種）をもとに、ポップなローポリのミニチュアの町として3Dで作り直しました。スクロールに合わせて、夜明け前の製粉所 → 小麦粉トラックの走行（カメラが追従） → 生地をこねる → オーブンでふくらむ → 焼きたてを並べる → シャッターが上がって開店 → カメラが引いてロゴ表示、と進みます。夜から朝へ空の色と時計も変わります。

React Three Fiber・Three.js・GSAP（ScrollTrigger）で制作しています。ソースは `app/`、公開用のビルド済みファイルは `dist/` です。パンや建物はすべてコードで作った3Dモデルで、Canvaの水彩イラストは最下部のメニューにだけ使っています。店舗情報・価格はサンプルです。

ストーリーの後には、メニュー・人気No.1（ドラッグで回せる3Dのケーキスタンド）・焼きあがり時間（3Dの木の看板。今の時刻からつぎの焼きあがりを表示）・こだわり（風車と麦畑と牛の3Dジオラマ）・お知らせ（コルクボード）・アクセス（駅からの3D立体マップ）・SNSを続けています。3Dの小さなシーンは画面に入ったときだけ描画し、FVの3Dはストーリーを過ぎると描画を止めます。

再ビルド: `cd sites/hidamari-bakery/app && npm install && npm run build`（`../dist/` に出力）

公開URL: https://kenkenta51-max.github.io/SAMPLE-site/sites/hidamari-bakery/

## 振袖 咲日 — SAKUHI の追加

`sites/sakuhi-furisode/index.html` に架空の振袖アトリエを追加しました。トップ・振袖コレクション・6着の詳細・プラン一覧と3つの詳細・撮影・ブランド・店舗・FAQ・プライバシー・相談予約デモまで、画像・CSS・JavaScriptを1つのHTMLに内包しています。生成画像を使用し、花びら、回転、スクロール連動、背景色切り替えを実装。お気に入り・絞り込み・料金試算も利用できます。実際の送信・予約は行いません。


## ポッケ放課後クラブの追加

`sites/pokke-after-school/index.html` に、架空の児童クラブを追加しました。TOP、クラブ紹介、あそびと一日、施設と安心、入会案内、4件の記事、見学フォーム、プライバシーを含みます。初期表示で全画面を覆う黄色い扉が、スクロール・タップで開いてサイトが現れます。画像・CSS・JavaScriptを1つのHTMLに内包し、スマートフォンと動きの軽減設定に対応しています。実際の募集・予約・データ送信は行いません。

公開URL: https://kenkenta51-max.github.io/SAMPLE-site/sites/pokke-after-school/

JavaScript構文・82項目の機能検査・コレクションのビルドとローカル参照監査を実施。ブラウザ環境の接続エラーにより、実機表示の確認は未完了です。
