import { NicheConfig } from './types';

export const NICHE_CONFIGS: NicheConfig[] = [
    {
        id: 'ai',
        label: 'AI/Tech',
        icon: '🤖',
        descriptionPlaceholder: 'Describe your AI/tech product, API, or SaaS...',
        fields: [
            { key: 'appUrl', label: 'App/Website URL', icon: '🌐', placeholder: 'https://your-app.com', type: 'url' },
            { key: 'githubUrl', label: 'GitHub Repo', icon: '🐙', placeholder: 'https://github.com/user/repo', type: 'url' },
            { key: 'targetAudience', label: 'Target Users', icon: '👥', placeholder: 'e.g., DevOps teams, CTOs, indie developers', type: 'text' },
            { key: 'competitors', label: 'Competitors', icon: '⚔️', placeholder: 'e.g., OpenAI, Anthropic, Hugging Face', type: 'text' },
        ]
    },
    {
        id: 'media',
        label: 'Film/TV',
        icon: '🎬',
        descriptionPlaceholder: 'Describe your film, show concept, or script idea...',
        fields: [
            { key: 'genre', label: 'Genre', icon: '🎭', placeholder: 'e.g., Sci-Fi Thriller, Drama, Documentary', type: 'text' },
            { key: 'format', label: 'Format', icon: '📺', placeholder: 'e.g., Feature Film, Series, Short', type: 'text' },
            { key: 'budget', label: 'Budget Range', icon: '💵', placeholder: 'e.g., Low (<$1M), Mid ($1-10M), High (>$10M)', type: 'text' },
            { key: 'comparables', label: 'Comparable Films', icon: '🎥', placeholder: 'e.g., Ex Machina, Black Mirror, Arrival', type: 'text' },
        ]
    },
    {
        id: 'music',
        label: 'Music',
        icon: '🎵',
        descriptionPlaceholder: 'Describe your music project, album concept, or artist brand...',
        fields: [
            { key: 'genre', label: 'Genre/Style', icon: '🎸', placeholder: 'e.g., Indie Pop, Electronic, Hip-Hop', type: 'text' },
            { key: 'demoUrl', label: 'Demo/Sample Link', icon: '🔗', placeholder: 'https://soundcloud.com/... or spotify link', type: 'url' },
            { key: 'artistType', label: 'Artist Type', icon: '🎤', placeholder: 'e.g., Solo artist, Band, Producer, Label', type: 'text' },
            { key: 'comparables', label: 'Similar Artists', icon: '👥', placeholder: 'e.g., Billie Eilish, The Weeknd, Daft Punk', type: 'text' },
        ]
    },
    {
        id: 'gaming',
        label: 'Gaming',
        icon: '🎮',
        descriptionPlaceholder: 'Describe your game concept, mechanics, and vision...',
        fields: [
            { key: 'genre', label: 'Game Genre', icon: '🕹️', placeholder: 'e.g., RPG, FPS, Puzzle, Indie', type: 'text' },
            { key: 'platform', label: 'Platform', icon: '💻', placeholder: 'e.g., PC, Mobile, Console, VR', type: 'text' },
            { key: 'demoUrl', label: 'Demo/Trailer Link', icon: '🎬', placeholder: 'https://itch.io/... or Steam page', type: 'url' },
            { key: 'comparables', label: 'Similar Games', icon: '🎯', placeholder: 'e.g., Stardew Valley, Hollow Knight, Hades', type: 'text' },
        ]
    },
    {
        id: 'fintech',
        label: 'FinTech',
        icon: '💰',
        descriptionPlaceholder: 'Describe your financial product, payment solution, or trading tool...',
        fields: [
            { key: 'appUrl', label: 'Product URL', icon: '🌐', placeholder: 'https://your-fintech.com', type: 'url' },
            { key: 'region', label: 'Target Region', icon: '🌍', placeholder: 'e.g., EU, US, APAC, Global', type: 'text' },
            { key: 'compliance', label: 'Compliance Needs', icon: '📋', placeholder: 'e.g., PSD2, SOC2, GDPR, None yet', type: 'text' },
            { key: 'competitors', label: 'Competitors', icon: '⚔️', placeholder: 'e.g., Stripe, Plaid, Revolut', type: 'text' },
        ]
    },
    {
        id: 'healthcare',
        label: 'HealthTech',
        icon: '🏥',
        descriptionPlaceholder: 'Describe your health solution, medical device, or wellness app...',
        fields: [
            { key: 'appUrl', label: 'Product URL', icon: '🌐', placeholder: 'https://your-health-app.com', type: 'url' },
            { key: 'category', label: 'Category', icon: '🩺', placeholder: 'e.g., Diagnostics, Wellness, Telehealth, Devices', type: 'text' },
            { key: 'regulatory', label: 'Regulatory Path', icon: '📋', placeholder: 'e.g., FDA, CE Mark, HIPAA, None yet', type: 'text' },
            { key: 'targetAudience', label: 'Target Users', icon: '👥', placeholder: 'e.g., Patients, Clinicians, Hospitals', type: 'text' },
        ]
    },
    {
        id: 'climate',
        label: 'Climate',
        icon: '🌍',
        descriptionPlaceholder: 'Describe your climate solution, sustainability tool, or green tech...',
        fields: [
            { key: 'sector', label: 'Sector', icon: '🌱', placeholder: 'e.g., Energy, Agriculture, Transport, Construction', type: 'text' },
            { key: 'region', label: 'Geographic Focus', icon: '📍', placeholder: 'e.g., Europe, Global, Developing markets', type: 'text' },
            { key: 'impactMetric', label: 'Impact Metric', icon: '📊', placeholder: 'e.g., CO2 reduced, Water saved, Land restored', type: 'text' },
            { key: 'targetAudience', label: 'Target Users', icon: '👥', placeholder: 'e.g., Municipalities, Farmers, Corporations', type: 'text' },
        ]
    },
];
