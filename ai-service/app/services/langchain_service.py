import google.generativeai as genai
from langgraph.graph import StateGraph, END
from typing import TypedDict, Optional
from app.config import settings
from app.prompts.prompts import ADVISOR_SYSTEM_PROMPT
import structlog

logger = structlog.get_logger()

genai.configure(api_key=settings.gemini_api_key)


class AdvisorState(TypedDict):
    user_id: str
    message: str
    language: str
    business_context: Optional[str]
    low_stock_items: Optional[list]
    overdue_debts: Optional[list]
    recent_revenue: Optional[float]
    response: Optional[str]


def _get_gemini():
    return genai.GenerativeModel(
        model_name=settings.gemini_pro_model,
        generation_config=genai.GenerationConfig(temperature=0.7, max_output_tokens=512),
    )


async def fetch_context_node(state: AdvisorState) -> AdvisorState:
    low = len(state.get("low_stock_items") or [])
    debts = len(state.get("overdue_debts") or [])
    revenue = state.get("recent_revenue") or 0
    state["business_context"] = (
        f"Recent revenue: ₦{revenue:,.0f}. "
        f"Overdue debts: {debts}. "
        f"Low stock items: {low}."
    )
    return state


async def generate_response_node(state: AdvisorState) -> AdvisorState:
    lang_names = {"en": "English", "ha": "Hausa", "yo": "Yoruba", "ig": "Igbo", "pcm": "Nigerian Pidgin"}
    lang_name = lang_names.get(state["language"], "English")

    system = ADVISOR_SYSTEM_PROMPT.format(
        language=lang_name,
        business_context=state["business_context"],
    )

    model = _get_gemini()
    response = model.generate_content(f"{system}\n\nUser: {state['message']}")
    state["response"] = response.text.strip()
    return state


def build_advisor_graph() -> StateGraph:
    graph = StateGraph(AdvisorState)
    graph.add_node("fetch_context", fetch_context_node)
    graph.add_node("generate_response", generate_response_node)
    graph.set_entry_point("fetch_context")
    graph.add_edge("fetch_context", "generate_response")
    graph.add_edge("generate_response", END)
    return graph.compile()


advisor_graph = build_advisor_graph()


async def get_advisor_response(user_id: str, message: str, language: str, context: dict) -> str:
    state = AdvisorState(
        user_id=user_id,
        message=message,
        language=language,
        business_context=None,
        low_stock_items=context.get("low_stock_items", []),
        overdue_debts=context.get("overdue_debts", []),
        recent_revenue=context.get("recent_revenue", 0),
        response=None,
    )
    result = await advisor_graph.ainvoke(state)
    return result["response"]


async def get_daily_briefing(user_id: str, language: str, context: dict) -> str:
    low = len(context.get("low_stock_items", []))
    debts = len(context.get("overdue_debts", []))
    revenue = context.get("yesterday_revenue", 0)

    message = (
        f"Give me a morning briefing. Yesterday revenue: ₦{revenue:,.0f}. "
        f"Low stock items: {low}. Overdue debts: {debts}."
    )
    return await get_advisor_response(user_id, message, language, context)
