FROM node:lts-alpine AS builder
WORKDIR /app
RUN apk add --no-cache build-base pkgconfig python3 cairo-dev pango-dev libjpeg-turbo-dev giflib-dev
COPY package*.json ./
RUN npm install
COPY . .
FROM node:lts-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/index.js ./index.js
EXPOSE 5000
CMD ["node", "index.js"]
