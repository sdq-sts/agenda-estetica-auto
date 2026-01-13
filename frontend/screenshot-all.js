const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Home
  await page.goto('http://localhost:3000');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: '/tmp/screenshot-home-updated.png', fullPage: true });
  console.log('✅ Screenshot Home saved');

  // Clientes
  await page.goto('http://localhost:3000/clientes');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: '/tmp/screenshot-clientes-updated.png', fullPage: true });
  console.log('✅ Screenshot Clientes saved');

  // Veiculos
  await page.goto('http://localhost:3000/veiculos');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: '/tmp/screenshot-veiculos-updated.png', fullPage: true });
  console.log('✅ Screenshot Veiculos saved');

  // Servicos
  await page.goto('http://localhost:3000/servicos');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: '/tmp/screenshot-servicos-updated.png', fullPage: true });
  console.log('✅ Screenshot Servicos saved');

  // Agendamentos
  await page.goto('http://localhost:3000/agendamentos');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: '/tmp/screenshot-agendamentos-updated.png', fullPage: true });
  console.log('✅ Screenshot Agendamentos saved');

  // Mobile view - Home
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('http://localhost:3000');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: '/tmp/screenshot-mobile-home.png', fullPage: true });
  console.log('✅ Screenshot Mobile Home saved');

  // Mobile view - Clientes
  await page.goto('http://localhost:3000/clientes');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: '/tmp/screenshot-mobile-clientes.png', fullPage: true });
  console.log('✅ Screenshot Mobile Clientes saved');

  await browser.close();
  console.log('\n✅ All screenshots saved to /tmp/');
})();
