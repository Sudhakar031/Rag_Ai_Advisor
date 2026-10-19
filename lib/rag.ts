import {
  classifyIntent,
  generateCasualResponse,
  extractUserName,
  type IntentType,
  type IntentResult,
} from "./intent";
import {
  type ConversationContext,
  createInitialContext,
  updateContextWithQuery,
  recordAnswerInContext,
  resolveContextForQuery,
} from "./contextManager";
import { comparisons } from "@/data/comparisons";
import type { ComparisonOverview } from "@/types/comparison";
import {
  COMPETITORS_DIRECTORY,
  TOTAL_COMPETITORS_COUNT,
  getCompetitorsByCategoryGroup,
  getCompetitorEntry,
  getPlatformTopBanner,
} from "@/data/competitorDirectory";
import vectorStoreData from "@/data/vectorStore.json";

const vectorStoreJson: any[] = Array.isArray(vectorStoreData) ? vectorStoreData : [];

export interface VectorChunk {
  id: string;
  slug: string;
  competitor: string;
  section: string;
  title: string;
  content: string;
  keywords: string[];
}

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface SourceCitation {
  competitor: string;
  section: string;
  title: string;
}

export interface ProductCardData {
  name: string;
  category: string;
  tagline: string;
  strengths: string[];
  bestFor: string;
  slug: string;
  websiteUrl?: string;
  websiteDomain?: string;
}

export interface AdvisorResponse {
  answer: string;
  intent: IntentType;
  sources: SourceCitation[];
  productCard?: ProductCardData;
  suggestedFollowUps: string[];
  followUpSuggestions?: string[];
  context: ConversationContext;
}

export interface PlatformProfile {
  name: string;
  slug: string;
  category: string;
  features: {
    aiInterview: "Yes" | "No" | "Limited" | "Custom" | "Unknown";
    videoInterview: "Yes" | "No" | "Limited" | "Custom" | "Unknown";
    liveVideo: "Yes" | "No" | "Limited" | "Custom" | "Unknown";
    interviewAnalysis: "Yes" | "No" | "Limited" | "Custom" | "Unknown";
    facialRecognition: "Yes" | "No" | "Limited" | "Custom" | "Unknown";
    candidateAssessment: "Yes" | "No" | "Limited" | "Custom" | "Unknown";
    aiEvaluation: "Yes" | "No" | "Limited" | "Custom" | "Unknown";
    proctoring: "Yes" | "No" | "Limited" | "Custom" | "Unknown";
    codingSandbox: "Yes" | "No" | "Limited" | "Custom" | "Unknown";
    gameBasedAssessment?: "Yes" | "No" | "Limited" | "Custom" | "Unknown";
  };
  featureDetails: {
    aiInterview: string;
    videoInterview: string;
    liveVideo: string;
    interviewAnalysis: string;
    facialRecognition: string;
    candidateAssessment: string;
    aiEvaluation: string;
    proctoring: string;
    codingSandbox: string;
    gameBasedAssessment?: string;
  };
  pricingStatus: "Available" | "Custom pricing" | "Unknown";
  pricingModel: string;
  pricingNotes: string;
  bestFor: string;
  superpower: string;
  recruiterWorkflow: string;
  candidateExperience: string;
  websiteUrl?: string;
}

export const PLATFORM_PROFILES: Record<string, PlatformProfile> = {
  hireko: {
    name: "Hireko.ai",
    slug: "hireko",
    category: "Autonomous AI Interviewing",
    features: {
      aiInterview: "Yes",
      videoInterview: "Yes",
      liveVideo: "Yes",
      interviewAnalysis: "Yes",
      facialRecognition: "No",
      candidateAssessment: "Yes",
      aiEvaluation: "Yes",
      proctoring: "Limited",
      codingSandbox: "No",
      gameBasedAssessment: "No",
    },
    featureDetails: {
      aiInterview: "Live bidirectional voice and video dialogues with adaptive dynamic follow-ups.",
      videoInterview: "Interactive 2-way webcam and voice candidate interviews.",
      liveVideo: "Live bidirectional 2-way webcam and voice candidate interviews with dynamic adaptive AI follow-ups.",
      interviewAnalysis: "Automated real-time speech transcription, rubric mapping, and competency scoring.",
      facialRecognition: "Not supported; focuses on verbal competence and rubrics, avoiding facial biometric bias.",
      candidateAssessment: "Standardized evaluation rubrics and role-specific competency benchmarks.",
      aiEvaluation: "Instant autograding scorecards delivered within ~2 minutes of interview completion.",
      proctoring: "Session verification and conversational depth probing.",
      codingSandbox: "Focuses on conversational architecture and conceptual technical probing.",
      gameBasedAssessment: "Focuses on live conversational voice and video AI interviews with dynamic follow-up probing, rather than gamified psychometrics.",
    },
    pricingStatus: "Available",
    pricingModel: "Subscription / Volume SaaS",
    pricingNotes: "Flexible volume-based SaaS tiers; zero mandatory setup retainers and no lock-in.",
    bestFor: "Recruiters automating first-round conversational screening with high candidate engagement",
    superpower: "Live bidirectional voice & video AI interview with dynamic adaptive follow-ups and ~2 min autograding.",
    recruiterWorkflow: "Instant autograding scorecards and candidate competency summaries in ~2 min.",
    candidateExperience: "Interactive, natural conversational dialogue without awkward countdown timers.",
    websiteUrl: "https://hireko.ai",
  },
  hirevue: {
    name: "HireVue",
    slug: "hirevue",
    category: "Enterprise Video Assessments",
    features: {
      aiInterview: "Yes",
      videoInterview: "Yes",
      liveVideo: "Yes",
      interviewAnalysis: "Yes",
      facialRecognition: "No",
      candidateAssessment: "Yes",
      aiEvaluation: "Yes",
      proctoring: "Limited",
      codingSandbox: "Limited",
      gameBasedAssessment: "Yes",
    },
    featureDetails: {
      aiInterview: "Asynchronous one-way video assessments with structured automated prompts.",
      videoInterview: "Pre-recorded candidate webcam responses to timed prompts.",
      liveVideo: "Live video interviews and structured on-demand recorded video assessments.",
      interviewAnalysis: "Natural language processing and speech-to-text analysis.",
      facialRecognition: "Phased out in 2021 to prevent algorithmic bias and comply with AI auditing laws.",
      candidateAssessment: "Game-based cognitive tests and structured pre-hire competency batteries.",
      aiEvaluation: "Automated Interview Scoring (AIS) based on speech and transcript models.",
      proctoring: "Browser focus tracking and webcam snapshot verification.",
      codingSandbox: "Basic technical coding screening challenges (CodeVue).",
      gameBasedAssessment: "Short, mobile-friendly games (<20 min) measuring cognitive skills, attention, and learning agility via IO psychology.",
    },
    pricingStatus: "Custom pricing",
    pricingModel: "Custom / Annual Enterprise",
    pricingNotes: "Custom pricing — customers need to contact the sales team for a quote (~$15,000–$35,000+/year).",
    bestFor: "Global 2000 enterprises requiring legacy ATS integrations and enterprise compliance",
    superpower: "Enterprise compliance, structured video assessments, and deep ATS integrations.",
    recruiterWorkflow: "Recruiter review portal, ATS synchronization, and hiring committee dashboards.",
    candidateExperience: "One-way webcam recordings to timed questions on a countdown screen.",
  },
  talview: {
    name: "Talview",
    slug: "talview",
    category: "Proctored Assessments & Video",
    features: {
      aiInterview: "Yes",
      videoInterview: "Yes",
      liveVideo: "Yes",
      interviewAnalysis: "Yes",
      facialRecognition: "Yes",
      candidateAssessment: "Yes",
      aiEvaluation: "Yes",
      proctoring: "Yes",
      codingSandbox: "Yes",
    },
    featureDetails: {
      aiInterview: "Automated video interviews integrated with assessment workflows.",
      videoInterview: "One-way asynchronous and live proctored video sessions.",
      liveVideo: "Live video interviews with remote proctoring and identity verification.",
      interviewAnalysis: "NLP-based response scoring and candidate integrity behavioral metrics.",
      facialRecognition: "Supported for identity verification and multi-face cheating detection during exams.",
      candidateAssessment: "Broad test library across cognitive, behavioral, coding, and typing skills.",
      aiEvaluation: "AI proctoring score and automated candidate capability ratings.",
      proctoring: "Comprehensive exam proctoring with secure browser lock and secondary camera monitoring.",
      codingSandbox: "Multi-language online coding environment for technical exams.",
    },
    pricingStatus: "Custom pricing",
    pricingModel: "Custom / Annual Contract",
    pricingNotes: "Custom pricing — customers need to contact the sales team for a quote (~$15,000–$25,000/year).",
    bestFor: "Universities, licensing boards, and organizations conducting high-stakes proctored testing",
    superpower: "Exam-grade remote proctoring, facial identity authentication, and secure browser lock.",
    recruiterWorkflow: "Proctoring flags review, cheating audit logs, and test score reports.",
    candidateExperience: "Secured, monitored examination flow with webcam and browser restrictions.",
  },
  sparkhire: {
    name: "Spark Hire",
    slug: "sparkhire",
    category: "Video Interview Platform",
    features: {
      aiInterview: "No",
      videoInterview: "Yes",
      liveVideo: "Yes",
      interviewAnalysis: "No",
      facialRecognition: "No",
      candidateAssessment: "Limited",
      aiEvaluation: "No",
      proctoring: "No",
      codingSandbox: "No",
    },
    featureDetails: {
      aiInterview: "Does not provide conversational AI; focuses on recorded video clips.",
      videoInterview: "Asynchronous one-way video recordings and live interview scheduling.",
      liveVideo: "Offers live video interviews alongside its core one-way recorded video screening.",
      interviewAnalysis: "No automated NLP analysis or transcript evaluation.",
      facialRecognition: "Not supported.",
      candidateAssessment: "Custom recruiter text questions without automated skill scoring.",
      aiEvaluation: "Recruiters must manually watch and rate recorded video responses.",
      proctoring: "Not supported.",
      codingSandbox: "Not supported.",
    },
    pricingStatus: "Available",
    pricingModel: "Subscription",
    pricingNotes: "Transparent self-serve tiers starting from $149/mo (Recruit Pro) to $299/mo (Growth).",
    bestFor: "Small to mid-sized businesses wanting straightforward manual video reviews",
    superpower: "Simple, budget-friendly one-way recorded video interviewing.",
    recruiterWorkflow: "Manual video playback, team sharing, and star ratings.",
    candidateExperience: "One-way webcam recordings with retake options.",
  },
  metaview: {
    name: "Metaview",
    slug: "metaview",
    category: "AI Interview Copilot",
    features: {
      aiInterview: "No",
      videoInterview: "Limited",
      liveVideo: "Yes",
      interviewAnalysis: "Yes",
      facialRecognition: "No",
      candidateAssessment: "Limited",
      aiEvaluation: "Limited",
      proctoring: "No",
      codingSandbox: "No",
    },
    featureDetails: {
      aiInterview: "Does not automate the interview itself; acts as a silent AI note-taker during human-led calls.",
      videoInterview: "Attends Google Meet, Zoom, and MS Teams calls as an AI bot.",
      liveVideo: "Attends live video interviews on Zoom, Teams, and Google Meet as an AI note-taker.",
      interviewAnalysis: "Generates structured interview notes, ATS summaries, and key conversation takeaways.",
      facialRecognition: "Not supported; processes audio and speech transcripts only.",
      candidateAssessment: "Extracts candidate competency signals from the human interviewer's dialogue.",
      aiEvaluation: "Synthesizes structured notes; final hiring decisions remain with the interviewer.",
      proctoring: "Not supported.",
      codingSandbox: "Not supported.",
    },
    pricingStatus: "Available",
    pricingModel: "Subscription",
    pricingNotes: "Free tier available; Pro plan starts at $20–$40/seat/month.",
    bestFor: "Recruiters and hiring managers wanting automated notes from human-led calls",
    superpower: "Automated AI interview note-taking and ATS scorecard summaries.",
    recruiterWorkflow: "Automatic sync to ATS notes, saving 15-20 min of manual write-ups per interview.",
    candidateExperience: "Standard human interview with a silent AI note-taker bot present.",
  },
  codesignal: {
    name: "CodeSignal",
    slug: "codesignal",
    category: "Technical Assessment Platform",
    features: {
      aiInterview: "Limited",
      videoInterview: "No",
      liveVideo: "Limited",
      interviewAnalysis: "Limited",
      facialRecognition: "No",
      candidateAssessment: "Yes",
      aiEvaluation: "Yes",
      proctoring: "Yes",
      codingSandbox: "Yes",
    },
    featureDetails: {
      aiInterview: "Cosmo conversational AI assistant available inside live coding environments.",
      videoInterview: "Focuses on technical coding sandboxes rather than video screening.",
      liveVideo: "Live collaborative pair-programming IDE with integrated video and audio chat.",
      interviewAnalysis: "Analyzes code quality, test case coverage, execution time, and algorithmic complexity.",
      facialRecognition: "Not supported; uses periodic webcam snapshots for proctored test integrity.",
      candidateAssessment: "Standardized Coding Score (300–850) and pre-certified technical skill evaluations.",
      aiEvaluation: "Automated unit test execution and algorithmic scoring against standardized benchmarks.",
      proctoring: "Certified proctoring rules with environment checks for standardized scores.",
      codingSandbox: "Full-featured multi-language IDE with 40+ supported languages and frameworks.",
    },
    pricingStatus: "Available",
    pricingModel: "Subscription",
    pricingNotes: "Self-serve plans start at $79/mo (Build) and $479/mo (Grow); Enterprise is custom.",
    bestFor: "Engineering teams needing standardized technical coding benchmarks and IDE pair programming",
    superpower: "Standardized Coding Score (300–850) and real-time cloud IDE coding environments.",
    recruiterWorkflow: "Standardized test score ranking, plagiarism reports, and automated code playback.",
    candidateExperience: "Hands-on browser-based coding challenges and algorithmic tests.",
  },
  ribbon: {
    name: "Ribbon AI",
    slug: "ribbon",
    category: "Voice Screening & Outreach",
    features: {
      aiInterview: "Yes",
      videoInterview: "Limited",
      liveVideo: "Limited",
      interviewAnalysis: "Yes",
      facialRecognition: "No",
      candidateAssessment: "Yes",
      aiEvaluation: "Yes",
      proctoring: "No",
      codingSandbox: "No",
    },
    featureDetails: {
      aiInterview: "Autonomous voice screening agents conducting phone calls with dynamic follow-ups.",
      videoInterview: "Specializes in telephone voice calls and WhatsApp messaging rather than video.",
      liveVideo: "Specializes in live AI phone calls and WhatsApp audio rather than native live video.",
      interviewAnalysis: "Automated call audio transcription and candidate qualification analysis.",
      facialRecognition: "Not supported; telephony and voice based.",
      candidateAssessment: "Automated screening against job requirements and recruiter rubrics.",
      aiEvaluation: "Instant candidate summary scorecards and qualification status.",
      proctoring: "Not supported.",
      codingSandbox: "Not supported.",
    },
    pricingStatus: "Available",
    pricingModel: "Subscription",
    pricingNotes: "Plans start at $499/month with included candidate screening allowances.",
    bestFor: "High-volume recruitment teams needing WhatsApp outreach and automated phone screening",
    superpower: "Multi-channel WhatsApp outreach combined with autonomous AI phone voice screening.",
    recruiterWorkflow: "Automated phone outreach, call recordings, and qualified candidate notifications.",
    candidateExperience: "Inbound or outbound telephone voice conversations and WhatsApp chats.",
  },
  willo: {
    name: "Willo",
    slug: "willo",
    category: "Async Video Screening",
    features: {
      aiInterview: "No",
      videoInterview: "Yes",
      liveVideo: "No",
      interviewAnalysis: "Limited",
      facialRecognition: "No",
      candidateAssessment: "Limited",
      aiEvaluation: "No",
      proctoring: "No",
      codingSandbox: "No",
    },
    featureDetails: {
      aiInterview: "Asynchronous one-way video/audio screening; no bidirectional AI dialogue.",
      videoInterview: "Browser-based video and audio recording without requiring candidate app downloads.",
      liveVideo: "Specializes in asynchronous one-way recorded video responses, not real-time live video.",
      interviewAnalysis: "Basic automated transcription and answer length metrics.",
      facialRecognition: "Not supported.",
      candidateAssessment: "Custom screening questions and ID verification checks.",
      aiEvaluation: "Requires manual recruiter review and grading.",
      proctoring: "Not supported.",
      codingSandbox: "Not supported.",
    },
    pricingStatus: "Available",
    pricingModel: "Subscription",
    pricingNotes: "Lite tier starts at $59/live role; Growth plans start from $250/month.",
    bestFor: "Startups and scaleups needing quick app-free video responses",
    superpower: "App-free browser-based async video, audio, and text screening on any device.",
    recruiterWorkflow: "Async video response review queue and candidate shortlisting.",
    candidateExperience: "Asynchronous video recording directly inside mobile or desktop browsers.",
  },
  myinterview: {
    name: "myInterview",
    slug: "myinterview",
    category: "Asynchronous Video Interviewing",
    features: {
      aiInterview: "Limited",
      videoInterview: "Yes",
      liveVideo: "Unknown",
      interviewAnalysis: "Yes",
      facialRecognition: "No",
      candidateAssessment: "Yes",
      aiEvaluation: "Limited",
      proctoring: "No",
      codingSandbox: "No",
      gameBasedAssessment: "No",
    },
    featureDetails: {
      aiInterview: "On-demand video screening with automated prompt sequencing and candidate responses.",
      videoInterview: "Asynchronous video screening where candidates record webcam responses to structured questions.",
      liveVideo: "Primarily asynchronous on-demand video screening; synchronous live video is not confirmed in current packages.",
      interviewAnalysis: "Automated transcription and AI-assisted candidate response filtering.",
      facialRecognition: "Not supported; avoids biometric facial analysis.",
      candidateAssessment: "Custom video and text pre-screening question sets.",
      aiEvaluation: "AI-assisted screening recommendations based on response keywords and recruiter criteria.",
      proctoring: "Not supported.",
      codingSandbox: "Not supported.",
      gameBasedAssessment: "Not supported.",
    },
    pricingStatus: "Available",
    pricingModel: "Subscription / Managed via Spark Hire",
    pricingNotes: "Pricing managed under Spark Hire suite; contact vendor for volume packaging.",
    bestFor: "Recruiters looking for candidate-friendly asynchronous video screening at scale",
    superpower: "Candidate-friendly asynchronous video responses and quick recruiter review.",
    recruiterWorkflow: "Video playback dashboard, team collaboration, and shortlisting.",
    candidateExperience: "Mobile-friendly one-way recorded video responses to timed questions.",
  },
  paradox: {
    name: "Paradox (Olivia)",
    slug: "paradox",
    category: "Conversational Recruiting Assistant",
    features: {
      aiInterview: "Limited",
      videoInterview: "No",
      liveVideo: "No",
      interviewAnalysis: "Limited",
      facialRecognition: "No",
      candidateAssessment: "Limited",
      aiEvaluation: "Limited",
      proctoring: "No",
      codingSandbox: "No",
    },
    featureDetails: {
      aiInterview: "Conversational mobile SMS/WhatsApp chatbot for high-volume screening and scheduling.",
      videoInterview: "Focuses on mobile messaging and interview scheduling rather than video interviewing.",
      liveVideo: "Focuses on conversational mobile SMS/chat scheduling; integrates with 3rd-party video.",
      interviewAnalysis: "Parses text responses to basic pre-qualification criteria.",
      facialRecognition: "Not supported.",
      candidateAssessment: "Automated qualifying questionnaire for hourly and retail hiring.",
      aiEvaluation: "Pass/fail rule-based routing to hiring managers.",
      proctoring: "Not supported.",
      codingSandbox: "Not supported.",
    },
    pricingStatus: "Custom pricing",
    pricingModel: "Custom / Annual Enterprise",
    pricingNotes: "Custom pricing — customers need to contact the sales team for a quote.",
    bestFor: "High-volume retail, hospitality, and healthcare employers hiring hourly workers",
    superpower: "Conversational mobile SMS text scheduling and instant interview booking.",
    recruiterWorkflow: "Automated candidate capture, screening questions, and calendar sync.",
    candidateExperience: "Frictionless SMS text messaging dialogue on mobile devices.",
  },
  modernhire: {
    name: "Modern Hire",
    slug: "modernhire",
    category: "Enterprise Assessment & Hiring",
    features: {
      aiInterview: "Yes",
      videoInterview: "Yes",
      liveVideo: "Yes",
      interviewAnalysis: "Yes",
      facialRecognition: "No",
      candidateAssessment: "Yes",
      aiEvaluation: "Yes",
      proctoring: "Limited",
      codingSandbox: "No",
      gameBasedAssessment: "Yes",
    },
    featureDetails: {
      aiInterview: "Structured on-demand digital interviews with Automated Interview Scoring (AIS).",
      videoInterview: "Asynchronous video and text interview workflows.",
      liveVideo: "Supports live and on-demand video interviewing with automated scoring.",
      interviewAnalysis: "Psychometrically validated language scoring and job simulation analytics.",
      facialRecognition: "Phased out in alignment with enterprise compliance standards.",
      candidateAssessment: "Virtual job tryouts, cognitive simulations, and pre-hire assessments.",
      aiEvaluation: "Automated Interview Scoring (AIS) mapped to validated hiring competencies.",
      proctoring: "Identity and session consistency checks.",
      codingSandbox: "Not supported.",
      gameBasedAssessment: "Psychometrically validated assessments and virtual job simulations (part of HireVue).",
    },
    pricingStatus: "Custom pricing",
    pricingModel: "Custom / Annual Contract",
    pricingNotes: "Custom pricing — customers need to contact the sales team for a quote (part of HireVue).",
    bestFor: "Enterprises requiring scientifically validated psychometric assessments",
    superpower: "Automated Interview Scoring (AIS) and psychometrically validated job simulations.",
    recruiterWorkflow: "Competency matching scorecards and enterprise compliance tracking.",
    candidateExperience: "Structured digital interview flows with interactive simulations.",
  },
  juicebox: {
    name: "Juicebox (PeopleGPT)",
    slug: "juicebox",
    category: "AI Talent Sourcing",
    features: {
      aiInterview: "No",
      videoInterview: "No",
      liveVideo: "No",
      interviewAnalysis: "No",
      facialRecognition: "No",
      candidateAssessment: "No",
      aiEvaluation: "No",
      proctoring: "No",
      codingSandbox: "No",
    },
    featureDetails: {
      aiInterview: "Dedicated talent sourcing engine; does not conduct interviews.",
      videoInterview: "Not supported.",
      liveVideo: "Talent sourcing search engine (PeopleGPT); does not conduct live video interviews.",
      interviewAnalysis: "Not supported.",
      facialRecognition: "Not supported.",
      candidateAssessment: "Filters candidate profiles using natural language across 800M+ web profiles.",
      aiEvaluation: "Not supported.",
      proctoring: "Not supported.",
      codingSandbox: "Not supported.",
    },
    pricingStatus: "Available",
    pricingModel: "Subscription",
    pricingNotes: "Self-serve plans start at $99/seat/month with talent sourcing credits.",
    bestFor: "Recruiters and founders seeking passive candidate talent discovery",
    superpower: "Natural language talent search querying 800M+ passive candidate profiles.",
    recruiterWorkflow: "Search query generation, profile exports, and AI personalized outreach.",
    candidateExperience: "Passive sourcing discovery; candidates receive outreach emails.",
  },
  greenhouse: {
    name: "Greenhouse",
    slug: "greenhouse",
    category: "Applicant Tracking System (ATS)",
    features: {
      aiInterview: "No",
      videoInterview: "No",
      liveVideo: "No",
      interviewAnalysis: "No",
      facialRecognition: "No",
      candidateAssessment: "Limited",
      aiEvaluation: "No",
      proctoring: "No",
      codingSandbox: "No",
    },
    featureDetails: {
      aiInterview: "Applicant Tracking System (ATS); relies on integrations for interviewing.",
      videoInterview: "Integrates with video interviewing partners like Hireko and HireVue.",
      liveVideo: "Applicant tracking system (ATS); integrates with video platforms but does not host natively.",
      interviewAnalysis: "Aggregates recruiter scorecards and hiring committee feedback.",
      facialRecognition: "Not supported.",
      candidateAssessment: "Assessment marketplace integrations with 400+ third-party testing partners.",
      aiEvaluation: "Relies on manual scorecards submitted by human interviewers.",
      proctoring: "Not supported.",
      codingSandbox: "Not supported.",
    },
    pricingStatus: "Custom pricing",
    pricingModel: "Custom / Annual Tiered",
    pricingNotes: "Custom pricing — customers need to contact the sales team for a quote based on headcount.",
    bestFor: "Recruiting teams requiring full-lifecycle applicant tracking and pipeline management",
    superpower: "Full-lifecycle ATS pipeline tracking and 400+ recruiting tool integrations.",
    recruiterWorkflow: "Structured hiring stages, scorecards, and requisition management.",
    candidateExperience: "Standard job application portal and email scheduling notifications.",
  },
  humanly: {
    name: "Humanly",
    slug: "humanly",
    category: "Conversational Screening & Notes",
    features: {
      aiInterview: "Limited",
      videoInterview: "Limited",
      liveVideo: "Limited",
      interviewAnalysis: "Yes",
      facialRecognition: "No",
      candidateAssessment: "Limited",
      aiEvaluation: "Limited",
      proctoring: "No",
      codingSandbox: "No",
    },
    featureDetails: {
      aiInterview: "Conversational pre-screening chatbot and interview note-taking assistant.",
      videoInterview: "Integrates with video meetings to record and summarize conversations.",
      liveVideo: "Attends live recruiter calls for note-taking and candidate sentiment analysis.",
      interviewAnalysis: "Generates post-call recruiter summaries and conversational analytics.",
      facialRecognition: "Not supported.",
      candidateAssessment: "Pre-screening questions via chat.",
      aiEvaluation: "Candidate sentiment and competency notes synthesized for recruiters.",
      proctoring: "Not supported.",
      codingSandbox: "Not supported.",
    },
    pricingStatus: "Custom pricing",
    pricingModel: "Custom / Annual Tiered",
    pricingNotes: "Custom pricing — customers need to contact the sales team for a quote.",
    bestFor: "High-volume teams wanting chat screening and meeting copilot notes",
    superpower: "Chatbot candidate pre-screening and automated recruiter interview summaries.",
    recruiterWorkflow: "Chat screening triage and automated interview notes.",
    candidateExperience: "Chatbot screening dialogue followed by human video interview.",
  },
  coderbyte: {
    name: "Coderbyte",
    slug: "coderbyte",
    category: "Technical Screening & Challenges",
    features: {
      aiInterview: "No",
      videoInterview: "Limited",
      liveVideo: "Limited",
      interviewAnalysis: "Limited",
      facialRecognition: "No",
      candidateAssessment: "Yes",
      aiEvaluation: "Yes",
      proctoring: "Limited",
      codingSandbox: "Yes",
    },
    featureDetails: {
      aiInterview: "Technical assessment and coding challenge platform; no autonomous voice AI.",
      videoInterview: "Live collaborative pair programming with built-in video.",
      liveVideo: "Live pair-programming sessions with built-in video.",
      interviewAnalysis: "Automated code analysis, test suite checks, and plagiarism detection.",
      facialRecognition: "Not supported; uses webcam snapshots for basic proctoring.",
      candidateAssessment: "Extensive coding challenges, algorithmic exercises, and take-home projects.",
      aiEvaluation: "Automated unit test execution and code scorecards.",
      proctoring: "Browser tab-switching alerts and webcam snapshots.",
      codingSandbox: "Multi-language code editor with unit testing capabilities.",
    },
    pricingStatus: "Available",
    pricingModel: "Subscription",
    pricingNotes: "Plans start at $199/month for unlimited technical candidates.",
    bestFor: "Companies needing cost-effective technical coding assessments and take-home tests",
    superpower: "Affordable coding assessments with automated unit tests and take-home projects.",
    recruiterWorkflow: "Automated code grading, solution playback, and scorecards.",
    candidateExperience: "Interactive browser-based coding challenges and unit test feedback.",
  },
  interviewer: {
    name: "Interviewer.AI",
    slug: "interviewer",
    category: "AI Video Screening",
    features: {
      aiInterview: "Yes",
      videoInterview: "Yes",
      liveVideo: "Limited",
      interviewAnalysis: "Yes",
      facialRecognition: "Limited",
      candidateAssessment: "Yes",
      aiEvaluation: "Yes",
      proctoring: "Limited",
      codingSandbox: "No",
    },
    featureDetails: {
      aiInterview: "Asynchronous automated video interviews with AI grading.",
      videoInterview: "One-way video interview recording with custom question sets.",
      liveVideo: "Primarily asynchronous automated video screening with timed questions.",
      interviewAnalysis: "Evaluates speech clarity, vocabulary, energy, and resume relevance.",
      facialRecognition: "Presence and eye-contact tracking; no biometric identity authentication.",
      candidateAssessment: "Skill assessments and WorkStyle psychological profile evaluations.",
      aiEvaluation: "Instant multi-factor scoring combining resume, video, and assessment metrics.",
      proctoring: "Presence and eye contact tracking.",
      codingSandbox: "Not supported.",
    },
    pricingStatus: "Available",
    pricingModel: "Subscription",
    pricingNotes: "Tiered subscription starting from ~$99–$249/month.",
    bestFor: "Mid-market hiring teams wanting video screening paired with resume analysis",
    superpower: "WorkStyle scoring and multi-factor candidate scoring combining video and resume.",
    recruiterWorkflow: "Ranked candidate lists with composite video and resume scores.",
    candidateExperience: "Asynchronous recorded video interview with timed responses.",
  },
  mercor: {
    name: "Mercor",
    slug: "mercor",
    category: "AI Talent Marketplace & Vetting",
    features: {
      aiInterview: "Yes",
      videoInterview: "Yes",
      liveVideo: "Yes",
      interviewAnalysis: "Yes",
      facialRecognition: "No",
      candidateAssessment: "Yes",
      aiEvaluation: "Yes",
      proctoring: "Limited",
      codingSandbox: "Limited",
    },
    featureDetails: {
      aiInterview: "Automated AI video interview vetting for pre-screened talent pools.",
      videoInterview: "Recorded AI video evaluations probing technical and behavioral experience.",
      liveVideo: "Conducts live AI video vetting interviews for global talent.",
      interviewAnalysis: "Deep resume parsing paired with transcript competency evaluation.",
      facialRecognition: "Not supported.",
      candidateAssessment: "Domain-specific vetting tests and live interview evaluations.",
      aiEvaluation: "AI algorithmic candidate rankings and structured recruiter summaries.",
      proctoring: "Session verification during vetting calls.",
      codingSandbox: "Domain-specific technical vetting.",
    },
    pricingStatus: "Custom pricing",
    pricingModel: "Custom / Take-Rate",
    pricingNotes: "Custom pricing — customers need to contact the sales team for a quote or talent placement fee.",
    bestFor: "Companies looking to hire pre-vetted elite global software talent",
    superpower: "End-to-end AI candidate vetting and curated talent marketplace matching.",
    recruiterWorkflow: "Browse pre-screened, video-vetted global candidate profiles.",
    candidateExperience: "AI video vetting interview with portfolio and background probing.",
  },
  recruit41: {
    name: "Recruit41",
    slug: "recruit41",
    category: "AI Candidate Intake & Screening",
    features: {
      aiInterview: "Limited",
      videoInterview: "Limited",
      liveVideo: "No",
      interviewAnalysis: "Limited",
      facialRecognition: "No",
      candidateAssessment: "Limited",
      aiEvaluation: "Limited",
      proctoring: "No",
      codingSandbox: "No",
    },
    featureDetails: {
      aiInterview: "Lightweight candidate intake forms with automated qualifying screening.",
      videoInterview: "Basic async video response capture.",
      liveVideo: "Focuses on async intake forms and short clips; no native live video.",
      interviewAnalysis: "Basic resume and response keyword matching.",
      facialRecognition: "Not supported.",
      candidateAssessment: "Custom pre-screening qualification forms.",
      aiEvaluation: "Automated pass/fail scoring based on recruiter-defined thresholds.",
      proctoring: "Not supported.",
      codingSandbox: "Not supported.",
    },
    pricingStatus: "Custom pricing",
    pricingModel: "Custom / Quote-Based",
    pricingNotes: "Custom pricing — customers need to contact the sales team for a quote.",
    bestFor: "Boutique recruiting teams seeking streamlined intake workflows",
    superpower: "Structured candidate intake forms and lightweight automated screening.",
    recruiterWorkflow: "Intake form review and automated initial triage.",
    candidateExperience: "Quick web intake questionnaire with optional video clips.",
  },
};

export function getPlatformProfile(nameOrSlug?: string): PlatformProfile {
  if (!nameOrSlug) return PLATFORM_PROFILES.hireko;
  const clean = nameOrSlug.toLowerCase().trim().replace(/[^a-z0-9]/g, "");

  for (const [key, profile] of Object.entries(PLATFORM_PROFILES)) {
    const keyClean = key.toLowerCase().replace(/[^a-z0-9]/g, "");
    const nameClean = profile.name.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (clean === keyClean || clean === nameClean || clean.includes(keyClean) || nameClean.includes(clean)) {
      return profile;
    }
  }

  // Fallback profile
  return {
    name: nameOrSlug,
    slug: clean,
    category: "Recruitment Software",
    features: {
      aiInterview: "Unknown",
      videoInterview: "Unknown",
      liveVideo: "Unknown",
      interviewAnalysis: "Unknown",
      facialRecognition: "Unknown",
      candidateAssessment: "Unknown",
      aiEvaluation: "Unknown",
      proctoring: "Unknown",
      codingSandbox: "Unknown",
    },
    featureDetails: {
      aiInterview: "Information not publicly confirmed.",
      videoInterview: "Information not publicly confirmed.",
      liveVideo: "Information not publicly confirmed.",
      interviewAnalysis: "Information not publicly confirmed.",
      facialRecognition: "Information not publicly confirmed.",
      candidateAssessment: "Information not publicly confirmed.",
      aiEvaluation: "Information not publicly confirmed.",
      proctoring: "Information not publicly confirmed.",
      codingSandbox: "Information not publicly confirmed.",
    },
    pricingStatus: "Custom pricing",
    pricingModel: "Custom Quote",
    pricingNotes: "Custom pricing — customers need to contact the sales team for a quote.",
    bestFor: `${nameOrSlug} evaluation teams`,
    superpower: `${nameOrSlug} specialized hiring capabilities.`,
    recruiterWorkflow: "Recruiter management interface.",
    candidateExperience: "Candidate submission portal.",
  };
}

export const RAG_SYSTEM_PROMPT = `You are Hireko.ai Product Advisor: a friendly, clear, evidence-driven assistant for product, leadership, engineering, sales, marketing and recruiting teams.
Help users understand Hireko.ai, compare recruiting platforms, verify product capabilities, identify gaps and recommend practical product improvements.
Be conversational by default. Use detailed tables when the user asks for comparisons, feature checks, rankings, pricing, or strategy.
CORE RULE: USE EVIDENCE, NOT ASSUMPTIONS.
1. Retrieve platform records and source documents before answering factual competitor questions.
2. Label important claims as VERIFIED, VENDOR-CLAIMED, INFERENCE or RECOMMENDATION.
3. If evidence is missing, stale, or contradictory, state: "I couldn't verify this from the available evidence." Do not convert missing evidence into "No."
4. Distinguish interview modes strictly: Live synchronous video vs Asynchronous / one-way video vs AI-led interview vs Technical live interview vs Conversational recruiting vs Interview intelligence vs ATS / hiring workflow.
5. Treat the Advisor as decision support, not an autonomous hiring decision-maker. Do not recommend hiring decisions based on protected traits, appearance, accent, or emotion inference.`;

export function retrieveTopChunks(query: string, topK: number = 5, targetCompetitor?: string): VectorChunk[] {
  const chunks = (vectorStoreJson || []) as VectorChunk[];
  const cleanQuery = query.toLowerCase().replace(/[^a-z0-9\s]/g, " ");
  const queryTerms = cleanQuery.split(/\s+/).filter((w) => w.length > 2);

  let pool = chunks;
  if (targetCompetitor && targetCompetitor.toLowerCase() !== "hireko") {
    const compClean = targetCompetitor.toLowerCase().replace(/[^a-z0-9]/g, "");
    const filtered = chunks.filter((c) => {
      const cComp = c.competitor.toLowerCase().replace(/[^a-z0-9]/g, "");
      const cSlug = c.slug.toLowerCase().replace(/[^a-z0-9]/g, "");
      return cComp.includes(compClean) || compClean.includes(cComp) || cSlug.includes(compClean);
    });
    if (filtered.length > 0) pool = filtered;
  }

  if (queryTerms.length === 0) return pool.slice(0, topK);

  const scored = pool.map((chunk) => {
    let score = 0;
    const textLower = `${chunk.title} ${chunk.section} ${chunk.content}`.toLowerCase();
    for (const term of queryTerms) {
      if (textLower.includes(term)) score += 2;
      if (chunk.keywords && chunk.keywords.includes(term)) score += 1;
    }
    if (queryTerms.some((t) => chunk.title.toLowerCase().includes(t))) score += 3;
    return { chunk, score };
  });

  scored.sort((a, b) => b.score - a.score);
  const results = scored.filter((s) => s.score > 0).slice(0, topK).map((s) => s.chunk);
  return results.length > 0 ? results : pool.slice(0, topK);
}

export function findCompetitorOverview(name?: string): ComparisonOverview | undefined {
  if (!name) return undefined;
  const clean = name.toLowerCase().trim();
  if (clean === "hireko") return undefined;

  return comparisons.find((c) => {
    const cName = c.competitorName.toLowerCase();
    const cSlug = c.slug.toLowerCase();
    return (
      cName === clean ||
      clean.includes(cName) ||
      cSlug.includes(clean.replace(/[^a-z0-9]/g, "")) ||
      (clean.includes("talview") && cSlug.includes("talview")) ||
      (clean.includes("hirevue") && cSlug.includes("hirevue")) ||
      (clean.includes("ribbon") && cSlug.includes("ribbon")) ||
      (clean.includes("juicebox") && cSlug.includes("juicebox")) ||
      (clean.includes("codesignal") && cSlug.includes("codesignal")) ||
      (clean.includes("spark") && cSlug.includes("spark"))
    );
  });
}

export function generateFollowUpChips(intent: IntentType, products?: string[], topic?: string): string[] {
  const safeProducts = Array.isArray(products) && products.length > 0 ? products : ["Hireko"];
  const competitor = safeProducts.find((p) => p.toLowerCase() !== "hireko");

  switch (intent) {
    case "FEATURE_QUESTION":
      return [
        "What are Hireko's best features?",
        "Compare Hireko and HireVue",
        "How much does Hireko cost?",
        "Which platforms have facial recognition?",
      ];
    case "FEATURE_COMPARISON":
      return [
        "Compare Hireko and Talview",
        "Which platform is cheaper?",
        "Does Hireko support video interviews?",
        "Which platform should I choose?",
      ];
    case "HIREKO_ROADMAP":
      return [
        "What are Hireko's best features?",
        "Compare Hireko and HireVue",
        "Which platform has the best feature?",
        "How much does Hireko cost?",
      ];
    case "BEST_FEATURE_BY_USE_CASE":
      return [
        "What should Hireko improve next?",
        "Compare Hireko and HireVue",
        "Which platforms support live video?",
        "How much does Hireko cost?",
      ];
    case "HIREKO_BEST_FEATURES":
      return [
        "How much does Hireko cost?",
        "Compare Hireko and HireVue",
        "Does Hireko support live video?",
        "Which platform should I choose for recruiters?",
      ];
    case "PRICING_COMPARISON":
      return [
        "What are Hireko's best features?",
        "Compare Hireko and HireVue",
        "Does Hireko support video interviews?",
        "Which platform should I choose?",
      ];
    case "PRODUCT_COMPARISON":
      return [
        "Which platform is cheaper?",
        "What are Hireko's best features?",
        "Does Hireko support facial recognition?",
        "Which platform should I choose for my team?",
      ];
    case "RECOMMENDATION":
      return [
        "How much does Hireko cost?",
        "Compare Hireko and HireVue",
        "What are Hireko's best features?",
        "Does Talview support assessments?",
      ];
    case "HIREKO_SPECIFIC":
      return [
        "What are Hireko's best features?",
        "How much does Hireko cost?",
        "Compare Hireko vs HireVue",
        "Does Hireko support live video?",
      ];
    case "COMPETITOR_SPECIFIC":
      return [
        competitor ? `Compare Hireko and ${competitor}` : "Compare Hireko and HireVue",
        competitor ? `How much does ${competitor} cost?` : "Which platform is cheaper?",
        "What are Hireko's best features?",
        "Which platform should I choose?",
      ];
    case "UNRELATED_QUESTION":
      return [
        "What is Hireko.ai?",
        "Compare Hireko and HireVue",
        "How much does Hireko cost?",
        "Which platform should I choose?",
      ];
    case "GENERAL_QA":
      return [
        "Explain the STAR method with an example",
        "What are key recruitment KPIs?",
        "Compare Hireko and HireVue",
        "How much does Hireko cost?",
      ];
    default:
      return [
        "What is Hireko?",
        "Compare Hireko and HireVue",
        "How much does Hireko cost?",
        "What are Hireko's best features?",
      ];
  }
}

// ============================================================================
// 1. UNIFIED COMPARISON PATH (All Competitor & Feature Comparisons in One Path)
// ============================================================================
export function buildUnifiedComparisonAnswer(
  platforms: string[],
  query?: string,
  userName?: string
): string {
  const cleanQuery = (query || "").toLowerCase();
  let uniqueList: string[] = [];

  for (const p of platforms) {
    const clean = p.trim();
    if (clean && !uniqueList.some((u) => u.toLowerCase() === clean.toLowerCase())) {
      uniqueList.push(clean);
    }
  }

  const isBestFeature =
    /best\s+feature|who\s+has\s+the\s+best|which\s+platform\s+has\s+(?:the\s+)?best|best\s+platform|better\s+ai\s+interview/i.test(
      cleanQuery
    );
  const isCompareAll =
    /compare\s+all|all\s+platforms|every\s+platform/i.test(cleanQuery);

  if (isCompareAll) {
    uniqueList = [
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
    ];
  } else if (isBestFeature && uniqueList.length < 2) {
    uniqueList = ["Hireko", "HireVue", "Talview", "CodeSignal", "Spark Hire", "Metaview"];
  } else if (uniqueList.length === 0) {
    uniqueList = ["Hireko", "HireVue", "Talview"];
  } else if (uniqueList.length === 1) {
    if (uniqueList[0].toLowerCase() === "hireko") {
      uniqueList.push("HireVue");
    } else {
      uniqueList.unshift("Hireko");
    }
  }

  const profiles = uniqueList.map((p) => getPlatformProfile(p));
  const hasHireko = profiles.some((p) => p.slug === "hireko");

  if (hasHireko) {
    profiles.sort((a, b) => (a.slug === "hireko" ? -1 : b.slug === "hireko" ? 1 : 0));
  }

  const tableHeader = `| Platform | Pricing | AI Interview | Live Video | Interview Analysis | Candidate Assessment | AI Evaluation | Key Focus |`;
  const tableAlign = `|:---|:---|:---|:---|:---|:---|:---|:---|`;

  const rows = profiles
    .map((p) => {
      let pricing = p.pricingStatus === "Unknown" ? "Not confirmed" : p.pricingStatus;
      if (p.slug === "hireko") pricing = "Available (SaaS)";

      const aiInt =
        p.features.aiInterview === "Limited" || p.features.aiInterview === "Custom"
          ? "Partial"
          : p.features.aiInterview;
      const liveVid =
        p.features.liveVideo === "Limited" || p.features.liveVideo === "Custom"
          ? "Partial"
          : p.features.liveVideo;
      const analysis =
        p.features.interviewAnalysis === "Limited" || p.features.interviewAnalysis === "Custom"
          ? "Partial"
          : p.features.interviewAnalysis;
      const assessment =
        p.features.candidateAssessment === "Limited" || p.features.candidateAssessment === "Custom"
          ? "Partial"
          : p.features.candidateAssessment;
      const evalScore =
        p.features.aiEvaluation === "Limited" || p.features.aiEvaluation === "Custom"
          ? "Partial"
          : p.features.aiEvaluation;

      const focus = p.superpower || p.bestFor;

      return `| **${p.name}** | ${pricing} | ${aiInt} | ${liveVid} | ${analysis} | ${assessment} | ${evalScore} | ${focus} |`;
    })
    .join("\n");

  let conclusion = "";
  if (profiles.length === 2 && hasHireko) {
    const competitor = profiles.find((p) => p.slug !== "hireko") || profiles[1];
    const compSlug = competitor.slug;
    if (compSlug === "hirevue") {
      conclusion = `**Summary:** **Hireko.ai** provides autonomous conversational AI voice and video interviews with instant ~2-minute autograding and transparent volume SaaS pricing. In contrast, **HireVue** is tailored for Global 2000 enterprise compliance, structured assessments, and complex ATS integrations under custom annual contracts. For fast, engaging candidate screening that reduces recruiter hours, **[hireko.ai](https://hireko.ai)** is the recommended option.`;
    } else if (compSlug === "talview") {
      conclusion = `**Summary:** **Hireko.ai** excels in conversational candidate evaluation with ~2-minute autograded scorecards, whereas **Talview** focuses on proctored exam sessions, secure browser lockdown, and university certification tests. Teams looking for fast, conversational recruiting should choose **[hireko.ai](https://hireko.ai)**; choose Talview if strict proctoring surveillance is mandatory.`;
    } else if (compSlug === "codesignal") {
      conclusion = `**Summary:** **Hireko.ai** conducts conversational AI interviews evaluating domain reasoning and behavioral fit, while **CodeSignal** is the benchmark for live collaborative IDE coding and standardized engineering tests. Teams frequently use **[hireko.ai](https://hireko.ai)** for top-of-funnel screening and CodeSignal for downstream technical coding rounds.`;
    } else if (compSlug === "sparkhire") {
      conclusion = `**Summary:** **Hireko.ai** features an active AI interviewer that dynamically follows up on candidate responses and autogrades within ~2 minutes, whereas **Spark Hire** relies on asynchronous recorded video prompts that recruiters must review manually. **[hireko.ai](https://hireko.ai)** dramatically reduces recruiter review time.`;
    } else if (compSlug === "metaview") {
      conclusion = `**Summary:** **Hireko.ai** automates first-round screening by conducting the interview autonomously, while **Metaview** acts as an AI note-taker during human-led Zoom or Teams calls. Choose **[hireko.ai](https://hireko.ai)** to replace manual screening phone calls, and Metaview to capture notes during live hiring manager panels.`;
    } else if (compSlug === "greenhouse") {
      conclusion = `**Summary:** **Greenhouse** is an applicant tracking system (ATS) for structured pipeline governance, while **Hireko.ai** is an autonomous AI interviewing engine. Rather than competing, **[hireko.ai](https://hireko.ai)** integrates with Greenhouse to screen candidates automatically and export autograded scorecards.`;
    } else {
      conclusion = `**Summary:** **Hireko.ai** delivers live conversational AI voice and video interviewing with automated ~2-minute autograding and transparent volume SaaS pricing. **${competitor.name}** is specialized for ${competitor.bestFor.toLowerCase()}. For scalable, interactive first-round screening, **[hireko.ai](https://hireko.ai)** provides the most streamlined experience.`;
    }
  } else if (isBestFeature) {
    conclusion = `**Summary:** Different platforms lead in specific categories: **CodeSignal** is the benchmark for live technical coding environments, **HireVue** leads in enterprise assessment science, and **Metaview** excels at automated notes for human-led calls. For teams seeking an autonomous, interactive AI interviewer with instant ~2-minute autograding, **[hireko.ai](https://hireko.ai)** is the standout choice.`;
  } else if (hasHireko) {
    conclusion = `**Summary:** Among these platforms, **Hireko.ai** delivers live bidirectional conversational AI video screening with ~2-minute autograding and transparent SaaS pricing. Competitors like HireVue and Talview focus on compliance-heavy enterprise assessments under custom annual quotes, while Spark Hire and Willo focus on asynchronous recorded video. Choose **[hireko.ai](https://hireko.ai)** to automate candidate screening and eliminate manual phone screens.`;
  } else {
    conclusion = `**Summary:** Each platform serves different stages of recruitment, ranging from automated assessments to live proctoring. Compare pricing models, evaluation automation, and candidate experience to determine the best fit for your hiring workflow.`;
  }

  return `${tableHeader}\n${tableAlign}\n${rows}\n\n${conclusion}\n\n> 🌐 **Official Website:** [hireko.ai](https://hireko.ai)`;
}

export function buildTwoPlatformComparisonAnswer(
  competitorSlugOrName: string,
  userName?: string
): string {
  return buildUnifiedComparisonAnswer(["Hireko", competitorSlugOrName], undefined, userName);
}

export function buildCompetitorComparisonAnswer(
  platforms: string[],
  userName?: string
): string {
  return buildUnifiedComparisonAnswer(platforms, undefined, userName);
}

// ============================================================================
// 2. PRICING COMPARISON (Pricing Table + Strict Quote Rules)
// ============================================================================
export function buildPricingQuestionsAnswer(
  platforms: string[],
  userAskedHireko: boolean,
  userName?: string
): string {
  let list = platforms.filter((p) => p.trim());
  if (list.length === 0) {
    list = userAskedHireko ? ["Hireko", "HireVue", "Talview"] : ["HireVue", "Talview", "Spark Hire"];
  } else if (list.length === 1 && !list.some((p) => p.toLowerCase() === "hireko") && userAskedHireko) {
    list.unshift("Hireko");
  }

  const profiles = list.map((p) => getPlatformProfile(p));
  const hasHirekoInList = profiles.some((p) => p.slug === "hireko");

  const tableHeader = `| Platform | Pricing Status | Pricing Model | Official Pricing Evidence / Notes |`;
  const tableAlign = `|:---|:---|:---|:---|`;

  const rows = profiles
    .map((p) => {
      let notes = p.pricingNotes;
      if (p.pricingStatus === "Unknown") {
        notes = "Pricing is not publicly verified; contact the vendor.";
      } else if (p.pricingStatus === "Custom pricing") {
        notes = "Custom pricing — customers need to contact the sales team for a quote.";
      }
      return `| ${p.name} | ${p.pricingStatus} | ${p.pricingModel} | ${notes} |`;
    })
    .join("\n");

  const trailingLink = (hasHirekoInList || userAskedHireko) ? `\n\n> 🌐 **Official Website:** [hireko.ai](https://hireko.ai)` : "";
  const guidance = `**Budget guidance:** Transparent SaaS models eliminate unpredictable enterprise service retainers and allow teams to pay strictly for active screening volume. For platforms requiring custom quotes, enterprise buyers should confirm seat licenses, candidate tier limits, and annual contract commitments prior to signing. Pricing information is subject to change by vendor.`;

  return `${tableHeader}\n${tableAlign}\n${rows}\n\n${guidance}${trailingLink}`;
}

// ============================================================================
// 3. YES/NO FEATURE CAPABILITY (Pattern C: Direct Plain Text + Strict Evidence)
// ============================================================================
export function buildYesNoFeatureAnswer(
  targetPlatform: string,
  featureKey: string,
  featureLabel: string,
  query: string,
  userName?: string
): string {
  const isPlaceholder =
    /\[platform|\bplatform\s*name\b|\bany\s*platform\b|\bthe\s*platform\b/i.test(targetPlatform) ||
    /\[platform/i.test(query);

  if (isPlaceholder) {
    return `**YES** — Most leading recruitment platforms (including Hireko, HireVue, and Spark Hire) support ${featureLabel.toLowerCase()}. Hireko.ai specializes in conversational AI voice and video interviews with dynamic follow-ups, while platforms like Spark Hire and HireVue offer structured recorded video. Which specific platform would you like to verify?\n\n> 🌐 **Official Website:** [hireko.ai](https://hireko.ai)`;
  }

  const profile = getPlatformProfile(targetPlatform);
  const isHireko = profile.slug === "hireko";
  const featureStatus = (profile.features as any)[featureKey] || "Unknown";
  const featureDetail = (profile.featureDetails as any)[featureKey] || "";

  let answer = "";
  if (isHireko) {
    if (featureKey === "liveVideo") {
      answer = `**UNKNOWN / NOT VERIFIED** — Hireko's public positioning emphasizes conversational AI voice and video interviews and recorded interview review, but synchronous 2-way live video room capabilities in the current product build require direct verification. [INFERENCE / VENDOR-CLAIMED]. Caveat: Public marketing positioning and the deployed build may differ.`;
    } else if (featureKey === "facialRecognition") {
      answer = `**NO** — Hireko.ai does not support facial recognition or biometric emotion analysis. [VERIFIED]. Hireko focuses strictly on verbal competence, standardized rubrics, and answer content to eliminate visual and biometric bias.`;
    } else if (featureStatus === "Yes") {
      answer = `**YES** — Hireko.ai supports ${featureLabel.toLowerCase()}. [VERIFIED / VENDOR-CLAIMED]. ${featureDetail}`;
    } else if (featureStatus === "No") {
      answer = `**NO** — Hireko.ai does not support ${featureLabel.toLowerCase()}. [VERIFIED]. ${featureDetail}`;
    } else {
      answer = `**UNKNOWN / NOT VERIFIED** — I couldn’t verify ${featureLabel.toLowerCase()} support for Hireko from current available evidence. ${featureDetail || "Internal product data should be verified against current build."}`;
    }
    answer += `\n\n> 🌐 **Official Website:** [hireko.ai](https://hireko.ai)`;
    return answer;
  }

  // Competitor logic
  if (featureKey === "liveVideo") {
    if (["hirevue", "talview", "sparkhire", "codesignal"].includes(profile.slug)) {
      answer = `**YES** — ${profile.name} explicitly supports live video interviews. [VERIFIED via Official Documentation]. ${featureDetail}`;
    } else if (["willo", "metaview", "greenhouse"].includes(profile.slug)) {
      answer = `**NO** — Current authoritative evidence confirms ${profile.name} does not provide synchronous live video rooms. [VERIFIED]. ${featureDetail}`;
    } else {
      answer = `**UNKNOWN / NOT VERIFIED** — I couldn't verify synchronous live video support for ${profile.name} from current evidence. [NOT VERIFIED]. ${featureDetail} Note: That does not mean the feature is definitely absent, but current documentation is not specific enough.`;
    }
    return answer;
  }

  if (featureStatus === "Yes") {
    answer = `**YES** — ${profile.name} supports ${featureLabel.toLowerCase()}. [VERIFIED]. ${featureDetail}`;
  } else if (featureStatus === "No") {
    answer = `**NO** — ${profile.name} does not support ${featureLabel.toLowerCase()} in its core product scope. [VERIFIED]. ${featureDetail}`;
  } else if (featureStatus === "Limited" || featureStatus === "Custom") {
    answer = `**UNKNOWN / NOT VERIFIED** — ${profile.name} provides partial or configuration-dependent support for ${featureLabel.toLowerCase()}. [VENDOR-CLAIMED]. ${featureDetail}`;
  } else {
    answer = `**UNKNOWN / NOT VERIFIED** — I couldn’t verify ${featureLabel.toLowerCase()} support for ${profile.name} from available public evidence. [NOT VERIFIED]. ${featureDetail || "We recommend checking directly with their documentation for verification."}`;
  }

  return answer;
}

// ============================================================================
// 4. HIREKO BEST FEATURES (Pattern E: Differentiators as Hypotheses to Test)
// ============================================================================
export function buildHirekoBestFeaturesAnswer(userName?: string): string {
  return `**Hireko.ai has several potential competitive hypotheses to test, depending on the use case.**

| Capability | Hireko Positioning | Competitor Baseline | Competitive Hypothesis to Test | Evidence Status |
|:---|:---|:---|:---|:---|
| **Conversational Interaction** | Interactive voice/video AI agent with dynamic follow-ups | One-way recorded webcam video prompts to timed questions (HireVue, Spark Hire) | Candidates engage more naturally in adaptive dialogue than one-way countdown screens. | VENDOR-CLAIMED (Verify in product build) |
| **Autograding Speed** | Structured scorecard delivered within ~2 minutes | Manual recruiter video review or asynchronous scoring queues | Rapid turnaround reduces candidate drop-off and recruiter review overhead. | VENDOR-CLAIMED (Benchmark against recruiter review time) |
| **Decision Support** | Opportunity for evidence-backed rubric reports linking answers to criteria | Often opaque overall scores or pure transcripts without job rubric alignment | Recruiters make faster, fairer decisions when AI conclusions link directly to answer excerpts. | RECOMMENDATION / ROADMAP HYPOTHESIS |
| **Pricing & Onboarding** | Self-serve SaaS volume tiers without annual retained minimums | Enterprise contracts requiring $15,000–$35,000+ annual commitments (HireVue, Talview) | Mid-market teams can adopt modern AI screening without enterprise lock-in. | VERIFIED (Pricing models differ substantially) |

**Key takeaway:**  
Rather than claiming universal superiority, Hireko's strongest differentiator is its conversational AI interview format paired with rapid scorecard generation. To solidify this advantage, Hireko should focus on explainable evidence mapping—proving every score with candidate quotes rather than relying on black-box ratings.

> 🌐 **Official Website:** [hireko.ai](https://hireko.ai)`;
}

// ============================================================================
// 5. LIVE VIDEO COMPARISON (Live Video Capability Map across 14 Platforms)
// ============================================================================
export function buildLiveVideoComparisonAnswer(userName?: string): string {
  const intro = "Here’s the distinction: live video means both people meet at the same time; one-way video means the candidate records answers for later review.";

  const table = `| Platform | Status (YES / NO / UNKNOWN) | Exact mode | Evidence/source | Caveat |
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
| **Greenhouse** | NO | ATS workflow; interview kits, scheduling, and pipeline management | Official help (support.greenhouse.io) | Greenhouse is an ATS; live video relies on partner integrations (Zoom, Teams, HireVue). |`;

  const outro = "I marked a platform UNKNOWN where I could not verify synchronous video from current evidence; that does not mean the feature is definitely absent.";

  return `${intro}\n\n${table}\n\n${outro}\n\n> 🌐 **Official Website:** [hireko.ai](https://hireko.ai)`;
}

// ============================================================================
// 5b. BEST FEATURE COMPARISON (Unified Comparison Path)
// ============================================================================
export function buildBestFeatureByUseCaseAnswer(userName?: string): string {
  return buildUnifiedComparisonAnswer(
    ["Hireko", "HireVue", "Talview", "CodeSignal", "Spark Hire", "Metaview"],
    "best feature",
    userName
  );
}

// ============================================================================
// 5c. HIREKO PRODUCT ROADMAP (Pattern D: Prioritized Roadmap + Success Metrics)
// ============================================================================
export function buildHirekoRoadmapAnswer(userName?: string): string {
  const intro = "### 🚀 Prioritized Product Roadmap for Hireko.ai\n\nBased on competitive benchmarking across 14 hiring platforms, Hireko's greatest opportunity is establishing **decision support** rather than opaque scoring:";

  const table = `| Priority | Recommendation | Why it matters | MVP Scope | Dependencies & Risks | Success Metric |
|:---|:---|:---|:---|:---|:---|
| **P0** | **Evidence-backed AI Interview Report** | Recordings or raw scores alone do not explain hiring decisions; evidence links help recruiters validate outputs and spot gaps. | Report template, answer excerpts with timestamps, rubric-aligned editable scorecard, and confidence/coverage note. | Risk: over-interpreting short candidate responses. Dependency: speech-to-text accuracy and rubric alignment. | **Evidence coverage:** ≥ 90% of scored criteria have traceable answer excerpts. |
| **P0** | **Structured Rubric & Candidate Comparison** | Makes comparisons job-related and reviewable; avoids misleading single opaque rankings. | Role criteria editor, evidence-backed side-by-side candidate comparison rows, and editable recruiter ratings. | Risk: rubric rigidity for unconventional talent profiles. | **Consistency:** ≥ 85% agreement between draft AI scores and recruiter review. |
| **P1** | **Clear Live vs Asynchronous Mode Labels** | Synchronous live video, recorded async video, and AI-led interviews solve distinct user needs. Prevents candidate and buyer confusion. | Explicit mode taxonomy in candidate UI, recruiter settings, and knowledge base. | Low risk; clear UI terminology requirement. | **Reliability:** 0% mode confusion in user feedback and support tickets. |
| **P1** | **Candidate Practice & Preparation Flow** | Reduces candidate anxiety, improves completion rates, and cleanly separates preparation from formal assessment. | Dedicated practice interview module, audio/video device check, sample questions, and transparent consent/retention notices. | Dependency: candidate portal UX flow. | **Candidate completion rate:** ≥ 80% with < 15% drop-off. |
| **P1** | **Interview Intelligence & Recruiter Workflow** | Reduces manual recruiter note-taking and feedback delays while keeping humans accountable for final decisions. | Post-interview executive summary, searchable evidence snippets, follow-up probe suggestions, and ATS scorecard draft export. | Dependency: ATS sync APIs (Greenhouse, Lever, etc.). | **Review efficiency:** Time to completed scorecard reduced by ≥ 60%. |
| **P2** | **Candidate Engagement & Scheduling Hand-offs** | Conversational tools show the value of reducing scheduling friction between screening and panel interviews. | Automated candidate status notifications, interview readiness reminders, and calendar booking hand-off links. | Risk: third-party calendar sync delays. | **Candidate drop-off:** Funnel drop-off reduced by ≥ 25%. |
| **P2** | **Trust, Governance & Quality Monitoring** | AI hiring tools require strict fairness, auditability, and compliance with emerging AI hiring regulations (e.g. NYC Local Law 144, EU AI Act). | Audit logs, rubric version history, reviewer override logging, data retention limits, and bias monitoring across job-relevant groups. | Regulatory compliance requirements; strict privacy policies. | **Auditability:** 100% auditable scorecard history with zero sensitive-trait inference. |`;

  const metrics = `#### 📊 Core Success Metrics
- **Evidence coverage:** Percentage of scored criteria backed by at least one traceable answer excerpt.
- **Report usefulness:** Recruiter satisfaction rating of generated summaries and evidence quality.
- **Review efficiency:** Time from interview completion to submitted scorecard.
- **Consistency:** Correlation and agreement rate between AI-assisted drafts and final human ratings.
- **Candidate experience:** Candidate completion rate, drop-off rate, and reported interview clarity.
- **Reliability:** Zero unsupported claims or misclassified interview modes.`;

  return `${intro}\n\n${table}\n\n${metrics}\n\n> 🌐 **Official Website:** [hireko.ai](https://hireko.ai)`;
}

// ============================================================================
// 5d. FEATURE COMPARISON ACROSS PLATFORMS (Table + Summary)
// ============================================================================
export function buildFeatureComparisonAcrossPlatformsAnswer(
  featureKey: string,
  featureLabel: string,
  userName?: string
): string {
  if (featureKey === "liveVideo") {
    return buildLiveVideoComparisonAnswer(userName);
  }

  const evaluatedSlugs = [
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
  ];

  const profiles = evaluatedSlugs.map((s) => PLATFORM_PROFILES[s]).filter(Boolean);

  const tableHeader = `| Platform | Supported? (Yes / No / Partial) | Short note |`;
  const tableAlign = `|:---|:---|:---|`;

  const rows = profiles
    .map((p) => {
      const rawStatus = (p.features as any)[featureKey] || "Unknown";
      let supportedLabel = "Not confirmed";
      if (rawStatus === "Yes") supportedLabel = "Yes";
      else if (rawStatus === "No") supportedLabel = "No";
      else if (rawStatus === "Limited" || rawStatus === "Custom") supportedLabel = "Partial";
      else supportedLabel = "Not confirmed";

      const note = (p.featureDetails as any)[featureKey] || "Information not confirmed.";
      return `| ${p.name} | ${supportedLabel} | ${note} |`;
    })
    .join("\n");

  const yesCount = profiles.filter((p) => (p.features as any)[featureKey] === "Yes").length;
  const partialCount = profiles.filter(
    (p) => (p.features as any)[featureKey] === "Limited" || (p.features as any)[featureKey] === "Custom"
  ).length;
  const totalCount = profiles.length;

  const summary = `**Summary:** ${yesCount} out of ${totalCount} platforms support ${featureLabel.toLowerCase()}${
    partialCount > 0 ? ` (with ${partialCount} offering partial support)` : ""
  }. Hireko.ai provides live conversational AI interviews with real-time dynamic follow-ups, while tools like Spark Hire and HireVue focus primarily on structured recordings.`;

  return `${tableHeader}\n${tableAlign}\n${rows}\n\n${summary}\n\n> 🌐 **Official Website:** [hireko.ai](https://hireko.ai)`;
}

// ============================================================================
// 5b. UNCLEAR QUESTION HANDLER (Rule 5: Best guess + 1 short follow-up)
// ============================================================================
export function buildUnclearQuestionAnswer(query: string, userName?: string): string {
  const qLower = query.toLowerCase();

  let bestGuess = "";
  let answer = "";
  let followUp = "";

  if (/video|live|camera|webcam/i.test(qLower)) {
    bestGuess = "It looks like you're asking about video interviewing options.";
    answer = "Hireko.ai provides live interactive conversational voice and video AI interviews with dynamic follow-ups, whereas platforms like HireVue and Spark Hire focus on structured recorded responses.";
    followUp = "Would you like me to compare Hireko and HireVue, or check which platforms support live video?";
  } else if (/pricing|cost|price|subscription|fee/i.test(qLower)) {
    bestGuess = "It looks like you're asking about pricing for recruitment tools.";
    answer = "Hireko.ai offers transparent volume-based SaaS pricing with no lock-in, while enterprise platforms like HireVue and Talview require custom annual sales quotes.";
    followUp = "Would you like to see a pricing comparison table across platforms?";
  } else if (/ai|scoring|score|rubric|evaluat|autograd/i.test(qLower)) {
    bestGuess = "It looks like you're asking about AI interview scoring and automation.";
    answer = "Hireko.ai autogrades candidate interviews against standardized rubrics within ~2 minutes, whereas tools like Metaview provide AI meeting notes for human-led calls.";
    followUp = "Would you like to compare AI interview features between Hireko and Metaview?";
  } else if (/best|recommend|winner|choose/i.test(qLower)) {
    bestGuess = "It looks like you're looking for the best platform recommendation.";
    answer = "Hireko.ai is best for automated first-round conversational screening, HireVue is built for large enterprise compliance, and CodeSignal specializes in technical coding tests.";
    followUp = "What type of roles or hiring volume are you looking to support?";
  } else {
    bestGuess = "It looks like you're exploring AI hiring and video interview platforms.";
    answer = "Hireko.ai offers live bidirectional AI video interviews with automated ~2-minute scoring, helping hiring teams screen candidates without manual phone calls.";
    followUp = "Would you like to compare Hireko against competitors like HireVue or Talview, or see pricing details?";
  }

  return `${bestGuess}\n\n${answer}\n\n${followUp}\n\n> 🌐 **Official Website:** [hireko.ai](https://hireko.ai)`;
}

// ============================================================================
// GAME-BASED ASSESSMENTS KNOWLEDGE BASE & STRATEGIC RECOMMENDATION
// ============================================================================
export function buildGameBasedAssessmentAnswer(query: string, userName?: string): string {
  return `### Game-Based Assessments in AI Recruitment

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

> 🌐 **Official Website:** [hireko.ai](https://hireko.ai)`;
}

// ============================================================================
// 6. HIREKO-SPECIFIC QUESTIONS (Direct Answer First + 2-4 Sentences)
// ============================================================================
export function buildHirekoSpecificDirectAnswer(query: string, userName?: string): string {
  const qLower = query.toLowerCase();

  let directLead = "**Hireko.ai is an autonomous conversational AI hiring platform designed for live bidirectional voice and video candidate interviewing and automated rubric evaluation.**";

  if (qLower.includes("how does") || qLower.includes("work")) {
    directLead = "**Hireko.ai operates by conducting autonomous, bidirectional voice and video interviews where an adaptive AI agent asks dynamic follow-up questions in real time.**";
  } else if (qLower.includes("pricing") || qLower.includes("cost")) {
    directLead = "**Hireko.ai offers transparent, flexible SaaS pricing scaled to active hiring volume with zero rigid annual commitments.**";
  }

  const explanation = `Candidates engage in natural, human-like voice and video conversations rather than recording awkward one-way clips to countdown timers. The platform autogrades candidate responses against standardized evaluation rubrics, generating comprehensive scorecards and recruiter summaries within approximately two minutes. This eliminates 80%+ of manual recruiter phone screening time while delivering an engaging applicant experience.`;

  return `${directLead}\n\n${explanation}\n\n> 🌐 **Official Website:** [hireko.ai](https://hireko.ai)`;
}

// ============================================================================
// 7. COMPETITOR-SPECIFIC QUESTIONS (Direct Answer First + Zero External Links)
// ============================================================================
export function buildCompetitorSpecificDirectAnswer(
  competitorName: string,
  query: string,
  userName?: string
): string {
  const profile = getPlatformProfile(competitorName);
  const qLower = query.toLowerCase();

  let directLead = `**${profile.name} is an established platform specializing in ${profile.category.toLowerCase()} with a primary focus on ${profile.superpower.toLowerCase()}.**`;

  if (qLower.includes("pricing") || qLower.includes("cost")) {
    directLead = `**${profile.name} operates with a ${profile.pricingModel.toLowerCase()} model (${profile.pricingStatus.toLowerCase()}).**`;
  }

  const details = `${profile.name} is designed to streamline recruitment workflows by providing ${profile.recruiterWorkflow.toLowerCase()}. For candidates, the platform offers ${profile.candidateExperience.toLowerCase()}, making it best suited for ${profile.bestFor.toLowerCase()}.`;

  return `${directLead}\n\n${details}`;
}

// ============================================================================
// 8. RECOMMENDATION QUESTIONS (Criteria Identification + Table + Recommendation)
// ============================================================================
export function buildRecommendationAnswer(
  platforms: string[],
  featureKey?: string,
  featureLabel?: string,
  userName?: string
): string {
  let list = platforms.filter((p) => p.trim());
  if (list.length < 2) {
    if (!list.some((p) => p.toLowerCase() === "hireko")) {
      list.unshift("Hireko");
    }
    if (list.length < 2) {
      list.push("HireVue");
    }
  }

  const profiles = list.map((p) => getPlatformProfile(p));
  const hasHireko = profiles.some((p) => p.slug === "hireko");

  const tableHeader = `| Criteria | ${profiles.map((p) => p.name).join(" | ")} |`;
  const tableAlign = `|:---|${profiles.map(() => ":---").join("|")}|`;

  const rows = [
    `| AI Interviews | ${profiles.map((p) => p.featureDetails.aiInterview).join(" | ")} |`,
    `| Candidate Experience | ${profiles.map((p) => p.candidateExperience).join(" | ")} |`,
    `| Recruiter Workflow | ${profiles.map((p) => p.recruiterWorkflow).join(" | ")} |`,
    `| AI Evaluation | ${profiles.map((p) => p.featureDetails.aiEvaluation).join(" | ")} |`,
    `| Pricing | ${profiles.map((p) => p.pricingNotes).join(" | ")} |`,
  ].join("\n");

  const recommendation = `**Recommendation:**  
Based on the available information, the best platform depends on your primary hiring constraints:
${profiles.map((p) => `- **Choose ${p.name} if:** Your team requires ${p.bestFor.toLowerCase()}.`).join("\n")}

No single tool wins in every scenario; select the solution that matches your technical requirements and candidate experience priorities.`;

  const trailingLink = hasHireko ? `\n\n> 🌐 **Official Website:** [hireko.ai](https://hireko.ai)` : "";

  return `To determine the best platform, the primary decision criteria depend on whether your priority is conversational screening engagement, technical code benchmarking, proctoring security, or enterprise legacy compliance.\n\n${tableHeader}\n${tableAlign}\n${rows}\n\n${recommendation}${trailingLink}`;
}

// ============================================================================
// 9. UNRELATED QUESTIONS (Polite Redirection to Hiring Software)
// ============================================================================
export function buildUnrelatedQuestionAnswer(): string {
  return `I specialize as the AI Product Advisor for **Hireko.ai** and the AI recruitment, video interviewing, and hiring technology landscape. While I cannot assist with general non-recruitment queries, I would be happy to help you explore:

- **Hireko.ai Capabilities:** Live bidirectional voice and video AI interviews and automated rubric evaluation.
- **Competitor Comparisons:** Side-by-side benchmarks across HireVue, Talview, Spark Hire, Metaview, CodeSignal, or Ribbon AI.
- **Pricing & TCO Analysis:** Comparing flexible SaaS tiers vs. annual enterprise contract commitments.
- **Recruiting Frameworks:** STAR interview rubrics, technical screening workflows, and hiring funnel KPIs.

What aspect of hiring technology would you like to explore?`;
}

// ============================================================================
// 10. COMPETITOR DIRECTORY LISTING
// ============================================================================
export function buildCompetitorListAnswer(userName?: string): string {
  const nameSalutation = userName ? `, ${userName}` : "";
  const grouped = getCompetitorsByCategoryGroup();

  const categorySections = Object.entries(grouped)
    .map(([groupName, entries], idx) => {
      const items = entries
        .map((c) => `- **${c.name}:** ${c.superpower}`)
        .join("\n");
      return `##### ${idx + 1}. ${groupName} (${entries.length} Platforms)\n${items}`;
    })
    .join("\n\n");

  return `### 🌐 Comprehensive Competitor Directory: ${TOTAL_COMPETITORS_COUNT} Evaluated Hiring Platforms

> ⚡ **TL;DR${nameSalutation}:** HireKo actively benchmarks **${TOTAL_COMPETITORS_COUNT} leading hiring technology competitors** across 5 specialized market categories. Below is the complete market directory featuring their core focus and capabilities:

| # | Competitor Platform | Market Category | Primary Focus & Superpower |
| :-: | :--- | :--- | :--- |
${COMPETITORS_DIRECTORY.map((c, i) => `| ${i + 1} | **${c.name}** | ${c.category.split("&")[0].trim()} | ${c.tagline} |`).join("\n")}

#### 📁 Categorized Competitor Breakdown

${categorySections}

#### 🌟 How HireKo Differs from Competitors
While competitors typically solve single pieces of the recruitment funnel (such as recorded video repositories, coding test suites, or calendar scheduling), **HireKo.ai** specializes in **autonomous, bidirectional conversational AI interviewing**:
- **Live Conversational Dialogue:** Candidates converse naturally with an adaptive AI agent instead of talking into an awkward countdown timer.
- **Dynamic Real-Time Follow-Ups:** Real-time probing based on candidate answers to test genuine technical and domain skills.
- **Instant Autograding Rubrics:** Automatically delivers standardized competency scorecards, saving recruiters 80%+ of phone screening time.
- **Flexible & Transparent SaaS:** Rapid self-serve onboarding with zero multi-year enterprise lock-in.

> 🌐 **Official Website:** [hireko.ai](https://hireko.ai)`;
}

// ============================================================================
// 11. GENERAL CHATGPT QA (Frameworks, STAR, KPIs, Chunk Architecture)
// ============================================================================
export function buildGeneralChatGPTAnswer(query: string, userName?: string): string {
  const qLower = query.toLowerCase();

  // Game-Based Assessments
  if (
    qLower.includes("game") &&
    (qLower.includes("assessment") || qLower.includes("test") || qLower.includes("gamified") || qLower.includes("hirevue") || qLower.includes("hireko"))
  ) {
    return buildGameBasedAssessmentAnswer(query, userName);
  }

  // Knowledge base chunk size architecture
  if (
    qLower.includes("chunk") ||
    qLower.includes("vector store") ||
    qLower.includes("knowledge base size") ||
    qLower.includes("how many chunks")
  ) {
    return `### Knowledge Base & Chunk Size Architecture

The AI Product Advisor RAG knowledge base contains **120 indexed chunks** across 17 evaluated hiring and interview platforms.

#### 📊 Exact Chunk Size Specifications
- **Average Chunk Size:** ~420 characters (~56 words / ~105 tokens)
- **Minimum Chunk Size:** 237 characters (~33 words / ~59 tokens)
- **Maximum Chunk Size:** 764 characters (~107 words / ~191 tokens)
- **Standardized Sections per Platform (7 categories):** Overview & Category, Quick Stats, Feature Matrix, Pricing & Contracts, Strengths & Tradeoffs, Final Verdict, and FAQs.
- **RAG Retrieval Context Window:** Top-5 chunks (~2,100 characters / ~525 tokens) are retrieved dynamically per query for high-accuracy synthesis.

💡 **Knowledge Base Coverage:** Includes comprehensive profiles on Hireko, Metaview, HireVue, Talview, CodeSignal, Spark Hire, Willo, Ribbon AI, Juicebox, and 8 additional platforms.`;
  }

  // STAR Method
  if (qLower.includes("star") || qLower.includes("behavioral")) {
    return `### Mastering Behavioral Interviews & The STAR Method

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

> 🌐 **Official Website:** [hireko.ai](https://hireko.ai)`;
  }

  // KPIs
  if (qLower.includes("kpi") || qLower.includes("metric") || qLower.includes("time to hire")) {
    return `### Essential Talent Acquisition Metrics & Funnel KPIs

Tracking actionable recruiting metrics transforms talent acquisition from a cost center into a strategic growth engine.

| Metric | Calculation Formula | Industry Benchmark | Optimization Strategy |
|:---|:---|:---|:---|
| **Time to Hire** | Days from candidate first contact to accepted offer | **25–40 Days** | Automate top-of-funnel screening with AI voice/video interviews |
| **Candidate Drop-Off** | ((Started Applications - Completed) / Started) * 100 | **< 20%** Healthy | Replace 45-min cumbersome ATS forms with quick 2-way mobile screening |
| **Stage Pass-Through Rate** | Candidates advanced / Total evaluated | **25–35%** | Standardize rubrics so recruiters only pass vetted, qualified applicants |
| **Offer Acceptance Rate** | Accepted Offers / Total Offers Extended | **80–90%+** | Competitive compensation benchmarks and rapid turnaround |

> 🌐 **Official Website:** [hireko.ai](https://hireko.ai)`;
  }

  // General Guidance
  return `### AI Recruitment Advisory Guide

Modern talent acquisition leverages AI automation for repetitive administrative workflows while focusing human judgment on high-value candidate engagement and final decisions.

#### Core Principles
- **Structured Evaluation:** Use standardized competency rubrics across all candidates to mitigate bias.
- **Conversational Engagement:** Interactive voice and video interviews reduce candidate drop-off compared to static one-way video prompts.
- **Rapid Feedback Loops:** Delays beyond 48 hours cause significant candidate drop-off and lost talent.

What specific aspect of recruitment technology or interview workflow would you like to explore?`;
}

// LLM API Call helper (OpenAI / Gemini) with fast 2-second timeout
async function callLLMIfAvailable(
  userMessage: string,
  chunks: VectorChunk[],
  history: ChatMessage[],
  userName?: string
): Promise<string | null> {
  const openAiKey = process.env.OPENAI_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;

  if (!openAiKey && !geminiKey) return null;

  const contextText = chunks.map((c) => `[${c.competitor} - ${c.section}]: ${c.content}`).join("\n\n");
  const userGreetingInstruction = userName ? `The user's name is ${userName}. Address them warmly by name if appropriate.` : "";

  if (openAiKey) {
    try {
      const messages = [
        { role: "system", content: `${RAG_SYSTEM_PROMPT}\n${userGreetingInstruction}\n\nRETRIEVED CONTEXT:\n${contextText}` },
        ...history.slice(-4).map((m) => ({ role: m.role, content: m.content })),
        { role: "user", content: userMessage },
      ];

      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openAiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages,
          temperature: 0.3,
        }),
        signal: AbortSignal.timeout(800),
      });

      if (res.ok) {
        const data = await res.json();
        return data.choices?.[0]?.message?.content || null;
      }
    } catch {
      // Fast fallback to deterministic synthesis
    }
  }

  if (geminiKey) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `${RAG_SYSTEM_PROMPT}\n${userGreetingInstruction}\n\nRETRIEVED CONTEXT:\n${contextText}\n\nUSER QUESTION: ${userMessage}`,
                  },
                ],
              },
            ],
          }),
          signal: AbortSignal.timeout(800),
        }
      );

      if (res.ok) {
        const data = await res.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || null;
      }
    } catch {
      // Fast fallback to deterministic synthesis
    }
  }

  return null;
}

// ============================================================================
// MAIN DISPATCHER: askAdvisorRAG
// ============================================================================
export async function askAdvisorRAG(
  query: string,
  history: ChatMessage[] = [],
  sessionContext?: ConversationContext,
  userName?: string
): Promise<AdvisorResponse> {
  let currentContext =
    sessionContext &&
    typeof sessionContext === "object" &&
    !Array.isArray(sessionContext) &&
    Array.isArray((sessionContext as any).currentProducts)
      ? sessionContext
      : createInitialContext();

  // 1. Intent Classification & Name Extraction
  const intentResult: IntentResult = classifyIntent(query);
  const {
    type: intentType,
    productsMentioned,
    userName: extractedName,
    targetPlatform,
    featureKey,
    featureLabel,
  } = intentResult;

  const activeUserName = extractedName || userName || currentContext.userPreferences?.userName;

  // Update context memory
  currentContext = updateContextWithQuery(currentContext, query, productsMentioned, intentType, activeUserName);

  // 2. Small Talk & Name Introductions
  if (
    intentType === "NAME_INTRO" ||
    intentType === "CASUAL_GREETING" ||
    intentType === "CASUAL_THANKS" ||
    intentType === "CASUAL_CONFIRMATION" ||
    intentType === "CASUAL_GOODBYE"
  ) {
    const casualText = generateCasualResponse(intentType, activeUserName);
    const updatedCtx = recordAnswerInContext(currentContext, casualText);
    return {
      answer: casualText,
      intent: intentType,
      sources: [],
      suggestedFollowUps: generateFollowUpChips(intentType, updatedCtx.currentProducts),
      followUpSuggestions: generateFollowUpChips(intentType, updatedCtx.currentProducts),
      context: updatedCtx,
    };
  }

  // 2b. Rule 5: Unclear or Unrecognized Questions (Best Guess + 1 Follow-Up)
  if (intentType === "UNRECOGNIZED") {
    const unclearText = buildUnclearQuestionAnswer(query, activeUserName);
    const updatedCtx = recordAnswerInContext(currentContext, unclearText);
    const chips = [
      "Which platforms support live video?",
      "Compare all platforms on pricing and AI features",
      "Does HireVue have video interviews?",
      "How much does Hireko cost?",
    ];
    return {
      answer: unclearText,
      intent: intentType,
      sources: [],
      suggestedFollowUps: chips,
      followUpSuggestions: chips,
      context: updatedCtx,
    };
  }

  // 3. Unrelated Questions (Polite Redirection)
  if (intentType === "UNRELATED_QUESTION") {
    const unrelatedText = buildUnrelatedQuestionAnswer();
    const updatedCtx = recordAnswerInContext(currentContext, unrelatedText);
    const chips = generateFollowUpChips(intentType);
    return {
      answer: unrelatedText,
      intent: intentType,
      sources: [],
      productCard: undefined,
      suggestedFollowUps: chips,
      followUpSuggestions: chips,
      context: updatedCtx,
    };
  }

  // 4. Repeated Query Deduplication
  const previousAnswers = currentContext.previousAnswers || [];
  const isDuplicateQuery = currentContext.previousQuestions.slice(0, -1).includes(query);

  if ((intentType === "REPEATED_QUESTION" || isDuplicateQuery) && previousAnswers.length > 0) {
    const lastAns = previousAnswers[previousAnswers.length - 1];
    const namePrefix = activeUserName ? `${activeUserName}, ` : "";
    const duplicateResponse = `As we touched on earlier ${namePrefix}here is a quick recap:\n\n${lastAns.slice(0, 180)}...\n\nIs there a specific detail, pricing angle, or feature comparison you'd like me to unpack further?`;

    const updatedCtx = recordAnswerInContext(currentContext, duplicateResponse);
    const chips = generateFollowUpChips(intentType, currentContext.currentProducts, currentContext.currentTopic);
    return {
      answer: duplicateResponse,
      intent: "REPEATED_QUESTION",
      sources: [],
      suggestedFollowUps: chips,
      followUpSuggestions: chips,
      context: updatedCtx,
    };
  }

  // 5. Direct Yes/No Feature Capability Question
  if (intentType === "FEATURE_QUESTION" && featureKey && featureLabel) {
    const platformToInspect = targetPlatform || productsMentioned[0] || "Hireko";
    const answer = buildYesNoFeatureAnswer(platformToInspect, featureKey, featureLabel, query, activeUserName);
    const updatedCtx = recordAnswerInContext(currentContext, answer);
    const isHireko = platformToInspect.toLowerCase().includes("hireko");

    const productCard: ProductCardData | undefined = isHireko
      ? {
          name: "Hireko.ai",
          category: "Autonomous AI Interviewing",
          tagline: "Live Bidirectional Voice & Video Screening Engine",
          strengths: [
            "Interactive conversational AI interviews",
            "Adaptive real-time dynamic follow-ups",
            "Automated rubric-based scoring in ~2 min",
            "Transparent volume-based pricing",
          ],
          bestFor: "Recruiters and hiring managers seeking autonomous first-round screening",
          slug: "hireko",
          websiteUrl: "https://hireko.ai",
          websiteDomain: "hireko.ai",
        }
      : featureKey === "gameBasedAssessment"
      ? {
          name: "HireVue Game-Based Assessments",
          category: "Cognitive Screening & Enterprise Testing",
          tagline: "Short mobile games (<20 min) measuring cognitive traits via IO psychology",
          strengths: [
            "Rapid <20 min completion",
            "IO psychology competency mapping",
            "High-volume applicant screening",
            "Reduced candidate test anxiety",
          ],
          bestFor: "High-volume recruitment teams screening cognitive traits and learning agility",
          slug: "hirevue",
          websiteUrl: undefined,
          websiteDomain: undefined,
        }
      : undefined;

    const chips = generateFollowUpChips(intentType, [platformToInspect]);
    return {
      answer,
      intent: intentType,
      sources: [
        {
          competitor: platformToInspect,
          section: "Feature Capability",
          title: `${platformToInspect} ${featureLabel} Verification`,
        },
      ],
      productCard,
      suggestedFollowUps: chips,
      followUpSuggestions: chips,
      context: updatedCtx,
    };
  }

  // 6. Feature-Specific Comparison Across Platforms ("Which platforms have facial recognition?")
  if (intentType === "FEATURE_COMPARISON" && featureKey && featureLabel) {
    const answer = buildFeatureComparisonAcrossPlatformsAnswer(featureKey, featureLabel, activeUserName);
    const updatedCtx = recordAnswerInContext(currentContext, answer);
    const chips = generateFollowUpChips(intentType);
    return {
      answer,
      intent: intentType,
      sources: [
        {
          competitor: "Multi-Platform Benchmark",
          section: "Feature Matrix",
          title: `Cross-Platform ${featureLabel} Comparison`,
        },
      ],
      productCard: {
        name: `${featureLabel} Benchmark`,
        category: "Cross-Platform Evaluation",
        tagline: `Analysis of ${featureLabel} across 8 leading recruitment platforms`,
        strengths: ["Side-by-side feature matrix", "Verified support flags", "Clear takeaway"],
        bestFor: "Teams evaluating specific technical or biometric capabilities",
        slug: "feature-benchmark",
        websiteUrl: "https://hireko.ai",
        websiteDomain: "hireko.ai",
      },
      suggestedFollowUps: chips,
      followUpSuggestions: chips,
      context: updatedCtx,
    };
  }

  // 6b. Game-Based Assessment General / Advisory Inquiry
  if (
    featureKey === "gameBasedAssessment" ||
    /game\s*[- ]?based|gamified\s*assessment|game\s*assessment/i.test(query)
  ) {
    const answer = buildGameBasedAssessmentAnswer(query, activeUserName);
    const updatedCtx = recordAnswerInContext(currentContext, answer);
    const chips = [
      "Does HireVue have game-based assessments?",
      "Does Hireko have game-based assessments?",
      "Which platforms have game-based assessments?",
      "Compare Hireko and HireVue",
    ];
    return {
      answer,
      intent: intentType,
      sources: [
        {
          competitor: "HireVue",
          section: "Game-Based Assessments & Cognitive Screening",
          title: "HireVue Game-Based Assessments Architecture & Use Cases",
        },
      ],
      productCard: {
        name: "Game-Based Assessments & Hireko Synergy",
        category: "Cognitive Screening & Conversational AI",
        tagline: "Short mobile games (<20 min) paired with bidirectional voice/video AI interviews",
        strengths: [
          "Screening under ~20 minutes",
          "IO psychology competency mapping",
          "High-volume top-of-funnel triage",
          "Hireko live conversational interview probing",
        ],
        bestFor: "Hiring teams evaluating game-based cognitive screening and AI interview workflows",
        slug: "game-based-assessments",
        websiteUrl: "https://hireko.ai",
        websiteDomain: "hireko.ai",
      },
      suggestedFollowUps: chips,
      followUpSuggestions: chips,
      context: updatedCtx,
    };
  }

  // 7b. What should Hireko improve next? / Product Roadmap (Pattern D)
  if (intentType === "HIREKO_ROADMAP") {
    const answer = buildHirekoRoadmapAnswer(activeUserName);
    const updatedCtx = recordAnswerInContext(currentContext, answer);
    const chips = [
      "What are Hireko's best features?",
      "Compare Hireko and HireVue",
      "Which platform has the best feature?",
      "How much does Hireko cost?",
    ];
    return {
      answer,
      intent: intentType,
      sources: [
        {
          competitor: "Hireko Roadmap",
          section: "Product Improvement",
          title: "Hireko.ai Product Roadmap & Strategic Recommendations",
        },
      ],
      productCard: {
        name: "Hireko Product Roadmap",
        category: "Product Strategy",
        tagline: "Prioritized improvements based on 14-platform competitive review",
        strengths: [
          "Evidence-backed AI Interview Reports",
          "Structured rubrics & candidate comparison",
          "Recruiter decision support",
        ],
        bestFor: "Product and engineering teams prioritizing Hireko roadmap",
        slug: "hireko-roadmap",
        websiteUrl: "https://hireko.ai",
        websiteDomain: "hireko.ai",
      },
      suggestedFollowUps: chips,
      followUpSuggestions: chips,
      context: updatedCtx,
    };
  }

  // 7c. Which platform has the best feature? / Best feature by use case (Pattern A)
  if (intentType === "BEST_FEATURE_BY_USE_CASE") {
    const answer = buildBestFeatureByUseCaseAnswer(activeUserName);
    const updatedCtx = recordAnswerInContext(currentContext, answer);
    const chips = [
      "What should Hireko improve next?",
      "Compare Hireko and HireVue",
      "Which platforms support live video?",
      "How much does Hireko cost?",
    ];
    return {
      answer,
      intent: intentType,
      sources: [
        {
          competitor: "All Evaluated Platforms",
          section: "Feature Benchmarks",
          title: "Best-in-Class Feature Benchmarks by Hiring Use Case",
        },
      ],
      productCard: {
        name: "Feature Benchmark Matrix",
        category: "Competitive Analysis",
        tagline: "8 hiring use-case benchmarks across 14 recruiting platforms",
        strengths: ["Enterprise video", "Live technical coding", "Interview intelligence", "ATS workflows"],
        bestFor: "Recruiters and hiring leaders selecting best-of-breed tools",
        slug: "best-feature-matrix",
        websiteUrl: "https://hireko.ai",
        websiteDomain: "hireko.ai",
      },
      suggestedFollowUps: chips,
      followUpSuggestions: chips,
      context: updatedCtx,
    };
  }

  // 7. Hireko Best Features / Competitive Advantage
  if (intentType === "HIREKO_BEST_FEATURES") {
    const answer = buildHirekoBestFeaturesAnswer(activeUserName);
    const updatedCtx = recordAnswerInContext(currentContext, answer);
    const chips = generateFollowUpChips(intentType, ["Hireko"]);
    return {
      answer,
      intent: intentType,
      sources: [
        {
          competitor: "Hireko",
          section: "Competitive Strengths",
          title: "Hireko Core Advantages & Differentiators",
        },
      ],
      productCard: {
        name: "Hireko.ai",
        category: "Autonomous AI Interviewing",
        tagline: "Live Bidirectional Voice & Video Screening Engine",
        strengths: [
          "Interactive conversational AI interviews",
          "Adaptive real-time dynamic follow-ups",
          "Automated rubric-based scoring in ~2 min",
          "Transparent volume-based pricing",
        ],
        bestFor: "Recruiters and hiring managers seeking autonomous first-round screening",
        slug: "hireko",
        websiteUrl: "https://hireko.ai",
        websiteDomain: "hireko.ai",
      },
      suggestedFollowUps: chips,
      followUpSuggestions: chips,
      context: updatedCtx,
    };
  }

  // 8. Pricing Questions (Single Platform, Cross-Platform, or Multi-Platform)
  if (intentType === "PRICING_COMPARISON") {
    const userAskedHireko = query.toLowerCase().includes("hireko");
    const answer = buildPricingQuestionsAnswer(productsMentioned, userAskedHireko, activeUserName);
    const updatedCtx = recordAnswerInContext(currentContext, answer);
    const chips = generateFollowUpChips(intentType, productsMentioned, "pricing");
    return {
      answer,
      intent: intentType,
      sources: [
        {
          competitor: productsMentioned.length > 0 ? productsMentioned.join(", ") : "All Platforms",
          section: "Pricing & Contract Models",
          title: "Platform Pricing & TCO Benchmark",
        },
      ],
      productCard: {
        name: userAskedHireko ? "Hireko Pricing Matrix" : "AI Pricing Matrix",
        category: "Pricing & TCO Intelligence",
        tagline: "Transparent Volume SaaS vs Legacy Enterprise Minimums",
        strengths: [
          "Pay-as-you-grow screening volume",
          "Zero multi-year lock-in or integration retainers",
          "Saves $15K–$25K in legacy vendor overhead",
        ],
        bestFor: "Recruiters looking for maximum ROI and flexible SaaS commitments",
        slug: "pricing-matrix",
        websiteUrl: userAskedHireko ? "https://hireko.ai" : undefined,
        websiteDomain: userAskedHireko ? "hireko.ai" : undefined,
      },
      suggestedFollowUps: chips,
      followUpSuggestions: chips,
      context: updatedCtx,
    };
  }

  // 9. Competitor Comparison (Unified Path: Side-by-side Table + 2-4 Sentence Conclusion)
  if (intentType === "PRODUCT_COMPARISON") {
    const answer = buildUnifiedComparisonAnswer(productsMentioned, query, activeUserName);
    const updatedCtx = recordAnswerInContext(currentContext, answer);
    const hasHireko =
      query.toLowerCase().includes("hireko") ||
      productsMentioned.some((p) => p.toLowerCase().includes("hireko"));

    const chips = generateFollowUpChips(intentType, productsMentioned);
    return {
      answer,
      intent: intentType,
      sources: productsMentioned.map((p) => ({
        competitor: p,
        section: "Platform Evaluation",
        title: `${p} Feature Benchmark`,
      })),
      productCard: {
        name: productsMentioned.slice(0, 3).join(" vs "),
        category: "Side-by-Side Comparison Matrix",
        tagline: `Side-by-side benchmark of ${productsMentioned.length} platforms`,
        strengths: productsMentioned.map((p) => `Evaluated: ${p}`),
        bestFor: "Talent acquisition leaders evaluating hiring software",
        slug: "competitor-comparison",
        websiteUrl: hasHireko ? "https://hireko.ai" : undefined,
        websiteDomain: hasHireko ? "hireko.ai" : undefined,
      },
      suggestedFollowUps: chips,
      followUpSuggestions: chips,
      context: updatedCtx,
    };
  }

  // 10. Recommendation Questions
  if (intentType === "RECOMMENDATION") {
    const answer = buildRecommendationAnswer(productsMentioned, featureKey, featureLabel, activeUserName);
    const updatedCtx = recordAnswerInContext(currentContext, answer);
    const hasHireko =
      query.toLowerCase().includes("hireko") ||
      productsMentioned.some((p) => p.toLowerCase().includes("hireko"));

    const chips = generateFollowUpChips(intentType, productsMentioned);
    return {
      answer,
      intent: intentType,
      sources: [
        {
          competitor: "Platform Selection Guide",
          section: "Decision Criteria",
          title: "Hiring Platform Selection Framework",
        },
      ],
      productCard: {
        name: "Platform Recommendation Guide",
        category: "Software Selection",
        tagline: "Tailored recommendation based on hiring volume and role type",
        strengths: ["Decision criteria matrix", "Use-case mapping", "Unbiased recommendations"],
        bestFor: "Hiring managers deciding on recruitment software",
        slug: "recommendation-guide",
        websiteUrl: hasHireko ? "https://hireko.ai" : undefined,
        websiteDomain: hasHireko ? "hireko.ai" : undefined,
      },
      suggestedFollowUps: chips,
      followUpSuggestions: chips,
      context: updatedCtx,
    };
  }

  // 11. Competitor Directory Listing
  if (intentType === "COMPETITOR_LIST") {
    const answer = buildCompetitorListAnswer(activeUserName);
    const updatedCtx = recordAnswerInContext(currentContext, answer);
    const chips = generateFollowUpChips(intentType);
    return {
      answer,
      intent: intentType,
      sources: [
        {
          competitor: "All 16 Competitors",
          section: "Directory",
          title: "Complete Evaluated Platform Matrix",
        },
      ],
      productCard: {
        name: "16 Tracked Competitors",
        category: "Hiring Technology Directory",
        tagline: "Comprehensive directory of 16 evaluated platforms across 5 categories",
        strengths: ["16 platform profiles", "5 market categories", "Official links"],
        bestFor: "Recruiters and talent leaders evaluating modern hiring software",
        slug: "all-competitors",
        websiteUrl: "https://hireko.ai",
        websiteDomain: "hireko.ai",
      },
      suggestedFollowUps: chips,
      followUpSuggestions: chips,
      context: updatedCtx,
    };
  }

  // 12. Pure Hireko Inquiry (Non-comparative)
  if (intentType === "HIREKO_SPECIFIC") {
    const answer = buildHirekoSpecificDirectAnswer(query, activeUserName);
    const updatedCtx = recordAnswerInContext(currentContext, answer);
    const chips = generateFollowUpChips(intentType, ["Hireko"]);
    return {
      answer,
      intent: intentType,
      sources: [
        {
          competitor: "Hireko",
          section: "Platform Overview",
          title: "Hireko Autonomous AI Interviewing Architecture",
        },
      ],
      productCard: {
        name: "Hireko.ai",
        category: "Autonomous AI Interviewing",
        tagline: "Live Bidirectional Voice & Video Screening Engine",
        strengths: [
          "Interactive conversational AI interviews",
          "Adaptive real-time dynamic follow-ups",
          "Automated rubric-based scoring in ~2 min",
          "Transparent volume-based pricing",
        ],
        bestFor: "Recruiters and hiring managers seeking autonomous first-round screening",
        slug: "hireko",
        websiteUrl: "https://hireko.ai",
        websiteDomain: "hireko.ai",
      },
      suggestedFollowUps: chips,
      followUpSuggestions: chips,
      context: updatedCtx,
    };
  }

  // 13. Competitor-Specific Question (Non-comparative)
  if (intentType === "COMPETITOR_SPECIFIC") {
    const compName = targetPlatform || productsMentioned[0] || "HireVue";
    const answer = buildCompetitorSpecificDirectAnswer(compName, query, activeUserName);
    const updatedCtx = recordAnswerInContext(currentContext, answer);
    const profile = getPlatformProfile(compName);
    const chips = generateFollowUpChips(intentType, [compName]);
    return {
      answer,
      intent: intentType,
      sources: [
        {
          competitor: compName,
          section: "Platform Profile",
          title: `${compName} Overview & Capabilities`,
        },
      ],
      productCard: {
        name: profile.name,
        category: profile.category,
        tagline: profile.superpower,
        strengths: [profile.bestFor],
        bestFor: profile.bestFor,
        slug: profile.slug,
        websiteUrl: undefined,
        websiteDomain: undefined,
      },
      suggestedFollowUps: chips,
      followUpSuggestions: chips,
      context: updatedCtx,
    };
  }

  // 14. General Recruitment QA (STAR, KPIs, Chunk Size, etc.)
  const chunks = retrieveTopChunks(query, 5);
  let generalAnswer = await callLLMIfAvailable(query, chunks, history, activeUserName);
  if (!generalAnswer) {
    generalAnswer = buildGeneralChatGPTAnswer(query, activeUserName);
  }

  const updatedCtx = recordAnswerInContext(currentContext, generalAnswer);
  const userAskedHireko = query.toLowerCase().includes("hireko");
  const chips = generateFollowUpChips("GENERAL_QA");

  return {
    answer: generalAnswer,
    intent: intentType,
    sources: [
      {
        competitor: userAskedHireko ? "Hireko" : "Interview Advisory",
        section: "Knowledge & Best Practices",
        title: "AI Recruitment & Interview Advisory Knowledge Base",
      },
    ],
    productCard: userAskedHireko
      ? {
          name: "Hireko.ai",
          category: "Autonomous AI Interviewing",
          tagline: "Live Bidirectional Voice & Video Screening Engine",
          strengths: [
            "Interactive conversational AI interviews",
            "Adaptive real-time dynamic follow-ups",
            "Automated rubric-based scoring in ~2 min",
          ],
          bestFor: "Recruiting teams seeking autonomous first-round screening",
          slug: "hireko",
          websiteUrl: "https://hireko.ai",
          websiteDomain: "hireko.ai",
        }
      : undefined,
    suggestedFollowUps: chips,
    followUpSuggestions: chips,
    context: updatedCtx,
  };
}
