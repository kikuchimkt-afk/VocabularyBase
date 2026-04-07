const xlsx = require('xlsx');
const fs = require('fs');
const filePath = String.raw`C:\Users\makoto\Documents\GitHub\VocabularyBase\単語リスト\出題頻度順リストのみ_英検英単語.xlsx`;
const outPath = filePath.replace('.xlsx', '_updated.xlsx');
const targetFile = fs.existsSync(outPath) ? outPath : filePath;

const data = [
  {r:1001,en:"Don't worry about the small mistakes.",ja:"小さな間違いのことは心配しないでください。"},
  {r:1002,en:"Black coffee has a bitter taste.",ja:"ブラックコーヒーは苦い味がする。"},
  {r:1003,en:"The teacher will assess your English skills.",ja:"先生はあなたの英語のスキルを評価するだろう。"},
  {r:1004,en:"The lawyer prepared for the prosecution of the suspect.",ja:"弁護士は容疑者の起訴（告訴）の準備をした。"},
  {r:1005,en:"We had a long discussion about the new project.",ja:"私たちは新しいプロジェクトについて長い議論をした。"},
  {r:1006,en:"The boat began to drift away from the shore.",ja:"ボートは岸から離れて漂流し始めた。"},
  {r:1007,en:"A troop of monkeys lives in this forest.",ja:"サルの群れがこの森に住んでいる。"},
  {r:1008,en:"There is a large crack in the wall.",ja:"壁に大きなひび（裂け目）がある。"},
  {r:1009,en:"The factory increased its daily output.",ja:"その工場は１日の生産量を増やした。"},
  {r:1010,en:"There is a close relation between diet and health.",ja:"食事と健康には密接な関係性がある。"},
  {r:1011,en:"You must obey the law of the country.",ja:"その国の法律に従わなければならない。"},
  {r:1012,en:"Let's share this pizza together.",ja:"このピザを一緒に分かち合いましょう。"},
  {r:1013,en:"The nurse assisted the doctor during the operation.",ja:"看護師は手術中、医師を手伝った。"},
  {r:1014,en:"I will call you back later.",ja:"後で電話をかけ直します。"},
  {r:1015,en:"He made a New Year's resolution to study harder.",ja:"彼はもっと一生懸命勉強するという新年の決意をした。"},
  {r:1016,en:"You are always welcome in my house.",ja:"あなたは私の家でいつでも歓迎されます。"},
  {r:1017,en:"Please ensure that all windows are closed.",ja:"すべての窓が閉まっていることを確実にしてください。"},
  {r:1018,en:"He enjoys listening to classical music.",ja:"彼は古典の（クラシック）音楽を聴くのを楽しんでいる。"},
  {r:1019,en:"I was merely trying to help.",ja:"私は単に助けようとしただけだ。"},
  {r:1020,en:"Everything went according to plan.",ja:"すべては計画通り（計画に準じて）に進んだ。"},
  {r:1021,en:"Please state your name and occupation.",ja:"あなたの名前と職業を述べてください。"},
  {r:1022,en:"A large proportion of the students passed the exam.",ja:"生徒の大きな割合が試験に合格した。"},
  {r:1023,en:"He couldn't hide his anger.",ja:"彼は怒りを隠すことができなかった。"},
  {r:1024,en:"The pizza delivery arrived in 30 minutes.",ja:"ピザの配達は30分で到着した。"},
  {r:1025,en:"The loud music next door annoyed me.",ja:"隣の大きな音楽が私をいらだたせた。"},
  {r:1026,en:"Many civilians were injured in the war.",ja:"その戦争で多くの民間人が負傷した。"},
  {r:1027,en:"Making pottery is a traditional craft in this town.",ja:"陶器を作ることはこの町の伝統的な工芸だ。"},
  {r:1028,en:"I really appreciate your help.",ja:"あなたの助けに本当に感謝しています。"},
  {r:1029,en:"His office is at the end of the corridor.",ja:"彼のオフィスは廊下の突き当たりにある。"},
  {r:1030,en:"There is plenty of food for everyone.",ja:"全員分のたくさんの食べ物があります。"},
  {r:1031,en:"Honesty is considered a great virtue.",ja:"正直さは素晴らしい徳と見なされている。"},
  {r:1032,en:"It is a pleasure to meet you.",ja:"お会いできて光栄（喜び）です。"},
  {r:1033,en:"I was bored because the movie was too long.",ja:"映画が長すぎたので、私は退屈した。"},
  {r:1034,en:"His good behavior impressed the teacher.",ja:"彼の良い振る舞いは先生を感心させた。"},
  {r:1035,en:"He became conscious of someone watching him.",ja:"彼は誰かが自分を見ていることを意識するようになった。"},
  {r:1036,en:"Our main objective is to increase sales.",ja:"私たちの主な目標は売上を増やすことだ。"},
  {r:1037,en:"Education is important for a child's future.",ja:"教育は子どもの未来にとって重要だ。"},
  {r:1038,en:"This dish is a regional specialty of Hokkaido.",ja:"この料理は北海道の地方の特産品だ。"},
  {r:1039,en:"The new law is highly controversial.",ja:"その新しい法律は非常に議論の的になっている。"},
  {r:1040,en:"The investigator found new clues at the scene.",ja:"捜査官は現場で新しい手がかりを見つけた。"},
  {r:1041,en:"The children love to slide on the ice.",ja:"子供たちは氷の上を滑るのが好きだ。"},
  {r:1042,en:"Please take a seat and wait for your turn.",ja:"座席に座って（着席して）順番をお待ちください。"},
  {r:1043,en:"He felt someone tap him on the shoulder.",ja:"彼は誰かが自分の肩を軽くたたくのを感じた。"},
  {r:1044,en:"He solved the problem in a clever manner.",ja:"彼は賢いやり方でその問題を解決した。"},
  {r:1045,en:"Music therapy can help reduce stress.",ja:"音楽療法（治療）はストレスを減らすのに役立つことがある。"},
  {r:1046,en:"Several companies compete for the same market.",ja:"いくつかの会社が同じ市場をめぐって競争している。"},
  {r:1047,en:"The painting is a representation of a beautiful sunset.",ja:"その絵は美しい夕日の表現だ。"},
  {r:1048,en:"Be careful not to tear the paper.",ja:"紙を引き裂かないように気を付けてください。"},
  {r:1049,en:"Water is crucial for survival.",ja:"水は生き残るために重要（決定的）だ。"},
  {r:1050,en:"He came up with a creative idea.",ja:"彼は創造的なアイデアを思いついた。"},
  {r:1051,en:"I didn't realize that it was already midnight.",ja:"すでに真夜中だということがわからなかった。"},
  {r:1052,en:"Einstein was a genius in physics.",ja:"アインシュタインは物理学の天才だった。"},
  {r:1053,en:"It is risky to invest all your money in one company.",ja:"全財産を一つの会社に投資するのは危険だ。"},
  {r:1054,en:"She looked at her finished work with satisfaction.",ja:"彼女は完成した作品を満足そうに見た。"},
  {r:1055,en:"The old books were covered with dust.",ja:"その古い本はほこりで覆われていた。"},
  {r:1056,en:"Is it possible to finish the work today?",ja:"今日その仕事を終えることは可能ですか？"},
  {r:1057,en:"The hurricane caused tremendous damage to the city.",ja:"そのハリケーンは都市に非常に大きな被害を引き起こした。"},
  {r:1058,en:"Typically, the weather here is warm in spring.",ja:"典型的に、ここの天気は春は暖かい。"},
  {r:1059,en:"We need to raise public awareness of environmental issues.",ja:"環境問題に対する人々の気づき（意識）を高める必要がある。"},
  {r:1060,en:"I am quite tired today.",ja:"今日はかなり疲れています。"},
  {r:1061,en:"The committee will decide on the new rules tomorrow.",ja:"委員会は明日、新しいルールについて決定する。"},
  {r:1062,en:"Children are dependent on their parents.",ja:"子どもたちは親に依存している。"},
  {r:1063,en:"I love fruits, especially strawberries.",ja:"私は果物、特にイチゴが大好きです。"},
  {r:1064,en:"The deputy manager will attend the meeting in his place.",ja:"彼の代わりに代理のマネージャーが会議に出席する。"},
  {r:1065,en:"I agree with you to some extent.",ja:"ある程度はあなたに賛成します。"},
  {r:1066,en:"Math is my favorite subject.",ja:"数学は私のお気に入りの教科です。"},
  {r:1067,en:"He watched the horror movie with his hands over his eyes.",ja:"彼は目を手で覆いながらその恐怖映画（ホラー映画）を見た。"},
  {r:1068,en:"He found a new job with a higher salary.",ja:"彼はより給与の高い新しい仕事を見つけた。"},
  {r:1069,en:"The hotel has a grand entrance hall.",ja:"そのホテルには壮大なエントランスホールがある。"},
  {r:1070,en:"The tour guide showed us around the city.",ja:"ツアーの案内人が私たちに街を案内してくれた。"},
  {r:1071,en:"Blood flows through vessels in our bodies.",ja:"血は私たちの体内の血管（管状の容器）を通って流れる。"},
  {r:1072,en:"Thank you for your cooperation.",ja:"ご協力ありがとうございます。"},
  {r:1073,en:"Please don't interfere in my personal life.",ja:"私の私生活に干渉しないでください。"},
  {r:1074,en:"I can't recall his name right now.",ja:"今すぐには彼の名前を思い出せない。"},
  {r:1075,en:"Teaching young children requires a lot of patience.",ja:"小さな子供に教えるには多くの辛抱強さが必要だ。"},
  {r:1076,en:"Starting a new business is a risky venture.",ja:"新しいビジネスを始めることは危険な冒険的事業だ。"},
  {r:1077,en:"We have an annual health checkup at our company.",ja:"私たちの会社では毎年の健康診断がある。"},
  {r:1078,en:"The judge made a fair decision.",ja:"裁判官は公平な決定を下した。"},
  {r:1079,en:"Could you bring the bill, please?",ja:"（レストランで）請求書（お勘定）を持ってきていただけますか？"},
  {r:1080,en:"The dog hid behind the sofa.",ja:"犬はソファの背後に隠れた。"},
  {r:1081,en:"I suppose it will rain tomorrow.",ja:"明日は雨が降るだろうと思う。"},
  {r:1082,en:"The provision of clean water is essential.",ja:"きれいな水の供給は不可欠だ。"},
  {r:1083,en:"You shouldn't depend on others too much.",ja:"他人にあまり依存しすぎてはいけない。"},
  {r:1084,en:"He enjoys reading Greek myths.",ja:"彼はギリシャ神話を読むのを楽しんでいる。"},
  {r:1085,en:"The heavy stone will sink in water.",ja:"その重い石は水に沈むだろう。"},
  {r:1086,en:"My sister is pregnant with her first child.",ja:"私の姉は初めての子どもを妊娠している。"},
  {r:1087,en:"He derives a lot of pleasure from reading.",ja:"彼は読書から多くの喜びを引き出している。"},
  {r:1088,en:"The room was practically empty.",ja:"その部屋は実質的に空っぽだった。"},
  {r:1089,en:"She prepared an elaborate dinner for the guests.",ja:"彼女は客のために手の込んだ夕食を準備した。"},
  {r:1090,en:"Many refugees fled the country because of the war.",ja:"多くの難民が戦争のためにその国から逃れた。"},
  {r:1091,en:"The police are trying to find the motive for the crime.",ja:"警察はその犯罪の動機を見つけようとしている。"},
  {r:1092,en:"The two countries decided to ally against the common enemy.",ja:"その両国は共通の敵に対して同盟することを決めた。"},
  {r:1093,en:"You need a minimum of 60 points to pass the test.",ja:"テストに合格するには最小の（最低でも）60点が必要だ。"},
  {r:1094,en:"She hired a famous attorney to represent her in court.",ja:"彼女は法廷で代理人を務めてもらうため、有名な弁護士を雇った。"},
  {r:1095,en:"He was appointed as the new police commissioner.",ja:"彼は新しい警察委員（長）に任命された。"},
  {r:1096,en:"We have no clue where he is.",ja:"彼がどこにいるのか、私たちには手がかりがない。"},
  {r:1097,en:"The Prime Minister gave a speech on television.",ja:"総理大臣がテレビで演説をした。"},
  {r:1098,en:"We waited for the arrival of the train.",ja:"私たちは電車の到着を待った。"},
  {r:1099,en:"The manual is full of technical terms.",ja:"そのマニュアルは専門的な用語でいっぱいだ。"},
  {r:1100,en:"There is a strong similarity between the two stories.",ja:"その二つの物語には強い類似点がある。"},
];

async function main() {
  const wb = xlsx.readFile(targetFile);
  const ws = wb.Sheets["2級"];
  const aoa = xlsx.utils.sheet_to_json(ws, { header: 1, defval: "" });
  let c = 0;
  for (const item of data) {
    const idx = item.r;
    if (aoa[idx] && (!aoa[idx][3] || aoa[idx][3] === "")) {
      aoa[idx][3] = item.en;
      aoa[idx][4] = item.ja;
      c++;
    }
  }
  const newWs = xlsx.utils.aoa_to_sheet(aoa);
  wb.Sheets["2級"] = newWs;
  xlsx.writeFile(wb, outPath);
  console.log(`Applied ${c} examples to 2級 (1001-1100). Saved.`);
}
main().catch(console.error);
