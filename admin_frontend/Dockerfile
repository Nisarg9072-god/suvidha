FROM node:18-alpine AS build
WORKDIR /app
ENV NODE_ENV=production
COPY package.json ./
# Install deps; prefer npm ci for clean reproducible builds
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:1.25-alpine
WORKDIR /usr/share/nginx/html
RUN rm -rf ./*
COPY --from=build /app/dist ./
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost/ || exit 1
