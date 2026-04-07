const xlsx = require('xlsx');
const fs = require('fs');
const filePath = String.raw`C:\Users\makoto\Documents\GitHub\VocabularyBase\単語リスト\出題頻度順リストのみ_英検英単語.xlsx`;
const outPath = filePath.replace('.xlsx', '_updated.xlsx');
const targetFile = fs.existsSync(outPath) ? outPath : filePath;

const data = [
  {r:1601,en:"The pirates hid the treasure on a secret island.",ja:"海賊たちは秘密の島に宝を隠した。"},
  {r:1602,en:"I'd like to reserve a table for two for tonight.",ja:"今夜、2名分の席を取っておきたい（予約したい）のですが。"},
  {r:1603,en:"An eclipse is an interesting natural phenomenon.",ja:"日食（月食）は興味深い自然現象だ。"},
  {r:1604,en:"He put his folded clothes into the wooden chest.",ja:"彼はたたんだ服を木製のたんすに入れた。"},
  {r:1605,en:"Does your dog bite?",ja:"あなたの犬は噛みますか？"},
  {r:1606,en:"You should wear proper clothes for the job interview.",ja:"面接には適切な（ふさわしい）服を着るべきだ。"},
  {r:1607,en:"Don't rub your eyes when you have a cold.",ja:"風邪をひいているときは目をこすらないで。"},
  {r:1608,en:"The train will arrive shortly.",ja:"列車はまもなく到着します。"},
  {r:1609,en:"He had to memorize many medical terms.",ja:"彼は多くの医学の専門用語を暗記しなければならなかった。"},
  {r:1610,en:"The illness is caused by psychological stress.",ja:"その病気は心理的なストレスによって引き起こされる。"},
  {r:1611,en:"You made the right decision.",ja:"あなたは正しい決定を下した。"},
  {r:1612,en:"I am inclined to agree with your opinion.",ja:"私はあなたの意見に賛成しがちだ（賛成したい気持ちがある）。"},
  {r:1613,en:"Bright flowers attract bees and butterflies.",ja:"明るい色の花はハチや蝶を引きつける。"},
  {r:1614,en:"The company's headquarters is located in Tokyo.",ja:"その会社の本部は東京に位置している。"},
  {r:1615,en:"Please highlight the important words in the text.",ja:"テキスト内の重要な単語を目立たせて（ハイライトして）ください。"},
  {r:1616,en:"I owe him ten dollars.",ja:"私は彼に10ドル借りている。"},
  {r:1617,en:"She is accustomed to working late at night.",ja:"彼女は夜遅く働くことに慣れている。"},
  {r:1618,en:"A large portion of the budget is spent on education.",ja:"予算の大部分（大きな部分）が教育に費やされている。"},
  {r:1619,en:"He was so angry that he went mad.",ja:"彼はとても怒って狂ったようになった。"},
  {r:1620,en:"We finally found a buyer for our old house.",ja:"私たちはついに古い家の買い手を見つけた。"},
  {r:1621,en:"I will wait here till you come back.",ja:"あなたが戻ってくるまでここで待ちます。"},
  {r:1622,en:"The earthquake caused terrible destruction to the city.",ja:"その地震は都市に恐ろしい破壊をもたらした。"},
  {r:1623,en:"He suffered a serious injury during the game.",ja:"彼は試合中に深刻な怪我を負った。"},
  {r:1624,en:"There was a lot of confusion after the accident.",ja:"事故の後、多くの混乱があった。"},
  {r:1625,en:"My employer provides excellent health benefits.",ja:"私の雇用者は素晴らしい健康保険制度を提供している。"},
  {r:1626,en:"Wheat is the main crop in this region.",ja:"小麦はこの地域の主な作物だ。"},
  {r:1627,en:"I always get nervous before a speech.",ja:"私はスピーチの前はいつもびくびくする（緊張する）。"},
  {r:1628,en:"My dog has been my faithful companion for ten years.",ja:"私の犬は10年間、私の忠実な仲間だ。"},
  {r:1629,en:"We walked a long distance today.",ja:"私たちは今日、長い距離を歩いた。"},
  {r:1630,en:"She made a good impression on her new boss.",ja:"彼女は新しい上司に良い印象を与えた。"},
  {r:1631,en:"We must confront these problems instead of ignoring them.",ja:"私たちはこれらの問題を無視するのではなく立ち向かわなければならない。"},
  {r:1632,en:"Follow this path to reach the lake.",ja:"湖に着くにはこの小道を進んでください。"},
  {r:1633,en:"He tried to suppress his anger.",ja:"彼は怒りを抑えようとした。"},
  {r:1634,en:"I politely declined the invitation to the party.",ja:"私はパーティーへの招待を丁寧に断った。"},
  {r:1635,en:"You should always tell the truth.",ja:"あなたはいつも真実を話すべきだ。"},
  {r:1636,en:"He is an intellectual person who reads many books.",ja:"彼はたくさんの本を読む知的な人物だ。"},
  {r:1637,en:"The thief was sent to jail for five years.",ja:"その泥棒は5年間刑務所に送られた。"},
  {r:1638,en:"The factory ceased operations last month.",ja:"その工場は先月、操業をやめた。"},
  {r:1639,en:"There is a pile of documents on his desk.",ja:"彼の机の上には書類の積み重ね（山）がある。"},
  {r:1640,en:"Snow covered the entire mountain.",ja:"雪が山全体を覆った。"},
  {r:1641,en:"He works in the finance department of the company.",ja:"彼は会社の財政（財務）部門で働いている。"},
  {r:1642,en:"The fisherman cast his net into the sea.",ja:"漁師は海に網を投げた。"},
  {r:1643,en:"There is a distinct difference between the two products.",ja:"その二つの製品にははっきりと他と違った違いがある。"},
  {r:1644,en:"The conservation of nature is a global issue.",ja:"自然の保全は世界的な問題だ。"},
  {r:1645,en:"The prosecutor argued that the man was guilty.",ja:"検察官はその男が有罪であると主張した。"},
  {r:1646,en:"My main task today is to clean the house.",ja:"私の今日の主な仕事は家を掃除することだ。"},
  {r:1647,en:"Initially, I didn't like the plan, but now I do.",ja:"最初は計画が好きではなかったが、今は好きだ。"},
  {r:1648,en:"I will attend the meeting on his behalf.",ja:"私は彼の代わりに会議に出席します。"},
  {r:1649,en:"This region is famous for its hot springs.",ja:"この地域は温泉で有名だ。"},
  {r:1650,en:"I prefer tea to coffee.",ja:"私はコーヒーより紅茶を好む。"},
  {r:1651,en:"We need to look at this problem from a different perspective.",ja:"私たちは別の見解（視点）からこの問題を見る必要がある。"},
  {r:1652,en:"His monthly income is not enough to support his family.",ja:"彼の毎月の所得は家族を養うのに十分ではない。"},
  {r:1653,en:"The two dresses are identical in color and design.",ja:"その二つのドレスは色もデザインも全く同じだ。"},
  {r:1654,en:"The view from the top of the tower was very impressive.",ja:"塔の頂上からの景色はとても印象的だった。"},
  {r:1655,en:"The children were very polite to the guests.",ja:"子どもたちは客に対してとても礼儀正しかった。"},
  {r:1656,en:"He has a high executive position in the bank.",ja:"彼は銀行で高い実行（管理）の地位にある。"},
  {r:1657,en:"The surface of the stone is very rough.",ja:"その石の表面はとても粗い（ごつごつしている）。"},
  {r:1658,en:"Many members agreed to the proposed plan.",ja:"多くのメンバーが提案された計画に同意した。"},
  {r:1659,en:"Quebec is a large province in Canada.",ja:"ケベックはカナダの大きな州だ。"},
  {r:1660,en:"She has a bright and cheerful personality.",ja:"彼女は明るく朗らかな性格だ。"},
  {r:1661,en:"They drove a wooden stake into the ground.",ja:"彼らは地面に木製のくいを打ち込んだ。"},
  {r:1662,en:"My goal is to run a full marathon next year.",ja:"私の目標は来年フルマラソンを走ることだ。"},
  {r:1663,en:"He bought a beautiful necklace for his girlfriend.",ja:"彼は女友達（恋人）に美しいネックレスを買った。"},
  {r:1664,en:"Please step forward so everyone can see you.",ja:"皆があなたを見えるように、前方へ進み出てください。"},
  {r:1665,en:"The car couldn't pass through the narrow street.",ja:"車はその幅の狭い通りを通り抜けることができなかった。"},
  {r:1666,en:"They decided to divorce after 10 years of marriage.",ja:"彼らは結婚10年後に離婚することを決めた。"},
  {r:1667,en:"The two sisters live far apart from each other.",ja:"その二人の姉妹はお互いに遠く離れて住んでいる。"},
  {r:1668,en:"The teacher put emphasis on the importance of reading.",ja:"先生は読書の重要性に強調を置いた（重要性を強調した）。"},
  {r:1669,en:"The shooting of the movie will start tomorrow.",ja:"映画の撮影は明日始まる。"},
  {r:1670,en:"The island has only about 500 inhabitants.",ja:"その島には約500人の居住者しかいない。"},
  {r:1671,en:"Many businesses closed down during the economic recession.",ja:"経済的な不況の間に多くのビジネスが閉鎖された。"},
  {r:1672,en:"He usually takes a passive role in meetings.",ja:"彼はたいてい会議では消極的な（受け身の）役割をとる。"},
  {r:1673,en:"There is a subtle difference in taste between these two wines.",ja:"これらの二つのワインの味には微妙な違いがある。"},
  {r:1674,en:"Our company offers very competitive prices.",ja:"我が社は非常に競争力のある価格を提供している。"},
  {r:1675,en:"The store sells warm clothing for winter.",ja:"その店は冬用の暖かい衣料品を売っている。"},
  {r:1676,en:"It is wise to save money for the future.",ja:"将来のためにお金を貯めることは賢いことだ。"},
  {r:1677,en:"The police car was in hot pursuit of the stolen vehicle.",ja:"パトカーは盗まれた車を猛烈に追跡中だった。"},
  {r:1678,en:"The early settlement grew into a large city.",ja:"その初期の定住地（集落）は大きな都市へと成長した。"},
  {r:1679,en:"He seized my arm to stop me from falling.",ja:"彼は私が倒れるのを止めるために私の腕をつかんだ。"},
  {r:1680,en:"The two companies formed a partnership.",ja:"その二つの会社は提携を結んだ。"},
  {r:1681,en:"He uses a lot of funny expressions when he speaks.",ja:"彼は話す時に面白い表現をたくさん使う。"},
  {r:1682,en:"They resolved their land dispute in court.",ja:"彼らは土地の争議を法廷で解決した。"},
  {r:1683,en:"Contrary to my expectations, the movie was really good.",ja:"私の予想とは反対に、その映画は本当に良かった。"},
  {r:1684,en:"Metals expand when they are heated.",ja:"金属は熱せられると拡大する（膨張する）。"},
  {r:1685,en:"Artificial intelligence is developing very fast.",ja:"人工知能（AI）はとても速く発展している。"},
  {r:1686,en:"There is a serious shortage of water in the village.",ja:"村では深刻な水不足が起きている。"},
  {r:1687,en:"Salt is a compound of sodium and chlorine.",ja:"塩はナトリウムと塩素の化合物（調合したもの）である。"},
  {r:1688,en:"Our team defeated the champions in the final game.",ja:"私たちのチームは決勝戦でチャンピオンを負かした。"},
  {r:1689,en:"Her plan was based on the assumption that it would not rain.",ja:"彼女の計画は雨が降らないという想定に基づいていた。"},
  {r:1690,en:"The roof is not strong enough to sustain the heavy snow.",ja:"その屋根は大雪を保持する（耐える）のに十分な強さがない。"},
  {r:1691,en:"She took the initiative in organizing the event.",ja:"彼女はそのイベントを準備する上で主導権を握った。"},
  {r:1692,en:"It is polite to bow when you greet someone in Japan.",ja:"日本で誰かに挨拶する時はお辞儀をするのが礼儀だ。"},
  {r:1693,en:"He studied hard to pass the medical examination.",ja:"彼は医学の試験に合格するために一生懸命勉強した。"},
  {r:1694,en:"She answered the difficult question with confidence.",ja:"彼女はその難しい質問に自信を持って答えた。"},
  {r:1695,en:"This land yields a lot of high-quality rice.",ja:"この土地は多くの高品質の米を産出する。"},
  {r:1696,en:"He held my hand firmly.",ja:"彼は私の手を堅く握った。"},
  {r:1697,en:"She is currently engaged in a new research project.",ja:"彼女は現在、新しい研究プロジェクトに従事している。"},
  {r:1698,en:"I bought this jacket on a sudden impulse.",ja:"私は突然の衝動でこのジャケットを買ってしまった。"},
  {r:1699,en:"The strong typhoon destroyed many houses.",ja:"強い台風が多くの家を破壊した。"},
  {r:1700,en:"He made steady progress in his English studies.",ja:"彼は英語の勉強で着実な進歩を遂げた。"},
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
  console.log(`Applied ${c} examples to 2級 (1601-1700). Saved.`);
}
main().catch(console.error);
