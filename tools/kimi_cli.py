#!/usr/bin/env python3
"""
Kimi K2 CLI Evaluator - Berlin AI Studio
Uses Puter.js via headless browser for free, unlimited Kimi K2 access.

Usage:
    python3 kimi_cli.py "Your prompt here"
    python3 kimi_cli.py --file project_brief.md
    python3 kimi_cli.py --template idea "My startup idea"
"""

import argparse
import subprocess
import sys
import json
from pathlib import Path

# Alternative: Use requests with Moonshot's direct API if you have credits
MOONSHOT_API_KEY = None  # Set this if you want to use direct API

TEMPLATES = {
    "idea": """You are a critical startup advisor. Evaluate this idea:

{content}

Provide:
1. Market opportunity score (1-10) with justification
2. Technical feasibility assessment
3. Competitive moat analysis
4. Path to first $10K MRR
5. Red flags and risks
6. Recommended next steps (actionable, specific)""",

    "judge": """You are a panel of 3 hackathon judges evaluating this project:

{content}

Respond as:
## Technical Judge (Score: X/10)
[Strengths, weaknesses, recommendations]

## UX/Product Judge (Score: X/10)
[Strengths, weaknesses, recommendations]

## Business/VC Judge (Score: X/10)
[Strengths, weaknesses, recommendations]""",

    "research": """Conduct deep research analysis on this topic:

{content}

Provide:
1. Hidden insights most analyses miss
2. Second-order effects and implications
3. Key data points with sources
4. Contrarian perspectives worth considering
5. Actionable recommendations""",

    "competitive": """Analyze the competitive landscape for:

{content}

Include:
1. Direct competitors (with funding, pricing, positioning)
2. Indirect competitors and substitutes
3. Market gaps and opportunities
4. Recommended differentiation strategy
5. Warning signs to watch"""
}


def call_moonshot_direct(prompt: str, model: str = "kimi-k2.5") -> str:
    """Call Moonshot API directly (requires API key)."""
    import requests
    
    if not MOONSHOT_API_KEY:
        raise ValueError("MOONSHOT_API_KEY not set")
    
    response = requests.post(
        "https://api.moonshot.cn/v1/chat/completions",
        headers={
            "Authorization": f"Bearer {MOONSHOT_API_KEY}",
            "Content-Type": "application/json"
        },
        json={
            "model": model,
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.7
        },
        timeout=120
    )
    
    if response.status_code != 200:
        raise Exception(f"API error: {response.status_code} - {response.text}")
    
    return response.json()["choices"][0]["message"]["content"]


def open_browser_evaluator():
    """Open the browser-based evaluator."""
    html_path = Path(__file__).parent / "kimi_evaluator.html"
    
    if not html_path.exists():
        print(f"Error: {html_path} not found")
        print("Creating it now...")
        return False
    
    # Open in default browser
    import webbrowser
    webbrowser.open(f"file://{html_path.absolute()}")
    return True


def main():
    parser = argparse.ArgumentParser(
        description="Kimi K2 CLI Evaluator - Free unlimited access via Puter.js"
    )
    parser.add_argument("prompt", nargs="?", help="Prompt text")
    parser.add_argument("--file", "-f", help="Read prompt from file")
    parser.add_argument("--template", "-t", choices=TEMPLATES.keys(), 
                        help="Use a template")
    parser.add_argument("--browser", "-b", action="store_true",
                        help="Open browser-based evaluator")
    parser.add_argument("--model", "-m", default="kimi-k2.5",
                        choices=["kimi-k2", "kimi-k2-thinking", "kimi-k2.5"],
                        help="Model to use")
    
    args = parser.parse_args()
    
    if args.browser:
        if open_browser_evaluator():
            print("✅ Opened browser-based Kimi K2 evaluator")
            print("   Use the web interface for interactive evaluation")
        return
    
    # Get content
    if args.file:
        content = Path(args.file).read_text()
    elif args.prompt:
        content = args.prompt
    else:
        print("Error: Provide a prompt or use --file")
        print("       Or use --browser for the web interface")
        sys.exit(1)
    
    # Apply template if specified
    if args.template:
        prompt = TEMPLATES[args.template].format(content=content)
    else:
        prompt = content
    
    print(f"🔬 Kimi K2 Evaluator")
    print(f"   Model: {args.model}")
    print(f"   Prompt length: {len(prompt)} chars")
    print("-" * 50)
    
    # For CLI use without browser, we need to use Moonshot API directly
    # or spawn the browser-based version
    if MOONSHOT_API_KEY:
        try:
            result = call_moonshot_direct(prompt, args.model)
            print(result)
        except Exception as e:
            print(f"Error: {e}")
            print("\nFallback: Opening browser-based evaluator...")
            open_browser_evaluator()
    else:
        print("ℹ️  No MOONSHOT_API_KEY set. Opening browser-based evaluator...")
        print("   The browser version uses Puter.js for FREE unlimited access.")
        print()
        open_browser_evaluator()
        
        # Save prompt to clipboard for easy paste
        try:
            subprocess.run(['pbcopy'], input=prompt.encode(), check=True)
            print("✅ Prompt copied to clipboard - paste it in the browser!")
        except:
            print(f"📋 Copy this prompt to the browser:\n\n{prompt[:500]}...")


if __name__ == "__main__":
    main()
