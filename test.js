const cheerio = require('cheerio');
async function run() {
  const res = await fetch('https://excelsemsegredo.centauridigital.com.br', { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } });
  const html = await res.text();
  console.log(html);
}
run();
