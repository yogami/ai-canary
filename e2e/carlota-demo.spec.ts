import { test, expect } from '@playwright/test';

/**
 * AICanary Carlota Diligence Acceptance Test Suite
 *
 * Simulates the exact user evaluation journey:
 * 1. Loading benchmark scenarios (Nikola H2, First Solar, Solyndra, SunHydrogen, KernelGuard).
 * 2. Form auto-population and parameter binding.
 * 3. Execution of the due diligence admission control gate.
 * 4. 4-Regime Information Architecture ablation inspection (Regimes 0 to 3).
 * 5. Verification of the Thermodynamic Electricity Ceiling physical identity.
 * 6. Inspection of the 3-question Investment Committee (IC) Punch-List.
 * 7. Verification of clean craftsmanship standards (zero em-dashes, zero banned buzzwords).
 */

test.describe('AICanary Diligence Engine: Carlota Acceptance Suite', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await expect(page.locator('h1')).toContainText('AICanary');
    });

    test('should display all 5 benchmark diligence scenarios in the grid', async ({ page }) => {
        // Verify the 5 council-approved cases
        await expect(page.locator('text=Case A: Nikola H₂')).toBeVisible();
        await expect(page.locator('text=Case B: First Solar CdTe')).toBeVisible();
        await expect(page.locator('text=Case C: Solyndra CIGS')).toBeVisible();
        await expect(page.locator('text=Case D: SunHydrogen AEM')).toBeVisible();
        await expect(page.locator('text=Case E: KernelGuard Harness')).toBeVisible();
    });

    test('should populate Nikola scenario with exact pitch claims on click', async ({ page }) => {
        // Click Nikola benchmark scenario
        const nikolaCard = page.locator('button', { hasText: 'Case A: Nikola H₂' });
        await nikolaCard.click();

        // Verify active indicator
        await expect(nikolaCard).toContainText('Active');

        // Verify description textarea is populated with Nikola hydrogen claims
        const textarea = page.locator('textarea');
        const content = await textarea.inputValue();
        expect(content).toContain('Project Nikola');
        expect(content).toContain('under $1.00/kg');
        expect(content).toContain('dedicated direct solar PV arrays');

        // Verify context fields populated
        const sectorInput = page.locator('input[placeholder*="Energy, Agriculture"]').or(page.locator('input[value*="Heavy Freight"]'));
        await expect(sectorInput).toBeVisible();
    });

    test('should toggle all 4 ablation regimes and render distinct architectural layers', async ({ page }) => {
        // Load Nikola scenario
        await page.locator('button', { hasText: 'Case A: Nikola H₂' }).click();

        // Click Run Due Diligence Gate
        const runButton = page.locator('button', { hasText: 'Run Due Diligence Gate' });
        await runButton.click();

        // Wait for results container to appear
        const ablationSwitcher = page.locator('text=Information Architecture Ablation Switcher');
        await expect(ablationSwitcher).toBeVisible({ timeout: 60000 });

        // Verify all 4 regime buttons exist
        const regime0Btn = page.locator('button', { hasText: 'Regime 0' });
        const regime1Btn = page.locator('button', { hasText: 'Regime 1' });
        const regime2Btn = page.locator('button', { hasText: 'Regime 2' });
        const regime3Btn = page.locator('button', { hasText: 'Regime 3' });

        await expect(regime0Btn).toBeVisible();
        await expect(regime1Btn).toBeVisible();
        await expect(regime2Btn).toBeVisible();
        await expect(regime3Btn).toBeVisible();

        // Regime 3 is active by default: verify IC Punch-List and Thermodynamic Ceiling
        await expect(page.locator('text=Investment Committee Punch-List')).toBeVisible();
        await expect(page.locator('text=Thermodynamic Electricity Ceiling Identity')).toBeVisible();
        await expect(page.locator('text=43 - 52 kWh / kg H₂')).toBeVisible();

        // Switch to Regime 0 (Raw Frontier Model)
        await regime0Btn.click();
        await expect(page.locator('text=Regime 0: Raw Frontier Model')).toBeVisible();
        await expect(page.locator('text=Credulity Bias Failure')).toBeVisible();
        await expect(page.locator('text=Fatal False Positive')).toBeVisible();

        // Switch to Regime 1 (Tool Retrieval / RAG)
        await regime1Btn.click();
        await expect(page.locator('text=Regime 1: Tool & Web Retrieval')).toBeVisible();
        await expect(page.locator('text=The RAG Diligence Blindspot')).toBeVisible();

        // Switch to Regime 2 (Memory Quarantine)
        await regime2Btn.click();
        await expect(page.locator('text=Regime 2: Write-Ahead Admission')).toBeVisible();
        await expect(page.locator('text=Verified & Plausible Claims').first()).toBeVisible();
        await expect(page.locator('text=Quarantined Assertions').first()).toBeVisible();
    });

    test('should verify Thermodynamic Electricity Ceiling identity formula and tariff limits', async ({ page }) => {
        // Load SunHydrogen scenario
        await page.locator('button', { hasText: 'Case D: SunHydrogen AEM' }).click();

        // Submit analysis
        await page.locator('button', { hasText: 'Run Due Diligence Gate' }).click();

        // Wait for results
        await expect(page.locator('text=Information Architecture Ablation Switcher')).toBeVisible({ timeout: 60000 });

        // Ensure Regime 3 is selected
        await page.locator('button', { hasText: 'Regime 3' }).click();

        // Check Thermodynamic Ceiling values for SunHydrogen (€1.80/kg H2)
        await expect(page.locator('text=Thermodynamic Electricity Ceiling Identity')).toBeVisible();
        await expect(page.locator('text=43 - 52 kWh / kg H₂')).toBeVisible();
        await expect(page.locator('text=€1.80 / kg')).toBeVisible();
        await expect(page.locator('text=≤ €34.60 / MWh')).toBeVisible();
    });

    test('should verify 3-question Investment Committee punch-list structure', async ({ page }) => {
        // Load Nikola
        await page.locator('button', { hasText: 'Case A: Nikola H₂' }).click();
        await page.locator('button', { hasText: 'Run Due Diligence Gate' }).click();

        await expect(page.locator('text=Information Architecture Ablation Switcher')).toBeVisible({ timeout: 60000 });
        await page.locator('button', { hasText: 'Regime 3' }).click();

        // Verify the 3-question punch list exists
        const punchListHeading = page.locator('text=Investment Committee Punch-List (The IC 3)');
        await expect(punchListHeading).toBeVisible();

        // Verify structure has Target Risk and Why This Matters
        await expect(page.locator('text=Target Risk:').first()).toBeVisible();
        await expect(page.locator('text=Why This Matters:').first()).toBeVisible();
    });

    test('should maintain strict tone: zero em-dashes and zero banned buzzwords in rendered UI', async ({ page }) => {
        // Load and run
        await page.locator('button', { hasText: 'Case A: Nikola H₂' }).click();
        await page.locator('button', { hasText: 'Run Due Diligence Gate' }).click();

        await expect(page.locator('text=Information Architecture Ablation Switcher')).toBeVisible({ timeout: 60000 });

        const pageText = await page.locator('body').innerText();

        // Enforce rule: No em-dashes anywhere in user-facing text
        expect(pageText).not.toContain('—');

        // Enforce rule: No banned buzzwords in user-facing text
        const bannedWords = ['delve', 'testament', 'revolutionize', 'synergistic'];
        for (const word of bannedWords) {
            expect(pageText.toLowerCase()).not.toContain(word);
        }
    });

    test('should open Empirical Benchmark Evals modal and display comparative metrics across all 3 tracks', async ({ page }) => {
        const benchmarkBtn = page.locator('button', { hasText: 'Benchmark Evals' });
        await expect(benchmarkBtn).toBeVisible();
        await benchmarkBtn.click();

        await expect(page.locator('text=Empirical Diligence Benchmark & Evals')).toBeVisible();
        await expect(page.locator('text=Track A: Raw Frontier Model')).toBeVisible();
        await expect(page.locator('text=Track B: Unfiltered Context RAG')).toBeVisible();
        await expect(page.locator('text=Track C: Full Agent Kernel')).toBeVisible();
        await expect(page.locator('text=Theranos')).toBeVisible();
        await expect(page.locator('text=Nikola H2')).toBeVisible();

        await page.locator('button', { hasText: '✕ Close' }).click();
        await expect(page.locator('text=Empirical Diligence Benchmark & Evals')).not.toBeVisible();
    });

    test('should evaluate a novel random startup and show regime shifts', async ({ page }) => {
        // Click Random Novel Startup button
        const randomBtn = page.locator('button', { hasText: 'Random Novel Startup' });
        await expect(randomBtn).toBeVisible();
        await randomBtn.click();

        // Verify description textarea is populated
        const textarea = page.locator('textarea');
        const content = await textarea.inputValue();
        expect(content.length).toBeGreaterThan(50);

        // Run Due Diligence Gate
        await page.locator('button', { hasText: 'Run Due Diligence Gate' }).click();
        await expect(page.locator('text=Information Architecture Ablation Switcher')).toBeVisible({ timeout: 60000 });

        // Verify Regime 3 has active IC Punch List
        await expect(page.locator('text=Investment Committee Punch-List')).toBeVisible();

        // Switch to Regime 0: verify Credulity Bias
        await page.locator('button', { hasText: 'Regime 0' }).click();
        await expect(page.locator('text=Regime 0: Raw Frontier Model')).toBeVisible();

        // Switch to Regime 2: verify Write-Ahead Admission
        await page.locator('button', { hasText: 'Regime 2' }).click();
        await expect(page.locator('text=Regime 2: Write-Ahead Admission')).toBeVisible();
    });

    test('should accept and diligence a free-form custom startup pitch entered by the user', async ({ page }) => {
        // Clear and type a completely novel user-authored pitch
        const textarea = page.locator('textarea');
        await textarea.fill('OmniDev: Autonomous AI software engineering agency that guarantees 100% bug-free deployments for $20/month per seat.');

        // Select AI niche
        await page.locator('button', { hasText: '🤖 AI/Tech' }).click();

        // Run Due Diligence Gate
        await page.locator('button', { hasText: 'Run Due Diligence Gate' }).click();
        await expect(page.locator('text=Information Architecture Ablation Switcher')).toBeVisible({ timeout: 60000 });

        // Regime 3: check that 100% bug-free claim was quarantined as causal inconsistency
        await page.locator('button', { hasText: 'Regime 2' }).click();
        await expect(page.locator('text=Quarantined Assertions').first()).toBeVisible();
        await expect(page.locator('text=CAUSAL_INCONSISTENCY').first()).toBeVisible();

        // Switch to Regime 0: show that raw model failed to quarantine it
        await page.locator('button', { hasText: 'Regime 0' }).click();
        await expect(page.locator('text=Credulity Bias Failure')).toBeVisible();
    });
});
