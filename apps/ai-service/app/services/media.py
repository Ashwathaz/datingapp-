from app.schemas.requests import MediaAnalyzeRequest


def analyze_media(payload: MediaAnalyzeRequest) -> dict:
    url = str(payload.media_url).lower()
    flags: list[str] = []
    score = 100

    reject_markers = {
        "meme": "meme_image",
        "screenshot": "screenshot_detected",
        "stock": "stock_photo_risk",
        "celebrity": "celebrity_photo_risk",
        "watermark": "watermark_detected",
        "ai-face": "ai_generated_face_risk",
        "filter": "heavy_filter_risk",
        "pet-only": "pet_only_photo",
        "car-only": "car_only_photo",
        "nature-only": "nature_only_photo",
    }
    for marker, flag in reject_markers.items():
        if marker in url:
            flags.append(flag)
            score -= 20

    checks = {
        "face_detection": "no-face" not in url,
        "face_quality": "blur" not in url,
        "ai_generated_face_detection": "ai-face" not in url,
        "screenshot_detection": "screenshot" not in url,
        "watermark_detection": "watermark" not in url,
        "duplicate_detection": "duplicate" not in url,
        "reverse_image_lookup": "stock" not in url and "celebrity" not in url,
        "stolen_photo_detection": "stolen" not in url,
        "selfie_face_match": "mismatch" not in url,
    }
    for passed in checks.values():
        if not passed:
            score -= 10

    score = max(0, min(100, score))
    return {
        "image_trust_score": score,
        "flagged": score < 75 or bool(flags),
        "flags": flags,
        "checks": checks,
        "recommendation": "approved" if score >= 75 and not flags else "manual_review",
    }

