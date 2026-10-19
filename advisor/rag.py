import os
import re
from typing import List, Dict, Any, Optional
import httpx

from .models import (
    IntentType,
    ChatMessage,
    SourceCitation,
    ProductCardData,
    ChatResponse,
)
from .data_loader import (
    load_platforms,
    load_vector_store,
    find_platform_by_name,
)
from .intent import IntentResult, classify_intent, generate_casual_response

SYSTEM_PROMPT = """You are the AI Product Advisor for Hireko.ai and AI recruitment technologies.
Be concise, authoritative, and structured. Always use markdown tables for multi-attribute data."""

PLATFORM_PROFILES: Dict[str, Dict[str, Any]] = {
    "hireko": {
        "name": "Hireko.ai",
        "slug": "hireko",
        "category": "Autonomous AI Interviewing",
        "features": {
            "aiInterview": "Yes",
            "videoInterview": "Yes",
            "liveVideo": "Yes",
            "interviewAnalysis": "Yes",
            "facialRecognition": "No",
            "candidateAssessment": "Yes",
            "aiEvaluation": "Yes",
            "proctoring": "Limited",
            "codingSandbox": "No",
            "gameBasedAssessment": "No",
        },
        "featureDetails": {
            "aiInterview": "Live bidirectional voice and video dialogues with adaptive dynamic follow-ups.",
            "videoInterview": "Interactive 2-way webcam and voice candidate interviews.",
            "liveVideo": "Live bidirectional 2-way webcam and voice candidate interviews with dynamic adaptive AI follow-ups.",
            "interviewAnalysis": "Automated real-time speech transcription, rubric mapping, and competency scoring.",
            "facialRecognition": "Not supported; focuses on verbal competence and rubrics, avoiding facial biometric bias.",
            "candidateAssessment": "Standardized evaluation rubrics and role-specific competency benchmarks.",
            "aiEvaluation": "Instant autograding scorecards delivered within ~2 minutes of interview completion.",
            "proctoring": "Session verification and conversational depth probing.",
            "codingSandbox": "Focuses on conversational architecture and conceptual technical probing.",
            "gameBasedAssessment": "Focuses on live conversational voice and video AI interviews with dynamic follow-up probing, rather than gamified psychometrics.",
        },
        "pricingStatus": "Available",
        "pricingModel": "Subscription / Volume SaaS",
        "pricingNotes": "Flexible volume-based SaaS tiers; zero mandatory setup retainers and no lock-in.",
        "bestFor": "Recruiters automating first-round conversational screening with high candidate engagement",
        "superpower": "Live bidirectional voice & video AI interview with dynamic adaptive follow-ups and ~2 min autograding.",
        "recruiterWorkflow": "Instant autograding scorecards and candidate competency summaries in ~2 min.",
        "candidateExperience": "Interactive, natural conversational dialogue without awkward countdown timers.",
        "websiteUrl": "https://hireko.ai",
    },
    "hirevue": {
        "name": "HireVue",
        "slug": "hirevue",
        "category": "Enterprise Video Assessments",
        "features": {
            "aiInterview": "Yes",
            "videoInterview": "Yes",
            "liveVideo": "Yes",
            "interviewAnalysis": "Yes",
            "facialRecognition": "No",
            "candidateAssessment": "Yes",
            "aiEvaluation": "Yes",
            "proctoring": "Limited",
            "codingSandbox": "Limited",
            "gameBasedAssessment": "Yes",
        },
        "featureDetails": {
            "aiInterview": "Asynchronous one-way video assessments with structured automated prompts.",
            "videoInterview": "Pre-recorded candidate webcam responses to timed prompts.",
            "liveVideo": "Live video interviews and structured on-demand recorded video assessments.",
            "interviewAnalysis": "Natural language processing and speech-to-text analysis.",
            "facialRecognition": "Phased out in 2021 to prevent algorithmic bias and comply with AI auditing laws.",
            "candidateAssessment": "Game-based cognitive tests and structured pre-hire competency batteries.",
            "aiEvaluation": "Automated Interview Scoring (AIS) based on speech and transcript models.",
            "proctoring": "Browser focus tracking and webcam snapshot verification.",
            "codingSandbox": "Basic technical coding screening challenges (CodeVue).",
            "gameBasedAssessment": "Short, mobile-friendly games (<20 min) measuring cognitive skills, attention, and learning agility via IO psychology.",
        },
        "pricingStatus": "Custom pricing",
        "pricingModel": "Custom / Annual Enterprise",
        "pricingNotes": "Custom pricing — customers need to contact the sales team for a quote (~$15,000–$35,000+/year).",
        "bestFor": "Global 2000 enterprises requiring legacy ATS integrations and enterprise compliance",
        "superpower": "Enterprise compliance, structured video assessments, and deep ATS integrations.",
        "recruiterWorkflow": "Recruiter review portal, ATS synchronization, and hiring committee dashboards.",
        "candidateExperience": "One-way webcam recordings to timed questions on a countdown screen.",
    },
    "talview": {
        "name": "Talview",
        "slug": "talview",
        "category": "Proctored Assessments & Video",
        "features": {
            "aiInterview": "Yes",
            "videoInterview": "Yes",
            "liveVideo": "Yes",
            "interviewAnalysis": "Yes",
            "facialRecognition": "Yes",
            "candidateAssessment": "Yes",
            "aiEvaluation": "Yes",
            "proctoring": "Yes",
            "codingSandbox": "Yes",
        },
        "featureDetails": {
            "aiInterview": "Automated video interviews integrated with assessment workflows.",
            "videoInterview": "One-way asynchronous and live proctored video sessions.",
            "liveVideo": "Live video interviews with remote proctoring and identity verification.",
            "interviewAnalysis": "NLP-based response scoring and candidate integrity behavioral metrics.",
            "facialRecognition": "Supported for identity verification and multi-face cheating detection during exams.",
            "candidateAssessment": "Broad test library across cognitive, behavioral, coding, and typing skills.",
            "aiEvaluation": "AI proctoring score and automated candidate capability ratings.",
            "proctoring": "Comprehensive exam proctoring with secure browser lock and secondary camera monitoring.",
            "codingSandbox": "Multi-language online coding environment for technical exams.",
        },
        "pricingStatus": "Custom pricing",
        "pricingModel": "Custom / Annual Contract",
        "pricingNotes": "Custom pricing — customers need to contact the sales team for a quote (~$15,000–$25,000/year).",
        "bestFor": "Universities, licensing boards, and organizations conducting high-stakes proctored testing",
        "superpower": "Exam-grade remote proctoring, facial identity authentication, and secure browser lock.",
        "recruiterWorkflow": "Proctoring flags review, cheating audit logs, and test score reports.",
        "candidateExperience": "Secured, monitored examination flow with webcam and browser restrictions.",
    },
    "sparkhire": {
        "name": "Spark Hire",
        "slug": "sparkhire",
        "category": "Video Interview Platform",
        "features": {
            "aiInterview": "No",
            "videoInterview": "Yes",
            "liveVideo": "Yes",
            "interviewAnalysis": "No",
            "facialRecognition": "No",
            "candidateAssessment": "Limited",
            "aiEvaluation": "No",
            "proctoring": "No",
            "codingSandbox": "No",
        },
        "featureDetails": {
            "aiInterview": "Does not provide conversational AI; focuses on recorded video clips.",
            "videoInterview": "Asynchronous one-way video recordings and live interview scheduling.",
            "liveVideo": "Offers live video interviews alongside its core one-way recorded video screening.",
            "interviewAnalysis": "No automated NLP analysis or transcript evaluation.",
            "facialRecognition": "Not supported.",
            "candidateAssessment": "Custom recruiter text questions without automated skill scoring.",
            "aiEvaluation": "Recruiters must manually watch and rate recorded video responses.",
            "proctoring": "Not supported.",
            "codingSandbox": "Not supported.",
        },
        "pricingStatus": "Available",
        "pricingModel": "Subscription",
        "pricingNotes": "Transparent self-serve tiers starting from $149/mo (Recruit Pro) to $299/mo (Growth).",
        "bestFor": "Small to mid-sized businesses wanting straightforward manual video reviews",
        "superpower": "Simple, budget-friendly one-way recorded video interviewing.",
        "recruiterWorkflow": "Manual video playback, team sharing, and star ratings.",
        "candidateExperience": "One-way webcam recordings with retake options.",
    },
    "metaview": {
        "name": "Metaview",
        "slug": "metaview",
        "category": "AI Interview Copilot",
        "features": {
            "aiInterview": "No",
            "videoInterview": "Limited",
            "liveVideo": "Yes",
            "interviewAnalysis": "Yes",
            "facialRecognition": "No",
            "candidateAssessment": "Limited",
            "aiEvaluation": "Limited",
            "proctoring": "No",
            "codingSandbox": "No",
        },
        "featureDetails": {
            "aiInterview": "Does not automate the interview itself; acts as a silent AI note-taker during human-led calls.",
            "videoInterview": "Attends Google Meet, Zoom, and MS Teams calls as an AI bot.",
            "liveVideo": "Attends live video interviews on Zoom, Teams, and Google Meet as an AI note-taker.",
            "interviewAnalysis": "Generates structured interview notes, ATS summaries, and key conversation takeaways.",
            "facialRecognition": "Not supported; processes audio and speech transcripts only.",
            "candidateAssessment": "Extracts candidate competency signals from the human interviewer's dialogue.",
            "aiEvaluation": "Synthesizes structured notes; final hiring decisions remain with the interviewer.",
            "proctoring": "Not supported.",
            "codingSandbox": "Not supported.",
        },
        "pricingStatus": "Available",
        "pricingModel": "Subscription",
        "pricingNotes": "Free tier available; Pro plan starts at $20–$40/seat/month.",
        "bestFor": "Recruiters and hiring managers wanting automated notes from human-led calls",
        "superpower": "Automated AI interview note-taking and ATS scorecard summaries.",
        "recruiterWorkflow": "Automatic sync to ATS notes, saving 15-20 min of manual write-ups per interview.",
        "candidateExperience": "Standard human interview with a silent AI note-taker bot present.",
    },
    "codesignal": {
        "name": "CodeSignal",
        "slug": "codesignal",
        "category": "Technical Assessment Platform",
        "features": {
            "aiInterview": "Limited",
            "videoInterview": "No",
            "liveVideo": "Limited",
            "interviewAnalysis": "Limited",
            "facialRecognition": "No",
            "candidateAssessment": "Yes",
            "aiEvaluation": "Yes",
            "proctoring": "Yes",
            "codingSandbox": "Yes",
        },
        "featureDetails": {
            "aiInterview": "Cosmo conversational AI assistant available inside live coding environments.",
            "videoInterview": "Focuses on technical coding sandboxes rather than video screening.",
            "liveVideo": "Live collaborative pair-programming IDE with integrated video and audio chat.",
            "interviewAnalysis": "Analyzes code quality, test case coverage, execution time, and algorithmic complexity.",
            "facialRecognition": "Not supported; uses periodic webcam snapshots for proctored test integrity.",
            "candidateAssessment": "Standardized Coding Score (300–850) and pre-certified technical skill evaluations.",
            "aiEvaluation": "Automated unit test execution and algorithmic scoring against standardized benchmarks.",
            "proctoring": "Certified proctoring rules with environment checks for standardized scores.",
            "codingSandbox": "Full-featured multi-language IDE with 40+ supported languages and frameworks.",
        },
        "pricingStatus": "Available",
        "pricingModel": "Subscription",
        "pricingNotes": "Self-serve plans start at $79/mo (Build) and $479/mo (Grow); Enterprise is custom.",
        "bestFor": "Engineering teams needing standardized technical coding benchmarks and IDE pair programming",
        "superpower": "Standardized Coding Score (300–850) and real-time cloud IDE coding environments.",
        "recruiterWorkflow": "Standardized test score ranking, plagiarism reports, and automated code playback.",
        "candidateExperience": "Hands-on browser-based coding challenges and algorithmic tests.",
    },
    "ribbon": {
        "name": "Ribbon AI",
        "slug": "ribbon",
        "category": "Voice Screening & Outreach",
        "features": {
            "aiInterview": "Yes",
            "videoInterview": "Limited",
            "liveVideo": "Limited",
            "interviewAnalysis": "Yes",
            "facialRecognition": "No",
            "candidateAssessment": "Yes",
            "aiEvaluation": "Yes",
            "proctoring": "No",
            "codingSandbox": "No",
        },
        "featureDetails": {
            "aiInterview": "Autonomous voice screening agents conducting phone calls with dynamic follow-ups.",
            "videoInterview": "Specializes in telephone voice calls and WhatsApp messaging rather than video.",
            "liveVideo": "Specializes in live AI phone calls and WhatsApp audio rather than native live video.",
            "interviewAnalysis": "Automated call audio transcription and candidate qualification analysis.",
            "facialRecognition": "Not supported; telephony and voice based.",
            "candidateAssessment": "Automated screening against job requirements and recruiter rubrics.",
            "aiEvaluation": "Instant candidate summary scorecards and qualification status.",
            "proctoring": "Not supported.",
            "codingSandbox": "Not supported.",
        },
        "pricingStatus": "Available",
        "pricingModel": "Subscription",
        "pricingNotes": "Plans start at $499/month with included candidate screening allowances.",
        "bestFor": "High-volume recruitment teams needing WhatsApp outreach and automated phone screening",
        "superpower": "Multi-channel WhatsApp outreach combined with autonomous AI phone voice screening.",
        "recruiterWorkflow": "Automated phone outreach, call recordings, and qualified candidate notifications.",
        "candidateExperience": "Inbound or outbound telephone voice conversations and WhatsApp chats.",
    },
    "willo": {
        "name": "Willo",
        "slug": "willo",
        "category": "Async Video Screening",
        "features": {
            "aiInterview": "No",
            "videoInterview": "Yes",
            "liveVideo": "No",
            "interviewAnalysis": "Limited",
            "facialRecognition": "No",
            "candidateAssessment": "Limited",
            "aiEvaluation": "No",
            "proctoring": "No",
            "codingSandbox": "No",
        },
        "featureDetails": {
            "aiInterview": "Asynchronous one-way video/audio screening; no bidirectional AI dialogue.",
            "videoInterview": "Browser-based video and audio recording without requiring candidate app downloads.",
            "liveVideo": "Specializes in asynchronous one-way recorded video responses, not real-time live video.",
            "interviewAnalysis": "Basic automated transcription and answer length metrics.",
            "facialRecognition": "Not supported.",
            "candidateAssessment": "Custom screening questions and ID verification checks.",
            "aiEvaluation": "Requires manual recruiter review and grading.",
            "proctoring": "Not supported.",
            "codingSandbox": "Not supported.",
        },
        "pricingStatus": "Available",
        "pricingModel": "Subscription",
        "pricingNotes": "Lite tier starts at $59/live role; Growth plans start from $250/month.",
        "bestFor": "Startups and scaleups needing quick app-free video responses",
        "superpower": "App-free browser-based async video, audio, and text screening on any device.",
        "recruiterWorkflow": "Async video response review queue and candidate shortlisting.",
        "candidateExperience": "Asynchronous video recording directly inside mobile or desktop browsers.",
    },
        "myinterview": {
        "name": "myInterview",
        "slug": "myinterview",
        "category": "Asynchronous Video Interviewing",
        "features": {
            "aiInterview": "Limited",
            "videoInterview": "Yes",
            "liveVideo": "Unknown",
            "interviewAnalysis": "Yes",
            "facialRecognition": "No",
            "candidateAssessment": "Yes",
            "aiEvaluation": "Limited",
            "proctoring": "No",
            "codingSandbox": "No",
            "gameBasedAssessment": "No",
        },
        "featureDetails": {
            "aiInterview": "On-demand video screening with automated prompt sequencing and candidate responses.",
            "videoInterview": "Asynchronous video screening where candidates record webcam responses to structured questions.",
            "liveVideo": "Primarily asynchronous on-demand video screening; synchronous live video is not confirmed in current packages.",
            "interviewAnalysis": "Automated transcription and AI-assisted candidate response filtering.",
            "facialRecognition": "Not supported; avoids biometric facial analysis.",
            "candidateAssessment": "Custom video and text pre-screening question sets.",
            "aiEvaluation": "AI-assisted screening recommendations based on response keywords and recruiter criteria.",
            "proctoring": "Not supported.",
            "codingSandbox": "Not supported.",
            "gameBasedAssessment": "Not supported.",
        },
        "pricingStatus": "Available",
        "pricingModel": "Subscription / Managed via Spark Hire",
        "pricingNotes": "Pricing managed under Spark Hire suite; contact vendor for volume packaging.",
        "bestFor": "Recruiters looking for candidate-friendly asynchronous video screening at scale",
        "superpower": "Candidate-friendly asynchronous video responses and quick recruiter review.",
        "recruiterWorkflow": "Video playback dashboard, team collaboration, and shortlisting.",
        "candidateExperience": "Mobile-friendly one-way recorded video responses to timed questions.",
    },
    "paradox": {
        "name": "Paradox (Olivia)",
        "slug": "paradox",
        "category": "Conversational Recruiting Assistant",
        "features": {
            "aiInterview": "Limited",
            "videoInterview": "No",
            "liveVideo": "No",
            "interviewAnalysis": "Limited",
            "facialRecognition": "No",
            "candidateAssessment": "Limited",
            "aiEvaluation": "Limited",
            "proctoring": "No",
            "codingSandbox": "No",
        },
        "featureDetails": {
            "aiInterview": "Conversational mobile SMS/WhatsApp chatbot for high-volume screening and scheduling.",
            "videoInterview": "Focuses on mobile messaging and interview scheduling rather than video interviewing.",
            "liveVideo": "Focuses on conversational mobile SMS/chat scheduling; integrates with 3rd-party video.",
            "interviewAnalysis": "Parses text responses to basic pre-qualification criteria.",
            "facialRecognition": "Not supported.",
            "candidateAssessment": "Automated qualifying questionnaire for hourly and retail hiring.",
            "aiEvaluation": "Pass/fail rule-based routing to hiring managers.",
            "proctoring": "Not supported.",
            "codingSandbox": "Not supported.",
        },
        "pricingStatus": "Custom pricing",
        "pricingModel": "Custom / Annual Enterprise",
        "pricingNotes": "Custom pricing — customers need to contact the sales team for a quote.",
        "bestFor": "High-volume retail, hospitality, and healthcare employers hiring hourly workers",
        "superpower": "Conversational mobile SMS text scheduling and instant interview booking.",
        "recruiterWorkflow": "Automated candidate capture, screening questions, and calendar sync.",
        "candidateExperience": "Frictionless SMS text messaging dialogue on mobile devices.",
    },
    "modernhire": {
        "name": "Modern Hire",
        "slug": "modernhire",
        "category": "Enterprise Assessment & Hiring",
        "features": {
            "aiInterview": "Yes",
            "videoInterview": "Yes",
            "liveVideo": "Yes",
            "interviewAnalysis": "Yes",
            "facialRecognition": "No",
            "candidateAssessment": "Yes",
            "aiEvaluation": "Yes",
            "proctoring": "Limited",
            "codingSandbox": "No",
            "gameBasedAssessment": "Yes",
        },
        "featureDetails": {
            "aiInterview": "Structured on-demand digital interviews with Automated Interview Scoring (AIS).",
            "videoInterview": "Asynchronous video and text interview workflows.",
            "liveVideo": "Supports live and on-demand video interviewing with automated scoring.",
            "interviewAnalysis": "Psychometrically validated language scoring and job simulation analytics.",
            "facialRecognition": "Phased out in alignment with enterprise compliance standards.",
            "candidateAssessment": "Virtual job tryouts, cognitive simulations, and pre-hire assessments.",
            "aiEvaluation": "Automated Interview Scoring (AIS) mapped to validated hiring competencies.",
            "proctoring": "Identity and session consistency checks.",
            "codingSandbox": "Not supported.",
            "gameBasedAssessment": "Psychometrically validated assessments and virtual job simulations (part of HireVue).",
        },
        "pricingStatus": "Custom pricing",
        "pricingModel": "Custom / Annual Contract",
        "pricingNotes": "Custom pricing — customers need to contact the sales team for a quote (part of HireVue).",
        "bestFor": "Enterprises requiring scientifically validated psychometric assessments",
        "superpower": "Automated Interview Scoring (AIS) and psychometrically validated job simulations.",
        "recruiterWorkflow": "Competency matching scorecards and enterprise compliance tracking.",
        "candidateExperience": "Structured digital interview flows with interactive simulations.",
    },
    "juicebox": {
        "name": "Juicebox (PeopleGPT)",
        "slug": "juicebox",
        "category": "AI Talent Sourcing",
        "features": {
            "aiInterview": "No",
            "videoInterview": "No",
            "liveVideo": "No",
            "interviewAnalysis": "No",
            "facialRecognition": "No",
            "candidateAssessment": "No",
            "aiEvaluation": "No",
            "proctoring": "No",
            "codingSandbox": "No",
        },
        "featureDetails": {
            "aiInterview": "Dedicated talent sourcing engine; does not conduct interviews.",
            "videoInterview": "Not supported.",
            "liveVideo": "Talent sourcing search engine (PeopleGPT); does not conduct live video interviews.",
            "interviewAnalysis": "Not supported.",
            "facialRecognition": "Not supported.",
            "candidateAssessment": "Filters candidate profiles using natural language across 800M+ web profiles.",
            "aiEvaluation": "Not supported.",
            "proctoring": "Not supported.",
            "codingSandbox": "Not supported.",
        },
        "pricingStatus": "Available",
        "pricingModel": "Subscription",
        "pricingNotes": "Self-serve plans start at $99/seat/month with talent sourcing credits.",
        "bestFor": "Recruiters and founders seeking passive candidate talent discovery",
        "superpower": "Natural language talent search querying 800M+ passive candidate profiles.",
        "recruiterWorkflow": "Search query generation, profile exports, and AI personalized outreach.",
        "candidateExperience": "Passive sourcing discovery; candidates receive outreach emails.",
    },
    "greenhouse": {
        "name": "Greenhouse",
        "slug": "greenhouse",
        "category": "Applicant Tracking System (ATS)",
        "features": {
            "aiInterview": "No",
            "videoInterview": "No",
            "liveVideo": "No",
            "interviewAnalysis": "No",
            "facialRecognition": "No",
            "candidateAssessment": "Limited",
            "aiEvaluation": "No",
            "proctoring": "No",
            "codingSandbox": "No",
        },
        "featureDetails": {
            "aiInterview": "Applicant Tracking System (ATS); relies on integrations for interviewing.",
            "videoInterview": "Integrates with video interviewing partners like Hireko and HireVue.",
            "liveVideo": "Applicant tracking system (ATS); integrates with video platforms but does not host natively.",
            "interviewAnalysis": "Aggregates recruiter scorecards and hiring committee feedback.",
            "facialRecognition": "Not supported.",
            "candidateAssessment": "Assessment marketplace integrations with 400+ third-party testing partners.",
            "aiEvaluation": "Relies on manual scorecards submitted by human interviewers.",
            "proctoring": "Not supported.",
            "codingSandbox": "Not supported.",
        },
        "pricingStatus": "Custom pricing",
        "pricingModel": "Custom / Annual Tiered",
        "pricingNotes": "Custom pricing — customers need to contact the sales team for a quote based on headcount.",
        "bestFor": "Recruiting teams requiring full-lifecycle applicant tracking and pipeline management",
        "superpower": "Full-lifecycle ATS pipeline tracking and 400+ recruiting tool integrations.",
        "recruiterWorkflow": "Structured hiring stages, scorecards, and requisition management.",
        "candidateExperience": "Standard job application portal and email scheduling notifications.",
    },
    "humanly": {
        "name": "Humanly",
        "slug": "humanly",
        "category": "Conversational Screening & Notes",
        "features": {
            "aiInterview": "Limited",
            "videoInterview": "Limited",
            "liveVideo": "Limited",
            "interviewAnalysis": "Yes",
            "facialRecognition": "No",
            "candidateAssessment": "Limited",
            "aiEvaluation": "Limited",
            "proctoring": "No",
            "codingSandbox": "No",
        },
        "featureDetails": {
            "aiInterview": "Conversational pre-screening chatbot and interview note-taking assistant.",
            "videoInterview": "Integrates with video meetings to record and summarize conversations.",
            "liveVideo": "Attends live recruiter calls for note-taking and candidate sentiment analysis.",
            "interviewAnalysis": "Generates post-call recruiter summaries and conversational analytics.",
            "facialRecognition": "Not supported.",
            "candidateAssessment": "Pre-screening questions via chat.",
            "aiEvaluation": "Candidate sentiment and competency notes synthesized for recruiters.",
            "proctoring": "Not supported.",
            "codingSandbox": "Not supported.",
        },
        "pricingStatus": "Custom pricing",
        "pricingModel": "Custom / Annual Tiered",
        "pricingNotes": "Custom pricing — customers need to contact the sales team for a quote.",
        "bestFor": "High-volume teams wanting chat screening and meeting copilot notes",
        "superpower": "Chatbot candidate pre-screening and automated recruiter interview summaries.",
        "recruiterWorkflow": "Chat screening triage and automated interview notes.",
        "candidateExperience": "Chatbot screening dialogue followed by human video interview.",
    },
    "coderbyte": {
        "name": "Coderbyte",
        "slug": "coderbyte",
        "category": "Technical Screening & Challenges",
        "features": {
            "aiInterview": "No",
            "videoInterview": "Limited",
            "liveVideo": "Limited",
            "interviewAnalysis": "Limited",
            "facialRecognition": "No",
            "candidateAssessment": "Yes",
            "aiEvaluation": "Yes",
            "proctoring": "Limited",
            "codingSandbox": "Yes",
        },
        "featureDetails": {
            "aiInterview": "Technical assessment and coding challenge platform; no autonomous voice AI.",
            "videoInterview": "Live collaborative pair programming with built-in video.",
            "liveVideo": "Live pair-programming sessions with built-in video.",
            "interviewAnalysis": "Automated code analysis, test suite checks, and plagiarism detection.",
            "facialRecognition": "Not supported; uses webcam snapshots for basic proctoring.",
            "candidateAssessment": "Extensive coding challenges, algorithmic exercises, and take-home projects.",
            "aiEvaluation": "Automated unit test execution and code scorecards.",
            "proctoring": "Browser tab-switching alerts and webcam snapshots.",
            "codingSandbox": "Multi-language code editor with unit testing capabilities.",
        },
        "pricingStatus": "Available",
        "pricingModel": "Subscription",
        "pricingNotes": "Plans start at $199/month for unlimited technical candidates.",
        "bestFor": "Companies needing cost-effective technical coding assessments and take-home tests",
        "superpower": "Affordable coding assessments with automated unit tests and take-home projects.",
        "recruiterWorkflow": "Automated code grading, solution playback, and scorecards.",
        "candidateExperience": "Interactive browser-based coding challenges and unit test feedback.",
    },
    "interviewer": {
        "name": "Interviewer.AI",
        "slug": "interviewer",
        "category": "AI Video Screening",
        "features": {
            "aiInterview": "Yes",
            "videoInterview": "Yes",
            "liveVideo": "Limited",
            "interviewAnalysis": "Yes",
            "facialRecognition": "Limited",
            "candidateAssessment": "Yes",
            "aiEvaluation": "Yes",
            "proctoring": "Limited",
            "codingSandbox": "No",
        },
        "featureDetails": {
            "aiInterview": "Asynchronous automated video interviews with AI grading.",
            "videoInterview": "One-way video interview recording with custom question sets.",
            "liveVideo": "Primarily asynchronous automated video screening with timed questions.",
            "interviewAnalysis": "Evaluates speech clarity, vocabulary, energy, and resume relevance.",
            "facialRecognition": "Presence and eye-contact tracking; no biometric identity authentication.",
            "candidateAssessment": "Skill assessments and WorkStyle psychological profile evaluations.",
            "aiEvaluation": "Instant multi-factor scoring combining resume, video, and assessment metrics.",
            "proctoring": "Presence and eye contact tracking.",
            "codingSandbox": "Not supported.",
        },
        "pricingStatus": "Available",
        "pricingModel": "Subscription",
        "pricingNotes": "Tiered subscription starting from ~$99–$249/month.",
        "bestFor": "Mid-market hiring teams wanting video screening paired with resume analysis",
        "superpower": "WorkStyle scoring and multi-factor candidate scoring combining video and resume.",
        "recruiterWorkflow": "Ranked candidate lists with composite video and resume scores.",
        "candidateExperience": "Asynchronous recorded video interview with timed responses.",
    },
    "mercor": {
        "name": "Mercor",
        "slug": "mercor",
        "category": "AI Talent Marketplace & Vetting",
        "features": {
            "aiInterview": "Yes",
            "videoInterview": "Yes",
            "liveVideo": "Yes",
            "interviewAnalysis": "Yes",
            "facialRecognition": "No",
            "candidateAssessment": "Yes",
            "aiEvaluation": "Yes",
            "proctoring": "Limited",
            "codingSandbox": "Limited",
        },
        "featureDetails": {
            "aiInterview": "Automated AI video interview vetting for pre-screened talent pools.",
            "videoInterview": "Recorded AI video evaluations probing technical and behavioral experience.",
            "liveVideo": "Conducts live AI video vetting interviews for global talent.",
            "interviewAnalysis": "Deep resume parsing paired with transcript competency evaluation.",
            "facialRecognition": "Not supported.",
            "candidateAssessment": "Domain-specific vetting tests and live interview evaluations.",
            "aiEvaluation": "AI algorithmic candidate rankings and structured recruiter summaries.",
            "proctoring": "Session verification during vetting calls.",
            "codingSandbox": "Domain-specific technical vetting.",
        },
        "pricingStatus": "Custom pricing",
        "pricingModel": "Custom / Take-Rate",
        "pricingNotes": "Custom pricing — customers need to contact the sales team for a quote or talent placement fee.",
        "bestFor": "Companies looking to hire pre-vetted elite global software talent",
        "superpower": "End-to-end AI candidate vetting and curated talent marketplace matching.",
        "recruiterWorkflow": "Browse pre-screened, video-vetted global candidate profiles.",
        "candidateExperience": "AI video vetting interview with portfolio and background probing.",
    },
    "recruit41": {
        "name": "Recruit41",
        "slug": "recruit41",
        "category": "AI Candidate Intake & Screening",
        "features": {
            "aiInterview": "Limited",
            "videoInterview": "Limited",
            "liveVideo": "No",
            "interviewAnalysis": "Limited",
            "facialRecognition": "No",
            "candidateAssessment": "Limited",
            "aiEvaluation": "Limited",
            "proctoring": "No",
            "codingSandbox": "No",
        },
        "featureDetails": {
            "aiInterview": "Lightweight candidate intake forms with automated qualifying screening.",
            "videoInterview": "Basic async video response capture.",
            "liveVideo": "Focuses on async intake forms and short clips; no native live video.",
            "interviewAnalysis": "Basic resume and response keyword matching.",
            "facialRecognition": "Not supported.",
            "candidateAssessment": "Custom pre-screening qualification forms.",
            "aiEvaluation": "Automated pass/fail scoring based on recruiter-defined thresholds.",
            "proctoring": "Not supported.",
            "codingSandbox": "Not supported.",
        },
        "pricingStatus": "Custom pricing",
        "pricingModel": "Custom / Quote-Based",
        "pricingNotes": "Custom pricing — customers need to contact the sales team for a quote.",
        "bestFor": "Boutique recruiting teams seeking streamlined intake workflows",
        "superpower": "Structured candidate intake forms and lightweight automated screening.",
        "recruiterWorkflow": "Intake form review and automated initial triage.",
        "candidateExperience": "Quick web intake questionnaire with optional video clips.",
    },
}


def get_platform_profile(name_or_slug: Optional[str] = None) -> Dict[str, Any]:
    if not name_or_slug:
        return PLATFORM_PROFILES["hireko"]
    clean = re.sub(r"[^a-z0-9]", "", name_or_slug.lower())
    for key, p in PLATFORM_PROFILES.items():
        key_clean = re.sub(r"[^a-z0-9]", "", key.lower())
        name_clean = re.sub(r"[^a-z0-9]", "", p["name"].lower())
        if clean == key_clean or clean == name_clean or clean in key_clean or key_clean in clean:
            return p
    return {
        "name": name_or_slug,
        "slug": clean,
        "category": "Recruitment Software",
        "features": {
            "aiInterview": "Unknown",
            "videoInterview": "Unknown",
            "liveVideo": "Unknown",
            "interviewAnalysis": "Unknown",
            "facialRecognition": "Unknown",
            "candidateAssessment": "Unknown",
            "aiEvaluation": "Unknown",
            "proctoring": "Unknown",
            "codingSandbox": "Unknown",
            "gameBasedAssessment": "Unknown",
        },
        "featureDetails": {
            "aiInterview": "Information not publicly confirmed.",
            "videoInterview": "Information not publicly confirmed.",
            "liveVideo": "Information not publicly confirmed.",
            "interviewAnalysis": "Information not publicly confirmed.",
            "facialRecognition": "Information not publicly confirmed.",
            "candidateAssessment": "Information not publicly confirmed.",
            "aiEvaluation": "Information not publicly confirmed.",
            "proctoring": "Information not publicly confirmed.",
            "codingSandbox": "Information not publicly confirmed.",
            "gameBasedAssessment": "Information not publicly confirmed.",
        },
        "pricingStatus": "Custom pricing",
        "pricingModel": "Custom Quote",
        "pricingNotes": "Custom pricing — customers need to contact the sales team for a quote.",
        "bestFor": f"{name_or_slug} evaluation teams",
        "superpower": f"{name_or_slug} specialized hiring capabilities.",
        "recruiterWorkflow": "Recruiter management interface.",
        "candidateExperience": "Candidate submission portal.",
    }


def generate_follow_up_chips(intent: IntentType, products: Optional[List[str]] = None) -> List[str]:
    safe_products = products if products else ["Hireko"]
    competitor = next((p for p in safe_products if p.lower() != "hireko"), None)

    if intent == "FEATURE_QUESTION":
        return [
            "What are Hireko's best features?",
            "Compare Hireko and HireVue",
            "How much does Hireko cost?",
            "Which platforms have facial recognition?",
        ]
    elif intent == "FEATURE_COMPARISON":
        return [
            "Compare Hireko and Talview",
            "Which platform is cheaper?",
            "Does Hireko support video interviews?",
            "Which platform should I choose?",
        ]
    elif intent == "HIREKO_ROADMAP":
        return [
            "What are Hireko's best features?",
            "Compare Hireko and HireVue",
            "Which platform has the best feature?",
            "How much does Hireko cost?",
        ]
    elif intent == "BEST_FEATURE_BY_USE_CASE":
        return [
            "What should Hireko improve next?",
            "Compare Hireko and HireVue",
            "Which platforms support live video?",
            "How much does Hireko cost?",
        ]
    elif intent == "HIREKO_BEST_FEATURES":
        return [
            "How much does Hireko cost?",
            "Compare Hireko and HireVue",
            "Does Hireko support live video?",
            "Which platform should I choose for recruiters?",
        ]
    elif intent == "PRICING_COMPARISON":
        return [
            "What are Hireko's best features?",
            "Compare Hireko and HireVue",
            "Does Hireko support video interviews?",
            "Which platform should I choose?",
        ]
    elif intent == "PRODUCT_COMPARISON":
        return [
            "Which platform is cheaper?",
            "What are Hireko's best features?",
            "Does Hireko support facial recognition?",
            "Which platform should I choose for my team?",
        ]
    elif intent == "RECOMMENDATION":
        return [
            "How much does Hireko cost?",
            "Compare Hireko and HireVue",
            "What are Hireko's best features?",
            "Does Talview support assessments?",
        ]
    elif intent == "HIREKO_SPECIFIC":
        return [
            "What are Hireko's best features?",
            "How much does Hireko cost?",
            "Compare Hireko vs HireVue",
            "Does Hireko support live video?",
        ]
    elif intent == "COMPETITOR_SPECIFIC":
        return [
            f"Compare Hireko and {competitor}" if competitor else "Compare Hireko and HireVue",
            f"How much does {competitor} cost?" if competitor else "Which platform is cheaper?",
            "What are Hireko's best features?",
            "Which platform should I choose?",
        ]
    elif intent == "UNRELATED_QUESTION":
        return [
            "What is Hireko.ai?",
            "Compare Hireko and HireVue",
            "How much does Hireko cost?",
            "Which platform should I choose?",
        ]
    return [
        "What is Hireko?",
        "Compare Hireko and HireVue",
        "How much does Hireko cost?",
        "What are Hireko's best features?",
    ]


# ============================================================================
# 1. UNIFIED COMPARISON PATH (All Competitor & Feature Comparisons in One Path)
# ============================================================================
def build_unified_comparison_answer(platforms: List[str], query: Optional[str] = None, user_name: Optional[str] = None) -> str:
    clean_query = (query or "").lower()
    unique_list: List[str] = []

    for p in platforms:
        clean = p.strip()
        if clean and not any(u.lower() == clean.lower() for u in unique_list):
            unique_list.append(clean)

    is_best_feature = bool(re.search(r"best\s+feature|who\s+has\s+the\s+best|which\s+platform\s+has\s+(?:the\s+)?best|best\s+platform|better\s+ai\s+interview", clean_query, re.I))
    is_compare_all = bool(re.search(r"compare\s+all|all\s+platforms|every\s+platform", clean_query, re.I))

    if is_compare_all:
        unique_list = [
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
    elif is_best_feature and len(unique_list) < 2:
        unique_list = ["Hireko", "HireVue", "Talview", "CodeSignal", "Spark Hire", "Metaview"]
    elif len(unique_list) == 0:
        unique_list = ["Hireko", "HireVue", "Talview"]
    elif len(unique_list) == 1:
        if unique_list[0].lower() == "hireko":
            unique_list.append("HireVue")
        else:
            unique_list.insert(0, "Hireko")

    profiles = [get_platform_profile(p) for p in unique_list]
    has_hireko = any(p["slug"] == "hireko" for p in profiles)
    if has_hireko:
        profiles.sort(key=lambda p: 0 if p["slug"] == "hireko" else 1)

    table_header = "| Platform | Pricing | AI Interview | Live Video | Interview Analysis | Candidate Assessment | AI Evaluation | Key Focus |"
    table_align = "|:---|:---|:---|:---|:---|:---|:---|:---|"

    row_lines = []
    for p in profiles:
        pricing = "Not confirmed" if p["pricingStatus"] == "Unknown" else p["pricingStatus"]
        if p["slug"] == "hireko":
            pricing = "Available (SaaS)"

        ai_int = "Partial" if p["features"].get("aiInterview") in ("Limited", "Custom") else p["features"].get("aiInterview", "Unknown")
        live_vid = "Partial" if p["features"].get("liveVideo") in ("Limited", "Custom") else p["features"].get("liveVideo", "Unknown")
        analysis = "Partial" if p["features"].get("interviewAnalysis") in ("Limited", "Custom") else p["features"].get("interviewAnalysis", "Unknown")
        assessment = "Partial" if p["features"].get("candidateAssessment") in ("Limited", "Custom") else p["features"].get("candidateAssessment", "Unknown")
        eval_score = "Partial" if p["features"].get("aiEvaluation") in ("Limited", "Custom") else p["features"].get("aiEvaluation", "Unknown")
        focus = p.get("superpower") or p.get("bestFor", "")

        row_lines.append(f"| **{p['name']}** | {pricing} | {ai_int} | {live_vid} | {analysis} | {assessment} | {eval_score} | {focus} |")

    conclusion = ""
    if len(profiles) == 2 and has_hireko:
        competitor = next((p for p in profiles if p["slug"] != "hireko"), profiles[1])
        comp_slug = competitor["slug"]
        if comp_slug == "hirevue":
            conclusion = "**Summary:** **Hireko.ai** provides autonomous conversational AI voice and video interviews with instant ~2-minute autograding and transparent volume SaaS pricing. In contrast, **HireVue** is tailored for Global 2000 enterprise compliance, structured assessments, and complex ATS integrations under custom annual contracts. For fast, engaging candidate screening that reduces recruiter hours, **[hireko.ai](https://hireko.ai)** is the recommended option."
        elif comp_slug == "talview":
            conclusion = "**Summary:** **Hireko.ai** excels in conversational candidate evaluation with ~2-minute autograded scorecards, whereas **Talview** focuses on proctored exam sessions, secure browser lockdown, and university certification tests. Teams looking for fast, conversational recruiting should choose **[hireko.ai](https://hireko.ai)**; choose Talview if strict proctoring surveillance is mandatory."
        elif comp_slug == "codesignal":
            conclusion = "**Summary:** **Hireko.ai** conducts conversational AI interviews evaluating domain reasoning and behavioral fit, while **CodeSignal** is the benchmark for live collaborative IDE coding and standardized engineering tests. Teams frequently use **[hireko.ai](https://hireko.ai)** for top-of-funnel screening and CodeSignal for downstream technical coding rounds."
        elif comp_slug == "sparkhire":
            conclusion = "**Summary:** **Hireko.ai** features an active AI interviewer that dynamically follows up on candidate responses and autogrades within ~2 minutes, whereas **Spark Hire** relies on asynchronous recorded video prompts that recruiters must review manually. **[hireko.ai](https://hireko.ai)** dramatically reduces recruiter review time."
        elif comp_slug == "metaview":
            conclusion = "**Summary:** **Hireko.ai** automates first-round screening by conducting the interview autonomously, while **Metaview** acts as an AI note-taker during human-led Zoom or Teams calls. Choose **[hireko.ai](https://hireko.ai)** to replace manual screening phone calls, and Metaview to capture notes during live hiring manager panels."
        elif comp_slug == "greenhouse":
            conclusion = "**Summary:** **Greenhouse** is an applicant tracking system (ATS) for structured pipeline governance, while **Hireko.ai** is an autonomous AI interviewing engine. Rather than competing, **[hireko.ai](https://hireko.ai)** integrates with Greenhouse to screen candidates automatically and export autograded scorecards."
        else:
            conclusion = f"**Summary:** **Hireko.ai** delivers live conversational AI voice and video interviewing with automated ~2-minute autograding and transparent volume SaaS pricing. **{competitor['name']}** is specialized for {competitor['bestFor'].lower()}. For scalable, interactive first-round screening, **[hireko.ai](https://hireko.ai)** provides the most streamlined experience."
    elif is_best_feature:
        conclusion = "**Summary:** Different platforms lead in specific categories: **CodeSignal** is the benchmark for live technical coding environments, **HireVue** leads in enterprise assessment science, and **Metaview** excels at automated notes for human-led calls. For teams seeking an autonomous, interactive AI interviewer with instant ~2-minute autograding, **[hireko.ai](https://hireko.ai)** is the standout choice."
    elif has_hireko:
        conclusion = "**Summary:** Among these platforms, **Hireko.ai** delivers live bidirectional conversational AI video screening with ~2-minute autograding and transparent SaaS pricing. Competitors like HireVue and Talview focus on compliance-heavy enterprise assessments under custom annual quotes, while Spark Hire and Willo focus on asynchronous recorded video. Choose **[hireko.ai](https://hireko.ai)** to automate candidate screening and eliminate manual phone screens."
    else:
        conclusion = "**Summary:** Each platform serves different stages of recruitment, ranging from automated assessments to live proctoring. Compare pricing models, evaluation automation, and candidate experience to determine the best fit for your hiring workflow."

    table = f"{table_header}\n{table_align}\n" + "\n".join(row_lines)
    return f"{table}\n\n{conclusion}\n\n> 🌐 **Official Website:** [hireko.ai](https://hireko.ai)"


def build_two_platform_comparison_answer(competitor_slug_or_name: str, user_name: Optional[str] = None) -> str:
    return build_unified_comparison_answer(["Hireko", competitor_slug_or_name], user_name=user_name)


def build_competitor_comparison_answer(platforms: List[str], query: Optional[str] = None, user_name: Optional[str] = None) -> str:
    return build_unified_comparison_answer(platforms, query=query, user_name=user_name)


# 2. Pricing Comparison
def build_pricing_questions_answer(platforms: List[str], user_asked_hireko: bool, user_name: Optional[str] = None) -> str:
    cleaned = [p for p in platforms if p.strip()]
    if not cleaned:
        cleaned = ["Hireko", "HireVue", "Talview"] if user_asked_hireko else ["HireVue", "Talview", "Spark Hire"]
    elif len(cleaned) == 1 and not any(p.lower() == "hireko" for p in cleaned) and user_asked_hireko:
        cleaned.insert(0, "Hireko")

    profiles = [get_platform_profile(p) for p in cleaned]
    has_hireko = any(p["slug"] == "hireko" for p in profiles)

    table_header = "| Platform | Pricing Status | Pricing Model | Official Pricing Evidence / Notes |"
    table_align = "|:---|:---|:---|:---|"

    row_lines = []
    for p in profiles:
        notes = p["pricingNotes"]
        if p["pricingStatus"] == "Unknown":
            notes = "Pricing is not publicly verified; contact the vendor."
        elif p["pricingStatus"] == "Custom pricing":
            notes = "Custom pricing — customers need to contact the sales team for a quote."
        row_lines.append(f"| {p['name']} | {p['pricingStatus']} | {p['pricingModel']} | {notes} |")

    trailing_link = "\n\n> 🌐 **Official Website:** [hireko.ai](https://hireko.ai)" if (has_hireko or user_asked_hireko) else ""
    guidance = "**Budget guidance:** Transparent SaaS models eliminate unpredictable enterprise service retainers and allow teams to pay strictly for active screening volume. For platforms requiring custom quotes, enterprise buyers should confirm seat licenses, candidate tier limits, and annual contract commitments prior to signing. Pricing information is subject to change by vendor."
    return f"{table_header}\n{table_align}\n" + "\n".join(row_lines) + f"\n\n{guidance}{trailing_link}"


# 3. Direct Yes/No Feature Question (Pattern C: Direct Plain Text + Strict Evidence)
def build_yes_no_feature_answer(
    target_platform: str,
    feature_key: str,
    feature_label: str,
    query: str,
    user_name: Optional[str] = None,
) -> str:
    is_placeholder = bool(
        re.search(r"\[platform|\bplatform\s*name\b|\bany\s*platform\b|\bthe\s*platform\b", target_platform, re.I)
        or re.search(r"\[platform", query, re.I)
    )

    if is_placeholder:
        return f"**YES** — Most leading recruitment platforms (including Hireko, HireVue, and Spark Hire) support {feature_label.lower()}. Hireko.ai specializes in conversational AI voice and video interviews with dynamic follow-ups, while platforms like Spark Hire and HireVue offer structured recorded video. Which specific platform would you like to verify?\n\n> 🌐 **Official Website:** [hireko.ai](https://hireko.ai)"

    profile = get_platform_profile(target_platform)
    is_hireko = profile["slug"] == "hireko"
    status = profile["features"].get(feature_key, "Unknown")
    detail = profile["featureDetails"].get(feature_key, "")

    if is_hireko:
        if feature_key == "liveVideo":
            ans = "**UNKNOWN / NOT VERIFIED** — Hireko's public positioning emphasizes conversational AI voice and video interviews and recorded interview review, but synchronous 2-way live video room capabilities in the current product build require direct verification. [INFERENCE / VENDOR-CLAIMED]. Caveat: Public marketing positioning and the deployed build may differ."
        elif feature_key == "facialRecognition":
            ans = "**NO** — Hireko.ai does not support facial recognition or biometric emotion analysis. [VERIFIED]. Hireko focuses strictly on verbal competence, standardized rubrics, and answer content to eliminate visual and biometric bias."
        elif status == "Yes":
            ans = f"**YES** — Hireko.ai supports {feature_label.lower()}. [VERIFIED / VENDOR-CLAIMED]. {detail}"
        elif status == "No":
            ans = f"**NO** — Hireko.ai does not support {feature_label.lower()}. [VERIFIED]. {detail}"
        else:
            ans = f"**UNKNOWN / NOT VERIFIED** — I couldn’t verify {feature_label.lower()} support for Hireko from current available evidence. {detail or 'Internal product data should be verified against current build.'}"
        return ans + "\n\n> 🌐 **Official Website:** [hireko.ai](https://hireko.ai)"

    # Competitor logic
    if feature_key == "liveVideo":
        if profile["slug"] in ["hirevue", "talview", "sparkhire", "codesignal"]:
            return f"**YES** — {profile['name']} explicitly supports live video interviews. [VERIFIED via Official Documentation]. {detail}"
        elif profile["slug"] in ["willo", "metaview", "greenhouse"]:
            return f"**NO** — Current authoritative evidence confirms {profile['name']} does not provide synchronous live video rooms. [VERIFIED]. {detail}"
        else:
            return f"**UNKNOWN / NOT VERIFIED** — I couldn't verify synchronous live video support for {profile['name']} from current evidence. [NOT VERIFIED]. {detail} Note: That does not mean the feature is definitely absent, but current documentation is not specific enough."

    if status == "Yes":
        return f"**YES** — {profile['name']} supports {feature_label.lower()}. [VERIFIED]. {detail}"
    elif status == "No":
        return f"**NO** — {profile['name']} does not support {feature_label.lower()} in its core product scope. [VERIFIED]. {detail}"
    elif status in ("Limited", "Custom"):
        return f"**UNKNOWN / NOT VERIFIED** — {profile['name']} provides partial or configuration-dependent support for {feature_label.lower()}. [VENDOR-CLAIMED]. {detail}"
    else:
        return f"**UNKNOWN / NOT VERIFIED** — I couldn’t verify {feature_label.lower()} support for {profile['name']} from available public evidence. [NOT VERIFIED]. {detail or 'We recommend checking directly with their documentation for verification.'}"


# 4. Hireko Best Features (Pattern E: Differentiators as Hypotheses to Test)
def build_hireko_best_features_answer(user_name: Optional[str] = None) -> str:
    return """**Hireko.ai has several potential competitive hypotheses to test, depending on the use case.**

| Capability | Hireko Positioning | Competitor Baseline | Competitive Hypothesis to Test | Evidence Status |
|:---|:---|:---|:---|:---|
| **Conversational Interaction** | Interactive voice/video AI agent with dynamic follow-ups | One-way recorded webcam video prompts to timed questions (HireVue, Spark Hire) | Candidates engage more naturally in adaptive dialogue than one-way countdown screens. | VENDOR-CLAIMED (Verify in product build) |
| **Autograding Speed** | Structured scorecard delivered within ~2 minutes | Manual recruiter video review or asynchronous scoring queues | Rapid turnaround reduces candidate drop-off and recruiter review overhead. | VENDOR-CLAIMED (Benchmark against recruiter review time) |
| **Decision Support** | Opportunity for evidence-backed rubric reports linking answers to criteria | Often opaque overall scores or pure transcripts without job rubric alignment | Recruiters make faster, fairer decisions when AI conclusions link directly to answer excerpts. | RECOMMENDATION / ROADMAP HYPOTHESIS |
| **Pricing & Onboarding** | Self-serve SaaS volume tiers without annual retained minimums | Enterprise contracts requiring $15,000–$35,000+ annual commitments (HireVue, Talview) | Mid-market teams can adopt modern AI screening without enterprise lock-in. | VERIFIED (Pricing models differ substantially) |

**Key takeaway:**  
Rather than claiming universal superiority, Hireko's strongest differentiator is its conversational AI interview format paired with rapid scorecard generation. To solidify this advantage, Hireko should focus on explainable evidence mapping—proving every score with candidate quotes rather than relying on black-box ratings.

> 🌐 **Official Website:** [hireko.ai](https://hireko.ai)"""


# 5. Live Video Capability Map across 14 Platforms
def build_live_video_comparison_answer(user_name: Optional[str] = None) -> str:
    intro = "Here’s the distinction: live video means both people meet at the same time; one-way video means the candidate records answers for later review."

    table = """| Platform | Status (YES / NO / UNKNOWN) | Exact mode | Evidence/source | Caveat |
|:---|:---|:---|:---|:---|
| **HireVue** | YES | Live synchronous and on-demand video interview workflows | Official product page (hirevue.com) | Live features subject to enterprise packaging and configuration. |
| **Talview** | YES | Dedicated live interview room capability with proctoring | Official product documentation | Verify current plan/package details for live interview room access. |
| **Spark Hire** | YES | Live video and one-way video are distinct workflows in its product family | Official help (support.sparkhire.com) | Live video requires specific subscription plan tiers. |
| **CodeSignal** | YES | Live technical interview includes built-in audio/video and collaborative IDE/whiteboard | Official guide (support.codesignal.com) | Live video is built specifically for technical live interview sessions (Interview product). |
| **Paradox** | UNKNOWN | Virtual meetings and ad-hoc video options are described | Official scheduling help (paradox.helpjuice.com) | Video interviews often rely on 3rd-party conferencing integrations or customer-configured workflows. |
| **Humanly** | UNKNOWN | Multi-channel conversational screening (chat, phone, video) | Official product documentation | AI interviews may use chat, phone or video; synchronous live video should be verified. |
| **Hireko.ai** | UNKNOWN | Public positioning includes conversational AI interview and recorded interview review | Current product build & positioning (hireko.ai) | Confirm whether the deployed version supports synchronous 2-way video vs AI/recorded interview workflows. |
| **Modern Hire** | UNKNOWN | Historical virtual interview capabilities | Historical product documentation | Validate current product status and access under modern ownership (acquired by HireVue). |
| **myInterview** | UNKNOWN | Asynchronous recorded video responses & recruiter review | Official product documentation | Primarily on-demand video screening; do not assume synchronous live video without verified package documentation. |
| **Willo** | NO | Asynchronous recorded-response and assessment workflows | Official documentation (willo.video) | Designed strictly for asynchronous candidate screening; does not provide synchronous live video rooms. |
| **Interviewer.AI** | UNKNOWN | Asynchronous on-demand video evaluation | Official product documentation | Known mainly for asynchronous video evaluation; verify current live-video availability before procurement. |
| **Metaview** | NO | AI note-taker and intelligence engine that joins 3rd-party video platforms | Official product page (metaview.ai) | Does not host its own standalone interview video room; attends external conferencing meetings (Zoom, Teams, Meet). |
| **Mercor** | UNKNOWN | AI-mediated vetting and matching workflows | Official product documentation | Capabilities vary across specific talent programs; do not generalize across all workflows. |
| **Greenhouse** | NO | ATS workflow; interview kits, scheduling, and pipeline management | Official help (support.greenhouse.io) | Greenhouse is an ATS; live video relies on partner integrations (Zoom, Teams, HireVue). |"""

    outro = "I marked a platform UNKNOWN where I could not verify synchronous video from current evidence; that does not mean the feature is definitely absent."

    return f"{intro}\n\n{table}\n\n{outro}\n\n> 🌐 **Official Website:** [hireko.ai](https://hireko.ai)"


# 5b. Best Feature Comparison (Unified Comparison Path)
def build_best_feature_by_use_case_answer(user_name: Optional[str] = None) -> str:
    return build_unified_comparison_answer(
        ["Hireko", "HireVue", "Talview", "CodeSignal", "Spark Hire", "Metaview"],
        query="best feature",
        user_name=user_name,
    )


# 5c. Hireko Product Roadmap (Pattern D: Prioritized Roadmap + Success Metrics)
def build_hireko_roadmap_answer(user_name: Optional[str] = None) -> str:
    intro = "### 🚀 Prioritized Product Roadmap for Hireko.ai\n\nBased on competitive benchmarking across 14 hiring platforms, Hireko's greatest opportunity is establishing **decision support** rather than opaque scoring:"

    table = """| Priority | Recommendation | Why it matters | MVP Scope | Dependencies & Risks | Success Metric |
|:---|:---|:---|:---|:---|:---|
| **P0** | **Evidence-backed AI Interview Report** | Recordings or raw scores alone do not explain hiring decisions; evidence links help recruiters validate outputs and spot gaps. | Report template, answer excerpts with timestamps, rubric-aligned editable scorecard, and confidence/coverage note. | Risk: over-interpreting short candidate responses. Dependency: speech-to-text accuracy and rubric alignment. | **Evidence coverage:** ≥ 90% of scored criteria have traceable answer excerpts. |
| **P0** | **Structured Rubric & Candidate Comparison** | Makes comparisons job-related and reviewable; avoids misleading single opaque rankings. | Role criteria editor, evidence-backed side-by-side candidate comparison rows, and editable recruiter ratings. | Risk: rubric rigidity for unconventional talent profiles. | **Consistency:** ≥ 85% agreement between draft AI scores and recruiter review. |
| **P1** | **Clear Live vs Asynchronous Mode Labels** | Synchronous live video, recorded async video, and AI-led interviews solve distinct user needs. Prevents candidate and buyer confusion. | Explicit mode taxonomy in candidate UI, recruiter settings, and knowledge base. | Low risk; clear UI terminology requirement. | **Reliability:** 0% mode confusion in user feedback and support tickets. |
| **P1** | **Candidate Practice & Preparation Flow** | Reduces candidate anxiety, improves completion rates, and cleanly separates preparation from formal assessment. | Dedicated practice interview module, audio/video device check, sample questions, and transparent consent/retention notices. | Dependency: candidate portal UX flow. | **Candidate completion rate:** ≥ 80% with < 15% drop-off. |
| **P1** | **Interview Intelligence & Recruiter Workflow** | Reduces manual recruiter note-taking and feedback delays while keeping humans accountable for final decisions. | Post-interview executive summary, searchable evidence snippets, follow-up probe suggestions, and ATS scorecard draft export. | Dependency: ATS sync APIs (Greenhouse, Lever, etc.). | **Review efficiency:** Time to completed scorecard reduced by ≥ 60%. |
| **P2** | **Candidate Engagement & Scheduling Hand-offs** | Conversational tools show the value of reducing scheduling friction between screening and panel interviews. | Automated candidate status notifications, interview readiness reminders, and calendar booking hand-off links. | Risk: third-party calendar sync delays. | **Candidate drop-off:** Funnel drop-off reduced by ≥ 25%. |
| **P2** | **Trust, Governance & Quality Monitoring** | AI hiring tools require strict fairness, auditability, and compliance with emerging AI hiring regulations (e.g. NYC Local Law 144, EU AI Act). | Audit logs, rubric version history, reviewer override logging, data retention limits, and bias monitoring across job-relevant groups. | Regulatory compliance requirements; strict privacy policies. | **Auditability:** 100% auditable scorecard history with zero sensitive-trait inference. |"""

    metrics = """#### 📊 Core Success Metrics
- **Evidence coverage:** Percentage of scored criteria backed by at least one traceable answer excerpt.
- **Report usefulness:** Recruiter satisfaction rating of generated summaries and evidence quality.
- **Review efficiency:** Time from interview completion to submitted scorecard.
- **Consistency:** Correlation and agreement rate between AI-assisted drafts and final human ratings.
- **Candidate experience:** Candidate completion rate, drop-off rate, and reported interview clarity.
- **Reliability:** Zero unsupported claims or misclassified interview modes."""

    return f"{intro}\n\n{table}\n\n{metrics}\n\n> 🌐 **Official Website:** [hireko.ai](https://hireko.ai)"


# 5d. Feature Comparison Across Platforms (Table + Summary)
def build_feature_comparison_across_platforms_answer(
    feature_key: str,
    feature_label: str,
    user_name: Optional[str] = None,
) -> str:
    if feature_key == "liveVideo":
        return build_live_video_comparison_answer(user_name)

    evaluated_slugs = [
        "hireko",
        "hirevue",
        "talview",
        "modernhire",
        "sparkhire",
        "myinterview",
        "willo",
        "codesignal",
        "paradox",
        "humanly",
        "interviewer",
        "metaview",
        "mercor",
        "greenhouse",
    ]

    profiles = [PLATFORM_PROFILES[s] for s in evaluated_slugs if s in PLATFORM_PROFILES]

    table_header = "| Platform | Supported? (Yes / No / Partial) | Short note |"
    table_align = "|:---|:---|:---|"

    row_lines = []
    for p in profiles:
        raw_status = p["features"].get(feature_key, "Unknown")
        supported_label = "Not confirmed"
        if raw_status == "Yes":
            supported_label = "Yes"
        elif raw_status == "No":
            supported_label = "No"
        elif raw_status in ("Limited", "Custom"):
            supported_label = "Partial"

        note = p["featureDetails"].get(feature_key, "Information not confirmed.")
        row_lines.append(f"| {p['name']} | {supported_label} | {note} |")

    yes_count = sum(1 for p in profiles if p["features"].get(feature_key) == "Yes")
    partial_count = sum(1 for p in profiles if p["features"].get(feature_key) in ("Limited", "Custom"))
    total_count = len(profiles)

    summary = f"**Summary:** {yes_count} out of {total_count} platforms support {feature_label.lower()}"
    if partial_count > 0:
        summary += f" (with {partial_count} offering partial support)"
    summary += ". Hireko.ai provides live conversational AI interviews with real-time dynamic follow-ups, while tools like Spark Hire and HireVue focus primarily on structured recordings."

    return f"{table_header}\n{table_align}\n" + "\n".join(row_lines) + f"\n\n{summary}\n\n> 🌐 **Official Website:** [hireko.ai](https://hireko.ai)"


# 5b. Unclear Question Handler (Rule 5: Best guess + 1 follow-up)
def build_unclear_question_answer(query: str, user_name: Optional[str] = None) -> str:
    q_lower = query.lower()

    if re.search(r"video|live|camera|webcam", q_lower):
        best_guess = "It looks like you're asking about video interviewing options."
        answer = "Hireko.ai provides live interactive conversational voice and video AI interviews with dynamic follow-ups, whereas platforms like HireVue and Spark Hire focus on structured recorded responses."
        follow_up = "Would you like me to compare Hireko and HireVue, or check which platforms support live video?"
    elif re.search(r"pricing|cost|price|subscription|fee", q_lower):
        best_guess = "It looks like you're asking about pricing for recruitment tools."
        answer = "Hireko.ai offers transparent volume-based SaaS pricing with no lock-in, while enterprise platforms like HireVue and Talview require custom annual sales quotes."
        follow_up = "Would you like to see a pricing comparison table across platforms?"
    elif re.search(r"ai|scoring|score|rubric|evaluat|autograd", q_lower):
        best_guess = "It looks like you're asking about AI interview scoring and automation."
        answer = "Hireko.ai autogrades candidate interviews against standardized rubrics within ~2 minutes, whereas tools like Metaview provide AI meeting notes for human-led calls."
        follow_up = "Would you like to compare AI interview features between Hireko and Metaview?"
    elif re.search(r"best|recommend|winner|choose", q_lower):
        best_guess = "It looks like you're looking for the best platform recommendation."
        answer = "Hireko.ai is best for automated first-round conversational screening, HireVue is built for large enterprise compliance, and CodeSignal specializes in technical coding tests."
        follow_up = "What type of roles or hiring volume are you looking to support?"
    else:
        best_guess = "It looks like you're exploring AI hiring and video interview platforms."
        answer = "Hireko.ai offers live bidirectional AI video interviews with automated ~2-minute scoring, helping hiring teams screen candidates without manual phone calls."
        follow_up = "Would you like to compare Hireko against competitors like HireVue or Talview, or see pricing details?"

    return f"{best_guess}\n\n{answer}\n\n{follow_up}\n\n> 🌐 **Official Website:** [hireko.ai](https://hireko.ai)"

    if feature_key == "gameBasedAssessment":
        takeaway = """**Key takeaway:** Game-based assessments are pre-hire assessments delivered as short, mobile-friendly games (<20 min) measuring job-relevant skills like cognitive aptitude and problem-solving via IO psychology, as used by HireVue. Conversational engines like Hireko.ai focus on interactive voice and video interviews with dynamic follow-up probing.

### 💡 Strategic Suggestion for Hireko.ai:
Pairing gamified cognitive screening with Hireko's conversational interviews offers hiring teams an optimal two-stage evaluation funnel:
1. **Top-of-Funnel Cognitive Filter:** Rapid game-based assessments (<20 min) screen high applicant volumes on attention and problem-solving.
2. **Autonomous Conversational Probing (Hireko.ai):** Qualified candidates advance to live bidirectional AI interviews that probe domain depth and communication skills.
3. **Unified Scorecards:** Objective rubric-based scorecards generated in ~2 minutes.

If it helps, are you asking because you’re a hiring team evaluating tools, or a candidate who’s been invited to take a game-based assessment?"""
        return f"{table_header}\n{table_align}\n" + "\n".join(row_lines) + f"\n\n{takeaway}\n\n> 🌐 **Official Website:** [hireko.ai](https://hireko.ai)"

    takeaway = f"**Key takeaway:** Support for {feature_label.lower()} varies significantly across recruitment software categories. Specialized platforms like Talview implement biometric and exam security controls, whereas conversational engines like Hireko.ai prioritize spoken competence and objective rubrics to eliminate facial bias."
    return f"{table_header}\n{table_align}\n" + "\n".join(row_lines) + f"\n\n{takeaway}\n\n> 🌐 **Official Website:** [hireko.ai](https://hireko.ai)"


# Game-Based Assessment Knowledge Base & Strategic Recommendation
def build_game_based_assessment_answer(query: str, user_name: Optional[str] = None) -> str:
    return """### Game-Based Assessments in AI Recruitment

Game-based assessments are pre-hire assessments delivered as short, mobile-friendly games that measure job-relevant skills and traits in a fast, engaging way, instead of relying only on resumes or long tests.

Here’s how HireVue’s game-based assessments typically work:
- **Short game format:** Candidates “play” a series of short games (often a few minutes each). The overall experience is designed to be completed quickly, usually under ~20 minutes depending on the set of games used.
- **Competency measurement:** The games are built to measure work-relevant competencies (for example: cognitive skills, problem-solving, attention, learning agility, and other role-aligned attributes).
- **IO Psychology & Role Alignment:** Recruiters get results mapped to predefined, job-relevant criteria, so you can compare candidates consistently and decide who advances. HireVue supports aligning games to role competencies with guidance from IO psychology expertise.

#### Why teams use them (especially in high-volume roles):
- **Speed at scale:** A single job post can generate hundreds or thousands of applicants, and game-based assessments help narrow the pool earlier without endless resume review.
- **Candidate experience:** They’re designed to be more engaging than traditional testing and can reduce test anxiety for some candidates.
- **More evidence-based screening:** You’re measuring skills and potential, not just past titles.

### 💡 Strategic Suggestion for Hireko.ai:
While Hireko specializes in **live conversational bidirectional voice and video interviews** with dynamic follow-up probing and ~2-minute autograding, combining game-based cognitive/competency assessments with Hireko's conversational AI creates a powerful hiring workflow:
1. **Top-of-Funnel Cognitive Filter (Game-Based):** Screen high-volume applicant pools (under ~20 min) on problem-solving, attention, and cognitive traits.
2. **Autonomous Conversational Probing (Hireko.ai):** Shortlisted candidates advance to Hireko's live interactive voice/video interviews, where adaptive AI probes depth, role expertise, and communication aptitude.
3. **Unified Scorecard:** Combine psychometric/cognitive metrics with Hireko's automated rubric scorecards for faster, data-driven hiring decisions.

If it helps, are you asking because you’re a hiring team evaluating tools, or a candidate who’s been invited to take a game-based assessment?

> 🌐 **Official Website:** [hireko.ai](https://hireko.ai)"""


# 6. Hireko Specific Direct Answer
def build_hireko_specific_direct_answer(query: str, user_name: Optional[str] = None) -> str:
    q_lower = query.lower()
    lead = "**Hireko.ai is an autonomous conversational AI hiring platform designed for live bidirectional voice and video candidate interviewing and automated rubric evaluation.**"
    if "how does" in q_lower or "work" in q_lower:
        lead = "**Hireko.ai operates by conducting autonomous, bidirectional voice and video interviews where an adaptive AI agent asks dynamic follow-up questions in real time.**"
    elif "pricing" in q_lower or "cost" in q_lower:
        lead = "**Hireko.ai offers transparent, flexible SaaS pricing scaled to active hiring volume with zero rigid annual commitments.**"

    explanation = "Candidates engage in natural, human-like voice and video conversations rather than recording awkward one-way clips to countdown timers. The platform autogrades candidate responses against standardized evaluation rubrics, generating comprehensive scorecards and recruiter summaries within approximately two minutes. This eliminates 80%+ of manual recruiter phone screening time while delivering an engaging applicant experience."
    return f"{lead}\n\n{explanation}\n\n> 🌐 **Official Website:** [hireko.ai](https://hireko.ai)"


# 7. Competitor Specific Direct Answer
def build_competitor_specific_direct_answer(competitor_name: str, query: str, user_name: Optional[str] = None) -> str:
    profile = get_platform_profile(competitor_name)
    q_lower = query.lower()

    lead = f"**{profile['name']} is an established platform specializing in {profile['category'].lower()} with a primary focus on {profile['superpower'].lower()}.**"
    if "pricing" in q_lower or "cost" in q_lower:
        lead = f"**{profile['name']} operates with a {profile['pricingModel'].lower()} model ({profile['pricingStatus'].lower()}).**"

    details = f"{profile['name']} is designed to streamline recruitment workflows by providing {profile['recruiterWorkflow'].lower()}. For candidates, the platform offers {profile['candidateExperience'].lower()}, making it best suited for {profile['bestFor'].lower()}."
    return f"{lead}\n\n{details}"


# 8. Recommendation
def build_recommendation_answer(
    platforms: List[str],
    feature_key: Optional[str] = None,
    feature_label: Optional[str] = None,
    user_name: Optional[str] = None,
) -> str:
    cleaned = [p for p in platforms if p.strip()]
    if len(cleaned) < 2:
        if not any(p.lower() == "hireko" for p in cleaned):
            cleaned.insert(0, "Hireko")
        if len(cleaned) < 2:
            cleaned.append("HireVue")

    profiles = [get_platform_profile(p) for p in cleaned]
    has_hireko = any(p["slug"] == "hireko" for p in profiles)

    table_header = f"| Criteria | {' | '.join(p['name'] for p in profiles)} |"
    table_align = f"|:---|{':---|' * len(profiles)}"

    rows = [
        f"| AI Interviews | {' | '.join(p['featureDetails']['aiInterview'] for p in profiles)} |",
        f"| Candidate Experience | {' | '.join(p['candidateExperience'] for p in profiles)} |",
        f"| Recruiter Workflow | {' | '.join(p['recruiterWorkflow'] for p in profiles)} |",
        f"| AI Evaluation | {' | '.join(p['featureDetails']['aiEvaluation'] for p in profiles)} |",
        f"| Pricing | {' | '.join(p['pricingNotes'] for p in profiles)} |",
    ]

    rec_lines = [f"- **Choose {p['name']} if:** Your team requires {p['bestFor'].lower()}." for p in profiles]
    recommendation = "**Recommendation:**  \nBased on the available information, the best platform depends on your primary hiring constraints:\n" + "\n".join(rec_lines) + "\n\nNo single tool wins in every scenario; select the solution that matches your technical requirements and candidate experience priorities."
    trailing_link = "\n\n> 🌐 **Official Website:** [hireko.ai](https://hireko.ai)" if has_hireko else ""

    intro = "To determine the best platform, the primary decision criteria depend on whether your priority is conversational screening engagement, technical code benchmarking, proctoring security, or enterprise legacy compliance."
    return f"{intro}\n\n{table_header}\n{table_align}\n" + "\n".join(rows) + f"\n\n{recommendation}{trailing_link}"


# 9. Unrelated Question
def build_unrelated_question_answer() -> str:
    return """I specialize as the AI Product Advisor for **Hireko.ai** and the AI recruitment, video interviewing, and hiring technology landscape. While I cannot assist with general non-recruitment queries, I would be happy to help you explore:

- **Hireko.ai Capabilities:** Live bidirectional voice and video AI interviews and automated rubric evaluation.
- **Competitor Comparisons:** Side-by-side benchmarks across HireVue, Talview, Spark Hire, Metaview, CodeSignal, or Ribbon AI.
- **Pricing & TCO Analysis:** Comparing flexible SaaS tiers vs. annual enterprise contract commitments.
- **Recruiting Frameworks:** STAR interview rubrics, technical screening workflows, and hiring funnel KPIs.

What aspect of hiring technology would you like to explore?"""


# 10. General ChatGPT QA
def build_general_chatgpt_answer(query: str, user_name: Optional[str] = None) -> str:
    q_lower = query.lower()
    if "game" in q_lower and ("assessment" in q_lower or "test" in q_lower or "gamified" in q_lower or "hirevue" in q_lower or "hireko" in q_lower):
        return build_game_based_assessment_answer(query, user_name)

    if "chunk" in q_lower or "vector store" in q_lower or "knowledge base" in q_lower:
        return """### Knowledge Base & Chunk Size Architecture

The AI Product Advisor RAG knowledge base contains **120 indexed chunks** across 17 evaluated hiring and interview platforms.

#### 📊 Exact Chunk Size Specifications
- **Average Chunk Size:** ~420 characters (~56 words / ~105 tokens)
- **Minimum Chunk Size:** 237 characters (~33 words / ~59 tokens)
- **Maximum Chunk Size:** 764 characters (~107 words / ~191 tokens)
- **Standardized Sections per Platform (7 categories):** Overview & Category, Quick Stats, Feature Matrix, Pricing & Contracts, Strengths & Tradeoffs, Final Verdict, and FAQs.
- **RAG Retrieval Context Window:** Top-5 chunks (~2,100 characters / ~525 tokens) are retrieved dynamically per query for high-accuracy synthesis.

💡 **Knowledge Base Coverage:** Includes comprehensive profiles on Hireko, Metaview, HireVue, Talview, CodeSignal, Spark Hire, Willo, Ribbon AI, Juicebox, and 8 additional platforms."""

    if "star" in q_lower or "behavioral" in q_lower:
        return """### Mastering Behavioral Interviews & The STAR Method

The **STAR method** (Situation, Task, Action, Result) is the gold standard for structuring behavioral interview responses and evaluations. Great answers focus 70% of the time on **Action** and quantifiable **Result**.

#### 📐 The STAR Framework Breakdown
1. **S - Situation (15%):** Set the context. Describe the specific challenge, project, or circumstance.
2. **T - Task (15%):** Clarify your specific responsibility or role in that situation.
3. **A - Action (50%):** Detail the exact technical or strategic decisions YOU made. Use *"I"*, not *"we"*.
4. **R - Result (20%):** Share the measurable outcome (metrics, revenue, latency saved, learnings).

#### 💡 Recruiter Evaluation Rubric (1–5 Scale)
- **1 (Unsatisfactory):** Vague answers, deflects blame to teammates, speaks only in generalities without concrete examples.
- **3 (Competent):** Follows STAR structure, describes a real scenario, but lacks quantifiable outcomes or clear personal contribution.
- **5 (Exceptional):** Crisp context, detailed rationale for key trade-offs, quantifies business impact, and reflects on learnings.

> 🌐 **Official Website:** [hireko.ai](https://hireko.ai)"""

    if "kpi" in q_lower or "metric" in q_lower or "time to hire" in q_lower:
        return """### Essential Talent Acquisition Metrics & Funnel KPIs

Tracking actionable recruiting metrics transforms talent acquisition from a cost center into a strategic growth engine.

| Metric | Calculation Formula | Industry Benchmark | Optimization Strategy |
|:---|:---|:---|:---|
| **Time to Hire** | Days from candidate first contact to accepted offer | **25–40 Days** | Automate top-of-funnel screening with AI voice/video interviews |
| **Candidate Drop-Off** | ((Started Applications - Completed) / Started) * 100 | **< 20%** Healthy | Replace 45-min cumbersome ATS forms with quick 2-way mobile screening |
| **Stage Pass-Through Rate** | Candidates advanced / Total evaluated | **25–35%** | Standardize rubrics so recruiters only pass vetted, qualified applicants |
| **Offer Acceptance Rate** | Accepted Offers / Total Offers Extended | **80–90%+** | Competitive compensation benchmarks and rapid turnaround |

> 🌐 **Official Website:** [hireko.ai](https://hireko.ai)"""

    return """### AI Recruitment Advisory Guide

Modern talent acquisition leverages AI automation for repetitive administrative workflows while focusing human judgment on high-value candidate engagement and final decisions.

#### Core Principles
- **Structured Evaluation:** Use standardized competency rubrics across all candidates to mitigate bias.
- **Conversational Engagement:** Interactive voice and video interviews reduce candidate drop-off compared to static one-way video prompts.
- **Rapid Feedback Loops:** Delays beyond 48 hours cause significant candidate drop-off and lost talent.

What specific aspect of recruitment technology or interview workflow would you like to explore?"""


async def ask_advisor_rag(
    query: str,
    history: List[ChatMessage] = [],
    user_name: Optional[str] = None,
) -> ChatResponse:
    intent_res = classify_intent(query)
    intent_type = intent_res.type
    products = intent_res.productsMentioned
    active_user_name = intent_res.userName or user_name

    # 1. Casual small talk
    if intent_type in ["NAME_INTRO", "CASUAL_GREETING", "CASUAL_THANKS", "CASUAL_CONFIRMATION", "CASUAL_GOODBYE", "UNRECOGNIZED"]:
        casual = generate_casual_response(intent_type, active_user_name)
        return ChatResponse(
            answer=casual,
            intent=intent_type,
            confidence=1.0,
            productsMentioned=[],
            sources=[],
            followUpSuggestions=generate_follow_up_chips(intent_type, products),
            userName=active_user_name,
        )

    # 2. Unrelated questions
    if intent_type == "UNRELATED_QUESTION":
        answer = build_unrelated_question_answer()
        return ChatResponse(
            answer=answer,
            intent=intent_type,
            confidence=1.0,
            productsMentioned=[],
            sources=[],
            followUpSuggestions=generate_follow_up_chips(intent_type),
            userName=active_user_name,
        )

    # 3. Direct Yes/No feature capability question
    if intent_type == "FEATURE_QUESTION" and intent_res.featureKey and intent_res.featureLabel:
        target = intent_res.targetPlatform or (products[0] if products else "Hireko")
        answer = build_yes_no_feature_answer(target, intent_res.featureKey, intent_res.featureLabel, query, active_user_name)
        is_hireko = "hireko" in target.lower()
        if is_hireko:
            card = ProductCardData(
                name="Hireko.ai",
                category="Autonomous AI Interviewing",
                tagline="Live Bidirectional Voice & Video Screening Engine",
                strengths=["Live bidirectional AI interviews", "Dynamic follow-ups", "2 min autograding"],
                bestFor="Recruiters seeking autonomous first-round screening",
                slug="hireko",
                websiteUrl="https://hireko.ai",
                websiteDomain="hireko.ai",
            )
        elif intent_res.featureKey == "gameBasedAssessment":
            card = ProductCardData(
                name="HireVue Game-Based Assessments",
                category="Cognitive Screening & Enterprise Testing",
                tagline="Short mobile games (<20 min) measuring cognitive traits via IO psychology",
                strengths=["Rapid <20 min completion", "IO psychology competency mapping", "High-volume applicant screening", "Reduced candidate test anxiety"],
                bestFor="High-volume recruitment teams screening cognitive traits and learning agility",
                slug="hirevue",
                websiteUrl=None,
                websiteDomain=None,
            )
        else:
            card = None

        return ChatResponse(
            answer=answer,
            intent=intent_type,
            confidence=0.98,
            productsMentioned=[target],
            sources=[SourceCitation(competitor=target, section="Feature Capability", title=f"{target} {intent_res.featureLabel} Verification")],
            productCard=card,
            followUpSuggestions=generate_follow_up_chips(intent_type, [target]),
            userName=active_user_name,
        )

    # 4. Feature comparison across platforms
    if intent_type == "FEATURE_COMPARISON" and intent_res.featureKey and intent_res.featureLabel:
        answer = build_feature_comparison_across_platforms_answer(intent_res.featureKey, intent_res.featureLabel, active_user_name)
        return ChatResponse(
            answer=answer,
            intent=intent_type,
            confidence=0.98,
            productsMentioned=products,
            sources=[SourceCitation(competitor="Multi-Platform Benchmark", section="Feature Matrix", title=f"Cross-Platform {intent_res.featureLabel} Comparison")],
            followUpSuggestions=generate_follow_up_chips(intent_type),
            userName=active_user_name,
        )

    # 4b. Game-based assessment general or advisory inquiry
    if (
        intent_res.featureKey == "gameBasedAssessment"
        or re.search(r"game\s*[- ]?based|gamified\s*assessment|game\s*assessment", query, re.I)
    ):
        answer = build_game_based_assessment_answer(query, active_user_name)
        chips = [
            "Does HireVue have game-based assessments?",
            "Does Hireko have game-based assessments?",
            "Which platforms have game-based assessments?",
            "Compare Hireko and HireVue",
        ]
        card = ProductCardData(
            name="Game-Based Assessments & Hireko Synergy",
            category="Cognitive Screening & Conversational AI",
            tagline="Short mobile games (<20 min) paired with bidirectional voice/video AI interviews",
            strengths=[
                "Screening under ~20 minutes",
                "IO psychology competency mapping",
                "High-volume top-of-funnel triage",
                "Hireko live conversational interview probing",
            ],
            bestFor="Hiring teams evaluating game-based cognitive screening and AI interview workflows",
            slug="game-based-assessments",
            websiteUrl="https://hireko.ai",
            websiteDomain="hireko.ai",
        )
        return ChatResponse(
            answer=answer,
            intent=intent_type,
            confidence=0.98,
            productsMentioned=products,
            sources=[SourceCitation(competitor="HireVue", section="Game-Based Assessments & Cognitive Screening", title="HireVue Game-Based Assessments Architecture & Use Cases")],
            productCard=card,
            followUpSuggestions=chips,
            userName=active_user_name,
        )

    # 5b. Hireko Product Roadmap & Improvement Recommendations (Pattern D)
    if intent_type == "HIREKO_ROADMAP":
        answer = build_hireko_roadmap_answer(active_user_name)
        chips = [
            "What are Hireko's best features?",
            "Compare Hireko and HireVue",
            "Which platform has the best feature?",
            "How much does Hireko cost?",
        ]
        return ChatResponse(
            answer=answer,
            intent=intent_type,
            confidence=0.99,
            productsMentioned=["Hireko"],
            sources=[
                SourceCitation(
                    competitor="Hireko Roadmap",
                    section="Product Improvement",
                    title="Hireko.ai Product Roadmap & Strategic Recommendations",
                )
            ],
            productCard=ProductCardData(
                name="Hireko Product Roadmap",
                category="Product Strategy",
                tagline="Prioritized improvements based on 14-platform competitive review",
                strengths=[
                    "Evidence-backed AI Interview Reports",
                    "Structured rubrics & candidate comparison",
                    "Recruiter decision support",
                ],
                bestFor="Product and engineering teams prioritizing Hireko roadmap",
                slug="hireko-roadmap",
                websiteUrl="https://hireko.ai",
                websiteDomain="hireko.ai",
            ),
            followUpSuggestions=chips,
            userName=active_user_name,
        )

    # 5c. Which platform has the best feature? / Best feature by use case (Pattern A)
    if intent_type == "BEST_FEATURE_BY_USE_CASE":
        answer = build_best_feature_by_use_case_answer(active_user_name)
        chips = [
            "What should Hireko improve next?",
            "Compare Hireko and HireVue",
            "Which platforms support live video?",
            "How much does Hireko cost?",
        ]
        return ChatResponse(
            answer=answer,
            intent=intent_type,
            confidence=0.99,
            productsMentioned=products,
            sources=[
                SourceCitation(
                    competitor="All Evaluated Platforms",
                    section="Feature Benchmarks",
                    title="Best-in-Class Feature Benchmarks by Hiring Use Case",
                )
            ],
            productCard=ProductCardData(
                name="Feature Benchmark Matrix",
                category="Competitive Analysis",
                tagline="8 hiring use-case benchmarks across 14 recruiting platforms",
                strengths=["Enterprise video", "Live technical coding", "Interview intelligence", "ATS workflows"],
                bestFor="Recruiters and hiring leaders selecting best-of-breed tools",
                slug="best-feature-matrix",
                websiteUrl="https://hireko.ai",
                websiteDomain="hireko.ai",
            ),
            followUpSuggestions=chips,
            userName=active_user_name,
        )

    # 5. Hireko best features
    if intent_type == "HIREKO_BEST_FEATURES":
        answer = build_hireko_best_features_answer(active_user_name)
        card = ProductCardData(
            name="Hireko.ai",
            category="Autonomous AI Interviewing",
            tagline="Live Bidirectional Voice & Video Screening Engine",
            strengths=["Live bidirectional AI interviews", "Dynamic follow-ups", "2 min autograding"],
            bestFor="Recruiters seeking autonomous first-round screening",
            slug="hireko",
            websiteUrl="https://hireko.ai",
            websiteDomain="hireko.ai",
        )
        return ChatResponse(
            answer=answer,
            intent=intent_type,
            confidence=0.98,
            productsMentioned=["Hireko"],
            sources=[SourceCitation(competitor="Hireko", section="Competitive Strengths", title="Hireko Core Advantages & Differentiators")],
            productCard=card,
            followUpSuggestions=generate_follow_up_chips(intent_type, ["Hireko"]),
            userName=active_user_name,
        )

    # 6. Pricing comparison
    if intent_type == "PRICING_COMPARISON":
        user_asked_hireko = "hireko" in query.lower()
        answer = build_pricing_questions_answer(products, user_asked_hireko, active_user_name)
        card = ProductCardData(
            name="Hireko Pricing Matrix" if user_asked_hireko else "AI Pricing Matrix",
            category="Pricing & TCO Intelligence",
            tagline="Transparent Volume SaaS vs Legacy Enterprise Minimums",
            strengths=["Pay-as-you-grow screening volume", "Zero lock-in"],
            bestFor="Recruiters looking for maximum ROI",
            slug="pricing-matrix",
            websiteUrl="https://hireko.ai" if user_asked_hireko else None,
            websiteDomain="hireko.ai" if user_asked_hireko else None,
        )
        return ChatResponse(
            answer=answer,
            intent=intent_type,
            confidence=0.98,
            productsMentioned=products,
            sources=[SourceCitation(competitor=",".join(products) if products else "All Platforms", section="Pricing", title="Platform Pricing Benchmark")],
            productCard=card,
            followUpSuggestions=generate_follow_up_chips(intent_type, products),
            userName=active_user_name,
        )

    # 7. Competitor comparison
    if intent_type == "PRODUCT_COMPARISON":
        answer = build_competitor_comparison_answer(products, query=query, user_name=active_user_name)
        has_hireko = "hireko" in query.lower() or any("hireko" in p.lower() for p in products)
        card = ProductCardData(
            name=" vs ".join(products[:3]),
            category="Side-by-Side Comparison Matrix",
            tagline=f"Side-by-side benchmark of {len(products)} platforms",
            strengths=[f"Evaluated: {p}" for p in products],
            bestFor="Talent acquisition leaders evaluating hiring software",
            slug="competitor-comparison",
            websiteUrl="https://hireko.ai" if has_hireko else None,
            websiteDomain="hireko.ai" if has_hireko else None,
        )
        return ChatResponse(
            answer=answer,
            intent=intent_type,
            confidence=0.98,
            productsMentioned=products,
            sources=[SourceCitation(competitor=p, section="Comparison", title=f"{p} Feature Benchmark") for p in products],
            productCard=card,
            followUpSuggestions=generate_follow_up_chips(intent_type, products),
            userName=active_user_name,
        )

    # 8. Recommendation
    if intent_type == "RECOMMENDATION":
        answer = build_recommendation_answer(products, intent_res.featureKey, intent_res.featureLabel, active_user_name)
        has_hireko = "hireko" in query.lower() or any("hireko" in p.lower() for p in products)
        return ChatResponse(
            answer=answer,
            intent=intent_type,
            confidence=0.95,
            productsMentioned=products,
            sources=[SourceCitation(competitor="Platform Selection Guide", section="Decision Criteria", title="Hiring Platform Selection Framework")],
            productCard=ProductCardData(
                name="Platform Recommendation Guide",
                category="Software Selection",
                tagline="Tailored recommendation based on hiring constraints",
                strengths=["Decision criteria matrix", "Use-case mapping"],
                bestFor="Hiring managers deciding on recruitment software",
                slug="recommendation-guide",
                websiteUrl="https://hireko.ai" if has_hireko else None,
                websiteDomain="hireko.ai" if has_hireko else None,
            ),
            followUpSuggestions=generate_follow_up_chips(intent_type, products),
            userName=active_user_name,
        )

    # 9. Pure Hireko inquiry
    if intent_type == "HIREKO_SPECIFIC":
        answer = build_hireko_specific_direct_answer(query, active_user_name)
        return ChatResponse(
            answer=answer,
            intent=intent_type,
            confidence=0.95,
            productsMentioned=["Hireko"],
            sources=[SourceCitation(competitor="Hireko", section="Platform Overview", title="Hireko Autonomous AI Interviewing Architecture")],
            productCard=ProductCardData(
                name="Hireko.ai",
                category="Autonomous AI Interviewing",
                tagline="Live Bidirectional Voice & Video Screening Engine",
                strengths=["Interactive conversational AI interviews", "Dynamic follow-ups", "2 min autograding"],
                bestFor="Recruiters seeking autonomous first-round screening",
                slug="hireko",
                websiteUrl="https://hireko.ai",
                websiteDomain="hireko.ai",
            ),
            followUpSuggestions=generate_follow_up_chips(intent_type, ["Hireko"]),
            userName=active_user_name,
        )

    # 10. Competitor-specific question
    if intent_type == "COMPETITOR_SPECIFIC":
        target = intent_res.targetPlatform or (products[0] if products else "HireVue")
        answer = build_competitor_specific_direct_answer(target, query, active_user_name)
        profile = get_platform_profile(target)
        return ChatResponse(
            answer=answer,
            intent=intent_type,
            confidence=0.95,
            productsMentioned=[target],
            sources=[SourceCitation(competitor=target, section="Platform Profile", title=f"{target} Overview & Capabilities")],
            productCard=ProductCardData(
                name=profile["name"],
                category=profile["category"],
                tagline=profile["superpower"],
                strengths=[profile["bestFor"]],
                bestFor=profile["bestFor"],
                slug=profile["slug"],
                websiteUrl=None,
                websiteDomain=None,
            ),
            followUpSuggestions=generate_follow_up_chips(intent_type, [target]),
            userName=active_user_name,
        )

    # 11. General QA
    answer = build_general_chatgpt_answer(query, active_user_name)
    user_asked_hireko = "hireko" in query.lower()
    return ChatResponse(
        answer=answer,
        intent=intent_type,
        confidence=0.9,
        productsMentioned=products,
        sources=[SourceCitation(competitor="Hireko" if user_asked_hireko else "Interview Advisory", section="Knowledge", title="AI Recruitment Advisory")],
        productCard=ProductCardData(
            name="Hireko.ai",
            category="Autonomous AI Interviewing",
            tagline="Live Bidirectional Voice & Video Screening Engine",
            strengths=["Live bidirectional AI interviews", "Dynamic follow-ups"],
            bestFor="Recruiting teams",
            slug="hireko",
            websiteUrl="https://hireko.ai",
            websiteDomain="hireko.ai",
        ) if user_asked_hireko else None,
        followUpSuggestions=generate_follow_up_chips("GENERAL_QA"),
        userName=active_user_name,
    )
