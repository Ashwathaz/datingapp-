# Self-Hosted Deployment Guide

## Local

```bash
cp .env.example .env
docker compose -f infra/docker/docker-compose.yml up --build
```

## Kubernetes

1. Create secrets for backend, PostgreSQL, MinIO, JWT, SMTP, SMS, push, and payment providers.
2. Apply namespace and infrastructure manifests.
3. Run database migrations from `database/schema.sql`.
4. Deploy backend, AI service, and admin dashboard.
5. Apply ingress with production TLS certificates.
6. Enable monitoring and alerting.

```bash
kubectl apply -f infra/k8s/namespace.yaml
kubectl apply -f infra/k8s/postgres
kubectl apply -f infra/k8s/redis
kubectl apply -f infra/k8s/rabbitmq
kubectl apply -f infra/k8s/minio
kubectl apply -f infra/k8s/elasticsearch
kubectl apply -f infra/k8s/ai-service
kubectl apply -f infra/k8s/backend
kubectl apply -f infra/k8s/admin
kubectl apply -f infra/k8s/ingress.yaml
```

## Scale Target: 100,000+ Users

- Backend: stateless horizontal scaling behind ingress.
- Chat: Socket.IO requires Redis adapter in production for multi-pod fanout.
- PostgreSQL: managed HA or self-hosted primary/replica with PITR and automated failover.
- Redis: HA Redis or Redis Sentinel/Cluster.
- RabbitMQ: 3-node quorum queue cluster.
- MinIO: distributed mode with erasure coding.
- Elasticsearch: 3 master/data node baseline for production search.

## Backups and Disaster Recovery

- PostgreSQL: nightly full backup plus WAL archiving for point-in-time recovery.
- MinIO: bucket replication and immutable backup destination.
- Secrets: encrypted offline escrow.
- Recovery drills: monthly restore validation into an isolated namespace.

## Zero-Downtime Updates

Backend and AI deployments use rolling updates with `maxUnavailable: 0`. Use backwards-compatible database migrations:

1. Add nullable columns/tables.
2. Deploy code that writes both old and new paths where needed.
3. Backfill.
4. Switch reads.
5. Remove old schema in a later release.

