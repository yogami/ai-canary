#!/usr/bin/env python3
"""
AICanary - LLM Judge Panel Evaluation (Phase 2)
Uses LATEST frontier models via OpenRouter to simulate hackathon judges.

Judges:
1. Technical Expert (DeepSeek-R1-0528) - Code quality, architecture, integration depth
2. UX/Product Judge (Claude-3.5-Sonnet-20241022) - User experience, problem-solution fit
3. Business/VC Judge (Gemini-2.5-Pro) - Market potential, scalability, business model
4. Strategic Advisor (Perplexity Sonar Pro) - Real-time market intelligence
"""

import os
import json
import requests
from datetime import datetime

OPENROUTER_API_KEY = os.environ.get("OPENROUTER_API_KEY")

MODELS = {
    "technical_expert": "deepseek/deepseek-r1-0528",
    "ux_product_judge": "anthropic/claude-sonnet-4",
    "business_vc_judge": "google/gemini-2.5-pro-preview-05-06",
    "strategic_advisor": "perplexity/sonar-pro",
    "deep_research": "moonshotai/kimi-k2-instruct"
}

# AICanary project details for judges to evaluate
PROJECT_BRIEF = """
# AICanary - Real-Time AI Ecosystem Intelligence (Phase 2)

## Overview
AICanary is a real-time monitoring dashboard that alerts AI builders about competitor launches, new models, and market shifts in the AI ecosystem.

## Live Demo
- Production URL: https://ai-canary-production.up.railway.app
- GitHub: https://github.com/yogami/ai-canary

## Tech Stack
- Frontend: Next.js 16 + TypeScript + Tailwind CSS
- APIs: AskNews (real-time AI news intelligence), ActivePieces (automation webhooks)
- Testing: Playwright E2E (19 tests, all passing)
- Storage: LocalStorage cache with offline fallback

## Features (Phase 2 Complete)
1. **Real-Time News Feed**: Fetches live AI ecosystem news via AskNews API
2. **Sentiment Analysis**: Each story has Bullish/Bearish/Neutral badges
3. **Impact Score Badges**: ⚡ High Impact for stories with strong sentiment*coverage
4. **Quick Filters**: 5 preset filters (LLMs, GenAI, Funding, Launches, Research)
5. **Search Filtering**: Filter stories by keywords with special char handling
6. **Alert System**: Click "Alert Me" to queue notifications (ActivePieces webhook ready)
7. **Export CSV**: One-click download of filtered stories for team sharing
8. **Onboarding Tooltip**: First-visit guidance for new users
9. **Offline Support**: LocalStorage cache with Live/Cached indicator
10. **Alert History**: Tracks all alerts in localStorage
11. **Rate Limit Handling**: Graceful 429 error handling for ActivePieces
12. **Premium UI**: Glassmorphism dark mode with gradient text and animations

## Hackathon Context
- Event: AI Hackday Berlin (Feb 5, 2026)
- Tracks: ActivePieces Challenge (€250/100/50), AskNews Challenge (€100 + 3-month API)
- Time constraint: 6 hours solo build
- Target users: AI builders, startup founders, VCs monitoring AI ecosystem

## Current Implementation
- Dashboard loads 10 real stories from AskNews
- Sentiment badges (🚀 Bullish / 📉 Bearish / ⚖️ Neutral)
- Impact badges (⚡ High Impact for sentiment*coverage > 0.3)
- Stats cards showing Stories Today, Bullish count, Bearish count
- Quick filter buttons for common AI domains
- Search filters stories in real-time (handles special chars)
- Alert button triggers toast + demo webhook + history tracking
- Export CSV button for filtered stories
- Onboarding tooltip for first-time visitors
- Data source indicator (Live/Cached)
- Mobile responsive design
- 19 E2E tests cover happy paths, edge cases, and API integration
"""

JUDGING_CRITERIA = """
# Hackathon Judging Criteria (AI Hackday Berlin)

## 1. Problem-Solution Fit (25%)
- Does it solve a REAL problem?
- Is the problem clearly defined?
- Is the solution high-value for the target audience?

## 2. Innovation & Creativity (25%)
- Creative use of the APIs (AskNews, ActivePieces)?
- Depth of integration beyond basic fetching?
- Novel approach to the problem?

## 3. Technical Execution (25%)
- Code quality and architecture?
- Smooth integration with required tools?
- Testing coverage and reliability?

## 4. Business Potential (25%)
- Market size and opportunity?
- Scalability of the solution?
- Clear path to monetization?
"""

def call_openrouter(model: str, system_prompt: str, user_prompt: str) -> str:
    """Call OpenRouter API with specified model."""
    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": "https://berlinailabs.de",
        "X-Title": "AICanary Judge Panel"
    }
    
    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        "temperature": 0.7,
        "max_tokens": 2000
    }
    
    response = requests.post(
        "https://openrouter.ai/api/v1/chat/completions",
        headers=headers,
        json=payload,
        timeout=120
    )
    
    if response.status_code != 200:
        return f"Error: {response.status_code} - {response.text}"
    
    return response.json()["choices"][0]["message"]["content"]

def get_technical_expert_review() -> str:
    """DeepSeek-R1 as Technical Expert Judge."""
    system_prompt = """You are a Senior Software Architect and Technical Judge at a hackathon.
    
Your role: Evaluate the technical quality, code architecture, API integration depth, and testing coverage.

Be CONSTRUCTIVE but CRITICAL. Give specific, actionable feedback.

Format your response as:
## Technical Score: X/10

### Strengths
- (list 3-5 technical strengths)

### Weaknesses
- (list 3-5 technical weaknesses or concerns)

### Missing Edge Cases for Testing
- (list specific edge cases that should be tested but might be missed)

### Recommended Improvements
- (list specific technical improvements with code/implementation suggestions)

### Potential Bugs to Watch For
- (list potential bugs or failure modes based on the architecture)
"""

    user_prompt = f"""Please evaluate this hackathon project:

{PROJECT_BRIEF}

{JUDGING_CRITERIA}

Focus on:
1. API integration depth (AskNews & ActivePieces)
2. Code architecture quality
3. Testing coverage gaps
4. Edge cases that could break the demo
5. Performance concerns"""

    return call_openrouter(MODELS["technical_expert"], system_prompt, user_prompt)

def get_ux_product_review() -> str:
    """Claude-3.5-Sonnet as UX/Product Judge."""
    system_prompt = """You are a Senior Product Designer and UX Expert judging a hackathon.
    
Your role: Evaluate the user experience, problem-solution fit, and product design.

Be CONSTRUCTIVE but CRITICAL. Focus on user-centric improvements.

Format your response as:
## Product/UX Score: X/10

### Strengths
- (list 3-5 UX/product strengths)

### Weaknesses
- (list 3-5 UX/product problems or friction points)

### User Flow Issues
- (identify potential user confusion or friction in the flow)

### Recommended Improvements
- (specific UX improvements that would increase user delight)

### Features That Would 10x the Value
- (list 2-3 features that would dramatically increase value proposition)
"""

    user_prompt = f"""Please evaluate this hackathon project:

{PROJECT_BRIEF}

{JUDGING_CRITERIA}

Focus on:
1. Does it solve a real problem for AI builders?
2. Is the UI intuitive and delightful?
3. What's missing from the user journey?
4. How could the value proposition be stronger?"""

    return call_openrouter(MODELS["ux_product_judge"], system_prompt, user_prompt)

def get_business_vc_review() -> str:
    """Gemini-2.0-Flash as Business/VC Judge."""
    system_prompt = """You are a Venture Capitalist and Business Judge at a hackathon.
    
Your role: Evaluate the business potential, market opportunity, and monetization strategy.

Be REALISTIC and DIRECT. Think like an investor evaluating a seed pitch.

Format your response as:
## Business Score: X/10

### Market Opportunity
- (assessment of the market size and timing)

### Competitive Moat
- (what defensibility does this product have?)

### Monetization Path
- (is there a clear path to revenue?)

### Red Flags
- (concerns that would make you hesitant to invest)

### What Would Make This Investable
- (specific changes that would make this a fundable business)

### Quick Wins for Demo Day
- (improvements that would impress judges/investors in the demo)
"""

    user_prompt = f"""Please evaluate this hackathon project:

{PROJECT_BRIEF}

{JUDGING_CRITERIA}

Focus on:
1. Is this a real business opportunity?
2. Would AI builders pay for this?
3. What's the competitive landscape?
4. What would make this a $1M ARR product?"""

    return call_openrouter(MODELS["business_vc_judge"], system_prompt, user_prompt)

def get_strategic_advisor_review() -> str:
    """Perplexity Sonar Pro as Strategic Market Advisor."""
    system_prompt = """You are a Strategic Market Intelligence Advisor with access to real-time market data.
    
Your role: Provide actionable strategic insights based on current market conditions and competitive landscape.

Be SPECIFIC and DATA-DRIVEN. Reference real companies, funding rounds, and market trends.

Format your response as:
## Strategic Intelligence Score: X/10

### Market Timing Assessment
- (is now the right time for this product?)

### Competitive Landscape (Real Companies)
- (list actual competitors and their positioning)

### Differentiation Opportunities
- (specific ways to stand out in the market)

### Go-to-Market Strategy
- (actionable GTM recommendations)

### Revenue Potential Analysis
- (realistic revenue projection for first year)
"""

    user_prompt = f"""Analyze this hackathon project for strategic market opportunity:

{PROJECT_BRIEF}

Focus on:
1. What real companies compete in this space?
2. What's the current funding climate for AI tools?
3. What would make this a must-have vs nice-to-have?
4. What's the fastest path to $10K MRR?"""

    return call_openrouter(MODELS["strategic_advisor"], system_prompt, user_prompt)

def get_deep_research_review() -> str:
    """Kimi K2 as Deep Research Analyst."""
    system_prompt = """You are a Deep Research Analyst with exceptional ability to synthesize complex information.
    
Your role: Conduct thorough analysis of the product, market, and technical implementation to identify non-obvious insights.

Be COMPREHENSIVE and INSIGHTFUL. Look for patterns others miss.

Format your response as:
## Deep Research Score: X/10

### Hidden Strengths
- (non-obvious advantages of this approach)

### Overlooked Risks
- (risks that typical analysis would miss)

### Technical Deep Dive
- (analysis of architectural decisions and their implications)

### Market Signal Analysis
- (what signals suggest success or failure?)

### Unconventional Recommendations
- (advice that goes against common wisdom but could be game-changing)
"""

    user_prompt = f"""Conduct deep research analysis on this hackathon project:

{PROJECT_BRIEF}

{JUDGING_CRITERIA}

Go beyond surface-level analysis. Look for:
1. Second-order effects of the technical choices
2. Hidden dependencies or risks
3. Underutilized opportunities in the current implementation
4. What the demographic data suggests about the target market"""

    return call_openrouter(MODELS["deep_research"], system_prompt, user_prompt)

def main():
    print("=" * 60)
    print("AICanary - LLM Judge Panel Evaluation (Phase 2)")
    print("Using LATEST frontier models via OpenRouter")
    print(f"Timestamp: {datetime.now().isoformat()}")
    print("=" * 60)
    
    if not OPENROUTER_API_KEY:
        print("ERROR: OPENROUTER_API_KEY not set")
        return
    
    results = {}
    
    # Technical Expert (DeepSeek-R1-0528)
    print("\n🔧 Consulting Technical Expert (DeepSeek-R1-0528)...")
    results["technical"] = get_technical_expert_review()
    print(results["technical"])
    
    # UX/Product Judge (Claude Sonnet 4)
    print("\n🎨 Consulting UX/Product Judge (Claude Sonnet 4)...")
    results["ux_product"] = get_ux_product_review()
    print(results["ux_product"])
    
    # Business/VC Judge (Gemini 2.5 Pro)
    print("\n💰 Consulting Business/VC Judge (Gemini 2.5 Pro)...")
    results["business"] = get_business_vc_review()
    print(results["business"])
    
    # Strategic Advisor (Perplexity Sonar Pro)
    print("\n🌐 Consulting Strategic Advisor (Perplexity Sonar Pro)...")
    results["strategic"] = get_strategic_advisor_review()
    print(results["strategic"])
    
    # Deep Research Analyst (Kimi K2)
    print("\n🔬 Consulting Deep Research Analyst (Kimi K2)...")
    results["deep_research"] = get_deep_research_review()
    print(results["deep_research"])
    
    # Save results
    output_path = "/Users/user1000/gitprojects/ai-canary/JUDGE_PANEL_RESULTS.md"
    with open(output_path, "w") as f:
        f.write("# AICanary - LLM Judge Panel Evaluation (Phase 2)\n\n")
        f.write(f"**Evaluated at**: {datetime.now().isoformat()}\n\n")
        f.write("**Models Used**: DeepSeek-R1-0528, Claude Sonnet 4, Gemini 2.5 Pro, Perplexity Sonar Pro, Kimi K2\n\n")
        f.write("---\n\n")
        f.write("## 🔧 Technical Expert (DeepSeek-R1-0528)\n\n")
        f.write(results["technical"])
        f.write("\n\n---\n\n")
        f.write("## 🎨 UX/Product Judge (Claude Sonnet 4)\n\n")
        f.write(results["ux_product"])
        f.write("\n\n---\n\n")
        f.write("## 💰 Business/VC Judge (Gemini 2.5 Pro)\n\n")
        f.write(results["business"])
        f.write("\n\n---\n\n")
        f.write("## 🌐 Strategic Advisor (Perplexity Sonar Pro)\n\n")
        f.write(results["strategic"])
        f.write("\n\n---\n\n")
        f.write("## 🔬 Deep Research Analyst (Kimi K2)\n\n")
        f.write(results["deep_research"])
    
    print(f"\n✅ Results saved to: {output_path}")

if __name__ == "__main__":
    main()

