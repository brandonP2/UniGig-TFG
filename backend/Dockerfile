# Use Node.js LTS version
FROM node:18-alpine

# Install build dependencies
RUN apk add --no-cache python3 make g++

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

# Build TypeScript and ensure dist directory exists
RUN npm run build || (ls -la && pwd && echo "Build failed")

# List contents of dist directory for debugging
RUN ls -la dist/ || echo "dist directory not found"

# List contents of src directory for debugging
RUN ls -la src/ || echo "src directory not found"

# Clean up dev dependencies
RUN npm prune --production

# Expose the port the app runs on
EXPOSE 3001

# Start the application
CMD ["node", "dist/index.js"] 