#!/bin/bash
# Replit startup script

echo "🚀 Starting FreshRoute Delivery Management System..."
echo "Installing dependencies..."
npm install

echo "Building TypeScript..."
npm run build

echo "Starting server..."
npm start
