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
  
  console.log('Navigating to test context page...');
  await page.goto('http://localhost:3015/test-context');
  
  // Wait for page to load
  await page.waitForSelector('h1', { timeout: 10000 });
  
  // Check initial state
  const initialShowDetails = await page.locator('text=showDetails:').locator('..').textContent();
  console.log('Initial state:', initialShowDetails);
  
  // Click the test context button
  console.log('Clicking "Test Context Update" button...');
  await page.click('text=Test Context Update');
  
  // Wait a moment for state to update
  await page.waitForTimeout(500);
  
  // Check updated state
  const updatedShowDetails = await page.locator('text=showDetails:').locator('..').textContent();
  console.log('Updated state:', updatedShowDetails);
  
  // Check if success message appears
  const successVisible = await page.locator('text=Context is working!').isVisible().catch(() => false);
  console.log('Success message visible:', successVisible);
  
  if (updatedShowDetails.includes('true') && successVisible) {
    console.log('✅ Context is working correctly on the test page!');
  } else {
    console.log('❌ Context is NOT working on the test page');
  }
  
  // Test local state as control
  console.log('\nTesting local state as control...');
  await page.click('text=Test Local Update');
  await page.waitForTimeout(500);
  const localState = await page.locator('text=localState:').locator('..').textContent();
  console.log('Local state:', localState);
  
  // Keep browser open for manual inspection
  await page.waitForTimeout(5000);
  await browser.close();
})();