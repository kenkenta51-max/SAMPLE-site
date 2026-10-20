'use strict';
// These are fictional staging directions. Scoring and rule references stay in data.js.
window.MOSTO_STORIES = (() => {
  const step=(label,extra={})=>({label,duration:extra.say?Math.min(3400,Math.max(1900,extra.say[1].length*48)):1500,...extra});
  const act=(label,actors,extra={})=>step(label,{actors,...extra});
  const say=(label,who,text,extra={})=>step(label,{say:[who,text],...extra});
  const happy=()=>act('お客様が笑顔でうなずく',{staff:{pose:'idle',walk:false},mother:{pose:'happy',listen:true},child:{pose:'happy'}});
  const stopWalk={staff:{walk:false,pose:'idle'}};
  const good=[
    () => [
      act('お客様の方へ向き直る',{staff:{x:57,face:1,pose:'idle'}}),
      say('自分から挨拶し、会釈する','あなた','いらっしゃいませ。順番にご案内いたします。',{actors:{staff:{pose:'bow'}}}),
      say('声が届き、お客様がほっとする','お母さま','声をかけてもらえて安心しました。',{actors:{staff:{pose:'idle'},mother:{pose:'happy',listen:true},child:{pose:'happy'}}})
    ],
    () => [
      say('人数と子ども椅子を確認する','あなた','大人2名様、お子様1名様ですね。子ども用の椅子もご用意します。',{actors:{staff:{pose:'idle',x:57}}}),
      say('案内を止め、通路の安全を確保する','あなた','通路を安全にしてからご案内します。少々お待ちください。',{notice:'通路の水を発見 → 安全確保',actors:{staff:{pose:'guide'}}}),
      act('清掃・手洗いを済ませ、清掃済みの席を確認する',{staff:{x:40,pose:'walk_a',walk:true}},{notice:'通路の清掃・手洗い・席の確認 完了',duration:1900}),
      say('安全な席を指してご案内する','あなた','こちらのお席へどうぞ。',{actors:{staff:{walk:false,pose:'guide'}},notice:null}),
      act('スタッフが先に歩き、お客様が後に続く',{staff:{x:26,y:82,walk:true,pose:'walk_a'},mother:{x:46,y:86,walk:true},child:{x:58,y:89,walk:true}},{duration:1700}),
      act('ご家族がお席に到着する',{staff:{x:25,y:82,walk:false,pose:'guide'},mother:{x:36,y:85,walk:true},child:{x:46,y:89,walk:true}},{duration:1600}),
      say('子ども椅子をご案内し、笑顔になる','お母さま','子ども用の椅子、助かります。ありがとうございます。',{actors:{mother:{walk:false,pose:'happy'},child:{walk:false,pose:'happy'},staff:{pose:'idle'}}})
    ],
    () => [
      act('メニューの見える位置へ近づく',{staff:{x:56,walk:true,pose:'walk_a'}},{duration:1600}),
      say('曖昧な商品名をメニューで確認する','あなた','チーズのハンバーグはこちらの2種類です。どちらでしょうか？',{actors:{staff:{walk:false,pose:'guide'}},props:{menu:{x:37,y:65,visible:true}}}),
      say('料理名・数量・セット・飲み物・変更点を復唱する','あなた','こちらのハンバーグを1点、ライスセット、アイスティー。変更はございませんか？',{actors:{staff:{pose:'idle'}},props:{terminal:{x:44,y:68,visible:true}}}),
      say('お客様の確認を受けて、注文を送信する','お母さま','はい、それでお願いします。',{actors:{mother:{pose:'happy',listen:true},child:{pose:'happy'}},notice:'内容確認 → 注文送信',props:{menu:{x:18,y:66},terminal:{visible:false}}})
    ],
    () => [
      say('提供前に、番号・料理名・数量を確認する','あなた','7番テーブル、ハンバーグ1点。確認できました。',{actors:{staff:{pose:'serve'}},props:{meal:{x:62,y:65,visible:true,scale:.65}}}),
      act('トレーを持ち、保護者側へ近づく',{staff:{x:42,pose:'serve',walk:false}},{props:{meal:{x:37,y:65}},duration:1800}),
      say('熱いことを声に出して伝える','あなた','お皿が熱くなっております。お気をつけください。',{actors:{mother:{listen:true}}}),
      act('お子様から離れた、テーブルの安全な位置に置く',{staff:{pose:'guide'}},{props:{meal:{x:17,y:63,scale:1}},notice:'保護者側・お子様の手が届かない位置',duration:1700}),
      say('手を離してから、お客様の反応を確かめる','お母さま','声をかけてもらえてよかったです。気をつけますね。',{actors:{staff:{x:58,pose:'idle'},mother:{pose:'happy'},child:{pose:'happy'}},notice:null})
    ],
    () => [
      say('追加内容を復唱する','あなた','アイスティーを1点追加ですね。',{actors:{staff:{x:52,pose:'idle'},mother:{listen:true}}}),
      act('汚れた食器に触れたので、手洗いへ向かう',{staff:{x:80,y:73,walk:true,pose:'walk_a'}},{notice:'汚れた物に触れた後 → 必ず手洗い',duration:1600}),
      act('バックヤードで手洗いをする',{staff:{visible:false,walk:false}},{notice:'手洗い中',duration:1600}),
      act('清潔な手で、ドリンクの用意へ進む',{staff:{visible:true,pose:'serve',x:76,y:79}},{notice:'手洗い完了 → ドリンクを準備',duration:1600}),
      say('用意したドリンクを運ぶ','あなた','お待たせいたしました。追加のアイスティーです。',{actors:{staff:{x:52,y:89,pose:'serve'}},notice:null}),
      happy()
    ],
    () => [
      say('注文の操作を止め、対象食材を確認する','あなた','卵のアレルギーですね。確認いたしますので、少々お待ちください。',{actors:{staff:{pose:'idle',x:54}},props:{terminal:{visible:false}},notice:'注文を止める'}),
      act('責任者のもとへ確認に向かう',{staff:{x:68,y:83,pose:'walk_a',walk:true},senior:{visible:true}},{notice:'責任者へ共有',duration:1700}),
      say('申告内容を共有し、原材料資料を一緒に確認する','あなた','卵アレルギーのご相談です。原材料表とアレルギー一覧を確認させてください。',{actors:{staff:{walk:false,pose:'guide'},senior:{listen:true}},notice:'原材料表・アレルギー一覧を確認'}),
      say('交差接触・完全除去についても責任者に引き継ぐ','責任者','共用の設備や器具による交差接触も確認して、保証できない場合はそのままお伝えします。',{actors:{senior:{pose:'guide'}},notice:'未確認の安全性は断言しない'}),
      say('確認中であることを伝え、お客様に向き直る','あなた','責任者と確認しております。確認できた内容をご説明いたします。',{actors:{staff:{x:54,y:89,pose:'idle'},mother:{pose:'neutral',listen:true}},notice:null})
    ],
    () => [
      say('お客様へ向き直り、まずお詫びする','あなた','お待たせして申し訳ございません。状況を確認いたします。',{actors:{staff:{x:53,pose:'bow'}}}),
      act('注文時刻と厨房状況を確認しに行く',{staff:{x:79,y:73,pose:'walk_a',walk:true}},{notice:'注文時刻と厨房状況を確認',duration:1800}),
      say('確認できた情報だけを整理する','先輩スタッフ','待ち時間は、厨房で確認できたものだけをお伝えしよう。',{actors:{staff:{walk:false,pose:'idle'},senior:{x:68,y:72,visible:true}},notice:'未確認の時間を約束しない'}),
      act('お客様のもとへ戻る',{staff:{x:53,y:89,pose:'walk_a',walk:true}},{notice:null,duration:1600}),
      say('確認した状況と分かった待ち時間だけを伝える','お母さま','分かった時間を教えていただければ大丈夫です。',{actors:{staff:{walk:false,pose:'idle'},mother:{pose:'neutral',listen:true},senior:{visible:false}},notice:'確認した内容を説明'})
    ],
    () => [
      say('言い訳をせず、まずお詫びする','あなた','申し訳ございません。状況を確認いたします。',{actors:{staff:{x:44,pose:'bow'}}}),
      act('料理を下げ、現物をそのまま確保する',{staff:{pose:'serve'}},{props:{meal:{x:39,y:65,visible:true,scale:.7}},notice:'現物を廃棄しない',duration:1700}),
      act('料理を持って責任者へ向かう',{staff:{x:70,y:82,pose:'serve'},senior:{visible:true}},{props:{meal:{x:65,y:59}},notice:'責任者へ即報告',duration:1700}),
      say('状況と現物を引き継ぐ','あなた','異物のご指摘です。こちらが下げた料理です。対応をお願いします。',{actors:{senior:{pose:'guide',listen:true}},notice:'店舗ルールに従い保管・引き継ぎ'}),
      say('返金や補償は独断で決めず、対応を引き継ぐ','お母さま','責任者の方に確認していただけるんですね。',{actors:{staff:{x:54,y:89,pose:'idle'},mother:{pose:'neutral'}},props:{meal:{visible:false}},notice:null})
    ],
    () => [
      say('レジで伝票番号と確定金額を確認する','あなた','伝票と金額を確認いたします。お会計は4,280円です。',{actors:{staff:{pose:'idle'}},notice:'確定した伝票・金額を確認'}),
      say('決済方法と受け取る金額を声に出す','あなた','現金で5,000円お預かりします。',{actors:{staff:{pose:'guide'},mother:{listen:true}},notice:null}),
      act('店舗の正式な会計手順で処理する',{staff:{pose:'idle'}},{props:{terminal:{x:77,y:62,visible:true}},notice:'会計手順に沿って処理',duration:1800}),
      say('処理を終え、お客様に向き直る','あなた','お会計が終わりました。ありがとうございます。',{actors:{staff:{pose:'bow'},mother:{pose:'happy'},child:{pose:'happy'}},props:{terminal:{visible:false}},notice:null})
    ],
    () => [
      say('ご家族に向き直り、感謝を伝える','あなた','ありがとうございました。',{actors:{staff:{pose:'bow'},mother:{pose:'happy'},child:{pose:'happy'}}}),
      act('お客様が出口へ歩き出す',{staff:{pose:'idle'},mother:{x:14,y:78,walk:true},child:{x:6,y:81,walk:true}},{duration:1600}),
      act('ご家族を見送り、テーブルへ向かう',{staff:{x:28,y:87,walk:true,pose:'walk_a'},mother:{x:-8,y:75,visible:false,walk:false},child:{x:-15,y:78,visible:false,walk:false}},{duration:1700}),
      say('忘れ物がないか、テーブル周辺を確認する','あなた','テーブルと席の周り、忘れ物はありません。',{actors:{staff:{walk:false,pose:'guide'}},notice:'退店時の挨拶 ＋ 忘れ物確認'}),
      say('初日の接客を終える','先輩スタッフ','最後の確認までできたね。初めてのシフト、おつかれさま！',{actors:{staff:{pose:'idle'},senior:{visible:true,x:58,y:85}},notice:null})
    ]
  ];
  const wrong = [
    {1:['担当の先輩を待って、声をかけない','あなた','先輩の会計が終わるまで待とう。'],2:['未確認の空席を約束してしまう','あなた','すぐ座れます。']},
    {1:['清掃前の席を案内しようとする','あなた','こちらのお席へどうぞ。'],2:['床の水をまたいでもらおうとする','あなた','水をまたいでお進みください。']},
    {0:['商品を推測して入力する','あなた','きっと人気のチーズハンバーグだろう。'],2:['曖昧な名前のまま注文を送信する','あなた','チーズのやつですね。']},
    {1:['熱さは伝えたが、子どもの近くに置こうとする','あなた','熱いので気をつけてください。'],2:['確認も声かけもなく、料理を置こうとする','あなた','見た目は同じ料理だから、このまま置こう。']},
    {0:['手洗いを省いて提供に移ろうとする','あなた','お待たせしないよう、すぐに用意しよう。'],1:['手を布で拭くだけで用意しようとする','あなた','アイスティー1点ですね。手は布で拭こう。']},
    {0:['過去の経験から安全を断言してしまう','あなた','前のお客様は大丈夫だったので、今回も大丈夫です。'],2:['見た目で判断し、安全だと伝えてしまう','あなた','見たところ卵は使っていません。少量なら問題ないと思います。']},
    {0:['確認前に待ち時間を約束してしまう','あなた','すぐに出ます。あと2分です。'],1:['言い訳をして、対応を終えようとする','あなた','厨房が混んでいるので仕方がありません。']},
    {1:['料理を捨てて返金すると約束しようとする','あなた','こちらは処分して、全額返金します。'],2:['状況を確かめる前に反論してしまう','あなた','厨房では入るはずがありません。']},
    {0:['伝票と受取金額を確認せず会計する','あなた','そのままレジに入れて処理しよう。'],2:['自分の判断で値引きをしようとする','あなた','お待たせしたので500円引いておきます。']},
    {1:['挨拶を省き、片づけを始めようとする','あなた','次のお客様のために先に片づけよう。'],2:['挨拶だけで別の仕事に移ろうとする','あなた','ありがとうございました。次の仕事に戻ろう。']}
  ];
  const concerns=['気づいてもらえているかしら……。','このまま進んでも、大丈夫でしょうか？','お願いした料理で合っていますか？','子どもの近くは、熱くて心配です。','今、汚れた食器を触っていませんでしたか？','本当に確認しなくても大丈夫なんでしょうか……。','確認した時間を教えてもらえますか？','まず状況を確認していただきたいです。','金額を確認していただけますか？','最後まで、気にかけてもらえるとうれしいです。'];
  function build(index,option){const s=window.MOSTO.stages[index];if(s.options[option].correct)return good[index]();const [label,who,text]=wrong[index][option];const badActor={staff:{pose:index===1?'guide':[3,7].includes(index)?'serve':'idle',x:index===8?79:55,walk:false}};const steps=[say(label,who,text,{actors:badActor,notice:'選んだ対応を再現中'}),say('お客様が困った表情になる','お母さま',concerns[index],{actors:{mother:{pose:index===7?'unhappy':'worried'},child:{pose:'worried'}},notice:null}),say('先輩が声をかけ、対応をいったん止める','先輩スタッフ',s.options[option].note,{actors:{senior:{visible:true,x:77,y:78,pose:'guide'},staff:{pose:'idle'}},notice:'先輩と手順を確認'}),say('改善するポイントを確認する','先輩スタッフ',s.improve,{actors:{staff:{pose:'bow'},senior:{pose:'idle',listen:true}}}),say('正しい手順を確認し、次の接客に備える','あなた','確認してから、正しい手順で対応します。',{actors:{staff:{pose:'idle'},mother:{pose:'neutral'},child:{pose:'neutral'}},notice:null})];return steps;}
  return {build};
})();
