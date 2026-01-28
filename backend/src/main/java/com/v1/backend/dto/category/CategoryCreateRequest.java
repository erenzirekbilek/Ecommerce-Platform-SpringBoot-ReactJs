package com.v1.backend.dto.category;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.validator.constraints.URL;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategoryCreateRequest {

    @NotBlank(message = "Kategori adı zorunludur")
    @Size(min = 2, max = 100, message = "Kategori adı 2-100 karakter olmalıdır")
    private String name;

    @NotBlank(message = "Kategori slug zorunludur")
    @Size(min = 2, max = 150, message = "Kategori slug 2-150 karakter olmalıdır")
    @Pattern(regexp = "^[a-z0-9-]+$", message = "Slug sadece küçük harfler, rakamlar ve tire içerebilir")
    private String slug;

    @Size(max = 500, message = "Açıklama 500 karakteri aşamaz")
    private String description;

    @Size(max = 500, message = "İmage URL 500 karakteri aşamaz")
    @URL(message = "Geçerli bir URL giriniz", regexp = "^(https?://.+)?$")
    private String imageUrl;

    @Min(value = 0, message = "Display order 0 veya daha büyük olmalıdır")
    @Max(value = 9999, message = "Display order 9999'dan küçük olmalıdır")
    private Integer displayOrder;

    /**
     * Parent kategori ID'si (NULL ise ana kategori oluşturulur)
     */
    private Long parentId;

    // ============================================================
    // VALIDATION MESSAGELAR
    // ============================================================
    /*
    @NotBlank - Null veya boş string olamaz
    @Size - Min/Max karakter sayısı
    @Pattern - Regex pattern kontrolü
    @URL - Geçerli URL formatı
    @Min/@Max - Sayısal aralık
    */
}