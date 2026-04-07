const xlsx = require('xlsx');
const fs = require('fs');
const filePath = String.raw`C:\Users\makoto\Documents\GitHub\VocabularyBase\単語リスト\出題頻度順リストのみ_英検英単語.xlsx`;
const outPath = filePath.replace('.xlsx', '_updated.xlsx');
const targetFile = fs.existsSync(outPath) ? outPath : filePath;

const data = [
  {r:1301,en:"His voice made an echo in the empty cave.",ja:"彼の声は空の洞窟の中でこだまを作った。"},
  {r:1302,en:"I have to write an essay for my history class.",ja:"歴史の授業のために論文（エッセイ）を書かなければならない。"},
  {r:1303,en:"The deadline was given a one-week extension.",ja:"締め切りは1週間の延長を与えられた。"},
  {r:1304,en:"The scientist explained the theory of atomic energy.",ja:"その科学者は原子エネルギーの理論を説明した。"},
  {r:1305,en:"She gave a deep sigh of relief.",ja:"彼女は深い安堵のため息をついた。"},
  {r:1306,en:"He has a very sophisticated taste in art.",ja:"彼は芸術に関してとても洗練された好みを持っている。"},
  {r:1307,en:"The project required a considerable amount of money.",ja:"そのプロジェクトはかなりの額のお金を必要とした。"},
  {r:1308,en:"Can you explain the rules of the game to me?",ja:"私にこのゲームのルールを説明してくれますか？"},
  {r:1309,en:"I bet he will be late again.",ja:"彼はまた遅刻するほうに賭けるよ（きっと遅刻するよ）。"},
  {r:1310,en:"Don't forget to water the plants.",ja:"植物に水をやるのを忘れないで。"},
  {r:1311,en:"The wind scattered the leaves all over the garden.",ja:"風が葉を庭じゅうにまき散らした。"},
  {r:1312,en:"I admire her courage to speak the truth.",ja:"真実を話す彼女の勇気を賞賛する。"},
  {r:1313,en:"His success was largely due to his hard work.",ja:"彼の成功は主として彼の懸命な努力によるものだった。"},
  {r:1314,en:"Please enter through the rear door.",ja:"後部のドアから入ってください。"},
  {r:1315,en:"There is a strong bond between the two brothers.",ja:"その二人の兄弟には強い絆（束縛・結びつき）がある。"},
  {r:1316,en:"The police have the authority to arrest criminals.",ja:"警察は犯罪者を逮捕する権威（権力）を持っている。"},
  {r:1317,en:"I'd like my steak cooked medium, please.",ja:"ステーキは中間の焼き加減（ミディアム）でお願いします。"},
  {r:1318,en:"Animals have to adapt to their environment to survive.",ja:"動物は生き残るために環境に適合させなければならない。"},
  {r:1319,en:"It is hard to resist eating sweets when you are on a diet.",ja:"ダイエット中に甘いものを食べるのを抵抗するのは難しい。"},
  {r:1320,en:"Old folks say this medicine is very effective.",ja:"昔の人々はこの薬はとても効果的だと言う。"},
  {r:1321,en:"Shakespeare was a great English poet and playwright.",ja:"シェイクスピアはイギリスの偉大な詩人であり劇作家だった。"},
  {r:1322,en:"We must resolve this conflict peacefully.",ja:"私たちはこの対立を平和的に解決しなければならない。"},
  {r:1323,en:"Please explain the plan in more detail.",ja:"計画をもう少し詳細に説明してください。"},
  {r:1324,en:"Safety is our top priority.",ja:"安全が私たちの最優先事項（優先度）だ。"},
  {r:1325,en:"He gave the police false information.",ja:"彼は警察に誤った情報を与えた。"},
  {r:1326,en:"The prisoner escaped from the jail last night.",ja:"その囚人は昨夜、刑務所から脱走した。"},
  {r:1327,en:"It is apparent that he is not feeling well.",ja:"彼が体調が良くなさそうなのは明白だ。"},
  {r:1328,en:"The scientists are working late in the lab.",ja:"科学者たちは研究室で遅くまで働いている。"},
  {r:1329,en:"Could you squeeze some lemon juice on my fish?",ja:"私の魚にレモンの汁を絞ってくれませんか？"},
  {r:1330,en:"Women have fought for equal status in society.",ja:"女性たちは社会において平等な身分を求めて戦ってきた。"},
  {r:1331,en:"My grandfather lives on a small pension.",ja:"私の祖父は少額の年金で暮らしている。"},
  {r:1332,en:"Everyone's fingerprint is unique.",ja:"すべての人の指紋は他に類を見ない（唯一のものだ）。"},
  {r:1333,en:"We must try to eliminate discrimination from society.",ja:"私たちは社会から差別を取り除くよう努めなければならない。"},
  {r:1334,en:"He sewed a patch on the hole in his jeans.",ja:"彼はジーンズの穴に当て布を縫い付けた。"},
  {r:1335,en:"The patient was kept under close observation in the hospital.",ja:"その患者は病院で綿密な観察下に置かれた。"},
  {r:1336,en:"Could you buy a dozen eggs at the supermarket?",ja:"スーパーで12個の（1ダースの）卵を買ってきてくれますか？"},
  {r:1337,en:"Which airline are you flying with to London?",ja:"ロンドンへはどの航空会社で飛びますか？"},
  {r:1338,en:"The river flows into the sea.",ja:"川は海に流れる。"},
  {r:1339,en:"Many African countries became independent after World War II.",ja:"第二次世界大戦後、多くのアフリカ諸国が独立した。"},
  {r:1340,en:"The president of the company announced a new strategy.",ja:"会社の社長は新しい戦略を発表した。"},
  {r:1341,en:"His behavior is not socially acceptable.",ja:"彼の振る舞いは社会的に受け入れられない。"},
  {r:1342,en:"It took a long time to settle the dispute.",ja:"その紛争を決着させる（解決する）のには長い時間がかかった。"},
  {r:1343,en:"This island is an ideal place for a summer vacation.",ja:"この島は夏休みのための理想の場所だ。"},
  {r:1344,en:"Please write your name and address on this form.",ja:"この用紙にあなたの名前と住所を書いてください。"},
  {r:1345,en:"We pray for peace around the world.",ja:"私たちは世界中の平和を祈る。"},
  {r:1346,en:"A ray of sunlight came through the window.",ja:"窓から一筋の光線が差し込んだ。"},
  {r:1347,en:"Toyota is a famous Japanese car maker.",ja:"トヨタは日本の有名な自動車の製造元（メーカー）だ。"},
  {r:1348,en:"The soldiers were prepared for close combat.",ja:"兵士たちは接近した戦闘の準備ができていた。"},
  {r:1349,en:"The Ministry of Education announced new guidelines for schools.",ja:"文部科学省（教育の省庁）は学校向けの新しいガイドラインを発表した。"},
  {r:1350,en:"There was a loud explosion at the factory.",ja:"工場で大きな爆発があった。"},
  {r:1351,en:"Scientists are trying to find a way to cure the disease.",ja:"科学者たちはその病気を治療する方法を見つけようとしている。"},
  {r:1352,en:"Smoking is not allowed in public places.",ja:"公共の場所での喫煙は許可されていない。"},
  {r:1353,en:"We will reach Tokyo station at 5 PM.",ja:"私たちは午後5時に東京駅に到着する予定だ。"},
  {r:1354,en:"The new law had a major impact on the economy.",ja:"その新しい法律は経済に大きな影響を与えた。"},
  {r:1355,en:"The workers formed a union to protect their rights.",ja:"労働者たちは自分たちの権利を守るために組合（労働者の統合）を結成した。"},
  {r:1356,en:"He is the author of several best-selling books.",ja:"彼は数冊のベストセラー本の著者だ。"},
  {r:1357,en:"He cut a thick slice of bread.",ja:"彼はパンを厚くスライスした。"},
  {r:1358,en:"He didn't notice her presence in the room.",ja:"彼は部屋の中での彼女の存在に気づかなかった。"},
  {r:1359,en:"The new design will incorporate the suggestions of the customers.",ja:"新しいデザインは顧客の提案を合体させる（取り入れる）だろう。"},
  {r:1360,en:"The rent for this apartment is 80,000 yen a month.",ja:"このアパートの家賃は月に8万円だ。"},
  {r:1361,en:"The company needs to make radical changes to survive.",ja:"会社が生き残るためには抜本的な変更を行う必要がある。"},
  {r:1362,en:"He is studying economics at university.",ja:"彼は大学で経済学を勉強している。"},
  {r:1363,en:"Trust is very important in a friendship.",ja:"友情において信頼はとても重要だ。"},
  {r:1364,en:"Many computers were infected by a new virus.",ja:"多くのコンピューターが新しいウイルスに感染した。"},
  {r:1365,en:"Which political party do you support?",ja:"あなたはどの政党を支持しますか？"},
  {r:1366,en:"The teacher asked a question, but no pupil could answer.",ja:"先生は質問したが、どの生徒も答えることができなかった。"},
  {r:1367,en:"He decided to quit smoking for his health.",ja:"彼は健康のためにタバコを吸うのをやめることに決めた。"},
  {r:1368,en:"It is unusual for him to be late for work.",ja:"彼が仕事に遅れるのは珍しいことだ。"},
  {r:1369,en:"I usually have a light meal in the morning.",ja:"私はたいてい朝は軽い食事をとる。"},
  {r:1370,en:"Our new neighbor seems like a very nice person.",ja:"私たちの新しい隣人はとてもいい人のようだ。"},
  {r:1371,en:"Everyone should have equal civil rights.",ja:"誰もが平等な市民の権利を持つべきだ。"},
  {r:1372,en:"They tried to counter the negative rumors.",ja:"彼らは否定的な噂に対抗しようとした。"},
  {r:1373,en:"The police concluded that his death was a suicide.",ja:"警察は彼の死は自殺だったと結論づけた。"},
  {r:1374,en:"Meat and beans are good sources of protein.",ja:"肉や豆はタンパク質の良い供給源だ。"},
  {r:1375,en:"A recent poll showed that the president is still popular.",ja:"最近の世論調査（投票結果）は、大統領がまだ人気があることを示した。"},
  {r:1376,en:"The agreement was based on mutual trust.",ja:"その合意は相互の信頼に基づいていた。"},
  {r:1377,en:"You must be 18 years old to vote in Japan.",ja:"日本で投票するには18歳でなければならない。"},
  {r:1378,en:"I have to attend an important meeting tomorrow.",ja:"明日は重要な会議に出席しなければならない。"},
  {r:1379,en:"I regret not studying harder when I was a student.",ja:"私は学生の時にもっと一生懸命勉強しなかったことを後悔している。"},
  {r:1380,en:"He has published many academic papers.",ja:"彼は多くの学術的な論文を発表している。"},
  {r:1381,en:"The Supreme Court made a final decision on the case.",ja:"最高裁判所はその事件について最終決定を下した。"},
  {r:1382,en:"This sofa is very soft and comfortable.",ja:"このソファはとても柔らかくて快適だ。"},
  {r:1383,en:"The police suspect his involvement in the crime.",ja:"警察は彼が犯罪に関与していると疑っている。"},
  {r:1384,en:"A large crowd gathered to watch the parade.",ja:"大きな群衆がパレードを見るために集まった。"},
  {r:1385,en:"Children need emotional support from their parents.",ja:"子どもたちは親からの感情の（精神的な）サポートを必要としている。"},
  {r:1386,en:"The company's revenue increased by 10% this year.",ja:"会社の収益は今年10%増加した。"},
  {r:1387,en:"There is a beautiful park in our neighborhood.",ja:"私たちの近所には美しい公園がある。"},
  {r:1388,en:"The safety of the nuclear power plant is a major concern.",ja:"原子力発電所の安全は主要な懸念事項（心配事）だ。"},
  {r:1389,en:"I still remember the day we first met.",ja:"私たちが初めて会った日を私はまだ覚えている。"},
  {r:1390,en:"He was found guilty of stealing the car.",ja:"彼は車を盗んだことで有罪だと判明した。"},
  {r:1391,en:"The stories of ancient Egypt fascinate many people.",ja:"古代エジプトの物語は多くの人々を魅了する。"},
  {r:1392,en:"The assassination was the trigger for the war.",ja:"その暗殺が戦争の引き金となった。"},
  {r:1393,en:"It is important to make a distinction between right and wrong.",ja:"善と悪の区別をすることは重要だ。"},
  {r:1394,en:"The internet has transformed the way we communicate.",ja:"インターネットは私たちがコミュニケーションをとる方法を変えた。"},
  {r:1395,en:"I need to transfer money to my son's bank account.",ja:"息子の銀行口座にお金を移す（振り込む）必要がある。"},
  {r:1396,en:"The soldiers must obey the commander's orders.",ja:"兵士たちは司令官の命令に従わなければならない。"},
  {r:1397,en:"The cat tried to hide under the bed.",ja:"猫はベッドの下に隠れようとした。"},
  {r:1398,en:"Ice is water in its solid state.",ja:"氷は固形状態の水だ。"},
  {r:1399,en:"He explained the rules in plain English.",ja:"彼はわかりやすい英語でルールを説明した。"},
  {r:1400,en:"He passed the difficult exam with ease.",ja:"彼は難しい試験に容易さをもって（難なく）合格した。"},
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
  console.log(`Applied ${c} examples to 2級 (1301-1400). Saved.`);
}
main().catch(console.error);
