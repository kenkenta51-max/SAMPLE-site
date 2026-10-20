# handoff-instructions.md
新しいClaude Codeセッションで作業を続ける際の引き継ぎメモ

## プロジェクト概要
- 架空のヘアサロンLP「Un Jour（アンジュール）」を作成中
- 参考サイト（AFLOAT）の分析結果は docs/reference-analysis.md, docs/design-system.md に完了済み
- 文章素材は inputs/copy/page-copy.md に完了済み
- 画像は public/images/ に配置済み（本メモの下部に一覧）

## まだ実装していないこと（次にやること）
1. index.html / css/style.css / js/main.js の実装（9セクション構成のLP本体）
   ※過去のセッションで一度実装済みだったが、今回は新しいセッションのため未実装の状態からのスタート
2. public/images/内の追加11画像をデザインに反映する

## LP構成（9セクション）
1. ヘッダー（ロゴ＋ナビ＋WEB予約ボタン）
2. FV（hero-main.jpg背景、見出し「A DAY TO BECOME YOU」）
3. 悩み提起セクション（worries-mirror.jpg使用）
4. コンセプト説明（interior-wide.jpg使用）
5. 選ばれる理由（アイコン4点＋reason-*.jpg 4点を組み合わせ）
6. サービス紹介（service-*.jpg使用、画像のない2メニューはテキストのみ）
7. 実績・お客様の声（voice-customer1/2.jpg、media-logo1/2.png使用）
8. アクセス・予約導線
9. フッター

OTHER MENUセクション（サービス紹介内）にはmenu-board.jpgを使用。

## デザイン方針の追加要望
- 背景：wood-texture-bg.jpgをbody全体にごく薄く(5〜10%透明度)重ねる。コンテンツ部分は白background維持
- 全体的に「人物が写っている写真」を増やし、おしゃれで美容室らしい質感を出す
- 参考サイト(AFLOAT)の文言・ロゴ・固有名詞は使用しない

## public/images/ 一覧と用途
- logo.png：ロゴ
- hero-main.jpg：FV背景
- interior-wide.jpg：コンセプトセクション
- service-counseling.jpg / service-headspa.jpg / service-treatment.jpg：サービス紹介3点
- icons/icon-private.png, icon-counseling.png, icon-care.png：選ばれる理由用アイコン(4点目はicon-careを再利用)
- wood-texture-bg.jpg：全体背景用テクスチャ
- worries-mirror.jpg：悩みセクション用
- reason-private.jpg / reason-counseling.jpg / reason-expertise.jpg / reason-homecare.jpg：選ばれる理由4項目の写真
- menu-board.jpg：メニュー表視覚情報
- voice-customer1.jpg / voice-customer2.jpg：お客様の声2件
- media-logo1.png（HAIR JOURNAL TOKYO）/ media-logo2.png（STYLE & LIFE MAGAZINE）：架空メディア掲載ロゴ

## 既知の注意点
- voice-customer2.jpg（お店に入っていく女性の写真）には「LEA HAIR SALON」という別の架空店名の看板が写り込んでいるが、使用継続の判断済み
- ヘッダーのposition挙動、セクション上下余白は参考サイトから実測できず、推定値で設計している（docs/design-system.md参照）
- FVの動画演出は静止画+CSSアニメーションで代替する方針
