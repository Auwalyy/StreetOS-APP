from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
import json
import google.generativeai as genai
from app.config import settings
from app.prompts.prompts import MARKET_ANALYSIS_PROMPT

router = APIRouter()

genai.configure(api_key=settings.gemini_api_key)


class MarketRequest(BaseModel):
    region: str = "Lagos"
    productCategory: Optional[str] = None
    market_data: Optional[str] = None


@router.post("/intelligence")
async def market_intelligence(req: MarketRequest):
    if not req.market_data:
        return {
            "trend_summary": f"Market data for {req.region} is being collected.",
            "recommendation": "Keep recording transactions to unlock market insights.",
            "risk_alert": None,
        }

    prompt = MARKET_ANALYSIS_PROMPT.format(
        region=req.region,
        market_data=req.market_data,
    )

    model = genai.GenerativeModel(
        model_name=settings.gemini_model,
        generation_config=genai.GenerationConfig(
            response_mime_type="application/json",
            temperature=0.3,
        ),
    )
    response = model.generate_content(prompt)
    return json.loads(response.text)
