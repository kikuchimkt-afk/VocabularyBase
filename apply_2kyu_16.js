const xlsx = require('xlsx');
const fs = require('fs');
const filePath = String.raw`C:\Users\makoto\Documents\GitHub\VocabularyBase\単語リスト\出題頻度順リストのみ_英検英単語.xlsx`;
const outPath = filePath.replace('.xlsx', '_updated.xlsx');
const targetFile = fs.existsSync(outPath) ? outPath : filePath;

const data = [
  {r:1501,en:"Many customers complained about the slow service.",ja:"多くの顧客がサービスの遅さについて不満を言った。"},
  {r:1502,en:"He works for the county government.",ja:"彼は州（郡）の政府で働いている。"},
  {r:1503,en:"The team has many loyal supporters.",ja:"そのチームには多くの忠実な支援者（サポーター）がいる。"},
  {r:1504,en:"The federal government passed a new environmental law.",ja:"連邦政府は新しい環境法を可決した。"},
  {r:1505,en:"The rabbit has soft, white fur.",ja:"そのウサギは柔らかくて白い毛皮を持っている。"},
  {r:1506,en:"This area is known as the commercial center of the city.",ja:"この地域は市の商業の中心地として知られている。"},
  {r:1507,en:"The animal showed no signs of aggression.",ja:"その動物は攻撃性の兆候を全く見せなかった。"},
  {r:1508,en:"I read the entire book in one day.",ja:"私はその本全体を1日で読んだ。"},
  {r:1509,en:"Don't make such silly mistakes.",ja:"そんな馬鹿な（愚かな）間違いをしないでください。"},
  {r:1510,en:"They built a strong wall with red bricks.",ja:"彼らは赤いれんがで丈夫な壁を建てた。"},
  {r:1511,en:"This rumor has no basis in fact.",ja:"この噂は事実に基づく根拠が全くない。"},
  {r:1512,en:"We must protect the forest from being destroyed.",ja:"私たちは森が破壊されるのから守らなければならない。"},
  {r:1513,en:"Please confirm your flight reservation online.",ja:"オンラインでフライトの予約を確認してください。"},
  {r:1514,en:"He has a broad knowledge of world history.",ja:"彼は世界史に関する広い知識を持っている。"},
  {r:1515,en:"Do you have any prior experience in this field?",ja:"あなたはこの分野で前の（事前の）経験がありますか？"},
  {r:1516,en:"He must face the consequences of his actions.",ja:"彼は自分の行動の結果に直面しなければならない。"},
  {r:1517,en:"It is pretty cold outside today.",ja:"今日は外はかなり寒い。"},
  {r:1518,en:"If the TV is broken, contact the manufacturer.",ja:"もしテレビが壊れたら、製造元に連絡してください。"},
  {r:1519,en:"There is a new art exhibition at the museum.",ja:"博物館で新しい芸術の展示がある。"},
  {r:1520,en:"The police car was cruising around the neighborhood.",ja:"パトカーが近所を巡航（パトロール）していた。"},
  {r:1521,en:"She has an extraordinary talent for playing the violin.",ja:"彼女はバイオリンを弾く普通でない（並外れた）才能を持っている。"},
  {r:1522,en:"What do you like to do in your leisure time?",ja:"余暇には何をするのが好きですか？"},
  {r:1523,en:"He suffered multiple injuries in the crash.",ja:"彼はその衝突で複数の（多数の）怪我を負った。"},
  {r:1524,en:"There is a wide variation in temperatures during spring.",ja:"春の間は気温に大きな変化がある。"},
  {r:1525,en:"Red is a color that really suits you.",ja:"赤はあなたに本当に適合する（似合う）色だ。"},
  {r:1526,en:"The movie is very popular among teenagers.",ja:"その映画は十代の若者の間でとても人気がある。"},
  {r:1527,en:"He walked on the beach with bare feet.",ja:"彼は裸の足（裸足）でビーチを歩いた。"},
  {r:1528,en:"Only a small minority of people voted against the plan.",ja:"その計画に反対票を投じたのはわずかな少数派だけだった。"},
  {r:1529,en:"The town's population has increased rapidly.",ja:"その町の人口は素早く（急速に）増加した。"},
  {r:1530,en:"It is odd that she hasn't called me yet.",ja:"彼女がまだ私に電話してこないのは変だ。"},
  {r:1531,en:"My father is mowing the lawn in the garden.",ja:"父は庭で芝生を刈っている。"},
  {r:1532,en:"Water consists of hydrogen and oxygen.",ja:"水は水素と酸素から成り立つ。"},
  {r:1533,en:"It is his duty to protect the citizens.",ja:"市民を守ることは彼の職務（義務）だ。"},
  {r:1534,en:"He stayed in London for a period of six months.",ja:"彼は6ヶ月の期間、ロンドンに滞在した。"},
  {r:1535,en:"The school offers a comprehensive training program.",ja:"その学校は包括的なトレーニングプログラムを提供している。"},
  {r:1536,en:"Winning the gold medal was his greatest achievement.",ja:"金メダルを獲得したことは彼の最も偉大な達成（業績）だった。"},
  {r:1537,en:"He paid a large sum of money for the painting.",ja:"彼はその絵に大きな合計の（多額の）お金を支払った。"},
  {r:1538,en:"She seems to be very happy today.",ja:"彼女は今日とても幸せそうに見える。"},
  {r:1539,en:"The government will implement the new policy next month.",ja:"政府は来月、新しい政策を実施するだろう。"},
  {r:1540,en:"The interior of the house was painted white.",ja:"その家の内部は白く塗られていた。"},
  {r:1541,en:"I need to calculate the total cost of the trip.",ja:"旅行の総費用を計算する必要がある。"},
  {r:1542,en:"The strong team dominated the soccer game.",ja:"その強いチームがサッカーの試合を支配した。"},
  {r:1543,en:"You have a legal obligation to pay taxes.",ja:"あなたには税金を支払う法的な義務がある。"},
  {r:1544,en:"The children shouted with joy when they saw the presents.",ja:"子どもたちはプレゼントを見て喜びで叫んだ。"},
  {r:1545,en:"I have a sore throat today.",ja:"今日はのどが痛い。"},
  {r:1546,en:"The writer has a very rich imagination.",ja:"その作家はとても豊かな想像（想像力）を持っている。"},
  {r:1547,en:"He has been a strong democrat all his life.",ja:"彼は生涯を通じて強い民主主義者だ。"},
  {r:1548,en:"I read the first chapter of the novel last night.",ja:"私は昨夜、その小説の第1章を読んだ。"},
  {r:1549,en:"War is sometimes described as hell on earth.",ja:"戦争は時々、地上の地獄として描写される。"},
  {r:1550,en:"Don't lean against the wall; the paint is still wet.",ja:"壁に寄りかからないで。ペンキがまだ乾いていないから。"},
  {r:1551,en:"She fried the eggs in a pan.",ja:"彼女はフライパンで卵を焼いた。"},
  {r:1552,en:"A sudden blast of wind blew my hat off.",ja:"突然の突風が私の帽子を吹き飛ばした。"},
  {r:1553,en:"Do you think aliens really exist?",ja:"宇宙人は本当に存在すると思いますか？"},
  {r:1554,en:"The politician gave a speech to the crowd.",ja:"その政治家は群衆に向かって演説をした。"},
  {r:1555,en:"The city is an important industrial center.",ja:"その都市は重要な産業の中心地だ。"},
  {r:1556,en:"He is a wealthy merchant who trades silk.",ja:"彼は絹を取引する裕福な商人だ。"},
  {r:1557,en:"Students have an assembly in the hall every Monday.",ja:"生徒たちは毎週月曜日にホールで集合（朝礼など）がある。"},
  {r:1558,en:"The focus of today's meeting is the new project.",ja:"今日の会議の焦点は新しいプロジェクトだ。"},
  {r:1559,en:"The actual cost was much higher than expected.",ja:"現実の費用は予想よりずっと高かった。"},
  {r:1560,en:"There are billions of stars in the universe.",ja:"宇宙には何十億もの星がある。"},
  {r:1561,en:"The dentist touched a sensitive nerve in my tooth.",ja:"歯医者が私の歯の敏感な神経に触れた。"},
  {r:1562,en:"My friends are mostly from the same town.",ja:"私の友達は主に同じ町の出身だ。"},
  {r:1563,en:"He was arrested for criminal activities.",ja:"彼は犯罪の活動で逮捕された。"},
  {r:1564,en:"The teacher asked me to read a passage from the book.",ja:"先生は私に本の一節を読むように頼んだ。"},
  {r:1565,en:"I don't understand the logic behind your decision.",ja:"あなたの決定の背後にある論理が理解できない。"},
  {r:1566,en:"Many problems can arise if we don't plan carefully.",ja:"私たちが慎重に計画しなければ、多くの問題が起こる可能性がある。"},
  {r:1567,en:"You can do whatever you want.",ja:"あなたは自分のやりたいことは何でもしてよい。"},
  {r:1568,en:"The rebels fought against the cruel king.",ja:"反逆者たちは残酷な王と戦った。"},
  {r:1569,en:"We might encounter some difficulties during the trip.",ja:"私たちは旅行中にいくつかの困難に遭遇するかもしれない。"},
  {r:1570,en:"The bad weather depressed her.",ja:"悪天候が彼女を落胆させた。"},
  {r:1571,en:"English is widely spoken around the world.",ja:"英語は世界中で広範囲に話されている。"},
  {r:1572,en:"The company announced its expansion into Asia.",ja:"その会社はアジアへの拡大（事業展開）を発表した。"},
  {r:1573,en:"Some people believe in the existence of ghosts.",ja:"幽霊の存在を信じている人もいる。"},
  {r:1574,en:"That cheese has a very peculiar smell.",ja:"そのチーズはとても奇妙な匂いがする。"},
  {r:1575,en:"My parents are very strict about my curfew.",ja:"両親は私の門限についてとても厳しい。"},
  {r:1576,en:"He has a firm belief in his own abilities.",ja:"彼は自分の能力に対するしっかりした（堅い）信念を持っている。"},
  {r:1577,en:"He made a desperate attempt to save the drowning child.",ja:"彼は溺れている子どもを救おうとやけくその（必死の）試みをした。"},
  {r:1578,en:"What sort of music do you like?",ja:"どんな種類の音楽が好きですか？"},
  {r:1579,en:"Personally, I think it's a bad idea.",ja:"個人的には、それは悪いアイデアだと思う。"},
  {r:1580,en:"The doctor urged him to stop smoking.",ja:"医者は彼にタバコをやめるよう強く促した。"},
  {r:1581,en:"He lost a lot of blood in the accident.",ja:"彼はその事故で多くの血を失った。"},
  {r:1582,en:"Marriage is an important social institution.",ja:"結婚は重要な社会制度だ。"},
  {r:1583,en:"This hotel has excellent sports facilities.",ja:"このホテルは素晴らしいスポーツ施設を備えている。"},
  {r:1584,en:"The flight crew prepared for takeoff.",ja:"フライトの乗組員は離陸の準備をした。"},
  {r:1585,en:"Look up the word in the index at the back of the book.",ja:"本の最後にある索引でその単語を調べなさい。"},
  {r:1586,en:"I had an unpleasant experience at the restaurant.",ja:"私はそのレストランで不愉快な経験をした。"},
  {r:1587,en:"We bought apples, oranges, bananas, etc.",ja:"私たちはリンゴ、オレンジ、バナナ等々を買った。"},
  {r:1588,en:"He is taking an elementary French class.",ja:"彼は初級のフランス語の授業を受けている。"},
  {r:1589,en:"The TV program has millions of viewers.",ja:"そのテレビ番組には何百万人もの視聴者がいる。"},
  {r:1590,en:"Yoga can be a deeply spiritual experience.",ja:"ヨガは深く精神の（精神的な）経験になり得る。"},
  {r:1591,en:"I will attend an international conference next week.",ja:"私は来週、国際会議に出席する。"},
  {r:1592,en:"Water freezes at zero degrees Celsius.",ja:"水は摂氏ゼロ度で凍る。"},
  {r:1593,en:"They had a lively debate about global warming.",ja:"彼らは地球温暖化について活発な討論をした。"},
  {r:1594,en:"Chew your food well before you swallow.",ja:"飲み込む前に食べ物をよく噛みなさい。"},
  {r:1595,en:"I want to convey my thanks to all of you.",ja:"私は皆さんに感謝の気持ちを伝えたい。"},
  {r:1596,en:"It is a great honor to receive this award.",ja:"この賞を受け取ることは大きな名誉だ。"},
  {r:1597,en:"I was late because I was caught in a traffic jam.",ja:"交通渋滞に巻き込まれたため、遅れました。"},
  {r:1598,en:"Please give me a concrete example.",ja:"具体的な例を挙げてください。"},
  {r:1599,en:"The scientists are doing research in the laboratory.",ja:"科学者たちは実験室で研究をしている。"},
  {r:1600,en:"She is a very capable leader.",ja:"彼女はとても才能のある（有能な）リーダーだ。"},
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
  console.log(`Applied ${c} examples to 2級 (1501-1600). Saved.`);
}
main().catch(console.error);
