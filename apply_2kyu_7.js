const xlsx = require('xlsx');
const fs = require('fs');
const filePath = String.raw`C:\Users\makoto\Documents\GitHub\VocabularyBase\単語リスト\出題頻度順リストのみ_英検英単語.xlsx`;
const outPath = filePath.replace('.xlsx', '_updated.xlsx');
const targetFile = fs.existsSync(outPath) ? outPath : filePath;

const data = [
  {r:601,en:"The museum is open every day except for Mondays.",ja:"その博物館は月曜日を除いては毎日開館している。"},
  {r:602,en:"It is just a matter of time before they find out.",ja:"彼らが気づくのも時間の問題だ。"},
  {r:603,en:"The new law will be in effect from next month.",ja:"新しい法律は来月から効力を持つ（効果がある）。"},
  {r:604,en:"Long skirts are back in fashion this year.",ja:"今年はロングスカートが再び流行している。"},
  {r:605,en:"You can watch movies on demand on this channel.",ja:"このチャンネルでは要求に応じて（いつでも好きなときに）映画を見ることができる。"},
  {r:606,en:"The teacher gave individual attention to each student.",ja:"先生はそれぞれの生徒に個別の注意を払った。"},
  {r:607,en:"She can play the piano, and she can sing as well.",ja:"彼女はピアノが弾けるし、その上歌うこともできる。"},
  {r:608,en:"Public transportation in Tokyo is very convenient.",ja:"東京の公共交通機関はとても便利だ。"},
  {r:609,en:"In general, women live longer than men.",ja:"一般的に、女性は男性より長生きする。"},
  {r:610,en:"The flowers in the garden smell sweet.",ja:"庭の花は甘いにおいがする。"},
  {r:611,en:"I didn't recognize her at first because she cut her hair.",ja:"彼女が髪を切っていたので、最初は彼女だと分からなかった（はっきりと知らなかった）。"},
  {r:612,en:"It's hard to get rid of a bad habit.",ja:"悪い習慣を取り除くのは難しい。"},
  {r:613,en:"The patient received the best medical treatment.",ja:"その患者は最高の医学的な扱い（治療）を受けた。"},
  {r:614,en:"I cannot use this ticket because it is expired.",ja:"このチケットは期限切れなので使えません。"},
  {r:615,en:"You have to pay an entrance fee to enter the park.",ja:"公園に入るには入場料金を支払わなければならない。"},
  {r:616,en:"The current situation is very difficult.",ja:"現在の状況は非常に困難だ。"},
  {r:617,en:"I need to renew my passport before I travel abroad.",ja:"海外旅行に行く前にパスポートを更新する必要がある。"},
  {r:618,en:"I promise to study harder from now on.",ja:"これから先も、もっと一生懸命勉強すると約束します。"},
  {r:619,en:"Please attach a recent photograph to your application.",ja:"申込書には最近の写真を添えて（取り付けて）ください。"},
  {r:620,en:"Please fill out this form to apply for the job.",ja:"仕事に応募するために、この用紙に書き込んで（記入して）ください。"},
  {r:621,en:"His resignation was completely unexpected.",ja:"彼の辞任は全く意外なものだった。"},
  {r:622,en:"The country is facing a serious economic crisis.",ja:"その国は深刻な経済危機に直面している。"},
  {r:623,en:"Take a deep breath and relax.",ja:"深呼吸をしてリラックスしなさい。"},
  {r:624,en:"Plants absorb carbon dioxide and release oxygen.",ja:"植物は二酸化炭素を吸収し、酸素を放出する。"},
  {r:625,en:"The high humidity makes it feel much hotter.",ja:"高い湿度のせいでより暑く感じる。"},
  {r:626,en:"A doctor is on duty 24 hours a day at this hospital.",ja:"この病院では医師が24時間体制で当番をしている。"},
  {r:627,en:"Take an umbrella with you in case it rains.",ja:"雨が降った場合の万一に備えて傘を持っていきなさい。"},
  {r:628,en:"The weather is gradually getting warmer.",ja:"天気は次第に暖かくなっている。"},
  {r:629,en:"He painted the ceiling of his room white.",ja:"彼は自分の部屋の天井を白く塗った。"},
  {r:630,en:"This type of phone is completely out of use now.",ja:"このタイプの電話は今では完全にすたれてしまっている。"},
  {r:631,en:"There is a beautiful marble sculpture in the park.",ja:"公園には美しい大理石の彫刻がある。"},
  {r:632,en:"I don't know the exact time of his arrival.",ja:"私は彼が到着する正確な時間を知らない。"},
  {r:633,en:"The meeting will be held between 2 PM and 4 PM.",ja:"会議は午後2時と午後4時の間に開催されます。"},
  {r:634,en:"This region produces excellent wine.",ja:"この地域は素晴らしいワインを生産している。"},
  {r:635,en:"He went to work even though he felt sick.",ja:"彼は気分が悪かったのにも関わらず仕事に行った。"},
  {r:636,en:"The weather was warm and sunny yesterday.",ja:"昨日は天気が暖かく、晴れていた。"},
  {r:637,en:"What is inside this mysterious box?",ja:"この不思議な箱の内部（中身）は何ですか？"},
  {r:638,en:"She has been ill in bed for a week.",ja:"彼女は1週間、病気で寝込んでいる。"},
  {r:639,en:"I felt out of place at the formal party.",ja:"私はそのフォーマルなパーティーで場違いだと感じた。"},
  {r:640,en:"She is doing research on early childhood education.",ja:"彼女は幼児教育についての研究をしている。"},
  {r:641,en:"All of his relatives gathered for the wedding.",ja:"結婚式のために彼の親戚全員が集まった。"},
  {r:642,en:"Some snakes have deadly poison.",ja:"一部のヘビは致命的な毒を持っている。"},
  {r:643,en:"I completely forgot about the meeting.",ja:"私は会議のことを完全に忘れていた。"},
  {r:644,en:"This medicine is highly effective at relieving pain.",ja:"この薬は痛みを和らげるのに非常に効果的だ。"},
  {r:645,en:"Sponges absorb a lot of water.",ja:"スポンジはたくさんの水を吸収する。"},
  {r:646,en:"Don't forget to feed the dog before you leave.",ja:"出かける前に犬に餌を与えるのを忘れないで。"},
  {r:647,en:"Walking is an effective way to lose weight.",ja:"ウォーキングは体重を減らすための効果的な方法だ。"},
  {r:648,en:"Keep the food in a plastic container.",ja:"食べ物はプラスチックの容器に保存してください。"},
  {r:649,en:"Thanks to your help, I finished the project on time.",ja:"あなたの助けのおかげで、私はプロジェクトを時間通りに終わらせた。"},
  {r:650,en:"The criminal has been on the run for three days.",ja:"その犯人は3日間逃げている（逃走中だ）。"},
  {r:651,en:"She dedicated her life to helping the poor.",ja:"彼女は貧しい人々を助けることに人生を専念した。"},
  {r:652,en:"The family had to abandon their car in the snow.",ja:"その家族は雪の中で車を捨て去らなければならなかった。"},
  {r:653,en:"The clown amused the children with his funny tricks.",ja:"ピエロは面白い芸で子どもたちを楽しませた。"},
  {r:654,en:"The prices range from 10 to 50 dollars.",ja:"値段は10ドルから50ドルの範囲だ。"},
  {r:655,en:"The Earth is not a perfect sphere.",ja:"地球は完璧な球体ではない。"},
  {r:656,en:"He sought revenge for the insult.",ja:"彼は侮辱に対する復讐を求めた。"},
  {r:657,en:"The smartphone gained immense popularity in a short time.",ja:"そのスマートフォンは短期間で絶大な人気を得た。"},
  {r:658,en:"I saw a suspicious man near the bank.",ja:"私は銀行の近くで疑わしい男を見た。"},
  {r:659,en:"Please handle these delicate glasses carefully.",ja:"これらの繊細なグラスは注意して扱ってください。"},
  {r:660,en:"The government is trying to improve social welfare.",ja:"政府は社会福祉を向上させようとしている。"},
  {r:661,en:"We crossed the border between France and Spain.",ja:"私たちはフランスとスペインの国境を越えた。"},
  {r:662,en:"Biting his nails is a bad habit of his.",ja:"爪を噛むのは彼の悪い習慣だ。"},
  {r:663,en:"Please don't interrupt me while I'm speaking.",ja:"私が話している間に割り込まないでください。"},
  {r:664,en:"I tried to persuade him to change his mind.",ja:"私は彼の心を変えるよう彼を説得しようとした。"},
  {r:665,en:"The doctor examined my throat carefully.",ja:"医者は私の喉を注意深く検査した。"},
  {r:666,en:"We took a leisurely walk along the beach.",ja:"私たちは浜辺に沿ってのんびりした散歩をした。"},
  {r:667,en:"The soldiers fought bravely to defend their country.",ja:"兵士たちは国を守るために勇敢に戦った。"},
  {r:668,en:"The test was relatively easy compared to the last one.",ja:"そのテストは前回のものと比べて比較的簡単だった。"},
  {r:669,en:"You can substitute honey for sugar in this recipe.",ja:"このレシピでは砂糖の代用品としてハチミツを用いることができる。"},
  {r:670,en:"Please throw the banana peel in the trash.",ja:"バナナの皮はゴミ箱に捨ててください。"},
  {r:671,en:"Thank you for your warm hospitality during our stay.",ja:"滞在中のあなたの温かいおもてなしに感謝します。"},
  {r:672,en:"The airplane crash was a terrible tragedy.",ja:"その飛行機事故は恐ろしい悲劇だった。"},
  {r:673,en:"He is struggling with his math homework.",ja:"彼は数学の宿題に苦戦している。"},
  {r:674,en:"The teacher instructed the students to open their books.",ja:"先生は生徒たちに本を開くよう指示した。"},
  {r:675,en:"The children gathered seashells on the beach.",ja:"子どもたちは浜辺で貝殻を集めた。"},
  {r:676,en:"It took me a while to get used to my new job.",ja:"新しい仕事に慣れるのにしばらく時間がかかった。"},
  {r:677,en:"This map is completely out of date.",ja:"この地図は完全に時代遅れだ。"},
  {r:678,en:"This material is very tough and difficult to break.",ja:"この素材はとても強くて（丈夫で）壊れにくい。"},
  {r:679,en:"The project is already under way.",ja:"そのプロジェクトはすでに進行中だ。"},
  {r:680,en:"The new law came into being last year.",ja:"その新しい法律は昨年生じた（施行された）。"},
  {r:681,en:"The old building is in need of repair.",ja:"その古い建物は修理を必要としている。"},
  {r:682,en:"Are you aware of the risks involved in this project?",ja:"あなたはこのプロジェクトに伴うリスクに気づいていますか？"},
  {r:683,en:"I was at a loss for words when I heard the news.",ja:"そのニュースを聞いた時、私は（何と言っていいか分からず）途方に暮れた。"},
  {r:684,en:"Keep your goals within reach.",ja:"目標は手が届く範囲に保ちなさい。"},
  {r:685,en:"On average, women live longer than men.",ja:"平均して、女性は男性より長生きする。"},
  {r:686,en:"Our team won five games in a row.",ja:"私たちのチームは5試合連続で勝った。"},
  {r:687,en:"A strange man appeared at the door.",ja:"見知らぬ男がドアに現れた。"},
  {r:688,en:"Please do not hesitate to ask questions.",ja:"質問するのをためらわないでください。"},
  {r:689,en:"We are currently short of staff.",ja:"私たちは現在、スタッフが不足しています。"},
  {r:690,en:"Technology plays a major role in modern society.",ja:"テクノロジーは現代社会において主要な役割を果たしている。"},
  {r:691,en:"Solar power is an alternative to fossil fuels.",ja:"太陽光発電は化石燃料の代替物である。"},
  {r:692,en:"The country suffered from a long economic depression.",ja:"その国は長い経済的な不景気に苦しんだ。"},
  {r:693,en:"A large amount of money was stolen from the bank.",ja:"大量のお金が銀行から盗まれた。"},
  {r:694,en:"The dog was sleeping on the rug.",ja:"犬はじゅうたんの上で寝ていた。"},
  {r:695,en:"Who invented the telephone?",ja:"誰が電話を発明したのですか？"},
  {r:696,en:"My parents always encourage me to try new things.",ja:"両親はいつも私に新しいことに挑戦するよう勇気づけてくれる。"},
  {r:697,en:"He rarely goes to the movies.",ja:"彼はめったに映画に行かない。"},
  {r:698,en:"Some foods are hard to digest.",ja:"一部の食べ物は消化するのが難しい。"},
  {r:699,en:"You need to focus on your studies right now.",ja:"あなたは今すぐ勉強に焦点を合わせる（集中する）必要がある。"},
  {r:700,en:"I am concerned about my grandfather's health.",ja:"私は祖父の健康について気をかけている（心配している）。"},
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
  console.log(`Applied ${c} examples to 2級 (601-700). Saved.`);
}
main().catch(console.error);
