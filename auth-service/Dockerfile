# Temel imaj olarak hafif bir Node.js sürümü kullanıyoruz
FROM node:18-slim

RUN apt-get update -y && apt-get install -y openssl
# ---------------------------


# Konteyner içindeki çalışma dizinimiz
WORKDIR /app

# Önce sadece package.json dosyalarını kopyala (Önbelleği verimli kullanmak için)
COPY package*.json ./

# Bağımlılıkları kur
RUN npm install

# Prisma kullanıyorsan (Product ve Order servislerinde) Prisma client'ı oluşturması için
# (Eğer serviste Prisma yoksa bu satır hata vermez, sessizce geçer veya silebilirsin)
# 1. Önce bağımlılıkları kur (Tank seviyesi komutumuz kalsın)
RUN npm config set fetch-retry-maxtimeout 600000 && \
    npm config set fetch-retries 5 && \
    npm install

# 2. Kodları kopyalamadan ÖNCE prisma klasörünü kopyala (Hız için)
COPY prisma ./prisma/

# 3. Prisma client'ı zorla oluştur (Hata alırsa süreci durdurması için || true kısmını sildik)
RUN npx prisma generate

# 4. En son geri kalan tüm kodları kopyala
COPY . .

# Servisi başlat
CMD ["npm", "run", "dev"]