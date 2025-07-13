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
RUN mkdir -p dist && \
    npm run build

# Verify the build
RUN ls -la dist/

# Clean up dev dependencies
RUN npm prune --production

# Expose the port the app runs on
EXPOSE 3001

# Start the application
CMD ["npm", "start"] 