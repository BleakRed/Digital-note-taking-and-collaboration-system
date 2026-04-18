#!/usr/bin/env bash
# test-setup.sh — Sets up a local Docker Postgres test database and runs tests
# Run once: bash test-setup.sh

set -e

CONTAINER_NAME="notion_clone_test"
POSTGRES_USER="testuser"
POSTGRES_DB="notion_clone_test"
POSTGRES_PASSWORD="testpass"
HOST_PORT=5433

echo "==> Stopping and removing old container if exists..."
docker rm -f "$CONTAINER_NAME" 2>/dev/null || true

echo "==> Starting Postgres test container..."
docker run -d \
  --name "$CONTAINER_NAME" \
  -e POSTGRES_USER="$POSTGRES_USER" \
  -e POSTGRES_DB="$POSTGRES_DB" \
  -e POSTGRES_PASSWORD="$POSTGRES_PASSWORD" \
  -p "${HOST_PORT}:5432" \
  postgres:latest

echo "==> Waiting for Postgres to be ready..."
for i in $(seq 1 30); do
  if docker exec "$CONTAINER_NAME" pg_isready -U "$POSTGRES_USER" >/dev/null 2>&1; then
    echo "==> Postgres is ready!"
    break
  fi
  sleep 1
done

echo "==> Writing .env.test..."
cat > .env.test << EOF
DATABASE_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@localhost:${HOST_PORT}/${POSTGRES_DB}"
DIRECT_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@localhost:${HOST_PORT}/${POSTGRES_DB}"
JWT_SECRET="test-jwt-secret-for-diploma-testing-only"
EOF

echo "==> Running Prisma migrations..."
DATABASE_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@localhost:${HOST_PORT}/${POSTGRES_DB}" \
  npx prisma migrate deploy

echo "==> Running tests with coverage..."
npm run test:coverage 2>&1 | tee test-results.txt

echo ""
echo "==> Test results saved to test-results.txt"
echo "==> Coverage report at coverage/index.html"
echo ""
echo "==> Stopping container..."
docker stop "$CONTAINER_NAME"
echo "==> Done!"
