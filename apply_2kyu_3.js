const xlsx = require('xlsx');
const fs = require('fs');
const filePath = String.raw`C:\Users\makoto\Documents\GitHub\VocabularyBase\単語リスト\出題頻度順リストのみ_英検英単語.xlsx`;
const outPath = filePath.replace('.xlsx', '_updated.xlsx');
const targetFile = fs.existsSync(outPath) ? outPath : filePath;

const data = [
  {r:201,en:"He lives a life of luxury in a big house.",ja:"彼は大きな家で贅沢な生活を送っている。"},
  {r:202,en:"The internet has changed our lives over the past decade.",ja:"インターネットはこの10年間で私たちの生活を変えた。"},
  {r:203,en:"They spent an enormous amount of money on the project.",ja:"彼らはそのプロジェクトに非常に大きなお金を使った。"},
  {r:204,en:"We need to find a replacement for the broken machine.",ja:"私たちは壊れた機械の代わり（置換）を見つける必要がある。"},
  {r:205,en:"Let's stay in touch after we graduate.",ja:"卒業した後も連絡を取り合おう。"},
  {r:206,en:"The complex rules confused many students.",ja:"その複雑なルールは多くの生徒を混乱させた。"},
  {r:207,en:"This factory produces thousands of cars every month.",ja:"この工場は毎月何千台もの車を生産している。"},
  {r:208,en:"The country's economy is growing rapidly.",ja:"その国の経済は急速に成長している。"},
  {r:209,en:"We will celebrate his birthday this weekend.",ja:"私たちは今週末、彼の誕生日を祝う予定だ。"},
  {r:210,en:"She is trying to cope with the stress of her new job.",ja:"彼女は新しい仕事のストレスに対処しようとしている。"},
  {r:211,en:"Children often imitate their parents' behavior.",ja:"子供はよく親の行動を真似る。"},
  {r:212,en:"I have to finish my math assignment by tomorrow.",ja:"明日までに数学の課題（割り当て）を終わらせなければならない。"},
  {r:213,en:"I will certainly help you with your project.",ja:"間違いなくあなたのプロジェクトを手伝います。"},
  {r:214,en:"He behaved well at the party.",ja:"彼はパーティーで立派に振る舞った。"},
  {r:215,en:"She can play several musical instruments.",ja:"彼女はいくつかの楽器を演奏できる。"},
  {r:216,en:"I found a temporary job for the summer.",ja:"私は夏の間の一時的な仕事を見つけた。"},
  {r:217,en:"He is capable of solving difficult problems.",ja:"彼は難しい問題を解くことができる。"},
  {r:218,en:"She arranged the flowers beautifully in the vase.",ja:"彼女は花瓶に花を美しく配置した（生けた）。"},
  {r:219,en:"I bought a new suit for a special occasion.",ja:"特別な行事のために新しいスーツを買った。"},
  {r:220,en:"She takes after her mother in many ways.",ja:"彼女は多くの点で母親に似ている。"},
  {r:221,en:"He was found guilty of stealing the money.",ja:"彼はお金を盗んだ罪を犯していると判明した。"},
  {r:222,en:"I work out at the gym three times a week.",ja:"私は週に3回ジムで運動する。"},
  {r:223,en:"The government is trying to promote tourism.",ja:"政府は観光を促進しようとしている。"},
  {r:224,en:"The storm cut off the electricity to the town.",ja:"嵐でその町への電力が絶たれた。"},
  {r:225,en:"Beethoven is a famous classical composer.",ja:"ベートーヴェンは有名なクラシックの作曲家だ。"},
  {r:226,en:"The deep ocean is home to many strange creatures.",ja:"深海は多くの奇妙な生き物の住み処である。"},
  {r:227,en:"Water is an important substance for all living things.",ja:"水はすべての生き物にとって重要な物質である。"},
  {r:228,en:"He plans to graduate from university next year.",ja:"彼は来年大学を卒業する予定だ。"},
  {r:229,en:"They bought new furniture for their living room.",ja:"彼らは居間のために新しい家具を買った。"},
  {r:230,en:"You should take this medicine three times a day.",ja:"あなたはこの薬を1日3回飲むべきだ。"},
  {r:231,en:"At last, the long winter is over.",ja:"ついに、長い冬が終わった。"},
  {r:232,en:"She has a positive attitude toward her work.",ja:"彼女は仕事に対して前向きな態度を持っている。"},
  {r:233,en:"Can I borrow your dictionary for a moment?",ja:"少しの間、あなたの辞書を借りてもいいですか？"},
  {r:234,en:"We have sufficient food for the trip.",ja:"私たちは旅行のための十分な食べ物を持っている。"},
  {r:235,en:"I hope to hear from you soon.",ja:"近いうちにあなたから連絡をもらうことを望みます。"},
  {r:236,en:"Please speak directly to the manager.",ja:"マネージャーに直接話してください。"},
  {r:237,en:"Kyoto is full of historic buildings.",ja:"京都は歴史に残る（由緒ある）建物でいっぱいだ。"},
  {r:238,en:"I barely caught the last train.",ja:"私はかろうじて最終電車に間に合った。"},
  {r:239,en:"I accidentally deleted important files.",ja:"私は誤って重要なファイルを削除してしまった。"},
  {r:240,en:"This is an urgent message for you.",ja:"これはあなたへの緊急のメッセージです。"},
  {r:241,en:"It was generous of him to pay for our dinner.",ja:"私たちの夕食代を払ってくれるなんて、彼は気前がよかった。"},
  {r:242,en:"It is cruel to treat animals badly.",ja:"動物をひどく扱うのは残酷だ。"},
  {r:243,en:"We had a big celebration for their graduation.",ja:"私たちは彼らの卒業の大きなお祝いをした。"},
  {r:244,en:"He looked at his reflection in the mirror.",ja:"彼は鏡に映る自分の反射（姿）を見た。"},
  {r:245,en:"The concept of democracy is important.",ja:"民主主義の概念は重要だ。"},
  {r:246,en:"She whispered the secret into my ear.",ja:"彼女は私の耳に秘密をささやいた。"},
  {r:247,en:"I need to deposit some money in my bank account.",ja:"私は銀行口座にお金を預金する必要がある。"},
  {r:248,en:"I owe you an apology for my mistake.",ja:"私の間違いについて、あなたに謝罪しなければならない。"},
  {r:249,en:"He tried to deceive his parents about his grades.",ja:"彼は成績について両親を欺こうとした。"},
  {r:250,en:"The university was established in 1900.",ja:"その大学は1900年に設立された。"},
  {r:251,en:"She had to endure a lot of pain.",ja:"彼女は多くの痛みに耐えなければならなかった。"},
  {r:252,en:"Please dispose of your trash properly.",ja:"ゴミは適切に廃棄してください。"},
  {r:253,en:"The statistics show an increase in the population.",ja:"その統計は人口の増加を示している。"},
  {r:254,en:"We finally reached a compromise after a long discussion.",ja:"私たちは長い議論の末、ついに妥協に達した。"},
  {r:255,en:"He took a bus from the airport terminal.",ja:"彼は空港のターミナル（末端の施設）からバスに乗った。"},
  {r:256,en:"The book explains the formation of the earth.",ja:"その本は地球の形成について説明している。"},
  {r:257,en:"I put the letter in an envelope and mailed it.",ja:"私は手紙を封筒に入れて郵送した。"},
  {r:258,en:"The brothers had a quarrel over a toy.",ja:"兄弟はおもちゃをめぐって口論した。"},
  {r:259,en:"I don't know how to handle this difficult situation.",ja:"この困難な状況にどう対処すればいいかわからない。"},
  {r:260,en:"The used car is in good condition.",ja:"その中古車は良い状態だ。"},
  {r:261,en:"He was punished for breaking the rule.",ja:"彼はルールを破ったことで罰せられた。"},
  {r:262,en:"I still see him from time to time.",ja:"私は今でも時々彼に会う。"},
  {r:263,en:"Nurses are currently in high demand.",ja:"看護師は現在とても需要がある。"},
  {r:264,en:"Her bright red coat made her stand out in the crowd.",ja:"彼女の明るい赤いコートは、群衆の中で彼女を目立たせた。"},
  {r:265,en:"The doctor will be here soon. In the meantime, please sit down.",ja:"医者はすぐ来ます。それまでは、座っていてください。"},
  {r:266,en:"I agree with you to some extent.",ja:"ある程度はあなたに賛成します。"},
  {r:267,en:"We must win this game at any cost.",ja:"私たちは何がなんでもこの試合に勝たなければならない。"},
  {r:268,en:"It wasn't a bad idea. On the contrary, it was brilliant.",ja:"それは悪いアイデアではなかった。それどころか、素晴らしいものだった。"},
  {r:269,en:"He didn't want to lose face in front of his friends.",ja:"彼は友達の前で面子を失い（恥をかき）たくなかった。"},
  {r:270,en:"You have to answer for your mistakes.",ja:"あなたは自分の間違いに対して責任を負わなければならない。"},
  {r:271,en:"She insisted on paying for the meal.",ja:"彼女は食事代を払うと強く求めた（言い張った）。"},
  {r:272,en:"They went out for a walk despite the rain.",ja:"雨にも関わらず、彼らは散歩に出かけた。"},
  {r:273,en:"This museum is definitely worth visiting.",ja:"この博物館は絶対に訪れる価値がある。"},
  {r:274,en:"Rich people are not always happy.",ja:"お金持ちが必ずしも幸せとは限らない。"},
  {r:275,en:"The news spread quickly through the town.",ja:"そのニュースは町中にすぐに広まった。"},
  {r:276,en:"I was studying at the library at that time.",ja:"あの時、私は図書館で勉強していた。"},
  {r:277,en:"My sister and I have nothing in common.",ja:"姉と私には共通しているところが何もない。"},
  {r:278,en:"Farming is greatly affected by the weather.",ja:"農業は天候の影響を大きく受ける。"},
  {r:279,en:"Luckily, no one was hurt in the accident.",ja:"幸運にも、その事故でけがをした人はいなかった。"},
  {r:280,en:"I have not finished my homework yet.",ja:"私はまだ宿題を終わらせていません。"},
  {r:281,en:"In response to customer complaints, the company changed its policy.",ja:"顧客の苦情に対応して、会社は方針を変更した。"},
  {r:282,en:"Global warming has serious effects on our environment.",ja:"地球温暖化は私たちの環境に深刻な影響を与える。"},
  {r:283,en:"This soup tastes really good.",ja:"このスープは本当に良い味がする。"},
  {r:284,en:"You need to buy the tickets in advance.",ja:"前もってチケットを買う必要があります。"},
  {r:285,en:"She is confident in her English skills.",ja:"彼女は自分の英語のスキルに自信がある。"},
  {r:286,en:"I want to visit space one day.",ja:"いつか宇宙に行ってみたい。"},
  {r:287,en:"Taste is one of the five senses.",ja:"味覚は五感の一つである。"},
  {r:288,en:"He lost his sight in an accident.",ja:"彼は事故で視力を失った。"},
  {r:289,en:"He bought a new electric guitar.",ja:"彼は新しい電気のギター（エレキギター）を買った。"},
  {r:290,en:"Did you receive my email?",ja:"私のメールを受け取りましたか？"},
  {r:291,en:"I hurt my ankle while playing tennis.",ja:"テニスをしている時に足首を痛めた。"},
  {r:292,en:"This problem is related to global warming.",ja:"この問題は地球温暖化に関連している。"},
  {r:293,en:"There is nothing to fear.",ja:"恐れるものは何もない。"},
  {r:294,en:"My grandfather is still very active.",ja:"私の祖父は今でもとても活動的だ。"},
  {r:295,en:"Choose the lesser of two evils.",ja:"2つの悪のうち、より少ないほう（ましなほう）を選びなさい。"},
  {r:296,en:"Water boils at 100 degrees Celsius.",ja:"水は摂氏100度で沸騰する。"},
  {r:297,en:"The medicine had an immediate effect.",ja:"その薬は即座の効果があった。"},
  {r:298,en:"Careless driving causes many accidents.",ja:"不注意な運転は多くの事故の原因となる。"},
  {r:299,en:"I am particularly interested in Japanese history.",ja:"私は特に日本の歴史に興味がある。"},
  {r:300,en:"Many people suffer from the disease.",ja:"多くの人々がその病気で苦しんでいる。"},
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
  console.log(`Applied ${c} examples to 2級 (201-300). Saved.`);
}
main().catch(console.error);
