#!/bin/bash

#!/bin/bash
# fresh-start-server.bash
# -----------------------------------------------
# Resets and restarts the server with a clean DB
# -----------------------------------------------

set -e  # exit immediately if any command fails

echo "🚀 Starting fresh server setup..."

# Step 1: Move into the server folder
cd "$(dirname "$0")/server"

# Step 2: Confirm Prisma folder exists
if [ ! -d "prisma" ]; then
  echo "❌ prisma folder not found in $(pwd)"
  exit 1
fi

# Step 3: Reset the database (drops all data, re-applies migrations)
echo "🧹 Resetting Prisma database..."
npx prisma migrate reset --force

# Step 4: Regenerate Prisma client
echo "🔄 Generating Prisma client..."
npx prisma generate

# Step 5: Re-run all migrations
echo "📦 Running migrations..."
npx prisma migrate dev --name fresh_start

# Step 6: Start the dev server
echo "🌐 Starting development server..."
npm run dev
