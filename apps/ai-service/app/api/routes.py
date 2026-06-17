from fastapi import APIRouter
from app.schemas.requests import (
    ChatSafetyRequest,
    CompatibilityRequest,
    IdCardRequest,
    MediaAnalyzeRequest,
    SelfieRequest,
)
from app.services.compatibility import build_compatibility_profile
from app.services.identity import analyze_id_card, analyze_selfie
from app.services.media import analyze_media
from app.services.safety import classify_chat_message

router = APIRouter()


@router.post("/media/analyze")
def media_analyze(payload: MediaAnalyzeRequest) -> dict:
    return analyze_media(payload)


@router.post("/identity/id-card")
def id_card(payload: IdCardRequest) -> dict:
    return analyze_id_card(payload)


@router.post("/identity/selfie")
def selfie(payload: SelfieRequest) -> dict:
    return analyze_selfie(payload)


@router.post("/compatibility/profile")
def compatibility_profile(payload: CompatibilityRequest) -> dict:
    return build_compatibility_profile(payload)


@router.post("/safety/chat")
def chat_safety(payload: ChatSafetyRequest) -> dict:
    return classify_chat_message(payload)

