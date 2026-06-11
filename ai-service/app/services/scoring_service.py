from typing import Optional
import structlog

logger = structlog.get_logger()

WEIGHTS = {
    "transaction_consistency": 0.30,
    "revenue_level": 0.20,
    "debt_repayment": 0.25,
    "business_age": 0.10,
    "identity_verification": 0.15,
}

HEALTH_WEIGHTS = {
    "revenue_consistency": 0.25,
    "inventory_management": 0.20,
    "debt_collection": 0.20,
    "customer_retention": 0.15,
    "business_growth": 0.20,
}


def compute_credit_score(data: dict) -> dict:
    components = {
        "transaction_consistency": min(data.get("active_trading_days", 0) / max(data.get("days_since_registration", 1), 1), 1.0),
        "revenue_level": _score_revenue(data.get("average_monthly_revenue", 0)),
        "debt_repayment": data.get("debt_repayment_rate", 0.5),
        "business_age": min(data.get("days_since_registration", 0) / 365, 1.0),
        "identity_verification": 1.0 if data.get("kyc_status") == "verified" else 0.5 if data.get("kyc_status") == "pending" else 0.0,
    }

    raw = sum(components[k] * WEIGHTS[k] for k in WEIGHTS)
    score = int(300 + raw * 550)

    eligibility = "eligible" if score >= 670 else "conditional" if score >= 580 else "ineligible"
    max_loan = (score - 300) * 200

    improvements = []
    if components["transaction_consistency"] < 0.7:
        improvements.append("Record transactions daily to improve consistency score")
    if components["debt_repayment"] < 0.8:
        improvements.append("Repay outstanding debts on time")
    if components["identity_verification"] < 1.0:
        improvements.append("Complete KYC verification for full score")
    if components["business_age"] < 0.5:
        improvements.append("Continue building business history over time")

    return {
        "score": score,
        "band": _credit_band(score),
        "components": components,
        "loan_eligibility": eligibility,
        "recommended_loan_range": {"min": int(max_loan * 0.2), "max": int(max_loan)},
        "improvements": improvements,
    }


def compute_health_score(data: dict) -> dict:
    components = {
        "revenue_consistency": min(data.get("active_days_30", 0) / 25.0, 1.0) * 100,
        "inventory_management": data.get("inventory_management_score", 70.0),
        "debt_collection": data.get("debt_collection_rate", 0.5) * 100,
        "customer_retention": data.get("customer_retention_rate", 0.6) * 100,
        "business_growth": _growth_score(data.get("revenue_30d", 0), data.get("revenue_prev_30d", 0)),
    }

    score = round(
        components["revenue_consistency"] * HEALTH_WEIGHTS["revenue_consistency"] +
        components["inventory_management"] * HEALTH_WEIGHTS["inventory_management"] +
        components["debt_collection"] * HEALTH_WEIGHTS["debt_collection"] +
        components["customer_retention"] * HEALTH_WEIGHTS["customer_retention"] +
        components["business_growth"] * HEALTH_WEIGHTS["business_growth"]
    )

    band = (
        "excellent" if score >= 90 else
        "good" if score >= 75 else
        "fair" if score >= 60 else
        "needs_improvement" if score >= 40 else
        "critical"
    )

    strengths = [k for k, v in components.items() if v >= 75]
    weaknesses = [k for k, v in components.items() if v < 50]

    return {
        "score": score,
        "band": band,
        "components": components,
        "strengths": strengths,
        "weaknesses": weaknesses,
        "recommendations": _health_recommendations(weaknesses),
    }


def _score_revenue(monthly_avg: float) -> float:
    tiers = [(500_000, 1.0), (200_000, 0.8), (100_000, 0.6), (50_000, 0.4), (20_000, 0.2)]
    for threshold, score in tiers:
        if monthly_avg >= threshold:
            return score
    return 0.1


def _credit_band(score: int) -> str:
    if score >= 750: return "excellent"
    if score >= 670: return "good"
    if score >= 580: return "fair"
    if score >= 500: return "poor"
    return "very_poor"


def _growth_score(current: float, previous: float) -> float:
    if previous <= 0:
        return 50.0
    ratio = current / previous
    return min(ratio * 50, 100.0)


def _health_recommendations(weaknesses: list) -> list:
    tips = {
        "revenue_consistency": "Record sales every day, even small ones.",
        "inventory_management": "Set reorder alerts for fast-moving items.",
        "debt_collection": "Follow up on overdue debts weekly.",
        "customer_retention": "Offer loyalty discounts to repeat customers.",
        "business_growth": "Diversify your product range to grow revenue.",
    }
    return [tips[w] for w in weaknesses if w in tips]
