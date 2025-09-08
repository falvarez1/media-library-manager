import { test, expect } from '@playwright/test';

test.describe('Properties Panel', () => {
  test('shows properties panel when clicking on an image', async ({ page }) => {
    // Navigate to the app
    await page.goto('http://localhost:3015');
    
    // Wait for the app to load
    await page.waitForSelector('.bg-white', { timeout: 10000 });
    
    // Wait for media items to load
    await page.waitForSelector('.group', { timeout: 10000 });
    
    // Listen for console messages
    page.on('console', msg => {
      if (msg.text().includes('[App]')) {
        console.log(`Browser: ${msg.text()}`);
      }
    });
    
    // Click on the first media item div (not the image itself, but the container)
    const firstItem = page.locator('.group').first();
    
    console.log('Clicking on media item...');
    await firstItem.click();
    
    // Wait a moment for state to update
    await page.waitForTimeout(500);
    
    // Check if the details panel is visible (sidebar shows "Details" not "Properties")
    const detailsPanel = page.locator('text=Details').first();
    const isPanelVisible = await detailsPanel.isVisible();
    
    console.log('Details panel visible:', isPanelVisible);
    
    // Also check for other indicators of the details sidebar
    const detailsSidebar = page.locator('[class*="DetailsSidebar"], [data-testid="details-sidebar"], aside:has-text("Details")');
    const isSidebarVisible = await detailsSidebar.count() > 0;
    
    console.log('Details sidebar found:', isSidebarVisible);
    
    // Check if either is visible
    expect(isPanelVisible || isSidebarVisible).toBeTruthy();
  });
});