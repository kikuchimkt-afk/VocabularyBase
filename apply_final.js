const xlsx = require('xlsx');
const fs = require('fs');
const filePath = String.raw`C:\Users\makoto\Documents\GitHub\VocabularyBase\単語リスト\出題頻度順リストのみ_英検英単語.xlsx`;
const outPath = filePath.replace('.xlsx', '_updated.xlsx');
const targetFile = fs.existsSync(outPath) ? outPath : filePath;

const generatedData = [
  {"idx":1131,"en":"This is a quiet residential district.","ja":"ここは静かな住宅地域だ。"},
  {"idx":1132,"en":"Domestic flights are cheaper than international ones.","ja":"国内の（家庭の）便は国際便より安い。"},
  {"idx":1133,"en":"The boy can pitch the ball very fast.","ja":"その少年はとても速くボールを投げることができる。"},
  {"idx":1134,"en":"This is a building of great historical importance.","ja":"これは歴史上の非常に重要な建物だ。"},
  {"idx":1135,"en":"The bullet hit the wall and left a hole.","ja":"弾丸が壁に当たり穴を残した。"},
  {"idx":1136,"en":"The company's revenue increased by twenty percent.","ja":"会社の収益（所得）は20％増加した。"},
  {"idx":1137,"en":"Democracy gives people the right to vote freely.","ja":"民主主義は人々に自由に投票する権利を与える。"},
  {"idx":1138,"en":"New legislation was passed to protect the environment.","ja":"環境を保護するための新しい立法が可決された。"},
  {"idx":1139,"en":"She held the baby close to her breast.","ja":"彼女は赤ちゃんを胸部に抱き寄せた。"},
  {"idx":1140,"en":"The actual cost was higher than we expected.","ja":"現実の費用は私たちが予想したよりも高かった。"},
  {"idx":1141,"en":"She is eager to learn new things every day.","ja":"彼女は毎日新しいことを学びたいと強く望んでいる。"},
  {"idx":1142,"en":"Is it possible to finish this work by Friday?","ja":"金曜日までにこの仕事を終えることは可能ですか？"},
  {"idx":1143,"en":"There is a famous Japanese proverb about patience.","ja":"忍耐についての有名な日本のことわざがある。"},
  {"idx":1144,"en":"The test measures your psychological well-being.","ja":"そのテストはあなたの心理的な健康度を測定する。"},
  {"idx":1145,"en":"The war forced many people to become refugees.","ja":"戦争は多くの人々を難民にさせた。"},
  {"idx":1146,"en":"What is the origin of this old tradition?","ja":"この古い伝統の起源は何ですか？"},
  {"idx":1147,"en":"They use large trucks to transport the goods.","ja":"彼らは商品を輸送するために大きなトラックを使う。"},
  {"idx":1148,"en":"I disagree with that strange notion entirely.","ja":"私はその奇妙な考え（意見）に全く同意しない。"},
  {"idx":1149,"en":"I was initially nervous, but soon relaxed.","ja":"最初は緊張していたが、すぐにリラックスした。"},
  {"idx":1150,"en":"There is no doubt that she is very talented.","ja":"彼女がとても才能があることに疑い（疑問）の余地はない。"},
  {"idx":1151,"en":"He sighed deeply when he heard the sad news.","ja":"彼は悲しい知らせを聞いて深くため息をついた。"},
  {"idx":1152,"en":"The scientists work in a modern laboratory.","ja":"科学者たちは近代的な実験室（研究所）で働いている。"},
  {"idx":1153,"en":"The children screamed with delight at the surprise.","ja":"子どもたちはサプライズに喜び（歓喜）の声を上げた。"},
  {"idx":1154,"en":"The train will arrive shortly at the platform.","ja":"電車はまもなくホームに到着するだろう。"},
  {"idx":1155,"en":"Music is a universal language understood by everyone.","ja":"音楽は誰にでも理解される普遍的な（万能の）言語だ。"},
  {"idx":1156,"en":"He will surely pass the difficult entrance exam.","ja":"彼は確かにその難しい入試に合格するだろう。"},
  {"idx":1157,"en":"Child labor is a serious problem in some countries.","ja":"児童労働はいくつかの国で深刻な問題だ。"},
  {"idx":1158,"en":"The entire building was destroyed by the earthquake.","ja":"建物の全体の（全部の）部分が地震で破壊された。"},
  {"idx":1159,"en":"He donated blood to help save a patient's life.","ja":"彼は患者の命を救うために血（血液）を献血した。"},
  {"idx":1160,"en":"I wonder if she will come to the party tonight.","ja":"彼女が今夜のパーティーに来るかなと思う。"},
  {"idx":1161,"en":"A serious problem may arise if we wait too long.","ja":"あまり長く待つと深刻な問題が起こる（現れる）かもしれない。"},
  {"idx":1162,"en":"We should incorporate new ideas into our plan.","ja":"新しいアイデアを計画に合体させる（取り入れる）べきだ。"},
  {"idx":1163,"en":"He is a mere child; don't be so harsh.","ja":"彼は単なる子供だ、そんなに厳しくしないで。"},
  {"idx":1164,"en":"What is the first item on today's meeting agenda?","ja":"今日の会議の議題の最初の項目は何ですか？"},
  {"idx":1165,"en":"The movie was filled with scenes of terror.","ja":"その映画は恐怖のシーンで満たされていた。"},
  {"idx":1166,"en":"I truly appreciate your kind help and support.","ja":"あなたの親切な助けと支援を真に（正確に）感謝します。"},
  {"idx":1167,"en":"Sleep is necessary for good health.","ja":"睡眠は健康にとって必要なものだ。"},
  {"idx":1168,"en":"Science helps us understand the natural world.","ja":"科学は私たちが自然界を理解するのに役立つ。"},
  {"idx":1169,"en":"Could you do me a favor and open the window?","ja":"窓を開けるという親切な行為をしていただけますか？"},
  {"idx":1170,"en":"The global recession affected many businesses.","ja":"世界的な不況（後退）は多くの企業に影響を与えた。"},
  {"idx":1171,"en":"The military aircraft flew over the wide ocean.","ja":"軍用の航空機が広い海の上を飛んだ。"},
  {"idx":1172,"en":"He was sent to prison for committing a crime.","ja":"彼は犯罪を犯したため刑務所に送られた。"},
  {"idx":1173,"en":"Today is the tenth anniversary of our school.","ja":"今日は私たちの学校の10周年の記念日だ。"},
  {"idx":1174,"en":"There is a real possibility of rain tomorrow.","ja":"明日雨が降る現実的な可能性（実現性）がある。"},
  {"idx":1175,"en":"The numbers should be arranged in a proper sequence.","ja":"数字は適切な連続した順番に並べるべきだ。"},
  {"idx":1176,"en":"I noticed a slight change in her voice.","ja":"彼女の声にかすかな（わずかの）変化に気づいた。"},
  {"idx":1177,"en":"The customer complained about the slow service.","ja":"顧客（お客様）は遅いサービスについて苦情を言った。"},
  {"idx":1178,"en":"Please inform me when the package arrives.","ja":"荷物が届いたら私に知らせてください。"},
  {"idx":1179,"en":"Parking here is illegal and you will get a fine.","ja":"ここに駐車することは違法で、罰金を取られます。"},
  {"idx":1180,"en":"The police began an investigation into the robbery.","ja":"警察はその強盗事件についての調査を開始した。"},
  {"idx":1181,"en":"She suffered from depression after losing her job.","ja":"彼女は仕事を失った後、落ち込み（不景気）に苦しんだ。"},
  {"idx":1182,"en":"What is the matter with you today?","ja":"今日はどうしたの（問題は何ですか）？"},
  {"idx":1183,"en":"You cannot pass the test unless you study hard.","ja":"懸命に勉強しない限りテストに合格できない。"},
  {"idx":1184,"en":"Food and water are basic necessities of life.","ja":"食べ物と水は生活の基本的な必要性だ。"},
  {"idx":1185,"en":"The Supreme Court made the final important decision.","ja":"最高の（最高級の）裁判所が最終的な重要な決定を下した。"},
  {"idx":1186,"en":"The country faced a severe winter this year.","ja":"その国は今年厳しい冬に直面した。"},
  {"idx":1187,"en":"The injured soldier left a bloody trail behind.","ja":"負傷した兵士は血の跡を残した。"},
  {"idx":1188,"en":"The two cities are fifty miles apart from each other.","ja":"その二つの都市はお互いに50マイル離れている。"},
  {"idx":1189,"en":"The fisherman cast his net into the deep sea.","ja":"漁師は深い海に網を投げた。"},
  {"idx":1190,"en":"Which airline do you usually fly with?","ja":"あなたは普段どの航空会社を利用しますか？"},
  {"idx":1191,"en":"Online trading has become very popular recently.","ja":"オンラインの取引は最近非常に人気になっている。"},
  {"idx":1192,"en":"We walked along a narrow path through the woods.","ja":"私たちは森の中の狭い小道を歩いた。"},
  {"idx":1193,"en":"I really appreciate your help with this project.","ja":"このプロジェクトでの助けを本当に感謝します。"},
  {"idx":1194,"en":"There is a small crack in the old wall.","ja":"古い壁に小さな裂け目（ひび）がある。"},
  {"idx":1195,"en":"Don't hesitate to ask me if you need help.","ja":"助けが必要ならためらわずに私に聞いてください。"},
  {"idx":1196,"en":"On the contrary, I think it's a great idea.","ja":"反対に、私はそれは素晴らしいアイディアだと思う。"},
  {"idx":1197,"en":"The result may change depending on the weather.","ja":"結果は天気に依存して（次第で）変わるかもしれない。"},
  {"idx":1198,"en":"The average household has two or three children.","ja":"平均的な家族（世帯）には2〜3人の子どもがいる。"},
  {"idx":1199,"en":"The room was filled with happy laughter.","ja":"部屋は幸せな笑いで満たされていた。"},
  {"idx":1200,"en":"Many teenagers enjoy using social media every day.","ja":"多くの十代の若者が毎日ソーシャルメディアを楽しんでいる。"},
  {"idx":1201,"en":"The rate of crime has decreased in this city.","ja":"この都市の犯罪率は低下した。"},
  {"idx":1202,"en":"The loud thunder frightened the small children.","ja":"大きな雷が小さな子どもたちを怖がらせた。"},
  {"idx":1203,"en":"Sales improved in the last quarter of the year.","ja":"売上は年の最後の四半期に改善した。"},
  {"idx":1204,"en":"They took out a mortgage to buy a new house.","ja":"彼らは新しい家を買うために抵当（担保）ローンを組んだ。"},
  {"idx":1205,"en":"The red light indicates that the machine is on.","ja":"赤いランプは機械がオンであることを指し示す。"},
  {"idx":1206,"en":"He had a stroke and was taken to the hospital.","ja":"彼は打撃（脳卒中）を起こし病院に運ばれた。"},
  {"idx":1207,"en":"There is a serious shortage of clean drinking water.","ja":"清潔な飲料水の深刻な不足（欠乏）がある。"},
  {"idx":1208,"en":"The team went to explore the deep mysterious cave.","ja":"チームは深くて神秘的な洞窟を探索しに行った。"},
  {"idx":1209,"en":"He owns a lot of valuable property in the city.","ja":"彼は都市に多くの貴重な財産（所有物）を所有している。"},
  {"idx":1210,"en":"The lake will freeze if the temperature drops more.","ja":"気温がもっと下がれば湖は凍るだろう。"},
  {"idx":1211,"en":"Please listen closely to my important instructions.","ja":"私の重要な指示を綿密に聞いてください。"},
  {"idx":1212,"en":"They started a new business venture together.","ja":"彼らは一緒に新しい冒険的事業を始めた。"},
  {"idx":1213,"en":"The test was pretty difficult for most students.","ja":"そのテストはほとんどの学生にとってかなり難しかった。"},
  {"idx":1214,"en":"I opened a new bank account yesterday.","ja":"私は昨日新しい銀行口座を開設した。"},
  {"idx":1215,"en":"This is an internal matter for the company.","ja":"これは会社の内部の問題だ。"},
  {"idx":1216,"en":"Be careful near the edge of the high cliff.","ja":"高い崖の端（縁）の近くでは注意してください。"},
  {"idx":1217,"en":"Environmental pollution is a global concern today.","ja":"環境の汚染は今日の世界的な懸念だ。"},
  {"idx":1218,"en":"We have plenty of time before the train leaves.","ja":"電車が出発するまでにたくさんの時間がある。"},
  {"idx":1219,"en":"The committee proposed an amendment to the rule.","ja":"委員会はそのルールへの修正を提案した。"},
  {"idx":1220,"en":"Cotton fiber is used to make soft clothes.","ja":"綿の繊維は柔らかい服を作るのに使われる。"},
  {"idx":1221,"en":"The weather today is somewhat colder than yesterday.","ja":"今日の天気は昨日よりいくぶん（いくらか）寒い。"},
  {"idx":1222,"en":"There are strict restrictions on importing certain goods.","ja":"特定の商品の輸入には厳しい制限がある。"}
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
