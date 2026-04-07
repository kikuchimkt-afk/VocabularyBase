const xlsx = require('xlsx');
const fs = require('fs');
const filePath = String.raw`C:\Users\makoto\Documents\GitHub\VocabularyBase\単語リスト\出題頻度順リストのみ_英検英単語.xlsx`;
const outPath = filePath.replace('.xlsx', '_updated.xlsx');
const targetFile = fs.existsSync(outPath) ? outPath : filePath;

const data = [
  {r:1101,en:"I fully agree with your proposal.",ja:"私はあなたの提案に完全に賛成します。"},
  {r:1102,en:"My dog is nowhere to be found.",ja:"私の犬はどこにも見つからない。"},
  {r:1103,en:"Many people in the world are suffering from hunger.",ja:"世界の多くの人々が飢えで苦しんでいる。"},
  {r:1104,en:"He pretended to be asleep when I entered the room.",ja:"私が部屋に入った時、彼は眠っているふりをした。"},
  {r:1105,en:"Dogs have a sharp perception of smell.",ja:"犬は鋭い嗅覚（においの知覚）を持っている。"},
  {r:1106,en:"He was sent to prison for rape.",ja:"彼は強姦罪で刑務所に送られた。"},
  {r:1107,en:"He decided to lie down on the sofa for a while.",ja:"彼はしばらくソファに横たわることに決めた。"},
  {r:1108,en:"English is not his mother tongue.",ja:"英語は彼の母国語（母なる言葉）ではない。"},
  {r:1109,en:"Hard work is the key to success.",ja:"懸命な努力が成功への鍵だ。"},
  {r:1110,en:"He is the best candidate for the job.",ja:"彼はその仕事の最適な候補者だ。"},
  {r:1111,en:"I hate waiting in long lines.",ja:"私は長い列で待つことがひどく嫌いだ。"},
  {r:1112,en:"Did you notice any changes in her behavior?",ja:"彼女の行動の何らかの変化に気づきましたか？"},
  {r:1113,en:"The cause of the disease remains a mystery.",ja:"その病気の原因は神秘（謎）のままだ。"},
  {r:1114,en:"He faced his difficulties with great dignity.",ja:"彼は大きな威厳をもって困難に立ち向かった。"},
  {r:1115,en:"The bill was passed by the Senate yesterday.",ja:"その法案は昨日、上院を通過した。"},
  {r:1116,en:"She studies contemporary Japanese literature.",ja:"彼女は現代の日本文学を研究している。"},
  {r:1117,en:"I had met him on a previous occasion.",ja:"私は前の（以前の）機会に彼に会ったことがあった。"},
  {r:1118,en:"Eating foods high in fiber is good for your health.",ja:"繊維を多く含む食べ物を食べることは健康に良い。"},
  {r:1119,en:"Many residents oppose the plan to build a new airport.",ja:"多くの住民が新しい空港を建設する計画に反対している。"},
  {r:1120,en:"The creation of a new business is not easy.",ja:"新しいビジネスの創造は簡単ではない。"},
  {r:1121,en:"He studies Jewish history at university.",ja:"彼は大学でユダヤ人の歴史を学んでいる。"},
  {r:1122,en:"The restaurant has a good reputation for its service.",ja:"そのレストランはサービスの評判が良い。"},
  {r:1123,en:"It is rude to talk with your mouth full.",ja:"口に食べ物を入れたまま話すのは失礼だ。"},
  {r:1124,en:"Drinking tea is a daily ritual for her.",ja:"お茶を飲むことは彼女の毎日の儀式だ。"},
  {r:1125,en:"The novel is based on historical events.",ja:"その小説は歴史上の出来事に基づいている。"},
  {r:1126,en:"The new law met with strong opposition from the public.",ja:"その新しい法律は一般市民からの強い反対に遭った。"},
  {r:1127,en:"We studied the structure of the human brain.",ja:"私たちは人間の脳の構造を研究した。"},
  {r:1128,en:"A high percentage of students passed the test.",ja:"高い割合の生徒がテストに合格した。"},
  {r:1129,en:"Please knock before you enter the room.",ja:"部屋に入る前にノックしてください。"},
  {r:1130,en:"They will install a new computer system tomorrow.",ja:"彼らは明日、新しいコンピューターシステムを導入する予定だ。"},
  {r:1131,en:"He broke the tip of his pencil.",ja:"彼は鉛筆の先を折った。"},
  {r:1132,en:"Don't use up all the hot water.",ja:"お湯を全部使い切らないでください。"},
  {r:1133,en:"The old house is in a terrible state.",ja:"その古い家はひどい状態だ。"},
  {r:1134,en:"You need to adjust the volume of the radio.",ja:"あなたはラジオの音量を調節する必要がある。"},
  {r:1135,en:"You should consult a physician about your stomachache.",ja:"胃の痛みについて医師（内科医）に相談すべきだ。"},
  {r:1136,en:"The factory needs more cheap labor.",ja:"その工場はもっと多くの安価な労働（労働力）を必要としている。"},
  {r:1137,en:"English is an international language.",ja:"英語は国際的な言語だ。"},
  {r:1138,en:"I strongly disagree with your opinion.",ja:"私はあなたの意見に強く反対します。"},
  {r:1139,en:"The country decided to reduce its nuclear arms.",ja:"その国は核の武器を削減することを決定した。"},
  {r:1140,en:"The average household size has decreased in Japan.",ja:"日本の平均的な世帯の規模は減少している。"},
  {r:1141,en:"The whole nation celebrated the team's victory.",ja:"国家全体（国民全体）がそのチームの勝利を祝った。"},
  {r:1142,en:"The jury found the man guilty.",ja:"陪審員はその男を有罪と評決した。"},
  {r:1143,en:"The former president gave a speech yesterday.",ja:"前の大統領が昨日スピーチをした。"},
  {r:1144,en:"It is illegal to park here.",ja:"ここに駐車するのは違法だ。"},
  {r:1145,en:"Under no circumstances should you open this door.",ja:"いかなる状況下でも、このドアを開けてはならない。"},
  {r:1146,en:"She looked wan and tired after the long flight.",ja:"長いフライトの後、彼女は青ざめて疲れているように見えた。"},
  {r:1147,en:"Don't spoil the surprise by telling him.",ja:"彼に言ってサプライズを台無しにしないで。"},
  {r:1148,en:"The composition of the committee changed this year.",ja:"委員会の構成が今年変わった。"},
  {r:1149,en:"The dog wagged its tail happily.",ja:"犬はうれしそうに尾を振った。"},
  {r:1150,en:"The majority of the students agreed with the plan.",ja:"大多数の生徒がその計画に賛成した。"},
  {r:1151,en:"He sat beside his mother.",ja:"彼は母親の横に座った。"},
  {r:1152,en:"The machine is now in operation.",ja:"その機械は現在操作中（稼働中）だ。"},
  {r:1153,en:"She has a great talent for music.",ja:"彼女には音楽の素晴らしい才能がある。"},
  {r:1154,en:"We spent a pleasant afternoon at the park.",ja:"私たちは公園で楽しい午後を過ごした。"},
  {r:1155,en:"We live in the era of information technology.",ja:"私たちは情報技術の時代に生きている。"},
  {r:1156,en:"His ultimate goal is to win a gold medal.",ja:"彼の究極の目標は金メダルを獲得することだ。"},
  {r:1157,en:"I looked at the moon through a telescope.",ja:"私は望遠鏡を通して月を見た。"},
  {r:1158,en:"The rumor originated from a simple misunderstanding.",ja:"その噂は単純な誤解から始まった。"},
  {r:1159,en:"To my delight, I passed the exam.",ja:"私が喜び（歓喜）したことに、私は試験に合格した。"},
  {r:1160,en:"You can visit me whenever you like.",ja:"あなたが好きな時はいつでも私を訪ねてきていいですよ。"},
  {r:1161,en:"It is not easy to operate this complex machine.",ja:"この複雑な機械を操作するのは簡単ではない。"},
  {r:1162,en:"His statements are not consistent with the facts.",ja:"彼の発言は事実と一貫していない。"},
  {r:1163,en:"The long journey exhausted us completely.",ja:"その長い旅は私たちを完全に疲れ果てさせた。"},
  {r:1164,en:"She gave birth to twin boys.",ja:"彼女はふたごの男の子を出産した。"},
  {r:1165,en:"Please fix the picture firmly to the wall.",ja:"その絵を壁にしっかりと固定してください。"},
  {r:1166,en:"Reading books can enhance your imagination.",ja:"本を読むことは想像力をさらに高めることができる。"},
  {r:1167,en:"The defendant stood up when the judge entered.",ja:"裁判官が入廷したとき、被告人は立ち上がった。"},
  {r:1168,en:"The negotiation between the two companies failed.",ja:"その二つの会社間の交渉（話し合い）は失敗した。"},
  {r:1169,en:"We have to face the difficult reality.",ja:"私たちは困難な現実に直面しなければならない。"},
  {r:1170,en:"The medicine had an immediate effect on his headache.",ja:"その薬は彼の頭痛に対して即座の効果があった。"},
  {r:1171,en:"She disappeared in an instant.",ja:"彼女は瞬時のうちに消えた。"},
  {r:1172,en:"The battle was long and bloody.",ja:"その戦いは長く、血みどろだった（血の戦いだった）。"},
  {r:1173,en:"He changed the gear of his bicycle to go up the hill.",ja:"彼は丘を登るために自転車の伝動装置（ギア）を変えた。"},
  {r:1174,en:"A large tree fell and blocked the road.",ja:"大きな木が倒れて道を妨げた（ふさいだ）。"},
  {r:1175,en:"I won't go out unless it stops raining.",ja:"雨がやまない限り、私は外出しません。"},
  {r:1176,en:"I am willing to help you anytime.",ja:"いつでもあなたを助けることをいといません。"},
  {r:1177,en:"They are trying to negotiate a new contract.",ja:"彼らは新しい契約について交渉しようとしている。"},
  {r:1178,en:"There is no doubt that he is telling the truth.",ja:"彼が真実を話していることに疑いはない。"},
  {r:1179,en:"I can't afford to buy a new car right now.",ja:"私には今、新しい車を買う余裕がない。"},
  {r:1180,en:"The minimum wage was increased last year.",ja:"最低賃金は昨年に引き上げられた。"},
  {r:1181,en:"Abortion is a very controversial topic in many countries.",ja:"中絶は多くの国で非常に論争の的となる話題だ。"},
  {r:1182,en:"I saw a strange light in the sky last night.",ja:"昨夜、空に奇妙な光を見た。"},
  {r:1183,en:"He left a large estate to his family.",ja:"彼は家族に大きな財産を残した。"},
  {r:1184,en:"The new room is a great addition to the house.",ja:"新しい部屋は家にとって素晴らしい追加だ。"},
  {r:1185,en:"She is a very smart student.",ja:"彼女はとても頭の良い生徒だ。"},
  {r:1186,en:"Please bind these papers together.",ja:"これらの書類を一緒に束ねてください。"},
  {r:1187,en:"She shed tears of joy when she heard the news.",ja:"彼女はその知らせを聞いたとき喜びの涙を流した。"},
  {r:1188,en:"Every citizen has the right to vote.",ja:"すべての市民は投票する権利を持っている。"},
  {r:1189,en:"They reached the summit of the mountain before noon.",ja:"彼らは正午前に山の頂上に到達した。"},
  {r:1190,en:"My phone battery is almost dead.",ja:"私の携帯電話の電池がほとんど切れそうだ。"},
  {r:1191,en:"The complexity of the system makes it hard to use.",ja:"システムの複雑さがそれを使用するのを難しくしている。"},
  {r:1192,en:"There has been a big reduction in traffic accidents.",ja:"交通事故の大きな減少があった。"},
  {r:1193,en:"The earthquake was a terrible natural disaster.",ja:"その地震は恐ろしい自然災害だった。"},
  {r:1194,en:"He tried to comfort the crying child.",ja:"彼は泣いている子どもを慰めようとした。"},
  {r:1195,en:"He is the founder of this large company.",ja:"彼はこの大企業の創設者だ。"},
  {r:1196,en:"The man was arrested for assault.",ja:"その男は暴行で逮捕された。"},
  {r:1197,en:"The news was broadcast on all television channels.",ja:"そのニュースはすべてのテレビチャンネルで放送された。"},
  {r:1198,en:"The movie critic gave the film a bad review.",ja:"その映画の批評家（評論家）は映画に悪い評価を下した。"},
  {r:1199,en:"Everyone in the village was very friendly to us.",ja:"村の誰もが私たちにとても友好的だった。"},
  {r:1200,en:"He didn't study; consequently, he failed the exam.",ja:"彼は勉強しなかった。その結果として、試験に失敗した。"},
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
  console.log(`Applied ${c} examples to 2級 (1101-1200). Saved.`);
}
main().catch(console.error);
