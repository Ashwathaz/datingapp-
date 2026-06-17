from app.services.safety import classify_chat_message
from app.schemas.requests import ChatSafetyRequest


def test_money_request_is_flagged():
    result = classify_chat_message(ChatSafetyRequest(user_id="u1", message="Please send money by gift card"))
    assert result["flagged"] is True
    assert "money_request" in result["categories"]

