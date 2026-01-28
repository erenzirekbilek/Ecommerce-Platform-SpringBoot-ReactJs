package com.v1.backend.controller;

import com.v1.backend.dto.brand.BrandCreateRequest;
import com.v1.backend.model.Brand;
import com.v1.backend.repository.BrandRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/brands")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class BrandController {

    private final BrandRepository brandRepository;

    // ============================================================
    // Brand oluştur
    // ============================================================
    @PostMapping
    public ResponseEntity<Brand> createBrand(
            @Valid @RequestBody BrandCreateRequest request
    ) {
        Brand brand = Brand.builder()
                .name(request.getName())
                .logoUrl(request.getLogoUrl())
                .build();

        Brand saved = brandRepository.save(brand);
        return ResponseEntity.ok(saved);
    }

    // ============================================================
    // Tüm brandleri listele
    // ============================================================
    @GetMapping
    public ResponseEntity<List<Brand>> getAllBrands() {
        return ResponseEntity.ok(brandRepository.findAll());
    }

    // ============================================================
    // ID ile brand getir
    // ============================================================
    @GetMapping("/{id}")
    public ResponseEntity<Brand> getBrandById(@PathVariable Long id) {
        return brandRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}