const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const outDir = path.join(__dirname, 'public', 'screenshots');
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
  await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'light' }]);

  // Go to student page
  await page.goto('http://localhost:3001/s/d04023c7392d674d', { waitUntil: 'networkidle2', timeout: 15000 });

  // Click quiz tab
  await page.waitForSelector('.tab-btn', { timeout: 5000 });
  const tabs = await page.$$('.tab-btn');
  if (tabs[2]) await tabs[2].click();
  await new Promise(r => setTimeout(r, 2000));

  // Click START button
  const startBtns = await page.$$('button');
  for (const btn of startBtns) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text.includes('START')) { await btn.click(); break; }
  }
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: path.join(outDir, 'flashcard_front.png'), fullPage: false });
  console.log('✅ flashcard_front');

  // Click "答えを見る" button to reveal answer
  const answerBtns = await page.$$('button');
  for (const btn of answerBtns) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text.includes('答えを見る')) { await btn.click(); break; }
  }
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(outDir, 'flashcard_back.png'), fullPage: false });
  console.log('✅ flashcard_back');

  // Search demo
  await page.goto('http://localhost:3001/s/d04023c7392d674d', { waitUntil: 'networkidle2', timeout: 15000 });
  await page.waitForSelector('.tab-btn', { timeout: 5000 });
  const tabs2 = await page.$$('.tab-btn');
  if (tabs2[1]) await tabs2[1].click();
  await new Promise(r => setTimeout(r, 2000));

  const searchInput = await page.$('input[placeholder*="検索"]');
  if (searchInput) {
    await searchInput.type('決定');
    await new Promise(r => setTimeout(r, 1000));
  }
  await page.screenshot({ path: path.join(outDir, 'search_demo.png'), fullPage: false });
  console.log('✅ search_demo');

  // Register page - show AI search
  await page.goto('http://localhost:3001/s/d04023c7392d674d', { waitUntil: 'networkidle2', timeout: 15000 });
  await page.waitForSelector('.tab-btn', { timeout: 5000 });
  await new Promise(r => setTimeout(r, 1500));

  const wordInput = await page.$('input[placeholder*="inevitable"]');
  if (wordInput) {
    await wordInput.type('accomplish');
  }
  await page.screenshot({ path: path.join(outDir, 'student_register_input.png'), fullPage: false });
  console.log('✅ student_register_input');

  await browser.close();
  console.log('Done!');
})();
