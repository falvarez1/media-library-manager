const { chromium } = require('@playwright/test');

(async () => {
  console.log('Testing folder click functionality...\n');
  
  const browser = await chromium.launch({
    headless: false,
    slowMo: 1000 // Slower to see what's happening
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  // Listen for console errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('❌ Browser Console Error:', msg.text());
    }
  });
  
  // Listen for page errors
  page.on('pageerror', error => {
    console.log('❌ Page Error:', error.message);
  });
  
  try {
    console.log('1. Navigating to application...');
    await page.goto('http://localhost:3015', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    console.log('2. Looking for folder items...');
    
    // Try multiple selectors for folders
    const folderSelectors = [
      '.folder-item',
      '[data-folder]',
      'div:has(> svg[data-lucide="folder"])',
      'div:has-text("Images")',
      'div:has-text("Documents")',
      'div:has-text("Marketing")'
    ];
    
    let folderFound = false;
    for (const selector of folderSelectors) {
      const folders = await page.locator(selector).all();
      console.log(`   Selector "${selector}": Found ${folders.length} items`);
      
      if (folders.length > 0) {
        console.log(`\n3. Clicking on first folder using selector: ${selector}`);
        
        // Take screenshot before click
        await page.screenshot({ path: 'before-click.png' });
        console.log('   Screenshot saved: before-click.png');
        
        // Click the first folder
        await folders[0].click();
        console.log('   ✓ Clicked on folder');
        
        // Wait for any potential error or navigation
        await page.waitForTimeout(3000);
        
        // Take screenshot after click
        await page.screenshot({ path: 'after-click.png' });
        console.log('   Screenshot saved: after-click.png');
        
        // Check for errors
        const errorElements = await page.locator('.error, [role="alert"]').all();
        if (errorElements.length > 0) {
          console.log('\n❌ Errors found after clicking:');
          for (const error of errorElements) {
            const text = await error.textContent();
            console.log('   -', text);
          }
        } else {
          console.log('   ✓ No errors after clicking');
        }
        
        folderFound = true;
        break;
      }
    }
    
    if (!folderFound) {
      console.log('\n❌ No folders found to click');
      
      // Take screenshot to see what's on the page
      await page.screenshot({ path: 'no-folders-found.png', fullPage: true });
      console.log('   Screenshot saved: no-folders-found.png');
    }
    
    // Try clicking on the "Images" text directly
    console.log('\n4. Trying to click directly on "Images" text...');
    try {
      await page.getByText('Images', { exact: true }).click();
      console.log('   ✓ Successfully clicked on Images folder');
      await page.waitForTimeout(2000);
      
      // Check URL or breadcrumb to see if navigation happened
      const url = page.url();
      console.log('   Current URL:', url);
      
    } catch (e) {
      console.log('   ❌ Could not click on Images folder:', e.message);
    }
    
  } catch (error) {
    console.error('\n❌ Test Error:', error);
    await page.screenshot({ path: 'test-error.png', fullPage: true });
    console.log('Error screenshot saved: test-error.png');
  }
  
  console.log('\n✅ Test completed');
  
  // Keep browser open for 5 seconds
  await page.waitForTimeout(5000);
  await browser.close();
})();