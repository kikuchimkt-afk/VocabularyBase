const xlsx = require('xlsx');
const fs = require('fs');
const filePath = String.raw`C:\Users\makoto\Documents\GitHub\VocabularyBase\単語リスト\出題頻度順リストのみ_英検英単語.xlsx`;
const outPath = filePath.replace('.xlsx', '_updated.xlsx');
const targetFile = fs.existsSync(outPath) ? outPath : filePath;

const data = [
  {r:101,en:"He will probably be late for the meeting.",ja:"彼はおそらく会議に遅れるだろう。"},
  {r:102,en:"In contrast to her sister, she is very outgoing.",ja:"姉と対照的に、彼女はとても社交的だ。"},
  {r:103,en:"There are many things you can do; for instance, you can learn a new language.",ja:"できることはたくさんあります。例えば、新しい言語を学ぶことができます。"},
  {r:104,en:"The hotel provides free Wi-Fi. Additionally, they offer a free breakfast.",ja:"そのホテルは無料Wi-Fiを提供している。さらに、無料の朝食も提供している。"},
  {r:105,en:"He felt a lot of anxiety before the interview.",ja:"彼は面接の前に多くの不安を感じた。"},
  {r:106,en:"Many animals are in danger, for example, pandas and tigers.",ja:"多くの動物が危険にさらされている。例えば、パンダやトラだ。"},
  {r:107,en:"The human brain is very complex.",ja:"人間の脳は非常に複雑である。"},
  {r:108,en:"I am certain that he will succeed in the future.",ja:"彼が将来成功すると私は確信している。"},
  {r:109,en:"She felt a sharp pain in her back.",ja:"彼女は背中に鋭い痛みを感じた。"},
  {r:110,en:"He opened the door in response to the knock.",ja:"彼はノックに反応してドアを開けた。"},
  {r:111,en:"Don't stare at people; it's not polite.",ja:"人をじっと見つめてはいけません。それは失礼です。"},
  {r:112,en:"The project will involve everyone in the office.",ja:"そのプロジェクトはオフィスの全員を巻き込むだろう。"},
  {r:113,en:"They reached the finish line at the same time.",ja:"彼らは同時にゴールラインに到達した。"},
  {r:114,en:"The ancient ruins are well preserved.",ja:"その古代遺跡は良好に保存されている。"},
  {r:115,en:"Japan is known as the Land of the Rising Sun.",ja:"日本は日出ずる国として知られている。"},
  {r:116,en:"We need accurate information to make a decision.",ja:"決断を下すためには正確な情報が必要だ。"},
  {r:117,en:"The scientists analyzed the data carefully.",ja:"科学者たちはそのデータを注意深く分析した。"},
  {r:118,en:"The store sells a variety of goods.",ja:"その店はさまざまな商品を売っている。"},
  {r:119,en:"You need to obtain a visa to enter the country.",ja:"その国に入国するにはビザを獲得する必要がある。"},
  {r:120,en:"I feel deep sympathy for the victims of the disaster.",ja:"私はその災害の犠牲者に深い同情を感じる。"},
  {r:121,en:"Flexibility is important when solving problems.",ja:"問題を解決する時には柔軟性が重要だ。"},
  {r:122,en:"Winter is approaching, so it's getting colder.",ja:"冬が近づいているので、寒くなってきている。"},
  {r:123,en:"He managed to pass the difficult exam.",ja:"彼はなんとかその難しい試験に合格した。"},
  {r:124,en:"If you need help, please reach out to us.",ja:"助けが必要なときは、私たちに手を差し出してください（連絡してください）。"},
  {r:125,en:"She spoke quietly for fear of waking the baby.",ja:"彼女は赤ちゃんを起こすのを恐れて静かに話した。"},
  {r:126,en:"I am speaking on behalf of my team.",ja:"私はチームの代わりに（代表して）話しています。"},
  {r:127,en:"The flight was canceled on account of the storm.",ja:"嵐のため、その飛行機はキャンセルされた。"},
  {r:128,en:"This juice contains no artificial colors.",ja:"このジュースには人工的な着色料は含まれていない。"},
  {r:129,en:"The heavy rain prevented us from going out.",ja:"大雨が私たちが外出するのを妨げた。"},
  {r:130,en:"I prefer to read a book rather than watch TV.",ja:"私はテレビを見るよりむしろ本を読みたい。"},
  {r:131,en:"The temperature dropped slightly in the evening.",ja:"夕方になって気温がわずかに下がった。"},
  {r:132,en:"The government took measures to reduce traffic accidents.",ja:"政府は交通事故を減らすための措置を取った。"},
  {r:133,en:"Some people are born with a talent for music.",ja:"音楽の才能を生まれつき持っている人もいる。"},
  {r:134,en:"We should not waste water.",ja:"私たちは水を浪費するべきではない。"},
  {r:135,en:"He moved to Tokyo, and I haven't seen him since then.",ja:"彼は東京に引っ越した。私はそれ以来彼に会っていない。"},
  {r:136,en:"The caterpillar will turn into a beautiful butterfly.",ja:"そのイモムシは美しい蝶に変わるだろう。"},
  {r:137,en:"Farmers use fertilizer to grow crops.",ja:"農家は作物を育てるために肥料を使う。"},
  {r:138,en:"This desk is made of solid wood.",ja:"この机は無垢の木で出来ている。"},
  {r:139,en:"The company decided to adopt a new system.",ja:"会社は新しいシステムを取り入れることに決めた。"},
  {r:140,en:"Please raise your hand if you have a question.",ja:"質問がある場合は手を挙げてください。"},
  {r:141,en:"You should avoid eating too much sugar.",ja:"砂糖の食べ過ぎは避けるべきだ。"},
  {r:142,en:"Make sure you lock the door before leaving.",ja:"出かける前に必ずドアの鍵をかけるように確かめてください。"},
  {r:143,en:"She wants to participate in the marathon.",ja:"彼女はそのマラソンに参加したがっている。"},
  {r:144,en:"He worked hard to achieve his goal.",ja:"彼は目標を達成するために一生懸命働いた。"},
  {r:145,en:"I cannot tolerate this noise anymore.",ja:"私はもうこの騒音に耐えられない。"},
  {r:146,en:"They started their long journey to the south.",ja:"彼らは南への長い旅を始めた。"},
  {r:147,en:"I get along well with my new coworkers.",ja:"私は新しい同僚とうまく（仲良く）やっている。"},
  {r:148,en:"It is hard to keep up with the latest fashion.",ja:"最新のファッションに遅れず付いていくのは難しい。"},
  {r:149,en:"The factory increased its car production.",ja:"その工場は車の生産を増やした。"},
  {r:150,en:"Human bodies are made up of millions of cells.",ja:"人間の体は何百万もの細胞で構成されている。"},
  {r:151,en:"I like healthy foods such as vegetables and fruits.",ja:"私は野菜や果物のような健康的な食べ物が好きです。"},
  {r:152,en:"It took me three days to complete the puzzle.",ja:"そのパズルを完成させるのに3日かかった。"},
  {r:153,en:"The festival is held annually in our town.",ja:"その祭りは私たちの町で毎年（年一回）開催される。"},
  {r:154,en:"She wants to be a clinical psychologist.",ja:"彼女は臨床心理学者になりたいと思っている。"},
  {r:155,en:"Many people invest in the stock market.",ja:"多くの人が株式市場に投資している。"},
  {r:156,en:"There is a high demand for electric cars now.",ja:"現在、電気自動車には高い需要がある。"},
  {r:157,en:"He didn't respond to my email.",ja:"彼は私のメールに返答しなかった。"},
  {r:158,en:"My grandfather gave me a valuable watch.",ja:"祖父は私に価値のある時計をくれた。"},
  {r:159,en:"The police are looking for a witness to the accident.",ja:"警察はその事故の目撃者を探している。"},
  {r:160,en:"Many children around the world live in poverty.",ja:"世界中の多くの子どもたちが貧困の中で暮らしている。"},
  {r:161,en:"Don't embarrass me in front of my friends.",ja:"友達の前で私を恥ずかしがらせないで。"},
  {r:162,en:"We plan to enlarge our living room.",ja:"私たちは居間を拡大する予定だ。"},
  {r:163,en:"Fresh vegetables are the main ingredient of this soup.",ja:"新鮮な野菜がこのスープの主な材料だ。"},
  {r:164,en:"The overall cost of the trip was high.",ja:"その旅行の全体的な費用は高かった。"},
  {r:165,en:"I spend two hours reading every day.",ja:"私は毎日2時間を読書に費やします。"},
  {r:166,en:"He purchased a new car yesterday.",ja:"彼は昨日新しい車を購入した。"},
  {r:167,en:"She is a brilliant young scientist.",ja:"彼女は優れた若い科学者だ。"},
  {r:168,en:"The industrial revolution changed the world.",ja:"産業革命は世界を変えた。"},
  {r:169,en:"Who is in charge of this project?",ja:"誰がこのプロジェクトの担当をしていますか？"},
  {r:170,en:"I had previously met him at a party.",ja:"私は以前、パーティーで彼に会ったことがあった。"},
  {r:171,en:"This smartphone has many new features.",ja:"このスマートフォンには多くの新しい特徴（機能）がある。"},
  {r:172,en:"He made an excuse for being late.",ja:"彼は遅刻の言い訳をした。"},
  {r:173,en:"You can always rely on your parents for help.",ja:"助けが必要なときはいつでも両親を頼りにできる。"},
  {r:174,en:"I will vote for the new candidate.",ja:"私はその新しい候補者に投票します。"},
  {r:175,en:"The population of this town is decreasing.",ja:"この町の人口は減少している。"},
  {r:176,en:"There are frequent bus services to the airport.",ja:"空港への頻繁なバスの運行がある。"},
  {r:177,en:"Einstein is famous for his theory of relativity.",ja:"アインシュタインは相対性理論で有名だ。"},
  {r:178,en:"Things fall to the ground because of gravity.",ja:"物は重力のために地面に落ちる。"},
  {r:179,en:"Can you translate this letter from French to English?",ja:"この手紙をフランス語から英語に翻訳してもらえますか？"},
  {r:180,en:"We bought some new office equipment.",ja:"私たちは新しいオフィス設備をいくつか買った。"},
  {r:181,en:"This is a rare bird that lives only in this forest.",ja:"これはこの森にしか生息していない珍しい鳥だ。"},
  {r:182,en:"I decided to start running every morning.",ja:"私は毎朝ランニングを始めることに決心した。"},
  {r:183,en:"I need to open a bank account to receive my salary.",ja:"給料を受け取るために銀行口座を開設する必要がある。"},
  {r:184,en:"He spent a large amount of money on his car.",ja:"彼は自分の車に多額の（大量の）お金を使った。"},
  {r:185,en:"Keep the room at a constant temperature.",ja:"部屋を一定の温度に保ちなさい。"},
  {r:186,en:"Trains are an efficient way to travel in the city.",ja:"電車は都市部を移動するための効率のいい手段だ。"},
  {r:187,en:"Is this seat available?",ja:"この席は利用できますか（空いていますか）？"},
  {r:188,en:"I am looking for a particular kind of tea.",ja:"私は特定の種類の紅茶を探しています。"},
  {r:189,en:"We couldn't locate the stolen car.",ja:"私たちは盗まれた車の位置を突きとめることができなかった。"},
  {r:190,en:"I read this book on your recommendation.",ja:"私はあなたの推薦でこの本を読みました。"},
  {r:191,en:"This rule does not apply to children.",ja:"この規則は子供には適用されません。"},
  {r:192,en:"He asked the question politely.",ja:"彼はその質問を丁寧に尋ねた。"},
  {r:193,en:"I accidentally deleted the file from my computer.",ja:"私は誤ってコンピューターからそのファイルを削除してしまった。"},
  {r:194,en:"The delicious meal satisfied all the guests.",ja:"その美味しい食事は全ての客を満足させた。"},
  {r:195,en:"I have a dentist appointment tomorrow.",ja:"私は明日、歯医者の約束（予約）があります。"},
  {r:196,en:"Farmers try to use fewer harmful chemicals.",ja:"農家は有害な化学物質の使用を減らそうとしている。"},
  {r:197,en:"Please attach a recent photo to your resume.",ja:"履歴書に最近の写真を貼り付けてください。"},
  {r:198,en:"Smoking is not permitted in this building.",ja:"この建物内での喫煙は許可されていません。"},
  {r:199,en:"Washing hands helps prevent colds.",ja:"手を洗うことは風邪を予防するのに役立ちます。"},
  {r:200,en:"The company wants to increase its sales.",ja:"その会社は売上を増やしたいと考えている。"},
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
  console.log(`Applied ${c} examples to 2級 (101-200). Saved.`);
}
main().catch(console.error);
