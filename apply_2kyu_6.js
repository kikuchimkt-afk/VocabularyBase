const xlsx = require('xlsx');
const fs = require('fs');
const filePath = String.raw`C:\Users\makoto\Documents\GitHub\VocabularyBase\単語リスト\出題頻度順リストのみ_英検英単語.xlsx`;
const outPath = filePath.replace('.xlsx', '_updated.xlsx');
const targetFile = fs.existsSync(outPath) ? outPath : filePath;

const data = [
  {r:501,en:"I felt dizzy when I stood up too quickly.",ja:"急に立ち上がったとき、私はめまいがした。"},
  {r:502,en:"He acted as though nothing had happened.",ja:"彼はまるで何もなかったかのように振る舞った。"},
  {r:503,en:"I am very pleased with your excellent work.",ja:"あなたの素晴らしい仕事をとても喜んでいます。"},
  {r:504,en:"They decided to postpone the meeting until next week.",ja:"彼らは会議を来週まで延期することに決めた。"},
  {r:505,en:"You cannot justify your bad behavior.",ja:"あなたは自分の悪い振る舞いを正当化することはできない。"},
  {r:506,en:"He worked hard to fulfill his parents' expectations.",ja:"彼は両親の期待を満たすために一生懸命働いた。"},
  {r:507,en:"Friends have a strong influence on teenagers.",ja:"友人は十代の若者に強い影響を及ぼす。"},
  {r:508,en:"This concert hall has a seating capacity of 1,000.",ja:"このコンサートホールは1,000人の座席容量がある。"},
  {r:509,en:"Australia is both a country and a continent.",ja:"オーストラリアは国であり大陸でもある。"},
  {r:510,en:"The tourism industry is very important for this island.",ja:"観光産業はこの島にとって非常に重要だ。"},
  {r:511,en:"Most of the Earth's surface is covered with water.",ja:"地球の表面の大部分は水で覆われている。"},
  {r:512,en:"He looked at the strange man doubtfully.",ja:"彼はその見知らぬ男を疑わしく（怪訝そうに）見た。"},
  {r:513,en:"The store was closed permanently last month.",ja:"その店は先月、永久に閉店した。"},
  {r:514,en:"My teeth are sensitive to cold drinks.",ja:"私の歯は冷たい飲み物に敏感だ。"},
  {r:515,en:"We enjoyed a peaceful afternoon by the lake.",ja:"私たちは湖畔で平和な午後を楽しんだ。"},
  {r:516,en:"He is studying to become a medical doctor.",ja:"彼は医師（医学の先生）になるために勉強している。"},
  {r:517,en:"The movie was highly praised by critics.",ja:"その映画は評論家たちから高く評価された。"},
  {r:518,en:"Early explorers traveled across unknown oceans.",ja:"初期の探検家たちは未知の海を渡って旅をした。"},
  {r:519,en:"Fear is the biggest obstacle to success.",ja:"恐れは成功への最大の障害だ。"},
  {r:520,en:"He refused to admit his mistakes.",ja:"彼は自分の間違いを認めることを拒んだ。"},
  {r:521,en:"How did she react to the surprising news?",ja:"その驚くべき知らせに彼女はどう反応しましたか？"},
  {r:522,en:"If you work hard, you will succeed eventually.",ja:"一生懸命働けば、最終的には成功するだろう。"},
  {r:523,en:"The sun disappeared behind the thick clouds.",ja:"太陽が厚い雲の後ろに消えた。"},
  {r:524,en:"We should not take our health for granted.",ja:"私たちは自分の健康を当然のことと思うべきではない。"},
  {r:525,en:"I am not familiar with the rules of this game.",ja:"私はこのゲームのルールに馴染みがありません。"},
  {r:526,en:"Our destination is just beyond that mountain.",ja:"私たちの目的地はあの山を越えたところにあります。"},
  {r:527,en:"The thief tried to run away from the police.",ja:"泥棒は警察から逃げ去ろうとした。"},
  {r:528,en:"It was so hot that he almost passed out.",ja:"とても暑かったので彼は危うく気絶しそうになった。"},
  {r:529,en:"Please give me some time to think over your offer.",ja:"あなたの提案をよく考えるための時間を少しください。"},
  {r:530,en:"Please put away your toys before dinner.",ja:"夕食の前に自分のおもちゃを片付けなさい。"},
  {r:531,en:"You have to believe in yourself to succeed.",ja:"成功するためには自分自身を信じなければならない。"},
  {r:532,en:"Please calm down and tell me what happened.",ja:"落ち着いて、何が起きたか私に話してください。"},
  {r:533,en:"It rained heavily, and what is worse, I lost my umbrella.",ja:"激しい雨が降り、さらに悪いことには、私は傘をなくした。"},
  {r:534,en:"We went to the forest to observe wild birds.",ja:"私たちは野鳥を観察するために森へ行った。"},
  {r:535,en:"Every participant in the marathon received a medal.",ja:"マラソンのすべての参加者がメダルを受け取った。"},
  {r:536,en:"How did the market react to the new product?",ja:"市場はその新製品にどう反応しましたか？"},
  {r:537,en:"At first, I didn't like coffee, but now I love it.",ja:"最初はコーヒーが好きではなかったが、今は大好きだ。"},
  {r:538,en:"These shoes are too tight for my feet.",ja:"これらの靴は私の足にはきつ（狭）すぎる。"},
  {r:539,en:"This restaurant is known for its delicious seafood.",ja:"このレストランはおいしいシーフードで知られている。"},
  {r:540,en:"We should pay more attention to social issues.",ja:"私たちは社会の問題にもっと注意を払うべきだ。"},
  {r:541,en:"She guarded her secrets jealously.",ja:"彼女は自分の秘密を嫉妬深く（油断なく）守った。"},
  {r:542,en:"He is a very reliable person.",ja:"彼はとてもあてになる（信頼できる）人物だ。"},
  {r:543,en:"The patient's condition is now stable.",ja:"その患者の状態は現在、安定している。"},
  {r:544,en:"Trains are used to transport heavy goods.",ja:"列車は重い品物を輸送するために使われる。"},
  {r:545,en:"She is my father's sister; in other words, my aunt.",ja:"彼女は私の父の姉妹です。言い換えれば、私のおばです。"},
  {r:546,en:"There are many risks associated with smoking.",ja:"喫煙と関連したリスクはたくさんある。"},
  {r:547,en:"To start with, we need to gather more information.",ja:"まず第一に、私たちはもっと多くの情報を集める必要がある。"},
  {r:548,en:"First of all, I would like to thank everyone for coming.",ja:"まず第一に、皆様にお越しいただいたことを感謝したいと思います。"},
  {r:549,en:"Congratulations on your graduation!",ja:"卒業おめでとう（卒業に対するお祝い）！"},
  {r:550,en:"Time is precious, so don't waste it.",ja:"時間は貴重なので、無駄にしてはいけない。"},
  {r:551,en:"That doctor specializes in sports injuries.",ja:"あの医師はスポーツ障害を専門としている。"},
  {r:552,en:"Scientists developed a new vaccine for the disease.",ja:"科学者たちはその病気に対する新しいワクチンを開発した。"},
  {r:553,en:"It was very cold; nevertheless, they went swimming.",ja:"とても寒かった。それにも関わらず、彼らは泳ぎに行った。"},
  {r:554,en:"He recovered quickly from his illness.",ja:"彼は病気からすぐに回復した。"},
  {r:555,en:"You can download this app for free.",ja:"このアプリは無料でダウンロードできます。"},
  {r:556,en:"I go to the dentist for a regular checkup twice a year.",ja:"私は年に2回、定期的な健康診断のために歯医者に行きます。"},
  {r:557,en:"The temperature dropped to zero last night.",ja:"昨夜、気温がゼロまで下がった。"},
  {r:558,en:"You must have health insurance to cover hospital costs.",ja:"病院の費用をカバーするために、あなたは健康保険に入っていなければならない。"},
  {r:559,en:"Some elderly people suffer from memory loss.",ja:"年配の人の中には記憶喪失に苦しむ人もいる。"},
  {r:560,en:"We apologize for any inconvenience this may cause.",ja:"これが引き起こすかもしれない不便（ご不便）をお詫び申し上げます。"},
  {r:561,en:"It is unusually warm for this time of year.",ja:"今年のこの時期にしては異常に暖かい。"},
  {r:562,en:"I want to take part in the speech contest.",ja:"私はスピーチコンテストに参加したい。"},
  {r:563,en:"The committee will determine the winner tomorrow.",ja:"委員会は明日、勝者を決めるだろう。"},
  {r:564,en:"He is considered to be the best player on the team.",ja:"彼はチームで一番の選手だと見なされている。"},
  {r:565,en:"The repair costs amount to 500 dollars.",ja:"修理費用は500ドルに達する。"},
  {r:566,en:"I want to help you in some way.",ja:"何らかの方法であなたを助けたい。"},
  {r:567,en:"This computer is connected to the internet.",ja:"このコンピューターはインターネットに接続されている。"},
  {r:568,en:"He was involved in a traffic accident yesterday.",ja:"彼は昨日、交通事故に関与した（巻き込まれた）。"},
  {r:569,en:"Some diseases are genetically inherited.",ja:"病気の中には遺伝的に受け継がれるものがある。"},
  {r:570,en:"A healthy diet is important for your body.",ja:"健康的な食事はあなたの体にとって重要だ。"},
  {r:571,en:"Wine is made from grapes.",ja:"ワインはブドウから作られる（ブドウを原料とする）。"},
  {r:572,en:"My major in college was economics.",ja:"私の大学での専攻科目は経済学でした。"},
  {r:573,en:"You must stop at the stop sign.",ja:"あなたは「止まれ」の標識で止まらなければならない。"},
  {r:574,en:"The village was threatened by the approaching fire.",ja:"その村は近づく火事に脅かされていた。"},
  {r:575,en:"Science has made great progress in the last century.",ja:"科学は前世紀に大きな進歩を遂げた。"},
  {r:576,en:"With luck, we might arrive before it rains.",ja:"運が良ければ、雨が降る前に到着するかもしれない。"},
  {r:577,en:"His offensive remarks made her angry.",ja:"彼の無礼な発言が彼女を怒らせた。"},
  {r:578,en:"The meeting came to an abrupt end.",ja:"会議は突然の終わりを迎えた。"},
  {r:579,en:"Her face looked very familiar to me.",ja:"彼女の顔は私にとってとても見慣れたものだった。"},
  {r:580,en:"Our company is the main distributor of these products.",ja:"我が社はこれらの製品の主要な卸売業者だ。"},
  {r:581,en:"The actor got a lot of bad publicity after the incident.",ja:"その俳優は事件の後、多くの悪い宣伝（評判）を受けた。"},
  {r:582,en:"The separation of garbage is required in this city.",ja:"この市ではゴミの分離（分別）が求められている。"},
  {r:583,en:"We should try to reuse plastic bottles.",ja:"私たちはペットボトルを再利用するように努めるべきだ。"},
  {r:584,en:"The clock will strike twelve soon.",ja:"時計はもうすぐ12時を打つだろう。"},
  {r:585,en:"Many citizens gathered to protest against the new tax.",ja:"多くの市民が新しい税金に抗議するために集まった。"},
  {r:586,en:"The speaker used pictures to illustrate his points.",ja:"話し手は自分の要点を説明する（例示する）ために写真を使った。"},
  {r:587,en:"He voluntarily offered to clean the room.",ja:"彼は自ら進んで部屋を掃除することを申し出た。"},
  {r:588,en:"You need to consciously change your eating habits.",ja:"あなたは自分の食習慣を意識的に変える必要がある。"},
  {r:589,en:"The journey will take approximately three hours.",ja:"その旅はおおよそ3時間かかるだろう。"},
  {r:590,en:"The crowd protested peacefully.",ja:"群衆は平和的に抗議した。"},
  {r:591,en:"Taking care of his sick mother became a heavy burden.",ja:"病気の母親の世話をすることが重い負担になった。"},
  {r:592,en:"He walked down the street whistling a happy tune.",ja:"彼は楽しそうなメロディーを口笛で吹きながら通りを歩いた。"},
  {r:593,en:"The ship is ready for its long voyage across the ocean.",ja:"船は海を渡る長い航海の準備ができている。"},
  {r:594,en:"I feel a little envy when I see her new car.",ja:"彼女の新しい車を見ると、少し妬みを感じる。"},
  {r:595,en:"He tends to exaggerate his own achievements.",ja:"彼は自分の業績を誇張する（大げさに言う）傾向がある。"},
  {r:596,en:"Please refer to the dictionary if you don't know the word.",ja:"その単語が分からなければ、辞書を参照してください。"},
  {r:597,en:"Speaking of movies, have you seen the new action film?",ja:"映画と言えば、あの新しいアクション映画を見ましたか？"},
  {r:598,en:"I had to wait for the bus for 30 minutes.",ja:"私はバスを30分間待たなければならなかった。"},
  {r:599,en:"If you are in trouble, please don't hesitate to call me.",ja:"もし困った状況にあるなら、ためらわずに私に電話してください。"},
  {r:600,en:"We can finish the work by Friday at best.",ja:"私たちは良くとも金曜日までにしか仕事を終わらせられない。"},
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
  console.log(`Applied ${c} examples to 2級 (501-600). Saved.`);
}
main().catch(console.error);
