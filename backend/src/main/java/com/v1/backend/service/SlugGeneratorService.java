package com.v1.backend.service;

import com.v1.backend.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import java.text.Normalizer;
import java.util.Locale;

@Service
@RequiredArgsConstructor
@Slf4j
public class SlugGeneratorService {

    private final CategoryRepository categoryRepository;


    public String generate(String text) {
        if (text == null || text.isEmpty()) {
            return "";
        }

        // 1. Türkçe karakterleri dönüştür (Normalizer ile)
        String normalized = Normalizer.normalize(text, Normalizer.Form.NFD);

        // 2. Aksan işaretlerini kaldır (é -> e, ş -> s, etc.)
        String ascii = normalized.replaceAll("\\p{M}", "");

        // 3. Küçük harfe çevir
        String lowercase = ascii.toLowerCase(Locale.ROOT);

        // 4. Boşlukları trim et
        String trimmed = lowercase.trim();

        // 5. Boşlukları ve özel karakterleri tire ile değiştir
        String withHyphens = trimmed
                .replaceAll("\\s+", "-")      // Boşluklar -> tire
                .replaceAll("[^a-z0-9-]", ""); // Sadece a-z, 0-9, - bırak

        // 6. Birden fazla tireyi tek tireye indirge
        String singleHyphens = withHyphens.replaceAll("-+", "-");

        // 7. Başındaki ve sonundaki tireleri kaldır
        String cleanSlug = singleHyphens.replaceAll("^-|-$", "");

        log.debug("Slug oluşturuldu: '{}' -> '{}'", text, cleanSlug);

        return cleanSlug;
    }

    /**
     * Slug'ı benzersiz yap (varsa sonuna sayı ekle)
     *
     * Örnek:
     * "elektronik" zaten varsa -> "elektronik-2"
     * "elektronik-2" de varsa -> "elektronik-3"
     */
    public String makeUnique(String slug) {
        if (!categoryRepository.existsBySlug(slug)) {
            return slug;
        }

        int counter = 2;
        String uniqueSlug;

        do {
            uniqueSlug = slug + "-" + counter;
            counter++;
        } while (categoryRepository.existsBySlug(uniqueSlug) && counter < 100);

        log.info("Benzersiz slug oluşturuldu: {} (varolan slug: {})", uniqueSlug, slug);

        return uniqueSlug;
    }

    /**
     * Slug oluştur ve benzersizliğini sağla (tek işlemde)
     *
     * Kullanım:
     * String slug = slugGeneratorService.generateUnique("Akıllı Telefon");
     */
    public String generateUnique(String text) {
        String slug = generate(text);
        return makeUnique(slug);
    }

    /**
     * Slug'ın geçerli olup olmadığını kontrol et
     *
     * Geçerli slug: "elektronik", "akilli-telefon", "test-123"
     * Geçersiz slug: "-elektronik", "elektronik-", "elektronik--test", "ELEKTRONIK"
     */
    public boolean isValidSlug(String slug) {
        if (slug == null || slug.isEmpty()) {
            return false;
        }

        // Slug formatı: sadece küçük harfler, rakamlar ve tire
        // Başında/sonunda tire olamaz, birden fazla tire olamaz
        return slug.matches("^[a-z0-9]([a-z0-9-]*[a-z0-9])?$");
    }

    /**
     * Slug'ı normalize et (geçersiz slug'ları düzelt)
     *
     * Örnek:
     * "-elektronik-" -> "elektronik"
     * "ELEKTRONIK" -> "elektronik"
     * "elektronik--test" -> "elektronik-test"
     */
    public String normalize(String slug) {
        if (slug == null || slug.isEmpty()) {
            return "";
        }

        return slug
                .toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9-]", "")  // Geçersiz karakterleri kaldır
                .replaceAll("-+", "-")          // Birden fazla tireyi tek tireye indirge
                .replaceAll("^-|-$", "");       // Başındaki ve sonundaki tireleri kaldır
    }

    /**
     * Slug'ın uzunluğunu kontrol et (max 150 karakter)
     */
    public boolean isValidLength(String slug) {
        return slug != null && slug.length() >= 2 && slug.length() <= 150;
    }
}

// ============================================================
// KULLANIM ÖRNEKLERİ
// ============================================================

/*
@Service
public class CategoryService {

    private final SlugGeneratorService slugGeneratorService;

    public void createCategory(CategoryCreateRequest request) {
        // SEÇENEK 1: Otomatik slug oluştur ve benzersiz yap
        String slug = slugGeneratorService.generateUnique(request.getName());

        // SEÇENEK 2: Kullanıcı slug vermişse kontrol et
        if (!slugGeneratorService.isValidSlug(request.getSlug())) {
            throw new CategoryException("Geçersiz slug formatı");
        }

        if (categoryRepository.existsBySlug(request.getSlug())) {
            throw new CategoryException("Bu slug zaten mevcut");
        }

        // Kategoriyi oluştur
        Category category = Category.builder()
            .name(request.getName())
            .slug(request.getSlug())
            .build();

        categoryRepository.save(category);
    }
}
*/