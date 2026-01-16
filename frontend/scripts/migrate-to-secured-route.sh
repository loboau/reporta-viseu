#!/bin/bash

# Migration script to replace the existing route with the secured version
# This script safely backs up the original and replaces it with the secured version

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
ROUTE_DIR="$PROJECT_ROOT/src/app/api/generate-letter"
ORIGINAL_ROUTE="$ROUTE_DIR/route.ts"
SECURED_ROUTE="$ROUTE_DIR/route.secured.ts"
BACKUP_ROUTE="$ROUTE_DIR/route.backup.ts"

echo "🔒 AI/LLM Security Migration Script"
echo "===================================="
echo ""

# Check if we're in the right directory
if [ ! -d "$ROUTE_DIR" ]; then
    echo "❌ Error: Route directory not found at $ROUTE_DIR"
    exit 1
fi

# Check if secured route exists
if [ ! -f "$SECURED_ROUTE" ]; then
    echo "❌ Error: Secured route not found at $SECURED_ROUTE"
    exit 1
fi

# Check if original route exists
if [ ! -f "$ORIGINAL_ROUTE" ]; then
    echo "❌ Error: Original route not found at $ORIGINAL_ROUTE"
    exit 1
fi

# Show what we're about to do
echo "📁 Project root: $PROJECT_ROOT"
echo "📝 Original route: $ORIGINAL_ROUTE"
echo "🔒 Secured route: $SECURED_ROUTE"
echo "💾 Backup location: $BACKUP_ROUTE"
echo ""

# Ask for confirmation
read -p "⚠️  This will replace your current route with the secured version. Continue? (y/N) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Migration cancelled"
    exit 1
fi

# Create backup
echo "💾 Creating backup..."
cp "$ORIGINAL_ROUTE" "$BACKUP_ROUTE"

if [ $? -eq 0 ]; then
    echo "✅ Backup created at $BACKUP_ROUTE"
else
    echo "❌ Failed to create backup"
    exit 1
fi

# Replace with secured version
echo "🔄 Replacing route with secured version..."
cp "$SECURED_ROUTE" "$ORIGINAL_ROUTE"

if [ $? -eq 0 ]; then
    echo "✅ Route replaced successfully"
else
    echo "❌ Failed to replace route"
    echo "⚠️  Restoring backup..."
    cp "$BACKUP_ROUTE" "$ORIGINAL_ROUTE"
    exit 1
fi

# Check if security library exists
SECURITY_LIB="$PROJECT_ROOT/src/lib/ai-security"
if [ ! -d "$SECURITY_LIB" ]; then
    echo "❌ Warning: Security library not found at $SECURITY_LIB"
    echo "   The route will not work without the security library!"
    echo "   Make sure all security modules are in place."
else
    echo "✅ Security library found"
fi

# Check if middleware exists
MIDDLEWARE="$PROJECT_ROOT/src/middleware.ts"
if [ ! -f "$MIDDLEWARE" ]; then
    echo "⚠️  Warning: Middleware not found at $MIDDLEWARE"
    echo "   Consider adding the middleware for additional security."
else
    echo "✅ Middleware found"
fi

echo ""
echo "✅ Migration completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Review the changes in $ORIGINAL_ROUTE"
echo "2. Ensure GEMINI_API_KEY is set in your environment"
echo "3. Test the API with: npm run dev"
echo "4. Run security tests: npx ts-node scripts/test-ai-security.ts"
echo "5. Monitor the logs for any issues"
echo ""
echo "🔄 To rollback:"
echo "   cp $BACKUP_ROUTE $ORIGINAL_ROUTE"
echo ""
echo "📚 Documentation:"
echo "   See AI_SECURITY.md for complete security documentation"
echo ""
