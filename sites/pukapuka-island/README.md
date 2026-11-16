# ぷかぷか島のスターしずく（体験版）

空にうかぶ島をジャンプでわたり、スターしずくと「星のかけら」を集める3Dアクションゲームの体験版です。オリジナル作品です。

- 公開URL（`main` に反映後）: https://kenkenta51-max.github.io/SAMPLE-site/sites/pukapuka-island/
- 技術: React + Three.js + React Three Fiber（Vite でビルド）
- キャラは仮モデル（コードで作ったもの）で動きます。Tripo の GLB を置くと自動で差し替わります。

## 遊び方

| 操作 | PC | スマホ |
|---|---|---|
| いどう | WASD／矢印キー | 左下のスティック |
| ジャンプ | スペース（空中でもう1回で2だんジャンプ） | Ⓐボタン |
| カメラ | マウスでドラッグ／Q・E | 画面をドラッグ |
| ポーズ | Esc／P／右上のⅡ | 右上のⅡ |

**目的**: 3つの島にある「星のかけら」を3こ集め、そらの塔のてっぺんのとびらを開ける。

## 体験版の中身

| エリア | あそび |
|---|---|
| はじまりの島 | 操作の練習、2だんジャンプ、敵を踏んで倒す、バネキノコで大ジャンプ（星のかけら1） |
| 雲の橋 | ゆれる雲、横に動く雲 |
| かざぐるまの島 | 乗るとくずれるクッキー雲、上下に動く雲（星のかけら2） |
| くるくる花の橋 | 回転する花、動くキャンディブロック |
| そらの塔 | らせん階段を登る、空を飛ぶトゲの敵をよける（星のかけら3）→ とびら → ボス登場で「製品版につづく」 |

ほかに、ライフ（ハート3つ）、チェックポイント、スターしずく27こ、回復ハート、ヒント会話、クリアランク（S〜C）、効果音・BGM（Web Audio で合成）があります。

## キャラ設定

| ID | 名前 | 役割 | 設定 |
|---|---|---|---|
| `hero` | メルン | 主人公 | 雲のしっぽを持つ子ひつじ。白いもこもこの毛、クリーム色の顔、ピンクのスカーフ、小さな黄色いツノ。 |
| `fairy` | ティア | ナビ妖精 | しずくの形をした水の妖精。水色で半透明、白い羽、頭に小さな星。メルンのそばを飛んでヒントをくれる。 |
| `pomu` | ポムム | 敵（地上） | ピンクのかさに白い水玉のキノコ。てくてく歩く。上から踏むと倒せる。 |
| `chiku` | チクリン | 敵（空中） | うす紫のふわふわ綿毛にトゲ。ぷかぷか飛ぶ。踏めないので、よける。 |
| `boss` | ゴロゴロ雲の王 | ボス（体験版は登場だけ） | 黒紫の雷雲に金の王冠、光る黄色い目。スターしずくを独り占めしている。 |
| `house` | メルンの家 | 飾り（任意） | 水色の三角屋根の丸いおうち。 |

## Tripo で作るときのプロンプト案

文章だけより、先に画像生成AIで参考画像を作り、Tripo の「画像から生成」に使うと作り直しが減ります。

### 1. 参考画像用プロンプト（画像生成AI向け）

共通スタイル（各プロンプトの最後に付ける）:

```
cute chibi 3D character, soft clay toy style, pastel colors, full body, front view, simple standing pose, plain white background, no shadow, single character
```

| ID | プロンプト |
|---|---|
| `hero` | a small fluffy white baby sheep, cream colored round face, big shiny dark eyes, pink cheeks, tiny curled yellow horns, pink scarf, a light blue cloud-shaped tail, short legs |
| `fairy` | a tiny water drop fairy, light blue translucent teardrop body, big eyes, small white wings, a tiny yellow star on the tip of the head |
| `pomu` | a cute walking mushroom monster, pink cap with white polka dots, cream colored stubby body, small feet, round eyes |
| `chiku` | a fluffy lavender puffball monster with soft pink spikes, angry eyebrows, round eyes, floating |
| `boss` | a big dark purple thundercloud king, golden crown, glowing yellow eyes, mischievous, chunky round shape |

### 2. Tripo の設定（クレジット節約）

- モデル: **Smart Mesh**（ボスだけ見栄え重視なら HD Model）
- 生成数: **1**
- 8Kテクスチャ: **オフ**（2K〜4Kで十分）
- リグ: **なし**（動きはゲーム側で付けます）
- 書き出し: **GLB**
- 1ファイルの目安: **5MB以下**（スマホで重くならないように）

## GLB の差し替え方

1. Tripo から GLB を書き出し、名前を `hero.glb`・`fairy.glb`・`pomu.glb`・`chiku.glb`・`boss.glb`・`house.glb` に変える。
2. `app/public/models/` と `dist/models/` に置く（ビルドし直す場合は `app/public/models/` だけでよい）。
3. 大きさ・向きがずれていたら `models/config.json` を直す。
   - `height`: ゲーム内での高さ（メートル）。足元が地面に合うよう自動でそろえます。
   - `rotationY`: 向きの補正（度）。後ろを向いていたら `180`。
   - `scale`・`offset`: 細かい調整。
4. ファイルがない・読み込めないときは、自動で仮モデルのまま表示されます。

GLB にアニメーションが入っていれば最初のもの（または `config.json` の `animation` で指定した名前）を再生します。

## 開発

```sh
cd app
npm install
npm run dev     # 開発用サーバー
npm run build   # ../dist に公開用ファイルを出力
```

| ファイル | 内容 |
|---|---|
| `app/src/level.js` | ステージ（足場・アイテム・敵・ヒント）の配置 |
| `app/src/game.js` | 移動・ジャンプ・当たり判定・敵・アイテム |
| `app/src/Scene.jsx` | 3D シーン、メインループ、カメラ |
| `app/src/environment.jsx` | 空・雲・島・足場・飾りの見た目 |
| `app/src/entities.jsx` | キャラ・敵・アイテム・とびら・パーティクル |
| `app/src/models/toys.jsx` | 仮モデル |
| `app/src/models/glb.jsx` | GLB の読み込みと差し替え |
| `app/src/App.jsx`・`styles.css` | 画面（タイトル・HUD・ポーズ・クリア） |
| `app/src/audio.js` | 効果音・BGM |
