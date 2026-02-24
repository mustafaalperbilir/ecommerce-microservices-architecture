FROM node:18-slim

WORKDIR /app

COPY package*.json ./

# Kötü internet için dayanıklı kurulum ayarları
RUN npm config set fetch-retry-maxtimeout 600000 && \
    npm config set fetch-retries 5 && \
    npm install

COPY . .

CMD ["npm", "run", "dev"]