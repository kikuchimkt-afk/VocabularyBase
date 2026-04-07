const xlsx = require('xlsx');
const fs = require('fs');
const filePath = String.raw`C:\Users\makoto\Documents\GitHub\VocabularyBase\単語リスト\出題頻度順リストのみ_英検英単語.xlsx`;
const outPath = filePath.replace('.xlsx', '_updated.xlsx');
const targetFile = fs.existsSync(outPath) ? outPath : filePath;

const data = [
  {r:301,en:"Eating healthy food helps build a strong immune system.",ja:"健康的な食べ物を食べることは、強い免疫システムを構築するのに役立つ。"},
  {r:302,en:"The whole room was in a state of disorder after the party.",ja:"パーティーの後、部屋全体が無秩序（混乱）の状態だった。"},
  {r:303,en:"Physical exercise is also good for your mental health.",ja:"運動は精神の健康にも良い。"},
  {r:304,en:"He has great physical strength.",ja:"彼は素晴らしい身体的強さ（体力）を持っている。"},
  {r:305,en:"I intend to study abroad next year.",ja:"私は来年留学するつもりだ。"},
  {r:306,en:"He is living in London at present.",ja:"彼は現在はロンドンに住んでいる。"},
  {r:307,en:"Volunteering can make a big difference in people's lives.",ja:"ボランティア活動は人々の生活に大きな違いを生むことができる。"},
  {r:308,en:"This is a great opportunity to learn a new skill.",ja:"これは新しいスキルを学ぶ絶好の機会だ。"},
  {r:309,en:"He broke the cup on purpose.",ja:"彼はわざとカップを割った。"},
  {r:310,en:"She is an exceptionally talented musician.",ja:"彼女は非常に才能のある音楽家だ。"},
  {r:311,en:"Dinner is almost ready.",ja:"夕食の準備がほとんどできました。"},
  {r:312,en:"Kindness is her most appealing characteristic.",ja:"優しさが彼女の最も魅力的な特徴（独特な点）だ。"},
  {r:313,en:"Your problem is similar to mine.",ja:"あなたの問題は私のものに似ている。"},
  {r:314,en:"He gave me no advice as to what I should do.",ja:"彼は私が何をすべきかに関して何のアドバイスもくれなかった。"},
  {r:315,en:"Ancient Egyptian civilization is fascinating.",ja:"古代エジプト文明は魅力的だ。"},
  {r:316,en:"These symbols represent peace.",ja:"これらのシンボルは平和を表している。"},
  {r:317,en:"The old bridge collapsed during the storm.",ja:"その古い橋は嵐の間に崩壊した。"},
  {r:318,en:"I didn't mean to insult you.",ja:"あなたを侮辱するつもりはありませんでした。"},
  {r:319,en:"The air is a mixture of different gases.",ja:"空気は様々なガスの混合物である。"},
  {r:320,en:"They live in an isolated village in the mountains.",ja:"彼らは山奥の孤立した村に住んでいる。"},
  {r:321,en:"Japanese trains are known for being very punctual.",ja:"日本の電車はとても時間通りであることで知られている。"},
  {r:322,en:"Parents are responsible for their children's safety.",ja:"親は子どもの安全に対して責任がある。"},
  {r:323,en:"The child was frightened by the loud thunder.",ja:"その子供は大きな雷の音に恐れおののいた。"},
  {r:324,en:"This company guarantees the quality of its products.",ja:"この会社は自社製品の質を保証している。"},
  {r:325,en:"Don't blame me for your mistakes.",ja:"あなたの間違いを私のせいにしないで（私を非難しないで）。"},
  {r:326,en:"Today is our 10th wedding anniversary.",ja:"今日は私たちの結婚10周年記念日だ。"},
  {r:327,en:"You will be fined if you violate traffic rules.",ja:"交通ルールに違反すると罰金が科せられます。"},
  {r:328,en:"The heavy snow delayed the train's departure.",ja:"大雪が列車の出発を遅らせた。"},
  {r:329,en:"A high fence surrounds the house.",ja:"高いフェンスがその家を取り囲んでいる。"},
  {r:330,en:"His family immigrated to Canada last year.",ja:"彼の家族は昨年カナダに移住した。"},
  {r:331,en:"Please correct any spelling mistakes.",ja:"スペルミスがあれば訂正してください。"},
  {r:332,en:"The hotel offers a beautiful landscape of the ocean.",ja:"そのホテルからは海の美しい風景が楽しめる。"},
  {r:333,en:"Birds build their nests by instinct.",ja:"鳥は本能で巣を作る。"},
  {r:334,en:"The company has a strict privacy policy.",ja:"その会社は厳格なプライバシー方針を持っている。"},
  {r:335,en:"He is obviously not feeling well today.",ja:"彼は今日、明らかに体調が良くなさそうだ。"},
  {r:336,en:"Strangely enough, he didn't complain at all.",ja:"不思議なことに、彼は全く文句を言わなかった。"},
  {r:337,en:"The dog was chasing a cat in the park.",ja:"その犬は公園で猫を追いかけていた。"},
  {r:338,en:"Could you pour me a cup of coffee?",ja:"私にコーヒーを1杯注いでくれませんか？"},
  {r:339,en:"Don't try to do too many things at one time.",ja:"一度にあまりに多くのことをしようとしてはいけない。"},
  {r:340,en:"Thank you for coming all the way from Tokyo.",ja:"はるばる東京からお越しいただきありがとうございます。"},
  {r:341,en:"He didn't show up for the meeting.",ja:"彼は会議に現れなかった。"},
  {r:342,en:"The train began to pull away from the station.",ja:"列車は駅から離れ始めた。"},
  {r:343,en:"I want to try out this new software.",ja:"私はこの新しいソフトウェアを試してみたい。"},
  {r:344,en:"Someone tried to break into our house last night.",ja:"昨夜、誰かが私たちの家に押し入ろうとした。"},
  {r:345,en:"It's already 8 PM, so let's call it a day.",ja:"もう夜の8時だから、今日の仕事は切り上げよう。"},
  {r:346,en:"I was awake all night thinking about the problem.",ja:"私はその問題について考えて一晩中目を覚ましていた。"},
  {r:347,en:"Global warming is a serious environmental issue.",ja:"地球温暖化は深刻な環境問題だ。"},
  {r:348,en:"He gave his seat to an elderly woman on the bus.",ja:"彼はバスで年配の女性に席を譲った。"},
  {r:349,en:"You can adjust the brightness of the screen.",ja:"画面の明るさを調整することができます。"},
  {r:350,en:"Lack of sleep can have a bad effect on your health.",ja:"睡眠不足は健康に悪影響を及ぼすことがある。"},
  {r:351,en:"We played an indoor game because it was raining.",ja:"雨が降っていたので、私たちは屋内ゲームをした。"},
  {r:352,en:"He is a senior manager at the company.",ja:"彼はその会社の上級管理職（シニアマネージャー）だ。"},
  {r:353,en:"It is natural for parents to worry about their children.",ja:"親が子どものことを心配するのは当然だ。"},
  {r:354,en:"The height of the chair can be adjusted to fit you.",ja:"椅子の高さはあなたに合うように調整できる。"},
  {r:355,en:"I need specific instructions on how to use this machine.",ja:"この機械の使い方について具体的な指示が必要です。"},
  {r:356,en:"His heart rate increased when he started running.",ja:"彼が走り始めた時、心拍数が上がった。"},
  {r:357,en:"Eating a balanced diet is beneficial to your health.",ja:"バランスの取れた食事はあなたの健康に有益だ。"},
  {r:358,en:"He is what is called a self-made man.",ja:"彼はいわゆるたたき上げの（自力で成功した）人物だ。"},
  {r:359,en:"The building is known for its perfect symmetry.",ja:"その建物は完璧な左右対称であることで知られている。"},
  {r:360,en:"We have known each other for ten years.",ja:"私たちは10年間お互いを知っている。"},
  {r:361,en:"Speaking English is a big advantage in this job.",ja:"英語を話すことはこの仕事において大きな利点だ。"},
  {r:362,en:"He fell down and hurt his knee.",ja:"彼は転んで膝を痛めた。"},
  {r:363,en:"The doctor checked for any signs of illness.",ja:"医者は病気の兆候がないか調べた。"},
  {r:364,en:"He decided not to buy the car after all.",ja:"結局、彼はその車を買わないことにした。"},
  {r:365,en:"The popularity of the band increased over time.",ja:"そのバンドの（時間経過による）人気は徐々に高まった。"},
  {r:366,en:"It's a beautiful house. What is more, the price is reasonable.",ja:"それは美しい家だ。その上、値段も手頃だ。"},
  {r:367,en:"I haven't seen her for some time.",ja:"私はしばらくの間彼女に会っていない。"},
  {r:368,en:"He carried three boxes at a time.",ja:"彼は1度に3つの箱を運んだ。"},
  {r:369,en:"I parked my car in the parking lot behind the building.",ja:"私は建物の裏の駐車場に車を停めた。"},
  {r:370,en:"English is spoken all around the world.",ja:"英語は世界中で話されている。"},
  {r:371,en:"You cannot copy this book because of copyright laws.",ja:"著作権法のため、この本をコピーすることはできない。"},
  {r:372,en:"The hotel charges 100 dollars for one night.",ja:"そのホテルは1泊に100ドル請求する。"},
  {r:373,en:"He is the director of the new action movie.",ja:"彼は新しいアクション映画の監督だ。"},
  {r:374,en:"He seems rich, but in reality, he has a lot of debt.",ja:"彼は金持ちに見えるが、現実に（実は）多額の借金がある。"},
  {r:375,en:"I actually saw the famous singer at the airport.",ja:"私は実際に空港でその有名な歌手を見た。"},
  {r:376,en:"Water is composed of hydrogen and oxygen.",ja:"水は水素と酸素から構成されている。"},
  {r:377,en:"She greeted the guests with a warm smile.",ja:"彼女は温かい笑顔で客を出迎えた（挨拶した）。"},
  {r:378,en:"Whether we go to the beach depends on the weather.",ja:"私たちが海に行くかどうかは天気による（頼る）。"},
  {r:379,en:"He claims to be the best player on the team.",ja:"彼は自分がチームで一番の選手だと主張している。"},
  {r:380,en:"I agree with your opinion on this matter.",ja:"私はこの件に関するあなたの意見に賛成です。"},
  {r:381,en:"In Japan, it is common to hear cicadas in summer.",ja:"日本では、夏にセミの声を聞くのが一般的です。"},
  {r:382,en:"Kyoto is famous for its beautiful temples.",ja:"京都は美しいお寺で有名だ。"},
  {r:383,en:"Mt. Fuji is recognized as a World Heritage site.",ja:"富士山は世界遺産として認められている。"},
  {r:384,en:"Have you ever traveled abroad?",ja:"外国へ旅行したことはありますか？"},
  {r:385,en:"The population of Japan is shrinking.",ja:"日本の人口は縮小している。"},
  {r:386,en:"Don't forget to bring your textbook tomorrow.",ja:"明日は教科書を持って来るのを忘れないで。"},
  {r:387,en:"We are facing many serious environmental problems.",ja:"私たちは多くの深刻な環境問題に直面している。"},
  {r:388,en:"Don't throw away paper; recycle it instead.",ja:"紙を廃棄しないで、代わりにリサイクルしてください。"},
  {r:389,en:"Please put the garbage out on Tuesday morning.",ja:"火曜日の朝に生ゴミを出してください。"},
  {r:390,en:"She came up with a brilliant idea for the project.",ja:"彼女はプロジェクトのための素晴らしいアイデアを思いついた。"},
  {r:391,en:"This cleaning product is environmentally friendly.",ja:"この掃除用品は環境的にやさしい。"},
  {r:392,en:"The city council decided to build a new park.",ja:"市議会は新しい公園を建設することを決定した。"},
  {r:393,en:"It is difficult to carry out the plan on time.",ja:"時間通りに計画を成し遂げる（実行する）のは難しい。"},
  {r:394,en:"The car runs out of fuel quickly.",ja:"その車はすぐに燃料が切れる。"},
  {r:395,en:"Learning a new language is a slow process.",ja:"新しい言語を学ぶことは時間のかかる過程だ。"},
  {r:396,en:"We can seat up to 50 people in this room.",ja:"この部屋には50人まで座らせることができる。"},
  {r:397,en:"The caterpillar will turn into a beautiful butterfly.",ja:"そのイモムシは美しい蝶に変わるだろう。"},
  {r:398,en:"The doctor told him to cut down on sugar.",ja:"医者は彼に砂糖を切り詰めるように言った。"},
  {r:399,en:"Burning fossil fuels contributes to global warming.",ja:"化石燃料を燃やすことは地球温暖化の一因となる。"},
  {r:400,en:"The city has banned smoking in public parks.",ja:"その市は公共の公園での喫煙を禁止している。"},
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
  console.log(`Applied ${c} examples to 2級 (301-400). Saved.`);
}
main().catch(console.error);
