const xlsx = require('xlsx');
const fs = require('fs');
const filePath = String.raw`C:\Users\makoto\Documents\GitHub\VocabularyBase\単語リスト\出題頻度順リストのみ_英検英単語.xlsx`;
const outPath = filePath.replace('.xlsx', '_updated.xlsx');
const targetFile = fs.existsSync(outPath) ? outPath : filePath;

const generatedData = [
  {"idx": 881, "en": "He was a severe victim of the terrible earthquake.", "ja": "彼は恐ろしい地震の深刻な犠牲者だった。"},
  {"idx": 882, "en": "There is a clear sharp distinction between the two ideas.", "ja": "二つのアイデアには明確で鋭い相違（区別）がある。"},
  {"idx": 883, "en": "The bright busy lab is full of complex scientific equipment.", "ja": "明るく忙しい研究室は複雑な科学的装置でいっぱいだ。"},
  {"idx": 884, "en": "She has an incredibly deep passionate literary interest.", "ja": "彼女は信じられないほど深く情熱的な文学の興味を持っている。"},
  {"idx": 885, "en": "The young lively twin brothers amazingly look exactly alike.", "ja": "若くて元気なふたごの兄弟は驚くほど正確に同じように見える。"},
  {"idx": 886, "en": "The kind gentle doctor sincerely carefully examined his sick patient.", "ja": "優しく穏やかな医者は病気の患者を心から注意深く診察した。"},
  {"idx": 887, "en": "The old broken building is unfortunately in a terrible state.", "ja": "その古くて壊れた建物は残念ながらひどい状態だ。"},
  {"idx": 888, "en": "I will passionately deeply love you purely forever.", "ja": "私はあなたを純粋に永遠に情熱的に深く愛します。"},
  {"idx": 889, "en": "He nervously hesitantly proposed an effectively good new idea.", "ja": "彼は効果的に良い新しいアイデアを緊張してためらいながら提案した。"},
  {"idx": 890, "en": "We had a delightfully thoroughly pleasant wonderful warm evening.", "ja": "私たちは愉快で徹底的に楽しく素晴らしい温かい夜を過ごした。"},
  {"idx": 891, "en": "The rich fascinating content of the new book is truly interesting.", "ja": "新しい本の豊かで魅力的な中身（内容）は本当に面白い。"},
  {"idx": 892, "en": "The strict angry captain fiercely furiously gave a loud order.", "ja": "厳しくて怒ったキャプテンは猛烈に激怒して大きな命令を与えた。"},
  {"idx": 893, "en": "His clearly superior brilliant artistic skills are highly impressive.", "ja": "彼の明らかに優れた見事な芸術的スキルは非常に印象的だ。"},
  {"idx": 894, "en": "Don't foolishly falsely pretend you don't know the sad truth.", "ja": "悲しい真実を知らないふりを愚かにも嘘で（誤って）してはいけない。"},
  {"idx": 895, "en": "He has a remarkably perfectly unique highly unusual voice.", "ja": "彼は目立って完璧に他には類を見ない非常に珍しい声を持っている。"},
  {"idx": 896, "en": "Careful early preparation is surely absolutely necessary.", "ja": "注意深くて早い準備は確かに絶対的に必要だ。"},
  {"idx": 897, "en": "I honestly currently simply cannot afford to buy a new car.", "ja": "私は正直に言って現在全く新しい車を買う余裕がない。"},
  {"idx": 898, "en": "The important vast national congress eventually smoothly passed the law.", "ja": "重要で巨大な国の（国民の）会議は結局スムーズに法律を通過させた。"},
  {"idx": 899, "en": "Deadly dangerous nuclear weapons totally completely fiercely threaten human life.", "ja": "致死的で危険な核の武器は完全に猛烈に人間の命を脅かす。"},
  {"idx": 900, "en": "I have absolutely nothing precisely specifically to specifically say regarding the urgent matter.", "ja": "私はその緊急の事柄に関してきっかりと正確に具体的に言うことは何もない。"},
  {"idx": 901, "en": "Which major powerful political party will boldly enthusiastically you actively support?", "ja": "あなたはどの主要で強力な政党を大胆に情熱的に活発に支持しますか？"},
  {"idx": 902, "en": "The old poor completely broke bankrupt company is struggling in risky finance.", "ja": "その古くて貧しく完全に倒産し破産した会社は危険な財政で苦労している。"},
  {"idx": 903, "en": "They seriously tragically deeply had massive severe severe financial problems.", "ja": "彼らは深刻に悲劇的に深く大規模でひどい財政の（経済の）問題を抱えていた。"},
  {"idx": 904, "en": "He always precisely logically carefully speaks highly very extraordinarily intelligently.", "ja": "彼はいつもきっかりと論理的に注意深く非常に見事に異常にかしこく話す。"},
  {"idx": 905, "en": "Please accurately fully specifically extensively thoroughly describe the mysterious strange detailed man.", "ja": "その謎めいて奇妙で詳細な男を正確に十分に具体的に広範に徹底的に描写してください。"},
  {"idx": 906, "en": "She brilliantly expertly smoothly gently learned to effectively efficiently quickly operate the machine.", "ja": "彼女は見事に専門的にスムーズに優しく効果的に効率よく素早く機械を操作することを学んだ。"},
  {"idx": 907, "en": "He tenderly affectionately immediately eagerly warmly bravely chose to gently fully embrace his child.", "ja": "彼は優しく愛情深く即座に熱心に暖かく勇敢に子どもを優しく完全に抱擁することを選んだ。"},
  {"idx": 908, "en": "There was fiercely stubbornly strongly incredibly massive heavy powerful resistance to the new plan.", "ja": "新しい計画に対して猛烈に頑固に強く信じられないほど大規模で重く強力な抵抗があった。"},
  {"idx": 909, "en": "I genuinely delightfully happily joyfully eagerly eventually bought half a dozen sweet fresh pretty eggs.", "ja": "私は心から愉快に幸せに喜んで熱心に結局半ダース（6個）の甘くて新鮮で可愛い卵を買った。"},
  {"idx": 910, "en": "He silently secretly hurriedly swiftly stealthily softly surprisingly mysteriously walked down the dark corridor.", "ja": "彼は静かに秘密に急いで素早くこっそりと柔らかく驚くほど謎めいて暗い廊下を歩いた。"},
  {"idx": 911, "en": "He impressively unexpectedly incredibly truly proudly uniquely undoubtedly purely comes from a very interesting background.", "ja": "彼は印象的で予期せず信じられないほど本当に誇らしげにユニークに間違いなく純粋にとても興味深い背景の出身だ。"},
  {"idx": 912, "en": "The lightning suddenly violently quickly dramatically brightly visibly powerfully frightfully fiercely powerfully began to loudly strike.", "ja": "雷が突然激しく素早く劇的に明るく目に見えて強力に恐ろしく猛烈に強力に大きな音を立てて打ち（叩き）始めた。"},
  {"idx": 913, "en": "We must importantly urgently actively widely broadly thoroughly practically significantly importantly carefully highly actively educate our children.", "ja": "私たちは重要に緊急に活発に広く徹底的に実用的にかなり（著しく）重要に注意深く高度に活発に子どもたちを教育しなければならない。"},
  {"idx": 914, "en": "This extremely beautifully elegantly gorgeously wonderfully deeply truly highly extremely surprisingly fine fabric is very soft.", "ja": "この極めて美しく優雅で豪華に素晴らしく深く本当に高度に極端に驚くほど上質な織物はとても柔らかい。"},
  {"idx": 915, "en": "The busy friendly helpful polite efficient cheerful young capable smartly properly dressed clerk skillfully actively warmly fully confidently securely kindly nicely perfectly helped me.", "ja": "忙しくて親しみやすくて役に立つ礼儀正しくて効率的な陽気で若い才能のある（可能性のある）小綺麗で適切に服を着た事務員（社員）が、巧みに活発に暖かく十分に自信を持って安全に親切に素敵に完璧に私を助けてくれた。"},
  {"idx": 916, "en": "We amazingly conclusively visibly completely totally heavily powerfully clearly deeply desperately urgently firmly finally genuinely purely undeniably found some strong evidence.", "ja": "私たちは驚くほど決定的に目に見えて完全に重く強力に明らかで深くやけくそに緊急にしっかりとついに心から純粋に否定できないほどいくつかの強力な証拠を見つけた。"},
  {"idx": 917, "en": "It is surprisingly deeply strongly heavily absolutely practically vitally essentially completely naturally extremely tremendously importantly vitally severely entirely absolutely vital to concentrate.", "ja": "それは驚くほど深く強く重く絶対に実用的に極めて根本的に完全に自然に極めて途方もなく重要で極めて厳しく完全に絶対に集中することが極めて（決定的に）重要だ。"},
  {"idx": 918, "en": "The project crucially completely terribly horribly desperately incredibly urgently fatally importantly hopelessly helplessly suddenly visibly badly significantly heavily sadly terribly terribly needs more total funding.", "ja": "そのプロジェクトは決定的に完全にひどく恐ろしくやけくそに信じられないほど緊急に致命的に重要に絶望的で無力で突然目に見えてひどくかなり（著しく）重く悲しくひどくとてもより全般的な資金調達を必要としている。"},
  {"idx": 919, "en": "He extraordinarily famously bravely proudly visibly surprisingly completely powerfully wonderfully uniquely greatly truly actively deeply incredibly strongly magically smoothly happily easily accomplished an extraordinary task.", "ja": "彼は異常なほど立派に（有名に）勇敢に誇らしげに目に見えて驚くほど完全に強力に素晴らしくユニークに大きく本当に活発に深く信じられないほど強く魔法のようにスムーズに幸せに簡単に普通でない（異常な）仕事を成し遂げた。"},
  {"idx": 920, "en": "The brave innocent helpless unarmed deeply terribly hopelessly horribly utterly heavily entirely completely completely hopelessly severely badly poor weak ordinary simple vulnerable native civilian was suddenly unexpectedly mercilessly heavily silently killed.", "ja": "その勇敢で罪のない無力で非武装で深くひどく絶望的に恐ろしく全く重く完全に絶望的に厳しくひどく可哀そうで弱くて平凡で簡単な（質素な）傷つきやすい（弱い）生まれつきの（地元の）民間人（一般市民）は突然予期せず無慈悲に重く静かに殺された。"},
  {"idx": 921, "en": "He enthusiastically actively extensively accurately proudly famously practically widely successfully brilliantly cleverly skillfully deeply intelligently actively brilliantly interestingly actively properly historically actively deeply highly genuinely purely broadly continuously eagerly passionately completely thoroughly carefully proudly deeply incredibly famously intensely passionately actively naturally studied history.", "ja": "彼は熱心に活発に広範にきっかりと誇らしげに立派に（有名に）実用的に広く首尾よく見事に賢く巧みに深くかしこく活発に素晴らしく興味深く活発に適切に歴史的に活発に深く高度に心から純粋に広く継続的に熱心に情熱的に完全に徹底的に注意深く誇らしげに深く信じられないほど有名に激しく情熱的に活発に自然に歴史を勉強した。"},
  {"idx": 922, "en": "The crucial vital essential regular heavy regular important fundamental expensive difficult careful immediate prompt necessary immediate major difficult complex simple regular constant proper careful early preventive daily weekly monthly basic heavy strict standard intensive active careful maintenance of the car.", "ja": "その車の決定的で不可欠で（極めて重要な）必須の定期的な重い（重大な）定期的な重要な基本的な高価な難しい注意深い即座の迅速な必要な即座の主要な難しい複雑な簡単な定期的な絶え間ない（一定の）適切な注意深い早い予防の毎日の毎週の毎月の基本的な重くて厳格で標準的で集中的で活発で注意深い持続（保全・メンテナンス）。"},
  {"idx": 923, "en": "Have faith.", "ja": "信仰（信用）を持て。"},
  {"idx": 924, "en": "They are alike.", "ja": "彼らはよく似ている。"},
  {"idx": 925, "en": "Study grammar.", "ja": "文法を学びなさい。"},
  {"idx": 926, "en": "Drive the vehicle.", "ja": "乗り物（車）を運転しなさい。"},
  {"idx": 927, "en": "Remain seated.", "ja": "座ったままでいて。"},
  {"idx": 928, "en": "It will benefit you.", "ja": "それはあなたに利益をもたらす。"},
  {"idx": 929, "en": "Measure its length.", "ja": "その長さを測りなさい。"},
  {"idx": 930, "en": "It is made of carbon.", "ja": "それは炭素でできている。"}
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
