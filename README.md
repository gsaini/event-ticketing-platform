# 🎫 Event Ticket Booking Platform

A distributed, cloud-native event ticketing system designed for high-concurrency flash-sale scenarios — from event creation and discovery through seat selection, payment, and digital ticket delivery.

## 🏗️ Architecture Overview

The platform follows a **microservices architecture** built on Kubernetes with:

- **API Gateway** (Kong) — rate limiting, auth, routing
- **Event-Driven Communication** — Apache Kafka for async messaging
- **Polyglot Persistence** — PostgreSQL, Redis, Elasticsearch, S3, ClickHouse
- **CQRS + Event Sourcing** — separate read/write models for inventory and search

## 🧩 Core Services

| Service                  | Tech Stack          | Responsibility                           |
| ------------------------ | ------------------- | ---------------------------------------- |
| **User Service**         | Node.js / Express   | Authentication, profiles, RBAC           |
| **Event Service**        | Python / FastAPI    | Event CRUD, venue management, pricing    |
| **Booking Service**      | Go                  | Seat reservation, holds, confirmations   |
| **Payment Service**      | Java / Spring Boot  | Payment processing, refunds, settlements |
| **Search Service**       | Elasticsearch       | Full-text, geo, and faceted search       |
| **Notification Service** | Node.js             | Email, SMS, push notifications           |
| **Analytics Service**    | Python / ClickHouse | Real-time dashboards, reporting          |
| **Cart Service**         | Node.js / Redis     | Cart management, promo codes             |
| **Waitlist Service**     | Python / FastAPI    | Waitlist queue management                |

## ⚡ Key Features

- **Flash-Sale Ready** — Virtual waiting room, auto-scaling, two-layer concurrency control
- **Real-Time Seat Maps** — WebSocket-powered live availability updates
- **Secure Payments** — PCI-DSS Level 1 compliant via Stripe/Razorpay tokenization
- **Smart Search** — Elasticsearch with fuzzy matching, geo-search, and autocomplete
- **Multi-Channel Notifications** — Email, SMS, push, and in-app via Kafka events
- **Comprehensive Observability** — Prometheus, Grafana, Jaeger, OpenTelemetry

## 📐 Design Documentation

See [DESIGN.md](./DESIGN.md) for the full system design including:

- High-level architecture diagrams
- Data model (ER diagram)
- API design & sample requests
- Booking flow sequence diagrams
- Payment processing & webhook handling
- Caching strategy
- Security threat model (STRIDE)
- Infrastructure & CI/CD pipeline
- Scalability & flash-sale strategy
- Failure handling & resilience patterns

## 🛠️ Tech Stack

| Layer          | Technology                           |
| -------------- | ------------------------------------ |
| Frontend       | React 19 + Next.js 15                |
| Mobile         | React Native / Flutter               |
| API Gateway    | Kong / AWS API Gateway               |
| Backend        | Go, Python, Node.js, Java            |
| Database       | PostgreSQL 17                        |
| Cache          | Redis 7 Cluster                      |
| Message Broker | Apache Kafka 3.7                     |
| Search         | Elasticsearch 8.x                    |
| Cloud          | AWS (EKS, RDS, ElastiCache, MSK, S3) |
| IaC            | Terraform + Helm                     |
| CI/CD          | GitHub Actions                       |
| Monitoring     | Prometheus + Grafana                 |

## 📄 License

MIT

## 👤 Author

**Gopal Saini**  
📧 gopal.saini.work@gmail.com
