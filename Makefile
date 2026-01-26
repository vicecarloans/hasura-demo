.PHONY: up down restart logs ps clean console migrate-status migrate-apply metadata-export metadata-apply psql jupyter help

# Default target
help:
	@echo "Hasura Demo - Available Commands"
	@echo "================================="
	@echo ""
	@echo "Docker Commands:"
	@echo "  make up            - Start all services"
	@echo "  make down          - Stop all services"
	@echo "  make restart       - Restart all services"
	@echo "  make logs          - View Hasura logs"
	@echo "  make ps            - Show service status"
	@echo "  make clean         - Stop services and remove volumes"
	@echo ""
	@echo "Access Services:"
	@echo "  make console       - Open Hasura Console in browser"
	@echo "  make jupyter       - Open Jupyter Notebook in browser"
	@echo "  make psql          - Connect to PostgreSQL"
	@echo ""
	@echo "Hasura CLI Commands:"
	@echo "  make migrate-status   - Show migration status"
	@echo "  make migrate-apply    - Apply pending migrations"
	@echo "  make metadata-export  - Export metadata from server"
	@echo "  make metadata-apply   - Apply metadata to server"
	@echo ""
	@echo "URLs:"
	@echo "  Hasura Console:  http://localhost:8080"
	@echo "  Jupyter:         http://localhost:8888 (token: hasura-demo)"
	@echo "  PostgreSQL:      localhost:5432"

# Docker commands
up:
	docker-compose up -d
	@echo ""
	@echo "Services started!"
	@echo "  Hasura Console: http://localhost:8080 (admin secret: hasura-admin-secret)"
	@echo "  Jupyter:        http://localhost:8888 (token: hasura-demo)"

down:
	docker-compose down

restart:
	docker-compose restart

logs:
	docker-compose logs -f hasura

ps:
	docker-compose ps

clean:
	docker-compose down -v
	@echo "All services stopped and volumes removed."

# Access services
console:
	cd hasura && hasura console --admin-secret hasura-admin-secret
	@echo "Opening Hasura Console..."
	@echo "Admin Secret: hasura-admin-secret"
	open http://localhost:9695 || xdg-open http://localhost:9695 || echo "Please open http://localhost:9695 in your browser"

jupyter:
	@echo "Opening Jupyter Notebook..."
	@echo "Token: hasura-demo"
	open http://localhost:8888 || xdg-open http://localhost:8888 || echo "Please open http://localhost:8888 in your browser"

psql:
	docker exec -it hasura-postgres psql -U postgres -d hasura_demo

# Hasura CLI commands (requires hasura CLI installed)
migrate-status:
	cd hasura && hasura migrate status --admin-secret hasura-admin-secret

migrate-apply:
	cd hasura && hasura migrate apply --admin-secret hasura-admin-secret

metadata-export:
	cd hasura && hasura metadata export --admin-secret hasura-admin-secret

metadata-apply:
	cd hasura && hasura metadata apply --admin-secret hasura-admin-secret

# Slideshow commands
slideshow:
	@echo "To run the slideshow:"
	@echo "1. Open Jupyter at http://localhost:8888 (token: hasura-demo)"
	@echo "2. Navigate to work/hasura_demo_slideshow.ipynb"
	@echo "3. Install RISE: pip install RISE"
	@echo "4. Click the 'Enter/Exit RISE Slideshow' button"
