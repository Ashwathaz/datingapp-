# Production Release Guide

## Pre-Release Checklist

- All secrets are injected from Kubernetes secrets or an external secret manager.
- Database migration plan is reviewed and tested on a production-size snapshot.
- Backend, AI service, and admin images are signed and scanned.
- Mobile app privacy labels and store review notes are complete.
- AI verification fallback/manual review path is staffed.
- Payment webhook signature verification is enabled.
- Push, email, and SMS delivery are monitored.

## Release Steps

1. Build and push immutable images tagged with the git SHA.
2. Run backend and AI test suites.
3. Apply database migrations.
4. Deploy AI service with rolling update.
5. Deploy backend with rolling update.
6. Deploy admin dashboard.
7. Verify health checks, login, verification submission, matching lock, and chat.
8. Watch error rate, p95 latency, queue depth, and moderation backlog for at least 30 minutes.

## Rollback

- Revert deployment image tags to the previous known-good SHA.
- Avoid rolling back migrations that have already accepted production writes unless an explicit down-migration was tested.
- Disable risky features through `settings` rows or feature flags before rollback when possible.

