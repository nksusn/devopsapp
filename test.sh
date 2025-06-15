#!/bin/bash

# Simple test script for DevOps with Hilltop
echo "🚀 Running DevOps with Hilltop Tests..."

# Set environment variables
export NODE_ENV=test
export DATABASE_URL=postgresql://test:test@localhost:5432/test_db

# Run our custom test runner
node run-tests.js

# Check exit code
if [ $? -eq 0 ]; then
    echo "✅ All tests completed successfully!"
    exit 0
else
    echo "❌ Tests failed!"
    exit 1
fi