import { NicheConfig } from './types';

export const NICHE_CONFIGS: NicheConfig[] = [
    {
        id: 'climate',
        label: 'Climate / CleanTech',
        icon: '🌍',
        descriptionPlaceholder: 'Describe your climate solution, clean energy tech, or industrial decarbonization...',
        fields: [
            { key: 'sector', label: 'Sector', icon: '🌱', placeholder: 'e.g., Clean Energy, Direct Air Capture, Storage, Decarbonization', type: 'text' },
            { key: 'region', label: 'Geographic Focus', icon: '📍', placeholder: 'e.g., Europe, Global, North America', type: 'text' },
            { key: 'impactMetric', label: 'Impact Metric', icon: '📊', placeholder: 'e.g., €/kg H2, $/ton CO2, $/kWh storage', type: 'text' },
            { key: 'targetAudience', label: 'Target Customers', icon: '👥', placeholder: 'e.g., Utilities, Grid Operators, Heavy Industry', type: 'text' },
        ]
    },
    {
        id: 'ai',
        label: 'AI & DeepTech',
        icon: '🤖',
        descriptionPlaceholder: 'Describe your AI agent system, formal verification tool, or developer platform...',
        fields: [
            { key: 'appUrl', label: 'Product / Demo URL', icon: '🌐', placeholder: 'https://your-platform.com', type: 'url' },
            { key: 'githubUrl', label: 'GitHub Repository', icon: '🐙', placeholder: 'https://github.com/org/repo', type: 'url' },
            { key: 'targetAudience', label: 'Target Users', icon: '👥', placeholder: 'e.g., Enterprise DevOps, AI Engineers, Security Teams', type: 'text' },
            { key: 'competitors', label: 'Competitors', icon: '⚔️', placeholder: 'e.g., OpenAI, Anthropic, LangChain', type: 'text' },
        ]
    }
];
