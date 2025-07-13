# Use Node.js LTS version
FROM node:18-alpine

# Install build dependencies
RUN apk add --no-cache python3 make g++

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies including TypeScript
RUN npm install

# Copy source code and configuration files
COPY . .

# Show current directory structure for debugging
RUN echo "Current directory structure:" && ls -la

# Generate Prisma Client
RUN npx prisma generate

# Show TypeScript version
RUN echo "TypeScript version:" && npx tsc --version

# Build TypeScript with verbose output
RUN echo "Building TypeScript..." && \
    npx tsc --listFiles && \
    npx tsc

# Show dist directory contents
RUN echo "Dist directory contents:" && ls -la dist/

# Clean up dev dependencies
RUN npm prune --production

# Expose the port the app runs on
EXPOSE 3001

# Start the application
CMD ["node", "dist/index.js"] 