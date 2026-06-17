from pydantic import BaseModel, Field, HttpUrl


class MediaAnalyzeRequest(BaseModel):
    user_id: str
    media_url: HttpUrl
    media_type: str = Field(pattern="^(photo|video)$")


class IdCardRequest(BaseModel):
    user_id: str
    documentType: str | None = None
    document_type: str | None = None
    frontImageUrl: HttpUrl | None = None
    front_image_url: HttpUrl | None = None
    backImageUrl: HttpUrl | None = None
    back_image_url: HttpUrl | None = None


class SelfieRequest(BaseModel):
    user_id: str
    selfieVideoUrl: HttpUrl | None = None
    selfie_video_url: HttpUrl | None = None
    livenessSessionId: str | None = None
    liveness_session_id: str | None = None


class CompatibilityRequest(BaseModel):
    age: int | None = None
    profession: str | None = None
    languages: list[str] = []
    lifestyle: dict[str, str | None] = {}
    relationship_goals: list[str] = []
    personality_traits: list[str] = []
    interests: list[str] = []
    entertainment_preferences: dict[str, list[str]] = {}
    location: dict[str, str | None] = {}


class ChatSafetyRequest(BaseModel):
    user_id: str
    message: str

