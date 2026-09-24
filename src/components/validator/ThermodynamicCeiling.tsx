'use client';

import React from 'react';

interface ThermodynamicCeilingProps {
    activeScenario: string | null;
}

export default function ThermodynamicCeiling({ activeScenario }: ThermodynamicCeilingProps) {
    const isNikola = activeScenario === 'caseNikola';
    const targetPrice = isNikola ? '$1.00 / kg' : '€1.80 / kg';
    const maxTariff = isNikola ? '≤ $19.20 / MWh ($0.019/kWh)' : '≤ €34.60 / MWh (€0.035/kWh)';

    return (
        <div className="bg-slate-950/90 border border-emerald-500/40 rounded-xl p-4 my-2 shadow-inner">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-500/20 pb-2.5 mb-3">
                <div className="flex items-center gap-2">
                    <span className="text-base">⚡</span>
                    <div>
                        <h5 className="text-emerald-300 font-bold text-xs uppercase tracking-wider">
                            Thermodynamic Electricity Ceiling Identity
                        </h5>
                        <p className="text-[11px] text-gray-400">
                            Physical lower bound: Power Tariff versus Stated Hydrogen Cost Target
                        </p>
                    </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Physical Boundary Check
                </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-center mb-3">
                <div className="bg-black/40 border border-white/10 rounded-lg p-2.5">
                    <span className="text-[10px] text-gray-400 block uppercase">Stack Consumption</span>
                    <span className="text-white font-mono font-bold text-sm">43 - 52 kWh / kg H₂</span>
                </div>
                <div className="bg-black/40 border border-white/10 rounded-lg p-2.5">
                    <span className="text-[10px] text-gray-400 block uppercase">Claimed H₂ Target</span>
                    <span className="text-emerald-400 font-mono font-bold text-sm">{targetPrice}</span>
                </div>
                <div className="bg-black/40 border border-emerald-500/30 rounded-lg p-2.5">
                    <span className="text-[10px] text-emerald-300 block uppercase">Max Permissible Power Tariff</span>
                    <span className="text-amber-300 font-mono font-bold text-sm">{maxTariff}</span>
                </div>
            </div>

            <div className="text-[11px] text-gray-300 bg-emerald-950/20 border border-emerald-500/20 rounded-lg p-2.5 leading-relaxed">
                <span className="text-emerald-400 font-semibold">The Diligence Gate:</span> Electricity-Only Lower Bound = Consumption (52 kWh/kg) × Power Price (€/kWh). At €1.80/kg sales price, the power price ceiling is strictly ≤ €34.60/MWh (€0.035/kWh) <em className="text-amber-300 font-medium">before</em> accounting for stack CapEx, balance-of-plant, storage, transport, or compression. Any pitch assuming commercial European grid power (€60-120/MWh) violates this thermodynamic ceiling.
            </div>
        </div>
    );
}
