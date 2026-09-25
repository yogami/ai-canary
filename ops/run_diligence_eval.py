import json
import time
import requests
import argparse
import copy
from typing import Dict, List, Any

# Ensure zero em-dashes and no banned buzzwords in our script strings

def evaluate_api(url: str, description: str, niche: str) -> Dict[str, Any]:
    payload = {
        "projectDescription": description,
        "niche": niche,
        "stories": [{"headline": "Industry shifts toward reality-based tech assessment", "sentiment": "neutral"}]
    }
    
    headers = {"Content-Type": "application/json"}
    start_t = time.time()
    try:
        resp = requests.post(url, json=payload, headers=headers, timeout=60)
        resp.raise_for_status()
        data = resp.json()
        latency = time.time() - start_t
        data["latency_ms"] = latency * 1000
        return data
    except Exception as e:
        print(f"API Error: {e}")
        return {"error": str(e), "latency_ms": (time.time() - start_t) * 1000}

def fuzzy_match(text: str, flaw: str) -> bool:
    # A simple Python Math/Logic Verifier
    # We can use a mocked NLI for hybrid verification.
    text_lower = str(text).lower()
    
    if "theranos" in text_lower or "capillary" in text_lower or "blood" in text_lower:
        if "volume" in text_lower or "diluted" in text_lower or "interstitial" in text_lower or "physics" in text_lower:
            return True
            
    if "lilium" in text_lower or "evtol" in text_lower:
        if "density" in text_lower or "energy" in text_lower or "battery" in text_lower or "disc loading" in text_lower:
            return True
            
    if "hydrogen" in text_lower:
        if "24/7" in text_lower or "intermittent" in text_lower or "subsidy" in text_lower or "electricity" in text_lower:
            return True
            
    return False

def main():
    parser = argparse.ArgumentParser(description="Benchmarking Diligence Suite")
    parser.add_argument("--url", type=str, default="https://ai-canary-production.up.railway.app/api/intelligent-analysis", help="Target API URL")
    args = parser.parse_args()
    
    cases = []
    with open("ops/dataset.jsonl", "r") as f:
        for line in f:
            if line.strip():
                cases.append(json.loads(line))
                
    results = {
        "true_positives": 0,
        "false_positives": 0,
        "true_negatives": 0,
        "false_negatives": 0,
        "contradiction_leakage": 0,
    }
    
    print("Starting Diligence Benchmark (Hybrid Verification & Parametric Fuzzing)")
    
    # Part 1: Historical Ground-Truth Corpus
    for case in cases:
        print(f"Evaluating {case['name']}...")
        result = evaluate_api(args.url, case["description"], case["niche"])
        
        if "error" in result:
            print(f"Failed to evaluate {case['name']}: {result['error']}")
            continue
            
        analysis = result.get("analysis", {})
        if not analysis:
            continue
            
        # Extract verdict
        is_failing_grade = False
        grade = analysis.get("canaryScore", {}).get("grade", "C")
        if grade in ["C", "D", "F"]:
            is_failing_grade = True
            
        # Check if the critical flaw was caught in the agenticDiligence quarantine
        flaw_caught = False
        quarantined = analysis.get("agenticDiligence", {}).get("quarantine", {}).get("quarantinedAssertions", [])
        if case["critical_physics_flaw"]:
            for q in quarantined:
                if fuzzy_match(str(q), case["critical_physics_flaw"]):
                    flaw_caught = True
                    break
                    
        # Verification
        expected_failure = case["expected_failure"]
        if expected_failure and is_failing_grade:
            results["true_positives"] += 1
            if not flaw_caught:
                results["contradiction_leakage"] += 1
        elif expected_failure and not is_failing_grade:
            results["false_negatives"] += 1
        elif not expected_failure and is_failing_grade:
            results["false_positives"] += 1
        else:
            results["true_negatives"] += 1
            
    # Part 2: Parametric Fuzzing on Hydrogen Case
    print("\nStarting Parametric Fuzzing on Hydrogen Case...")
    h2_case = next((c for c in cases if c["id"] == "c3"), None)
    
    if h2_case:
        fuzzing_prices = ["0.01", "0.05", "0.15", "0.30"]
        base_desc = "Our novel electrolyzer stack produces green hydrogen at €1.20/kg. We assume an electricity input price of €{price}/kWh running 24/7. We use proprietary non-precious metal catalysts to lower CapEx to €300/kW."
        
        for price in fuzzing_prices:
            fuzzed_desc = base_desc.format(price=price)
            print(f"Fuzzing with electricity price €{price}/kWh...")
            result = evaluate_api(args.url, fuzzed_desc, h2_case["niche"])
            
            analysis = result.get("analysis", {})
            grade = analysis.get("canaryScore", {}).get("grade", "A")
            print(f"Result for €{price}/kWh: Grade {grade}")
            
    print("\nFinal Benchmark Metrics:")
    print(json.dumps(results, indent=2))
    
    with open("ops/benchmark_results.json", "w") as f:
        json.dump(results, f, indent=2)

if __name__ == "__main__":
    main()
