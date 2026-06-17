from app.schemas.requests import CompatibilityRequest


def build_compatibility_profile(payload: CompatibilityRequest) -> dict:
    city = payload.location.get("city") if payload.location else None
    profession = payload.profession or "Professional"
    interests = ", ".join(payload.interests[:4]) if payload.interests else "meaningful conversations"
    relationship = payload.relationship_goals[0] if payload.relationship_goals else "a genuine relationship"
    summary = f"{payload.age or 'Adult'}-year-old {profession} from {city or 'their city'} seeking {relationship}. Enjoys {interests}."
    return {
        "summary": summary,
        "personality_traits": payload.personality_traits,
        "relationship_goals": payload.relationship_goals,
        "lifestyle_tags": [value for value in payload.lifestyle.values() if value],
        "interests": payload.interests,
        "embedding": _hash_embedding(summary),
    }


def _hash_embedding(text: str) -> list[float]:
    values = []
    encoded = text.encode("utf-8")
    for index in range(32):
        bucket = encoded[index::32]
        values.append((sum(bucket) % 100) / 100)
    return values

