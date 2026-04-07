const xlsx = require('xlsx');
const fs = require('fs');
const filePath = String.raw`C:\Users\makoto\Documents\GitHub\VocabularyBase\単語リスト\出題頻度順リストのみ_英検英単語.xlsx`;
const outPath = filePath.replace('.xlsx', '_updated.xlsx');
const targetFile = fs.existsSync(outPath) ? outPath : filePath;

const data = [
  {r:1201,en:"I was unable to attend the meeting.",ja:"私は会議に出席することができなかった。"},
  {r:1202,en:"He prefers an urban lifestyle to living in the country.",ja:"彼は田舎に住むよりも都会の生活スタイルを好む。"},
  {r:1203,en:"The map provides detailed information about the area.",ja:"その地図はその地域についての詳細な情報を提供している。"},
  {r:1204,en:"Primitive tools made of stone were found in the cave.",ja:"石でできた原始的な道具が洞窟で見つかった。"},
  {r:1205,en:"There is a problem with the electrical system.",ja:"電気系統（電気のシステム）に問題がある。"},
  {r:1206,en:"I am afraid of making a mistake.",ja:"私は間違いを犯すことを恐れている。"},
  {r:1207,en:"He works hard for the local community.",ja:"彼は地域社会（共同社会）のために一生懸命働いている。"},
  {r:1208,en:"This bridge connects the two islands.",ja:"この橋は2つの島をつないでいる。"},
  {r:1209,en:"The company introduced a new scheme to save energy.",ja:"会社はエネルギーを節約するための新しい計画を導入した。"},
  {r:1210,en:"How many languages can you speak?",ja:"あなたはいくつの言語を話せますか？"},
  {r:1211,en:"I went out for dinner with my colleagues.",ja:"私は同僚たちと夕食に出かけた。"},
  {r:1212,en:"He suffered a stroke and was taken to the hospital.",ja:"彼は脳卒中（脳への打撃）を患い、病院に運ばれた。"},
  {r:1213,en:"The rich family had many servants.",ja:"その裕福な家族には多くの使用人がいた。"},
  {r:1214,en:"She has a strong belief in human rights.",ja:"彼女は人権に対して強い信念を持っている。"},
  {r:1215,en:"Inflation is causing prices to rise.",ja:"インフレ（通貨の膨張）が物価の上昇を引き起こしている。"},
  {r:1216,en:"During Ramadan, Muslims fast from dawn to sunset.",ja:"ラマダンの間、イスラム教徒は夜明けから日没まで断食をする。"},
  {r:1217,en:"She was very upset by the bad news.",ja:"彼女はその悪い知らせにひどく動揺した。"},
  {r:1218,en:"Thank you for your inquiry about our products.",ja:"弊社の製品についてのお問い合わせありがとうございます。"},
  {r:1219,en:"This discount applies only to students.",ja:"この割引は学生にのみ適用されます。"},
  {r:1220,en:"We can learn a lot from our failures.",ja:"私たちは自分の失敗から多くのことを学ぶことができる。"},
  {r:1221,en:"We planted some flower seeds in the garden.",ja:"私たちは庭に花の種子をいくつか植えた。"},
  {r:1222,en:"This is a potentially dangerous situation.",ja:"これは潜在的に危険な状況だ。"},
  {r:1223,en:"Farmers cultivate the land to grow rice.",ja:"農家は米を育てるために土地を耕作する。"},
  {r:1224,en:"I have an awful headache today.",ja:"今日はひどい頭痛がする。"},
  {r:1225,en:"He is going to a pub with his mates.",ja:"彼は仲間（友達）と一緒にパブに行く予定だ。"},
  {r:1226,en:"He decided to pursue a military career.",ja:"彼は軍隊のキャリアを追求することに決めた。"},
  {r:1227,en:"The police caught the armed robber.",ja:"警察は武装した強盗を捕まえた。"},
  {r:1228,en:"Smoking causes serious damage to your lungs.",ja:"喫煙は肺に深刻なダメージを引き起こす。"},
  {r:1229,en:"The books must be read in the correct sequence.",ja:"その本は正しい連続（順番）で読まれなければならない。"},
  {r:1230,en:"Her speech really impressed the audience.",ja:"彼女の演説は聴衆に本当に感銘を与えた。"},
  {r:1231,en:"We had delicious Mexican food for dinner.",ja:"私たちは夕食においしいメキシコ料理を食べた。"},
  {r:1232,en:"The war brought great suffering to the people.",ja:"戦争は人々に大きな苦しみをもたらした。"},
  {r:1233,en:"Please refrain from smoking in this area.",ja:"このエリアでの喫煙はご遠慮ください。"},
  {r:1234,en:"She is a well-known actress in Japan.",ja:"彼女は日本でよく知られた（有名な）女優だ。"},
  {r:1235,en:"Many people associate summer with the beach.",ja:"多くの人が夏を海と結びつけて考える。"},
  {r:1236,en:"The castle belonged to a powerful lord.",ja:"その城は力のある領主のものだった。"},
  {r:1237,en:"The governor announced a new policy for the state.",ja:"知事は州の新しい政策を発表した。"},
  {r:1238,en:"He is looking for a permanent job, not a part-time one.",ja:"彼はアルバイトではなく、永久の（正規の）仕事を探している。"},
  {r:1239,en:"The bishop gave a sermon at the cathedral.",ja:"司教は大聖堂で説教をした。"},
  {r:1240,en:"The mountains in the background looked beautiful.",ja:"背景の山々が美しく見えた。"},
  {r:1241,en:"He begged his parents for a new smartphone.",ja:"彼は両親に新しいスマートフォンを懇願した。"},
  {r:1242,en:"Please provide all relevant information.",ja:"すべての関連のある情報を提供してください。"},
  {r:1243,en:"The scientist achieved worldwide recognition for his discovery.",ja:"その科学者は彼の発見により世界的な認識（承認）を得た。"},
  {r:1244,en:"Be careful, this knife is very sharp.",ja:"気をつけて、このナイフはとても鋭いから。"},
  {r:1245,en:"You should seek legal advice before signing the contract.",ja:"契約にサインする前に法律のアドバイスを求めるべきだ。"},
  {r:1246,en:"It is easy to criticize others, but hard to do it yourself.",ja:"他人を批評する（批判する）のは簡単だが、自分で実行するのは難しい。"},
  {r:1247,en:"The children were swimming naked in the river.",ja:"子どもたちは川で裸で泳いでいた。"},
  {r:1248,en:"A high fever is a common symptom of the flu.",ja:"高熱はインフルエンザの一般的な症状だ。"},
  {r:1249,en:"Sushi is made with raw fish.",ja:"寿司は生の魚で作られる。"},
  {r:1250,en:"He is a member of the local business association.",ja:"彼は地元のビジネス協会のメンバーだ。"},
  {r:1251,en:"The project is currently in its final phase.",ja:"そのプロジェクトは現在、最終段階にある。"},
  {r:1252,en:"He is very interested in international politics.",ja:"彼は国際政治にとても興味がある。"},
  {r:1253,en:"The restaurant had a very romantic atmosphere.",ja:"そのレストランはとてもロマンチックな雰囲気があった。"},
  {r:1254,en:"The cat jumped up and sat on my lap.",ja:"猫が飛び乗って私のひざの上に座った。"},
  {r:1255,en:"The clerk at the hotel desk was very helpful.",ja:"ホテルの受付の事務員（係員）はとても親切だった。"},
  {r:1256,en:"Everyone has some faults.",ja:"誰にでもいくつか欠点はある。"},
  {r:1257,en:"He walked toward the station.",ja:"彼は駅のほうへ向かって歩いた。"},
  {r:1258,en:"I want to learn more foreign languages.",ja:"私はもっと多くの外国の言語を学びたい。"},
  {r:1259,en:"Global warming is a serious problem.",ja:"地球の温暖化は深刻な問題だ。"},
  {r:1260,en:"The company plans to hire 50 new employees this year.",ja:"その会社は今年、50人の新入社員を雇う予定だ。"},
  {r:1261,en:"There are several items on the agenda for today's meeting.",ja:"今日の会議の議題にはいくつかの項目がある。"},
  {r:1262,en:"Many children dislike eating vegetables.",ja:"多くの子供は野菜を食べるのを嫌がる。"},
  {r:1263,en:"The cause of the fire is still unknown.",ja:"火事の原因はまだ未知だ（わかっていない）。"},
  {r:1264,en:"We went to a nearby cafe for lunch.",ja:"私たちは昼食に近くのカフェに行った。"},
  {r:1265,en:"Sushi is a traditional Japanese food.",ja:"寿司は伝統的な日本の食べ物だ。"},
  {r:1266,en:"The Statue of Liberty is a famous symbol of New York.",ja:"自由の女神はニューヨークの有名なシンボルだ。"},
  {r:1267,en:"These shoes are too tight and hurt my toes.",ja:"この靴はきつすぎて私のつま先が痛い。"},
  {r:1268,en:"They built a cabin using logs from the forest.",ja:"彼らは森の丸太を使って小屋を建てた。"},
  {r:1269,en:"He was appointed as the new team captain.",ja:"彼は新しいチームのキャプテンに任命された。"},
  {r:1270,en:"It takes courage to tell the truth.",ja:"真実を話すには勇気が必要だ。"},
  {r:1271,en:"The company's profits increased in the third quarter.",ja:"会社の利益は第3四半期に増加した。"},
  {r:1272,en:"The prime minister deals with national affairs.",ja:"首相は国家の事柄（国政）を扱う。"},
  {r:1273,en:"He can snap his fingers loudly.",ja:"彼は指を大きくパチンと鳴らすことができる。"},
  {r:1274,en:"My grandmother used to tell me a fairy tale before bed.",ja:"祖母は寝る前によく私におとぎ話をしてくれた。"},
  {r:1275,en:"This TV program is very educational for children.",ja:"このテレビ番組は子どもにとってとても教育の（教育的な）内容だ。"},
  {r:1276,en:"I was so tired that I could hardly keep my eyes open.",ja:"私はとても疲れていたので、目を開けていることがほとんどできなかった。"},
  {r:1277,en:"What conclusion did you reach after the discussion?",ja:"議論の後、あなたはどのような結論に達しましたか？"},
  {r:1278,en:"He likes coffee, whereas his wife prefers tea.",ja:"彼はコーヒーが好きである一方で、妻は紅茶を好む。"},
  {r:1279,en:"Bowing is a traditional custom in Japan.",ja:"お辞儀は日本における伝統的な習慣だ。"},
  {r:1280,en:"They are studying the biological effects of pollution.",ja:"彼らは汚染の生物学上の影響を研究している。"},
  {r:1281,en:"Please confine your remarks to the topic.",ja:"発言はトピックに制限してください（話題からそれないでください）。"},
  {r:1282,en:"The treasure was buried beneath the old tree.",ja:"その宝は古い木の下に埋められていた。"},
  {r:1283,en:"Many animal species are facing extinction.",ja:"多くの動物の種が絶滅に直面している。"},
  {r:1284,en:"The baby grabbed my finger with her tiny hand.",ja:"赤ちゃんは彼女のごく小さい手で私の指をつかんだ。"},
  {r:1285,en:"Who do you think will win the next election?",ja:"次の選挙で誰が勝つと思いますか？"},
  {r:1286,en:"The old town has a unique charm.",ja:"その古い町には独自の魅力がある。"},
  {r:1287,en:"She held a small coin in the palm of her hand.",ja:"彼女は手のひらに小さなコインを持っていた。"},
  {r:1288,en:"What does this symbol mean?",ja:"この記号は何を意味しますか？"},
  {r:1289,en:"The company advertised its new product on TV.",ja:"その会社はテレビで新製品を宣伝した。"},
  {r:1290,en:"She works in the advertising industry.",ja:"彼女は広告業界で働いている。"},
  {r:1291,en:"Price is an important factor when buying a car.",ja:"価格は車を買う際の重要な要因だ。"},
  {r:1292,en:"Children are naturally curious about everything.",ja:"子供たちは生まれつき何にでも好奇心が強い。"},
  {r:1293,en:"He can pitch the ball very fast.",ja:"彼はとても速くボールを投げることができる。"},
  {r:1294,en:"Excessive drinking is bad for your health.",ja:"過度の飲酒は健康に悪い。"},
  {r:1295,en:"Many innocent people die in war.",ja:"多くの罪のない人々が戦争で死ぬ。"},
  {r:1296,en:"Apparently, he didn't know about the meeting.",ja:"明らかに、彼はその会議について知らなかったようだ。"},
  {r:1297,en:"The river forms the boundary between the two countries.",ja:"その川は2国間の境界を形成している。"},
  {r:1298,en:"You must follow the correct safety procedure.",ja:"正しい安全の手順に従わなければならない。"},
  {r:1299,en:"The law was made to protect the consumer.",ja:"その法律は消費者を守るために作られた。"},
  {r:1300,en:"His work has been highly satisfactory.",ja:"彼の仕事は非常に満足のいくものだった。"},
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
  console.log(`Applied ${c} examples to 2級 (1201-1300). Saved.`);
}
main().catch(console.error);
