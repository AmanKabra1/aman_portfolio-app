#!/bin/bash

# Portfolio Backend Migration Script
# Migrates from Express.js to NestJS

set -e  # Exit on error

echo "================================================"
echo "Portfolio Backend Migration - Express to NestJS"
echo "================================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Check prerequisites
echo "Step 1: Checking prerequisites..."
echo "--------------------------------"

if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed${NC}"
    exit 1
fi

NODE_VERSION=$(node -v)
echo -e "${GREEN}✓ Node.js $NODE_VERSION installed${NC}"
echo ""

# Step 2: Copy environment variables
echo "Step 2: Setting up environment variables..."
echo "--------------------------------------------"

if [ -f "../backend/.env" ]; then
    echo "Copying .env from Express backend..."
    cp ../backend/.env .env
    echo -e "${GREEN}✓ Environment variables copied${NC}"
else
    echo -e "${YELLOW}⚠ No .env file found in Express backend${NC}"
    echo "Please create a .env file manually from .env.example"
    cp .env.example .env
    echo -e "${YELLOW}⚠ Created .env from template - please update it${NC}"
fi
echo ""

# Step 3: Install dependencies
echo "Step 3: Installing NestJS dependencies..."
echo "-----------------------------------------"
npm install
echo -e "${GREEN}✓ Dependencies installed${NC}"
echo ""

# Step 4: Generate Prisma Client
echo "Step 4: Generating Prisma Client..."
echo "------------------------------------"
npx prisma generate
echo -e "${GREEN}✓ Prisma Client generated${NC}"
echo ""

# Step 5: Database check
echo "Step 5: Checking database connection..."
echo "----------------------------------------"
if npx prisma db push --accept-data-loss > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Database connection successful${NC}"
else
    echo -e "${YELLOW}⚠ Could not connect to database${NC}"
    echo "Please ensure:"
    echo "  1. MySQL is running"
    echo "  2. DATABASE_URL in .env is correct"
    echo "  3. Database exists"
fi
echo ""

# Step 6: Build the application
echo "Step 6: Building NestJS application..."
echo "---------------------------------------"
npm run build
echo -e "${GREEN}✓ Application built successfully${NC}"
echo ""

# Summary
echo "================================================"
echo "Migration Complete!"
echo "================================================"
echo ""
echo "Next steps:"
echo "1. Stop your Express backend server"
echo "2. Start the NestJS server with: npm run start:dev"
echo "3. Test the API endpoints at http://localhost:5000"
echo ""
echo "Verification checklist:"
echo "  [ ] API health check: curl http://localhost:5000/health"
echo "  [ ] Login endpoint: POST /api/auth/login"
echo "  [ ] Public endpoints work without authentication"
echo "  [ ] Protected endpoints require Authorization header"
echo "  [ ] Frontend can connect and fetch data"
echo ""
echo -e "${GREEN}🎉 Happy coding with NestJS!${NC}"
