# 🚀 E-Ticaret Mikroservis Mimarisi (E-Commerce Microservices)

Yüksek düzeyde ölçeklenebilir, sağlam ve konteynerize edilmiş, **Mikroservis Mimarisi** ile inşa edilmiş bir e-ticaret arka uç (backend) projesi. Bu proje, modern backend mühendisliği pratiklerini, asenkron servisler arası iletişimi ve temel DevOps prensiplerini uçtan uca göstermektedir.

## 🌟 Temel Özellikler

* **Mikroservis Tasarımı:** Kimlik doğrulama (Auth), Ürünler (Products), Siparişler (Orders) ve Ödemeler (Payments) için birbirinden bağımsız, izole edilmiş servisler.
* **API Gateway:** Tüm istemci istekleri için merkezi giriş noktası (proxy). İstemciden gelen trafiği uygun mikroservislere yönlendirir.
* **Asenkron İletişim:** Birbirinden bağımsız, olay güdümlü (event-driven) süreçler için **RabbitMQ** entegrasyonu (Örn: sipariş oluşturulduğunda ödeme servisinin tetiklenmesi).
* **Konteynerize Altyapı:** Tek komutla tüm çalışma ortamının kurulabilmesi için `docker-compose` ile tamamen Dockerize edilmiş sistem mimarisi.
* **Veritabanı Yönetimi:** Tip güvenli (type-safe) veritabanı erişimi ve otomatik şema yönetimi için **Prisma ORM** ile entegre edilmiş **PostgreSQL**.

## 🛠️ Kullanılan Teknolojiler

* **Backend:** Node.js, TypeScript, Express.js
* **Veritabanı:** PostgreSQL, Prisma ORM
* **Mesaj Kuyruğu (Message Broker):** RabbitMQ
* **DevOps & Altyapı:** Docker, Docker Compose
* **API Test ve Geliştirme:** Postman

## 🏗️ Mimariye Genel Bakış

1. **API Gateway (Port 4000):** İstemciden gelen trafiği karşılar ve içerideki servislere dağıtır.
2. **Auth Service (Port 5000):** Kullanıcı kaydı ve JWT tabanlı yetkilendirme işlemlerini yürütür.
3. **Product Service (Port 5001):** Ürün kataloğunu ve stok durumunu yönetir.
4. **Order Service (Port 5002):** Müşteri siparişlerini işler ve mesaj kuyruğuna (RabbitMQ) olay (event) fırlatır.
5. **Payment Service (Port 5003):** Sipariş olayları için RabbitMQ'yu dinler, mesajı yakalar ve ödeme senaryosunu işler.

## 🚀 Kurulum ve Çalıştırma (Lokal Ortam)
