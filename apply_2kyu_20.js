const xlsx = require('xlsx');
const fs = require('fs');
const filePath = String.raw`C:\Users\makoto\Documents\GitHub\VocabularyBase\単語リスト\出題頻度順リストのみ_英検英単語.xlsx`;
const outPath = filePath.replace('.xlsx', '_updated.xlsx');
const targetFile = fs.existsSync(outPath) ? outPath : filePath;

const data = [
  {r:1901,en:"We are making preparations for the big party.",ja:"私たちは大きなパーティーのための準備をしている。"},
  {r:1902,en:"The police started a criminal investigation.",ja:"警察は犯罪調査を始めた。"},
  {r:1903,en:"This room is used for the storage of old furniture.",ja:"この部屋は古い家具の保管のために使われている。"},
  {r:1904,en:"Foreign investors are buying shares in the company.",ja:"外国の投資家がその会社の株を買っている。"},
  {r:1905,en:"He ate the whole cake by himself.",ja:"彼はケーキを全部一人で食べた。"},
  {r:1906,en:"The new safety regulations will start next month.",ja:"新しい安全規制は来月から始まる。"},
  {r:1907,en:"We need to improve the existing system.",ja:"私たちは既存のシステムを改善する必要がある。"},
  {r:1908,en:"Do you believe that our fate is already decided?",ja:"私たちの運命はすでに決まっていると信じますか？"},
  {r:1909,en:"He was accused of stealing the money.",ja:"彼はお金を盗んだとして告発された。"},
  {r:1910,en:"A strange flying object appeared in the sky.",ja:"奇妙な飛行物体が空に現れた。"},
  {r:1911,en:"It's hard to cope with so much stress.",ja:"これほど多くのストレスに対処するのは難しい。"},
  {r:1912,en:"The country has a long history of racial discrimination.",ja:"その国には人種差別の長い歴史がある。"},
  {r:1913,en:"You shouldn't judge people by their appearance.",ja:"外見で人を判断するべきではない。"},
  {r:1914,en:"I strongly disagree with your opinion.",ja:"私はあなたの意見に強く反対する。"},
  {r:1915,en:"They decided to release the birds into the wild.",ja:"彼らは鳥たちを野生に解き放つことを決めた。"},
  {r:1916,en:"He won a major literary award for his novel.",ja:"彼は小説で主要な文学賞を受賞した。"},
  {r:1917,en:"Maybe it will rain this afternoon.",ja:"たぶん今日の午後は雨が降るだろう。"},
  {r:1918,en:"The two countries formed a military alliance.",ja:"その二つの国は軍事同盟を結んだ。"},
  {r:1919,en:"I will give some thought to your proposal.",ja:"あなたの提案について少し考えて（考慮して）みます。"},
  {r:1920,en:"We watched a very funny comedy last night.",ja:"私たちは昨夜、とても面白い喜劇（コメディ映画）を見た。"},
  {r:1921,en:"She didn't reply to my email.",ja:"彼女は私のメールに返答しなかった。"},
  {r:1922,en:"He openly talked about his life as a gay man.",ja:"彼は同性愛の男性としての自分の生活について公然と話した。"},
  {r:1923,en:"We need a definite answer by tomorrow.",ja:"私たちは明日までに明確な答えを必要としている。"},
  {r:1924,en:"This is his second attempt to pass the exam.",ja:"これが彼がその試験に合格するための2回目の試みだ。"},
  {r:1925,en:"He gets a 10% commission on everything he sells.",ja:"彼は売ったものすべてに対して10%の手数料を受け取る。"},
  {r:1926,en:"The store is open every day except Sunday.",ja:"その店は日曜日を除いて毎日開いている。"},
  {r:1927,en:"What is the height of that building?",ja:"あの建物の高さはどれくらいですか？"},
  {r:1928,en:"Summer is my favorite season.",ja:"夏は私が特に好きな季節です。"},
  {r:1929,en:"Smoking is harmful to your health.",ja:"喫煙は健康に有害だ。"},
  {r:1930,en:"I had a terrible headache yesterday.",ja:"昨日はひどい頭痛がした。"},
  {r:1931,en:"The lecture was so dull that I almost fell asleep.",ja:"その講義はとても面白みがなくて、私は危うく眠りそうになった。"},
  {r:1932,en:"You have to guess the meaning from the context.",ja:"文脈から意味を推測しなければならない。"},
  {r:1933,en:"He folded the letter and put it in the envelope.",ja:"彼は手紙を折りたたんで封筒に入れた。"},
  {r:1934,en:"Thank you for your helpful suggestion.",ja:"役に立つ提案をありがとう。"},
  {r:1935,en:"Steam was rising from the hot soup.",ja:"熱いスープから蒸気が上がっていた。"},
  {r:1936,en:"The storm caused extensive damage to the crops.",ja:"嵐は作物に広範な被害を引き起こした。"},
  {r:1937,en:"The mayor gave a speech at the opening ceremony.",ja:"市長は開会式で演説をした。"},
  {r:1938,en:"The project needs more funding to continue.",ja:"そのプロジェクトを続けるにはさらなる資金調達が必要だ。"},
  {r:1939,en:"He works as a computer operator.",ja:"彼はコンピューターの操作者（オペレーター）として働いている。"},
  {r:1940,en:"Music is often called a universal language.",ja:"音楽はしばしば普遍的な言語と呼ばれる。"},
  {r:1941,en:"Too much exposure to the sun can damage your skin.",ja:"太陽への過度の暴露（日光に当たりすぎること）は肌にダメージを与える可能性がある。"},
  {r:1942,en:"She struck a pose for the camera.",ja:"彼女はカメラに向かってポーズ（姿勢）をとった。"},
  {r:1943,en:"Did you see the headline in today's newspaper?",ja:"今日の新聞の見出しを見ましたか？"},
  {r:1944,en:"I heard a loud bang from the kitchen.",ja:"キッチンから大きなズドンという音が聞こえた。"},
  {r:1945,en:"It is highly likely that he will win the election.",ja:"彼が選挙に勝つ可能性が非常に高い（起こりそうである）。"},
  {r:1946,en:"We must recognize the necessity of saving water.",ja:"私たちは水を節約する必要性を認識しなければならない。"},
  {r:1947,en:"The company is in a difficult financial situation.",ja:"その会社は困難な財政状況にある。"},
  {r:1948,en:"The new policy met with strong resistance from the workers.",ja:"新しい政策は労働者からの強い抵抗に遭った。"},
  {r:1949,en:"English grammar is sometimes difficult to understand.",ja:"英語の文法は時に理解するのが難しい。"},
  {r:1950,en:"Paris is the capital of France.",ja:"パリはフランスの首都だ。"},
  {r:1951,en:"I intend to stay here for another week.",ja:"私はここにもう1週間滞在する意図がある（つもりだ）。"},
  {r:1952,en:"The two sisters look very much alike.",ja:"その2人の姉妹はとてもよく似ている。"},
  {r:1953,en:"We reached the peak of the mountain at noon.",ja:"私たちは正午に山の頂上に到達した。"},
  {r:1954,en:"It is important to educate children about the environment.",ja:"子どもたちに環境について教育することは重要だ。"},
  {r:1955,en:"The detective examined the evidence closely.",ja:"探偵は証拠を綿密に調べた。"},
  {r:1956,en:"That is exactly what I wanted to say.",ja:"それは正確に私が言いたかったことだ。"},
  {r:1957,en:"Please wait for a moment.",ja:"少しの瞬間（少々）お待ちください。"},
  {r:1958,en:"The deadline for the report was extended to Friday.",ja:"レポートの締め切りは金曜日まで延長された。"},
  {r:1959,en:"The company has over 500 employees.",ja:"その会社には500人以上の従業員がいる。"},
  {r:1960,en:"I will spend the remaining time reading a book.",ja:"私は残りの時間を本を読んで過ごすつもりだ。"},
  {r:1961,en:"Try not to have a negative attitude.",ja:"否定的な態度を持たないように努めなさい。"},
  {r:1962,en:"The balloon burst with a loud noise.",ja:"風船が大きな音を立てて破裂した。"},
  {r:1963,en:"He painted a beautiful portrait of his wife.",ja:"彼は妻の美しい肖像画を描いた。"},
  {r:1964,en:"There is a strong possibility of rain tomorrow.",ja:"明日は雨の強い可能性がある。"},
  {r:1965,en:"He was fired because of his frequent absence from work.",ja:"彼は頻繁な仕事の欠席のために首になった。"},
  {r:1966,en:"Our primary goal is to provide good service.",ja:"私たちの最初の（主要な）目標は良いサービスを提供することだ。"},
  {r:1967,en:"This product is inferior in quality to the other one.",ja:"この製品はもう一つのものより品質が劣っている。"},
  {r:1968,en:"There are many different interpretations of this poem.",ja:"この詩には多くの異なる解釈がある。"},
  {r:1969,en:"It was evident that she was very tired.",ja:"彼女がとても疲れていることは明らかだった。"},
  {r:1970,en:"They visited a native tribe in the Amazon.",ja:"彼らはアマゾンの先住民の部族を訪ねた。"},
  {r:1971,en:"The building requires a lot of maintenance.",ja:"その建物は多くの保全（メンテナンス）を必要とする。"},
  {r:1972,en:"The train was crowded with passengers.",ja:"その電車は乗客で混雑していた。"},
  {r:1973,en:"The book had a profound effect on his thinking.",ja:"その本は彼の考え方に深い影響を与えた。"},
  {r:1974,en:"Sales have increased significantly this year.",ja:"売上は今年かなり増加した。"},
  {r:1975,en:"I agree with you completely.",ja:"私はあなたに完全に同意します。"},
  {r:1976,en:"I can assure you that the product is safe.",ja:"その製品が安全であることを保証します。"},
  {r:1977,en:"It is illegal to dump garbage in the river.",ja:"川にゴミを投げ捨てることは違法だ。"},
  {r:1978,en:"Can you tell the difference between these two pictures?",ja:"この二つの絵の違いがわかりますか？"},
  {r:1979,en:"The factory uses coal as its main source of energy.",ja:"その工場は主なエネルギー源として石炭を使用している。"},
  {r:1980,en:"We need to drain the water from the pool.",ja:"プールから水を排出させる必要がある。"},
  {r:1981,en:"He acknowledged that he had made a mistake.",ja:"彼は自分が間違いを犯したことを認めた。"},
  {r:1982,en:"The police suspect him of the crime.",ja:"警察は彼がその犯罪を犯したと疑っている。"},
  {r:1983,en:"He stood there gazing at the beautiful sunset.",ja:"彼はそこに立って美しい夕日を凝視した。"},
  {r:1984,en:"Are you sure about that?",ja:"それについて確信していますか？"},
  {r:1985,en:"This bridge is made of strong steel.",ja:"この橋は丈夫な鋼鉄で作られている。"},
  {r:1986,en:"Women were once excluded from many professions.",ja:"かつて女性は多くの職業から除外されていた。"},
  {r:1987,en:"The doctor performed a difficult heart surgery.",ja:"医者は難しい心臓の手術を行った。"},
  {r:1988,en:"If you add two and three, you get five.",ja:"2と3を足し算すると5になる。"},
  {r:1989,en:"The workers are loading the boxes onto the truck.",ja:"労働者たちはトラックに箱を積んでいる。"},
  {r:1990,en:"Change is an inevitable part of life.",ja:"変化は人生において避けられないものだ。"},
  {r:1991,en:"Only the female mosquitoes bite humans.",ja:"雌の蚊だけが人間を刺す。"},
  {r:1992,en:"The cost varies depending on the size of the room.",ja:"費用は部屋の大きさに依存して（応じて）変わる。"},
  {r:1993,en:"He is a so-called expert on the subject.",ja:"彼はその話題のいわゆる専門家だ。"},
  {r:1994,en:"She decided to accept the job offer.",ja:"彼女はその仕事のオファーを受け入れることに決めた。"},
  {r:1995,en:"He spoke with great enthusiasm about his new project.",ja:"彼は新しいプロジェクトについて大きな情熱をもって話した。"},
  {r:1996,en:"My knee joints hurt when it rains.",ja:"雨が降ると私の膝の関節が痛む。"},
  {r:1997,en:"The teacher made an assessment of the students' abilities.",ja:"先生は生徒たちの能力の評価（査定）を行った。"},
  {r:1998,en:"The company has evolved into a global business.",ja:"その会社は世界的なビジネスへと進化した。"},
  {r:1999,en:"The bed occupies too much space in this room.",ja:"そのベッドはこの部屋のあまりに多くのスペースを占めている。"},
  {r:2000,en:"He forgot to mention the date of the meeting.",ja:"彼は会議の日にちを言及するのを忘れた。"},
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
  console.log(`Applied ${c} examples to 2級 (1901-2000). Saved.`);
}
main().catch(console.error);
