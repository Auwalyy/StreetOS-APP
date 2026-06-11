from langgraph.graph import StateGraph, END
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage
from typing import TypedDict, Optional
from app.config import settings
from app.prompts.prompts import ADVISOR_SYSTEM_PROMPT
import structlog

logger = structlog.get_logger()

llm = ChatOpenAI(model="gpt-4o", api_key=settings.openai_api_key, temperature=0.7)


class AdvisorState(TypedDict):
    user_id: str
    message: str
    language: str
    business_context: Optional[str]
    low_stock_items: Optional[list]
    overdue_debts: Optional[list]
    recent_revenue: Optional[float]
    response: Optional[str]


async def fetch_context_node(state: AdvisorState) -> AdvisorState:
    """Fetch business context from MongoDB."""
    # In production this queries MongoDB directly via motor
    state["business_context"] = f"Recent revenue: ₦{state.get('recent_revenue', 0):,.0f}. " \
                                  f"Overdue debts: {len(state.get('overdue_debts', []))}. " \
                                  f"Low stock items: {len(state.get('low_stock_items', []))}."
    return state


async def generate_response_node(state: AdvisorState) -> AdvisorState:
    """Generate AI response using context."""
    lang_names = {"en": "English", "ha": "Hausa", "yo": "Yoruba", "ig": "Igbo", "pcm": "Nigerian Pidgin"}
    lang_name = lang_names.get(state["language"], "English")

    system = ADVISOR_SYSTEM_PROMPT.format(
        language=lang_name,
        business_context=state["business_context"],
    )

    messages = [
        SystemMessage(content=system),
        HumanMessage(content=state["message"]),
    ]

    response = await llm.ainvoke(messages)
    state["response"] = response.content
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

    message = f"Give me a morning briefing. Yesterday revenue: ₦{revenue:,.0f}. " \
              f"Low stock items: {low}. Overdue debts: {debts}."

    return await get_advisor_response(user_id, message, language, context)
