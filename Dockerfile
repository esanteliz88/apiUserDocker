FROM node:18-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --legacy-peer-deps && \
    npm install helmet --legacy-peer-deps && \
    npm cache clean --force

COPY . .

EXPOSE 3000

CMD ["node", "src/index.js"] 