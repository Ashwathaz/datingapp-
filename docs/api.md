# SoulSync API Documentation

Base path: `/api/v1`

Interactive OpenAPI docs are served by the backend at `/docs`.

## Authentication

- `POST /auth/register` creates a pending account and issues email/phone verification challenges.
- `POST /auth/login` returns access and refresh tokens.
- `POST /auth/refresh` rotates a valid refresh token and returns a new token pair.
- `POST /auth/logout` revokes a refresh token session.
- `POST /auth/verify-email` approves email verification.
- `POST /auth/verify-phone` approves phone verification.

All protected endpoints require `Authorization: Bearer <accessToken>`.

## Onboarding

- `PATCH /profiles/personal`
- `PATCH /profiles/preferences`
- `PATCH /profiles/work-education`
- `PATCH /profiles/lifestyle`
- `PATCH /profiles/interests`
- `PATCH /profiles/entertainment`
- `PATCH /profiles/bio`
- `GET /profiles/me`

Matching remains locked until required verification checks are approved.

## Verification

- `GET /verification/matching-eligibility`
- `POST /verification/government-id`
- `POST /verification/selfie`
- `POST /verification/social`
- `POST /verification/reference`

## Media

- `POST /media` registers uploaded media and calls AI analysis.
- `GET /media/requirements` verifies the minimum 3 media items, 2 face photos, and 1 full-body photo.

## Trust

- `GET /trust/me`
- `POST /trust/recalculate`

Trust score weights:

- Phone verified: 10
- Email verified: 10
- ID verified: 25
- Selfie verified: 25
- Image authenticity: 15
- Social verification: 10
- Account reputation: 5

## Matching

- `GET /matching/recommendations?threshold=75`
- `POST /matching/actions`

Actions: `like`, `pass`, `super_like`, `save`, `hide`, `block`.

## Chat

- `GET /chat/matches/:matchId/messages`
- Socket.IO events: `match:join`, `message:send`, `typing`, `message:new`.

## Moderation

- `POST /moderation/reports`
- `GET /moderation/queue`
- `PATCH /moderation/reports/:id`

## Admin

- `GET /admin/dashboard`
- `GET /admin/review-queue?type=media|verification`
- `PATCH /admin/users/:id/status`

## AI Service

Base path: `/v1`

- `POST /media/analyze`
- `POST /identity/id-card`
- `POST /identity/selfie`
- `POST /compatibility/profile`
- `POST /safety/chat`
