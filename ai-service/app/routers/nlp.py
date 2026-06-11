from fastapi import APIRouter
from pydantic import BaseModel
from app.services.nlp_service import extract_transaction, extract_debt

router = APIRouter()


class TextRequest(BaseModel):
    text: str
    language: str = "en"


@router.post("/extract-transaction")
async def extract_tx(req: TextRequest):
    result = await extract_transaction(req.text, req.language)
    return result.model_dump()


@router.post("/extract-debt")
async def extract_dt(req: TextRequest):
    result = await extract_debt(req.text, req.language)
    return result.model_dump()
