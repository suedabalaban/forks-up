package com.example.forksup.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.hateoas.PagedModel;
import org.springframework.data.web.PagedResourcesAssembler;
import org.springframework.hateoas.EntityModel;
import org.springframework.stereotype.Service;

import com.example.forksup.model.Recipe;
import com.example.forksup.repository.RecipeRepository;

@Service
public class RecipeService {

    private final RecipeRepository recipeRepository;
    private final PagedResourcesAssembler<Recipe> pagedResourcesAssembler;

    @Autowired
    public RecipeService(RecipeRepository recipeRepository, PagedResourcesAssembler<Recipe> pagedResourcesAssembler) {
        this.recipeRepository = recipeRepository;
        this.pagedResourcesAssembler = pagedResourcesAssembler;
    }

    public PagedModel<EntityModel<Recipe>> searchRecipesByNameRegex(String keyword, int page, int size) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<Recipe> recipesPage = recipeRepository.findByNameRegex(keyword, pageable);

            // PagedModel olarak sonuçları dön
            return pagedResourcesAssembler.toModel(recipesPage);
        } catch (Exception e) {
            throw new RuntimeException("Tarif araması sırasında bir hata oluştu", e);
        }
    }
}
 