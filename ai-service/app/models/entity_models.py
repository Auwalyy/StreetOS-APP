from pydantic import BaseModel
from typing import Optional


class TransactionExtraction(BaseModel):
    transaction_type: str  # sale | purchase | expense | income
    product_name: Optional[str] = None
    quantity: Optional[float] = None
    unit_price: Optional[float] = None
    total_amount: float
    customer_name: Optional[str] = None
    payment_method: str = "cash"
    confidence: float
    transcript: str
    language: str


class DebtExtraction(BaseModel):
    customer_name: str
    amount: float
    product_name: Optional[str] = None
    due_date_text: str
    due_date_iso: Optional[str] = None
    confidence: float
