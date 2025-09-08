const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  // Add console logging
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('[')) {
      console.log('Browser:', text);
    }
  });
  
  console.log('Navigating to main app...');
  await page.goto('http://localhost:3015');
  
  // Wait for page to load
  await page.waitForSelector('.bg-white', { timeout: 10000 });
  
  console.log('Page loaded, waiting for media items to load...');
  
  // Wait for media items to load
  await page.waitForSelector('.group', { timeout: 10000 });
  
  // Check if media items are present
  const mediaItems = await page.locator('.group').count();
  console.log('Media items found:', mediaItems);
  
  if (mediaItems > 0) {
    console.log('Clicking first media item...');
    await page.locator('.group').first().click();
    
    // Wait for any state updates
    await page.waitForTimeout(1000);
    
    // Check for DetailsSidebar
    const detailsVisible = await page.locator('[data-testid="details-sidebar"]').isVisible().catch(() => false);
    const propertiesTextVisible = await page.locator('text=Properties').isVisible().catch(() => false);
    
    console.log('\nResults:');
    console.log('- Details sidebar visible:', detailsVisible);
    console.log('- Properties text visible:', propertiesTextVisible);
    
    // Try to find any element that might be the details panel
    const anyDetailsElement = await page.locator('text=/Details|Properties|Information/i').count();
    console.log('- Any details-related elements found:', anyDetailsElement);
  }
  
  // Keep browser open for inspection
  await page.waitForTimeout(5000);
  await browser.close();
})();