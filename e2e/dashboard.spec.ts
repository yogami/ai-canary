import { test, expect } from '@playwright/test';

/**
 * AICanary E2E Test Suite
 * 
 * Tests the core happy paths and edge cases for the AI ecosystem monitor dashboard.
 * Following Berlin AI Studio TDD standards (RULES.md compliance).
 */

test.describe('AICanary Dashboard', () => {

    // ============================================
    // HAPPY PATH TESTS
    // ============================================

    test.describe('Happy Paths', () => {

        test('should load dashboard with header and stats', async ({ page }) => {
            await page.goto('/');

            // Verify header branding
            await expect(page.locator('h1')).toContainText('AICanary');
            await expect(page.locator('text=Real-time AI ecosystem intelligence')).toBeVisible();

            // Verify live indicator
            await expect(page.locator('text=Live')).toBeVisible();

            // Verify stats cards are present
            await expect(page.locator('text=Stories Today')).toBeVisible();
            await expect(page.locator('text=Bullish')).toBeVisible();
            await expect(page.locator('text=Bearish')).toBeVisible();
        });

        test('should display news stories from API', async ({ page }) => {
            await page.goto('/');

            // Wait for stories to load (loader should disappear)
            await expect(page.locator('text=Loading AI ecosystem intelligence')).not.toBeVisible({ timeout: 10000 });

            // Verify at least one story card is displayed
            const storyCards = page.locator('.glass-card').filter({ hasText: 'Alert Me' });
            await expect(storyCards.first()).toBeVisible({ timeout: 10000 });

            // Verify story has expected elements
            const firstCard = storyCards.first();
            await expect(firstCard.locator('button:has-text("Alert Me")')).toBeVisible();
        });

        test('should filter stories when searching', async ({ page }) => {
            await page.goto('/');

            // Wait for initial load
            await expect(page.locator('text=Loading AI ecosystem intelligence')).not.toBeVisible({ timeout: 10000 });

            // Get initial story count
            const initialCards = page.locator('.glass-card').filter({ hasText: 'Alert Me' });
            const initialCount = await initialCards.count();
            expect(initialCount).toBeGreaterThan(0);

            // Search for a specific term
            const searchBox = page.locator('input[placeholder*="Search AI news"]');
            await searchBox.fill('technology');

            // Results should update (may be same or fewer)
            await page.waitForTimeout(500);
            const filteredCards = page.locator('.glass-card').filter({ hasText: 'Alert Me' });
            const filteredCount = await filteredCards.count();

            // Either shows filtered results or "No stories found" message
            if (filteredCount === 0) {
                await expect(page.locator('text=No stories found')).toBeVisible();
            } else {
                expect(filteredCount).toBeLessThanOrEqual(initialCount);
            }
        });

        test('should show success toast when clicking Alert Me', async ({ page }) => {
            await page.goto('/');

            // Wait for stories to load
            await expect(page.locator('text=Loading AI ecosystem intelligence')).not.toBeVisible({ timeout: 10000 });

            // Click first Alert Me button
            const alertButton = page.locator('button:has-text("Alert Me")').first();
            await alertButton.click();

            // Verify success toast appears
            await expect(page.locator('text=Alert set for')).toBeVisible({ timeout: 5000 });
        });

        test('should display sentiment badges correctly', async ({ page }) => {
            await page.goto('/');

            // Wait for stories to load
            await expect(page.locator('text=Loading AI ecosystem intelligence')).not.toBeVisible({ timeout: 10000 });

            // Check that sentiment badges exist (at least one type)
            const bullishBadge = page.locator('text=🚀 Bullish');
            const bearishBadge = page.locator('text=📉 Bearish');
            const neutralBadge = page.locator('text=⚖️ Neutral');

            // At least one sentiment type should be visible
            const hasBullish = await bullishBadge.count() > 0;
            const hasBearish = await bearishBadge.count() > 0;
            const hasNeutral = await neutralBadge.count() > 0;

            expect(hasBullish || hasBearish || hasNeutral).toBe(true);
        });

        test('should display coverage percentage on story cards', async ({ page }) => {
            await page.goto('/');

            // Wait for stories to load
            await expect(page.locator('text=Loading AI ecosystem intelligence')).not.toBeVisible({ timeout: 10000 });

            // Verify coverage indicator exists
            await expect(page.locator('text=/\\d+% coverage/').first()).toBeVisible();
        });

    });

    // ============================================
    // EDGE CASE TESTS
    // ============================================

    test.describe('Edge Cases', () => {

        test('should handle empty search gracefully', async ({ page }) => {
            await page.goto('/');

            // Wait for initial load
            await expect(page.locator('text=Loading AI ecosystem intelligence')).not.toBeVisible({ timeout: 10000 });

            // Type and then clear search
            const searchBox = page.locator('input[placeholder*="Search AI news"]');
            await searchBox.fill('test');
            await searchBox.clear();

            // Stories should still be visible
            const storyCards = page.locator('.glass-card').filter({ hasText: 'Alert Me' });
            await expect(storyCards.first()).toBeVisible();
        });

        test('should handle search with no results', async ({ page }) => {
            await page.goto('/');

            // Wait for initial load
            await expect(page.locator('text=Loading AI ecosystem intelligence')).not.toBeVisible({ timeout: 10000 });

            // Search for a term that won't match
            const searchBox = page.locator('input[placeholder*="Search AI news"]');
            await searchBox.fill('xyznonexistentterm123456');

            await page.waitForTimeout(500);

            // Should show "No stories found" message
            await expect(page.locator('text=No stories found')).toBeVisible();
        });

        test('should display footer with hackathon branding', async ({ page }) => {
            await page.goto('/');

            // Scroll to bottom
            await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

            // Verify footer content
            await expect(page.locator('text=AI Hackday Berlin')).toBeVisible();
            await expect(page.locator('text=AskNews')).toBeVisible();
            await expect(page.locator('text=ActivePieces')).toBeVisible();
        });

        test('should be responsive on mobile viewport', async ({ page }) => {
            // Set mobile viewport
            await page.setViewportSize({ width: 375, height: 667 });
            await page.goto('/');

            // Header should still be visible
            await expect(page.locator('h1')).toContainText('AICanary');

            // Stats should still be visible
            await expect(page.locator('text=Stories Today')).toBeVisible();
        });

        test('alert toast should auto-dismiss', async ({ page }) => {
            await page.goto('/');

            // Wait for stories to load
            await expect(page.locator('text=Loading AI ecosystem intelligence')).not.toBeVisible({ timeout: 10000 });

            // Click Alert Me
            await page.locator('button:has-text("Alert Me")').first().click();

            // Toast should appear
            await expect(page.locator('text=Alert set for')).toBeVisible({ timeout: 3000 });

            // Toast should auto-dismiss after ~3 seconds
            await expect(page.locator('text=Alert set for')).not.toBeVisible({ timeout: 5000 });
        });

    });

    // ============================================
    // API INTEGRATION TESTS
    // ============================================

    test.describe('API Integration', () => {

        test('news API should return valid response', async ({ request }) => {
            const response = await request.get('/api/news');
            expect(response.ok()).toBe(true);

            const data = await response.json();
            expect(data.success).toBe(true);
            expect(Array.isArray(data.stories)).toBe(true);
        });

        test('alert API should handle POST request', async ({ request }) => {
            const response = await request.post('/api/alert', {
                data: {
                    story: { headline: 'Test Story' },
                    channel: 'slack'
                }
            });

            expect(response.ok()).toBe(true);
            const data = await response.json();
            expect(data.success).toBe(true);
        });

        test('news API should include required story fields', async ({ request }) => {
            const response = await request.get('/api/news');
            const data = await response.json();

            if (data.stories.length > 0) {
                const story = data.stories[0];
                expect(story).toHaveProperty('uuid');
                expect(story).toHaveProperty('headline');
                expect(story).toHaveProperty('sentiment');
            }
        });

    });

});
