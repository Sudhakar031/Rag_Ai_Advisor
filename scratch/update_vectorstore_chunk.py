import json

with open("data/vectorStore.json", "r", encoding="utf-8") as f:
    chunks = json.load(f)

# Check if already present
new_id = "hirevue-game-based-assessments"
chunks = [c for c in chunks if c.get("id") != new_id]

new_chunk = {
    "id": new_id,
    "slug": "hirevue-vs-hireko",
    "competitor": "HireVue",
    "section": "Game-Based Assessments & Cognitive Screening",
    "title": "HireVue Game-Based Assessments Architecture & Use Cases",
    "content": "Game-based assessments are pre-hire assessments delivered as short, mobile-friendly games that measure job-relevant skills and traits in a fast, engaging way, instead of relying only on resumes or long tests.\n\nHere’s how HireVue’s game-based assessments typically work:\n- Candidates 'play' a series of short games (often a few minutes each). The overall experience is designed to be completed quickly, usually under ~20 minutes depending on the set of games used.\n- The games are built to measure work-relevant competencies (for example: cognitive skills, problem-solving, attention, learning agility, and other role-aligned attributes).\n- Recruiters get results mapped to predefined, job-relevant criteria, so you can compare candidates consistently and decide who advances. HireVue supports aligning games to role competencies with guidance from IO psychology expertise.\n\nWhy teams use them (especially in high-volume roles):\n- Speed at scale: a single job post can generate hundreds or thousands of applicants, and game-based assessments help narrow the pool earlier without endless resume review.\n- Candidate experience: they’re designed to be more engaging than traditional testing and can reduce test anxiety for some candidates.\n- More evidence-based screening: you’re measuring skills and potential, not just past titles.\n\nSynergy & Recommendation for Hireko: Pairing Hireko's live bidirectional conversational voice/video interviewing and dynamic follow-up probing with game-based cognitive assessments provides hiring teams with an optimal end-to-end recruitment funnel: rapid gamified pre-screening followed by conversational depth.",
    "keywords": [
        "hirevue",
        "game",
        "based",
        "assessments",
        "game-based",
        "gamified",
        "cognitive",
        "problem",
        "solving",
        "learning",
        "agility",
        "attention",
        "io",
        "psychology",
        "high",
        "volume",
        "screening",
        "mobile",
        "hireko"
    ]
}

chunks.append(new_chunk)

with open("data/vectorStore.json", "w", encoding="utf-8") as f:
    json.dump(chunks, f, indent=2, ensure_ascii=False)

print(f"Updated data/vectorStore.json! Total chunks: {len(chunks)}")
