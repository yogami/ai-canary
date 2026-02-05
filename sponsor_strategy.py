#!/usr/bin/env python3
"""
AICanary - Strategic Sponsor Analysis via Perplexity Pro
Analyzes monetization potential and value positioning for AskNews & ActivePieces sponsors.
"""

import os
import json
import requests
from datetime import datetime

OPENROUTER_API_KEY = os.environ.get("OPENROUTER_API_KEY")

# Use Perplexity Sonar Pro via OpenRouter for deep research
MODEL = "perplexity/sonar-pro"

HACKATHON_CONTEXT = """
# AI Hackday Berlin - February 5, 2026

## Event Details
- Location: Factory Berlin, Görlitzer Park
- Duration: 6 hours
- Format: Solo build
- Target: AI builders, startup founders, developers

## Challenges & Prizes

### 1. ActivePieces Challenge: Best Automation Tool for the Community
- €250 first place, €100 second, €50 third
- Target: Build an automation for AI Builders community (attendees, speakers, organizers, group chats)
- ActivePieces = open-source alternative to Zapier

### 2. AskNews Challenge: Best Use of AI News API  
- €100 prize + 3-month Professional API plan
- Target: Creative use of AskNews API for news intelligence
- AskNews = Real-time news intelligence API with sentiment, RAG, entity extraction

## Judging Criteria
1. Problem-Solution Fit (25%) - Does it solve a REAL problem?
2. Innovation & Creativity (25%) - Novel use of APIs?
3. Technical Execution (25%) - Quality of implementation?
4. Business Potential (25%) - Scalability and monetization?

## My Project: AICanary
A real-time AI ecosystem monitor that alerts builders about competitor launches, new models, and market shifts.

### Current Features
- Real-time news feed via AskNews API
- Sentiment analysis (Bullish/Bearish/Neutral)
- Search filtering with quick filter buttons
- Alert system via ActivePieces webhooks
- Premium glassmorphism UI
- 19 Playwright E2E tests

### Tech Stack
- Next.js 16 + TypeScript + Tailwind CSS
- AskNews API integration
- ActivePieces webhook integration
- Railway deployment

### Live Demo
https://ai-canary-production.up.railway.app
"""

USER_GOALS = """
# My Strategic Goals

## Immediate Goals (Today)
1. WIN the hackathon prizes (€250 + €100)
2. Impress the sponsors (AskNews and ActivePieces)

## Long-Term Goals
1. Get hired as a vibecoding freelancer by AskNews or ActivePieces
2. Build something that could become a monetizable SaaS product
3. Create a showcase project that demonstrates my API integration skills
4. Position myself as an expert in the AI monitoring/intelligence space

## My Unique Skills
- Full-stack TypeScript development
- AI/LLM integration expertise
- TDD/E2E testing (Playwright)
- Rapid prototyping ("vibecoding")
- Premium UI/UX design (glassmorphism, animations)
"""

QUESTIONS = """
# Questions for Strategic Analysis

1. **For AskNews Sponsors**: What features could I add to AICanary that would:
   - Showcase the FULL capabilities of their API (beyond basic news fetching)?
   - Make them want to hire me as a freelancer to build integrations?
   - Turn this into a product they could white-label or partner on?

2. **For ActivePieces Sponsors**: What automation workflows could I demonstrate that would:
   - Show deep integration with their platform?
   - Solve real problems for their community?
   - Position me as someone they'd want to hire?

3. **Monetization Strategy**: How could AICanary become a $10K MRR SaaS product?
   - Who would pay for this?
   - What features would justify a subscription?
   - What's missing from current competitors?

4. **Demo Day Pitch**: What should I emphasize in my 2-minute pitch to:
   - Win both prizes?
   - Get follow-up conversations with sponsors?
   - Leave a lasting impression?

5. **Quick Wins**: What features could I add in 30-60 minutes that would:
   - Dramatically increase perceived value?
   - Differentiate from other hackathon projects?
   - Show deeper API integration?
"""

def call_perplexity_via_openrouter(prompt: str) -> str:
    """Call Perplexity Sonar Pro via OpenRouter."""
    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": "https://berlinailabs.de",
        "X-Title": "AICanary Strategic Analysis"
    }
    
    system_prompt = """You are a strategic advisor for hackathon success and developer career growth.
    
Your role: Provide SPECIFIC, ACTIONABLE advice focused on:
1. Winning hackathon prizes
2. Impressing sponsors to get freelance opportunities
3. Building monetizable products

Be DIRECT and PRACTICAL. No fluff. Give concrete recommendations with specific features, pricing suggestions, and talking points.

Format your response with clear headers and bullet points."""

    payload = {
        "model": MODEL,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.7,
        "max_tokens": 3000
    }
    
    response = requests.post(
        "https://openrouter.ai/api/v1/chat/completions",
        headers=headers,
        json=payload,
        timeout=180
    )
    
    if response.status_code != 200:
        return f"Error: {response.status_code} - {response.text}"
    
    return response.json()["choices"][0]["message"]["content"]

def main():
    print("=" * 60)
    print("AICanary - Strategic Sponsor Analysis (Perplexity Pro)")
    print(f"Timestamp: {datetime.now().isoformat()}")
    print("=" * 60)
    
    if not OPENROUTER_API_KEY:
        print("ERROR: OPENROUTER_API_KEY not set")
        return
    
    full_prompt = f"""
{HACKATHON_CONTEXT}

{USER_GOALS}

{QUESTIONS}

Please provide a comprehensive strategic analysis addressing all the questions above. Be specific about:
- Exact features to add
- Pricing recommendations
- Talking points for the demo pitch
- What to emphasize to each sponsor

Remember: I want to WIN the prizes AND get hired as a freelancer by these sponsors.
"""
    
    print("\n🔍 Consulting Perplexity Sonar Pro for Strategic Analysis...")
    print("(This may take 1-2 minutes for deep research)\n")
    
    result = call_perplexity_via_openrouter(full_prompt)
    print(result)
    
    # Save results
    output_path = "/Users/user1000/gitprojects/ai-canary/SPONSOR_STRATEGY.md"
    with open(output_path, "w") as f:
        f.write("# AICanary - Strategic Sponsor Analysis\n\n")
        f.write(f"**Generated**: {datetime.now().isoformat()}\n")
        f.write(f"**Model**: Perplexity Sonar Pro\n\n")
        f.write("---\n\n")
        f.write(result)
    
    print(f"\n✅ Results saved to: {output_path}")

if __name__ == "__main__":
    main()
