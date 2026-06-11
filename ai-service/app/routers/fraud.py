from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional
from app.services.fraud_service import detect_fraud

router = APIRouter()


class FraudCheckRequest(BaseModel):
    userId: str
    transaction: dict
    recent_transactions: List[dict] = []


@router.post("/check")
async def check_fraud(req: FraudCheckRequest):
    alert = detect_fraud(req.transaction, req.recent_transactions)
    return {
        "fraud_detected": alert is not None,
        "alert": alert,
    }
