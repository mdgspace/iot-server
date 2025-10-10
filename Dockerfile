# --- Stage 1: The Builder ---
# This stage installs all tools and builds the dependencies
FROM node:lts-alpine AS builder

WORKDIR /app

# Install all necessary build tools in one command
RUN apk add --no-cache build-base pkgconfig python3 cairo-dev pango-dev libjpeg-turbo-dev giflib-dev

# Copy package.json AND package-lock.json for reproducible builds
COPY package*.json ./

# Install all dependencies
RUN npm install

# Copy the rest of your app's source code
COPY . .


# --- Stage 2: The Final Image ---
# This stage creates the small, final image for production
FROM node:lts-alpine

WORKDIR /app

# Copy only the necessary files from the 'builder' stage
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/index.js ./index.js
# Add any other folders/files your app needs, e.g., COPY --from=builder /app/public ./public

EXPOSE 5000

# Set the command to run your app
CMD ["node", "index.js"]