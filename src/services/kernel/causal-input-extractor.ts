export function extractCausalInputs(sector: string, pitch: string): Record<string, number> {
    const s = sector.toLowerCase();
    if (s === 'climate' || s === 'energy') {
        return extractClimateInputs(pitch);
    }
    return extractAIInputs(pitch);
}

function extractClimateInputs(pitch: string): Record<string, number> {
    const text = pitch.toLowerCase();
    const offtakeMatch = text.match(/[\$€](\d+(?:\.\d+)?)\s*(?:\/|\s*per\s*)(?:kg|ton)/);
    const kwhMatch = text.match(/(\d+(?:\.\d+)?)\s*kwh(?:\/kg)?/);
    const powerMatch = text.match(/[\$€](\d+(?:\.\d+)?)\s*(?:\/|\s*per\s*)mwh/);

    const offtake = offtakeMatch ? parseFloat(offtakeMatch[1]) : 2.0;
    const efficiency = kwhMatch ? parseFloat(kwhMatch[1]) : 52;
    const powerPrice = powerMatch ? parseFloat(powerMatch[1]) : 80;

    return {
        electricity_price: powerPrice,
        stack_efficiency: efficiency,
        market_offtake_price: offtake
    };
}

function extractAIInputs(pitch: string): Record<string, number> {
    const text = pitch.toLowerCase();
    const revMatch = text.match(/[\$€](\d+(?:\.\d+)?)\s*(?:\/|\s*per\s*)(?:task|run|compilation|seat|month)/);
    const fixedCostMatch = text.match(/(?:cost|budget)\s*(?:of|to|at)?\s*[\$€](\d+(?:\.\d+)?)\s*(?:\/|\s*per\s*)(?:run|task)/);
    const tokenMatch = text.match(/[\$€](\d+(?:\.\d+)?)\s*(?:\/|\s*per\s*)1k/);
    const turnsMatch = text.match(/(\d+)\s*[- ]*(?:turn|iteration|loop)/);

    const rev = revMatch ? parseFloat(revMatch[1]) : 0.05;
    const tokenRate = tokenMatch ? parseFloat(tokenMatch[1]) : 0.005;
    const turns = turnsMatch ? parseInt(turnsMatch[1], 10) : 15;
    const fixedCost = fixedCostMatch ? parseFloat(fixedCostMatch[1]) : undefined;

    const base: Record<string, number> = {
        token_inference_cost: tokenRate,
        agent_loop_iterations: turns,
        subscription_price_per_task: rev
    };

    if (fixedCost !== undefined) {
        base.fixed_compute_cost = fixedCost;
    }

    return base;
}
