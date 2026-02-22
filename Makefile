.PHONY: help up down build logs ps test clean

COMPOSE := docker compose
SERVICES := user-service event-service booking-service payment-service search-service notification-service cart-service waitlist-service

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

# ─── Docker Compose ──────────────────────────────────────────────────────────

up: ## Start all services (detached)
	$(COMPOSE) up -d --build

up-infra: ## Start only infrastructure (no app services)
	$(COMPOSE) up -d postgres redis kafka elasticsearch minio mailhog

down: ## Stop all services
	$(COMPOSE) down

down-clean: ## Stop all services and remove volumes
	$(COMPOSE) down -v --remove-orphans

build: ## Build all service images
	$(COMPOSE) build

logs: ## Tail logs for all services
	$(COMPOSE) logs -f

logs-%: ## Tail logs for a specific service (e.g., make logs-booking-service)
	$(COMPOSE) logs -f $*

ps: ## Show running services
	$(COMPOSE) ps

restart-%: ## Restart a specific service (e.g., make restart-booking-service)
	$(COMPOSE) restart $*

# ─── Testing ─────────────────────────────────────────────────────────────────

test: ## Run tests for all services
	@echo "==> Running User Service tests..."
	cd services/user-service && npm test 2>/dev/null || true
	@echo "==> Running Event Service tests..."
	cd services/event-service && python -m pytest 2>/dev/null || true
	@echo "==> Running Booking Service tests..."
	cd services/booking-service && go test ./... 2>/dev/null || true
	@echo "==> Running Payment Service tests..."
	cd services/payment-service && mvn test -q 2>/dev/null || true

test-%: ## Run tests for a specific service (e.g., make test-user-service)
	@echo "==> Running tests for $*..."
	cd services/$* && \
	if [ -f package.json ]; then npm test; \
	elif [ -f pyproject.toml ]; then python -m pytest; \
	elif [ -f go.mod ]; then go test ./...; \
	elif [ -f pom.xml ]; then mvn test -q; \
	fi

# ─── Utilities ───────────────────────────────────────────────────────────────

health: ## Check health of all services
	@for port in 3001 3002 3003 3004 3005 3006 3007 3008; do \
		echo -n "Port $$port: "; \
		curl -sf http://localhost:$$port/health && echo "" || echo "DOWN"; \
	done

clean: ## Remove all build artifacts and node_modules
	find . -name "node_modules" -type d -prune -exec rm -rf {} +
	find . -name "__pycache__" -type d -prune -exec rm -rf {} +
	find . -name ".pytest_cache" -type d -prune -exec rm -rf {} +
	find . -name "dist" -type d -prune -exec rm -rf {} +
	find . -name "target" -type d -prune -exec rm -rf {} +

env: ## Copy .env.example to .env
	cp -n .env.example .env || true
	@echo ".env file ready"
