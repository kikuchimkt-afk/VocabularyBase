const xlsx = require('xlsx');
const fs = require('fs');
const filePath = String.raw`C:\Users\makoto\Documents\GitHub\VocabularyBase\単語リスト\出題頻度順リストのみ_英検英単語.xlsx`;
const outPath = filePath.replace('.xlsx', '_updated.xlsx');
const targetFile = fs.existsSync(outPath) ? outPath : filePath;

const data = [
  {r:1401,en:"The beautiful beach stretches for miles.",ja:"その美しいビーチは何マイルも広がっている。"},
  {r:1402,en:"The committee proposed an amendment to the law.",ja:"委員会は法律への修正を提案した。"},
  {r:1403,en:"Don't shout like that; you'll frighten the children.",ja:"そんな風に叫ばないで。子どもたちを怖がらせてしまうよ。"},
  {r:1404,en:"She wore shoes with high heels to the party.",ja:"彼女はパーティーに高いかかとの靴（ハイヒール）を履いて行った。"},
  {r:1405,en:"Animals can perceive sounds that humans cannot hear.",ja:"動物は人間に聞こえない音を知覚することができる。"},
  {r:1406,en:"We need to make a rational decision based on facts.",ja:"私たちは事実に基づいた理性的な（合理的な）決定を下す必要がある。"},
  {r:1407,en:"I have great faith in his ability.",ja:"私は彼の能力に大きな信頼を置いている。"},
  {r:1408,en:"She spoke with deep conviction about her plan.",ja:"彼女は自分の計画について深い信念を持って話した。"},
  {r:1409,en:"I bought the house through a real estate agent.",ja:"私は不動産の代理人（仲介業者）を通してその家を買った。"},
  {r:1410,en:"He prefers the quiet life of a rural area.",ja:"彼は田舎の地域の静かな生活を好む。"},
  {r:1411,en:"Marie Curie was a pioneer in the field of science.",ja:"マリー・キュリーは科学の分野における開拓者だった。"},
  {r:1412,en:"Global warming is a problem for all of humanity.",ja:"地球温暖化はすべての人間の問題である。"},
  {r:1413,en:"Please return the book within two weeks.",ja:"2週間以内で本を返却してください。"},
  {r:1414,en:"Students should show respect to their teachers.",ja:"生徒たちは先生に尊敬の念を示すべきだ。"},
  {r:1415,en:"Could you sweep the floor for me?",ja:"私のために床を掃いてくれませんか？"},
  {r:1416,en:"The museum will display ancient Egyptian treasures.",ja:"その博物館は古代エジプトの宝物を展示する予定だ。"},
  {r:1417,en:"I saw it with my own eyes.",ja:"私はそれをご自身の（私自身の）目で見ました。"},
  {r:1418,en:"I'm sorry to disappoint you, but I can't come.",ja:"あなたをがっかりさせて申し訳ないが、私は行くことができない。"},
  {r:1419,en:"Please hang your coat on the hook.",ja:"フックにコートを掛けてください。"},
  {r:1420,en:"The country is in a period of transition.",ja:"その国は変遷（過渡期）の時期にある。"},
  {r:1421,en:"We have to make a quick decision.",ja:"私たちは素早い決定を下さなければならない。"},
  {r:1422,en:"I was not aware of the rule changes.",ja:"私はルールの変更に気づいて（知って）いなかった。"},
  {r:1423,en:"He received a big reward for finding the lost dog.",ja:"彼は迷子の犬を見つけたことで大きな褒美（報酬）を受け取った。"},
  {r:1424,en:"This bed is very hard and uncomfortable.",ja:"このベッドはとても硬くて心地が悪い。"},
  {r:1425,en:"In a civilized society, we should solve problems peacefully.",ja:"教養の高い（発達した文明をもつ）社会では、私たちは問題を平和的に解決すべきだ。"},
  {r:1426,en:"Some dogs can become aggressive if they are scared.",ja:"一部の犬は怖がると攻撃的になることがある。"},
  {r:1427,en:"The mother was holding a sleeping infant.",ja:"母親は眠っている乳児を抱いていた。"},
  {r:1428,en:"Bicycles are an eco-friendly means of transportation.",ja:"自転車は環境にやさしい交通の手段（方法）だ。"},
  {r:1429,en:"This broken umbrella is totally useless.",ja:"この壊れた傘は完全に役に立たない。"},
  {r:1430,en:"Could you explain the plan briefly?",ja:"その計画を簡単に（手短に）説明してくれませんか？"},
  {r:1431,en:"They chose a new site for the factory.",ja:"彼らは工場のための新しい場所を選んだ。"},
  {r:1432,en:"We should respect the beauty of nature.",ja:"私たちは自然の美しさを尊重すべきだ。"},
  {r:1433,en:"He speaks in a strong northern dialect.",ja:"彼は強い北部の方言で話す。"},
  {r:1434,en:"Einstein is often called a scientific genius.",ja:"アインシュタインはしばしば科学の天才と呼ばれる。"},
  {r:1435,en:"The school has strict rules about students' conduct.",ja:"学校には生徒の行為に関する厳しい規則がある。"},
  {r:1436,en:"Ants and bees are examples of insects.",ja:"アリやハチは昆虫の例である。"},
  {r:1437,en:"The teacher demonstrated how to use the equipment.",ja:"先生はその機器の使い方を実証（証明・実演）してみせた。"},
  {r:1438,en:"Losing his dog was a very painful experience for him.",ja:"犬を亡くしたことは、彼にとってとても苦痛な経験だった。"},
  {r:1439,en:"He fixed the broken electrical circuit.",ja:"彼は壊れた電気回路を修理した。"},
  {r:1440,en:"The old regime was overthrown by the people.",ja:"古い政権は人々によって打ち倒された。"},
  {r:1441,en:"The noise kept me awake all night.",ja:"騒音のせいで私は一晩中目を覚ましていた。"},
  {r:1442,en:"This dictionary is very useful for learning English.",ja:"この辞書は英語を学ぶのにとても役に立つ。"},
  {r:1443,en:"Movies and games are popular forms of entertainment.",ja:"映画やゲームは人気のある娯楽の形だ。"},
  {r:1444,en:"It is hard to express my feelings in words.",ja:"私の感情を言葉で表現する（言い表す）のは難しい。"},
  {r:1445,en:"Parents make many sacrifices for their children.",ja:"親は子どもたちのために多くの犠牲を払う。"},
  {r:1446,en:"We need to devise a better way to save water.",ja:"私たちは水を節約するより良い方法を考え出す（工夫する）必要がある。"},
  {r:1447,en:"They had an intimate conversation at the cafe.",ja:"彼らはカフェで親密な会話をした。"},
  {r:1448,en:"She seldom watches television.",ja:"彼女はめったにテレビを見ない。"},
  {r:1449,en:"He cannot accept any criticism of his work.",ja:"彼は自分の作品に対するいかなる批判も受け入れることができない。"},
  {r:1450,en:"The price of gasoline has gone up recently.",ja:"最近、ガソリンの値段が上がっている。"},
  {r:1451,en:"Germs are invisible to the naked eye.",ja:"細菌は肉眼では見えない。"},
  {r:1452,en:"All members were present at the meeting.",ja:"すべてのメンバーが会議に出席していた。"},
  {r:1453,en:"We have to finish this task somehow before tomorrow.",ja:"明日までにどうにかしてこの仕事を終わらせなければならない。"},
  {r:1454,en:"They finally reached an agreement on the price.",ja:"彼らはついに価格に関する同意に達した。"},
  {r:1455,en:"Although it was late, he continued to work.",ja:"遅かっただけれども、彼は働き続けた。"},
  {r:1456,en:"The group advocates for the rights of animals.",ja:"そのグループは動物の権利を提唱している。"},
  {r:1457,en:"It is becoming increasingly difficult to find a job.",ja:"仕事を見つけることがますます難しくなっている。"},
  {r:1458,en:"The president has the power to govern the country.",ja:"大統領には国を統治する権力がある。"},
  {r:1459,en:"I prefer reading printed books to electronic books.",ja:"私は電子の本（電子書籍）よりも印刷された本を読む方が好きだ。"},
  {r:1460,en:"Expensive things are not necessarily better.",ja:"高価なものが必然的に（必ずしも）より良いとは限らない。"},
  {r:1461,en:"The country suffered from a severe winter.",ja:"その国は厳しい冬に苦しんだ。"},
  {r:1462,en:"Is 3 PM a convenient time for our meeting?",ja:"午後3時は私たちの会議に都合がよい時間ですか？"},
  {r:1463,en:"This assignment is due next Monday.",ja:"この課題は次の月曜日が期限（納期）だ。"},
  {r:1464,en:"We drove along the beautiful coast.",ja:"私たちは美しい海岸（沿岸地域）に沿ってドライブした。"},
  {r:1465,en:"He lives in extreme poverty.",ja:"彼は極端な貧困の中で暮らしている。"},
  {r:1466,en:"Much to my relief, everyone was safe.",ja:"大いに安堵したことに、全員無事だった。"},
  {r:1467,en:"Don't put the glass on the edge of the table.",ja:"グラスをテーブルの端（縁）に置かないでください。"},
  {r:1468,en:"She is the vice president of the company.",ja:"彼女はその会社の副担当の社長（副社長）だ。"},
  {r:1469,en:"Mount Fuji is a symbol of our national identity.",ja:"富士山は私たちの国の（国民の）アイデンティティの象徴だ。"},
  {r:1470,en:"Elderly people are vulnerable to the cold weather.",ja:"年配の人々は寒い天候に対して傷つきやすい（弱い）。"},
  {r:1471,en:"Darwin proposed the theory of evolution.",ja:"ダーウィンは進化の理論を提唱した。"},
  {r:1472,en:"There is a slight difference between the two colors.",ja:"その2つの色にはわずかな（かすかな）違いがある。"},
  {r:1473,en:"You can always rely on him when you need help.",ja:"助けが必要な時は、いつでも彼に頼ることができる。"},
  {r:1474,en:"English is spoken all over the globe.",ja:"英語は地球（世界）中で話されている。"},
  {r:1475,en:"Japan has a pacifist constitution.",ja:"日本は平和主義の憲法を持っている。"},
  {r:1476,en:"Thank you for your prompt reply.",ja:"あなたの即座の返信に感謝します。"},
  {r:1477,en:"There are strict restrictions on taking liquids onto airplanes.",ja:"飛行機に液体を持ち込むことには厳しい制限がある。"},
  {r:1478,en:"The town has seen rapid growth in recent years.",ja:"その町は近年、急速な成長を遂げている。"},
  {r:1479,en:"A safety inspector will check the factory tomorrow.",ja:"安全の検査官が明日工場をチェックする予定だ。"},
  {r:1480,en:"Humans and chimpanzees are essentially very similar.",ja:"人間とチンパンジーは本質的にとても似ている。"},
  {r:1481,en:"Please select the best answer from the choices below.",ja:"以下の選択肢から最も良い答えを選び出してください。"},
  {r:1482,en:"Diamonds are made of pure carbon.",ja:"ダイヤモンドは純粋な炭素でできている。"},
  {r:1483,en:"We were surprised by the sudden change in weather.",ja:"私たちは突然の天候の変化に驚いた。"},
  {r:1484,en:"I think he broke the window deliberately.",ja:"彼は故意に窓を割ったのだと思う。"},
  {r:1485,en:"He has made a significant contribution to the project.",ja:"彼はそのプロジェクトに重要な貢献をした。"},
  {r:1486,en:"The restaurant employs ten waiters.",ja:"そのレストランは10人のウェイターを雇っている。"},
  {r:1487,en:"Have you heard the latest news?",ja:"最新のニュースを聞きましたか？"},
  {r:1488,en:"These boots are made of tough leather.",ja:"このブーツは頑強な（丈夫な）革で作られている。"},
  {r:1489,en:"The tide is going out now.",ja:"今は潮が引いている。"},
  {r:1490,en:"Good health is your greatest asset.",ja:"健康はあなたの最大の資産だ。"},
  {r:1491,en:"The origin of this festival goes back hundreds of years.",ja:"この祭りの起源は何百年も前にさかのぼる。"},
  {r:1492,en:"Soccer is a very popular sport in Japan.",ja:"サッカーは日本でとても人気のあるスポーツだ。"},
  {r:1493,en:"India was once a British colony.",ja:"インドはかつてイギリスの植民地だった。"},
  {r:1494,en:"We studied the distribution of plants in this area.",ja:"私たちはこの地域の植物の分布を調査した。"},
  {r:1495,en:"The movie has a very exciting plot.",ja:"その映画はとてもワクワクする話の筋を持っている。"},
  {r:1496,en:"They took out a mortgage to buy the house.",ja:"彼らは家を買うために抵当（住宅ローン）を組んだ。"},
  {r:1497,en:"He was arrested for selling illegal drugs.",ja:"彼は違法な麻薬を売ったことで逮捕された。"},
  {r:1498,en:"He may possibly arrive late today.",ja:"彼は今日、ひょっとすると遅れて到着するかもしれない。"},
  {r:1499,en:"Thank you for your helpful advice.",ja:"役に立つ助言をありがとう。"},
  {r:1500,en:"The country began to industrialize in the 19th century.",ja:"その国は19世紀に産業化し始めた。"},
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
  console.log(`Applied ${c} examples to 2級 (1401-1500). Saved.`);
}
main().catch(console.error);
