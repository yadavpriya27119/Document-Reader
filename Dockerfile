# Build frontend, then run API + static SPA from one process
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
COPY backend/package.json backend/
COPY frontend/package.json frontend/
RUN npm ci --workspaces --include-workspace-root
COPY backend backend
COPY frontend frontend
RUN npm run build -w frontend

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json ./
COPY backend/package.json backend/
COPY frontend/package.json frontend/
RUN npm ci --omit=dev --workspaces --include-workspace-root
COPY backend backend
COPY --from=build /app/frontend/dist frontend/dist
EXPOSE 3000
CMD ["node", "backend/server.js"]
