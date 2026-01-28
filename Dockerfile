FROM node:18-alpine

WORKDIR /app

# Copy files
COPY package*.json ./
RUN npm install --production

COPY . .

ENV NODE_ENV=production
ENV PORT=2145

EXPOSE 2145

CMD ["node", "index.js"]
