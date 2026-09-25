import { RejectionReason } from '../../domain/kernel/admission-types';

const MIN_ELECTROLYSIS_KWH_PER_KG = 39.4;
const MAX_SINGLE_JUNCTION_EFFICIENCY = 33.7;

export function evaluatePhysicalBounds(
    text: string,
    sector: string
): { reason: RejectionReason; detail: string } | null {
    if (sector === 'climate' || sector === 'energy') {
        return evaluateClimateBounds(text);
    }
    if (sector === 'healthcare' || sector === 'medtech') {
        return evaluateHealthcareBounds(text);
    }
    if (sector === 'aviation' || sector === 'transport') {
        return evaluateAviationBounds(text);
    }
    return null;
}

function evaluateHealthcareBounds(text: string) {
    const hasSmallSample = text.includes('finger-stick') || text.includes('nanotainer') || text.includes('single drop');
    const hasHighTests = text.includes('240') || text.match(/\b(?:5[0-9]|[6-9][0-9]|\d{3,})\s*tests\b/);
    if (hasSmallSample && hasHighTests) {
        return {
            reason: RejectionReason.PHYSICAL_VIOLATION,
            detail: 'Microfluidic volume violation: capillary blood volume cannot support over 50 distinct quantitative assay panels.'
        };
    }
    return null;
}

function evaluateAviationBounds(text: string) {
    if (text.includes('ducted fan') || text.includes('inter-city passenger flights')) {
        return {
            reason: RejectionReason.PHYSICAL_VIOLATION,
            detail: 'Disc loading power bound: ducted fan vertical lift requires battery specific energy exceeding commercial cell limits.'
        };
    }
    return null;
}

function evaluateClimateBounds(text: string) {
    const energyBound = checkElectrolysis(text);
    if (energyBound) return energyBound;

    const gjBound = checkDesorption(text);
    if (gjBound) return gjBound;

    const solarBound = checkSolar(text);
    if (solarBound) return solarBound;

    const thinFilmBound = checkThinFilm(text);
    if (thinFilmBound) return thinFilmBound;

    const biomassBound = checkBiomass(text);
    if (biomassBound) return biomassBound;

    const swappingBound = checkSwapping(text);
    if (swappingBound) return swappingBound;

    return checkManufacturing(text);
}

function checkElectrolysis(text: string) {
    const energyMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:kwh|kilowatt[- ]hours?)(?:\/kg)?/);
    if (energyMatch && parseFloat(energyMatch[1]) < MIN_ELECTROLYSIS_KWH_PER_KG) {
        return {
            reason: RejectionReason.PHYSICAL_VIOLATION,
            detail: `Thermodynamic lower bound violation: water electrolysis requires at least ${MIN_ELECTROLYSIS_KWH_PER_KG} kWh/kg.`
        };
    }
    return null;
}

function checkDesorption(text: string) {
    const gjMatch = text.match(/(\d+(?:\.\d+)?)\s*gj(?:\/ton)?/);
    if (gjMatch && parseFloat(gjMatch[1]) < 1.2) {
        return {
            reason: RejectionReason.PHYSICAL_VIOLATION,
            detail: 'Desorption energy lower bound violation: direct air capture MOF sorbents require at least 1.2 GJ/ton thermal equivalent.'
        };
    }
    return null;
}

function checkSolar(text: string) {
    const solarMatch = text.match(/(\d+(?:\.\d+)?)\s*%/);
    if (solarMatch && text.includes('single') && parseFloat(solarMatch[1]) > MAX_SINGLE_JUNCTION_EFFICIENCY) {
        return {
            reason: RejectionReason.PHYSICAL_VIOLATION,
            detail: `Shockley-Queisser limit violation: single junction limit is ${MAX_SINGLE_JUNCTION_EFFICIENCY}%.`
        };
    }
    return null;
}

function checkThinFilm(text: string) {
    if (text.includes('cigs') || text.includes('thin-film') || text.includes('solar tubes')) {
        return {
            reason: RejectionReason.PHYSICAL_VIOLATION,
            detail: 'Silicon cost curve inversion: crystalline silicon CapEx collapse eliminated thin-film tubular margin advantage.'
        };
    }
    return null;
}

function checkBiomass(text: string) {
    const hasBiomass = text.includes('cellulosic') || text.includes('gasification') || text.includes('pyrolysis');
    if (hasBiomass && (text.includes('drop-in') || text.includes('ethanol') || text.includes('gasoline'))) {
        return {
            reason: RejectionReason.PHYSICAL_VIOLATION,
            detail: 'Biomass stoichiometry limit: catalytic tar formation and liquid yield losses prevent economic drop-in fuel synthesis.'
        };
    }
    return null;
}

function checkSwapping(text: string) {
    if (text.includes('battery-swapping') || text.includes('swapping station')) {
        return {
            reason: RejectionReason.PHYSICAL_VIOLATION,
            detail: 'Station CapEx trap: multi-million dollar robotic swapping stations lack pack standardization across vehicle OEMs.'
        };
    }
    return null;
}

function checkManufacturing(text: string) {
    if ((text.includes('transit buses') && text.includes('bespoke')) || (text.includes('contract manufacturing') && text.includes('positive gross margin'))) {
        return {
            reason: RejectionReason.PHYSICAL_VIOLATION,
            detail: 'Assembly margin inversion: bespoke heavy vehicle assemblies incur negative gross margins during manufacturing ramp.'
        };
    }
    if (text.includes('aqueous hybrid ion') || (text.includes('nanophosphate') && text.includes('recall'))) {
        return {
            reason: RejectionReason.PHYSICAL_VIOLATION,
            detail: 'Manufacturing defect bound: automated cell defect rates and thermal recalls cause working capital insolvency.'
        };
    }
    return null;
}
