from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import voice, nlp, advisor, scoring, fraud, market
import structlog

logger = structlog.get_logger()

app = FastAPI(
    title="StreetOS AI Service",
    description="Voice processing, NLP, scoring, and advisory AI for StreetOS — powered by Gemini",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(voice.router, prefix="/voice", tags=["Voice"])
app.include_router(nlp.router, prefix="/nlp", tags=["NLP"])
app.include_router(advisor.router, prefix="/advisor", tags=["Advisor"])
app.include_router(scoring.router, prefix="/scoring", tags=["Scoring"])
app.include_router(fraud.router, prefix="/fraud", tags=["Fraud"])
app.include_router(market.router, prefix="/market", tags=["Market"])


@app.get("/health")
async def health():
    return {"status": "ok", "service": "streetos-ai", "ai_provider": "gemini"}
