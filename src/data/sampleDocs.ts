export interface SampleDoc {
  id: string;
  title: string;
  category: string;
  markdown: string;
}

export const SAMPLE_DOCS: SampleDoc[] = [
  {
    id: 'microservices',
    title: 'Microservices Architecture & Event Streaming',
    category: 'System Architecture',
    markdown: `# Microservices Architecture & Event Streaming Guide

## Executive Overview
Modern enterprise architectures decouple monolithic logic into resilient, independently deployable microservices communicating through event-driven backbones.

- Zero downtime deployments across isolated domains
- Dynamic autoscaling based on Kafka consumer lag metrics
- Eventual consistency maintained with Saga orchestration

## Core Architecture Topology
The ingress tier routes incoming traffic through an API Gateway, which handles TLS termination, rate-limiting, and JWT validation.

- API Gateway handles request multiplexing and distributed tracing
- Service Mesh (Envoy) manages mutual TLS between internal microservices
- Apache Kafka functions as the immutable distributed log

\`\`\`yaml
services:
  gateway:
    image: envoyproxy/envoy:v1.28
    ports: ["443:443"]
  order-service:
    replicas: 4
    environment:
      KAFKA_BROKERS: "kafka:9092"
\`\`\`

## High-Throughput Ingestion
Our ingestion pipeline processes over 100,000 events per second with sub-15ms p99 latency thresholds.

- Partition-keyed ordering guarantees strictly sequential processing
- Dead Letter Queues (DLQ) isolate corrupted payloads without blocking consumer groups
- Prometheus and OpenTelemetry scrape metrics for automated canary rollbacks

## Deployment and Verification
Every service is packaged into hardened OCI containers with automated vulnerability scanning before reaching production.

- Automated canary promotion using Argo Rollouts
- End-to-end integration tests verify backward compatibility
- Instant 1-click rollback via automated health-check alarms
`,
  },
  {
    id: 'release-notes',
    title: 'Release Notes v2.4: High-Performance Engine',
    category: 'Product & Engineering',
    markdown: `# Release Notes v2.4 :: Performance & Automated Pipelines

## Highlights & What's New
Version 2.4 introduces hardware-accelerated video rendering, automated GitHub Actions deployment, and native documentation ingestion.

- 3.5x faster video rendering pipeline using headless WebGL shaders
- Direct GitHub push automation with Personal Access Token authentication
- Unified multi-stage Docker deployment workflow

## Zero-Config Deployment
We have unified our deployment scripts so teams can ship to production or cloud environments with a single command.

- scripts/deploy.sh automatically checks Node.js, runs TypeScript lint, and builds artifacts
- Native Docker containerization with multi-stage Alpine images
- Real-time deployment telemetry stream in the web console

\`\`\`bash
# Automated single-command deployment
chmod +x ./scripts/deploy.sh
DEPLOY_TARGET=docker ./scripts/deploy.sh
\`\`\`

## Breaking Changes & Migration
Review your environment variables before upgrading existing worker pools.

- GITHUB_TOKEN is now read by default for automated repository synchronization
- DEPLOY_TARGET defaults to "docker" when unspecified
- Deprecated legacy v1 export manifests in favor of the unified Scene JSON schema

## Summary & Roadmap
This release sets the foundation for fully autonomous documentation video publishing upon every git push.
`,
  },
  {
    id: 'api-auth',
    title: 'Zero-Trust API Security & Token Rotation',
    category: 'Security & DevOps',
    markdown: `# Zero-Trust API Security & Token Rotation Protocol

## Introduction to Zero-Trust
Zero-Trust architecture enforces continuous verification: never trust, always authenticate every request across every network perimeter.

- Ephemeral JWT credentials with 15-minute expiration windows
- Asymmetric cryptographic signing using RS256 keypairs
- Automated rotation cycles via HashiCorp Vault secrets engine

## Authentication Workflow
Clients obtain short-lived bearer tokens by exchanging signed client assertions against our OAuth 2.1 authorization server.

\`\`\`typescript
const tokenResponse = await fetch('/oauth/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: process.env.CLIENT_ID,
    client_assertion_type: 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer'
  })
});
\`\`\`

## Security Compliance & Enforcement
All API transactions are logged to immutable audit streams with encrypted payload masks.

- Automatic IP reputation scoring and adaptive challenge policies
- Hardware Security Module (HSM) root-of-trust protection
- Zero plaintext secret leakage across container environment logs
`,
  },
];
