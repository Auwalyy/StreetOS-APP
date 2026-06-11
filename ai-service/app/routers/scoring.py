from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from app.services.scoring_service import compute_credit_score, compute_health_score

router = APIRouter()


class CreditScoreRequest(BaseModel):
    userId: str
    active_trading_days: int = 0
    days_since_registration: int = 1
    average_monthly_revenue: float = 0
    debt_repayment_rate: float = 0.5
    kyc_status: str = "none"


class HealthScoreRequest(BaseModel):
    userId: str
    active_days_30: int = 0
    inventory_management_score: float = 70.0
    debt_collection_rate: float = 0.5
    customer_retention_rate: float = 0.6
    revenue_30d: float = 0
    revenue_prev_30d: float = 0


@router.post("/credit")
async def credit_score(req: CreditScoreRequest):
    result = compute_credit_score(req.model_dump())
    return {**result, "userId": req.userId}


@router.post("/health")
async def health_score(req: HealthScoreRequest):
    result = compute_health_score(req.model_dump())
    return {**result, "userId": req.userId}
