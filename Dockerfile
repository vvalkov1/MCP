FROM node:18-alpine
WORKDIR /app
COPY package*.json tsconfig.json ./
RUN npm install
COPY src ./src
RUN npm run build
EXPOSE 3100
CMD ["node", "dist/index.js"]