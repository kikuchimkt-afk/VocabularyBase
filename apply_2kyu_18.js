const xlsx = require('xlsx');
const fs = require('fs');
const filePath = String.raw`C:\Users\makoto\Documents\GitHub\VocabularyBase\単語リスト\出題頻度順リストのみ_英検英単語.xlsx`;
const outPath = filePath.replace('.xlsx', '_updated.xlsx');
const targetFile = fs.existsSync(outPath) ? outPath : filePath;

const data = [
  {r:1701,en:"Trust is an important element of a good relationship.",ja:"信頼は良い関係の重要な要素だ。"},
  {r:1702,en:"He bought a used car from a local dealer.",ja:"彼は地元の販売業者から中古車を買った。"},
  {r:1703,en:"A mysterious light appeared in the night sky.",ja:"夜空に不可解な（不思議な）光が現れた。"},
  {r:1704,en:"Let's make a comparison between the two cars.",ja:"その二つの車の間で比較をしてみよう。"},
  {r:1705,en:"He was an active communist in his youth.",ja:"彼は若い頃、活動的な共産主義者だった。"},
  {r:1706,en:"France became a republic in the 18th century.",ja:"フランスは18世紀に共和国になった。"},
  {r:1707,en:"The journalist tried to expose the truth.",ja:"そのジャーナリストは真実を明らかにしようと試みた。"},
  {r:1708,en:"She works in the sales department.",ja:"彼女は営業部門で働いている。"},
  {r:1709,en:"I need a clear explanation for this problem.",ja:"この問題に対する明確な説明が必要です。"},
  {r:1710,en:"The sick animals were isolated from the others.",ja:"病気の動物たちは他のものから隔離された。"},
  {r:1711,en:"Please proceed to the next page.",ja:"次のページに進んでください。"},
  {r:1712,en:"They went into the forest to explore.",ja:"彼らは探索するために森へ入った。"},
  {r:1713,en:"I have a question regarding your new plan.",ja:"あなたの新しい計画に関して質問があります。"},
  {r:1714,en:"It was a stupid mistake to leave the door unlocked.",ja:"ドアの鍵をかけないままにしておくのは馬鹿な間違いだった。"},
  {r:1715,en:"They found the missing boy alive in the forest.",ja:"彼らは行方不明の少年が森で生きているのを見つけた。"},
  {r:1716,en:"There has been a dramatic change in the weather.",ja:"天候に劇的な変化があった。"},
  {r:1717,en:"This new medicine has potential side effects.",ja:"この新しい薬には潜在的な副作用がある。"},
  {r:1718,en:"The plan requires the approval of the committee.",ja:"その計画は委員会の承認を必要とする。"},
  {r:1719,en:"He didn't dare to ask her out.",ja:"彼は思い切って彼女をデートに誘うことはできなかった。"},
  {r:1720,en:"She is an environmental activist.",ja:"彼女は環境問題の行動主義者（活動家）だ。"},
  {r:1721,en:"We need to use our time more effectively.",ja:"私たちは時間をもっと効果的に使う必要がある。"},
  {r:1722,en:"Don't strain your eyes by reading in the dark.",ja:"暗闇で読んで目を無理に張らないで（酷使しないで）ください。"},
  {r:1723,en:"He felt a deep sense of shame for what he did.",ja:"彼は自分のしたことに対して深い恥の感情を抱いた。"},
  {r:1724,en:"Do you want to pay by credit card or in cash?",ja:"クレジットカードで支払いますか、それとも現金ですか？"},
  {r:1725,en:"The baby is fast asleep in the bed.",ja:"赤ちゃんはベッドでぐっすり眠っている。"},
  {r:1726,en:"A huge mass of rock fell from the mountain.",ja:"巨大な岩の塊が山から落ちた。"},
  {r:1727,en:"Of the two choices, I prefer the latter.",ja:"2つの選択肢のうち、私は後者を好む。"},
  {r:1728,en:"You are absolutely right.",ja:"あなたは絶対に正しい。"},
  {r:1729,en:"I have no intention of hurting your feelings.",ja:"あなたの感情を傷つける意図はありません。"},
  {r:1730,en:"She is interested in computer science.",ja:"彼女はコンピューター科学に興味がある。"},
  {r:1731,en:"We decided to split the cost of the meal.",ja:"私たちは食事の費用を割る（割り勘にする）ことに決めた。"},
  {r:1732,en:"His power has gradually diminished over the years.",ja:"彼の権力は何年にもわたって徐々に小さくなった（減少した）。"},
  {r:1733,en:"Try to keep a positive attitude.",ja:"自信のある（前向きな）態度を保つようにしなさい。"},
  {r:1734,en:"They live in a remote village in the mountains.",ja:"彼らは山の中の遠い村に住んでいる。"},
  {r:1735,en:"He likes to collect old coins.",ja:"彼は古い硬貨を集めるのが好きだ。"},
  {r:1736,en:"One mile is roughly equivalent to 1.6 kilometers.",ja:"1マイルはおおよそ1.6キロメートルに等しい。"},
  {r:1737,en:"I cannot bear this pain any longer.",ja:"私はもうこれ以上この痛みを我慢できない。"},
  {r:1738,en:"The Roman Empire was very powerful.",ja:"ローマ帝国は非常に強力だった。"},
  {r:1739,en:"I have visited that museum several times.",ja:"私はその博物館を幾つかの（数）回訪れたことがある。"},
  {r:1740,en:"He joined the navy when he was 18.",ja:"彼は18歳の時に海軍に入隊した。"},
  {r:1741,en:"She doesn't understand the significance of this event.",ja:"彼女はこの出来事の重要性を理解していない。"},
  {r:1742,en:"This bag is not only beautiful but also practical.",ja:"このカバンは美しいだけでなく実用的だ。"},
  {r:1743,en:"Can you guess what is in this box?",ja:"この箱の中に何が入っているか推測できますか？"},
  {r:1744,en:"Agriculture is the main industry in this region.",ja:"農業はこの地域における主要な産業だ。"},
  {r:1745,en:"The frog leaped into the pond.",ja:"カエルは池に跳び込んだ。"},
  {r:1746,en:"The glass is completely empty.",ja:"そのグラスは完全に何も入っていない（空だ）。"},
  {r:1747,en:"The book provides deep insight into Japanese culture.",ja:"その本は日本文化に対する深い洞察（力）を提供している。"},
  {r:1748,en:"They made a verbal agreement.",ja:"彼らは言葉の（口頭での）合意をした。"},
  {r:1749,en:"A meter is a unit of length.",ja:"メートルは長さの単位だ。"},
  {r:1750,en:"The hero fought against an evil king.",ja:"英雄は邪悪な王と戦った。"},
  {r:1751,en:"They are a newly married couple.",ja:"彼らは新たに（最近）結婚したカップルだ。"},
  {r:1752,en:"The automobile industry is very important for Japan.",ja:"自動車産業は日本にとってとても重要だ。"},
  {r:1753,en:"She graduated from Tokyo University last year.",ja:"彼女は昨年、東京大学を卒業した。"},
  {r:1754,en:"The library has many interesting publications.",ja:"図書館には多くの興味深い出版物がある。"},
  {r:1755,en:"He has been very busy for the past few weeks.",ja:"彼は過去の（ここ数）週間、とても忙しくしている。"},
  {r:1756,en:"There is a sharp contrast between the two brothers.",ja:"その二人の兄弟の間にははっきりとした対照（違い）がある。"},
  {r:1757,en:"Many immigrants arrived in America in the 19th century.",ja:"19世紀に多くの移民がアメリカに到着した。"},
  {r:1758,en:"A lack of sleep can cause health problems.",ja:"睡眠の不足は健康問題を引き起こす可能性がある。"},
  {r:1759,en:"We had a brief meeting before lunch.",ja:"私たちは昼食の前に短い（短時間の）会議をした。"},
  {r:1760,en:"The cop chased the thief down the street.",ja:"警官は通りを泥棒を追いかけた。"},
  {r:1761,en:"He is eager to learn new things.",ja:"彼は新しいことを学ぶことを強く望んでいる（熱心だ）。"},
  {r:1762,en:"The king wore a heavy gold crown.",ja:"王は重い金の王冠をかぶっていた。"},
  {r:1763,en:"An observer from the UN watched the election.",ja:"国連からの観察者が選挙を監視した。"},
  {r:1764,en:"She nodded to show that she understood.",ja:"彼女は理解したことを示すためにうなずいた。"},
  {r:1765,en:"Buying this house is a good investment for the future.",ja:"この家を買うことは将来のための良い投資だ。"},
  {r:1766,en:"They made a new scientific discovery.",ja:"彼らは新しい科学の発見をした。"},
  {r:1767,en:"Fifty states constitute the United States of America.",ja:"50の州がアメリカ合衆国を構成する。"},
  {r:1768,en:"Parents should teach moral values to their children.",ja:"親は子どもたちに道徳の（道徳的な）価値観を教えるべきだ。"},
  {r:1769,en:"The politician tried to appeal to young voters.",ja:"その政治家は若い投票者にアピールしようとした。"},
  {r:1770,en:"He has made a remarkable recovery from his illness.",ja:"彼は病気から目立った（驚くべき）回復を遂げた。"},
  {r:1771,en:"It was a mere coincidence that we met there.",ja:"私たちがそこで会ったのは単なる偶然だった。"},
  {r:1772,en:"This book belongs to my sister.",ja:"この本は私の姉に属する（姉のものだ）。"},
  {r:1773,en:"He decided to pursue a career in medicine.",ja:"彼は医学のキャリアを追い求めることに決めた。"},
  {r:1774,en:"I totally forgot about your birthday.",ja:"私はあなたの誕生日のことを完全に忘れていた。"},
  {r:1775,en:"You need to be patient when teaching children.",ja:"子どもに教える時は我慢強くなる必要がある。"},
  {r:1776,en:"Did you watch the tennis match on TV?",ja:"テレビでそのテニスの試合を見ましたか？"},
  {r:1777,en:"The weather today is very nice.",ja:"今日の天候（天気）はとても良い。"},
  {r:1778,en:"Water is necessary for our survival.",ja:"水は私たちの生存に必要だ。"},
  {r:1779,en:"He is a good fellow to work with.",ja:"彼は一緒に働くのに良い仲間だ。"},
  {r:1780,en:"She walked towards the door.",ja:"彼女はドアの方へ歩いた。"},
  {r:1781,en:"The new aircraft is very fast and quiet.",ja:"その新しい航空機はとても速くて静かだ。"},
  {r:1782,en:"The new legislation aims to protect the environment.",ja:"新しい立法（法律）は環境を保護することを目指している。"},
  {r:1783,en:"You can sit wherever you like.",ja:"あなたはどこでも好きなところに座ってよい。"},
  {r:1784,en:"The government raised the consumption tax.",ja:"政府は消費税（税金）を引き上げた。"},
  {r:1785,en:"Nuclear power is a controversial issue.",ja:"核の（原子力の）力は論争の的となる問題だ。"},
  {r:1786,en:"The patient had internal bleeding after the accident.",ja:"その患者は事故の後、内部の出血（内出血）があった。"},
  {r:1787,en:"He started a new enterprise in the tech industry.",ja:"彼はテクノロジー産業で新しい会社（事業）を始めた。"},
  {r:1788,en:"My initial reaction was surprise.",ja:"私の当初の反応は驚きだった。"},
  {r:1789,en:"The division of the country caused many problems.",ja:"その国の分割は多くの問題を引き起こした。"},
  {r:1790,en:"The two roads run parallel to each other.",ja:"その二つの道路はお互いに平行に走っている。"},
  {r:1791,en:"Do you have any preference for dinner?",ja:"夕食について何か好みはありますか？"},
  {r:1792,en:"We will take your proposal into consideration.",ja:"私たちはあなたの提案を考慮に入れます。"},
  {r:1793,en:"The movie didn't live up to my expectations.",ja:"その映画は私の期待（予想）に応えられなかった。"},
  {r:1794,en:"I was literally freezing in the cold room.",ja:"私はその寒い部屋で文字通りに凍えていた。"},
  {r:1795,en:"They visited their grandfather's grave on the anniversary.",ja:"彼らは記念日に祖父の墓を訪れた。"},
  {r:1796,en:"The room was filled with the sound of children's laughter.",ja:"部屋は子どもたちの笑い声で満たされていた。"},
  {r:1797,en:"They plan to found a new school in the village.",ja:"彼らは村に新しい学校を設立する予定だ。"},
  {r:1798,en:"She screamed in terror when she saw the spider.",ja:"彼女はクモを見た時、恐怖で叫んだ。"},
  {r:1799,en:"This book is suitable for beginners.",ja:"この本は初心者に適している。"},
  {r:1800,en:"Keep this dictionary on your desk for easy reference.",ja:"簡単に参照できるように、この辞書を机の上に置いておきなさい。"},
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
  console.log(`Applied ${c} examples to 2級 (1701-1800). Saved.`);
}
main().catch(console.error);
