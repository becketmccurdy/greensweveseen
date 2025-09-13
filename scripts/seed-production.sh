#!/bin/bash

# Script to seed production database with golf courses
# Usage: ./scripts/seed-production.sh [admin_key]

if [ -z "$1" ]; then
    echo "❌ Usage: $0 <admin_key>"
    echo "Example: $0 your-admin-key-here"
    exit 1
fi

ADMIN_KEY="$1"
PRODUCTION_URL="https://app.greensweveseen.com"

echo "🌱 Seeding production database with golf courses..."
echo "🔗 Endpoint: $PRODUCTION_URL/api/admin/seed-courses"

response=$(curl -s -X POST "$PRODUCTION_URL/api/admin/seed-courses" \
  -H "Content-Type: application/json" \
  -d "{\"adminKey\": \"$ADMIN_KEY\"}")

echo "📋 Response:"
echo "$response" | jq '.'

if echo "$response" | jq -e '.success' > /dev/null; then
    echo "✅ Course seeding completed successfully!"
else
    echo "❌ Course seeding failed!"
    exit 1
fi