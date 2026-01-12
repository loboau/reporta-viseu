.PHONY: help install db-start db-stop db-reset setup dev build start test clean

help:
	@echo "Reporta Viseu Backend - Available Commands"
	@echo ""
	@echo "  make install     - Install dependencies"
	@echo "  make db-start    - Start PostgreSQL container"
	@echo "  make db-stop     - Stop PostgreSQL container"
	@echo "  make db-reset    - Reset database (drop and recreate)"
	@echo "  make setup       - Complete setup (install + db + migrate + seed)"
	@echo "  make dev         - Start development server"
	@echo "  make build       - Build for production"
	@echo "  make start       - Start production server"
	@echo "  make test        - Run API tests"
	@echo "  make clean       - Clean build files and containers"
	@echo ""

install:
	npm install

db-start:
	docker-compose up -d
	@echo "Waiting for PostgreSQL to be ready..."
	@sleep 3

db-stop:
	docker-compose down

db-reset:
	docker-compose down -v
	docker-compose up -d
	@echo "Waiting for PostgreSQL to be ready..."
	@sleep 5
	npm run db:setup

setup: install db-start
	@echo "Waiting for PostgreSQL to be ready..."
	@sleep 3
	npm run db:setup
	@echo ""
	@echo "✓ Setup complete! Run 'make dev' to start the server"

dev:
	npm run dev

build:
	npm run build

start:
	npm start

test:
	./test-api.sh

clean:
	rm -rf node_modules dist uploads
	docker-compose down -v
