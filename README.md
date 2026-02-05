# AICanary - Real-Time AI Ecosystem Intelligence

🐦 Never miss a market shift. Monitor competitor launches, new models, and AI ecosystem trends in real-time.

![AICanary Dashboard](docs/dashboard.png)

## Built at AI Hackday Berlin • Feb 2026

This project was built for the [AI Hackday Berlin](https://ailbuilders-hub.vercel.app/hackday/BER-Feb5-HDAY) hackathon, leveraging:
- **AskNews API** for real-time AI news intelligence
- **ActivePieces** for automation and alerts

## Features

- 📊 **Real-Time AI News Feed** - Live updates from the AI ecosystem via AskNews
- 🔍 **Smart Search** - Filter stories by keywords and topics
- 📈 **Sentiment Analysis** - Bullish/Bearish/Neutral indicators on each story
- 🔔 **Alert System** - Get notified when important stories break (via ActivePieces webhooks)
- 💜 **Premium Design** - Glassmorphism UI with smooth animations

## Tech Stack

- **Frontend**: Next.js 16 + TypeScript + Tailwind CSS
- **APIs**: AskNews (News Intelligence), ActivePieces (Automation)
- **Testing**: Playwright E2E (14 tests covering happy paths and edge cases)
- **Deployment**: Railway (recommended)

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env.local
# Edit .env.local with your API keys

# Run development server
npm run dev

# Run E2E tests
npm run test:e2e
```

## Environment Variables

```env
ASKNEWS_API_KEY=your_asknews_api_key
ACTIVEPIECES_WEBHOOK_URL=your_activepieces_webhook_url
```

## E2E Test Coverage

The test suite covers:

### Happy Paths
- Dashboard loads with header and stats
- News stories display from API
- Search filtering works
- Alert toast shows on button click
- Sentiment badges display correctly
- Coverage percentages shown

### Edge Cases
- Empty search handling
- No results messaging
- Footer branding
- Mobile responsiveness
- Toast auto-dismiss

### API Integration
- News API returns valid response
- Alert API handles POST
- Story fields validation

## Deployment

Railway deployment is recommended:

```bash
# Build for production
npm run build

# Or deploy via Railway CLI
railway up
```

After deployment, run E2E tests against production:

```bash
BASE_URL=https://your-app.railway.app npm run test:e2e
```

## License

MIT - Built with 💜 at AI Hackday Berlin
