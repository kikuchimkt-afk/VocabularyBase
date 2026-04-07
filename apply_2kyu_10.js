const xlsx = require('xlsx');
const fs = require('fs');
const filePath = String.raw`C:\Users\makoto\Documents\GitHub\VocabularyBase\単語リスト\出題頻度順リストのみ_英検英単語.xlsx`;
const outPath = filePath.replace('.xlsx', '_updated.xlsx');
const targetFile = fs.existsSync(outPath) ? outPath : filePath;

const data = [
  {r:901,en:"Water is vital for all living things.",ja:"水はすべての生き物にとって極めて重要だ。"},
  {r:902,en:"This region is known for its agricultural products.",ja:"この地域は農業の生産物で知られている。"},
  {r:903,en:"He stopped smoking altogether.",ja:"彼は完全にタバコを吸うのをやめた。"},
  {r:904,en:"We need to focus on quality rather than quantity.",ja:"私たちは量よりも質に焦点を当てる必要がある。"},
  {r:905,en:"The male bird has colorful feathers.",ja:"その雄の鳥はカラフルな羽を持っている。"},
  {r:906,en:"He succeeded by means of hard work.",ja:"彼は一生懸命な努力によって（努力を用いて）成功した。"},
  {r:907,en:"He insisted that he was innocent.",ja:"彼は自分が無実だと強く主張した。"},
  {r:908,en:"She answered the question without hesitation.",ja:"彼女はためらいなしにその質問に答えた。"},
  {r:909,en:"Why do you persist in doing things your own way?",ja:"なぜあなたは自分のやり方を通すことに固執するのですか？"},
  {r:910,en:"I had a long conversation with my friend.",ja:"私は友人と長い会話をした。"},
  {r:911,en:"Today was just an ordinary day.",ja:"今日はただのふつうの一日だった。"},
  {r:912,en:"All his efforts were in vain.",ja:"彼のすべての努力は無駄になった。"},
  {r:913,en:"Go ahead, I will catch up with you later.",ja:"先に行ってて、後であなたに追いつくから。"},
  {r:914,en:"The police officer is off duty today.",ja:"その警察官は今日は非番だ。"},
  {r:915,en:"His memory will live on in our hearts.",ja:"彼の記憶は私たちの心の中に生き続けるだろう。"},
  {r:916,en:"This book has many beautiful illustrations.",ja:"この本には多くの美しい図解（イラスト）がある。"},
  {r:917,en:"I can't buy this watch because it is too expensive.",ja:"この時計は高価すぎるので買えません。"},
  {r:918,en:"I expect him to arrive at six.",ja:"私は彼が6時に到着すると予想している。"},
  {r:919,en:"This task requires deep concentration.",ja:"この仕事は深い集中を必要とする。"},
  {r:920,en:"The thermometer reads 30 degrees Celsius.",ja:"温度計は摂氏30度を示している。"},
  {r:921,en:"I saw an advertisement for a new smartphone.",ja:"新しいスマートフォンの広告（宣伝）を見た。"},
  {r:922,en:"He is trying to pay off his debt.",ja:"彼は借金を返済しようとしている。"},
  {r:923,en:"They are going to pull down the old building.",ja:"彼らはその古い建物を取り壊す予定だ。"},
  {r:924,en:"The police are investigating the cause of the fire.",ja:"警察は火事の原因を調査している。"},
  {r:925,en:"Please read the product description carefully.",ja:"製品の説明書を注意深く読んでください。"},
  {r:926,en:"The rules of the game are as follows.",ja:"ゲームのルールは次のとおりです。"},
  {r:927,en:"I'm sorry to bother you, but can you help me?",ja:"面倒（迷惑）をかけてすみませんが、手伝ってくれませんか？"},
  {r:928,en:"He received a severe punishment for his crime.",ja:"彼は犯罪のために厳しい罰を受けた。"},
  {r:929,en:"I propose that we start the meeting now.",ja:"私は今会議を始めることを提案します。"},
  {r:930,en:"The building was quickly enveloped in flames.",ja:"その建物はあっという間に炎に包まれた。"},
  {r:931,en:"Someone call an ambulance!",ja:"誰か救急車を呼んで！"},
  {r:932,en:"The players felt intense pressure before the final game.",ja:"選手たちは決勝戦の前に激しいプレッシャーを感じた。"},
  {r:933,en:"It is impossible to finish this in one hour.",ja:"これを1時間で終わらせるのは不可能だ。"},
  {r:934,en:"I am accustomed to waking up early.",ja:"私は早起きすることに慣れている。"},
  {r:935,en:"Children have a natural curiosity about the world.",ja:"子供たちは世界に対する自然な好奇心を持っている。"},
  {r:936,en:"He works for an international organization.",ja:"彼は国際的な組織で働いている。"},
  {r:937,en:"This animal species is in danger of extinction.",ja:"この動物の種は絶滅の危険にさらされている。"},
  {r:938,en:"Each student answered the question in turn.",ja:"それぞれの生徒が順番にその質問に答えた。"},
  {r:939,en:"Her brave actions are worthy of praise.",ja:"彼女の勇敢な行動は賞賛に値する。"},
  {r:940,en:"I always look up to my older brother.",ja:"私はいつも兄を尊敬している。"},
  {r:941,en:"The bad weather added to our difficulties.",ja:"悪天候が私たちの困難を増やした（付け加えた）。"},
  {r:942,en:"You must submit your report by Friday.",ja:"金曜日までにレポートを提出しなければならない。"},
  {r:943,en:"We had to wait in line at immigration.",ja:"私たちは入国管理で列に並んで待たなければならなかった。"},
  {r:944,en:"I tried to convince him to join our team.",ja:"私は彼に私たちのチームに加わるよう納得させようとした。"},
  {r:945,en:"The country declared war against its neighbor.",ja:"その国は隣国に対して戦争を宣言した。"},
  {r:946,en:"He is too vain to admit his mistakes.",ja:"彼はうぬぼれが強すぎて自分の間違いを認めない。"},
  {r:947,en:"Japan lacks natural resources like oil.",ja:"日本は石油のような天然資源が不足している。"},
  {r:948,en:"This airport is for domestic flights only.",ja:"この空港は国内線専用です。"},
  {r:949,en:"We have to make up the room for our guests.",ja:"私たちは客のために部屋を片付けなければ（用意しなければ）ならない。"},
  {r:950,en:"She felt a deep affection for the stray dog.",ja:"彼女はその野良犬に深い愛情を感じた。"},
  {r:951,en:"In recent years, technology has advanced rapidly.",ja:"最近の数年間で、技術は急速に進歩した。"},
  {r:952,en:"The discovery of electricity changed the world.",ja:"電気の発見は世界を変えた。"},
  {r:953,en:"I learned this poem by heart.",ja:"私はこの詩を体で覚えて（暗記して）いる。"},
  {r:954,en:"Reading books can stimulate your imagination.",ja:"本を読むことは想像力を刺激することができる。"},
  {r:955,en:"She wants to go to college after high school.",ja:"彼女は高校卒業後、大学に行きたいと思っている。"},
  {r:956,en:"He is an academically gifted student.",ja:"彼は学問的に優秀な生徒だ。"},
  {r:957,en:"The children were playing on the green grass.",ja:"子供たちは緑の草の上で遊んでいた。"},
  {r:958,en:"The teacher praised him for his hard work.",ja:"先生は彼の一生懸命な努力をほめた。"},
  {r:959,en:"You should go to the dentist to check your teeth.",ja:"あなたは歯をチェックするために歯医者に行くべきだ。"},
  {r:960,en:"I am truly grateful for your help.",ja:"私はあなたの助けに真に（心から）感謝しています。"},
  {r:961,en:"The wet shirt clung to his body.",ja:"濡れたシャツが彼の体にくっついた。"},
  {r:962,en:"She clipped the article from the newspaper.",ja:"彼女は新聞からその記事を切り取った。"},
  {r:963,en:"What was his reaction to the news?",ja:"そのニュースに対する彼の反応はどうでしたか？"},
  {r:964,en:"He prefers conventional methods of teaching.",ja:"彼は従来の教え方を好む。"},
  {r:965,en:"This medicine will help relieve the pain.",ja:"この薬は痛みを和らげるのに役立つでしょう。"},
  {r:966,en:"They came to the city to seek a better life.",ja:"彼らはより良い生活を求めて都市にやって来た。"},
  {r:967,en:"I will remember this day forever.",ja:"私はこの日を永遠に忘れない。"},
  {r:968,en:"The dispute required the intervention of a lawyer.",ja:"その紛争には弁護士の仲裁が必要だった。"},
  {r:969,en:"The historian wrote a book about the Edo period.",ja:"その歴史家は江戸時代についての本を書いた。"},
  {r:970,en:"I don't know whether he will come or not.",ja:"彼が来るか来ないか（どちらか）私にはわからない。"},
  {r:971,en:"The city is known for its diverse ethnic groups.",ja:"その都市は多様な民族グループで知られている。"},
  {r:972,en:"I swear to tell the truth.",ja:"私は真実を話すことを誓います。"},
  {r:973,en:"It is your responsibility to finish the work on time.",ja:"仕事を時間通りに終えるのはあなたの責任です。"},
  {r:974,en:"He shook hands with his opponent after the match.",ja:"彼は試合後、相手と握手をした。"},
  {r:975,en:"A cold wind began to blow.",ja:"冷たい風が吹き始めた。"},
  {r:976,en:"She is studying European history.",ja:"彼女はヨーロッパの歴史を勉強している。"},
  {r:977,en:"We live in a complex modern society.",ja:"私たちは複雑な現代社会に生きている。"},
  {r:978,en:"He is very mature for his age.",ja:"彼は年齢の割にとても成熟している。"},
  {r:979,en:"Japan is a democratic country.",ja:"日本は民主主義の国だ。"},
  {r:980,en:"The hotel manager greeted the guests.",ja:"ホテルの支配人が客を出迎えた。"},
  {r:981,en:"What is the exact definition of this word?",ja:"この単語の正確な定義は何ですか？"},
  {r:982,en:"Love and beauty are abstract concepts.",ja:"愛や美しさは抽象的な概念だ。"},
  {r:983,en:"It will take time to recover from the surgery.",ja:"手術から回復するには時間がかかるだろう。"},
  {r:984,en:"I reject the notion that money buys happiness.",ja:"私はお金で幸せが買えるという考えを拒絶する。"},
  {r:985,en:"The company rejected his job application.",ja:"会社は彼の仕事への応募を拒絶した（断った）。"},
  {r:986,en:"The king was waiting in a secret chamber.",ja:"王は秘密の小部屋で待っていた。"},
  {r:987,en:"He has a strong desire to win.",ja:"彼には勝ちたいという強い願望がある。"},
  {r:988,en:"It is hard to distinguish the twins.",ja:"その双子を区別するのは難しい。"},
  {r:989,en:"The police warned people not to go out.",ja:"警察は人々に外出しないよう警告した。"},
  {r:990,en:"An excess of sugar is bad for your health.",ja:"砂糖の過剰摂取は健康に悪い。"},
  {r:991,en:"He has made numerous mistakes in the past.",ja:"彼は過去に多数の間違いを犯してきた。"},
  {r:992,en:"They lived together in perfect harmony.",ja:"彼らは完璧な調和の中で共に暮らした。"},
  {r:993,en:"If you don't study, you will fail the test.",ja:"勉強しなければ、テストに失敗するだろう。"},
  {r:994,en:"She is a gentle mother to her children.",ja:"彼女は子どもたちにとって穏やかな母親だ。"},
  {r:995,en:"Strict enforcement of the rules is necessary.",ja:"規則の厳格な執行が必要だ。"},
  {r:996,en:"Honesty is his best personality trait.",ja:"正直さは彼の最も良い性格の特性だ。"},
  {r:997,en:"The country is facing a huge trade deficit.",ja:"その国は巨大な貿易赤字に直面している。"},
  {r:998,en:"What is the source of this information?",ja:"この情報の情報源は何ですか？"},
  {r:999,en:"He was chosen as the class representative.",ja:"彼はクラスの代表者に選ばれた。"},
  {r:1000,en:"Marriage is a serious commitment.",ja:"結婚は真剣な約束（誓い）だ。"},
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
  console.log(`Applied ${c} examples to 2級 (901-1000). Saved.`);
}
main().catch(console.error);
