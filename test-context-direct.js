const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  // Add console logging
  page.on('console', msg => {
    if (msg.text().includes('[')) {
      console.log('Browser:', msg.text());
    }
  });
  
  await page.goto('http://localhost:3015');
  await page.waitForSelector('.bg-white', { timeout: 10000 });
  
  // Inject debugging code to check if contexts are actually available
  await page.evaluate(() => {
    // Try to directly check React Fiber for context providers
    const checkForContextProviders = () => {
      const root = document.getElementById('__next') || document.getElementById('root');
      console.log('[Debug] Root element found:', !!root);
      
      // Check if AppProviders is in the component tree
      const scripts = document.querySelectorAll('script');
      let hasProviders = false;
      scripts.forEach(script => {
        if (script.textContent && script.textContent.includes('AppProviders')) {
          hasProviders = true;
        }
      });
      console.log('[Debug] AppProviders in scripts:', hasProviders);
    };
    
    checkForContextProviders();
  });
  
  // Click on first media item
  const firstItem = await page.locator('.group').first();
  await firstItem.click();
  
  // Wait for any console logs
  await page.waitForTimeout(2000);
  
  await browser.close();
})();