const xlsx = require('xlsx');
const fs = require('fs');
const filePath = String.raw`C:\Users\makoto\Documents\GitHub\VocabularyBase\単語リスト\出題頻度順リストのみ_英検英単語.xlsx`;
const outPath = filePath.replace('.xlsx', '_updated.xlsx');
const targetFile = fs.existsSync(outPath) ? outPath : filePath;

const data = [
  {r:1801,en:"This dress is made of high-quality fabric.",ja:"このドレスは高品質な織物（生地）で作られている。"},
  {r:1802,en:"The length of this bridge is about two kilometers.",ja:"この橋の長さは約2キロメートルだ。"},
  {r:1803,en:"He didn't deny the fact that he was late.",ja:"彼は自分が遅刻したという事実を否定しなかった。"},
  {r:1804,en:"The moon is a natural satellite of the Earth.",ja:"月は地球の自然の衛星である。"},
  {r:1805,en:"The company's profits have been growing steadily.",ja:"その会社の利益は着実に成長している。"},
  {r:1806,en:"Freedom of speech is a fundamental human right.",ja:"言論の自由は基本的な人権である。"},
  {r:1807,en:"We need to develop a new marketing strategy.",ja:"私たちは新しいマーケティング戦略を開発する必要がある。"},
  {r:1808,en:"The town was virtually destroyed by the earthquake.",ja:"その町は地震によって実質的に破壊された。"},
  {r:1809,en:"His failure was partly due to lack of effort.",ja:"彼の失敗は部分的には努力不足によるものだった。"},
  {r:1810,en:"She is a lawyer by profession.",ja:"彼女は職業は弁護士だ（職業柄、弁護士だ）。"},
  {r:1811,en:"He had to undergo a serious operation.",ja:"彼は深刻な手術を経験（受ける）しなければならなかった。"},
  {r:1812,en:"An international medical congress was held in Tokyo.",ja:"国際的な医学会議が東京で開催された。"},
  {r:1813,en:"He finished the task within the given time.",ja:"彼は与えられた時間内にその仕事を終わらせた。"},
  {r:1814,en:"There is always heavy traffic in the morning.",ja:"朝はいつも交通が激しい（渋滞している）。"},
  {r:1815,en:"Our customers are mainly college students.",ja:"私たちの顧客は主に大学生です。"},
  {r:1816,en:"The bears spend the winter sleeping in the cave.",ja:"クマはそのほら穴（洞窟）で眠って冬を過ごす。"},
  {r:1817,en:"It was just a passing fancy.",ja:"それはほんの気まぐれな空想にすぎなかった。"},
  {r:1818,en:"My grandfather shared his words of wisdom with me.",ja:"私の祖父は彼の知恵の言葉を私と共有してくれた。"},
  {r:1819,en:"She didn't even blink when she heard the surprising news.",ja:"驚くべき知らせを聞いても、彼女は瞬きすらしなかった。"},
  {r:1820,en:"He is a famous scholar of Japanese history.",ja:"彼は日本史の有名な学者だ。"},
  {r:1821,en:"He tried to rid the house of mice.",ja:"彼は家からネズミを取り除こうとした。"},
  {r:1822,en:"Education should be a right, not a privilege.",ja:"教育は特権ではなく、権利であるべきだ。"},
  {r:1823,en:"We have to find a more effective method of teaching.",ja:"私たちはより効果的な教える方法を見つけなければならない。"},
  {r:1824,en:"He contributed to the establishment of the new school.",ja:"彼は新しい学校の設立に貢献した。"},
  {r:1825,en:"He just shrugged his shoulders and said nothing.",ja:"彼はただ肩をすくめて何も言わなかった。"},
  {r:1826,en:"Please read this paragraph aloud.",ja:"この段落を声に出して読んでください。"},
  {r:1827,en:"The rain continued to fall all night.",ja:"雨は一晩中降り続けた。"},
  {r:1828,en:"The dog ran to welcome its master.",ja:"犬は主人を歓迎するために走っていった。"},
  {r:1829,en:"The movie got a high rating from the critics.",ja:"その映画は批評家から高い評価を得た。"},
  {r:1830,en:"Do you have an extra pen?",ja:"余分のペンを持っていますか？"},
  {r:1831,en:"Many people had to flee from the burning building.",ja:"多くの人々が燃えている建物から逃げなければならなかった。"},
  {r:1832,en:"He works in the hospital administration.",ja:"彼は病院の運営（管理）部門で働いている。"},
  {r:1833,en:"The plant will die if you don't water it.",ja:"水をやらないと、その植物は死んでしまうだろう。"},
  {r:1834,en:"It rained heavily throughout the day.",ja:"その日は終始、激しく雨が降った。"},
  {r:1835,en:"I accidentally stepped in dog shit on the sidewalk.",ja:"私は歩道でうっかり犬の大便を踏んでしまった。"},
  {r:1836,en:"We celebrate the New Year according to Japanese tradition.",ja:"私たちは日本の伝統に従って新年を祝う。"},
  {r:1837,en:"This is a typical English breakfast.",ja:"これは典型的なイギリスの朝食だ。"},
  {r:1838,en:"How much do you weigh?",ja:"あなたはどれくらいの重さがありますか（体重はどれくらいですか）？"},
  {r:1839,en:"It is unlikely that he will come today.",ja:"彼が今日来ることは起こりそうにない。"},
  {r:1840,en:"She wants to lose some weight.",ja:"彼女はいくらか体重（重さ）を減らしたいと思っている。"},
  {r:1841,en:"Normally, I go to bed at 11 PM.",ja:"通常は、私は午後11時に寝ます。"},
  {r:1842,en:"You should retain the receipt as proof of purchase.",ja:"購入の証明として領収書を保持するべきだ。"},
  {r:1843,en:"The proposal was accepted with overwhelming support.",ja:"その提案は圧倒的な支持を得て受け入れられた。"},
  {r:1844,en:"He got a promotion to branch manager.",ja:"彼は支店長への昇進を果たした。"},
  {r:1845,en:"A massive earthquake hit the region.",ja:"巨大な地震がその地域を襲った。"},
  {r:1846,en:"Experience is desirable but not essential for this job.",ja:"この仕事には経験が望ましいが、必須ではない。"},
  {r:1847,en:"It is rude to stare at people.",ja:"人をじっと見つめるのは失礼だ。"},
  {r:1848,en:"The application of this new technology is amazing.",ja:"この新しい技術の適用（応用）は素晴らしい。"},
  {r:1849,en:"He firmly grasped my hand.",ja:"彼はしっかりと私の手をつかんだ。"},
  {r:1850,en:"Eating too much sugar makes you fat.",ja:"砂糖を食べすぎると太る。"},
  {r:1851,en:"Scientists discovered the gene responsible for the disease.",ja:"科学者たちはその病気の原因となる遺伝子を発見した。"},
  {r:1852,en:"Please sign the contract at the bottom.",ja:"一番下に契約のサインをしてください。"},
  {r:1853,en:"We will discuss the problem at the meeting.",ja:"私たちは会議でその問題について議論するつもりだ。"},
  {r:1854,en:"The man was brought to the court.",ja:"その男は裁判所に連れてこられた。"},
  {r:1855,en:"We need a careful analysis of the data.",ja:"私たちはそのデータの慎重な分析を必要としている。"},
  {r:1856,en:"Wind turbines generate electricity.",ja:"風力タービンは電気を発生させる。"},
  {r:1857,en:"I will go regardless of the weather.",ja:"天候に関わらず、私は行くつもりだ。"},
  {r:1858,en:"He was fired for being late to work.",ja:"彼は仕事に遅刻したことで首にされた。"},
  {r:1859,en:"The author entitled his new book 'Dreams'.",ja:"著者は自分の新しい本を「夢」と題した。"},
  {r:1860,en:"The dog buried a bone in the garden.",ja:"犬は庭に骨を埋めた。"},
  {r:1861,en:"He dug a deep pit in the ground.",ja:"彼は地面に深いくぼみ（穴）を掘った。"},
  {r:1862,en:"Water is critical for our survival.",ja:"水は私たちの生存にとって極めて重要だ。"},
  {r:1863,en:"The country is facing a severe economic crisis.",ja:"その国は深刻な経済危機に直面している。"},
  {r:1864,en:"The heavy rain caused a terrible flood.",ja:"大雨が恐ろしい洪水を引き起こした。"},
  {r:1865,en:"We should protect local wildlife.",ja:"私たちは地元の野生動物を保護するべきだ。"},
  {r:1866,en:"You have the wrong number.",ja:"あなたは番号が誤っています（間違い電話です）。"},
  {r:1867,en:"She always wears a necklace.",ja:"彼女はいつもネックレスを身につけている。"},
  {r:1868,en:"He works hard to earn money for his family.",ja:"彼は家族のためにお金を稼ぐべく一生懸命働いている。"},
  {r:1869,en:"Japan imports a lot of oil from overseas.",ja:"日本は海外からたくさんの石油を輸入している。"},
  {r:1870,en:"What will you do after retirement?",ja:"退職後は何をしますか？"},
  {r:1871,en:"There is a small stream near my house.",ja:"私の家の近くに小さな流れ（小川）がある。"},
  {r:1872,en:"There are many species of birds in this forest.",ja:"この森には多くの鳥の種が存在する。"},
  {r:1873,en:"He made a quick recovery from the operation.",ja:"彼は手術からすばやい回復を遂げた。"},
  {r:1874,en:"The two parties formed a coalition government.",ja:"その二つの党は連立政権を形成した。"},
  {r:1875,en:"He is not a friend, just an acquaintance.",ja:"彼は友人ではなく、ただの知人だ。"},
  {r:1876,en:"Teenagers are often influenced by their peers.",ja:"十代の若者はしばしば仲間（同年代の人）から影響を受ける。"},
  {r:1877,en:"We had to alter our plans because of the rain.",ja:"私たちは雨のために計画を変えなければならなかった。"},
  {r:1878,en:"I have absolute trust in his ability.",ja:"私は彼の能力に絶対的な信頼を置いている。"},
  {r:1879,en:"Please leave a message with my secretary.",ja:"私の秘書に伝言を残してください。"},
  {r:1880,en:"You worked hard and deserve a rest.",ja:"あなたは一生懸命働いたので、休息に値する。"},
  {r:1881,en:"He contributed a lot of money to the hospital.",ja:"彼は病院に多額のお金を寄付した。"},
  {r:1882,en:"I didn't understand the implication of his words.",ja:"私は彼の言葉の含み（裏の意味）を理解できなかった。"},
  {r:1883,en:"Please try to stay calm.",ja:"どうか穏やかで（落ち着いて）いるように努めてください。"},
  {r:1884,en:"The world is constantly changing.",ja:"世界は常に変化している。"},
  {r:1885,en:"Kyoto is famous for its beautiful temples.",ja:"京都は美しいお寺で有名だ。"},
  {r:1886,en:"That is precisely what I meant.",ja:"それは正確に私が意味したことだ。"},
  {r:1887,en:"I couldn't find a parking space.",ja:"駐車場のスペースが見つからなかった。"},
  {r:1888,en:"I saw your ad in the newspaper.",ja:"新聞であなたの広告を見ました。"},
  {r:1889,en:"The commander gave an order to his soldiers.",ja:"司令官は兵士たちに命令を下した。"},
  {r:1890,en:"The sun will rise soon.",ja:"もうすぐ太陽が上がる（昇る）だろう。"},
  {r:1891,en:"You can gain a lot of experience from this job.",ja:"あなたはこの仕事から多くの経験を得ることができる。"},
  {r:1892,en:"My parents are very proud of me.",ja:"私の両親は私のことをとても誇らしげに思っている。"},
  {r:1893,en:"Don't lose your keys.",ja:"鍵を失わないでください。"},
  {r:1894,en:"She works as an editor for a fashion magazine.",ja:"彼女はファッション雑誌の編集者として働いている。"},
  {r:1895,en:"The police finally caught the killer.",ja:"警察はついにその殺人者を捕まえた。"},
  {r:1896,en:"What kind of material is this dress made of?",ja:"このドレスはどんな種類の材料で作られていますか？"},
  {r:1897,en:"She held the baby to her breast.",ja:"彼女は赤ん坊を胸部に抱き寄せた。"},
  {r:1898,en:"I don't have much appetite today.",ja:"私は今日はあまり食欲がない。"},
  {r:1899,en:"This soup has a unique flavor.",ja:"このスープには独特の風味がある。"},
  {r:1900,en:"You should aim for the highest score.",ja:"最高得点にねらいをつけるべきだ。"},
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
  console.log(`Applied ${c} examples to 2級 (1801-1900). Saved.`);
}
main().catch(console.error);
