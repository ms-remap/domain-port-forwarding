FROM node:18-alpine

WORKDIR /app

# Copy files
COPY package*.json ./
RUN npm install --production

COPY . .

ENV NODE_ENV=production

EXPOSE 3000

CMD ["node", "index.js"]
