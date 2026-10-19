import urllib.request
import json
import sys

test_queries = [
    # 1. Competitor comparison
    ("Compare Hireko and HireVue", "PRODUCT_COMPARISON"),
    ("Hireko vs Talview", "PRODUCT_COMPARISON"),
    ("Which is better, Hireko or HireVue?", "PRODUCT_COMPARISON"),
    ("What is the difference between Hireko and HireVue?", "PRODUCT_COMPARISON"),
    ("Compare the features of these platforms", "PRODUCT_COMPARISON"),
    ("Which platform has better AI interview features?", "PRODUCT_COMPARISON"),
    ("What does Hireko have that competitors don't?", "PRODUCT_COMPARISON"),
    ("compare 3 or 4 competitors at a time", "PRODUCT_COMPARISON"),

    # 2. Pricing
    ("How much does Hireko cost?", "PRICING_COMPARISON"),
    ("Which platform is cheaper?", "PRICING_COMPARISON"),
    ("Hireko vs HireVue pricing", "PRICING_COMPARISON"),
    ("What is pricing for Talview?", "PRICING_COMPARISON"),
    ("Pricing", "PRICING_COMPARISON"),

    # 3. Direct Yes/No feature capability
    ("Does Hireko have facial recognition?", "FEATURE_QUESTION"),
    ("Does Hireko support video interviews?", "FEATURE_QUESTION"),
    ("Does HireVue have AI evaluation?", "FEATURE_QUESTION"),
    ("Can Hireko analyze interviews?", "FEATURE_QUESTION"),
    ("Does Talview support assessments?", "FEATURE_QUESTION"),
    ("Does Hireko have candidate scoring?", "FEATURE_QUESTION"),

    # 4. Hireko best features
    ("What are Hireko's best features?", "HIREKO_BEST_FEATURES"),
    ("What makes Hireko better?", "HIREKO_BEST_FEATURES"),
    ("What are Hireko's advantages?", "HIREKO_BEST_FEATURES"),
    ("What does Hireko do better than competitors?", "HIREKO_BEST_FEATURES"),
    ("Why should I choose Hireko?", "HIREKO_BEST_FEATURES"),
    ("What is Hireko's competitive advantage?", "HIREKO_BEST_FEATURES"),

    # 5. Feature comparison across platforms
    ("Which platforms have facial recognition?", "FEATURE_COMPARISON"),
    ("Which platforms support AI interviews?", "FEATURE_COMPARISON"),
    ("Which platforms have candidate scoring?", "FEATURE_COMPARISON"),

    # 6. Hireko specific
    ("What is Hireko?", "HIREKO_SPECIFIC"),
    ("How does Hireko work?", "HIREKO_SPECIFIC"),

    # 7. Competitor specific
    ("Does HireVue support AI interviews?", "FEATURE_QUESTION"),
    ("Tell me about Talview", "COMPETITOR_SPECIFIC"),
    ("What is Spark Hire?", "COMPETITOR_SPECIFIC"),

    # 8. Recommendation
    ("Which platform should I choose?", "RECOMMENDATION"),
    ("Which is best for AI interviews?", "RECOMMENDATION"),
    ("Which platform is better for recruiters?", "RECOMMENDATION"),
    ("Should I use Hireko or HireVue?", "RECOMMENDATION"),

    # 9. General QA
    ("Explain the STAR method", "GENERAL_QA"),
    ("What is each chunk size?", "GENERAL_QA"),

    # 10. Unrelated
    ("What is the capital of France?", "UNRELATED_QUESTION"),
    ("Tell me a recipe for pizza dough", "UNRELATED_QUESTION"),
]

def run_tests():
    passed = 0
    total = len(test_queries)
    print(f"Running {total} intent and response format tests on Next.js API (/api/chat)...\n")

    for q, expected_intent in test_queries:
        payload = json.dumps({"query": q}).encode("utf-8")
        req = urllib.request.Request(
            "http://localhost:3005/api/chat",
            data=payload,
            headers={"Content-Type": "application/json"}
        )
        try:
            with urllib.request.urlopen(req, timeout=10) as resp:
                data = json.loads(resp.read().decode("utf-8"))
        except Exception as e:
            print(f"  [FAIL] '{q}' -> Request failed: {e}")
            continue

        actual_intent = data.get("intent")
        answer = data.get("answer", "")

        errors = []
        if actual_intent != expected_intent:
            errors.append(f"Intent mismatch: expected {expected_intent}, got {actual_intent}")

        # Check response formatting rules per intent
        if actual_intent == "PRODUCT_COMPARISON":
            if "| Feature |" not in answer:
                errors.append("Missing side-by-side comparison table (| Feature |)")
            if "**Conclusion:**" not in answer:
                errors.append("Missing **Conclusion:**")

        elif actual_intent == "PRICING_COMPARISON":
            if "| Platform | Pricing |" not in answer:
                errors.append("Missing pricing table (| Platform | Pricing |)")

        elif actual_intent == "FEATURE_QUESTION":
            first_line = answer.strip().split("\n")[0]
            if not (first_line.startswith("**Yes") or first_line.startswith("**No") or first_line.startswith("**Limited") or first_line.startswith("**Unknown")):
                errors.append(f"Answer does NOT start with clear bold Yes/No/Limited: {first_line[:40]}")

        elif actual_intent == "HIREKO_BEST_FEATURES":
            if "**Hireko.ai has several potential competitive strengths, depending on the use case.**" not in answer:
                errors.append("Missing required opening sentence for best features")
            if "**Key takeaway:**" not in answer:
                errors.append("Missing **Key takeaway:**")

        elif actual_intent == "FEATURE_COMPARISON":
            if "| Platform |" not in answer:
                errors.append("Missing feature comparison table")

        elif actual_intent == "RECOMMENDATION":
            if "| Criteria |" not in answer:
                errors.append("Missing decision criteria comparison table")
            if "**Recommendation:**" not in answer:
                errors.append("Missing **Recommendation:** section")

        elif actual_intent == "UNRELATED_QUESTION":
            if "I specialize as the AI Product Advisor for **Hireko.ai**" not in answer:
                errors.append("Missing polite redirection text")

        # Check Link policy: zero competitor links
        if "http://" in answer or "https://" in answer:
            urls = [u for u in answer.split() if "http" in u]
            for u in urls:
                if "hireko.ai" not in u:
                    errors.append(f"Prohibited competitor external link found: {u}")

        if not errors:
            passed += 1
            print(f"  [PASS] '{q}' -> {actual_intent}")
        else:
            print(f"  [FAIL] '{q}' -> {actual_intent}")
            for e in errors:
                print(f"         ERROR: {e}")

    print(f"\nResult: {passed}/{total} tests passed ({(passed/total)*100:.1f}%)")
    return passed == total

if __name__ == "__main__":
    success = run_tests()
    sys.exit(0 if success else 1)
