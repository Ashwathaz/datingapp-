from app.schemas.requests import ChatSafetyRequest

SCAM_TERMS = {
    "wire": "money_request",
    "gift card": "money_request",
    "crypto": "crypto_scam",
    "bitcoin": "crypto_scam",
    "investment": "investment_scheme",
    "forex": "investment_scheme",
    "send money": "money_request",
}

HARASSMENT_TERMS = {
    "kill": "threat",
    "hurt you": "threat",
    "idiot": "harassment",
    "spam link": "spam",
}


def classify_chat_message(payload: ChatSafetyRequest) -> dict:
    text = payload.message.lower()
    categories: list[str] = []
    for term, category in {**SCAM_TERMS, **HARASSMENT_TERMS}.items():
        if term in text:
            categories.append(category)
    risk = "high" if any(c in categories for c in ["money_request", "crypto_scam", "investment_scheme", "threat"]) else "low"
    return {
        "flagged": bool(categories),
        "risk": risk if categories else "none",
        "categories": sorted(set(categories)),
        "action": "moderation_queue" if categories else "allow",
    }

