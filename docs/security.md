# Security Documentation

## Identity and Access

- JWT access and refresh tokens are signed with separate secrets.
- Refresh tokens are persisted as hashed `auth_sessions`, rotated on use, and revocable on logout.
- Admin APIs are protected with RBAC roles: `super_admin`, `moderator`, `verification_agent`, and `support_agent`.
- Matching endpoints enforce verification eligibility before recommendations are returned.
- All admin mutations write to `audit_logs`.

## Verification Controls

- Email and phone challenges are hashed before storage.
- Government ID and selfie results are stored as structured provider payloads for review.
- Selfie checks include liveness actions, anti-spoofing, screen detection, uploaded photo matching, and ID matching.
- Media checks include face detection, quality, screenshot, watermark, duplicate, reverse lookup, stolen photo, generated face, and selfie match signals.

## Upload Safety

- Production deployments should issue short-lived MinIO presigned URLs through the backend.
- Enforce MIME type, file extension, file size, malware scanning, content hashing, and per-user upload rate limits.
- Store original files privately and serve transformed safe variants through a CDN or object gateway.

## Privacy

- Do not store friend-reference free text beyond consent and trust-confirmation outcomes.
- Never collect social account passwords.
- Minimize retention of government ID originals after verification unless local law requires retention.
- Encrypt production PostgreSQL volumes, object storage, and backups.

## Abuse and Fraud

- Chat safety flags romance scams, money requests, crypto scams, investment schemes, harassment, threats, and spam.
- Device fingerprinting and velocity rules should feed `account_reputation`.
- WAF rules should limit credential stuffing, upload abuse, and scraper traffic.

## Required Production Hardening

- Replace development secrets.
- Enforce TLS everywhere.
- Enable PostgreSQL PITR backups.
- Enable object-lock or immutable backup storage.
- Add payment provider webhooks with signature verification.
- Add SMS/email/push providers with delivery audit events.
- Add model versioning and bias/accuracy evaluation for AI decisions.
