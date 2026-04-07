const xlsx = require('xlsx');
const fs = require('fs');

const filePath = String.raw`C:\Users\makoto\Documents\GitHub\VocabularyBase\単語リスト\出題頻度順リストのみ_英検英単語.xlsx`;

try {
  const wb = xlsx.readFile(filePath);
  if (wb.SheetNames.includes("準2級")) {
    const ws = wb.Sheets["準2級"];
    const data = xlsx.utils.sheet_to_json(ws, { header: 1, defval: "" });
    const output = {
        sheet: "準2級",
        totalRows: data.length,
        first5Rows: data.slice(0, 5)
    };
    fs.writeFileSync("inspect_output.json", JSON.stringify(output, null, 2));
    console.log("Wrote to inspect_output.json");
  }
} catch (e) {
  console.error(e);
}
