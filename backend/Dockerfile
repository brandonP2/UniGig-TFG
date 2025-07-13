# Use Node.js LTS version
FROM node:18-alpine

# Install build dependencies and SSL libraries
RUN apk add --no-cache python3 make g++ openssl openssl-dev

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code and configuration files
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build TypeScript and verify the output
RUN npm run build && \
    ls -la dist/ && \
    ls -la dist/src/ && \
    ls -la dist/prisma/

# Move files to correct location
RUN mv dist/src/* dist/ && \
    mv dist/prisma/* dist/ && \
    rm -rf dist/src dist/prisma

# Clean up dev dependencies
RUN npm prune --production

# Expose the port the app runs on
EXPOSE 3001

# Start the application
CMD ["node", "dist/index.js"] 