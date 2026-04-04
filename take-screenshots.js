const puppeteer = require('puppeteer');
const path = require('path');

const SCREENS = [
  { name: 'student_wordlist', url: 'http://localhost:3001/s/d04023c7392d674d#list', action: async (page) => {
    await page.waitForSelector('.tab-btn', { timeout: 5000 });
    const tabs = await page.$$('.tab-btn');
    if (tabs[1]) await tabs[1].click();
    await new Promise(r => setTimeout(r, 2000));
  }},
  { name: 'student_quiz', url: 'http://localhost:3001/s/d04023c7392d674d#quiz', action: async (page) => {
    await page.waitForSelector('.tab-btn', { timeout: 5000 });
    const tabs = await page.$$('.tab-btn');
    if (tabs[2]) await tabs[2].click();
    await new Promise(r => setTimeout(r, 2000));
  }},
  { name: 'student_register', url: 'http://localhost:3001/s/d04023c7392d674d', action: async (page) => {
    await page.waitForSelector('.tab-btn', { timeout: 5000 });
    await new Promise(r => setTimeout(r, 1000));
  }},
  { name: 'admin_dashboard', url: 'http://localhost:3001/admin', action: async (page) => {
    // Login
    await page.waitForSelector('input[type="password"]', { timeout: 5000 });
    await page.type('input[type="password"]', '54834646');
    await page.click('button[type="submit"]');
    await new Promise(r => setTimeout(r, 3000));
  }},
  { name: 'admin_word_register', url: null, action: async (page) => {
    // Click word distribution tab
    const buttons = await page.$$('button');
    for (const btn of buttons) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text.includes('単語配信')) { await btn.click(); break; }
    }
    await new Promise(r => setTimeout(r, 2000));
  }},
];

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const outDir = path.join(__dirname, 'public', 'screenshots');
  const fs = require('fs');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  // Light mode screenshots
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
  await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'light' }]);

  for (const screen of SCREENS) {
    try {
      if (screen.url) {
        await page.goto(screen.url, { waitUntil: 'networkidle2', timeout: 15000 });
      }
      if (screen.action) await screen.action(page);
      await page.screenshot({ path: path.join(outDir, `${screen.name}.png`), fullPage: false });
      console.log(`✅ ${screen.name}`);
    } catch (e) {
      console.log(`❌ ${screen.name}: ${e.message}`);
    }
  }

  await browser.close();
  console.log('Done!');
})();
