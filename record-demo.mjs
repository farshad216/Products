import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

(async () => {
  const browser = await chromium.launch({
    headless: true
  });
  
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15',
    recordVideo: {
      dir: '/tmp/videos',
      size: { width: 390, height: 844 }
    }
  });
  
  const page = await context.newPage();
  
  console.log('Recording demo video...');
  
  // Navigate to the app
  await page.goto('http://localhost:3000');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);
  
  // Show QR code
  await page.click('button:has-text("QRコード表示")');
  await page.waitForTimeout(2000);
  
  // Hide QR code
  await page.click('button:has-text("QRコードを隠す")');
  await page.waitForTimeout(1000);
  
  // Test language toggle
  await page.click('button:has-text("English")');
  await page.waitForTimeout(1500);
  
  // Switch back to Japanese
  await page.click('button:has-text("日本語")');
  await page.waitForTimeout(1000);
  
  // Scroll down to show form
  await page.evaluate(() => window.scrollTo(0, 200));
  await page.waitForTimeout(500);
  
  // Fill form with realistic data
  await page.fill('input[type="text"]#name', '山田太郎');
  await page.waitForTimeout(400);
  
  await page.fill('input[type="tel"]', '090-1234-5678');
  await page.waitForTimeout(400);
  
  await page.fill('input[type="email"]', 'yamada@example.com');
  await page.waitForTimeout(400);
  
  await page.selectOption('select', 'computer');
  await page.waitForTimeout(500);
  
  await page.evaluate(() => window.scrollTo(0, 400));
  await page.waitForTimeout(300);
  
  await page.fill('textarea', 'ノートパソコン3台とデスクトップPC2台の回収をお願いします。');
  await page.waitForTimeout(500);
  
  await page.fill('input[id="address"]', '埼玉県川島町下八ツ林123-45');
  await page.waitForTimeout(500);
  
  // Scroll to submit button
  await page.evaluate(() => window.scrollTo(0, 800));
  await page.waitForTimeout(500);
  
  // Click submit (this will show success message)
  await page.click('button[type="submit"]');
  await page.waitForTimeout(2000);
  
  // Wait for success message
  await page.waitForSelector('text=送信完了', { timeout: 5000 });
  await page.waitForTimeout(2000);
  
  // Scroll to see full success message
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(1500);
  
  console.log('✓ Demo recording complete');
  
  await context.close();
  await browser.close();
  
  console.log('✓ Processing video...');
  
  // The video will be saved automatically when context closes
})();
