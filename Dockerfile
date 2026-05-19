FROM mcr.microsoft.com/playwright:v1.60.0-noble

WORKDIR /app

# Install only production deps first (cache layer)
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Playwright browsers are pre-installed in the base image.
# Pin the chromium channel so playwright uses the bundled browser.
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright

# Copy server source and scripts
COPY server/ ./server/
COPY scripts/ ./scripts/

# Runtime defaults — override with env vars or a .env file at run time
ENV NODE_ENV=production \
    PORT=3001 \
    EDITOR_ORIGIN=http://localhost:5173 \
    SWARM_URL=http://host.docker.internal:8000

EXPOSE 3001

CMD ["node", "server/index.js"]
