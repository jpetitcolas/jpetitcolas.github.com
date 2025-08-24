#!/bin/bash

# Start Jekyll blog and Slidev presentation concurrently

echo "Starting Jekyll blog and Slidev presentation..."

# Function to cleanup background processes on exit
cleanup() {
    echo "Stopping services..."
    kill $(jobs -p) 2>/dev/null
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup EXIT INT TERM

# Start Jekyll in Docker (blog)
docker run -v ${PWD}:/usr/src/app -p 4000:4000 starefossen/github-pages jekyll serve \
    --config _config.yml,_config.dev.yml \
    -d /_site \
    --future \
    --incremental \
    --watch \
    --force_polling \
    -H 0.0.0.0 \
    -P 4000 &

# Start webpack dev server
webpack-dev-server --inline --hot --host=0.0.0.0 &

# Start Slidev presentation
cd slides/2025-08-27-you-shouldnt-be-writing-code-anymore && npm run dev &

echo "Services started:"
echo "  - Jekyll blog: http://localhost:4000"
echo "  - Webpack assets: http://localhost:8080"
echo "  - Slidev presentation: http://localhost:3030"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for all background processes
wait