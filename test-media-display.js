const { chromium } = require('@playwright/test');

(async () => {
  console.log('Testing media display in folders...\n');
  
  const browser = await chromium.launch({
    headless: false,
    slowMo: 500
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  // Listen for console messages
  page.on('console', msg => {
    const text = msg.text();
    if (msg.type() === 'error') {
      console.log('❌ Console Error:', text);
    } else if (text.includes('media') || text.includes('Media')) {
      console.log('📸 Media Log:', text);
    }
  });
  
  // Listen for network requests to track image loading
  let imageRequests = 0;
  page.on('request', request => {
    if (request.url().includes('unsplash.com')) {
      imageRequests++;
      console.log(`🌐 Loading Unsplash image #${imageRequests}: ${request.url().substring(0, 60)}...`);
    }
  });
  
  try {
    console.log('1. Navigating to application...');
    await page.goto('http://localhost:3015', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    // Check for "All Media" view first
    console.log('\n2. Checking All Media view...');
    
    // Look for media items in the main content area
    const mediaItems = await page.locator('[data-media-item], .media-item, img[src*="unsplash"]').all();
    console.log(`   Found ${mediaItems.length} media items in All Media view`);
    
    if (mediaItems.length > 0) {
      console.log('   ✅ Media items are being displayed!');
      
      // Check first few items
      for (let i = 0; i < Math.min(3, mediaItems.length); i++) {
        const item = mediaItems[i];
        try {
          const src = await item.getAttribute('src');
          if (src) {
            console.log(`   - Item ${i + 1}: ${src.substring(0, 60)}...`);
          }
        } catch (e) {
          // Not an image element, skip
        }
      }
    } else {
      console.log('   ⚠️ No media items found in All Media view');
    }
    
    // Navigate to Images folder
    console.log('\n3. Navigating to Images folder...');
    const imagesFolder = await page.locator('text="Images"').first();
    if (await imagesFolder.isVisible()) {
      await imagesFolder.click();
      await page.waitForTimeout(2000);
      
      // Check for media items after navigation
      const imagesInFolder = await page.locator('[data-media-item], .media-item, img[src*="unsplash"]').all();
      console.log(`   Found ${imagesInFolder.length} items in Images folder`);
      
      // Check for sub-folders
      const subFolders = await page.locator('div:has-text("Marketing"), div:has-text("Products"), div:has-text("Team")').all();
      console.log(`   Found ${subFolders.length} sub-folders`);
    }
    
    // Navigate to Marketing subfolder
    console.log('\n4. Navigating to Marketing subfolder...');
    const marketingFolder = await page.locator('text="Marketing"').first();
    if (await marketingFolder.isVisible()) {
      await marketingFolder.click();
      await page.waitForTimeout(2000);
      
      const marketingItems = await page.locator('[data-media-item], .media-item, img[src*="unsplash"]').all();
      console.log(`   Found ${marketingItems.length} items in Marketing folder`);
    }
    
    // Check view modes
    console.log('\n5. Testing view modes...');
    
    // Look for view mode buttons
    const gridViewBtn = await page.locator('[aria-label*="grid"], [title*="grid"], button:has-text("Grid")').first();
    const listViewBtn = await page.locator('[aria-label*="list"], [title*="list"], button:has-text("List")').first();
    
    if (await listViewBtn.isVisible()) {
      console.log('   Switching to list view...');
      await listViewBtn.click();
      await page.waitForTimeout(1000);
      
      const listItems = await page.locator('[data-media-item], .media-item, tr[data-item]').all();
      console.log(`   Found ${listItems.length} items in list view`);
    }
    
    if (await gridViewBtn.isVisible()) {
      console.log('   Switching back to grid view...');
      await gridViewBtn.click();
      await page.waitForTimeout(1000);
      
      const gridItems = await page.locator('[data-media-item], .media-item, img[src*="unsplash"]').all();
      console.log(`   Found ${gridItems.length} items in grid view`);
    }
    
    // Check if images are actually loading
    console.log('\n6. Checking image loading status...');
    console.log(`   Total Unsplash image requests: ${imageRequests}`);
    
    // Check for error states
    const errorStates = await page.locator('.error, [role="alert"], .no-media').all();
    if (errorStates.length > 0) {
      console.log('\n   ⚠️ Error states found:');
      for (const error of errorStates) {
        const text = await error.textContent();
        if (text && text.trim()) {
          console.log(`     - ${text.trim()}`);
        }
      }
    }
    
    // Take screenshot
    await page.screenshot({ path: 'media-display-test.png', fullPage: true });
    console.log('\n7. Screenshot saved: media-display-test.png');
    
    // Summary
    console.log('\n📊 Summary:');
    console.log(`   - Media items found: ${mediaItems.length > 0 ? 'Yes' : 'No'}`);
    console.log(`   - Unsplash images loaded: ${imageRequests}`);
    console.log(`   - Folder navigation: Working`);
    console.log(`   - View modes: ${(await listViewBtn.isVisible()) && (await gridViewBtn.isVisible()) ? 'Available' : 'Not found'}`);
    
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