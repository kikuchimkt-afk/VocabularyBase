const xlsx = require('xlsx');
const fs = require('fs');

const filePath = String.raw`C:\Users\makoto\Documents\GitHub\VocabularyBase\単語リスト\出題頻度順リストのみ_英検英単語.xlsx`;
const outPath = filePath.replace('.xlsx', '_updated.xlsx');
const targetFile = fs.existsSync(outPath) ? outPath : filePath;

const generatedData = [
  {"idx": 781, "en": "He went to work despite his bad cold.", "ja": "彼はひどい風邪にも関わらず仕事に行った。"},
  {"idx": 782, "en": "The French Revolution changed history.", "ja": "フランス革命は歴史を変えた。"},
  {"idx": 783, "en": "He got a promotion to store manager.", "ja": "彼は店長への昇進を手に入れた。"},
  {"idx": 784, "en": "The country experienced rapid industrial growth.", "ja": "その国は急速な産業の成長を経験した。"},
  {"idx": 785, "en": "There was a dramatic change in the weather.", "ja": "天候に劇的な変化があった。"},
  {"idx": 786, "en": "Don't lean against the freshly painted wall.", "ja": "塗りたての壁に寄りかからないで。"},
  {"idx": 787, "en": "We visited an art exhibition in Paris.", "ja": "私たちはパリの美術展示を訪れた。"},
  {"idx": 788, "en": "They finally reached a compromise.", "ja": "彼らはついに和解（妥協）に達した。"},
  {"idx": 789, "en": "She felt a lot of anxiety about the test.", "ja": "彼女はテストについて多くの不安を感じた。"},
  {"idx": 790, "en": "Please give me some relevant information.", "ja": "私に関連のある（適切な）情報をください。"},
  {"idx": 791, "en": "Scientific observation requires great patience.", "ja": "科学的な観察には大きな忍耐が必要だ。"},
  {"idx": 792, "en": "I need to speak to the hotel manager.", "ja": "ホテルの支配人と話す必要があります。"},
  {"idx": 793, "en": "Our baseball team defeated the champions.", "ja": "私たちの野球チームはチャンピオンを打ち破った。"},
  {"idx": 794, "en": "He had heart surgery last month.", "ja": "彼は先月心臓の手術を受けた。"},
  {"idx": 795, "en": "What was her reaction to the surprising news?", "ja": "その驚くべきニュースに対する彼女の反応は何でしたか？"},
  {"idx": 796, "en": "They had to abandon the sinking ship.", "ja": "彼らは沈みゆく船を捨て去らなければならなかった。"},
  {"idx": 797, "en": "The whole world is facing an energy crisis.", "ja": "全世界がエネルギーの危機に直面している。"},
  {"idx": 798, "en": "My friends offered me comfort when I was sad.", "ja": "私が悲しい時、友人たちは慰めを提供してくれた。"},
  {"idx": 799, "en": "It is not wise to drive in heavy snow.", "ja": "大雪の中で運転するのは賢いことではない。"},
  {"idx": 800, "en": "She managed to sustain her high energy levels.", "ja": "彼女は高いエネルギーレベルを保持すること（続けてすること）ができた。"},
  {"idx": 801, "en": "The big company plans to hire new staff.", "ja": "その大きな会社は新しいスタッフを雇う計画だ。"},
  {"idx": 802, "en": "Be careful not to slip on the icy road.", "ja": "凍った道で滑らないように気をつけて。"},
  {"idx": 803, "en": "I entirely agree with your brilliant idea.", "ja": "私はあなたの素晴らしいアイデアに完全に同意する。"},
  {"idx": 804, "en": "The old house was totally destroyed by fire.", "ja": "その古い家は火事で全く（完全に）破壊された。"},
  {"idx": 805, "en": "The rich man owns an extensive piece of land.", "ja": "その裕福な男性は広範な土地を所有している。"},
  {"idx": 806, "en": "Who will represent our country in the meeting?", "ja": "誰が会議で私たちの国を代表しますか？"},
  {"idx": 807, "en": "Did you receive my urgent message?", "ja": "私の緊急のメッセージを受け取りましたか？"},
  {"idx": 808, "en": "They employ over fifty people in the factory.", "ja": "彼らは工場で50人以上の人々を雇う。"},
  {"idx": 809, "en": "Please hang your wet coat in the closet.", "ja": "あなたの濡れたコートをクローゼットに掛けてください。"},
  {"idx": 810, "en": "You must understand the historical context.", "ja": "あなたは歴史的な文脈を理解しなければならない。"},
  {"idx": 811, "en": "Kyoto is famous for its beautiful temples.", "ja": "京都は美しい寺院で有名だ。"},
  {"idx": 812, "en": "His scientific theory is based on a false assumption.", "ja": "彼の科学的理論は誤った想定（仮説）に基づいている。"},
  {"idx": 813, "en": "They will charge you for the extra service.", "ja": "彼らは追加サービスに対してあなたに請求するだろう。"},
  {"idx": 814, "en": "Ancient Egyptian civilization is fascinating.", "ja": "古代エジプトの文明は魅力的だ。"},
  {"idx": 815, "en": "We provided medical aid to the poor village.", "ja": "私たちは貧しい村に医療の援助を提供した。"},
  {"idx": 816, "en": "The recent poll shows that the president is popular.", "ja": "最近の投票（世論調査）は、大統領が人気であることを示している。"},
  {"idx": 817, "en": "We need more scientific research on this disease.", "ja": "この病気についてもっと科学の研究が必要だ。"},
  {"idx": 818, "en": "It is my great pleasure to introduce the speaker.", "ja": "話者を紹介することは私の大きな喜びだ。"},
  {"idx": 819, "en": "Cats generally dislike cold water.", "ja": "猫は一般的に冷たい水を嫌がる。"},
  {"idx": 820, "en": "We must protect the natural environment.", "ja": "私たちは自然の環境を守らなければならない。"},
  {"idx": 821, "en": "He bought a beautiful necklace for his girlfriend.", "ja": "彼は女友達（恋人）のために美しいネックレスを買った。"},
  {"idx": 822, "en": "We drove along the beautiful west coast.", "ja": "私たちは美しい西の海岸（沿岸地域）に沿ってドライブした。"},
  {"idx": 823, "en": "Darwin studied the evolution of animals.", "ja": "ダーウィンは動物の進化について研究した。"},
  {"idx": 824, "en": "I cannot recall his long difficult name.", "ja": "彼の長くて難しい名前を呼び戻す（思い出す）ことができない。"},
  {"idx": 825, "en": "They signed a peace agreement yesterday.", "ja": "彼らは昨日、平和の同意（協定）に署名した。"},
  {"idx": 826, "en": "This is the largest county in the state.", "ja": "これはその州で最も大きな郡（州）だ。"},
  {"idx": 827, "en": "The whole nation celebrated the great victory.", "ja": "国家全体がその偉大な勝利を祝った。"},
  {"idx": 828, "en": "We must negotiate a better deal with them.", "ja": "私たちは彼らともっと良い取引を交渉しなければならない。"},
  {"idx": 829, "en": "The lake has a maximum depth of 50 meters.", "ja": "その湖の最大の深さは50メートルだ。"},
  {"idx": 830, "en": "He wants to become a professional musician.", "ja": "彼はプロの音楽家になりたいと考えている。"},
  {"idx": 831, "en": "Global warming is a serious threat to the world.", "ja": "地球温暖化は世界への深刻な脅威だ。"},
  {"idx": 832, "en": "The internet transformed the way we live.", "ja": "インターネットは私たちの生き方を変えた。"},
  {"idx": 833, "en": "What is the best method to learn English?", "ja": "英語を学ぶ最良の方法は何ですか？"},
  {"idx": 834, "en": "The criminal was sent to jail for ten years.", "ja": "その犯罪者は10年間刑務所（拘置所）に送られた。"},
  {"idx": 835, "en": "She studies modern history at the university.", "ja": "彼女は大学で現代の歴史を学んでいる。"},
  {"idx": 836, "en": "They found some primitive tools in the cave.", "ja": "彼らは洞窟でいくつかの原始的な道具を見つけた。"},
  {"idx": 837, "en": "A beautiful butterfly emerged from the cocoon.", "ja": "美しい蝶が繭から現れた。"},
  {"idx": 838, "en": "Regular exercise improves your physical health.", "ja": "定期的な運動はあなたの身体の（肉体の）健康を改善する。"},
  {"idx": 839, "en": "Some information on the internet is completely false.", "ja": "インターネット上のいくつかの情報は完全に誤ったものだ。"},
  {"idx": 840, "en": "Please highlight the important words in the text.", "ja": "テキストの中の重要な単語を目立たせて（強調して）ください。"},
  {"idx": 841, "en": "Can you estimate the total cost of the project?", "ja": "プロジェクトの総費用を推定する（評価する）ことはできますか？"},
  {"idx": 842, "en": "He gave a reasonable answer to the problem.", "ja": "彼はその問題に対して理性の（筋の通った）答えを与えた。"},
  {"idx": 843, "en": "We need a more efficient way to produce energy.", "ja": "私たちはエネルギーを生産するためのより効率のいい方法を必要としている。"},
  {"idx": 844, "en": "She took the initiative in organizing the event.", "ja": "彼女はそのイベントを組織することにおいて主導権（独創力）を握った。"},
  {"idx": 845, "en": "I chose this restaurant on his recommendation.", "ja": "私は彼の推薦でこのレストランを選んだ。"},
  {"idx": 846, "en": "Everything went according to our original plan.", "ja": "すべては私たちの当初の計画による（準じて）ものだった。"},
  {"idx": 847, "en": "I completely understand the implication of your words.", "ja": "私はあなたの言葉の含み（裏の意味）を完全に理解している。"},
  {"idx": 848, "en": "He seldom goes out at night because he is tired.", "ja": "彼は疲れているのでめったに夜外出しない。"},
  {"idx": 849, "en": "The pregnant woman sat softly on the bus seat.", "ja": "妊娠している女性がバスの座席に座った。"},
  {"idx": 850, "en": "We must build a peaceful and fair global society.", "ja": "私たちは平和で公正なグローバル社会を築かなければならない。"},
  {"idx": 851, "en": "Take a deep breath and quickly relax yourself.", "ja": "深呼吸（息）をして、すぐにリラックスしなさい。"},
  {"idx": 852, "en": "He is a fair and fiercely generous employer.", "ja": "彼は公平で寛大な雇用者だ。"},
  {"idx": 853, "en": "The company spends a lot of money on advertising.", "ja": "その会社は広告にたくさんのお金を費やしている。"},
  {"idx": 854, "en": "The laboratory has the latest scientific equipment.", "ja": "その研究所には最新の科学的設備（装置）がある。"},
  {"idx": 855, "en": "The universe is endlessly expanding every minute.", "ja": "宇宙は毎分絶え間なく拡大している。"},
  {"idx": 856, "en": "This new room is a great addition to the house.", "ja": "この新しい部屋は家への素晴らしい追加だ。"},
  {"idx": 857, "en": "The bright stars are clearly visible in the dark night sky.", "ja": "明るい星が暗い夜空に目に見えるように輝いている。"},
  {"idx": 858, "en": "In my honest opinion, that's a terribly bad idea.", "ja": "私の正直な意見（考え）では、それはひどく悪いアイデアだ。"},
  {"idx": 859, "en": "I must politely decline your kind invitation to the party.", "ja": "私はパーティーへのあなたの親切な招待を礼儀正しく断ら（拒否）なければならない。"},
  {"idx": 860, "en": "A male lion fiercely intensely protects its family.", "ja": "雄（男性）のライオンは猛烈に家族を守る。"},
  {"idx": 861, "en": "We must finish this difficult task somehow by tomorrow.", "ja": "私たちは明日までにどうにかこの難しい仕事を終えなければならない。"},
  {"idx": 862, "en": "That dark blue color really suits you beautifully.", "ja": "その濃い青色は本当にあなたに美しく適合する（似合う）。"},
  {"idx": 863, "en": "I dramatically prefer the latter half of the long movie.", "ja": "私は長い映画の後半（後者）の方が断然好みだ。"},
  {"idx": 864, "en": "It was not merely remarkably a joke; it was entirely serious.", "ja": "それは単なる冗談ではなく、全く深刻なものだった。"},
  {"idx": 865, "en": "Don't falsely judge people softly by their outward appearance.", "ja": "外的な出現（外見）で人を判断してはいけない。"},
  {"idx": 866, "en": "It was a fairly cold snowy morning today.", "ja": "今日はかなり冷え込んだ雪の朝だった。"},
  {"idx": 867, "en": "I have thoroughly completely read the first chapter of the book.", "ja": "私はその本の最初の章（区切り）をすっかり読んだ。"},
  {"idx": 868, "en": "They live peacefully smoothly in a nearby large town.", "ja": "彼らは近くの大きな町に平和に住んでいる。"},
  {"idx": 869, "en": "The angry men couldn't fairly securely settle the dispute.", "ja": "怒った男たちは公平に争いを決着させる（解決する）ことができなかった。"},
  {"idx": 870, "en": "Everyone generously willingly contributed to the local charity.", "ja": "全員が地元の慈善団体に寛大に寄付した（捧げた）。"},
  {"idx": 871, "en": "She enjoys actively safely studying various foreign languages.", "ja": "彼女は活発に安全にいろいろな外国の言語を学ぶのを楽しんでいる。"},
  {"idx": 872, "en": "Please generously warmly extend my best deepest wishes to him.", "ja": "彼に私の最高の深い願いを延ばして（伝えて）ください。"},
  {"idx": 873, "en": "The strict company strongly adopted a completely totally new policy.", "ja": "その厳しい会社は全く新しい政策（方針）を強く採用した。"},
  {"idx": 874, "en": "He couldn't bravely gently cope with the tremendous extreme stress.", "ja": "彼はものすごいストレスに勇気を持って対処することができなかった。"},
  {"idx": 875, "en": "Freedom of religion is truly firmly absolutely important.", "ja": "宗教（信仰）の自由は本当に絶対に重要だ。"},
  {"idx": 876, "en": "What was the final logical satisfying conclusion of your deep research?", "ja": "あなたの深い研究の最終的な論理的で満足のいく結論は何でしたか？"},
  {"idx": 877, "en": "The cute sick dog essentially desperately needs proper medical treatment.", "ja": "その可愛くて病気の犬は根本的に適切な医療の扱い（処理）を必要としている。"},
  {"idx": 878, "en": "We had absolutely seemingly no realistic alternative but to patiently quietly wait.", "ja": "私たちはただ静かに待つ以外に現実的な代替物（代案）が全くないようだった。"},
  {"idx": 879, "en": "Please slowly correctly securely write your precise accurate name on the reverse side.", "ja": "裏側の（反対の）面にあなたの正確な名前を書いてください。"},
  {"idx": 880, "en": "He is clearly loudly widely known as a brilliant former professional famous tennis player.", "ja": "彼は素晴らしい前の（かつての）有名なプロテニスプレイヤーとして広く知られている。"}
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
