# css-notes.md
参考サイト: https://www.afloat.co.jp/
取得日: 2026-07-31
取得方法: Chrome DevTools Console (`getComputedStyle`)

## body
- font-family: "Noto Sans JP"
- font-size: 16px
- font-weight: 400
- color: rgb(37, 30, 28)
- margin: 0
- background-color: rgba(0, 0, 0, 0)

## H1相当（"CREATE FOR YOURSELF" 見出し）
- font-size: 31.88px（約32px）
- font-weight: 300
- font-family: Montserrat, sans-serif（英字専用。日本語部分はbodyのNoto Sans JP）
- letter-spacing: normal
- color: rgb(37, 30, 28)
- line-height: 31.88px（行間ほぼなし）

## Primary CTA（"WEB予約" ボタン）
- font-size: 13px
- font-weight: 700
- color: rgb(255, 255, 255)
- background-color: rgb(182, 150, 108)（ベージュゴールド：ブランドカラー）
- border-radius: 0px（角丸なし）
- box-shadow: none

## Container（セクション外枠）
- max-width: 約1205px（丸めて1200px相当）
- margin: 上下0 / 左右ほぼ中央寄せ
- padding: 左右 約18.75px（丸めて20px相当）

## Card（サロン1店舗分）
- width: 約629px（コンテナの半分弱）
- padding: 上下 約26px / 左右 約28px
- display: flex（画像とテキストが横並び）
- border-radius: 0px
- background-color: 透明
- box-shadow: none

## Header（上部ナビ帯）
- height: 74px
- background-color: 透明（画像に重ねている可能性あり、要検証）
- padding: 0px
- position: static（実際はsticky/fixedの可能性、親要素の影響の可能性あり）

## 全体所感
- 角丸（border-radius）はほぼ全要素で0。直線的でエッジの効いたデザイン
- 装飾（box-shadow）はほぼ使われていない、フラットデザイン
- 配色は「焦げ茶(rgb(37,30,28)) × ベージュゴールド(rgb(182,150,108)) × 白」の3色構成
- 日本語はNoto Sans JP、英字見出しはMontserratと使い分けている
- FVは静止画（当初想定は動画のヒーロー演出だが、確認した限り本検証では画像ベースで代替する）
