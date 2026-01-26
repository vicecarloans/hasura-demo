# Use the official Hasura GraphQL Engine image from Docker Hub
FROM hasura/graphql-engine:v2.44.0.cli-migrations-v3

COPY migrations /hasura-migrations
COPY metadata /hasura-metadata
COPY config.yaml .
# Expose the port Hasura is running on
EXPOSE 8080

CMD ["graphql-engine", "serve"]