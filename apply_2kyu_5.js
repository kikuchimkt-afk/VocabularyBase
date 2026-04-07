const xlsx = require('xlsx');
const fs = require('fs');
const filePath = String.raw`C:\Users\makoto\Documents\GitHub\VocabularyBase\単語リスト\出題頻度順リストのみ_英検英単語.xlsx`;
const outPath = filePath.replace('.xlsx', '_updated.xlsx');
const targetFile = fs.existsSync(outPath) ? outPath : filePath;

const data = [
  {r:401,en:"Many supermarkets now charge for plastic bags.",ja:"現在、多くのスーパーマーケットではビニール袋が有料となっている。"},
  {r:402,en:"Smoking can cause serious harm to your health.",ja:"喫煙はあなたの健康に深刻な害を及ぼす可能性がある。"},
  {r:403,en:"He has an unbelievable amount of energy.",ja:"彼は信じられないほどのエネルギーを持っている。"},
  {r:404,en:"The man insisted that he was innocent of the crime.",ja:"その男は自分がその犯罪に対して無罪であると主張した。"},
  {r:405,en:"His arrogant attitude made everyone angry.",ja:"彼の傲慢な態度はみんなを怒らせた。"},
  {r:406,en:"We watched the ships come into the harbor.",ja:"私たちは船が港に入ってくるのを見た。"},
  {r:407,en:"He needs to learn how to control his temper.",ja:"彼はかんしゃくをコントロールする方法を学ぶ必要がある。"},
  {r:408,en:"According to legend, a dragon lived in this cave.",ja:"伝説によると、この洞窟にはドラゴンが住んでいた。"},
  {r:409,en:"The math test was fairly difficult this time.",ja:"今回の数学のテストはかなり難しかった。"},
  {r:410,en:"I only have a vague memory of my childhood.",ja:"私は子供時代について漠然とした記憶しか持っていない。"},
  {r:411,en:"Farmers are busy during the fall harvest.",ja:"農家は秋の収穫の時期は忙しい。"},
  {r:412,en:"We need your assistance to complete this project.",ja:"このプロジェクトを完成させるためには、あなたの支援が必要です。"},
  {r:413,en:"The two countries are trying to avoid military conflict.",ja:"その両国は軍事的な対立を避けようとしている。"},
  {r:414,en:"Earth is the third planet from the sun.",ja:"地球は太陽から3番目の惑星である。"},
  {r:415,en:"The rain ruined our plans for a picnic.",ja:"雨が私たちのピクニックの計画を台無しにした。"},
  {r:416,en:"The company will launch a new product next month.",ja:"その会社は来月、新製品を発売する予定だ。"},
  {r:417,en:"I went to the bank to withdraw some cash.",ja:"私はいくらかの現金を引き出すために銀行へ行った。"},
  {r:418,en:"He refused to accept my apology.",ja:"彼は私の謝罪を受け入れることを拒否した。"},
  {r:419,en:"The mother warmly embraced her son.",ja:"母親は息子を温かく抱きしめた。"},
  {r:420,en:"It is dangerous to overtake another car on a curve.",ja:"カーブで他の車を追い越すのは危険だ。"},
  {r:421,en:"The new law will restrict the use of certain chemicals.",ja:"新しい法律は特定の化学物質の使用を制限するだろう。"},
  {r:422,en:"Please read the instructions carefully before using it.",ja:"それを使用する前に指示（説明書）を注意深く読んでください。"},
  {r:423,en:"The item you want is currently out of stock.",ja:"あなたのお望みの品は現在在庫切れです。"},
  {r:424,en:"Our company must offer better prices than our competitors.",ja:"我が社は競合他社よりも良い価格を提供しなければならない。"},
  {r:425,en:"The stadium was filled with excited spectators.",ja:"スタジアムは興奮した観客でいっぱいだった。"},
  {r:426,en:"The famous explorer discovered the ancient ruins.",ja:"その有名な探検家が古代遺跡を発見した。"},
  {r:427,en:"The room was filled with the smell of coffee.",ja:"その部屋はコーヒーの香りで満たされていた。"},
  {r:428,en:"The flight was delayed due to heavy snow.",ja:"大雪が原因でフライトが遅れた。"},
  {r:429,en:"This song reminds me of my high school days.",ja:"この歌は私に高校時代を思い出させる。"},
  {r:430,en:"I need quiet to concentrate on my studies.",ja:"私は勉強に集中するために静けさが必要だ。"},
  {r:431,en:"It is not nice to laugh at someone's mistakes.",ja:"誰かの間違いを見て笑うのは良くない。"},
  {r:432,en:"His family is very well off.",ja:"彼の家族はとても裕福だ。"},
  {r:433,en:"Keep going straight on this street.",ja:"この通りをまっすぐに進み続けてください。"},
  {r:434,en:"I heard a dog barking in the far off distance.",ja:"はるかかなたの距離で犬が吠えているのが聞こえた。"},
  {r:435,en:"All people should have equal rights.",ja:"すべての人は同等の権利を持つべきだ。"},
  {r:436,en:"Can you drop me off at the station?",ja:"私を駅で降ろして（落として）くれますか？"},
  {r:437,en:"Don't leave out any important details.",ja:"重要な詳細を一つも除外しないでください。"},
  {r:438,en:"I have two bags; one is black, and the other is blue.",ja:"私はカバンを2つ持っています。1つは黒で、もう一方は青です。"},
  {r:439,en:"We must work together to solve this problem.",ja:"私たちはこの問題を解決するために協力しなければならない。"},
  {r:440,en:"This book is concerned with modern Japanese history.",ja:"この本は現代の日本の歴史に関係している。"},
  {r:441,en:"She spent her childhood in a small village.",ja:"彼女は子供時代を小さな村で過ごした。"},
  {r:442,en:"We need to build a sustainable society for the future.",ja:"私たちは未来のために存続可能（持続可能）な社会を築く必要がある。"},
  {r:443,en:"I had some leftover pizza for breakfast.",ja:"私は朝食に残り物のピザを食べた。"},
  {r:444,en:"The trip will take three days at most.",ja:"その旅行は多くとも3日しかかからないだろう。"},
  {r:445,en:"The game was canceled because of the rain.",ja:"雨のために試合は中止になった。"},
  {r:446,en:"Hundreds of people gathered to watch the parade.",ja:"何百もの人がパレードを見るために集まった。"},
  {r:447,en:"The new system improved work efficiency.",ja:"新しいシステムは作業の効率を向上させた。"},
  {r:448,en:"The arrangement of the furniture makes the room look bigger.",ja:"家具の配置が部屋を広く見せている。"},
  {r:449,en:"You should treat everyone with respect.",ja:"あなたは皆を敬意をもって扱うべきだ。"},
  {r:450,en:"Swimming uses almost every muscle in the body.",ja:"水泳は体のほぼすべての筋肉を使う。"},
  {r:451,en:"We must consider every aspect of the problem.",ja:"私たちはその問題のあらゆる側面を考慮しなければならない。"},
  {r:452,en:"I agree with the content of his speech.",ja:"私は彼のスピーチの内容に賛成だ。"},
  {r:453,en:"You need a prescription to buy this medicine.",ja:"この薬を買うには処方箋が必要だ。"},
  {r:454,en:"I am anxious about the results of my medical test.",ja:"私は医療検査の結果について不安だ。"},
  {r:455,en:"Ancient Romans built many great structures.",ja:"古代ローマ人は多くの偉大な建造物を建てた。"},
  {r:456,en:"He generously donated a large sum of money to the charity.",ja:"彼はその慈善団体に多額のお金を気前よく寄付した。"},
  {r:457,en:"She is studying English literature at university.",ja:"彼女は大学で英文学を勉強している。"},
  {r:458,en:"I hope you do well on your exams.",ja:"あなたが試験でうまくやることを願っています。"},
  {r:459,en:"The deadline for the report is next Friday.",ja:"そのレポートの締め切りは来週の金曜日だ。"},
  {r:460,en:"Most birds can fly, but penguins are an exception.",ja:"ほとんどの鳥は飛べるが、ペンギンは例外だ。"},
  {r:461,en:"The service is temporarily unavailable due to maintenance.",ja:"メンテナンスのため、サービスは一時的に利用できません。"},
  {r:462,en:"The program provides students with practical skills.",ja:"そのプログラムは生徒たちに実践的なスキルを提供する。"},
  {r:463,en:"We need to raise funds to build a new library.",ja:"私たちは新しい図書館を建てるための資金を集める必要がある。"},
  {r:464,en:"Eating healthy food will pay off in the long run.",ja:"健康的な食べ物を食べることは、長い目で見れば報われるだろう。"},
  {r:465,en:"He has accomplished a lot in his career.",ja:"彼は自身のキャリアで多くのことを成し遂げた。"},
  {r:466,en:"Please allow me to introduce my new friend.",ja:"私の新しい友人を紹介させてください。"},
  {r:467,en:"Their working hours overlap by two hours.",ja:"彼らの勤務時間は2時間重なっている。"},
  {r:468,en:"It is difficult to identify the cause of the problem.",ja:"その問題の原因を見分ける（特定する）ことは難しい。"},
  {r:469,en:"The project was a collaboration between two teams.",ja:"そのプロジェクトは2つのチーム間の共同で行われた。"},
  {r:470,en:"The detective is looking for clues to solve the mystery.",ja:"その探偵は謎を解くための手がかりを探している。"},
  {r:471,en:"Freedom of speech is a basic right in a democracy.",ja:"言論の自由は民主主義における基本的人権だ。"},
  {r:472,en:"We had to modify our plans because of the bad weather.",ja:"私たちは悪天候のため、計画を修正しなければならなかった。"},
  {r:473,en:"Stir the soup constantly so it doesn't burn.",ja:"焦げないように、絶えずスープをかき混ぜてください。"},
  {r:474,en:"The ball rolled under the sofa.",ja:"ボールがソファの下に転がった。"},
  {r:475,en:"The moon is in orbit around the Earth.",ja:"月は地球の周りの軌道上にある。"},
  {r:476,en:"Buses run frequently between the airport and the city.",ja:"空港と市内の間はバスが頻繁に運行している。"},
  {r:477,en:"He reacted emotionally when he heard the bad news.",ja:"彼はその悪い知らせを聞いた時、感情的に反応した。"},
  {r:478,en:"Teachers evaluate their students' progress at the end of the term.",ja:"教師たちは学期の終わりに生徒の進歩を評価する。"},
  {r:479,en:"Soldiers are trained to defend their country.",ja:"兵士たちは国を守るよう訓練されている。"},
  {r:480,en:"The school is located in a quiet residential district.",ja:"その学校は静かな住宅地域にある。"},
  {r:481,en:"What is the purpose of your visit to Japan?",ja:"あなたの日本訪問の目的は何ですか？"},
  {r:482,en:"She said a quick prayer before the test.",ja:"彼女はテストの前に短い祈りを捧げた。"},
  {r:483,en:"There is little prospect of his recovery.",ja:"彼が回復する見込みはほとんどない。"},
  {r:484,en:"They raised money for the victims of the earthquake.",ja:"彼らは地震の犠牲者のためにお金を集めた。"},
  {r:485,en:"We could see the mountains in the distant background.",ja:"私たちは遠く離れた背景に山々を見ることができた。"},
  {r:486,en:"There are various ways to solve this math problem.",ja:"この数学の問題を解くには様々な方法がある。"},
  {r:487,en:"The stars were clearly visible in the night sky.",ja:"夜空には星がはっきりと目に見えた。"},
  {r:488,en:"I need to wrap this present for her birthday.",ja:"私は彼女の誕生日にこのプレゼントを包む必要がある。"},
  {r:489,en:"The dog likes to dig holes in the garden.",ja:"その犬は庭で穴を掘るのが好きだ。"},
  {r:490,en:"I will drop by your office tomorrow afternoon.",ja:"明日の午後、あなたのオフィスにちょっと立ち寄ります。"},
  {r:491,en:"He will take over the family business next year.",ja:"彼は来年、家業を引き継ぐ予定だ。"},
  {r:492,en:"He took the photograph from a strange angle.",ja:"彼は奇妙な角度からその写真を撮った。"},
  {r:493,en:"You can make the payment by credit card.",ja:"クレジットカードで支払いをすることができます。"},
  {r:494,en:"The police are looking into the cause of the accident.",ja:"警察はその事故の原因を調べている。"},
  {r:495,en:"The idea sounds good, but it won't work in practice.",ja:"そのアイデアは良さそうだが、実際にはうまくいかないだろう。"},
  {r:496,en:"The construction project is proceeding on schedule.",ja:"その建設プロジェクトは予定通りに進んでいる。"},
  {r:497,en:"I once lived in a small town near the mountains.",ja:"私はかつて山に近い小さな町に住んでいた。"},
  {r:498,en:"He looks young, but in fact, he is over forty.",ja:"彼は若く見えるが、実際には40歳を超えている。"},
  {r:499,en:"He sent his manuscript to several publishers.",ja:"彼はいくつかの出版社に自分の原稿を送った。"},
  {r:500,en:"I am looking forward to seeing you again.",ja:"私はまたあなたにお会いするのを楽しみにしています。"},
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
  console.log(`Applied ${c} examples to 2級 (401-500). Saved.`);
}
main().catch(console.error);
