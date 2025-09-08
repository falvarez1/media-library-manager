const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  await page.goto('http://localhost:3015');
  await page.waitForSelector('.bg-white', { timeout: 10000 });
  
  // Add console logging
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  
  // Inject debugging code
  await page.evaluate(() => {
    console.log('=== Context Debug ===');
    
    // Try to access React DevTools
    const reactFiber = document.querySelector('[class*="group"]')?._reactInternalFiber || 
                       document.querySelector('[class*="group"]')?._reactInternalInstance;
    console.log('React Fiber found:', !!reactFiber);
    
    // Check if contexts are available
    if (window.React && window.React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED) {
      console.log('React internals available');
    }
    
    // Check localStorage for any stored state
    console.log('LocalStorage keys:', Object.keys(localStorage));
    
    // Check for context providers in DOM
    const providers = document.querySelectorAll('[data-context]');
    console.log('Context providers found:', providers.length);
  });
  
  // Click on first media item
  const firstItem = await page.locator('.group').first();
  await firstItem.click();
  
  // Wait a bit
  await page.waitForTimeout(1000);
  
  // Check what's visible
  const detailsVisible = await page.locator('[data-testid="details-sidebar"]').isVisible().catch(() => false);
  const propertiesTextVisible = await page.locator('text=Properties').isVisible().catch(() => false);
  const detailsTextVisible = await page.locator('text=Details').isVisible().catch(() => false);
  
  console.log('Details sidebar visible:', detailsVisible);
  console.log('Properties text visible:', propertiesTextVisible);
  console.log('Details text visible:', detailsTextVisible);
  
  // Check the actual DOM structure
  const html = await page.locator('body').innerHTML();
  const hasDetailsSidebar = html.includes('DetailsSidebar') || html.includes('details-sidebar');
  console.log('HTML contains DetailsSidebar:', hasDetailsSidebar);
  
  // Keep browser open for inspection
  await page.waitForTimeout(60000);
  await browser.close();
})();