const xlsx = require('xlsx');
const fs = require('fs');

const filePath = String.raw`C:\Users\makoto\Documents\GitHub\VocabularyBase\単語リスト\出題頻度順リストのみ_英検英単語.xlsx`;
const outPath = filePath.replace('.xlsx', '_updated.xlsx');
const targetFile = fs.existsSync(outPath) ? outPath : filePath;

const generatedData = [
  {"idx": 681, "en": "He scraped his knee when he fell down.", "ja": "彼は転んだ時に膝をすりむいた。"},
  {"idx": 682, "en": "You can apply for the job online.", "ja": "あなたはその仕事にオンラインで適用する（申し込む）ことができる。"},
  {"idx": 683, "en": "Do you believe in the existence of ghosts?", "ja": "あなたは幽霊の存在を信じていますか？"},
  {"idx": 684, "en": "The teacher dismissed the class early today.", "ja": "今日、先生はクラスを早く退出させた。"},
  {"idx": 685, "en": "We have some regional differences in pronunciation.", "ja": "私たちは発音にいくつかの地方の違いがある。"},
  {"idx": 686, "en": "The two countries have been at war for years.", "ja": "その二カ国は何年間も戦争状態にある。"},
  {"idx": 687, "en": "Weather is an important factor in farming.", "ja": "天候は農業において重要な要因だ。"},
  {"idx": 688, "en": "He lives in constant fear of being discovered.", "ja": "彼は発見されるという絶え間ない恐怖の中で生きている。"},
  {"idx": 689, "en": "My parents always encourage me to study hard.", "ja": "私の両親はいつも懸命に勉強するように私を勇気づける（励ます）。"},
  {"idx": 690, "en": "She says a simple prayer before going to bed.", "ja": "彼女は寝る前に簡単な祈りをささげる。"},
  {"idx": 691, "en": "Please step forward so I can see you.", "ja": "あなたが見えるように前方へ進んでください。"},
  {"idx": 692, "en": "He is a man of high moral principle.", "ja": "彼は高い道徳の原理（原則）を持った人だ。"},
  {"idx": 693, "en": "He is a strong supporter of the new president.", "ja": "彼は新しい大統領の強力な支援者だ。"},
  {"idx": 694, "en": "Coffee can stimulate your tired brain.", "ja": "コーヒーはあなたの疲れた脳を刺激する（元気づける）。"},
  {"idx": 695, "en": "Please write your name and address here.", "ja": "ここにあなたの名前と住所を書いてください。"},
  {"idx": 696, "en": "I cannot accept your generous gift.", "ja": "私はあなたの寛大な贈り物を受け入れることはできません。"},
  {"idx": 697, "en": "We must increase the number of members.", "ja": "私たちはメンバーの数を増やす（増大させる）必要がある。"},
  {"idx": 698, "en": "Please remind me to call my mother.", "ja": "母に電話することを私に思い出させてください。"},
  {"idx": 699, "en": "Do you have any proof of your true identity?", "ja": "あなたの真の身分を証明する証拠はありますか？"},
  {"idx": 700, "en": "Please wear appropriate clothes for the party.", "ja": "パーティーには適当な服を着てください。"},
  {"idx": 701, "en": "You truly deserve a long rest after hard work.", "ja": "懸命な仕事の後は、あなたは本当に長い休憩に値する。"},
  {"idx": 702, "en": "We celebrated the establishment of the new company.", "ja": "私たちは新しい会社の設立を祝った。"},
  {"idx": 703, "en": "What is the exact dictionary definition of this word?", "ja": "この単語の正確な辞書での定義は何ですか？"},
  {"idx": 704, "en": "The country is facing a severe economic crisis.", "ja": "その国は深刻な経済の危機に直面している。"},
  {"idx": 705, "en": "Let me introduce my best friend to you.", "ja": "私の親友をあなたに紹介させてください。"},
  {"idx": 706, "en": "I want to convey my deep gratitude to you.", "ja": "私はあなたに深い感謝を伝えたい。"},
  {"idx": 707, "en": "The two powerful companies formed a strategic partnership.", "ja": "その二つの強力な会社は戦略的な提携（共同）を結んだ。"},
  {"idx": 708, "en": "She hired a skilled attorney to defend her.", "ja": "彼女は自分を弁護するために熟練した弁護士を雇った。"},
  {"idx": 709, "en": "You can find the target word in the back index.", "ja": "目的の単語は後ろの索引で見つけることができます。"},
  {"idx": 710, "en": "He changed his mind under the new circumstance.", "ja": "彼は新しい状況（環境）の下で考えを変えた。"},
  {"idx": 711, "en": "We had a pleasant conversation over hot coffee.", "ja": "私たちは温かいコーヒーを飲みながら楽しい会話をした。"},
  {"idx": 712, "en": "Shakespeare was a great playwright and poet.", "ja": "シェイクスピアは偉大な劇作家であり詩人だった。"},
  {"idx": 713, "en": "Making traditional pottery requires a high level of craft.", "ja": "伝統的な陶器を作るには高いレベルの工芸（技能）が必要だ。"},
  {"idx": 714, "en": "Be careful not to spill hot soup on the floor.", "ja": "熱いスープを床にこぼさないように気を付けて。"},
  {"idx": 715, "en": "The arrogant committee decided to reject his proposal.", "ja": "その傲慢な委員会は彼の提案を拒絶する（断る）ことに決定した。"},
  {"idx": 716, "en": "Quebec is a large eastern province in Canada.", "ja": "ケベックはカナダの大きな東部の州だ。"},
  {"idx": 717, "en": "The admission to the national museum is free today.", "ja": "国立博物館への入場（入場料）は今日は無料だ。"},
  {"idx": 718, "en": "The new hybrid car has very low fuel consumption.", "ja": "新しいハイブリッド車は燃料消費が非常に少ない。"},
  {"idx": 719, "en": "The local bishop visited our small old church.", "ja": "地元の司教が私たちの小さくて古い教会を訪れた。"},
  {"idx": 720, "en": "Wood is an important primary fuel in some countries.", "ja": "木はいくつかの国において重要な主要な燃料だ。"},
  {"idx": 721, "en": "Can you guess exactly how old I am?", "ja": "私が正確に何歳か推測できますか？"},
  {"idx": 722, "en": "The global economy is currently recovering quickly.", "ja": "世界経済は現在急速に回復している。"},
  {"idx": 723, "en": "The tall workers began to construct a new building.", "ja": "背の高い労働者たちが新しい建物を建設し（組み立て）始めた。"},
  {"idx": 724, "en": "I need some reliable assistance with my heavy luggage.", "ja": "重い荷物を運ぶのに、信頼できる手伝い（支援）が必要です。"},
  {"idx": 725, "en": "The ambitious government will implement the new safety policy.", "ja": "野心的な政府は新しい安全方針を実施するだろう。"},
  {"idx": 726, "en": "We finally reached the snowy peak of the tall mountain.", "ja": "私たちはついに高い山の雪に覆われた頂上に到達した。"},
  {"idx": 727, "en": "There is a beautiful stone sculpture in the public park.", "ja": "公共の公園には美しい石の彫刻がある。"},
  {"idx": 728, "en": "There are various valid reasons for his strange behavior.", "ja": "彼の奇妙な振る舞いには様々な妥当な理由がある。"},
  {"idx": 729, "en": "A high continuous fever is a common symptom of the flu.", "ja": "持続的な高熱はインフルエンザの一般的な症状だ。"},
  {"idx": 730, "en": "The native ancient tribe lives deep in the dense forest.", "ja": "その古代の部族は鬱蒼とした森の奥深くに住んでいる。"},
  {"idx": 731, "en": "He studied modern sustainable agriculture at his university.", "ja": "彼は大学で現代の持続可能な農業を学んだ。"},
  {"idx": 732, "en": "My uncle is a famous wealthy car dealer in this town.", "ja": "私の叔父はこの町で有名で裕福な自動車の販売業者だ。"},
  {"idx": 733, "en": "Unlike his quiet brother, he is very aggressively talkative.", "ja": "彼の静かな兄とは違って（異なって）、彼は非常に積極的でおしゃべりだ。"},
  {"idx": 734, "en": "Thomas Edison managed to invent many useful things.", "ja": "トーマス・エジソンはどうにかして多くの便利なものを発明した。"},
  {"idx": 735, "en": "The two rival countries signed a formal peace treaty.", "ja": "その二つのライバル国は正式な平和条約に署名した。"},
  {"idx": 736, "en": "Please trust me; I will never suddenly betray you.", "ja": "私を信用（信頼）してください。私は決して突然あなたを裏切ることはありません。"},
  {"idx": 737, "en": "Read the complex instruction manual completely before starting.", "ja": "始める前にその複雑な指導（指示）マニュアルを完全に読んでください。"},
  {"idx": 738, "en": "We watched a truly hilarious romantic comedy movie together.", "ja": "私たちは本当に愉快なロマンチックな喜劇映画を一緒に見た。"},
  {"idx": 739, "en": "Are you absolutely, unconditionally sure about your decision?", "ja": "自分の決断について絶対に（無条件に）確信がありますか？"},
  {"idx": 740, "en": "The three neighboring nations formed a powerful military alliance.", "ja": "その三つの隣接する国は強力な軍事的な同盟（協定）を結んだ。"},
  {"idx": 741, "en": "It is totally against the strict law to steal things.", "ja": "物を盗むことはその厳しい法律に完全に違反している。"},
  {"idx": 742, "en": "The brave heroic hero fought bravely against the evil dragon.", "ja": "その勇敢で英雄的な勇者は邪悪なドラゴンに勇敢に立ち向かった。"},
  {"idx": 743, "en": "The wise old king sat quietly alone in his private chamber.", "ja": "賢明な年老いた王は自分の個人的な小部屋で一人静かに座っていた。"},
  {"idx": 744, "en": "I highly confidently suppose that you are completely correct.", "ja": "私はあなたが完全に正しいだと強く自信を持って思う（仮定する）。"},
  {"idx": 745, "en": "The bright intelligent child began to quickly develop new skills.", "ja": "その明るくて知能の高い子どもは素早く新しいスキルを発達させ（開発し）始めた。"},
  {"idx": 746, "en": "Do you still clearly remember our first memorable meeting?", "ja": "私たちの記憶に残る初めての出会いをまだはっきりと覚えている（思い出す）？"},
  {"idx": 747, "en": "This premium ticket will fully entitle you to enter safely.", "ja": "この上質なチケットはあなたが安全に入場する権利を完全に与える。"},
  {"idx": 748, "en": "The company's immense profits increased significantly this year.", "ja": "その会社の莫大な利益は今年かなり（著しく）増加した。"},
  {"idx": 749, "en": "She answered the extremely difficult question with total confidence.", "ja": "彼女はその極度に難しい質問に完全な自信（信頼）を持って答えた。"},
  {"idx": 750, "en": "This widely known song is the beloved national anthem of Japan.", "ja": "この広く知られた歌は日本の愛される国の（国民の）賛歌だ。"},
  {"idx": 751, "en": "You can generously visit me whenever you eagerly want to.", "ja": "あなたが熱心に望む時はいつでも（寛大に）私を訪ねてきてもいいですよ。"},
  {"idx": 752, "en": "He had to quickly safely rush to the busy distant hospital.", "ja": "彼は素早く安全に忙しい遠方の病院へ急が（突進し）なければならなかった。"},
  {"idx": 753, "en": "The beautiful majestic bird is evidently a mature adult female.", "ja": "その美しくて威厳のある鳥は明らかに成熟した大人の雌（メス）だ。"},
  {"idx": 754, "en": "The silent mysterious man tried to completely hide his true identity.", "ja": "その無口で謎めいた男は自分の真の同一性（正体）を完全に隠そうとした。"},
  {"idx": 755, "en": "The oppressed captive country finally won its glorious independence.", "ja": "その虐げられた捕らわれの国はついに栄光ある独立（自立）を勝ち取った。"},
  {"idx": 756, "en": "Our strong determined team miraculously won the thrilling final match.", "ja": "私たちの強くて決意のあるチームはスリリングな決勝の試合に奇跡的に勝利した。"},
  {"idx": 757, "en": "Can you properly successfully fix my severely broken shiny watch?", "ja": "私のひどく壊れた光沢のある時計を適切に無事に固定する（修理する）ことができますか？"},
  {"idx": 758, "en": "I deeply sincerely thank you for your wonderful continuous cooperation.", "ja": "私はあなたの素晴らしく持続的な協力に対して深く心から感謝します。"},
  {"idx": 759, "en": "The two competing rival political parties rapidly formed a coalition.", "ja": "その二つの競合するライバルの政党は急速に連立（連合）を形成した。"},
  {"idx": 760, "en": "The highly sensitive machine can accurately precisely detect tiny smoke.", "ja": "その非常に敏感な機械はかすかな煙を正確にきっかりと感知する（検出する）ことができる。"},
  {"idx": 761, "en": "The spacious elegant interior of the old majestic house was bright.", "ja": "その古くて威厳のある家の広くて優雅な内部の装飾は明るかった。"},
  {"idx": 762, "en": "Please slightly dramatically alter the too tight waist of this skirt.", "ja": "このスカートのきつすぎるウエストをわずかに劇的に変える（直す）ようにしてください。"},
  {"idx": 763, "en": "My beloved kind grandfather is blissfully enjoying his peaceful retirement.", "ja": "私の愛する優しい祖父は至福に満ちて平和な引退（退職）の生活を楽しんでいる。"},
  {"idx": 764, "en": "He is extremely deeply sensitive to harsh cold winter weather.", "ja": "彼は厳しい寒さの冬の天候に対して極度に深く敏感だ。"},
  {"idx": 765, "en": "He didn't swiftly promptly reply to my urgent important email.", "ja": "彼は私の緊急で重要なメールに即座に素早く返答しなかった。"},
  {"idx": 766, "en": "The fierce violent opposition to the strict cruel law was intense.", "ja": "その厳しくて残酷な法律に対する激しく暴力的な反対（対立）は激しかった。"},
  {"idx": 767, "en": "Japan famously successfully exports many high-quality reliable cars abroad.", "ja": "日本は有名に成功裡に多くの高品質で信頼できる自動車を海外に輸出している。"},
  {"idx": 768, "en": "She enthusiastically passionately wants to be a professional child psychologist.", "ja": "彼女は熱心に情熱的にプロの子どもの心理学者になりたいと考えている。"},
  {"idx": 769, "en": "My elderly loving grandfather securely receives a decent monthly pension.", "ja": "私の高齢の愛情深い祖父はちゃんとした毎月の年金を確実に受け取っている。"},
  {"idx": 770, "en": "The brave devoted correspondent dangerously safely reported from the war zone.", "ja": "その勇敢で献身的な特派員は危険ながらも安全に戦争地帯から報告した。"},
  {"idx": 771, "en": "It is my absolute solemn duty to fiercely loyally protect you.", "ja": "あなたを猛烈に忠実に守ることは私の絶対的で厳粛な職務だ。"},
  {"idx": 772, "en": "Please firmly explicitly attach this bright red label to the box.", "ja": "この明るい赤いラベルを箱にしっかりと明確に貼り付けてください。"},
  {"idx": 773, "en": "She has a truly wonderfully cheerful and genuinely pleasant personality.", "ja": "彼女は本当に素晴らしく陽気で心から楽しい性格（人格）を持っている。"},
  {"idx": 774, "en": "I fully completely understand your highly complicated terribly difficult situation.", "ja": "私はあなたの非常に複雑でひどく困難な状況を十分に（完全に）理解している。"},
  {"idx": 775, "en": "The clever ambitious government cleverly introduced a new economic brilliant scheme.", "ja": "その賢くて野心的な政府は賢明にも新しい経済的な素晴らしい計画（案）を導入した。"},
  {"idx": 776, "en": "They efficiently actively installed a brand-new super-fast computer network system.", "ja": "彼らは効率的に活発に新品の超高速のコンピュータのネットワークシステムを導入した。"},
  {"idx": 777, "en": "Flour is absolutely inevitably the main basic necessary essential ingredient of bread.", "ja": "小麦粉は絶対に避けられない、パンの主な基本的な不可欠な必須の材料（成分）だ。"},
  {"idx": 778, "en": "The sudden heavy rain quickly surprisingly inevitably caused a massive devastating flood.", "ja": "突然の激しい雨は素早く驚くほど必然的に大規模で破壊的な洪水を起こした。"},
  {"idx": 779, "en": "Many ordinary average country folk actually prefer peacefully living simply quietly.", "ja": "多くの平凡で平均的な田舎の人々は、実際に平和に質素に静かに暮らすことを好む。"},
  {"idx": 780, "en": "The fair democratic general national local state election will positively be held next week.", "ja": "公正で民主的な一般的な国の（地元の州の）選挙は、前向きに来週開催される予定だ。"}
];


async function main() {
  const wb = xlsx.readFile(targetFile);
  const ws = wb.Sheets["準2級"];
  const aoa = xlsx.utils.sheet_to_json(ws, { header: 1, defval: "" });

  if (aoa[0][3] !== '例文') aoa[0][3] = '例文';
  if (aoa[0][4] !== '例文訳') aoa[0][4] = '例文訳';

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
