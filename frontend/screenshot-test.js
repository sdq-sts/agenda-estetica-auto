const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Home
  await page.goto('http://localhost:3000');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: '/tmp/screenshot-home.png', fullPage: true });
  console.log('✅ Screenshot Home saved');

  // Clientes
  await page.goto('http://localhost:3000/clientes');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: '/tmp/screenshot-clientes.png', fullPage: true });
  console.log('✅ Screenshot Clientes saved');

  // Servicos
  await page.goto('http://localhost:3000/servicos');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: '/tmp/screenshot-servicos.png', fullPage: true });
  console.log('✅ Screenshot Servicos saved');

  await browser.close();
  console.log('\n✅ All screenshots saved to /tmp/');
})();
