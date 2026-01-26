#!/bin/bash
set -e

echo "Starting Hasura GraphQL Engine..."

# Start graphql-engine in background
graphql-engine serve &
ENGINE_PID=$!

# Wait for engine to be ready
echo "Waiting for GraphQL Engine to be ready..."
until curl -s http://localhost:8080/healthz > /dev/null 2>&1; do
    sleep 1
done
echo "GraphQL Engine is ready!"

# Update config to point to localhost
cat > /hasura/config.yaml << EOF
version: 3
endpoint: http://localhost:8080
admin_secret: ${HASURA_GRAPHQL_ADMIN_SECRET:-hasura-admin-secret}
metadata_directory: metadata
migrations_directory: migrations
seeds_directory: seeds
EOF

# Start hasura console bound to all interfaces
echo "Starting Hasura Console on port 9695..."
cd /hasura
hasura console \
    --address 0.0.0.0 \
    --console-port 9695 \
    --api-port 9693 \
    --no-browser \
    --admin-secret "${HASURA_GRAPHQL_ADMIN_SECRET:-hasura-admin-secret}" &

# Wait for either process to exit
wait $ENGINE_PID
