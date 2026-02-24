# --- 1. AŞAMA: İNŞA (BUILDER) ---
FROM golang:alpine AS builder
WORKDIR /app

# Go modül dosyalarını kopyala ve bağımlılıkları indir
COPY go.mod go.sum ./
RUN go mod download

# Tüm kodları kopyala ve projeyi derle ("main" adında bir çalıştırılabilir dosya oluştur)
COPY . .
RUN go build -o main .

# --- 2. AŞAMA: ÇALIŞTIRMA (RUNNER) ---
# Sadece çalıştırılabilir dosyayı alıyoruz, böylece imajımız MB'lar seviyesinde kalıyor!
FROM alpine:latest

WORKDIR /app

# İlk aşamadan sadece derlenmiş dosyayı kopyala
COPY --from=builder /app/main .

# Çalıştır
CMD ["./main"]