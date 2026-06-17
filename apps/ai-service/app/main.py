from fastapi import FastAPI
from app.api.routes import router

app = FastAPI(
    title="SoulSync AI Service",
    description="Identity, image authenticity, compatibility, and safety AI endpoints.",
    version="0.1.0",
)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "ai-service"}


app.include_router(router, prefix="/v1")

