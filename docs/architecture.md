# Architecture

SoulSync is a service-oriented monorepo with a Flutter client, React admin dashboard, NestJS backend, FastAPI AI service, PostgreSQL system of record, Redis, RabbitMQ, Elasticsearch, and MinIO.

## Core Flows

1. User registers and receives email/phone challenges.
2. User completes profile onboarding.
3. User uploads media through object storage and registers URLs with backend.
4. Backend calls AI service for image trust analysis.
5. User submits selfie and government ID for AI-assisted verification.
6. Trust score is recalculated.
7. Matching unlocks only when required verification records are approved.
8. Mutual likes create a match and unlock Socket.IO chat.
9. Chat messages are classified by safety service and flagged to moderation when needed.

## Production Integration Ports

- SMS provider
- Email provider
- Firebase Cloud Messaging/APNs
- In-app purchase and payment provider
- Reverse image search provider
- Government ID OCR and fraud provider
- Face recognition/liveness model runner
- WAF and device fingerprint provider

