const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function captureScreenshots() {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await context.newPage();

  const screenshotsDir = path.join(__dirname, 'screenshots', 'baseline');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  const pages = [
    { url: 'http://localhost:3000', name: 'home' },
    { url: 'http://localhost:3000/clientes', name: 'clientes' },
    { url: 'http://localhost:3000/veiculos', name: 'veiculos' },
    { url: 'http://localhost:3000/servicos', name: 'servicos' },
    { url: 'http://localhost:3000/agendamentos', name: 'agendamentos' },
  ];

  for (const pageInfo of pages) {
    try {
      console.log(`📸 Capturando ${pageInfo.name}...`);
      await page.goto(pageInfo.url, { waitUntil: 'networkidle', timeout: 10000 });
      await page.screenshot({
        path: path.join(screenshotsDir, `${pageInfo.name}.png`),
        fullPage: true
      });
      console.log(`✅ ${pageInfo.name} capturado`);
    } catch (error) {
      console.error(`❌ Erro ao capturar ${pageInfo.name}:`, error.message);
    }
  }

  await browser.close();
  console.log('\n🎉 Screenshots baseline capturados em:', screenshotsDir);
}

captureScreenshots();
