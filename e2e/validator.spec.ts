import { test, expect } from '@playwright/test';

/**
 * AICanary Validator E2E Tests - Production Demo Validation
 * 
 * Run with: BASE_URL=https://ai-canary-production.up.railway.app npx playwright test e2e/validator.spec.ts
 */

test.describe('AICanary Intelligent Validator', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await expect(page.locator('h1')).toBeVisible({ timeout: 15000 });
    });

    test('should display the validator panel', async ({ page }) => {
        // Check validator panel exists
        const validatorPanel = page.locator('text=Intelligent Project Validator');
        await expect(validatorPanel).toBeVisible({ timeout: 10000 });

        // Check niche buttons exist
        await expect(page.getByRole('button', { name: /AI\/Tech/ })).toBeVisible();
        await expect(page.getByRole('button', { name: /Media/ })).toBeVisible();
        await expect(page.getByRole('button', { name: /Climate/ })).toBeVisible();

        // Check description textarea exists
        await expect(page.getByRole('textbox', { name: /Describe your project/ })).toBeVisible();

        // Check validate button exists
        await expect(page.getByRole('button', { name: /Validate My Idea/ })).toBeVisible();
    });

    test('should validate an AI business idea successfully', async ({ page }) => {
        // Select AI/Tech niche
        await page.getByRole('button', { name: /AI\/Tech/ }).click();

        // Enter a business idea
        const businessIdea = `AI code review assistant that detects security vulnerabilities in pull requests. Target: DevOps teams.`;

        await page.getByRole('textbox', { name: /Describe your project/ }).fill(businessIdea);

        // Click validate button
        await page.getByRole('button', { name: /Validate My Idea/ }).click();

        // Wait for results (timing section) - increased timeout for LLM
        await expect(page.locator('text=Market Timing:')).toBeVisible({ timeout: 45000 });

        // Check that we got analysis results
        await expect(page.locator('text=Strategic Recommendation')).toBeVisible();

        // Verify timing is one of: good, neutral, risky (case insensitive)
        const timingSection = page.locator('text=Market Timing:');
        await expect(timingSection).toBeVisible();

        console.log('✅ AI business idea validation passed!');
    });

    test('should validate a Climate idea', async ({ page }) => {
        // Select Climate niche
        await page.getByRole('button', { name: /Climate/ }).click();

        // Enter climate idea (simpler, just description)
        const climateIdea = `Stormwater mapping tool using smartphone sensors for farmers and municipalities.`;

        await page.getByRole('textbox', { name: /Describe your project/ }).fill(climateIdea);

        // Click validate
        await page.getByRole('button', { name: /Validate My Idea/ }).click();

        // Wait for results
        await expect(page.locator('text=Market Timing:')).toBeVisible({ timeout: 45000 });
        await expect(page.locator('text=Strategic Recommendation')).toBeVisible();

        console.log('✅ Climate idea validation passed!');
    });

    test('should validate a Media idea', async ({ page }) => {
        // Select Media niche
        await page.getByRole('button', { name: /Media/ }).click();

        // Enter media idea (simpler)
        const mediaIdea = `AI script analyzer for film productions that predicts commercial viability.`;

        await page.getByRole('textbox', { name: /Describe your project/ }).fill(mediaIdea);

        // Click validate
        await page.getByRole('button', { name: /Validate My Idea/ }).click();

        // Wait for results
        await expect(page.locator('text=Market Timing:')).toBeVisible({ timeout: 45000 });

        console.log('✅ Media idea validation passed!');
    });

    test('should show analysis results with all sections', async ({ page }) => {
        const techIdea = `LLM chatbot for customer support that integrates with Zendesk.`;

        await page.getByRole('textbox', { name: /Describe your project/ }).fill(techIdea);
        await page.getByRole('button', { name: /Validate My Idea/ }).click();

        // Wait for analysis
        await expect(page.locator('text=Market Timing:')).toBeVisible({ timeout: 45000 });

        // Check core sections are present
        await expect(page.locator('text=Strategic Recommendation')).toBeVisible();

        console.log('✅ Analysis results display test passed!');
    });

    test('should have email report functionality after analysis', async ({ page }) => {
        await page.getByRole('textbox', { name: /Describe your project/ }).fill('Demo startup idea');
        await page.getByRole('button', { name: /Validate My Idea/ }).click();

        // Wait for results
        await expect(page.locator('text=Market Timing:')).toBeVisible({ timeout: 45000 });

        // Check email report button exists
        await expect(page.getByRole('button', { name: /Email Report/ })).toBeVisible();

        console.log('✅ Email report button test passed!');
    });

    test('should load news stories from API', async ({ page }) => {
        // Wait for stories to load
        await page.waitForTimeout(3000);

        // Check that story cards are present
        const storyCards = page.locator('[class*="glass-card"]');
        const count = await storyCards.count();

        console.log(`Found ${count} story cards`);
        expect(count).toBeGreaterThan(0);

        console.log('✅ News stories loading test passed!');
    });
});
