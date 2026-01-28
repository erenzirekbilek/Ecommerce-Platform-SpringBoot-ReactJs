package com.v1.backend.dto.brand;

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
public class BrandCreateRequest {

    @NotBlank(message = "Marka adı zorunludur")
    @Size(min = 2, max = 100, message = "Marka adı 2-100 karakter olmalıdır")
    private String name;

    @Size(max = 500, message = "Logo URL 500 karakteri aşamaz")
    @URL(message = "Geçerli bir URL giriniz", regexp = "^(https?://.+)?$")
    private String logoUrl; // opsiyonel: uploads/brands/altındaki dosya yolu
}
