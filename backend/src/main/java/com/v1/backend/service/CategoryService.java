package com.v1.backend.service;

import com.v1.backend.dto.category.CategoryCreateRequest;
import com.v1.backend.dto.category.CategoryDTO;
import com.v1.backend.dto.category.CategoryUpdateRequest;
import com.v1.backend.exception.CategoryException;
import com.v1.backend.model.Category;
import com.v1.backend.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private static final int MAX_DEPTH = 3;

    // GET OPERATIONS
    public List<CategoryDTO> getAllMainCategories() {
        return categoryRepository.findByParentIsNull().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<CategoryDTO> getAllActiveCategories() {
        return categoryRepository.findByStatusTrue().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public CategoryDTO getCategoryById(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new CategoryException("Kategori bulunamadı: ID = " + id));
        return mapToDTO(category);
    }

    public CategoryDTO getCategoryBySlug(String slug) {
        Category category = categoryRepository.findBySlug(slug)
                .orElseThrow(() -> new CategoryException("Kategori bulunamadı: slug = " + slug));
        return mapToDTO(category);
    }

    public List<CategoryDTO> getDirectSubcategories(Long parentId) {
        Category parent = categoryRepository.findById(parentId)
                .orElseThrow(() -> new CategoryException("Parent kategori bulunamadı"));

        return parent.getChildren().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<CategoryDTO> getSubCategories(Long parentId) {
        return categoryRepository.findByParentId(parentId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<CategoryDTO> searchCategories(String searchTerm) {
        return categoryRepository.findByNameContainingIgnoreCase(searchTerm).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    // CREATE OPERATIONS
    public CategoryDTO createMainCategory(CategoryCreateRequest request) {
        validateCategoryUniqueness(request.getName(), request.getSlug());

        Category category = Category.builder()
                .name(request.getName())
                .slug(request.getSlug())
                .description(request.getDescription())
                .imageUrl(request.getImageUrl())
                .status(true)
                .displayOrder(request.getDisplayOrder() != null ? request.getDisplayOrder() : 0)
                .parent(null)
                .build();

        Category saved = categoryRepository.save(category);
        return mapToDTO(saved);
    }

    public CategoryDTO createSubCategory(Long parentId, CategoryCreateRequest request) {
        validateCategoryUniqueness(request.getName(), request.getSlug());

        Category parent = categoryRepository.findById(parentId)
                .orElseThrow(() -> new CategoryException("Parent kategori bulunamadı"));

        // Maksimum derinlik kontrolü
        if (parent.getDepthLevel() >= MAX_DEPTH - 1) {
            throw new CategoryException("Maksimum 3 seviye derinliğe ulaşıldı");
        }

        Category category = Category.builder()
                .name(request.getName())
                .slug(request.getSlug())
                .description(request.getDescription())
                .imageUrl(request.getImageUrl())
                .status(true)
                .displayOrder(request.getDisplayOrder() != null ? request.getDisplayOrder() : 0)
                .parent(parent)
                .build();

        Category saved = categoryRepository.save(category);
        return mapToDTO(saved);
    }

    // UPDATE OPERATIONS
    public CategoryDTO updateCategory(Long id, CategoryUpdateRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new CategoryException("Kategori bulunamadı"));

        category.setName(request.getName());
        category.setSlug(request.getSlug());
        category.setDescription(request.getDescription());
        category.setImageUrl(request.getImageUrl());
        category.setDisplayOrder(request.getDisplayOrder());
        category.setStatus(request.getStatus());

        Category updated = categoryRepository.save(category);
        return mapToDTO(updated);
    }

    public void deactivateCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new CategoryException("Kategori bulunamadı"));
        category.setStatus(false);
        categoryRepository.save(category);
    }

    public void activateCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new CategoryException("Kategori bulunamadı"));
        category.setStatus(true);
        categoryRepository.save(category);
    }

    // DELETE OPERATIONS
    public void deleteCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new CategoryException("Kategori bulunamadı"));
        categoryRepository.delete(category);
    }

    // UTILITY METHODS
    private void validateCategoryUniqueness(String name, String slug) {
        if (categoryRepository.findByName(name).isPresent()) {
            throw new CategoryException("Bu kategori adı zaten mevcut");
        }
        if (categoryRepository.findBySlug(slug).isPresent()) {
            throw new CategoryException("Bu slug zaten mevcut");
        }
    }

    private CategoryDTO mapToDTO(Category category) {
        Set<CategoryDTO> childrenDTOs = new HashSet<>();
        try {
            if (category.getChildren() != null) {
                for (Category child : category.getChildren()) {
                    childrenDTOs.add(mapToDTO(child));
                }
            }
        } catch (Exception e) {
            // Lazy loading hatası durumunda boş set döndür
            childrenDTOs = new HashSet<>();
        }

        return CategoryDTO.builder()
                .id(category.getId())
                .name(category.getName())
                .slug(category.getSlug())
                .description(category.getDescription())
                .imageUrl(category.getImageUrl())
                .parentId(category.getParent() != null ? category.getParent().getId() : null)
                .parentName(category.getParent() != null ? category.getParent().getName() : null)
                .children(childrenDTOs)
                .status(category.getStatus())
                .displayOrder(category.getDisplayOrder())
                .depthLevel(category.getDepthLevel())
                .createdAt(category.getCreatedAt())
                .updatedAt(category.getUpdatedAt())
                .build();
    }
}