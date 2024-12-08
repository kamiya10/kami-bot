FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

ENV NODE_ENV=production

RUN npm ci && npm run build

COPY . .

CMD ["node", "dist/index.js"]