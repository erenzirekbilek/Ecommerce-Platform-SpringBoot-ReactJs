🛒 TechHub - Scalable Ecommerce Ecosystem
=========================================

TechHub, yüksek trafikli senaryolar düşünülerek tasarlanmış; Java Spring Boot (Backend) ve React/TypeScript (Frontend) mimarisi üzerine kurulu modern bir e-ticaret platformudur. Performans optimizasyonu için **Redis**, veri bütünlüğü için **PostgreSQL** ve izolasyon için **Docker** kullanır.

🛠️ Teknolojik Donanım (Tech Stack)
-----------------------------------

### **Backend (Microservice-Ready Monolith)**

*   **Java 17 & Spring Boot:** Güçlü tip güvenliği ve Spring Security ile güvenli iş mantığı.
    
*   **PostgreSQL:** Kompleks ilişkisel veriler için optimize edilmiş veritabanı.
    
*   **Redis Caching:** Ürün listeleme ve sepet işlemleri gibi sık kullanılan verilerde düşük gecikme süresi.
    
*   **Hibernate & JPA:** Veritabanı yönetiminde ORM kolaylığı.
    
*   **Docker & Docker Compose:** Ortam bağımsız (portable) çalışma imkanı.
    

### **Frontend (Modern UI/UX)**

*   **React & TypeScript:** Hatasız kodlama ve modüler UI bileşenleri.
    
*   **Redux Toolkit:** Uygulama genelinde tutarlı durum yönetimi (State Management).
    
*   **Tailwind CSS:** Modern, responsive ve hızlı stil yönetimi.
    
*   **Axios:** Interceptor yapısı ile merkezi API yönetimi.
    

🏗️ Sistem Mimarisi ve Akış
---------------------------

Proje, katmanlı bir mimari (Layered Architecture) üzerine inşa edilmiştir.

1.  **Güvenlik:** Kullanıcı girişi sonrası **JWT** üretilir.
    
2.  **Caching:** Ürün detayları ilk istekten sonra **Redis**'e yazılır, sonraki isteklerde veritabanı yükü azaltılır.
    
3.  **Konteynerlaştırma:** Veritabanı ve Redis, docker-compose.yml üzerinden tek komutla ayağa kalkar.
    

🚀 Hızlı Başlangıç
------------------

### 1\. Gereksinimler

*   JDK 17+
    
*   Node.js (v16+)
    
*   Docker Desktop
    

### 2\. Altyapıyı Hazırlama (Docker)

Proje kök dizininde şu komutu çalıştırarak PostgreSQL ve Redis'i başlatın:

Bash

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   docker-compose up -d   `

### 3\. Backend Servisini Çalıştırma

Bash

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   cd backend  ./mvnw spring-boot:run   `

_API servisi varsayılan olarak http://localhost:8080 üzerinde çalışır._

### 4\. Frontend Arayüzünü Başlatma

Bash

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   cd frontend  npm install  npm start   `

_Arayüz http://localhost:5173 adresinde açılacaktır._

🔐 Güvenlik ve Kimlik Doğrulama
-------------------------------

Uygulama, **Stateless JWT** mekanizmasını kullanır.

*   **Üyelik:** Kullanıcı kayıt olduğunda şifresi BCrypt ile hash'lenerek saklanır.
    
*   **Yetkilendirme:** Bazı endpoint'ler (Örn: /admin/\*\*) sadece belirli rollere sahip kullanıcılara açıktır.
    
*   **Header:** İstekler Authorization: Bearer formatında gönderilmelidir.
    

📂 Proje Klasör Yapısı
----------------------

Plaintext

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   TechHub/  ├── backend/            # Spring Boot Kaynak Kodları  │   ├── src/main/java/  # Controller, Service, Repository Katmanları  │   └── src/resources/  # application.yml ve SQL scriptleri  ├── frontend/           # React & TypeScript Uygulaması  │   ├── src/components/ # Tekrar kullanılabilir UI bileşenleri  │   └── src/store/      # Redux Slice ve Store tanımları  ├── docker/             # Docker config dosyaları  └── postman/            # API Test Collection dosyaları   `

📈 Gelecek Geliştirmeler (Roadmap)
----------------------------------

*   \[ \] **Elasticsearch:** Ürün aramalarında ultra hızlı sonuçlar.
    
*   \[ \] **RabbitMQ:** Sipariş onay e-postaları için asenkron kuyruk yapısı.
    
*   \[ \] **Payment Gateway:** Iyzico veya Stripe entegrasyonu.
    
*   \[ \] **K8s:** Kubernetes ile orkestrasyon desteği.