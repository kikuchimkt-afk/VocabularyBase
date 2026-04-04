const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const outDir = path.join(__dirname, 'public', 'screenshots');

  const page = await browser.newPage();
  // A4 portrait at 2x resolution for sharp rendering
  await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 2 });

  // Student flyer
  await page.goto('http://localhost:3001/flyer-students.html', { waitUntil: 'networkidle2', timeout: 15000 });
  await new Promise(r => setTimeout(r, 3000)); // Wait for fonts
  await page.screenshot({ path: path.join(outDir, 'preview_flyer_students.png'), fullPage: true });
  console.log('✅ preview_flyer_students');

  // Instructor flyer
  await page.goto('http://localhost:3001/flyer-instructors.html', { waitUntil: 'networkidle2', timeout: 15000 });
  await new Promise(r => setTimeout(r, 3000));
  await page.screenshot({ path: path.join(outDir, 'preview_flyer_instructors.png'), fullPage: true });
  console.log('✅ preview_flyer_instructors');

  await browser.close();
  console.log('Done!');
})();
