const xlsx = require('xlsx');
const fs = require('fs');
const filePath = String.raw`C:\Users\makoto\Documents\GitHub\VocabularyBase\単語リスト\出題頻度順リストのみ_英検英単語.xlsx`;
const outPath = filePath.replace('.xlsx', '_updated.xlsx');
const targetFile = fs.existsSync(outPath) ? outPath : filePath;

const generatedData = [
  {"idx":931,"en":"This dictionary is very useful for students.","ja":"この辞書は学生にとてもに立つ。"},
  {"idx":932,"en":"The fat cat sat on the soft cushion.","ja":"太った猫は柔らかいクッションの上に座った。"},
  {"idx":933,"en":"The government made provision for emergency aid.","ja":"政府は緊急援助のための供給（支給）を行った。"},
  {"idx":934,"en":"Math is my favorite subject at school.","ja":"数学は学校で一番好きな教科（主題）だ。"},
  {"idx":935,"en":"This region is famous for growing rice.","ja":"この地域は米の栽培で有名だ。"},
  {"idx":936,"en":"The river forms the boundary between the two countries.","ja":"その川は二つの国の境界を成している。"},
  {"idx":937,"en":"They decided to adopt a new teaching method.","ja":"彼らは新しい教育方法を取り入れることに決めた。"},
  {"idx":938,"en":"His grandmother was known for her great wisdom.","ja":"彼の祖母は偉大な知恵で知られていた。"},
  {"idx":939,"en":"He couldn't express his feelings in words.","ja":"彼は自分の感情を言葉で表現する（言い表す）ことができなかった。"},
  {"idx":940,"en":"The old house was made of red brick.","ja":"その古い家は赤いれんがでできていた。"},
  {"idx":941,"en":"Art is the creation of beautiful things.","ja":"芸術は美しいものの創造だ。"},
  {"idx":942,"en":"She greeted the guests with a warm smile.","ja":"彼女は温かい笑顔で客を出迎えた（挨拶した）。"},
  {"idx":943,"en":"A fallen tree blocked the narrow road.","ja":"倒れた木が狭い道を妨げた。"},
  {"idx":944,"en":"The bird escaped from the small cage.","ja":"鳥は小さなかごから逃れた。"},
  {"idx":945,"en":"She worked hard to obtain her medical degree.","ja":"彼女は医学の学位を手に入れるために（獲得するために）懸命に働いた。"},
  {"idx":946,"en":"The sky gradually turned orange at sunset.","ja":"空は日没時に次第にオレンジ色に変わった。"},
  {"idx":947,"en":"It was obvious that he was telling a lie.","ja":"彼が嘘をついていることは明白だった。"},
  {"idx":948,"en":"The court found the young man innocent.","ja":"法廷はその若い男を無罪と認定した。"},
  {"idx":949,"en":"The distribution of wealth is very unequal.","ja":"富の分布（配分）は非常に不平等だ。"},
  {"idx":950,"en":"That is exactly what I wanted to say.","ja":"それはまさに私が言いたかったことだ。"},
  {"idx":951,"en":"Africa is the second largest continent.","ja":"アフリカは二番目に大きい大陸だ。"},
  {"idx":952,"en":"The country agreed to reduce its nuclear arms.","ja":"その国は核の武器を削減することに同意した。"},
  {"idx":953,"en":"Scientists compound different chemicals in the lab.","ja":"科学者は研究室でさまざまな化学物質を調合する。"},
  {"idx":954,"en":"The museum is open to the general public.","ja":"その博物館は一般の公共の人々に開かれている。"},
  {"idx":955,"en":"We should raise awareness of climate change.","ja":"私たちは気候変動への気づき（意識）を高めるべきだ。"},
  {"idx":956,"en":"Please remove your shoes before entering.","ja":"入室する前に靴を取り除いて（脱いで）ください。"},
  {"idx":957,"en":"He studied his opponent before the big match.","ja":"彼は大きな試合の前に相手を研究した。"},
  {"idx":958,"en":"There is a nice park in our neighborhood.","ja":"私たちの近所に素敵な公園がある。"},
  {"idx":959,"en":"He studied while his sister watched television.","ja":"彼が勉強している一方で姉（妹）はテレビを見ていた。"},
  {"idx":960,"en":"The city council approved the new budget.","ja":"市議会は新しい予算を承認した。"},
  {"idx":961,"en":"This book is suitable for young children.","ja":"この本は幼い子供たちに適している（好都合だ）。"},
  {"idx":962,"en":"The secretary answered the phone politely.","ja":"秘書は礼儀正しく電話に出た。"},
  {"idx":963,"en":"I would like to participate in the contest.","ja":"私はそのコンテストに参加したい。"},
  {"idx":964,"en":"He has a strong interest in politics.","ja":"彼は政治に強い関心を持っている。"},
  {"idx":965,"en":"The weather forecast was not accurate today.","ja":"今日の天気予報は正確な（的確な）ものではなかった。"},
  {"idx":966,"en":"The doctor warned about the dangers of the drug.","ja":"医者はその薬（麻薬）の危険性について警告した。"},
  {"idx":967,"en":"I heard a strange noise in the dark room.","ja":"暗い部屋で奇妙な（異常な）音が聞こえた。"},
  {"idx":968,"en":"He prefers conventional methods of teaching.","ja":"彼は従来の教育方法を好む。"},
  {"idx":969,"en":"She works for an international organization.","ja":"彼女は国際的な組織（団体）で働いている。"},
  {"idx":970,"en":"He was desperate to find a good job.","ja":"彼は良い仕事を見つけたくてやけくそだった（必死だった）。"},
  {"idx":971,"en":"We should think about the moral side of this issue.","ja":"私たちはこの問題の道徳の（道徳的な）側面について考えるべきだ。"},
  {"idx":972,"en":"She is known for her intellectual ability.","ja":"彼女は知的な能力で知られている。"},
  {"idx":973,"en":"The teacher put emphasis on reading skills.","ja":"先生は読解力に強調を置いた。"},
  {"idx":974,"en":"I particularly enjoy listening to classical music.","ja":"私は特に（とりわけ）クラシック音楽を聴くことを楽しんでいる。"},
  {"idx":975,"en":"He is the founder of this famous company.","ja":"彼はこの有名な会社の創設者だ。"},
  {"idx":976,"en":"Please consider the matter carefully before deciding.","ja":"決定する前にその問題をについて注意深く考えてください。"},
  {"idx":977,"en":"Music can have a strong emotional effect on people.","ja":"音楽は人々に強い感情の（情緒の）影響を及ぼすことがある。"},
  {"idx":978,"en":"Wash your hands to prevent infection.","ja":"感染を防ぐために手を洗いなさい。"},
  {"idx":979,"en":"The police managed to identify the criminal.","ja":"警察はどうにかして犯人を見分けることができた。"},
  {"idx":980,"en":"There is a growing demand for clean energy.","ja":"クリーンエネルギーへの需要（要求）が高まっている。"},
  {"idx":981,"en":"She was relieved to hear the good result.","ja":"彼女はその良い結果を聞いて安心した。"},
  {"idx":982,"en":"The disease will eventually disappear with treatment.","ja":"その病気は治療によってやがて消えるだろう。"},
  {"idx":983,"en":"Everyone has a unique individual character.","ja":"誰もがユニークな個人の性格を持っている。"},
  {"idx":984,"en":"He raised his right arm to ask a question.","ja":"彼は質問するために右の腕を上げた。"},
  {"idx":985,"en":"They cannot survive without clean drinking water.","ja":"彼らは清潔な飲料水なしでは生き残ることができない。"},
  {"idx":986,"en":"We went on a trip to a tropical island.","ja":"私たちは熱帯の島への旅行に行った。"},
  {"idx":987,"en":"I was impressed by his wonderful performance.","ja":"彼の素晴らしいパフォーマンス（演技）に感動した。"},
  {"idx":988,"en":"We must ensure the safety of all passengers.","ja":"私たちはすべての乗客の安全を確保しなければならない。"},
  {"idx":989,"en":"He is a wealthy and powerful businessman.","ja":"彼は裕福で有力な実業家だ。"},
  {"idx":990,"en":"Please put the books on the wooden shelf.","ja":"本を木の棚に置いてください。"},
  {"idx":991,"en":"She wore a beautiful silver necklace.","ja":"彼女は美しい銀のネックレスを身に着けていた。"},
  {"idx":992,"en":"The committee will assess the quality of the plan.","ja":"委員会はその計画の質を評価するだろう。"},
  {"idx":993,"en":"He tried to resist the temptation of eating sweets.","ja":"彼は甘いものを食べたいという誘惑に抵抗しようとした。"},
  {"idx":994,"en":"Fresh vegetables contain a lot of dietary fiber.","ja":"新鮮な野菜には食物繊維が多く含まれている。"},
  {"idx":995,"en":"It is rare to see snow in this warm region.","ja":"この温暖な地域で雪を見るのは珍しい（まれな）ことだ。"},
  {"idx":996,"en":"Many ancient ruins can be found in Greece.","ja":"ギリシャには多くの古代の遺跡が見つかる。"},
  {"idx":997,"en":"We are looking for a permanent solution.","ja":"私たちは恒久的な（永久の）解決策を探している。"},
  {"idx":998,"en":"She wrote a literary essay about modern poetry.","ja":"彼女は現代の詩についての文学的なエッセイを書いた。"},
  {"idx":999,"en":"Children tend to imitate their parents' behavior.","ja":"子どもは親の行動を真似する傾向がある。"},
  {"idx":1000,"en":"The witness gave testimony in the courtroom.","ja":"証人は法廷で証言を行った。"},
  {"idx":1001,"en":"Please demonstrate how to use this new machine.","ja":"この新しい機械の使い方を実演してください。"},
  {"idx":1002,"en":"He performed a wonderful trick with a magic trick.","ja":"彼は手品（トリック）で素晴らしい技を披露した。"},
  {"idx":1003,"en":"What is the current status of the project?","ja":"プロジェクトの現在の状態はどうなっていますか？"},
  {"idx":1004,"en":"He won a gold medal at the Olympic Games.","ja":"彼はオリンピックで金メダルを獲得した。"},
  {"idx":1005,"en":"She drew a rough sketch of the building.","ja":"彼女は建物のおおまかなスケッチ（素描）を描いた。"},
  {"idx":1006,"en":"Trees absorb carbon dioxide and release oxygen.","ja":"木は二酸化炭素を吸収し酸素を放出する。"},
  {"idx":1007,"en":"She has a very liberal view on education.","ja":"彼女は教育について非常に自由主義的な見解を持っている。"},
  {"idx":1008,"en":"The principal gave a speech at the ceremony.","ja":"校長は式典でスピーチを行った。"},
  {"idx":1009,"en":"He showed his enthusiasm for the new project.","ja":"彼は新しいプロジェクトへの熱意を示した。"},
  {"idx":1010,"en":"The earthquake caused enormous damage to the city.","ja":"地震はその都市に莫大な被害を引き起こした。"},
  {"idx":1011,"en":"She has a deep sympathy for the poor.","ja":"彼女は貧しい人々への深い同情を持っている。"},
  {"idx":1012,"en":"We celebrated the anniversary of the school.","ja":"私たちは学校の記念日を祝った。"},
  {"idx":1013,"en":"She gave a detailed description of the suspect.","ja":"彼女は容疑者の詳細な記述（描写）を行った。"},
  {"idx":1014,"en":"His sudden departure surprised everyone.","ja":"彼の突然の出発（離脱）は全員を驚かせた。"},
  {"idx":1015,"en":"Please indicate which answer is correct.","ja":"どの答えが正しいか指し示してください。"},
  {"idx":1016,"en":"He denied the rumor completely.","ja":"彼はその噂を完全に否定した。"},
  {"idx":1017,"en":"Let me illustrate my point with an example.","ja":"例を使って私の要点を説明させてください。"},
  {"idx":1018,"en":"She tried to comfort the crying child.","ja":"彼女は泣いている子供を慰めようとした。"},
  {"idx":1019,"en":"The politician made a powerful appeal to voters.","ja":"その政治家は有権者に力強い訴え（アピール）をした。"},
  {"idx":1020,"en":"He inherited a large fortune from his uncle.","ja":"彼は叔父から莫大な富（財産）を相続した。"},
  {"idx":1021,"en":"My parents rarely eat out at restaurants.","ja":"私の両親はめったにレストランで外食しない。"},
  {"idx":1022,"en":"The tiny insect was crawling on the green leaf.","ja":"小さな昆虫が緑の葉の上を這っていた。"},
  {"idx":1023,"en":"The ancient civilization left behind many monuments.","ja":"その古代の文明は多くの記念碑を残した。"},
  {"idx":1024,"en":"She quietly whispered a secret into my ear.","ja":"彼女は静かに私の耳に秘密をささやいた。"},
  {"idx":1025,"en":"Please consult your doctor before taking this medicine.","ja":"この薬を服用する前に医者に相談してください。"},
  {"idx":1026,"en":"The phenomenon cannot be explained by science.","ja":"この現象は科学では説明できない。"},
  {"idx":1027,"en":"We need to devise a better strategy.","ja":"私たちはもっと良い戦略を考案する必要がある。"},
  {"idx":1028,"en":"The police launched an investigation into the crime.","ja":"警察はその犯罪についての調査を開始した。"},
  {"idx":1029,"en":"She has a remarkable talent for music.","ja":"彼女は音楽に対する注目すべき（非凡な）才能を持っている。"},
  {"idx":1030,"en":"The intense heat wave continued for two weeks.","ja":"激しい熱波は二週間続いた。"}
];

async function main() {
  const wb = xlsx.readFile(targetFile);
  const ws = wb.Sheets["準2級"];
  const aoa = xlsx.utils.sheet_to_json(ws, { header: 1, defval: "" });
  let appliedCount = 0;
  for (const item of generatedData) {
    if (aoa[item.idx] && aoa[item.idx][3] === "") {
        aoa[item.idx][3] = item.en;
        aoa[item.idx][4] = item.ja;
        appliedCount++;
    }
  }
  const newWs = xlsx.utils.aoa_to_sheet(aoa);
  wb.Sheets["準2級"] = newWs;
  xlsx.writeFile(wb, outPath);
  console.log(`Successfully applied ${appliedCount} examples. Saved to ${outPath}`);
}
main().catch(console.error);
