import re
from typing import List, Dict, Tuple, Optional
from .models import IntentType

# Small talk regexes
GREETING_RE = re.compile(
    r"^(hi|hello|hey|greetings|start|yo|hlo|helo|heyy|hie|heyya|good\s+(morning|afternoon|evening))\b",
    re.IGNORECASE,
)
THANKS_RE = re.compile(
    r"^(thanks|thank\s+you|thank\s+u|appreciate\s+it|thx|thnx|thanku|tq)\b",
    re.IGNORECASE,
)
CONFIRM_RE = re.compile(
    r"^(okay|ok|got\s+it|understood|makes\s+sense|cool|nice|perfect|sounds\s+good|alright|right)\b",
    re.IGNORECASE,
)
GOODBYE_RE = re.compile(
    r"^(bye|goodbye|see\s+you|see\s+ya|talk\s+later|catch\s+you\s+later|exit|quit)\b",
    re.IGNORECASE,
)

ALL_COMPETITOR_MAP: Dict[str, str] = {
    "hirevue": "HireVue",
    "talview": "Talview",
    "sparkhire": "Spark Hire",
    "spark hire": "Spark Hire",
    "myinterview": "myInterview",
    "willo": "Willo",
    "codesignal": "CodeSignal",
    "paradox": "Paradox",
    "humanly": "Humanly",
    "interviewer.ai": "Interviewer.AI",
    "interviewer ai": "Interviewer.AI",
    "interviewerai": "Interviewer.AI",
    "interviewer": "Interviewer.AI",
    "metaview": "Metaview",
    "mercor": "Mercor",
    "greenhouse": "Greenhouse",
    "recruit41": "Recruit41",
    "coderbyte": "Coderbyte",
    "ribbon": "Ribbon AI",
    "ribbon ai": "Ribbon AI",
    "juicebox": "Juicebox (PeopleGPT)",
    "peoplegpt": "Juicebox (PeopleGPT)",
    "modern hire": "Modern Hire",
    "modernhire": "Modern Hire",
    "hireko": "Hireko",
}

COMMON_TYPO_ALIASES: Dict[str, str] = {
    "modernhir": "Modern Hire",
    "modern_hire": "Modern Hire",
    "talvew": "Talview",
    "talveiw": "Talview",
    "tallview": "Talview",
    "talvieu": "Talview",
    "talwiew": "Talview",
    "hievue": "HireVue",
    "hievuee": "HireVue",
    "hirvue": "HireVue",
    "hirvuee": "HireVue",
    "hirevew": "HireVue",
    "hireveue": "HireVue",
    "codesingal": "CodeSignal",
    "codesignl": "CodeSignal",
    "codesig": "CodeSignal",
    "pradox": "Paradox",
    "paradoxx": "Paradox",
    "juicebx": "Juicebox (PeopleGPT)",
    "juicbox": "Juicebox (PeopleGPT)",
    "peoplgpt": "Juicebox (PeopleGPT)",
    "peopl_gpt": "Juicebox (PeopleGPT)",
    "metavue": "Metaview",
    "metavieww": "Metaview",
    "sparkhir": "Spark Hire",
    "spark_hire": "Spark Hire",
    "willow": "Willo",
    "willoo": "Willo",
    "ribon": "Ribbon AI",
    "ribbonn": "Ribbon AI",
    "hirko": "Hireko",
    "hirecko": "Hireko",
}

IGNORED_FUZZY_TOKENS = {
    "interview", "interviews", "interviewing", "interviewer", "recruit", "recruiting",
    "recruiter", "hiring", "hire", "screen", "screening", "platform", "platforms",
    "system", "software", "company", "feature", "features", "better", "compare",
    "pricing", "workflow", "candidate", "candidates"
}

FEATURE_DEFINITIONS = [
    {
        "key": "gameBasedAssessment",
        "label": "Game-Based Assessment",
        "regex": re.compile(r"game\s*[- ]?based|gamified|game\s*assessments?|game\s*tests?", re.I),
    },
    {
        "key": "facialRecognition",
        "label": "Facial Recognition",
        "regex": re.compile(r"facial\s*recognition|facial\s*analysis|face\s*recognition|microexpressions?|emotion\s*ai|emotion\s*recognition", re.I),
    },
    {
        "key": "liveVideo",
        "label": "Live Video",
        "regex": re.compile(r"live\s*video|live\s*interview|real-time\s*video|2-way\s*video|two-way\s*video", re.I),
    },
    {
        "key": "videoInterview",
        "label": "Video Interview",
        "regex": re.compile(r"video\s*interviews?|video\s*screening|video\s*recording|webcam\s*interview|recorded\s*video", re.I),
    },
    {
        "key": "aiInterview",
        "label": "AI Interview",
        "regex": re.compile(r"ai\s*interviews?|conversational\s*interview|two-way\s*interview|2-way\s*interview|voice\s*interview|autonomous\s*interview", re.I),
    },
    {
        "key": "interviewAnalysis",
        "label": "Interview Analysis",
        "regex": re.compile(r"interview\s*analysis|analyze\s*interviews?|transcription|speech\s*analysis|audio\s*analysis", re.I),
    },
    {
        "key": "candidateAssessment",
        "label": "Candidate Assessment",
        "regex": re.compile(r"candidate\s*assessments?|assessments?|skill\s*assessments?|cognitive\s*tests?|psychometric", re.I),
    },
    {
        "key": "aiEvaluation",
        "label": "AI Evaluation & Scoring",
        "regex": re.compile(r"ai\s*evaluation|candidate\s*scoring|scoring|autograd|rubric\s*scoring|automated\s*evaluation|score\s*candidates", re.I),
    },
    {
        "key": "proctoring",
        "label": "Remote Exam Proctoring",
        "regex": re.compile(r"proctoring|remote\s*proctoring|anti-cheat|browser\s*lock|cheating\s*prevention|tab\s*switch", re.I),
    },
    {
        "key": "codingSandbox",
        "label": "Coding Sandbox & Compilers",
        "regex": re.compile(r"coding\s*sandboxes?|code\s*editor|ide\s*compiler|coding\s*tests?|algorithmic\s*tests?", re.I),
    },
]

UNRELATED_PATTERNS = [
    re.compile(r"\b(capital of|weather in|recipe for|joke|poem|cats|dogs|pizza|dough|pasta|football|cricket|basketball|president of|who won the|solve \d|photosynthesis|bake a|cook a|movie|song lyrics)\b", re.I),
]

RECRUITMENT_KEYWORDS = re.compile(
    r"\b(hiring|hire|recruit|recruiting|interview|interviews|screening|candidate|candidates|ats|rubric|rubrics|assessment|assessments|competitor|competitors|platform|platforms|resume|resumes|job|jobs|talent|applicant|applicants|pricing|cost|subscription|proctoring|codesignal|hirevue|talview|spark hire|metaview|willo|ribbon|paradox|hireko|game|gamified)\b",
    re.I,
)


def levenshtein_distance(a: str, b: str) -> int:
    if not a:
        return len(b)
    if not b:
        return len(a)
    dp = [[0] * (len(b) + 1) for _ in range(len(a) + 1)]
    for i in range(len(a) + 1):
        dp[i][0] = i
    for j in range(len(b) + 1):
        dp[0][j] = j
    for i in range(1, len(a) + 1):
        for j in range(1, len(b) + 1):
            cost = 0 if a[i - 1] == b[j - 1] else 1
            dp[i][j] = min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost)
    return dp[len(a)][len(b)]


def extract_mentioned_products_with_fuzzy(q_lower: str) -> Tuple[List[str], str]:
    products: List[str] = []
    rectified_query = q_lower

    # 1. Direct match in ALL_COMPETITOR_MAP
    for key, name in ALL_COMPETITOR_MAP.items():
        if key in q_lower and name not in products:
            products.append(name)

    # 2. Direct match in COMMON_TYPO_ALIASES
    for typo, name in COMMON_TYPO_ALIASES.items():
        if typo in q_lower and name not in products:
            products.append(name)
            rectified_query = rectified_query.replace(typo, name.lower())

    # 3. Token-by-token Levenshtein Fuzzy Search
    if not products:
        tokens = [t for t in re.split(r"\s+", q_lower) if len(t) >= 4]
        candidate_keys = [k for k in ALL_COMPETITOR_MAP.keys() if len(k) >= 4]

        for token in tokens:
            if token.lower() in IGNORED_FUZZY_TOKENS:
                continue
            for target_key in candidate_keys:
                if target_key.lower() in IGNORED_FUZZY_TOKENS:
                    continue
                dist = levenshtein_distance(token, target_key)
                max_dist = 2 if len(target_key) >= 5 else 1
                if dist <= max_dist:
                    matched_name = ALL_COMPETITOR_MAP[target_key]
                    if matched_name not in products:
                        products.append(matched_name)
                        rectified_query = rectified_query.replace(token, target_key)

    return products, rectified_query


def extract_user_name(query: str) -> Optional[str]:
    match = re.search(
        r"(?:my name is|i am|i'm|im|call me|this is|myself)\s+([a-zA-Z]+)",
        query,
        re.I,
    )
    if match and match.group(1):
        name = match.group(1).strip()
        reserved = ["here", "looking", "comparing", "wondering", "asking", "interested", "sure", "ready", "fine", "good", "user"]
        if name.lower() not in reserved:
            return name.capitalize()
    return None


class IntentResult:
    def __init__(
        self,
        intent_type: IntentType,
        confidence: float,
        products_mentioned: List[str],
        query: str,
        rectified_query: Optional[str] = None,
        user_name: Optional[str] = None,
        topic: Optional[str] = None,
        target_platform: Optional[str] = None,
        feature_key: Optional[str] = None,
        feature_label: Optional[str] = None,
    ):
        self.type = intent_type
        self.confidence = confidence
        self.productsMentioned = products_mentioned
        self.query = query
        self.rectifiedQuery = rectified_query or query
        self.userName = user_name
        self.topic = topic
        self.targetPlatform = target_platform
        self.featureKey = feature_key
        self.featureLabel = feature_label


def classify_intent(query: str) -> IntentResult:
    clean_query = query.strip()
    q_lower = re.sub(r"[^a-z0-9\s]", " ", clean_query.lower())
    trimmed_lower = q_lower.strip()

    # 1. Check Name Introduction
    extracted_name = extract_user_name(clean_query)
    if extracted_name:
        return IntentResult("NAME_INTRO", 1.0, [], clean_query, user_name=extracted_name)

    # 2. Check Small Talk
    if (
        GREETING_RE.search(trimmed_lower)
        or levenshtein_distance(trimmed_lower, "hello") <= 2
        or levenshtein_distance(trimmed_lower, "hi") <= 1
    ):
        return IntentResult("CASUAL_GREETING", 1.0, [], clean_query)
    if (
        THANKS_RE.search(trimmed_lower)
        or levenshtein_distance(trimmed_lower, "thank you") <= 3
        or levenshtein_distance(trimmed_lower, "thanks") <= 2
    ):
        return IntentResult("CASUAL_THANKS", 1.0, [], clean_query)
    if (
        CONFIRM_RE.search(trimmed_lower)
        or levenshtein_distance(trimmed_lower, "okay") <= 2
        or levenshtein_distance(trimmed_lower, "got it") <= 2
    ):
        return IntentResult("CASUAL_CONFIRMATION", 1.0, [], clean_query)
    if (
        GOODBYE_RE.search(trimmed_lower)
        or levenshtein_distance(trimmed_lower, "goodbye") <= 2
        or levenshtein_distance(trimmed_lower, "bye") <= 1
    ):
        return IntentResult("CASUAL_GOODBYE", 1.0, [], clean_query)

    # 3. Extract Mentioned Products
    products_mentioned, rectified_query = extract_mentioned_products_with_fuzzy(q_lower)
    competitor_only = [p for p in products_mentioned if p != "Hireko"]
    is_explicit_hireko = "Hireko" in products_mentioned or bool(re.search(r"hireko", clean_query, re.I))

    # 4. Feature Extraction
    feature_key = None
    feature_label = None
    for f in FEATURE_DEFINITIONS:
        if f["regex"].search(clean_query):
            feature_key = f["key"]
            feature_label = f["label"]
            break

    # 5. Unrelated Question Detection
    matches_unrelated = any(p.search(clean_query) for p in UNRELATED_PATTERNS)
    if matches_unrelated:
        if not RECRUITMENT_KEYWORDS.search(clean_query) or bool(re.search(r"capital of|joke|poem|pizza|dough|cats|dogs", clean_query, re.I)):
            return IntentResult("UNRELATED_QUESTION", 0.99, products_mentioned, clean_query, rectified_query)

    # 6. Direct Yes/No Feature Capability Question
    is_yes_no_capability = bool(
        re.search(r"^(?:does|can|is|will|do|support)\s+(?:\[?[a-z0-9_.\s]+\]?)\s+(?:have|support|do|offer|include|feature|provide|record|conduct|test|integrate|allow|analyze|score|autograde|grade|use|conduct|hold)", clean_query, re.I)
        or re.search(r"^(?:does|can|is|will|do)\s+(?:hireko|hirevue|talview|spark\s*hire|metaview|codesignal|willo|ribbon|paradox|modern\s*hire|juicebox|greenhouse|humanly|coderbyte|interviewer|mercor|recruit41|\[?[a-z0-9_.\s]+\]?)\b", clean_query, re.I)
        or re.search(r"(?:does|can|is)\s+(?:hireko|hirevue|talview|spark\s*hire|metaview|codesignal|willo|ribbon|paradox|modern\s*hire|juicebox|greenhouse|humanly|coderbyte|interviewer|mercor|recruit41|\[?[a-z0-9_.\s]+\]?)\s+(?:have|support|do|offer|include|feature|provide|record|conduct|test|integrate|allow|analyze|score|autograde|grade|use)", clean_query, re.I)
    )

    if is_yes_no_capability and feature_key:
        is_placeholder = bool(re.search(r"\[platform|\bplatform\s*name\b|\bany\s*platform\b|\bthe\s*platform\b", clean_query, re.I))
        target_platform = "[platform name]" if is_placeholder else ("Hireko" if is_explicit_hireko else (competitor_only[0] if competitor_only else (products_mentioned[0] if products_mentioned else "Hireko")))
        return IntentResult(
            "FEATURE_QUESTION",
            0.98,
            ["[platform name]"] if is_placeholder else [target_platform],
            clean_query,
            rectified_query,
            target_platform=target_platform,
            feature_key=feature_key,
            feature_label=feature_label,
        )

    # 7. Feature-Specific Comparison Across Platforms (Cross-Platform)
    is_feature_comparison = bool(
        re.search(r"which\s+platforms?\s+(?:have|support|offer|feature|provide|use|include|do)", clean_query, re.I)
        or re.search(r"who\s+(?:has|supports|offers|provides)\s+(?:live\s*video|facial|ai\s*interview|video|proctoring|coding|scoring|assessments?)", clean_query, re.I)
        or re.search(r"platforms?\s+(?:supporting|that\s+support|with)\b", clean_query, re.I)
        or (re.search(r"which\s+platform", clean_query, re.I) and feature_key)
        or re.search(r"which.*(?:live\s*video|video\s*interview|ai\s*interview|facial\s*recognition)", clean_query, re.I)
    )

    if is_feature_comparison and feature_key:
        return IntentResult(
            "FEATURE_COMPARISON",
            0.98,
            products_mentioned,
            clean_query,
            rectified_query,
            feature_key=feature_key,
            feature_label=feature_label,
        )

    # 7.8 What should Hireko improve next? / Product Roadmap (Pattern D)
    is_hireko_roadmap = bool(
        re.search(r"what\s+should\s+hireko\s+(?:improve|build|focus\s+on|develop|prioritize)(?:\s+next)?", clean_query, re.I)
        or re.search(r"how\s+can\s+hireko\s+improve", clean_query, re.I)
        or re.search(r"hireko\s+(?:product\s+)?roadmap", clean_query, re.I)
        or re.search(r"recommended\s+improvements?\s+(?:for\s+hireko)?", clean_query, re.I)
        or re.search(r"what\s+features?\s+should\s+hireko\s+add", clean_query, re.I)
        or re.search(r"what\s+to\s+build\s+next", clean_query, re.I)
        or re.search(r"what\s+should\s+we\s+build\s+next", clean_query, re.I)
    )

    if is_hireko_roadmap:
        return IntentResult(
            "HIREKO_ROADMAP",
            0.99,
            ["Hireko"],
            clean_query,
            rectified_query,
            target_platform="Hireko",
        )

    # 7.9 Which platform has the best feature? / Best platform by use case (Pattern A)
    is_best_feature_query = bool(
        re.search(r"which\s+platform\s+has\s+(?:the\s+)?best\s+features?", clean_query, re.I)
        or re.search(r"who\s+has\s+(?:the\s+)?best\s+features?", clean_query, re.I)
        or re.search(r"best\s+features?\s+by\s+use\s+case", clean_query, re.I)
        or re.search(r"best\s+platform\s+by\s+use\s+case", clean_query, re.I)
        or re.search(r"which\s+platform\s+is\s+the\s+best(?:\s+overall)?", clean_query, re.I)
        or re.search(r"best\s+recruiting\s+platform\s+overall", clean_query, re.I)
    )

    if is_best_feature_query:
        return IntentResult(
            "PRODUCT_COMPARISON",
            0.99,
            ["Hireko", "HireVue", "Talview", "CodeSignal", "Spark Hire", "Metaview"],
            clean_query,
            rectified_query,
        )

    # 8. Hireko's Best Features / Advantages / Competitive Strengths
    # e.g., "What are Hireko's best features?", "What makes Hireko better?", "What are Hireko's advantages?", "What does Hireko do better than competitors?", "Why should I choose Hireko?", "What is Hireko's competitive advantage?"
    is_hireko_best_features = bool(
        re.search(r"what\s+(?:are\s+)?hireko(?:'s)?\s+(?:best|top|main|key|standout)?\s*(?:features?|advantages?|strengths?|capabilities?)", clean_query, re.I)
        or re.search(r"what\s+makes\s+hireko\s+(?:better|different|unique|special|stand\s*out)", clean_query, re.I)
        or re.search(r"what\s+does\s+hireko\s+do\s+better", clean_query, re.I)
        or re.search(r"why\s+(?:should\s+i\s+)?choose\s+hireko|why\s+choose\s+hireko", clean_query, re.I)
        or re.search(r"what\s+is\s+hireko(?:'s)?\s+competitive\s+advantage", clean_query, re.I)
        or re.search(r"hireko\s+advantages?|hireko\s+best\s+features?", clean_query, re.I)
    )

    if is_hireko_best_features:
        return IntentResult(
            "HIREKO_BEST_FEATURES",
            0.98,
            ["Hireko"],
            clean_query,
            rectified_query,
            target_platform="Hireko",
        )

    # 8.5 Compare All Platforms / Multi-Feature Comparison (Rule 4)
    # e.g. "Compare all platforms on pricing and AI features", "compare all platforms"
    is_compare_all_platforms = bool(
        re.search(r"compare\s+all\s+platforms", clean_query, re.I)
        or re.search(r"compare.*all.*(?:platform|tool|competitor)", clean_query, re.I)
        or re.search(r"compare.*(?:pricing|cost).*(?:and|&)?.*(?:ai|features?)", clean_query, re.I)
        or re.search(r"compare\s+all", clean_query, re.I)
    )

    if is_compare_all_platforms:
        resolved_products = [
            "Hireko",
            "HireVue",
            "Talview",
            "Modern Hire",
            "Spark Hire",
            "myInterview",
            "Willo",
            "CodeSignal",
            "Paradox",
            "Humanly",
            "Interviewer.AI",
            "Metaview",
            "Mercor",
            "Greenhouse",
        ]
        return IntentResult(
            "PRODUCT_COMPARISON",
            0.99,
            resolved_products,
            clean_query,
            rectified_query,
        )

    # 9. Pricing Questions
    is_pricing_query = bool(
        re.search(r"\b(pricing|price|prices|cost|costs|subscription|subscriptions|plans?|packages?|tier|tiers|fee|fees|how\s+much\s+does.*cost|which\s+platform\s+is\s+cheaper|cheapest)\b", clean_query, re.I)
    )

    if is_pricing_query:
        return IntentResult(
            "PRICING_COMPARISON",
            0.98,
            products_mentioned,
            clean_query,
            rectified_query,
            topic="pricing",
        )

    # 10. Recommendation Questions
    is_recommendation = bool(
        re.search(r"which\s+platform\s+should\s+i\s+choose|which\s+is\s+best\s+for|which\s+platform\s+is\s+better\s+for|should\s+i\s+use|what\s+do\s+you\s+recommend|recommend\s+a\s+platform|who\s+wins", clean_query, re.I)
    )

    if is_recommendation:
        return IntentResult(
            "RECOMMENDATION",
            0.95,
            products_mentioned,
            clean_query,
            rectified_query,
            feature_key=feature_key,
            feature_label=feature_label,
        )

    # 11. Explicit Competitor Comparison
    is_multi_numeric_compare = bool(
        re.search(r"compare.*?(?:3\s*(?:or|to|-)\s*4|4|four|3|three|several|top|multiple|all|matrix)", clean_query, re.I)
        or re.search(r"compare.*?(?:competitor|platform|tool|alternative)", clean_query, re.I)
    )

    is_comparison_query = bool(
        re.search(r"\b(compare|vs|versus|difference\s+between|differ|side\s+by\s+side|against)\b", clean_query, re.I)
        or re.search(r"which\s+is\s+better.*(?:or|vs)", clean_query, re.I)
        or re.search(r"better\s+ai\s+interview\s+features", clean_query, re.I)
        or re.search(r"what\s+does\s+hireko\s+have\s+that\s+competitors\s+don", clean_query, re.I)
        or len(products_mentioned) >= 2
        or is_multi_numeric_compare
    )

    if is_comparison_query:
        resolved_products = list(products_mentioned)
        if is_compare_all_platforms:
            resolved_products = [
                "Hireko",
                "HireVue",
                "Talview",
                "Spark Hire",
                "Metaview",
                "CodeSignal",
                "Willo",
                "Ribbon AI",
                "Modern Hire",
            ]
        elif len(resolved_products) < 2 and is_multi_numeric_compare:
            is_four = bool(re.search(r"4|four|3\s*(?:or|to|-)\s*4|three\s*or\s*four", clean_query, re.I))
            if is_four:
                resolved_products = (
                    ["Hireko", "HireVue", "Talview", "Spark Hire"]
                    if is_explicit_hireko
                    else ["HireVue", "Talview", "Spark Hire", "Metaview"]
                )
            else:
                resolved_products = (
                    ["Hireko", "HireVue", "Talview"]
                    if is_explicit_hireko
                    else ["HireVue", "Talview", "Spark Hire"]
                )
        elif len(resolved_products) < 2 and bool(re.search(r"competitor|platform|these\s+platforms", clean_query, re.I)):
            resolved_products = ["Hireko", "HireVue", "Talview"]

        return IntentResult(
            "PRODUCT_COMPARISON",
            0.98,
            resolved_products,
            clean_query,
            rectified_query,
            feature_key=feature_key,
            feature_label=feature_label,
        )

    # 12. Competitor Directory / List
    is_competitor_list = bool(
        re.search(r"how many.*(?:competitor|platform|tool|software)", clean_query, re.I)
        or re.search(r"what.*(?:are\s+the\s+competitors|competitor\s+list|all\s+competitors)", clean_query, re.I)
        or re.search(r"list.*(?:all.*)?(?:competitor|platform|tool)", clean_query, re.I)
        or re.search(r"(?:all|tracked|evaluated).*(?:competitor|platform)", clean_query, re.I)
        or re.search(r"competitor.*(?:list|directory|landscape|overview|breakdown|website|link)", clean_query, re.I)
        or re.search(r"who are.*(?:competitor|alternative)", clean_query, re.I)
    )

    if is_competitor_list and (len(competitor_only) == 0 or bool(re.search(r"all|list|how many|directory|landscape", clean_query, re.I))):
        return IntentResult("COMPETITOR_LIST", 0.98, [], clean_query, rectified_query)

    # 13. Pure Hireko Inquiry
    if is_explicit_hireko and len(competitor_only) == 0:
        return IntentResult(
            "HIREKO_SPECIFIC",
            0.95,
            ["Hireko"],
            clean_query,
            rectified_query,
            target_platform="Hireko",
        )

    # 14. Competitor-Specific Question
    if len(competitor_only) == 1 and not is_explicit_hireko:
        return IntentResult(
            "COMPETITOR_SPECIFIC",
            0.95,
            competitor_only,
            clean_query,
            rectified_query,
            target_platform=competitor_only[0],
        )

    # 15. General AI Recruitment QA
    if bool(re.search(r"star\s+method|behavioral|chunk|kpi|metric|recruiting|bias|interview", clean_query, re.I)):
        return IntentResult("GENERAL_QA", 0.95, [], clean_query, rectified_query)

    # 16. Fallback Unrelated Check
    if not RECRUITMENT_KEYWORDS.search(clean_query) and len(clean_query) > 5:
        return IntentResult("UNRELATED_QUESTION", 0.9, [], clean_query, rectified_query)

    # 17. Unrecognized check (garbled text / no vowels)
    vowels = re.compile(r"[aeiouy]", re.I)
    alpha_only = re.sub(r"[^a-zA-Z]", "", clean_query)
    if not vowels.search(clean_query) or len(clean_query) < 3 or (len(alpha_only) >= 4 and not vowels.search(alpha_only)):
        return IntentResult("UNRECOGNIZED", 0.3, [], clean_query, rectified_query)

    return IntentResult("GENERAL_QA", 0.9, [], clean_query, rectified_query)


def generate_casual_response(intent: IntentType, user_name: Optional[str] = None) -> str:
    name_short = f"{user_name}, " if user_name else ""
    if intent == "NAME_INTRO":
        return f"Hi {user_name}, what brings you here today?"
    elif intent == "CASUAL_GREETING":
        return f"Hey{f' {user_name}' if user_name else ''}! Nice to have you here. What would you like to explore today?"
    elif intent == "CASUAL_THANKS":
        return f"You're very welcome {name_short}glad I could help! Want to compare another platform?"
    elif intent == "CASUAL_CONFIRMATION":
        return f"Sounds good {name_short}whenever you're ready, we can dig into another platform!"
    elif intent == "CASUAL_GOODBYE":
        return f"See you {user_name or 'there'}! Come back anytime if you want to explore another competitor."
    elif intent == "UNRECOGNIZED":
        return f"I couldn't quite understand that {name_short}did you mean to ask about a platform like Hireko, Ribbon AI, Talview, or CodeSignal? Please re-check your spelling or click one of the suggested topics below!"
    return f"{f'Hi {user_name}! ' if user_name else ''}How can I help you research AI hiring products today?"
