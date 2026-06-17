from app.schemas.requests import IdCardRequest, SelfieRequest


def analyze_id_card(payload: IdCardRequest) -> dict:
    source = str(payload.frontImageUrl or payload.front_image_url or "").lower()
    failed = "mismatch" in source or "fake" in source or "expired" in source
    return {
        "status": "rejected" if failed else "approved",
        "score": 42 if failed else 94,
        "extracted": {
            "full_name": "Demo Verified User",
            "dob": "1998-01-10",
            "gender": "unspecified",
        },
        "checks": {
            "document_type_supported": True,
            "ocr_extraction": "ocr-fail" not in source,
            "profile_name_match": "mismatch" not in source,
            "age_consistency": "underage" not in source,
            "tamper_detection": "fake" not in source,
        },
    }


def analyze_selfie(payload: SelfieRequest) -> dict:
    source = str(payload.selfieVideoUrl or payload.selfie_video_url or "").lower()
    failed = any(marker in source for marker in ["spoof", "screen", "mismatch", "no-blink"])
    actions = {
        "blink": "no-blink" not in source,
        "smile": "no-smile" not in source,
        "turn_left": "no-left" not in source,
        "turn_right": "no-right" not in source,
    }
    return {
        "status": "rejected" if failed or not all(actions.values()) else "approved",
        "score": 38 if failed else 96,
        "liveness_actions": actions,
        "checks": {
            "anti_spoofing": "spoof" not in source,
            "screen_detection": "screen" not in source,
            "uploaded_photo_match": "mismatch" not in source,
            "government_id_match": "id-mismatch" not in source,
        },
    }

