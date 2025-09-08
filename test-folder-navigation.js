const { chromium } = require('@playwright/test');

(async () => {
  console.log('Testing folder navigation functionality...\n');
  
  const browser = await chromium.launch({
    headless: false,
    slowMo: 500 // Slower to see what's happening
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  // Listen for console messages
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    if (type === 'error') {
      console.log('❌ Browser Console Error:', text);
    } else if (type === 'warning') {
      console.log('⚠️ Browser Console Warning:', text);
    } else if (text.includes('folder') || text.includes('Folder')) {
      console.log('📁 Console:', text);
    }
  });
  
  // Listen for page errors
  page.on('pageerror', error => {
    console.log('❌ Page Error:', error.message);
  });
  
  // Listen for network failures
  page.on('requestfailed', request => {
    console.log('❌ Request Failed:', request.url(), request.failure()?.errorText);
  });
  
  try {
    console.log('1. Navigating to application...');
    await page.goto('http://localhost:3015', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    // Check initial state
    console.log('\n2. Checking initial state...');
    
    // Look for breadcrumb
    const breadcrumb = await page.locator('.breadcrumb, nav[aria-label="breadcrumb"]').first();
    if (await breadcrumb.isVisible()) {
      const breadcrumbText = await breadcrumb.textContent();
      console.log('   Current breadcrumb:', breadcrumbText);
    }
    
    // Look for folder structure
    console.log('\n3. Looking for folder structure...');
    
    // Try to find the Folders section
    const foldersSection = await page.locator('text="Folders"').first();
    if (await foldersSection.isVisible()) {
      console.log('   ✓ Found Folders section');
      
      // Look for folder items near the Folders text
      const folderItems = await page.locator('div:has-text("Folders") ~ div').first().locator('div:has-text("Images"), div:has-text("Documents"), div:has-text("Videos")').all();
      console.log(`   Found ${folderItems.length} folder items`);
      
      if (folderItems.length > 0) {
        console.log('\n4. Testing folder navigation...');
        
        // Click on Images folder
        const imagesFolder = await page.locator('div:has-text("Folders") ~ div').first().locator('text="Images"').first();
        if (await imagesFolder.isVisible()) {
          console.log('   Clicking on Images folder...');
          await imagesFolder.click();
          await page.waitForTimeout(2000);
          
          // Check if navigation happened
          const urlAfterClick = page.url();
          console.log('   URL after click:', urlAfterClick);
          
          // Check breadcrumb again
          const breadcrumbAfter = await page.locator('.breadcrumb, nav[aria-label="breadcrumb"]').first();
          if (await breadcrumbAfter.isVisible()) {
            const breadcrumbTextAfter = await breadcrumbAfter.textContent();
            console.log('   Breadcrumb after click:', breadcrumbTextAfter);
          }
          
          // Check for error messages
          const errorAlerts = await page.locator('[role="alert"], .error-message, .error').all();
          if (errorAlerts.length > 0) {
            console.log('\n   ⚠️ Error alerts found:');
            for (const alert of errorAlerts) {
              const text = await alert.textContent();
              if (text && text.trim()) {
                console.log('     -', text.trim());
              }
            }
          } else {
            console.log('   ✓ No error alerts');
          }
          
          // Check if media items are shown
          const mediaItems = await page.locator('[data-media-item], .media-item, img[alt]').all();
          console.log(`   Media items visible: ${mediaItems.length}`);
          
          // Try to navigate to a sub-folder
          console.log('\n5. Testing sub-folder navigation...');
          const marketingFolder = await page.locator('text="Marketing"').first();
          if (await marketingFolder.isVisible()) {
            console.log('   Clicking on Marketing folder...');
            await marketingFolder.click();
            await page.waitForTimeout(2000);
            
            const breadcrumbAfterSub = await page.locator('.breadcrumb, nav[aria-label="breadcrumb"]').first();
            if (await breadcrumbAfterSub.isVisible()) {
              const breadcrumbTextAfterSub = await breadcrumbAfterSub.textContent();
              console.log('   Breadcrumb after sub-folder click:', breadcrumbTextAfterSub);
            }
          } else {
            console.log('   Marketing folder not visible');
          }
          
          // Try to go back to root
          console.log('\n6. Testing navigation back to root...');
          const allMediaLink = await page.locator('text="All Media"').first();
          if (await allMediaLink.isVisible()) {
            console.log('   Clicking on All Media...');
            await allMediaLink.click();
            await page.waitForTimeout(2000);
            
            const breadcrumbAtRoot = await page.locator('.breadcrumb, nav[aria-label="breadcrumb"]').first();
            if (await breadcrumbAtRoot.isVisible()) {
              const breadcrumbTextAtRoot = await breadcrumbAtRoot.textContent();
              console.log('   Breadcrumb at root:', breadcrumbTextAtRoot);
            }
          }
        }
      }
    } else {
      console.log('   ❌ Folders section not found');
    }
    
    // Take final screenshot
    await page.screenshot({ path: 'folder-navigation-test.png', fullPage: true });
    console.log('\n7. Screenshot saved: folder-navigation-test.png');
    
  } catch (error) {
    console.error('\n❌ Test Error:', error);
    await page.screenshot({ path: 'test-error.png', fullPage: true });
    console.log('Error screenshot saved: test-error.png');
  }
  
  console.log('\n✅ Test completed');
  
  // Keep browser open for 3 seconds
  await page.waitForTimeout(3000);
  await browser.close();
})();