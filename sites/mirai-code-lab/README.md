# MIRAI CODE LAB

小学生向けプログラミングスクールの架空LPです。スマホを中心に、タブレット・PCにも対応しています。

## 公開サイト

https://kenkenta51-max.github.io/SAMPLE-site/sites/mirai-code-lab/

## 構成

FV、作品紹介、スクールの特徴、学年別コース、レッスンの流れ、講師紹介、教室・設備、料金・時間割、FAQ、無料体験案内。

## ローカルでの確認

ビルドや依存パッケージは不要です。

```sh
python -m http.server 8000
```

ブラウザで http://localhost:8000/ を開きます。

## 主なファイル

- `index.html`: LP本体、ゲームの動作デモ、体験案内ダイアログ
- `features.css` / `courses.css` / `lower-sections.css`: セクションのスタイル
- `assets/`: 表示用画像
- `designs.html` / `designs/`: 04〜09のデザイン案
- `downloads/`: デザイン案6枚のZIP

## 機能

- 迷路・ストーリーの再生デモ
- アニメーションの停止と、端末の動きを抑える設定への対応
- FAQの開閉
- 無料体験の案内表示

## 制作サンプルについて

スクール、講師、写真、作品画面は架空サービスの制作イメージです。画像にはAI生成素材を使用しています。実際の予約送信・個人情報収集・決済は行いません。料金や時間割は事業プラン上の設定です。

公開はルートのscripts/build.pyとGitHub Actionsが行います。画像ZIPはビルド時に生成します。
