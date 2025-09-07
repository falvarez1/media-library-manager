const { chromium } = require('@playwright/test');

(async () => {
  console.log('Starting Media Library Manager application review...\n');
  
  // Launch browser
  const browser = await chromium.launch({
    headless: false,
    slowMo: 500 // Slow down for visibility
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  try {
    // Navigate to the application
    console.log('1. Navigating to application...');
    await page.goto('http://localhost:3015', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    // Check if main components are visible
    console.log('2. Checking main components visibility...');
    
    // Check sidebar
    const sidebar = await page.locator('[data-testid="folder-navigation"], .sidebar, aside').first();
    const sidebarVisible = await sidebar.isVisible().catch(() => false);
    console.log(`   ✓ Sidebar: ${sidebarVisible ? 'Visible' : 'Not visible'}`);
    
    // Check main content area
    const mainContent = await page.locator('main, [role="main"], .media-content').first();
    const mainContentVisible = await mainContent.isVisible().catch(() => false);
    console.log(`   ✓ Main content: ${mainContentVisible ? 'Visible' : 'Not visible'}`);
    
    // Check toolbar
    const toolbar = await page.locator('.toolbar, [role="toolbar"], header').first();
    const toolbarVisible = await toolbar.isVisible().catch(() => false);
    console.log(`   ✓ Toolbar: ${toolbarVisible ? 'Visible' : 'Not visible'}`);
    
    console.log('\n3. Testing navigation functionality...');
    
    // Try clicking on folders
    const folders = await page.locator('[role="treeitem"], .folder-item, [data-folder]').all();
    console.log(`   Found ${folders.length} folder items`);
    
    if (folders.length > 0) {
      console.log('   Clicking on first folder...');
      await folders[0].click();
      await page.waitForTimeout(1000);
    }
    
    // Check for media items
    console.log('\n4. Checking for media items...');
    const mediaItems = await page.locator('.media-item, [data-media-item], .grid-item').all();
    console.log(`   Found ${mediaItems.length} media items`);
    
    // Test filter functionality
    console.log('\n5. Testing filter functionality...');
    const filterButton = await page.locator('button:has-text("Filter"), [aria-label*="filter" i]').first();
    if (await filterButton.isVisible().catch(() => false)) {
      console.log('   Clicking filter button...');
      await filterButton.click();
      await page.waitForTimeout(1000);
      
      // Check if filter panel opened
      const filterPanel = await page.locator('.filter-panel, [role="dialog"]').first();
      const filterPanelVisible = await filterPanel.isVisible().catch(() => false);
      console.log(`   ✓ Filter panel: ${filterPanelVisible ? 'Opened' : 'Not opened'}`);
      
      // Close filter if opened
      if (filterPanelVisible) {
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);
      }
    }
    
    // Test search functionality
    console.log('\n6. Testing search functionality...');
    const searchInput = await page.locator('input[type="search"], input[placeholder*="search" i]').first();
    if (await searchInput.isVisible().catch(() => false)) {
      console.log('   Typing in search...');
      await searchInput.fill('test search');
      await page.waitForTimeout(1000);
      await searchInput.clear();
    }
    
    // Test view mode switching
    console.log('\n7. Testing view mode switching...');
    const gridButton = await page.locator('button:has-text("Grid"), [aria-label*="grid" i]').first();
    const listButton = await page.locator('button:has-text("List"), [aria-label*="list" i]').first();
    
    if (await listButton.isVisible().catch(() => false)) {
      console.log('   Switching to list view...');
      await listButton.click();
      await page.waitForTimeout(1000);
    }
    
    if (await gridButton.isVisible().catch(() => false)) {
      console.log('   Switching back to grid view...');
      await gridButton.click();
      await page.waitForTimeout(1000);
    }
    
    // Test sidebar tabs
    console.log('\n8. Testing sidebar tabs...');
    const collectionsTab = await page.locator('button:has-text("Collections"), [aria-label*="collections" i]').first();
    if (await collectionsTab.isVisible().catch(() => false)) {
      console.log('   Clicking Collections tab...');
      await collectionsTab.click();
      await page.waitForTimeout(1000);
    }
    
    const tagsTab = await page.locator('button:has-text("Tags"), [aria-label*="tags" i]').first();
    if (await tagsTab.isVisible().catch(() => false)) {
      console.log('   Clicking Tags tab...');
      await tagsTab.click();
      await page.waitForTimeout(1000);
    }
    
    // Test modal functionality
    console.log('\n9. Testing modal functionality...');
    const settingsButton = await page.locator('button:has-text("Settings"), [aria-label*="settings" i]').first();
    if (await settingsButton.isVisible().catch(() => false)) {
      console.log('   Opening settings...');
      await settingsButton.click();
      await page.waitForTimeout(1000);
      
      const modal = await page.locator('[role="dialog"], .modal').first();
      const modalVisible = await modal.isVisible().catch(() => false);
      console.log(`   ✓ Settings modal: ${modalVisible ? 'Opened' : 'Not opened'}`);
      
      if (modalVisible) {
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);
      }
    }
    
    // Check for any errors
    console.log('\n10. Checking for errors...');
    const errors = await page.locator('.error, [role="alert"], .error-message').all();
    console.log(`   Found ${errors.length} error messages`);
    
    if (errors.length > 0) {
      for (let i = 0; i < Math.min(errors.length, 3); i++) {
        const errorText = await errors[i].textContent();
        console.log(`   Error ${i + 1}: ${errorText}`);
      }
    }
    
    // Take screenshot
    console.log('\n11. Taking screenshot...');
    await page.screenshot({ path: 'app-review-screenshot.png', fullPage: true });
    console.log('   ✓ Screenshot saved as app-review-screenshot.png');
    
    console.log('\n✅ Application review completed successfully!');
    
  } catch (error) {
    console.error('Error during review:', error);
    
    // Take error screenshot
    await page.screenshot({ path: 'error-screenshot.png', fullPage: true });
    console.log('Error screenshot saved as error-screenshot.png');
  }
  
  // Keep browser open for 5 seconds before closing
  await page.waitForTimeout(5000);
  await browser.close();
})();