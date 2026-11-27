# Sample Site

29件のサンプルサイト・ブラウザゲームを、1つのリポジトリで管理します。

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

GitHubの Settings → Pages → Build and deployment → Source で **GitHub Actions** を選択します。公開ワークフローを実行すると、一覧ページと全29サイトが1つのPagesサイトとして公開されます。

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

React Three Fiber・Three.js・GSAP（ScrollTrigger）で制作しています。ソースは `app/`、公開用のビルド済みファイルは `dist/` です。パンや建物はすべてコードで作った3Dモデルで、メニュー・人気No.1・こだわり・SNS欄の写真は、Codex（ChatGPTログイン）の画像生成で作ったリアルなパン写真です（`app/public/menu/`・`app/public/photos/`）。店舗情報・価格はサンプルです。

ストーリーの後には、メニュー・人気No.1（白熊パンの写真と揺れる木の吊り看板）・焼きあがり時間（3Dの木の看板。今の時刻からつぎの焼きあがりを表示）・こだわり（風車と麦畑と牛の3Dジオラマ＋4項目の写真）・お知らせ（コルクボード）・アクセス（駅からの3D立体マップ）・SNSを続けています。3Dの小さなシーンは画面に入ったときだけ描画し、FVの3Dはストーリーを過ぎると描画を止めます。

再ビルド: `cd sites/hidamari-bakery/app && npm install && npm run build`（`../dist/` に出力）

公開URL: https://kenkenta51-max.github.io/SAMPLE-site/sites/hidamari-bakery/

## 振袖 咲日 — SAKUHI の追加

`sites/sakuhi-furisode/index.html` に架空の振袖アトリエを追加しました。トップ・振袖コレクション・6着の詳細・プラン一覧と3つの詳細・撮影・ブランド・店舗・FAQ・プライバシー・相談予約デモまで、画像・CSS・JavaScriptを1つのHTMLに内包しています。生成画像を使用し、花びら、回転、スクロール連動、背景色切り替えを実装。お気に入り・絞り込み・料金試算も利用できます。実際の送信・予約は行いません。


## ポッケ放課後クラブの追加

`sites/pokke-after-school/index.html` に、架空の児童クラブを追加しました。TOP、クラブ紹介、あそびと一日、施設と安心、入会案内、4件の記事、見学フォーム、プライバシーを含みます。初期表示で全画面を覆う黄色い扉が、スクロール・タップで開いてサイトが現れます。画像・CSS・JavaScriptを1つのHTMLに内包し、スマートフォンと動きの軽減設定に対応しています。実際の募集・予約・データ送信は行いません。

公開URL: https://kenkenta51-max.github.io/SAMPLE-site/sites/pokke-after-school/

JavaScript構文・82項目の機能検査・コレクションのビルドとローカル参照監査を実施。ブラウザ環境の接続エラーにより、実機表示の確認は未完了です。


ポッケの制作データ一式： https://kenkenta51-max.github.io/SAMPLE-site/sites/pokke-after-school/download.html
単体HTML・編集用ソース・生成画像の原寸データ・仕様書・再構築ツールをZIPに収録しています。

## ほりほりダイブの追加

`sites/horihori-dive/index.html` に、ブロックの世界を掘って、集めて、クラフトしながら地下300mの「おうさまブロック」を目指す、スマホ向けの3Dゲーム「ほりほりダイブ」を追加しました。小学生でも遊べるよう、文字はひらがな中心で、操作は ◀ ▲ ▼ ▶ の4つのボタンとホットバーのタップだけにしています。

- **掘る：** ボタンを長押しすると腕を振り続け、ヒビが10段階で広がってブロックが割れます。硬いブロックほど時間がかかります。
- **アイテム：** 割ったブロックは回転するアイテムになって落ち、近づくと吸い込まれて画面下のホットバー（9マス）に入ります。
- **クラフト：** 「つくる」から、ツルハシ（木・石・鉄・ダイヤ）、たいまつ、はしご、ごちそうパン、きんのりんごを作れます。道具はそのプレイ限りです。
- **たいまつとはしご：** たいまつは壁に置くと周りを照らし、敵が湧きにくくなります。はしごを置くと ▲ で登れます。
- **明るさ：** マスごとに明るさを計算し、たいまつ・溶岩・光るブロック・キャラのライトの光が広がります。
- **地層：** 深さに応じて、土 → 石 → 氷の洞窟 → キノコの洞窟 → 水晶の洞窟 → 溶岩の層と景色が変わります。
- **古い坑道と宝箱：** ときどき木で組まれた坑道が現れ、宝箱からいろいろなアイテムが出ます。
- **敵（7種類、すべてオリジナルデザイン）：** コウモリン、クモスケ、ホネボーン、ゆきんこ、キノコン、クリスタン、ひのたまん。
- **連鎖崩れ：** 砂・粉雪・灰がまとめて崩れるとボーナスの💎がもらえます。
- **ずかん：** 見つけたブロックと敵が登録されます。
- **ゴール：** 300mのおうさまブロックを掘るとクリアです。そのまま記録への挑戦を続けることもできます。
- **おみせ：** 集めた💎で、ハートの追加、おなかが減りにくくなるアイテム、ライトの強化、スタートセット、見た目違いの仲間キャラ6人を買えます。記録と💎はブラウザに保存されます。

キャラクター・ブロック・敵・地形はすべて、Three.js（`vendor/` に同梱、MITライセンス）を使ってコードで作ったオリジナルです。ドット絵はcanvasで、効果音はWeb Audioで生成しています。PCでは矢印キーで移動、1〜9キーでホットバー、Cキーでクラフトを開けます。

公開URL: https://kenkenta51-max.github.io/SAMPLE-site/sites/horihori-dive/

## ぷかぷか島のスターしずく（3Dアクション体験版）の追加

`sites/pukapuka-island/` に、空にうかぶ島をジャンプでわたるオリジナルの3Dアクションゲームの体験版を追加しました。React・Three.js・React Three Fiberで作り、PCとスマートフォン（画面上のスティックとボタン）で遊べます。島3つ、2段ジャンプ、動く足場・くずれる足場・バネ・回転床、踏んで倒す敵と避ける敵、チェックポイント、ヒント会話、クリア演出を含みます。

キャラは仮モデルです。Tripoなどで作ったGLBを `models/` に置くと自動で差し替わります。キャラ設定・Tripo用プロンプト・差し替え手順は `sites/pukapuka-island/README.md` にまとめています。

ソースは `sites/pukapuka-island/app/`、公開用ビルドは `sites/pukapuka-island/dist/` です（`cd sites/pukapuka-island/app && npm install && npm run build` で再ビルド）。

公開URL: https://kenkenta51-max.github.io/SAMPLE-site/sites/pukapuka-island/

## つむぎテラス（3Dショッピングモール フロアガイド）の追加

`sites/tsumugi-terrace/` に、駅前にある架空のショッピングモール「つむぎテラス」の3Dフロアガイドを追加しました。Three.jsで作っています。フロアを選ぶと上の階と屋根が持ち上がって消え、店内が見えます。

- 店舗をクリックすると、写真・営業時間付きのカードが開きます
- 「ベビーカーで行くルート」を押すと、南口からエレベーター経由でお店までの道が光ります（上下の階をまたいで表示）
- セール中・授乳室・多目的トイレ・テナント募集で絞り込めます
- 屋上庭園・駐車場の空き（北口にいちばん近い空き）・ストリートの各ビューがあります

店舗写真32枚は、Geminiの画像生成モデル（Nano Banana Pro）で作ったイメージです。three.jsは `vendor/` に同梱しているため、ビルドは不要です。

3Dの見た目は、無料で使える素材を組み合わせています。

- 車は Khronos glTF Sample Assets のモデル（CC BY 4.0）、歩く人は Quaternius のモデル（CC0）です
- 街灯・ベンチ・植栽、レンガや路面の質感、夜景の環境光は Poly Haven（CC0）です
- 建物の窓には、店舗写真を並べた帯（`img/win/`）を貼っています
- 右上の「ミニチュア」で、画面の上下をぼかしたジオラマ風の表示を切り替えます（最初からオン）
- 「雨」で、雨と濡れた路面の映り込みを切り替えます
- 「夜／昼」で、夜景と昼の表示を切り替えます
- 屋上・駐車場・ストリートのピン（芝生広場、手ぶらBBQ、バス停など）と、授乳室などの設備のピンを押すと、店舗と同じカードが開きます。スポットの内容は `data.js` の `SPOTS` で編集できます
- スマホでは、影・映り込み・人数を減らした軽量設定で動きます

クレジットは `credits.html`（元は `CREDITS.md`）にまとめています。

`?demo=1` を付けると自動デモが流れます（`?demo=short` は15秒版）。`?capture=1` は、1コマずつ書き出す録画用のモードです。店舗データは `data.js` で編集できます。

公開URL: https://kenkenta51-max.github.io/SAMPLE-site/sites/tsumugi-terrace/
