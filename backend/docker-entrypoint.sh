#!/bin/sh
set -e

: "${DATABASE_HOST:=postgres}"
: "${DATABASE_PORT:=5432}"

echo "Waiting for PostgreSQL at ${DATABASE_HOST}:${DATABASE_PORT}..."
until pg_isready -h "$DATABASE_HOST" -p "$DATABASE_PORT" -U "$DATABASE_USER" -d "$DATABASE_NAME" >/dev/null 2>&1; do
  sleep 2
done

echo "Running migrations..."
npm run migration:run

if [ "${RUN_SEED:-true}" = "true" ]; then
  echo "Seeding database..."
  npm run seed
fi

echo "Starting API..."
exec node dist/main.js
