const xlsx = require('xlsx');
const fs = require('fs');
const filePath = String.raw`C:\Users\makoto\Documents\GitHub\VocabularyBase\単語リスト\出題頻度順リストのみ_英検英単語.xlsx`;
const outPath = filePath.replace('.xlsx', '_updated.xlsx');
const targetFile = fs.existsSync(outPath) ? outPath : filePath;

const generatedData = [
  {"idx":1031,"en":"His room was in a complete mess.","ja":"彼の部屋は完全な混乱状態だった。"},
  {"idx":1032,"en":"The villagers had to flee from the flooding river.","ja":"村人たちは氾濫する川から逃げなければならなかった。"},
  {"idx":1033,"en":"We need to drain the water from the pool.","ja":"プールから水を排出させる必要がある。"},
  {"idx":1034,"en":"His remark about the food was rather rude.","ja":"食べ物についての彼のことば（発言）はかなり失礼だった。"},
  {"idx":1035,"en":"The professor gave an interesting lecture on history.","ja":"教授は歴史についての興味深い講義を行った。"},
  {"idx":1036,"en":"He made a New Year's resolution to exercise daily.","ja":"彼は毎日運動するという新年の決意をした。"},
  {"idx":1037,"en":"The Sahara is the largest desert in the world.","ja":"サハラは世界で最大の砂漠だ。"},
  {"idx":1038,"en":"She advocates for equal rights for all people.","ja":"彼女はすべての人々の平等な権利を提唱する。"},
  {"idx":1039,"en":"I bet you can't solve this difficult puzzle.","ja":"この難しいパズルは解けないと賭ける。"},
  {"idx":1040,"en":"Patience is a characteristic of a good teacher.","ja":"忍耐は良い教師の特有の（独特の）特性だ。"},
  {"idx":1041,"en":"Education is the key to a better future.","ja":"教育はより良い未来への鍵だ。"},
  {"idx":1042,"en":"You can eat whatever you like for dinner.","ja":"夕食になんでも好きなものを食べていいですよ。"},
  {"idx":1043,"en":"What was the main cause of the accident?","ja":"その事故の主な原因は何でしたか？"},
  {"idx":1044,"en":"Marriage is a serious commitment between two people.","ja":"結婚は二人の間の真剣な約束（委託）だ。"},
  {"idx":1045,"en":"The supply of fresh water is running low.","ja":"きれいな水の供給が少なくなってきている。"},
  {"idx":1046,"en":"This is only a temporary solution to the problem.","ja":"これはその問題に対する一時的な解決策にすぎない。"},
  {"idx":1047,"en":"The project involves many different tasks.","ja":"そのプロジェクトは多くの異なる仕事を含む（巻き込む）。"},
  {"idx":1048,"en":"We enjoyed a delicious meal at the restaurant.","ja":"私たちはレストランでおいしい食事を楽しんだ。"},
  {"idx":1049,"en":"We need to replace the old broken computer.","ja":"古い壊れたコンピュータを取り換える（交換する）必要がある。"},
  {"idx":1050,"en":"She had a sad expression on her face.","ja":"彼女の顔には悲しい表現（表情）が浮かんでいた。"},
  {"idx":1051,"en":"A smart investor always studies the market carefully.","ja":"賢い投資家は常に市場を注意深く研究する。"},
  {"idx":1052,"en":"We must protect the future of humanity.","ja":"私たちは人間（人間性）の未来を守らなければならない。"},
  {"idx":1053,"en":"The majority of the students passed the exam.","ja":"生徒の大多数がその試験に合格した。"},
  {"idx":1054,"en":"He possesses a rare collection of old coins.","ja":"彼は珍しい古いコインのコレクションを所有する。"},
  {"idx":1055,"en":"His contribution to science was truly remarkable.","ja":"彼の科学への貢献（寄付）は本当に注目すべきものだった。"},
  {"idx":1056,"en":"She frequently visits her elderly grandmother.","ja":"彼女は頻繁に高齢の祖母を訪問する。"},
  {"idx":1057,"en":"He shrugged his shoulders and said nothing.","ja":"彼は肩をすくめて何も言わなかった。"},
  {"idx":1058,"en":"The machine operator must wear safety goggles.","ja":"機械の操作者は安全ゴーグルを着用しなければならない。"},
  {"idx":1059,"en":"The temperature dropped slightly overnight.","ja":"気温は一晩でわずかに（少し）下がった。"},
  {"idx":1060,"en":"There are different interpretations of the poem.","ja":"その詩にはさまざまな解釈（説明）がある。"},
  {"idx":1061,"en":"You shouldn't rely too much on other people.","ja":"他人にあまり頼るべきではない。"},
  {"idx":1062,"en":"The company announced a reduction in prices.","ja":"その会社は価格の削減（減少）を発表した。"},
  {"idx":1063,"en":"The whole class enjoyed the fun school trip.","ja":"クラス全部の生徒が楽しい遠足を楽しんだ。"},
  {"idx":1064,"en":"I would like to purchase two tickets please.","ja":"チケットを2枚購入したいのですが。"},
  {"idx":1065,"en":"They reached the summit after a long climb.","ja":"彼らは長い登山の後に頂上に達した。"},
  {"idx":1066,"en":"Living without water would be like hell.","ja":"水なしで生活することは地獄のようなものだろう。"},
  {"idx":1067,"en":"Japanese people typically eat rice every day.","ja":"日本人は典型的に毎日お米を食べる。"},
  {"idx":1068,"en":"I really admire her courage and kindness.","ja":"私は彼女の勇気と優しさを本当に賞賛する。"},
  {"idx":1069,"en":"He studied English literature at university.","ja":"彼は大学で英語の文学を学んだ。"},
  {"idx":1070,"en":"Climate change is a global issue we must face.","ja":"気候変動は私たちが向き合わなければならない世界的な問題だ。"},
  {"idx":1071,"en":"The rent for this apartment is too expensive.","ja":"このアパートの家賃は高すぎる。"},
  {"idx":1072,"en":"English is widely spoken around the world.","ja":"英語は世界中で広範囲に話されている。"},
  {"idx":1073,"en":"Customer satisfaction is our top priority.","ja":"顧客の満足が私たちの最優先事項だ。"},
  {"idx":1074,"en":"Don't worry; everything will be fine.","ja":"心配しないで、すべてうまくいくよ。"},
  {"idx":1075,"en":"She rubbed her cold hands together to get warm.","ja":"彼女は温まるために冷たい手をこすり合わせた。"},
  {"idx":1076,"en":"I completely forgot about the important meeting.","ja":"重要な会議のことを完全に（全く）忘れていた。"},
  {"idx":1077,"en":"The snow will disappear when spring comes.","ja":"春が来ると雪は消える（見えなくなる）だろう。"},
  {"idx":1078,"en":"Rising inflation is a serious economic problem.","ja":"上昇するインフレ（膨張）は深刻な経済問題だ。"},
  {"idx":1079,"en":"Maybe we should try a different approach.","ja":"たぶん（おそらく）私たちは異なるアプローチを試すべきだ。"},
  {"idx":1080,"en":"Can you calculate the total cost for me?","ja":"私のために合計金額を計算することができますか？"},
  {"idx":1081,"en":"We need to determine the best course of action.","ja":"私たちは最善の行動方針を決める必要がある。"},
  {"idx":1082,"en":"She enjoys Mexican food very much.","ja":"彼女はメキシコの料理がとても好きだ。"},
  {"idx":1083,"en":"Rice is an important crop in many Asian countries.","ja":"米は多くのアジアの国で重要な収穫物（作物）だ。"},
  {"idx":1084,"en":"The prosecution presented strong evidence in court.","ja":"検察側（起訴側）は法廷で強力な証拠を提出した。"},
  {"idx":1085,"en":"She stubbed her toe on the heavy table leg.","ja":"彼女はテーブルの脚に足の指（つま先）をぶつけた。"},
  {"idx":1086,"en":"He seized the thief by the arm quickly.","ja":"彼は素早く泥棒の腕をつかんだ。"},
  {"idx":1087,"en":"Children should use their imagination freely.","ja":"子どもは自由に想像を使うべきだ。"},
  {"idx":1088,"en":"The governor spoke about the new state policy.","ja":"知事は新しい州の政策について話した。"},
  {"idx":1089,"en":"Her curiosity led her to explore the old cave.","ja":"彼女の好奇心が古い洞窟を探検することへと導いた。"},
  {"idx":1090,"en":"The sun will rise at six o'clock tomorrow.","ja":"明日太陽は6時に上がる（昇る）。"},
  {"idx":1091,"en":"The happy dog wagged its tail excitedly.","ja":"嬉しそうな犬は興奮して尾を振った。"},
  {"idx":1092,"en":"Everyone passed the test except Tom.","ja":"トムを除いて全員がテストに合格した。"},
  {"idx":1093,"en":"The tired cat was lying on the warm sofa.","ja":"疲れた猫は暖かいソファの上に横たわっていた。"},
  {"idx":1094,"en":"She tied the package with a strong string.","ja":"彼女は丈夫な紐（糸）で荷物を結んだ。"},
  {"idx":1095,"en":"The president appointed her as the new minister.","ja":"大統領は彼女を新しい大臣に任命した（指定した）。"},
  {"idx":1096,"en":"The country increased its military spending.","ja":"その国は軍隊の支出を増やした。"},
  {"idx":1097,"en":"An international conference was held in Geneva.","ja":"ジュネーブで国際会議が開催された。"},
  {"idx":1098,"en":"Please give me a clear explanation of the rules.","ja":"ルールについての明確な説明をしてください。"},
  {"idx":1099,"en":"The restaurant had a relaxing atmosphere.","ja":"そのレストランはくつろいだ雰囲気があった。"},
  {"idx":1100,"en":"The child ran toward his waiting mother.","ja":"子どもは待っている母親のほうへ（向かって）走った。"},
  {"idx":1101,"en":"This station is convenient for shopping.","ja":"この駅は買い物に便利な（都合がよい）。"},
  {"idx":1102,"en":"She studied hard for the entrance examination.","ja":"彼女は入学試験に向けて懸命に勉強した。"},
  {"idx":1103,"en":"What sort of music do you like best?","ja":"どの種類の音楽が一番好きですか？"},
  {"idx":1104,"en":"I strongly recommend this wonderful book.","ja":"私はこの素晴らしい本を強く推薦します。"},
  {"idx":1105,"en":"Many people fear the darkness of night.","ja":"多くの人が夜の暗闇を恐れる。"},
  {"idx":1106,"en":"She has the ability to speak five languages.","ja":"彼女は5つの言語を話す能力を持っている。"},
  {"idx":1107,"en":"He needs to lose some weight for his health.","ja":"彼は健康のために体重（重さ）を少し減らす必要がある。"},
  {"idx":1108,"en":"The club decided to exclude him from the group.","ja":"クラブは彼をグループから除くことに決めた。"},
  {"idx":1109,"en":"Strict discipline is important in the classroom.","ja":"厳格なしつけ（規律）は教室で重要だ。"},
  {"idx":1110,"en":"Let's share the pizza equally among everyone.","ja":"ピザをみんなで平等に分かち合おう。"},
  {"idx":1111,"en":"This new drug is potentially very dangerous.","ja":"この新しい薬は潜在的に非常に危険だ。"},
  {"idx":1112,"en":"To what extent do you agree with this idea?","ja":"この考えにどの程度（大きさ）まで賛成しますか？"},
  {"idx":1113,"en":"We had a long discussion about the new plan.","ja":"私たちは新しい計画について長い議論（討論）をした。"},
  {"idx":1114,"en":"The early settlement of pioneers was very hard.","ja":"開拓者たちの初期の定住（移住）は非常に困難だった。"},
  {"idx":1115,"en":"An enormous whale swam past our small boat.","ja":"非常に大きいクジラが私たちの小さなボートのそばを泳いで行った。"},
  {"idx":1116,"en":"I felt his strong presence in the quiet room.","ja":"静かな部屋で彼の強い存在を感じた。"},
  {"idx":1117,"en":"This medicine is very effective against the flu.","ja":"この薬はインフルエンザに対して非常に効果的だ。"},
  {"idx":1118,"en":"The country experienced rapid economic growth.","ja":"その国は急速な経済成長を経験した。"},
  {"idx":1119,"en":"This theory has no scientific basis at all.","ja":"この理論には科学的な根拠（土台）が全くない。"},
  {"idx":1120,"en":"The military commander led the troops bravely.","ja":"軍の司令官は勇敢に軍隊を率いた。"},
  {"idx":1121,"en":"The party proposed radical changes to the law.","ja":"その党は法律への急進的な（抜本的な）変更を提案した。"},
  {"idx":1122,"en":"Every individual has the right to be heard.","ja":"すべての個人の（個々の）人は意見を聞いてもらう権利がある。"},
  {"idx":1123,"en":"She keeps a daily journal of her thoughts.","ja":"彼女は自分の考えの日誌（日記）を毎日つけている。"},
  {"idx":1124,"en":"You should avoid eating too much sugar.","ja":"砂糖の摂りすぎを避ける（回避する）べきだ。"},
  {"idx":1125,"en":"He hammered the wooden stake into the ground.","ja":"彼は木のくいを地面に打ち込んだ。"},
  {"idx":1126,"en":"Could you possibly help me carry this box?","ja":"ひょっとするとこの箱を運ぶのを手伝っていただけますか？"},
  {"idx":1127,"en":"We must stop the cycle of violence in society.","ja":"社会における暴力（乱暴）の連鎖を止めなければならない。"},
  {"idx":1128,"en":"It is likely to rain this afternoon.","ja":"今日の午後は雨が降りそうだ（起こりそうだ）。"},
  {"idx":1129,"en":"Movies are a popular form of entertainment.","ja":"映画は人気のある娯楽の形態だ。"},
  {"idx":1130,"en":"His opinion is the opposite of mine.","ja":"彼の意見は私のものと反対だ。"}
];

async function main() {
  const wb = xlsx.readFile(targetFile);
  const ws = wb.Sheets["準2級"];
  const aoa = xlsx.utils.sheet_to_json(ws, { header: 1, defval: "" });
  let appliedCount = 0;
  for (const item of generatedData) {
    if (aoa[item.idx] && aoa[item.idx][3] === "") {
        aoa[item.idx][3] = item.en;
        aoa[item.idx][4] = item.ja;
        appliedCount++;
    }
  }
  const newWs = xlsx.utils.aoa_to_sheet(aoa);
  wb.Sheets["準2級"] = newWs;
  xlsx.writeFile(wb, outPath);
  console.log(`Successfully applied ${appliedCount} examples. Saved to ${outPath}`);
}
main().catch(console.error);
