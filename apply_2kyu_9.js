const xlsx = require('xlsx');
const fs = require('fs');
const filePath = String.raw`C:\Users\makoto\Documents\GitHub\VocabularyBase\単語リスト\出題頻度順リストのみ_英検英単語.xlsx`;
const outPath = filePath.replace('.xlsx', '_updated.xlsx');
const targetFile = fs.existsSync(outPath) ? outPath : filePath;

const data = [
  {r:801,en:"He works as a researcher at the university.",ja:"彼は大学で研究者として働いている。"},
  {r:802,en:"This map shows the exact location of the treasure.",ja:"この地図は宝の正確な位置を示している。"},
  {r:803,en:"Humans need oxygen to live.",ja:"人間が生きるためには酸素が必要だ。"},
  {r:804,en:"The school decided to do away with the old uniform rules.",ja:"学校は古い制服のルールを廃止することに決めた。"},
  {r:805,en:"Take care not to catch a cold.",ja:"風邪をひかないように注意しなさい。"},
  {r:806,en:"You shouldn't neglect your health.",ja:"自分の健康を無視する（おろそかにする）べきではない。"},
  {r:807,en:"We are obliged to follow the traffic rules.",ja:"私たちは交通ルールに従うことが義務付けられている。"},
  {r:808,en:"Only a few people survived the terrible accident.",ja:"そのひどい事故から生き残ったのはわずかな人だけだった。"},
  {r:809,en:"Camels can live in the hot desert without water for days.",ja:"ラクダは暑い砂漠で何日も水なしで生きることができる。"},
  {r:810,en:"He made a large donation to the charity.",ja:"彼は慈善団体に多額の寄付をした。"},
  {r:811,en:"The museum will exhibit his new paintings next month.",ja:"その博物館は来月、彼の新しい絵画を展示する（示す）予定だ。"},
  {r:812,en:"The principal reason for his success was hard work.",ja:"彼の成功の主要な理由は努力だった。"},
  {r:813,en:"This company sells high-quality electronic products.",ja:"この会社は高品質の電子製品を販売している。"},
  {r:814,en:"In short, we need to work harder.",ja:"要するに、私たちはもっと一生懸命働く必要がある。"},
  {r:815,en:"He wore a formal suit to the wedding.",ja:"彼は結婚式に形式的な（フォーマルな）スーツを着ていった。"},
  {r:816,en:"It took a lot of persuasion to make him agree.",ja:"彼を同意させるには多くの説得が必要だった。"},
  {r:817,en:"They bought a huge house in the suburbs.",ja:"彼らは郊外に巨大な家を買った。"},
  {r:818,en:"Many birds migrate to the south in winter.",ja:"多くの鳥は冬になると南へ移行する（渡る）。"},
  {r:819,en:"He gave a very logical explanation for the problem.",ja:"彼はその問題に対してとても論理的な説明をした。"},
  {r:820,en:"The thieves managed to get away with the jewels.",ja:"泥棒たちはなんとか宝石を持ち逃げした。"},
  {r:821,en:"It is difficult to interpret the meaning of this poem.",ja:"この詩の意味を解釈するのは難しい。"},
  {r:822,en:"The accuracy of the information is very important.",ja:"その情報の正確さは非常に重要だ。"},
  {r:823,en:"She made a great contribution to the local community.",ja:"彼女は地域社会に大きな貢献をした。"},
  {r:824,en:"We plan to climb Mt. Fuji next summer.",ja:"私たちは来年の夏に富士山に登る予定だ。"},
  {r:825,en:"Please stand up when you hear your name.",ja:"自分の名前が呼ばれたら立ってください。"},
  {r:826,en:"We must try to preserve the natural environment.",ja:"私たちは自然環境を保存するよう努めなければならない。"},
  {r:827,en:"I have to do the laundry this weekend.",ja:"今週末は洗濯をしなければならない。"},
  {r:828,en:"The manager deals with customer complaints.",ja:"マネージャーは顧客の苦情を扱う。"},
  {r:829,en:"He complained of a headache and went home early.",ja:"彼は頭痛について不満を漏らし（頭痛を訴えて）、早退した。"},
  {r:830,en:"She took an intensive English course during the summer.",ja:"彼女は夏休みの間、集中的な英語のコースを受講した。"},
  {r:831,en:"I will look through these documents later.",ja:"後でこれらの書類をひと通り調べます。"},
  {r:832,en:"We have a limited budget for this project.",ja:"このプロジェクトには限られた予算しかない。"},
  {r:833,en:"We saw an ancient Egyptian mummy at the museum.",ja:"私たちは博物館で古代エジプトのミイラを見た。"},
  {r:834,en:"He felt a sudden dizziness and had to sit down.",ja:"彼は突然のめまいを感じ、座らなければならなかった。"},
  {r:835,en:"We occasionally eat out on weekends.",ja:"私たちは時折、週末に外食する。"},
  {r:836,en:"The audience clapped loudly after the performance.",ja:"パフォーマンスの後、聴衆は大きな拍手をした。"},
  {r:837,en:"Water is a clear, colorless liquid.",ja:"水は透明で無色の液体だ。"},
  {r:838,en:"Hydrogen and oxygen combine to form water.",ja:"水素と酸素が結合して水を形成する。"},
  {r:839,en:"Are you implying that I made a mistake?",ja:"あなたは私が間違いをしたとほのめかしているのですか？"},
  {r:840,en:"The singer received loud applause from the audience.",ja:"その歌手は観客から大きな拍手喝采を受けた。"},
  {r:841,en:"That is a ridiculous idea.",ja:"それはばかげているアイデアだ。"},
  {r:842,en:"She ignored my advice and did what she wanted.",ja:"彼女は私のアドバイスを無視して自分の好きなようにした。"},
  {r:843,en:"A whale is not a fish, but a mammal.",ja:"クジラは魚ではなく哺乳類だ。"},
  {r:844,en:"It is indeed a very sad story.",ja:"それは実にとても悲しい物語だ。"},
  {r:845,en:"He blamed me for the failure of the project.",ja:"彼はプロジェクトの失敗について私を責めた（責任を問うた）。"},
  {r:846,en:"They found a dinosaur fossil in the mountain.",ja:"彼らは山で恐竜の化石を見つけた。"},
  {r:847,en:"It is obvious that he is lying.",ja:"彼が嘘をついているのは明白だ。"},
  {r:848,en:"We need precise measurements to build the table.",ja:"テーブルを作るには正確な測定値が必要だ。"},
  {r:849,en:"The secretary saw him in to the manager's office.",ja:"秘書は彼を案内してマネージャーの部屋に入れた。"},
  {r:850,en:"What happened to your arm?",ja:"あなたの腕に何が起こったのですか？"},
  {r:851,en:"They had a heated argument about politics.",ja:"彼らは政治について白熱した口論をした。"},
  {r:852,en:"The presentation was visually appealing.",ja:"そのプレゼンテーションは視覚的に魅力的だった。"},
  {r:853,en:"I'm terribly sorry for keeping you waiting.",ja:"お待たせしてひどく（ものすごく）申し訳ありません。"},
  {r:854,en:"The police went after the bank robbers.",ja:"警察は銀行強盗を追いかけた。"},
  {r:855,en:"He is a quiet and gentle person by nature.",ja:"彼は本来、静かで優しい人だ。"},
  {r:856,en:"Which direction is the station?",ja:"駅はどの方角ですか？"},
  {r:857,en:"His opinion differs from mine.",ja:"彼の意見は私のものとは違う。"},
  {r:858,en:"The news of his sudden marriage astonished everyone.",ja:"彼の突然の結婚の知らせは皆をひどく驚かせた。"},
  {r:859,en:"The teacher divided the class into small groups.",ja:"先生はクラスを小さなグループに分割した。"},
  {r:860,en:"You need at least three days to finish this job.",ja:"この仕事を終えるには少なくとも3日必要だ。"},
  {r:861,en:"Don't distract me while I am driving.",ja:"私が運転している間に気を散らさないでください。"},
  {r:862,en:"Can you describe the man you saw yesterday?",ja:"昨日見た男を描写して（述べて）くれませんか？"},
  {r:863,en:"Make sure everything is in place before the guests arrive.",ja:"客が到着する前に、すべてが決まった場所にあることを確認しなさい。"},
  {r:864,en:"What is your opinion on this issue?",ja:"この問題についてのあなたの意見は何ですか？"},
  {r:865,en:"I finally passed the driving test.",ja:"私はついに運転免許試験に合格した。"},
  {r:866,en:"He had a frown on his face when he heard the news.",ja:"その知らせを聞いたとき、彼はしかめっ面をしていた。"},
  {r:867,en:"I want to learn more about Japanese culture.",ja:"私は日本の文化についてもっと学びたい。"},
  {r:868,en:"She overcame many difficulties to achieve her goal.",ja:"彼女は目標を達成するために多くの困難を克服した。"},
  {r:869,en:"I saw a tall figure standing in the dark.",ja:"暗闇の中に背の高い姿（人影）が立っているのを見た。"},
  {r:870,en:"Her speech inspired many young people.",ja:"彼女のスピーチは多くの若者を鼓舞した。"},
  {r:871,en:"He won the first prize in the speech contest.",ja:"彼はスピーチコンテストで一等賞をとった。"},
  {r:872,en:"Graduating from college is a great accomplishment.",ja:"大学を卒業することは大きな成果（達成）である。"},
  {r:873,en:"My family lives in a quiet suburb of Tokyo.",ja:"私の家族は東京の静かな郊外に住んでいる。"},
  {r:874,en:"He dragged the heavy box across the floor.",ja:"彼は重い箱を床の上を引きずった。"},
  {r:875,en:"Water and soil contain various minerals.",ja:"水と土壌には様々な無機物（ミネラル）が含まれている。"},
  {r:876,en:"The prisoner tried to escape from the jail.",ja:"その囚人は刑務所から脱走しようとした。"},
  {r:877,en:"His new book will come out next month.",ja:"彼の新しい本は来月世に出る（出版される）。"},
  {r:878,en:"She was trembling with cold.",ja:"彼女は寒さで震えていた。"},
  {r:879,en:"I had to stay up late to finish my homework.",ja:"私は宿題を終わらせるために夜遅くまで起きていなければならなかった。"},
  {r:880,en:"This bag is made of genuine leather.",ja:"このカバンは本物の革で作られている。"},
  {r:881,en:"I came across an old friend at the supermarket.",ja:"私はスーパーマーケットで古い友人に（偶然）出くわした。"},
  {r:882,en:"Don't worry needlessly about the future.",ja:"将来のことで不必要に心配しないでください。"},
  {r:883,en:"I gave him my apple in exchange for his orange.",ja:"私は彼のオレンジと引き換えに私のリンゴを彼にあげた。"},
  {r:884,en:"Please turn off your phone during the movie.",ja:"映画の間は携帯電話の電源を切ってください。"},
  {r:885,en:"Japan consists of many islands.",ja:"日本は多くの島から成っている。"},
  {r:886,en:"This land is private property.",ja:"この土地は私有の財産だ。"},
  {r:887,en:"He has been deaf since birth.",ja:"彼は生まれつき耳が不自由だ。"},
  {r:888,en:"The Mona Lisa is a masterpiece of Leonardo da Vinci.",ja:"モナ・リザはレオナルド・ダ・ヴィンチの傑作だ。"},
  {r:889,en:"This train is bound for Tokyo.",ja:"この電車は東京行きです。"},
  {r:890,en:"Do you have this shirt in stock?",ja:"このシャツは在庫にありますか？"},
  {r:891,en:"The admission to the museum is 500 yen.",ja:"その博物館の入場料は500円だ。"},
  {r:892,en:"My father will retire from his company next year.",ja:"私の父は来年、会社を退職する予定だ。"},
  {r:893,en:"The mailman delivers letters every morning.",ja:"郵便配達員は毎朝手紙を配達する。"},
  {r:894,en:"She likes to draw pictures of animals.",ja:"彼女は動物の絵を描くのが好きだ。"},
  {r:895,en:"Many people work in the car factory.",ja:"多くの人が自動車工場で働いている。"},
  {r:896,en:"The artist created a beautiful sculpture.",ja:"その芸術家は美しい彫刻を創造した。"},
  {r:897,en:"I would rather stay home than go out.",ja:"私は外出するよりむしろ家にいたい。"},
  {r:898,en:"Global warming is a serious threat to our planet.",ja:"地球温暖化は私たちの惑星にとって深刻な脅威だ。"},
  {r:899,en:"I want to visit a tropical island like Hawaii.",ja:"私はハワイのような熱帯の島を訪れたい。"},
  {r:900,en:"The committee will act on your proposal tomorrow.",ja:"委員会は明日、あなたの提案について決議する（決定を下す）だろう。"},
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
  console.log(`Applied ${c} examples to 2級 (801-900). Saved.`);
}
main().catch(console.error);
