const xlsx = require('xlsx');
const fs = require('fs');

const filePath = String.raw`C:\Users\makoto\Documents\GitHub\VocabularyBase\単語リスト\出題頻度順リストのみ_英検英単語.xlsx`;

const API_KEYS = [
  "AIzaSyB3PwqdSA_WP0PtSaSJi3Rl4NvyHw9w56E",
  "AIzaSyB222ZXoUWntZ9utMa3HwSbrIwXRBNr5pk"
];

const GEMINI_MODELS = [
  'gemini-2.0-flash-lite',
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-1.5-flash',
];

async function generateBatch(wordsBatch) {
  const prompt = `以下の英単語と意味のリストについて、中高生向けの自然な短い英語の例文と、その日本語訳を作成してください。
以下のJSON配列形式のみで返してください（他のテキストは絶対に不要）:
[{"en":"英語例文","ja":"日本語訳"}, ...]

リスト:
${wordsBatch.map((w, i) => `${i+1}. ${w.english} (${w.meaning})`).join('\n')}`;

  for (const apiKey of API_KEYS) {
    for (const model of GEMINI_MODELS) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const keyLabel = apiKey.slice(-4);
      
      for(let attempt = 0; attempt < 2; attempt++) {
        try {
          const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: { temperature: 0.3, maxOutputTokens: 8192 },
            }),
          });

          if (res.status === 429) {
            console.log(`[key...${keyLabel}][${model}] 429 rate limit, attempt ${attempt+1}`);
            await new Promise(r => setTimeout(r, 2000));
            continue;
          }

          if (res.status === 503) {
            console.log(`[key...${keyLabel}][${model}] 503 Unavailable, switching model`);
            break; // 次のモデルへ
          }

          if (!res.ok) {
            const errText = await res.text();
            fs.appendFileSync('error.log', `[${res.status}] ${errText}\n`);
            break; // 別のエラーなら次のモデルへ
          }

          const d = await res.json();
          
          if (d.promptFeedback && d.promptFeedback.blockReason) {
            console.log(`Blocked by safety, switching model`);
            break; 
          }

          const raw = d.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
          const match = raw.match(/\[[\s\S]*\]/);
          if (match) {
            try {
              const parsed = JSON.parse(match[0]);
              if (parsed.length === wordsBatch.length) return parsed;
              else {
                 console.log(`JSON length mismatch: expected ${wordsBatch.length}, got ${parsed.length}`);
                 break;
              }
            } catch(err) {
              console.log(`JSON Parse failed`);
            }
          }
          break; // Response invalid pattern, try next model
        } catch(e) {
          console.log(`Attempt ${attempt}: ${e.message}`);
          await new Promise(r => setTimeout(r, 5000));
        }
      } // End attempt
    } // End model
  } // End key
  return null;
}

async function main() {
  const outPath = filePath.replace('.xlsx', '_updated.xlsx');
  
  const targetFile = fs.existsSync(outPath) ? outPath : filePath;
  console.log(`Reading from ${targetFile}`);
  const wb = xlsx.readFile(targetFile);
  const ws = wb.Sheets["準2級"];
  const aoa = xlsx.utils.sheet_to_json(ws, { header: 1, defval: "" });

  if (aoa[0][3] !== '例文') aoa[0][3] = '例文';
  if (aoa[0][4] !== '例文訳') aoa[0][4] = '例文訳';

  const BATCH_SIZE = 30;
  let batch = [];
  let batchIndices = [];
  
  let processed = 0;
  
  for (let i = 1; i < aoa.length; i++) {
    const row = aoa[i];
    const english = row[1];
    const meaning = row[2];
    const example = row[3];
    
    if (english && (!example || example.trim() === '')) {
      batch.push({ english, meaning });
      batchIndices.push(i);
    }

    if (batch.length === BATCH_SIZE || (i === aoa.length - 1 && batch.length > 0)) {
      console.log(`Processing rows ${batchIndices[0]} to ${batchIndices[batchIndices.length - 1]}...`);
      
      let results = null;
      while(!results) {
        results = await generateBatch(batch);
        if (!results) {
          console.log(`All fallbacks failed. Waiting 10 seconds before retrying batch...`);
          await new Promise(r => setTimeout(r, 10000));
        }
      }
      
      for (let j = 0; j < results.length; j++) {
        const idx = batchIndices[j];
        aoa[idx][3] = results[j].en;
        aoa[idx][4] = results[j].ja;
      }
      processed += results.length;
      console.log(`Success! Total generated so far: ${processed}`);
      
      if (processed % (BATCH_SIZE * 3) === 0 || i === aoa.length - 1) {
        const newWs = xlsx.utils.aoa_to_sheet(aoa);
        wb.Sheets["準2級"] = newWs;
        xlsx.writeFile(wb, outPath);
        console.log(`Saved intermediate progress to file.`);
      }
      
      batch = [];
      batchIndices = [];
      await new Promise(r => setTimeout(r, 3000));
    }
  }

  if (processed > 0) {
    const newWs = xlsx.utils.aoa_to_sheet(aoa);
    wb.Sheets["準2級"] = newWs;
    xlsx.writeFile(wb, outPath);
    console.log(`Finished processing and saved file.`);
  } else {
    console.log(`No missing examples found. Nothing to update.`);
  }
}

main().catch(console.error);
