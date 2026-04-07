const xlsx = require('xlsx');
const fs = require('fs');
const filePath = String.raw`C:\Users\makoto\Documents\GitHub\VocabularyBase\単語リスト\出題頻度順リストのみ_英検英単語.xlsx`;
const outPath = filePath.replace('.xlsx', '_updated.xlsx');
const targetFile = fs.existsSync(outPath) ? outPath : filePath;

const data = [
  {r:701,en:"Reading books is a good way to improve your vocabulary.",ja:"本を読むことは語彙を増やす（上達させる）ための良い方法だ。"},
  {r:702,en:"This computer program is too complex for me to understand.",ja:"このコンピュータープログラムは私が理解するには複雑すぎる。"},
  {r:703,en:"Regular exercise will strengthen your muscles.",ja:"定期的な運動はあなたの筋肉を強化するだろう。"},
  {r:704,en:"Cars must stop at red lights; similarly, bicycles must also stop.",ja:"車は赤信号で止まらなければならない。同様に、自転車も止まらなければならない。"},
  {r:705,en:"His ignorance of the law led to serious trouble.",ja:"彼の法律に対する無知が深刻な問題を引き起こした。"},
  {r:706,en:"My house is on the opposite side of the street.",ja:"私の家は通りの反対側（向こう側）にある。"},
  {r:707,en:"She has very good English pronunciation.",ja:"彼女はとても良い英語の発音をする。"},
  {r:708,en:"The internet is one of the greatest inventions of the 20th century.",ja:"インターネットは20世紀における最も偉大な発明の一つだ。"},
  {r:709,en:"He put the car into reverse and backed out of the garage.",ja:"彼は車をバック（反対のギア）に入れ、ガレージから後退して出た。"},
  {r:710,en:"I commute to work by train every day.",ja:"私は毎日電車で職場に通勤している。"},
  {r:711,en:"The police made an appeal to the public for information.",ja:"警察は情報を求めて一般市民に訴えた。"},
  {r:712,en:"This training program will qualify you for the job.",ja:"この訓練プログラムはあなたにその仕事のための資格を与えるだろう。"},
  {r:713,en:"A strange incident occurred at the bank yesterday.",ja:"昨日、銀行で奇妙な事件が起きた。"},
  {r:714,en:"We buy fresh vegetables at the local market.",ja:"私たちは地元の市場で新鮮な野菜を買う。"},
  {r:715,en:"The maximum speed on this highway is 100 km/h.",ja:"この高速道路の最大速度は時速100キロだ。"},
  {r:716,en:"Please don't yell at me.",ja:"私に向かって大声で叫ばないでください。"},
  {r:717,en:"The dust in the room made me sneeze.",ja:"部屋の中のほこりのせいで私はくしゃみが出た。"},
  {r:718,en:"Could you wipe the table after you finish eating?",ja:"食べ終わった後、テーブルを拭いてくれませんか？"},
  {r:719,en:"Be careful not to twist your ankle when you run.",ja:"走るときは足首をねじら（ひねら）ないように気をつけてください。"},
  {r:720,en:"They tried to civilize the isolated tribe.",ja:"彼らはその孤立した部族を文明化しようと試みた。"},
  {r:721,en:"The detective solved the difficult murder case.",ja:"その刑事は難しい殺人事件を解決した。"},
  {r:722,en:"The government decided to impose a new tax on alcohol.",ja:"政府はアルコールに新しい税を課すことを決定した。"},
  {r:723,en:"The new law was passed by parliament yesterday.",ja:"その新しい法律は昨日、議会（国会）を通過した。"},
  {r:724,en:"She drops her son off at nursery school every morning.",ja:"彼女は毎朝、息子を保育園に預ける（降ろす）。"},
  {r:725,en:"He took a quick glance at his watch.",ja:"彼は自分の時計を一目見た。"},
  {r:726,en:"The organization provides medical aid to poor countries.",ja:"その組織は貧しい国々に医療援助を提供している。"},
  {r:727,en:"The wind blew with great force.",ja:"風がものすごい力（勢い）で吹いた。"},
  {r:728,en:"Parents play an important role in a child's education.",ja:"親は子どもの教育において重要な役割を果たす。"},
  {r:729,en:"I need to acquaint myself with the new rules.",ja:"私は新しいルールについて自分に知らせる（精通させる）必要がある。"},
  {r:730,en:"This new model is superior to the old one in many ways.",ja:"この新しいモデルは多くの点で古いものより優れている。"},
  {r:731,en:"Reading books helps to increase your knowledge.",ja:"本を読むことは知識を増やすのに役立つ。"},
  {r:732,en:"Please be mindful of your manners in public.",ja:"公共の場ではマナーに気をつけてください。"},
  {r:733,en:"The dog was told to stand still while being brushed.",ja:"その犬はブラッシングされている間、じっと停止しているように言われた。"},
  {r:734,en:"Don't judge people by their appearance.",ja:"外見で人を判断してはいけない。"},
  {r:735,en:"The view from the top of the mountain was incredible.",ja:"山の頂上からの景色は信じられないほど素晴らしかった。"},
  {r:736,en:"In terms of price, this car is the best choice.",ja:"価格の点から言えば、この車が最良の選択だ。"},
  {r:737,en:"I read an interesting article in today's newspaper.",ja:"今日の新聞で面白い記事を読んだ。"},
  {r:738,en:"I don't know for sure what time he will arrive.",ja:"彼が何時に到着するのか、私には確かな（間違いなく）ことはわからない。"},
  {r:739,en:"My ancestors moved to Japan 100 years ago.",ja:"私の先祖は100年前に日本に移住した。"},
  {r:740,en:"He arrived at the station just in time for the train.",ja:"彼は電車の発車に丁度間に合って駅に到着した。"},
  {r:741,en:"He couldn't bend his knees because of the injury.",ja:"彼は怪我のせいで膝を曲げることができなかった。"},
  {r:742,en:"The traffic accident occurred late at night.",ja:"その交通事故は夜遅くに発生した。"},
  {r:743,en:"Does anyone have an objection to this plan?",ja:"この計画に反対（異議）がある人はいますか？"},
  {r:744,en:"He is too lazy to clean his own room.",ja:"彼は怠け者すぎて自分の部屋の掃除をしない。"},
  {r:745,en:"She gave an outstanding performance in the play.",ja:"彼女はその劇で並外れた（目立った）演技を見せた。"},
  {r:746,en:"They plan to construct a new bridge over the river.",ja:"彼らは川に新しい橋を建設する予定だ。"},
  {r:747,en:"Make sure you get adequate sleep every night.",ja:"毎晩、十分な（適切な）睡眠をとるようにしなさい。"},
  {r:748,en:"Let's walk to the station instead of taking a taxi.",ja:"タクシーに乗る代わりに駅まで歩きましょう。"},
  {r:749,en:"The teacher smiled mildly at the students.",ja:"先生は生徒たちに穏やかに微笑んだ。"},
  {r:750,en:"He has a small scar on his left arm.",ja:"彼は左腕に小さな傷跡がある。"},
  {r:751,en:"She knocked on the door hesitantly.",ja:"彼女は躊躇して（ためらいながら）ドアをノックした。"},
  {r:752,en:"He grew up in a wealthy family.",ja:"彼は裕福な家庭で育った。"},
  {r:753,en:"The teacher asked me to give out the test papers.",ja:"先生は私にテスト用紙を配布するように頼んだ。"},
  {r:754,en:"Don't forget to lock the door when you leave.",ja:"外出する時はドアの鍵をかけるのを忘れないで。"},
  {r:755,en:"I was asked for directions by a stranger.",ja:"私は他人（見知らぬ人）に道を尋ねられた。"},
  {r:756,en:"The lawyer tried to prove that the man was innocent.",ja:"弁護士はその男が無罪であることを証明しようとした。"},
  {r:757,en:"Do you have travel insurance for your trip?",ja:"旅行のための旅行保険に入っていますか？"},
  {r:758,en:"This tradition has been passed down from generation to generation.",ja:"この伝統は世代から世代へと受け継がれてきた。"},
  {r:759,en:"Please take down these notes in your notebook.",ja:"これらのメモをノートに書き取ってください。"},
  {r:760,en:"He concluded his speech by thanking everyone.",ja:"彼は皆に感謝を述べてスピーチを締めくくった。"},
  {r:761,en:"We must find a way to stop violence in schools.",ja:"私たちは学校での暴力を止める方法を見つけなければならない。"},
  {r:762,en:"His constant complaining irritates me.",ja:"彼の絶え間ない文句は私をイライラさせる。"},
  {r:763,en:"We need to put together a plan for the school festival.",ja:"私たちは文化祭のための計画をまとめる必要がある。"},
  {r:764,en:"He couldn't account for why he was late.",ja:"彼はなぜ遅刻したのかを説明することができなかった。"},
  {r:765,en:"Tourism is an important industry in Kyoto.",ja:"観光は京都における重要な産業である。"},
  {r:766,en:"He committed himself to his studies.",ja:"彼は勉学に自分を専念させた。"},
  {r:767,en:"They decided to put off the baseball game due to rain.",ja:"彼らは雨のために野球の試合を延期することに決めた。"},
  {r:768,en:"It is important to maintain a healthy diet.",ja:"健康的な食事を維持することが重要だ。"},
  {r:769,en:"Could you do me a favor and carry this bag?",ja:"親切な行為として（お願いとして）このカバンを運んでくれませんか？"},
  {r:770,en:"This information is not relevant to our project.",ja:"この情報は私たちのプロジェクトに関連していない。"},
  {r:771,en:"Opinions differ from person to person.",ja:"意見は人によって異なる。"},
  {r:772,en:"You are doing a great job, so keep it up!",ja:"あなたは素晴らしい仕事をしています。その調子で維持してください！"},
  {r:773,en:"Please look over these documents before the meeting.",ja:"会議の前にこれらの書類を見渡して（ざっと目を通して）ください。"},
  {r:774,en:"Though it was raining, they still played soccer.",ja:"雨が降っていただけれども、彼らはそれでもサッカーをした。"},
  {r:775,en:"He stretched his limbs after sitting for a long time.",ja:"彼は長時間座った後、手足を伸ばした。"},
  {r:776,en:"Eventually, she found the keys she had lost.",ja:"結局は（やがて）、彼女はなくした鍵を見つけた。"},
  {r:777,en:"I suggest that we leave early to avoid traffic.",ja:"渋滞を避けるために早く出発することを提案します。"},
  {r:778,en:"This ticket entitles you to a free drink.",ja:"このチケットはあなたに無料の飲み物をもらう資格を与える。"},
  {r:779,en:"The police finally captured the escaped prisoner.",ja:"警察はついに逃げた囚人を捕まえた。"},
  {r:780,en:"She is interested in child psychology.",ja:"彼女は児童心理学に興味がある。"},
  {r:781,en:"Japan exports a lot of cars to other countries.",ja:"日本は多くの車を他の国に輸出している。"},
  {r:782,en:"Be careful not to spill your coffee on the keyboard.",ja:"キーボードにコーヒーをこぼさないように気を付けてください。"},
  {r:783,en:"The police are trying to discover the identity of the thief.",ja:"警察はその泥棒の身元（同一性）を明らかにしようとしている。"},
  {r:784,en:"Many students participate in club activities.",ja:"多くの生徒が部活動に参加する。"},
  {r:785,en:"He has a bad cough because he caught a cold.",ja:"彼は風邪をひいたのでひどい咳をしている。"},
  {r:786,en:"Does the price include tax?",ja:"その値段は税金を含んでいますか？"},
  {r:787,en:"I sincerely apologize for the delay.",ja:"遅れについて心からお詫び申し上げます。"},
  {r:788,en:"She was completely absorbed in reading the book.",ja:"彼女はその本を読むことに完全に没頭していた。"},
  {r:789,en:"There has been a big improvement in his grades.",ja:"彼の成績には大きな改善があった。"},
  {r:790,en:"The city has a low crime rate.",ja:"その都市は犯罪率が低い。"},
  {r:791,en:"Yoga helps me to relax both physically and spiritually.",ja:"ヨガは肉体的にも精神的にもリラックスするのに役立つ。"},
  {r:792,en:"The committee accepted her proposal for the new project.",ja:"委員会は新しいプロジェクトに関する彼女の提案を受け入れた。"},
  {r:793,en:"He confessed that he broke the window.",ja:"彼は自分が窓を割ったことを白状した。"},
  {r:794,en:"I can't buy the car because my credit card is maxed out.",ja:"クレジットカードの信用枠（利用可能額）が上限に達しているので、車を買えない。"},
  {r:795,en:"I made a reservation for two at the restaurant tonight.",ja:"今夜、そのレストランで2名分の予約をした。"},
  {r:796,en:"The English translation of this book is excellent.",ja:"この本の英語への翻訳は素晴らしい。"},
  {r:797,en:"Not knowing how to use a computer is a big disadvantage.",ja:"コンピューターの使い方を知らないことは大きな不利益（不利な立場）だ。"},
  {r:798,en:"We need to look at the facts objectively.",ja:"私たちは事実を客観的に見る必要がある。"},
  {r:799,en:"The government aims to reduce energy consumption.",ja:"政府はエネルギー消費を減らすことを目指している。"},
  {r:800,en:"The baby smiled innocently at the stranger.",ja:"その赤ちゃんは見知らぬ人に無邪気に微笑んだ。"},
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
  console.log(`Applied ${c} examples to 2級 (701-800). Saved.`);
}
main().catch(console.error);
