import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  
  // Test mobile view
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15'
  });
  
  const page = await mobileContext.newPage();
  
  console.log('Testing mobile view...');
  await page.goto('http://localhost:3000');
  await page.waitForLoadState('networkidle');
  
  // Take screenshot of initial page
  await page.screenshot({ path: '/opt/cursor/artifacts/mobile-home.png', fullPage: true });
  console.log('✓ Mobile home screenshot saved');
  
  // Test language toggle
  await page.click('button:has-text("English")');
  await page.waitForTimeout(500);
  await page.screenshot({ path: '/opt/cursor/artifacts/mobile-english.png', fullPage: true });
  console.log('✓ English view screenshot saved');
  
  // Switch back to Japanese
  await page.click('button:has-text("日本語")');
  await page.waitForTimeout(500);
  
  // Test QR code display
  await page.click('button:has-text("QRコード表示")');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: '/opt/cursor/artifacts/mobile-qr.png', fullPage: true });
  console.log('✓ QR code screenshot saved');
  
  // Test form filling
  await page.fill('input[type="text"]#name', '山田太郎');
  await page.fill('input[type="tel"]', '090-1234-5678');
  await page.fill('input[type="email"]', 'yamada@example.com');
  await page.selectOption('select', 'computer');
  await page.fill('textarea', 'ノートパソコン3台、デスクトップ2台を回収希望します。');
  await page.fill('input[id="address"]', '埼玉県川島町下八ツ林123-45');
  
  await page.screenshot({ path: '/opt/cursor/artifacts/mobile-form-filled.png', fullPage: true });
  console.log('✓ Filled form screenshot saved');
  
  await mobileContext.close();
  
  // Test desktop view
  const desktopContext = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  
  const desktopPage = await desktopContext.newPage();
  
  console.log('Testing desktop view...');
  await desktopPage.goto('http://localhost:3000');
  await desktopPage.waitForLoadState('networkidle');
  
  await desktopPage.screenshot({ path: '/opt/cursor/artifacts/desktop-home.png', fullPage: true });
  console.log('✓ Desktop home screenshot saved');
  
  await desktopContext.close();
  await browser.close();
  
  console.log('\n✓ All tests completed successfully!');
  console.log('\nScreenshots saved to /opt/cursor/artifacts/');
})();
