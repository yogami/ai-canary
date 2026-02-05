#!/usr/bin/env python3
"""
AICanary - LLM Judge Panel Evaluation
Uses frontier models via OpenRouter to simulate hackathon judges.

Judges:
1. Technical Expert (DeepSeek-R1) - Code quality, architecture, integration depth
2. UX/Product Judge (Claude-3.5-Sonnet) - User experience, problem-solution fit
3. Business/VC Judge (Gemini-2.0-Flash) - Market potential, scalability, business model
"""

import os
import json
import requests
from datetime import datetime

OPENROUTER_API_KEY = os.environ.get("OPENROUTER_API_KEY")

MODELS = {
    "technical_expert": "deepseek/deepseek-r1",
    "ux_product_judge": "anthropic/claude-3.5-sonnet",
    "business_vc_judge": "google/gemini-2.0-flash-001"
}

# AICanary project details for judges to evaluate
PROJECT_BRIEF = """
# AICanary - Real-Time AI Ecosystem Intelligence

## Overview
AICanary is a real-time monitoring dashboard that alerts AI builders about competitor launches, new models, and market shifts in the AI ecosystem.

## Live Demo
- Production URL: https://ai-canary-production.up.railway.app
- GitHub: https://github.com/yogami/ai-canary

## Tech Stack
- Frontend: Next.js 16 + TypeScript + Tailwind CSS
- APIs: AskNews (real-time AI news intelligence), ActivePieces (automation webhooks)
- Testing: Playwright E2E (14 tests, all passing)

## Features
1. **Real-Time News Feed**: Fetches live AI ecosystem news via AskNews API
2. **Sentiment Analysis**: Each story has Bullish/Bearish/Neutral badges
3. **Search Filtering**: Filter stories by keywords
4. **Alert System**: Click "Alert Me" to queue notifications (ActivePieces webhook ready)
5. **Coverage Metrics**: Shows story coverage percentage
6. **Premium UI**: Glassmorphism dark mode with gradient text and animations

## Hackathon Context
- Event: AI Hackday Berlin (Feb 5, 2026)
- Tracks: ActivePieces Challenge (€250/100/50), AskNews Challenge (€100 + 3-month API)
- Time constraint: 6 hours solo build
- Target users: AI builders, startup founders, VCs monitoring AI ecosystem

## Current Implementation
- Dashboard loads 10 real stories from AskNews
- Sentiment badges (🚀 Bullish / 📉 Bearish / ⚖️ Neutral)
- Stats cards showing Stories Today, Bullish count, Bearish count
- Search filters stories in real-time
- Alert button triggers toast + demo webhook
- Mobile responsive design
- E2E tests cover happy paths, edge cases, and API integration
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

def main():
    print("=" * 60)
    print("AICanary - LLM Judge Panel Evaluation")
    print(f"Timestamp: {datetime.now().isoformat()}")
    print("=" * 60)
    
    if not OPENROUTER_API_KEY:
        print("ERROR: OPENROUTER_API_KEY not set")
        return
    
    results = {}
    
    # Technical Expert (DeepSeek-R1)
    print("\n🔧 Consulting Technical Expert (DeepSeek-R1)...")
    results["technical"] = get_technical_expert_review()
    print(results["technical"])
    
    # UX/Product Judge (Claude)
    print("\n🎨 Consulting UX/Product Judge (Claude-3.5-Sonnet)...")
    results["ux_product"] = get_ux_product_review()
    print(results["ux_product"])
    
    # Business/VC Judge (Gemini)
    print("\n💰 Consulting Business/VC Judge (Gemini-2.0-Flash)...")
    results["business"] = get_business_vc_review()
    print(results["business"])
    
    # Save results
    output_path = "/Users/user1000/gitprojects/ai-canary/JUDGE_PANEL_RESULTS.md"
    with open(output_path, "w") as f:
        f.write("# AICanary - LLM Judge Panel Evaluation\n\n")
        f.write(f"**Evaluated at**: {datetime.now().isoformat()}\n\n")
        f.write("---\n\n")
        f.write("## 🔧 Technical Expert (DeepSeek-R1)\n\n")
        f.write(results["technical"])
        f.write("\n\n---\n\n")
        f.write("## 🎨 UX/Product Judge (Claude-3.5-Sonnet)\n\n")
        f.write(results["ux_product"])
        f.write("\n\n---\n\n")
        f.write("## 💰 Business/VC Judge (Gemini-2.0-Flash)\n\n")
        f.write(results["business"])
    
    print(f"\n✅ Results saved to: {output_path}")

if __name__ == "__main__":
    main()
