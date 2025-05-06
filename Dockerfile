FROM node:22-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Copy environment file if it exists
COPY .env.local .env.local

# Build the application using npm run build
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

# Create a non-root user and group with numeric ID
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy the entire app including node_modules (not using standalone mode)
COPY --from=builder /app ./
COPY --from=builder /app/.env.local ./.env.local

# Set the correct permissions
USER nextjs

# Expose the port the app will run on
EXPOSE 3000

# Run the application using npm run start
CMD ["npm", "run", "start"] 