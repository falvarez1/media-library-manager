import { test, expect } from '@playwright/test';

test.describe('Media Viewer Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3015');
    // Wait for the app to load
    await page.waitForSelector('.bg-white', { timeout: 10000 });
  });

  test('clicking image thumbnail opens properties panel', async ({ page }) => {
    // Wait for media items to load
    await page.waitForSelector('.group', { timeout: 10000 });
    
    // Click on the first media item container (not just the image)
    const firstItem = page.locator('.group').first();
    await firstItem.click();
    
    // Check that the details sidebar is visible (shows "Details" not "Properties")
    await expect(page.locator('text=Details').first()).toBeVisible({ timeout: 5000 });
  });

  test('clicking eye icon opens quick view', async ({ page }) => {
    // Wait for media items to load
    await page.waitForSelector('.group', { timeout: 10000 });
    
    // Hover over the first media item to show action buttons
    const firstItem = page.locator('.group').first();
    await firstItem.hover();
    
    // Click the eye icon
    const eyeButton = firstItem.locator('button[aria-label="Quick view"]');
    await eyeButton.click();
    
    // Check that the quick view modal is visible
    await expect(page.locator('.fixed.inset-0.z-30')).toBeVisible({ timeout: 5000 });
    
    // Check for navigation arrows
    await expect(page.locator('button[title*="Previous"]')).toBeVisible();
    await expect(page.locator('button[title*="Next"]')).toBeVisible();
  });

  test('arrow navigation works in quick view', async ({ page }) => {
    // Wait for media items to load
    await page.waitForSelector('.group', { timeout: 10000 });
    
    // Get all media items
    const mediaItems = page.locator('.group');
    const itemCount = await mediaItems.count();
    
    if (itemCount < 2) {
      console.log('Not enough items to test navigation');
      return;
    }
    
    // Hover and click eye icon on first item
    const firstItem = mediaItems.first();
    await firstItem.hover();
    await firstItem.locator('button[aria-label="Quick view"]').click();
    
    // Wait for quick view to open
    await page.waitForSelector('.fixed.inset-0.z-30', { timeout: 5000 });
    
    // Get the initial image src
    const initialSrc = await page.locator('.fixed.inset-0.z-30 img').first().getAttribute('src');
    
    // Click next arrow
    await page.locator('button[title*="Next"]').click();
    
    // Wait a moment for navigation
    await page.waitForTimeout(500);
    
    // Check that the image changed
    const nextSrc = await page.locator('.fixed.inset-0.z-30 img').first().getAttribute('src');
    expect(nextSrc).not.toBe(initialSrc);
    
    // Click previous arrow
    await page.locator('button[title*="Previous"]').click();
    
    // Wait a moment for navigation
    await page.waitForTimeout(500);
    
    // Check that we're back to the original image
    const prevSrc = await page.locator('.fixed.inset-0.z-30 img').first().getAttribute('src');
    expect(prevSrc).toBe(initialSrc);
  });

  test('star and favorite buttons work', async ({ page }) => {
    // Wait for media items to load
    await page.waitForSelector('.group', { timeout: 10000 });
    
    // Hover over the first media item
    const firstItem = page.locator('.group').first();
    await firstItem.hover();
    
    // Click the star button
    const starButton = firstItem.locator('button[aria-label*="star" i]');
    await starButton.click();
    
    // Verify the star button shows as active
    // The Star component (Lucide icon) gets the text-yellow-500 class, not the raw svg
    // Check if the button's aria-label changed to "Remove star" which indicates it's starred
    await expect(starButton).toHaveAttribute('aria-label', 'Remove star');
    
    // Click the heart button
    const heartButton = firstItem.locator('button[aria-label*="favorite" i]');
    await heartButton.click();
    
    // Verify the heart button shows as active
    // Check if the button's aria-label changed to "Remove from favorites" which indicates it's favorited
    await expect(heartButton).toHaveAttribute('aria-label', 'Remove from favorites');
  });
});