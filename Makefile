# StreetOS AI — Development Commands

.PHONY: install setup backend ai mobile docker-up docker-down logs

# ── Install all dependencies ───────────────────────────────────────────────────
install:
	cd backend && npm install
	cd mobile && npm install
	cd ai-service && pip install -r requirements.txt

# ── Run everything with Docker (recommended) ──────────────────────────────────
docker-up:
	docker-compose up --build

docker-down:
	docker-compose down

logs:
	docker-compose logs -f

# ── Run services individually (without Docker) ────────────────────────────────
backend:
	cd backend && npm run dev

ai:
	cd ai-service && uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

mobile:
	cd mobile && npx expo start

mobile-android:
	cd mobile && npx expo start --android

mobile-ios:
	cd mobile && npx expo start --ios

# ── Run backend + AI together (Windows: use separate terminals) ───────────────
dev:
	@echo "Open 3 terminals and run:"
	@echo "  Terminal 1: make backend"
	@echo "  Terminal 2: make ai"
	@echo "  Terminal 3: make mobile"
