# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Hasura GraphQL Engine demo project showcasing:
- Instant GraphQL API generation from PostgreSQL
- Database migrations and schema management
- Real-time subscriptions
- Role-based access control (RBAC)
- Event triggers and webhooks
- Jupyter notebook slideshow for presentations

## Development Commands

```bash
# Start all services (PostgreSQL, Hasura, Jupyter)
make up
# or
docker-compose up -d

# Stop services
make down

# View logs
make logs

# Access PostgreSQL directly
make psql

# Open Hasura Console in browser
make console

# Open Jupyter Notebook in browser
make jupyter

# Clean up (remove volumes)
make clean
```

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Jupyter       │     │   Hasura        │     │   PostgreSQL    │
│   Notebook      │────▶│   GraphQL       │────▶│   Database      │
│   :8888         │     │   Engine :8080  │     │   :5432         │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

### Directory Structure

```
hasura-demo/
├── docker-compose.yml    # Service definitions
├── Makefile              # Convenience commands
├── init-db/              # Database initialization scripts
│   ├── 01-schema.sql     # Schema creation
│   └── 02-seed-data.sql  # Sample data
├── hasura/               # Hasura CLI project
│   ├── config.yaml       # CLI configuration
│   └── metadata/         # Hasura metadata
├── notebooks/            # Jupyter notebooks
│   └── hasura_demo_slideshow.ipynb
└── README.md
```

## Key URLs

- Hasura Console: http://localhost:8080 (Admin Secret: `hasura-admin-secret`)
- Jupyter Notebook: http://localhost:8888 (Token: `hasura-demo`)
- PostgreSQL: localhost:5432 (User: `postgres`, Password: `postgrespassword`)

## Database Schema

The demo uses an e-commerce schema with tables:
- `users` - User accounts with roles
- `categories` - Product categories (hierarchical)
- `products` - Products with JSONB metadata
- `orders` - Customer orders
- `order_items` - Order line items
- `reviews` - Product reviews

Views:
- `product_stats` - Aggregated product statistics
- `order_summary` - Order summary with customer info
