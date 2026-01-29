🛒 Ecommerce-Platform-SpringBoot-ReactJs
========================================

Bu proje; Java Spring Boot (Backend) ve React/TypeScript (Frontend) kullanılarak geliştirilmiş, yüksek performanslı ve ölçeklenebilir bir e-ticaret platformudur. Cache mekanizması için Redis, veritabanı olarak PostgreSQL ve konteynerlaştırma için Docker kullanılmıştır.

🛠 Kullanılan Teknolojiler
--------------------------

### Backend

*   **Java & Spring Boot:** Uygulama iskeleti ve iş mantığı.
    
*   **PostgreSQL:** İlişkisel veritabanı yönetimi.
    
*   **Redis:** Performans artırımı ve önbellekleme (Caching).
    
*   **Docker:** Uygulamanın ve servislerin izole şekilde çalıştırılması.
    
*   **Auth Token (JWT):** Güvenli kimlik doğrulama ve yetkilendirme.
    
*   **Postman:** API testleri ve dökümantasyonu.
    

### Frontend

*   **React JS & TypeScript:** Dinamik ve tip güvenli arayüz geliştirme.
    
*   **React Redux:** Merkezi durum yönetimi (State Management).
    
*   **CSS/Sass/Tailwind:** (Kullandığın kütüphaneye göre burayı güncelleyebilirsin).
    

🚀 Kurulum ve Çalıştırma
------------------------

### 1\. Gereksinimler

*   JDK 17 veya üzeri
    
*   Node.js & npm
    
*   Docker Desktop (PostgreSQL ve Redis için önerilir)
    

2\. Backend'i Başlatmacd backend-klasorun

\# Docker üzerinden veritabanı ve Redis'i ayağa kaldırın

docker-compose up -d

\# Uygulamayı çalıştırın

./mvnw spring-boot:run

### 3\. Frontend'i Başlatma

cd frontend-klasorunnpm installnpm start📂 Proje Yapısı

*   Backend/: Spring Boot projesi ve API yapılandırmaları.
    
*   Frontend/: React & TypeScript arayüz kodları.
    
*   Docker/: Veritabanı ve Redis konfigürasyon dosyaları.
    
*   Postman/: API test koleksiyonları.
    

🔐 Güvenlik (Auth)

Projede **JWT (JSON Web Token)** tabanlı kimlik doğrulama kullanılmaktadır. Kullanıcı giriş yaptığında bir token alır ve sonraki isteklerde bu token'ı Authorization: Bearer başlığıyla gönderir.