export interface ICPunchListItem {
    question: string;
    targetRisk: string;
    whyItExposesFraud: string;
}

export function getDomainICPunchList(sector: string): ICPunchListItem[] {
    if (sector === 'climate' || sector === 'energy') {
        return [
            {
                question: 'What verified electricity tariff guarantees positive margin when stack consumption is 52 kWh/kg?',
                targetRisk: 'Thermodynamic margin collapse',
                whyItExposesFraud: 'Power cost alone exceeds off-take contract price under prevailing regional tariffs.'
            },
            {
                question: 'Has the single-junction efficiency claim been independently audited by NREL or Fraunhofer?',
                targetRisk: 'Unphysical conversion efficiency',
                whyItExposesFraud: 'Claims exceeding the Shockley-Queisser limit require multi-junction tandem physics.'
            },
            {
                question: 'What is the measured degradation rate after 5,000 hours of continuous operational load cycling?',
                targetRisk: 'Stack durability warranty liability',
                whyItExposesFraud: 'Accelerated membrane failure causes catastrophic balance sheet warranty claims.'
            }
        ];
    }

    return [
        {
            question: 'What is the measured multi-turn compounding error rate across a 15-step agent execution trajectory?',
            targetRisk: 'Stochastic reliability collapse',
            whyItExposesFraud: 'Single-turn benchmark claims mask compounding multi-turn workflow failure.'
        },
        {
            question: 'What is the fully loaded inference token burn per active user task under worst-case retry loops?',
            targetRisk: 'Negative contribution margin',
            whyItExposesFraud: 'Fixed subscription pricing collapses when autonomous agent loops enter recursive tool calls.'
        },
        {
            question: 'What proprietary state verification harness prevents the next foundation model release from absorbing this product?',
            targetRisk: 'Platform obsolescence',
            whyItExposesFraud: 'Shallow prompt wrappers provide zero barrier to entry against native provider tooling.'
        }
    ];
}
