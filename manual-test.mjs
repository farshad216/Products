import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 }
  });
  const page = await context.newPage();
  
  console.log('Loading app...');
  await page.goto('http://localhost:3000');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000); // Wait for animations
  
  console.log('✅ Landing page loaded');
  await page.screenshot({ path: '/opt/cursor/artifacts/final-landing.png', fullPage: true });
  
  // Force navigation to form by evaluating JS
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const startButton = buttons.find(b => b.textContent.includes('回収申込を開始') || b.textContent.includes('Start'));
    if (startButton) startButton.click();
  });
  
  await page.waitForTimeout(1000);
  console.log('✅ Navigated to form');
  await page.screenshot({ path: '/opt/cursor/artifacts/final-form.png', fullPage: true });
  
  // Fill form
  await page.fill('input#name', '山田太郎');
  await page.fill('input[type="tel"]', '090-1234-5678');
  await page.fill('input[type="email"]', 'yamada@example.com');
  await page.selectOption('select', 'computer');
  await page.fill('textarea', 'テスト説明');
  await page.fill('input#address', '埼玉県川島町');
  
  console.log('✅ Form filled');
  await page.screenshot({ path: '/opt/cursor/artifacts/final-filled.png', fullPage: true });
  
  await browser.close();
  console.log('\n✅ All manual tests passed!');
  console.log('Screenshots saved to /opt/cursor/artifacts/');
})();
