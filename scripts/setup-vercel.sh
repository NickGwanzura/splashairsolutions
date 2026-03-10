#!/bin/bash

echo "🚀 HVACOps Vercel Setup"
echo "========================"

if ! command -v vercel &> /dev/null; then
    echo "Installing Vercel CLI..."
    npm install -g vercel
fi

echo ""
echo "Please login to Vercel:"
vercel login

echo ""
echo "Initializing project..."
vercel --confirm

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Set environment variables in Vercel Dashboard"
echo "2. Run: npm run db:deploy"
echo "3. Run: npm run db:seed"
echo "4. Deploy: vercel --prod"
