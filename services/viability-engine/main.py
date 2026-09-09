from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import asyncio
import random
import json
import os
import httpx

# ── Gemini AI ──
_gemini_available = False
_gemini_model = None
try:
    import google.generativeai as genai
    _gemini_api_key = os.environ.get("GEMINI_API_KEY")
    if _gemini_api_key:
        genai.configure(api_key=_gemini_api_key)
        _gemini_model = genai.GenerativeModel("gemini-1.5-flash")
        _gemini_available = True
except ImportError:
    _gemini_available = False

# Open AI — real integration with fallback
_openai_available = False
_openai_client = None
try:
    from openai import OpenAI
    _api_key = os.environ.get("OPENAI_API_KEY")
    if _api_key:
        _openai_client = OpenAI(api_key=_api_key)
        _openai_available = True
except ImportError:
    _openai_available = False

# ── Live market research (Tavily) — optional grounding layer ──
# Without this, Gemini invents competitor names and growth numbers from
# training data. With it, the structuring agent below is told to prefer
# these snippets over its own guesses. Get a key at tavily.com (free tier
# is enough to start) and set TAVILY_API_KEY. The app degrades gracefully
# to ungrounded mode if it's not set.
_TAVILY_API_KEY = os.environ.get("TAVILY_API_KEY")
_TAVILY_AVAILABLE = bool(_TAVILY_API_KEY)

app = FastAPI(title="Viability Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

PIPELINE_STEPS = [
    "Pulling live market signals...",
    "Cross-referencing competitors...",
    "Scoring market trends...",
    "Calculating TAM / SAM / SOM...",
    "Evaluating regulatory friction...",
    "Running adversarial risk review...",
    "Reconciling scoring model...",
    "Generating viability report...",
]


class ValidationInput(BaseModel):
    industry: str
    target_audience: str
    core_offering: str


class RiskInput(BaseModel):
    viability_score: int
    monthly_burn_rate: int
    industry: str = ""
    target_audience: str = ""
    core_offering: str = ""


# ─────────────────────────────────────────────────────────────────────────
# Helpers shared by the pipeline
# ─────────────────────────────────────────────────────────────────────────

def _extract_json(text: str) -> dict:
    """Gemini sometimes wraps JSON in markdown fences despite instructions not to."""
    text = text.strip()
    if text.startswith("```"):
        text = text.split("\n", 1)[1] if "\n" in text else text[3:]
    if text.endswith("```"):
        text = text.rsplit("```", 1)[0]
    return json.loads(text.strip())


def _fallback_market_analysis(industry: str, audience: str, offering: str, burn: int = 0) -> dict:
    """Used only when Gemini is unavailable or errors out — same shape as the
    real structuring agent's output so downstream code never has to branch."""
    return {
        "swot": {
            "strengths": [
                f"First-mover advantage in {industry}",
                f"Targeted solution for {audience}",
                f"Lean operational model with ${burn}/mo burn" if burn else f"Focused offering: {offering}",
            ],
            "weaknesses": [
                "Limited brand recognition in early stages",
                "Untested customer acquisition channels",
                "Dependency on initial funding runway",
            ],
            "opportunities": [
                f"{industry} market expanding rapidly",
                f"Adjacent segments within {audience}",
                "Potential for strategic partnerships",
            ],
            "threats": [
                "Established competitors with deeper pockets",
                "Market saturation risk in core vertical",
                "Regulatory changes affecting operations",
            ],
        },
        "market_growth": [
            {"year": "2024", "value": round(100 + random.uniform(-10, 30), 1)},
            {"year": "2025", "value": round(140 + random.uniform(-10, 30), 1)},
            {"year": "2026", "value": round(200 + random.uniform(-20, 40), 1)},
            {"year": "2027", "value": round(290 + random.uniform(-20, 40), 1)},
            {"year": "2028", "value": round(410 + random.uniform(-30, 50), 1)},
        ],
        "competitors": [
            {"name": "Market Leader", "x": random.randint(30, 45), "y": random.randint(30, 50)},
            {"name": "Innovator A", "x": random.randint(10, 25), "y": random.randint(60, 85)},
            {"name": "Fast Follower", "x": random.randint(15, 30), "y": random.randint(40, 60)},
            {"name": "Niche Player", "x": random.randint(3, 10), "y": random.randint(50, 70)},
            {"name": "Legacy Incumbent", "x": random.randint(20, 35), "y": random.randint(10, 30)},
        ],
        "strategy": (
            f"Focus on {audience} with a differentiated {offering} that addresses "
            f"specific pain points in {industry}. Maintain controlled burn while "
            "validating product-market fit, then scale once unit economics are proven."
        ),
        "confidence": "low",
    }


# ─────────────────────────────────────────────────────────────────────────
# Agent 1 — live research (grounding)
# ─────────────────────────────────────────────────────────────────────────

async def fetch_market_research(industry: str, offering: str) -> list[str]:
    """Pulls real competitor/market snippets so Agent 2 has something true to
    structure, instead of hallucinating plausible-sounding numbers."""
    if not _TAVILY_AVAILABLE:
        return []

    queries = [
        f"{industry} {offering} competitors 2026",
        f"{industry} market size growth forecast 2026",
    ]

    async def _run_query(client: httpx.AsyncClient, q: str) -> list[str]:
        try:
            resp = await client.post(
                "https://api.tavily.com/search",
                json={
                    "api_key": _TAVILY_API_KEY,
                    "query": q,
                    "max_results": 4,
                    "search_depth": "basic",
                },
            )
            data = resp.json()
            return [
                f"- {r.get('title', '')}: {r.get('content', '')[:280]}"
                for r in data.get("results", [])[:4]
            ]
        except Exception:
            return []

    async with httpx.AsyncClient(timeout=10) as client:
        results = await asyncio.gather(*(_run_query(client, q) for q in queries))

    return [snippet for group in results for snippet in group]


# ─────────────────────────────────────────────────────────────────────────
# Agent 2 — structuring (grounded in Agent 1's research when available)
# ─────────────────────────────────────────────────────────────────────────

async def run_structuring_agent(
    industry: str, audience: str, offering: str, research_snippets: list[str]
) -> dict:
    if not _gemini_available:
        return _fallback_market_analysis(industry, audience, offering)

    research_block = (
        "\n".join(research_snippets)
        if research_snippets
        else "No live research data was available for this query. Rely on general "
        "market knowledge, mark \"confidence\": \"low\", and avoid inventing precise figures."
    )

    prompt = (
        "You are a senior market analyst at a top VC firm. Analyze this startup using "
        "the RESEARCH SNIPPETS below as your primary source of truth — prefer them over "
        "your own training data, since they reflect the current market. If the snippets "
        "don't cover a field, say so via the confidence field rather than inventing "
        "specific numbers you can't support.\n\n"
        f"RESEARCH SNIPPETS:\n{research_block}\n\n"
        f"STARTUP:\n- Industry: {industry}\n- Target Audience: {audience}\n"
        f"- Core Offering: {offering}\n\n"
        "Return ONLY a valid JSON object with NO markdown, NO code fences, NO extra text. "
        "The JSON must have exactly these fields:\n"
        '- "swot": {"strengths": [strings], "weaknesses": [strings], "opportunities": [strings], "threats": [strings]} — 3-4 items each\n'
        '- "market_growth": [{"year": string, "value": number}] — exactly 5 data points showing projected TAM growth across years\n'
        '- "competitors": [{"name": string, "x": number (market share 0-100), "y": number (innovation index 0-100)}] — exactly 5 competitors\n'
        '- "strategy": "2-3 sentence strategic recommendation"\n'
        '- "confidence": "high"|"medium"|"low" — how well the research snippets supported this analysis\n\n'
        "Ensure the JSON is parseable by json.loads() with no trailing commas."
    )

    try:
        resp = await asyncio.to_thread(_gemini_model.generate_content, prompt)
        return _extract_json(resp.text)
    except Exception:
        return _fallback_market_analysis(industry, audience, offering)


# ─────────────────────────────────────────────────────────────────────────
# Agent 3 — critique / pre-mortem (red team pass)
# ─────────────────────────────────────────────────────────────────────────

async def run_critique_agent(industry: str, audience: str, offering: str, structured: dict) -> dict:
    if not _gemini_available:
        return {
            "risks": [
                "Untested acquisition channels could push CAC beyond available runway.",
                "Demand is assumed from the target audience, not yet confirmed.",
                "Differentiation against better-funded incumbents is unclear.",
            ],
            "severity": 50,
        }

    prompt = (
        "You are a skeptical VC partner running a pre-mortem on this startup. Identify "
        "the 3 STRONGEST, MOST SPECIFIC reasons it could fail — grounded in the actual "
        "industry, audience, and offering below, not generic risks like 'competition "
        "exists' or 'execution risk'. Also return a severity score from 0-100, where "
        "100 means extremely likely to fail.\n\n"
        f"STARTUP:\n- Industry: {industry}\n- Target Audience: {audience}\n"
        f"- Core Offering: {offering}\n\n"
        f"ANALYST'S REPORT:\n{json.dumps(structured)}\n\n"
        "Return ONLY valid JSON with NO markdown, in exactly this shape:\n"
        '{"risks": [string, string, string], "severity": number}'
    )

    try:
        resp = await asyncio.to_thread(_gemini_model.generate_content, prompt)
        return _extract_json(resp.text)
    except Exception:
        return {
            "risks": ["Critique agent was unavailable for this run — treat the score as provisional."],
            "severity": 50,
        }


# ─────────────────────────────────────────────────────────────────────────
# Scoring — deterministic on purpose (not LLM output), so it's explainable,
# reproducible, and cheap to recompute later for a "what changes my score"
# slider without another API call.
# ─────────────────────────────────────────────────────────────────────────

def compute_viability_score(structured: dict, critique: dict) -> int:
    growth = structured.get("market_growth", [])
    growth_score = 50.0
    if len(growth) >= 2:
        try:
            first = float(growth[0]["value"])
            last = float(growth[-1]["value"])
            growth_score = max(0.0, min(100.0, 50 + (last - first) / max(first, 1) * 50))
        except Exception:
            pass

    competitors = structured.get("competitors", [])
    competition_score = 60.0
    if competitors:
        try:
            avg_share = sum(float(c.get("x", 20)) for c in competitors) / len(competitors)
            competition_score = max(0.0, min(100.0, 100 - avg_share))
        except Exception:
            pass

    swot = structured.get("swot", {})
    differentiation_score = min(
        100.0,
        len(swot.get("strengths", [])) * 15 + len(swot.get("opportunities", [])) * 10,
    )

    severity = critique.get("severity", 50)
    try:
        severity = float(severity)
    except Exception:
        severity = 50.0

    raw = (
        growth_score * 0.30
        + competition_score * 0.25
        + differentiation_score * 0.25
        + (100 - severity) * 0.20
    )
    return int(max(1, min(99, round(raw))))


async def _run_pipeline(body: ValidationInput) -> dict:
    research = await fetch_market_research(body.industry, body.core_offering)
    structured = await run_structuring_agent(
        body.industry, body.target_audience, body.core_offering, research
    )
    critique = await run_critique_agent(
        body.industry, body.target_audience, body.core_offering, structured
    )
    score = compute_viability_score(structured, critique)

    insights = []
    if structured.get("strategy"):
        insights.append(structured["strategy"])
    insights.extend(critique.get("risks", [])[:2])

    return {
        "viability_score": score,
        "market_insights": insights[:3],
        "market_analysis": structured,
        "risks": critique.get("risks", []),
        "research_grounded": bool(research),
    }


@app.post("/validate")
async def validate(body: ValidationInput):
    async def event_stream():
        pipeline_task = asyncio.create_task(_run_pipeline(body))

        step_i = 0
        step_size = 100 // len(PIPELINE_STEPS)

        # Walk through the real step labels once while the pipeline runs.
        while not pipeline_task.done() and step_i < len(PIPELINE_STEPS):
            step = PIPELINE_STEPS[step_i]
            percent = min(step_i * step_size, 95)
            yield f"data: {json.dumps({'type': 'progress', 'step': step, 'percent': percent})}\n\n"
            step_i += 1
            await asyncio.sleep(0.5 + random.random() * 0.3)

        # If the real work (esp. live search + two Gemini calls) takes longer
        # than the step list, keep cycling the last labels at 95% rather than
        # going silent — this is the "perceived performance" behavior, now
        # covering genuinely variable AI latency instead of a fixed sleep.
        while not pipeline_task.done():
            step = PIPELINE_STEPS[-1]
            yield f"data: {json.dumps({'type': 'progress', 'step': step, 'percent': 95})}\n\n"
            await asyncio.sleep(0.6)

        result = await pipeline_task
        yield f"data: {json.dumps({'type': 'result', **result})}\n\n"

    return StreamingResponse(event_stream(), media_type="text/event-stream")


@app.post("/analyze-risk")
async def analyze_risk(body: RiskInput):
    score = body.viability_score
    burn = body.monthly_burn_rate

    # ── Rule-based severity ──
    if score < 50 and burn > 1000:
        advice = "High risk, low validation."
        severity = "critical"
    elif score < 50 and burn <= 1000:
        advice = "Low validation, but burn is controlled."
        severity = "warning"
    elif score >= 70 and burn > 1000:
        advice = "Strong validation, watch high burn."
        severity = "scaling_risk"
    elif score >= 70 and burn <= 1000:
        advice = "Optimal Setup: High viability, sustainable burn."
        severity = "optimal"
    else:
        advice = "Moderate Risk: Continue validating."
        severity = "moderate"

    # ── OpenAI: short, distinct second-opinion voice on the burn/score combo ──
    # (Kept deliberately separate from the /validate pipeline's Gemini calls —
    # this is a fast, cheap gut-check specifically about runway vs. score, not
    # a re-run of the market analysis, which /validate already produced.)
    strategic_advice: str | None = None
    if _openai_available and body.industry and body.target_audience and body.core_offering:
        try:
            openai_prompt = (
                "You are a Y Combinator partner evaluating a startup. Given:\n"
                f"- Industry: {body.industry}\n"
                f"- Target Audience: {body.target_audience}\n"
                f"- Core Offering: {body.core_offering}\n"
                f"- Viability Score: {score}/100\n"
                f"- Monthly Burn Rate: ${burn}\n\n"
                "Provide a concise 2-sentence strategic pivot recommendation "
                "or validation of the idea, specifically about the runway/score "
                "tradeoff. Be direct and actionable — like a real YC partner."
            )
            resp = _openai_client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": openai_prompt}],
                max_tokens=200,
                temperature=0.7,
            )
            strategic_advice = resp.choices[0].message.content.strip()
        except Exception:
            pass

    return {
        "advice": advice,
        "severity": severity,
        "strategic_advice": strategic_advice,
    }
