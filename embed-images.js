const fs = require('fs');
const path = require('path');

function imgToBase64(filePath) {
  const data = fs.readFileSync(filePath);
  return `data:image/png;base64,${data.toString('base64')}`;
}

function embedImages(htmlFile) {
  let html = fs.readFileSync(htmlFile, 'utf8');
  const dir = path.dirname(htmlFile);
  
  // Replace all src="screenshots/xxx.png" with embedded base64
  html = html.replace(/src="screenshots\/([^"]+)"/g, (match, filename) => {
    const imgPath = path.join(dir, 'screenshots', filename);
    if (fs.existsSync(imgPath)) {
      const b64 = imgToBase64(imgPath);
      console.log(`  ✅ Embedded: ${filename} (${Math.round(fs.statSync(imgPath).size/1024)}KB)`);
      return `src="${b64}"`;
    } else {
      console.log(`  ❌ Not found: ${filename}`);
      return match;
    }
  });
  
  return html;
}

const publicDir = path.join(__dirname, 'public');

// Student flyer
console.log('📄 Student flyer:');
const studentHtml = embedImages(path.join(publicDir, 'flyer-students.html'));
fs.writeFileSync(path.join(publicDir, 'flyer-students-print.html'), studentHtml);
console.log('  → flyer-students-print.html\n');

// Instructor flyer
console.log('📄 Instructor flyer:');
const instructorHtml = embedImages(path.join(publicDir, 'flyer-instructors.html'));
fs.writeFileSync(path.join(publicDir, 'flyer-instructors-print.html'), instructorHtml);
console.log('  → flyer-instructors-print.html\n');

console.log('Done! Open the -print.html files directly in your browser.');
