# Hasura GraphQL Engine Demo

A comprehensive demo showcasing Hasura GraphQL Engine features including:
- Instant GraphQL API generation
- Database migrations and schema management
- Real-time subscriptions
- Role-based access control
- Event triggers and webhooks
- Latest Hasura v2.48+ and v3 features

## Prerequisites

- Docker & Docker Compose
- (Optional) [Hasura CLI](https://hasura.io/docs/latest/hasura-cli/install-hasura-cli/) for migrations

## Quick Start

### 1. Start the Demo Environment

```bash
# Start all services (PostgreSQL, Hasura, Jupyter)
docker-compose up -d

# Check service status
docker-compose ps
```

### 2. Access the Services

| Service | URL | Credentials |
|---------|-----|-------------|
| Hasura Console | http://localhost:8080 | Admin Secret: `hasura-admin-secret` |
| Jupyter Notebook | http://localhost:8888 | Token: `hasura-demo` |
| PostgreSQL | localhost:5432 | User: `postgres`, Password: `postgrespassword` |

### 3. Initialize Hasura (Track Tables)

1. Open Hasura Console at http://localhost:8080
2. Enter admin secret: `hasura-admin-secret`
3. Go to **Data** tab
4. Click **Track All** to track all tables and relationships
5. Also track the views: `product_stats` and `order_summary`

### 4. Run the Slideshow

1. Open Jupyter at http://localhost:8888 (token: `hasura-demo`)
2. Navigate to `work/hasura_demo_slideshow.ipynb`
3. Run as slideshow: **View > Cell Toolbar > Slideshow**, then use RISE or convert:
   ```bash
   # Install RISE for live slideshow (inside Jupyter terminal)
   pip install RISE

   # Or export to HTML slides
   jupyter nbconvert hasura_demo_slideshow.ipynb --to slides
   ```

## Demo Database Schema

```
┌─────────────┐       ┌─────────────┐
│   users     │       │ categories  │
├─────────────┤       ├─────────────┤
│ id (PK)     │       │ id (PK)     │
│ email       │       │ name        │
│ name        │       │ description │
│ role        │       │ parent_id   │◄──┐
└──────┬──────┘       └──────┬──────┘   │
       │                     │          │
       │                     │ (self-ref)
       │              ┌──────┴──────┐   │
       │              │  products   │───┘
       │              ├─────────────┤
       │              │ id (PK)     │
       │              │ name        │
       │              │ price       │
       │              │ category_id │
       │              │ metadata    │
       │              └──────┬──────┘
       │                     │
┌──────┴──────┐       ┌──────┴──────┐
│   orders    │       │  reviews    │
├─────────────┤       ├─────────────┤
│ id (PK)     │       │ id (PK)     │
│ user_id (FK)│       │ user_id (FK)│
│ status      │       │ product_id  │
│ total_amount│       │ rating      │
└──────┬──────┘       │ comment     │
       │              └─────────────┘
       │
┌──────┴──────┐
│ order_items │
├─────────────┤
│ id (PK)     │
│ order_id(FK)│
│ product_id  │
│ quantity    │
│ unit_price  │
└─────────────┘
```

## Key Features Demonstrated

### 1. Instant GraphQL API
Hasura automatically generates queries, mutations, and subscriptions from your database schema.

### 2. Powerful Filtering
Built-in operators: `_eq`, `_neq`, `_gt`, `_lt`, `_like`, `_ilike`, `_in`, `_contains`, etc.

### 3. Relationships
Automatic foreign key detection with object and array relationships.

### 4. Aggregations
Built-in `_aggregate` queries for count, sum, avg, min, max.

### 5. Real-time Subscriptions
Live data updates via GraphQL subscriptions.

### 6. Role-Based Access Control
Fine-grained permissions at row and column level.

### 7. Event Triggers
Webhooks triggered on INSERT, UPDATE, DELETE operations.

### 8. Actions
Custom business logic exposed as GraphQL endpoints.

## Sample GraphQL Queries

### Fetch Products with Category
```graphql
query {
  products(order_by: {price: desc}, limit: 5) {
    name
    price
    category {
      name
    }
  }
}
```

### Filter with JSONB
```graphql
query {
  products(where: {metadata: {_contains: {brand: "Apple"}}}) {
    name
    metadata
  }
}
```

### Aggregations
```graphql
query {
  orders_aggregate {
    aggregate {
      count
      sum { total_amount }
      avg { total_amount }
    }
  }
}
```

### Create Order with Items
```graphql
mutation {
  insert_orders_one(
    object: {
      user_id: "550e8400-e29b-41d4-a716-446655440003"
      status: "pending"
      order_items: {
        data: [
          {product_id: "660e8400-e29b-41d4-a716-446655440001", quantity: 1, unit_price: 2499.00}
        ]
      }
    }
  ) {
    id
    order_items {
      product { name }
      quantity
    }
  }
}
```

## Using Hasura CLI

```bash
# Install Hasura CLI
curl -L https://github.com/hasura/graphql-engine/raw/stable/cli/get.sh | bash

# Navigate to hasura directory
cd hasura

# Create a new migration
hasura migrate create add_new_table --from-server

# Apply migrations
hasura migrate apply

# Export metadata
hasura metadata export

# Apply metadata
hasura metadata apply

# Open console (with migration tracking)
hasura console
```

## Useful Commands

```bash
# View logs
docker-compose logs -f hasura

# Restart services
docker-compose restart

# Stop all services
docker-compose down

# Stop and remove volumes (clean slate)
docker-compose down -v

# Connect to PostgreSQL
docker exec -it hasura-postgres psql -U postgres -d hasura_demo
```

## Latest Hasura Features (v2.48+)

- **PostgreSQL 17 Support** - Full compatibility with latest PostgreSQL
- **Enhanced Streaming Subscriptions** - Reduced data transfer for multiplexed queries
- **New Config Options** - `HASURA_GRAPHQL_PRESERVE_401_ERRORS`, `HASURA_GRAPHQL_SERVER_TIMEOUT`
- **Security Improvements** - Protected sensitive values in event trigger logs

## Hasura v3 Preview

- **Rust-based Engine** - Rewritten from Haskell for better performance
- **Native Data Connectors (NDC)** - Standardized connector specification
- **New Metadata Objects** - Models, Commands, Relationships, Global IDs
- **Cross-source Relationships** - Link data across different databases

## Resources

- [Hasura Documentation](https://hasura.io/docs/)
- [GraphQL Engine GitHub](https://github.com/hasura/graphql-engine)
- [Hasura Blog](https://hasura.io/blog/)
- [Community Discord](https://discord.gg/hasura)
