# 🎫 Event Ticket Booking Platform

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Go](https://img.shields.io/badge/Go-00ADD8?style=for-the-badge&logo=go&logoColor=white)
![Java](https://img.shields.io/badge/Java-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)
![Apache Kafka](https://img.shields.io/badge/Apache_Kafka-231F20?style=for-the-badge&logo=apachekafka&logoColor=white)
![Elasticsearch](https://img.shields.io/badge/Elasticsearch-005571?style=for-the-badge&logo=elasticsearch&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Kubernetes](https://img.shields.io/badge/Kubernetes-326CE5?style=for-the-badge&logo=kubernetes&logoColor=white)
![Kong](https://img.shields.io/badge/Kong-003459?style=for-the-badge&logo=kong&logoColor=white)

A distributed, self-hosted event ticketing system built on Kubernetes and open-source technologies, designed for high-concurrency flash-sale scenarios — from event creation and discovery through seat selection, payment, and digital ticket delivery.

## 🏗️ Architecture Overview

The platform follows a **microservices architecture** built on Kubernetes with:

- **API Gateway** (Kong) — rate limiting, auth, routing
- **Event-Driven Communication** — Apache Kafka for async messaging
- **Polyglot Persistence** — PostgreSQL, Redis, Elasticsearch, MinIO, ClickHouse
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

See [DESIGN.md](./docs/DESIGN.md) for the full system design including:

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

| Layer          | Technology                 |
| -------------- | -------------------------- |
| Frontend       | React 19 + Next.js 15      |
| Mobile         | React Native / Flutter     |
| API Gateway    | Kong (OSS)                 |
| Backend        | Go, Python, Node.js, Java  |
| Database       | PostgreSQL 17 (Patroni HA) |
| Cache          | Redis 7 Cluster            |
| Message Broker | Apache Kafka 3.7 (KRaft)   |
| Search         | Elasticsearch 8.x (ECK)    |
| Object Storage | MinIO                      |
| Orchestration  | Kubernetes (kubeadm / k3s) |
| Registry       | Harbor                     |
| Secrets        | HashiCorp Vault            |
| IaC            | Terraform + Helm           |
| CI/CD          | GitHub Actions             |
| Monitoring     | Prometheus + Grafana       |
| Ingress / CDN  | Nginx Ingress + Varnish    |

## 📄 License

MIT

## 👤 Author

**Gopal Saini**  
📧 gopal.saini.work@gmail.com
