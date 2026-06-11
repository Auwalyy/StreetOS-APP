from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, List
from app.services.langchain_service import get_advisor_response, get_daily_briefing

router = APIRouter()


class ChatRequest(BaseModel):
    userId: str
    message: str
    language: str = "en"
    recent_revenue: Optional[float] = 0
    low_stock_items: Optional[List[str]] = []
    overdue_debts: Optional[List[str]] = []


class BriefingRequest(BaseModel):
    userId: str
    language: str = "en"
    yesterday_revenue: Optional[float] = 0
    low_stock_items: Optional[List[str]] = []
    overdue_debts: Optional[List[str]] = []


@router.post("/chat")
async def chat(req: ChatRequest):
    context = {
        "recent_revenue": req.recent_revenue,
        "low_stock_items": req.low_stock_items,
        "overdue_debts": req.overdue_debts,
    }
    response = await get_advisor_response(req.userId, req.message, req.language, context)
    return {"response": response, "language": req.language}


@router.post("/briefing")
async def briefing(req: BriefingRequest):
    context = {
        "yesterday_revenue": req.yesterday_revenue,
        "low_stock_items": req.low_stock_items,
        "overdue_debts": req.overdue_debts,
    }
    response = await get_daily_briefing(req.userId, req.language, context)
    return {"briefing": response, "language": req.language}
