from typing import List, Optional
import structlog

logger = structlog.get_logger()


def detect_fraud(transaction: dict, recent_transactions: List[dict]) -> Optional[dict]:
    """Run rule-based fraud detection on a transaction."""
    alerts = []

    # Rule 1: Rapid transactions > 10 in 5 minutes
    if len(recent_transactions) > 10:
        alerts.append({
            "alert_type": "rapid_transactions",
            "severity": "high",
            "description": f"{len(recent_transactions)} transactions recorded in 5 minutes",
        })

    # Rule 2: Amount is 5x the user's average
    if recent_transactions:
        avg = sum(t["amount"] for t in recent_transactions) / len(recent_transactions)
        if avg > 0 and transaction["amount"] > avg * 5:
            alerts.append({
                "alert_type": "unusual_amount",
                "severity": "medium",
                "description": f"Amount ₦{transaction['amount']:,} is {transaction['amount']/avg:.1f}x the average ₦{avg:,.0f}",
            })

    # Rule 3: Negative or zero inventory after sale
    if transaction.get("type") == "sale" and transaction.get("resulting_stock") is not None:
        if transaction["resulting_stock"] < 0:
            alerts.append({
                "alert_type": "inventory_mismatch",
                "severity": "medium",
                "description": "Sale recorded would result in negative inventory",
            })

    return alerts[0] if alerts else None
