# Video Processing Service
FROM node:18-slim

WORKDIR /app

# Install system dependencies
RUN rm -rf /var/lib/apt/lists/* && \
    apt-get update && \
    apt-get install -y --no-install-recommends \
    ffmpeg \
    python3 \
    python3-pip \
    && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./

# Install Node.js dependencies
RUN npm install

# Copy application code
COPY . .

# Create directories
RUN mkdir -p /app/assets /app/output

EXPOSE 8002

# Start the service
CMD ["node", "server.js"]
