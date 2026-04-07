const xlsx = require('xlsx');
const fs = require('fs');

const filePath = String.raw`C:\Users\makoto\Documents\GitHub\VocabularyBase\単語リスト\出題頻度順リストのみ_英検英単語.xlsx`;
const outPath = filePath.replace('.xlsx', '_updated.xlsx');
const targetFile = fs.existsSync(outPath) ? outPath : filePath;

const generatedData = [
  {"idx": 581, "en": "The overall situation is getting better.", "ja": "全体的な状況は良くなっている。"},
  {"idx": 582, "en": "It is a Japanese custom to bow.", "ja": "お辞儀をするのは日本の習慣だ。"},
  {"idx": 583, "en": "The ball began to roll down the hill.", "ja": "ボールは丘を転がり始めた。"},
  {"idx": 584, "en": "Too much exposure to the sun is bad for the skin.", "ja": "太陽への過度な暴露（さらすこと）は肌に悪い。"},
  {"idx": 585, "en": "He used a difficult medical term.", "ja": "彼は難しい医療の専門用語を使った。"},
  {"idx": 586, "en": "The car industry is growing rapidly.", "ja": "自動車産業は急激に成長している。"},
  {"idx": 587, "en": "Hurry up; otherwise you will be late.", "ja": "急ぎなさい、さもなければ遅れますよ。"},
  {"idx": 588, "en": "I received an electronic mail from him.", "ja": "彼から電子メールを受け取った。"},
  {"idx": 589, "en": "I am very proud of my son.", "ja": "私は息子をとても自慢に思っている。"},
  {"idx": 590, "en": "He finished the difficult task in an hour.", "ja": "彼はその難しい仕事を1時間で終えた。"},
  {"idx": 591, "en": "This game requires deep concentration.", "ja": "このゲームは深い集中を必要とする。"},
  {"idx": 592, "en": "They had a long debate about the issue.", "ja": "彼らはその問題について長い討論をした。"},
  {"idx": 593, "en": "I strongly suggest we leave early.", "ja": "私たちは早く出発することを提案する。"},
  {"idx": 594, "en": "She derived great pleasure from reading.", "ja": "彼女は読書から大きな喜びを引き出す。"},
  {"idx": 595, "en": "He was cutting the grass on the lawn.", "ja": "彼は芝生の上で草を刈っていた。"},
  {"idx": 596, "en": "Mozart composed many beautiful pieces.", "ja": "モーツァルトは多くの美しい曲を作曲した。"},
  {"idx": 597, "en": "How will the dog react to the stranger?", "ja": "犬は見知らぬ人にどう反応するだろうか？"},
  {"idx": 598, "en": "A large proportion of the students are girls.", "ja": "生徒の大部分（大きな割合）が女の子である。"},
  {"idx": 599, "en": "I am confident that we will win.", "ja": "私は私たちが勝つと自信を持っている。"},
  {"idx": 600, "en": "He works for a manufacturing company.", "ja": "彼は製造している会社（製造業）で働いている。"},
  {"idx": 601, "en": "If you multiple three by four, you get twelve.", "ja": "3と4を掛け算すると12になる。"},
  {"idx": 602, "en": "He placed his clothes in the large chest.", "ja": "彼は大きなチェスト（たんす）に服を入れた。"},
  {"idx": 603, "en": "The police have the authority to arrest criminals.", "ja": "警察には犯罪者を逮捕する権威（権力）がある。"},
  {"idx": 604, "en": "The forest is full of beautiful creatures.", "ja": "森は美しい生き物でいっぱいだ。"},
  {"idx": 605, "en": "She was wearing a beautiful red dress.", "ja": "彼女は美しい赤いドレスを身に着けていた。"},
  {"idx": 606, "en": "I swear that I will tell the truth.", "ja": "私は真実を話すことを誓う。"},
  {"idx": 607, "en": "Water is necessary for our survival.", "ja": "水は私たちの生存に必要だ。"},
  {"idx": 608, "en": "She is a very attractive young woman.", "ja": "彼女はとても魅力的な若い女性だ。"},
  {"idx": 609, "en": "The workers formed a labor union.", "ja": "労働者たちは労働組合（一致）を結成した。"},
  {"idx": 610, "en": "The prisoner escaped from the dark jail.", "ja": "囚人は暗い刑務所から逃げ出した。"},
  {"idx": 611, "en": "He has very poor sight without glasses.", "ja": "彼は眼鏡がないと視力がとても悪い。"},
  {"idx": 612, "en": "The reporter exposed the hidden secret.", "ja": "記者は隠された秘密を明らかにした。"},
  {"idx": 613, "en": "He was ill, and therefore could not come.", "ja": "彼は病気だった、それゆえ来ることができなかった。"},
  {"idx": 614, "en": "The strict prosecutor questioned the suspect.", "ja": "厳しい検察官は容疑者に質問した。"},
  {"idx": 615, "en": "Everyone was present at the morning meeting.", "ja": "朝の会議には全員が出席していた。"},
  {"idx": 616, "en": "This new publication is for children.", "ja": "この新しい出版物は子ども向けだ。"},
  {"idx": 617, "en": "The movie was so dull that I fell asleep.", "ja": "映画はとても面白みのないものだったので私は眠ってしまった。"},
  {"idx": 618, "en": "You must consider every aspect of the problem.", "ja": "その問題のあらゆる側面を考慮しなければならない。"},
  {"idx": 619, "en": "I asked my teacher for some good advice.", "ja": "先生にいくつかの良い助言を求めた。"},
  {"idx": 620, "en": "The judge made a perfectly fair decision.", "ja": "裁判官は完全に公平な決定を下した。"},
  {"idx": 621, "en": "I traveled from London to Paris via train.", "ja": "私はロンドンからパリまで列車経由で旅した。"},
  {"idx": 622, "en": "He was elected as the mayor of the town.", "ja": "彼は町の町長として選ばれた。"},
  {"idx": 623, "en": "Don't lose your important keys.", "ja": "重要な鍵を失わないで。"},
  {"idx": 624, "en": "In my judgement, he is the best player.", "ja": "私の判断では、彼が最高の選手だ。"},
  {"idx": 625, "en": "He is an observer of the United Nations.", "ja": "彼は国連の観察者だ。"},
  {"idx": 626, "en": "English is my mother tongue.", "ja": "英語は私の母語（言葉）だ。"},
  {"idx": 627, "en": "The defendant denied stealing the valuable watch.", "ja": "被告人は高価な時計を盗んだことを否定した。"},
  {"idx": 628, "en": "She doesn't know how to handle the machine.", "ja": "彼女はその機械の扱い方（対処の仕方）を知らない。"},
  {"idx": 629, "en": "Trust is an important component of friendship.", "ja": "信頼は友情の重要な成分（要素）だ。"},
  {"idx": 630, "en": "The president declared war on the enemy.", "ja": "大統領は敵に対して戦争を宣言した。"},
  {"idx": 631, "en": "He tried to squeeze fresh lemon juice.", "ja": "彼は新鮮なレモン果汁を絞ろうとした。"},
  {"idx": 632, "en": "You must maintain a healthy diet.", "ja": "あなたは健康的な食事を維持しなければならない。"},
  {"idx": 633, "en": "Read the first passage of the book.", "ja": "その本の最初の一節を読みなさい。"},
  {"idx": 634, "en": "Black coffee is too bitter for me.", "ja": "ブラックコーヒーは私には苦すぎる。"},
  {"idx": 635, "en": "To whom did you send the letter?", "ja": "あなたは誰にその手紙を送りましたか？"},
  {"idx": 636, "en": "They split the strong wood with an axe.", "ja": "彼らは斧で強い木を割った。"},
  {"idx": 637, "en": "He is highly capable of doing the job.", "ja": "彼はその仕事をする才能（可能性）が十分にある。"},
  {"idx": 638, "en": "It is a bad habit to bite your nails.", "ja": "爪を噛むのは悪い習慣だ。"},
  {"idx": 639, "en": "Give me a concrete example of the plan.", "ja": "その計画の具体的な例を私に教えて。"},
  {"idx": 640, "en": "I will eat the remaining slice of pizza.", "ja": "私は残りのピザの1切れを食べるつもりだ。"},
  {"idx": 641, "en": "Everything depends on the sunny weather.", "ja": "すべては晴れた天気に依存する（次第だ）。"},
  {"idx": 642, "en": "He is still dependent on his kind parents.", "ja": "彼はまだ優しい両親に依存している。"},
  {"idx": 643, "en": "I woke up early so that I wouldn't be late.", "ja": "私は遅刻しないように（とても…なので）早く起きた。"},
  {"idx": 644, "en": "They argued about where to go for dinner.", "ja": "彼らは夕食にどこへ行くかで感情的に論じた。"},
  {"idx": 645, "en": "He must accept the consequence of his actions.", "ja": "彼は自分の行動の結果を受け入れなければならない。"},
  {"idx": 646, "en": "We are waiting for the final outcome.", "ja": "私たちは最終的な結果を待っている。"},
  {"idx": 647, "en": "Kyoto has a rich cultural heritage.", "ja": "京都は豊かな文化的な遺産を持っている。"},
  {"idx": 648, "en": "The government banned smoking in public places.", "ja": "政府は公共の場での喫煙を禁止した。"},
  {"idx": 649, "en": "The dog ran happily toward its master.", "ja": "犬は主人に向かって嬉しそうに走った。"},
  {"idx": 650, "en": "A whale is a biological relative of a dolphin.", "ja": "鯨はイルカの生物学上の親戚だ。"},
  {"idx": 651, "en": "The young voters supported the new politician.", "ja": "若い投票者たちはその新しい政治家を支持した。"},
  {"idx": 652, "en": "We enjoyed the beautiful landscape of mountains.", "ja": "私たちは山の美しい風景を楽しんだ。"},
  {"idx": 653, "en": "Wait just a moment, please.", "ja": "ほんの瞬間（少し）待ってください。"},
  {"idx": 654, "en": "I go to the movie theater occasionally.", "ja": "私は時折映画館に行きます。"},
  {"idx": 655, "en": "This big bag is very practical for travel.", "ja": "この大きなバッグは旅行にとても実用的だ。"},
  {"idx": 656, "en": "Please wipe the dirty table with a wet cloth.", "ja": "汚れたテーブルを濡れた布で拭いてください。"},
  {"idx": 657, "en": "The country has a long tradition of making wine.", "ja": "その国にはワイン作りの長い伝統がある。"},
  {"idx": 658, "en": "It is an important affair for the family.", "ja": "それは家族にとって重要な事柄だ。"},
  {"idx": 659, "en": "He received a huge reward for finding the dog.", "ja": "彼は犬を見つけたことで莫大な報酬を受け取った。"},
  {"idx": 660, "en": "She won the first prize award in the contest.", "ja": "彼女はコンテストで一等賞を獲得した。"},
  {"idx": 661, "en": "What is the main purpose of your important visit?", "ja": "あなたの重要な訪問の主な目的は何ですか？"},
  {"idx": 662, "en": "They gathered around the warm fire.", "ja": "彼らは暖かい火の周りに集まった。"},
  {"idx": 663, "en": "You should show deep respect to your parents.", "ja": "あなたは両親に深い尊敬を示すべきだ。"},
  {"idx": 664, "en": "The company advertised its new modern products.", "ja": "その会社は新しい現代的な製品を宣伝した。"},
  {"idx": 665, "en": "It stopped raining, and the sun eventually came out.", "ja": "雨が止み、結局は（やがて）太陽が現れた。"},
  {"idx": 666, "en": "We need his strong approval before we start.", "ja": "始める前に彼の強力な承認が必要だ。"},
  {"idx": 667, "en": "They finally reached the top of the mountain.", "ja": "彼らはついに山の頂上に到着した。"},
  {"idx": 668, "en": "She is deeply afraid of large spiders.", "ja": "彼女は大きなクモを深く恐れている。"},
  {"idx": 669, "en": "The tall commercial building is located in the city center.", "ja": "その高い商業の建物は街の中心に位置している。"},
  {"idx": 670, "en": "Smoking is seriously harmful to your delicate health.", "ja": "喫煙はあなたの繊細な健康に真剣に有害だ。"},
  {"idx": 671, "en": "Do you have any practical suggestion for this problem?", "ja": "この問題についての何か実用的な提案はありますか？"},
  {"idx": 672, "en": "There is a sharp contrast between the two brothers.", "ja": "その二人の兄弟には鋭い対照がある。"},
  {"idx": 673, "en": "The old train was powered by burning coal.", "ja": "その古い列車は石炭を燃やすことによって動いていた。"},
  {"idx": 674, "en": "The company has its main headquarters in Tokyo.", "ja": "その会社は主な本部を東京に置いている。"},
  {"idx": 675, "en": "Plants absorb useful water from the wet soil.", "ja": "植物は濡れた土から有用な水を吸収する。"},
  {"idx": 676, "en": "They accepted my interesting proposal without hesitation.", "ja": "彼らは私の興味深い提案をためらうことなく受け入れた。"},
  {"idx": 677, "en": "A smart consumer knows how to save precious money.", "ja": "賢い消費者は貴重なお金を節約する方法を知っている。"},
  {"idx": 678, "en": "We visited many historic famous places in Kyoto.", "ja": "私たちは京都の多くの由緒ある（歴史に残る）有名な場所を訪れた。"},
  {"idx": 679, "en": "He decided to pursue a medical career.", "ja": "彼は医療の経歴を追い求めることに決めた。"},
  {"idx": 680, "en": "This serious problem needs immediate careful action.", "ja": "この深刻な問題は即座の注意深い行動を必要とする。"}
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
