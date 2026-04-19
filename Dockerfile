# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/
COPY tsconfig*.json ./

RUN npm install

COPY . .

ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"

RUN npx prisma generate
RUN npm run build

# Stage 2: Production
FROM node:20-alpine AS production

WORKDIR /app

COPY package*.json ./

RUN npm install --omit=dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/generated ./src/generated

# ❌ Hapus baris .prisma
# COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

COPY prisma ./prisma/

EXPOSE 3001

CMD ["node", "dist/src/main.js"]