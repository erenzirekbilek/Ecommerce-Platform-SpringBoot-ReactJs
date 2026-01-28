package com.v1.backend.dto.category;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class CategoryDTO {

    private Long id;
    private String name;
    private String slug;
    private String description;
    private String imageUrl;

    // Hiyerarşi
    private Long parentId;
    private String parentName;
    private Set<CategoryDTO> children;

    // Durum
    private Boolean status;
    private Integer displayOrder;
    private Integer depthLevel;

    // Audit
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}