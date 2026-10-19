from typing import List, Optional, Literal
from pydantic import BaseModel, Field

IntentType = Literal[
    "CASUAL_GREETING",
    "NAME_INTRO",
    "CASUAL_THANKS",
    "CASUAL_CONFIRMATION",
    "CASUAL_GOODBYE",
    "PRODUCT_COMPARISON",
    "PRICING_COMPARISON",
    "FEATURE_QUESTION",
    "FEATURE_COMPARISON",
    "HIREKO_BEST_FEATURES",
    "HIREKO_ROADMAP",
    "BEST_FEATURE_BY_USE_CASE",
    "HIREKO_SPECIFIC",
    "COMPETITOR_SPECIFIC",
    "RECOMMENDATION",
    "GENERAL_QA",
    "UNRELATED_QUESTION",
    "REPEATED_QUESTION",
    "COMPETITOR_LIST",
    "PRODUCT_RESEARCH",
    "COMPETITOR_STRENGTHS",
    "COMPETITOR_BEST_FEATURE",
    "ALL_COMPETITORS_BEST_FEATURES",
    "COMPETITOR_OVERVIEW",
    "FEATURE_CHECK",
    "FEATURE_EXPLORATION",
    "MARKET_RESEARCH",
    "HIREKO_DIFFERENTIATORS",
    "WEAKNESS_INQUIRY",
    "HIREKO_GENERAL",
    "COMPETITIVE_INTELLIGENCE",
    "FOLLOW_UP",
    "PLATFORM_PRICING",
    "UNRECOGNIZED",
    "UNKNOWN",
]


class ChatMessage(BaseModel):
    role: Literal["user", "assistant", "system"]
    content: str


class SourceCitation(BaseModel):
    competitor: str
    section: str
    title: str


class ProductCardData(BaseModel):
    name: str
    category: str
    tagline: str
    strengths: List[str] = Field(default_factory=list)
    bestFor: str
    slug: str
    websiteUrl: Optional[str] = None
    websiteDomain: Optional[str] = None


class ChatRequest(BaseModel):
    query: str
    history: List[ChatMessage] = Field(default_factory=list)
    userName: Optional[str] = None


class ChatResponse(BaseModel):
    answer: str
    intent: IntentType
    confidence: float = 1.0
    productsMentioned: List[str] = Field(default_factory=list)
    sources: List[SourceCitation] = Field(default_factory=list)
    productCard: Optional[ProductCardData] = None
    followUpSuggestions: List[str] = Field(default_factory=list)
    userName: Optional[str] = None


class PlatformSummary(BaseModel):
    id: str
    name: str
    category: str
    whatItDoes: str
    mainStrength: str
    bestFor: str
    pricingModel: str
    websiteUrl: Optional[str] = None
    websiteDomain: Optional[str] = None
