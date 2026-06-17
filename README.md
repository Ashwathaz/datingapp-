# SoulSync

SoulSync is a self-hosted verified dating platform foundation for Android, iOS, web admin, backend APIs, AI verification services, and production deployment.

This repository is organized as a monorepo:

- `apps/backend` - NestJS API for auth, onboarding, verification state, trust scoring, matching, chat, moderation, subscriptions, admin operations, and notifications.
- `apps/ai-service` - FastAPI service for image verification, identity checks, liveness scoring, compatibility summaries, and chat-safety classification.
- `apps/admin` - React admin dashboard for moderation, verification, revenue, trust, and operational review.
- `apps/mobile` - Flutter mobile app foundation for onboarding, verification, discovery, matches, and chat.
- `database` - PostgreSQL schema and seed data.
- `infra` - Docker Compose, Kubernetes manifests, Helm chart, monitoring, and deployment assets.
- `docs` and `diagrams` - API, architecture, security, deployment, release, and data-model documentation.

## Production Stance

The repo provides production-oriented boundaries, schemas, service contracts, deployment manifests, and runnable application foundations. Heavy external capabilities such as reverse image lookup, SMS delivery, payment processors, App Store purchases, push credentials, and production-grade face/ID model weights are implemented behind provider interfaces or deterministic local stubs so they can be replaced without changing product flows.

## Quick Start

```bash
cp .env.example .env
docker compose -f infra/docker/docker-compose.yml up --build
```

Services:

- Backend API: `http://localhost:3000`
- AI Service: `http://localhost:8000`
- Admin Dashboard: `http://localhost:5173`
- MinIO Console: `http://localhost:9001`
- Grafana: `http://localhost:3001`

## Core Guarantees

- Matching is locked until email, phone, selfie, and government ID verification are complete.
- Trust score calculation follows the requested 100-point model.
- Media uploads require automated AI analysis and review flags before profile activation.
- All privileged admin actions are RBAC-guarded and audit logged.
- Chat safety classification can escalate scam, harassment, spam, and threat signals to moderation.
- Infrastructure is self-hosted with PostgreSQL, Redis, RabbitMQ, Elasticsearch, MinIO, Prometheus, Grafana, Loki, and Kubernetes manifests.

## Deployment

See:

- [Implementation Status](docs/implementation-status.md)
- [Deployment Guide](docs/deployment.md)
- [Security Guide](docs/security.md)
- [Production Release Guide](docs/production-release.md)
- [API Documentation](docs/api.md)
