const xlsx = require('xlsx');
const fs = require('fs');
const filePath = String.raw`C:\Users\makoto\Documents\GitHub\VocabularyBase\単語リスト\出題頻度順リストのみ_英検英単語.xlsx`;
const outPath = filePath.replace('.xlsx', '_updated.xlsx');
const targetFile = fs.existsSync(outPath) ? outPath : filePath;

const data = [
  {r:1,en:"He didn't study hard, and as a result, he failed the exam.",ja:"彼は一生懸命勉強せず、結果として試験に落ちた。"},
  {r:2,en:"It was raining heavily; however, we went out.",ja:"雨が激しく降っていた。しかしながら、私たちは出かけた。"},
  {r:3,en:"We must protect the natural environment for future generations.",ja:"私たちは未来の世代のために自然環境を守らなければならない。"},
  {r:4,en:"We need to reduce the amount of plastic waste.",ja:"私たちはプラスチックごみの量を減らす必要がある。"},
  {r:5,en:"I didn't buy a car; instead, I bought a bicycle.",ja:"私は車を買わなかった。その代わり、自転車を買った。"},
  {r:6,en:"I got up early in order to catch the first train.",ja:"始発電車に乗るために、私は早く起きた。"},
  {r:7,en:"Electric vehicles are becoming more popular.",ja:"電気自動車（乗り物）はさらに人気を集めている。"},
  {r:8,en:"I strongly recommend this book to you.",ja:"私はあなたにこの本を強く推薦します。"},
  {r:9,en:"He went to America to improve his English.",ja:"彼は英語を改善する（上達させる）ためにアメリカへ行った。"},
  {r:10,en:"Have you seen any good movies recently?",ja:"最近、何か良い映画を見ましたか？"},
  {r:11,en:"The store offers excellent service to its customers.",ja:"その店は顧客に素晴らしいサービスを提供している。"},
  {r:12,en:"Scientists discovered a new species of bird.",ja:"科学者たちは鳥の新種を発見した。"},
  {r:13,en:"English is a common language around the world.",ja:"英語は世界中の共通言語である。"},
  {r:14,en:"I like sports, in particular, baseball.",ja:"私はスポーツ、特に野球が好きです。"},
  {r:15,en:"Please do not disturb him while he is studying.",ja:"彼が勉強している間は邪魔をしないでください。"},
  {r:16,en:"The hotel is cheap; moreover, it's very clean.",ja:"そのホテルは安い。その上、とても清潔だ。"},
  {r:17,en:"He speaks not only English but also French.",ja:"彼は英語だけでなくフランス語もまた話す。"},
  {r:18,en:"A number of students participated in the event.",ja:"たくさんの生徒がそのイベントに参加した。"},
  {r:19,en:"It is likely to rain later this afternoon.",ja:"今日の午後は遅くに雨が降る可能性が高い。"},
  {r:20,en:"Regular exercise has many health benefits.",ja:"定期的な運動には多くの健康上の利益がある。"},
  {r:21,en:"How will you deal with this difficult problem?",ja:"あなたはこの難しい問題にどう対処しますか？"},
  {r:22,en:"We must find a solution to the problem.",ja:"私たちはその問題の解決法を見つけなければならない。"},
  {r:23,en:"Please inform us of your decision soon.",ja:"あなたの決定をすぐに私たちにお知らせください。"},
  {r:24,en:"Many people suffer from heart disease.",ja:"多くの人が心臓の病気（疾患）で苦しんでいる。"},
  {r:25,en:"I was sick; therefore, I stayed home.",ja:"私は病気だった。それゆえ、家にいた。"},
  {r:26,en:"Unfortunately, I cannot attend the meeting.",ja:"残念なことに、私は会議に出席できません。"},
  {r:27,en:"Smartphones are very useful communication devices.",ja:"スマートフォンはとても便利なコミュニケーション装置だ。"},
  {r:28,en:"The offer is very attractive to me.",ja:"その提案は私にとってとても魅力的だ。"},
  {r:29,en:"Global warming is affecting the world's climate.",ja:"地球温暖化は世界の気候に影響を与えている。"},
  {r:30,en:"If you don't study, you'll end up failing.",ja:"勉強しないと、最終的に落第することになるよ。"},
  {r:31,en:"The police found new evidence in the case.",ja:"警察はその事件の新たな証拠を見つけた。"},
  {r:32,en:"They estimate that the repairs will cost 10,000 yen.",ja:"彼らは修理費が1万円かかると推定している。"},
  {r:33,en:"Some experts argue that the policy is wrong.",ja:"その政策は間違っていると主張する専門家もいる。"},
  {r:34,en:"According to the news, a typhoon is approaching.",ja:"ニュースによると、台風が近づいている。"},
  {r:35,en:"He was working hard; meanwhile, she was sleeping.",ja:"彼は一生懸命働いていた。一方で、彼女は寝ていた。"},
  {r:36,en:"I entirely agree with your opinion.",ja:"私はあなたの意見に完全に賛成です。"},
  {r:37,en:"The author published a new book last month.",ja:"その著者は先月新しい本を出版した。"},
  {r:38,en:"The ice cream will melt in the sun.",ja:"アイスクリームが太陽の下で溶けてしまう。"},
  {r:39,en:"We went to Hawaii at a great expense.",ja:"私たちは大きな費用をかけてハワイに行った。"},
  {r:40,en:"This box contains several old letters.",ja:"この箱には何通かの古い手紙が入っている。"},
  {r:41,en:"My bag is similar to yours.",ja:"私のカバンはあなたのものと似ている。"},
  {r:42,en:"The government announced a new tax policy.",ja:"政府は新しい税制政策を発表した。"},
  {r:43,en:"We studied modern history in class.",ja:"私たちは授業で現代の歴史を勉強した。"},
  {r:44,en:"Over a million people live in this city.",ja:"100万人以上の人々がこの都市に住んでいる。"},
  {r:45,en:"Scientists are trying to find a cure for cancer.",ja:"科学者たちはガンの治療法を見つけようとしている。"},
  {r:46,en:"Air pollution is a serious problem in the city.",ja:"大気汚染はその都市における深刻な問題だ。"},
  {r:47,en:"Trust is the foundation of a good relationship.",ja:"信頼は良い関係の土台である。"},
  {r:48,en:"Please remove your shoes before entering the room.",ja:"部屋に入る前に靴を取り除いて（脱いで）ください。"},
  {r:49,en:"You cannot compare these two completely different things.",ja:"これら2つの全く違うものを比較することはできない。"},
  {r:50,en:"I need to replace the battery in my watch.",ja:"時計のバッテリーを取り換える必要がある。"},
  {r:51,en:"Hard work will lead to success.",ja:"懸命な努力は成功につながる。"},
  {r:52,en:"He is smart; furthermore, he is very kind.",ja:"彼は賢い。さらに、彼はとても親切だ。"},
  {r:53,en:"The heavy rain resulted in a flood.",ja:"大雨は結果として洪水になった。"},
  {r:54,en:"The company made a huge profit this year.",ja:"その会社は今年、莫大な利益を出した。"},
  {r:55,en:"The problem remains unsolved.",ja:"その問題は未解決のままである。"},
  {r:56,en:"She helped organize the school festival.",ja:"彼女は文化祭を組織する（準備する）のを手伝った。"},
  {r:57,en:"My grandfather suffers from back pain.",ja:"私の祖父は背中の痛みで苦しんでいる。"},
  {r:58,en:"The teacher emphasized the importance of reading.",ja:"先生は読書の重要性を強調した。"},
  {r:59,en:"More and more people are shopping online.",ja:"ますます多くの人々がオンラインで買い物している。"},
  {r:60,en:"We conducted a science experiment in the laboratory.",ja:"私たちは実験室で理科の実験を行った。"},
  {r:61,en:"This car consumes a lot of gas.",ja:"この車はたくさんのガソリンを消費する。"},
  {r:62,en:"The development of technology has changed our lives.",ja:"技術の発達は私たちの生活を変えた。"},
  {r:63,en:"The machine can detect a small amount of gas.",ja:"その機械は少量のガスを検出することができる。"},
  {r:64,en:"It is extremely hot today.",ja:"今日は極端に暑い。"},
  {r:65,en:"The new factory created many employment opportunities.",ja:"新しい工場は多くの雇用の機会を生み出した。"},
  {r:66,en:"I met an old friend by chance at the station.",ja:"私は駅で偶然に古い友人に会った。"},
  {r:67,en:"Unlike his brother, he is very shy.",ja:"彼の兄弟と異なって、彼はとても内気だ。"},
  {r:68,en:"You need to learn how to use this machine properly.",ja:"あなたはこの機械を適切に使う方法を学ぶ必要がある。"},
  {r:69,en:"He repaired the broken window.",ja:"彼は壊れた窓を修理した。"},
  {r:70,en:"In addition to English, she speaks Spanish.",ja:"英語に加えて（追加として）、彼女はスペイン語も話す。"},
  {r:71,en:"This math problem is too complicated for me.",ja:"この数学の問題は私には複雑すぎる。"},
  {r:72,en:"I will wait here until you come back.",ja:"あなたが戻ってくるまで、私はここで待ちます。"},
  {r:73,en:"City life is exciting; on the other hand, it's stressful.",ja:"都市の生活は刺激的だ。一方で、ストレスも多い。"},
  {r:74,en:"The police arrested the man for stealing a car.",ja:"警察は車を盗んだことでその男を逮捕した。"},
  {r:75,en:"He promised never to betray his friends.",ja:"彼は友人を決して裏切らないと約束した。"},
  {r:76,en:"According to a recent survey, people are eating less meat.",ja:"最近の調査によると、人々は肉を食べる量が減っている。"},
  {r:77,en:"Lack of sleep will affect your health.",ja:"睡眠不足はあなたの健康に影響を与えるだろう。"},
  {r:78,en:"I will consider your suggestion.",ja:"私はあなたの提案について考えます（検討します）。"},
  {r:79,en:"He bought a portable computer for his business trip.",ja:"彼は出張のために持ち運べるコンピューターを買った。"},
  {r:80,en:"This picture reminds me of my childhood.",ja:"この写真は私に子供時代を思い出させる。"},
  {r:81,en:"She has the ability to manage the whole team.",ja:"彼女にはチーム全体を管理する能力がある。"},
  {r:82,en:"My parents don't allow me to stay out late.",ja:"両親は私が夜遅くまで外出することを許可しない。"},
  {r:83,en:"This company provides high-quality products.",ja:"この会社は高い質の製品を提供している。"},
  {r:84,en:"The construction of the new bridge will finish next year.",ja:"新しい橋の建設は来年終わる予定だ。"},
  {r:85,en:"The company is trying to develop a new software.",ja:"その会社は新しいソフトウェアを開発しようとしている。"},
  {r:86,en:"You need permission to enter this room.",ja:"この部屋に入るには許可が必要です。"},
  {r:87,en:"His room is always in a mess.",ja:"彼の部屋はいつも混乱している（散らかっている）。"},
  {r:88,en:"They converted the old factory into an apartment.",ja:"彼らは古い工場をアパートに変えた（転換した）。"},
  {r:89,en:"Local residents protested against the new airport.",ja:"地元の住民は新しい空港に反対して抗議した。"},
  {r:90,en:"The hotel provides free breakfast for all guests.",ja:"そのホテルはすべての客に無料の朝食を提供する。"},
  {r:91,en:"Gold is a precious metal.",ja:"金は貴重な金属だ。"},
  {r:92,en:"He answered the question immediately.",ja:"彼は即座にその質問に答えた。"},
  {r:93,en:"It is difficult to predict earthquakes accurately.",ja:"地震を正確に予想するのは難しい。"},
  {r:94,en:"People in this country have different religions.",ja:"この国の人々は異なる宗教を持っている。"},
  {r:95,en:"The euro is the currency used in many European countries.",ja:"ユーロは多くのヨーロッパの国で使われている通貨だ。"},
  {r:96,en:"They decided to restore the old castle.",ja:"彼らはその古い城を修復することに決めた。"},
  {r:97,en:"Children under 12 must be accompanied by an adult.",ja:"12歳未満の子供は大人が同行しなければならない。"},
  {r:98,en:"Please explain your plan in detail.",ja:"あなたの計画を詳細に説明してください。"},
  {r:99,en:"He is no longer living in Tokyo.",ja:"彼はもはや東京には住んでいない。"},
  {r:100,en:"It was raining. Nevertheless, the baseball game was held.",ja:"雨が降っていた。それにも関わらず、野球の試合は開催された。"},
];

async function main() {
  const wb = xlsx.readFile(targetFile);
  const ws = wb.Sheets["2級"];
  const aoa = xlsx.utils.sheet_to_json(ws, { header: 1, defval: "" });

  // Add headers for example columns if missing
  if (!aoa[0][3]) aoa[0][3] = '例文';
  if (!aoa[0][4]) aoa[0][4] = '例文訳';

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
  console.log(`Applied ${c} examples to 2級 (1-100). Saved.`);
}
main().catch(console.error);
