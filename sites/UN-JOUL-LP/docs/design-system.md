# design-system.md
Un Jour LP用デザインシステム（AFLOAT分析結果を基に、自社ブランド用に翻訳したもの）

## カラー
- --color-text: #251E1C（焦げ茶／基本文字色）
- --color-accent: #B6966C（ベージュゴールド／ボタン・差し色）
- --color-bg: #FFFFFF（基本背景）
- --color-bg-sub: #F7F3EE（セクション切り替え用の薄いベージュ、推定値）

## タイポグラフィ
- 日本語フォント: "Noto Sans JP", sans-serif
- 英字見出し用フォント: "Montserrat", sans-serif（今回はブランド名「Un Jour」がフランス語のため、Montserratの代わりに"Cormorant Garamond"等セリフ体も検討可。今回はAFLOAT踏襲でMontserratを採用）
- 本文サイズ: 16px / weight 400 / line-height 1.8
- H1(大見出し): 32px / weight 300 / line-height 1.0
- H2(中見出し): 24px / weight 400
- 注釈: 13px / weight 400

## レイアウト
- コンテナ最大幅: 1200px
- コンテナ左右padding: 20px（スマホ時は16px）
- セクション上下padding: 96px（PC） / 64px（スマホ）
- セクション間の背景色: 白とベージュ(--color-bg-sub)を交互に使用

## コンポーネント
### ボタン(Primary CTA)
- font-size: 13px, weight 700
- color: #FFFFFF
- background-color: var(--color-accent)
- border-radius: 0px（角丸なし）
- padding: 14px 32px
- box-shadow: none

### カード（サービス紹介用）
- display: flex（画像+テキストの横並び。スマホは縦積みに変更）
- padding: 24px
- border-radius: 0px
- background-color: 透明 or 白
- box-shadow: none
- gap: 24px

### ヘッダー
- height: 74px
- position: sticky（AFLOATは実測staticだったが、見た目の再現＝スクロール追従の演出を優先し、実装ではstickyを採用）
- background-color: 透明→スクロール後は白背景に切り替え（一般的なパターンとして採用。AFLOAT実物での確認はできていない）

## ブレークポイント
- PC: 1440px基準
- スマホ: 390px基準
- 切り替え: 768px以下でスマホレイアウトに変更

## FVの動画演出について
- 原資料の「動画のようなFV」は本検証では静止画＋CSSアニメーションで代替する
- 実装方針：hero-main.jpgを背景に、ケンバーンズ効果（8〜10秒かけてゆっくり拡大）をCSSの`@keyframes`で付与

## 不明点・推定値の明記
- セクション上下余白は実測取得できず、目視推定（80〜100px幅）を採用
- ヘッダーのposition（sticky/fixed/static）は実測ではstaticだったが、視覚的挙動から実装はstickyを採用（要確認事項として残す）
- スマホ版ナビゲーションの展開方式は未確認（本実装ではハンバーガーメニューを標準実装として採用）
