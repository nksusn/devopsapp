#!/bin/bash

# Database initialization script for DevOps with Hilltop
set -e

echo "Starting database initialization..."

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL to be available..."
timeout=30
counter=0

while ! pg_isready -h "$PGHOST" -p "$PGPORT" -U "$PGUSER"; do
    counter=$((counter + 1))
    if [ $counter -gt $timeout ]; then
        echo "Error: PostgreSQL not available after $timeout seconds"
        exit 1
    fi
    echo "Waiting for PostgreSQL... ($counter/$timeout)"
    sleep 1
done

echo "PostgreSQL is ready!"

# Run database migrations
echo "Running database migrations..."
npm run db:push

echo "Database initialization completed successfully!"