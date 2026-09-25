import { test, expect } from '@playwright/test';
import { CausalPreFlightGate } from '../../src/services/kernel/CausalPreFlightGate';

test.describe('CausalPreFlightGate', () => {
    const gate = new CausalPreFlightGate();

    test('should construct a verified Structural Causal Model for climate tech', () => {
        const scm = gate.buildDomainSCM('climate');
        expect(scm.nodes.length).toBeGreaterThanOrEqual(4);
        expect(scm.edges.length).toBeGreaterThanOrEqual(3);

        const nodeIds = scm.nodes.map(n => n.id);
        expect(nodeIds).toContain('electricity_price');
        expect(nodeIds).toContain('stack_efficiency');
        expect(nodeIds).toContain('levelized_cost');
        expect(nodeIds).toContain('gross_margin');
    });

    test('should admit viable unit economics when margin is positive', () => {
        const scm = gate.buildDomainSCM('climate');
        const inputs = {
            electricity_price: 30, // €30/MWh (€0.03/kWh)
            stack_efficiency: 50,  // 50 kWh/kg
            market_offtake_price: 3.50 // €3.50/kg
        };

        const result = gate.preFlightCheck(scm, inputs);
        expect(result.isAdmitted).toBe(true);
        expect(result.violations.length).toBe(0);
        expect(result.calculatedMargin).toBeGreaterThan(0);
    });

    test('should trigger pre-flight violation when electricity price drives negative gross margin', () => {
        const scm = gate.buildDomainSCM('climate');
        const inputs = {
            electricity_price: 120, // €120/MWh (€0.12/kWh)
            stack_efficiency: 52,   // 52 kWh/kg -> 52 * 0.12 = €6.24/kg electricity alone!
            market_offtake_price: 2.00 // €2.00/kg
        };

        const result = gate.preFlightCheck(scm, inputs);
        expect(result.isAdmitted).toBe(false);
        expect(result.violations.length).toBeGreaterThan(0);
        expect(result.violations[0]).toContain('Negative contribution margin');
        expect(result.breakEvenThreshold).toBeDefined();
    });

    test('should compute parametric sensitivity sweep across electricity price range', () => {
        const baseline = {
            stack_efficiency: 50,
            market_offtake_price: 3.00
        };

        const prices = [10, 30, 60, 100]; // €/MWh
        const sweep = gate.runSensitivitySweep('electricity_price', prices, baseline);

        expect(sweep.length).toBe(4);
        expect(sweep[0].grossMargin).toBeGreaterThan(sweep[3].grossMargin);
        expect(sweep[3].isSolvent).toBe(false);
    });

    test('should construct SCM and evaluate inference token cost sensitivity for AI agents', () => {
        const scm = gate.buildDomainSCM('ai');
        const inputs = {
            token_inference_cost: 0.005, // $0.005 per 1k tokens
            agent_loop_iterations: 20,   // 20 turns
            subscription_price_per_task: 0.05 // $0.05 per task
        };

        const result = gate.preFlightCheck(scm, inputs);
        expect(result.isAdmitted).toBe(false);
        expect(result.violations[0]).toContain('Inference loop token burn');
    });
});
