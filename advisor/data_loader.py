import json
import os
from typing import Dict, List, Any, Optional

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "data")

PLATFORMS_FILE = os.path.join(DATA_DIR, "ai_hiring_platforms.json")
VECTOR_FILE = os.path.join(DATA_DIR, "vectorStore.json")

# In-memory caches
_platforms_cache: List[Dict[str, Any]] = []
_vector_store_cache: List[Dict[str, Any]] = []


def load_platforms() -> List[Dict[str, Any]]:
    global _platforms_cache
    if not _platforms_cache and os.path.exists(PLATFORMS_FILE):
        with open(PLATFORMS_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
            _platforms_cache = data.get("platforms", [])
    return _platforms_cache


def load_vector_store() -> List[Dict[str, Any]]:
    global _vector_store_cache
    if not _vector_store_cache and os.path.exists(VECTOR_FILE):
        with open(VECTOR_FILE, "r", encoding="utf-8") as f:
            _vector_store_cache = json.load(f)
    return _vector_store_cache


# Supported 8 Competitors Pricing Specification + Hireko
SUPPORTED_PRICING_DATA: Dict[str, Dict[str, Any]] = {
    "hirevue": {
        "name": "HireVue",
        "slug": "hirevue-vs-hireko",
        "publishedPrice": "No fixed subscription price shown",
        "pricingModel": "Enterprise/demo-led and ROI-based",
        "mainFocus": "Enterprise hiring, virtual recruiting and interview process optimization",
        "bestFor": "Organizations evaluating enterprise-level hiring and interview workflows",
        "enterpriseOption": "Yes (custom enterprise pricing based on hiring volume, departments, and integrations)",
        "pricingTransparency": "Low (requires sales engagement; no public price listed)",
        "cta": "Get a Demo, Request Demo or Ask Olivia",
        "plans": [
            {
                "name": "Enterprise Suite",
                "price": "Custom pricing",
                "details": "ROI-based custom quote tailored to organization hiring volume and workflow complexity",
            },
            {
                "name": "Demo-Led Consultation",
                "price": "Contact sales",
                "details": "Engage via 'Get a Demo', 'Request Demo', or virtual assistant 'Ask Olivia'",
            },
        ],
        "howItWorks": [
            "HireVue does not publish fixed subscription costs, using an enterprise/demo-led and ROI-based approach.",
            "Final quotes are scoped around annual hiring volume, departments, interview workflows, and enterprise ATS integrations.",
            "Best suited for large organizations evaluating enterprise-level virtual recruiting and standardized interview processes.",
        ],
        "interpretation": "HireVue does not publish fixed subscription costs. Its pricing model is enterprise/demo-led and ROI-based, requiring direct consultation with sales representatives.",
        "importantNote": "The stored information came from screenshots and should be verified on HireVue's official website before making a purchasing decision.",
        "categoryType": "employer",
    },
    "codesignal": {
        "name": "CodeSignal",
        "slug": "codesignal-vs-hireko",
        "publishedPrice": "$79/month",
        "pricingModel": "Monthly self-serve tiers plus custom enterprise pricing",
        "mainFocus": "Technical hiring and skills assessment",
        "bestFor": "Companies hiring technical talent and evaluating technical skills",
        "enterpriseOption": "Yes (Pro tier with custom pricing for enterprise suites and advanced security)",
        "pricingTransparency": "High for entry and growth tiers; custom for enterprise",
        "plans": [
            {
                "name": "Build Plan",
                "price": "$79/month",
                "details": "Entry technical testing and skills assessment for small engineering teams",
            },
            {
                "name": "Grow Plan",
                "price": "$479/month",
                "details": "Expanded assessment capacity and candidate test volumes for growing teams",
            },
            {
                "name": "Pro Plan",
                "price": "Custom pricing",
                "details": "Enterprise-grade testing suites, custom evaluation frameworks, and advanced security",
            },
        ],
        "howItWorks": [
            "Monthly self-serve tiers can be launched directly online without multi-year commitments.",
            "Provides cloud-based developer environments supporting 40+ programming languages and automated unit test scoring.",
            "Enterprise tier adds dedicated account support, SSO, and customized question libraries.",
        ],
        "interpretation": "CodeSignal provides transparent monthly self-serve pricing starting at $79/month for small engineering teams, scaling to $479/month for growing teams, and custom pricing for enterprise suites.",
        "importantNote": "The stored information is based on the screenshot-backed competitor pricing document and should be verified on CodeSignal's official website before making a purchasing decision.",
        "categoryType": "employer",
    },
    "greenhouse": {
        "name": "Greenhouse",
        "slug": "greenhouse-vs-hireko",
        "publishedPrice": "Not displayed",
        "pricingModel": "Sales-led/custom pricing",
        "mainFocus": "Applicant tracking, structured hiring and recruiting operations",
        "bestFor": "Organizations needing an ATS and structured hiring workflow",
        "enterpriseOption": "Yes (Pro plan with advanced enterprise security, configuration, audit logs, developer sandbox, and sync)",
        "pricingTransparency": "Low (custom sales quotes based on company size and hiring scale)",
        "cta": "Get a Demo or Request a Demo",
        "plans": [
            {
                "name": "Core Plan",
                "price": "Custom pricing",
                "details": "Includes sourcing/CRM, structured interviews, scorecards, AI matching, scheduling, reporting, and analytics",
            },
            {
                "name": "Plus Plan",
                "price": "Custom pricing",
                "details": "Includes Core features plus AI-powered reporting/filtering, BI connector, sourcing automation, and texting",
            },
            {
                "name": "Pro Plan",
                "price": "Custom pricing",
                "details": "Includes Plus features plus advanced enterprise security, configuration, audit logs, developer sandbox, and sync",
            },
            {
                "name": "Sales CTA",
                "price": "Sales-directed",
                "details": "Available via 'Get a Demo' or 'Request a Demo'",
            },
        ],
        "howItWorks": [
            "Greenhouse does not publish standard subscription costs; pricing is sales-directed based on organization headcount and hiring volume.",
            "Operates as an applicant tracking system (ATS) and hiring operations suite managing complete recruitment funnels.",
            "Selected tier (Core, Plus, or Pro) determines access to advanced reporting, automation, and enterprise security governance.",
        ],
        "interpretation": "Greenhouse does not publish standard subscription costs. As an applicant tracking system (ATS) and hiring operations suite, its pricing is sales-led and structured around team headcount and hiring scale.",
        "importantNote": "The stored information is based on the screenshot-backed competitor pricing document and should be verified on Greenhouse's official website before making a purchasing decision.",
        "categoryType": "employer",
    },
    "interviewer": {
        "name": "Interviewer.ai",
        "slug": "interviewer-ai-vs-hireko",
        "publishedPrice": "$199/month",
        "pricingModel": "Monthly subscription plus custom enterprise pricing",
        "mainFocus": "AI-powered interviews and candidate screening",
        "bestFor": "Teams wanting automated virtual interviews and structured screening",
        "enterpriseOption": "Yes (Enterprise plan via direct contact with the company)",
        "pricingTransparency": "High for standard plans; custom for enterprise",
        "plans": [
            {
                "name": "Essential Plan",
                "price": "$199/month",
                "details": "Core AI-powered virtual interviews and candidate screening",
            },
            {
                "name": "Professional Plan",
                "price": "$399/month",
                "details": "Higher candidate capacity, additional recruiter seats, and advanced screening rubrics",
            },
            {
                "name": "Enterprise Plan",
                "price": "Contact company",
                "details": "Custom candidate volumes, SLA guarantees, and enterprise account management",
            },
        ],
        "howItWorks": [
            "Monthly subscriptions allow teams to automate first-round video interviews and candidate pre-screening.",
            "Evaluates candidate video explanations alongside automated cognitive aptitude and resume matching.",
            "Final subscription cost scales based on active screening volume and custom evaluation criteria.",
        ],
        "interpretation": "Interviewer.ai lists clear self-serve monthly plans starting at $199/month for essential AI video screening, scaling to $399/month for professional teams needing broader screening capacity.",
        "importantNote": "The stored information is based on the screenshot-backed competitor pricing document and should be verified on Interviewer.ai's official website before making a purchasing decision.",
        "categoryType": "employer",
    },
    "mercor": {
        "name": "Mercor",
        "slug": "mercor-vs-hireko",
        "publishedPrice": "No conventional pricing table shown",
        "pricingModel": "Marketplace and enterprise engagement with contact-led conversion",
        "mainFocus": "Human intelligence, AI evaluation, expert talent marketplace and agent deployment",
        "bestFor": "Organizations seeking AI evaluation, expert networks or human data and evaluation services",
        "enterpriseOption": "Yes (bespoke enterprise contracts and talent placement agreements)",
        "pricingTransparency": "Low for standard SaaS (contact-driven marketplace model)",
        "plans": [
            {
                "name": "Talent Marketplace Engagement",
                "price": "Contact-led / Custom",
                "details": "Engagement-based pricing via contractor hourly margins or candidate placement fees",
            },
            {
                "name": "AI Evaluation & Data Services",
                "price": "Bespoke scope",
                "details": "Custom enterprise contracts for AI model evaluation and expert human data",
            },
        ],
        "howItWorks": [
            "Mercor does not publish a conventional software SaaS subscription pricing table.",
            "Operates as an AI-vetted global talent marketplace rather than seat-based recruiting software.",
            "Organizations engage Mercor to hire pre-vetted international engineers or procure specialized AI evaluation deliverables.",
        ],
        "interpretation": "Mercor operates as a talent marketplace and AI evaluation network rather than a standard recruiting SaaS software tool. Pricing is engagement-driven based on talent placements or custom deliverables.",
        "importantNote": "The stored information is based on the screenshot-backed competitor pricing document and should be verified on Mercor's official website before making a purchasing decision.",
        "categoryType": "marketplace",
    },
    "metaview": {
        "name": "Metaview",
        "slug": "metaview-vs-hireko",
        "publishedPrice": "$0/month (Free) / $100/month (Pro)",
        "pricingModel": "Self-serve monthly tiers plus enterprise pricing",
        "mainFocus": "AI recruiting platform and recruiting agents",
        "bestFor": "Recruiting teams looking for AI-assisted recruiting workflow automation",
        "enterpriseOption": "Yes (tailored/custom pricing for organization-wide rollouts)",
        "pricingTransparency": "High (public self-serve tiers up to Max)",
        "plans": [
            {
                "name": "Free Plan",
                "price": "$0/month",
                "details": "Light evaluation tier subject to source feature and monthly call volume limits",
            },
            {
                "name": "Pro Plan",
                "price": "$100/month",
                "details": "Full AI note-taking and recruiting agent automation for active recruiters",
            },
            {
                "name": "Max Plan",
                "price": "$300/month",
                "details": "High-volume interview workflows, advanced AI agents, and team-wide intelligence",
            },
            {
                "name": "Enterprise Plan",
                "price": "Tailored / Custom",
                "details": "Custom pricing for organization-wide rollouts, dedicated support, and enterprise governance",
            },
        ],
        "howItWorks": [
            "Transparent self-serve monthly tiers can be activated online without multi-year contracts.",
            "Listens into live interview calls to generate automated structured recruiter notes and ATS summaries.",
            "Final monthly investment scales with selected tier features and active recruiter seats.",
        ],
        "interpretation": "Metaview offers transparent self-serve monthly tiers starting with a $0/month Free tier for light usage, scaling to Pro ($100/month) and Max ($300/month) for active recruiting teams.",
        "importantNote": "The stored information is based on the screenshot-backed competitor pricing document and should be verified on Metaview's official website before making a purchasing decision.",
        "categoryType": "employer",
    },
    "sparkhire": {
        "name": "Spark Hire",
        "slug": "sparkhire-vs-hireko",
        "publishedPrice": "$335/month",
        "pricingModel": "Monthly subscription plus custom enterprise pricing",
        "mainFocus": "Applicant tracking, video interviews and behavioral assessment",
        "bestFor": "Teams that need ATS, video interviewing and behavioral assessment capabilities",
        "enterpriseOption": "Yes (Recruit Enterprise; Talk to Sales)",
        "pricingTransparency": "High for published plans; custom for enterprise",
        "plans": [
            {
                "name": "Recruit Pro",
                "price": "$335/month",
                "details": "Standard one-way video interviewing, behavioral assessment, and basic ATS tools",
            },
            {
                "name": "Recruit Growth",
                "price": "$499/month",
                "details": "Higher concurrent active job limits, additional reviewer seats, and workflow tools",
            },
            {
                "name": "Recruit Enterprise",
                "price": "Talk to Sales",
                "details": "Custom enterprise tier with dedicated account management and custom integration",
            },
        ],
        "howItWorks": [
            "Published monthly plans provide asynchronous video interviewing where candidates record answers into prompts.",
            "Includes candidate tracking and team sharing tools for hiring manager review.",
            "Pricing scales based on concurrent job openings and user seats.",
        ],
        "interpretation": "Spark Hire publishes monthly subscriptions starting at $335/month for Recruit Pro and $499/month for Recruit Growth, offering one-way video interviews, behavioral assessments, and ATS features.",
        "importantNote": "The stored information is based on the screenshot-backed competitor pricing document and should be verified on Spark Hire's official website before making a purchasing decision.",
        "categoryType": "employer",
    },
    "myinterview": {
        "name": "myInterview",
        "slug": "myinterview-vs-hireko",
        "publishedPrice": "£0 (Free) / £5 (20 credits) / £29 (Full prep)",
        "pricingModel": "Candidate-focused interview practice/session pricing",
        "mainFocus": "AI interview practice and coaching",
        "bestFor": "Individual candidates preparing for interviews",
        "enterpriseOption": "No (Candidate-focused interview practice product)",
        "pricingTransparency": "High (published in British Pounds £)",
        "plans": [
            {
                "name": "Free Practice",
                "price": "£0",
                "details": "Initial candidate interview practice sessions with automated feedback",
            },
            {
                "name": "20-Session Credits",
                "price": "£5",
                "details": "Pay-as-you-go credit pack for candidate interview preparation",
            },
            {
                "name": "Full Prep Pack",
                "price": "£29",
                "details": "Comprehensive interview coaching with in-depth AI response analysis",
            },
        ],
        "howItWorks": [
            "Priced in British Pounds (£) specifically for individual candidates and job seekers.",
            "Designed for interview practice and coaching, not as an employer ATS or enterprise screening platform.",
            "Candidates record answers to common interview questions to build confidence and refine performance.",
        ],
        "interpretation": "myInterview is priced for individual job candidates looking to practice interview questions and receive AI coaching feedback, not as an employer ATS or enterprise recruiting platform.",
        "importantNote": "The stored information is based on the screenshot-backed competitor pricing document and should be verified on myInterview's official website before making a purchasing decision.",
        "categoryType": "candidate",
    },
    "hireko": {
        "name": "Hireko",
        "slug": "hireko",
        "publishedPrice": "Usage-aligned SaaS subscription",
        "pricingModel": "Flexible monthly/annual subscription",
        "mainFocus": "Autonomous two-way conversational voice and video interview screening",
        "bestFor": "High-volume recruitment teams seeking live two-way AI interviews with instant autograding",
        "enterpriseOption": "Yes (volume scaling with dedicated support)",
        "pricingTransparency": "High (transparent SaaS model, zero mandatory implementation retainers)",
        "plans": [
            {
                "name": "Flexible SaaS Subscription",
                "price": "Usage-aligned SaaS",
                "details": "Monthly or annual billing scaling with active candidate screening volume",
            },
            {
                "name": "Zero Implementation Fees",
                "price": "$0 setup",
                "details": "Full self-serve deployment without mandatory professional service retainers",
            },
        ],
        "howItWorks": [
            "Conducts autonomous two-way voice and video interviews with dynamic real-time follow-up questions.",
            "Delivers standardized rubric autograding scorecards in under 2 minutes per applicant.",
            "Operates on a flexible SaaS subscription with zero multi-year lock-in.",
        ],
        "interpretation": "Hireko operates on a flexible SaaS subscription aligned with active candidate screening volume, eliminating multi-year commitments and implementation retainers.",
        "importantNote": "Please visit Hireko's official pricing page or schedule a platform walkthrough for volume-based tier details.",
        "categoryType": "employer",
    },
}

# Weaknesses Lookup
COMPETITOR_WEAKNESSES: Dict[str, List[Dict[str, str]]] = {
    "juicebox": [
        {"limitation": "No Native Interview Screening", "impact": "Juicebox stops at talent discovery; teams must integrate interview screening software."},
        {"limitation": "Credit-Based Enrichment Consumption", "impact": "Contact enrichment consumes credits that can deplete quickly on large campaigns."},
    ],
    "ribbon": [
        {"limitation": "Primarily Voice-Centric Dialogue", "impact": "Focuses on audio phone calls without native multi-camera proctoring or visual video monitoring."},
        {"limitation": "Ecosystem Maturation", "impact": "Features a modern platform footprint compared to multi-decade legacy enterprise ATS suites."},
    ],
    "talview": [
        {"limitation": "Rigid Proctoring Environment", "impact": "Strict anti-cheat protocols can create unnecessary anxiety for standard corporate roles."},
        {"limitation": "Annual Contract Overhead", "impact": "Enterprise contracts typically start at $15k–$25k/yr, limiting flexibility for startups."},
    ],
    "hirevue": [
        {"limitation": "One-Way Webcam Monologue Fatigue", "impact": "Static video timers cause high candidate drop-off compared to interactive conversation."},
        {"limitation": "High Enterprise Minimums", "impact": "Annual contracts often exceed $35k/year with required professional implementation fees."},
    ],
    "modernhire": [
        {"limitation": "Enterprise Suite Complexity", "impact": "Operating under HireVue, deployment requires multi-week enterprise provisioning."},
        {"limitation": "Asynchronous Interaction Model", "impact": "Lacks adaptive two-way AI dialogue that asks dynamic follow-up questions in real time."},
    ],
    "sparkhire": [
        {"limitation": "Manual Recruiter Review Overhead", "impact": "Recruiters must manually watch video clips without autonomous rubric scoring."},
        {"limitation": "Basic Screening Feature Set", "impact": "Lacks live two-way AI dialogue, real-time follow-ups, and resume match parsing."},
    ],
    "willo": [
        {"limitation": "Asynchronous Only", "impact": "Candidates record responses into prompts rather than having a natural conversational dialogue."},
        {"limitation": "Manual Review Required", "impact": "Requires recruiters to review submissions manually without automated scoring rubrics."},
    ],
    "myinterview": [
        {"limitation": "Consolidated Under Spark Hire", "impact": "Standalone platform capabilities are transitioning into the Spark Hire product ecosystem."},
        {"limitation": "Static Question Progression", "impact": "Cannot probe dynamically into candidate responses or ask real-time follow-up questions."},
    ],
    "interviewer": [
        {"limitation": "One-Way Monologue Model", "impact": "Static video recording creates an impersonal experience compared to two-way conversation."},
        {"limitation": "Rigid Quiz Structure", "impact": "Standardized cognitive aptitude questions may not reflect specific day-to-day job duties."},
    ],
    "codesignal": [
        {"limitation": "Narrow Technical Domain", "impact": "Specialized strictly for coding tests; cannot screen general verbal communication or soft skills."},
        {"limitation": "Expensive Tiering", "impact": "Enterprise subscriptions require substantial annual commitments for full test libraries."},
    ],
    "coderbyte": [
        {"limitation": "Technical Screening Only", "impact": "Lacks video, voice, or conversational capabilities for holistic candidate evaluation."},
        {"limitation": "Limited Enterprise Workflow Customization", "impact": "Best suited for smaller teams; lacks complex enterprise ATS routing."},
    ],
    "mercor": [
        {"limitation": "Marketplace Lock-In", "impact": "Designed as an external talent agency rather than software for your direct job applicants."},
        {"limitation": "Premium Talent Placement Margins", "impact": "Hiring through the marketplace incurs placement markups on candidate salaries."},
    ],
    "paradox": [
        {"limitation": "SMS and Scheduling Specialization", "impact": "Specializes in text scheduling; does not conduct in-depth technical or domain interviews."},
        {"limitation": "Enterprise Focus", "impact": "Targeted at large high-volume retail/service chains; less suitable for small professional teams."},
    ],
    "humanly": [
        {"limitation": "Pre-Screening Only", "impact": "Automates chat screening and notes, but does not conduct comprehensive video interviews."},
        {"limitation": "ATS Dependency", "impact": "Best value requires existing enterprise ATS infrastructure."},
    ],
    "metaview": [
        {"limitation": "Passive Note-Taker Only", "impact": "Listens to human interviewers rather than conducting interviews autonomously."},
        {"limitation": "Human Recruiter Still Required", "impact": "Does not reduce initial recruiter screening hours; only reduces note-taking time."},
    ],
    "greenhouse": [
        {"limitation": "No Native AI Interview Screening", "impact": "Functions as an ATS database; requires third-party tools to conduct candidate interviews."},
        {"limitation": "Implementation Overhead", "impact": "Enterprise ATS setup requires structured change management and administrator training."},
    ],
    "recruit41": [
        {"limitation": "Emerging Market Presence", "impact": "Smaller third-party integration catalog compared to mature enterprise platforms."},
        {"limitation": "Limited Technical Evaluation", "impact": "Not designed for in-depth engineering compilers or live coding assessments."},
    ],
}


def find_platform_by_name(name: Optional[str]) -> Optional[Dict[str, Any]]:
    if not name:
        return None
    platforms = load_platforms()
    norm = "".join(c for c in name.lower() if c.isalnum())
    for p in platforms:
        p_norm = "".join(c for c in p["name"].lower() if c.isalnum())
        p_id = "".join(c for c in p.get("id", "").lower() if c.isalnum())
        if norm == p_norm or norm == p_id or norm in p_norm or p_norm in norm:
            return p
    return None


def get_platform_pricing(name: Optional[str]) -> Optional[Dict[str, Any]]:
    if not name:
        return None
    norm = "".join(c for c in name.lower() if c.isalnum())
    for key, item in SUPPORTED_PRICING_DATA.items():
        key_norm = "".join(c for c in key.lower() if c.isalnum())
        name_norm = "".join(c for c in item["name"].lower() if c.isalnum())
        if norm == key_norm or norm == name_norm or key_norm in norm or norm in key_norm:
            return item
    return None
